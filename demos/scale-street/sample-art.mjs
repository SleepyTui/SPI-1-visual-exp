import fs from 'node:fs';
const glyphs=JSON.parse(fs.readFileSync(new URL('./glyphs.json',import.meta.url),'utf8'));
export const DIRECTIONS=[
 {id:'harbour',name:'港湾旧招',en:'HARBOUR LETTERS',tag:'手写字 · 珐琅 · 悬挑结构',desc:'旧街的字有自己的脾气。檐牌、窄竖灯箱、穹顶与六角药房牌，在暖白灯管下相遇。',palette:['#ed6046','#f7d99b','#53b9a3','#ef9d9e'],bg:'#111e26',font:'bungee'},
 {id:'orbital',name:'夜航新街',en:'ORBITAL ARCADE',tag:'透明盒体 · 悬浮框 · 轨道光',desc:'一条轻盈的深夜航线。透明边缘、留白和偏心轨道，让不同的文字像星图一样悬在街上。',palette:['#b09aff','#8be8fa','#ffb76d','#90f3ce'],bg:'#11152e',font:'space'},
 {id:'electric',name:'电光构成',en:'ELECTRIC CUTOUT',tag:'大字 · 折板 · 高对比色块',desc:'把字当作建筑。切开的圆、折起的箭头与不对称大字，在很小的屏幕上仍有清楚的轮廓。',palette:['#ff624c','#f5e9bf','#5da2ff','#eeeddd'],bg:'#17191f',font:'anton'}
];
export const SAMPLES=[
 {id:'gong',family:0,name:'Gong',cn:'中国 · 宫调',label:'GONG',notes:[0,2,4,7,9],region:'中国',period:'古代传统，具体形成时间有多种研究观点',note:'宫商角徵羽的十二平均律参考。',color:0},
 {id:'hirajoshi',family:1,name:'Hirajōshi',cn:'日本 · 平調子',label:'HIRAJOSHI',notes:[0,2,3,7,8],region:'日本',period:'日本传统筝调弦；名称与音阶归纳见近代文献',note:'采用常见西方音阶归纳形式；不同文献存在转位定义。',color:1},
 {id:'rast',family:7,name:'Rast',cn:'中东 · Rast',label:'RAST',notes:[0,2,3.5,5,7,9,10.5],region:'中东及东地中海',period:'长期传承的 Maqam；确切首创年代不详',note:'24等分近似：三级与七级分别为350与1050音分。',color:2},
 {id:'whole-tone',family:13,name:'Whole Tone',cn:'对称六声 · 全音',label:'WHOLE TONE',notes:[0,2,4,6,8,10],region:'跨地域应用；欧洲近现代作曲中广泛使用',period:'19—20世纪广泛探索，存在更早用例',note:'六个相等的全音；在十二平均律中有两个不同移位集合。',color:3}
];
const X=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const path=(d,fill='none',stroke='none',sw=1,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill,rx=0,stroke='none',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle=(x,y,r,fill,stroke='none',sw=1,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
export function lettering(str,x,y,size,font='space',fill='#fff',extra='',anchor='middle',maxWidth=999){
 const f=glyphs[font]; const phrase=f.phrases[str];
 const list=phrase?[]:Array.from(str).map(c=>{const g=f.glyphs[c];if(!g)throw new Error(`Missing glyph ${JSON.stringify(c)} in ${font}, text ${str}`);return g;});
 const units=phrase?phrase.w:list.reduce((a,g)=>a+g.w,0);const factor=Math.min(size/f.upem,maxWidth/Math.max(1,units));
 const left=x-(anchor==='middle'?units*factor/2:anchor==='end'?units*factor:0);
 let cursor=0;
 const pieces=phrase?phrase.parts.map(p=>`<path d="${p.d}" transform="translate(${p.x} ${p.y})" vector-effect="non-scaling-stroke"/>`).join(''):list.map(g=>{const t=`<path d="${g.d}" transform="translate(${cursor} 0)" vector-effect="non-scaling-stroke"/>`;cursor+=g.w;return t;}).join('');
 return `<g aria-label="${X(str)}" fill="${fill}" ${extra} transform="translate(${left.toFixed(3)} ${y}) scale(${factor.toFixed(6)} ${-factor.toFixed(6)})">${pieces}</g>`;
}
function frameDefs(uid){return `<defs><filter id="${uid}glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8"/></filter><filter id="${uid}shadow" x="-30%" y="-20%" width="170%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="3" flood-color="#02040b" flood-opacity=".65"/></filter><linearGradient id="${uid}glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".14"/><stop offset=".46" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".09"/></linearGradient></defs>`;}
const SYMBOLS={
 gong:'M3 12l13-8 13 8M5 14h22M8 14v12m8-12v12m8-12v12M4 28h24M9 8h14',
 hirajoshi:'M6 6h20M9 11h14M12 11v16m8-16v16M6 28h20M16 3v3M4 17h4m16 0h4',
 rast:'M5 28V15Q5 8 16 3q11 5 11 12v13M10 27V16q0-5 6-7 6 2 6 7v11M16 16v11',
 'whole-tone':'M16 2l12 7v14l-12 7-12-7V9zM4 9l24 14M4 23L28 9M16 2v28'
};
export function iconBody(id,dir=0){
 const d=SYMBOLS[id];let deco='';
 if(dir===1)deco=circle(16,16,14,'none','currentColor',1,'stroke-dasharray="2 7"');
 if(dir===2)deco=path('M2 7V2h5M25 30h5v-5','none','currentColor',2);
 return `<g fill="none" stroke="currentColor" stroke-width="${dir===2?2.4:1.7}" stroke-linecap="round" stroke-linejoin="round">${path(d,'none','currentColor',dir===2?2.4:1.7)}${deco}</g>`;
}
export function iconSVG(sample,dir){return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" color="#fff" role="img" aria-label="${sample.name} icon / ${DIRECTIONS[dir].name}">${iconBody(sample.id,dir)}</svg>`;}
function styledIcon(id,dir,x,y,size,color){return `<g color="${color}" transform="translate(${x} ${y}) scale(${size/32})">${iconBody(id,dir)}</g>`;}

export function signBody(dir,sample,depth='2d',light='lightbox',uid='a'){
 const s=typeof sample==='number'?SAMPLES[sample]:sample; const si=SAMPLES.findIndex(x=>x.id===s.id);const c=dir===0&&si===1?'#e87661':DIRECTIONS[dir].palette[s.color];
 const neon=light==='neon',deep=depth==='2.5d',ink=dir===0?'#172831':dir===1?'#10162b':'#151a25',cream='#faebc8';
 const tube=(d,col=c,w=2.6)=>path(d,'none',col,w)+path(d,'none',col,w*2.4,`opacity=".45" filter="url(#${uid}glow)"`);
 const word=(text,x,y,size,font,color=c,max=270)=>lettering(text,x,y,size,font,neon?'none':color,neon?`stroke="${color}" stroke-width="1.25" stroke-linejoin="round"`:'','middle',max);
 const small=(text,x,y,size=10,col=cream,font='space',max=260)=>lettering(text,x,y,size,font,col,'','middle',max);
 let p,back='',front='',inside='',orn='';
 const face=(p,fill,border=c,w=2)=>path(p,neon?ink:fill,border,w);
 const panel=(p,fill,border=c,w=2)=>{if(deep){back+=`<g filter="url(#${uid}shadow)">${path(p,dir===1?'#27334a':'#152b32',dir===1?'#708ba5':'#0a131c',2,`transform="translate(15 12)"`)}</g>`;}
 front+=face(p,fill,border,w);};
 const side=(d)=>{if(deep)back+=path(d,dir===0?'#31575c':dir===1?'#344b6b':'#182b48',dir===0?'#66816e':dir===1?'#9ccbe1':'#4775a8',1);};
 if(deep&&!uid.startsWith('s')){back+=path('M11 103h42M11 108h42M11 103v32h34M276 231h30v30h-19','none','#344652',5)+circle(14,105,3,'#b4b0a0')+circle(301,257,3,'#b4b0a0');}
 if(dir===0&&si===0){
  p='M27 78L54 55h204l28 23-14 20v150H40V98z';panel(p,c,cream,3);side('M272 98l15 12v150l-15-12zM40 248h232l15 12H55z');
  orn+=path('M28 78h258M42 89h230','none',neon?c:ink,4)+path('M51 109v126h210V109','none',cream,1.5);
  inside+=word('五音阁',158,168,64,'brush',neon?cream:ink,202)+small('GONG  /  CHINESE PENTATONIC',157,194,10,neon?c:ink)+small('宮  商  角  徵  羽',158,225,15,neon?cream:ink,'mincho');
  orn+=circle(63,123,7,neon?'none':cream,cream,1.5)+circle(250,123,7,neon?'none':cream,cream,1.5);
  inside+=small('01',67,135,12,neon?cream:ink,'bungee');
 }else if(dir===0&&si===1){
  p='M94 24h128v262l-18 18H76V42z';panel(p,cream,c,3);side('M222 24l14 12v262l-14-12zM76 304h128l14 12H90z');
  orn+=path('M86 45h126M86 280h126','none',c,3)+rect(83,57,19,206,neon?'none':c,0,c,1);
  inside+=word('平',159,111,59,'mincho',c)+word('調',159,177,59,'mincho',c)+word('子',159,242,59,'mincho',c)+small('HIRAJOSHI',153,274,9,neon?cream:ink);
  inside+=small('和',92,91,12,neon?cream:ink,'mincho',16);
 }else if(dir===0&&si===2){
  p='M47 279V124Q47 68 153 27q106 41 106 97v155z';panel(p,'#244e48',c,3);side('M259 124l15 12v155l-15-12zM47 279h212l15 12H62z');
  orn+=path('M59 264V125q0-44 94-83 94 39 94 83v139','none',cream,2);
  inside+=word('راست',153,158,94,'ruqaa',neon?c:cream,176)+small('RAST',153,203,31,c,'bungee')+small('MAQAM  /  7 TONES',153,226,9,cream);
  orn+=path('M78 244h150M153 46v19M87 83l12 9M219 83l-12 9','none',c,2);
 }else if(dir===0&&si===3){
  p='M86 28h143l65 120-65 120H86L21 148z';panel(p,'#224956',cream,3);side('M294 148l12 12-65 120-12-12zM86 268h143l12 12H98z');
  orn+=path('M94 41h127l58 107-58 107H94L36 148z','none',c,2);
  inside+=word('WHOLE',158,129,43,'bungee',neon?cream:c,217)+word('TONE',158,176,49,'bungee',neon?cream:c,190)+small('SIX EQUAL STEPS',158,218,10,cream);
  for(let i=0;i<6;i++)orn+=circle(106+i*21,240,2.5,c);
 }else if(dir===1&&si===0){
  p='M32 58h231l25 26v162H57l-25-25z';panel(p,'#222d52',c,1.5);side('M288 84l14 11v162l-14-11zM57 246h231l14 11H71z');
  front+=path(p,`url(#${uid}glass)`,'none');orn+=path('M40 111V67h73M278 197v38h-71','none','#c4bcff',2)+path('M48 93h215','none',c,1);
  inside+=word('宫',142,193,112,'qingke',c,125)+small('G O N G',231,161,15,'#b8f6ff','space',70)+small('01 / PENTATONIC',155,220,10,'#d9daff');
  orn+=circle(145,148,68,'none',c,1,'stroke-dasharray="100 25 17 12"');
 }else if(dir===1&&si===1){
  p='M84 34h139v240l-23 23H61V57z';panel(p,'#12333f',c,1.5);side('M223 34l16 11v240l-16-11zM61 297h139l16 11H77z');
  front+=path(p,`url(#${uid}glass)`,'none');
  inside+=word('平',146,109,58,'dot',c)+word('調',146,173,58,'dot',c)+word('子',146,237,58,'dot',c)+small('HIRAJOSHI / 02',145,280,9,'#d7ffff');
  orn+=path('M74 66v191M209 66v191','none',c,1)+rect(68,58,11,11,c,2)+rect(204,257,11,11,c,2);
 }else if(dir===1&&si===2){
  p='M45 49h218v232H45z';panel(p,'#27243e',c,1.5);side('M263 49l15 12v232l-15-12zM45 281h218l15 12H60z');
  front+=path(p,`url(#${uid}glass)`,'none');orn+=`<ellipse cx="154" cy="142" rx="100" ry="69" transform="rotate(-23 154 142)" fill="none" stroke="${c}" stroke-width="1.7"/>`;
  inside+=word('راست',154,162,77,'reem',c,171)+small('R A S T',154,216,23,'#ffddb9')+small('350 / 1050 CENTS',154,254,9,'#ead3ed');
  orn+=circle(71,174,5,c)+circle(239,107,3,'#fff1df')+path('M63 67h28M245 262h-28','none',c,2);
 }else if(dir===1&&si===3){
  p='M160 21l126 72v140l-126 72-126-72V93z';panel(p,'#123c40',c,1.5);side('M286 93l14 11v140l-126 72-14-11 126-72z');
  front+=path(p,`url(#${uid}glass)`,'none');orn+=circle(160,159,105,'none',c,1,'stroke-dasharray="95 17"')+circle(160,159,94,'none','#d5ffee',.6);
  inside+=word('HEX',160,164,65,'space',c,195)+small('WHOLE TONE',160,199,13,'#d6fff0')+small('0  2  4  6  8  10',160,244,10,c);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;orn+=circle(160+105*Math.cos(a),159+105*Math.sin(a),4,c);}
 }else if(dir===2&&si===0){
  p='M31 47h248v196h-93l-40 47v-47H31z';panel(p,c,cream,1);side('M279 47l16 12v196h-93l-40 47-16-12 40-47h93z');
  front+=rect(44,60,67,170,ink);inside+=word('宫',183,187,119,'happy',neon?cream:ink,137)+small('五音',77,97,22,cream,'happy',53)+small('GONG',77,206,17,cream,'anton',55)+small('01 / FIVE TONES',187,222,11,neon?cream:ink,'anton',151);
  orn+=path('M50 112h53M50 119h53','none',c,2)+path('M231 71l29 0 0 27','none',neon?cream:ink,5);
 }else if(dir===2&&si===1){
  p='M67 24h179v246l-28 29H67z';panel(p,cream,'#111a29',3);side('M246 24l15 13v246l-28 29-15-13 28-29z');
  front+=path('M67 24h47v275H67z',neon?'#1d2d46':'#2b54cf','none');
  inside+=word('平',179,108,62,'dela',neon?'#8ab0ff':'#1c2433',112)+word('調',179,183,62,'dela',neon?'#8ab0ff':'#1c2433',112)+word('子',179,258,62,'dela',neon?'#8ab0ff':'#1c2433',112);
  inside+=small('H',91,65,26,cream,'anton')+small('I',91,112,26,cream,'anton')+small('R',91,159,26,cream,'anton')+small('A',91,206,26,cream,'anton')+small('02',91,274,15,cream,'anton');
 }else if(dir===2&&si===2){
  p='M29 77h222v-30l55 55-55 55v-27H29zM29 154h246v110H29z';panel(p,'#3976ee',cream,1.5);side('M306 102l10 10-55 55-10-10zM275 154l15 11v111H44l-15-12h246z');
  inside+=word('راست',152,119,68,'lalezar',neon?'#9bbeff':cream,185)+word('RAST',151,234,71,'anton',neon?'#97b8ff':cream,220)+small('3 1/2  /  10 1/2',155,255,9,cream);
  orn+=path('M43 93h38M242 90l15 13-15 12','none',neon?'#b5ceff':ink,4);
 }else{
  p='M32 39h246v105h-37l37 39v98H32V176h35l-35-37z';panel(p,cream,'#111a29',3);side('M278 39l16 13v105h-24l24 26v111H47l-15-13h246v-98l-37-39h37z');
  front+=path('M32 176h246v105H32z',neon?'#263b54':'#245ad0','none');
  inside+=word('WHOLE',155,126,57,'anton',neon?cream:ink,226)+word('TONE',155,259,76,'anton',neon?'#91bbff':cream,219);
  orn+=path('M45 151h70m87 0h61','none',neon?cream:ink,4)+circle(159,151,23,neon?'none':c,neon?c:ink,3)+path('M159 133v36M141 151h36','none',neon?cream:ink,2);
 }
 // Physical joints and fasteners are part of the depth variant, not a translated shadow.
 if(deep)orn+=circle(43,84,2,'#d6d4c1','#0a1624',.7)+circle(272,239,2,'#d6d4c1','#0a1624',.7);
 if(neon){orn+=tube(si===0?'M54 270h105':si===1?'M91 313h116':si===2?'M77 294h155':'M103 310h109',c,2);}
 return frameDefs(uid)+back+`<g class="sign-plate">${front}</g>`+orn+inside;
}
export function signSVG(dir,sample,depth,light){return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="${X(DIRECTIONS[dir].name+' / '+sample.name+' / '+depth+' / '+light)}"><title>${X(sample.name)} · ${X(DIRECTIONS[dir].name)} · ${depth} · ${light}</title>${signBody(dir,sample,depth,light,`d${dir}${sample.id}${depth.replace('.','')}${light}`)}</svg>`;}

export const FAMILY_NAMES=['CHINESE','JAPANESE','RYUKYU','ETHIOPIAN','GAMELAN','THAI','RAGA','MAQAM','DIATONIC','HARMONIC','MELODIC','BLUES','MODAL SIX','WHOLE TONE','OCTATONIC','BEBOP'];
export const DETAILED_FAMILIES=[0,1,7,13];
// The artboards have a small gap even at 320px; physical silhouettes fit inside each artboard.
export const SLOTS=[
 {f:0,x:12,y:23,w:94,h:94},{f:1,x:211,y:15,w:99,h:99},
 {f:2,x:105,y:19,w:61,h:61},{f:3,x:167,y:84,w:63,h:63},
 {f:4,x:11,y:113,w:85,h:85},{f:5,x:101,y:84,w:60,h:60},
 {f:6,x:100,y:158,w:58,h:58},{f:7,x:220,y:113,w:89,h:89},
 {f:8,x:10,y:201,w:84,h:84},{f:9,x:163,y:157,w:55,h:55},
 {f:10,x:96,y:222,w:60,h:60},{f:11,x:222,y:212,w:88,h:88},
 {f:12,x:167,y:18,w:62,h:62},{f:13,x:158,y:228,w:61,h:61},
 {f:14,x:99,y:286,w:58,h:32},{f:15,x:165,y:294,w:55,h:24}
];
const DRAFT_OUTLINES=[
'M20 25h280v270H20z','M70 10h180v300H70z','M15 60q0-35 35-35h220q35 0 35 35v200q0 35-35 35H50q-35 0-35-35z',
'M160 12l148 148-148 148L12 160z','M160 14a146 146 0 110 292 146 146 0 010-292z',
'M40 300V110q0-55 120-100 120 45 120 100v190z','M160 10l45 42 59-6-5 58 49 56-49 56 5 58-59-6-45 42-45-42-59 6 5-58-49-56 49-56-5-58 59 6z',
'M40 300V120q0-60 120-110 120 50 120 110v180z','M20 80l140-65 140 65v25H20zM40 119h240v180H40z',
'M40 300V75l50-55h140l50 55v225z','M20 40h255v180h25v60H45v-30H20z','M50 12h220v296H50z',
'M80 12h160l68 148-68 148H80L12 160z','M160 12l138 74v148l-138 74-138-74V86z',
'M95 10h130l85 85v130l-85 85H95l-85-85V95z','M10 10h300v240H180l-50 60v-60H10z'
];
export function draftBody(dir,f,depth,light,uid){
 const c=DIRECTIONS[dir].palette[f%4],neon=light==='neon',deep=depth==='2.5d',p=DRAFT_OUTLINES[f];let out='';
 if(deep)out+=path(p,'#1d3244','#5d6b74',2,'transform="translate(12 9)"');
 out+=`<g class="sign-plate">${path(p,neon?'#16222c':c,neon?c:'#efe6c8',3)}</g>`;
 const col=neon?c:'#1b2632';
 if([14,15].includes(f))return out+lettering(f===14?'OCTO':'BOP!',160,193,90,DIRECTIONS[dir].font,col,'','middle',250);
 const words=FAMILY_NAMES[f].split(' ');
 out+=circle(160,100,26,'none',col,4)+path(`M137 100h46M160 77v46`,'none',col,3);
 words.forEach((w,i)=>out+=lettering(w,160,177+i*35,words.length>1?37:42,DIRECTIONS[dir].font,col,'','middle',250));
 out+=lettering('DRAFT',160,267,18,'space',neon?'#99a4ad':'#33404b');
 return out;
}
export function background(dir,depth){
 const pal=DIRECTIONS[dir].palette,bg=DIRECTIONS[dir].bg,deep=depth==='2.5d';let out=rect(0,0,320,320,bg);
 if(deep){
  out+=path('M0 0h116l44 160L0 320z',dir===1?'#1a2140':'#26353b')+path('M320 0H204l-44 160 160 160z',dir===1?'#181d36':'#223038');
  out+=path('M0 320l160-160 160 160z',dir===2?'#30363c':'#172630');
  for(const x of [0,42,83,118,202,237,278,320])out+=path(`M${x} 0L160 160`,'none','#59616c',.55,'opacity=".35"');
  for(const y of [24,69,116,208,268])out+=path(`M0 ${y}L160 160 320 ${y}`,'none','#63727b',.5,'opacity=".35"');
  for(const x of [20,73,115,205,247,300])out+=path(`M${x} 320L160 160`,'none','#556975',.6,'opacity=".4"');
  for(const y of [202,234,277,316])out+=path(`M${320-y} ${y}H${y}`,'none','#425967',.65);
  out+=rect(148,117,24,77,'#293d46',0,'#5d6871',.4)+rect(154,142,12,44,'#070e19')+path('M160 184v17','none',pal[1],1.3);
 }else{
  const heights=[104,142,118,171,157,125,105,151];
  heights.forEach((h,i)=>out+=rect(i*41,-8,38,h,dir===1?(i%2?'#222745':'#1b2240'):(i%2?'#2a373b':'#233139'),0,'#4e5c65',.5));
  out+=rect(143,92,35,172,'#101923')+path('M160 95v180','none','#4e646b',.7,'stroke-dasharray="2 5"');
  out+=rect(0,285,320,35,dir===2?'#33393d':'#1d2c35')+path('M0 289h320M0 313h320','none','#7e877f',.5);
 }
 // Quiet architectural details build density without adding extra lit advertisements.
 for(let i=0;i<22;i++){
  const x=(i*47+9)%314,y=(i*37+22)%279;
  out+=rect(x,y,4,8,i%3?'#53656c':'#8d8b72',.3,'none');
 }
 out+=path('M0 14Q90 38 159 18t161 9M0 21Q83 45 159 25t161 9','none','#090f18',1.1)+path('M0 303Q85 291 160 302t160 1','none','#728281',.5);
 return out;
}
export function streetContent(dir,depth,light,{active=null,allLit=true,transforms={}}={}){
 let out=background(dir,depth);
 for(const slot of SLOTS){const {f,x,y,w,h}=slot; const di=DETAILED_FAMILIES.indexOf(f); const tr=transforms[f]||{x:0,y:0,scale:1}; const ox=x+w/2,oy=y+h/2;
  let body=di>=0?signBody(dir,SAMPLES[di],depth,light,`s${dir}${f}`):draftBody(dir,f,depth,light,`q${dir}${f}`);
  const selected=active===f; const lit=allLit||selected;
  out+=`<g class="street-sign${selected?' selected':''}" data-family="${f}" role="button" tabindex="0" aria-label="${FAMILY_NAMES[f]}${di<0?' · composition draft':''}" aria-pressed="${selected}" transform="translate(${ox+(tr.x||0)} ${oy+(tr.y||0)}) scale(${tr.scale||1}) translate(${-w/2} ${-h/2})"><g transform="scale(${w/320} ${h/320})" ${lit?'':`filter="url(#street-dim)"`}>${body}</g><rect x="0" y="0" width="${w}" height="${h}" fill="transparent" pointer-events="all"/></g>`;
 }
 return `<defs><filter id="street-dim" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".29" intercept=".035"/><feFuncG type="linear" slope=".29" intercept=".035"/><feFuncB type="linear" slope=".29" intercept=".035"/></feComponentTransfer></filter></defs>`+out;
}
export function streetSVG(dir,depth,light){return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 320 320" role="img" aria-label="${X(DIRECTIONS[dir].name+' / '+depth+' / '+light+' street composition sample')}"><title>${X(DIRECTIONS[dir].name)} · street composition · 4 detailed signs + 12 family drafts</title>${streetContent(dir,depth,light)}</svg>`;}
