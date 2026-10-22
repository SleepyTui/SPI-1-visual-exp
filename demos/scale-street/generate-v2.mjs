import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.dirname(fileURLToPath(import.meta.url));
require('./data.js');const F=require('./catalog-v2.js');
if(process.argv.includes('--characters')){fs.writeFileSync(path.join(root,'font-characters.txt'),F.flatMap(f=>f.scales.flatMap(s=>[s.name,s.cn,s.mark,s.enMark,s.nativeTitle,s.nativeIcon,s.nativeSubtitle])).join('')+'世紀世纪传统古代近代中世纪现代');const phrases={};for(const f of F){phrases[f.nativeFont]??=[];for(const s of f.scales)phrases[f.nativeFont].push(s.nativeTitle,s.nativeIcon,s.nativeSubtitle);}fs.writeFileSync(path.join(root,'native-phrases.json'),JSON.stringify(phrases,null,2));console.log('65-scale native character and shaped-word sources prepared.');process.exit(0);}
globalThis.STREET_GLYPHS=JSON.parse(fs.readFileSync(path.join(root,'glyphs.json'),'utf8'));require('./lettering-cache.js');const art=require('./art-v2.js');
fs.writeFileSync(path.join(root,'glyph-cache.js'),'globalThis.STREET_GLYPHS='+JSON.stringify(globalThis.STREET_GLYPHS)+';\n');
const write=(name,body)=>{const target=path.join(root,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);};
const manifest={version:8,families:16,scales:F.reduce((n,f)=>n+f.scales.length,0),counts:{signs:260,icons:65,streets:4},assetLanguage:'native',uiLanguages:['zh','en'],files:[],references:'references/'};
for(const f of F)for(const [i,s]of f.scales.entries()){
 const icon=`assets-native/${f.id}/icons/${s.id}.svg`;write(icon,art.iconSVG(f.familyIndex,i));manifest.files.push({kind:'icon',family:f.id,scale:s.id,path:icon});
 for(const depth of ['2d','2.5d'])for(const light of ['lightbox','neon']){const name=`assets-native/${f.id}/${depth}/${light}/${s.id}.svg`;write(name,art.signSVG(f.familyIndex,i,{depth,light,uid:'asset'}));manifest.files.push({kind:'sign',family:f.id,scale:s.id,depth,light,path:name});}
}
for(const depth of ['2d','2.5d'])for(const light of ['lightbox','neon']){const name=`assets-native/street-${depth}-${light}.svg`;write(name,art.street({depth,light,allLit:true}));manifest.files.push({kind:'street',depth,light,path:name});}
write('manifest-v2.json',JSON.stringify(manifest,null,2));
// Natural Earth source is read once during generation; browser opens self-contained vector paths.
const geo=JSON.parse(fs.readFileSync(path.join(root,'references/countries.geojson'),'utf8'));
const groups={china:['China','Taiwan'],japan:['Japan'],ryukyu:['Japan'],ethiopia:['Ethiopia'],indonesia:['Indonesia'],thailand:['Thailand'],india:['India'],middleeast:['Turkey','Syria','Lebanon','Israel','Jordan','Iraq','Saudi Arabia','Egypt'],europe:['France','Germany','Spain','Italy','United Kingdom','Poland','Greece'],usa:['United States of America'],global:[]};
const maps={};
for(const [key,ns]of Object.entries(groups)){
 const polys=geo.features.filter(f=>key==='global'?f.properties.NAME!=='Antarctica':ns.includes(f.properties.ADMIN)||ns.includes(f.properties.NAME)).flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(a=>a[0]).filter(a=>key!=='usa'||a.every(p=>p[0]>-130&&p[0]<-60));
 let pts=polys.flat();if(!pts.length)throw Error(`Missing map ${key}`);const xmin=Math.min(...pts.map(p=>p[0])),xmax=Math.max(...pts.map(p=>p[0])),ymin=Math.min(...pts.map(p=>p[1])),ymax=Math.max(...pts.map(p=>p[1]));const ratio=Math.min(94/(xmax-xmin),48/(ymax-ymin));
 maps[key]=polys.map(a=>'M'+a.map(([x,y])=>`${(50+(x-(xmin+xmax)/2)*ratio).toFixed(1)},${(26-(y-(ymin+ymax)/2)*ratio).toFixed(1)}`).join('L')+'z').join('');
}
write('maps-v2.js','globalThis.STREET_MAPS='+JSON.stringify(maps)+';\n');
console.log(`Generated ${manifest.scales} scales / 260 native sign SVGs + 65 native icons / 4 separate-building street SVGs; offline glyph and map data ready.`);
