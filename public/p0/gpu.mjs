import {camera} from './camera.mjs';
import {cameraOf} from './vendor/iso-kit.mjs';
import {ringAssembly,rings,world,poses} from './rings.mjs';

// Static meshes; the GPU transforms them and resolves per-pixel occlusion.
export function startGPU(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
 if(!gl)return null;
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,`
 attribute vec3 position,normal; uniform mat3 rotation; uniform vec4 cam;
 uniform vec2 origin; uniform float scale; varying vec3 n,p,local;
 void main(){local=position;p=rotation*position+vec3(0.,0.,220.);n=rotation*normal;
 vec2 xy=origin+scale*vec2(p.x*cam.x-p.y*cam.y,(p.x*cam.y+p.y*cam.x)*cam.z-p.z*cam.w);
 float depth=(p.x*cam.y+p.y*cam.x)*cam.w+p.z*cam.z;
 gl_Position=vec4(xy.x/500.-1.,1.-xy.y/365.,-depth/700.,1.);}`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
 precision highp float; varying vec3 n,p,local; uniform vec3 eye; uniform float material,audit;
 void main(){vec3 N=normalize(n),L=normalize(vec3(-.3,-.5,.81));float d=max(dot(N,L),0.);
 float spec=pow(max(dot(reflect(-L,N),eye),0.),48.);
 vec3 color=mix(vec3(.13,.08,.045),vec3(.85,.63,.31),.28+.72*d)+spec*vec3(.9,.83,.63);
 if(material<.5&&local.z>3.){float a=atan(local.y,local.x);float tick=abs(fract(a/6.2831853*72.+.5)-.5);float r=length(local.xy);float radius=r>140.?155.:r>110.?126.:98.;float width=r>140.?10.:r>110.?9.:7.;if(tick<.045&&r>radius+width*.5-4.)color*=.44;}
 float alpha=1.;
 if(material>0.5&&material<1.5){float f=pow(1.-abs(dot(N,eye)),3.);color=vec3(.28,.24,.5)+vec3(.5,.56,.7)*f+spec;alpha=.14+.68*f+spec*.35;}
 if(material>1.5){color=mix(vec3(.28,.10,.53),vec3(.82,.65,1.),.25+.75*d)+vec3(.7,.55,.9)*spec;}
 if(audit>.5){float z=dot(p-vec3(0.,0.,220.),eye);color=z>30.?vec3(.89,.67,.39):z< -30.?vec3(.39,.48,.71):vec3(.64,.5,.74);}
 gl_FragColor=vec4(color,alpha);}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const uniform=name=>gl.getUniformLocation(program,name);
 const C=cameraOf(camera),eye=[C.cosA*C.cosE,C.sinA*C.cosE,C.sinE];
 gl.uniform4f(uniform('cam'),C.sinA,C.cosA,C.sinE,C.cosE);gl.uniform2fv(uniform('origin'),camera.origin);gl.uniform1f(uniform('scale'),C.k);gl.uniform3fv(uniform('eye'),eye);
 const params=new URLSearchParams(location.search);gl.uniform1f(uniform('audit'),params.has('audit')?1:0);
 const mesh=vertices=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);return {buffer,count:vertices.length/6};};
 const geometry=ringAssembly(0,[0,0,0]);
 const ringMeshes=rings.map(r=>{
 const data=[];for(const f of geometry.filter(f=>f.name===r.name)){
 const a=f.points[0],b=f.points[1],c=f.points[2],u=b.map((v,i)=>v-a[i]),v=c.map((w,i)=>w-a[i]);
 const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);
 for(const j of [0,1,2,0,2,3])data.push(f.points[j][0],f.points[j][1],f.points[j][2]-220,...n.map(x=>x/len));
 }return mesh(data);});
 const sphere=radius=>{const data=[],point=(i,j)=>{const t=i*Math.PI/48,a=j*Math.PI/48;return [Math.sin(t)*Math.cos(a),Math.sin(t)*Math.sin(a),Math.cos(t)];};
 for(let i=0;i<48;i++)for(let j=0;j<96;j++)for(const [x,y]of [[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]]){const n=point(x,y);data.push(...n.map(v=>v*radius),...n);}return mesh(data);};
 const crystal=[];
 const vertices=[[0,0,37],[0,0,-37],[25,0,0],[0,25,0],[-25,0,0],[0,-25,0]];
 for(let j=0;j<4;j++)for(const tip of [0,1]){const a=vertices[tip],b=vertices[2+j],c=vertices[2+(j+1)%4],u=b.map((v,i)=>v-a[i]),v=c.map((w,i)=>w-a[i]);const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);for(const p of [a,b,c])crystal.push(...p,...n.map(x=>x/l));}
 const glass=sphere(64),core=mesh(crystal),identity=[1,0,0,0,1,0,0,0,1];
 const draw=(m,matrix,material)=>{gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);for(const [name,offset]of [['position',0],['normal',12]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,offset);}gl.uniformMatrix3fv(uniform('rotation'),false,matrix);gl.uniform1f(uniform('material'),material);gl.drawArrays(gl.TRIANGLES,0,m.count);};
 const stats={frames:0,drawMs:0};canvas.stats=stats;
 const render=angles=>{
 const start=performance.now(),width=Math.round(canvas.clientWidth*Math.min(devicePixelRatio,1.5)),height=Math.round(width*730/1000);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
 ringMeshes.forEach((m,i)=>{const matrix=[[1,0,0],[0,1,0],[0,0,1]].flatMap(p=>{const q=world(p,angles,i);return [q[0],q[1],q[2]-220];});draw(m,matrix,0);});
 draw(core,identity,2);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.CULL_FACE);
 gl.cullFace(gl.FRONT);draw(glass,identity,1);gl.cullFace(gl.BACK);draw(glass,identity,1);gl.depthMask(true);
 stats.frames++;stats.drawMs=performance.now()-start;
 };
 return {render,poses};
}
