import {clamp,DEFAULTS} from './domain.js';
export const RANGES={x:[0,1],y:[0,1],radius:[0,1],aspect:[.4,2.5],rain:[0,1],density:[0,1],bpm:[38,150],rhythm:[0,1],boost:[0,1],master:[0,1],water:[0,1],leaf:[0,1],dish:[0,1],reverb:[0,.8],waterTail:[.3,6],leafTail:[.2,3.5],dishTail:[.1,2],brightness:[0,1],harmonyBars:[1,16],leafWeight:[0,1],dishWeight:[0,.6]};
export class ControlStore {
  constructor(state,onChange=()=>{}) {this.state=state;this.onChange=onChange;this.holds=new Set();this.last='等待操作';}
  set(key,value,source='GUI') {
    if(!(key in RANGES))return;
    const [a,b]=RANGES[key];const n=Number(value);if(!Number.isFinite(n))return;
    this.state[key]=clamp(n,a,b);this.last=`${source} → ${key} ${this.state[key].toFixed(2)}`;this.onChange(key);
  }
  move(x,y,source='雨区拖动'){this.state.x=clamp(x);this.state.y=clamp(y);this.last=`${source} → X ${this.state.x.toFixed(2)} / Y ${this.state.y.toFixed(2)}`;this.onChange('position');}
  hold(source,down){down?this.holds.add(source):this.holds.delete(source);this.state.hold=this.holds.size?1:0;this.last=`${source} → ${this.state.hold?'临时聚雨':'回到基础雨量'}`;this.onChange('hold');}
  release(){this.holds.clear();this.state.hold=0;this.last='全部手势释放';this.onChange('hold');}
  import(data){for(const key of Object.keys(RANGES))if(key in data)this.set(key,data[key],'导入');if(typeof data.harmony==='boolean')this.state.harmony=data.harmony;this.release();}
}
export function bindGestures({surface,store,unproject,onUserGesture}) {
  const active=new Map();let pinch=null,drag=null;
  const point=e=>unproject(e.clientX,e.clientY);
  const down=e=>{
    if(e.button!==0&&e.pointerType==='mouse')return;
    onUserGesture();surface.setPointerCapture(e.pointerId);active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(active.size===1){drag={x:e.clientX,y:e.clientY,r:store.state.radius};if(!e.altKey)store.hold('池塘按住',true);if(!e.shiftKey){const p=point(e);store.move(p.x,p.y);}}
    if(active.size===2){const [a,b]=[...active.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),radius:store.state.radius};}
  };
  const move=e=>{
    if(!active.has(e.pointerId))return;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(active.size>1&&pinch){const [a,b]=[...active.values()];store.set('radius',pinch.radius*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),'双指缩放');const p=unproject((a.x+b.x)/2,(a.y+b.y)/2);store.move(p.x,p.y,'双指中点');}
    else if(e.shiftKey&&drag)store.set('radius',drag.r+(e.clientX-drag.x)/surface.clientWidth,'Shift 横拖');
    else {const p=point(e);store.move(p.x,p.y,e.altKey?'Alt 仅移动':'雨区拖动');}
  };
  const up=e=>{active.delete(e.pointerId);if(active.size<2)pinch=null;if(!active.size){store.hold('池塘按住',false);drag=null;}};
  surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,up);
  surface.addEventListener('wheel',e=>{e.preventDefault();store.set('radius',store.state.radius-e.deltaY*.001,'滚轮缩放');},{passive:false});
  const onKey=e=>{
    if(e.target.closest('input,select,textarea,button,[contenteditable]'))return;
    if(e.code==='Space'){e.preventDefault();if(!e.repeat)onUserGesture();store.hold('空格',true);}
    const inc=e.shiftKey?.07:.025;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Equal','Minus'].includes(e.code)){
      e.preventDefault();if(e.code==='Equal'||e.code==='Minus')store.set('radius',store.state.radius+(e.code==='Equal'?inc:-inc),'键盘缩放');
      else store.move(store.state.x+(e.code==='ArrowRight'?inc:e.code==='ArrowLeft'?-inc:0),store.state.y+(e.code==='ArrowDown'?inc:e.code==='ArrowUp'?-inc:0),'方向键');
    }
    if(e.code==='Escape')store.release();
  };
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',e=>{if(e.code==='Space')store.hold('空格',false);});
  window.addEventListener('blur',()=>{active.clear();pinch=null;drag=null;store.release();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)store.release();});
}
export function bindStrip(element,axis,store){
  const apply=e=>{const rect=element.getBoundingClientRect();store.set(axis,axis==='x'?(e.clientX-rect.left)/rect.width:(e.clientY-rect.top)/rect.height,`${axis.toUpperCase()} 触摸条`);};
  element.addEventListener('pointerdown',e=>{element.setPointerCapture(e.pointerId);apply(e);});
  element.addEventListener('pointermove',e=>{if(element.hasPointerCapture(e.pointerId))apply(e);});
  element.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();store.set(axis,store.state[axis]+(['ArrowRight','ArrowDown'].includes(e.code)?.03:-.03),'触摸条键盘');}});
}
export function bindHoldButton(button,store,onUserGesture){
  button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);onUserGesture();store.hold('压雨垫',true);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>store.hold('压雨垫',false));
  button.addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();onUserGesture();store.hold('压雨垫键盘',true);}});
  button.addEventListener('keyup',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();store.hold('压雨垫键盘',false);}});
}
