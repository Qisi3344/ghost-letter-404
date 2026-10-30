import assert from 'node:assert/strict';
import {project,depth} from '../public/p0/camera.mjs';
import {sector,render} from '../public/p0/stage.mjs';
assert(project([0,0,1])[1]<project([0,0,0])[1]);
assert(depth([1,1,0])>depth([0,0,0]));
for(let i=0;i<96;i++){const s=sector(i*Math.PI/48,(i+1)*Math.PI/48);assert.equal(s.h,9);for(const p of s.points)assert(Math.abs(Math.hypot(...p)-127)<1e-8||Math.abs(Math.hypot(...p)-117)<1e-8);}
assert(!/NaN|undefined/.test(render()));
console.log('P0 projection, annular thickness and finite SVG checks passed');
