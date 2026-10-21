/* Shared material rendering for guides, notation and the playback cursor.
   Inner glow = silhouette × (1 − blurred silhouette), so it stays inside.
   Outer glow = blurred silhouette × (1 − silhouette), so it stays outside. */
(() => {
'use strict';
const TAU=Math.PI*2;
const numeric={angle:[0,360],scale:[20,220],speed:[0,200],blur:[0,20],innerStrength:[0,100],innerRadius:[.3,24],outerStrength:[0,100],outerRadius:[.3,45]};
const colorFields=['color1','color2','color3','innerColor','outerColor'];
const modes=['palette','solid','linear','radial','conic'];
const material=()=>({mode:'palette',color1:'#d78958',color2:'#72c8c7',color3:'#b4a0de',angle:45,scale:100,speed:35,blur:0,innerStrength:0,innerRadius:3,innerColor:'#fff6d7',outerStrength:0,outerRadius:12,outerColor:'#a6dce0'});
function defaults(){return{guides:{...material(),color1:'#9e6246',color2:'#7f9c82',color3:'#c2b27f'},notes:{...material(),outerStrength:12,outerRadius:3,outerColor:'#7c8a75'},scan:{...material(),color1:'#f1aa70',color2:'#8fd5d9',color3:'#d8afe9',outerColor:'#edb67a'}};}
function validate(raw){
 const clean=defaults();if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('无效材质参数');
 for(const name of Object.keys(clean)){
  if(raw[name]===undefined)continue;const value=raw[name];if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('无效材质层：'+name);
  for(const [key,v]of Object.entries(value)){
   if(!Object.hasOwn(clean[name],key))continue;
   if(key==='mode'){if(!modes.includes(v))throw new Error('无效渐变模式');}
   else if(colorFields.includes(key)){if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw new Error('无效材质颜色');}
   else if(typeof v!=='number'||!Number.isFinite(v)||v<numeric[key][0]||v>numeric[key][1])throw new Error('材质参数超出范围：'+key);
   clean[name][key]=v;
  }
 }
 return clean;
}
function mix(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
function interpolate(from,to,t){const result={};for(const name of Object.keys(to)){result[name]={...to[name]};for(const k of Object.keys(numeric))result[name][k]=from[name][k]+(to[name][k]-from[name][k])*t;for(const k of colorFields)result[name][k]=mix(from[name][k],to[name][k],t);}return result;}
function paint(c,m,time,bounds,base){
 if(m.mode==='palette')return base;if(m.mode==='solid')return m.color1;
 const phase=time*m.speed/100*.4,angle=m.angle*Math.PI/180+phase,x=bounds.x+bounds.w/2,y=bounds.y+bounds.h/2,r=Math.max(1,Math.max(bounds.w,bounds.h)*m.scale/200);
 const palette=[m.color1,m.color2,m.color3],cycle=((phase/TAU*3)%3+3)%3,index=Math.floor(cycle),fraction=cycle-index,colors=palette.map((_,i)=>mix(palette[(index+i)%3],palette[(index+i+1)%3],fraction));
 let gradient;
 if(m.mode==='radial'){const dx=Math.cos(angle)*r*.17,dy=Math.sin(angle)*r*.17;gradient=c.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);}
 else if(m.mode==='conic'&&c.createConicGradient)gradient=c.createConicGradient(angle,x,y);
 else gradient=c.createLinearGradient(x-Math.cos(angle)*r,y-Math.sin(angle)*r,x+Math.cos(angle)*r,y+Math.sin(angle)*r);
 gradient.addColorStop(0,colors[0]);if(m.mode==='conic'){gradient.addColorStop(1/3,colors[1]);gradient.addColorStop(2/3,colors[2]);gradient.addColorStop(1,colors[0]);}else{gradient.addColorStop(.5,colors[1]);gradient.addColorStop(1,colors[2]);}return gradient;
}
class Compositor{
 constructor(){this.body=document.createElement('canvas');this.work=document.createElement('canvas');this.halo=document.createElement('canvas');this.overlay=document.createElement('canvas');}
 prepare(canvas,size){if(canvas.width!==size)canvas.width=canvas.height=size;const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';c.shadowBlur=0;c.clearRect(0,0,size,size);return c;}
 render(target,size,m,opacity,draw){
  if(opacity<=0)return;
  const active=m.blur>0||m.innerStrength>0||m.outerStrength>0;
  if(!active){target.save();target.globalAlpha*=opacity;draw(target);target.restore();return;}
  // Blur masks use a bounded working resolution; final silhouette clipping and the base drawing retain full resolution.
  const scale=size/1000,fxSize=Math.min(size,384),fxScale=fxSize/1000,body=this.prepare(this.body,size);body.setTransform(scale,0,0,scale,0,0);draw(body);
  const mainAlpha=target.globalAlpha;target.save();target.globalAlpha=mainAlpha*opacity;
  if(m.outerStrength>0){
   const halo=this.prepare(this.halo,fxSize);halo.drawImage(this.body,0,0,fxSize,fxSize);halo.globalCompositeOperation='source-in';halo.fillStyle=m.outerColor;halo.fillRect(0,0,fxSize,fxSize);
   const work=this.prepare(this.work,fxSize);work.filter=`blur(${m.outerRadius*fxScale}px)`;work.drawImage(this.halo,0,0);work.filter='none';const overlay=this.prepare(this.overlay,size);overlay.drawImage(this.work,0,0,size,size);overlay.globalCompositeOperation='destination-out';overlay.drawImage(this.body,0,0);
   target.save();target.globalAlpha*=m.outerStrength/100;target.drawImage(this.overlay,0,0,1000,1000);target.restore();
  }
  target.save();if(m.blur>0)target.filter=`blur(${m.blur*scale}px)`;target.drawImage(this.body,0,0,1000,1000);target.restore();
  if(m.innerStrength>0){
   const work=this.prepare(this.work,fxSize);work.fillStyle=m.innerColor;work.fillRect(0,0,fxSize,fxSize);work.globalCompositeOperation='destination-out';work.filter=`blur(${m.innerRadius*fxScale}px)`;work.drawImage(this.body,0,0,fxSize,fxSize);work.filter='none';const overlay=this.prepare(this.overlay,size);overlay.drawImage(this.work,0,0,size,size);overlay.globalCompositeOperation='destination-in';overlay.drawImage(this.body,0,0);
   target.save();target.globalAlpha*=m.innerStrength/100;if(m.blur>0)target.filter=`blur(${m.blur*scale}px)`;target.drawImage(this.overlay,0,0,1000,1000);target.restore();
  }
  target.restore();
 }
}
const scanStyles=[
 {id:'beam',name:'细线',en:'Beam',svg:'<path d="M4 16h44"/>'},
 {id:'dash',name:'流动虚线',en:'Dash',svg:'<path d="M4 16h44" stroke-dasharray="6 4"/>'},
 {id:'dots',name:'星点',en:'Dots',svg:'<path d="M5 16h42" stroke-dasharray=".1 6" stroke-linecap="round" stroke-width="3"/>'},
 {id:'twin',name:'双轨',en:'Twin',svg:'<path d="M4 12h44M4 20h44"/>'},
 {id:'wave',name:'波动',en:'Wave',svg:'<path d="M3 16c5-15 10 15 15 0s10 15 15 0 10 15 15 0"/>'},
 {id:'ribbon',name:'光带',en:'Ribbon',svg:'<path d="M3 16Q26 2 49 16Q26 30 3 16Z" fill="currentColor" fill-opacity=".2"/>'},
 {id:'comet',name:'彗尾',en:'Comet',svg:'<path d="m4 19 23-5m-10 8 18-6"/><circle cx="38" cy="13" r="5" fill="currentColor" fill-opacity=".35"/>'},
 {id:'ticks',name:'刻度',en:'Ticks',svg:'<path d="M4 16h44M8 11v10m8-8v6m8-8v10m8-8v6m8-8v10"/>'}
];
function cursor(c,points,style,{width=1.3,density=14,amplitude=7,time=0}={}){
 if(points.length<2)return;
 const count=points.length,normal=i=>{const a=points[Math.max(0,i-1)],b=points[Math.min(count-1,i+1)],d=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:-(b.y-a.y)/d,y:(b.x-a.x)/d};};
 const path=(offset=0,wave=0)=>{c.beginPath();points.forEach((p,i)=>{const n=normal(i),d=offset+Math.sin(i/(count-1)*TAU*Math.max(1,Math.round(density/3))+time*2)*wave,x=p.x+n.x*d,y=p.y+n.y*d;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();};
 const at=t=>{const f=((t%1+1)%1)*(count-1),i=Math.floor(f),u=f-i,a=points[i],b=points[Math.min(i+1,count-1)],n=normal(i);return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,n};};
 c.save();c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
 if(style==='dash'){c.setLineDash([Math.max(2,90/density),Math.max(2,60/density)]);c.lineDashOffset=-time*22;path();}
 else if(style==='dots'){c.setLineDash([.05,Math.max(4,150/density)]);c.lineWidth=width*2.4;c.lineDashOffset=-time*13;path();}
 else if(style==='twin'){path(width*2+2+amplitude*.3);path(-width*2-2-amplitude*.3);}
 else if(style==='wave')path(0,amplitude);
 else if(style==='ribbon'){
  const half=width*(2+amplitude*.18);c.beginPath();points.forEach((p,i)=>{const n=normal(i),w=half*(.25+.75*Math.sin(i/(count-1)*Math.PI));i?c.lineTo(p.x+n.x*w,p.y+n.y*w):c.moveTo(p.x+n.x*w,p.y+n.y*w);});for(let i=count-1;i>=0;i--){const p=points[i],n=normal(i),w=half*(.25+.75*Math.sin(i/(count-1)*Math.PI));c.lineTo(p.x-n.x*w,p.y-n.y*w);}c.closePath();c.save();c.globalAlpha*=.3;c.fill();c.restore();path();
 }
 else if(style==='comet'){
  c.save();c.globalAlpha*=.16;path();c.restore();for(let j=0;j<Math.max(2,Math.floor(density/2));j++){const t=j/Math.max(2,Math.floor(density/2))+time*.07;for(let tail=7;tail>=0;tail--){const p=at(t-tail*(.002+amplitude*.0007));c.save();c.globalAlpha*=Math.pow(1-tail/8,1.7);c.beginPath();c.arc(p.x,p.y,width*(.6+1.1*(1-tail/8)),0,TAU);c.fill();c.restore();}}
 }
 else if(style==='ticks'){
  c.save();c.globalAlpha*=.35;path();c.restore();for(let j=0;j<density;j++){const p=at(j/density+time*.012),len=(j%4===0?1:.5)*(amplitude+width*2);c.beginPath();c.moveTo(p.x-p.n.x*len,p.y-p.n.y*len);c.lineTo(p.x+p.n.x*len,p.y+p.n.y*len);c.stroke();}
 }else path();c.restore();
}
window.OrbitalEffects={defaults,validate,interpolate,paint,Compositor,scanStyles,cursor,numeric,colorFields,modes};
})();
