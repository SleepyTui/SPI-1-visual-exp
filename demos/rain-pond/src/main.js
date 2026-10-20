import './style.css';
import {createState,DEFAULTS,clamp} from './domain.js';
import {SoundEntity} from './audio.js';
import {ControlStore,RANGES,bindGestures,bindStrip,bindHoldButton} from './controls.js';
import {PondRenderer,SKINS,appearanceDefaults,VISUAL_RANGES} from './renderer.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const soundState=createState();
const appearances=Object.fromEntries(Object.keys(SKINS).map(k=>[k,appearanceDefaults(k)]));
const sound=new SoundEntity(soundState);
let skin='frost',saveTimer,startPromise;
function message(text){$('#message').textContent=text;}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem('rain-pond-v1',JSON.stringify(snapshot()));}catch{message('当前浏览器未保存参数；仍可导出 JSON');}},350);}
function snapshot(){const {hold,...state}=soundState;return{version:1,skin,sound:state,appearance:appearances};}
function safeAppearance(key,data){const result=appearanceDefaults(key);for(const [k,range]of Object.entries(VISUAL_RANGES)){if(Number.isFinite(data?.[k]))result[k]=clamp(data[k],...range);}for(const k of ['showRegion','showGrid','showHits'])if(typeof data?.[k]==='boolean')result[k]=data[k];for(const k of ['rainColor','rippleColor','accentColor'])if(/^#[0-9a-f]{6}$/i.test(data?.[k]))result[k]=data[k];return result;}
const store=new ControlStore(soundState,key=>{if(['master','water','leaf','dish','reverb','brightness','waterTail','leafTail','dishTail'].includes(key))sound.apply();syncControls();syncStrips();if(key!=='hold')save();});
function loadConfig(data){if(data.version!==1)throw new Error('参数文件版本不兼容');if(!data.sound||!data.appearance)throw new Error('参数文件不完整');store.import(data.sound);for(const k of Object.keys(SKINS))appearances[k]=safeAppearance(k,data.appearance[k]);if(data.skin in SKINS)skin=data.skin;}
try{const saved=localStorage.getItem('rain-pond-v1');if(saved)loadConfig(JSON.parse(saved));}catch{/* Malformed local settings must never prevent startup. */}
const renderer=new PondRenderer($('#pond'),sound,appearances);renderer.setSkin(skin);
async function ensureStarted(){if(sound.running)return;if(startPromise)return startPromise;$('#play-button').disabled=true;startPromise=sound.start().then(()=>{message('声音已开启 · 拖动雨区开始演奏');}).catch(e=>{message(`音频未启动：${e.message}`);sound.error=e.message;}).finally(()=>{$('#play-button').disabled=false;startPromise=null;syncTransport();});return startPromise;}
function syncTransport(){$('#play-button').textContent=sound.running?'Ⅱ 暂停聆听':'▶ 开始聆听';$('#play-button').classList.toggle('running',sound.running);$('#audio-status').classList.toggle('running',sound.running);$('#audio-status').innerHTML=`<i></i>${sound.running?'声音正在生成':'声音待开启'}`;$('#live-dot').classList.toggle('running',sound.running);}
$('#play-button').addEventListener('click',()=>{if(sound.running){sound.pause();store.release();syncTransport();message('已暂停 · 参数与声音实体保留');}else ensureStarted();});
bindGestures({surface:$('#pond'),store,unproject:(x,y)=>renderer.pointer(x,y),onUserGesture:ensureStarted});
bindStrip($('#x-strip'),'x',store);bindStrip($('#y-strip'),'y',store);bindHoldButton($('#hold-button'),store,ensureStarted);
function syncStrips(){for(const axis of ['x','y']){const e=$(`#${axis}-strip`);e.querySelector('i').style[axis==='x'?'left':'top']=`${soundState[axis]*100}%`;e.setAttribute('aria-valuenow',Math.round(soundState[axis]*100));}$('#hold-button').classList.toggle('held',!!soundState.hold);}
function control(parent,{key,label,en='',unit='%',step=.01,visual=false}){
 const values=visual?appearances[skin]:soundState,range=(visual?VISUAL_RANGES:RANGES)[key],scale=unit==='%'?100:1;
 const node=document.createElement('div');node.className='control';node.dataset.control=key;node.dataset.kind=visual?'visual':'sound';
 node.innerHTML=`<div class="control-heading"><label class="control-label" for="${visual?'v':'s'}-${key}">${label}<small>${en}</small></label><div class="number-wrap"><input type="number" aria-label="${label}数值" min="${range[0]*scale}" max="${range[1]*scale}" step="${step*scale}" value="${values[key]*scale}"><span>${unit}</span></div></div><input id="${visual?'v':'s'}-${key}" type="range" aria-label="${label}" min="${range[0]}" max="${range[1]}" step="${step}" value="${values[key]}">`;
 const rangeInput=node.querySelector('[type=range]'),numberInput=node.querySelector('[type=number]');
 const update=value=>{if(!Number.isFinite(value))return;if(visual){appearances[skin][key]=clamp(value,...range);renderer.staticDirty=true;syncControls();save();}else store.set(key,value);};
 rangeInput.addEventListener('input',()=>update(+rangeInput.value));numberInput.addEventListener('change',()=>{update(+numberInput.value/scale);syncControls();});parent.append(node);
}
function syncControls(){for(const node of $$('[data-control]')){const visual=node.dataset.kind==='visual',key=node.dataset.control,value=(visual?appearances[skin]:soundState)[key],input=node.querySelector('[type=range]'),num=node.querySelector('[type=number]'),scale=node.querySelector('.number-wrap span').textContent==='%'?100:1;input.value=value;input.style.setProperty('--value',`${(value-input.min)/(input.max-input.min)*100}%`);if(document.activeElement!==num)num.value=+(value*scale).toFixed(scale===100?0:2);}if($('#harmony-toggle'))$('#harmony-toggle').checked=soundState.harmony;}
const add=(parent,rows,visual=false)=>rows.forEach(([key,label,en,unit='%',step=.01])=>control(parent,{key,label,en,unit,step,visual}));
add($('#rain-controls'),[['rain','基础雨量','BASE RAIN'],['radius','雨区范围','SPREAD · 0 停雨 / 100 全局'],['bpm','雨速','PULSE RATE','BPM',1],['density','雨密','EVENT DENSITY'],['rhythm','节律感','LOOSE → RHYTHMIC']]);
add($('#region-controls'),[['x','左右位置','X · 横触摸条'],['y','远近位置','Y · 纵触摸条'],['aspect','雨区宽高比','REGION ASPECT','×',.05],['boost','按住增加量','HOLD BOOST']]);
add($('#sound-controls'),[['master','总音量','MASTER'],['water','水面','WATER · 中长主体音'],['leaf','荷叶','LEAF · 低频承托'],['dish','浅碟','DISH · 清脆点缀'],['reverb','空间感','REVERB SEND'],['brightness','明亮度','TIMBRE'],['waterTail','水面尾音','RELEASE','s',.1],['leafTail','低音尾音','RELEASE','s',.1],['dishTail','浅碟尾音','RELEASE','s',.05],['leafWeight','荷叶命中偏好','BASS ANCHOR'],['dishWeight','浅碟命中偏好','DISH ACCENT'],['harmonyBars','换和声间隔','HARMONY LENGTH','小节',1]]);
$('#harmony-toggle').addEventListener('change',e=>{soundState.harmony=e.target.checked;save();});
function buildVisualControls(){const parent=$('#visual-controls');parent.replaceChildren();const groups=[
 ['降雨形态','RAIN',[['fallDuration','下落时长','同一落地时间，改变可见轨迹','s',.01],['rainSize','雨滴大小','HEAD / STROKE','×',.05],['rainTail','雨尾长度','RELATIVE TO SCENE'],['rainOpacity','雨滴不透明度','OPACITY'],['ambient','氛围雨数量','视觉纹理 · 不生成音符','',1]]],
 ['涟漪与接触','RIPPLES',[['rippleDuration','涟漪寿命','LIFETIME','s',.1],['rippleRadius','最大扩散范围','RELATIVE TO SCENE'],['rings','波环层数','RINGS','',1],['ellipse','水波扁平度','ELLIPSE RATIO','×',.01],['stroke','线条粗细','LINE WEIGHT','×',.1],['broken','断环比例','BROKEN ARCS'],['rippleOpacity','涟漪不透明度','OPACITY'],['splash','溅起高度','IMPACT HEIGHT']]],
 ['物体与画面','SCENE',[['leafFlex','荷叶受击形变','LEAF FLEX'],['dishRock','浅碟受击摆动','DISH ROCK'],['cameraScale','整体缩放','CAMERA SCALE','×',.01],['perspective','纵向透视比例','Y PROJECTION','×',.01],['grain','叠加纸纹','TEXTURE'],['cloudOpacity','雨区提示强度','REGION OUTLINE']]],
 ['绘制预算','BUDGET',[['ringBudget','同时绘制事件上限','仅裁减旧视觉，不删声音','',1],['fps','画面帧率上限','RENDER CAP','FPS',1]]]
 ];
 for(const [i,[label,en,rows]]of groups.entries()){const details=document.createElement('details');details.className='control-group';details.open=i===0;details.innerHTML=`<summary>${label}<span>${en}</span></summary><div></div>`;add(details.querySelector('div'),rows,true);parent.append(details);}
 const flags=document.createElement('details');flags.className='control-group';flags.innerHTML='<summary>颜色与调试叠层<span>OVERLAYS</span></summary>';for(const [k,label]of [['rainColor','雨滴颜色'],['rippleColor','涟漪颜色'],['accentColor','特殊命中颜色']]){const wrap=document.createElement('label');wrap.className='color-control';wrap.textContent=label;const inp=document.createElement('input');inp.type='color';inp.value=appearances[skin][k];inp.addEventListener('input',()=>{appearances[skin][k]=inp.value;save();});wrap.append(inp);flags.append(wrap);}for(const [k,label]of [['showRegion','显示雨区轮廓'],['showGrid','显示逻辑网格'],['showHits','显示命中 ID 和音符']]){const wrap=document.createElement('label');wrap.className='check-label';const inp=document.createElement('input');inp.type='checkbox';inp.checked=appearances[skin][k];inp.addEventListener('change',()=>{appearances[skin][k]=inp.checked;save();});wrap.append(inp,label);flags.append(wrap);}parent.append(flags);syncControls();}
function setSkin(next){skin=next;renderer.setSkin(skin);$$('[data-skin]').forEach(b=>{b.classList.toggle('active',b.dataset.skin===skin);b.setAttribute('aria-selected',b.dataset.skin===skin);});$('#scene-caption').textContent=`${SKINS[skin].name} / 独立声音实体 · 共享交互`;buildVisualControls();save();message(`已切换${SKINS[skin].name} · 音符生成继续`);}
$$('[data-skin]').forEach(b=>b.addEventListener('click',()=>setSkin(b.dataset.skin)));
$$('[data-panel]').forEach(b=>b.addEventListener('click',()=>{$$('[data-panel]').forEach(tab=>{const active=tab===b;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',active);$(`#panel-${tab.dataset.panel}`).hidden=!active;});}));
$('#profile').addEventListener('change',e=>{$('#canvas-wrap').classList.toggle('device',e.target.value==='320');renderer.setProfile(e.target.value);message(e.target.value==='320'?'320 × 320 像素预览；设备性能待实测':'桌面画质预览');});
$('#reset-visual').addEventListener('click',()=>{appearances[skin]=appearanceDefaults(skin);renderer.staticDirty=true;buildVisualControls();save();message('已还原当前皮肤参数');});
function download(name,url){const a=document.createElement('a');a.download=name;a.href=url;document.body.append(a);a.click();a.remove();}
$('#export-config').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}));download('rain-pond-settings.json',url);setTimeout(()=>URL.revokeObjectURL(url),2000);message('声音与三套视觉参数已导出');});
$('#import-config').addEventListener('click',()=>$('#config-file').click());
$('#config-file').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;loadConfig(JSON.parse(await file.text()));sound.apply();setSkin(skin);syncControls();syncStrips();save();message('参数已导入；声音实体保持运行');}catch(error){message(`导入失败：${error.message}`);}finally{e.target.value='';}});
$('#capture-button').addEventListener('click',()=>download(`rain-pond-${skin}.png`,$('#pond').toDataURL('image/png')));
$('#help-button').addEventListener('click',()=>$('#help-dialog').showModal());
$('#reference-button').addEventListener('click',()=>{$('#reference-image').src=`${import.meta.env.BASE_URL}assets/reference-${skin}.png`;$('#reference-title').textContent=SKINS[skin].name+' · 视觉定稿';$('#reference-dialog').showModal();});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
setSkin(skin);syncControls();syncStrips();message('三种画面，一个声音实体');
renderer.init().then(()=>{$('#loading').hidden=true;}).catch(e=>{$('#loading').textContent=e.message;message(e.message);});
let latestLog='';
setInterval(()=>{const now=sound.now();$('#chord').textContent=sound.lastChord;$('#bpm-label').textContent=`${soundState.bpm} BPM`;$('#performance-status').textContent=`${Math.round(renderer.fps)} fps · ${renderer.frameMs.toFixed(1)} ms / frame · Canvas 2D`;
 if(!$('#panel-console').hidden){const level=sound.level();const rows=[['声音实体',sound.instanceId.slice(0,8)],['当前皮肤',SKINS[skin].name],['音频时钟',now.toFixed(2)+' s'],['生成步 / 命中序号',`${sound.step} / ${sound.process.sequence}`],['和声',sound.lastChord],['发声 水 / 叶 / 碟',Object.values(sound.counts).join(' / ')],['输出电平',level>0?(20*Math.log10(level)).toFixed(1)+' dB':'−∞ dB'],['正在绘制事件',renderer.visibleHits],['画布像素',`${renderer.canvas.width} × ${renderer.canvas.height}`],['前后画布缓冲',(renderer.canvas.width**2*8/1024).toFixed(0)+' KiB'],['平均绘制用时',renderer.frameMs.toFixed(2)+' ms']];$('#telemetry').innerHTML=rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');$('#mapping-status').textContent=store.last;
 const events=sound.events.filter(e=>e.time<=now).slice(-12).reverse();const signature=events.map(e=>e.id).join(',');if(signature!==latestLog){latestLog=signature;$('#event-log').innerHTML=events.map(e=>`<li class="${e.audible?'':'silent'}"><span>#${e.id}</span><strong>${e.material} ${e.audible?e.note:'·'}</strong><span>${e.x.toFixed(2)}, ${e.y.toFixed(2)}</span></li>`).join('');}}
},150);
// A small, read-only-friendly inspection surface for browser verification.
window.__rainPond={sound,state:soundState,store,renderer,appearances,setSkin,snapshot};
