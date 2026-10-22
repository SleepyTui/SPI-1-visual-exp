/* Shared browser/export vector engine. Architecture-derived profiles; no raster images. */
(function(){
const Rig=globalThis.MountRig||(typeof module!=='undefined'?require('./mounts-v7.js'):null);
const F=globalThis.STREET_CATALOG,G=globalThis.STREET_GLYPHS,Dream=globalThis.DreamStreetArt||(typeof module!=='undefined'?require('./dream-art-v5.js'):null);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const p=(d,fill='none',stroke='none',w=1,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const r=(x,y,w,h,fill,rx=0,stroke='none',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const c=(x,y,rad,fill,stroke='none',w=1)=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
function text(str,x,y,size,font,fill,extra='',max=230){
 str=str.replaceAll('♯','#').replaceAll('♭','b');
 const shaped=G[font].phrases[str];
 if(shaped){const units=G[font].upem,k=Math.min(size/units,max/Math.max(1,shaped.w)),left=x-shaped.w*k/2,stroke=extra.match(/stroke-width="([\d.]+)"/);return `<g aria-label="${esc(str)}" fill="${fill}" ${extra}>`+shaped.parts.map(g=>`<path d="${g.d}" transform="translate(${left+g.x*k} ${y-g.y*k}) scale(${k} ${-k})" ${stroke?`stroke-width="${Number(stroke[1])/k}"`:''}/>`).join('')+'</g>';}
 const chars=Array.from(str),parts=chars.map(ch=>{let ff=G[font],g=ff.glyphs[ch];if(!g){for(const k of ['mincho','brush','happy','qingke','space']){if(G[k].glyphs[ch]){ff=G[k];g=ff.glyphs[ch];break;}}}if(!g)throw Error(`Missing glyph ${ch}`);return{g,units:ff.upem};});
 const width=parts.reduce((n,a)=>n+a.g.w/a.units*size,0),scale=Math.min(1,max/Math.max(1,width));let xx=x-width*scale/2;
 const stroke=extra.match(/stroke-width="([\d.]+)"/);
 return `<g aria-label="${esc(str)}" fill="${fill}" ${extra}>`+parts.map(({g,units})=>{const k=size/units*scale,s=`<path d="${g.d}" transform="translate(${xx.toFixed(3)} ${y}) scale(${k} ${-k})" ${stroke?`stroke-width="${Number(stroke[1])/k}"`:''}/>`;xx+=g.w*k;return s;}).join('')+'</g>';
}
// 16 compound profiles: roofs, cresting, bracketed cornices, lancets, tracery and instrument outlines.
const PROFILES=[
'M24 98Q47 97 55 76L72 64H248l17 12q8 21 31 22l-10 17h-13v137h-12v17H59v-17H47V115H34z',
'M103 21h114v17l16 11v224l-16 13v16H103v-16l-16-13V49l16-11z',
'M36 106q26 0 43-26l18-20h126l18 20q17 26 43 26l-9 17h-15v123q18 5 18 20-20-11-37 2-19 12-39 0-22 13-42 0-22 13-42 0-19 12-39 0-17-13-37-2 0-15 18-20V123H45z',
'M137 19h46v24h24v23h25v25h24v25h20v162H44V116h20V91h24V66h25V43h24z',
'M26 118q34-1 48-22l26-39h120l26 39q14 21 48 22l-10 15h-23v23l16 13v17l-15 10v65l-20 20H78l-20-20v-65l-15-10v-17l16-13v-23H36z',
'M160 8q4 30 21 42 23-15 31-27 1 31-11 45 21 29 75 38l-13 20h-22v125l15 21H64l15-21V126H57l-13-20q54-9 75-38-12-14-11-45 8 12 31 27 17-12 21-42z',
'M159 13l15 26q27 0 40 20 28 0 35 27l26 8v17l-17 12v128l16 15v14H45v-14l16-15V123l-17-12V94l26-8q7-27 35-27 13-20 40-20z',
'M160 14l10 19q96 35 96 108v110l17 10v16H37v-16l17-10V141q0-73 96-108z',
'M55 87q-24-30 3-47 22-10 32 13 16-16 40-9l30-22 30 22q24-7 40 9 10-23 32-13 27 17 3 47v153q21 15 9 31-17 17-37 0H83q-20 17-37 0-12-16 9-31z',
'M66 30l12 36 17 14 65-63 65 63 17-14 12-36 10 58v175l15 16H41l15-16V88z',
'M58 264q-30-19-13-47l10-19V104q-14-38 17-53 19-9 37 5 18-30 51-31 39 0 55 31 26-19 49 4 21 22 2 49v90l10 19q16 29-14 46l-21 13H79z',
'M121 15h78l12 47-14 27h39l30 29v141l-25 26H79l-25-26V118l30-29h39l-14-27z',
'M72 43h176v19l24 17-17 15v148l17 16-24 19H72l-24-19 17-16V94L48 79l24-17z',
'M160 13q25 0 37 31 32-13 53 9 22 21 9 53 31 12 31 37 0 28-31 39 13 32-9 54-21 21-53 8-12 31-37 31-28 0-39-31-32 13-54-8-21-22-8-54-31-11-31-39 0-25 31-37-13-32 8-53 22-22 54-9 11-31 39-31z',
'M160 14q20 0 31 23 25-9 39 5 19 7 19 30 25 5 31 25 15 17 0 40 18 18 8 38-5 25-29 29 0 26-23 35-11 22-37 13-15 21-39 21-24 0-39-21-26 9-37-13-23-9-23-35-24-4-29-29-10-20 8-38-15-23 0-40 6-20 31-25 0-23 19-30 14-14 39-5 11-23 31-23z',
'M75 40h151l-9 29H104v117q0 37 31 37 30 0 30-33v-35l-24-13 11-27 92 39-12 29-24-6v22q0 75-73 75-76 0-76-77V69H44l-8-29h39z'
];
const CENTERS=[[160,171],[160,172],[160,171],[160,180],[160,189],[160,184],[160,174],[160,184],[160,179],[160,185],[160,178],[160,189],[160,177],[160,166],[160,163],[150,98]];
function ornaments(f,col,light,uid,inner=2){
 const neon=light==='neon',w=neon?inner:2.2;let a='';
 const line=d=>p(d,'none',col,w);
 if(f===0)a+=line('M47 103h226M61 116v128h198V116M70 78l-9 14h198l-9-14M86 248v13m25-13v13m98-13v13m25-13v13');
 if(f===1)a+=line('M107 49h106M107 273h106M100 65v191M220 65v191M111 30h98M111 293h98');
 if(f===2)a+=line('M58 114h204M83 90h154M93 73h134M73 237q19-11 38 0t38 0t38 0t38 0t29 0M80 249q19-11 38 0t38 0t38 0t38 0');
 if(f===3){a+=line('M60 128h200M62 262h196M148 31h24M125 55h70M101 79h118');for(let i=0;i<8;i++)a+=line(`M${66+i*26} 132l10 10-10 10 10 10`);}
 if(f===4)a+=line('M47 123h226M77 106h166M101 70h118M75 200v50l16 15h138l16-15v-50')+c(160,160,58,'none',col,w)+c(160,160,51,'none',col,1);
 if(f===5)a+=line('M75 115h170M91 252h138M112 94q48-36 96 0M150 53l10-21 10 21M93 130v103m134-103v103');
 if(f===6)a+=line('M75 244V120q0-37 32-37 14-29 38-19l15-19 15 19q24-10 38 19 32 0 32 37v124M59 266h201M89 252h142');
 if(f===7)a+=line('M69 246V141q0-63 91-94 91 31 91 94v105M75 260h170M160 28v29M80 129l14-6M240 129l-14-6');
 if(f===8)a+=line('M70 101V77q12 4 20-9 27 13 40-4l30-24 30 24q13 17 40 4 8 13 20 9v24M70 237h180M85 249h150');
 if(f===9)a+=line('M69 257V105l35 15 56-79 56 79 35-15v152M78 250V128m164 0v122M144 80l16-23 16 23');
 if(f===10)a+=line('M65 249q-14-19 5-42V107q-13-35 13-44 14-4 26 8 22-28 51-29 29 0 48 29 25-19 41 3 9 14-2 34v100q16 24 3 41M85 260q35-13 75 0t75 0');
 if(f===11){a+=line('M133 32h54l9 27-11 19h-50l-11-19zM68 125v130l18 16h148l18-16V125');for(let i=0;i<8;i++)a+=c(75+i*24,105,3,neon?'none':col,col,1.5);}
 if(f===12){a+=line('M80 69h160M80 251h160M75 92v144m170-144v144');for(let i=0;i<6;i++)a+=line(`M${97+i*25} 91v34M${97+i*25} 220v21`);}
 if(f===13||f===14){const n=f===13?6:8;for(let i=0;i<n;i++){const angle=i*2*Math.PI/n,xx=160+82*Math.sin(angle),yy=154-82*Math.cos(angle);a+=`<ellipse cx="160" cy="95" rx="18" ry="48" transform="rotate(${i*360/n} 160 154)" fill="none" stroke="${col}" stroke-width="${neon?1.8:1.5}"/>`;}a+=line(f===13?'M92 252q68 20 136 0':'M91 246q69 23 138 0');}
 if(f===15)a+=line('M81 59v132q0 55 54 55 52 0 52-55v-41M161 132l60 25M136 255v-52M126 204h22M126 221h22M126 238h22');
 return `<g class="traditional-ornament">${neon?a.replace(/stroke-width="[^"]+"/g,`stroke-width="${inner}"`):a}</g>`;
}
function defs(uid,glow=2.1){return `<defs><filter id="${uid}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${glow}"/></filter><filter id="${uid}shadow" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="2" dy="7" stdDeviation="3" flood-opacity=".65"/></filter></defs>`;}
function signBody(f,si=0,{lang='zh',depth='2.5d',light='lightbox',uid='plate',neonStyle={}}={}){
 const fam=F[f],s=fam.scales[si],col=light==='neon'?Dream.palettes[f][0]:fam.color,acc=light==='neon'?Dream.palettes[f][1]:fam.accent,ink='#111c29',neon=light==='neon',deep=depth==='2.5d',outline=PROFILES[f];
 const ns={outer:2.2,inner:1.3,glow:2.1,...neonStyle};let a=defs(uid,ns.glow);
 if(deep){a+=`<g class="sign-side" filter="url(#${uid}shadow)">${p(outline,'#253149','#9c95ae',1.2,'transform="translate(13 10)"')}${p('M'+(f===1?'233 49l13 10v224l-13-10':'273 118l13 10v132l-13-10')+'z','#24424d','#6d7a73',1)}</g>`;}
 a+=`<g class="sign-plate">${p(outline,neon?'#141c30':col,neon?'#47516c':acc,neon?1:2.4)}</g>`;
 if(f===13||f===14)a+=r(78,111,164,93,neon?'#0b1420':col,7);
 if(neon)a+=`<g class="neon-emission">${Dream.structure(f,outline,ns,uid).replace(`stroke="${col}" stroke-width="${ns.outer}"`,`class="neon-border" stroke="${col}" stroke-width="${ns.outer}"`)}`;
 // Parallel glass tubes and intentional electrode gaps are part of the frame artwork.
 a+=neon?Dream.internal(f,si,ns,uid):ornaments(f,'#253339',light,uid,ns.inner);
 const [xx,yy]=CENTERS[f],font=fam.nativeFont;
 const mark=s.nativeTitle;
 const foreground=neon?acc:ink;
 let lettering='';
 if(f===1){const chars=Array.from(mark);chars.forEach((ch,i)=>{lettering+=text(ch,160,105+i*(chars.length>3?41:57),49,font,foreground,'',108);});}
 else if(f===13||f===14){lettering+=text(mark,xx,yy+18,76,font,foreground,'',158);}
 else lettering+=text(mark,xx,yy+12,f===15?42:(f===4?55:100),font,foreground,'',[194,100,184,172,158,128,158,174,160,166,174,170,146,158,158,148][f]);
 if(f!==1)lettering+=text(s.nativeSubtitle,160,f===15?116:222,15,font,foreground,'',f===15?148:180);
 const union=globalThis.STREET_LETTERING?.[`${f}:${si}`];
 if(union){
  if(neon){a+=`<g class="neon-lettering" color="${foreground}" data-boolean="union">${ns.glow?`<g opacity=".65" filter="url(#${uid}glow)">${p(union.d,'none',foreground,ns.inner*2)}</g>`:''}${p(union.d,'none','currentColor',ns.inner,`id="${uid}letter" class="neon-inner-line" stroke-dasharray="49 1.5 27 1.1"`)}${Array.from({length:5},(_,j)=>`<defs><clipPath id="${uid}scan${j}"><rect x="${40+j*48}" y="30" width="48" height="260"/></clipPath></defs><g class="letter-cell program-cell" data-cell="${j+30}" data-tone="${Dream.palettes[f][2]}" color="${Dream.palettes[f][2]}" clip-path="url(#${uid}scan${j})"><use href="#${uid}letter" stroke="currentColor" stroke-width="${ns.inner*.55}" style="stroke:currentColor;stroke-width:${ns.inner*.55}"/></g>`).join('')}</g>`;}
  else a+=`<g class="sign-lettering" data-boolean="union">${p(union.d,foreground)}</g>`;
 }else a+=`<g class="letter-form">${lettering}</g>`;
 const baseY=f===1?263:f===15?153:244;
 if(f!==15){a+=p(`M${123-si%4*4} ${baseY}h${74+si%4*8}`,'none',foreground,neon?ns.inner:1);for(let k=0;k<Math.min(s.notes.length,8);k++)a+=c(126+k*9.5,baseY+8,1.3,foreground);}
 if(neon)a+=`<g class="chase-lights" opacity="0">${p(outline,'none',acc,ns.outer+1,'pathLength="100" stroke-dasharray="9 7"')}</g>`;
 if(neon)a+='</g>';
 return a;
}
function signSVG(f,si,opts={}){return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="${esc(F[f].scales[si].nativeTitle)}"><title>${esc(F[f].scales[si].nativeTitle)}</title>${signBody(f,si,opts)}</svg>`;}
function iconSVG(f,si,{lang='zh'}={}){
 const fam=F[f],s=fam.scales[si],label=s.nativeIcon;
 // Simplified squared adaptation of the same outer profile; only contour and one/two glyphs remain.
 const vertical=f===1;const transform=vertical?'translate(-5.9 -1.2) scale(.137 .105)':'translate(.3 .1) scale(.098 .105)';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="${esc(s.nativeTitle)}"><g color="#fff">${p(PROFILES[f],'none','currentColor',1.5,`transform="${transform}" vector-effect="non-scaling-stroke"`)}${text(label,16,20,12,fam.nativeFont,'#fff','',22)}</g></svg>`;
}
// Deliberately staggered plaques, each attached to its own facade; lower 1/5 remains road.
const SLOTS=[
 {f:0,x:4,y:26,w:164,h:147,side:-1,b:0},{f:4,x:14,y:192,w:146,h:137,side:-1,b:1},
 {f:3,x:8,y:348,w:150,h:105,side:-1,b:2},{f:2,x:40,y:468,w:124,h:82,side:-1,b:3},
 {f:5,x:226,y:2,w:84,h:121,side:-1,b:4},{f:6,x:174,y:140,w:88,h:131,side:-1,b:5},
 {f:12,x:207,y:288,w:92,h:87,side:-1,b:6},{f:8,x:267,y:234,w:48,h:70,side:-1,b:7},
 {f:1,x:478,y:5,w:151,h:224,side:1,b:0},{f:7,x:469,y:250,w:165,h:171,side:1,b:1},
 {f:11,x:483,y:439,w:144,h:109,side:1,b:2},{f:15,x:326,y:3,w:105,h:119,side:1,b:3},
 {f:10,x:361,y:142,w:105,h:99,side:1,b:4},{f:9,x:331,y:256,w:124,h:127,side:1,b:5},
 {f:13,x:332,y:394,w:80,h:72,side:1,b:6},{f:14,x:418,y:435,w:62,h:85,side:1,b:7}
];
function quad(points,fill,stroke='none',sw=1){return `<polygon points="${points.map(a=>a.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;}
function facade(side,j,f,buildingDepth=130){
 const edge=[0,83,152,206,246,273,291,304,316],gap=j<3?5:j<6?3:1.7,x0=edge[j]+gap,x1=edge[j+1]-gap,mirror=x=>side<0?x:640-x;
 const heights=side<0?[112,12,173,56,219,151,265,234]:[38,174,14,221,112,258,187,278];
 const roof=heights[j],roofFar=320-(320-roof)*.87,ground=x=>640-x,top=x=>roof+(roofFar-roof)*(x-x0)/(x1-x0);
 const a=[mirror(x0),top(x0)],b=[mirror(x1),top(x1)],cc=[mirror(x1),ground(x1)],d=[mirror(x0),ground(x0)],returnWidth=Math.max(0,(32-j*3.5)*buildingDepth/100),ex=-side*returnWidth;
 let out=`<g class="building" data-building="${f}" data-distance="${j/7}" data-roof-height="${roof}" data-building-gap="${gap*2}">`;
 const backTop=[b[0]+ex,b[1]+(320-b[1])*.12],backFoot=[cc[0]+ex,cc[1]-(cc[1]-320)*.12],nearBack=[a[0]+ex,a[1]+(320-a[1])*.12];
 out+=`<g class="building-return" data-depth="${returnWidth}">${quad([b,backTop,backFoot,cc],'url(#dream-side)','#687a91',.8)}`;
 for(let floor=1;floor<8;floor++){const v=floor/8,l=[b[0],b[1]+(cc[1]-b[1])*v],rr=[backTop[0],backTop[1]+(backFoot[1]-backTop[1])*v];out+=p(`M${l}L${rr}`,'none','#72839c',.55);if(returnWidth>3){const pts=[[l[0]+ex*.25,l[1]+2],[l[0]+ex*.78,l[1]+(rr[1]-l[1])*.78+2],[l[0]+ex*.78,l[1]+(rr[1]-l[1])*.78+9],[l[0]+ex*.25,l[1]+9]];out+=quad(pts,'#25394e','#95a7b6',.35)+`<g class="window-light side-window" data-row="${floor}" data-window="${f*100+80+floor}">${quad(pts,'#25394e')}</g>`;}}
 out+='</g>';out+=`<g class="building-roof-plane">${quad([a,b,backTop,nearBack],'#5d7186','#bac9ce',.7)}</g>`;
 out+=quad([a,b,cc,d],'url(#dream-wall)','#b4c6d0',.6);out+=quad([a,b,cc,d],['#e8bad4','#9ebfe5','#c7b2ea','#97dbcf'][j%4],'none',0).replace('<polygon','<polygon opacity=".13"');out+=p(`M${a}L${d}`,'none',side<0?'#f3bdd2':'#9edfdc',1.1,'opacity=".65"');
 out+=`<g class="roofline">${p(`M${a}L${b}`,'none','#9d9c87',1.8)}`;
 const mid=(a[0]+b[0])/2,ry=(a[1]+b[1])/2;
 if(j%3===0){const tw=Math.max(5,(x1-x0)*.24);out+=r(mid-tw/2,ry-21,tw,15,'#3d494c',2,'#81847a',.8)+`<ellipse cx="${mid}" cy="${ry-21}" rx="${tw/2}" ry="2.5" fill="#65706e" stroke="#9b9f8c" stroke-width=".6"/>`+p(`M${mid-tw*.35} ${ry-5}v10M${mid+tw*.35} ${ry-5}v10`,'none','#8e9487',1);}
 else if(j%3===1)out+=r(mid-7,ry-17,14,16,'#2d3a40',0,'#728079',.7)+p(`M${mid-9} ${ry-18}h18`,'none','#a5a18c',1.4);
 else out+=p(`M${mid} ${ry}v-27m-7 7h14m-5-6h10M${mid-5} ${ry}l5-12 5 12`,'none','#83948d',1);
 out+='</g>';
 const at=(u,v)=>{const x=x0+(x1-x0)*u;return[mirror(x),top(x)+(ground(x)-top(x))*v];};
 const floors=[5,12,6,10,5,8,6,4][j],columns=j%3===0?2:3;
 for(let floor=1;floor<floors;floor++){
  const v=floor/floors,from=at(0,v),to=at(1,v);out+=p(`M${from}L${to}`,'none',floor%2?'#505453':'#151e25',.7);
  for(let col=0;col<columns;col++){
   const u=.12+col*(.78/columns),u2=u+.61/columns,v2=v+.52/floors;
   const win=[at(u,v+.012),at(u2,v+.012),at(u2,v2),at(u,v2)],lit=(floor+col+j)%7===0||(floor+col+j)%4===0;
   out+=quad(win,'#24394f','#afc6d0',.35);
   out+=`<g class="window-light" data-row="${floor}" data-default-lit="${lit}" data-window="${f*100+floor*3+col}" style="animation-delay:${-(f*1.37+floor*.83+col*2.1)}s;--window-period:${13+(floor+col+f)%11}s">${quad(win,lit?((floor+col+j)%7===0?'#ffe7b9':['#c1dbe0','#e0b4d7','#a8d5cb'][(floor+col)%3]):'#172737')}</g>`;
   if((floor+col+j)%3===0){const aa=at(u,v2+.003),bb=at(u2,v2+.003);out+=p(`M${aa}L${bb}`,'none','#94908a',1);}
  }
 }
 const shop=[at(.05,.87),at(.95,.87),at(.95,.995),at(.05,.995)];out+=quad(shop,'#142128','#6b6963',.7);
 for(let k=0;k<6;k++){const v=.887+k*.016;out+=p(`M${at(.05,v)}L${at(.95,v)}`,'none','#5f6666',.6);}
 out+=p(`M${at(.025,0)}L${at(.025,.99)}`,'none','#606966',1.5);
 const ac=at(.44,.67),aw=Math.max(2,(x1-x0)*.28);out+=r(ac[0]-aw/2,ac[1],aw,Math.max(3,aw*.5),'#69726f',.5,'#222d33',1);
 for(let k=1;k<4;k++)out+=p(`M${ac[0]-aw*.35} ${ac[1]+k*aw*.1}h${aw*.7}`,'none','#252e33',.6);
 out+=`</g>`;return out;
}
function trafficPassSVG(i,settings={}){
 const cfg={animate:true,speed:1,variation:.85,...settings},ends=[62,125,203,456,535,592,89,171,420,499,566,223,43,143,475,615],end=ends[i%16],start=320+(end-320)*.10625,finish=320+(end-320)*1.1125,col=end<320?'#ff4b36':'#fff0c4',d=`M${start} 354L${finish} 676`,ray=d,duration=(5.8+i%5*.67)/cfg.speed,phase=(i*.271+.14)%1,begin=-phase*duration,min=Math.max(0,1-cfg.variation*1.4),q=phase,x=start+(finish-start)*q,y=354+322*q;
 const timing=`dur="${duration}s" begin="${begin}s" repeatCount="indefinite"`,dash=cfg.animate?`<animate attributeName="stroke-dashoffset" values=".18;-.82" ${timing}/>`:'',a=cfg.animate?`<animate attributeName="opacity" values="${min};1;1;${min}" keyTimes="0;.12;.8;1" ${timing}/>`:'';
 // Streak, blurred silhouette and lamps share one clock and one passage envelope.
 const trail=(width,filter,opacity)=>`<path class="moving-trail" d="${ray}" fill="none" stroke="${col}" stroke-width="${width}" pathLength="1" stroke-dasharray=".18 1" stroke-dashoffset="${.18-q}" opacity="${opacity}" ${filter?`filter="url(#${filter})"`:''}>${dash}</path>`;
 return `<g class="traffic-pass" data-pass="${i}" opacity="${cfg.animate?1:min+(1-min)*Math.sin(q*Math.PI)}">${a}${trail(5,'trail-soft',.62)}${trail(1.3,'',.95)}<g class="vehicle-motion" ${cfg.animate?'':`transform="translate(${x} ${y})"`}>${cfg.animate?`<animateMotion path="${d}" ${timing}/>`:''}<g class="vehicle-size" transform="scale(${.12+q*1.28})">${cfg.animate?`<animateTransform attributeName="transform" type="scale" values=".12;1.4" ${timing}/>`:''}<g class="vehicle-silhouette" filter="url(#car-soft)">${p('M-17 0l2-10 6-7H9l6 7 2 10-4 4h-26z','#24303a','#66737a',.8)}${p('M-9-15H9l4 7H-13z','#0c1723')}<path d="M-17 3h34" stroke="#84949a" stroke-width="1.2"/></g><g class="vehicle-lamps">${r(-15,-2,7,2.4,col,1)}${r(8,-2,7,2.4,col,1)}${p('M-15 0h7m16 0h7','none',col,4,'filter="url(#trail-soft)"')}</g></g></g></g>`;
}
function background(depth='2.5d',buildingDepth=130){
 let out=`<defs><radialGradient id="sky-haze"><stop stop-color="#647477" stop-opacity=".48"/><stop offset="1" stop-color="#111722" stop-opacity="0"/></radialGradient><linearGradient id="wet-road" x2="0" y2="1"><stop stop-color="#1b2931"/><stop offset="1" stop-color="#10141e"/></linearGradient><filter id="trail-soft"><feGaussianBlur stdDeviation="2.7"/></filter><filter id="trail-bloom"><feGaussianBlur stdDeviation="7"/></filter></defs>`+Dream.sky(depth);
 out+='<g class="architecture">';for(let j=0;j<7;j++){const x=298+j*7,y=215+(j%3)*22;out+=r(x,y,7,126,'#1c2932');for(let k=0;k<8;k++)out+=r(x+2,y+5+k*12,2,3,k%3?'#46575e':'#aaa181');}
 const left=SLOTS.filter(s=>s.side<0).sort((a,b)=>b.b-a.b),right=SLOTS.filter(s=>s.side>0).sort((a,b)=>b.b-a.b);
 for(const s of [...left,...right])out+=facade(s.side,s.b,s.f,buildingDepth);
 out+='</g>';out+=p('M311 329L0 640h640L329 329z','url(#dream-road)');
 out+=p('M309 331L0 640M331 331L640 640','none','#88918d',1.6)+p('M307 337L0 618M333 337L640 618','none','#3b454b',4);
 out+=p('M320 356l-2 18M316 391l-4 38M307 466l-8 65M291 574l-11 66','none','#c5b988',1.5,'opacity=".45"');
 for(let k=0;k<11;k++){const y=438+k*18;const yy=y+3;out+=p(`M${320-(y-320)*1.08} ${y}L${320+(y-320)*1.08} ${yy}`,'none',k%2?'#485359':'#1d303b',.6,'opacity=".4"');}
 // Every ray lies on a straight line through the same (320,320) vanishing point.
 const tails=[[62,'#ff3c32',6],[125,'#e85b48',3],[535,'#ffe5b4',7],[592,'#fff8dd',3.7],[456,'#f8b757',2]].map(([end,col,w])=>[`M${320+(end-320)*.10625} 354L${end} 640`,col,w]);
 out+='<g class="traffic-light"><defs><filter id="car-soft" x="-70%" y="-80%" width="240%" height="260%"><feGaussianBlur stdDeviation="1.4"/></filter></defs><g class="traffic-exposure" opacity=".2">';for(const [d,col,w]of tails)out+=p(d,'none',col,w*3,`opacity=".27" filter="url(#trail-bloom)"`)+p(d,'none',col,w,`opacity=".72" filter="url(#trail-soft)"`)+p(d,'none',col,Math.max(1,w*.24),'opacity=".85"');out+='</g>';
 out+=`<g class="traffic-flow">${Array.from({length:8},(_,i)=>trafficPassSVG(i)).join('')}</g></g>`;
 out+=Dream.atmosphere();out+=p('M0 63Q182 124 320 77t320-6M0 68Q182 133 320 83t320-6','none','#394255',1.2);
 return out;
}
function mounting(slot,rigSettings){return Rig.svg(slot,rigSettings);}
function street({lang='zh',depth='2.5d',light='lightbox',indices=Array(16).fill(0),active=0,allLit=false,neonStyle={},buildingDepth=130,rigSettings={},rigOverrides={}}={}){
 let out=background(depth,buildingDepth);out+=`<defs><filter id="dim-sign" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".38" intercept=".014"/><feFuncG type="linear" slope=".38" intercept=".014"/><feFuncB type="linear" slope=".38" intercept=".014"/></feComponentTransfer></filter></defs>`;
 for(const slot of [...SLOTS].sort((a,b)=>b.b-a.b)){
  const {f,x,y,w,h}=slot,si=indices[f]||0,neon=light==='neon',lit=allLit||active===f;
  // One uniform scale preserves letterforms and the native sign silhouette.
  const box=f===1?[79,13,169,305]:[18,0,296,300],k=Math.min(w/box[2],h/box[3]),tx=(w-box[2]*k)/2-box[0]*k,ty=(h-box[3]*k)/2-box[1]*k;
  out+=`<g class="street-sign${active===f?' selected':''}" data-family="${f}" data-distance="${slot.b/7}" role="button" tabindex="0" aria-label="${esc(lang==='zh'?F[f].cn:F[f].name)}" aria-pressed="${active===f}" transform="translate(${x} ${y})"><g class="depth-layer"><g transform="translate(${-x} ${-y})">${mounting(slot,rigOverrides[f]||rigSettings)}</g><g class="light-effect"><g class="sign-art" transform="translate(${tx} ${ty}) scale(${k})" ${lit?'':'filter="url(#dim-sign)"'}>${signBody(f,si,{lang,depth,light,neonStyle,uid:`f${f}i${si}`})}</g></g></g><rect x="0" y="0" width="${w}" height="${h}" fill="transparent" pointer-events="all"/></g>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" data-edition="dream-v5" aria-label="${lang==='zh'?'梦游音阶长街':'Dream scale street'}">${`<g class="scene-content">${out}</g>`}</svg>`;
}
globalThis.ScaleStreetArt={signBody,signSVG,iconSVG,street,trafficPassSVG,SLOTS,PROFILES,text};
if(typeof module!=='undefined')module.exports=globalThis.ScaleStreetArt;
})();
