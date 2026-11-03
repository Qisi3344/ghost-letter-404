import assert from 'node:assert/strict';
import {rings,poses,world,ringAssembly} from '../public/p0/rings.mjs';
// Exact spherical bounds enclose each tilted ring for every rotation.
const bounds=rings.map(r=>({name:r.name,min:r.r-r.w/2,max:Math.hypot(r.r+r.w/2,r.h/2)}));
assert(bounds[2].min>64);
for(let i=1;i<3;i++)assert(bounds[i-1].min>bounds[i].max);
for(const [pose,a] of poses.entries()){
 for(const [i,r] of rings.entries())for(let j=0;j<360;j++){
 const t=j*Math.PI/180,p=world([r.r*Math.cos(t),r.r*Math.sin(t),0],a,i);
 assert(Math.abs(Math.hypot(p[0],p[1],p[2]-220)-r.r)<1e-8);
 assert(p[2]-r.w/2-r.h/2>59,'ring must clear deck');
 }
 const svg=ringAssembly(pose);assert(!svg.some(p=>p.svg.includes("Pivot")),"support geometry must remain absent");assert(svg.length>6000);assert(svg.every(p=>Number.isFinite(p.depth)&&!p.svg.includes('NaN')));
 console.log(`pose ${pose}: rigid transforms, ring-ring/core radial clearance and deck clearance passed`);
}
console.log(JSON.stringify(bounds));
console.log('Not a complete collision audit: projected face ordering requires separate verification.');
