/* Animate emitted light only; physical sign panels, steel and lettering layout stay opaque. */
(function(){
function tubeFilter(f,cfg,on){const mode=on?cfg.mode:'steady',amount=cfg.amount,period=4/cfg.speed,phase=-(f*.319),moving=mode!=='steady'&&mode!=='chase'&&mode!=='program'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;let levels=[1,1];let discrete=false;
 if(mode==='breath')levels=[1,1-amount*.84,1];
 if(mode==='flicker'){levels=[1,1,1,1-amount*.94,1,1-amount*.8,1,1,1,1,1,1];discrete=true;}
 if(mode==='random'){let seed=237+f*971;levels=Array.from({length:25},()=>{seed=seed*16807%2147483647;return 1-amount*.88*(seed/2147483647);});discrete=true;}
 const light=levels.map(v=>v.toFixed(3)).join(';'),sat=levels.map(v=>(.45+v*.7).toFixed(3)).join(';'),timing=`dur="${period}s" begin="${phase}s" repeatCount="indefinite" calcMode="${discrete?'discrete':'linear'}"`,anim=(attr,values)=>moving?`<animate attributeName="${attr}" values="${values}" ${timing}/>`:'';
 return `<filter id="tube-${f}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="1.15">${anim('values',sat)}</feColorMatrix><feComponentTransfer>${['R','G','B'].map(ch=>`<feFunc${ch} type="linear" slope="1">${anim('slope',light)}</feFunc${ch}>`).join('')}</feComponentTransfer></filter>`;
}
function apply(svg,state,Art){const defs=svg.querySelector('#runtime-defs');defs.insertAdjacentHTML('beforeend',Array.from({length:16},(_,f)=>tubeFilter(f,state.signEffects[f]||state.effect,state.view==='all'||f===state.family)).join(''));
 for(const e of svg.querySelectorAll('.street-sign')){const f=+e.dataset.family,cfg=state.signEffects[f]||state.effect,on=state.view==='all'||state.family===f,emission=e.querySelector('.neon-emission'),layer=e.querySelector('.light-effect');layer.dataset.effect='steady';layer.style.opacity='1';layer.style.animation='none';if(emission){emission.dataset.effect=on?cfg.mode:'steady';emission.setAttribute('filter',`url(#tube-${f})`);emission.style.opacity='1';emission.style.setProperty('--effect-seconds',4/cfg.speed+'s');}const chase=e.querySelector('.chase-lights');if(chase){chase.style.opacity=on&&state.light==='neon'&&cfg.mode==='chase'?'1':'0';chase.style.setProperty('--effect-seconds',4/cfg.speed+'s');chase.style.setProperty('--effect-min',1-cfg.amount);}}
 // Window colour and occupancy scores are managed by StudioV6; avoid competing CSS filters.
 const ts=state.trafficSettings,light=svg.querySelector('.traffic-light');light.style.filter=`hue-rotate(${ts.hue}deg)`;light.style.opacity=state.traffic?ts.opacity:0;svg.querySelector('#trail-soft feGaussianBlur').setAttribute('stdDeviation',ts.blur);svg.querySelector('#trail-bloom feGaussianBlur').setAttribute('stdDeviation',ts.blur*2.6);svg.querySelector('#car-soft feGaussianBlur').setAttribute('stdDeviation',ts.carBlur);
 const flow=svg.querySelector('.traffic-flow'),animate=ts.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches,key=JSON.stringify([animate,ts.speed,ts.variation,ts.density]);if(flow.dataset.signature!==key){flow.innerHTML=Array.from({length:ts.density},(_,i)=>Art.trafficPassSVG(i,{...ts,animate})).join('');flow.dataset.signature=key;}
}
globalThis.StreetMotion={apply,tubeFilter};
})();
