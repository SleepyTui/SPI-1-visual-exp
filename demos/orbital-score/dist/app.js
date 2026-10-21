/* Orbital: deterministic graphic notation + native Web Audio. No network dependencies. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const E=window.OrbitalEffects;
const STORE = 'orbital-score-v1';
const defaults = { seed:731842, layout:0, shape:'mixed', motion:'orbit', count:48, size:100, variation:72, speed:60, spread:88, theme:'paper', background:'#eeeade', ink:'#343a35', accent:'#b9563b', secondary:'#7c8a75', glow:12, opacity:85, trails:25, guides:true, stars:true, annotations:true, engine:'fm', timbre:'glass', scale:'pentatonic', modulation:36, decay:180, cutoff:4200, reverb:35, delay:20, bpm:84, volume:65, scan:'radial', mode:'loop', guideWidth:.8, shapeWidth:1.1, drawMode:'both', guideOpacity:27, scanOpacity:65, scanWidth:1.3, scanStyle:'beam', scanDetail:14, scanAmplitude:7, materials:E.defaults(), enabledVariants:Object.fromEntries(['mixed','circles','geometry','notes','staff','graphic'].map(k=>[k,Array.from({length:12},(_,i)=>i)])) };
const palettes = {
 paper:{background:'#eeeade',ink:'#343a35',accent:'#b9563b',secondary:'#7c8a75',glow:12},
 midnight:{background:'#111b22',ink:'#c9d5c7',accent:'#db9a62',secondary:'#6f9ca0',glow:48},
 blueprint:{background:'#1b394b',ink:'#c8e1dc',accent:'#efb66e',secondary:'#6eacb5',glow:22},
 rose:{background:'#e8d8cd',ink:'#51454e',accent:'#a44845',secondary:'#938175',glow:18}
};
const layouts = [
 {name:'Solar system',cn:'太阳星系',icon:'<ellipse cx="28" cy="21" rx="23" ry="16"/><ellipse cx="28" cy="21" rx="15" ry="10"/><ellipse cx="28" cy="21" rx="7" ry="5"/><circle cx="28" cy="21" r="2" fill="currentColor"/><circle cx="43" cy="21" r="2" fill="currentColor"/><circle cx="12" cy="9" r="1.5" fill="currentColor"/>'},
 {name:'Spiral galaxy',cn:'螺旋星系',icon:'<path d="M29 20c-1-5-9-3-9 3 0 8 17 9 20-1C45 5 17 0 9 15c-8 16 20 29 34 16"/><path d="M29 20c1 5 9 3 9-3C38 9 21 8 18 18c-5 17 23 22 31 7"/>'},
 {name:'Binary stars',cn:'双星系统',icon:'<ellipse cx="20" cy="23" rx="15" ry="10" transform="rotate(-30 20 23)"/><ellipse cx="37" cy="17" rx="15" ry="10" transform="rotate(-30 37 17)"/><circle cx="20" cy="23" r="3" fill="currentColor"/><circle cx="37" cy="17" r="2" fill="currentColor"/>'},
 {name:'Elliptical',cn:'椭圆星系',icon:'<g transform="rotate(-30 28 21)"><ellipse cx="28" cy="21" rx="25" ry="11"/><ellipse cx="28" cy="21" rx="18" ry="7"/><ellipse cx="28" cy="21" rx="10" ry="4"/><circle cx="28" cy="21" r="1.6" fill="currentColor"/></g>'},
 {name:'Star clusters',cn:'星团',icon:'<g fill="currentColor" stroke="none"><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="1.2"/><circle cx="21" cy="19" r="1.5"/><circle cx="17" cy="25" r="1"/><circle cx="36" cy="22" r="2.4"/><circle cx="43" cy="17" r="1"/><circle cx="40" cy="30" r="1.6"/><circle cx="29" cy="28" r="1"/><circle cx="35" cy="11" r="1.4"/></g><circle cx="16" cy="17" r="11" stroke-dasharray="1 4"/><circle cx="37" cy="25" r="11" stroke-dasharray="1 4"/>'},
 {name:'Nebula',cn:'弥散星云',icon:'<path d="M9 24c-8-8 5-19 14-13 4-13 23-7 20 3 17 3 8 23-2 18-9 11-22 4-22-3-5 3-9 0-10-5Z" stroke-dasharray="1 3"/><path d="M16 21c-2-9 15-13 20-3 10 5-6 15-13 8Z"/><circle cx="27" cy="21" r="2" fill="currentColor"/>'},
 {name:'Stellar score',cn:'星际五线谱',icon:'<path d="M4 10c15 12 30-10 48 0M4 15c15 12 30-10 48 0M4 20c15 12 30-10 48 0M4 25c15 12 30-10 48 0M4 30c15 12 30-10 48 0"/><ellipse cx="17" cy="19" rx="3" ry="2" fill="currentColor"/><path d="M20 19V6"/><circle cx="39" cy="25" r="2" fill="currentColor"/>'},
 {name:'Constellation',cn:'星座连线',icon:'<path d="m8 28 12-18 12 19 15-15M20 10l27 4M8 28l24 1"/><g fill="currentColor"><circle cx="8" cy="28" r="2"/><circle cx="20" cy="10" r="2.5"/><circle cx="32" cy="29" r="2"/><circle cx="47" cy="14" r="1.5"/></g>'}
];
const forms = [{id:'mixed',icon:'◦ ◇',name:'Mixed / 混合'},{id:'circles',icon:'◯',name:'Circles / 圆圈'},{id:'geometry',icon:'△',name:'Geometry / 几何'},{id:'notes',icon:'♪',name:'Notes / 音符'},{id:'staff',icon:'≋',name:'Staves / 五线谱'},{id:'graphic',icon:'⌁',name:'Graphic / 图形'}];
const motions = [{id:'orbit',icon:'◎',name:'Orbit / 公转'},{id:'drift',icon:'⤳',name:'Drift / 漂浮'},{id:'breathe',icon:'◌',name:'Breathe / 呼吸'},{id:'vortex',icon:'꩜',name:'Vortex / 涡旋'}];
const numericKeys = Object.keys(defaults).filter(k => typeof defaults[k] === 'number');
const ranges = {seed:[1,999999],layout:[0,7],count:[12,120],size:[40,180],variation:[0,100],speed:[0,200],spread:[35,100],glow:[0,100],opacity:[10,100],trails:[0,100],modulation:[0,100],decay:[20,500],cutoff:[300,12000],reverb:[0,90],delay:[0,70],bpm:[30,200],volume:[0,100],guideWidth:[.2,6],shapeWidth:[.3,8],guideOpacity:[0,100],scanOpacity:[0,100],scanWidth:[.3,12],scanDetail:[4,40],scanAmplitude:[0,30]};
const enums = {shape:forms.map(f=>f.id),motion:motions.map(m=>m.id),theme:Object.keys(palettes),engine:['fm','va'],timbre:['glass','bell','warm','deep'],scale:['pentatonic','major','chromatic'],scan:['radial','left','right','angular'],mode:['loop','once','random'],drawMode:['outline','fill','both'],scanStyle:E.scanStyles.map(s=>s.id)};
let state = structuredClone(defaults);
let offsets = {};
function validate(raw) {
 if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('无效的参数文件');
 const clean = structuredClone(defaults);
 for (const key of Object.keys(defaults)) {
  if (!(key in raw)) continue;
  const v = raw[key];
  if(key==='materials'){clean.materials=E.validate(v);}
  else if(key==='enabledVariants'){
   if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('无效形状选择');
   for(const family of Object.keys(defaults.enabledVariants)){const values=v[family];if(values===undefined)continue;if(!Array.isArray(values)||!values.length||values.length>12||values.some(i=>!Number.isInteger(i)||i<0||i>11))throw new Error('无效形状选择：'+family);clean.enabledVariants[family]=[...new Set(values)];}
  }
  else if (numericKeys.includes(key)) { if (typeof v !== 'number' || !Number.isFinite(v) || v < ranges[key][0] || v > ranges[key][1]) throw new Error('参数超出范围：'+key); clean[key] = ['seed','layout','count'].includes(key)?Math.round(v):v; }
  else if (enums[key]) { if (!enums[key].includes(v)) throw new Error('无效参数：'+key); clean[key]=v; }
  else if (typeof defaults[key] === 'boolean') { if (typeof v !== 'boolean') throw new Error('无效参数：'+key); clean[key]=v; }
  else { if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) throw new Error('无效颜色'); clean[key]=v; }
 }
 if(!raw.materials&&typeof raw.glow==='number')clean.materials.notes.outerStrength=clean.glow;else clean.glow=clean.materials.notes.outerStrength;
 return clean;
}
function validateOffsets(raw) {
 const clean={};
 if(raw && typeof raw==='object' && !Array.isArray(raw)) for(const [key,v] of Object.entries(raw)) {
  if (/^\d{1,3}$/.test(key) && +key<120 && v && Number.isFinite(v.x) && Number.isFinite(v.y)) clean[key]={x:clamp(v.x,-700,700),y:clamp(v.y,-700,700)};
 }
 return clean;
}
try { const data = JSON.parse(localStorage.getItem(STORE)); if (data) { state=validate(data.settings);offsets=validateOffsets(data.offsets); } } catch { /* A fresh score is safe when browser storage is unavailable. */ }
function persist(){try{localStorage.setItem(STORE,JSON.stringify({settings:state,offsets}));}catch{/* Private browser storage may be unavailable. */}}
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let random=rng(state.seed);
let notes=[],dust=[],time=0,fxTime=0,lastTriggered=null,visualRunning=!matchMedia('(prefers-reduced-motion: reduce)').matches;
let playing=false,phase=0,elapsed=0,cycle=0,triggered=new Set(),randomClock=0,randomQueue=[];
let lastFrame=performance.now(),lastTrail=0,hover=null,drag=null,dragMoved=false,tab='compose',toastTimer;
const canvas=$('score');let ctx=canvas.getContext('2d');const mainCtx=ctx,compositor=new E.Compositor();
let pixelSize=1000;
let transition=null,view=structuredClone(state),guidePaths=[];
const G=window.OrbitalGlyphs;
const blendKeys=['size','variation','speed','spread','guideWidth','shapeWidth','glow','opacity','trails','bpm','modulation','decay','cutoff','reverb','delay','guideOpacity','scanOpacity','scanWidth','scanDetail','scanAmplitude'];
const colorKeys=['background','ink','accent','secondary'];
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*t*(t*(t*6-15)+10);
function mixColor(a,b,t){return '#'+[1,3,5].map(i=>Math.round(lerp(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');}
function advanceVisual(now){
 view={...state};
 if(transition){const t=clamp((now-transition.start)/transition.duration,0,1);transition.e=ease(t);view.materials=E.interpolate(transition.view.materials,state.materials,transition.e);for(const key of blendKeys)view[key]=lerp(transition.view[key],state[key],transition.e);for(const key of colorKeys)view[key]=mixColor(transition.view[key],state[key],transition.e);if(t>=1){transition=null;$('transitionBadge').hidden=true;}}
}
function glyphFor(n){const selected=state.enabledVariants[state.shape];return{family:state.shape,variant:selected[n.id%selected.length],mode:state.drawMode,alpha:1};}
function glyphLayers(n){const target=glyphFor(n);if(!transition)return[target];const old=transition.nodes.get(n.id),e=transition.e;return[...(old?old.layers:[]).map(l=>({...l,alpha:l.alpha*(1-e)})),{...target,alpha:e}].filter(l=>l.alpha>.001);}
function beginScene(mutate,duration=1800){
 advanceVisual(performance.now());const snapshot=new Map(notes.map(n=>[n.id,{p:position(n),r:radius(n),color:color(n),rotation:n.rotation,layers:glyphLayers(n)}]));const paths=currentGuides(),centers=centerState();const oldView=structuredClone(view),oldSeed=state.seed,oldLayout=state.layout;mutate();generate(state.seed!==oldSeed||state.layout!==oldLayout);transition={start:performance.now(),duration,e:0,nodes:snapshot,paths,centers,view:oldView};view=oldView;$('transitionBadge').hidden=false;$('transitionLabel').textContent=duration===5000?'RANDOM UNIVERSE · 5 SECOND MORPH':'MORPHING UNIVERSE';syncUI();persist();
}
function resize(){const size=Math.max(1,Math.round(canvas.getBoundingClientRect().width*Math.min(devicePixelRatio||1,2)));if(size!==canvas.width){canvas.width=canvas.height=size;pixelSize=size;}}
new ResizeObserver(resize).observe(canvas);
function generate(clearOffsets=true){
 if(clearOffsets) offsets={};
 random=rng(state.seed);notes=[];dust=[];
 for(let i=0;i<state.count;i++){
  const u=(i+.5)/state.count, a=random()*TAU, r=55+Math.sqrt(random())*330;
  const n={id:i,u,a,r,rnd:random(),rnd2:random(),weight:random(),variant:Math.floor(random()*12),rotation:(random()-.5)*1.7,ox:0,oy:0,cx:0,cy:0,flash:0,history:[]};
  const ring=Math.floor(u*7);
  if(state.layout===0){n.r=58+ring*48+random()*12;n.ox=Math.cos(a)*n.r;n.oy=Math.sin(a)*n.r*.9;}
  if(state.layout===1){n.r=45+Math.sqrt(u)*340;n.a=u*TAU*2.7+(i%2)*Math.PI;n.ox=Math.cos(n.a)*n.r;n.oy=Math.sin(n.a)*n.r*.86;}
  if(state.layout===2){n.cx=i%2===0?-160:160;n.cy=i%2===0?45:-45;n.r=25+Math.sqrt(random())*155;n.ox=n.cx+Math.cos(a)*n.r;n.oy=n.cy+Math.sin(a)*n.r*.9;}
  if(state.layout===3){n.r=65+Math.sqrt(u)*330;const x=Math.cos(a)*n.r,y=Math.sin(a)*n.r*.43;n.ox=x*Math.cos(-.5)-y*Math.sin(-.5);n.oy=x*Math.sin(-.5)+y*Math.cos(-.5);}
  if(state.layout===4){const centers=[[-195,-170],[180,-120],[-110,190],[220,200],[0,0]];[n.cx,n.cy]=centers[i%5];n.r=20+Math.sqrt(random())*105;n.ox=n.cx+Math.cos(a)*n.r;n.oy=n.cy+Math.sin(a)*n.r;}
  if(state.layout===5){n.ox=(random()+random()+random()-1.5)*255;n.oy=(random()+random()+random()-1.5)*235;n.r=Math.hypot(n.ox,n.oy);}
  if(state.layout===6){const rows=5,row=i%rows,x=(Math.floor(i/rows)+.5)/Math.ceil(state.count/rows)*720-360;n.ox=x;n.oy=-255+row*123+Math.sin(x/150+row*.7)*30+(Math.floor(random()*5)-2)*6;n.cx=0;n.cy=-255+row*123;}
  if(state.layout===7){n.ox=(random()-.5)*700;n.oy=(random()-.5)*680;n.r=Math.hypot(n.ox,n.oy);}
  notes.push(n);
 }
 for(let i=0;i<500;i++) dust.push({x:random()*1000,y:random()*1000,r:random()*.7+.2,alpha:random()*.18});
 guidePaths=buildGuides();triggered.clear();randomQueue=[];hover=null;drag=null;canvas.style.cursor='crosshair';lastTrail=time;
 $('seedLabel').textContent=String(state.seed).padStart(6,'0');$('noteCount').textContent=state.count+' CELESTIAL BODIES';
 $('layoutCaption').textContent=String(state.layout+1).padStart(2,'0')+' — '+layouts[state.layout].name;
}
function rawPosition(n,t=time){
 const s=view.spread/88, v=view.speed/100;
 let x=n.ox,y=n.oy,dx=x-n.cx,dy=y-n.cy;
 if(state.motion==='orbit'){
  const angle=t*v*.035*(.5+180/(n.r+100))*(n.id%5===0?-1:1);
  x=n.cx+dx*Math.cos(angle)-dy*Math.sin(angle);y=n.cy+dx*Math.sin(angle)+dy*Math.cos(angle);
 }else if(state.motion==='drift'){
  x+=Math.sin(t*v*.23+n.a)*28+Math.sin(t*v*.077+n.id)*14;y+=Math.cos(t*v*.19+n.a)*25;
 }else if(state.motion==='breathe'){
  const breathe=1+Math.sin(t*v*.5+n.rnd*2)*.12;x=n.cx+dx*breathe;y=n.cy+dy*breathe;
 }else if(state.motion==='vortex'){
  const angle=t*v*.11*(1.6-Math.min(n.r,400)/400),pulse=1+Math.sin(t*v*.3+n.a)*.07;
  x=n.cx+(dx*Math.cos(angle)-dy*Math.sin(angle))*pulse;y=n.cy+(dx*Math.sin(angle)+dy*Math.cos(angle))*pulse;
 }
 const o=offsets[n.id]||{x:0,y:0};
 const target={x:clamp(500+x*s+o.x,60,940),y:clamp(500+y*s+o.y,105,895)};
 return target;
}
function position(n,t=time){
 const target=rawPosition(n,t);if(!transition||n.manual)return target;const old=transition.nodes.get(n.id),start=old?old.p:{x:500,y:500},e=transition.e,mx=target.x-start.x,my=target.y-start.y,bend=(n.id%2?1:-1)*.19;const a={x:start.x+mx*.3-my*bend,y:start.y+my*.3+mx*bend},b={x:start.x+mx*.7-my*bend,y:start.y+my*.7+mx*bend},u=1-e;return{x:u*u*u*start.x+3*u*u*e*a.x+3*u*e*e*b.x+e*e*e*target.x,y:u*u*u*start.y+3*u*u*e*a.y+3*u*e*e*b.y+e*e*e*target.y};
}
function radius(n){const target=(5+(1-view.variation/100)*8+n.weight*view.variation/100*19)*view.size/100;const old=transition?.nodes.get(n.id);return transition?lerp(old?.r||0,target,transition.e):target;}
function color(n){const target=n.id%5===0?view.accent:n.id%3===0?view.secondary:view.ink;const old=transition?.nodes.get(n.id);return old?mixColor(old.color,target,transition.e):target;}
function pathEllipse(x,y,rx,ry,rot=0,start=0,end=TAU){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,start,end);ctx.stroke();}
function line(x,y,x2,y2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function label(text,x,y,size=9,align='left',colorValue=view.ink){ctx.save();ctx.fillStyle=colorValue;ctx.textAlign=align;ctx.font=`${size}px "Courier New", monospace`;ctx.fillText(text,x,y);ctx.restore();}
function arcText(text,radiusValue,startAngle){ctx.save();ctx.translate(500,500);ctx.rotate(startAngle);ctx.font='10px "Courier New", monospace';for(const letter of text){const width=ctx.measureText(letter).width;ctx.rotate(width/radiusValue/2);ctx.save();ctx.translate(0,-radiusValue);ctx.fillText(letter,0,0);ctx.restore();ctx.rotate(width/radiusValue/2);}ctx.restore();}
function buildGuides(){
 const paths=[],add=fn=>paths.push(Array.from({length:80},(_,i)=>fn(i/79))),ellipse=(x,y,rx,ry,rot=0)=>add(t=>{const a=t*TAU,dx=Math.cos(a)*rx,dy=Math.sin(a)*ry;return{x:x+dx*Math.cos(rot)-dy*Math.sin(rot),y:y+dx*Math.sin(rot)+dy*Math.cos(rot)};}),segment=(x,y,x2,y2)=>add(t=>({x:lerp(x,x2,t),y:lerp(y,y2,t)}));
 if(state.layout===0){for(let i=0;i<7;i++)ellipse(500,500,58+i*48,52+i*43.2);ellipse(500,500,390,174,-.67);ellipse(500,500,395,105,.83);segment(86,500,914,500);segment(500,86,500,914);}
 if(state.layout===1){for(let arm=0;arm<3;arm++)add(t=>{const r=40+Math.sqrt(t)*350,a=t*TAU*2.7+arm*TAU/3;return{x:500+Math.cos(a)*r,y:500+Math.sin(a)*r*.86};});for(let i=1;i<4;i++)ellipse(500,500,i*125,i*108);}
 if(state.layout===2){for(let sign of [-1,1])for(let r of [50,95,145,190])ellipse(500+sign*160,500-sign*45,r,r*.9);ellipse(500,500,360,270,-.28);segment(180,590,820,410);}
 if(state.layout===3){for(let r of [80,130,185,240,290,345,395])ellipse(500,500,r,r*.43,-.5);segment(140,697,860,303);}
 if(state.layout===4){for(const[x,y]of[[-195,-170],[180,-120],[-110,190],[220,200],[0,0]]){ellipse(500+x,500+y,115,115);ellipse(500+x,500+y,60,60);}}
 if(state.layout===5){for(let i=0;i<8;i++)add(t=>{const a=t*TAU,r=(55+i*37)*(1+.12*Math.sin(a*3+i*.5)+.08*Math.cos(a*5));return{x:500+Math.cos(a)*r,y:500+Math.sin(a)*r*.8};});}
 if(state.layout===6){for(let row=0;row<5;row++)for(let l=-2;l<=2;l++)add(t=>{const x=-370+t*740;return{x:500+x,y:245+row*123+Math.sin(x/150+row*.7)*30+l*6};});}
 if(state.layout===7){const used=new Set();for(const n of notes){const near=notes.filter(o=>o!==n).map(o=>({o,d:Math.hypot(n.ox-o.ox,n.oy-o.oy)})).sort((a,b)=>a.d-b.d).slice(0,2);for(const{o,d}of near){const key=[n.id,o.id].sort((a,b)=>a-b).join('-');if(!used.has(key)&&d<220){segment(500+n.ox,500+n.oy,500+o.ox,500+o.oy);used.add(key);}}}}
 return paths;
}
function currentGuides(){
 const target=guidePaths.map(points=>points.map(p=>({x:500+(p.x-500)*view.spread/88,y:500+(p.y-500)*view.spread/88})));
 if(!transition)return target;const old=transition.paths,e=transition.e,count=Math.max(old.length,target.length);return Array.from({length:count},(_,i)=>Array.from({length:80},(_,j)=>{const a=old[i]?.[j]||{x:500,y:500},b=target[i]?.[j]||{x:500,y:500};return{x:lerp(a.x,b.x,e),y:lerp(a.y,b.y,e)};}));
}
function drawGuides(){
 if(!state.guides)return;ctx.save();ctx.lineWidth=view.guideWidth;let index=0;for(const points of currentGuides()){ctx.strokeStyle=E.paint(ctx,view.materials.guides,fxTime+index++*.35,{x:60,y:100,w:880,h:800},view.ink);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}ctx.restore();
}
function centerState(){
 const target=state.layout===2?[{x:340,y:545,r:11,alpha:1},{x:660,y:455,r:8,alpha:1}]:[0,1,3].includes(state.layout)?[{x:500,y:500,r:12,alpha:1}]:[];
 const scaled=target.map(c=>({...c,x:500+(c.x-500)*view.spread/88,y:500+(c.y-500)*view.spread/88}));if(!transition)return scaled;const old=transition.centers,e=transition.e;return Array.from({length:Math.max(old.length,scaled.length)},(_,i)=>{const a=old[i]||{...scaled[i],r:0,alpha:0},b=scaled[i]||{...old[i],r:0,alpha:0};return{x:lerp(a.x,b.x,e),y:lerp(a.y,b.y,e),r:lerp(a.r,b.r,e),alpha:lerp(a.alpha,b.alpha,e)};});
}
function drawCenter(){
 for(const c of centerState()){ctx.save();ctx.translate(c.x,c.y);ctx.strokeStyle=ctx.fillStyle=E.paint(ctx,view.materials.notes,fxTime,{x:-30,y:-30,w:60,h:60},view.accent);ctx.lineWidth=view.guideWidth;ctx.globalAlpha*=.8*c.alpha;pathEllipse(0,0,c.r,c.r);pathEllipse(0,0,c.r+5,c.r+5);for(let i=0;i<24;i++){const a=i/24*TAU;line(Math.cos(a)*(c.r+7),Math.sin(a)*(c.r+7),Math.cos(a)*(c.r+10+(i%2)*3),Math.sin(a)*(c.r+10+(i%2)*3));}ctx.beginPath();ctx.arc(0,0,Math.max(0,c.r-3),0,TAU);if(state.drawMode==='outline')ctx.stroke();else ctx.fill();ctx.restore();}
}
function drawNote(n,p){
 const r=radius(n),c=color(n),fl=n.flash;const paint=E.paint(ctx,view.materials.notes,fxTime,{x:p.x-r*1.8,y:p.y-r*1.8,w:r*3.6,h:r*3.6},c);ctx.save();ctx.translate(p.x,p.y);const old=transition?.nodes.get(n.id);ctx.rotate((old?lerp(old.rotation,n.rotation,transition.e):n.rotation)+(state.motion==='vortex'?time*view.speed/100*.02:0));ctx.strokeStyle=ctx.fillStyle=paint;
 for(const layer of glyphLayers(n)){ctx.save();ctx.globalAlpha*=layer.alpha;G.draw(ctx,layer.family,layer.variant,r,{mode:layer.mode,lineWidth:view.shapeWidth});ctx.restore();}ctx.restore();
 if(fl>0||hover===n){ctx.save();ctx.strokeStyle=c;ctx.globalAlpha*=fl>0?fl*.6:.6;ctx.lineWidth=.8;const ring=r+7+(1-fl)*14;ctx.setLineDash(hover===n?[2,3]:[]);pathEllipse(p.x,p.y,ring,ring);ctx.restore();}
}
function drawDepartingNotes(){
 if(!transition)return;const e=transition.e;for(const[id,old]of transition.nodes){if(notes.some(n=>n.id===id))continue;ctx.save();ctx.translate(lerp(old.p.x,500,e),lerp(old.p.y,500,e));ctx.rotate(old.rotation);ctx.strokeStyle=ctx.fillStyle=E.paint(ctx,view.materials.notes,fxTime,{x:-old.r*2,y:-old.r*2,w:old.r*4,h:old.r*4},old.color);ctx.globalAlpha*=1-e;for(const layer of old.layers){ctx.save();ctx.globalAlpha*=layer.alpha;G.draw(ctx,layer.family,layer.variant,old.r*(1-e),{mode:layer.mode,lineWidth:view.shapeWidth});ctx.restore();}ctx.restore();}
}
function paintLayer(name,draw){
 const opacity={guides:view.guideOpacity,notes:view.opacity,scan:view.scanOpacity}[name]/100;
 compositor.render(mainCtx,pixelSize,view.materials[name],opacity,c=>{if(c!==mainCtx)c.canvas.dataset.orbitalLayer=name;const previous=ctx;ctx=c;try{draw();}finally{ctx=previous;}});
}
function scanPoints(){
 if(state.mode==='random'){
  const n=notes.find(n=>n.id===lastTriggered),p=n?position(n):null;
  if(p)return Array.from({length:140},(_,i)=>({x:500+(p.x-500)*i/139,y:500+(p.y-500)*i/139}));
  const r=32+Math.sin(elapsed*3)*6;return Array.from({length:180},(_,i)=>{const a=i/179*TAU;return{x:500+Math.cos(a)*r,y:500+Math.sin(a)*r};});
 }
 if(state.scan==='radial'){const r=Math.max(1,phase*565);return Array.from({length:240},(_,i)=>{const a=i/239*TAU;return{x:500+Math.cos(a)*r,y:500+Math.sin(a)*r};});}
 if(state.scan==='angular'){const a=phase*TAU-Math.PI/2;return Array.from({length:180},(_,i)=>({x:500+Math.cos(a)*560*i/179,y:500+Math.sin(a)*560*i/179}));}
 const x=state.scan==='left'?60+phase*880:940-phase*880;return Array.from({length:180},(_,i)=>({x,y:100+800*i/179}));
}
function drawScan(){
 if(!playing)return;const points=scanPoints(),xs=points.map(p=>p.x),ys=points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),bounds={x:x-20,y:y-20,w:Math.max(40,Math.max(...xs)-x+40),h:Math.max(40,Math.max(...ys)-y+40)};
 ctx.save();ctx.strokeStyle=ctx.fillStyle=E.paint(ctx,view.materials.scan,fxTime,bounds,view.accent);E.cursor(ctx,points,state.scanStyle,{width:view.scanWidth,density:Math.round(view.scanDetail),amplitude:view.scanAmplitude,time:fxTime});ctx.restore();
}
function drawNotation(){
 drawCenter();drawDepartingNotes();
 for(const n of notes){const p=position(n);if(view.trails>0&&n.history.length>1){ctx.save();ctx.strokeStyle=E.paint(ctx,view.materials.notes,fxTime,{x:0,y:0,w:1000,h:1000},color(n));ctx.lineWidth=.7;ctx.globalAlpha*=view.trails/100*.22;ctx.beginPath();n.history.forEach((h,i)=>i?ctx.lineTo(h.x,h.y):ctx.moveTo(h.x,h.y));ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();}drawNote(n,p);}
}
function render(){
 resize();ctx.setTransform(pixelSize/1000,0,0,pixelSize/1000,0,0);ctx.clearRect(0,0,1000,1000);ctx.fillStyle=view.background;ctx.fillRect(0,0,1000,1000);
 if(state.stars){ctx.save();ctx.fillStyle=view.ink;for(const d of dust){ctx.globalAlpha=d.alpha;ctx.fillRect(d.x,d.y,d.r,d.r);}ctx.restore();}
 ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=view.ink;ctx.lineWidth=.7;
 line(35,88,965,88);line(35,921,965,921);for(let i=0;i<=40;i++){const x=50+i*22.5;line(x,921,x,921+(i%5===0?8:3));}ctx.restore();
 if(state.annotations){
  label('FIG. '+String(state.layout+1).padStart(2,'0')+' / '+layouts[state.layout].name.toUpperCase(),45,49,10);label('ORBITAL STUDY',45,68,8,'left',view.secondary);label('SEED '+String(state.seed).padStart(6,'0'),955,49,9,'right');label('DURATION 16 BEATS · '+state.bpm+' BPM',955,68,8,'right',view.secondary);
  label('A SCORE FOR SMALL CELESTIAL BODIES',45,954,8);label(playing?'● '+(state.mode==='random'?'STOCHASTIC':state.scan.toUpperCase())+' SCAN':'∴ CHANCE, MOTION & SOUND',955,954,8,'right',view.secondary);
  ctx.save();ctx.globalAlpha=.5;label('270°',500,117,8,'center');label('90°',500,897,8,'center');ctx.translate(112,500);ctx.rotate(-Math.PI/2);label('180°',0,0,8,'center');ctx.restore();ctx.save();ctx.globalAlpha=.5;ctx.translate(890,500);ctx.rotate(Math.PI/2);label('0° / 360°',0,0,8,'center');ctx.restore();
  if(state.layout===0){ctx.save();ctx.globalAlpha=.6;arcText('ORBITS OF SMALL PLANETS',307,-1.21);ctx.restore();}
 }
 paintLayer('guides',drawGuides);paintLayer('scan',drawScan);paintLayer('notes',drawNotation);
 if(state.annotations){ctx.save();ctx.globalAlpha=.55;for(const n of notes){if(n.id%11===3){const p=position(n);label(['pianissimo','∿ lento','ad libitum','→ orbit','sostenuto'][Math.floor(n.id/11)%5],p.x+radius(n)+9,p.y-5,8,'left',color(n));}}ctx.restore();}
}

// Audio is initialized only by a user gesture. A compressor bounds polyphonic peaks.
let audio=null;
class Orchestra{
 constructor(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('当前浏览器不支持 Web Audio');
  this.ctx=new AudioCtx();const a=this.ctx;this.master=a.createGain();this.compressor=a.createDynamicsCompressor();this.compressor.threshold.value=-15;this.compressor.knee.value=18;this.compressor.ratio.value=5;this.compressor.attack.value=.005;this.compressor.release.value=.2;this.master.connect(this.compressor);this.compressor.connect(a.destination);
  this.dry=a.createGain();this.dry.gain.value=.75;this.dry.connect(this.master);
  this.convolver=a.createConvolver();const buffer=a.createBuffer(2,a.sampleRate*2.6,a.sampleRate),randomImpulse=rng(24680);for(let c=0;c<2;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(randomImpulse()*2-1)*Math.pow(1-i/data.length,2.5);}this.convolver.buffer=buffer;this.wet=a.createGain();this.convolver.connect(this.wet);this.wet.connect(this.master);
  this.echo=a.createDelay(1.5);this.echo.delayTime.value=.357;this.feedback=a.createGain();this.feedback.gain.value=.28;this.echo.connect(this.feedback);this.feedback.connect(this.echo);this.echoWet=a.createGain();this.echo.connect(this.echoWet);this.echoWet.connect(this.master);this.voices=new Set();this.update();
 }
 update(){const t=this.ctx.currentTime;this.master.gain.setTargetAtTime((muted?0:state.volume/100)*.65,t,.025);this.wet.gain.setTargetAtTime(view.reverb/100*.65,t,.03);this.echoWet.gain.setTargetAtTime(view.delay/100*.5,t,.03);this.echo.delayTime.setTargetAtTime(30/view.bpm,t,.05);}
 async resume(){if(this.ctx.state!=='running')await this.ctx.resume();}
 note(n,p){
  if(this.voices.size>=28)return;
  const a=this.ctx,t=a.currentTime,freq=pitch(p.y),duration=view.decay/100,level=(.018+clamp(radius(n)/28,.1,1.4)*.045)*(state.timbre==='deep'?.85:1),env=a.createGain(),filter=a.createBiquadFilter(),pan=a.createStereoPanner();
  filter.type='lowpass';filter.frequency.setValueAtTime(view.cutoff,t);filter.Q.value=state.engine==='va'?1.5:.6;pan.pan.value=clamp((p.x-500)/440,-.9,.9);filter.connect(env);env.connect(pan);pan.connect(this.dry);pan.connect(this.convolver);pan.connect(this.echo);
  const attack=state.timbre==='warm'?.06:.008;env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(level,t+attack);env.gain.exponentialRampToValueAtTime(.0001,t+duration+.1);
  const carrier=a.createOscillator();let osc2,modGain;
  let fundamental=freq*(state.timbre==='deep'?.5:1);
  if(state.engine==='fm'){
   carrier.type='sine';carrier.frequency.value=fundamental;osc2=a.createOscillator();modGain=a.createGain();osc2.type='sine';const ratio={glass:2.01,bell:3.5,warm:1,deep:.5}[state.timbre];osc2.frequency.value=fundamental*ratio;modGain.gain.setValueAtTime(fundamental*(view.modulation/100*5+.1),t);modGain.gain.exponentialRampToValueAtTime(Math.max(.01,fundamental*.03),t+duration);osc2.connect(modGain);modGain.connect(carrier.frequency);
  }else{
   carrier.type={glass:'triangle',bell:'square',warm:'sawtooth',deep:'sawtooth'}[state.timbre];carrier.frequency.value=fundamental;osc2=a.createOscillator();osc2.type=carrier.type;osc2.frequency.value=fundamental;osc2.detune.value=view.modulation/100*32;const soft=a.createGain();soft.gain.value=.45;osc2.connect(soft);soft.connect(filter);
   filter.frequency.setValueAtTime(Math.min(view.cutoff*(state.timbre==='warm'?.8:1.5),16000),t);filter.frequency.exponentialRampToValueAtTime(Math.max(150,view.cutoff*.25),t+duration);
  }
  carrier.connect(filter);carrier.start(t);osc2.start(t);carrier.stop(t+duration+.15);osc2.stop(t+duration+.15);
  const voice={env,carrier,osc2,pan,filter,modGain};this.voices.add(voice);carrier.onended=()=>{carrier.disconnect();osc2.disconnect();if(modGain)modGain.disconnect();filter.disconnect();env.disconnect();pan.disconnect();this.voices.delete(voice);};
 }
 silence(){const t=this.ctx.currentTime;for(const v of this.voices){v.env.gain.cancelScheduledValues(t);v.env.gain.setTargetAtTime(.0001,t,.015);} /* Effect tails decay naturally. */}
}
let muted=false;
function pitch(y){
 const collection={pentatonic:[0,3,5,7,10],major:[0,2,4,5,7,9,11],chromatic:[0,1,2,3,4,5,6,7,8,9,10,11]}[state.scale],root=state.scale==='pentatonic'?38:36;
 const degree=clamp(Math.floor((900-y)/800*collection.length*3),0,collection.length*3-1),midi=root+12*Math.floor(degree/collection.length)+collection[degree%collection.length];return 440*Math.pow(2,(midi-69)/12);
}
function pitchName(y){const midi=Math.round(69+12*Math.log2(pitch(y)/440));return ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][midi%12]+(Math.floor(midi/12)-1);}
async function ensureAudio(){if(!audio)audio=new Orchestra();await audio.resume();}
function trigger(n){lastTriggered=n.id;n.flash=1;if(audio&&audio.ctx.state==='running')audio.note(n,position(n));}
function metric(p){if(state.scan==='radial')return Math.hypot(p.x-500,p.y-500)/565;if(state.scan==='left')return(p.x-60)/880;if(state.scan==='right')return(940-p.x)/880;return((Math.atan2(p.y-500,p.x-500)+Math.PI/2+TAU)%TAU)/TAU;}
function playInterval(from,to){for(const n of notes)if(!triggered.has(n.id)){const m=metric(position(n));if(m>=from&&m<=to){trigger(n);triggered.add(n.id);}}}
function shuffleQueue(){randomQueue=notes.slice();for(let i=randomQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[randomQueue[i],randomQueue[j]]=[randomQueue[j],randomQueue[i]];}}
function updatePlayback(dt){
 if(!playing)return;
 elapsed+=dt;
 if(state.mode==='random'){
  randomClock+=dt;const step=30/view.bpm;
  while(randomClock>=step){randomClock-=step;if(!randomQueue.length)shuffleQueue();trigger(randomQueue.pop());}phase=(elapsed/(960/view.bpm))%1;
 }else{
  const next=phase+dt*view.bpm/960;
  if(next>=1){playInterval(phase,1);if(state.mode==='once'){phase=1;playing=false;updateTransport();}else{phase=next%1;cycle++;triggered.clear();playInterval(0,phase);}}
  else{playInterval(phase,next);phase=next;}
 }
 const seconds=Math.floor(elapsed);$('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('progress').style.width=phase*100+'%';$('seekTrack').setAttribute('aria-valuenow',Math.round(phase*100));
}
function updateTransport(){
 $('play').innerHTML=`<svg><use href="#i-${playing?'pause':'play'}"/></svg>`;$('play').setAttribute('aria-label',playing?'暂停演奏':'播放乐谱');$('transportStatus').textContent=playing?'THE UNIVERSE IS PLAYING':phase>=1?'SCORE COMPLETE':phase>0?'PAUSED IN SPACE':'READY TO EXPLORE';$('scoreStatus').textContent=playing?'LISTENING TO THE COSMOS':'LIVE GENERATIVE SCORE';
}
async function togglePlay(){try{await ensureAudio();if(!playing&&phase>=1)resetPlayback();playing=!playing;if(!playing)audio.silence();updateTransport();}catch(error){toast('无法启动声音：'+error.message);}}
function resetPlayback(){lastTriggered=null;playing=false;phase=0;elapsed=0;cycle=0;triggered.clear();randomQueue=[];randomClock=0;notes.forEach(n=>n.flash=0);if(audio)audio.silence();$('time').textContent='00:00';$('progress').style.width='0%';$('seekTrack').setAttribute('aria-valuenow','0');updateTransport();}
function frame(now){
 const dt=clamp((now-lastFrame)/1000,0,.1);lastFrame=now;advanceVisual(now);if(audio)audio.update();
 if(visualRunning)time+=dt;if(visualRunning||playing)fxTime+=dt;
 for(const n of notes)n.flash=Math.max(0,n.flash-dt*1.8);
 if(visualRunning&&time-lastTrail>.06){for(const n of notes){n.history.push(position(n));if(n.history.length>24)n.history.shift();}lastTrail=time;}
 updatePlayback(dt);render();if(capture)capture.frame(now);requestAnimationFrame(frame);
}

// Independent layer materials. Values also participate in persistence and scene morphs.
let fxTarget='guides';
const fxNames={guides:['Orbital guides','轨道线'],notes:['Note forms','音符图形'],scan:['Playback cursor','播放引导']};
const fxRootKeys={width:{guides:'guideWidth',notes:'shapeWidth',scan:'scanWidth'},opacity:{guides:'guideOpacity',notes:'opacity',scan:'scanOpacity'}};
function fxRange(key,label,min,max,step=1,unit='%'){
 return `<div class="slider-field"><div><label for="fx-${key}">${label}</label><output for="fx-${key}" data-unit="${unit}"></output></div><input id="fx-${key}" data-fx="${key}" type="range" min="${min}" max="${max}" step="${step}"></div>`;
}
function fxColor(key,label){return `<label class="fx-color" title="${label}"><input id="fx-${key}" data-fx="${key}" type="color"><span>${label}</span></label>`;}
$('materialLab').innerHTML=`<div class="section-label"><span>MATERIAL LAB</span><span>独立材质控制</span></div>
 <div class="fx-targets" role="group" aria-label="选择调整的图层">${Object.entries(fxNames).map(([key,n])=>`<button data-fx-target="${key}" aria-pressed="${key==='guides'}">${key==='guides'?'◎':key==='notes'?'♪':'↝'}<span>${n[1]}</span></button>`).join('')}</div>
 <div class="fx-preview" id="fxPreview"><span id="fxLayerTitle">Orbital guides</span><small>LIVE MATERIAL</small></div>
 <div id="scanStylePanel" hidden><div class="variant-heading"><span>CURSOR STYLES <small>8 STYLES</small></span></div><div class="scan-style-grid" id="scanStyles">${E.scanStyles.map(s=>`<button data-scan-style="${s.id}" title="${s.en} / ${s.name}"><svg viewBox="0 0 52 32">${s.svg}</svg><span>${s.name}</span></button>`).join('')}</div><p class="variant-help">播放时显示，也适用于随机演奏。</p>${fxRange('scanDetail','Texture density / 纹理密度',4,40,1,'')}${fxRange('scanAmplitude','Wave / spread / 波幅与展开',0,30,1,'px')}</div>
 <details class="fx-section" open><summary>Color & flow <span>色彩与动态</span></summary><div class="select-field"><label for="fx-mode">Color field <span>渐变方式</span></label><select id="fx-mode" data-fx="mode"><option value="palette">Original palette / 原始配色</option><option value="solid">Custom solid / 自定义单色</option><option value="linear">Linear flow / 线性流光</option><option value="radial">Radial bloom / 径向渐变</option><option value="conic">Conic orbit / 环绕渐变</option></select></div><div class="fx-colors">${fxColor('color1','起始色')}${fxColor('color2','中间色')}${fxColor('color3','结束色')}</div>${fxRange('angle','Direction / 渐变方向',0,360,1,'°')}${fxRange('scale','Gradient span / 渐变范围',20,220)}${fxRange('speed','Color velocity / 色彩流动',0,200,1,'×')}</details>
 <details class="fx-section" open><summary>Stroke & softness <span>线条与模糊</span></summary>${fxRange('width','Line weight / 线条粗细',.2,12,.1,'px')}${fxRange('opacity','Opacity / 图层透明度',0,100)}${fxRange('blur','Softness / 图形模糊',0,20,.1,'px')}</details>
 <details class="fx-section" id="fxInnerSection"><summary>Inner light <span>内发光 · <b id="fxInnerValue">0%</b></span></summary>${fxRange('innerStrength','Intensity / 内发光强度',0,100)}${fxRange('innerRadius','Reach / 内发光范围',.3,24,.1,'px')}<div class="fx-single-color">${fxColor('innerColor','内发光颜色')}<span>限制在图形轮廓内部</span></div></details>
 <details class="fx-section" id="fxOuterSection"><summary>Outer light <span>外发光 · <b id="fxOuterValue">0%</b></span></summary>${fxRange('outerStrength','Intensity / 外发光强度',0,100)}${fxRange('outerRadius','Reach / 外发光范围',.3,45,.1,'px')}<div class="fx-single-color">${fxColor('outerColor','外发光颜色')}<span>沿轮廓向外扩散</span></div></details>
 <button class="text-button" id="fxReset">↺ Reset this layer / 重置当前图层</button>`;
function syncFxValues(){
 const m=state.materials[fxTarget];
 document.querySelectorAll('[data-fx-target]').forEach(el=>{const active=el.dataset.fxTarget===fxTarget;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
 $('scanStylePanel').hidden=fxTarget!=='scan';$('fxLayerTitle').textContent=fxNames[fxTarget][0];
 for(const input of $('materialLab').querySelectorAll('[data-fx]')){
  const key=input.dataset.fx,root=fxRootKeys[key]?.[fxTarget];let value=root?state[root]:['scanDetail','scanAmplitude'].includes(key)?state[key]:m[key];input.value=value;
  if(root&&ranges[root]){input.min=ranges[root][0];input.max=ranges[root][1];}
  if(input.type==='range'){rangeFill(input);const output=document.querySelector(`output[for="${input.id}"]`),unit=output.dataset.unit;output.textContent=unit==='×'?(value/100).toFixed(1)+'×':unit==='px'?Number(value).toFixed(1)+'px':value+unit;}
  if(['color1','color2','color3'].includes(key))input.disabled=m.mode==='palette'||(m.mode==='solid'&&key!=='color1');
  if(['angle','scale','speed'].includes(key))input.disabled=['palette','solid'].includes(m.mode)||(key==='scale'&&m.mode==='conic');
  if(key==='scanDetail')input.disabled=!['dash','dots','wave','comet','ticks'].includes(state.scanStyle);if(key==='scanAmplitude')input.disabled=!['twin','wave','ribbon','comet','ticks'].includes(state.scanStyle);
 }
 $('fxInnerValue').textContent=m.innerStrength+'%';$('fxOuterValue').textContent=m.outerStrength+'%';
 const preview=$('fxPreview');preview.style.background=m.mode==='palette'?'linear-gradient(110deg,'+state.ink+','+state.secondary+','+state.accent+')':m.mode==='solid'?m.color1:`linear-gradient(${m.angle}deg,${m.color1},${m.color2},${m.color3},${m.color1})`;preview.classList.toggle('flowing',!['palette','solid'].includes(m.mode)&&m.speed>0);preview.style.animationDuration=(240/Math.max(1,m.speed))+'s';
 document.querySelectorAll('[data-scan-style]').forEach(el=>{const active=el.dataset.scanStyle===state.scanStyle;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
}
$('materialLab').addEventListener('click',e=>{
 const target=e.target.closest('[data-fx-target]');if(target){fxTarget=target.dataset.fxTarget;syncFxValues();return;}
 const style=e.target.closest('[data-scan-style]');if(style){state.scanStyle=style.dataset.scanStyle;syncFxValues();persist();}
});
function changeFx(e){
 const el=e.target.closest('[data-fx]');if(!el)return;const key=el.dataset.fx,root=fxRootKeys[key]?.[fxTarget];let value=el.type==='range'?Number(el.value):el.value;
 if(root){state[root]=value;const shortcut=$(root);if(shortcut){shortcut.value=value;if(shortcut.type==='range')rangeFill(shortcut);updateOutput(root);}}
 else if(['scanDetail','scanAmplitude'].includes(key))state[key]=value;
 else state.materials[fxTarget][key]=value;
 if(fxTarget==='notes'&&key==='outerStrength'){state.glow=value;$('glow').value=value;rangeFill($('glow'));updateOutput('glow');}
 if(fxTarget==='notes'&&key==='width')syncVariants();syncFxValues();persist();
}
$('materialLab').addEventListener('input',changeFx);$('materialLab').addEventListener('change',e=>{if(e.target.tagName==='SELECT')changeFx(e);});
$('fxReset').addEventListener('click',()=>{state.materials[fxTarget]=E.defaults()[fxTarget];const width=fxRootKeys.width[fxTarget],alpha=fxRootKeys.opacity[fxTarget];state[width]=defaults[width];state[alpha]=defaults[alpha];if(fxTarget==='notes')state.glow=state.materials.notes.outerStrength;syncUI();persist();toast('已重置'+fxNames[fxTarget][1]+'材质');});
$('scanLook').addEventListener('click',()=>{document.querySelector('[data-tab="visual"]').click();fxTarget='scan';syncFxValues();$('tab-visual').scrollTop=0;$('materialLab').scrollIntoView({behavior:'smooth',block:'nearest'});});

// Parameter controls, portable score files, and direct manipulation.
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function syncUI(){
 $('layouts').innerHTML=layouts.map((l,i)=>`<button class="layout-card ${state.layout===i?'selected':''}" data-layout="${i}" aria-pressed="${state.layout===i}" title="${l.cn}"><span class="layout-number">0${i+1}</span>${state.layout===i?'<span class="check">✓</span>':''}<svg viewBox="0 0 56 42">${l.icon}</svg><span>${l.name}</span></button>`).join('');
 $('shapes').innerHTML=forms.map(f=>`<button class="shape-button ${state.shape===f.id?'selected':''}" data-shape="${f.id}" aria-pressed="${state.shape===f.id}"><span class="shape-icon">${f.icon}</span><span class="shape-label">${f.name}</span></button>`).join('');
 $('motions').innerHTML=motions.map(m=>`<button class="motion-button ${state.motion===m.id?'selected':''}" data-motion="${m.id}" aria-pressed="${state.motion===m.id}"><span>${m.icon}</span>${m.name}</button>`).join('');
 syncFxValues();syncVariants();document.querySelectorAll('[data-draw]').forEach(el=>{el.classList.toggle('selected',el.dataset.draw===state.drawMode);el.setAttribute('aria-pressed',String(el.dataset.draw===state.drawMode));});
 for(const [k,v] of Object.entries(state)){const el=$(k);if(!el)continue;if(el.type==='checkbox')el.checked=v;else el.value=v;if(el.type==='range')rangeFill(el);updateOutput(k);}
 document.querySelectorAll('[data-engine]').forEach(el=>{el.classList.toggle('selected',el.dataset.engine===state.engine);el.setAttribute('aria-pressed',String(el.dataset.engine===state.engine));});
 ['background','ink','accent','secondary'].forEach(k=>$(k+'Hex').textContent=state[k].toUpperCase());
 [...$('paletteDots').querySelectorAll('i')].forEach((el,i)=>el.style.background=[state.background,state.ink,state.accent][i]);
 $('motionToggle').textContent=(visualRunning?'Ⅱ':'▷')+' Motion';$('motionToggle').setAttribute('aria-pressed',String(visualRunning));
}
function rangeFill(el){el.style.setProperty('--fill',(Number(el.value)-Number(el.min))/(Number(el.max)-Number(el.min))*100+'%');}
function updateOutput(key){const output=document.querySelector(`output[for="${key}"]`);if(!output)return;let v=state[key];if(['guideWidth','shapeWidth','scanWidth'].includes(key))v=v.toFixed(1)+'px';else if(['size','speed'].includes(key))v=(v/100).toFixed(1)+'×';else if(key==='decay')v=(v/100).toFixed(1)+'s';else if(key==='cutoff')v+='Hz';else if(key!=='count')v+='%';output.textContent=v;}
for(const key of Object.keys(state)){
 const el=$(key);if(!el)continue;
 el.addEventListener(el.type==='checkbox'||el.tagName==='SELECT'?'change':'input',()=>{
  if(numericKeys.includes(key)){const val=Number(el.value);if(!Number.isFinite(val)||val<ranges[key][0]||val>ranges[key][1])return;state[key]=val;}
  else state[key]=el.type==='checkbox'?el.checked:el.value;
  if(key==='glow')state.materials.notes.outerStrength=state.glow;
  if(key==='count'){beginScene(()=>{},1000);}if(key==='theme'){beginScene(()=>{Object.assign(state,palettes[state.theme]);state.materials.notes.outerStrength=state.glow;},1800);}
  if(['scan','mode'].includes(key)){triggered.clear();randomQueue=[];randomClock=0;}
  if(el.type==='range')rangeFill(el);updateOutput(key);if(key==='shapeWidth')syncVariants();
  if(['background','ink','accent','secondary'].includes(key)){ $(key+'Hex').textContent=state[key].toUpperCase();[...$('paletteDots').querySelectorAll('i')].forEach((dot,i)=>dot.style.background=[state.background,state.ink,state.accent][i]); }
  syncFxValues();if(audio)audio.update();persist();
 });
 el.addEventListener('change',()=>{if(numericKeys.includes(key)){el.value=state[key];rangeFill(el);}});
}
function syncVariants(){
 const family=state.shape,selected=state.enabledVariants[family];$('variantCount').textContent=selected.length+' / 12';
 $('variants').innerHTML=G.names[family].map((name,i)=>`<button class="variant-button ${selected.includes(i)?'selected':''}" data-variant="${i}" aria-pressed="${selected.includes(i)}" title="${name}"><span class="variant-index">${String(i+1).padStart(2,'0')}</span><canvas width="116" height="88" aria-hidden="true"></canvas><span class="variant-name">${name}</span></button>`).join('');
 $('variants').querySelectorAll('canvas').forEach((c,i)=>{const x=c.getContext('2d');x.translate(58,46);x.fillStyle=x.strokeStyle='#526447';G.draw(x,family,i,22,{mode:state.drawMode,lineWidth:state.shapeWidth*1.3});});
}
$('variants').addEventListener('click',e=>{const el=e.target.closest('[data-variant]');if(!el)return;const index=+el.dataset.variant,selected=state.enabledVariants[state.shape];if(selected.length===1&&selected.includes(index)){toast('请至少保留一种形状');return;}beginScene(()=>{state.enabledVariants[state.shape]=selected.includes(index)?selected.filter(i=>i!==index):[...selected,index].sort((a,b)=>a-b);},800);});
$('selectAllVariants').addEventListener('click',()=>{beginScene(()=>{state.enabledVariants[state.shape]=Array.from({length:12},(_,i)=>i);},800);});
$('drawModes').addEventListener('click',e=>{const el=e.target.closest('[data-draw]');if(el&&state.drawMode!==el.dataset.draw)beginScene(()=>{state.drawMode=el.dataset.draw;},750);});
function randomizeAll(){
 beginScene(()=>{
  const choose=a=>a[Math.floor(Math.random()*a.length)],between=(a,b)=>Math.round(a+Math.random()*(b-a));
  state.seed=between(1,999999);state.layout=choose(layouts.map((_,i)=>i).filter(i=>i!==state.layout));state.shape=choose(forms.map(f=>f.id));state.motion=choose(motions.map(m=>m.id));state.count=between(24,96);state.size=between(65,155);state.variation=between(25,100);state.spread=between(60,100);state.speed=between(25,130);state.theme=choose(Object.keys(palettes));Object.assign(state,palettes[state.theme]);state.accent='hsl('+between(0,359)+' 38% 48%)';const rgb=document.createElement('canvas').getContext('2d');rgb.fillStyle=state.accent;state.accent=rgb.fillStyle;state.glow=between(0,65);state.opacity=between(45,100);state.trails=between(0,80);state.guideWidth=between(3,35)/10;state.shapeWidth=between(5,45)/10;state.drawMode=choose(['outline','fill','both']);state.engine=choose(['fm','va']);state.timbre=choose(['glass','bell','warm','deep']);state.scale=choose(['pentatonic','major','chromatic']);state.modulation=between(10,75);state.decay=between(50,320);state.cutoff=between(12,90)*100;state.reverb=between(5,65);state.delay=between(0,45);state.bpm=between(55,140);state.scan=choose(['radial','left','right','angular']);state.mode=choose(['loop','random']);state.guides=Math.random()>.12;state.stars=Math.random()>.2;
  state.scanStyle=choose(E.scanStyles.map(s=>s.id));state.scanWidth=between(8,40)/10;state.scanDetail=between(6,30);state.scanAmplitude=between(3,20);state.guideOpacity=between(25,75);state.scanOpacity=between(50,95);
  for(const name of ['guides','notes','scan']){const m=state.materials[name];m.mode=choose(['palette','linear','radial','conic']);m.angle=between(0,360);m.scale=between(60,180);m.speed=between(10,90);m.color1=choose([state.accent,'#f1b786','#c8b8de']);m.color2=choose(['#7bb6aa','#8cc4da','#b4b87d']);m.color3=choose(['#d4a3b9','#d8c680','#819ebd']);m.blur=between(0,12)/10;m.innerStrength=between(0,45);m.innerRadius=between(10,60)/10;m.outerStrength=between(0,50);m.outerRadius=between(25,140)/10;}state.glow=state.materials.notes.outerStrength;
  for(const family of Object.keys(state.enabledVariants)){const values=Array.from({length:12},(_,i)=>i).filter(()=>Math.random()>.45);state.enabledVariants[family]=values.length?values:[between(0,11)];}
 },5000);if(audio)audio.update();toast('全局随机 · 用 5 秒进入新的宇宙');
}
$('randomAll').addEventListener('click',randomizeAll);
let capture=null;
function mp4Type(withAudio){if(typeof MediaRecorder==='undefined')return null;const list=withAudio?['video/mp4;codecs=avc1.42001E,opus','video/mp4;codecs=vp9,opus','video/mp4']:['video/mp4;codecs=avc1.42001E','video/mp4;codecs=vp9','video/mp4'];return list.find(type=>MediaRecorder.isTypeSupported(type))||null;}
function recordingOptions(){const gif=$('recordFormat').value==='gif';for(const el of [$('recordSize'),$('recordFps'),$('recordDuration')])for(const option of el.options)option.disabled=gif&&((el.id==='recordSize'&&+option.value>768)||(el.id==='recordFps'&&+option.value>12)||(el.id==='recordDuration'&&+option.value>15));if(gif){if(+$('recordSize').value>768)$('recordSize').value='512';$('recordFps').value='12';if(+$('recordDuration').value>15)$('recordDuration').value='15';}$('recordAudio').disabled=gif;$('recordCapability').textContent=gif?'GIF 是无声循环动画；色盘根据画面自动生成。':mp4Type($('recordAudio').checked)?'MP4 可用 · 可录制画面与当前演奏。':'当前浏览器未提供 MP4 编码，请使用新版 Chrome / Edge / Safari，或选择 GIF。';$('startRecording').disabled=!gif&&!mp4Type($('recordAudio').checked);}
function openRecording(){if(capture){toast('当前正在录制，可在底部结束或取消');return;}recordingOptions();$('recordDialog').showModal();$('exportMenu').hidden=true;}
$('recordOpen').addEventListener('click',openRecording);$('exportRecording').addEventListener('click',openRecording);$('closeRecord').addEventListener('click',()=>$('recordDialog').close());$('recordFormat').addEventListener('change',recordingOptions);$('recordAudio').addEventListener('change',recordingOptions);
$('startRecording').addEventListener('click',async()=>{
 if(capture)return;const format=$('recordFormat').value;let stream=null,disconnectAudio=null;
 try{
  if(format==='mp4'&&$('recordAudio').checked){await ensureAudio();const destination=audio.ctx.createMediaStreamDestination();audio.compressor.connect(destination);stream=destination.stream;disconnectAudio=()=>{audio.compressor.disconnect(destination);destination.stream.getTracks().forEach(t=>t.stop());};}
  capture=new window.OrbitalCapture({source:canvas,format,size:+$('recordSize').value,fps:+$('recordFps').value,duration:+$('recordDuration').value,mime:mp4Type(!!stream),audioStream:stream,onProgress:({elapsed,total,encoding})=>{$('recordProgress').value=elapsed/total;$('recordStatus').textContent=encoding?'正在编码 '+format.toUpperCase()+'…':format.toUpperCase()+' · '+elapsed.toFixed(1)+' / '+total+'s';$('stopRecording').disabled=encoding;},onDone:blob=>{download(blob,`orbital-${state.seed}-${Date.now()}.${format}`);toast(format.toUpperCase()+' 正方形动画已导出');finishCapture();},onError:error=>{toast('录制失败：'+error.message);finishCapture();}});
  capture.cleanupAudio=disconnectAudio;$('recordTray').hidden=false;$('stopRecording').disabled=false;$('recordDialog').close();capture.start();
 }catch(error){capture?.cancel();if(disconnectAudio)disconnectAudio();capture=null;$('recordTray').hidden=true;toast('无法开始录制：'+error.message);}
});
function finishCapture(){if(capture?.cleanupAudio)capture.cleanupAudio();capture=null;$('recordTray').hidden=true;}
$('stopRecording').addEventListener('click',()=>capture?.stop());$('cancelRecording').addEventListener('click',()=>{if(capture)capture.cancel();finishCapture();toast('已取消录制');});
$('layouts').addEventListener('click',e=>{const el=e.target.closest('[data-layout]');if(!el)return;if(state.layout!==+el.dataset.layout)beginScene(()=>{state.layout=+el.dataset.layout;});});
$('shapes').addEventListener('click',e=>{const el=e.target.closest('[data-shape]');if(!el)return;if(state.shape!==el.dataset.shape)beginScene(()=>{state.shape=el.dataset.shape;},1100);});
$('motions').addEventListener('click',e=>{const el=e.target.closest('[data-motion]');if(!el)return;beginScene(()=>{state.motion=el.dataset.motion;},1600);});
$('engines').addEventListener('click',e=>{const el=e.target.closest('[data-engine]');if(!el)return;state.engine=el.dataset.engine;syncUI();persist();});
document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>{tab=el.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>{t.classList.toggle('active',t===el);t.setAttribute('aria-selected',String(t===el));});document.querySelectorAll('.tab-content').forEach(panel=>panel.hidden=panel.id!=='tab-'+tab);}));
function regenerate(){beginScene(()=>{state.seed=Math.floor(Math.random()*999998)+1;});toast('已生成新的星际乐谱 · SEED '+state.seed);}
$('generate').addEventListener('click',regenerate);$('play').addEventListener('click',togglePlay);$('stop').addEventListener('click',resetPlayback);
$('motionToggle').addEventListener('click',()=>{visualRunning=!visualRunning;syncUI();});
$('mute').addEventListener('click',()=>{muted=!muted;if(audio)audio.update();$('mute').style.opacity=muted?'.35':'1';$('mute').setAttribute('aria-label',muted?'取消静音':'静音');$('mute').setAttribute('aria-pressed',String(muted));});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('scoreFrame').requestFullscreen)await $('scoreFrame').requestFullscreen();else toast('此浏览器不支持全屏，可使用横屏查看。');}catch{toast('浏览器未允许全屏，请尝试在独立窗口打开。');}});
$('resetVisual').addEventListener('click',()=>{Object.assign(state,palettes[state.theme],{opacity:85,trails:25,guides:true,stars:true,annotations:true,materials:E.defaults(),guideOpacity:27,scanOpacity:65,scanWidth:1.3,scanStyle:'beam',scanDetail:14,scanAmplitude:7});state.materials.notes.outerStrength=state.glow;syncUI();persist();toast('已恢复当前视觉预设');});
function seek(value){phase=clamp(value,0,.99999);elapsed=phase*960/state.bpm;triggered=new Set(notes.filter(n=>metric(position(n))<=phase).map(n=>n.id));$('progress').style.width=phase*100+'%';$('seekTrack').setAttribute('aria-valuenow',Math.round(phase*100));const seconds=Math.floor(elapsed);$('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');updateTransport();}
$('seekTrack').addEventListener('pointerdown',e=>{const rect=e.currentTarget.getBoundingClientRect();seek((e.clientX-rect.left)/rect.width);});
$('seekTrack').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();seek(phase+(e.key==='ArrowLeft'?-.025:.025));}});
function pointerPosition(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)/rect.width*1000,y:(e.clientY-rect.top)/rect.height*1000};}
function hit(p){let closest=null,min=Infinity;for(const n of notes){const q=position(n),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<Math.max(16,radius(n)*1.8)&&d<min){closest=n;min=d;}}return closest;}
canvas.addEventListener('pointerdown',async e=>{const p=pointerPosition(e),n=hit(p);if(!n)return;e.preventDefault();const current=position(n),base=rawPosition(n),offset=offsets[n.id]||{x:0,y:0};offsets[n.id]={x:offset.x+current.x-base.x,y:offset.y+current.y-base.y};n.manual=true;drag={n,start:p,offset:{...offsets[n.id]}};dragMoved=false;canvas.setPointerCapture(e.pointerId);$('canvasTip').hidden=true;try{await ensureAudio();trigger(n);}catch(error){toast(error.message);}});
canvas.addEventListener('pointermove',e=>{const p=pointerPosition(e);if(drag){const dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(Math.hypot(dx,dy)>3)dragMoved=true;offsets[drag.n.id]={x:clamp(drag.offset.x+dx,-700,700),y:clamp(drag.offset.y+dy,-700,700)};drag.n.history=[];canvas.style.cursor='grabbing';return;}hover=hit(p);canvas.style.cursor=hover?'grab':'crosshair';if(hover){const rect=canvas.getBoundingClientRect(),q=position(hover);$('canvasTip').textContent=`BODY ${String(hover.id+1).padStart(2,'0')} · ${pitchName(q.y)} · ${state.engine.toUpperCase()}`;$('canvasTip').hidden=false;$('canvasTip').style.left=Math.min(e.clientX-rect.left+15,rect.width-170)+'px';$('canvasTip').style.top=Math.max(8,e.clientY-rect.top-35)+'px';}else $('canvasTip').hidden=true;});
function finishDrag(){if(drag){drag=null;persist();}canvas.style.cursor='crosshair';}
canvas.addEventListener('pointerup',finishDrag);canvas.addEventListener('pointercancel',finishDrag);canvas.addEventListener('lostpointercapture',finishDrag);
canvas.addEventListener('pointerleave',()=>{hover=null;$('canvasTip').hidden=true;});
$('help').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());$('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)||e.target.isContentEditable||$('helpDialog').open||$('recordDialog').open)return;if(e.code==='Space'){e.preventDefault();togglePlay();}if(e.key.toLowerCase()==='r'&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();if(e.shiftKey)randomizeAll();else regenerate();}});
$('export').addEventListener('click',()=>{const open=$('exportMenu').hidden;$('exportMenu').hidden=!open;$('export').setAttribute('aria-expanded',String(open));});
document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap')){$('exportMenu').hidden=true;$('export').setAttribute('aria-expanded','false');}});
function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('exportMenu').hidden=true;$('export').setAttribute('aria-expanded','false');}
$('exportPng').addEventListener('click',()=>{render();canvas.toBlob(blob=>{if(blob){download(blob,`orbital-${state.seed}.png`);toast('乐谱画面已导出');}else toast('导出失败，请重新尝试');},'image/png');});
$('exportJson').addEventListener('click',()=>{download(new Blob([JSON.stringify({format:'orbital-score',version:1,settings:state,offsets},null,2)],{type:'application/json'}),`orbital-${state.seed}.json`);toast('已保存参数与星图位置');});
$('importJson').addEventListener('click',()=>{$('fileInput').click();$('exportMenu').hidden=true;$('export').setAttribute('aria-expanded','false');});
$('fileInput').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw new Error('参数文件过大');const data=JSON.parse(await file.text());if(data.format!=='orbital-score'||data.version!==1)throw new Error('请选择 Orbital 导出的参数文件');const incoming=validate(data.settings),incomingOffsets=validateOffsets(data.offsets);resetPlayback();transition=null;$('transitionBadge').hidden=true;state=incoming;view={...state};offsets=incomingOffsets;generate(false);syncUI();if(audio)audio.update();persist();toast('宇宙已载入 · SEED '+state.seed);}catch(error){toast('导入失败：'+error.message);}finally{e.target.value='';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&capture){capture.cancel();finishCapture();toast('切到后台，录制已取消，请保持页面可见');}lastFrame=performance.now();if(document.hidden&&playing){playing=false;if(audio)audio.silence();updateTransport();}});
generate(false);syncUI();resize();updateTransport();requestAnimationFrame(frame);
})();
