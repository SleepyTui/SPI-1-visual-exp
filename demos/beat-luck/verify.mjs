import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const here = import.meta.dirname;
const dist = path.join(here, 'dist');
const required = [
  'index.html', 'app.js', 'voices.js', 'cabinet.js', 'cabinet.css', 'style.css',
  'fonts/dm-sans.woff2', 'fonts/space-grotesk.woff2',
  'fonts/dm-sans-LICENSE.txt', 'fonts/space-grotesk-LICENSE.txt',
];
for (const file of required) assert.ok(fs.statSync(path.join(dist, file)).isFile(), `缺少 ${file}`);

const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
for (const marker of ['id="reels"', 'id="stops"', 'id="link"', 'id="voice-cards"', 'src="voices.js"', 'src="cabinet.js"']) {
  assert.ok(html.includes(marker), `入口缺少 ${marker}`);
}

const { DRUM_KITS, VOICE_PARAMS } = await import(pathToFileURL(path.join(dist, 'voices.js')));
const cabinetModule = await import(pathToFileURL(path.join(dist, 'cabinet.js')));
const cabinet = cabinetModule.default || globalThis.Cabinet;
assert.ok(cabinet, '无法加载机柜投影模块');
assert.equal(DRUM_KITS.length, 12, '需要 12 组风格音色');
assert.ok(DRUM_KITS.every(kit => kit.length === 4), '每组风格需要四条轨道');
assert.equal(DRUM_KITS.flat().length, 48, '需要 48 个 voice preset');
assert.ok(VOICE_PARAMS.length >= 8, '每轨需要八个可调参数');
assert.equal(new Set(DRUM_KITS.map(kit => JSON.stringify(kit))).size, 12, '12 组风格音色不能重复');

for (const surface of Object.values(cabinet.surfaces)) {
  const matrix = cabinet.matrix(surface.c, surface.w, surface.h);
  [[0, 0], [surface.w, 0], [surface.w, surface.h], [0, surface.h]].forEach(([x, y], index) => {
    const denominator = matrix[3] * x + matrix[7] * y + 1;
    const actual = [(matrix[0] * x + matrix[4] * y + matrix[12]) / denominator, (matrix[1] * x + matrix[5] * y + matrix[13]) / denominator];
    const expected = cabinet.project(surface.c[index]);
    assert.ok(Math.hypot(actual[0] - expected[0], actual[1] - expected[1]) < .001, '控制面必须落在对应三维平面');
  });
}

console.log('PASS: BEAT LUCK assets, 12 styles, 48 voices, 8 controls, and projected cabinet surfaces.');
