import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH||homedir()+'/.codex/skills/develop-web-game/node_modules/playwright/index.mjs')); 
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const url='http://127.0.0.1:4173/p0/index.html';
try{
 await page.goto(url);await page.waitForTimeout(1200);
 const before=await page.locator('#quantum').evaluate(c=>({...c.stats}));
 await page.waitForTimeout(2000);
 const after=await page.locator('#quantum').evaluate(c=>({...c.stats}));
 assert(after.frames>before.frames+15,'GPU animation must advance');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 const paused=await page.locator('#quantum').evaluate(c=>c.stats.frames);
 await page.waitForTimeout(250);assert.equal(await page.locator('#quantum').evaluate(c=>c.stats.frames),paused);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto(url+'?svg=1&still=1');assert(await page.locator('#quantum').isHidden());assert(await page.locator('#parts path').count()>100);
 assert.deepEqual(errors,[]);
 const result={framesIn2Seconds:after.frames-before.frames,lastSubmitMs:after.drawMs,reducedMotion:true,mobileOverflow:false,svgFallback:true,pageErrors:errors};
 writeFileSync('docs/visual/browser-p0.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
