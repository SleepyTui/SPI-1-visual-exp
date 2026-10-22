(function(){
const PROFILES=[
 ['triangle',2200,.006,[[1,1],[2,.18],[3,.08]]],['sawtooth',3700,.004,[[1,.72],[2,.29],[4,.09]]],['triangle',3100,.008,[[1,.9],[2,.42],[3,.12]]],['sine',2900,.004,[[1,1],[2,.35],[5,.08]]],['sine',6400,.003,[[1,.8],[2.76,.32],[4.08,.1]]],['sine',1700,.065,[[1,1],[2,.09],[3,.14]]],['sawtooth',2700,.004,[[1,.7],[2,.2],[4,.14]]],['sawtooth',1650,.038,[[1,.65],[2,.15],[3,.16]]],['sine',4900,.009,[[1,1],[2,.22],[4,.06]]],['triangle',1400,.07,[[1,.7],[2,.4],[3,.18]]],['sawtooth',1100,.09,[[1,.58],[2,.21],[3,.2]]],['triangle',3800,.004,[[1,1],[3,.3],[5,.13]]],['sine',1800,.002,[[1,1],[3,.17],[7,.04]]],['sine',5900,.006,[[1,.8],[2.71,.3],[4.12,.12]]],['sine',4500,.005,[[1,.75],[2.4,.34],[3.7,.2]]],['sawtooth',2100,.025,[[1,.65],[2,.26],[3,.11]]]
];
// Distinct phrase grammar per family: tempo, rhythm, contour, register and articulation.
const STYLES=[
 {bpm:82,r:[1,.5,.5,1,1],d:[0,1,2,4,3,2,1,0],gate:.68},
 {bpm:66,r:[1.5,.5,1,1],d:[0,2,1,0,3,4,2,0],gate:.9},
 {bpm:108,r:[.75,.25,.5,.5,1,1],d:[0,2,3,4,3,2,1,2],gate:.77},
 {bpm:92,r:[.5,1,.5,1,1],d:[0,1,3,2,4,3,1,0],gate:.8},
 {bpm:116,r:[.5,.5,.5,.5,.5,.5,.5,.5],d:[0,3,1,4,2,0,4,1],gate:.42},
 {bpm:98,r:[.25,.25,.5,1,.5,.5,1],d:[0,1,2,1,3,4,3,2],gate:.82},
 {bpm:74,r:[.5,.5,1.5,.5,.25,.25,.5],d:[0,2,1,3,2,4,5,2],gate:.76},
 {bpm:88,r:[.75,.25,.75,.25,.5,.5,1],d:[0,1,2,3,2,1,0,4],gate:.88},
 {bpm:104,r:[1,1,.5,.5,1],d:[0,2,4,3,2,1,3,0],gate:.86},
 {bpm:80,r:[1,.5,.25,.25,1,1],d:[0,4,6,5,4,3,1,0],gate:.93},
 {bpm:112,r:[.5,.75,.25,1,.5,.5,.5],d:[0,1,2,4,6,5,3,1],gate:.82},
 {bpm:94,r:[2/3,1/3,2/3,1/3,1,1],d:[0,2,3,2,1,0,3,4],gate:.65},
 {bpm:102,r:[.5,1,.5,.5,.5,1],d:[0,2,1,4,3,5,2,0],gate:.55},
 {bpm:58,r:[1.5,.5,2],d:[0,2,4,3,1,5,4,0],gate:.97},
 {bpm:122,r:[.5,.25,.25,.5,.5,1,1],d:[0,2,4,6,7,5,3,1],gate:.72},
 {bpm:144,r:[.5,.5,.5,.5,.75,.25,.5,.5],d:[0,2,4,5,6,7,3,1],gate:.7}
];
const mod=(n,m)=>(n%m+m)%m;
function excerpt(s,f,mode){if(mode==='study')return null;const ex=globalThis.STREET_EXCERPTS||{};if(f===8&&s.id==='major')return ex.ode;if(f===11&&s.id==='major-pentatonic')return ex.grace;if(f===0&&s.id==='gong')return ex.auld;return null;}
function describe(s,f,opts={}){const ex=excerpt(s,f,opts.mode),style=STYLES[f],bpm=Math.round((ex?.bpm||style.bpm)*((opts.tempo||100)/100)),beats=ex?.beats||4;return{title:ex?.title||{zh:'原创四小节音阶练习',en:'Original four-bar scale study'},note:ex?.note||{zh:f<8?'示范音高集合与差异化节奏，未模拟完整传统旋律语法。':'旋律与伴奏只使用当前音阶；伴奏是本 Demo 的原创配写。',en:f<8?'Pitch-set and rhythm study; not a full model of traditional performance grammar.':'Melody and accompaniment use only this scale; newly composed for this demo.'},source:ex?.source||null,bpm,meter:ex?.meter||'4/4',beatsPerBar:beats,duration:4*beats*60/bpm,hasHarmony:f>=8||!!ex};}
function events(s,f,opts={}){const ex=excerpt(s,f,opts.mode),out=[];let beat=0;if(ex){for(const bar of ex.bars)for(const[n,length]of bar){out.push({beat,length,semitones:n,degree:s.notes.findIndex(x=>Math.abs(x-mod(n,12))<1e-5),role:'melody',gate:.9});beat+=length;}return out;}
 const sty=STYLES[f],n=s.notes.length,variant=s.scaleIndex||0;
 for(let bar=0;bar<4;bar++)sty.r.forEach((length,i)=>{let raw=sty.d[mod(i+bar*(f%3+1)+variant,sty.d.length)]+(bar===1?variant%3:0);if(bar===2)raw=n-1-mod(raw,n);if(bar===3&&i>=sty.r.length-2)raw=i===sty.r.length-1?0:1;const degree=mod(raw,n),octave=bar===2&&(f===2||f===6||f===15)?12:0;out.push({beat,length,semitones:s.notes[degree]+octave,degree,role:'melody',gate:sty.gate});beat+=length;});return out;}
function harmonyEvents(s,f,opts={}){const info=describe(s,f,opts);if(opts.harmony===false||!info.hasHarmony)return[];const n=s.notes.length,b=info.beatsPerBar,out=[],roots=f===9?[0,3,4,0]:f===11?[0,2,3,0]:f===10?[0,1,4,0]:[0,3,4,0];
 for(let bar=0;bar<4;bar++){const root=mod(roots[bar],n),chord=[0,2,4].map(j=>s.notes[mod(root+j,n)]-12+(root+j>=n?12:0));out.push({beat:bar*b,length:b,semitones:s.notes[root]-24,role:'bass',gate:.88});if(f===15||f===10||f===11){for(const offset of [.5,2.5].filter(x=>x<b))for(const semitones of chord)out.push({beat:bar*b+offset,length:.5,semitones,role:'harmony',gate:.7});}else chord.forEach((semitones,i)=>out.push({beat:bar*b+i*b/3,length:b/3,semitones,role:'harmony',gate:.85}));}return out;}
function schedule(ctx,dest,s,f,start,opts={}){const[type,cutoff,attack,partials]=PROFILES[f],info=describe(s,f,opts),nodes=[],melody=events(s,f,opts),accompaniment=harmonyEvents(s,f,opts),list=[...melody,...accompaniment],spb=60/info.bpm;
 for(const e of list){const t=start+e.beat*spb,dur=e.length*spb*e.gate,isMel=e.role==='melody',filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=isMel?cutoff:1800;filter.Q.value=f===7?1.4:.65;filter.connect(dest);const env=ctx.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(isMel?.105:.047,t+Math.min(isMel?attack:.015,dur/3));env.gain.exponentialRampToValueAtTime(isMel?.018:.012,t+dur*.65);env.gain.exponentialRampToValueAtTime(.0001,t+dur);env.connect(filter);
  for(const[ratio,amp]of(isMel?partials:[[1,.8],[2,.15]])){const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=isMel?type:'triangle';osc.frequency.value=261.6255653*2**(e.semitones/12)*ratio;g.gain.value=amp*.45;osc.connect(g);g.connect(env);osc.start(t);osc.stop(t+dur+.01);nodes.push(osc);} }
 return{nodes,duration:info.duration,events:melody,accompaniment,info};}
class Player{
 constructor(update){this.update=update;this.enabled=false;this.volume=.55;this.ctx=null;this.bus=null;this.token=0;this.nodes=[];this.options={};this.duration=0;this.beatsPerBar=4;this.bpm=96;}
 setVolume(v){this.volume=v;if(this.bus&&this.ctx)this.bus.gain.setTargetAtTime(v,this.ctx.currentTime,.03);}
 stop(){this.token++;if(this.frame)cancelAnimationFrame(this.frame);if(this.bus&&this.ctx){const old=this.bus,nodes=this.nodes,comp=this.comp,t=this.ctx.currentTime;old.gain.cancelScheduledValues(t);old.gain.setValueAtTime(Math.max(.0001,old.gain.value),t);old.gain.exponentialRampToValueAtTime(.0001,t+.035);setTimeout(()=>{nodes.forEach(n=>{try{n.stop();n.disconnect();}catch{}});try{old.disconnect();comp?.disconnect();}catch{}},60);}this.bus=null;this.nodes=[];this.update(0,'idle');}
 async play(s,f){if(!this.enabled)return;this.stop();const token=++this.token;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unavailable');if(!this.ctx)this.ctx=new AC();await this.ctx.resume();if(token!==this.token)return;const bus=this.ctx.createGain(),comp=this.ctx.createDynamicsCompressor();bus.gain.value=this.volume;comp.threshold.value=-14;comp.ratio.value=4;bus.connect(comp);comp.connect(this.ctx.destination);this.bus=bus;this.comp=comp;const start=this.ctx.currentTime+.04,run=schedule(this.ctx,bus,s,f,start,this.options);this.nodes=run.nodes;this.duration=run.duration;this.bpm=run.info.bpm;this.beatsPerBar=run.info.beatsPerBar;const tick=()=>{if(token!==this.token)return;const time=Math.max(0,this.ctx.currentTime-start);this.update(Math.min(this.duration,time),time>=this.duration?'finished':'playing');if(time<this.duration)this.frame=requestAnimationFrame(tick);else{bus.disconnect();comp.disconnect();this.bus=null;this.nodes=[];}};tick();}catch(err){this.update(0,'error',err.message);}}
}
globalThis.ScaleStreetAudio={Player,events,harmonyEvents,schedule,PROFILES,STYLES,describe};
})();
