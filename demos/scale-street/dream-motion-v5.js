(function(){
function apply(svg,state){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const sign of svg.querySelectorAll('.street-sign')){const f=+sign.dataset.family,cfg=state.signEffects[f]||state.effect,on=state.view==='all'||state.family===f,play=on&&state.light==='neon'&&['program','chase'].includes(cfg.mode)&&!reduced,cells=Array.from(sign.querySelectorAll('.program-cell')),key=JSON.stringify([play,cfg.speed,cfg.amount,state.indices[f]]);if(sign.dataset.circuit===key)continue;sign.dataset.circuit=key;
  cells.forEach((cell,i)=>{cell.querySelectorAll('.circuit-animation').forEach(a=>a.remove());cell.setAttribute('color',cell.dataset.tone);if(play)cell.insertAdjacentHTML('beforeend',DreamCircuits.animation(f,i,cells.length,cell.dataset.tone,{...cfg,amount:cfg.amount*(cell.classList.contains('letter-cell')?.45:1),variation:state.indices[f]}));});
 }
 const d=state.dreamSettings;svg.querySelector('.dream-haze')?.setAttribute('opacity',d.mist/100);svg.querySelector('.dream-grain')?.setAttribute('opacity',d.grain/100);svg.querySelector('.dream-sky-layer')?.setAttribute('opacity',d.sky/100);
}
globalThis.DreamStreetMotion={apply};
})();
