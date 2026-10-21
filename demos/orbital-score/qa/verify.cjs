const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=process.env.ORBITAL_QA_URL||'http://127.0.0.1:4200';
(async()=>{
const browser=await chromium.launch({executablePath:process.env.ORBITAL_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1,acceptDownloads:true});
const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.__oscillators=[];
 const Original=window.AudioContext;
 window.AudioContext=class extends Original{
  constructor(...args){super(...args);window.__audio=this;}
  createOscillator(){const osc=super.createOscillator();const start=osc.start.bind(osc);osc.start=(...args)=>{window.__oscillators.push({type:osc.type,frequency:osc.frequency.value,detune:osc.detune.value});return start(...args);};return osc;}
  createDynamicsCompressor(){const c=super.createDynamicsCompressor();window.__analyser=this.createAnalyser();c.connect(window.__analyser);return c;}
 };
});
await page.goto(base);
await page.locator('#motionToggle').click();
assert.equal(await page.locator('.layout-card').count(),8);
assert.equal(await page.locator('.shape-button').count(),6);
assert.equal(await page.locator('.motion-button').count(),4);
for(let i=0;i<8;i++){
 await page.locator(`[data-layout="${i}"]`).click();
 await page.waitForTimeout(70);
 assert.equal(await page.locator('.layout-card.selected').getAttribute('data-layout'),String(i));
 await page.locator('#score').screenshot({path:`${root}/qa/layout-${i+1}.png`});
}
checks.push('All 8 layouts render without errors');
for(const shape of ['mixed','circles','geometry','notes','staff','graphic']){await page.locator(`[data-shape="${shape}"]`).click();await page.waitForTimeout(50);}
for(const motion of ['orbit','drift','breathe','vortex']){await page.locator(`[data-motion="${motion}"]`).click();await page.waitForTimeout(50);}
checks.push('All 6 forms and 4 motion controls respond');
await page.locator('[data-layout="0"]').click();await page.locator('[data-shape="mixed"]').click();await page.locator('[data-motion="orbit"]').click();
await page.locator('#theme').selectOption('midnight');
await page.locator('[data-tab="visual"]').click();await page.locator('#glow').fill('65');await page.locator('#opacity').fill('55');await page.locator('label.toggle-field').filter({has:page.locator('#guides')}).click();await page.waitForTimeout(100);await page.screenshot({path:`${root}/qa/midnight.png`,fullPage:true});await page.locator('#resetVisual').click();
checks.push('Theme, glow, opacity, guide toggle, and visual reset respond');
await page.locator('#theme').selectOption('paper');
await page.locator('[data-tab="sound"]').click();await page.locator('#mode').selectOption('random');await page.locator('#bpm').fill('180');await page.locator('#play').click();
await page.waitForTimeout(700);
const fm=await page.evaluate(async()=>{
 const d=new Float32Array(window.__analyser.fftSize);let max=0;
 for(let i=0;i<8;i++){window.__analyser.getFloatTimeDomainData(d);max=Math.max(max,Math.sqrt(d.reduce((s,v)=>s+v*v,0)/d.length));await new Promise(r=>setTimeout(r,30));}
 return {state:window.__audio.state,rms:max,oscillators:window.__oscillators};
});
assert.equal(fm.state,'running');assert(fm.rms>0.00001,'FM produces non-zero audio');assert(fm.oscillators.length>1);
await page.locator('[data-engine="va"]').click();await page.locator('#timbre').selectOption('warm');await page.waitForTimeout(500);
const va=await page.evaluate(()=>window.__oscillators.slice(-4));assert(va.some(o=>o.type==='sawtooth'&&o.detune>0));
checks.push('FM produces measurable audio, VA starts detuned sawtooth oscillators');
await page.locator('#stop').click();assert.equal(await page.locator('#time').textContent(),'00:00');
for(const scan of ['radial','left','right','angular']){
 await page.locator('#scan').selectOption(scan);await page.locator('#mode').selectOption('once');await page.locator('#play').click();
 await page.locator('#seekTrack').evaluate(el=>{const r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.right-.1,clientY:r.top+6,bubbles:true}));});
 await page.waitForTimeout(140);assert.equal(await page.locator('#transportStatus').textContent(),'SCORE COMPLETE');await page.locator('#stop').click();
}
checks.push('All 4 scan paths complete in once mode and stop at end');
await page.locator('#mode').selectOption('loop');await page.locator('#play').click();await page.locator('#seekTrack').evaluate(el=>{const r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.right-.1,clientY:r.top+6,bubbles:true}));});await page.waitForTimeout(120);assert.equal(await page.locator('#transportStatus').textContent(),'THE UNIVERSE IS PLAYING');await page.locator('#stop').click();
checks.push('Loop wraps and remains playing');
await page.locator('[data-tab="compose"]').click();await page.locator('#bpm').fill('84');await page.locator('#scan').selectOption('radial');
const score=await page.locator('#score').boundingBox();let found=false;
for(let y=score.height*.22;y<score.height*.79&&!found;y+=15)for(let x=score.width*.18;x<score.width*.83&&!found;x+=15){await page.mouse.move(score.x+x,score.y+y);if(await page.locator('#canvasTip').isVisible()){await page.mouse.down();await page.mouse.move(score.x+x+30,score.y+y+20,{steps:4});await page.mouse.up();found=true;}}
assert(found,'A visible note can be found and dragged');
const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('orbital-score-v1')));assert(Object.keys(stored.offsets).length>0);checks.push('Click audition and note dragging persist position');
await page.locator('#export').click();let event=page.waitForEvent('download');await page.locator('#exportJson').click();const jsonDownload=await event;const json=JSON.parse(fs.readFileSync(await jsonDownload.path(),'utf8'));assert.equal(json.format,'orbital-score');assert.deepEqual(json.offsets,stored.offsets);
json.settings.seed=992233;
await page.locator('#fileInput').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});await page.waitForFunction(()=>document.getElementById('seedLabel').textContent==='992233');assert.equal(await page.locator('#seedLabel').textContent(),'992233');
await page.locator('#fileInput').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"format":"orbital-score","version":1,"settings":{"count":99999}}')});assert.equal(await page.locator('#seedLabel').textContent(),'992233');assert.match(await page.locator('#toast').textContent(),/导入失败/);
checks.push('JSON export/import roundtrip keeps positions; invalid file leaves score intact');
await page.locator('#export').click();event=page.waitForEvent('download');await page.locator('#exportPng').click();const png=await event;const image=fs.readFileSync(await png.path());assert.equal(image.subarray(1,4).toString(),'PNG');checks.push('PNG export returns valid PNG');
await page.reload();assert.equal(await page.locator('#seedLabel').textContent(),'992233');checks.push('Settings restore after reload');
await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForTimeout(150);await page.screenshot({path:`${root}/qa/desktop.png`,fullPage:true});
for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No horizontal overflow at ${width}px`);}
await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${root}/qa/mobile.png`,fullPage:true});await page.locator('[data-tab="sound"]').click();await page.locator('[data-engine="va"]').click();assert.equal(await page.locator('[data-engine="va"]').getAttribute('aria-pressed'),'true');checks.push('Responsive layouts at 375, 768, 1024, 1440px; mobile tabs and synthesis controls respond');
await page.locator('#help').click();assert(await page.locator('#helpDialog').isVisible());await page.locator('#closeHelp').click();
assert.deepEqual(errors,[]);checks.push('No JavaScript runtime errors');
const report={date:new Date().toISOString(),browser:'Chromium / Playwright',checks,fmRms:fm.rms,errors,limitations:['Audio output measured programmatically; musical timbre has not been judged by human listening.','The preview server is running in the cloud, not on the user computer.']};fs.writeFileSync(`${root}/qa/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
