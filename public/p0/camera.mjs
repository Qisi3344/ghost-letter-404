import { fitProjection, iso, depthOf } from './vendor/iso-kit.mjs';
export const camera = fitProjection([[-180,-180,0],[180,180,0],[-180,180,0],[180,-180,0],[0,0,385]],1000,730,{pad:75,azimuth:45,elevation:30});
export const project = p => iso(p,camera);
export const depth = p => depthOf(p,camera);
