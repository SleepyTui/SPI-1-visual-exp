/* Twelve visible, selectable variants in each of six graphic notation families. */
(() => {
'use strict';
const TAU=Math.PI*2;
const names={
 mixed:['音符行星','几何卫星','双生星环','节奏三角','星形五线谱','星云波形','钟摆星团','方圆叠奏','轨道连音','日蚀阶梯','星尘和弦','螺旋休止'],
 circles:['单圆','双层圆环','三层同心圆','五重轨道','土星环','靶心','十字准星','星形圆心','虚线圆环','放射太阳','日蚀月牙','气泡星团'],
 geometry:['三角形','正方形','菱形','五边形','六边形','八边形','五角星','十字形','月牙','风筝','沙漏','立方体'],
 notes:['全音符','二分音符','四分音符','八分音符','十六分音符','三十二分音符','六十四分音符','一百二十八分','附点四分','三连音','双音连梁','四分休止符'],
 staff:['独奏','双音','上行音阶','下行音阶','三音和弦','琶音','双梁节奏','三连音组','休止小节','滑音','音簇','复合节奏'],
 graphic:['半圆','锯齿','阶梯','正弦波','拱桥','梳齿','折线箭头','滴落','渐强楔形','曲线缎带','点阵','无限回环']
};
function draw(c,family,variant,r,options={}){
 const mode=options.mode||'both',width=options.lineWidth||1.1,v=((variant%12)+12)%12;
 c.save();c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
 const path=()=>new Path2D();
 const paint=(p,rule='nonzero')=>{if(mode!=='outline'){c.save();if(mode==='both')c.globalAlpha*=.23;c.fill(p,rule);c.restore();}if(mode!=='fill')c.stroke(p);};
 const stroke=(p,w=width)=>{c.save();c.lineWidth=mode==='fill'?Math.max(w*2.3,r*.15):w;c.stroke(p);c.restore();};
 const ellipse=(x,y,rx,ry,rotation=0)=>{const p=path();p.ellipse(x,y,rx,ry,rotation,0,TAU);paint(p);};
 const seg=(x,y,x2,y2,w=width)=>{const p=path();p.moveTo(x,y);p.lineTo(x2,y2);stroke(p,w);};
 const polygon=(points)=>{const p=path();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();paint(p);};
 const regular=(sides,rotation=-Math.PI/2,inner=1)=>{const points=[];for(let i=0;i<sides;i++){const a=i/sides*TAU+rotation,rr=i%2?r*inner:r;points.push([Math.cos(a)*rr,Math.sin(a)*rr]);}polygon(points);};
 const ring=(outer,inner)=>{const p=path();p.arc(0,0,outer,0,TAU);p.moveTo(inner,0);p.arc(0,0,inner,0,TAU);paint(p,'evenodd');};
 const note=(x,y,size,flags=0,hollow=false,dot=false)=>{
  const p=path();p.ellipse(x-size*.25,y+size*.35,size*.45,size*.29,-.45,0,TAU);
  if(hollow){const q=path();q.ellipse(x-size*.25,y+size*.35,size*.45,size*.29,-.45,0,TAU);q.ellipse(x-size*.25,y+size*.35,size*.29,size*.15,-.45,0,TAU);paint(q,'evenodd');}else paint(p);
  seg(x+size*.15,y+size*.25,x+size*.15,y-size*1.3);
  for(let i=0;i<flags;i++){const q=path(),top=y-size*1.3+i*size*.31;q.moveTo(x+size*.15,top);q.bezierCurveTo(x+size*1.25,top+size*.2,x+size*.95,top+size*.65,x+size*.4,top+size*.85);stroke(q,width);}
  if(dot)ellipse(x+size*.7,y+size*.3,size*.1,size*.1);
 };
 if(family==='mixed'){
  const pairs=[['circles',4,'notes',3],['geometry',4,'circles',0],['circles',1,'circles',8],['geometry',0,'graphic',10],['geometry',6,'staff',4],['graphic',3,'circles',2],['geometry',9,'circles',5],['geometry',1,'circles',6],['circles',4,'notes',10],['circles',10,'graphic',2],['circles',11,'staff',4],['graphic',11,'notes',11]][v];
  c.save();c.translate(-r*.36,0);draw(c,pairs[0],pairs[1],r*.72,options);c.restore();c.save();c.translate(r*.58,r*.32);draw(c,pairs[2],pairs[3],r*.5,options);c.restore();
 }else if(family==='circles'){
  if(v===0)ellipse(0,0,r,r);
  if(v===1)ring(r,r*.65);
  if(v===2){ring(r,r*.74);ellipse(0,0,r*.42,r*.42);}
  if(v===3){ring(r,r*.87);ring(r*.7,r*.55);ellipse(0,0,r*.32,r*.32);}
  if(v===4){ellipse(0,0,r*.72,r*.72);const p=path();p.ellipse(0,0,r*1.45,r*.36,-.4,0,TAU);stroke(p);}
  if(v===5){ring(r,r*.72);ellipse(0,0,r*.3,r*.3);}
  if(v===6){ellipse(0,0,r,r);seg(-r*1.3,0,r*1.3,0);seg(0,-r*1.3,0,r*1.3);}
  if(v===7){ellipse(0,0,r,r);c.save();c.scale(.55,.55);regular(10,-Math.PI/2,.43);c.restore();}
  if(v===8){c.save();c.setLineDash([r*.13,r*.18]);ellipse(0,0,r,r);c.restore();ellipse(0,0,r*.26,r*.26);}
  if(v===9){ellipse(0,0,r*.55,r*.55);for(let i=0;i<16;i++){const a=i/16*TAU;seg(Math.cos(a)*r*.72,Math.sin(a)*r*.72,Math.cos(a)*r*1.2,Math.sin(a)*r*1.2,width*(i%2?1:.65));}}
  if(v===10){const p=path();p.arc(0,0,r,Math.PI*.3,Math.PI*1.7);p.arc(r*.6,0,r*.9,-Math.PI*.5,-Math.PI*1.5,true);p.closePath();paint(p);}
  if(v===11){for(const [x,y,s]of[[-.48,-.2,.52],[.4,-.36,.39],[.25,.43,.58],[-.55,.55,.24]])ellipse(x*r,y*r,s*r,s*r);}
 }else if(family==='geometry'){
  if(v===0)regular(3);if(v===1)regular(4,Math.PI/4);if(v===2)regular(4);if(v===3)regular(5);if(v===4)regular(6);if(v===5)regular(8);if(v===6)regular(10,-Math.PI/2,.44);
  if(v===7){const a=.29;polygon([[-a*r,-r],[a*r,-r],[a*r,-a*r],[r,-a*r],[r,a*r],[a*r,a*r],[a*r,r],[-a*r,r],[-a*r,a*r],[-r,a*r],[-r,-a*r],[-a*r,-a*r]]);}
  if(v===8){const p=path();p.arc(0,0,r,.35,TAU-.35);p.quadraticCurveTo(-r*.7,0,r*Math.cos(.35),r*Math.sin(.35));p.closePath();paint(p);}
  if(v===9)polygon([[0,-r*1.2],[r*.72,-r*.12],[0,r*1.2],[-r*.72,-r*.12]]);
  if(v===10){polygon([[-r,-r],[r,-r],[-r,r],[r,r]]);}
  if(v===11){regular(6,Math.PI/6);seg(0,0,0,r);seg(0,0,-r*.866,-r*.5);seg(0,0,r*.866,-r*.5);}
 }else if(family==='notes'){
  if(v===0){const p=path();p.ellipse(0,0,r*.7,r*.42,-.2,0,TAU);p.ellipse(0,0,r*.42,r*.22,-.2,0,TAU);paint(p,'evenodd');}
  else if(v<8)note(0,0,r,Math.max(0,v-2),v===1);
  else if(v===8)note(0,0,r,0,false,true);
  else if(v===9){for(let i=0;i<3;i++)note((i-1)*r*.82,r*.2,r*.5,1);seg(-r*.83,-r*.88,r*.83,-r*.88);c.save();c.font=`italic ${r*.6}px Georgia`;c.textAlign='center';c.fillText('3',0,-r*1.04);c.restore();}
  else if(v===10){note(-r*.6,0,r*.7);note(r*.6,-r*.3,r*.7);polygon([[-r*.495,-r*.91],[r*.705,-r*1.21],[r*.705,-r*.99],[-r*.495,-r*.69]]);}
  else{polygon([[r*.15,-r*1.2],[-r*.35,-r*.5],[r*.26,-r*.08],[-r*.28,r*.42],[r*.25,r*.84],[-r*.62,r*.44],[-r*.3,r*.02],[-r*.73,-r*.4]]);}
 }else if(family==='staff'){
  for(let i=-2;i<=2;i++)seg(-r*1.55,i*r*.22,r*1.55,i*r*.22,width*.65);
  const xs=[-.92,-.3,.32,.94];
  if(v===0)note(0,0,r*.56,0);
  if(v===1){note(-r*.55,0,r*.5);note(r*.55,-r*.22,r*.5,1);}
  if(v===2||v===3)xs.forEach((x,i)=>note(x*r,(v===2?1:-1)*(1.5-i)*r*.22,r*.4));
  if(v===4){for(let i=-1;i<=1;i++)ellipse(-r*.12,i*r*.24,r*.25,r*.14,-.4);seg(r*.08,r*.22,r*.08,-r*1.05);}
  if(v===5)xs.forEach((x,i)=>note(x*r,Math.sin(i*1.2)*r*.4,r*.38,1));
  if(v===6){xs.forEach(x=>note(x*r,0,r*.38));seg(-r*.86,-r*.5,r,-r*.5,width*2);seg(-r*.86,-r*.66,r,-r*.66,width*2);}
  if(v===7){[-.8,0,.8].forEach(x=>note(x*r,r*.1,r*.43,1));seg(-r,-r*.8,r,-r*.8);c.save();c.font=`${r*.48}px Georgia`;c.textAlign='center';c.fillText('3',0,-r*.9);c.restore();}
  if(v===8){for(let i=-1;i<=1;i++)polygon([[i*r*.75-r*.18,-r*.1],[i*r*.75+r*.18,-r*.1],[i*r*.75+r*.18,r*.17],[i*r*.75-r*.18,r*.17]]);}
  if(v===9){note(-r, r*.35,r*.4);note(r,-r*.35,r*.4);seg(-r*.6,r*.25,r*.7,-r*.3);}
  if(v===10){for(let i=0;i<7;i++)ellipse((i%2)*r*.3-r*.2,(i-3)*r*.14,r*.25,r*.13,-.4);seg(r*.36,r*.5,r*.36,-r*.9);}
  if(v===11){note(-r,0,r*.4,2);note(-r*.35,r*.22,r*.4,0,false,true);note(r*.35,-r*.22,r*.4,1);note(r,r*.22,r*.4,3);}
 }else if(family==='graphic'){
  const p=path();
  if(v===0){p.arc(0,0,r,Math.PI,TAU);p.closePath();paint(p);}
  if(v===1){p.moveTo(-r*1.3,r*.5);for(let i=0;i<=6;i++)p.lineTo(-r*1.3+i*r*.43,(i%2?-.5:.5)*r);stroke(p,width*1.5);}
  if(v===2){for(let i=0;i<4;i++)polygon([[(i-2)*r*.6,-i*r*.3],[(i-1)*r*.6,-i*r*.3],[(i-1)*r*.6,(1-i*.3)*r],[(i-2)*r*.6,(1-i*.3)*r]]);}
  if(v===3){p.moveTo(-r*1.4,0);p.bezierCurveTo(-r,-r*1.4,-r*.45,r*1.4,0,0);p.bezierCurveTo(r*.45,-r*1.4,r,r*1.4,r*1.4,0);stroke(p,width*1.4);}
  if(v===4){p.arc(0,r*.4,r,Math.PI,TAU);stroke(p,width*2);seg(-r,r*.4,-r,r*.7);seg(r,r*.4,r,r*.7);}
  if(v===5){seg(-r,-r*.5,r,-r*.5);for(let i=0;i<6;i++)seg((-1+i*.4)*r,-r*.5,(-1+i*.4)*r,(.3+.4*(i%2))*r,width*1.5);}
  if(v===6){polygon([[-r,-r*.8],[r*.2,-r*.8],[r*.2,-r*1.1],[r*1.1,0],[r*.2,r*1.1],[r*.2,r*.8],[-r,r*.8],[-r*.3,0]]);}
  if(v===7){for(let i=-1;i<=1;i++){const q=path();q.moveTo(i*r*.65,-r*.6);q.bezierCurveTo((i*.65-.5)*r,r*.2,(i*.65-.35)*r,r*.8,i*r*.65,r*.8);q.bezierCurveTo((i*.65+.35)*r,r*.8,(i*.65+.5)*r,r*.2,i*r*.65,-r*.6);paint(q);}}
  if(v===8)polygon([[-r*1.3,0],[r*1.3,-r*.7],[r*1.3,r*.7]]);
  if(v===9){p.moveTo(-r*1.3,r*.4);p.bezierCurveTo(-r,-r*1.5,r*.6,r*1.3,r*1.4,-r*.6);p.bezierCurveTo(r*.5,r*1.7,-r*.8,-r*.5,-r*1.3,r*.4);paint(p);}
  if(v===10)for(let i=0;i<9;i++)ellipse((i%3-1)*r*.65,(Math.floor(i/3)-1)*r*.65,r*.13,r*.13);
  if(v===11){p.moveTo(0,0);p.bezierCurveTo(-r*1.8,-r*1.9,-r*1.8,r*1.9,0,0);p.bezierCurveTo(r*1.8,-r*1.9,r*1.8,r*1.9,0,0);stroke(p,width*1.8);}
 }
 c.restore();
}
window.OrbitalGlyphs={names,draw};
})();
