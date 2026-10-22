/* A single camera for the room, cabinet, mechanics, and interactive surfaces.
   Camera (0, 3.3, 12), looking along -Z. No roll, yaw, or pitch.
   All world-Z parallel lines meet at the exact image centre (400, 400). */
(function(root){
'use strict';
const camera={x:0,y:3.3,z:12,f:1000,cx:400,cy:400};
const palettes={
 wire:{room:'#aab39a',edge:'#515547',shell:'#d7dfc9',side:'#b3c2a4',trim:'#e67b54',trimDark:'#b65637',face:'#f0eddd',dark:'#41483e',board:'#8ba98b',circuit:'#536e55',metal:'#b4bcad',glass:'#d1ddc6',ink:'#343e34',light:'#fff8e5',ball:'#ef7045'},
 glass:{room:'#658480',edge:'#adc9c0',shell:'#a5c9c0',side:'#789e96',trim:'#c0d8cf',trimDark:'#536f66',face:'#c1dad2',dark:'#1e3432',board:'#8bb9ab',circuit:'#c1eadb',metal:'#b7d7cb',glass:'#a4cdc0',ink:'#def4e9',light:'#e5fff5',ball:'#cce9dd'},
 bloom:{room:'#b697bd',edge:'#a681a5',shell:'#d5c0d9',side:'#b69fc6',trim:'#e7a197',trimDark:'#bb8298',face:'#fff0db',dark:'#78667d',board:'#b6bca6',circuit:'#817b99',metal:'#d9b7cb',glass:'#edcbd8',ink:'#69576f',light:'#fff4da',ball:'#e8a18b'}
};
function project(v){const d=camera.z-v[2];return [camera.cx+camera.f*v[0]/d,camera.cy-camera.f*(v[1]-camera.y)/d]}
const fmt=n=>Number(n.toFixed(3));
const ps=vs=>vs.map(v=>project(v).map(fmt).join(',')).join(' ');
function poly(vs,fill,stroke,opacity=1,extra=''){return `<polygon points="${ps(vs)}" fill="${fill}" stroke="${stroke||'none'}" stroke-width="1.1" opacity="${opacity}" stroke-linejoin="round" ${extra}/>`}
function line(vs,color,width=1,opacity=1,extra=''){return `<polyline points="${ps(vs)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`}
function box(x,y,z,w,h,d,front,side,edge,opacity=1){const a=[x-w/2,y+h/2,z+d/2],b=[x+w/2,y+h/2,z+d/2],c=[x+w/2,y-h/2,z+d/2],e=[x-w/2,y-h/2,z+d/2],back=v=>[v[0],v[1],z-d/2];return poly([a,back(a),back(b),b],front,edge,opacity)+poly([b,back(b),back(c),c],side,edge,opacity)+poly([e,back(e),back(a),a],side,edge,opacity)+poly([a,b,c,e],front,edge,opacity)}
function screw(x,y,z,c){let [sx,sy]=project([x,y,z]);return `<circle cx="${sx}" cy="${sy}" r="2.4" fill="${c.metal}" stroke="${c.edge}" stroke-width=".7"/><path d="M${sx-1.2} ${sy+1.2}l2.4-2.4" stroke="${c.edge}" stroke-width=".6"/>`}
function roundedFront(x,y,z,w,h,r,fill,stroke,opacity=1){const v=[[x-w/2+r,y+h/2,z],[x+w/2-r,y+h/2,z],[x+w/2,y+h/2-r,z],[x+w/2,y-h/2+r,z],[x+w/2-r,y-h/2,z],[x-w/2+r,y-h/2,z],[x-w/2,y-h/2+r,z],[x-w/2,y+h/2-r,z]];return poly(v,fill,stroke,opacity)}
function room(c){let s='<g class="perspective-room">';// Physical grid lines on a floor, ceiling and two walls.
for(let x=-12;x<=12;x+=1.5)s+=line([[x,0,10],[x,0,-40]],c.room,.7,.44);
for(let z=-32;z<=10;z+=2.4)s+=line([[-12,0,z],[12,0,z]],c.room,.7,.44);
for(let x=-12;x<=12;x+=2.4)s+=line([[x,8,10],[x,8,-40]],c.room,.65,.24);
for(let z=-32;z<=10;z+=4.8){s+=line([[-6,0,z],[-6,8,z]],c.room,.6,.22);s+=line([[6,0,z],[6,8,z]],c.room,.6,.22)}
for(let y=0;y<=8;y+=1.6){s+=line([[-6,y,10],[-6,y,-40]],c.room,.65,.27);s+=line([[6,y,10],[6,y,-40]],c.room,.65,.27)}
s+='<circle cx="400" cy="400" r="2" fill="'+c.room+'" opacity=".4"/></g>';return s}
function mechanics(c){let s='<g class="inner-mechanics">';
// Upright rear chassis, internal rails, reel axle and four rotor assemblies.
for(const x of [-1.84,1.84])s+=box(x,3.1,-.65,.1,5.35,.12,c.metal,c.side,c.edge,.65);
for(const y of [1,2.55,4.3,5.6])s+=box(0,y,-.65,3.8,.06,.1,c.metal,c.side,c.edge,.65);
s+=box(0,4.35,-.05,4.1,.07,.07,c.metal,c.side,c.edge,.8);
for(const x of [-1.38,-.46,.46,1.38]){
 const ring=[];for(let j=0;j<=48;j++){const a=j/48*Math.PI*2;ring.push([x,4.35+Math.sin(a)*.82,-.05+Math.cos(a)*.82])}s+=line(ring,c.circuit,1,.65);
 for(const dx of [-.34,.34]){const rim=ring.map(v=>[v[0]+dx,v[1],v[2]]);s+=line(rim,c.circuit,1,.5)}
 s+=box(x,4.35,-.6,.35,.3,.4,c.dark,c.side,c.edge,.7);
}
// Main board inside the lower cabinet, separate components at genuine depths.
s+=box(0,1.5,-.35,3.25,1.55,.08,c.board,c.side,c.edge,.75);
for(let i=0;i<7;i++){const x=-1.36+i*.43;s+=line([[x,.9,-.28],[x,1.2,-.28],[x+.2,1.4,-.28],[x+.2,2.12,-.28]],c.circuit,1.5,.65)}
for(const a of [[-.85,1.68,.65,.42],[.15,1.7,.5,.52],[.86,1.25,.45,.28]]){s+=box(a[0],a[1],-.18,a[2],a[3],.2,c.dark,c.side,c.circuit,.8);for(let i=0;i<5;i++){const x=a[0]-a[2]/2+i*a[2]/4;s+=line([[x,a[1]-a[3]/2-.09,-.1],[x,a[1]+a[3]/2+.09,-.1]],c.metal,.9,.6)}}
for(let i=0;i<3;i++)s+=box(.65+i*.3,1.98,.06,.18,.37,.23,c.metal,c.side,c.edge,.8);
for(let i=0;i<4;i++){const x=-1.35+i*.9;const points=[[x,2.15,-.1],[x+.18,2.65,-.35],[x+.18,3.5,-.4],[x,4.2,-.1]];s+=line(points,i%2?c.trim:c.circuit,2.5,.5)}
return s+'</g>'}
function lever(theme='wire',angle=0){const c=palettes[theme],pivot=[2.48,2.93,.48],end=[2.59,2.93+1.95*Math.cos(angle),.48+1.95*Math.sin(angle)];const p=project(pivot),e=project(end);const radius=1000*.19/(12-end[2]);let s=box(2.32,2.93,.3,.4,.48,.45,c.metal,c.dark,c.edge);s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="12" ry="19" fill="url(#hub)" stroke="${c.edge}"/>`;s+=`<path d="M${p.join(' ')}L${e.join(' ')}" stroke="${c.edge}" stroke-width="8" stroke-linecap="round"/><path d="M${p[0]-1.5} ${p[1]}L${e[0]-1.5} ${e[1]}" stroke="${c.metal}" stroke-width="4.5" stroke-linecap="round"/><circle cx="${e[0]}" cy="${e[1]}" r="${radius}" fill="url(#ball)" stroke="${c.edge}" stroke-width=".9"/><ellipse cx="${e[0]-radius*.3}" cy="${e[1]-radius*.35}" rx="${radius*.3}" ry="${radius*.16}" fill="white" opacity=".38"/>`;return s}
function render(theme='wire',shell=35){const c=palettes[theme],ghost=theme==='glass',fillOpacity=ghost?.2:.8,edge=ghost?'none':c.edge;let s=`<svg class="cabinet-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="正立的三维老虎机机柜，与房间共用中心灭点"><defs>
<linearGradient id="casing" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="${c.light}" stop-opacity="${ghost?.25:1}"/><stop offset=".43" stop-color="${c.shell}" stop-opacity="${ghost?.22:.9}"/><stop offset="1" stop-color="${c.side}" stop-opacity="${ghost?.1:.9}"/></linearGradient>
<linearGradient id="trim" x2="0" y2="1"><stop stop-color="${c.light}" stop-opacity=".9"/><stop offset=".14" stop-color="${c.trim}"/><stop offset="1" stop-color="${c.trimDark}"/></linearGradient>
<linearGradient id="bezel" x2="0" y2="1"><stop stop-color="${c.dark}"/><stop offset=".5" stop-color="${c.edge}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>
<linearGradient id="glass" x1="0" x2="1" y2="1"><stop stop-color="${c.light}" stop-opacity=".37"/><stop offset=".3" stop-color="${c.glass}" stop-opacity=".1"/><stop offset="1" stop-color="${c.glass}" stop-opacity=".45"/></linearGradient>
<radialGradient id="ball" cx=".3" cy=".2" r=".9"><stop stop-color="${c.light}"/><stop offset=".22" stop-color="${c.ball}"/><stop offset="1" stop-color="${c.trimDark}"/></radialGradient>
<linearGradient id="hub"><stop stop-color="${c.dark}"/><stop offset=".45" stop-color="${c.metal}"/><stop offset="1" stop-color="${c.edge}"/></linearGradient>
<radialGradient id="ground"><stop stop-color="${c.dark}" stop-opacity=".3"/><stop offset="1" stop-color="${c.dark}" stop-opacity="0"/></radialGradient></defs>${room(c)}<ellipse cx="400" cy="688" rx="250" ry="52" fill="url(#ground)"/>`;
// Rear shell is narrower in projection because it is farther from the same camera.
s+=box(0,3.22,-.62,4.25,5.88,.28,c.side,c.side,edge,.45);
s+=mechanics(c);
// Both side cheeks follow the classic cabinet profile. No screen-space skew.
const profile=[[.38,-.84],[6.08,-.84],[6.34,-.5],[6.34,.28],[6.1,.83],[3.45,1.05],[2.95,1.76],[2.53,1.76],[.38,1.1]];
for(const sign of [-1,1]){const outer=profile.map(([y,z])=>[sign*2.18,y,z]);s+=poly(outer,'url(#casing)',edge,ghost?.5:.92);const inner=profile.map(([y,z])=>[sign*2.01,y,z+.035]);for(let i=1;i<profile.length-1;i++)s+=poly([outer[i],outer[i+1],inner[i+1],inner[i]],'url(#trim)',edge,ghost?.55:1)}
// Crown: rear plane, thick sloped cap, and the marquee front frame.
s+=poly([[-2.18,6.34,-.5],[2.18,6.34,-.5],[2.18,6.34,.28],[-2.18,6.34,.28]],'url(#casing)',edge,fillOpacity);
s+=poly([[-2.18,6.34,.28],[2.18,6.34,.28],[2.01,6.1,.88],[-2.01,6.1,.88]],'url(#trim)',edge,ghost?.45:1);
s+=roundedFront(0,5.82,.91,4.03,.74,.12,'url(#trim)',edge,ghost?.5:1);
s+=roundedFront(0,5.83,.94,3.77,.5,.06,c.face,edge,ghost?.22:1);
// Recessed reel well: lip, deep inner bevel, four mechanical drums behind glass.
s+=roundedFront(0,4.45,1.02,4.03,2.02,.1,'url(#trim)',edge,ghost?.4:1);
s+=roundedFront(0,4.45,1.055,3.82,1.81,.07,'url(#bezel)',edge,ghost?.55:1);
const opening=[[-1.79,5.3,1.07],[1.79,5.3,1.07],[1.79,3.61,1.2],[-1.79,3.61,1.2]];s+=poly(opening,c.dark,'none',.4);
// Front rail and sloping control deck project from their actual world coordinates.
s+=poly([[-2.01,3.45,1.08],[2.01,3.45,1.08],[2.18,2.95,1.76],[-2.18,2.95,1.76]],'url(#casing)',edge,ghost?.35:1);
s+=poly([[-2.18,2.95,1.76],[2.18,2.95,1.76],[2.18,2.53,1.76],[-2.18,2.53,1.76]],'url(#trim)',edge,ghost?.45:1);
s+=poly([[-2.18,2.53,1.76],[2.18,2.53,1.76],[2.01,2.42,1.13],[-2.01,2.42,1.13]],c.trimDark,edge,ghost?.3:1);
// Lower cabinet: frosted service window with board, motor wiring and fasteners.
s+=roundedFront(0,1.43,1.13,4.03,2.02,.06,'url(#casing)',edge,ghost?.15:Math.max(.12,.8-shell/100*.75));
s+=roundedFront(0,1.56,1.16,3.57,1.33,.08,'url(#glass)',edge,ghost?.5:.8);
s+=line([[-1.72,2.16,1.18],[-1.72,.94,1.18],[1.72,.94,1.18]],c.light,1.3,.5);
s+=poly([[-1.6,2.12,1.19],[-.83,2.12,1.19],[-1.33,.99,1.19],[-1.6,.99,1.19]],c.light,'none',.11);
// A recessed output tray with a rear wall, floor and raised front lip.
s+=box(0,.69,1.12,3.55,.36,.16,c.dark,c.side,edge,ghost?.4:1);
s+=poly([[-1.77,.56,1.18],[1.77,.56,1.18],[1.94,.48,1.92],[-1.94,.48,1.92]],c.metal,edge,ghost?.5:1);
s+=poly([[-1.94,.48,1.92],[1.94,.48,1.92],[1.94,.31,1.92],[-1.94,.31,1.92]],'url(#casing)',edge,ghost?.5:1);
s+=poly([[-1.77,.88,1.18],[-1.94,.72,1.92],[-1.94,.31,1.92],[-1.77,.56,1.18]],c.trim,edge,ghost?.5:1);
s+=poly([[1.77,.88,1.18],[1.94,.72,1.92],[1.94,.31,1.92],[1.77,.56,1.18]],c.trim,edge,ghost?.5:1);
s+=box(0,.21,.28,4.05,.22,2.1,c.dark,c.side,edge,ghost?.5:1);
for(const x of [-1.9,1.9])for(const y of [5.83,3.49,2.12,.95])s+=screw(x,y,y>3?1.07:1.2,c);
// Vent slots and status LEDs are mounted on the front apron.
for(let i=0;i<12;i++)s+=line([[-.65+i*.12,2.73,1.78],[-.65+i*.12,2.64,1.78]],c.dark,2,ghost?.4:.65);
for(let i=0;i<4;i++){const [x,y]=project([1.36+i*.12,2.72,1.78]);s+=`<circle cx="${x}" cy="${y}" r="2" fill="${c.light}" opacity=".8"/>`}
s+=`<g id="cabinet-lever-model">${lever(theme)}</g></svg>`;return s}
// A projective transform maps each HTML control plane to its four projected 3D corners.
function matrix(corners,w,h){const p=corners.map(project);const [p0,p1,p2,p3]=p;const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0],dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];const det=dx1*dy2-dx2*dy1;const g=(dx3*dy2-dx2*dy3)/det,hp=(dx1*dy3-dx3*dy1)/det;const a=p1[0]-p0[0]+g*p1[0],b=p1[1]-p0[1]+g*p1[1],c=p3[0]-p0[0]+hp*p3[0],d=p3[1]-p0[1]+hp*p3[1];return [a/w,b/w,0,g/w,c/h,d/h,0,hp/h,0,0,1,0,p0[0],p0[1],0,1]}
const surfaces={
 'cabinet-marquee':{w:370,h:48,c:[[-1.8,6.035,.98],[1.8,6.035,.98],[1.8,5.64,.98],[-1.8,5.64,.98]]},
 'cabinet-track-labels':{w:400,h:16,c:[[-1.79,5.48,1.09],[1.79,5.48,1.09],[1.79,5.32,1.09],[-1.79,5.32,1.09]]},
 'reels':{w:400,h:184,c:[[-1.77,5.27,1.09],[1.77,5.27,1.09],[1.77,3.65,1.21],[-1.77,3.65,1.21]]},
 'stops':{w:400,h:38,c:[[-1.77,3.26,1.38],[1.77,3.26,1.38],[1.77,3.04,1.69],[-1.77,3.04,1.69]]},
 'cabinet-link':{w:124,h:36,c:[[-1.89,2.89,1.79],[-.74,2.89,1.79],[-.74,2.57,1.79],[-1.89,2.57,1.79]]},
 'cabinet-count':{w:110,h:32,c:[[.77,2.88,1.79],[1.8,2.88,1.79],[1.8,2.59,1.79],[.77,2.59,1.79]]},
 'cabinet-service-label':{w:300,h:16,c:[[-1.4,2.32,1.2],[1.4,2.32,1.2],[1.4,2.17,1.2],[-1.4,2.17,1.2]]}
};
const API={project,matrix,render,lever,surfaces,camera};
if(typeof module==='object'&&module.exports)module.exports=API;
root.Cabinet=API;
if(typeof document==='undefined')return;
let theme=document.body.dataset.theme,shell=35;
const stage=document.querySelector('.stage'),unit=document.querySelector('.cabinet-coordinate-space'),model=document.querySelector('#cabinet-model');
function draw(){model.innerHTML=render(theme,shell)}draw();
for(const [id,s] of Object.entries(surfaces)){const e=document.getElementById(id);e.style.width=s.w+'px';e.style.height=s.h+'px';e.style.transform='matrix3d('+matrix(s.c,s.w,s.h).join(',')+')'}
const resize=()=>unit.style.transform='scale('+stage.clientWidth/800+')';new ResizeObserver(resize).observe(stage);resize();
new MutationObserver(()=>{const next=document.body.dataset.theme;if(next!==theme){theme=next;draw()}}).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
const shellControl=document.querySelector('#shell');shellControl.addEventListener('input',()=>{shell=+shellControl.value;document.querySelector('#shell-val').value=shell+'%';draw()});
root.cabinetPull=()=>{const start=performance.now();function tick(now){const p=Math.min(1,(now-start)/900);const angle=p<.42?Math.sin(p/.42*Math.PI/2)*1.05:Math.cos((p-.42)/.58*Math.PI/2)*1.05;document.querySelector('#cabinet-lever-model').innerHTML=lever(theme,angle);if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)};
})(typeof window==='undefined'?globalThis:window);
