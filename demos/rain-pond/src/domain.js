// Logical sound world. No browser, drawing, skin or audio library dependencies.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const DEFAULTS = Object.freeze({
  x: .50, y: .52, radius: .82, aspect: 1, rain: .50, density: .62,
  bpm: 76, rhythm: .68, boost: .55, hold: 0, master: .68,
  water: .72, leaf: .83, dish: .48, reverb: .34,
  waterTail: 2.8, leafTail: 1.5, dishTail: .75, brightness: .48,
  harmonyBars: 4, harmony: true, leafWeight: .42, dishWeight: .13, seed: 7319
});
export const ENTITIES = Object.freeze([
  Object.freeze({ id: 'leaf', x: .25, y: .61, rx: .20, ry: .145 }),
  Object.freeze({ id: 'dish', x: .76, y: .38, rx: .14, ry: .10 })
]);
export const CHORDS = Object.freeze([
  {name:'Dm9', root:38, notes:[62,65,69,72,76]},
  {name:'B♭maj7', root:34, notes:[58,62,65,69,72]},
  {name:'Fadd9', root:41, notes:[60,65,69,72,74]},
  {name:'Cadd9', root:36, notes:[60,64,67,69,74]}
]);
export function createState(overrides = {}) { return {...DEFAULTS, ...overrides}; }
export function randomSource(seed) {
  let n=seed>>>0;
  return () => { n+=0x6D2B79F5; let t=n; t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
// Irregular logical grid edge. All renderers project this same world.
export function shore(y) { return .055 + .026*Math.sin(y*12.4)+.022*Math.cos(y*6.5); }
export function inPond(x,y) { const edge=shore(y); return y>=.035&&y<=.965&&x>=edge&&x<=1-edge; }
export function materialAt(x,y) {
  for(const e of [...ENTITIES].reverse()) {
    if(((x-e.x)/e.rx)**2+((y-e.y)/e.ry)**2<=1) return e.id;
  }
  return 'water';
}
export function inRain(x,y,state) {
  if(state.radius<=.005) return false;
  if(state.radius>=.995) return inPond(x,y);
  const rx=.66*state.radius*Math.sqrt(state.aspect), ry=.66*state.radius/Math.sqrt(state.aspect);
  return ((x-state.x)/rx)**2+((y-state.y)/ry)**2<=1;
}
export const noteName = midi => ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][midi%12]+(Math.floor(midi/12)-1);
export class RainProcess {
  constructor(state) { this.state=state; this.random=randomSource(state.seed); this.sequence=0; this.step=0; this.last={water:-100,leaf:-100,dish:-100}; this.amount=state.rain; this.chord=CHORDS[0]; }
  generate(time, index=this.step++) {
    const s=this.state, rng=this.random, beat=60/s.bpm;
    const target=clamp(s.rain+s.hold*s.boost);
    this.amount += (target-this.amount)*.72;
    this.chord=CHORDS[s.harmony ? Math.floor(index/(8*s.harmonyBars))%4 : 0];
    if(s.radius<=.005||this.amount<.002) return [];
    const coverage=Math.min(1,s.radius*s.radius*2.2);
    const expected=this.amount*(.45+3.1*s.density)*(.15+.85*coverage);
    const count=Math.floor(expected)+(rng()<expected%1?1:0);
    const events=[];
    for(let i=0;i<count;i++) {
      let x,y,found=false;
      for(let attempt=0;attempt<160;attempt++) {
        x=rng();y=rng();
        if(inPond(x,y)&&inRain(x,y,s)) {found=true;break;}
      }
      if(!found) continue;
      // A bounded preference makes bass anchors more likely, without sounding
      // an object outside the rain region or adding an unrelated backing track.
      const preferred=index%4===0&&rng()<s.leafWeight?'leaf':rng()<s.dishWeight?'dish':null;
      if(preferred){const entity=ENTITIES.find(e=>e.id===preferred);for(let k=0;k<18;k++){const px=entity.x+(rng()*2-1)*entity.rx,py=entity.y+(rng()*2-1)*entity.ry;if(materialAt(px,py)===preferred&&inRain(px,py,s)&&inPond(px,py)){x=px;y=py;break;}}}
      const material=materialAt(x,y);
      const offset=(rng()-.5)*beat*.72*(1-s.rhythm) + i*.025;
      const at=time+offset;
      const cooldown=material==='leaf'?beat*(s.rhythm>.5?1.7:1.15):material==='dish'?.22:.09;
      const onPulse=material!=='leaf'||s.rhythm<.45||index%4===0||index%8===6||at-this.last.leaf>=beat*2;
      const audible=onPulse&&at-this.last[material]>=cooldown;
      if(audible) this.last[material]=at;
      const chord=this.chord;
      const pick=Math.min(chord.notes.length-1,Math.floor(x*chord.notes.length));
      let midi=material==='leaf'?chord.root+(rng()<.2?7:0):chord.notes[pick]+(material==='dish'?12:0);
      const velocity=(.4+rng()*.3)*(material==='dish'?.70:1);
      events.push(Object.freeze({id:++this.sequence,time:at,x,y,material,midi,note:noteName(midi),velocity,audible,step:index,chord:chord.name}));
    }
    return events.sort((a,b)=>a.time-b.time);
  }
}
