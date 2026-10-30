import {project,depth} from './camera.mjs';
export const poses=[[18,58,65],[-15,48,35],[35,70,85]];
export const rings=[{name:'RingOuter',r:155,w:10,h:8},{name:'RingMiddle',r:126,w:9,h:8},{name:'RingInner',r:98,w:7,h:7}];
const rad=a=>a*Math.PI/180;
export function world(p,angles,index){
 let [x,y,z]=p;
 for(let j=index;j>=0;j--){const c=Math.cos(rad(angles[j])),s=Math.sin(rad(angles[j]));if(j%2)[x,z]=[x*c+z*s,-x*s+z*c];else [y,z]=[y*c-z*s,y*s+z*c];}
 return [x,y,z+220];
}
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function ringAssembly(pose=0,override){
 const out=[],angles=override||poses[pose]||poses[0];
 function face(points,name){
 const n=cross(sub(points[1],points[0]),sub(points[2],points[0])),l=Math.hypot(...n);
 const light=.38+.62*Math.max(0,(n[0]*-.3+n[1]*-.5+n[2]*.81)/l);
 let color=`rgb(${Math.round(78+158*light)},${Math.round(53+148*light)},${Math.round(30+112*light)})`;
 if(globalThis.location?.search.includes("audit=1")) color=depth(points[0])<depth([0,0,220])-30?"#647bb5":depth(points[0])>depth([0,0,220])+30?"#e4ad64":"#a281bc";
 const d=points.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join('')+'Z';
 const center=points[0].map((_,j)=>points.reduce((s,p)=>s+p[j],0)/points.length);
 out.push({name,points,depth:depth(center),svg:`<path data-part="${name}" d="${d}" fill="${color}" stroke="${color}" stroke-width=".35"/>`});
 }
 rings.forEach((r,index)=>{
 // Eight-sided cross-section provides real bevels, not painted highlight stripes.
 const q=[[r.r-r.w/2+1,-r.h/2],[r.r+r.w/2-1,-r.h/2],[r.r+r.w/2,-r.h/2+1],[r.r+r.w/2,r.h/2-1],[r.r+r.w/2-1,r.h/2],[r.r-r.w/2+1,r.h/2],[r.r-r.w/2,r.h/2-1],[r.r-r.w/2,-r.h/2+1]];
 const point=(a,j)=>world([q[j][0]*Math.cos(a),q[j][0]*Math.sin(a),q[j][1]],angles,index);
 for(let i=0;i<256;i++)for(let j=0;j<8;j++){const a=i*Math.PI/128,b=(i+1)*Math.PI/128;face([point(a,j),point(b,j),point(b,(j+1)%8),point(a,(j+1)%8)],r.name);}
 for(let i=0;i<72;i++){
 const a=i*Math.PI/36, r0=r.r+r.w/2-1.5,r1=r0-(i%6===0?r.w-3:2);
 const p=world([r0*Math.cos(a),r0*Math.sin(a),r.h/2+.03],angles,index),q=world([r1*Math.cos(a),r1*Math.sin(a),r.h/2+.03],angles,index);
 out.push({depth:depth(p),svg:`<path d="M${project(p).join(',')}L${project(q).join(',')}" stroke="#483724" stroke-width=".7"/>`});
 }
 });
 // Logical joint axes remain X/Y/X in world(); support geometry is intentionally absent.
 return out;
}
