export const rad = (n:number)=>n*Math.PI/180;
export const polar = (r:number,a:number, squash=1):[number,number]=>[r*Math.cos(rad(a)),r*Math.sin(rad(a))*squash];
export const path = (points:number[][],close=true) => points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')+(close?' Z':'');
export function gearPath(r:number,teeth:number){return path(Array.from({length:teeth*4},(_,i)=>polar(i%4===1||i%4===2?r:r-7,i*360/(teeth*4))));}
export function arc(rx:number,ry:number,start:number,end:number){return path(Array.from({length:65},(_,i)=>{const a=rad(start+(end-start)*i/64);return [rx*Math.cos(a),ry*Math.sin(a)];}),false);}
export function ringHalf(rx:number,ry:number,width:number,front:boolean){const start=front?0:180,end=start+180;const pts=Array.from({length:65},(_,i)=>{let a=rad(start+(end-start)*i/64);return [rx*Math.cos(a),ry*Math.sin(a)];});return path([...pts,...Array.from({length:65},(_,i)=>{let a=rad(end-(end-start)*i/64);return [(rx-width)*Math.cos(a),(ry-width*.42)*Math.sin(a)];})]);}
