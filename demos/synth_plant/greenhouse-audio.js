/* Short, local Web Audio timbre sketches. Audio starts only after a user gesture. */
(()=>{'use strict';
let context,master,reverb,send,active=[],generation=0;
function setup(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;if(context)return true;context=new AC();master=context.createGain();master.gain.value=.2;const compressor=context.createDynamicsCompressor();compressor.threshold.value=-16;compressor.ratio.value=5;master.connect(compressor);compressor.connect(context.destination);reverb=context.createConvolver();const buffer=context.createBuffer(2,Math.floor(context.sampleRate*1.5),context.sampleRate);let seed=107;for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/1073741823.5-1)*Math.pow(1-i/data.length,2.6)*.5;}}reverb.buffer=buffer;send=context.createGain();send.gain.value=.2;send.connect(reverb);reverb.connect(master);return true;}
function track(node){active.push(node);return node;}
function stop(){generation++;if(context){const time=context.currentTime;master.gain.setTargetAtTime(0,time,.02);for(const node of active){try{if(node.gain){node.gain.cancelScheduledValues(time);node.gain.setTargetAtTime(0,time,.018);}if(node.stop)node.stop(time+.07);}catch{}}}const old=active;active=[];setTimeout(()=>old.forEach(node=>{try{node.disconnect();}catch{}}),130);}
function envelope(start,attack,hold,release,level){const gain=track(context.createGain()),end=start+attack+hold+release;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+attack);gain.gain.setValueAtTime(level,start+attack+hold);gain.gain.exponentialRampToValueAtTime(.0001,end);gain.gain.setValueAtTime(0,end+.01);gain.connect(master);gain.connect(send);return {gain,end};}
function osc(type,freq,start,end,destination,detune=0){const node=track(context.createOscillator());node.type=type;node.frequency.setValueAtTime(freq,start);node.detune.value=detune;node.connect(destination);node.start(start);node.stop(end+.03);return node;}
function filter(kind,frequency,q,destination){const f=track(context.createBiquadFilter());f.type=kind;f.frequency.value=frequency;f.Q.value=q;f.connect(destination);return f;}
function noise(start,end,destination){const n=Math.ceil(context.sampleRate*.2),buffer=context.createBuffer(1,n,context.sampleRate),data=buffer.getChannelData(0);let seed=179;for(let i=0;i<n;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741823.5-1;}const node=track(context.createBufferSource());node.buffer=buffer;node.loop=true;node.connect(destination);node.start(start);node.stop(end);}
function note(index,midi,start){const freq=440*Math.pow(2,(midi-69)/12);let e,f;
 switch(index){
 case 0:e=envelope(start,.006,.02,.55,.26);osc('sine',freq,start,e.end,e.gain);f=track(context.createGain());f.gain.value=.17;f.connect(e.gain);osc('sine',freq*3.99,start,e.end,f);break;
 case 1:e=envelope(start,.22,.24,1.15,.11);f=filter('lowpass',1700,.5,e.gain);[-7,0,7].forEach(d=>osc('triangle',freq,start,e.end,f,d));break;
 case 2:e=envelope(start,.015,.13,.3,.19);f=filter('lowpass',380,1.2,e.gain);osc('sawtooth',freq/2,start,e.end,f);osc('sine',freq/4,start,e.end,e.gain);break;
 case 3:e=envelope(start,.025,.14,.22,.13);f=filter('lowpass',2400,2,e.gain);osc('sawtooth',freq,start,e.end,f);osc('triangle',freq,start,e.end,f,5);break;
 case 4:e=envelope(start,.02,.04,.4,.15);f=filter('bandpass',freq*5,4,e.gain);noise(start,e.end,f);osc('sine',freq,start,e.end,e.gain);break;
 case 5:e=envelope(start,.14,.23,.75,.065);[650,1150,2350].forEach((formant,i)=>{f=filter('bandpass',formant,5+i,e.gain);osc('sawtooth',freq,start,e.end,f,i*3-3);});break;
 case 6:e=envelope(start,.002,.005,.55,.14);f=filter('highpass',1700,.6,e.gain);noise(start,e.end,f);const strike=osc('sine',freq*2,start,e.end,e.gain);strike.frequency.exponentialRampToValueAtTime(freq,start+.12);break;
 case 7:e=envelope(start,.003,.055,.1,.12);f=filter('lowpass',1400,1,e.gain);osc('square',freq,start,e.end,f);break;
 case 8:e=envelope(start,.005,.025,.85,.17);const carrier=osc('sine',freq,start,e.end,e.gain),depth=track(context.createGain());depth.gain.setValueAtTime(freq*1.1,start);depth.gain.exponentialRampToValueAtTime(.1,e.end);depth.connect(carrier.frequency);osc('sine',freq*2.01,start,e.end,depth);break;
 default:e=envelope(start,.28,.3,1.45,.1);[-5,5].forEach(d=>osc('sine',freq,start,e.end,e.gain,d));f=track(context.createGain());f.gain.value=.18;f.connect(e.gain);osc('sine',freq*2,start,e.end,f);
 }
}
async function play(index,volume=.22){stop();const id=generation;if(!volume||!setup())return;try{await context.resume();}catch{return;}if(id!==generation)return;master.gain.setTargetAtTime(Math.max(0,Math.min(.5,volume)),context.currentTime,.02);send.gain.value=[.13,.35,.04,.12,.22,.4,.16,.05,.3,.55][index]||.15;const notes=[60,67,69,64,67,72,69,67],step=[.27,.4,.3,.26,.3,.38,.25,.25,.33,.43][index]||.3,base=context.currentTime+.025;notes.forEach((m,i)=>note(index,m+(index===6?7:0),base+i*step));}
window.GreenhouseVoice={play,stop};window.addEventListener('pagehide',stop);
})();
