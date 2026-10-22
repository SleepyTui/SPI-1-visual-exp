/* Compact card, scrolling selection and responsive pitch ruler. No scene settings are migrated. */
(function(){
const $=s=>document.querySelector(s),menu=$('#scale-menu'),top=document.createElement('div');
top.className='menu-top';menu.prepend(top);
const header=menu.querySelector('.menu-header'),close=$('#close-menu');
header.children[1].classList.add('menu-identity-text');
close.remove();top.append(header,$('#menu-select'),menu.querySelector('.metadata'));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const cache=new WeakMap();
let railPosition=null;
StudioV6.wheel=function(el,items,index,onSelect){
 let info=cache.get(el);const sig=items.join('|');
 if(!info||info.sig!==sig){
  if(info){cancelAnimationFrame(info.frame);info.observer.disconnect();clearTimeout(info.timer);}
  el.innerHTML='<div class="wheel-focus" aria-hidden="true"></div><div class="wheel-scroll" tabindex="0" role="listbox"></div>';
  const sc=el.lastElementChild;
  items.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.role='option';b.id='wheel-option-'+i;b.dataset.index=i;b.textContent=label;b.title=label;b.tabIndex=-1;sc.append(b);});
  info={sig,sc,index,onSelect,frame:0,row:22,programmatic:false};cache.set(el,info);
  info.pose=position=>{
   el.dataset.position=position.toFixed(4);
   for(const b of sc.children){const distance=+b.dataset.index-position,weight=Math.max(0,1-Math.abs(distance));b.style.transform=`perspective(160px) rotateX(${Math.max(-65,Math.min(65,distance*28))}deg)`;b.style.opacity=.34+.66*weight;}
  };
  info.move=(i,animate)=>{
   cancelAnimationFrame(info.frame);clearTimeout(info.unlock);info.programmatic=true;
   const start=sc.scrollTop,target=i*info.row,at=performance.now();sc.style.scrollSnapType='none';
   const done=()=>{sc.scrollTop=target;info.pose(i);info.unlock=setTimeout(()=>{info.programmatic=false;sc.style.scrollSnapType='';},60);};
   if(!animate||reduced()||Math.abs(target-start)<.1){done();return;}
   const step=now=>{const t=Math.min(1,(now-at)/300),ease=1-(1-t)**3;sc.scrollTop=start+(target-start)*ease;info.pose((start+(target-start)*ease)/info.row);if(t<1)info.frame=requestAnimationFrame(step);else done();};
   info.frame=requestAnimationFrame(step);
  };
  const choose=i=>{i=Math.max(0,Math.min(items.length-1,i));if(i!==info.index)info.onSelect(i);};
  sc.addEventListener('wheel',e=>{e.preventDefault();if(e.deltaY)choose(info.index+Math.sign(e.deltaY));},{passive:false});
  sc.onkeydown=e=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();choose(e.key==='Home'?0:e.key==='End'?items.length-1:info.index+(e.key==='ArrowDown'?1:-1));};
  sc.addEventListener('scroll',()=>{if(info.programmatic)return;clearTimeout(info.timer);info.timer=setTimeout(()=>choose(Math.round(sc.scrollTop/info.row)),130);},{passive:true});
  // Native touch scrolling and neighbour clicks use the same selection callback.
  sc.addEventListener('pointerdown',()=>{cancelAnimationFrame(info.frame);clearTimeout(info.unlock);info.programmatic=false;sc.style.scrollSnapType='';});
  sc.querySelectorAll('button').forEach(b=>b.onclick=()=>choose(+b.dataset.index));
  info.observer=new ResizeObserver(()=>{const row=parseFloat(getComputedStyle(el).getPropertyValue('--wheel-row'))||22,h=sc.clientHeight;if(!h)return;const pad=Math.max(0,(h-row)/2);if(info.row!==row||info.height!==h){info.row=row;info.height=h;sc.style.paddingBlock=pad+'px';info.move(info.index,false);}});info.observer.observe(sc);
 }
 const changed=info.index!==index;info.index=index;info.onSelect=onSelect;
 info.sc.setAttribute('aria-label',el.getAttribute('aria-label')||'Scales');info.sc.setAttribute('aria-activedescendant','wheel-option-'+index);
 for(const b of info.sc.children)b.setAttribute('aria-selected',+b.dataset.index===index);
 if(railPosition===null&&(changed||!info.ready)){info.move(index,!!info.ready);info.ready=true;}
};
function bindRail(app,open){
 const rail=$('#scale-range');let dragging=false;
 rail.step='any';
 const preview=position=>{railPosition=position;open(true);const selected=Math.round(position);if(selected!==app.state.indices[app.state.family])app.selectScale(selected);rail.value=position;rail.setAttribute('aria-valuetext',$('#menu-name').textContent);const info=cache.get($('#menu-select'));if(!info)return;cancelAnimationFrame(info.frame);clearTimeout(info.unlock);info.programmatic=true;info.sc.style.scrollSnapType='none';info.sc.scrollTop=position*info.row;info.pose(position);};
 const finish=()=>{if(railPosition===null)return;dragging=false;railPosition=null;const info=cache.get($('#menu-select'));rail.value=app.state.indices[app.state.family];info?.move(+rail.value,true);$('#menu-select').classList.remove('rail-dragging');};
 rail.addEventListener('pointerdown',()=>{dragging=true;railPosition=+rail.value;$('#menu-select').classList.add('rail-dragging');});
 rail.oninput=()=>{preview(+rail.value);if(!dragging)finish();};
 rail.onchange=finish;
 window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);window.addEventListener('blur',finish);
 rail.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=app.state.indices[app.state.family],n=+rail.max;preview(e.key==='Home'?0:e.key==='End'?n:Math.max(0,Math.min(n,i+(['ArrowUp','ArrowRight'].includes(e.key)?1:-1))));finish();});
 document.addEventListener('click',e=>{if(!e.target.closest('#scale-menu,#scale-range,#family-range,#open-menu,#back-menu,.street-sign,#random'))open(false);});
}
let latest=null;
const letter=n=>Number.isInteger(n)?['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'][n]:Math.round(n*100)+'¢';
function draw(){
 if(!latest)return;const el=$('#pitch-strip'),w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
 const {notes,label}=latest,small=h<34,pad=small?9:14,span=w-2*pad,axis=small?10:Math.min(h-17,h*.52),font=small?7:10,centsFont=small?5:7;
 const x=n=>pad+n/12*span;
 let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><title>${label}: ${notes.map(n=>letter(n)+' '+Math.round(n*100)+' cents').join(', ')}</title><path d="M${pad} ${axis}H${w-pad}" stroke="#f1deb877" fill="none"/>`;
 for(let k=0;k<=12;k++)svg+=`<path d="M${x(k)} ${axis-2}v4" stroke="#d1d7c255" stroke-width=".5"/>`;
 notes.forEach((n,i)=>{const pos=x(n),cy=small?5:axis-8-(i%2)*4;
  svg+=`<g data-pitch="${n}"><path d="M${pos} ${axis}V${cy+1}" stroke="#fee7b1" stroke-width=".5"/><circle class="pitch-dot" cx="${pos}" cy="${axis}" r="${small?1.5:2.2}" fill="${i?'#ffe4ad':'#ff986e'}"/><text class="pitch-cents" x="${pos}" y="${cy}" fill="#efddba" font-family="monospace" font-size="${centsFont}" text-anchor="middle">${Math.round(n*100)}</text><text class="pitch-letter" x="${pos}" y="${Math.min(h-1,axis+font+3)}" fill="#fff1e4" font-family="sans-serif" font-size="${Number.isInteger(n)?font:font-1}" text-anchor="middle">${letter(n)}</text></g>`;});
 svg+=`<text x="${x(12)}" y="${small?5:axis-8}" font-family="monospace" font-size="${centsFont}" fill="#cbbfce" text-anchor="middle">1200</text></svg>`;
 el.innerHTML=svg;
}
globalThis.CompactMenu={bindRail,pitch(notes,label){latest={notes:[...notes],label};draw();header.title=$('#menu-name').textContent+' · '+$('#menu-family').textContent;for(const e of menu.querySelectorAll('.metadata span'))e.title=e.textContent;}};
new ResizeObserver(draw).observe($('#pitch-strip'));
})();
