import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,RainProcess,inPond,inRain,materialAt,ENTITIES} from '../src/domain.js';
import {ControlStore} from '../src/controls.js';
import {projectPoint,unprojectPoint,projectSurface,unprojectSurface,appearanceDefaults} from '../src/renderer.js';
test('seeded rain is identical independently of any visual skin',()=>{
  const a=new RainProcess(createState()),b=new RainProcess(createState());
  for(let i=0;i<200;i++)assert.deepEqual(a.generate(i*.4),b.generate(i*.4));
});
test('special surfaces shadow water and zero radius has no events',()=>{
  for(const e of ENTITIES)assert.equal(materialAt(e.x,e.y),e.id);
  assert.equal(materialAt(.5,.5),'water');
  const p=new RainProcess(createState({radius:0,rain:1,hold:1}));
  assert.equal(p.generate(0).length,0);
});
test('local rain stays inside both region and pond',()=>{
  const s=createState({x:.25,y:.61,radius:.15,rain:1,density:1});const p=new RainProcess(s);let count=0;
  for(let i=0;i<300;i++)for(const e of p.generate(i*.4)){assert.ok(inRain(e.x,e.y,s));assert.ok(inPond(e.x,e.y));count++;}
  assert.ok(count>20);
});
test('bass retriggers respect cooldown and stronger density increases arrivals',()=>{
  const p=new RainProcess(createState({rain:1,density:1,radius:1}));let last=-100,total=0;
  for(let i=0;i<2000;i++)for(const e of p.generate(i*.4)){if(e.material==='leaf'&&e.audible){assert.ok(e.time-last>=60/76*1.7);last=e.time;total++;}}
  assert.ok(total>10);
  const count=d=>{const p=new RainProcess(createState({density:d}));return Array.from({length:400},(_,i)=>p.generate(i*.4).length).reduce((a,b)=>a+b,0);};
  assert.ok(count(.9)>count(.1)*2);
});
test('hold with zero baseline rains, release returns to silence',()=>{
  const s=createState({rain:0,hold:1});const p=new RainProcess(s);let held=0;
  for(let i=0;i<100;i++)held+=p.generate(i*.4).length;
  assert.ok(held>20);s.hold=0;for(let i=100;i<120;i++)p.generate(i*.4);
  assert.equal(p.generate(49).length,0);
});
test('input sources share one mapping and independent holds do not cancel each other',()=>{
 const s=createState();const store=new ControlStore(s);store.set('radius',9);assert.equal(s.radius,1);store.move(-1,4);assert.equal(s.x,0);assert.equal(s.y,1);
 store.hold('pointer',true);store.hold('keyboard',true);store.hold('pointer',false);assert.equal(s.hold,1);store.release();assert.equal(s.hold,0);
 store.import({bpm:Infinity,radius:'bad',rain:.2});assert.equal(s.bpm,76);assert.equal(s.radius,1);assert.equal(s.rain,.2);
});
test('all three skin projections map mouse coordinates back to the same world',()=>{
 for(const skin of ['frost','ink','doodle']){const p={...appearanceDefaults(skin),cameraScale:.86,perspective:1.1};for(let i=1;i<20;i++){const x=i/20,y=(20-i)/20;const screen=projectPoint(skin,x,y,p),back=unprojectPoint(skin,screen.x,screen.y,p);assert.ok(Math.abs(back.x-x)<1e-9);assert.ok(Math.abs(back.y-y)<1e-9);}}
});
test('registered leaf and dish surfaces preserve their local hit coordinates across skins',()=>{
 for(const skin of ['frost','ink','doodle']){const p=appearanceDefaults(skin);for(const e of ENTITIES){for(const sign of [-1,0,1]){const point={x:e.x+sign*e.rx*.5,y:e.y+sign*e.ry*.5,material:e.id};const v=projectSurface(skin,point,p),back=unprojectSurface(skin,v.x,v.y,p);assert.ok(Math.abs(back.x-point.x)<1e-9);assert.ok(Math.abs(back.y-point.y)<1e-9);}}}
});
test('an isolated leaf arrival is audible even between the preferred bass beats',()=>{
 const s=createState({x:.25,y:.61,radius:.1,rain:1,density:1,rhythm:1});const p=new RainProcess(s);
 let first;for(let i=0;i<100&&!first;i++)first=p.generate(i*.4,1).find(e=>e.material==='leaf');
 assert.ok(first);assert.equal(first.audible,true);
});
