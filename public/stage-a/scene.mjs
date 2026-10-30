import { geometry, materials, poses, center, ringSpecs } from "./model.mjs";
import { fitProjection, cameraOf, iso } from "../p0/vendor/iso-kit.mjs";
export const camera = fitProjection(
  [
    [-220, -220, 0],
    [220, 220, 0],
    [-220, 220, 0],
    [220, -220, 0],
    [0, 0, 400],
  ],
  1200,
  900,
  { pad: 55, azimuth: 45, elevation: 30 },
);
export const project = (p) => iso(p, camera);
export function rotation(angles, index) {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ].flatMap((p) => {
    let [x, y, z] = p;
    for (let j = index; j >= 0; j--) {
      const a = (angles[j] * Math.PI) / 180,
        c = Math.cos(a),
        s = Math.sin(a);
      if (j % 2) [x, z] = [x * c + z * s, -x * s + z * c];
      else [y, z] = [y * c - z * s, y * s + z * c];
    }
    return [x, y, z];
  });
}
const unit = (a) => {
  const l = Math.hypot(...a);
  return a.map((x) => x / l);
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export function start(
  canvas,
  { pixelRatio = Math.min(devicePixelRatio, 2) } = {},
) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw Error("此场景需要支持 WebGL 2 的浏览器。");
  const objects = geometry(),
    buffers = [];
  const C = cameraOf(camera),
    eye = [C.cosA * C.cosE, C.sinA * C.cosE, C.sinE],
    light = unit([-0.5, 0.3, 0.82]),
    lu = unit(cross([0, 0, 1], light)),
    lv = cross(light, lu);
  const shared = `
 precision highp float;
 uniform mat3 turns[3];uniform vec3 center;
 in vec3 position;in vec3 normal;in float joint;
 vec3 worldPoint(){if(joint<.5)return position;return turns[int(joint)-1]*position+center;}
 vec3 worldNormal(){if(joint<.5)return normal;return turns[int(joint)-1]*normal;}
 uniform vec3 lightU,lightV,lightDir;
 vec4 shadowPosition(vec3 p){p-=vec3(0.,0.,130.);return vec4(dot(p,lightU)/420.,dot(p,lightV)/420.,-dot(p,lightDir)/600.,1.);}
 `;
  const compile = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = (vs, fs) => {
    const p = gl.createProgram(),
      v = compile(gl.VERTEX_SHADER, vs),
      f = compile(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(p));
    gl.deleteShader(v);
    gl.deleteShader(f);
    return p;
  };
  const depthProgram = program(
    "#version 300 es\n" +
      shared +
      "void main(){gl_Position=shadowPosition(worldPoint());}",
    "#version 300 es\nprecision highp float;void main(){}",
  );
  const beautyProgram = program(
    "#version 300 es\n" +
      shared +
      `
 uniform vec4 cam;uniform vec2 origin,frameSize;uniform float scale;
 out vec3 p,n,tangent;out vec4 shadow;out vec3 local;
 void main(){p=worldPoint();n=worldNormal();local=position;vec3 T=normalize(vec3(-position.y,position.x,.0001));tangent=joint>.5?turns[int(joint)-1]*T:T;shadow=shadowPosition(p);
 vec2 xy=origin+scale*vec2(p.x*cam.x-p.y*cam.y,(p.x*cam.y+p.y*cam.x)*cam.z-p.z*cam.w);
 float depth=(p.x*cam.y+p.y*cam.x)*cam.w+p.z*cam.z;
 gl_Position=vec4(xy.x/(frameSize.x*.5)-1.,1.-xy.y/(frameSize.y*.5),-depth/800.,1.);}`,
    `#version 300 es
 precision highp float;
 in vec3 p,n,tangent,local;in vec4 shadow;uniform sampler2D shadowMap;
 uniform vec3 eye,color,lightDir;uniform float metal,rough,emission,kind,debug;
 out vec4 frag;
 float nebula(vec3 q){
 float r=length(q.xy),a=atan(q.y,q.x);
 float band=exp(-abs(q.z+.16*sin(a*2.+r*5.))*18.);
 float filaments=pow(.5+.5*sin(a*3.-r*19.+q.z*7.),3.);
 return band*filaments*smoothstep(.12,.4,r)*(1.-smoothstep(.62,.94,length(q)));
 }
 float visibility(vec3 N){vec3 q=shadow.xyz*.5+.5;float bias=max(.0006,.0018*(1.-dot(N,lightDir))),sum=0.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float d=texture(shadowMap,q.xy+vec2(float(x),float(y))/2048.).r;sum+=q.z-bias>d?.25:1.;}return sum/9.;}
 void main(){vec3 N=normalize(n);if(!gl_FrontFacing)N=-N;float facing=max(dot(N,eye),0.),key=max(dot(N,lightDir),0.),shade=visibility(N);
 vec3 H=normalize(lightDir+eye);float spec=pow(max(dot(N,H),0.),mix(180.,12.,rough));
 vec3 R=reflect(-eye,N);float softbox=pow(max(dot(R,normalize(vec3(-.6,-.2,1.))),0.),20.)+pow(max(dot(R,normalize(vec3(.8,.1,.7))),0.),55.)*.6;
 float rim=pow(1.-facing,4.);
 vec3 T=normalize(tangent),B=normalize(cross(N,T));
 float brushed=exp(-pow(dot(H,T)/.2,2.)-pow(dot(H,B)/.55,2.))*key;
 softbox+=brushed*.75;
 vec3 rgb=color*(.09+key*shade*.85)*(1.-metal*.64)+mix(vec3(.04),color,metal)*(spec*shade*3.8+softbox*1.8)*(.4+metal)+vec3(.018,.009,.035)*rim;
 // A restrained cool fill preserves the unlit thickness faces.
 rgb+=color*max(dot(N,normalize(vec3(.7,.5,.3))),0.)*.11;
 float grain=sin(local.z*28.+length(local.xy)*17.)*.012;
 rgb*=1.+metal*grain;
 vec3 toCore=vec3(0.,0.,236.)-p;float distance2=dot(toCore,toCore);rgb+=vec3(.12,.055,.25)*max(dot(N,normalize(toCore)),0.)*1200./(distance2+1200.);
 rgb+=color*emission;
 float alpha=1.;
 if(kind==1.){
 float fresnel=.025+.55*pow(1.-abs(dot(N,eye)),4.);
 rgb=vec3(.055,.025,.11)+softbox*1.6+rim*vec3(.35,.23,.65);
 alpha=clamp(fresnel+softbox*.22,.025,.85);
 if(gl_FrontFacing){float density=0.;vec3 q=(p-vec3(0.,0.,236.))/61.;float span=max(dot(q,eye),0.)*2.;
 for(int i=0;i<20;i++){vec3 samplePoint=q-eye*span*(float(i)+.5)/20.;density+=nebula(samplePoint)*span/20.;}
 rgb+=vec3(.3,.09,.8)*density*20.;alpha=clamp(alpha+density*3.,.025,.9);}
 }
 if(kind==2.){float radius=length(p.xy);rgb=vec3(.009,.006,.016)*(.45+.55*shade);rgb*=1.-smoothstep(220.,360.,radius);}
 if(debug>.5){float d=dot(p-vec3(0.,0.,200.),eye);rgb=d>70.?vec3(.9,.55,.18):d< -20.?vec3(.2,.4,.8):vec3(.5,.2,.7);alpha=kind==1.?.2:1.;}
 rgb=pow(rgb/(rgb+vec3(.8)),vec3(1./2.2));
 if(kind==2.&&debug<.5){float fade=1.-smoothstep(205.,350.,length(p.xy));rgb=mix(vec3(.024,.017,.039),vec3(.065,.045,.09)*(.4+.6*shade),fade);}
 frag=vec4(rgb,alpha);
 }`,
  );
  const upload = ([name, data]) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    buffers.push(buffer);
    return { name, buffer, count: data.length / 7 };
  };
  const meshes = [...objects.groups].map(upload),
    opaque = meshes.filter((m) => m.name !== "glass"),
    glass = meshes.find((m) => m.name === "glass");
  const shadowTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    2048,
    2048,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    shadowTexture,
    0,
  );
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    throw Error("Shadow framebuffer incomplete");
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const locations = new Map();
  function loc(p, name) {
    const key = (p === beautyProgram ? "b" : "d") + name;
    if (!locations.has(key)) locations.set(key, gl.getUniformLocation(p, name));
    return locations.get(key);
  }
  function uniforms(p, angles) {
    gl.useProgram(p);
    gl.uniform3fv(loc(p, "center"), center);
    gl.uniform3fv(loc(p, "lightDir"), light);
    gl.uniform3fv(loc(p, "lightU"), lu);
    gl.uniform3fv(loc(p, "lightV"), lv);
    for (let i = 0; i < 3; i++)
      gl.uniformMatrix3fv(loc(p, `turns[${i}]`), false, rotation(angles, i));
  }
  function draw(p, m) {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buffer);
    for (const [name, size, offset] of [
      ["position", 3, 0],
      ["normal", 3, 12],
      ["joint", 1, 24],
    ]) {
      const a = gl.getAttribLocation(p, name);
      if (a >= 0) {
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, size, gl.FLOAT, false, 28, offset);
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  }
  const stats = {
    frames: 0,
    parts: objects.parts.length,
    triangles: meshes.reduce((s, m) => s + m.count / 3, 0),
    submitMs: 0,
  };
  canvas.stats = stats;
  function render(angles = poses[0], debug = false) {
    const start = performance.now(),
      dpr = Math.min(4, Math.max(1, pixelRatio)),
      width = Math.round(canvas.clientWidth * dpr),
      height = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    // The Anatomy screen projection reverses winding; outward surfaces are clockwise.
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, 2048, 2048);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    uniforms(depthProgram, angles);
    for (const m of opaque) if (m.name !== "floor") draw(depthProgram, m);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.024, 0.017, 0.039, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    uniforms(beautyProgram, angles);
    gl.uniform4f(loc(beautyProgram, "cam"), C.sinA, C.cosA, C.sinE, C.cosE);
    const viewWidth = canvas.clientWidth < 600 ? 720 : 1200;
    gl.uniform2f(loc(beautyProgram, "frameSize"), viewWidth, 900);
    gl.uniform2f(
      loc(beautyProgram, "origin"),
      camera.origin[0] - (1200 - viewWidth) / 2,
      camera.origin[1],
    );
    gl.uniform1f(loc(beautyProgram, "scale"), C.k);
    gl.uniform3fv(loc(beautyProgram, "eye"), eye);
    gl.uniform1f(loc(beautyProgram, "debug"), debug ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(loc(beautyProgram, "shadowMap"), 0);
    const material = (m) => {
      const a = materials[m.name];
      gl.uniform3fv(loc(beautyProgram, "color"), a.color);
      gl.uniform1f(loc(beautyProgram, "metal"), a.metal);
      gl.uniform1f(loc(beautyProgram, "rough"), a.rough);
      gl.uniform1f(loc(beautyProgram, "emission"), a.emission || 0);
      gl.uniform1f(
        loc(beautyProgram, "kind"),
        m.name === "glass" ? 1 : m.name === "floor" ? 2 : 0,
      );
    };
    for (const m of opaque) {
      material(m);
      draw(beautyProgram, m);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.enable(gl.CULL_FACE);
    material(glass);
    gl.cullFace(gl.FRONT);
    draw(beautyProgram, glass);
    gl.cullFace(gl.BACK);
    draw(beautyProgram, glass);
    gl.depthMask(true);
    stats.frames++;
    stats.submitMs = performance.now() - start;
  }
  return {
    render,
    stats,
    parts: objects.parts,
    dispose() {
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteTexture(shadowTexture);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteProgram(beautyProgram);
      gl.deleteProgram(depthProgram);
    },
  };
}
