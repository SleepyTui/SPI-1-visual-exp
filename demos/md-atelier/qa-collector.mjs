import fs from 'node:fs';import assert from 'node:assert/strict';
import{chromium}from'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
fs.mkdirSync('qa/collector',{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage({viewport:{width:1280,height:1100},acceptDownloads:true}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
try{
await p.goto('http://127.0.0.1:4199/collector.html');await p.waitForTimeout(500);
assert.equal(await p.locator('.disc-case').count(),12);const square=await p.locator('#screen').boundingBox();assert(Math.abs(square.width-square.height)<1);
const material=await p.evaluate(()=>Array.from(document.querySelectorAll('.disc-case')).map(el=>({alpha:el.dataset.alpha,face:getComputedStyle(el.querySelector('.cover-face')).opacity,core:getComputedStyle(el.querySelector('.case-matter')).filter,print:getComputedStyle(el.querySelector('.case-print')).filter,spineText:getComputedStyle(el.querySelector('.spine-label')).filter})));
assert(material.every(x=>x.alpha==='1.0000'&&x.face==='1'&&!x.print.includes('blur')&&x.spineText==='none'));assert(material[3].core.includes('blur(0px)'));assert(!material[5].core.includes('blur(0px)'));
await p.screenshot({path:'qa/collector/desktop.png',fullPage:true});
const samples=[];for(const n of [3.1,3.25,3.45,3.55,3.7]){await p.locator('#disc-range').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},n);samples.push(await p.evaluate(()=>({position:MDCollector.position,selected:MDCollector.selected,rotation:document.querySelector('.disc-case[data-index="3"]').dataset.rotation})));}
assert.deepEqual(samples.map(x=>x.selected),[3,3,3,4,4]);assert.equal(new Set(samples.map(x=>x.rotation)).size,5);
await p.locator('#screen').screenshot({path:'qa/collector/mid-turn.png'});
await p.locator('#disc-range').dispatchEvent('change');await p.waitForFunction(()=>MDCollector.position===4);
await p.locator('#disc-range').focus();await p.keyboard.press('ArrowRight');await p.waitForFunction(()=>MDCollector.position===5);
await p.locator('#favorite').click();assert.equal(await p.locator('#favorite-count').innerText(),'1');
await p.locator('#next').click();await p.waitForFunction(()=>MDCollector.position===6);await p.locator('#favorite').click();
await p.locator('#show-favorites').click();assert.equal(await p.evaluate(()=>MDCollector.count),2);await p.locator('#show-favorites').click();assert.equal(await p.evaluate(()=>MDCollector.count),12);
await p.evaluate(()=>MDCollector.select(5));await p.waitForFunction(()=>MDCollector.position===5);
const edgeBox=await p.locator('.disc-case[data-index="6"] .case-spine.right').boundingBox(),hitBox=await p.locator('.spine-hit[data-index="6"]').boundingBox();assert(Math.abs(edgeBox.x+edgeBox.width/2-hitBox.x-hitBox.width/2)<8,'Hit target must align with visible spine');
await p.locator('.spine-hit[data-index="6"]').click();await p.waitForFunction(()=>MDCollector.position===6);
const shelf=await p.locator('#shelf').boundingBox();await p.mouse.move(shelf.x+shelf.width*.5,shelf.y+shelf.height*.5);await p.mouse.down();await p.mouse.move(shelf.x+shelf.width*.5-55,shelf.y+shelf.height*.5,{steps:8});const dragPos=await p.evaluate(()=>MDCollector.position);assert(dragPos>6&&dragPos<7);await p.mouse.up();await p.waitForFunction(()=>Number.isInteger(MDCollector.position));
const dl=p.waitForEvent('download');await p.locator('#export-disc').click();await(await dl).saveAs('qa/collector/export.svg');assert(fs.readFileSync('qa/collector/export.svg','utf8').includes('layer-stickers'));
await p.locator('#disc-file').setInputFiles('templates/03-cloud-nine.json');await p.waitForFunction(()=>MDCollector.count===13);await p.waitForFunction(()=>MDCollector.position===12);assert.equal(await p.locator('#album-title').innerText(),'CLOUD 9');
await p.reload();assert.equal(await p.evaluate(()=>MDCollector.count),13);assert.equal(await p.evaluate(()=>MDCollector.selected),12);assert.equal(await p.locator('#favorite-count').innerText(),'2');
await p.evaluate(()=>MDCollector.select(0));await p.waitForFunction(()=>MDCollector.position===0);assert(await p.locator('#previous').isDisabled());
await p.evaluate(()=>MDCollector.select(12));await p.waitForFunction(()=>MDCollector.position===12);assert(await p.locator('#next').isDisabled());
await p.evaluate(()=>{localStorage.removeItem('md-collector-v1')});await p.reload();await p.waitForTimeout(150);
await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const mobileSquare=await p.locator('#screen').boundingBox();assert(Math.abs(mobileSquare.width-mobileSquare.height)<1);await p.screenshot({path:'qa/collector/mobile.png',fullPage:true});
await p.setViewportSize({width:1280,height:1100});await p.screenshot({path:'qa/collector/desktop.png',fullPage:true});assert.deepEqual(errors,[]);
fs.writeFileSync('qa/collector/report.json',JSON.stringify({status:'pass',square:true,continuousSamples:samples,releaseSnap:true,keyboard:true,spineClick:true,shelfDrag:true,dragPos,favorites:true,SVG:true,customImport:true,persistence:true,edgeBounds:true,mobile390:true,errors},null,2));console.log('PASS: square screen, continuous rotation, midpoint selection, snap, keys, spines, drag, favorites, SVG, custom import, persistence, mobile.');
}finally{await b.close();}
