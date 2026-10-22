'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Original two-bar genre studies. Indices are 16th-note positions, not samples.
const genres=[
{name:'Techno',bpm:132,swing:0,k:[0,4,8,12,16,20,24,28],s:[4,12,20,28,31],h:[2,6,10,14,18,22,26,30],f:[3,11,19,27,30],tone:.75,decay:.7},
{name:'Trance',bpm:138,swing:0,k:[0,4,8,12,16,20,24,28],s:[4,12,20,28,30,31],h:[2,6,10,14,18,22,26,29,30,31],f:[7,15,23,27,29,31],tone:.83,decay:.8},
{name:'House',bpm:124,swing:8,k:[0,4,8,12,16,20,24,28],s:[4,12,20,28],h:[2,6,10,14,18,22,26,30],f:[3,7,11,15,19,23,27,31],tone:.65,decay:.65},
{name:'UKG',bpm:132,swing:36,k:[0,6,10,16,19,26],s:[4,12,20,28,31],h:[0,2,5,7,10,13,14,16,18,21,23,26,29,30],f:[3,11,15,19,25,31],tone:.7,decay:.45},
{name:'Grime',bpm:140,swing:10,k:[0,7,10,16,22,27],s:[8,24,30],h:[0,4,6,10,12,14,16,20,22,26,28,31],f:[3,14,19,23,29],tone:.5,decay:.6},
{name:'Trip-Hop',bpm:88,swing:30,k:[0,6,11,16,22,27],s:[4,12,20,28],h:[0,2,4,6,8,10,12,15,16,18,20,22,24,26,28,30],f:[7,15,23,29],tone:.24,decay:.95},
{name:'Hip-Hop',bpm:92,swing:32,k:[0,3,6,10,16,19,22,26,30],s:[4,12,20,28],h:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30],f:[7,11,23,27,31],tone:.4,decay:.7},
{name:'Trap',bpm:144,swing:4,k:[0,7,11,16,22,27,30],s:[8,24],h:[0,2,4,6,7,8,10,12,14,15,16,18,20,22,23,24,26,28,29,30,31],f:[6,14,22,30,31],tone:.74,decay:1.2},
{name:'IDM',bpm:138,swing:12,k:[0,3,9,14,16,21,26,29],s:[5,12,18,23,28,31],h:[0,1,4,6,9,11,13,15,17,20,22,25,27,29,31],f:[2,7,10,15,19,22,25,30],tone:.92,decay:.4},
{name:'Breaks',bpm:134,swing:16,k:[0,6,10,16,19,26,30],s:[4,12,20,27,28,31],h:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30],f:[3,7,15,19,23,30],tone:.65,decay:.75},
{name:'DnB',bpm:174,swing:0,k:[0,10,16,22,26],s:[4,12,20,28,31],h:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30],f:[7,11,15,23,27,30],tone:.82,decay:.4},
{name:'Glitch-Hop',bpm:110,swing:26,k:[0,3,10,16,19,26,30],s:[4,12,20,28,31],h:[0,2,6,7,10,14,16,18,22,23,26,29,30],f:[1,7,11,14,17,21,25,29,31],tone:.95,decay:.5}
];
const trackNames=['KICK','SNARE','HI-HAT','FX'], trackShort=['KK','SN','HH','FX'];
const symbols=[
'<circle cx="40" cy="40" r="27"/><circle cx="40" cy="40" r="14"/><circle cx="40" cy="40" r="3"/>',
'<path d="M12 58L40 10L68 58ZM20 65H60M25 51L40 26L55 51Z"/>',
'<path d="M13 36L40 12L67 36V66H13ZM27 66V43H53V66M13 36H67"/>',
'<path d="M12 24H49V12L69 32L49 52V40H12ZM68 58H31V70L11 50"/>',
'<path d="M12 15H30V33H49V15H67V66H49V49H30V66H12Z"/>',
'<path d="M8 45C16 15 25 15 33 45S50 75 58 45S68 20 74 35M8 32C16 2 25 2 33 32S50 62 58 32"/>',
'<circle cx="40" cy="40" r="27"/><path d="M15 40H65M40 13V67M23 22L57 58M23 58L57 22"/>',
'<path d="M12 62L40 14L68 62ZM25 62L40 36L55 62M27 38H53"/>',
'<path d="M10 23L31 11L52 23L31 35ZM31 35V59L10 47V23M31 35L52 23V47L31 59M52 35L71 46V67L52 56V35M31 59L52 47"/>',
'<path d="M10 55L25 26L39 55L54 26L70 55M10 66L25 37L39 66L54 37L70 66"/>',
'<path d="M10 14V66H28V14ZM35 14V66H52V14ZM59 14V66H70V14Z"/>',
'<path d="M11 15H37V28H52V15H68V42H53V66H29V53H11ZM29 28V42H41V28Z"/>'
];
let linked=false,spinning=false,firstLocked=false,session=1,barPage=0,bpm=124,engine='auto',playing=false;
let params={swing:8,tone:58,decay:42,volume:65};
let tracks=Array.from({length:4},(_,i)=>({genre:2,pattern:[],mute:false,pos:2,phase:'idle',speed:0,stopStart:0,stopFrom:0,stopTarget:0,target:2,requested:false}));
function makePattern(gi,ti){const g=genres[gi], hits=g[['k','s','h','f'][ti]];return Array.from({length:32},(_,s)=>hits.includes(s)?(ti===2?(s%4===0?.72:s%2===0?1:.5):(ti===1&&s%8!==4&&gi!==7&&gi!==4?.5:1)):0)}
tracks.forEach((t,i)=>{t.pattern=makePattern(t.genre,i);t.sound={...DRUM_KITS[t.genre][i]}});
function reelCard(gi){const g=genres[(gi%12+12)%12];return `<svg viewBox="0 0 80 80" aria-hidden="true">${symbols[(gi%12+12)%12]}</svg><strong>${g.name}</strong><small>${g.bpm} BPM</small>`}
$('#reels').innerHTML=tracks.map((t,i)=>`<div class="reel-window" id="reel-${i}" style="--track:var(--c${i})"><div class="reel-strip"><div class="reel-cell"></div><div class="reel-cell"></div><div class="reel-cell"></div></div></div>`).join('');
$('#stops').innerHTML=tracks.map((t,i)=>`<button class="stop-key" id="stop-${i}" style="--track:var(--c${i})" disabled aria-label="停止 ${trackNames[i]} 转盘"><span>■</span><b>STOP</b></button>`).join('');
function drawReel(i){const t=tracks[i],base=Math.floor(t.pos),fraction=t.pos-base;const strip=$(`#reel-${i} .reel-strip`);strip.style.transform=`translateY(${-fraction*100}%)`;[...strip.children].forEach((el,j)=>{const g=(base+j-1)%12;if(el.dataset.genre!==String(g)){el.innerHTML=reelCard(g);el.dataset.genre=g}})}
tracks.forEach((t,i)=>drawReel(i));
function renderGrid(){
$('#sequencer').innerHTML=tracks.map((t,i)=>`<div class="seq-row ${t.mute?'muted':''}" style="--track:var(--c${i})"><button class="track-mute" data-mute="${i}" aria-label="静音 ${trackNames[i]}" aria-pressed="${t.mute}">${trackShort[i]}</button>${t.pattern.slice(barPage*16,barPage*16+16).map((v,s)=>`<button class="step ${v?'on':''} ${v&&v<.7?'ghost':''}" data-track="${i}" data-step="${s+barPage*16}" aria-label="${trackNames[i]} 第 ${s+barPage*16+1} 步" aria-pressed="${!!v}"></button>`).join('')}</div>`).join('');
}
renderGrid();
$('#sequencer').addEventListener('click',e=>{const mute=e.target.closest('[data-mute]'),step=e.target.closest('.step');if(mute){const t=tracks[+mute.dataset.mute];t.mute=!t.mute;renderGrid()}if(step){const t=tracks[+step.dataset.track],s=+step.dataset.step;t.pattern[s]=t.pattern[s]?0:1;renderGrid()}});
$$('[data-bar]').forEach(b=>b.onclick=()=>{barPage=+b.dataset.bar;$$('[data-bar]').forEach(x=>x.classList.toggle('active',x===b));renderGrid()});
$$('[data-theme-choice]').forEach(b=>b.onclick=()=>{document.body.dataset.theme=b.dataset.themeChoice;$$('[data-theme-choice]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)})});
$$('[data-engine]').forEach(b=>b.onclick=()=>{engine=b.dataset.engine;$$('[data-engine]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)})});
Object.keys(params).forEach(p=>$('#'+p).oninput=e=>{params[p]=+e.target.value;$('#'+p+'-val').value=params[p]+'%';if(p==='tone'&&audio)tracks.forEach((_,i)=>voiceBus(i));if(p==='volume'&&master)master.gain.setTargetAtTime(params.volume/100*.75,audio.currentTime,.02)});
$('#link').onclick=()=>{if(spinning)return;linked=!linked;$('#link').setAttribute('aria-pressed',linked);$('#link-text').textContent=linked?'同风格联动':'自由组合';$('#status').textContent=linked?'LINK 已开启，下一次四轨将落在同一种风格。':'LINK 已关闭，下一次四轨将自由组合。'};
function setTempo(gi){bpm=genres[gi].bpm;$('#bpm-display').textContent=bpm;$('#bpm-source').textContent=genres[gi].name.toUpperCase();params.swing=genres[gi].swing;$('#swing').value=params.swing;$('#swing-val').value=params.swing+'%'}
async function spin(){if(spinning)return;try{await ensureAudio();}catch(e){showAudioError();return}if(spinning)return;
spinning=true;firstLocked=false;session++;$('#session-id').textContent=String(session).padStart(3,'0');$('#scene-state').textContent='SPINNING';$('#lock-count').textContent='00';$('#link').disabled=true;$('#lever').disabled=true;$('#lever').classList.remove('pulled');void $('#lever').offsetWidth;$('#lever').classList.add('pulled');window.cabinetPull?.();
const target=Math.floor(Math.random()*12), linkedPos=tracks[0].pos;tracks.forEach((t,i)=>{t.phase='spinning';if(linked)t.pos=linkedPos;t.requested=false;t.target=linked?target:Math.floor(Math.random()*12);t.speed=0;$(`#reel-${i}`).className='reel-window spinning';$(`#stop-${i}`).disabled=false;$(`#stop-${i} b`).textContent='STOP'});$('#status').textContent='转盘旋转中 · 按下 1—4 或四枚按键，逐轨锁定。';if(!playing)startPlayback();}
function stopTrack(i){const t=tracks[i];if(!spinning||t.requested)return;t.requested=true;
if(!firstLocked){firstLocked=true;setTempo(t.target)}
t.phase='stopping';t.stopStart=performance.now();t.stopFrom=t.pos;t.stopTarget=(Math.floor(t.pos/12)+1)*12+t.target;if(t.stopTarget-t.pos<4)t.stopTarget+=12;
$(`#reel-${i}`).className='reel-window stopping';$(`#stop-${i}`).disabled=true;$(`#stop-${i} b`).textContent='LOCK';
const count=tracks.filter(t=>t.requested).length;$('#lock-count').textContent=String(count).padStart(2,'0');$('#status').textContent=`${trackNames[i]} → ${genres[t.target].name} · ${count}/4 已锁定 · ${bpm} BPM`;
}
function finishTrack(i){const t=tracks[i];t.phase='idle';t.pos=t.stopTarget;t.genre=t.target;t.pattern=makePattern(t.genre,i);t.sound={...DRUM_KITS[t.genre][i]};renderVoice(i,true);$(`#reel-${i}`).className='reel-window locked';drawReel(i);renderGrid();if(tracks.every(t=>t.phase==='idle')){spinning=false;$('#link').disabled=false;$('#lever').disabled=false;$('#scene-state').textContent='LOCKED';$('#status').textContent=linked?`${genres[tracks[0].genre].name} · 四轨联动完成 · ${bpm} BPM`:`${tracks.map(t=>genres[t.genre].name).join(' × ')} · ${bpm} BPM`;}}
$('#lever').onclick=spin;tracks.forEach((_,i)=>$(`#stop-${i}`).onclick=()=>stopTrack(i));
let lastFrame=performance.now();function animate(now){const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;tracks.forEach((t,i)=>{if(t.phase==='spinning'){t.speed+=((linked?16:15+i*.8)-t.speed)*dt*3;t.pos+=t.speed*dt;drawReel(i)}else if(t.phase==='stopping'){const p=Math.min((now-t.stopStart)/1050,1);const ease=1-Math.pow(1-p,4);const settle=Math.sin(p*Math.PI*3)*Math.sin(p*Math.PI)*.12;t.pos=t.stopFrom+(t.stopTarget-t.stopFrom)*ease+settle;drawReel(i);if(p===1)finishTrack(i)}});updatePlayhead();requestAnimationFrame(animate)}requestAnimationFrame(animate);
// Web Audio: sample-accurate look-ahead scheduler, VA/FM percussion, no audio assets.
let audio,master,compressor,noiseBuffer,hatNodes=[],timer,nextTime=0,nextStep=0,visualQueue=[],currentStep=-1,runId=0;
async function ensureAudio(){if(!audio){const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)throw Error('Web Audio unavailable');audio=new AudioCtor();master=audio.createGain();master.gain.value=params.volume/100*.75;compressor=audio.createDynamicsCompressor();compressor.threshold.value=-16;compressor.knee.value=14;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.15;master.connect(compressor).connect(audio.destination);noiseBuffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1}if(audio.state!=='running')await audio.resume();if(audio.state!=='running')throw Error('Audio suspended')}
function outputGain(t,amp,duration,dest){const g=audio.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,amp),t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+duration);g.connect(dest||master);return g}
function oscillator(t,freq,end,amp,duration,type='sine',dest){const o=audio.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+Math.min(duration,.13));const g=outputGain(t,amp,duration,dest);o.connect(g);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};return o}
function noise(t,amp,duration,freq,type='highpass'){const n=audio.createBufferSource();n.buffer=noiseBuffer;const f=audio.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=.6;const g=outputGain(t,amp,duration);n.connect(f).connect(g);n.start(t,Math.random()*.5);n.stop(t+duration+.02);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect()};return g}
function fmVoice(t,freq,ratio,index,amp,duration){const carrier=audio.createOscillator(),mod=audio.createOscillator(),modGain=audio.createGain();carrier.frequency.value=freq;mod.frequency.value=freq*ratio;modGain.gain.setValueAtTime(index*freq,t);modGain.gain.exponentialRampToValueAtTime(.01,t+duration);const g=outputGain(t,amp,duration);mod.connect(modGain).connect(carrier.frequency);carrier.connect(g);carrier.start(t);mod.start(t);carrier.stop(t+duration+.02);mod.stop(t+duration+.02);carrier.onended=()=>{carrier.disconnect();mod.disconnect();modGain.disconnect();g.disconnect()}}
// Each voice owns a persistent mixer channel. Genre presets load all parameters.
let voiceBuses=[];
function driveCurve(amount,crush=false){const k=amount/100*90,n=2048,a=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/(n-1)-1;let v=(1+k)*x/(1+k*Math.abs(x));if(crush){const levels=64-Math.round(amount/100*50);v=Math.round(v*levels)/levels}a[i]=v}return a}
function voiceBus(i){if(!voiceBuses[i]){const filter=audio.createBiquadFilter(),drive=audio.createWaveShaper(),gain=audio.createGain(),pan=audio.createStereoPanner();filter.type='lowpass';drive.oversample='2x';filter.connect(drive).connect(gain).connect(pan).connect(master);voiceBuses[i]={filter,drive,gain,pan,signature:''}}const b=voiceBuses[i],v=tracks[i].sound;const sig=[v.color,v.drive,v.level,v.pan,v.model,params.tone].join(',');if(b.signature!==sig){b.signature=sig;b.filter.frequency.setTargetAtTime(Math.min(18000,700+Math.pow(v.color/100,1.1)*15000)*(.6+params.tone/100*.7),audio.currentTime,.02);b.filter.Q.value=.45;b.drive.curve=driveCurve(v.drive,v.model==='glitch'||v.model==='digital');b.gain.gain.setTargetAtTime(v.level/100/(1+v.drive/100*.9),audio.currentTime,.02);b.pan.pan.setTargetAtTime(v.pan/100,audio.currentTime,.02)}return b.filter}
function voiceNoise(time,amp,duration,freq,type,dest,q=.65){const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=outputGain(time,amp,Math.max(.008,duration),dest);n.buffer=noiseBuffer;f.type=type;f.frequency.value=Math.max(30,Math.min(18000,freq));f.Q.value=q;n.connect(f).connect(g);n.start(time,Math.random()*.4);n.stop(time+duration+.025);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect()};return g}
function voiceFM(time,freq,ratio,index,amp,duration,dest,drop=1){const c=audio.createOscillator(),m=audio.createOscillator(),mg=audio.createGain();c.frequency.setValueAtTime(freq,time);c.frequency.exponentialRampToValueAtTime(Math.max(15,freq*drop),time+Math.min(.16,duration));m.frequency.value=freq*ratio;mg.gain.setValueAtTime(Math.max(.01,index*freq),time);mg.gain.exponentialRampToValueAtTime(.01,time+duration);const g=outputGain(time,amp,duration,dest);m.connect(mg).connect(c.frequency);c.connect(g);m.start(time);c.start(time);m.stop(time+duration+.025);c.stop(time+duration+.025);c.onended=()=>{c.disconnect();m.disconnect();mg.disconnect();g.disconnect()}}
function hit(ti,time,velocity,step){const tr=tracks[ti];if(tr.mute)return;const v=tr.sound,dest=voiceBus(ti),pitch=Math.pow(2,v.tune/12),dur=Math.max(.018,v.decay/1000*(.55+params.decay/100*1.05)),color=v.color/100,punch=v.punch/100,depth=v.fm/100,vel=velocity,model=v.model;
const mode=engine==='auto'?v.synth:engine;
const osc=(f,end,amp,d,type='sine',offset=0)=>oscillator(time+offset,f*pitch,end?end*pitch:0,amp*vel,d,type,dest);
const ns=(amp,d,f,type='highpass',offset=0,q=.65)=>voiceNoise(time+offset,amp*vel,d,f*pitch,type,dest,q);
const fm=(f,ratio,index,amp,d,drop=1,offset=0)=>voiceFM(time+offset,f*pitch,ratio,index,amp*vel,d,dest,drop);
if(ti===0){
 if(mode==='fm'||model==='fmKick'){fm(100+95*punch,1.5+depth,1+depth*8,.7,dur,.3);ns(.04*punch,.009,2300)}
 else if(model==='808'||model==='sub'){osc(105+120*punch,model==='sub'?43:49,.85,dur);osc(54,43,.13,dur*.7,model==='sub'?'triangle':'sine');ns(.08*punch,.008,2000);if(model==='sub')osc(85,43,.04,dur*.4,'square')}
 else if(model==='acoustic'){osc(135+80*punch,59,.7,dur*.8,'sine');osc(225,100,.11,dur*.25,'triangle');ns(.18*punch,.025+dur*.07,700+color*1500,'bandpass',0,1.2)}
 else{osc(155+150*punch,model==='punch'?54:51,.8,dur);osc(320,85,.09*punch,.035,'triangle');ns(.14*punch,.012,2600+color*2200,'highpass');if(model==='punch')osc(74,49,.16,dur*.45)}
 if(depth>0&&mode!=='fm')fm(62,1.2,depth*2.5,.07*depth,dur*.45,.8);
}
if(ti===1){
 if((model==='clap'||model==='rimclap')&&mode!=='fm'){[0,.011,.023,.037].forEach((off,j)=>ns((j===3?.29:.2)*(.5+punch*.6),j===3?dur:.015,900+color*1700,'bandpass',off,.7));if(model==='rimclap'){osc(440,310,.28*punch,.055,'triangle');osc(820,700,.1,.023,'sine')}}
 else if(mode==='fm'||model==='metalSnare'){fm(160+color*90,2.73,2+depth*11,.3,dur*.8,.8);ns(.3,dur,1600+color*3000,'highpass')}
 else{osc(model==='acoustic'?205:180,135,.23,dur*.65,'triangle');osc(model==='909'?345:320,250,.09,dur*.38);ns(.42*(.5+punch*.6),dur,model==='acoustic'?1400+color*1600:1700+color*3000,model==='acoustic'?'bandpass':'highpass',0,model==='acoustic'?.8:.5);if(model==='acoustic')ns(.12,.025,4200,'highpass')}
 if(depth>0&&mode!=='fm')fm(190,3.7,depth*7,.1*depth,dur*.55);
}
if(ti===2){
 const open=step%8===6&&[0,1,2].includes(tr.genre),d=open?dur*1.8:dur;
 hatNodes=hatNodes.filter(n=>n.end>time);if(!open)hatNodes.forEach(n=>{if(n.open&&n.end>time){n.g.gain.cancelScheduledValues(time);n.g.gain.setTargetAtTime(.0001,time,.006)}});
 const g=ns(model==='shaker'?.19:.12,d,model==='dust'?2600:4000+color*4500,model==='shaker'||model==='dust'?'bandpass':'highpass',0,model==='shaker'?1.6:.5);hatNodes.push({g,end:time+d,open});
 if(mode==='fm'||model==='digital')fm(1600+color*1600,1.414+depth*.2,2+depth*10,.045,d);
 else if(model==='metal')[211,317,421,499,631,799].forEach((f,j)=>osc(f*(1.5+color),0,.008*(1+punch),d*(j%2?.7:1),'square'));
 else if(model==='shaker'){ns(.08,d*.55,6700,'bandpass',d*.12,1.1)}
 if(depth>0&&mode!=='fm')fm(2100,1.47,depth*5,.018*depth,d*.65);
 if(tr.genre===7&&[7,15,23,31].includes(step)){const r=60/bpm/16;ns(.075,.023,8500,'highpass',r);ns(.05,.018,9500,'highpass',r*2)}
}
if(ti===3){
 if(mode==='fm'||model==='zap'||model==='glitch'){fm(model==='glitch'?880:480,model==='glitch'?3.17:1.47,1+depth*15,.2,dur,model==='zap'?.15:.6);if(model==='glitch'){fm(1430,2.17,6,.09,dur*.3,.3,.035);ns(.09,.02,5000,'bandpass',.018)}}
 else if(model==='cowbell'){osc(540,0,.11,dur,'square');osc(800,0,.08,dur*.75,'square')}
 else if(model==='conga'||model==='tom'){osc(model==='tom'?130:290,model==='tom'?70:175,.42,dur);osc(430,260,.06,dur*.35,'triangle');ns(.065*punch,.012,1000,'bandpass')}
 else if(model==='rim'){osc(470,360,.2,dur*.65,'triangle');osc(930,0,.08,dur*.3);ns(.08*punch,.009,2100,'bandpass')}
 else{osc(720,450,.22,dur*.55);osc(1250,850,.05,dur*.25,'triangle');ns(.1,dur*.35,1500+color*1800,'bandpass',0,2)}
 if(depth>0&&mode!=='fm')fm(420,2.3,depth*8,.08*depth,dur*.7);
}
}

