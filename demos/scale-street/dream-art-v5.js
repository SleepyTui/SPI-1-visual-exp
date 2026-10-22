/* Dream Street: original vector tube construction and sixteen independent motif programs. */
(function(){
const circuits=globalThis.DreamCircuits||(typeof module!=='undefined'?require('./dream-circuits-v5.js'):null);
const palettes=[['#ff8eae','#fff1b6','#94ebdf'],['#f5b2ee','#fff0cc','#b9b5ff'],['#86e8db','#fff0bd','#f4a9cf'],['#f5b47f','#ffedb1','#b3b8ff'],['#86ddd0','#ffe0a3','#f9a3c3'],['#ffd595','#d5f3b2','#cba9fa'],['#efaddb','#ffe2a5','#a8dfe5'],['#99d6ed','#ffe4ad','#c5b0fb'],['#b4c5ff','#fff0c3','#fbaecc'],['#d6b0f2','#ffa5af','#b4e6e0'],['#ffb6ca','#b6d9ff','#ffe1a3'],['#83daca','#ffbc9a','#dbb8ff'],['#a2d0ff','#f8cfa4','#c9f1c0'],['#d1b3ff','#a4e9ef','#ffc6d4'],['#a7dff5','#efbeff','#ffe7b5'],['#f6bc93','#f8e6a8','#9be7e0']];
const programs=[
 ['檐下流云','Clouds under the eaves','cascade',6.8],['花见灯笼','Lantern procession','pendulum',7.7],['潮汐回声','Tidal echoes','wave',8.9],['织锦星火','Woven sparks','weave',5.9],
 ['铜锣涟漪','Gong ripples','ripple',9.1],['莲瓣舒展','Unfolding lotus','bloom',8.1],['孔雀开屏','Peacock fan','fan',10.3],['月拱回廊','Moonlit arcade','mirror',7.3],
 ['玻璃阶梯','Glass staircase','steps',6.3],['午夜钟楼','Midnight bells','bells',8.6],['丝绒回旋','Velvet spiral','spiral',9.7],['蓝调切分','Blue syncopation','swing',5.6],
 ['风琴织光','Woven organ light','organ',7.9],['六瓣光轮','Six-petal orbit','orbit',11.2],['八面星环','Eightfold constellation','constellation',10.7],['爵士快门','Jazz shutters','syncopation',4.9]
];
const path=(d,stroke,w,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
function tube(d,color,width,uid,extra='',gap=''){
 const dash=gap?`pathLength="100" stroke-dasharray="${gap}"`:'';
 return `<g class="tube-assembly" ${extra}>${path(d,'#07101c',width+2.5,dash)}${path(d,color,width*3.2,`${dash} opacity=".28" filter="url(#${uid}glow)"`)}${path(d,color,width,dash)}${path(d,'#fff5ee',Math.max(.23,width*.27),`${dash} opacity=".78"`)}</g>`;
}
function motifs(f,si){let ds=[];const add=(d,c=0)=>ds.push({d,c});
 switch(f){
 case 0: // swept eaves and nested cloud curls
  for(let k=0;k<4;k++)add(`M${67+k*8} ${103-k*5}Q88 ${103-k*5} 100 ${84-k*2}H220Q232 ${103-k*5} ${253-k*8} ${103-k*5}`,k%3);
  for(let k=0;k<5;k++)add(`M${81+k*33} 252q5-10 11-5q0-8 8-8q10 0 10 10h-18`,k%3);break;
 case 1:
  for(let k=0;k<8;k++){add(`M101 ${64+k*25}v15m118-15v15`,k%3);}add('M112 43h96m-90-7h84m-78-7h72',1);add('M112 281h96m-90 7h84',1);break;
 case 2:
  for(let k=0;k<5;k++)add(`M${80+k*32} 99q8-18 18-6q10 5 13-7m-24 15q8-9 16-3`,k%3);
  for(let k=0;k<3;k++)add(`M74 ${248+k*6}q18-14 36 0t36 0t36 0t36 0t30 0`,k);break;
 case 3:
  for(let k=0;k<7;k++){const x=74+k*25;add(`M${x} 118v-12h6v-6h6v6h6v12h-6v6h-6v-6z`,k%3);add(`M${x} 254l8-9 8 9-8 9z`,(k+1)%3);}break;
 case 4:
  for(let k=0;k<5;k++)add(`M${87-k*9} ${80+k*8}H${233+k*9}m-11-4l11 4-8 3`,k%3);
  for(let k=0;k<4;k++)add(`M${77+k*5} 204v36l14 14h${138-k*10}l14-14v-36`,k%3);break;
 case 5:
  for(let k=0;k<7;k++){const x=100+k*20;add(`M${x} 115q-11-12-5-26q10 8 12 23q5-12 13-17q3 13-8 20`,k%3);}for(let k=0;k<5;k++)add(`M${105+k*24} 255l7-8 7 8`,k%3);break;
 case 6:
  for(let k=0;k<9;k++){const x=90+k*17.5,y=102-Math.sin(k/8*Math.PI)*34;add(`M160 116Q${x-12} ${y-14} ${x} ${y}Q${x+12} ${y+10} 160 116`,k%3);}for(let k=0;k<6;k++)add(`M${91+k*23} 262q11-15 20 0`,k%3);break;
 case 7:
  for(let k=0;k<7;k++){const x=91+k*23;add(`M160 49Q${x} 75 ${x} 120`,k%3);}for(let k=0;k<6;k++)add(`M${88+k*25} 256q-9-8 0-12q9 4 0 12q9 8 18 0`,k%3);break;
 case 8:
  for(let k=0;k<7;k++)add(`M${82+k*23} 104v-${19+Math.sin(k/6*Math.PI)*23}h14v${19+Math.sin(k/6*Math.PI)*23}`,k%3);
  for(let k=0;k<4;k++)add(`M${83+k*7} ${247+k*5}H${237-k*7}`,k%3);break;
 case 9:
  for(let k=0;k<5;k++)add(`M${103+k*23} ${113-Math.sin(k/4*Math.PI)*42}q-7 5-7 17h14q0-12-7-17m-6 21h12`,k%3);
  for(let k=0;k<6;k++)add(`M${84+k*27} 249v11h17v-11`,k%3);break;
 case 10:
  for(let k=0;k<6;k++){const x=86+k*28;add(`M${x} 105q-14-16 0-24q14 8 0 18q-7-3-3-8`,k%3);}for(let k=0;k<3;k++)add(`M80 ${251+k*6}q40-16 80 0t80 0`,k%3);break;
 case 11:
  for(let k=0;k<8;k++){const x=78+k*24;add(`M${x} 117v-${k%3===0?19:10}m5 10v-7`,k%3);}for(let k=0;k<7;k++)add(`M${83+k*24} 260l8-10m-4 13l8-10`,k%3);break;
 case 12:
  for(let k=0;k<6;k++){const x=94+k*25;add(`M${x} 122V86h9v36m-9-28h9`,k%3);add(`M${x} 232v12h9v-12`,(k+1)%3);}break;
 case 13:
 case 14:{const n=f===13?6:8;for(let k=0;k<n;k++){const angle=k*Math.PI*2/n,cx=160+88*Math.sin(angle),cy=154-88*Math.cos(angle);add(`M${cx-8} ${cy}q8-24 16 0q-8 24-16 0m4-1q4-11 8 0`,k%3);}break;}
 case 15:
  for(let k=0;k<7;k++)add(`M${91+k*15} 49v10m-2-15h5`,k%3);
  for(let k=0;k<9;k++){const a=Math.PI*k/8,x=135+46*Math.cos(a),y=192+46*Math.sin(a);add(`M${x} ${y}l-5 7m2-10l-5 7`,k%3);}break;
 }
 // Scale-specific gate rhythm, derived from actual pitch distances, not uniform polygons.
 if(f!==1&&f!==15)for(let k=0;k<globalThis.STREET_CATALOG[f].scales[si].notes.length;k++){const note=globalThis.STREET_CATALOG[f].scales[si].notes[k],x=105+note*9;add(`M${x} 234v${5+(k+si)%3*2}`,k%3);}
 return ds;
}
function internal(f,si,ns,uid){const pal=palettes[f],ds=motifs(f,si);return `<g class="motif-program" data-program="${programs[f][2]}" data-cycle="${programs[f][3]}">`+ds.map(({d,c},i)=>`<g class="program-cell" data-cell="${i}" data-tone="${pal[c]}" color="${pal[c]}">${path(d,'#080e1d',ns.inner+2.2)}${path(d,'currentColor',ns.inner*3.4,`class="cell-bloom" opacity=".42" filter="url(#${uid}glow)"`)}${path(d,'currentColor',ns.inner,'class="cell-tube"')}${path(d,'currentColor',Math.max(.3,ns.inner*.35),'class="cell-core" style="filter:brightness(1.4)"')}${circuits.animation(f,i,ds.length,pal[c],{variation:si})}</g>`).join('')+'</g>';}
function structure(f,outline,ns,uid){const pal=palettes[f];return tube(outline,pal[0],ns.outer,uid,'class="compound-frame"','23 1.1 18 1.6 31 .9 20 3.4')+`<g transform="translate(160 156) scale(.943) translate(-160 -156)">${tube(outline,pal[2],Math.max(.5,ns.outer*.48),uid,'','17 1 26 2 38 1 12 3')}</g>`;}
function sky(depth){return `<defs>
 <linearGradient id="scene-dream-sky" x2=".35" y2="1"><stop stop-color="#0d142d"/><stop offset=".52" stop-color="#333155"/><stop offset="1" stop-color="#9b819c"/></linearGradient>
 <radialGradient id="dream-moon"><stop stop-color="#ffdfc8"/><stop offset=".55" stop-color="#ffb2ce"/><stop offset="1" stop-color="#b48cce" stop-opacity="0"/></radialGradient>
 <linearGradient id="dream-cloud" x2="0" y2="1"><stop stop-color="#a7cdd9"/><stop offset=".58" stop-color="#d9baca"/><stop offset="1" stop-color="#5a6893" stop-opacity="0"/></linearGradient>
 <linearGradient id="dream-wall" x2="1" y2=".45"><stop stop-color="#617d93"/><stop offset=".35" stop-color="#9a92b0"/><stop offset=".7" stop-color="#638d98"/><stop offset="1" stop-color="#263855"/></linearGradient>
 <linearGradient id="dream-side" x2="1" y2=".8"><stop stop-color="#1c2e48"/><stop offset=".6" stop-color="#4b536d"/><stop offset="1" stop-color="#b077a0"/></linearGradient>
 <linearGradient id="dream-road" x2=".15" y2="1"><stop stop-color="#9e9fb6"/><stop offset=".35" stop-color="#585a7e"/><stop offset="1" stop-color="#20283e"/></linearGradient>
 <linearGradient id="dream-spectrum"><stop stop-color="#c4eeed"/><stop offset=".35" stop-color="#f9d5be"/><stop offset=".6" stop-color="#f6b2d3"/><stop offset="1" stop-color="#adb9ff"/></linearGradient>
 <radialGradient id="dream-pool"><stop stop-color="#cfa3dc" stop-opacity=".7"/><stop offset="1" stop-color="#8f96c3" stop-opacity="0"/></radialGradient>
 <filter id="dream-soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="13"/></filter>
 <filter id="scene-dream-grain"><feTurbulence type="fractalNoise" baseFrequency=".87" numOctaves="2" seed="31" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
 </defs><rect width="640" height="640" fill="url(#scene-dream-sky)"/><g class="dream-sky-layer"><circle cx="320" cy="180" r="102" fill="url(#dream-moon)" opacity=".8"/>
 <g class="dream-clouds" fill="url(#dream-cloud)" opacity=".48" filter="url(#dream-soft)"><path d="M100 84q15-27 45-19 20-35 54-6 26-8 41 17h78q25 25-11 34H94q-24-14 6-26Z"/><path d="M294 194q17-23 34-13 16-36 48-10 28-18 45 16h104q28 24-8 33H285q-20-15 9-26Z"/></g>
 <g fill="#dfd9f1" opacity=".65">${Array.from({length:32},(_,i)=>{const x=18+(i*137)%606,y=8+(i*61)%330;return `<circle cx="${x}" cy="${y}" r="${i%4===0?1:.45}"/>`;}).join('')}</g><path d="M320 216v30m-15-15h30" stroke="#f8d6cc" stroke-width=".9" opacity=".7"/></g>`;}
function atmosphere(){return `<g class="dream-haze" pointer-events="none"><ellipse cx="320" cy="370" rx="78" ry="117" fill="url(#dream-moon)" opacity=".2" filter="url(#dream-soft)"/><ellipse cx="320" cy="562" rx="285" ry="80" fill="url(#dream-pool)" opacity=".7"/><g fill="none" stroke="url(#dream-spectrum)" filter="url(#dream-soft)" opacity=".35"><path d="M295 351L78 640" stroke-width="24"/><path d="M346 353L597 640" stroke-width="21"/></g><path d="M260 459q60-17 120 0M202 524q118-21 236 0M98 602q222-24 444 0" fill="none" stroke="#b9c9ed" stroke-width="10" opacity=".1" filter="url(#dream-soft)"/></g><rect class="dream-grain" width="640" height="640" filter="url(#scene-dream-grain)" opacity=".035" pointer-events="none" style="mix-blend-mode:soft-light"/>`;}
globalThis.DreamStreetArt={palettes,programs,tube,internal,structure,sky,atmosphere};
if(typeof module!=='undefined')module.exports=globalThis.DreamStreetArt;
})();
