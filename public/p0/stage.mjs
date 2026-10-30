import { ringAssembly } from './rings.mjs';
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
export function render(angles){
 parts.length=0; layer=0;
 for(const x of [-104,104])for(const y of [-104,104]){cylinder(x,y,16,0,6,iron);cylinder(x,y,10,6,16);cylinder(x,y,15,22,4);}
 layer=1; cylinder(0,0,205,26,7); layer=2; cylinder(0,0,201,33,18,iron); layer=3; cylinder(0,0,207,51,5); layer=4; cylinder(0,0,195,56,3,iron); layer=5;
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const p=[200*Math.cos(a),200*Math.sin(a),56.1];put(p,line(p,[(i%4===0?193:197)*Math.cos(a),(i%4===0?193:197)*Math.sin(a),56.1], '#d9b97d',i%4===0?1.3:.7));}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;screw(185*Math.cos(a),185*Math.sin(a),59);}
 // Flush access covers, each fastened through its four corners.
 for(const y of [-98,98]){
 const plan={x:-30,y:y-18,w:60,d:36,r:4};
 put([0,y,59.5],solid(k.slabOf(plan,59,1,P,6,.5),iron));
 for(const x of [-24,24])for(const dy of [-12,12])screw(x,y+dy,60);
 for(let j=-3;j<=3;j++)put([j*5,y,60.2],line([j*5,y-9,60.2],[j*5,y+9,60.2],'#15131e',2));
 }
 layer=6;
 parts.push(...ringAssembly(Number(globalThis.location?.search.match(/pose=(\d)/)?.[1]||0),angles).map(p=>({...p,layer:6})));
 const [cx,cy]=project([0,0,220]),radius=64*k.cameraOf(P).k;
 put([0,0,220],`<g><circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#glass)" stroke="#bba5cb" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${radius-5}" fill="none" stroke="#847497" stroke-width="1.5"/><circle cx="${cx-12}" cy="${cy+8}" r="${radius*.37}" fill="url(#planet)"/><path d="M${cx-radius*.65},${cy-radius*.45} Q${cx-radius*.35},${cy-radius*.9} ${cx+radius*.15},${cy-radius*.87}" fill="none" stroke="#e5dced" stroke-width="4" opacity=".65"/></g>`);
 return parts.sort((a,b)=>a.layer-b.layer||a.depth-b.depth).map(p=>p.svg).join('');
}
if(typeof document!=='undefined'){
 const target=document.querySelector('#parts');
 const params=new URLSearchParams(location.search);
 const calm=matchMedia('(prefers-reduced-motion: reduce)');
 const still=params.has('pose')||params.has('audit')||params.has('still');
 target.innerHTML=render();
 let last=0,time=0;
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});
 let visible=true; observer.observe(target);
 function frame(now){
 if(!still&&!calm.matches&&visible&&!document.hidden&&now-last>80){
 time+=Math.min(now-last,100)/1000;
 target.innerHTML=render([18+12*Math.sin(time*.11),58+time*3,65+time*5]);
 last=now;
 }else if(!visible||document.hidden||calm.matches)last=now;
 requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
