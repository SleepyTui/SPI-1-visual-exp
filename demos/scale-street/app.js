(function(){'use strict';
const A=globalThis.STREET_SAMPLES,F=globalThis.SCALE_FAMILIES,$=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const detailed=A.samples.map(s=>s.family),modes=['2d','2.5d'];
const state={dir:0,depth:'2.5d',light:'lightbox',size:640,family:0,view:'all',hue:0,page:'street',gallerySample:0,indices:Array(16).fill(0),placements:{'2d':{},'2.5d':{}},choice:null,notes:''};
try{const stored=JSON.parse(localStorage.getItem('scale-street-samples-v1')||'null');if(stored){state.choice=Number.isInteger(stored.choice)&&stored.choice>=0&&stored.choice<3?stored.choice:null;state.notes=String(stored.notes||'');for(const m of modes)for(const [k,v]of Object.entries(stored.placements?.[m]||{}))if(Number(k)>=0&&Number(k)<16&&[v.x,v.y,v.scale].every(Number.isFinite))state.placements[m][k]={x:Math.max(-80,Math.min(80,v.x)),y:Math.max(-80,Math.min(80,v.y)),scale:Math.max(.5,Math.min(1.5,v.scale))};}}catch{}
const persist=()=>{try{localStorage.setItem('scale-street-samples-v1',JSON.stringify({choice:state.choice,notes:state.notes,placements:state.placements}));}catch{}};
const toast=message=>{$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2300);};
const escape=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const currentDir=()=>A.directions[state.dir],sampleIndex=()=>detailed.indexOf(state.family),getSample=()=>sampleIndex()<0?null:A.samples[sampleIndex()];
const audio=new ScaleSampleAudio.SampleAudio((time,status)=>{$('#audio-progress').value=time;$('#audio-status').textContent=status;});
const storedKey=()=>`${currentDir().id}/${state.depth}/${state.light}`;
function setPage(page){state.page=page;$$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${page}`));$$('[data-page]').forEach(b=>b.setAttribute('aria-selected',b.dataset.page===page));if(page==='signs')renderGallery();if(page==='choice')renderChoices();}
function directionButtons(){
 $('#directions').innerHTML=A.directions.map((d,i)=>`<button class="direction-card" data-dir="${i}" aria-pressed="${i===state.dir}"><span class="dir-code">0${i+1} / ${d.en}</span><strong>${d.name}</strong><small>${d.tag}</small><span class="swatches">${d.palette.map(c=>`<i style="background:${c}"></i>`).join('')}</span></button>`).join('');
 $$('[data-dir]').forEach(b=>b.onclick=()=>{state.dir=+b.dataset.dir;render();});
}
function applyPlacements(){
 const map=state.placements[state.depth];
 $$('#scene .street-sign').forEach(g=>{const f=+g.dataset.family,s=A.slots.find(x=>x.f===f),t=map[f]||{x:0,y:0,scale:1};const cx=s.x+s.w/2,cy=s.y+s.h/2;g.setAttribute('transform',`translate(${cx+t.x} ${cy+t.y}) scale(${t.scale}) translate(${-s.w/2} ${-s.h/2})`);});
}
function updateLit(){
 $$('#scene .street-sign').forEach(g=>{const selected=+g.dataset.family===state.family;g.classList.toggle('selected',selected);g.setAttribute('aria-pressed',selected);const visual=g.firstElementChild;if(state.view==='all'||selected)visual.removeAttribute('filter');else visual.setAttribute('filter','url(#street-dim)');});
 $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===state.view));
}
function pitchMap(notes){
 const points=notes.map(n=>[100+60*Math.sin(n/12*Math.PI*2),70-60*Math.cos(n/12*Math.PI*2)]);
 let out=`<svg class="pitch-map" viewBox="0 0 200 143" aria-label="音阶音分环：八度为1200音分"><circle cx="100" cy="70" r="60" fill="none" stroke="#56666a" stroke-width=".8"/>`;
 for(let i=0;i<12;i++){const a=i*Math.PI/6;out+=`<path d="M${100+55*Math.sin(a)} ${70-55*Math.cos(a)}L${100+60*Math.sin(a)} ${70-60*Math.cos(a)}" stroke="#7b8f93" stroke-width=".8"/>`;}
 out+=`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="#e8c38b12" stroke="#edc993" stroke-width="1"/>`;
 points.forEach(([x,y],i)=>{out+=`<circle cx="${x}" cy="${y}" r="3.4" fill="${i===0?'#ff9470':'#f6dfb5'}"/><text x="${100+(x-100)*1.2}" y="${73+(y-70)*1.16}" fill="#d7e0d8" font-size="6.6" text-anchor="middle" font-family="monospace">${Math.round(notes[i]*100)}</text>`;});
 return out+`<text x="100" y="71" fill="#f6dfb5" font-family="monospace" font-size="16" text-anchor="middle">${notes.length}</text><text x="100" y="83" fill="#99aaa8" font-family="monospace" font-size="6" text-anchor="middle">TONES / CENTS</text></svg>`;
}
function renderMenu(){
 const sample=getSample(),fam=F[state.family],scale=fam.scales[state.indices[state.family]],idx=sampleIndex();
 const pitch=sample?.notes||scale.notes;
 const icon=sample?A.icons[`${currentDir().id}/${sample.id}`].svg:'';
 const scaleList=sample?[sample]:fam.scales;
 $('#scale-details').innerHTML=`<div class="menu-title">${icon}<div><strong>${escape(sample?.name||fam.cn)}</strong><small>${escape(fam.name)}</small></div></div><select class="menu-scale-select" aria-label="选择具体音阶">${scaleList.map((s,i)=>`<option value="${i}" ${i===state.indices[state.family]?'selected':''}>${escape(s.name)}</option>`).join('')}</select><dl><dt>地域</dt><dd>${escape(sample?.region||scale.region||fam.region)}</dd><dt>时期</dt><dd>${escape(sample?.period||fam.era)}</dd><dt>音数</dt><dd>${pitch.length} tones · C 主音参考</dd></dl>${pitchMap(pitch)}<p class="menu-pitches">${pitch.map(n=>Number.isInteger(n)?['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'][n]:`${Math.round(n*100)}¢`).join(' · ')}</p><p class="menu-note">${escape(sample?.note||scale.note||'本条为目录草稿，资料校核将在全量阶段完成。')}</p>${idx<0?'<p class="menu-draft">构图草案：本轮不提供此家族的精细变体、Icon 或试听。</p>':''}`;
 $('.menu-scale-select').onchange=e=>{state.indices[state.family]=+e.target.value;$('#scale-range').value=e.target.value;renderMenu();$('#selected-label').textContent=fam.scales[+e.target.value].name;$('#scale-index').textContent=`${String(+e.target.value+1).padStart(2,'0')} / ${String(fam.scales.length).padStart(2,'0')}`;};
 $('#selected-label').textContent=sample?.name||scale.name;
 const max=sample?0:fam.scales.length-1;
 $('#scale-range').max=max;$('#scale-range').value=state.indices[state.family];$('#scale-range').disabled=max===0;
 $('#scale-index').textContent=`${String(state.indices[state.family]+1).padStart(2,'0')} / ${String(max+1).padStart(2,'0')}`;
 $('#horizontal-note').textContent=sample?'精细样稿':'目录草稿';
 $('#voice-label').textContent=idx<0?'构图草案 · 暂无试听':`${ScaleSampleAudio.voices[idx]} · ${sample.name}`;
 $('#replay').disabled=idx<0;
 if(idx<0)$('#audio-status').textContent='此家族本轮仅展示构图。';
}
function editControls(){const t=state.placements[state.depth][state.family]||{x:0,y:0,scale:1};$('#zoom').value=Math.round(t.scale*100);$('#offset-x').value=t.x;$('#offset-y').value=t.y;$('#zoom-value').textContent=`${Math.round(t.scale*100)}%`;$('#x-value').textContent=t.x;$('#y-value').textContent=t.y;$('#edit-label').textContent=A.families[state.family];}
function selectFamily(f,{solo=true,menu=true,play=true}={}){state.family=f;if(solo)state.view='solo';$('#family-range').value=f;updateLit();renderMenu();editControls();renderFamilyList();setMenu(menu);if(play){audio.stop();const sample=getSample();if(sample&&audio.enabled)audio.play(sample,sampleIndex());}}
function setMenu(open){$('#scale-menu').hidden=!open;$('#menu-open').hidden=open;$('#menu-open').setAttribute('aria-expanded',open);}
function renderFamilyList(){
 $('#family-list').innerHTML=A.families.map((n,f)=>`<button data-f="${f}" class="${detailed.includes(f)?'detailed':''} ${state.family===f?'selected':''}"><span>${String(f+1).padStart(2,'0')} / ${detailed.includes(f)?'精细样稿':'DRAFT'}</span>${escape(F[f].cn)}</button>`).join('');
 $$('#family-list [data-f]').forEach(b=>b.onclick=()=>selectFamily(+b.dataset.f));
}
function render(){
 directionButtons();const d=currentDir();$('#scene-name').textContent=d.name;$('#direction-description').textContent=d.desc;
 $('#screen').style.setProperty('--screen-size',`${state.size}px`);$('#screen').classList.toggle('small',state.size===320);$('#size-readout').textContent=`${state.size} × ${state.size} PX`;
 $('#scene').innerHTML=A.streets[storedKey()].svg;$('#scene').style.filter=`hue-rotate(${state.hue}deg)`;
 $$('#scene .street-sign').forEach(g=>{g.onclick=()=>selectFamily(+g.dataset.family);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFamily(+g.dataset.family);}};});
 $('#scene-code').textContent=`${d.id[0].toUpperCase()} / ${state.depth.toUpperCase()} / ${state.light.toUpperCase()}`;
 $('#download-street').href=A.streets[storedKey()].path;
 $$('[data-size]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.size===state.size));$$('[data-depth]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.depth===state.depth));$$('[data-light]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.light===state.light));
 applyPlacements();updateLit();renderMenu();editControls();renderFamilyList();
}
function renderGallery(){
 $('#sample-tabs').innerHTML=A.samples.map((s,i)=>`<button data-sample="${i}" aria-pressed="${state.gallerySample===i}">${escape(s.cn)} <span>${escape(s.name)}</span></button>`).join('');
 $$('[data-sample]').forEach(b=>b.onclick=()=>{state.gallerySample=+b.dataset.sample;renderGallery();});
 const sample=A.samples[state.gallerySample];$('#comparison').innerHTML=A.directions.map((d,i)=>`<article class="comparison-column"><header><p>0${i+1} / ${d.en}</p><h3>${d.name}</h3></header><div class="sign-grid">${['2d','2.5d'].map(depth=>['lightbox','neon'].map(light=>{const key=`${d.id}/${depth}/${light}/${sample.id}`,asset=A.signs[key];return `<div class="sign-item"><button data-art="${key}" aria-label="放大 ${d.name} ${sample.name} ${depth} ${light}">${asset.svg}</button><p><span>${depth.toUpperCase()} / ${light==='neon'?'NEON':'LIGHTBOX'}</span><a href="${asset.path}" download aria-label="下载此招牌 SVG">↓</a></p></div>`;}).join('')).join('')}</div><div class="icon-inspect"><div class="icon-cell">${A.icons[`${d.id}/${sample.id}`].svg}</div><p>32 × 32<br>实际尺寸 · 单色</p><a href="${A.icons[`${d.id}/${sample.id}`].path}" download>SVG ↓</a></div></article>`).join('');
 $$('[data-art]').forEach(b=>b.onclick=()=>{const asset=A.signs[b.dataset.art];$('#dialog-title').textContent=b.getAttribute('aria-label').replace('放大 ','');$('#dialog-art').innerHTML=asset.svg;$('#dialog-download').href=asset.path;$('#art-dialog').showModal();});
}
function renderChoices(){
 $('#choice-cards').innerHTML=A.directions.map((d,i)=>`<article class="choice-card ${state.choice===i?'chosen':''}"><img src="${A.streets[`${d.id}/2.5d/lightbox`].path}" alt="${d.name}街景"><h3>${d.name}</h3><p>${d.desc}</p><button data-choice="${i}" aria-pressed="${state.choice===i}">${state.choice===i?'✓ 已选方向':'选择 '+d.name}</button></article>`).join('');
 $$('[data-choice]').forEach(b=>b.onclick=()=>{state.choice=+b.dataset.choice;persist();renderChoices();toast(`已保存：${A.directions[state.choice].name}`);});$('#choice-notes').value=state.notes;$('#choice-status').textContent=state.choice===null?'尚未选定方向':`已选：${A.directions[state.choice].name} · 保存在本机`;
}
$$('[data-page]').forEach(b=>b.onclick=()=>setPage(b.dataset.page));
$$('[data-size]').forEach(b=>b.onclick=()=>{state.size=+b.dataset.size;render();});
$$('[data-depth]').forEach(b=>b.onclick=()=>{state.depth=b.dataset.depth;render();});
$$('[data-light]').forEach(b=>b.onclick=()=>{state.light=b.dataset.light;render();});
$$('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;updateLit();});
$('#family-range').oninput=e=>selectFamily(+e.target.value,{menu:false});
$('#scale-range').oninput=e=>{state.indices[state.family]=+e.target.value;renderMenu();setMenu(true);};
$('#menu-open').onclick=()=>setMenu(true);$('#menu-close').onclick=()=>setMenu(false);
$('#random').onclick=()=>{const current=sampleIndex();const choices=[0,1,2,3].filter(x=>x!==current);const picked=choices[Math.floor(Math.random()*choices.length)];selectFamily(detailed[picked]);};
function setHue(n){state.hue=n;$('#scene').style.filter=`hue-rotate(${n}deg)`;$('#hue').value=n;$('#hue-value').textContent=n===0?'原色':`${n}°`;$$('[data-hue]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.hue===n));}
$('#hue').oninput=e=>setHue(+e.target.value);$$('[data-hue]').forEach(b=>b.onclick=()=>setHue(+b.dataset.hue));
for(const id of ['zoom','offset-x','offset-y'])$(`#${id}`).oninput=()=>{const slot=A.slots.find(s=>s.f===state.family);const scale=+$('#zoom').value/100;const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));const x=clamp(+$('#offset-x').value,-slot.x+(scale-1)*slot.w/2,320-slot.x-slot.w-(scale-1)*slot.w/2);const y=clamp(+$('#offset-y').value,-slot.y+(scale-1)*slot.h/2,320-slot.y-slot.h-(scale-1)*slot.h/2);state.placements[state.depth][state.family]={x:Math.round(x),y:Math.round(y),scale};applyPlacements();editControls();persist();};
$('#reset-sign').onclick=()=>{delete state.placements[state.depth][state.family];applyPlacements();editControls();persist();};$('#reset-layout').onclick=()=>{state.placements={'2d':{},'2.5d':{}};applyPlacements();editControls();persist();toast('两种空间布局均已复位');};
$('#audio-toggle').onclick=()=>{audio.enabled=!audio.enabled;$('#audio-toggle').setAttribute('aria-pressed',audio.enabled);$('#audio-toggle').textContent=audio.enabled?'声音开启':'声音关闭';if(audio.enabled&&getSample())audio.play(getSample(),sampleIndex());else audio.stop();};
$('#replay').onclick=()=>{if(!getSample())return;if(!audio.enabled){audio.enabled=true;$('#audio-toggle').setAttribute('aria-pressed','true');$('#audio-toggle').textContent='声音开启';}audio.play(getSample(),sampleIndex());};
$('#choose-current').onclick=()=>{state.choice=state.dir;persist();setPage('choice');toast(`已保存：${currentDir().name}`);};
$('#choice-notes').oninput=e=>{state.notes=e.target.value;persist();};
$('#export-choice').onclick=()=>{if(state.choice===null){toast('先选一个视觉方向，再导出选择单');return;}const record={project:'Scale Street',stage:'style-samples',selectedDirection:A.directions[state.choice].id,selectedName:A.directions[state.choice].name,notes:state.notes,keepBothDimensions:true,previewSizes:[320,640],placements:state.placements,createdAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='scale-street-style-choice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出视觉选择单');};
$('#dialog-close').onclick=()=>$('#art-dialog').close();$('#art-dialog').onclick=e=>{if(e.target===$('#art-dialog'))$('#art-dialog').close();};
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
globalThis.ScaleStreetSampleApp={state,selectFamily,setPage,render};
render();setMenu(false);
})();
