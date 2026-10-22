/* Isolated browser QA; no existing browser profile or user tabs are accessed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const {chromium}=await import('file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const out=path.join(root,'test-output');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1440,height:1180},deviceScaleFactor:1});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4178',{waitUntil:'networkidle'});
assert.equal(await page.locator('#scene .street-sign').count(),16);
await page.screenshot({path:path.join(out,'desktop-harbour.png'),fullPage:true});
const boxes=[];
for(let d=0;d<3;d++){
 await page.locator(`[data-dir="${d}"]`).click();
 for(const depth of ['2d','2.5d']){
  await page.locator(`[data-depth="${depth}"]`).click();
  for(const light of ['lightbox','neon']){
   await page.locator(`[data-light="${light}"]`).click();
   for(const size of [320,640]){
    await page.locator(`[data-size="${size}"]`).click();
    const b=await page.locator('#screen').boundingBox();assert.equal(b.width,size);assert.equal(b.height,size);
    await page.locator('#screen').screenshot({path:path.join(out,`street-${d}-${depth}-${light}-${size}.png`)});
   }
   const geometry=await page.evaluate(()=>Array.from(document.querySelectorAll('#scene .street-sign')).map(g=>{const plate=g.querySelector('.sign-plate'),b=plate.getBBox(),m=plate.getCTM();return{f:+g.dataset.family,x:b.x*m.a+m.e,y:b.y*m.d+m.f,w:b.width*m.a,h:b.height*m.d};}));
   for(let i=0;i<geometry.length;i++)for(let j=i+1;j<geometry.length;j++){const a=geometry[i],b=geometry[j],w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);assert(w<=0||h<=0,`Sign plates overlap: direction ${d}, ${depth}, ${light}, families ${a.f}/${b.f}`);}
   boxes.push({d,depth,light,geometry});
  }
 }
}
await page.locator('[data-size="320"]').click();
await page.locator('#scene [data-family="7"]').click();
assert.equal(await page.locator('#scale-menu').isVisible(),true);assert.equal(await page.locator('#scale-menu strong').innerText(),'Rast');
assert.equal(await page.locator('#scene .selected').count(),1);
assert.equal(await page.locator('#scene .street-sign > g[filter="url(#street-dim)"]').count(),15);
await page.locator('#screen').screenshot({path:path.join(out,'menu-320.png')});
await page.locator('#menu-close').click();await page.locator('#view-modes [data-view="all"]').click();
await page.locator('#family-range').fill('1');assert.equal(await page.locator('#selected-label').innerText(),'Hirajōshi');
await page.locator('.placement summary').click();await page.locator('#zoom').fill('125');await page.locator('#offset-x').fill('15');
const placement=await page.evaluate(()=>ScaleStreetSampleApp.state.placements['2.5d'][1]);assert.equal(placement.scale,1.25);
await page.locator('#reset-sign').click();assert.equal(await page.locator('#zoom').inputValue(),'100');
await page.locator('[data-hue="165"]').click();assert.equal(await page.locator('#hue').inputValue(),'165');
await page.locator('[data-hue="0"]').click();
const audioReport=await page.evaluate(async()=>{
 const results=[];
 for(let v=0;v<4;v++){
  const sample=STREET_SAMPLES.samples[v],events=ScaleSampleAudio.events(sample,v);const total=events.reduce((n,e)=>n+e.length,0);
  const ctx=new OfflineAudioContext(1,44100*11,44100),gain=ctx.createGain();gain.gain.value=.65;gain.connect(ctx.destination);ScaleSampleAudio.schedule(ctx,gain,sample,v,.05);const buffer=await ctx.startRendering();const values=buffer.getChannelData(0);let peak=0,energy=0;for(const x of values){peak=Math.max(peak,Math.abs(x));energy+=x*x;}results.push({scale:sample.id,totalBeats:total,peak,rms:Math.sqrt(energy/values.length),inScale:events.every(e=>sample.notes.some(n=>Math.abs(n-e.semitones%12)<1e-7)),eventCount:events.length});
 }
 return results;
});
for(const r of audioReport){assert.equal(r.totalBeats,16);assert(r.inScale);assert(r.peak>0&&r.peak<1);assert(r.rms>.001);}
await page.locator('#audio-toggle').click();assert.equal(await page.locator('#audio-toggle').getAttribute('aria-pressed'),'true');await page.waitForTimeout(100);await page.locator('#audio-toggle').click();
await page.locator('[data-page="signs"]').click();assert.equal(await page.locator('.sign-item').count(),12);
for(let s=0;s<4;s++){await page.locator(`[data-sample="${s}"]`).click();await page.screenshot({path:path.join(out,`comparison-${s}.png`),fullPage:true});}
await page.locator('.sign-item button').first().click();assert(await page.locator('#art-dialog').isVisible());await page.locator('#dialog-close').click();
await page.locator('[data-page="choice"]').click();await page.locator('[data-choice="2"]').click();await page.locator('#choice-notes').fill('QA temporary choice');await page.reload();await page.locator('[data-page="choice"]').click();assert.equal(await page.locator('[data-choice="2"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#choice-notes').inputValue(),'QA temporary choice');
const downloadPromise=page.waitForEvent('download');await page.locator('#export-choice').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'scale-street-style-choice.json');
await page.evaluate(()=>localStorage.clear());
// file:// is the actual no-server delivery path. Check it with all network requests denied.
const offline=await context.newPage();await offline.route('https://**',r=>r.abort());await offline.route('http://**',r=>r.abort());offline.on('pageerror',e=>errors.push(e.message));
await offline.goto('file:///'+path.join(root,'index.html').replaceAll('\\','/'),{waitUntil:'load'});assert.equal(await offline.locator('#scene .street-sign').count(),16);await offline.locator('[data-size="320"]').click();await offline.locator('#scene [data-family="13"]').click();assert.equal(await offline.locator('#scale-menu strong').innerText(),'Whole Tone');
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4178',{waitUntil:'networkidle'});await page.locator('[data-size="320"]').click();await page.screenshot({path:path.join(out,'mobile-320.png'),fullPage:true});
assert.equal(errors.length,0,errors.join('\n'));
fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({status:'pass',errors,previewSizes:[320,640],combinations:12,signCount:48,iconCount:12,streetCount:12,audio:audioReport,boxes,offlineFile:true},null,2));
console.log('PASS: 24 street-size screenshots, 4 sign comparisons, 16-family selection, dimming, transforms, tone, menu, choice persistence/export, offline file opening; 4 offline-rendered voices / 16 beats each. No page errors.');
await browser.close();
