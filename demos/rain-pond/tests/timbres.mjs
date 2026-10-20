// Focused regression: distinct instruments at equal pitch, then real leaf rain.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_BROWSER_PATH || undefined,headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4176',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__rainPond?.renderer.ready);
 await page.evaluate(()=>{const a=window.__rainPond;a.state.rain=0;a.state.reverb=0;a.sound.process.amount=0;});
 await page.locator('#play-button').click();await page.waitForFunction(()=>window.__rainPond.sound.running);
 const result=await page.evaluate(async()=>{
  const {sound:s,state,store}=window.__rainPond;const wait=ms=>new Promise(r=>setTimeout(r,ms));const rows=[];s.waveform.size=8192;
  for(const name of ['water','leaf','dish']){
   for(const k of ['water','leaf','dish'])state[k]=k===name?.8:0;s.apply();await wait(120);
   s.voices[name].triggerAttackRelease(130.8128,.35,s.now()+.10,.65);await wait(290);
   const data=s.waveform.getValue(),rate=s.output.context.sampleRate;const harmonics=[];
   for(let h=1;h<=8;h++){let re=0,im=0;for(let i=0;i<data.length;i++){const phase=2*Math.PI*130.8128*h*i/rate;re+=data[i]*Math.cos(phase);im-=data[i]*Math.sin(phase);}harmonics.push(2*Math.hypot(re,im)/data.length);}
   rows.push({name,instrument:s.voices[name].voice.name,peak:s.samplePeak(),harmonics});await wait(500);
  }
  for(const[k,v]of Object.entries({water:0,dish:0,leaf:.83,rain:1,density:1,x:.25,y:.61,radius:.12,rhythm:1}))store.set(k,v);
  const before=s.counts.leaf;let peak=0;for(let i=0;i<60;i++){await wait(100);peak=Math.max(peak,s.samplePeak());}
  return{rows,leafHits:s.counts.leaf-before,leafRainPeak:peak};
 });
 assert.equal(new Set(result.rows.map(r=>r.instrument)).size,3);
 for(const row of result.rows)assert.ok(row.peak>.0005,`${row.name} has no output`);
 const bass=result.rows.find(r=>r.name==='leaf');assert.ok(bass.harmonics.slice(2).some(x=>x>.0003),'bass has no audible upper harmonics');
 assert.ok(result.leafHits>0);assert.ok(result.leafRainPeak>.001);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({instruments:result.rows.map(({name,instrument,peak})=>({name,instrument,peak})),leafHits:result.leafHits,leafRainPeak:result.leafRainPeak,errors}));
}finally{await browser.close();}
