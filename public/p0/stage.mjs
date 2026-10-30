import * as k from './vendor/iso-kit.mjs';
import {camera as P,project,depth} from './camera.mjs';
const parts=[];
let layer=0;
const brass=['#bd935a','#ebcc8e','#98703f','#614528','#382c26'];
const iron=['#35323f','#383541','#494454','#292633','#1c1b25'];
function solid(paths,metal=brass){return `<g><path d="${paths.fill}" fill="${metal[0]}"/>${paths.shades.map((d,i)=>`<path d="${d}" fill="${metal[i+1]}"/>`).join('')}<path d="${paths.top}" fill="${metal[1]}"/><path d="${paths.crease}" fill="none" stroke="${metal[2]}" stroke-width=".65"/><path d="${paths.bevel||''}" fill="none" stroke="#f2dca6" stroke-width=".7"/><path d="${paths.outline}" fill="none" stroke="#241f28" stroke-width=".8"/></g>`;}
function put(p,svg){parts.push({layer,depth:depth(p),svg});}
function cylinder(x,y,r,z,h,m=brass){put([x,y,z+h/2],solid(k.cylinder(x,y,r,z,h,P,80,0.8),m));}
function screw(x,y,z){const path=k.segment([x-1.5,y,z+1.3],[x+1.5,y,z+1.3],P);put([x,y,z+1],solid(k.cylinder(x,y,2.5,z,1.3,P,16),iron)+`<path d="${path}" stroke="#c8bca4" stroke-width=".7"/>`);}
const line=(a,b,c='#8c704d',w=1)=>`<path d="${k.segment(a,b,P)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
// A closed annulus, extruded in world z; short sectors permit core occlusion.
export function sector(a,b,r=127,width=10,z=172,h=9){
 const points=[];
 for(let j=0;j<=4;j++){const t=a+(b-a)*j/4;points.push([r*Math.cos(t),r*Math.sin(t)]);}
 for(let j=4;j>=0;j--){const t=a+(b-a)*j/4;points.push([(r-width)*Math.cos(t),(r-width)*Math.sin(t)]);}
 return {points,z,h,center:[(r-width/2)*Math.cos((a+b)/2),(r-width/2)*Math.sin((a+b)/2),z+h/2]};
}
export function render(){
 parts.length=0; layer=0;
 for(const x of [-104,104])for(const y of [-104,104]){cylinder(x,y,16,0,6,iron);cylinder(x,y,10,6,16);cylinder(x,y,15,22,4);}
 layer=1; cylinder(0,0,175,26,7); layer=2; cylinder(0,0,171,33,18,iron); layer=3; cylinder(0,0,177,51,5); layer=4; cylinder(0,0,165,56,3,iron); layer=5;
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const p=[170*Math.cos(a),170*Math.sin(a),56.1];put(p,line(p,[(i%4===0?163:167)*Math.cos(a),(i%4===0?163:167)*Math.sin(a),56.1], '#d9b97d',i%4===0?1.3:.7));}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;screw(155*Math.cos(a),155*Math.sin(a),59);}
 // Flush access covers, each fastened through its four corners.
 for(const y of [-98,98]){
 const plan={x:-30,y:y-18,w:60,d:36,r:4};
 put([0,y,59.5],solid(k.slabOf(plan,59,1,P,6,.5),iron));
 for(const x of [-24,24])for(const dy of [-12,12])screw(x,y+dy,60);
 for(let j=-3;j<=3;j++)put([j*5,y,60.2],line([j*5,y-9,60.2],[j*5,y+9,60.2],'#15131e',2));
 }
 layer=6;
 cylinder(0,0,42,59,7);cylinder(0,0,30,66,24,iron);cylinder(0,0,34,90,5);cylinder(0,0,18,95,15);
 for(const x of [-139,139]){
 cylinder(x,0,23,59,6);cylinder(x,0,17,65,5,iron);cylinder(x,0,10,70,95);cylinder(x,0,17,165,7,iron);cylinder(x,0,21,172,9);cylinder(x,0,14,181,4);
 for(const dx of [-14,14])for(const dy of [-10,10])screw(x+dx,dy,65);
 put([x,0,120],`<path d="${k.knurl(x,0,10,72,163,16,P)}" stroke="#674b32" fill="none" stroke-width=".8"/>`);
 // Bearing bridge is flush with the ring's outside edge at x=127.
 const plan={x:x<0?-139:125,y:-7,w:14,d:14,r:2};put([x<0?-132:132,0,176],solid(k.slabOf(plan,172,9,P,4,.6)));
 screw(x,0,185);
 }
 for(let i=0;i<96;i++){
 const a=i*Math.PI/48,b=(i+1)*Math.PI/48,s=sector(a,b);
 const shape=k.extrude(s.points,s.z,s.h,P,{convex:false});
 shape.outline=""; shape.crease="";
 let art=solid(shape);
 const t=(a+b)/2;art+=line([127*Math.cos(t),127*Math.sin(t),181.1],[(i%8===0?119:123)*Math.cos(t),(i%8===0?119:123)*Math.sin(t),181.1],'#f3d598',i%8===0?1.1:.55);
 put(s.center,art);
 }
 const [cx,cy]=project([0,0,176]),radius=66*k.cameraOf(P).k;
 put([0,0,176],`<g><circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#glass)" stroke="#bba5cb" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${radius-5}" fill="none" stroke="#847497" stroke-width="1.5"/><circle cx="${cx-12}" cy="${cy+8}" r="${radius*.37}" fill="url(#planet)"/><path d="M${cx-radius*.65},${cy-radius*.45} Q${cx-radius*.35},${cy-radius*.9} ${cx+radius*.15},${cy-radius*.87}" fill="none" stroke="#e5dced" stroke-width="4" opacity=".65"/></g>`);
 return parts.sort((a,b)=>a.layer-b.layer||a.depth-b.depth).map(p=>p.svg).join('');
}
if(typeof document!=='undefined')document.querySelector('#parts').innerHTML=render();
