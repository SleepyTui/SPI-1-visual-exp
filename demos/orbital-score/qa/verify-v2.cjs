/* Run with an existing preview server and Playwright. Outputs stay in qa/. */
const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=process.env.ORBITAL_QA_URL||'http://127.0.0.1:4200';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ORBITAL_CHROMIUM||undefined,headless:true,args:['--no-sandbox']});
 try{
 const p=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base);
 await p.evaluate(()=>{
  window.__draws=[];window.__stats={fill:0,widths:[]};
  const glyph=OrbitalGlyphs.draw;OrbitalGlyphs.draw=function(c,f,v,r,o){if(c.canvas.id==='score'||c.canvas.dataset.orbitalLayer==='notes'){const t=c.getTransform(),s=1000/c.canvas.width;window.__draws.push({family:f,variant:v,r,x:t.e*s,y:t.f*s});}return glyph(...arguments);};
  const proto=CanvasRenderingContext2D.prototype,clear=proto.clearRect,fill=proto.fill,stroke=proto.stroke;
  proto.clearRect=function(){if(this.canvas.id==='score'){window.__draws=[];window.__stats={fill:0,widths:[]};}return clear.apply(this,arguments);};
  proto.fill=function(){if(this.canvas.id==='score'||this.canvas.dataset.orbitalLayer)window.__stats.fill++;return fill.apply(this,arguments);};
  proto.stroke=function(){if(this.canvas.id==='score'||this.canvas.dataset.orbitalLayer)window.__stats.widths.push(this.lineWidth);return stroke.apply(this,arguments);};
 });
 await p.locator('#motionToggle').click();await p.waitForTimeout(60);
 const first=await p.evaluate(()=>window.__draws[0]);await p.locator('[data-layout="1"]').click();await p.waitForTimeout(30);const initial=await p.evaluate(()=>window.__draws[0]);assert(Math.hypot(first.x-initial.x,first.y-initial.y)<3,'Layout transition starts from current visible position');
 await p.waitForTimeout(500);const mid=await p.evaluate(()=>window.__draws[0]);assert(Math.hypot(first.x-mid.x,first.y-mid.y)>2,'Layout actually moves');assert(await p.locator('#transitionBadge').isVisible());
 await p.locator('[data-layout="4"]').click();await p.waitForTimeout(30);const interrupted=await p.evaluate(()=>window.__draws[0]);assert(Math.hypot(mid.x-interrupted.x,mid.y-interrupted.y)<18,'Interrupted morph continues from current position');await p.waitForTimeout(1850);assert(!await p.locator('#transitionBadge').isVisible());checks.push('Curved layout morph starts continuously, moves, supports interruption and completes');
 const thumbnailHashes={};
 for(const family of ['mixed','circles','geometry','notes','staff','graphic']){
  await p.locator(`[data-shape="${family}"]`).click();assert.equal(await p.locator('[data-variant]').count(),12);
  const hashes=await p.locator('#variants canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL()));assert.equal(new Set(hashes).size,12,`${family} has 12 visually distinct thumbnails`);thumbnailHashes[family]=hashes.length;
 }
 checks.push('All six families show 12 visually distinct thumbnails (72 total)');
 await p.locator('[data-shape="circles"]').click();for(let i=1;i<12;i++)await p.locator(`[data-variant="${i}"]`).click();await p.waitForTimeout(850);assert.equal(await p.locator('#variantCount').textContent(),'1 / 12');assert.deepEqual(await p.evaluate(()=>[...new Set(window.__draws.map(d=>d.variant))]),[0]);await p.locator('[data-variant="0"]').click();assert.equal(await p.locator('#variantCount').textContent(),'1 / 12');
 await p.locator('[data-shape="notes"]').click();assert.equal(await p.locator('#variantCount').textContent(),'12 / 12');await p.locator('[data-shape="circles"]').click();assert.equal(await p.locator('#variantCount').textContent(),'1 / 12');checks.push('Shape selection filters the actual canvas, cannot become empty, and is remembered per family');
 await p.locator('[data-layout="7"]').click();await p.waitForTimeout(1850);
 await p.locator('[data-tab="visual"]').click();await p.locator('#guideWidth').fill('3.7');await p.locator('#shapeWidth').fill('6.2');await p.waitForTimeout(60);
 assert(await p.evaluate(()=>__stats.widths.some(w=>Math.abs(w-3.7)<.01)));assert(await p.evaluate(()=>__stats.widths.some(w=>Math.abs(w-6.2)<.01)));checks.push('Universe and shape line-width controls reach Canvas independently');
 await p.locator('[data-tab="compose"]').click();await p.locator('[data-draw="outline"]').click();await p.waitForTimeout(810);const outline=await p.evaluate(()=>__stats.fill);assert.equal(outline,0,'Outline mode performs no body fills');
 await p.locator('[data-draw="fill"]').click();await p.waitForTimeout(810);const filled=await p.evaluate(()=>__stats.fill);assert(filled>=48);await p.locator('[data-draw="both"]').click();await p.waitForTimeout(810);assert(await p.evaluate(()=>__stats.fill>=48&&__stats.widths.some(w=>Math.abs(w-6.2)<.01)));checks.push('Outline, fill, and outline+fill change actual painting operations');
 await p.locator('#randomAll').click();await p.waitForTimeout(2400);assert(await p.locator('#transitionBadge').isVisible());await p.waitForTimeout(2200);assert(await p.locator('#transitionBadge').isVisible());await p.waitForTimeout(650);assert(!await p.locator('#transitionBadge').isVisible());const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('orbital-score-v1')));for(const k of ['guideWidth','shapeWidth','drawMode','enabledVariants'])assert(k in stored.settings);checks.push('Global random transition remains active through 4.6 seconds and completes after 5 seconds');
 await p.reload();assert.equal(await p.locator('#variantCount').textContent(),stored.settings.enabledVariants[stored.settings.shape].length+' / 12');checks.push('New shape selections, widths and render mode persist across reload');
 // Test the delivered single HTML with all network requests blocked.
 const standalone=fs.readFileSync(path.join(root,'exports/orbital.html'),'utf8');assert(!/<script[^>]+src=|<link[^>]+href="style\.css"/.test(standalone));await p.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:standalone}):r.abort());await p.reload();await p.waitForTimeout(100);assert.equal(await p.locator('[data-variant]').count(),12);await p.locator('#mode').selectOption('random');await p.locator('#play').click();
 for(const format of ['gif','mp4']){
  await p.locator('#recordOpen').click();await p.locator('#recordFormat').selectOption(format);await p.locator('#recordDuration').selectOption('5');await p.locator('#recordSize').selectOption('512');assert(!await p.locator('#startRecording').isDisabled());
  const download=p.waitForEvent('download',{timeout:30000});await p.locator('#startRecording').click();await p.waitForTimeout(250);await p.locator('#randomAll').click();const file=await download;const target=path.join(root,`qa/v2-recording.${format}`);await file.saveAs(target);assert(fs.statSync(target).size>1000);checks.push(`Network-blocked single HTML records and downloads real ${format.toUpperCase()}`);
 }
 await p.locator('#recordOpen').click();await p.locator('#recordFormat').selectOption('gif');await p.locator('#startRecording').click();await p.waitForTimeout(250);await p.locator('#cancelRecording').click();assert(!await p.locator('#recordTray').isVisible());
 await p.locator('#recordOpen').click();await p.locator('#startRecording').click();const early=p.waitForEvent('download');await p.waitForTimeout(550);await p.locator('#stopRecording').click();await early;checks.push('Recording cancels cleanly, restarts, and supports early finish');
 await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(100);await p.screenshot({path:path.join(root,'qa/v2-desktop.png'),fullPage:true});
 for(const width of [375,768,1024,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No overflow at ${width}`);}
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(root,'qa/v2-mobile.png'),fullPage:true});await p.locator('#recordOpen').click();await p.screenshot({path:path.join(root,'qa/v2-record-dialog.png'),fullPage:true});await p.locator('#closeRecord').click();checks.push('Updated UI and recording dialog fit mobile and desktop viewports');
 assert.deepEqual(errors,[]);const report={date:new Date().toISOString(),checks,thumbnailHashes,errors,limitations:['Audio measured by signal and decoded file, not judged by human listening.','MP4 depends on native browser encoding; supported formats are checked in the UI.','Direct file:// navigation is blocked by managed browser policy; single-file execution and recording were verified as document content with all network requests blocked.']};fs.writeFileSync(path.join(root,'qa/v2-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
