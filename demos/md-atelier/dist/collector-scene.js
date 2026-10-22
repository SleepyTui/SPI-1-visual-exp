'use strict';
(()=>{
const C=window.MDCollector,$=s=>document.querySelector(s),settings=C.settings;
const syncLab=CollectorBackdrop.mount(C);
const fields={sideCount:'side-count',overview:'overview',mapEnabled:'map-enabled',shadow:'map-shadow',color:'map-color',highlight:'map-highlight',strength:'map-strength'};
function sync(){for(const [key,id] of Object.entries(fields)){const input=$('#'+id);if(input.type==='checkbox')input.checked=settings[key];else input.value=settings[key];}$('#side-count-output').textContent=settings.sideCount;$('#map-strength-output').textContent=settings.strength+'%';syncLab();}
for(const [key,id] of Object.entries(fields))$('#'+id).addEventListener('input',e=>{const input=e.target;settings[key]=input.type==='checkbox'?input.checked:input.type==='range'?+input.value:input.value;sync();C.refresh();});
$('#reset-scene').onclick=()=>{Object.assign(settings,C.defaults);sync();C.refresh();};
sync();C.paint();
const n=x=>Number(x.toFixed(5)),esc=MD.esc;
// SVG has no CSS 3D transforms. Subdivide textured planes and project their
// vertices with the same DOM matrix and perspective as the browser preview.
// No foreignObject: the resulting SVG can also be decoded by a canvas for PNG.
function snapshot(){
const screen=$('#screen'),shelf=$('#shelf'),W=screen.clientWidth,H=screen.clientHeight;
let defs=[],body=[],serial=0;
const perspective=parseFloat(getComputedStyle(shelf).perspective)||1000,po=getComputedStyle(shelf).perspectiveOrigin.split(' ').map(parseFloat);
function projector(el){const style=getComputedStyle(el),matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform),origin=style.transformOrigin.split(' ').map(parseFloat),ox=origin[0],oy=origin[1];return(x,y,z=0)=>{const p=new DOMPoint(x-ox,y-oy,z).matrixTransform(matrix);let xx=el.offsetLeft+ox+p.x,yy=el.offsetTop+oy+p.y;if(!settings.overview){const k=perspective/(perspective-p.z);xx=po[0]+(xx-po[0])*k;yy=po[1]+(yy-po[1])*k;}return[shelf.offsetLeft+xx,shelf.offsetTop+yy];};}
function polygon(points,fill){return `<path d="M${points.map(p=>p.map(n).join(',')).join('L')}Z" fill="${fill}"/>`;}
function texture(src,w,h,project,filter='none',nx=6,ny=6){
const asset='asset'+serial++;defs.push(`<image id="${asset}" width="${w}" height="${h}" preserveAspectRatio="none" href="${esc(src)}"/>`);
let triangles='';
const p00=project(0,0),p10=project(w,0),p01=project(0,h),p11=project(w,h);
if(Math.hypot(p11[0]-p10[0]-p01[0]+p00[0],p11[1]-p10[1]-p01[1]+p00[1])<.01){return `<g style="filter:${esc(filter)}" transform="matrix(${[(p10[0]-p00[0])/w,(p10[1]-p00[1])/w,(p01[0]-p00[0])/h,(p01[1]-p00[1])/h,p00[0],p00[1]].map(n).join(' ')})"><use href="#${asset}"/></g>`;}
function triangle(a,b,c){const A=project(...a),B=project(...b),D=project(...c),den=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(den)<1e-8)return;const aa=((B[0]-A[0])*(c[1]-a[1])-(D[0]-A[0])*(b[1]-a[1]))/den,cc=((D[0]-A[0])*(b[0]-a[0])-(B[0]-A[0])*(c[0]-a[0]))/den,bb=((B[1]-A[1])*(c[1]-a[1])-(D[1]-A[1])*(b[1]-a[1]))/den,dd=((D[1]-A[1])*(b[0]-a[0])-(B[1]-A[1])*(c[0]-a[0]))/den;
// A subpixel overlap prevents antialiasing cracks between projected tiles.
const center=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3],expanded=[a,b,c].map(p=>{const dx=p[0]-center[0],dy=p[1]-center[1],k=1+.18/Math.hypot(dx,dy);return[center[0]+dx*k,center[1]+dy*k];});
const id='tri'+serial++;defs.push(`<clipPath id="${id}"><path d="M${expanded.map(p=>p.map(n).join(',')).join('L')}Z"/></clipPath>`);triangles+=`<g transform="matrix(${[aa,bb,cc,dd,A[0]-aa*a[0]-cc*a[1],A[1]-bb*a[0]-dd*a[1]].map(n).join(' ')})"><use href="#${asset}" clip-path="url(#${id})"/></g>`;}
for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=[x*w/nx,y*h/ny],b=[(x+1)*w/nx,y*h/ny],c=[(x+1)*w/nx,(y+1)*h/ny],d=[x*w/nx,(y+1)*h/ny];triangle(a,b,c);triangle(a,c,d);}
return `<g style="filter:${esc(filter)}">${triangles}</g>`;
}
const cases=Array.from(shelf.querySelectorAll('.disc-case')).filter(el=>getComputedStyle(el).visibility!=='hidden').sort((a,b)=>+a.style.zIndex-+b.style.zIndex);
for(const el of cases){const w=el.clientWidth,h=el.clientHeight,project=projector(el),m=C.getMaterial(C.list[+el.dataset.index]);let disc='';
if(!settings.overview){const sign=+el.dataset.rotation<0?1:-1,pts=C.sidePoints(w,h,sign);for(let j=0;j<pts.length-1;j++){const [x,y]=pts[j],[xx,yy]=pts[j+1];disc+=polygon([project(w/2+x,y,-9),project(w/2+xx,yy,-9),project(w/2+xx,yy,9),project(w/2+x,y,9)],m.plastic);}
const genre=MD.genres[C.list[+el.dataset.index].state.template];
const spine=`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="${h}"><rect x="2" y="${h*.07}" width="14" height="${h*.86}" rx="2" fill="${m.accent}"/><text x="${h/2}" y="-7" transform="rotate(90)" text-anchor="middle" font-family="Arial" font-size="8" fill="${m.ink}" textLength="${Math.min(h*.72,genre.length*4.3)}" lengthAdjust="spacingAndGlyphs">${esc(genre)}</text></svg>`;
disc+=texture('data:image/svg+xml,'+encodeURIComponent(spine),18,h,(x,y)=>project(w/2+sign*w/2,y,sign*(9-x)),'none',2,12);
}
for(const cls of ['case-matter','case-glass','case-print']){const img=el.querySelector('.'+cls);disc+=texture(img.src,w,h,(x,y)=>project(x,y,settings.overview?0:9),getComputedStyle(img).filter,settings.overview?1:8,settings.overview?1:8);}
body.push(`<g aria-label="${esc(MD.genres[C.list[+el.dataset.index].state.template])}">${disc}</g>`);
}
body.push(CollectorBackdrop.overlay(settings,W,H));
if(!settings.overview&&settings.infoEnabled){const bounds=screen.getBoundingClientRect();for(const selector of ['#collection-label','.screen-status','#catalog-id','#favorite','#album-year','#album-number','#album-title','#album-genre','#album-mood','.bottom-line>span:last-child']){const el=$(selector),rect=el.getBoundingClientRect(),s=getComputedStyle(el);body.push(`<text x="${n(rect.left-bounds.left-screen.clientLeft)}" y="${n(rect.top-bounds.top-screen.clientTop+rect.height/2)}" dominant-baseline="middle" fill="${s.color}" font-family="${esc(s.fontFamily)}" font-size="${s.fontSize}" font-style="${s.fontStyle}" letter-spacing="${s.letterSpacing}">${esc(el.textContent)}</text>`);}}
return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${Math.round(1600*H/W)}" viewBox="0 0 ${W} ${H}"><title>MiniDisc Collector</title><desc>Current collection canvas with projected rounded cases and embedded artwork.</desc><metadata>${esc(JSON.stringify({settings,selected:C.selected,genres:C.list.map(r=>MD.genres[r.state.template])}))}</metadata><defs>${defs.join('')}<clipPath id="canvas-clip"><rect width="${W}" height="${H}" rx="4"/></clipPath></defs>${CollectorBackdrop.render(settings,W,H)}<g clip-path="url(#canvas-clip)">${body.join('')}</g></svg>`;
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function exportScene(format){const buttons=[$('#export-scene-svg'),$('#export-scene-png')];buttons.forEach(b=>b.disabled=true);try{await document.fonts.ready;const svg=snapshot();if(format==='svg')download(new Blob([svg],{type:'image/svg+xml'}),'md-collection.svg');else{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG 生成失败');download(blob,'md-collection.png');}C.notice('已导出收藏室 '+format.toUpperCase());}catch(e){C.notice('导出失败：'+e.message);}finally{buttons.forEach(b=>b.disabled=false);}}
$('#export-scene-svg').onclick=()=>exportScene('svg');$('#export-scene-png').onclick=()=>exportScene('png');
window.CollectorScene={snapshot,exportScene};
})();
