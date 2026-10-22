/* Deterministic lighting scores, shared by generated SVGs and the live editor. */
(function(){
const cycles=[6.8,7.7,8.9,5.9,9.1,8.1,10.3,7.3,6.3,8.6,9.7,5.6,7.9,11.2,10.7,4.9];
const fract=x=>x-Math.floor(x),pulse=(x,w=.22)=>Math.max(0,1-Math.min(fract(x),1-fract(x))/w),smooth=x=>x*x*(3-2*x);
function level(f,i,n,t){const q=(i%n)/Math.max(1,n-1),p=fract(t);switch(f){
 case 0:return pulse(p-q*.68,.19); // clouds roll under the eave
 case 1:return pulse(q-(.5-.5*Math.cos(t*Math.PI*2)),.24); // pendulum down/up
 case 2:return .2+.8*Math.pow(.5+.5*Math.sin(t*Math.PI*2-q*5),2); // tides
 case 3:return (Math.floor(p*6)+i)%3===0?.95:.13; // interwoven thirds
 case 4:return pulse(p-Math.abs(q-.5)*1.5,.23); // concentric gong
 case 5:return smooth(Math.max(0,1-Math.abs(p*2-1)-q*.35)); // lotus unfolding
 case 6:return p<.72?(p/.72>q?1:.09):1-(p-.72)/.28; // fan with pause
 case 7:return pulse(p-Math.abs(q-.5),.2); // paired arches
 case 8:return fract(p-q*.7)<.28?1:.12; // ascending steps
 case 9:return pulse(p-(i%3)*.16,.1)*.9+.1; // three bell strikes
 case 10:return pulse(p-q*.92,.32); // long velvet spiral
 case 11:return pulse(p-q*.3-(i%2)*.18,.15); // displaced swing
 case 12:return (.5+.5*Math.sin(t*2*Math.PI+(i%2?1:-1)*q*4))**3; // contrary organ voices
 case 13:return pulse(p-q,.25); // orbit
 case 14:return Math.max(pulse(p-q,.14),pulse(p-q-.5,.14)); // antipodal stars
 case 15:return [1,.13,.65,.13,1,.3,.13,.8][(Math.floor(p*8)+i*3)%8]; // syncopated shutters
 default:return 1;
}}
function color(hex,v){const a=hex.replace('#','').match(/../g).map(x=>parseInt(x,16));return '#'+a.map(c=>Math.max(0,Math.min(255,Math.round(c*v))).toString(16).padStart(2,'0')).join('');}
function animation(f,i,n,tone,{speed=1,amount=.85,variation=0}={}){const count=32,values=Array.from({length:count+1},(_,k)=>{const v=level(f,i,n,k/count+variation*.033);return color(tone,1-amount*(1-v)*.88);});return `<animate class="circuit-animation" attributeName="color" values="${values.join(';')}" dur="${cycles[f]/speed}s" begin="${-(f*.371+variation*.17)}s" repeatCount="indefinite" calcMode="${[3,8,15].includes(f)?'discrete':'linear'}"/>`;}
globalThis.DreamCircuits={cycles,level,color,animation};if(typeof module!=='undefined')module.exports=globalThis.DreamCircuits;
})();
