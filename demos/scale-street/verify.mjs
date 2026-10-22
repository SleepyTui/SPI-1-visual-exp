import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {SLOTS,SAMPLES} from './sample-art.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.deepEqual(manifest.counts,{signs:48,icons:12,streets:12});assert.equal(manifest.files.length,72);
const seen=new Set();
for(const entry of manifest.files){assert(!seen.has(entry.path));seen.add(entry.path);const svg=fs.readFileSync(path.join(root,entry.path),'utf8');assert(svg.startsWith('<svg'));assert(!/<(?:text|image|foreignObject)\b/.test(svg),`Unoutlined or raster content: ${entry.path}`);assert(!/(?:NaN|undefined|Infinity)/.test(svg));assert(!/(?:href|src)\s*=/.test(svg),`External reference: ${entry.path}`);const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${entry.path}`);for(const match of svg.matchAll(/url\(#([^\)]+)\)/g))assert(ids.includes(match[1]),`Missing paint server ${match[1]}`);if(entry.kind==='icon'){assert(/width="32" height="32"/.test(svg));assert(!/<filter|<linearGradient|<rect/.test(svg));}if(entry.kind==='street')assert.equal((svg.match(/data-family=/g)||[]).length,16);}
assert.equal(new Set(SLOTS.map(s=>s.f)).size,16);
for(const s of SLOTS){assert(s.x>=0&&s.y>=0&&s.x+s.w<=320&&s.y+s.h<=320);}
for(const sample of SAMPLES){assert.equal(new Set(sample.notes).size,sample.notes.length);assert.equal(sample.notes[0],0);assert(sample.notes.every(n=>Number.isFinite(n)&&n>=0&&n<12));}
console.log('PASS: 72 self-contained SVGs; 48 signs / 12 monochrome 32px icons / 12 streets. All visible text outlined. 16 family slots in bounds.');
