// Small browser smoke check; no MCU build or flashing.
const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:720,height:1120}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.locator('#demo').click();
  await page.waitForTimeout(700);
  for(const value of ['chord','arp','line','improv'])await page.locator(`[data-mode="${value}"]`).click();
  for(const value of ['lilac','citrus','dusk'])await page.selectOption('#theme',value);
  const filterOutputs=new Set();
  for(const value of ['ascii','terminal','paper','blocks','none']){
   await page.locator(`[data-filter="${value}"]`).click();await page.waitForTimeout(75);
   if(await page.locator(`[data-filter="${value}"]`).getAttribute('aria-pressed')!=='true')throw Error('Filter button state failed');
   filterOutputs.add(await page.locator('#screen').evaluate(c=>c.toDataURL()));
  }
  if(filterOutputs.size!==5)throw Error('Filters did not produce distinct images');
  await page.locator('[data-filter="ascii"]').click();
  for(const value of ['1','2','3','7','320']){
   await page.fill('#cell',value);await page.locator('#cell').dispatchEvent('change');await page.waitForTimeout(75);
   if(await page.inputValue('#cell')!==value)throw Error('ASCII size was restricted');
  }
  for(const [id,value] of [['fade','90.5'],['bpm','300'],['division','64'],['stride','12'],['zoom','1.25']]){
   await page.fill('#'+id,value);await page.locator('#'+id).dispatchEvent('change');
   if(await page.inputValue('#'+id)!==value)throw Error('Numeric control restricted: '+id);
  }
  await page.reload();
  if(await page.inputValue('#fade')!=='90.5'||await page.inputValue('#cell')!=='320')throw Error('Numeric persistence failed');
  await page.fill('#cell','');await page.waitForTimeout(75);await page.locator('#cell').dispatchEvent('change');
  if(await page.inputValue('#cell')!=='320')throw Error('Empty input recovery failed');
  for(const [id,value] of [['cell','5'],['division','16'],['stride','4']]){await page.fill('#'+id,value);await page.locator('#'+id).dispatchEvent('change')}
  await page.locator('[data-filter="none"]').click();
  await page.locator('#demo').click();
  await page.selectOption('#theme','lilac');
  await page.locator('[data-mode="chord"]').click();
  await page.fill('#bpm','75');await page.locator('#bpm').dispatchEvent('change');
  if(!(await page.locator('#timing').textContent()).includes('200.0 ms'))throw Error('Tempo mapping failed');
  await page.locator('#clock').click();
  await page.waitForTimeout(75); // Allow the already-invalidated frame to present.
  const paused=await page.locator('#screen').evaluate(c=>c.toDataURL());
  await page.waitForTimeout(150);
  if(paused!==await page.locator('#screen').evaluate(c=>c.toDataURL()))throw Error('Pause did not freeze scene');
  await page.locator('#clock').click();await page.locator('#demo').click();
  await page.locator('#clear').click();
  const rect=await page.locator('#screen').boundingBox();
  const scale=rect.width/320;
  await page.mouse.move(rect.x+100*scale,rect.y+140*scale);await page.mouse.down();
  await page.mouse.move(rect.x+135*scale,rect.y+165*scale,{steps:4});await page.mouse.up();
  await page.waitForTimeout(420);
  if(process.env.PREVIEW_SCREENSHOT)await page.locator('.stage').screenshot({path:process.env.PREVIEW_SCREENSHOT});
  if(errors.length)throw Error(errors.join('; '));
  console.log('PASS: numeric ranges, 1–320 px ASCII, persistence, empty input recovery, filters, tempo and pointer weaving; no browser errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
