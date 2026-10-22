/* A compact inspector around an actual-size viewport. All existing controls retain their IDs. */
(function(){
const $=s=>document.querySelector(s),app=ScaleStreetV2,aside=$('aside'),T={zh:{style:'风格',scene:'景观',light:'灯光',sound:'声音',layout:'布局',inspector:'梦境调音台',live:'独立灯效运行中',still:'灯光静态检视',station:'当前音阶',program:'灯效程序',walk:'沿街漫游',archive:'十六个家族，各自一盏灯。',hint:'选择招牌，打开音阶。',panel:'控制面板',back:'返回',focus:'收起控制',resume:'展开控制'},en:{style:'Style',scene:'Scene',light:'Lighting',sound:'Sound',layout:'Layout',inspector:'DREAM CONSOLE',live:'Independent light programs',still:'Static light preview',station:'CURRENT SCALE',program:'LIGHT PROGRAM',walk:'WANDER THE STREET',archive:'Sixteen families. Sixteen lights.',hint:'Select a sign to discover its scale.',panel:'Inspector',back:'Back',focus:'Hide inspector',resume:'Show inspector'}};
let tab='scene';const original=Array.from(aside.children);aside.innerHTML='<div class="inspector-label"><i></i><span id="inspector-name"></span><span class="inspector-index">01—16</span></div><nav class="inspector-tabs" role="tablist"></nav><div class="inspector-body"></div><div class="inspector-save"></div>';
const body=$('.inspector-body'),save=$('.inspector-save');for(const k of ['scene','light','style','sound','layout']){const panel=document.createElement('div');panel.id='inspector-'+k;panel.className='inspector-page';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+k);panel.tabIndex=0;body.append(panel);const b=document.createElement('button');b.id='tab-'+k;b.dataset.inspector=k;b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);$('.inspector-tabs').append(b);b.onclick=()=>{tab=k;sync();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=['scene','light','style','sound','layout'],j=keys.indexOf(tab);tab=e.key==='Home'?keys[0]:e.key==='End'?keys[3]:keys[(j+(e.key==='ArrowRight'?1:4))%5];sync();$('#tab-'+tab).focus();};}
const target=k=>$('#inspector-'+k);
for(const e of original){let k='scene';if(e.classList.contains('control-intro')){e.remove();continue;}const key=e.querySelector('summary')?.dataset.t;
 if(key==='settings'){save.append(e);e.open=true;continue;}
 if(key==='lighting'||key==='renderSettings')k='light';
 if(['ambienceTitle','musicInfo','aboutScale'].includes(key)||e.classList.contains('audio-controls'))k='sound';
 if(key==='placement'||e.classList.contains('rig-panel')||e.classList.contains('v6-popup')||e.querySelector('#sign-scale,#menu-opacity,#menu-blur'))k='layout';if(e.classList.contains('v6-style'))k='style';
 if(e.querySelector('[data-light],[data-view]'))k='light';
 if(e.querySelector('#hue'))k='style';
 if(e.tagName==='DETAILS')e.open=['dreamControls','lighting','placement','popupShape','grade','optics','depthHeading'].includes(key);
 target(k).append(e);
}
const ambiencePanel=$('#ambience-toggle').closest('details');ambiencePanel.classList.add('ambience-panel');ambiencePanel.open=true;target('sound').prepend(ambiencePanel);
const duoPanel=document.querySelector('.duo-panel');if(duoPanel){duoPanel.open=true;target('style').prepend(duoPanel);}
if(document.querySelector('.rig-panel'))target('layout').prepend(document.querySelector('.rig-panel'));
const depthPanel=document.querySelector('.depth-panel'),depthOrder=document.querySelector('.depth-order-panel');if(depthPanel){target('style').prepend(depthPanel);depthPanel.after(depthOrder);}if(duoPanel)target('style').prepend(duoPanel);
target('light').insertAdjacentHTML('afterbegin','<div class="program-note"><span id="program-kicker"></span><strong id="circuit-name"></strong><div class="circuit-leds" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>');
$('.stage-column').insertAdjacentHTML('afterbegin','<div class="scene-eyebrow"><span id="walk-label"></span><span class="live-note"><i></i><span id="live-label"></span></span></div>');
$('.stage-actions').insertAdjacentHTML('afterend','<div class="now-playing"><div id="now-icon"></div><div><span id="now-label"></span><strong id="now-name"></strong></div><div class="now-circuit"><span id="now-program-label"></span><strong id="now-program"></strong></div></div>');
$('.stage-heading').insertAdjacentHTML('beforeend','<button id="focus-view" aria-pressed="false"></button><button id="back-menu" hidden></button>');$('#focus-view').onclick=()=>{document.body.classList.toggle('focus-view');sync();};
$('#back-menu').onclick=()=>{document.querySelector('#scale-menu').hidden=true;$('#open-menu').setAttribute('aria-expanded','false');$('#back-menu').hidden=true;};
// Compact preview controls remain visible; long form controls live in four clear groups.
function sync(){const s=app.state,l=T[s.lang],f=STREET_CATALOG[s.family],p=DreamStreetArt.programs[s.family];$('#inspector-name').textContent=l.inspector;
 for(const b of document.querySelectorAll('[data-inspector]')){const on=b.dataset.inspector===tab;b.textContent=l[b.dataset.inspector];b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;$('#inspector-'+b.dataset.inspector).hidden=!on;}
 $('#back-menu').textContent=l.back;$('#back-menu').hidden=$('#scale-menu').hidden;$('#walk-label').textContent=l.walk;$('#live-label').textContent=s.effect.mode==='steady'?l.still:l.live;$('#program-kicker').textContent=l.program;$('#circuit-name').textContent=p[s.lang==='zh'?0:1];$('#now-program-label').textContent=l.program;$('#now-program').textContent=p[s.lang==='zh'?0:1];$('#now-label').textContent=l.station;const sc=f.scales[s.indices[s.family]];$('#now-name').textContent=s.lang==='zh'?sc.cn:sc.name;$('#now-icon').innerHTML=ScaleStreetArt.iconSVG(s.family,s.indices[s.family]);const focus=document.body.classList.contains('focus-view');$('#focus-view').textContent=focus?l.resume:l.focus;$('#focus-view').setAttribute('aria-pressed',focus);$('.family-heading h2').textContent=l.archive;$('.program-note').style.setProperty('--circuit-color',DreamStreetArt.palettes[s.family][0]);}
globalThis.DreamStudioUI={sync};sync();
})();
