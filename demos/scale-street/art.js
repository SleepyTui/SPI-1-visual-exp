/* All artwork is original vector geometry. Shared by the offline app and exporter. */
(function(){
const esc=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const icons=[
'M3 10L16 3l13 7M5 12h22M7 12v14m6-14v14m6-14v14m6-14v14M4 28h24',
'M4 7h24M7 11h18M10 11v16m12-16v16M5 27h22M16 4v3',
'M3 22q6-8 13 0t13 0M3 27q6-8 13 0t13 0M16 4v12M10 8l6-4 6 4',
'M16 3l13 13-13 13L3 16zM10 10l6 6 6-6m-12 12 6-6 6 6',
'M16 3v5m-4-5h8M5 10h22v6a11 11 0 01-22 0zM9 15a7 7 0 0014 0M4 28h24',
'M16 3C9 11 5 14 7 21s16 9 18 0S23 12 16 3zM16 11v17M11 20l5 5 5-5',
'M16 3C11 15 3 12 4 21q5 12 12 3 7 9 12-3c1-9-7-6-12-18zM16 14v10',
'M5 29V15Q5 9 16 3q11 6 11 12v14M10 28V16q0-4 6-7 6 3 6 7v12',
'M3 27h26M5 24V10l11-7 11 7v14M10 12v12m6-12v12m6-12v12',
'M4 26V13L16 3l12 10v13M10 24V13l6-6 6 6v11M3 29h26',
'M4 24V8m0 8 8 8V8l8 16V8l8 8m0-8v16',
'M4 6h24v20H4zM9 10v12m5-12v12m5-12v12m5-12v12M3 29h26',
'M9 3h14l7 13-7 13H9L2 16zM9 11h14M9 16h14M9 21h14',
'M16 2l12 7v14l-12 7-12-7V9zM4 9l24 14M4 23L28 9M16 2v28',
'M10 3h12l7 7v12l-7 7H10l-7-7V10zM10 10h12v12H10zM3 16h26M16 3v26',
'M7 3v26m0-24h10q12 0 5 10 10 10-5 12H7m0-12h10M26 3l-3 6'
];
function iconMarkup(f,v=0){const dots=Array.from({length:Math.min(v+1,4)},(_,i)=>`<circle cx="${11+i*3.5}" cy="30" r=".7" fill="currentColor" stroke="none"/>`).join('');return `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[f.shape]}"/>${dots}</g>`;}
function iconSVG(f,v=0){return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" color="#fff" role="img" aria-label="${esc(f.scales[v].name)} icon">${iconMarkup(f,v)}</svg>`;}
const outlines=[
'M25 32L160 8l135 24-12 28v236H37V60z',
'M65 8h190v304H65z',
'M25 60Q25 22 65 22h190q40 0 40 38v187q0 40-40 40H65q-40 0-40-40z',
'M160 8l146 146-146 154L14 154z',
'M160 10a146 146 0 110 292 146 146 0 010-292z',
'M50 300V114Q50 53 160 8q110 45 110 106v186z',
'M160 8L196 48l52-9 5 52 44 31-25 46 25 47-44 30-5 53-52-9-36 25-36-25-52 9-5-53-44-30 25-47-25-46 44-31 5-52 52 9z',
'M28 298V125q0-55 132-116 132 61 132 116v173z',
'M18 70l142-54 142 54v22H18zM32 102h256v178H32zM18 290h284v20H18z',
'M42 300V86L80 38h160l38 48v214z',
'M26 40h242v182h26v55H52v-34H26z',
'M37 12h246v296H37z',
'M76 12h168l67 148-67 148H76L9 160z',
'M160 7l142 77v152l-142 77L18 236V84z',
'M91 10h138l81 81v138l-81 81H91l-81-81V91z',
'M30 40h260v207H178l-56 59 5-59H30z'
];
function billboard(f,v=0,style='lightbox'){
const s=f.scales[v],neon=style==='neon',a=f.color,b=f.accent,p=outlines[f.shape];
const vertical=[1,11].includes(f.shape), labelY=vertical?234:226;
const titleSize= f.sign.length>7?27:f.sign.length>5?36:f.sign.length>3?47:63;
const line=(d,col=a,w=2)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const bars=s.notes.map((n,i)=>`<rect x="${95+i*(130/s.notes.length)}" y="${255-(n/12)*14}" width="${Math.max(3,90/s.notes.length)}" height="${8+(n/12)*14}" rx="1" fill="${neon?'none':b}" stroke="${b}" stroke-width="${neon?1.5:.5}"/>`).join('');
let ornament='';
if(f.shape===0)ornament=line('M40 59h240M48 69h224M50 281h220',b)+line('M52 76v24h20M268 76v24h-20',b,3);
if(f.shape===1)ornament=line('M80 22h160M80 292h160M88 32v40M232 32v40',b,3);
if(f.shape===2)ornament=[0,1,2].map(i=>line(`M45 ${276+i*6}q28-15 57 0t57 0t57 0t57 0`,b,2)).join('');
if(f.shape===3)ornament=line('M160 23l131 132-131 138L29 155z',b,2);
if(f.shape===4)ornament=`<circle cx="160" cy="156" r="134" fill="none" stroke="${b}" stroke-width="2"/><circle cx="160" cy="156" r="126" fill="none" stroke="${b}" stroke-dasharray="2 9" stroke-width="3"/>`;
if(f.shape===5)ornament=line('M63 284V117q0-52 97-94 97 42 97 94v167',b,2);
if(f.shape===6)ornament=line('M160 22l30 39 46-8 6 45 38 27-21 43 21 40-39 28-5 46-46-8-30 25-30-25-46 8-5-46-39-28 21-40-21-43 38-27 6-45 46 8z',b,2);
if(f.shape===7)ornament=line('M42 280V128q0-50 118-104 118 54 118 104v152',b,3);
if(f.shape===8)ornament=line('M47 112v156M62 112v156M258 112v156M273 112v156',b,3);
if(f.shape===9)ornament=line('M53 285V90l34-37h146l34 37v195',b,2);
if(f.shape===10)ornament=line('M40 54h213M65 259h210',b,5);
if(f.shape===11)ornament=Array.from({length:7},(_,i)=>`<circle cx="${51+i*36}" cy="26" r="3" fill="${b}"/><circle cx="${51+i*36}" cy="294" r="3" fill="${b}"/>`).join('');
if(f.shape===12)ornament=line('M86 28h148l59 132-59 132H86L27 160z',b,2);
if(f.shape===13)ornament=line('M160 21l128 70v138l-128 69-128-69V91z',b,2);
if(f.shape===14)ornament=line('M98 26h124l72 72v124l-72 72H98l-72-72V98z',b,2);
if(f.shape===15)ornament=line('M44 53h231v180H166l-25 26 2-26H44z',b,3);
const titleY=[8].includes(f.shape)?150:172;
return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="${esc(f.name+' / '+s.name+' / '+style)}"><title>${esc(s.name)} — ${esc(f.name)}</title><defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter></defs><path d="${p}" fill="#080c17" stroke="#303346" stroke-width="7"/>${neon?`<path d="${p}" fill="none" stroke="${a}" stroke-width="9" opacity=".55" filter="url(#glow)"/>`:''}<path d="${p}" fill="${neon?'#0c101c':a}" fill-opacity="${neon?1:.94}" stroke="${neon?a:b}" stroke-width="3"/>${ornament}<g color="${neon?b:'#131827'}" transform="translate(130 62) scale(1.85)">${iconMarkup(f,v)}</g><g text-anchor="middle" font-family="${esc(f.font)}" font-weight="${f.weight}"><text x="160" y="${titleY}" font-size="${titleSize}" fill="${neon?'none':'#121622'}" stroke="${neon?a:'none'}" stroke-width="${neon?1.4:0}" letter-spacing="${f.shape===10?6:1}">${esc(f.sign)}</text></g><text x="160" y="${titleY+24}" fill="${neon?b:'#262438'}" font-size="9" font-weight="700" letter-spacing="1.1" text-anchor="middle" font-family="sans-serif">${esc(f.sub)}</text><path d="M87 207h146" stroke="${neon?a:'#1a2030'}" stroke-width="1"/><text x="160" y="${labelY}" fill="${neon?b:'#131827'}" font-size="${s.label.length>15?10:13}" letter-spacing=".8" font-family="${esc(f.font)}" font-weight="${f.weight}" text-anchor="middle">${esc(s.label)}</text><g>${bars}</g><text x="160" y="284" fill="${neon?a:'#252338'}" font-size="8" letter-spacing="2" text-anchor="middle" font-family="monospace">${String(f.shape+1).padStart(2,'0')} / ${String(v+1).padStart(2,'0')} • ${s.notes.length} TONES</text></svg>`;
}
globalThis.ScaleArt={billboard,iconSVG,iconMarkup};
if(typeof module!=='undefined')module.exports=globalThis.ScaleArt;
})();
