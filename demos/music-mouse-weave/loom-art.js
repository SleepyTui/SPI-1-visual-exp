/* Cached editorial art at the device's 320px resolution. All material gradients
   are baked on theme changes; runtime animation only stamps 95 x 69 sprites. */
class LoomArt {
 constructor(){
  this.frames=[];this.glyphs=new Map();
  this.palettes={
   lilac:{canvas:'#faf9fc',ink:'#73728b',frame:'#f3bad9',light:'#fffce9',thread:'#d5d1df',cat:'#dcd7ee',ball:'#eab3d6',wash:'#f0eaf8',verticalIdle:'#d7c8eb',vertical:'#a681d6',horizontalIdle:'#f4c8da',horizontal:'#ed80b4',verticalGhost:'#eeeaf4',horizontalGhost:'#f4eaf0'},
   citrus:{canvas:'#f8f9f7',ink:'#647f91',frame:'#a3daee',light:'#fffce0',thread:'#cbd9d9',cat:'#c0ddea',ball:'#f1d46b',wash:'#eef4ee',verticalIdle:'#bcd6df',vertical:'#64adcb',horizontalIdle:'#d3e7b8',horizontal:'#a5d477',verticalGhost:'#edf1f1',horizontalGhost:'#edf2e8'},
   dusk:{canvas:'#a29eb5',ink:'#403944',frame:'#d7b758',light:'#fff4ca',thread:'#d1c8d4',cat:'#ceb9dc',ball:'#daba58',wash:'#aca5bc',verticalIdle:'#c7b4d9',vertical:'#e8b8e8',horizontalIdle:'#d6c188',horizontal:'#f0d161',verticalGhost:'#b0a9c0',horizontalGhost:'#b5adab'}
  };
 }
 grad(g,x1,y1,x2,y2,stops){const a=g.createLinearGradient(x1,y1,x2,y2);stops.forEach(([p,c])=>a.addColorStop(p,c));return a}
 oval(g,x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
 box(g,x,y,w,h,r,fill){g.fillStyle=fill;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
 line(g,pts,col,w=1){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke()}
 material(g,x,y,w,h,vertical=false){
  const C=this.C,metal=this.theme==='dusk';
  return this.grad(g,x,y,x+(vertical?w:0),y+(vertical?0:h),metal?
   [[0,'#eed3ff'],[.19,'#d4aff2'],[.38,'#f5db82'],[.60,'#ac8738'],[.78,'#5b5038'],[1,'#d5bd70']]:
   [[0,'#ffffff'],[.14,C.light],[.42,C.frame],[.72,this.theme==='lilac'?'#dad4f7':'#bfdae2'],[1,'#ffffff']]);
 }
 sphere(g,x,y,r,color){
  const a=g.createRadialGradient(x-r*.35,y-r*.45,r*.08,x,y,r);
  a.addColorStop(0,this.C.light);a.addColorStop(.45,color);a.addColorStop(1,this.theme==='dusk'?'#91729f':'#e6daf5');
  this.oval(g,x,y,r,r,a);
 }
 build(g,plot,colors,theme,motion,glow){
  this.C={...this.palettes[theme],...colors};this.theme=theme;const C=this.C;this.glyphs.clear();
  g.fillStyle=C.canvas;g.fillRect(0,0,320,320);
  // A large quiet field, with pre-rendered bloom and contact shadows.
  const haze=g.createRadialGradient(149,143,10,149,143,158);
  haze.addColorStop(0,C.wash);haze.addColorStop(1,C.canvas);g.fillStyle=haze;g.fillRect(0,0,320,320);
  // A quiet room behind the loom: a distant wall, floor plane, and soft
  // perspective guides. This is baked into the static layer on palette changes.
  const wall=this.grad(g,0,0,0,250,[[0,C.canvas],[.55,C.wash],[1,C.canvas]]);
  g.fillStyle=wall;g.fillRect(0,0,320,250);
  const alcove=g.createRadialGradient(160,135,24,160,135,205);
  alcove.addColorStop(0,C.light+'65');alcove.addColorStop(.58,C.canvas+'14');alcove.addColorStop(1,C.ink+'19');
  g.fillStyle=alcove;g.fillRect(0,0,320,320);
  g.fillStyle=this.grad(g,0,236,0,320,[[0,C.wash+'6c'],[.25,C.canvas],[1,C.ink+'1c']]);
  g.beginPath();g.moveTo(0,249);g.lineTo(160,222);g.lineTo(320,249);g.lineTo(320,320);g.lineTo(0,320);g.closePath();g.fill();
  this.line(g,[[0,249],[160,222],[320,249]],C.ink+'1c',.7);
  for(const x of [0,52,268,320])this.line(g,[[160+(x-160)*.26,236],[x,320]],C.ink+'13',.65);
  const vignette=g.createLinearGradient(0,0,320,0);
  vignette.addColorStop(0,C.ink+'0d');vignette.addColorStop(.24,C.canvas+'00');vignette.addColorStop(.76,C.canvas+'00');vignette.addColorStop(1,C.ink+'0d');
  g.fillStyle=vignette;g.fillRect(0,0,320,320);
  for(const [x,y,r,c] of [[54,69,35,C.frame],[239,69,35,C.frame],[159,259,67,C.ball]]){
   const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,c+Math.round(glow*60).toString(16).padStart(2,'0'));a.addColorStop(1,c+'00');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2);
  }
  const floor=g.createRadialGradient(153,283,0,153,283,102);floor.addColorStop(0,C.ink+'22');floor.addColorStop(1,C.ink+'00');
  g.save();g.translate(153,283);g.scale(1,.09);g.translate(-153,-283);g.fillStyle=floor;g.fillRect(40,174,226,220);g.restore();
  // Frontal instrument. Cylindrical material, clean silhouette, no cartoon outline.
  for(const x of [43,237]){
   this.box(g,x,67,13,192,6,this.material(g,x,67,13,192,true));
   g.fillStyle=this.grad(g,x-7,252,x+20,276,[[0,C.frame],[.45,C.light],[1,this.theme==='lilac'?'#d5ccf0':C.frame]]);
   g.beginPath();g.moveTo(x+2,250);g.lineTo(x+11,250);g.lineTo(x+23,279);g.lineTo(x-10,279);g.closePath();g.fill();
   this.sphere(g,x+6.5,56,11,C.frame);
  }
  for(const y of [62,239]){
   this.box(g,42,y,209,12,6,this.material(g,42,y,209,12));
   this.line(g,[[49,y+2],[245,y+2]],'#ffffffb0',.6);
  }
  // Front-facing heddle teeth and continuous warp form the recognizable loom.
  for(let i=0;i<23;i++){
   const x=plot.x+Math.max(0,Math.min(plot.size-5,Math.round(i*(plot.size-1)/22)-2))+2.5;
   this.line(g,[[x,73],[x,239]],C.thread+'80',.55);
   this.oval(g,x,68.5,.7,1.6,C.ink+'5a');this.oval(g,x,244,.7,1.3,C.ink+'55');
  }
  this.line(g,[[60,79],[230,79]],C.thread+'65',.5);
  // Bobbin lives in a separate small animated sprite below the cloth.
  // A fine holder fixes the side supply ball to the loom.
  this.line(g,[[250,104],[265,104],[265,111]],C.ink+'80',1);
  this.box(g,254,108,26,4,2,this.material(g,254,108,26,4));
  this.sphere(g,266,97,11,C.ball);
  for(let j=-1;j<=1;j++){g.beginPath();g.ellipse(266+j,97,4,10,.45+j*.35,0,Math.PI*2);g.strokeStyle='#ffffff70';g.lineWidth=.6;g.stroke()}
  g.beginPath();g.moveTo(274,102);g.bezierCurveTo(295,135,248,145,262,187);g.bezierCurveTo(277,222,237,239,242,269);g.strokeStyle=C.ball;g.lineWidth=.8;g.stroke();
  g.beginPath();g.moveTo(239,283);g.bezierCurveTo(218,300,204,282,211,272);g.bezierCurveTo(215,265,200,263,188,267);g.strokeStyle=C.ball;g.lineWidth=.8;g.stroke();
  // Abstract satin creature: sculpted ears, a quiet face, one moving paw.
  this.frames=[];this.spoolFrames=[];
  for(let f=0;f<8;f++){
   const c=document.createElement('canvas');c.width=95;c.height=69;const s=c.getContext('2d');
   const hit=Math.sin(f/7*Math.PI),paw=hit*7*motion;
   const skin=this.grad(s,46,22,80,63,[[0,'#ffffff'],[.30,C.light],[.61,C.cat],[1,C.frame]]);
   s.beginPath();s.moveTo(73,52);s.bezierCurveTo(95,53,94,34,84,33);s.strokeStyle=C.cat;s.lineWidth=6;s.lineCap='round';s.stroke();
   this.oval(s,63,46,17,17,skin);
   s.fillStyle=skin;s.beginPath();s.moveTo(46,32);s.quadraticCurveTo(42,13,46,11);s.quadraticCurveTo(50,11,55,24);s.quadraticCurveTo(62,20,68,25);s.quadraticCurveTo(78,10,81,14);s.quadraticCurveTo(84,18,78,38);s.quadraticCurveTo(76,51,60,50);s.quadraticCurveTo(44,48,46,32);s.fill();
   this.oval(s,56,37,.7,1.2,C.ink);this.oval(s,69,37,.7,1.2,C.ink);
   this.oval(s,57,59,6,3,C.cat);this.oval(s,72,59,5,3,C.cat);
   s.save();s.translate(24,49);s.rotate(hit*.6*motion);this.sphere(s,0,0,14,C.ball);
   for(let j=-2;j<=2;j++){s.beginPath();s.ellipse(j*1.8,0,4,12,.6+j*.24,0,Math.PI*2);s.strokeStyle='#ffffff90';s.lineWidth=.65;s.stroke()}s.restore();
   s.beginPath();s.moveTo(54,46);s.quadraticCurveTo(48,49,40-paw,44+hit*4*motion);s.strokeStyle=C.cat;s.lineWidth=5;s.lineCap='round';s.stroke();
   this.frames.push(c);
   const spool=document.createElement('canvas');spool.width=100;spool.height=36;const q=spool.getContext('2d'),rotation=hit*motion;
   this.box(q,12,8,72,17,7,this.grad(q,12,8,12,25,[[0,C.light],[.36,C.ball],[.7,C.frame],[1,C.light]]));
   q.save();q.beginPath();q.roundRect(12,8,72,17,7);q.clip();
   for(let i=-1;i<28;i++)this.line(q,[[14+i*2.8+rotation*4,8],[12+i*2.8+rotation*4,25]],'#ffffff85',.7);q.restore();
   for(const x of [11,85]){this.oval(q,x,16,5,12,this.material(q,x-5,4,10,24,true));for(let k=0;k<3;k++){const a=rotation*1.8+k*Math.PI*2/3;this.line(q,[[x,16],[x+Math.cos(a)*3.5,16+Math.sin(a)*9]],this.C.ink+'65',.65)}}
   this.spoolFrames.push(spool);
  }
 }
 glyph(char,color,size,paper){
  const key=[char,color,size,paper].join(':');if(this.glyphs.has(key))return this.glyphs.get(key);
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
  g.fillStyle=color;g.font=(paper?'italic ':'')+'bold '+size+'px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(char,size/2,size/2+.3);
  this.glyphs.set(key,c);return c;
 }
 present(scene,out,rs,filter,size){
  size=Number.isFinite(size)?Math.max(1,Math.min(320,Math.round(size))):5;
  if(filter==='none'){for(const r of rs)out.drawImage(scene,r.x,r.y,r.w,r.h,r.x,r.y,r.w,r.h);return}
  const ctx=scene.getContext('2d'),cells=new Set(),paper=filter==='paper',background=filter==='terminal'?'#232230':paper?'#f4f2eb':'#faf9f5';
  const columns=Math.ceil(scene.width/size);
  for(const r of rs)for(let y=Math.floor(r.y/size);y<Math.ceil((r.y+r.h)/size);y++)for(let x=Math.floor(r.x/size);x<Math.ceil((r.x+r.w)/size);x++)cells.add(y*columns+x);
  const rows=new Map();for(const id of cells){const y=Math.floor(id/columns),x=id%columns;if(!rows.has(y))rows.set(y,[]);rows.get(y).push(x)}
  const b=parseInt(this.C.canvas.slice(1),16),br=(b>>16)&255,bg=(b>>8)&255,bb=b&255;
  for(const [cy,xs] of rows){
   const min=Math.min(...xs),max=Math.max(...xs),sx=min*size,sy=cy*size,sw=Math.min(320-sx,(max-min+1)*size),sh=Math.min(size,320-sy);
   if(sw<=0||sh<=0)continue;const img=ctx.getImageData(sx,sy,sw,sh).data;
   for(const cx of xs){
    let r=0,g=0,b=0,n=0,contrast=0;
    for(let yy=0;yy<sh;yy++)for(let xx=0;xx<size&&cx*size+xx<320;xx++){const i=(yy*sw+(cx-min)*size+xx)*4;r+=img[i];g+=img[i+1];b+=img[i+2];contrast=Math.max(contrast,Math.abs(img[i]-br),Math.abs(img[i+1]-bg),Math.abs(img[i+2]-bb));n++}
    r/=n;g/=n;b/=n;
    // Peak contrast preserves narrow threads and pale objects; average-only
    // luminance used to erase these into blank glyphs on light palettes.
    const density=Math.min(1,Math.max(0,(contrast-5)/95));
    out.fillStyle=background;out.fillRect(cx*size,sy,size,size);
    if(paper){out.strokeStyle='#c5c0b575';out.lineWidth=.5;out.strokeRect(cx*size+.25,sy+.25,size,size)}
    if(density<.06)continue;
    const chars=paper?'11223*#@':filter==='blocks'?'·░▒▓█':filter==='terminal'?'.:+=*#%@':'.:+x*#%@';
    const index=Math.min(chars.length-1,Math.floor(density*chars.length));
    const chroma=Math.max(r,g,b)-Math.min(r,g,b);
    const color=paper?['#5787aa','#5787aa','#90a967','#90a967','#c98585','#5f5d62','#4f4d52','#4f4d52'][index]:
     filter==='terminal'?'#d9e2bd':filter==='blocks'?'#827897':chroma<12?'#827e91':r>g+5?'#a26494':b>r?'#6286a0':'#7c9565';
    out.drawImage(this.glyph(chars[index],color,size,paper),cx*size,sy);
   }
  }
 }
}
