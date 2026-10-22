/* Four sample voices only. Timelines contain exactly 16 beats, at 96 BPM. */
(function(){
const VOICES=['丝弦','木弦','簧声','星尘'];
const MOTIFS=[[[0,1,2,4,3,0],[2,3,4,3,1,2],[4,2,1,2,3,1],[2,1,3,1,0,0]],[[0,2,1,3,4,2],[1,0,2,4,3,1],[4,3,2,1,2,3],[1,2,3,1,0,0]],[[0,1,2,3,2,1],[2,4,3,2,1,0],[3,4,5,6,4,3],[2,3,2,1,0,0]],[[0,2,4,3,1,2],[1,3,5,4,2,3],[5,3,1,2,4,3],[2,4,3,1,0,0]]];
const RHYTHMS=[[.5,.5,1,.5,.5,1],[.5,1,.5,.5,1,.5],[1,.5,.5,1,.5,.5],[.5,.5,.5,.5,1,1]];
function events(sample,voice){let beat=0;const out=[];MOTIFS[voice].forEach((bar,b)=>bar.forEach((degree,i)=>{const length=RHYTHMS[voice][i];out.push({beat,length,semitones:sample.notes[degree%sample.notes.length]+(b===2&&voice!==2?12:0),degree:degree%sample.notes.length});beat+=length;}));return out;}
function schedule(ctx,dest,sample,voice,start){
 const beat=60/96,nodes=[];
 const list=events(sample,voice);
 function tone(freq,t,dur){
  const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(voice===2?.13:.18,t+.012);gain.gain.exponentialRampToValueAtTime(voice===2?.035:.009,t+Math.max(.04,dur*.65));gain.gain.exponentialRampToValueAtTime(.0001,t+dur);
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime([2500,3900,1800,6000][voice],t);filter.Q.value=voice===2?1.8:.5;gain.connect(filter);filter.connect(dest);
  const partials=voice===0?[[1,'triangle',1],[2,'sine',.22],[3,'sine',.1]]:voice===1?[[1,'sawtooth',.6],[2,'sine',.35],[4,'sine',.09]]:voice===2?[[1,'sawtooth',.7],[1.002,'triangle',.32]]:[[1,'sine',1],[2.71,'sine',.3],[4.12,'sine',.12]];
  partials.forEach(([ratio,type,level])=>{const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq*ratio,t);g.gain.value=level*.34;osc.connect(g);g.connect(gain);osc.start(t);osc.stop(t+dur+.01);nodes.push(osc);});
 }
 list.forEach(e=>tone(261.6255653*2**(e.semitones/12),start+e.beat*beat,Math.min(e.length*beat*.92,10-e.beat*beat)));
 return {nodes,events:list,duration:10};
}
class SampleAudio{
 constructor(update){this.update=update;this.enabled=false;this.ctx=null;this.bus=null;this.frame=null;this.generation=0;this.activeNodes=[];}
 async play(sample,voice){
  if(!this.enabled)return;
  this.stop();const request=++this.generation;
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('此浏览器未提供 Web Audio');
   if(!this.ctx)this.ctx=new AC();await this.ctx.resume();if(request!==this.generation||!this.enabled)return;
   const bus=this.ctx.createGain();bus.gain.value=.65;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;bus.connect(comp);comp.connect(this.ctx.destination);this.bus=bus;
   const start=this.ctx.currentTime+.045;const run=schedule(this.ctx,bus,sample,voice,start);this.activeNodes=run.nodes;
   let finished=false;const tick=()=>{if(request!==this.generation)return;const elapsed=Math.max(0,this.ctx.currentTime-start);this.update(Math.min(elapsed,10),elapsed>=10?'播放完成':`${VOICES[voice]} · 第 ${Math.min(4,Math.floor(elapsed/2.5)+1)} / 4 小节`);if(elapsed<10){this.frame=requestAnimationFrame(tick);}else if(!finished){finished=true;comp.disconnect();bus.disconnect();this.activeNodes=[];}};tick();
  }catch(err){this.update(0,`无法播放：${err.message}`);}
 }
 stop(){++this.generation;if(this.frame)cancelAnimationFrame(this.frame);this.frame=null;if(this.bus&&this.ctx){const now=this.ctx.currentTime;this.bus.gain.cancelScheduledValues(now);this.bus.gain.setValueAtTime(Math.max(.0001,this.bus.gain.value),now);this.bus.gain.exponentialRampToValueAtTime(.0001,now+.035);const old=this.bus;const oldNodes=this.activeNodes;setTimeout(()=>{oldNodes.forEach(n=>{try{n.stop();n.disconnect();}catch{}});try{old.disconnect();}catch{}},60);}this.bus=null;this.activeNodes=[];this.update(0,this.enabled?'等待试听':'声音已关闭');}
}
globalThis.ScaleSampleAudio={SampleAudio,events,schedule,voices:VOICES};
})();
