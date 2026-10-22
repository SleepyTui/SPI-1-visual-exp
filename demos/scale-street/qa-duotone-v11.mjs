import fs from 'node:fs';import assert from 'node:assert/strict';import{execFileSync}from'node:child_process';
import{chromium}from'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out='test-output-duotone-v11';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage({viewport:{width:1440,height:1100}}),errors=[];
await p.addInitScript(()=>globalThis.STREET_QA=true);p.on('pageerror',e=>errors.push(e.message));
try{
await p.goto('http://127.0.0.1:4178/');const baseline=await p.evaluate(()=>ScaleStreetV2.controls.snapshot());
for(const n of ['user-defaults-v6.json','user-defaults-v6.js'])assert(fs.readFileSync(n).equals(execFileSync('git',['show','backup/pre-duotone-v11:'+n])),'Saved defaults changed');
assert.equal(baseline.settings.duotone.enabled,true);await p.locator('#tab-style').click();assert(await p.locator('#inspector-style').evaluate(e=>e.firstElementChild.classList.contains('duo-panel')));
const anim=await p.locator('#scene animate,#scene animateMotion').count();assert(anim>100);
await p.locator('[data-size="640"]').click();await p.locator('#open-menu').click();await p.waitForTimeout(400);
await p.screenshot({path:out+'/desktop-640.png',fullPage:true});await p.locator('#screen').screenshot({path:out+'/street-640.png'});
await p.locator('[data-size="320"]').click();await p.locator('#open-menu').click();await p.waitForTimeout(200);assert.equal((await p.locator('#scale-menu').boundingBox()).height,64);await p.locator('#screen').screenshot({path:out+'/street-320.png'});
const paused=async t=>p.evaluate(t=>{const svg=document.querySelector('#scene>svg');svg.pauseAnimations();svg.setCurrentTime(t);},t);
await p.locator('#back-menu').click();await p.mouse.move(0,0);await paused(1);const t1=await p.locator('#screen').screenshot();await paused(3.1);const t2=await p.locator('#screen').screenshot();assert(!t1.equals(t2),'Animated light frames are identical');
// UI theme changes must not rebuild the scene or its running lamp programs.
await p.evaluate(()=>{document.querySelector('#scene>svg').dataset.continuity='same';globalThis.duoClock=document.querySelector('.program-cell animate');});
await p.locator('#duo-a').fill('#227d83');await p.locator('#duo-b').fill('#dc7190');
assert(await p.evaluate(()=>document.querySelector('#scene>svg').dataset.continuity==='same'&&globalThis.duoClock===document.querySelector('.program-cell animate')));
await p.locator('#duo-surfaces').fill('43');await p.locator('#duo-scene').fill('82');await p.locator('#duo-diffusion').fill('68');await p.locator('#duo-grain').fill('24');
const changed=await p.evaluate(()=>ScaleStreetV2.controls.snapshot());assert.equal(changed.settings.duotone.a,'#227d83');assert.equal(changed.settings.duotone.surfaces,43);assert.equal(await p.locator('.duo-colour-pass').evaluate(e=>e.style.opacity),'0.82');
await p.locator('#screen').screenshot({path:out+'/alternate-inks.png'});
const dl=p.waitForEvent('download');await p.locator('#export-street').click();const download=await dl;await download.saveAs(out+'/exported-duotone.svg');const exported=fs.readFileSync(out+'/exported-duotone.svg','utf8');assert(exported.includes('id="duo-ink"'));const preview=await b.newPage();await preview.goto('file:///'+process.cwd().replaceAll('\\','/')+'/'+out+'/exported-duotone.svg');assert.equal(await preview.locator('#duo-ink').count(),1);await preview.screenshot({path:out+'/exported-preview.png'});await preview.close();
await p.reload();assert.deepEqual(await p.evaluate(()=>ScaleStreetV2.state.duotone),changed.settings.duotone);
await p.evaluate(s=>ScaleStreetV2.controls.restore(s),changed);assert.deepEqual(await p.evaluate(()=>ScaleStreetV2.controls.snapshot()),changed);
await p.locator('#tab-style').click();await p.locator('#duo-enabled').uncheck();assert.equal(await p.locator('html').evaluate(e=>e.classList.contains('duo-theme')),false);assert.equal(await p.locator('.duo-colour-pass').evaluate(e=>e.style.filter),'');await p.locator('#duo-enabled').check();
// 100% depth must remain neutral gray, unaffected by the duotone colour pass.
await p.evaluate(()=>{ScaleStreetV2.state.depthSettings.mix=100;ScaleStreetV2.controls.apply();});
const png=await p.locator('#screen').screenshot();
const chroma=await p.evaluate(async data=>{const im=await createImageBitmap(await(await fetch('data:image/png;base64,'+data)).blob()),c=new OffscreenCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);const a=ctx.getImageData(0,0,c.width,c.height).data;let max=0;for(let y=14;y<c.height-14;y++)for(let x=14;x<c.width-14;x++){const i=(y*c.width+x)*4;max=Math.max(max,Math.abs(a[i]-a[i+1]),Math.abs(a[i]-a[i+2]));}return max;},png.toString('base64'));assert(chroma<=1,'Depth pass was tinted');
await p.evaluate(s=>ScaleStreetV2.controls.restore(s),baseline);
await p.locator('#tab-sound').click();assert(await p.locator('.ambience-panel').evaluate(e=>e.open));await p.locator('#tab-style').click();
await p.setViewportSize({width:375,height:1000});await p.locator('[data-size="320"]').click();await p.locator('#open-menu').click();await p.waitForTimeout(200);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:out+'/mobile-320.png',fullPage:true});
const offline=await b.newPage();await offline.addInitScript(()=>globalThis.STREET_QA=true);offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file:///'+process.cwd().replaceAll('\\','/')+'/index.html');assert(await offline.locator('html').evaluate(e=>e.classList.contains('duo-theme')));assert.equal(await offline.locator('.duo-colour-pass').count(),1);await offline.close();
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({status:'pass',gitBackup:'ba046a6',existingDefaultsUnchanged:true,animations:anim,differentAnimationFrames:true,themeEditPreservesAnimationNodes:true,twoInkControls:true,opacity:true,jsonRoundTrip:true,svgExportSelfContained:true,reload:true,depthMaxChroma:chroma,mobile:true,offline:true,errors},null,2));console.log('PASS: backup/defaults, two-ink theme, 320/640/mobile, animated frames + continuous nodes, colours/opacity, JSON/reload/offline, neutral depth pass.');
}finally{await b.close();}
