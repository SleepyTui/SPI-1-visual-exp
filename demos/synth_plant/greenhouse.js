(()=>{'use strict';
const S=window.SynthPlant,$=id=>document.getElementById(id),clone=o=>JSON.parse(JSON.stringify(o)),KEY='synth-greenhouse-01';
const initial={version:1,revision:3,paletteBase:'#87b6c1',paletteMode:'mono',paletteActive:false,rack:0,showPlants:true,selected:2,depth:82,vanishX:500,vanishY:440,centerX:42,centerY:38,radius:75,centerAlpha:0,edgeAlpha:100,angle:90,chamberDepth:27,bevel:15,backAlpha:52,railWidth:25,frameWidth:25,panelOpacity:100,glass:58,edge:72,recess:28,blur:18,ambient:64,glow:62,glowSpread:13,cableWidth:5,cableSag:55,cableOpacity:80,hardware:75,knobSize:12,sliderTravel:55,plantOpacity:100,grain:9,bg:'#f5f6fd',frame:'#b6b6db',tint:'#c0e2e4',shadow:'#858eaf',light:'#fffdf5',accent:'#ffd26a',slots:[{plant:2,x:137,y:116,w:251,h:315,px:0,py:0,scale:100,alpha:100},{plant:5,x:532,y:116,w:257,h:315,px:0,py:0,scale:100,alpha:100},{plant:0,x:181,y:443,w:282,h:350,px:0,py:0,scale:100,alpha:100},{plant:1,x:474,y:451,w:230,h:342,px:0,py:0,scale:100,alpha:100},{plant:4,x:711,y:552,w:200,h:241,px:0,py:0,scale:100,alpha:100}]};
const groups=[['当前植物 / 舱位','slot',[['x','舱位 X',30,880,1],['y','舱位 Y',80,820,1],['w','舱位宽度',100,420,1],['h','舱位高度',120,480,1],['px','植物 X',-120,120,1],['py','植物 Y',-120,120,1],['scale','植物大小',45,150,1],['alpha','植物透明度',0,100,1]]],['空间与机架','global',[['depth','透视纵深',0,125,1],['vanishX','消失点 X',300,700,1],['vanishY','消失点 Y',250,650,1],['frameWidth','骨架厚度',12,44,1],['railWidth','侧架宽度',16,34,1],['chamberDepth','舱体内凹深度',8,48,1],['bevel','设备倒角宽度',7,23,1],['backAlpha','背板显影',0,100,1]]],['半透明材质 / 弥散','global',[['panelOpacity','面板显影',0,100,1],['glass','玻璃色层',0,100,1],['edge','折射亮边',0,100,1],['recess','内部暗腔',0,80,1],['blur','背景弥散半径',0,45,1],['ambient','环境光浓度',0,100,1],['plantOpacity','所有植物透明度',0,100,1],['grain','植物微颗粒',0,70,1]]],['渐变位置 / 透明度','global',[['centerX','渐变中心 X',0,100,1],['centerY','渐变中心 Y',0,100,1],['radius','渐变扩散范围',20,150,1],['centerAlpha','中心透明度',0,100,1],['edgeAlpha','边缘透明度',0,100,1],['angle','背板色层渐变角度',0,360,1]]],['选中光晕 / 连接线','global',[['glow','选中光晕',0,100,1],['glowSpread','光晕扩散',1,32,1],['cableWidth','连接线粗细',1,11,.5],['cableSag','连接线垂落',0,150,1],['cableOpacity','连接线透明度',0,100,1]]],['器件细节','global',[['hardware','旋钮 / 推子显影',0,100,1],['knobSize','旋钮半径',7,20,.5],['sliderTravel','推子位置',0,100,1]]]];
const legacy01=[[137,116,251,315],[532,116,257,315],[181,443,282,350],[474,451,230,342],[711,552,200,241]],layout01=[[137,116,352,315],[500,116,365,315],[89,451,267,342],[367,451,267,342],[645,451,267,342]];
const slotDefaults={moduleWidth:58,moduleGap:6,controlX:0,controlY:0};
Object.assign(initial,{upperRetreat:42,middleRetreat:18,upperShift:0,middleShift:0,topExposure:15,topPerspective:30,motion:1,wind:.55,windSpeed:1,particles:9,breath:65,flowSpeed:1,volume:22,sound:1});
initial.slots.forEach((slot,i)=>Object.assign(slot,Object.fromEntries(['x','y','w','h'].map((k,j)=>[k,layout01[i][j]])),slotDefaults,{faces:{plant:{},control:{}}}));
groups[0][2].push(['moduleWidth','控制条宽度',42,92,1],['moduleGap','控制条间距',0,20,1],['controlX','控制条 X 偏移',-80,80,1],['controlY','控制条 Y 偏移',-80,80,1]);
groups.push(['层间退台 / 顶面透视','global',[['upperRetreat','上层向后退',0,140,1],['middleRetreat','中层向后退',0,140,1],['upperShift','上层垂直位置',-45,45,1],['middleShift','中层垂直位置',-45,45,1],['topExposure','顶面露出高度',0,42,1],['topPerspective','顶面透视收缩',0,100,1]]],['植物生命 / 声音','global',[['motion','动画开关',0,1,1],['wind','枝桠摆幅',0,2,.05],['windSpeed','枝桠速度',.3,2,.1],['particles','选中星光 / 气泡数量',0,20,1],['breath','呼吸光强度',0,100,1],['flowSpeed','数据流速度',.3,3,.1],['volume','旋律音量',0,50,1],['sound','选中播放旋律',0,1,1]]]);
const faceRows=[['panelDX','面板 X 微移',-70,70,1],['panelDY','面板 Y 微移',-70,70,1],['panelDW','面板宽度增减',-35,80,1],['panelDH','面板高度增减',-70,70,1],['panelOpacity','面板显影',0,100,1],['glass','透光色层',0,100,1],['bevel','倒角宽度',7,23,1],['chamberDepth','舱内深度',8,48,1],['backAlpha','背板显影',0,100,1],['centerX','渐变中心 X',0,100,1],['centerY','渐变中心 Y',0,100,1],['radius','渐变半径',20,150,1],['centerAlpha','中心透明度',0,100,1],['edgeAlpha','边缘透明度',0,100,1],['angle','背板渐变角度',0,360,1],['topExposure','顶面露出高度',0,42,1],['topPerspective','顶面透视收缩',0,100,1]];
faceRows.push(['hardware','器件显影',0,100,1],['knobSize','旋钮半径',7,20,.5],['sliderTravel','本面板推子位置',0,100,1]);
const partNames={plant:'植物舱体',control:'控制模块',console:'底座 LCD 面板'};
let selectedPart='plant';
let state=clone(initial),plants=S.PRESETS.map(S.initial),timer,raf,drag;
function clean(data){if(!data||data.version!==1||!Array.isArray(data.slots)||data.slots.length!==5)throw Error('请选择温室页面导出的参数文件');const out=clone(initial);for(const [,scope,rows]of groups)for(const [k,,a,b]of rows){if(scope==='global'&&Number.isFinite(data[k]))out[k]=Math.max(a,Math.min(b,data[k]));}for(const k of ['bg','frame','tint','shadow','light','accent'])if(/^#[a-f\d]{6}$/i.test(data[k]))out[k]=data[k];if(/^#[a-f\d]{6}$/i.test(data.paletteBase||''))out.paletteBase=data.paletteBase;if(['mono','analogous','mist'].includes(data.paletteMode))out.paletteMode=data.paletteMode;out.paletteActive=data.paletteActive===true;out.consoleFace={};for(const [key,,min,max]of faceRows)if(Number.isFinite(data.consoleFace?.[key]))out.consoleFace[key]=Math.max(min,Math.min(max,data.consoleFace[key]));for(const key of ['frame','tint','shadow','light'])if(/^#[a-f\d]{6}$/i.test(data.consoleFace?.[key]||''))out.consoleFace[key]=data.consoleFace[key];out.rack=[0,1,2].includes(data.rack)?data.rack:0;out.showPlants=data.showPlants!==false;if(!data.revision){if(out.panelOpacity===70)out.panelOpacity=100;if(out.edgeAlpha===65)out.edgeAlpha=100;if(out.angle===65)out.angle=90;}out.selected=Math.max(0,Math.min(4,Math.trunc(data.selected)||0));out.slots.forEach((v,i)=>{for(const [k,,a,b]of groups[0][2])if(Number.isFinite(data.slots[i][k]))v[k]=Math.max(a,Math.min(b,data.slots[i][k]));if(!out.rack&&(data.revision||0)<3)['x','y','w','h'].forEach((key,j)=>{if(data.slots[i][key]===legacy01[i][j])v[key]=layout01[i][j];});v.faces={plant:{},control:{}};for(const part of ['plant','control']){const src=data.slots[i].faces?.[part]||{};for(const [key,,min,max]of faceRows)if(Number.isFinite(src[key]))v.faces[part][key]=Math.max(min,Math.min(max,src[key]));for(const key of ['frame','tint','shadow','light'])if(/^#[a-f\d]{6}$/i.test(src[key]||''))v.faces[part][key]=src[key];}v.colors={};for(const [key,color] of Object.entries(data.slots[i].colors||{}))if(/^\d+$/.test(key)&&+key<plants.length&&/^#[a-f\d]{6}$/i.test(color))v.colors[key]=color;if(Number.isInteger(data.slots[i].plant)&&data.slots[i].plant>=0&&data.slots[i].plant<plants.length)v.plant=data.slots[i].plant;});return out;}
try{const p=JSON.parse(localStorage.getItem('synth-plant-visual-v2'));if(p)plants=S.validateRecipe(p);}catch{}
try{const d=JSON.parse(localStorage.getItem(KEY));if(d)state=clean(d);}catch{}
const rect=(x,y,w,h,r,fill,alpha=1,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" opacity="${alpha}" ${extra}/>`;
const path=(d,fill,alpha=1,extra='')=>`<path d="${d}" fill="${fill}" opacity="${alpha}" ${extra}/>`;
const circle=(x,y,r,fill,a=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${a}"/>`;
const stroke=(d,color,width,a=1,extra='')=>path(d,'none',a,`stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
const label=(str,x,y,size=10,fill=state.light)=>S.lettering(str,x,y,size,{fill});
function defs(c=state){const a=c.angle*Math.PI/180,dx=Math.cos(a)*50,dy=Math.sin(a)*50;return `<defs>
<linearGradient id="g-frame" x2="1" y2=".1"><stop stop-color="${c.light}" stop-opacity=".9"/><stop offset=".18" stop-color="${c.frame}" stop-opacity=".66"/><stop offset=".5" stop-color="${c.light}" stop-opacity=".3"/><stop offset=".83" stop-color="${c.frame}" stop-opacity=".8"/><stop offset="1" stop-color="${c.light}" stop-opacity=".85"/></linearGradient>
<linearGradient id="g-edge" x2=".2" y2="1"><stop stop-color="${c.light}" stop-opacity=".95"/><stop offset=".22" stop-color="${c.light}" stop-opacity=".4"/><stop offset=".6" stop-color="${c.tint}" stop-opacity=".05"/><stop offset="1" stop-color="${c.light}" stop-opacity=".85"/></linearGradient>
<linearGradient id="g-panel" x1="${50-dx}%" y1="${50-dy}%" x2="${50+dx}%" y2="${50+dy}%"><stop stop-color="${c.light}" stop-opacity=".85"/><stop offset=".1" stop-color="${c.tint}" stop-opacity=".22"/><stop offset=".6" stop-color="${c.light}" stop-opacity=".12"/><stop offset="1" stop-color="${c.frame}" stop-opacity=".5"/></linearGradient>
<radialGradient id="g-glass" cx="${c.centerX}%" cy="${c.centerY}%" r="${c.radius}%"><stop stop-color="${c.light}" stop-opacity="${c.centerAlpha/100}"/><stop offset=".55" stop-color="${c.tint}" stop-opacity=".14"/><stop offset="1" stop-color="${c.tint}" stop-opacity="${c.edgeAlpha/100}"/></radialGradient>
<linearGradient id="g-shadow" x2=".1" y2="1"><stop stop-color="${c.shadow}" stop-opacity=".7"/><stop offset=".4" stop-color="${c.shadow}" stop-opacity=".3"/><stop offset="1" stop-color="${c.shadow}" stop-opacity=".04"/></linearGradient>
<radialGradient id="g-hardware" cx="30%" cy="23%" r="80%"><stop stop-color="${c.light}" stop-opacity=".96"/><stop offset=".55" stop-color="${c.frame}" stop-opacity=".65"/><stop offset=".83" stop-color="${c.shadow}" stop-opacity=".48"/><stop offset="1" stop-color="${c.light}" stop-opacity=".7"/></radialGradient>
<radialGradient id="g-halo"><stop stop-color="${c.accent}" stop-opacity=".7"/><stop offset=".5" stop-color="${c.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>
<radialGradient id="g-room"><stop stop-color="${c.tint}" stop-opacity=".7"/><stop offset=".6" stop-color="${c.frame}" stop-opacity=".18"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
<linearGradient id="g-display" x2=".7" y2="1"><stop stop-color="#93b5d3" stop-opacity=".78"/><stop offset=".7" stop-color="${c.tint}" stop-opacity=".6"/><stop offset="1" stop-color="#87aaca" stop-opacity=".6"/></linearGradient>
<linearGradient id="v-top" x2="0" y2="1"><stop stop-color="${c.light}" stop-opacity="${c.edgeAlpha/100}"/><stop offset=".18" stop-color="${c.light}" stop-opacity=".82"/><stop offset=".7" stop-color="${c.frame}" stop-opacity=".44"/><stop offset="1" stop-color="${c.tint}" stop-opacity="${c.centerAlpha/100}"/></linearGradient>
<linearGradient id="v-bottom" x2="0" y1="1" y2="0"><stop stop-color="${c.light}" stop-opacity="${c.edgeAlpha/100}"/><stop offset=".2" stop-color="${c.light}" stop-opacity=".74"/><stop offset=".7" stop-color="${c.frame}" stop-opacity=".35"/><stop offset="1" stop-color="${c.tint}" stop-opacity="${c.centerAlpha/100}"/></linearGradient>
<linearGradient id="v-left" x2="1" y2="0"><stop stop-color="${c.light}" stop-opacity="${c.edgeAlpha/100}"/><stop offset=".15" stop-color="${c.light}" stop-opacity=".78"/><stop offset=".6" stop-color="${c.frame}" stop-opacity=".35"/><stop offset="1" stop-color="${c.tint}" stop-opacity="${c.centerAlpha/100}"/></linearGradient>
<linearGradient id="v-right" x1="1" x2="0" y2="0"><stop stop-color="${c.light}" stop-opacity="${c.edgeAlpha/100}"/><stop offset=".15" stop-color="${c.light}" stop-opacity=".78"/><stop offset=".6" stop-color="${c.frame}" stop-opacity=".35"/><stop offset="1" stop-color="${c.tint}" stop-opacity="${c.centerAlpha/100}"/></linearGradient>
<linearGradient id="v-ceiling" x2="0" y2="1"><stop stop-color="${c.light}" stop-opacity=".9"/><stop offset=".42" stop-color="${c.frame}" stop-opacity=".36"/><stop offset="1" stop-color="${c.shadow}" stop-opacity=".62"/></linearGradient>
<linearGradient id="v-floor" x2="0" y2="1"><stop stop-color="${c.shadow}" stop-opacity=".38"/><stop offset=".7" stop-color="${c.light}" stop-opacity=".65"/><stop offset="1" stop-color="${c.light}" stop-opacity=".9"/></linearGradient>
<linearGradient id="v-wall-left" x2="1" y2="0"><stop stop-color="${c.light}" stop-opacity=".74"/><stop offset=".5" stop-color="${c.tint}" stop-opacity=".3"/><stop offset="1" stop-color="${c.shadow}" stop-opacity=".5"/></linearGradient>
<linearGradient id="v-wall-right" x1="1" x2="0" y2="0"><stop stop-color="${c.light}" stop-opacity=".74"/><stop offset=".5" stop-color="${c.frame}" stop-opacity=".3"/><stop offset="1" stop-color="${c.shadow}" stop-opacity=".5"/></linearGradient>
<radialGradient id="v-back" cx="${c.centerX}%" cy="${c.centerY}%" r="${c.radius}%"><stop stop-color="${c.light}" stop-opacity="${.12+c.centerAlpha*.005}"/><stop offset=".55" stop-color="#adbfda" stop-opacity=".6"/><stop offset="1" stop-color="${c.shadow}" stop-opacity=".9"/></radialGradient>
<linearGradient id="v-rail" x2="1" y2="0"><stop stop-color="${c.light}"/><stop offset=".13" stop-color="${c.frame}" stop-opacity=".86"/><stop offset=".7" stop-color="${c.frame}" stop-opacity=".6"/><stop offset="1" stop-color="${c.light}" stop-opacity=".95"/></linearGradient>
<linearGradient id="v-beam" x2="0" y2="1"><stop stop-color="${c.light}" stop-opacity=".95"/><stop offset=".2" stop-color="${c.frame}" stop-opacity=".72"/><stop offset=".65" stop-color="${c.frame}" stop-opacity=".42"/><stop offset="1" stop-color="${c.light}" stop-opacity=".95"/></linearGradient>
<filter id="g-diffuse" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${c.blur}"/></filter>
<filter id="g-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${c.glowSpread}"/></filter>
<filter id="g-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>`;}
function screw(x,y,r=5){return circle(x+1,y+2,r+1,'url(#g-shadow)',.5)+circle(x,y,r,'url(#g-hardware)',.9);}
const quad=(points,fill,alpha=1)=>path('M'+points.map(p=>p.join(' ')).join(' L')+'Z',fill,alpha);
function panel(x,y,w,h,inner=true,c=state){
 const b=Math.min(c.bevel,w*.17,h*.16),l=x+b,r=x+w-b,t=y+b,bt=y+h-b;
 let s=`<g opacity="${c.panelOpacity/100}">`;
 // Four mitered faces share exact vertices; there are no overlapping edge rectangles.
 if(inner){
   const d=Math.min(c.chamberDepth,(w-2*b)*.19,(h-2*b)*.19),sx=Math.max(-d*.35,Math.min(d*.35,(c.vanishX-x-w/2)*.025)),sy=Math.max(-d*.3,Math.min(d*.3,(c.vanishY-y-h/2)*.025));
   const bl=l+d+sx,br=r-d+sx,tt=t+d+sy,bb=bt-d+sy;
   s+=rect(bl,tt,br-bl,bb-tt,2,'url(#v-back)',c.backAlpha/100*(.65+c.recess/100))+rect(bl,tt,br-bl,bb-tt,2,'url(#g-panel)',c.glass/400);
   s+=quad([[l,t],[r,t],[br,tt],[bl,tt]],'url(#v-ceiling)',.85);
   s+=quad([[l,t],[bl,tt],[bl,bb],[l,bt]],'url(#v-wall-left)',.8);
   s+=quad([[r,t],[r,bt],[br,bb],[br,tt]],'url(#v-wall-right)',.8);
   s+=quad([[l,bt],[bl,bb],[br,bb],[r,bt]],'url(#v-floor)',.95);
   s+=rect(bl,tt,br-bl,bb-tt,2,'url(#g-glass)',c.glass/250);
 }else{
   s+=rect(l,t,r-l,bt-t,2,'url(#g-glass)',c.glass/200);
 }
 s+=quad([[x,y],[x+w,y],[r,t],[l,t]],'url(#v-top)');
 s+=quad([[x,y],[l,t],[l,bt],[x,y+h]],'url(#v-left)');
 s+=quad([[x+w,y],[x+w,y+h],[r,bt],[r,t]],'url(#v-right)');
 s+=quad([[x,y+h],[l,bt],[r,bt],[x+w,y+h]],'url(#v-bottom)');
 // A shallow ledge returns under each module and terminates at its own seam.
 s+=quad([[x,y+h],[x+w,y+h],[x+w-4,y+h+5],[x+4,y+h+5]],'url(#v-ceiling)',.45);
 s+=[screw(x+10,y+12),screw(x+w-10,y+12),screw(x+10,y+h-12),screw(x+w-10,y+h-12)].join('');
 return s+'</g>';
}
function knob(x,y,r=state.knobSize,indicator=false,c=state){return `<g opacity="${c.hardware/100}">`+circle(x+1,y+4,r+2,'url(#g-shadow)',.65)+circle(x,y,r+1,'url(#g-edge)',.7)+circle(x,y,r,'url(#g-hardware)')+(indicator?stroke(`M${x} ${y-r+4} l-3 ${r*.48}`,c.light,2,.8):'')+'</g>';}
function port(x,y,active=false,r=7){return circle(x,y,r+3,'url(#g-hardware)',.75)+circle(x,y,r,state.light,.45)+circle(x,y,r-2,active?state.accent:state.shadow,.8)+circle(x-1,y-1,r-3,'url(#g-shadow)',.5);}
function sliders(x,y,count=4,h=72,space=27){let s='';for(let i=0;i<count;i++){const yy=y+12+(h-30)*((state.sliderTravel+i*17)%101)/100;s+=rect(x+i*space,y,7,h,3,'url(#g-shadow)',state.hardware/100)+rect(x-2+i*space,yy,13,20,2,'url(#g-shadow)',.45)+rect(x-3+i*space,yy-2,13,20,2,'url(#g-edge)',state.hardware/100);}return s;}
function tier(slot){const upper=slot.y<350,retreat=upper?state.upperRetreat:state.middleRetreat,z=1-retreat/1000;return {z,x:state.vanishX*(1-z),y:state.vanishY*(1-z)+(upper?state.upperShift:state.middleShift)};}
function inTier(slot,art){const t=tier(slot);return `<g transform="matrix(${t.z} 0 0 ${t.z} ${t.x} ${t.y})">${art}</g>`;}
function faceConfig(slot,part){return {...state,panelDX:0,panelDY:0,panelDW:0,panelDH:0,...(part==='console'?state.consoleFace:slot.faces?.[part])};}
function boxes(slot){const width=Math.min(slot.w*.36,slot.moduleWidth??58),gap=slot.moduleGap??6;
 const make=(b,part)=>{const c=faceConfig(slot,part);return {x:b.x+c.panelDX,y:b.y+c.panelDY,w:Math.max(55,b.w+c.panelDW),h:Math.max(90,b.h+c.panelDH)};};
 return {console:make({x:42,y:817,w:915,h:137},'console'),plant:make({x:slot.x,y:slot.y,w:slot.w-width-gap,h:slot.h},'plant'),control:make({x:slot.x+slot.w-width+(slot.controlX||0),y:slot.y+(slot.controlY||0),w:width,h:slot.h},'control')};
}
function localSurface(slot,i,part,inner,content=''){
 const c=faceConfig(slot,part),b=boxes(slot)[part],x=b.x,y=b.y,w=b.w,h=b.h,t=c.topPerspective/1000;
 const backL=[x+(c.vanishX-x)*t,y-c.topExposure+(c.vanishY-y)*t*.3],backR=[x+w+(c.vanishX-x-w)*t,y-c.topExposure+(c.vanishY-y)*t*.3];
 const prefix=`face-${i}-${part}-`,markup=defs(c)+quad([[x,y],[x+w,y],backR,backL],'url(#v-floor)',c.panelOpacity/100*.8)+panel(x,y,w,h,inner,c)+content;
 const isolated=markup.replace(/\bid="([^"]+)"/g,(_,id)=>`id="${prefix}${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}${id})`);
 return `<g data-slot="${i}" data-panel="${part}" role="button" tabindex="0" aria-label="选择${partNames[part]} ${i+1}">${isolated}</g>`;
}
function controls(){return state.slots.map((slot,i)=>{
 const b=boxes(slot).control,c=faceConfig(slot,'control'),cx=b.x+b.w/2,knobY=b.y+Math.min(42,b.h*.13),step=Math.min(31,b.h*.095),sliderY=knobY+step*3+22,sliderH=Math.max(40,Math.min(92,b.y+b.h-48-sliderY));
 let content=label('VOICE',b.x+10,b.y+23,Math.min(6,b.w*.1),c.shadow);
 for(let j=0;j<4;j++){
  const yy=knobY+j*step;content+=`<g data-knob="${j}">${knob(cx,yy,Math.min(c.knobSize,b.w*.17,step*.4),true,c)}</g>`;
  // Four identical wave glyphs identify the four macro controls.
  const icons=[`M${b.x+7} ${yy+3} q2 -5 4 0 q2 5 4 0`,`M${b.x+7} ${yy-2} h4 l4 6`,`M${b.x+7} ${yy+3} l2 -7 2 4 h2 l2 3`,`M${b.x+7} ${yy+2} l2 -4 2 6 2 -5 2 2`];content+=stroke(icons[j],c.shadow,.7,.65);
 }
 const gap=(b.w-20)/4;for(let j=0;j<4;j++){const xx=b.x+9+j*gap,thumbWidth=Math.min(8,gap-1),thumb=sliderY+6+(sliderH-24)*((c.sliderTravel+j*17)%101)/100;
 content+=`<g data-fader="${j}">`+rect(xx,sliderY,3,sliderH,1.5,'url(#g-shadow)',c.hardware/150)+rect(xx-thumbWidth/2+1.5,thumb,thumbWidth,15,1.3,'url(#g-hardware)',c.hardware/105)+rect(xx-thumbWidth/2+2.5,thumb+2,Math.max(2,thumbWidth-2),2,1,c.light,.8)+'</g>';
 }
 content+=port(cx,b.y+b.h-23,i===state.selected,4)+label(String(i+1).padStart(2,'0'),b.x+8,b.y+b.h-10,5,c.shadow);
 return inTier(slot,localSurface(slot,i,'control',false,content));
 }).join('');}
function rackMounts(){let s='';for(const row of [0,1]){const members=state.slots.filter(slot=>(slot.y<350?0:1)===row);if(!members.length)continue;const y=Math.max(...members.map(slot=>slot.y+slot.h))+7,minX=Math.min(...members.map(slot=>slot.x))-10,maxX=Math.max(...members.map(slot=>slot.x+slot.w))+10;
 s+=inTier(members[0],quad([[minX,y],[maxX,y],[maxX-9,y+10],[minX+9,y+10]],'url(#v-floor)',.8));
 }return s;}
function room(){
 const c=state,k=c.depth*.0028,project=(x,y)=>[x+(c.vanishX-x)*k,y+(c.vanishY-y)*k],tl=project(30,20),tr=project(970,20),bl=project(30,970),br=project(970,970);
 let s=rect(0,0,1000,1000,0,c.bg)+`<ellipse cx="500" cy="470" rx="530" ry="550" fill="url(#g-room)" opacity="${c.ambient/100}"/>`;
 s+=`<g filter="url(#g-diffuse)" opacity="${c.ambient/100}">`+rect(75,110,110,650,40,c.frame,.3)+rect(820,110,110,650,40,c.tint,.3)+rect(180,20,640,100,30,c.light,.8)+'</g>';
 s+=quad([[30,20],[970,20],tr,tl],'url(#v-ceiling)',.58)+quad([[30,20],tl,bl,[30,970]],'url(#v-wall-left)',.65)+quad([[970,20],[970,970],br,tr],'url(#v-wall-right)',.65);
 // Every roof member terminates on the same back beam; horizontal faces use vertical gradients.
 for(const x of [38,172,307,441,575,709,843,966]){const a=project(x,20),b=project(x+9,20);s+=quad([[x,20],[x+9,20],b,a],'url(#v-wall-left)',.72);}
 s+=quad([tl,tr,[tr[0],tr[1]+13],[tl[0],tl[1]+13]],'url(#v-beam)',.9);
 s+=quad([[30,20],tl,[tl[0]-10,tl[1]],[20,20]],'url(#v-rail)',.8)+quad([[970,20],[980,20],[tr[0]+10,tr[1]],tr],'url(#v-rail)',.8);
 s+=quad([[30,970],bl,br,[970,970]],'url(#v-floor)',.65);
 // Slot apertures are transformed with the rail face, so they never float across its edges.
 // One connected shelf per tier, behind the equipment, rather than extra floating strips.


 return s;
}
function hsl(hex){const [r,g,b]=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;let h=0;if(d)h=(hi===r?((g-b)/d+6)%6:hi===g?(b-r)/d+2:(r-g)/d+4)/6;return [h,d?d/(1-Math.abs(2*l-1)):0,l];}
function fromHsl(h,s,l){const a=s*Math.min(l,1-l),f=n=>{const k=(n+h*12)%12;return Math.round((l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255).toString(16).padStart(2,'0');};return '#'+f(0)+f(8)+f(4);}
function recolorPlant(base,color){const out=clone(base),a=hsl(base.color),b=hsl(color);const tint=hex=>{const v=hsl(hex);if(v[1]<.015)return hex;return fromHsl((v[0]+b[0]-a[0]+1)%1,Math.min(1,v[1]*b[1]/Math.max(.01,a[1])),Math.max(0,Math.min(1,v[2]+(b[2]-a[2])*Math.min(1,v[1]/Math.max(.01,a[1])))));};for(const g of [...Object.values(out.materials),...Object.values(out.elements||{}).map(e=>e.gradient).filter(Boolean)])g.stops=g.stops.map(stop=>({...stop,color:tint(stop.color)}));out.color=color;return out;}
function sceneColor(){const slot=state.slots[state.selected];return slot.colors?.[slot.plant]||plants[slot.plant].color;}
function harmonize(){
 const [h,baseS,baseL]=hsl(state.paletteBase),offsets=state.paletteMode==='analogous'?[-22,-7,0,12,25]:[-7,-3,0,3,7],sat=[.82,.7,1,.76,.9],lum=[-.025,.045,0,.065,-.035];
 state.slots.forEach((slot,i)=>{const mist=state.paletteMode==='mist',color=fromHsl((h+offsets[i]/360+1)%1,Math.min(.72,Math.max(.2,baseS)*sat[i]*(mist?.6:1)),Math.min(.82,Math.max(.53,baseL)+lum[i]+(mist?.08:0)));(slot.colors||={})[slot.plant]=color;});
 state.paletteActive=true;if($('apply-atlas-color').checked)applyScenePalette();$('scene-plant-color').value=sceneColor();render();$('color-status').textContent='已生成整架和谐配色，逐株保留色彩差异';
}
function applyScenePalette(){state.slots.forEach((slot,i)=>{if(slot.colors?.[slot.plant])applyAtlasColor(i);});}
function applyAtlasColor(index=state.selected){const slot=state.slots[index],color=slot.colors?.[slot.plant];if(!color)return;try{const saved=JSON.parse(localStorage.getItem('synth-plant-visual-v2')),latest=saved?S.validateRecipe(saved):clone(plants);latest[slot.plant]=recolorPlant(latest[slot.plant],color);localStorage.setItem('synth-plant-visual-v2',JSON.stringify(S.recipe(latest,saved?.selected??slot.plant)));plants[slot.plant]=latest[slot.plant];$('color-status').textContent='已应用到当前浏览器的图鉴';}catch{$('apply-atlas-color').checked=false;$('color-status').textContent='未能保存到图鉴，请重试';}}
function motionEnabled(){return !!state.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
function livingArt(art){if(!motionEnabled()||!state.wind)return art;let n=0;
 return art.replace(/(<g data-node="n\d+"[^>]*data-material="(stem|body|soft|inside)"[^>]*>)/g,(tag,opening,material)=>{
 if(n++>85)return tag;const center=tag.match(/translate\(([-.\d]+) ([-.\d]+)\) rotate/),cx=center?+center[1]:160,cy=center?+center[2]:180;if(cy>282)return tag;
 const phase=Math.round(cx/42)%4,amp=state.wind*(material==='stem'?.72:1)*(1-Math.min(260,cy)/450),dur=(5+phase*.8)/state.windSpeed;
 return tag+`<animateTransform attributeName="transform" type="rotate" additive="sum" values="${-amp} 160 282;${amp} 160 282;${-amp} 160 282" dur="${dur}s" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1" begin="-${phase}s" repeatCount="indefinite"/>`;
 });
}
function lifeParticles(b,i){if(!motionEnabled()||!state.showPlants||i!==state.selected)return '';let s='';const color=state.slots[i].colors?.[state.slots[i].plant]||state.accent;
 for(let j=0;j<state.particles;j++){const x=b.x+18+(j*47%(Math.max(30,b.w-36))),y=b.y+b.h*.2+(j*29%(b.h*.65)),dur=3.5+j%5;
 if(j%2){s+=`<g pointer-events="none" opacity="0"><path d="M${x} ${y-4} Q${x+1} ${y-1} ${x+4} ${y} Q${x+1} ${y+1} ${x} ${y+4} Q${x-1} ${y+1} ${x-4} ${y} Q${x-1} ${y-1} ${x} ${y-4}Z" fill="${state.light}"/><animate attributeName="opacity" values="0;.85;0" dur="${dur}s" begin="-${j*.4}s" repeatCount="indefinite"/></g>`;}
 else s+=`<g pointer-events="none" opacity="0">${circle(x,y,2.4+j%3,'url(#g-hardware)',.75)}${circle(x-.6,y-.9,.8,state.light,.9)}<animateTransform attributeName="transform" type="translate" values="0 10;${j%3-1} -20" dur="${dur}s" begin="-${j*.3}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.65;.4;0" dur="${dur}s" begin="-${j*.3}s" repeatCount="indefinite"/></g>`;
 }return s;
}
function plantModule(slot,i){const c=state,b=boxes(slot).plant,{x,y,w,h}=b,active=i===c.selected;
 let s=localSurface(slot,i,'plant',true)+`<g data-slot="${i}" data-panel="plant" role="button" tabindex="0" aria-label="选择 ${S.esc(S.PRESETS[slot.plant].name)}">`+rect(x,y,w,h,5,'#fff',0);
 if(active&&c.showPlants){const opacity=c.glow/150,breath=motionEnabled()?`<animate attributeName="opacity" values="${opacity*.4};${opacity*(.7+c.breath/100)};${opacity*.4}" dur="3.6s" repeatCount="indefinite"/>`:'';
 s+=`<rect x="${x+5}" y="${y+8}" width="${Math.max(30,w-10)}" height="${h-16}" rx="15" fill="url(#g-halo)" opacity="${opacity}" filter="url(#g-glow)" pointer-events="none">${breath}</rect>`;
 }
 const base=plants[slot.plant],colored=slot.colors?.[slot.plant]?recolorPlant(base,slot.colors[slot.plant]):base,ps={...colored,grain:c.grain,echoCount:0};
 const art=livingArt(S.renderPlant(slot.plant,ps,{id:'gh-plant-'+i,decorations:false}).replace(/^<svg[^>]*>|<\/svg>$/g,'')),aw=(w+25)*slot.scale/100,ah=(h-34)*slot.scale/100,ax=x+(w-aw)/2+slot.px,ay=y+h-ah-20+slot.py;
 if(c.showPlants)s+=`<svg x="${ax}" y="${ay}" width="${aw}" height="${ah}" viewBox="0 0 320 350" opacity="${slot.alpha*c.plantOpacity/10000}" style="overflow:visible">${art}</svg>`;
 s+=lifeParticles(b,i);
 if(active&&c.showPlants)s+=stroke(`M${x+17} ${y+3} Q${x+3} ${y+3} ${x+3} ${y+20} M${x+w-17} ${y+3} Q${x+w-3} ${y+3} ${x+w-3} ${y+20} M${x+3} ${y+h-20} Q${x+3} ${y+h-3} ${x+17} ${y+h-3} M${x+w-3} ${y+h-20} Q${x+w-3} ${y+h-3} ${x+w-17} ${y+h-3}`,c.accent,3,c.glow/100,'pointer-events="none"');
 return inTier(slot,s+'</g>');
}
function plugPoint(slot){const b=boxes(slot).plant,aw=(b.w+25)*slot.scale/100,ah=(b.h-34)*slot.scale/100,k=Math.min(aw/320,ah/350);return [b.x+b.w/2+slot.px+47*k,b.y+b.h-20+slot.py-(350-307)*k-(ah-350*k)/2];}
function cables(){const c=state;return c.slots.map((slot,i)=>{const [x,y]=plugPoint(slot),control=boxes(slot).control,tx=control.x+control.w/2,ty=control.y+control.h-23,d=`M${x} ${y} C${x+20} ${y+c.cableSag} ${tx-12} ${ty+c.cableSag} ${tx} ${ty}`,active=i===c.selected,col=active?c.accent:c.frame;
 let s=port(x,y,active,5)+`<g opacity="${c.cableOpacity/100}" pointer-events="none">`+stroke(d,c.shadow,c.cableWidth+2,.2,'transform="translate(1 3)"')+stroke(d,col,c.cableWidth,.9)+stroke(d,c.light,c.cableWidth*.32,.8);
 if(active&&motionEnabled()){s+=`<path d="${d}" fill="none" stroke="${c.light}" stroke-width="${Math.max(1.5,c.cableWidth*.52)}" stroke-linecap="round" stroke-dasharray="3 17" opacity=".95"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="${1.2/c.flowSpeed}s" repeatCount="indefinite"/></path>`;
 for(let j=0;j<3;j++)s+=`<circle r="1.8" fill="${c.light}"><animateMotion path="${d}" dur="${2/c.flowSpeed}s" begin="-${j*.6}s" repeatCount="indefinite"/></circle>`;}
 return inTier(slot,s+'</g>');}).join('');}
function consolePanel(){const slot=state.slots[state.selected],p=S.PRESETS[slot.plant],b=boxes(slot).console,c=faceConfig(slot,'console'),w=Math.min(293,b.w*.45),x=b.x+(b.w-w)/2,y=b.y+(b.h-66)/2;
 let s=rect(x-7,y-5,w+14,76,4,c.shadow,.32)+rect(x,y,w,66,3,'#bfd0ae',.96)+rect(x+6,y+6,w-12,54,1,'#aabf99',.4);
 for(let yy=y+8;yy<y+60;yy+=4)s+=rect(x+6,yy,w-12,1,0,'#718465',.08);
 s+=label('VOICE '+String(state.selected+1).padStart(2,'0')+' / '+p.name.toUpperCase(),x+15,y+25,Math.min(10,(w-28)/(p.name.length+11)/.65),'#4e6757')+label(p.words.toUpperCase(),x+15,y+46,Math.min(7.4,(w-28)/p.words.length/.65),'#61745a');
 return `<g data-console="lcd">${localSurface(slot,state.selected,'console',false,s)}</g>`;}
function front(){const c=state,f=c.frameWidth;let s='';
 s+=quad([[5,0],[995,0],[995-f,f],[5+f,f]],'url(#v-beam)',.9);
 s+=quad([[5,0],[5+f,f],[5+f,977-f],[5,977]],'url(#v-rail)',.95);
 s+=quad([[995,0],[995,977],[995-f,977-f],[995-f,f]],'url(#v-rail)',.95);
 s+=quad([[5,977],[5+f,977-f],[995-f,977-f],[995,977]],'url(#v-beam)',.85);
 for(const yy of [33,190,298,418,521,676,829,959])s+=screw(5+f/2,yy,6)+screw(995-f/2,yy,6);
 // Console attaches to two physical end cheeks. Their top, face and return meet at shared vertices.
 for(const side of [0,1]){const x=side?946:28,dir=side?-1:1;s+=quad([[x,837],[x+dir*16,817],[x+dir*16,954],[x,973]],'url(#v-wall-left)',.9)+quad([[x+dir*16,817],[x+dir*30,817],[x+dir*30,954],[x+dir*16,954]],'url(#v-left)',.85);}
 return s;}
function svg(){return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000"><title>Synth-plant / Modular Greenhouse</title>${defs()}${room()}${rackMounts()}${controls()}${state.slots.map(plantModule).join('')}${state.showPlants?cables():''}${consolePanel()}${front()}</svg>`;}
function render(){raf=0;$('rack-select').value=String(state.rack);$('rack-title').textContent=['机架 01 · 透光温室','机架 A · 双层植物阵列','机架 C · 错层植物阵列'][state.rack];$('art').innerHTML=svg();const p=S.PRESETS[state.slots[state.selected].plant];$('name').textContent=p.name;$('toggle-plants').textContent=state.showPlants?'隐藏植物 · 查看空机架':'显示植物';$('plant-edit').href='index.html?plant='+state.slots[state.selected].plant;clearTimeout(timer);timer=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));$('status').textContent='参数已自动保存';}catch{$('status').textContent='请导出参数保存';}},350);}
function schedule(){if(!raf)raf=requestAnimationFrame(render);}
function inspector(){$('panel-part').value=selectedPart;$('panel-label').textContent='舱 '+(state.selected+1)+' · '+partNames[selectedPart];faceInspector();$('palette-base').value=state.paletteBase;$('palette-mode').value=state.paletteMode;$('scene-plant-color').value=sceneColor();$('apply-atlas-color').checked=false;$('color-status').textContent='只改变当前舱位；保留渐变透明度与形态';$('slots').innerHTML=state.slots.map((v,i)=>`<button data-choose="${i}" class="${i===state.selected?'active':''}">舱 ${i+1}</button>`).join('');$('plant-select').innerHTML=S.PRESETS.map((p,i)=>`<option value="${i}" ${i===state.slots[state.selected].plant?'selected':''}>${S.esc(p.name)}</option>`).join('');$('controls').innerHTML=groups.map(([title,scope,rows],i)=>`<details ${i<2?'open':''}><summary>${scope==='global'?'全局 · ':''}${title}</summary>${rows.map(([key,title,min,max,step])=>{const v=(scope==='slot'?state.slots[state.selected]:state)[key];return `<div class="row"><label for="r-${key}">${title}</label><input type="number" aria-label="${title}" data-scope="${scope}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${v}"><input id="r-${key}" type="range" data-scope="${scope}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${v}"></div>`;}).join('')}</details>`).join('')+`<details open><summary>渐变色彩</summary>${[['bg','背景'],['frame','机架玻璃'],['tint','透射色'],['shadow','内部暗部'],['light','高光'],['accent','选中光色']].map(([k,n])=>`<div class="row"><label for="c-${k}">${n}</label><input id="c-${k}" type="color" data-key="${k}" value="${state[k]}"></div>`).join('')}</details>`;}
function choose(i,part='plant'){state.selected=i;selectedPart=part;inspector();render();if(part!=='console')playSelection();}
function switchRack(index){if(index===state.rack)return;try{localStorage.setItem(KEY+'-rack-'+state.rack,JSON.stringify(state));}catch{}let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY+'-rack-'+index));}catch{}if(saved){try{state=clean(saved);}catch{saved=null;}}if(!saved){state=clone(initial);state.rack=index;if(index){const layout=index===1?[[0,82,68,278,369],[1,372,68,258,369],[2,642,68,278,369],[5,82,461,380,335],[4,553,461,367,335]]:[[0,82,68,278,384],[1,372,68,258,353],[4,642,68,278,369],[6,82,477,380,319],[5,553,461,367,335]];state.slots=layout.map(([plant,x,y,w,h])=>({plant,x,y,w,h,px:0,py:0,scale:100,alpha:100,...slotDefaults,faces:{plant:{},control:{}}}));state.selected=0;state.cableSag=45;}}state.rack=index;window.GreenhouseVoice?.stop();inspector();render();}
$('rack-select').onchange=e=>switchRack(+e.target.value);
function faceInspector(){const c=faceConfig(state.slots[state.selected],selectedPart);
 $('panel-controls').innerHTML=faceRows.map(([key,title,min,max,step])=>`<div class="row"><label for="face-${key}">${title}</label><input type="number" aria-label="${title}" data-face="${key}" min="${min}" max="${max}" step="${step}" value="${c[key]}"><input id="face-${key}" type="range" data-face="${key}" min="${min}" max="${max}" step="${step}" value="${c[key]}"></div>`).join('')+['frame','tint','shadow','light'].map((key,i)=>`<div class="row"><label>${['面板主色','透射色','暗部色','边缘光色'][i]}</label><input type="color" aria-label="${key}" data-face="${key}" value="${c[key]}"></div>`).join('');
}
$('panel-part').onchange=e=>{selectedPart=e.target.value;faceInspector();$('panel-label').textContent='舱 '+(state.selected+1)+' · '+partNames[selectedPart];};
$('panel-controls').oninput=e=>{const el=e.target,key=el.dataset.face;if(!key)return;const slot=state.slots[state.selected];slot.faces||={plant:{},control:{}};slot.faces[selectedPart]||={};const value=el.type==='color'?el.value:Math.max(+el.min,Math.min(+el.max,Number(el.value)||0));if(selectedPart==='console'){state.consoleFace||={};state.consoleFace[key]=value;}else slot.faces[selectedPart][key]=value;if(el.type!=='color')el.parentElement.querySelectorAll('input').forEach(other=>{if(other!==el)other.value=value;});schedule();};
$('reset-panel').onclick=()=>{const slot=state.slots[state.selected];if(selectedPart==='console')state.consoleFace={};else if(slot.faces)slot.faces[selectedPart]={};faceInspector();render();};
function playSelection(){if(state.sound)window.GreenhouseVoice?.play(state.slots[state.selected].plant,state.volume/100);}
$('stop-sound').onclick=()=>window.GreenhouseVoice?.stop();
$('slots').onclick=e=>{const b=e.target.closest('[data-choose]');if(b)choose(+b.dataset.choose);};
$('harmonize').onclick=harmonize;
$('palette-base').oninput=e=>{state.paletteBase=e.target.value;harmonize();};
$('palette-mode').onchange=e=>{state.paletteMode=e.target.value;harmonize();};
$('scene-plant-color').oninput=e=>{const slot=state.slots[state.selected];if(!/^#[a-f\d]{6}$/i.test(e.target.value))return;(slot.colors||={})[slot.plant]=e.target.value;if($('apply-atlas-color').checked)applyAtlasColor();schedule();};
$('apply-atlas-color').onchange=e=>{if(e.target.checked){if(state.paletteActive)applyScenePalette();else applyAtlasColor();render();}else $('color-status').textContent='后续调色只应用于当前舱位';};
$('reset-plant-color').onclick=()=>{const slot=state.slots[state.selected];if(slot.colors)delete slot.colors[slot.plant];inspector();render();};
$('plant-select').onchange=e=>{state.slots[state.selected].plant=+e.target.value;inspector();render();playSelection();};
$('controls').oninput=e=>{const el=e.target,k=el.dataset.key;if(!k)return;const obj=el.dataset.scope==='slot'?state.slots[state.selected]:state;obj[k]=el.type==='color'?el.value:Math.max(+el.min,Math.min(+el.max,Number(el.value)||0));if(k==='sound'&&!obj[k])window.GreenhouseVoice?.stop();if(el.type!=='color')el.parentElement.querySelectorAll('input').forEach(other=>{if(other!==el)other.value=obj[k];});schedule();};
$('prev').onclick=()=>cycle(-1);$('next').onclick=()=>cycle(1);function cycle(d){const slot=state.slots[state.selected];slot.plant=(slot.plant+d+plants.length)%plants.length;inspector();render();playSelection();}
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('save').onclick=()=>download('synth-greenhouse-01.json',JSON.stringify(state,null,2),'application/json');
$('export').onclick=()=>{const data=svg().replace('<title>','<metadata>'+S.esc(JSON.stringify({scene:state,plants}))+'</metadata><title>');download('synth-greenhouse-01.svg',data,'image/svg+xml');};
$('toggle-plants').onclick=()=>{state.showPlants=!state.showPlants;$('toggle-plants').textContent=state.showPlants?'隐藏植物 · 查看空机架':'显示植物';render();};
$('load').onclick=()=>$('file').click();$('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{state=clean(JSON.parse(await file.text()));inspector();render();}catch(err){$('status').textContent=err.message;}e.target.value='';};
$('reset').onclick=()=>{const rack=state.rack;try{localStorage.removeItem(KEY+'-rack-'+rack);}catch{}state.rack=-1;switchRack(rack);};
function point(e){const svg=$('art').querySelector('svg'),p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.getScreenCTM().inverse());}
$('art').onpointerdown=e=>{const el=e.target.closest('[data-slot]');if(!el)return;const i=+el.dataset.slot,p=point(e);const part=el.dataset.panel||'plant';choose(i,part);const z=tier(state.slots[i]).z;drag=part==='plant'?{z,id:e.pointerId,x:p.x,y:p.y,px:state.slots[i].px,py:state.slots[i].py}:null;$('art').setPointerCapture(e.pointerId);};
$('art').onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const p=point(e),slot=state.slots[state.selected];slot.px=Math.round(Math.max(-120,Math.min(120,drag.px+(p.x-drag.x)/drag.z)));slot.py=Math.round(Math.max(-120,Math.min(120,drag.py+(p.y-drag.y)/drag.z)));schedule();};
$('art').onpointerup=$('art').onpointercancel=()=>{if(drag){drag=null;inspector();}};
$('art').onkeydown=e=>{const el=e.target.closest('[data-slot]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choose(+el.dataset.slot,el.dataset.panel||'plant');}};
inspector();render();
})();
