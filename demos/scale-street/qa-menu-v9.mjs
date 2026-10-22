import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{fileURLToPath}from'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'test-output-menu-v9');
fs.mkdirSync(out,{recursive:true});
const{chromium}=await import('file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const p=await browser.newPage({viewport:{width:1291,height:956}}),errors=[];
await p.addInitScript(()=>globalThis.STREET_QA=true);p.on('pageerror',e=>errors.push(e.message));
try{
 await p.goto('http://127.0.0.1:4178/');await p.locator('[data-size="320"]').click();
 await p.evaluate(()=>{ScaleStreetV2.selectFamily(0);ScaleStreetV2.selectScale(6);});await p.waitForTimeout(500);
 const card=await p.locator('#scale-menu').boundingBox();assert.equal(card.height,64);
 const row=await p.locator('.menu-top').boundingBox();
 for(const s of ['.menu-header','#menu-select','.metadata','#close-menu']){const b=await p.locator('#scale-menu '+s).boundingBox();assert(b.y>=row.y-1&&b.y+b.height<=row.y+row.height+1,s+' outside shared row');}
 const geometry=await p.locator('#pitch-strip').evaluate(el=>{const svg=el.querySelector('svg'),b=el.getBoundingClientRect(),points=[...el.querySelectorAll('[data-pitch]')].map(g=>({pitch:+g.dataset.pitch,dot:+g.querySelector('circle').getAttribute('cx'),letter:+g.querySelector('.pitch-letter').getAttribute('x')}));return{width:b.width,view:svg.viewBox.baseVal.width,points};});
 assert.equal(geometry.view,geometry.width);assert(geometry.width>card.width*.9);assert(geometry.points.every(x=>x.dot===x.letter));
 const neighbors=await p.locator('.wheel-scroll').evaluate(el=>{const box=el.getBoundingClientRect();return[...el.children].map(e=>({text:e.textContent,selected:e.getAttribute('aria-selected'),opacity:getComputedStyle(e).color,rect:e.getBoundingClientRect()})).filter(e=>e.rect.bottom>box.top&&e.rect.top<box.bottom).map(e=>({text:e.text,selected:e.selected,color:e.opacity}));});assert(neighbors.length>=3,'Adjacent options not exposed');
 await p.locator('#screen').screenshot({path:path.join(out,'compact-320.png')});
 await p.locator('.wheel-scroll').focus();
 const before=await p.locator('.wheel-scroll').evaluate(el=>el.scrollTop);await p.keyboard.press('ArrowUp');await p.waitForTimeout(60);const during=await p.locator('.wheel-scroll').evaluate(el=>el.scrollTop);await p.waitForTimeout(400);const after=await p.locator('.wheel-scroll').evaluate(el=>el.scrollTop);assert(before!==during&&during!==after,'No intermediate animation position');
 await p.keyboard.press('End');await p.waitForTimeout(420);assert.equal(await p.evaluate(()=>ScaleStreetV2.state.indices[0]),9);
 await p.keyboard.press('Home');await p.waitForTimeout(420);assert.equal(await p.evaluate(()=>ScaleStreetV2.state.indices[0]),0);
 await p.locator('.wheel-scroll').hover();await p.mouse.wheel(0,50);await p.waitForTimeout(450);assert.equal(await p.evaluate(()=>ScaleStreetV2.state.indices[0]),1);
 let count=0;for(const lang of ['zh','en']){await p.evaluate(lang=>{ScaleStreetV2.state.lang=lang;ScaleStreetV2.render();},lang);for(let f=0;f<16;f++){await p.evaluate(f=>ScaleStreetV2.selectFamily(f),f);const n=await p.evaluate(f=>STREET_CATALOG[f].scales.length,f);for(let i=0;i<n;i++){await p.evaluate(i=>ScaleStreetV2.selectScale(i),i);assert.equal(await p.locator('.pitch-dot').count(),await p.evaluate(()=>STREET_CATALOG[ScaleStreetV2.state.family].scales[ScaleStreetV2.state.indices[ScaleStreetV2.state.family]].notes.length));count++;}}}
 await p.evaluate(()=>{ScaleStreetV2.selectFamily(7);ScaleStreetV2.selectScale(0);});await p.waitForTimeout(450);await p.locator('#screen').screenshot({path:path.join(out,'compact-english-320.png')});
 await p.locator('[data-size="640"]').click();await p.waitForTimeout(250);assert.equal((await p.locator('#scale-menu').boundingBox()).height,await p.evaluate(()=>ScaleStreetV2.state.popupSettings.height));await p.locator('#screen').screenshot({path:path.join(out,'card-640.png')});
 await p.setViewportSize({width:375,height:956});await p.locator('[data-size="320"]').click();await p.waitForTimeout(200);await p.screenshot({path:path.join(out,'mobile.png'),fullPage:true});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 // Depth overlay remains available and JSON round-trips all pre-existing controls.
 await p.evaluate(()=>{ScaleStreetV2.state.depthSettings.mix=100;ScaleStreetV2.controls.apply();});assert.equal(await p.locator('[data-depth-sign]').count(),16);await p.evaluate(()=>{ScaleStreetV2.state.depthSettings.mix=0;ScaleStreetV2.controls.apply();});assert.equal(await p.locator('.depth-map-layer').count(),0);
 const snap=await p.evaluate(()=>ScaleStreetV2.controls.snapshot());await p.evaluate(s=>ScaleStreetV2.controls.restore(s),snap);assert.deepEqual(await p.evaluate(()=>ScaleStreetV2.controls.snapshot()),snap);
 const offline=await browser.newPage();await offline.addInitScript(()=>globalThis.STREET_QA=true);offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file:///'+path.join(root,'index.html').replaceAll('\\','/'));await offline.evaluate(()=>ScaleStreetV2.selectFamily(0));assert.equal(await offline.locator('.menu-top').count(),1);assert(await offline.locator('.pitch-dot').count());await offline.close();
 assert.deepEqual(errors,[]);
 for(const n of ['user-defaults-v6.json','user-defaults-v6.js'])assert(fs.readFileSync(path.join(root,n)).equals(fs.readFileSync(path.join(out,'before',n))),'Changed saved defaults: '+n);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'pass',height320:64,oneRow:true,geometry,neighbors,animation:{before,during,after},scaleLanguageCombinations:count,offline:true,depthSmoke:true,jsonRoundTrip:true,existingDefaultsUnchanged:true,errors},null,2));console.log('PASS: 64px card; one information row; full-width aligned pitch ruler; visible neighbours; animated selection; 130 scale/language combinations; 640/mobile/offline/depth/JSON; defaults unchanged.');
}finally{await browser.close();}
