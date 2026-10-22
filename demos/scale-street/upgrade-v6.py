from pathlib import Path
R=Path(__file__).resolve().parent
def edit(name,changes):
 p=R/name;s=p.read_text(encoding='utf-8')
 for a,b in changes:
  if a not in s:raise RuntimeError(name+' missing '+a[:100])
  s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
edit('controls-v3.js',[
 ('return {dreamSettings:','return {...StudioV6.defaults(),dreamSettings:'),
 (';}return out;}', ';}Object.assign(out,StudioV6.validate(x));Object.assign(out.windowSettings,StudioV6.validateWindow(x.windowSettings));return out;}'),
 ("function defaults(){", "function defaults(){"),
 ("Object.assign(state,{...defaults(),...state});", "Object.assign(state,{...defaults(),...state});Object.assign(state.windowSettings,StudioV6.validateWindow(state.windowSettings));"),
 (" function sync(){if(!$('#ambience-toggle'))return;", " function sync(){StudioV6.sync();if(!$('#ambience-toggle'))return;"),
 ("DreamStreetMotion.apply(svg,state);", "DreamStreetMotion.apply(svg,state);StudioV6.apply(svg,state);"),
 (' return{sync,apply,music,snapshot,restore};',' StudioV6.bind(api);return{sync,apply,music,snapshot,restore};')
])
edit('app-v2.js',[
 ("catch{}\nconst t=", "catch{}\nStudioV6.initializeDefaults(state,StreetControls.validate);\nconst t="),
 ("$('#menu-progress').textContent=`${bar} / 4`;", ''),
 ("$('#blur-value').textContent=state.blur+(state.lang==='zh'?' 像素':' px');}", "$('#blur-value').textContent=state.blur+(state.lang==='zh'?' 像素':' px');StudioV6.popup(state);}"),
 ("$('#menu-select').innerHTML=f.scales.map((a,i)=>`<option value=\"${i}\" ${i===state.indices[state.family]?'selected':''}>${esc(name(a))}</option>`).join('');", "StudioV6.wheel($('#menu-select'),f.scales.map(name),state.indices[state.family],i=>selectScale(i));"),
 ("neonStyle:state.neonStyle});$('#scene')", "neonStyle:state.neonStyle,buildingDepth:state.buildingDepth});$('#scene')"),
 ("$('#menu-select').onchange=e=>selectScale(+e.target.value);", ''),
 ("$('#menu-play').onclick=enablePlay;", ''),
 ("$('#screen').style.setProperty('--size',state.size+'px');save();", "$('#screen').style.setProperty('--size',state.size+'px');StudioV6.popup(state);save();")
])
for name in ['index.html','index-v2.html']:
 edit(name,[
  ('<link rel="stylesheet" href="dream-ui-v5.css">','<link rel="stylesheet" href="dream-ui-v5.css"><link rel="stylesheet" href="studio-v6.css">'),
  ('<select id="menu-select"></select>','<div id="menu-select" class="scale-wheel"></div>'),
  ('<div class="menu-footer"><button id="menu-play" data-t="playPhrase">试听四小节</button><span id="menu-progress">0 / 4</span><span id="root-label" data-t="root">主音：C</span></div>',''),
  ('<script src="controls-v3.js">','<script src="user-defaults-v6.js"></script><script src="studio-v6.js"></script><script src="controls-v3.js">'),
  ('href="scale-street-dream-v5.zip"','href="scale-street-studio-v6.zip"')
 ])
