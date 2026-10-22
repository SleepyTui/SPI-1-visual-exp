import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);require('./data.js');const F=require('./catalog-v2.js');globalThis.STREET_GLYPHS=JSON.parse(fs.readFileSync(new URL('glyphs.json',import.meta.url)));const A=require('./art-v2.js');
const forms={};for(const f of F)for(const [si]of f.scales.entries())forms[`${f.familyIndex}:${si}`]=A.signSVG(f.familyIndex,si,{depth:'2d'});
fs.writeFileSync(new URL('lettering-layouts.json',import.meta.url),JSON.stringify(forms));
console.log('65 uniformly laid-out lettering sources ready for boolean union.');
