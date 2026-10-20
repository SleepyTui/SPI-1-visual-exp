import fs from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import './dist/engine.js';
const appUrl=pathToFileURL(resolve('dist/index.html')).href;
fs.mkdirSync('templates',{recursive:true});fs.mkdirSync('qa',{recursive:true});
for(let i=0;i<12;i++){const s=MD.preset(i),n=String(i+1).padStart(2,'0')+'-'+MD.names[i].toLowerCase().replaceAll(' ','-');fs.writeFileSync('templates/'+n+'.svg',MD.render(s));fs.writeFileSync('templates/'+n+'.json',JSON.stringify(s,null,2));}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1080},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(appUrl);await page.waitForTimeout(500);
await page.screenshot({path:'qa/workbench.png',fullPage:true});
for(let i=0;i<12;i++){await page.locator('[data-template="'+i+'"]').click();if(await page.locator('#art svg > g[data-layer]').count()!==4)throw Error('Layer count');if(await page.locator('#art svg').getAttribute('aria-label')!==MD.names[i]+' MiniDisc')throw Error('Preset');}
await page.locator('[data-template="0"]').click();
await page.locator('#f-p-0').fill('83');if(await page.evaluate(()=>Atelier.state.disc.p[0])!==83)throw Error('Slider');
await page.locator('#undo').click();if(await page.evaluate(()=>Atelier.state.disc.p[0])!==48)throw Error('Undo');
await page.locator('#layers button[data-layer="shell"]').first().click();await page.locator('#f-texture').selectOption('11');await page.locator('#f-blur').fill('30');
await page.locator('#layers button[data-layer="label"]').first().click();await page.locator('#f-title').fill('自定义 / TEST');
const dl=page.waitForEvent('download');await page.locator('#export').click();const file=await dl;await file.saveAs('qa/custom-export.svg');
const xml=fs.readFileSync('qa/custom-export.svg','utf8');if(!xml.includes('自定义')||!xml.includes('layer-stickers'))throw Error('Export');
const ds=page.waitForEvent('download');await page.locator('#save').click();await(await ds).saveAs('qa/custom.json');
await page.locator('#file').setInputFiles('qa/custom.json');if(await page.evaluate(()=>Atelier.state.label.title)!=='自定义\nTEST')throw Error('Import');
await page.reload();if(await page.evaluate(()=>Atelier.state.shell.blur)!==30)throw Error('Persistence');
await page.locator('[data-template="0"]').click();const dc=page.waitForEvent('download');await page.locator('#contact').click();await(await dc).saveAs('templates/12-genres-contact-sheet.svg');
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa/mobile.png',fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
await page.goto('file:///E:/SPI-1_v3/output/md-atelier/templates/12-genres-contact-sheet.svg');await page.setViewportSize({width:1500,height:1300});await page.screenshot({path:'qa/12-genres.png'});
await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync('qa/report.json',JSON.stringify({status:'pass',presets:12,layers:4,sliders:true,undo:true,SVG:true,JSONRoundtrip:true,persistence:true,mobile390:true,errors},null,2));console.log('PASS: 12 presets, 4 layers, controls, undo, SVG, JSON, persistence, mobile.');