edit('dream-ui-v5.js',[
 ("zh:{scene:'景观'", "zh:{style:'风格',scene:'景观'"),
 ("en:{scene:'Scene'", "en:{style:'Style',scene:'Scene'"),
 ("['scene','light','sound','layout']", "['scene','light','style','sound','layout']"),
 ("keys[(j+(e.key==='ArrowRight'?1:3))%4]", "keys[(j+(e.key==='ArrowRight'?1:4))%5]"),
 ("if(key==='placement'||e.querySelector('#sign-scale,#menu-opacity,#menu-blur'))k='layout';", "if(key==='placement'||e.classList.contains('v6-popup')||e.querySelector('#sign-scale,#menu-opacity,#menu-blur'))k='layout';if(e.classList.contains('v6-style'))k='style';"),
 ("['dreamControls','lighting','placement'].includes(key)", "['dreamControls','lighting','placement','popupShape','grade','optics'].includes(key)")
])
edit('motion-v4.js',[
 ("const win=state.windowSettings;for(const[e,i]of Array.from(svg.querySelectorAll('.window-light')).map((e,i)=>[e,i])){e.style.setProperty('--window-low',win.brightness*(1-win.amount*.65));e.style.setProperty('--window-high',win.brightness*(1+win.amount*.2));e.style.filter=`brightness(${win.brightness})`;e.style.animationName=win.enabled?'city-window':'none';e.style.animationDuration=(13+i%11)/win.speed+'s';}", "// Window colour and occupancy scores are managed by StudioV6; avoid competing CSS filters.")
])
edit('art-v2.js',[
 ('function facade(side,j,f){','function facade(side,j,f,buildingDepth=130){'),
 ('returnWidth=Math.max(2,10-j),ex=-side*returnWidth;', 'returnWidth=Math.max(0,(32-j*3.5)*buildingDepth/100),ex=-side*returnWidth;'),
 ("out+=`<g class=\"building-return\">${quad([b,[b[0]+ex,b[1]+8],[cc[0]+ex,cc[1]+6],cc],'url(#dream-side)','#465059',.8)}</g>`;\n out+=quad([a,b,[b[0]+ex,b[1]+8],[a[0]+ex,a[1]+8]],'#3d474b','#69706b',.7);", "const backTop=[b[0]+ex,b[1]+(320-b[1])*.12],backFoot=[cc[0]+ex,cc[1]-(cc[1]-320)*.12],nearBack=[a[0]+ex,a[1]+(320-a[1])*.12];\n out+=`<g class=\"building-return\" data-depth=\"${returnWidth}\">${quad([b,backTop,backFoot,cc],'url(#dream-side)','#687a91',.8)}`;\n for(let floor=1;floor<8;floor++){const v=floor/8,l=[b[0],b[1]+(cc[1]-b[1])*v],rr=[backTop[0],backTop[1]+(backFoot[1]-backTop[1])*v];out+=p(`M${l}L${rr}`,'none','#72839c',.55);if(returnWidth>3){const pts=[[l[0]+ex*.25,l[1]+2],[l[0]+ex*.78,l[1]+(rr[1]-l[1])*.78+2],[l[0]+ex*.78,l[1]+(rr[1]-l[1])*.78+9],[l[0]+ex*.25,l[1]+9]];out+=quad(pts,'#25394e','#95a7b6',.35);}}\n out+='</g>';out+=`<g class=\"building-roof-plane\">${quad([a,b,backTop,nearBack],'#5d7186','#bac9ce',.7)}</g>`;"),
 ('if(lit)out+=`<g class="window-light" data-window="${f*100+floor*3+col}"', 'out+=`<g class="window-light" data-row="${floor}" data-default-lit="${lit}" data-window="${f*100+floor*3+col}"'),
 ("function background(depth='2.5d'){", "function background(depth='2.5d',buildingDepth=130){"),
 ('facade(s.side,s.b,s.f);','facade(s.side,s.b,s.f,buildingDepth);'),
 ('active=0,allLit=false,neonStyle={}}={}){','active=0,allLit=false,neonStyle={},buildingDepth=130}={}){'),
 ('let out=background(depth);','let out=background(depth,buildingDepth);'),
 ('${out}</svg>`;\n}', '${`<g class="scene-content">${out}</g>`}</svg>`;\n}')
])
print('Studio v6: core integration complete.')
