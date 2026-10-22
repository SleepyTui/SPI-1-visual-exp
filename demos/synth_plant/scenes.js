(function () {
  'use strict';
  const S = window.SynthPlant, $ = id => document.getElementById(id), copy = x => JSON.parse(JSON.stringify(x));
  const STORE = 'synth-plant-square-scenes-v2';
  const BUILD='R8';
  const modes = [
    { id:'walk', name:'透光长廊', en:'GARDEN WALK', description:'半透明的廊架与圆形采光窗，内部接驳和导光结构透过表面显影。植物落在同一透视空间的前后承托面，横向切换浏览。' },
    { id:'atlas', name:'音色图谱', en:'TIMBRE FIELD NOTES', description:'半透明书页、标本与听感分析形成浅层空间。盆器剪影作为页签；切换时翻到对应音色，并显示它的质感画像。' },
    { id:'relay', name:'活性回转舱', en:'LIVING RELAY', description:'回转轨道与透明核心舱结合。邻株从侧壳后进入中央接驳位，后半轨道藏在舱体内部，可连续浏览不断增加的音色。' }
  ];
  const packs = [
    { id: 'morning', name: '晨光温室', en: 'Morning Glasshouse', color: '#cba5cf', members: [0, 1, 5], words: 'CLEAR / SOFT / BREATHY' },
    { id: 'roots', name: '根系脉冲', en: 'Root & Resonance', color: '#aa9bce', members: [2, 7, 8], words: 'DENSE / CUT / RESONANT' },
    { id: 'water', name: '暮色水岸', en: 'Evening Wetlands', color: '#92c6bc', members: [3, 6, 9], words: 'REED / METAL / MIST' }
  ];
  const settings = [
    ['focusSize','焦点植物大小',130,320,1,'px'],['focusX','焦点水平位移',-75,75,1,'px'],['focusY','焦点垂直位移',-65,45,1,'px'],
    ['contextSize','邻株比例',28,85,1,'%'],['contextOpacity','邻株透明度',20,100,1,'%'],['spacing','邻株间距',55,130,1,'%'],['horizon','承托平面高度',160,325,1,'px'],['depth','空间纵深',0,100,1,'%'],
    ['vanishX','消失点 · 水平',120,392,1,'px'],['vanishY','消失点 · 垂直',110,265,1,'px'],['sceneX','整组构图 · 水平',-90,110,1,'px'],['sceneY','整组构图 · 垂直',-70,80,1,'px'],['sceneScale','画面取景比例',70,115,1,'%'],
    ['sceneAlpha','场景透明度',10,100,1,'%'],['plantAlpha','植物透明度',30,100,1,'%'],['xray','植物通透程度',0,100,1,'%'],['diffusion','渐变弥散半径',0,22,.5,'px'],['dof','远景柔焦',0,5,.1,'px'],
    ['fadeStart','渐变中心透明度',0,100,1,'%'],['fadeEnd','渐变边缘透明度',0,100,1,'%'],['gradientAngle','渐变方向',0,360,1,'°'],['colorMix','双色混合',0,100,1,'%'],['gradientCX','渐变中心 X',0,100,1,'%'],['gradientCY','渐变中心 Y',0,100,1,'%'],['gradientRadius','渐变扩散范围',20,140,1,'%'],
    ['labelSize','音色名称字号',12,23,.5,'px'],['padding','屏幕安全边距',14,44,1,'px'],['detail','结构线条强度',0,100,1,'%'],['grain','植物颗粒强度',0,80,1,'%'],['analysisAlpha','图谱分析透明度',20,100,1,'%'],['objectDensity','物件形体浓度',0,100,1,'%'],['anchorContrast','关键结构对比',0,100,1,'%'],['pigment','深色颜料浓度',0,100,1,'%'],['atmosphere','环境染色浓度',0,100,1,'%'],['etching','器物刻纹密度',0,100,1,'%'],['matte','植物平光程度',0,100,1,'%'],['internalAlpha','内部结构显影',0,100,1,'%'],['edgeLight','透光边缘亮度',0,100,1,'%']
  ];
  const defaults = {focusSize:270,focusX:0,focusY:0,contextSize:50,contextOpacity:62,spacing:100,horizon:250,depth:55,vanishX:256,vanishY:170,sceneX:0,sceneY:0,sceneScale:100,
    sceneAlpha:50,plantAlpha:96,xray:30,diffusion:9,dof:.8,fadeStart:32,fadeEnd:92,gradientAngle:110,colorMix:65,gradientType:'radial',gradientCX:44,gradientCY:38,gradientRadius:84,
    labelSize:19,padding:28,detail:72,grain:22,analysisAlpha:90,objectDensity:72,anchorContrast:66,pigment:68,atmosphere:58,etching:45,matte:12,internalAlpha:58,edgeLight:75,bg:'#f8fcfa',line:'#9ca8c9',secondary:'#82cdbf',ink:'#607c91',labels:true,pot:'facet',overridePot:false,objects:{}};
  function fresh(i) { return {...copy(defaults), ...[
    {focusSize:278,contextSize:57,horizon:250,depth:62,sceneX:0,sceneY:0,sceneScale:100},
    {focusSize:234,contextSize:42,horizon:250,depth:24,sceneX:0,sceneY:0,sceneScale:100,line:'#aba6ce',secondary:'#8fd2c6'},
    {focusSize:245,contextSize:46,horizon:250,depth:46,sceneX:0,sceneY:0,sceneScale:100,line:'#91b8cc',secondary:'#9bd7c8'}
  ][i]}; }
  // These are authored listening-character annotations, never claimed as measured audio.
  const profiles = [
    {axes:[90,25,58,23], descriptors:['BRIGHT','LIGHT','SPARKLING','SHORT'], note:['FAST ATTACK','LIGHT RESONANCE'],env:[.02,.1,.22]},
    {axes:[48,57,63,94], descriptors:['SOFT','LUSH','LAYERED','LONG'], note:['SLOW BLOOM','ENVELOPING LAYERS'],env:[.28,.85,.98]},
    {axes:[22,95,12,58], descriptors:['DARK','HEAVY','DENSE','HELD'], note:['LOW REGISTER','GROUNDED BODY'],env:[.05,.72,.82]},
    {axes:[92,48,42,64], descriptors:['BRIGHT','FOCUSED','REEDY','HELD'], note:['FORWARD EDGE','EXPRESSIVE REEDS'],env:[.07,.8,.94]},
    {axes:[65,28,94,71], descriptors:['GRAINY','LIGHT','DIFFUSE','LAYERED'], note:['SCATTERED GRAINS','AIR BETWEEN FRAGMENTS'],env:[.12,.65,.9]},
    {axes:[55,44,88,86], descriptors:['OPEN','HOLLOW','BREATHY','RESONANT'], note:['FORMANT CAVITY','DOUBLED VOICES'],env:[.18,.78,.97]},
    {axes:[92,49,78,41], descriptors:['METALLIC','THIN','NOISY','DECAY'], note:['SHARP TRANSIENT','METALLIC TAIL'],env:[.01,.14,.53]},
    {axes:[67,53,28,29], descriptors:['CUT','TACTILE','DRY','SHORT'], note:['CUT FRAGMENTS','ARTICULATED EDGE'],env:[.01,.24,.39]},
    {axes:[70,69,45,79], descriptors:['TUNED','HOLLOW','CLEAR','RINGING'], note:['TUNED RESONATORS','CONNECTED CORE'],env:[.02,.24,.88]},
    {axes:[35,26,95,98], descriptors:['SOFT','WEIGHTLESS','SPACIOUS','LONG'], note:['DIFFUSED CANOPY','SLOWLY MOVING'],env:[.4,.86,1]}
  ];
  let plantStates = S.PRESETS.map(S.initial);
  try { const data = JSON.parse(localStorage.getItem('synth-plant-visual-v2')); if (data) { plantStates = S.validateRecipe(data); if ((data.revision || 0) < 3) plantStates[3] = S.initial(S.PRESETS[3]); } } catch {}
  let state = { type: 'synth-plant-scenes', version: 2, designRevision: 6, mode: 0, selected: 0, resolution: 320, configs: modes.map((_, i) => fresh(i)), profiles:copy(profiles), entries: S.PRESETS.map((p, i) => ({ type: 'plant', plant: i, id: p.id })) };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || 0));
  function normalize(data) {
    if(!data || data.type!=='synth-plant-scenes' || ![1,2].includes(data.version) || !Array.isArray(data.entries)) throw new Error('请选择场景实验室导出的排版文件。');
    const legacy=data.version===1;
    const out={type:'synth-plant-scenes',version:2,designRevision:8,mode:Math.trunc(clamp(legacy?({1:0,4:1,3:2}[data.mode]??0):data.mode,0,2)),selected:0,resolution:[128,240,320,480,512].includes(data.resolution)?data.resolution:320,configs:modes.map((_,i)=>fresh(i)),profiles:copy(profiles),entries:[]};
    out.configs.forEach((c,i)=>{
      const src=data.configs?.[legacy?[1,4,3][i]:i]; if(!src)return;
      const keys=legacy?['focusX','focusY','padding']:settings.map(s=>s[0]);
      for(const [key,,min,max] of settings)if(keys.includes(key)&&Number.isFinite(src[key]))c[key]=clamp(src[key],min,max);
      if((data.designRevision||0)<6 && i===0){if(c.sceneX===90)c.sceneX=0;if(c.sceneY===40)c.sceneY=0;if(c.sceneScale===86)c.sceneScale=100;}
      if((data.designRevision||0)<5){if(c.objectDensity===64)c.objectDensity=72;const previous=[61,42,61];if(c.contextSize===previous[i])c.contextSize=fresh(i).contextSize;if(c.contextOpacity===68)c.contextOpacity=62;}
      if((data.designRevision||0)<4){if(c.fadeStart===8)c.fadeStart=32;if(c.fadeEnd===75)c.fadeEnd=92;}
      if((data.designRevision||0)<8){
        const oldPositions=[[0,0,100],[48,37,88],[75,30,90]];
        ['sceneX','sceneY','sceneScale'].forEach((key,j)=>{if(c[key]===oldPositions[i][j])c[key]=fresh(i)[key];});
        if(i===0&&c.contextSize===43)c.contextSize=57;
        if(c.grain===14)c.grain=22;
      }
      if(!legacy){
        for(const key of ['bg','line','secondary','ink'])if(/^#[0-9a-f]{6}$/i.test(src[key]))c[key]=src[key];
        if(['radial','linear'].includes(src.gradientType))c.gradientType=src.gradientType;
        if((data.designRevision||0)<8){
          const oldColors={bg:['#fcfcfa'],line:['#ad9cdd','#aaa5dc','#a6b3e4'],secondary:['#91d4c5','#efb8ca','#9ddccc'],ink:['#8175ac']};
          for(const key of Object.keys(oldColors))if(oldColors[key].includes(c[key]))c[key]=fresh(i)[key];
        }
        c.labels=src.labels!==false;c.overridePot=src.overridePot===true;if(Object.hasOwn(S.POT_NAMES,src.pot))c.pot=src.pot;
        for(const [slot,v]of Object.entries(src.objects||{}).slice(0,30))if(/^[a-z0-9-]+$/.test(slot)&&v&&typeof v==='object')c.objects[slot]={x:clamp(v.x,-150,150),y:clamp(v.y,-150,150),scale:clamp(v.scale??100,40,180),opacity:clamp(v.opacity??100,0,100)};
      }
    });
    if(!legacy&&Array.isArray(data.profiles))out.profiles.forEach((p,i)=>{if(Array.isArray(data.profiles[i]?.axes))p.axes=p.axes.map((n,j)=>Number.isFinite(data.profiles[i].axes[j])?clamp(data.profiles[i].axes[j],0,100):n);});
    for(const [i,e]of data.entries.slice(0,512).entries()){
      if(e?.type==='plant'&&Number.isInteger(e.plant)&&e.plant>=0&&e.plant<S.PRESETS.length)out.entries.push({type:'plant',plant:e.plant,id:S.PRESETS[e.plant].id});
      if(e?.type==='pack'&&packs.some(p=>p.id===e.pack))out.entries.push({type:'pack',pack:e.pack,representation:e.representation==='illustration'?'illustration':'bonsai',id:'pack-'+i});
    }
    if(!out.entries.length)throw new Error('文件里没有可用的音色。');out.selected=Math.trunc(clamp(data.selected,0,out.entries.length-1));return out;
  }
  try{
    const current=localStorage.getItem(STORE),old=localStorage.getItem('synth-plant-square-scenes-v1');
    if(current)state=normalize(JSON.parse(current));
    else if(old){localStorage.setItem('synth-plant-square-scenes-before-xray',old);state=normalize(JSON.parse(old));}
  }catch{}

  const cfg = () => state.configs[state.mode], wrapIndex = n => (n % state.entries.length + state.entries.length) % state.entries.length;
  let currentSlot = 'focus', records = [], chosenPack = 0, gesture = null, drawTimer = 0, saveTimer = 0, toastTimer = 0, animation = '', direction = 1;
  let history = [], historyIndex = -1;
  function serial() { return JSON.stringify(state); }
  function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(STORE, serial()); $('scene-save').textContent = '排版已保存在此浏览器'; } catch { $('scene-save').textContent = '请导出排版以保留修改'; } }, 250); }
  function commit() { const value = serial(); if (history[historyIndex] !== value) { history = history.slice(0, historyIndex + 1); history.push(value); if (history.length > 60) history.shift(); historyIndex = history.length - 1; } $('scene-undo').disabled = historyIndex <= 0; $('scene-redo').disabled = historyIndex >= history.length - 1; persist(); }
  function travel(delta) { const i = historyIndex + delta; if (i < 0 || i >= history.length) return; historyIndex = i; state = normalize(JSON.parse(history[i])); animation = ''; render(); inspector(); $('scene-undo').disabled = i <= 0; $('scene-redo').disabled = i >= history.length - 1; persist(); }
  function toast(text) { $('toast').textContent = text; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2500); }
  function entryInfo(e) { const p = e.type === 'pack' ? packs.find(p => p.id === e.pack) : S.PRESETS[e.plant]; return { name: p.en || p.name, local: p.name, color: p.color, words: p.words }; }
  const text = (str, x, y, size = 10, extra = {}) => S.lettering(str, x, y, size, { fill: cfg().ink, ...extra });
  const line = (d, opacity = .65, width = 1.2) => `<path d="${d}" fill="none" stroke="${cfg().line}" stroke-width="${width}" opacity="${opacity * cfg().detail / 100}" stroke-linecap="round"/>`;
  const ellipse = (x, y, rx, ry, alpha = .2, color = cfg().line) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${alpha}"/>`;
  const rect = (x, y, w, h, r, alpha = .15, color = cfg().line) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}" opacity="${alpha}"/>`;
  const mix = (a,b,t) => '#'+a.slice(1).match(/../g).map((v,i)=>Math.round(parseInt(v,16)*(1-t)+parseInt(b.slice(1).match(/../g)[i],16)*t).toString(16).padStart(2,'0')).join('');
  function rawPlant(index,id,overrides={}) {
    const base=plantStates[index], amount=cfg().xray/100;
    const materials=copy(base.materials);
    for(const [key,g]of Object.entries(materials))if(!['stem','mist'].includes(key)) {
      g.stops=g.stops.map((stop,i,arr)=>({...stop,opacity:stop.opacity*(1-amount*(1-i/Math.max(1,arr.length-1))*.65),color:mix(mix(stop.color,base.color,cfg().matte*.0035),'#ffffff',amount*.06)}));
    }
    const p={...base,materials,grain:cfg().grain,hazeOpacity:Math.min(15,base.hazeOpacity),echoCount:0,...overrides};
    return S.renderPlant(index,p,{id,decorations:false}).replace('width="640" height="700"','width="320" height="350"');
  }
  function packGraphic(entry, id) {
    const p = packs.find(p => p.id === entry.pack);
    let s = '';
    if (entry.representation === 'illustration') {
      s += rect(57, 63, 206, 263, 10, 1, '#fdfbf7') + `<rect x="57" y="63" width="206" height="263" rx="10" fill="none" stroke="${p.color}" stroke-width="1.2"/>`;
      s += text('SOUND WORLD', 76, 88, 8, { fill: p.color, tracking: 1.4 });
      p.members.forEach((plant, i) => { const w = i === 1 ? 147 : 106, x = [108, 164, 219][i], y = [270, 282, 265][i]; s += `<g transform="translate(${x} ${y}) scale(${w / 320}) translate(-160 -337)">${rawPlant(plant, id + '-m' + i, { grain: 0, particleCount: 0 })}</g>`; });
      s += text('03 VOICES / BOTANICAL SET', 76, 307, 7, { fill: p.color });
    } else {
      p.members.forEach((plant, i) => { const w = i === 1 ? 195 : 139, x = [111, 160, 211][i]; s += `<g transform="translate(${x} 287) scale(${w / 320}) translate(-160 -282)">${rawPlant(plant, id + '-m' + i, { potOpacity: 0, grain: 0, particleCount: 0 })}</g>`; });
      s += `<svg x="80" y="255" width="160" height="90" viewBox="80 255 160 90">${S.renderPot('bonsai', p.color, id + '-pot').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
    }
    return s;
  }
  function plant(slot, offset, x, y, width, opacity = 1, rotate = 0, label = '') {
    const index = wrapIndex(state.selected + offset), e = state.entries[index], c = cfg();
    const override = c.objects[slot] || { x: 0, y: 0, scale: 100, opacity: 100 };
    x += override.x || 0; y += override.y || 0; width *= (override.scale ?? 100) / 100; opacity *= (override.opacity ?? 100) / 100 * c.plantAlpha / 100;
    const id = 'scene-' + state.mode + '-' + slot;
    let art;
    if (e.type === 'pack') art = packGraphic(e, id);
    else art = rawPlant(e.plant, id, slot === 'focus' && c.overridePot ? { potType: c.pot } : {});
    const bottomByPot = { facet:332, bonsai:333, 'bass-tray':332, 'multi-neck':334, pedestal:342.2, lotus:337, 'orbit-bowl':337, bowl:332, choir:335, block:337 };
    let bottom = e.type === 'pack' ? (e.representation === 'illustration' ? 326 : 333) : 337;
    if (e.type === 'plant') {
      const ps = plantStates[e.plant], type = slot === 'focus' && c.overridePot ? c.pot : ps.potType;
      bottom = 282 + (ps.potY || 0) + ((bottomByPot[type] || 337) - 282) * (ps.potHeight || 100) / 100;
    }
    records.push({ slot, label: label || (slot === 'focus' ? '主焦点' : '环境植物'), index, x, y, width });
    const selected = currentSlot === slot && $('safe-area').checked;
    const box = selected ? `<rect x="37" y="22" width="246" height="317" rx="4" fill="none" stroke="${c.ink}" stroke-width="1.2" stroke-dasharray="4 4"/>` : '';
    return `<g data-slot="${slot}" data-entry="${index}" role="button" tabindex="0" aria-label="选择 ${S.esc(entryInfo(e).local)}" opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rotate}) scale(${width / 320}) translate(-160 -${bottom})"><g class="specimen-motion">${art}${box}</g></g>`;
  }

  function neighbors(specs) {
    const c = cfg();
    return specs.map(([slot, offset, x, y, factor, angle = 0, label = '环境植物']) => {
      x = 256 + (x - 256) * c.spacing / 100;
      const w = c.focusSize * c.contextSize / 100 * factor * (1 - Math.abs(offset) * c.depth / 1400);
      return plant(slot, offset, x, y, w, c.contextOpacity / 100 * (1 - Math.abs(offset) * c.depth / 1800), angle, label);
    }).join('');
  }
  function focus(x = 256, y = 366) { return plant('focus', 0, x + cfg().focusX, y + cfg().focusY, cfg().focusSize, 1, 0, '主焦点'); }
  const surface=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
  function sceneDefs() {
    const c=cfg(),a=c.gradientAngle*Math.PI/180,dx=Math.cos(a)*50,dy=Math.sin(a)*50,b=mix(c.line,c.secondary,c.colorMix/100);
    const stops=`<stop stop-color="${c.line}" stop-opacity="${c.fadeStart/100}"/><stop offset=".52" stop-color="${b}" stop-opacity="${(c.fadeStart+c.fadeEnd)/240}"/><stop offset="1" stop-color="${b}" stop-opacity="${c.fadeEnd/100}"/>`;
    const sheet=c.gradientType==='linear'?`<linearGradient id="xr-sheet" x1="${50-dx}%" y1="${50-dy}%" x2="${50+dx}%" y2="${50+dy}%">${stops}</linearGradient>`:`<radialGradient id="xr-sheet" cx="${c.gradientCX}%" cy="${c.gradientCY}%" r="${c.gradientRadius}%">${stops}</radialGradient>`;
    return `<defs>${sheet}
      <radialGradient id="xr-glow"><stop stop-color="${b}" stop-opacity=".48"/><stop offset=".55" stop-color="${c.line}" stop-opacity=".12"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
      <radialGradient id="xr-focus"><stop stop-color="${entryInfo(state.entries[state.selected]).color}" stop-opacity=".23"/><stop offset=".64" stop-color="${c.secondary}" stop-opacity=".07"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
      <linearGradient id="xr-edge" x2="0" y2="1"><stop stop-color="${c.line}" stop-opacity=".72"/><stop offset=".52" stop-color="${c.secondary}" stop-opacity=".12"/><stop offset="1" stop-color="${c.line}" stop-opacity=".6"/></linearGradient>
      <linearGradient id="xr-page" x2="1" y2=".3"><stop stop-color="#ffffff" stop-opacity=".88"/><stop offset=".45" stop-color="${c.bg}" stop-opacity=".44"/><stop offset="1" stop-color="${c.secondary}" stop-opacity=".17"/></linearGradient>
      <radialGradient id="xr-contact"><stop stop-color="${c.line}" stop-opacity=".24"/><stop offset="1" stop-color="${c.line}" stop-opacity="0"/></radialGradient>
      <filter id="xr-diffuse" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${c.diffusion}"/></filter>
      <filter id="xr-depth" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${c.dof}"/></filter>
      <linearGradient id="obj-face" x1="0" y1="0" x2=".16" y2="1"><stop stop-color="${mix(c.ink,c.line,.25)}" stop-opacity="${.45+c.pigment*.005}"/><stop offset=".16" stop-color="${c.line}" stop-opacity=".82"/><stop offset=".51" stop-color="${mix(c.line,'#ffffff',.6)}" stop-opacity=".26"/><stop offset=".78" stop-color="${c.secondary}" stop-opacity=".3"/><stop offset="1" stop-color="${mix(c.ink,c.line,.3)}" stop-opacity=".87"/></linearGradient>
      <linearGradient id="obj-side" x2="1" y2=".16"><stop stop-color="${mix(c.ink,c.line,.2)}"/><stop offset=".32" stop-color="${c.ink}" stop-opacity=".8"/><stop offset=".78" stop-color="${c.line}" stop-opacity=".38"/><stop offset="1" stop-color="${c.secondary}" stop-opacity=".08"/></linearGradient>
      <linearGradient id="obj-ivory" x2=".32" y2="1"><stop stop-color="#ffffff"/><stop offset=".55" stop-color="${c.bg}" stop-opacity=".94"/><stop offset=".88" stop-color="${mix(c.bg,c.line,.18)}" stop-opacity=".84"/><stop offset="1" stop-color="${mix(c.bg,c.secondary,.36)}"/></linearGradient>
      <linearGradient id="obj-recess" x2=".2" y2="1"><stop stop-color="${mix(c.ink,c.line,.25)}" stop-opacity=".84"/><stop offset=".24" stop-color="${c.line}" stop-opacity=".3"/><stop offset=".68" stop-color="${c.secondary}" stop-opacity=".06"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
      <linearGradient id="obj-glass" x1="0" y1=".3" x2="1" y2=".6"><stop stop-color="${c.ink}" stop-opacity=".65"/><stop offset=".055" stop-color="${c.secondary}" stop-opacity=".75"/><stop offset=".16" stop-color="#ffffff" stop-opacity=".7"/><stop offset=".32" stop-color="${c.secondary}" stop-opacity=".07"/><stop offset=".78" stop-color="${c.line}" stop-opacity=".13"/><stop offset=".95" stop-color="${c.line}" stop-opacity=".6"/><stop offset="1" stop-color="${c.ink}" stop-opacity=".85"/></linearGradient>
      <linearGradient id="obj-anchor" x2="0" y2="1"><stop stop-color="${mix(c.ink,c.line,.2)}"/><stop offset=".32" stop-color="${c.ink}" stop-opacity=".9"/><stop offset=".65" stop-color="${c.line}" stop-opacity=".42"/><stop offset="1" stop-color="${c.secondary}" stop-opacity=".03"/></linearGradient>
      <linearGradient id="art-sky" x2=".12" y2="1"><stop stop-color="${mix(c.line,'#ef9cb6',.6)}" stop-opacity="${c.atmosphere*.009}"/><stop offset=".35" stop-color="${mix(c.bg,'#f3d8cb',.45)}" stop-opacity=".34"/><stop offset=".74" stop-color="${c.bg}" stop-opacity="0"/><stop offset="1" stop-color="${c.secondary}" stop-opacity="${c.atmosphere*.004}"/></linearGradient>
      <radialGradient id="art-bloom" cx="35%" cy="30%" r="70%"><stop stop-color="#ffffff" stop-opacity=".95"/><stop offset=".48" stop-color="${c.secondary}" stop-opacity=".25"/><stop offset="1" stop-color="${c.line}" stop-opacity="0"/></radialGradient>
      <linearGradient id="art-ribbon" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${mix(c.ink,'#302937',.3)}" stop-opacity=".76"/><stop offset=".38" stop-color="${c.line}" stop-opacity=".28"/><stop offset=".76" stop-color="${c.secondary}" stop-opacity=".08"/><stop offset="1" stop-color="${c.ink}" stop-opacity=".62"/></linearGradient>
      <linearGradient id="art-foot" x2="0" y2="1"><stop stop-color="${c.ink}" stop-opacity=".4"/><stop offset=".2" stop-color="${c.line}" stop-opacity=".19"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></linearGradient>
      <filter id="art-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="18"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${c.grain/650}"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
      <radialGradient id="print-lilac" cx="${c.gradientCX}%" cy="${c.gradientCY}%" r="${c.gradientRadius}%"><stop stop-color="#ffffff" stop-opacity="${c.fadeStart/150}"/><stop offset=".42" stop-color="${c.secondary}" stop-opacity=".22"/><stop offset=".76" stop-color="${c.line}" stop-opacity=".6"/><stop offset="1" stop-color="${mix(c.line,c.ink,.28)}" stop-opacity="${c.fadeEnd/100}"/></radialGradient>
      <linearGradient id="print-mint" x2=".3" y2="1"><stop stop-color="${c.secondary}" stop-opacity=".64"/><stop offset=".5" stop-color="${c.secondary}" stop-opacity=".2"/><stop offset="1" stop-color="#ffffff" stop-opacity=".04"/></linearGradient>
      <linearGradient id="print-cream" x2=".15" y2="1"><stop stop-color="#ffffff" stop-opacity=".85"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".54"/><stop offset=".8" stop-color="${c.secondary}" stop-opacity=".15"/><stop offset="1" stop-color="${c.line}" stop-opacity=".4"/></linearGradient>
      <linearGradient id="print-return" x2="1" y2=".3"><stop stop-color="${mix(c.line,c.ink,.28)}" stop-opacity=".8"/><stop offset=".22" stop-color="${c.line}" stop-opacity=".56"/><stop offset=".7" stop-color="${c.secondary}" stop-opacity=".15"/><stop offset="1" stop-color="#ffffff" stop-opacity=".1"/></linearGradient>
      <radialGradient id="print-aura"><stop stop-color="${c.secondary}" stop-opacity=".44"/><stop offset=".55" stop-color="${c.line}" stop-opacity=".12"/><stop offset="1" stop-color="${c.secondary}" stop-opacity="0"/></radialGradient>
      <linearGradient id="optical-edge" x2=".1" y2="1"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="${c.secondary}" stop-opacity=".55"/><stop offset=".6" stop-color="#ffffff" stop-opacity=".1"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
      <radialGradient id="optical-blush"><stop stop-color="#edc3da" stop-opacity=".38"/><stop offset="1" stop-color="#edc3da" stop-opacity="0"/></radialGradient>
      <clipPath id="garden-moon"><path d="M145 353 V316 A132 132 0 1 1 367 316 V353Z"/></clipPath>
      <pattern id="obj-grain" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M.5 1h.2 M3 3.5h.3 M4.5 .4h.2" fill="none" stroke="${c.ink}" stroke-width=".55" stroke-linecap="round"/></pattern>
      <clipPath id="room-window"><rect x="18" y="70" width="476" height="336" rx="15"/></clipPath>
    </defs>`;
  }
  function glass(d,opacity=1,edge=.45) {
    const c=cfg();return surface(d,'url(#xr-sheet)',`opacity="${opacity*c.sceneAlpha/100}" stroke="${c.line}" stroke-opacity="${edge}" stroke-width=".85" stroke-linejoin="round"`);
  }
  const contact=(x,y,w)=>`<ellipse cx="${x}" cy="${y+2}" rx="${w}" ry="${Math.max(3,w*.12)}" fill="url(#xr-contact)"/>`;
  const glow=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#xr-focus)" filter="url(#xr-diffuse)" pointer-events="none"/>`;
  function shelf(x,y,w,h=10) {
    const c=cfg(),t=Math.min(.15,9/Math.max(30,y-c.vanishY)),ax=x+(c.vanishX-x)*t,bx=x+w+(c.vanishX-x-w)*t,by=y+(c.vanishY-y)*t;
    return glass(`M${x} ${y} L${ax} ${by} H${bx} L${x+w} ${y}Z`,.85)+glass(`M${x} ${y} H${x+w} V${y+h} H${x}Z`,1.1)+line(`M${x+4} ${y+2} H${x+w-4}`,.35,.7);
  }
  function portal(x,y,w,h,id) {
    const r=Math.min(w*.5,80),d=`M${x} ${y+h} V${y+r} Q${x} ${y} ${x+r} ${y} H${x+w-r} Q${x+w} ${y} ${x+w} ${y+r} V${y+h}`;
    return `<g class="${id||''}">${surface(d,'none',`stroke="url(#xr-edge)" stroke-width="13" stroke-linecap="round" opacity="${cfg().sceneAlpha/100}"`)}${surface(d,'none',`stroke="#ffffff" stroke-width="1.1" opacity=".78"`)}${line(`M${x+4} ${y+h} V${y+r} Q${x+4} ${y+5} ${x+r} ${y+5} H${x+w-r}`, .3,.7)}</g>`;
  }
  function entryPlantIndex(entry=state.entries[state.selected]) {return entry.type==='plant'?entry.plant:packs.find(p=>p.id===entry.pack).members[0];}
  function profile() {
    const entry=state.entries[state.selected];
    if(entry.type==='plant')return state.profiles[entry.plant];
    const members=packs.find(p=>p.id===entry.pack).members;
    return {axes:[0,1,2,3].map(i=>Math.round(members.reduce((s,m)=>s+state.profiles[m].axes[i],0)/members.length)),descriptors:['LAYERED','BLENDED','MULTI','COMPOSITE'],note:['03 VOICES','COMBINED CHARACTER'],env:[.2,.7,.94]};
  }
  function analysis(x,y,w=90) {
    const p=profile(),labels=['BRIGHT','BODY','AIR','TAIL'];let a=text('CHARACTER',x,y,8.5,{tracking:1});
    p.axes.forEach((v,i)=>{const yy=y+20+i*33;a+=text(labels[i],x,yy,7.6,{fill:cfg().ink})+text(p.descriptors[i],x+w,yy,7.2,{anchor:'end',fill:cfg().line});a+=rect(x,yy+7,w,3,1.5,.12)+`<rect x="${x}" y="${yy+7}" width="${Math.max(2,w*v/100)}" height="3" rx="1.5" fill="url(#xr-sheet)"/>`;});
    const yy=y+150,ax=x+4,base=yy+33,attack=w*p.env[0],hold=w*p.env[1],release=w*p.env[2];
    a+=text('ENVELOPE FEEL',x,yy,6.8)+line(`M${x} ${base} H${x+w}`,.3,.6);
    a+=surface(`M${ax} ${base} Q${ax+attack*.5} ${base-23} ${ax+attack} ${base-23} Q${x+hold*.7} ${base-20} ${x+hold} ${base-14} Q${x+release} ${base-8} ${x+w} ${base}`,'none',`stroke="${cfg().line}" stroke-width="1.5" stroke-linecap="round"`);
    a+=text(p.note[0],x,yy+48,5.5)+text(p.note[1],x,yy+60,5.1,{fill:cfg().line});
    return `<g opacity="${cfg().analysisAlpha/100}" pointer-events="none">${a}</g>`;
  }
  // Object illustration: a contour has a face, a return, an inset and a contact.
  // Opacity affects colored material; ivory backing keeps structural occlusion legible.
  function obj(d,material='face',strength=1,edge=.28) {
    const c=cfg(),alpha=Math.min(.95,(.24+c.objectDensity*.0042)*strength),tint=c.sceneAlpha/50;
    return surface(d,`url(#obj-${material})`,`opacity="${Math.min(.95,alpha*tint)}" stroke="${c.line}" stroke-opacity="${edge}" stroke-width=".8" stroke-linejoin="round"`)+surface(d,'url(#obj-grain)',`opacity="${c.grain/180}" pointer-events="none"`);
  }
  function fastener(x,y,r=2) {
    return `<g opacity="${cfg().detail/110}"><circle cx="${x}" cy="${y}" r="${r}" fill="${cfg().bg}" stroke="${cfg().line}" stroke-width=".7"/>${line(`M${x-r*.5} ${y} h${r}`, .65,.65)}</g>`;
  }
  function instrumentLabel(x,y,w,label) {
    return obj(`M${x} ${y} h${w} v13 h-${w}Z`,'ivory',.8)+text(label,x+6,y+9,5.8,{tracking:.5})+fastener(x+w-5,y+6.5,1.2);
  }
  function archContour(x,y,w,h,border) {
    const r=Math.min(w*.5,95),outer=`M${x} ${y+h} V${y+r} Q${x} ${y} ${x+r} ${y} H${x+w-r} Q${x+w} ${y} ${x+w} ${y+r} V${y+h}Z`;
    const ix=x+border,iy=y+border,iw=w-border*2,ir=r-border;
    return outer+` M${ix} ${y+h} V${iy+ir} Q${ix} ${iy} ${ix+ir} ${iy} H${ix+iw-ir} Q${ix+iw} ${iy} ${ix+iw} ${iy+ir} V${y+h}Z`;
  }
  function archFrame(x,y,w,h,border=15) {
    const cut=archContour(x,y,w,h,border);
    return `<g fill-rule="evenodd">${obj(cut,'face',1.05)}${surface(archContour(x+3,y+3,w-6,h-3,2),'#ffffff','opacity=".65"')}${surface(archContour(x+border-3,y+border-3,w-2*border+6,h-border+3,3),'url(#obj-side)','opacity=".43"')}</g>`;
  }
  function pedestal(x,y,w,h=20) {
    const c=cfg(),t=Math.min(.18,13/Math.max(40,y-c.vanishY)),a=x+(c.vanishX-x)*t,b=x+w+(c.vanishX-x-w)*t,by=y+(c.vanishY-y)*t;
    return obj(`M${x} ${y} L${a} ${by} H${b} L${x+w} ${y}Z`,'ivory',1.55)+obj(`M${x} ${y} H${x+w} V${y+h-4} L${x+w-5} ${y+h} H${x+5} L${x} ${y+h-4}Z`,'face',1.18)+obj(`M${x+w-6} ${y+3} H${x+w} V${y+h-4} L${x+w-6} ${y+h}Z`,'side',.75)+line(`M${x+5} ${y+3} H${x+w-7}`,.35,.7);
  }
  function potTab(pot,x,y,w,h,active,id,index) {
    const color=active?cfg().line:mix(cfg().line,cfg().secondary,.5);
    return `<g data-tab="${index}" role="button" tabindex="0" aria-label="容器索引 ${S.POT_NAMES[pot]}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" fill-opacity="0"/>${obj(`M${x-5} ${y+9} H${x+11} V${y+h-7} H${x-5}Z`,'ivory',active?1.5:.6)}<svg x="${x}" y="${y+1}" width="${w}" height="${h-2}" viewBox="80 255 160 90" opacity="${active?1:.63}">${S.renderPot(pot,color,id).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>${active?line(`M${x-2} ${y+10} v${h-19}`,1,2):''}</g>`;
  }
  function etch(x,y,w,h,count=18,bend=0) {
    const c=cfg();let out='';
    for(let i=0;i<count;i++){const xx=x+w*i/(count-1);out+=surface(`M${xx} ${y} Q${xx+bend} ${y+h*.45} ${xx} ${y+h}`,'none',`stroke="${i%3===0?c.ink:'#ffffff'}" stroke-width="${i%3===0?.38:.65}" opacity="${c.etching/190}"`);}
    return `<g pointer-events="none">${out}</g>`;
  }
  function seal(x,y,label) {
    return `<g opacity="${cfg().detail/100}">${surface(`M${x} ${y} h27 v16 h-27Z`,'none',`stroke="${cfg().ink}" stroke-width=".65"`)}${text(label,x+13.5,y+10.8,6,{anchor:'middle',tracking:1})}</g>`;
  }
  function printShape(d,material='lilac',alpha=1) {
    const c=cfg();alpha=Math.min(1,alpha*c.sceneAlpha/50*(.3+c.objectDensity*.0097));
    return surface(d,`url(#print-${material})`,`opacity="${alpha}"`)+surface(d,'url(#obj-grain)',`opacity="${alpha*c.grain/350}" pointer-events="none"`)+surface(d,'none',`stroke="url(#optical-edge)" stroke-width=".7" stroke-linejoin="round" opacity="${alpha*c.edgeLight/100}" pointer-events="none"`);
  }
  function internalRail(x,y,h,flip=false) {
    const c=cfg();let out='';
    for(let i=0;i<4;i++){
      const yy=y+20+i*(h-45)/4,hh=(h-65)/4;
      out+=surface(`M${x+5} ${yy} H${x+13} V${yy+hh-5} L${x+9} ${yy+hh} H${x+5}Z`,'url(#print-return)','opacity=".7"');
      out+=surface(`M${x+7} ${yy+3} H${x+11} V${yy+hh-6}`,'none',`stroke="${c.secondary}" stroke-width=".8"`);
    }
    return `<g opacity="${c.internalAlpha/100}" pointer-events="none">${out}${surface(`M${x+3} ${y+9} V${y+h-9}`,'none',`stroke="${c.line}" stroke-width=".6"`)}</g>`;
  }
  function scenery() {
    const c=cfg(),dy=(c.horizon-250)*.3,z=c.sceneScale/100;
    let s=`<g clip-path="url(#room-window)"><rect x="18" y="70" width="476" height="336" fill="${c.bg}"/>`;
    s+=`<ellipse cx="425" cy="125" rx="230" ry="135" fill="url(#optical-blush)"/><ellipse cx="147" cy="292" rx="205" ry="165" fill="url(#print-aura)" opacity=".7" filter="url(#xr-diffuse)"/><ellipse cx="340" cy="220" rx="205" ry="178" fill="url(#art-bloom)" opacity=".48"/><g class="scene-world" transform="translate(${c.sceneX} ${c.sceneY}) scale(${z})">`;
    if(state.mode===0) {
      const y=354+dy, backY=354+(c.horizon-250)*.12;
      // Concept A: complete colonnade, circular borrowed view, and a shared ground plane.
      s+=`<g class="room-parallax">`;
      s+=printShape('M18 70 H494 V359 H18Z','cream',.5);
      s+=`<g clip-path="url(#garden-moon)"><rect x="110" y="94" width="292" height="268" fill="url(#print-mint)"/><ellipse cx="256" cy="189" rx="135" ry="139" fill="url(#art-bloom)"/>`;
      // Distant terraces are deliberately quiet silhouettes, all on the same perspective axis.
      s+=`<g filter="url(#xr-depth)" opacity="${.25+c.depth*.003}">`;
      s+=printShape('M103 332 V240 L151 220 V173 H178 V205 H202 V269 H226 V350Z','mint',.7);
      s+=printShape('M306 350 V272 H327 V231 H351 V195 H371 V227 L413 244 V351Z','mint',.82);
      s+=surface('M112 350 L248 292 H268 L400 350Z','url(#print-cream)','opacity=".9"');
      s+=line('M132 298 L248 291 M380 298 L268 291',.22,.6)+`</g>`;
      s+=printShape('M125 294 H391 V299 H125Z','mint',.7);
      s+=printShape('M169 298 H172 V355 H169Z M339 298 H342 V355 H339Z','mint',.7);
      s+=`</g>`;
      s+=surface('M140 355 V315 A137 137 0 1 1 372 315 V355','none',`stroke="url(#print-lilac)" stroke-width="11" opacity="${c.sceneAlpha*.014}"`);
      s+=surface('M147 352 V316 A130 130 0 1 1 365 316 V352','none',`stroke="${c.secondary}" stroke-width="1.6" opacity=".45"`);
      s+=surface('M142 281 A134 134 0 0 1 190 127','none',`stroke="#ffffff" stroke-width="2.4" opacity="${c.edgeLight/100}"`);
      s+=surface('M142 355 V316 A134 134 0 1 1 370 316 V355','none','stroke="#ffffff" stroke-width="1.1" opacity=".8"');
      s+=printShape(`M18 ${backY} H494 V${backY+12} H18Z`,'lilac',.47);
      s+=`</g>`;
      s+=printShape(`M18 ${y+5} L${c.vanishX-126} ${backY+4} H${c.vanishX+126} L494 ${y+5} V${y+32} H18Z`,'cream');
      s+=contact(35,y+4,29)+contact(478,y+4,29)+neighbors([['left',-1,35,y+4,1,0,'前一廊间'],['right',1,478,y+4,1,0,'后一廊间']]);
      s+=printShape(`M18 ${y+27} H494 V${y+39} H18Z`,'lilac',.62);
      s+=printShape(`M18 ${y+39} H494 V406 H18Z`,'cream');
      // Cornice, posts and stepped joints give the architectural object its silhouette.
      s+=printShape('M18 70 H494 V90 H18Z','lilac',.92)+printShape('M18 90 H494 V96 H18Z','return',.76);
      for(const x of [84,410]) {
        s+=printShape(`M${x} 81 H${x+17} V${y+26} H${x}Z`,'lilac',.97);
        s+=printShape(`M${x+17} 96 L${x+23} 103 V${y+20} L${x+17} ${y+26}Z`,'return',.58);
        s+=printShape(`M${x-9} ${y+24} H${x+26} V${y+45} H${x-9}Z`,'lilac',.67);
        s+=printShape(`M${x-9} ${y+24} L${x-3} ${y+18} H${x+20} L${x+26} ${y+24}Z`,'cream');
        s+=surface(`M${x+2} 98 V${y+20}`,'none','stroke="#ffffff" stroke-width=".8" opacity=".32"');
        s+=internalRail(x,103,y-103);
        s+=obj(`M${x-3} 92 Q${x-5} 92 ${x-5} 96 V112 Q${x-5} 115 ${x-2} 115 H${x+21} Q${x+24} 115 ${x+24} 112 V96 Q${x+24} 92 ${x+21} 92Z`,'glass',.9,0);
        s+=line(`M${x} 99 h18 M${x} 108 h18`,.32,.65);
      }
      // Light conductors terminate at the selected specimen's root socket.
      s+=`<g opacity="${c.internalAlpha/100}">`;
      s+=line(`M106 ${y+36} H201 L222 ${y+17} H240 M410 ${y+36} H311 L290 ${y+17} H272`,.55,.85);
      s+=line(`M117 ${y+39} H204 L226 ${y+20} H238 M399 ${y+39} H308 L286 ${y+20} H274`,.22,.65);
      s+=rect(238,y+13,36,7,3,.3,c.secondary)+`</g>`;
      s+=glow(256,266,109,114)+contact(256+c.focusX,y,53)+focus(256,y);
      s+=surface(`M230 ${y+10} H282`,'none',`stroke="${c.line}" stroke-width="1" opacity=".3"`);
      s+=rect(246,y+11,20,3,1.5,.85,c.secondary);
      s+=text('BOTANICAL / '+String(state.selected+1).padStart(2,'0'),256,398,5.5,{anchor:'middle',tracking:1});
    } else if(state.mode===1) {
      const y=343+dy,selected=entryPlantIndex();
      s+=surface('M54 399 H421 L457 379 V403 L426 416 H54Z','url(#art-foot)','opacity=".55"');
      // Book cover, page block and inset binding all occupy different depth planes.
      s+=`<g class="atlas-back" filter="url(#xr-depth)">${printShape('M68 83 L427 74 L451 88 V371 L425 395 L68 388Z','lilac',.66)}${obj('M76 94 L425 85 L440 96 V366 L419 385 H76Z','ivory',1.3)}</g>`;
      s+=printShape('M37 112 L57 94 H418 L438 109 V384 L417 402 H37Z','lilac',.95);
      s+=printShape('M37 384 H417 L438 370 V384 L417 402 H37Z','return',.68);
      s+=line('M47 388 H412 L430 376 M49 392 H412 L425 382 M51 396 H411 L421 388',.36,.7);
      const tabs=Array.from({length:Math.min(5,state.entries.length)},(_,i)=>(state.selected+i-2+state.entries.length)%state.entries.length);
      tabs.forEach((index,i)=>{const pot=plantStates[entryPlantIndex(state.entries[index])].potType;s+=potTab(pot,439,113+i*48,44,39,index===state.selected,'atlas-tab-'+i,index);});
      s+=`<g class="atlas-page">${printShape('M44 110 Q44 103 53 103 H421 V376 Q421 385 412 385 H53 Q44 385 44 376Z','cream')}`;
      s+=printShape('M44 109 Q44 103 54 103 H65 V385 H54 Q44 385 44 375Z','lilac',.78);
      s+=surface('M65 105 H73 V382 H65Z','url(#obj-anchor)',`opacity="${c.anchorContrast/100}"`)+line('M63 120 V366',.28,.7);
      for(const yy of [142,229,316]){
        s+=obj(`M32 ${yy-10} Q27 ${yy-10} 27 ${yy-5} V${yy+8} Q27 ${yy+13} 32 ${yy+13} H50 V${yy+8} H34 V${yy-5} H50 V${yy-10}Z`,'face',1.35);
        s+=line(`M31 ${yy-5} V${yy+7} H46`,.48,.9);
      }
      s+=obj('M83 123 H296 L305 133 V346 H83Z','recess',.22);
      s+=surface('M83 124 H296 L305 133 H83Z','url(#art-ribbon)','opacity=".4"');
      s+=text(String(selected+1).padStart(2,'0'),95,173,34,{fill:mix(c.line,c.bg,.67),tracking:-2});
      s+=seal(265,140,'SP');
      s+=internalRail(46,120,247)+etch(85,389,315,7,47,2);
      s+=surface('M314 126 H317 V357 H314Z','url(#obj-anchor)','opacity=".27"');
      s+=line('M91 133 h9 M91 133 v9 M295 133 h-9 M295 133 v9 M91 337 v-9 M91 337 h9 M295 337 h-9 M295 337 v-9',.5,.7);
      s+=text('BOTANICAL SOUND / '+String(state.selected+1).padStart(2,'0'),88,118,6.2,{tracking:.65});
      s+=contact(190+c.focusX,y,55)+glow(190,244,116,130)+focus(190,y);
      s+=obj('M320 127 H409 V357 H320Z','ivory',.8)+line('M312 130 V360',.3,.65)+analysis(326,142,80);
      // Anatomical print annotations are grounded in the current timbre's description.
      s+=line('M108 242 H96 V270 M276 296 H293 V311',.46,.6)+text('FORM',97,280,5,{tracking:.8})+text('ROOT',280,321,5,{tracking:.8});
      s+=text(S.PRESETS[selected].kind,89,365,Math.min(6.3,215/S.PRESETS[selected].kind.length/.612));
      s+=line('M88 372 H301',.28,.6);
      [c.line,S.PRESETS[selected].color,c.secondary].forEach((color,i)=>{s+=rect(327+i*24,366,17,7,2,.55,color);});
      s+=obj('M178 94 H245 V111 Q245 114 242 114 H181 Q178 114 178 111Z','face',1.15)+line('M184 98 H239',.44,.8)+fastener(186,106,1.6)+fastener(237,106,1.6);
      s+=`</g>`;
    } else {
      const y=350+dy;
      // The pale chassis is a single designed object with a hidden return route.
      s+=`<g class="relay-return" filter="url(#xr-depth)">${obj('M-20 105 H113 L133 128 V326 H-20Z','face',.36)}${obj('M532 105 H399 L379 128 V326 H532Z','face',.36)}</g>`;
      s+=printShape('M-8 305 Q256 397 520 305 V342 Q256 437 -8 342Z','lilac',.94);
      s+=printShape('M-8 302 A264 65 0 0 0 520 302 L506 322 A250 61 0 0 1 6 322Z','cream');
      s+=surface('M1 309 A255 62 0 0 0 511 309','none',`stroke="${c.secondary}" stroke-width="3" opacity=".56"`);
      s+=line('M9 321 A247 59 0 0 0 503 321',.42,.9);
      // Side stations share real contact planes with their plant bottoms.
      s+=pedestal(25,291+dy,85,15)+pedestal(402,291+dy,85,15);
      s+=contact(67,291+dy,29)+contact(445,291+dy,29)+neighbors([['left',-1,67,291+dy,.92,0,'进入侧核心'],['right',1,445,291+dy,.92,0,'离开侧核心']]);
      // Cut-away side housings. Their aperture is an actual hole, not an opaque overlay.
      const left='M-20 120 H89 L115 146 V333 L96 358 H-20Z M-10 154 H71 Q88 154 88 173 V285 Q88 305 70 305 H-10Z';
      const right='M532 120 H423 L397 146 V333 L416 358 H532Z M522 154 H441 Q424 154 424 173 V285 Q424 305 442 305 H522Z';
      s+=`<g fill-rule="evenodd">${printShape(left,'cream')}${printShape(right,'cream')}</g>`;
      s+=obj('M89 120 L115 146 H102 L81 132 H-20 V120Z','ivory',1.5)+obj('M423 120 L397 146 H410 L431 132 H532 V120Z','ivory',1.5);
      s+=printShape('M102 146 H115 V333 L96 358 H84 L102 331Z','lilac',.75)+printShape('M410 146 H397 V333 L416 358 H428 L410 331Z','lilac',.75);
      s+=line('M-8 160 H69 Q81 160 81 174 V283 Q81 298 68 298 H-8 M520 160 H443 Q431 160 431 174 V283 Q431 298 444 298 H520',.4,.7);
      for(const yy of [185,215,245])s+=obj(`M96 ${yy} h5 v13 h-5Z`,'recess',.7)+obj(`M411 ${yy} h5 v13 h-5Z`,'recess',.7);
      s+=fastener(91,143,2)+fastener(421,143,2)+fastener(92,335,2)+fastener(420,335,2);
      s+=internalRail(91,161,159)+internalRail(403,161,159);
      s+=seal(22,329,'IN')+seal(459,329,'OUT');
      // Central glass sleeve: shaped rear, open top, inset seams and root dock.
      s+=`<g class="core-shell">${obj(`M146 ${y+3} V155 Q146 103 198 103 H314 Q366 103 366 155 V${y+3}Z`,'glass',.76)}`;
      s+=surface(`M152 ${y-3} V156 Q152 110 198 110 H314 Q359 110 359 156 V${y-3}`,'none',`stroke="${c.secondary}" stroke-width="3.5" opacity=".5"`);
      s+=line(`M159 198 V156 Q159 117 198 117 H314 M354 174 V${y-3}`, .42,.85)+`</g>`;
      s+=obj('M180 106 Q180 90 256 90 Q332 90 332 106 V115 Q256 129 180 115Z','glass',.35,0);
      s+=`<ellipse cx="256" cy="102" rx="76" ry="11" fill="url(#obj-ivory)" opacity=".9"/><ellipse cx="256" cy="102" rx="55" ry="5" fill="url(#obj-recess)" opacity=".5"/>`;
      s+=etch(192,110,128,9,31)+line('M168 157 V314 M174 149 V206',.24,.5);
      s+=text('LIVING / CORE',256,117,5.2,{anchor:'middle',tracking:1});
      s+=printShape(`M153 ${y+6} Q153 ${y-11} 256 ${y-11} Q359 ${y-11} 359 ${y+6} V${y+27} Q359 ${y+45} 256 ${y+45} Q153 ${y+45} 153 ${y+27}Z`,'lilac',.9);
      s+=`<ellipse cx="256" cy="${y+4}" rx="102" ry="17" fill="url(#obj-ivory)" opacity=".9"/><ellipse cx="256" cy="${y+4}" rx="69" ry="10" fill="url(#obj-recess)" opacity=".38"/>`;
      s+=etch(182,y+19,148,18,35,1);
      s+=`<g opacity="${c.internalAlpha/100}">`+line(`M174 ${y+27} V${y+12} L191 ${y-4} V${y-20} M181 ${y+27} V${y+15} L198 ${y-2} V${y-15} M338 ${y+27} V${y+12} L321 ${y-4} V${y-20} M331 ${y+27} V${y+15} L314 ${y-2} V${y-15}`,.6,.75)+`</g>`;
      s+=contact(256+c.focusX,y,58)+glow(256,251,128,141)+focus(256,y);
      s+=`<g class="core-clips"><g>${obj('M142 222 L151 216 H161 V256 H151 L142 250Z','face',1.6)}${fastener(151,236,2)}${line('M155 222 v28',.7,1.6)}</g><g>${obj('M370 222 L361 216 H351 V256 H361 L370 250Z','face',1.6)}${fastener(361,236,2)}${line('M357 222 v28',.7,1.6)}</g></g>`;
      s+=surface(`M153 ${y+9} Q153 ${y+24} 175 ${y+26} V${y+39} Q153 ${y+34} 153 ${y+27}Z`,'url(#obj-anchor)',`opacity="${c.anchorContrast*.007}"`);
      s+=`<g class="activation-seam">${rect(234,y+24,44,3,1.5,.9,c.secondary)}${line(`M223 ${y+24} h-23 M289 ${y+24} h23`,.36,.75)}</g>`;
      s+=fastener(167,y+23,1.6)+fastener(345,y+23,1.6)+text('CORE '+String(state.selected+1).padStart(2,'0'),256,y+38,6.1,{anchor:'middle',tracking:.6});
      s+=instrumentLabel(22,375,83,'IN / VOICES')+instrumentLabel(407,375,83,'RETURN');
    }
    return s+'</g><rect x="18" y="70" width="476" height="336" fill="#ffffff" fill-opacity="0" filter="url(#art-paper)" pointer-events="none"/></g>';
  }
  function action(name, x, label, icon) {
    return `<g data-action="${name}" role="button" tabindex="0" aria-label="${label}"><circle cx="${x}" cy="484" r="14" fill="${cfg().line}" opacity=".14"/>${icon ? `<path d="${icon}" fill="none" stroke="${cfg().ink}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>` : text(label, x, 487, 8, { anchor: 'middle' })}</g>`;
  }
  function screen() {
    records = [];
    const c = cfg(), selected = entryInfo(state.entries[state.selected]), pad = c.padding;
    let s = `<title>${S.esc(modes[state.mode].name)} / ${S.esc(selected.name)}</title>${sceneDefs()}<rect width="512" height="512" fill="${c.bg}"/>`;
    s += text('synth-plant',pad,37,20,{tracking:-.5})+text('A WINDOW INTO TIMBRE',pad,54,6,{tracking:1.1});
    s += text(String(state.selected+1).padStart(2,'0'),450,39,20,{anchor:'end'})+text('/ '+String(state.entries.length).padStart(2,'0'),482,39,9,{anchor:'end',fill:c.line});
    s += `<rect x="17.5" y="69.5" width="477" height="337" rx="16.5" fill="none" stroke="${c.line}" stroke-opacity=".19"/>${scenery()}`;
    if(c.labels) {
      const size=Math.min(c.labelSize,400/Math.max(1,selected.name.length)/.612);
      s += text(selected.name,pad,437,size)+text(selected.words,pad,454,6.2,{tracking:.35});
      s += `<g data-action="pack" role="button" tabindex="0" aria-label="插入音色包">${rect(450,417,34,34,8,.18)}<path d="M461 434h12 M467 428v12" stroke="${c.ink}" stroke-width="1.4" stroke-linecap="round"/></g>`;
      s += line('M28 467 H484',.32,.7)+action('prev',43,'上一个','M45 480 l-4 4 4 4')+action('next',469,'下一个','M467 480 l4 4 -4 4');
      s += `<g data-action="grow" role="button" tabindex="0" aria-label="重新生长">${text(modes[state.mode].en,256,487,7,{anchor:'middle',tracking:1})}</g>`;
    }
    if($('safe-area').checked) s += `<g pointer-events="none" opacity=".45" transform="translate(${c.sceneX} ${c.sceneY}) scale(${c.sceneScale/100})"><path d="M24 77 L${c.vanishX} ${c.vanishY} L488 77 M24 403 L${c.vanishX} ${c.vanishY} L488 403" stroke="${c.ink}" stroke-width=".7" stroke-dasharray="3 5" fill="none"/><circle cx="${c.vanishX}" cy="${c.vanishY}" r="3" fill="${c.ink}"/></g><rect x="${pad}" y="${pad}" width="${512-2*pad}" height="${512-2*pad}" rx="4" fill="none" stroke="${c.ink}" stroke-width=".8" opacity=".4" stroke-dasharray="3 5" pointer-events="none"/>`;
    return s;
  }
  function render() {
    const svg = $('scene-screen'); const previous = records.map(r => ({...r})); svg.innerHTML = screen(); animateSelection(svg, previous); svg.setAttribute('width', state.resolution); svg.setAttribute('height', state.resolution); svg.style.setProperty('--architecture-opacity', .55 + cfg().detail / 220);
    $('scene-build').textContent='画面 '+BUILD; $('resolution').value = state.resolution; $('device-frame').style.width = $('actual-size').checked ? state.resolution + 'px' : '';
    $('mode-number').textContent = 'SCHEME ' + String(state.mode + 1).padStart(2, '0') + ' / 03';
    $('mode-title').textContent = modes[state.mode].name; $('mode-description').textContent = modes[state.mode].description;
    if ($('scheme-list').dataset.activeMode !== String(state.mode)) {
    $('scheme-list').innerHTML = modes.map((m, i) => `<button class="scheme-button" data-mode="${i}" aria-pressed="${state.mode === i}"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="8" fill="${fresh(i).bg}"/><path d="M9 55V28a23 23 0 0 1 46 0v27Z" fill="${fresh(i).line}" opacity=".23"/><g transform="translate(3 -3) scale(.18)">${rawPlant([3,0,8][i],'nav-'+i,{grain:0,particleCount:0})}</g><path d="M7 55h50v4H7Z" fill="${fresh(i).line}" opacity=".55"/></svg><span><strong>${String(i + 1).padStart(2, '0')} ${m.name}</strong><small>${m.en}</small></span></button>`).join('');
    $('scheme-list').dataset.activeMode = String(state.mode);
    }
    $('voice-list').innerHTML = state.entries.map((e, i) => { const p = entryInfo(e); return `<button class="voice-chip" data-voice="${i}" aria-pressed="${i === state.selected}"><i style="background:${p.color}"></i>${e.type === 'pack' ? '▧ ' + S.esc(p.local) : S.esc(p.name)}</button>`; }).join('');
    const oldSlot = currentSlot; if (!records.some(r => r.slot === currentSlot)) currentSlot = 'focus';
    $('scene-object').innerHTML = records.map(r => `<option value="${r.slot}">${r.label}</option>`).join(''); $('scene-object').value = currentSlot;
    if (oldSlot !== currentSlot) objectControls();
    const e = state.entries[state.selected], index = e.type === 'plant' ? e.plant : packs.find(p => p.id === e.pack).members[0];
    $('edit-voice').href = 'index.html?plant=' + index;
  }
  function animateSelection(svg, previous) {
    const moving = animation; animation = '';
    if (!moving || !svg.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // FLIP-style positional continuity: selected specimen travels from its prior shelf.
    for (const r of records) {
      const el = svg.querySelector(`[data-slot="${r.slot}"] .specimen-motion`);
      if (!el) continue;
      const old = previous.find(p => p.index === r.index), scale = r.width/320;
      const dx=old ? (old.x-r.x)/scale : direction*30, dy=old ? (old.y-r.y)/scale : 10;
      const ratio=old ? old.width/r.width : .96;
      el.style.transformOrigin='160px 334px';
      if (moving==='grow' && r.slot==='focus') {
        const foliage=el.querySelector('[data-part="plant"]');
        foliage?.animate([{clipPath:'inset(100% 0 0)',opacity:0},{clipPath:'inset(0% 0 0)',opacity:1}],{duration:800,easing:'cubic-bezier(.22,.8,.25,1)'});
      } else el.animate([{translate:`${dx}px ${dy}px`,scale:ratio,opacity:old?.9:0},{translate:'0px 0px',scale:1,opacity:1}],{duration:r.slot==='focus'?680:780,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    if(state.mode===0)svg.querySelector('.corridor-front')?.animate([{translate:`${direction*20}px 0`},{translate:'0px 0'}],{duration:900,easing:'cubic-bezier(.22,1,.36,1)'});
    if(state.mode===1)svg.querySelector('.atlas-page')?.animate([{translate:`${direction*15}px 3px`,opacity:.3},{translate:'0px 0px',opacity:1}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
    if(state.mode===2){
      svg.querySelector('.activation-seam')?.animate([{opacity:.1},{opacity:.1,offset:.5},{opacity:1}],{duration:900,easing:'ease-out'});
      svg.querySelectorAll('.core-clips > g').forEach((clip,i)=>clip.animate([{translate:`${i?-5:5}px 0`,opacity:.3},{translate:'0px 0',opacity:1}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'}));
    }
    svg.querySelector('.room-parallax')?.animate([{translate:`${direction*9}px 0`},{translate:'0px 0'}],{duration:1000,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  function control(key, label, min, max, step, unit, value, scope = 'scene') {
    return `<div class="control-row"><label for="${scope}-${key}-range">${label}</label><div class="number-wrap"><input id="${scope}-${key}-number" type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-scope="${scope}" data-key="${key}" aria-label="${label}数值"><span>${unit}</span></div><input id="${scope}-${key}-range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-scope="${scope}" data-key="${key}" aria-label="${label}" style="--range:${(value - min) / (max - min) * 100}%"></div>`;
  }
  function inspector() {
    $('scene-controls').innerHTML = settings.slice(0, 13).map(([k, label, min, max, step, unit]) => control(k, label, min, max, step, unit, cfg()[k])).join('');
    $('appearance-controls').innerHTML = settings.slice(13).map(([k, label, min, max, step, unit]) => control(k, label, min, max, step, unit, cfg()[k])).join('');
    $('screen-color').value = cfg().bg; $('scenery-color').value = cfg().line; $('type-color').value = cfg().ink; $('secondary-color').value=cfg().secondary; $('gradient-type').value=cfg().gradientType; $('screen-labels').checked = cfg().labels; $('override-pot').checked = cfg().overridePot;
    $('scene-pot').innerHTML = Object.entries(S.POT_NAMES).map(([id, name]) => `<option value="${id}">${name}</option>`).join(''); $('scene-pot').value = cfg().pot;
    objectControls(); profileControls();
  }
  function profileControls() {
    const p=profile(),e=state.entries[state.selected];
    $('profile-controls').innerHTML=e.type==='pack'?'<p class="muted">组合盆景显示成员音色的综合听感画像。</p>':['明亮感','厚重感','空气／空间感','尾音延续'].map((label,i)=>control(String(i),label,0,100,1,'%',p.axes[i],'profile')).join('');
    const index=entryPlantIndex();$('profile-description').textContent=index===3?'扇状叶面、高低错落的细芦苇与星芒表达明亮、向前、富有张力的主奏音色。':S.PRESETS[index].meaning;
  }
  function objectControls() {
    const o = cfg().objects[currentSlot] || { x: 0, y: 0, scale: 100, opacity: 100 };
    $('scene-object-controls').innerHTML = [['x', '水平位移', -150, 150, 1, 'px'], ['y', '垂直位移', -150, 150, 1, 'px'], ['scale', '对象比例', 40, 180, 1, '%'], ['opacity', '对象透明度', 0, 100, 1, '%']].map(([key, label, min, max, step, unit]) => control(key, label, min, max, step, unit, o[key], 'object')).join('');
  }
  function sync(scope, key, value) {
    const r = $(`${scope}-${key}-range`), n = $(`${scope}-${key}-number`);
    if (r) { r.value = value; r.style.setProperty('--range', (value - Number(r.min)) / (Number(r.max) - Number(r.min)) * 100 + '%'); }
    if (n && document.activeElement !== n) n.value = value;
  }
  function schedule() { if (!drawTimer) drawTimer = requestAnimationFrame(() => { drawTimer = 0; animation = ''; render(); }); persist(); }
  function choose(index, grow = false) { const prev = state.selected; state.selected = wrapIndex(index); direction = index >= prev ? 1 : -1; animation = grow ? 'grow' : 'shift'; currentSlot = 'focus'; render(); objectControls(); profileControls(); commit(); }
  function openPack() {
    $('pack-options').innerHTML = packs.map((p, i) => `<button class="pack-option" data-pack="${i}" aria-pressed="${chosenPack === i}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="45 50 230 295" role="img" aria-label="${p.name}组合盆景">${packGraphic({ type: 'pack', pack: p.id, representation: 'bonsai' }, 'pack-preview-' + i)}</svg><strong>${p.name}</strong><small>${p.words}<br>3 VOICES / ${p.en}</small></button>`).join('');
    $('pack-summary').textContent = packs[chosenPack].name + ' · 3 个音色'; if (!$('pack-dialog').open) $('pack-dialog').showModal();
  }
  $('scheme-list').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; state.mode = Number(b.dataset.mode); currentSlot = 'focus'; animation = 'shift'; render(); inspector(); commit(); });
  $('voice-list').addEventListener('click', e => { const b = e.target.closest('[data-voice]'); if (b) choose(Number(b.dataset.voice)); });
  $('scene-prev').addEventListener('click', () => choose(state.selected - 1)); $('scene-next').addEventListener('click', () => choose(state.selected + 1));
  $('scene-grow').addEventListener('click', () => choose(state.selected, true));
  $('scene-object').addEventListener('change', e => { currentSlot = e.target.value; objectControls(); render(); });
  document.querySelector('.scene-inspector').addEventListener('click',e=>{
    const button=e.target.closest('[data-look]');if(!button)return;
    const c=cfg();c.sceneAlpha=50;
    if(button.dataset.look==='mono'){c.colorMix=0;c.fadeStart=6;c.fadeEnd=80;}
    if(button.dataset.look==='color'){c.colorMix=75;c.diffusion=12;c.fadeStart=6;c.fadeEnd=78;}
    animation='';render();inspector();commit();
  });
  document.querySelector('.scene-inspector').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.scope) {
      if (el.value === '' || !Number.isFinite(Number(el.value))) return;
      const value = Number(clamp(Math.round(Number(el.value) / Number(el.step)) * Number(el.step), Number(el.min), Number(el.max)).toFixed(3));
      if (el.dataset.scope === 'scene') cfg()[el.dataset.key] = value;
      else if(el.dataset.scope==='profile'){const entry=state.entries[state.selected];if(entry.type==='plant')state.profiles[entry.plant].axes[Number(el.dataset.key)]=value;}
      else { cfg().objects[currentSlot] ||= { x: 0, y: 0, scale: 100, opacity: 100 }; cfg().objects[currentSlot][el.dataset.key] = value; }
      sync(el.dataset.scope, el.dataset.key, value); schedule();
    } else if (['screen-color', 'scenery-color', 'type-color','secondary-color'].includes(el.id)) { cfg()[{ 'screen-color': 'bg', 'scenery-color': 'line', 'type-color': 'ink','secondary-color':'secondary' }[el.id]] = el.value; schedule(); }
  });
  document.querySelector('.scene-inspector').addEventListener('change', e => {
    const el = e.target;
    if(el.id==='gradient-type')cfg().gradientType=el.value;
    if (el.id === 'screen-labels') cfg().labels = el.checked;
    if (el.id === 'override-pot') cfg().overridePot = el.checked;
    if (el.id === 'scene-pot') { cfg().pot = el.value; cfg().overridePot = true; $('override-pot').checked = true; animation = 'grow'; render(); }
    else schedule();
    commit();
  });
  $('reset-scene-object').addEventListener('click', () => { delete cfg().objects[currentSlot]; render(); objectControls(); commit(); });
  $('reset-layout').addEventListener('click', () => { state.configs[state.mode] = fresh(state.mode); render(); inspector(); commit(); toast('已恢复当前方案，可撤销。'); });
  $('scene-undo').addEventListener('click', () => travel(-1)); $('scene-redo').addEventListener('click', () => travel(1));
  $('resolution').addEventListener('change', e => { state.resolution = Number(e.target.value); render(); commit(); });
  $('actual-size').addEventListener('change', render); $('safe-area').addEventListener('change', render);
  const svg = $('scene-screen');
  svg.addEventListener('pointerdown', e => {
    if (e.target.closest('[data-action],[data-pot],[data-tab]')) return;
    const slot = e.target.closest('[data-slot]'), matrix = (svg.querySelector('.scene-world') || svg).getScreenCTM().inverse();
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix);
    gesture = { slot: slot?.dataset.slot, index: slot ? Number(slot.dataset.entry) : null, point, moved: false, matrix, start: slot ? copy(cfg().objects[slot.dataset.slot] || { x: 0, y: 0, scale: 100, opacity: 100 }) : null };
    if (slot) { currentSlot = slot.dataset.slot; $('scene-object').value = currentSlot; objectControls(); }
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove', e => {
    if (!gesture?.slot) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(gesture.matrix), dx = point.x - gesture.point.x, dy = point.y - gesture.point.y;
    if (Math.abs(dx) + Math.abs(dy) < 4) return;
    gesture.moved = true; cfg().objects[gesture.slot] = { ...gesture.start, x: Math.round(clamp(gesture.start.x + dx, -150, 150)), y: Math.round(clamp(gesture.start.y + dy, -150, 150)) };
    sync('object', 'x', cfg().objects[gesture.slot].x); sync('object', 'y', cfg().objects[gesture.slot].y); schedule();
  });
  svg.addEventListener('pointerup', e => {
    if (!gesture) return;
    const g = gesture; gesture = null;
    if (g.slot && !g.moved) choose(g.index);
    else if (!g.slot) { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(g.matrix); if (Math.abs(p.x - g.point.x) > 32) choose(state.selected + (p.x < g.point.x ? 1 : -1)); }
    else commit();
  });
  svg.addEventListener('pointercancel', () => { gesture = null; commit(); });
  function screenAction(e) {
    const a = e.target.closest('[data-action]'), p = e.target.closest('[data-pot]'), tab=e.target.closest('[data-tab]');
    if(tab){choose(Number(tab.dataset.tab));return;}
    if (a) { const name = a.dataset.action; if (name === 'pack') openPack(); else if (name === 'grow') choose(state.selected, true); else choose(state.selected + (name === 'prev' ? -1 : 1)); }
    if (p) { cfg().pot = p.dataset.pot; cfg().overridePot = true; animation = 'grow'; render(); inspector(); commit(); }
  }
  svg.addEventListener('click', screenAction);
  document.addEventListener('keydown', e => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName) || $('pack-dialog').open) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); choose(state.selected + (e.key === 'ArrowLeft' ? -1 : 1)); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(e.shiftKey ? 1 : -1); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('#scene-screen')) { e.preventDefault(); const slot = e.target.closest('[data-entry]'); if (slot) choose(Number(slot.dataset.entry)); else screenAction(e); }
  });
  $('add-pack').addEventListener('click', openPack); $('close-pack').addEventListener('click', () => $('pack-dialog').close());
  $('pack-options').addEventListener('click', e => { const b = e.target.closest('[data-pack]'); if (b) { chosenPack = Number(b.dataset.pack); openPack(); } });
  $('insert-pack').addEventListener('click', () => {
    if (state.entries.length >= 512) { toast('当前库最多保留 512 个音色或音色包。'); return; }
    const representation = document.querySelector('input[name=representation]:checked').value;
    state.entries.push({ type: 'pack', pack: packs[chosenPack].id, representation, id: 'pack-' + Date.now() });
    $('pack-dialog').close(); choose(state.entries.length - 1, true); toast('已插入' + (representation === 'bonsai' ? '组合盆景' : '音色插画卡') + '，可继续拖动与微调。');
  });
  function download(content, name, type) { const url = URL.createObjectURL(new Blob([content], { type })), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1200); }
  $('scene-export').addEventListener('click', () => {
    const c = cfg(), was = $('safe-area').checked; $('safe-area').checked = false; animation = '';
    const art = screen(); $('safe-area').checked = was;
    const metadata = S.esc(JSON.stringify(state));
    const source = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${state.resolution}" height="${state.resolution}" viewBox="0 0 512 512"><metadata>${metadata}</metadata>${art}</svg>`;
    download(source, 'synth-plant-' + modes[state.mode].id + '-' + state.resolution + '.svg', 'image/svg+xml;charset=utf-8'); render(); toast('已导出当前正方形屏幕 SVG。');
  });
  $('layout-save').addEventListener('click', () => download(JSON.stringify({ ...state, plants: S.recipe(plantStates) }, null, 2), 'synth-plant-square-layout.json', 'application/json'));
  $('layout-import').addEventListener('click', () => $('layout-file').click());
  $('layout-file').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try { if (file.size > 8 * 1024 * 1024) throw new Error('请选择小于 8 MB 的排版文件。'); const data = JSON.parse(await file.text()), clean = normalize(data); if (data.plants) plantStates = S.validateRecipe(data.plants); state = clean; currentSlot = 'focus'; animation = ''; render(); inspector(); commit(); toast('已载入场景、听感画像与音色包。'); } catch (error) { toast(error instanceof SyntaxError ? '排版文件不是有效的 JSON。' : error.message); }
    e.target.value = '';
  });
  render(); inspector(); commit();
})();
