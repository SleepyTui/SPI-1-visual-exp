from pathlib import Path
ROOT=Path(__file__).resolve().parent
p=ROOT/'app-v2.js';s=p.read_text(encoding='utf-8')
s=s.replace("state.indices[1]=2;","state.indices[1]=2;Object.assign(state,StreetControls.defaults());let controls;")
a=s.index('try{const saved=');b=s.index('const t=k=>',a)
s=s[:a]+"try{const saved=JSON.parse(localStorage.getItem('scale-street-v2')||'null');if(saved)Object.assign(state,StreetControls.validate(saved));}catch{}\n"+s[b:]
a=s.index('const save=');b=s.index('const toast=',a)
s=s[:a]+"const save=()=>{try{localStorage.setItem('scale-street-v2',JSON.stringify(StreetControls.validate(state)));}catch{}};\n"+s[b:]
a=s.index('const player=');b=s.index('function updateLanguage',a)
s=s[:a]+"const player=new ScaleStreetAudio.Player((time,code,error)=>{const duration=player.duration||10,bar=time===0?0:Math.min(4,Math.floor(time/(duration/4))+1);$('#audio-progress').max=duration;$('#audio-progress').value=time;$('#menu-progress').textContent=`${bar} / 4`;$('#audio-status').textContent=code==='playing'?`${t('playing')} · ${bar} / 4`:code==='idle'&&!player.enabled?t('soundHint'):t(code);});\n"+s[b:]
s=s.replace("`${24+19*Math.sin(i*2*Math.PI/n)},${24-19*Math.cos(i*2*Math.PI/n)}`","`${24+19*Math.sin(s.notes[i]*2*Math.PI/12)},${24-19*Math.cos(s.notes[i]*2*Math.PI/12)}`")
s=s.replace("$('#scale-position').textContent=String(state.indices[state.family]+1).padStart(2,'0')+' / '+String(f.scales.length).padStart(2,'0');$('#scale-label').textContent=name(s);","$('#vertical-max').textContent=String(f.scales.length).padStart(2,'0');$('#family-range').value=state.family;$('#scale-position').textContent=String(state.family+1).padStart(2,'0')+' / 16';$('#scale-label').textContent=state.lang==='zh'?f.cn:f.name;")
s=s.replace("allLit:state.view==='all'});","allLit:state.view==='all',neonStyle:state.neonStyle});")
s=s.replace("menuOpen(open);}","menuOpen(open);controls?.apply();}",1)
s=s.replace("editControls();menuOpen(open);if(play)","editControls();menuOpen(open);controls?.apply();save();if(play)")
s=s.replace("function selectScale(i){state.indices[state.family]=i;renderScene();families();","function selectScale(i){state.indices[state.family]=i;renderScene();families();save();")
s=s.replace("menuStyle();}\nfunction renderAssets", "menuStyle();controls?.sync();}\nfunction renderAssets")
s=s.replace("options={depth:state.depth}","options={depth:state.depth,neonStyle:state.neonStyle}")
s=s.replace("$('#screen').style.setProperty('--size',state.size+'px');});","$('#screen').style.setProperty('--size',state.size+'px');save();});")
s=s.replace("state.view=b.dataset.view;lit();","state.view=b.dataset.view;lit();controls?.apply();save();")
s=s.replace("$('#hue-value').textContent=state.hue+'°';};","$('#hue-value').textContent=state.hue+'°';save();};")
s=s.replace("$('#scene').classList.toggle('no-traffic',!state.traffic);};","$('#scene').classList.toggle('no-traffic',!state.traffic);controls?.apply();save();};")
s=s.replace("$('#volume').oninput=e=>player.setVolume(+e.target.value/100);","$('#volume').oninput=e=>{state.volume=+e.target.value;player.setVolume(state.volume/100);save();};")
s=s.replace("renderScene();families();menuOpen(true);if(player.enabled)","renderScene();families();menuOpen(true);save();if(player.enabled)")
s=s.replace("style.textContent='@keyframes dash{to{stroke-dashoffset:-100}}.moving-trail{animation:dash 4s linear infinite}';","style.textContent=Array.from(document.styleSheets).flatMap(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText);}catch{return[];}}).join('\\n');")
s=s.replace("if(!state.traffic)svg.querySelector('.traffic-flow')?.remove();","if(!state.traffic)svg.querySelector('.traffic-light')?.remove();")
s=s.replace("globalThis.ScaleStreetV2={state,selectFamily,selectScale,render,player};render();", "controls=StreetControls.setup({state,$,$$,t,words,save,renderScene,renderAssets,toast,player,render});player.setVolume(state.volume/100);globalThis.ScaleStreetV2={state,selectFamily,selectScale,render,player,controls};render();")
p.write_text(s,encoding='utf-8')
