/* Collector shares the Atelier's transparent shell and detailed disc artwork. */
window.CollectionMaterial=(()=>{
const uri=svg=>'data:image/svg+xml,'+encodeURIComponent(svg);
function parts(state,name,index,mapping=null){
const s=MD.clone(state),prefix='clear'+index;
s.label.title=MD.genres[s.template].split(' / ').join('\n');
const dom=new DOMParser().parseFromString(MD.render(s,{id:prefix}),'image/svg+xml');
const defs=dom.querySelector('defs').innerHTML,disc=dom.querySelector('#layer-disc');
// Keep surface details sharp; depth-of-field remains controlled by the shelf.
disc.querySelector('g')?.removeAttribute('filter');
const core=`<g opacity=".72">${disc.outerHTML}</g>`;
const shell=dom.querySelector('#layer-shell').outerHTML;
const print=dom.querySelector('#layer-label').outerHTML+dom.querySelector('#layer-stickers').outerHTML;
const wrap=body=>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="39.5 39.5 519 511" preserveAspectRatio="none" width="1200" height="1200"><title>${MD.esc(name)} — Transparent MiniDisc</title><metadata id="md-parameters">${MD.esc(JSON.stringify(state))}</metadata><defs>${defs}</defs>${body}</svg>`;return mapping?mapColors(svg,mapping):svg;};
return{core:uri(wrap(core)),shell:uri(wrap(shell)),print:uri(wrap(print)),svg:wrap(core+shell+print),plastic:s.shell.color,paper:s.label.paper,ink:s.label.ink,accent:s.disc.accent};
}
function mapColor(hex,mapping){
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const source=rgb(hex),l=(source[0]*.2126+source[1]*.7152+source[2]*.0722)/255;
const low=rgb(l<.5?mapping.shadow:mapping.color),high=rgb(l<.5?mapping.color:mapping.highlight),t=l<.5?l*2:(l-.5)*2,k=mapping.strength/100;
return '#'+source.map((v,i)=>Math.round(v*(1-k)+(low[i]+(high[i]-low[i])*t)*k).toString(16).padStart(2,'0')).join('');
}
function mapColors(svg,mapping){return svg.replace(/#[0-9a-f]{6}\b/gi,h=>mapColor(h,mapping));}
return{parts,mapColor};
})();