function scheduler(){if(!playing||!audio)return;let iterations=0;if(nextTime<audio.currentTime-.2){nextTime=audio.currentTime+.025;visualQueue=[]}while(nextTime<audio.currentTime+.1&&iterations++<64){const interval=60/bpm/4;const time=nextTime+(nextStep%2?params.swing/100*interval*.5:0);tracks.forEach((t,i)=>{const velocity=t.pattern[nextStep];if(velocity)hit(i,time,velocity,nextStep)});visualQueue.push({step:nextStep,time,run:runId});nextStep=(nextStep+1)%32;nextTime+=interval}}
function startPlayback(){master.gain.setTargetAtTime(params.volume/100*.75,audio.currentTime,.02);playing=true;runId++;nextStep=0;nextTime=audio.currentTime+.035;visualQueue=[];timer=setInterval(scheduler,25);scheduler();document.body.classList.add('playing');$('#play-icon').textContent='Ⅱ';$('#play-label').textContent='PAUSE';$('#play').setAttribute('aria-label','暂停节奏');if(!spinning)$('#scene-state').textContent='PLAYING'}
function pausePlayback(){playing=false;clearInterval(timer);visualQueue=[];currentStep=-1;master.gain.cancelScheduledValues(audio.currentTime);master.gain.setTargetAtTime(.0001,audio.currentTime,.012);document.body.classList.remove('playing');$('#play-icon').textContent='▶';$('#play-label').textContent='PLAY';$('#play').setAttribute('aria-label','播放节奏');if(!spinning)$('#scene-state').textContent='PAUSED';$$('.step.current').forEach(s=>s.classList.remove('current'))}
function showAudioError(){$('#status').textContent='声音尚未启动，请再次点击播放或拉杆。'}
async function togglePlayback(){try{await ensureAudio();if(playing)pausePlayback();else{master.gain.setTargetAtTime(params.volume/100*.75,audio.currentTime,.02);startPlayback()}}catch(e){showAudioError()}}
$('#play').onclick=togglePlayback;
function updatePlayhead(){if(!playing||!audio)return;let changed=false;while(visualQueue.length&&visualQueue[0].time<=audio.currentTime){const e=visualQueue.shift();if(e.run===runId){currentStep=e.step;changed=true}}if(!changed)return;$('#position').textContent=`0${Math.floor(currentStep/16)+1} : ${String(currentStep%16+1).padStart(2,'0')}`;$$('.step').forEach(s=>s.classList.toggle('current',+s.dataset.step===currentStep));}
$('#about').onclick=()=>$('#about-dialog').showModal();$('#close-about').onclick=()=>$('#about-dialog').close();$('#about-dialog').addEventListener('click',e=>{if(e.target===$('#about-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
document.addEventListener('keydown',e=>{if(e.repeat||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('#about-dialog').open)return;if(e.code==='Space'){e.preventDefault();togglePlayback()}else if(e.key.toLowerCase()==='r')spin();else if(/^[1-4]$/.test(e.key))stopTrack(+e.key-1)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pausePlayback()});

function voiceValue(v,p){if(p.key==='pan')return v===0?'C':(v<0?'L ':'R ')+Math.abs(v);return (p.key==='tune'&&v>0?'+':'')+v+p.unit}
function renderVoice(i,flash=false){const t=tracks[i],v=t.sound;let card=document.getElementById('voice-'+i);if(!card){card=document.createElement('section');card.id='voice-'+i;document.getElementById('voice-cards').append(card)}card.className='voice-card'+(flash?' flash':'');card.style.setProperty('--track','var(--c'+i+')');card.innerHTML=`<div class="voice-card-head"><b>0${i+1} / ${trackNames[i]}</b><span>${genres[t.genre].name}</span></div><div class="voice-preset">${v.name}</div><small class="voice-family">${v.synth.toUpperCase()} · ${v.model.toUpperCase()} VOICE</small><div class="voice-sliders">${VOICE_PARAMS.map(p=>`<div class="voice-param"><label for="voice-${i}-${p.key}">${p.label}<output id="voice-value-${i}-${p.key}">${voiceValue(v[p.key],p)}</output></label><input id="voice-${i}-${p.key}" data-voice="${i}" data-param="${p.key}" type="range" min="${p.min}" max="${p.max}" step="${p.step||1}" value="${v[p.key]}" aria-label="${trackNames[i]} ${p.label}"></div>`).join('')}</div><div class="voice-card-bottom"><button data-preview-voice="${i}" aria-label="试听 ${trackNames[i]} 音色">▶ AUDITION</button><button data-reset-voice="${i}" aria-label="恢复 ${trackNames[i]} 风格音色">↺ RESET VOICE</button></div>`;if(audio)voiceBus(i)}
tracks.forEach((_,i)=>renderVoice(i));
$('#voice-cards').addEventListener('input',e=>{const el=e.target;if(!el.dataset.param)return;const i=+el.dataset.voice,p=VOICE_PARAMS.find(p=>p.key===el.dataset.param);tracks[i].sound[p.key]=+el.value;$('#voice-value-'+i+'-'+p.key).value=voiceValue(+el.value,p);if(audio)voiceBus(i)});
$('#voice-cards').addEventListener('click',async e=>{const preview=e.target.closest('[data-preview-voice]'),reset=e.target.closest('[data-reset-voice]');if(reset){const i=+reset.dataset.resetVoice;tracks[i].sound={...DRUM_KITS[tracks[i].genre][i]};renderVoice(i,true)}if(preview){try{await ensureAudio();master.gain.setTargetAtTime(params.volume/100*.75,audio.currentTime,.01);const i=+preview.dataset.previewVoice,muted=tracks[i].mute;tracks[i].mute=false;hit(i,audio.currentTime+.025,1,0);tracks[i].mute=muted}catch(e){showAudioError()}}});
