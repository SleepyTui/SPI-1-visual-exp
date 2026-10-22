/* The same deterministic SVG scene is used by the atlas, editor and exports. */
(function (root) {
  'use strict';
  const VERSION = 2;
  const PAPER = '#fdfcf9';
  const INK = '#8171b1';
  const SOFT = '#a799d3';
  const BASE = { x: 0, y: 0, width: 100, height: 100, rotation: 0, organWidth: 100, organLength: 100, organOpacity: 100, roundness: 50, stemWidth: 4, stemBend: 0, stemOpacity: 100, dash: 0, dashGap: 3, twigCount: 2, tipLength: 27, petalCount: 11, petalLength: 148, spread: 126, columnCount: 6, coreRadius: 33, reedCount: 3, mouthOpen: 22, tipRadius: 2, funnelCount: 3, ringScale: 100, ringWeight: 1, leafCount: 6, orbitAngle: -27, orbitWidth: 117, orbitWeight: 6, fragmentCount: 7, cornerRadius: 4, particleCount: 6, particleSize: 1, particleOpacity: 75, scatterWidth: 100, scatterHeight: 100, squareRatio: 75, hazeOpacity: 15, echoCount: 0, echoOpacity: 12, echoX: 8, echoY: -7, echoScale: 98, grain: 44, grainSize: .78, grainContrast: 2.6, grainOctaves: 3, potWidth: 100, potHeight: 100, potX: 0, potY: 0, potOpacity: 100, seed: 17 };
  const PRESETS = [
    { id: 'glass-pluck', name: 'Glass Pluck', kind: 'BELL-LIKE PLUCK', color: '#efbc4f', words: 'bright / crisp / short / sparkling', note: 'bell-like buds + light, quick resonance', meaning: '细弧枝条托起下垂的钟形花苞，水滴与星芒表达清脆起音和短促共鸣。', params: { roundness: 18, height: 93, width: 96, tipLength: 27, twigCount: 2, hazeOpacity: 8, particleCount: 5, seed: 12 } },
    { id: 'velvet-pad', name: 'Velvet Pad', kind: 'SOFT LAYERED PAD', color: '#ed829c', words: 'warm / lush / long / enveloping', note: 'a symmetrical rosette + layered soft petals', meaning: '对称的簇状莲冠逐层展开，后层通透、前层浓郁，圆瓣与内收的花心共同表达温暖而丰厚的铺底。', params: { roundness: 82, height: 100, petalCount: 13, petalLength: 148, hazeOpacity: 12, particleCount: 0, seed: 23 } },
    { id: 'iron-root', name: 'Iron Root Bass', kind: 'DEEP RESONANT BASS', color: '#62b78b', words: 'deep / heavy / grounded / dense', note: 'solid columns + low-frequency resonance', meaning: '粗壮圆柱由宽阔的圆盘端面封顶，高低错落却紧密扎根，宽足盆器承托厚重而密实的低频。', params: { height: 98, width: 100, stemWidth: 5.2, hazeOpacity: 4, particleCount: 0, seed: 31 } },
    { id: 'neon-reed', name: 'Neon Reed Lead', kind: 'BRIGHT REED-LIKE LEAD', color: '#53b398', words: 'piercing / expressive / forward', note: 'reaching reeds + flared leaves + tiny stars', meaning: '恢复原版扇状叶面、高低错落的细芦苇和零散星芒，以细长弧线营造跳跃张力；只对尖角加少量可调圆角。', params: { height: 100, width: 100, reedCount: 12, tipRadius: 2, mouthOpen: 22, hazeOpacity: 10, squareRatio: 0, particleCount: 2, seed: 41 } },
    { id: 'dust-bloom', name: 'Dust Bloom Texture', kind: 'AIRY GRANULAR TEXTURE', color: '#a082d6', words: 'airy / fragmented / dusty / layered', note: 'solid fragments + translucent grain clusters', meaning: '浓实的大方片与圆形作为构图支点，小碎片以清晰、半透与虚淡的层次散开，枝条把主体连接为均衡的碎片花簇。', params: { height: 96, width: 100, hazeOpacity: 8, particleCount: 62, particleOpacity: 100, seed: 59 } },
    { id: 'hollow-choir', name: 'Hollow Choir', kind: 'BREATHY VOCAL TEXTURE', color: '#78b7e9', words: 'breathy / human / layered / resonant', note: 'hollow throats + softly doubled voices', meaning: '中空漏斗与共鸣环表达元音腔体，多个朝向接近的花口形成柔和的人声叠层。', params: { height: 98, hazeOpacity: 22, particleCount: 4, seed: 67 } },
    { id: 'cymbal-marsh', name: 'Cymbal Marsh Percussion', kind: 'METALLIC PERCUSSIVE TEXTURE', color: '#f08b83', words: 'punchy / metallic / transient-rich', note: 'thin lotus discs + scattered transient buds', meaning: '倾斜的莲叶薄盘像镲片一样展开，盘心的小隆起、细长弧茎与散落小芽共同呈现清亮而短促的金属打击。', params: { height: 99, width: 100, leafCount: 5, stemWidth: 3.5, hazeOpacity: 4, particleCount: 0, seed: 73 } },
    { id: 'petal-fragments', name: 'Petal Fragments', kind: 'CUT SAMPLE TEXTURE', color: '#ee8b83', words: 'cut / tactile / dry / articulated', note: 'cut sample petals + small transient grains', meaning: '截取般的方片花瓣、断续节点与异形小叶表达采样片段的触感；方块不是步进音序类别。', params: { height: 94, cornerRadius: 4, hazeOpacity: 6, particleCount: 8, seed: 89 } },
    { id: 'totem-keys', name: 'Totem Resonant Keys', kind: 'HOLLOW METALLIC KEYS', color: '#8d77d0', words: 'hollow / metallic / tuned / resonant', note: 'a connected ring core + hanging resonators', meaning: '保留初版胶囊与圆环的图腾结构，中心同心圆由上下主轴和两侧弯曲根系实际连接，表达空心金属键音的调谐共鸣。', params: { height: 97, width: 100, coreRadius: 32, stemWidth: 4.6, hazeOpacity: 7, particleCount: 1, seed: 97 } },
    { id: 'mist-orbit', name: 'Mist Orbit Ambient', kind: 'DIFFUSED AMBIENT TEXTURE', color: '#85cbbd', words: 'spacious / diffused / moving / immersive', note: 'a misty canopy + a drifting orbital ribbon', meaning: '层叠的半透明云冠形成宽阔空间，前后穿行的倾斜轨道、圆润中空叶面与带圆心的碗盆，共同呈现柔和漂浮的氛围音色。', params: { height: 100, width: 100, leafCount: 8, orbitAngle: -17, orbitWidth: 127, orbitWeight: 4, hazeOpacity: 38, echoCount: 0, particleCount: 2, seed: 109 } }
  ];
  const PARAMS = [
    ['x', '水平位置', -30, 30, 1, 'px'], ['y', '垂直位置', -24, 24, 1, 'px'], ['width', '整体宽度', 65, 125, 1, '%'], ['height', '整体高度', 70, 110, 1, '%'], ['rotation', '整体旋转', -18, 18, 1, '°'],
    ['organWidth', '花叶宽度', 60, 150, 1, '%'], ['organLength', '花叶长度', 60, 145, 1, '%'], ['organOpacity', '花叶透明度', 0, 100, 1, '%'], ['roundness', '花瓣圆润', 0, 100, 1, '%'],
    ['stemWidth', '枝条线宽', .5, 10, .1, 'px'], ['stemBend', '曲线弯曲', -35, 35, 1, 'px'], ['stemOpacity', '枝条透明度', 0, 100, 1, '%'], ['dash', '虚线长度', 0, 16, .5, 'px'], ['dashGap', '虚线间距', 1, 14, .5, 'px'],
    ['twigCount', '细枝数量', 0, 7, 1, ''], ['tipLength', '花瓣下垂', 0, 100, 1, '%'], ['petalCount', '花瓣数量', 5, 14, 1, ''], ['petalLength', '花冠伸展', 100, 175, 1, 'px'], ['spread', '扇面展开', 70, 155, 1, '°'],
    ['columnCount', '胶囊数量', 2, 6, 1, ''], ['coreRadius', '核心半径', 20, 42, 1, 'px'], ['reedCount', '细芦苇数量', 1, 18, 1, ''], ['mouthOpen', '花口展开', 0, 100, 1, '%'], ['tipRadius', '尖角圆角', 0, 12, .25, 'px'],
    ['funnelCount', '漏斗数量', 1, 3, 1, ''], ['ringScale', '圆环尺寸', 60, 140, 1, '%'], ['ringWeight', '圆环线宽', .3, 2, .1, '×'], ['leafCount', '悬浮叶片数量', 2, 8, 1, ''], ['orbitAngle', '轨道倾角', -60, 15, 1, '°'], ['orbitWidth', '轨道半径', 75, 130, 1, 'px'], ['orbitWeight', '轨道线宽', 1, 10, .5, 'px'], ['fragmentCount', '方片数量', 1, 7, 1, ''], ['cornerRadius', '方片圆角', 0, 18, .5, 'px'],
    ['particleCount', '粒子数量', 0, 200, 1, ''], ['particleSize', '粒子尺寸', .3, 2, .05, '×'], ['particleOpacity', '粒子透明度', 0, 100, 1, '%'], ['scatterWidth', '散布宽度', 60, 120, 1, '%'], ['scatterHeight', '散布高度', 60, 120, 1, '%'], ['squareRatio', '方形粒子比例', 0, 100, 1, '%'],
    ['hazeOpacity', '光雾透明度', 0, 100, 1, '%'], ['echoCount', '叠影数量', 0, 4, 1, ''], ['echoOpacity', '叠影透明度', 0, 30, 1, '%'], ['echoX', '叠影水平位移', -18, 18, 1, 'px'], ['echoY', '叠影垂直位移', -18, 18, 1, 'px'], ['echoScale', '叠影缩放', 88, 103, 1, '%'],
    ['grain', '印刷颗粒强度', 0, 100, 1, '%'], ['grainSize', '颗粒频率', .15, 1.5, .01, ''], ['grainContrast', '颗粒对比', 1, 5, .1, ''], ['grainOctaves', '颗粒细节层数', 1, 4, 1, ''], ['seed', '纹理种子', 1, 99999, 1, ''],
    ['potWidth', '花盆宽度', 65, 140, 1, '%'], ['potHeight', '花盆高度', 65, 125, 1, '%'], ['potX', '花盆水平位置', -20, 20, 1, 'px'], ['potY', '花盆垂直位置', -15, 15, 1, 'px'], ['potOpacity', '花盆透明度', 0, 100, 1, '%']
  ];
  const GROUPS = [
    { name: '构图与比例', en: 'COMPOSITION', keys: ['x', 'y', 'width', 'height', 'rotation'] },
    { name: '花叶形态', en: 'BOTANICAL FORM', keys: ['organWidth', 'organLength', 'organOpacity'] },
    { name: '枝条与线条', en: 'STROKES', keys: ['stemWidth', 'stemBend', 'stemOpacity', 'dash', 'dashGap'] },
    { name: '散布粒子', en: 'PARTICLES', keys: ['particleCount', 'particleSize', 'particleOpacity', 'scatterWidth', 'scatterHeight', 'squareRatio'] },
    { name: '光雾与叠影', en: 'ATMOSPHERE', keys: ['hazeOpacity', 'echoCount', 'echoOpacity', 'echoX', 'echoY', 'echoScale'] },
    { name: '印刷材质', en: 'PRINT TEXTURE', keys: ['grain', 'grainSize', 'grainContrast', 'grainOctaves', 'seed'] },
    { name: '花盆', en: 'POT FAMILY', keys: ['potWidth', 'potHeight', 'potX', 'potY', 'potOpacity'] }
  ];
  const FAMILY_KEYS = [['roundness', 'tipLength', 'twigCount'], ['petalCount', 'petalLength', 'spread', 'roundness'], ['columnCount'], ['reedCount', 'mouthOpen', 'tipRadius'], [], ['funnelCount', 'ringScale', 'ringWeight'], ['leafCount', 'orbitAngle', 'ringScale'], ['fragmentCount', 'cornerRadius'], ['columnCount', 'coreRadius', 'ringWeight'], ['leafCount', 'orbitAngle', 'orbitWidth', 'orbitWeight']];
  const MATERIALS = { body: '花叶主体', soft: '透亮层 / 圆环', stem: '枝条线条', pot: '花盆主体', inside: '花口内部', mist: '外围光雾' };
  const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, Number(n) || 0));
  const round = n => Number(n.toFixed(3));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  function rng(seed) { let n = seed >>> 0; return () => { n += 0x6D2B79F5; let t = Math.imul(n ^ n >>> 15, 1 | n); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function mix(hex, target, amount) {
    const a = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    const b = target.match(/\w\w/g).map(x => parseInt(x, 16));
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0')).join('');
  }
  function palette(color) {
    const radial = (stops, extra = {}) => ({ type: 'radial', cx: 44, cy: 40, fx: 34, fy: 29, r: 69, x1: 0, y1: 0, x2: 100, y2: 100, stops: stops.map(([offset, color, opacity = 1]) => ({ offset, color, opacity })), ...extra });
    return {
      body: radial([[0, mix(color, '#ffffff', .78)], [51, mix(color, '#ffffff', .2)], [100, mix(color, '#69597b', .025)]]),
      soft: radial([[0, mix(color, '#ffffff', .76)], [100, color, .85]], { cx: 45, cy: 35, r: 75 }),
      stem: radial([[0, mix(color, '#ffffff', .46)], [60, color], [100, mix(color, '#69597b', .025)]], { type: 'linear', x2: 100, y2: 0 }),
      pot: radial([[0, mix(color, '#ffffff', .25)], [48, mix(color, '#ffffff', .78)], [100, color]], { type: 'linear', x2: 10, y2: 100 }),
      inside: radial([[0, mix(color, '#ffffff', .2)], [100, mix(color, '#74618e', .25)]]),
      mist: radial([[0, color, .32], [100, color, 0]], { cx: 50, cy: 50, fx: 50, fy: 50, r: 50 })
    };
  }
  function initial(preset) {
    const materials = palette(preset.color);
    if (preset.id === 'dust-bloom') materials.body.stops = [{ offset: 0, color: mix(preset.color, '#ffffff', .42), opacity: 1 }, { offset: 58, color: preset.color, opacity: 1 }, { offset: 100, color: mix(preset.color, '#69597b', .08), opacity: 1 }];
    return { ...BASE, ...preset.params, color: preset.color, linecap: 'round', potType: POTS[PRESETS.indexOf(preset)] || 'round', materials, elements: {} };
  }
  function normalize(input, preset) {
    const p = initial(preset);
    if (!input || typeof input !== 'object') return p;
    for (const [key, , min, max, step] of PARAMS) if (typeof input[key] === 'number' && Number.isFinite(input[key])) p[key] = round(clamp(Math.round(input[key] / step) * step, min, max));
    if (/^#[0-9a-f]{6}$/i.test(input.color)) p.color = input.color;
    if (['round', 'butt', 'square'].includes(input.linecap)) p.linecap = input.linecap;
    if (Object.hasOwn(POT_NAMES, input.potType)) p.potType = input.potType;
    for (const key of Object.keys(MATERIALS)) {
      const m = input.materials?.[key];
      if (!m || !Array.isArray(m.stops) || m.stops.length < 2 || m.stops.length > 8) continue;
      const clean = { ...p.materials[key], type: m.type === 'linear' ? 'linear' : 'radial' };
      for (const k of ['cx', 'cy', 'fx', 'fy', 'x1', 'y1', 'x2', 'y2', 'r']) if (Number.isFinite(m[k])) clean[k] = clamp(m[k], k === 'r' ? 5 : 0, k === 'r' ? 150 : 100);
      clean.stops = m.stops.map((stop, i) => ({ offset: clamp(stop?.offset ?? i * 100 / (m.stops.length - 1)), color: /^#[0-9a-f]{6}$/i.test(stop?.color) ? stop.color : p.color, opacity: clamp(stop?.opacity ?? 1, 0, 1) }));
      p.materials[key] = clean;
    }
    if (input.elements && typeof input.elements === 'object') {
      for (const [key, value] of Object.entries(input.elements).slice(0, 600)) {
        if (!/^(n|pot)\d+$/.test(key) || !value || typeof value !== 'object') continue;
        const el = {};
        for (const [k, lo, hi] of [['x', -150, 150], ['y', -150, 150], ['scaleX', 10, 300], ['scaleY', 10, 300], ['rotation', -180, 180], ['opacity', 0, 100], ['strokeWidth', .1, 30]]) if (Number.isFinite(value[k])) el[k] = clamp(value[k], lo, hi);
        if (value.gradient) el.gradient = normalize({ materials: { body: value.gradient } }, preset).materials.body;
        p.elements[key] = el;
      }
    }
    return p;
  }
  function validateRecipe(data) {
    if (!data || data.type !== 'synth-plant' || ![1, VERSION].includes(data.version) || !Array.isArray(data.plants)) throw new Error('请选择本工作台导出的音色植物配方。');
    const found = new Map(data.plants.map(p => [p.id, p.params]));
    if (data.version === 1) {
      found.set('totem-keys', found.get('iron-root'));
      found.delete('iron-root');
      if (found.has('prism-drift')) found.set('mist-orbit', found.get('prism-drift'));
      return PRESETS.map(p => normalize(found.get(p.id), p));
    }
    if (!PRESETS.every(p => found.has(p.id))) throw new Error('配方需要包含完整的十株植物。');
    return PRESETS.map(p => normalize(found.get(p.id), p));
  }
  function recipe(states, selected = 0) { return { type: 'synth-plant', version: VERSION, revision: 3, selected, plants: PRESETS.map((p, i) => ({ id: p.id, params: normalize(states[i], p) })) }; }

  // Outlined Space Mono lettering keeps exported labels identical without installed fonts.
  function lettering(str, x, y, size = 12, options = {}) {
    const font = root.SynthPlantFonts?.[options.bold ? 'bold' : 'regular'];
    if (!font) return `<text x="${x}" y="${y}" font-family="monospace" font-size="${size}" fill="${options.fill || INK}">${esc(str)}</text>`;
    const scale = size / font.units, tracking = options.tracking || 0;
    const width = [...str].reduce((sum, c) => sum + (font.glyphs[c]?.w || font.units * .6) * scale + tracking, 0);
    let cursor = options.anchor === 'end' ? -width : options.anchor === 'middle' ? -width / 2 : 0;
    const paths = [...str].map(c => {
      const glyph = font.glyphs[c] || font.glyphs['?'];
      const out = glyph.d ? `<path d="${glyph.d}" transform="translate(${round(cursor)} 0) scale(${scale} ${-scale})"/>` : '';
      cursor += glyph.w * scale + tracking;
      return out;
    }).join('');
    return `<g aria-label="${esc(str)}" fill="${options.fill || INK}" transform="translate(${x} ${y})">${paths}</g>`;
  }
  function gradient(id, m) {
    const stops = [...m.stops].sort((a, b) => a.offset - b.offset).map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" stop-opacity="${s.opacity}"/>`).join('');
    if (m.type === 'linear') return `<linearGradient id="${id}" x1="${m.x1}%" y1="${m.y1}%" x2="${m.x2}%" y2="${m.y2}%">${stops}</linearGradient>`;
    return `<radialGradient id="${id}" cx="${m.cx}%" cy="${m.cy}%" fx="${m.fx}%" fy="${m.fy}%" r="${m.r}%">${stops}</radialGradient>`;
  }
  function defs(id, p) {
    return `<defs>${Object.entries(p.materials).map(([key, m]) => gradient(`${id}-${key}`, m)).join('')}${Object.entries(p.elements).filter(([, e]) => e.gradient).map(([key, e]) => gradient(`${id}-element-${key}`, e.gradient)).join('')}
      <filter id="${id}-print" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${p.grainSize}" numOctaves="${p.grainOctaves}" seed="${p.seed}" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="${round(p.grainContrast * .42)}" intercept="${round((1 - p.grainContrast * .42) / 2)}"/><feFuncG type="linear" slope="${round(p.grainContrast * .42)}" intercept="${round((1 - p.grainContrast * .42) / 2)}"/><feFuncB type="linear" slope="${round(p.grainContrast * .42)}" intercept="${round((1 - p.grainContrast * .42) / 2)}"/><feFuncA type="linear" slope="${round(p.grain / 105)}"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    </defs>`;
  }
  function painter(id, p, prefix = 'n') {
    const ref = name => `url(#${id}-${name})`;
    let serial = 0;
    const wrap = (markup, cx, cy, kind, material, organ = false) => {
      const key = prefix + serial++, e = p.elements[key] || {};
      const sx = (e.scaleX ?? 100) / 100 * (organ ? p.organWidth / 100 : 1), sy = (e.scaleY ?? 100) / 100 * (organ ? p.organLength / 100 : 1);
      if (e.gradient) markup = markup.replace(/url\(#[\w-]+\)/g, `url(#${id}-element-${key})`);
      if (e.strokeWidth !== undefined) markup = markup.replace(/stroke-width="[^"]+"/, `stroke-width="${e.strokeWidth}"`);
      return `<g data-node="${key}" data-label="${kind} ${serial}" data-material="${material}" opacity="${round((e.opacity ?? 100) / 100 * (organ ? p.organOpacity / 100 : 1))}" transform="translate(${e.x || 0} ${e.y || 0}) translate(${cx} ${cy}) rotate(${e.rotation || 0}) scale(${round(sx)} ${round(sy)}) translate(${-cx} ${-cy})">${markup}</g>`;
    };
    const pathCenter = d => {
      const pairs = [...d.matchAll(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)].map(m => [Number(m[1]), Number(m[2])]);
      if (!pairs.length) return [160, 180];
      return [round((Math.min(...pairs.map(a => a[0])) + Math.max(...pairs.map(a => a[0]))) / 2), round((Math.min(...pairs.map(a => a[1])) + Math.max(...pairs.map(a => a[1]))) / 2)];
    };
    const materialOf = fill => Object.keys(MATERIALS).find(k => fill === ref(k)) || 'body';
    const path = (d, opts = {}) => wrap(`<path d="${d}" fill="${opts.fill || ref(prefix === 'pot' ? 'pot' : 'body')}"${opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : ''}${opts.transform ? ` transform="${opts.transform}"` : ''}/>`, ...(opts.anchor || pathCenter(d)), '形体', materialOf(opts.fill || ref(prefix === 'pot' ? 'pot' : 'body')), true);
    const ellipse = (cx, cy, rx, ry = rx, opacity = 1, fill = ref('body')) => wrap(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"/>`, cx, cy, '椭圆', materialOf(fill), true);
    const rect = (x, y, w, h, r = 0, opacity = 1) => wrap(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${ref(prefix === 'pot' ? 'pot' : 'body')}" opacity="${opacity}"/>`, x + w / 2, y + h / 2, '方片', prefix === 'pot' ? 'pot' : 'body', true);
    const bend = d => d.replace(/([CQ])([^A-Za-z]+)/g, (all, cmd, args) => {
      const ns = args.trim().split(/[ ,]+/).map(Number);
      for (let i = 0; i < ns.length - 2; i += 2) ns[i] += p.stemBend * Math.sin((282 - ns[i + 1]) / 260 * Math.PI);
      return cmd + ns.map(round).join(' ') + ' ';
    });
    const stem = (d, width = 4, opacity = 1) => wrap(`<path d="${bend(d)}" fill="none" stroke="${ref('stem')}" stroke-width="${round(width * p.stemWidth / 4)}" stroke-linecap="${p.linecap}" stroke-linejoin="round"${p.dash ? ` stroke-dasharray="${p.dash} ${p.dashGap}"` : ''} opacity="${opacity * p.stemOpacity / 100}"/>`, ...pathCenter(d), '枝条', 'stem');
    const ring = (cx, cy, rx, ry, width = 5, opacity = 1, rotate = 0) => wrap(`<ellipse cx="${cx}" cy="${cy}" rx="${round(rx * p.ringScale / 100)}" ry="${round(ry * p.ringScale / 100)}" fill="none" stroke="${ref('soft')}" stroke-width="${width * p.ringWeight}" opacity="${opacity}" transform="rotate(${rotate} ${cx} ${cy})"/>`, cx, cy, '圆环', 'soft');
    const star = (cx, cy, r, opacity = 1) => path(`M${cx} ${cy - r} Q${cx + r * .18} ${cy - r * .18} ${cx + r * .7} ${cy} Q${cx + r * .16} ${cy + r * .15} ${cx} ${cy + r} Q${cx - r * .16} ${cy + r * .16} ${cx - r * .7} ${cy} Q${cx - r * .16} ${cy - r * .16} ${cx} ${cy - r}Z`, { opacity });
    return { ref, path, ellipse, rect, stem, ring, star };
  }
  function pot(c, type, p) {
    let shape = '';
    const rim = (rx, y = 282) => c.ellipse(160, y, rx, 7, .95, c.ref('soft')) + c.ellipse(160, y - 1, rx - 5, 3.6, .48, c.ref('inside'));
    if (type === 'facet') {
      shape = c.path('M129 281 H191 L207 305 L191 332 H129 L113 305Z')
        + c.path('M129 281 L145 303 L129 332 L113 305Z', { fill: c.ref('soft'), opacity: .8 })
        + c.path('M191 281 L175 303 L191 332 L207 305Z', { opacity: .5 })
        + c.path('M160 284 L171 305 L160 328 L149 305Z', { fill: PAPER, opacity: .78 })
        + c.path('M138 286 L144 303 L138 325 L133 305Z M182 286 L187 305 L182 325 L176 303Z', { fill: PAPER, opacity: .45 })
        + c.path('M129 281 H191 L184 287 H136Z', { fill: c.ref('soft'), opacity: .6 });
    } else if (type === 'bonsai') {
      shape = c.rect(87, 281, 146, 14, 5) + c.path('M92 294 H228 V310 Q227 322 214 322 H105 Q93 321 92 310Z')
        + c.rect(102, 320, 20, 13, 4) + c.rect(198, 320, 20, 13, 4)
        + c.path('M97 288 H223 M103 302 H217', { fill: c.ref('soft'), opacity: .55 })
        + c.ellipse(160, 286, 63, 3, .65, c.ref('inside'))
        + c.path('M142 306 Q160 289 178 306 Q160 324 142 306Z', { fill: c.ref('soft'), opacity: .45 })
        + c.ellipse(160, 307, 3.5, 3.5, .7, c.ref('pot'));
    } else if (type === 'bass-tray') {
      shape = c.path('M94 282 H226 L223 310 Q222 321 209 321 H111 Q99 321 97 311Z')
        + c.rect(106, 317, 28, 15, 5) + c.rect(188, 317, 28, 15, 5) + rim(66)
        + [114, 137, 160, 183, 206].map((x, i) => i % 2 ? c.path(`M${x} 299 l4 4 -4 4 -4 -4Z`, { fill: c.ref('inside'), opacity: .48 }) : c.ellipse(x, 303, 4.3, 4.3, .48, c.ref('inside'))).join('');
    } else if (type === 'multi-neck') {
      shape = c.path('M110 292 C121 288 123 280 119 269 H135 C132 286 138 296 146 295 C151 294 153 278 151 261 H169 C167 278 168 295 176 296 C184 296 188 284 185 270 H202 C197 284 206 290 213 297 C224 308 221 330 205 334 H117 C96 330 96 301 110 292Z')
        + c.ellipse(127, 268, 9, 3, 1, c.ref('soft')) + c.ellipse(160, 260, 10, 3, 1, c.ref('soft')) + c.ellipse(194, 269, 10, 3, 1, c.ref('soft'))
        + c.path('M117 320 Q127 304 138 319 Q149 300 160 317 Q174 301 185 319 Q199 306 207 321 L203 328 H119Z', { fill: c.ref('soft'), opacity: .6 });
    } else if (type === 'pedestal') {
      shape = c.path('M91 282 H229 C225 304 204 318 175 320 H146 C119 318 96 304 91 282Z')
        + c.path('M148 316 H172 Q168 325 179 329 Q185 332 181 337 H139 Q135 332 141 329 Q153 325 148 316Z')
        + c.ellipse(160, 337, 34, 5.2, .92, c.ref('pot')) + rim(69)
        + [109, 128, 149, 171, 192, 211].map(x => c.ellipse(x, 298, 4.5, 4.5, .55, c.ref('inside'))).join('');
    } else if (type === 'lotus') {
      shape = c.path('M105 282 H215 C216 307 197 330 174 333 H146 C122 329 104 307 105 282Z')
        + c.path('M143 330 H177 L183 337 H137Z', { fill: c.ref('soft') })
        + [-2, -1, 0, 1, 2].map(i => c.path(`M${160 + i * 18} 328 C${142 + i * 18} 311 ${142 + i * 17} 293 ${154 + i * 17} 292 C${172 + i * 13} 296 ${172 + i * 13} 313 ${160 + i * 18} 328Z`, { fill: c.ref('soft'), opacity: .55 })).join('') + rim(55);
    } else if (type === 'orbit-bowl') {
      shape = c.path('M104 282 H216 C216 315 199 334 171 335 H148 C119 331 104 313 104 282Z') + rim(56)
        + c.ellipse(160, 310, 15, 15, .9, c.ref('soft')) + c.ellipse(160, 310, 9, 9, .65, c.ref('inside'))
        + c.ellipse(160, 310, 5.6, 5.6, 1, PAPER) + c.path('M139 332 H181 L178 337 H142Z', { opacity: .65 });
    } else if (type === 'bowl') {
      shape = c.path('M103 283 H217 C215 313 197 332 162 332 C128 332 108 314 103 283Z') + rim(57)
        + c.ellipse(160, 309, 6.3, 6.3, .8, c.ref('inside')) + c.ellipse(137, 314, 2.3, 2.3, .4, c.ref('inside')) + c.ellipse(183, 314, 2.3, 2.3, .4, c.ref('inside'));
    } else if (type === 'choir') {
      shape = c.path('M115 282 H205 Q218 284 216 299 L208 325 Q205 335 193 335 H127 Q115 335 112 325 L104 299 Q103 285 115 282Z')
        + [135, 152, 169, 186].map(x => `<path d="M${x} 300 v19" fill="none" stroke="${PAPER}" stroke-linecap="round" stroke-width="5.5" opacity=".8"/>`).join('') + rim(55);
    } else if (type === 'block') {
      shape = c.rect(104, 281, 112, 43, 6) + c.path('M111 324 H209 L204 337 H116Z') + [133, 158, 183].map(x => `<rect x="${x}" y="299" width="11" height="12" rx="1" fill="${PAPER}" opacity=".7"/>`).join('');
    } else shape = c.path('M116 282 H203 Q216 284 216 299 L207 326 Q204 337 193 337 H126 Q115 337 111 326 L104 299 Q104 284 116 282Z');
    return `<g data-part="pot" opacity="${p.potOpacity / 100}" transform="translate(${160 + p.potX} ${282 + p.potY}) scale(${p.potWidth / 100} ${p.potHeight / 100}) translate(-160 -282)">${shape}</g>`;
  }

  function glass(c, p) {
    let s = '';
    // Shared flower anchors keep each arch and calyx joined exactly.
    const bell = (x, y, w, h, angle = 0) => {
      const drop = p.tipLength * .05, roundness = p.roundness * .035;
      return `<g transform="translate(${x} ${y}) rotate(${angle})">${c.path(`M-4 1 C${-w * .48} ${2 + roundness} ${-w * .34} ${h * .67} ${-w * .92} ${h * .84} C${-w * .65} ${h * 1.02} ${-w * .3} ${h * .99} 0 ${h * .86 + drop} C${w * .3} ${h * .99} ${w * .65} ${h * 1.02} ${w * .92} ${h * .84} C${w * .34} ${h * .67} ${w * .48} ${2 + roundness} 4 1 Q0 -3 -4 1Z`, { anchor: [0, 0] })}${c.path(`M-2 ${h * .8} C-2 ${h * .96} -9 ${h * 1.03} -5 ${h * 1.12} Q0 ${h * 1.25} 5 ${h * 1.12} C9 ${h * 1.03} 2 ${h * .96} 2 ${h * .8}Z`, { opacity: .85, anchor: [0, 0] })}${c.ellipse(0, 0, 3.8, 5)}</g>`;
    };
    s += c.stem('M157 284 C151 235 143 165 101 159 C78 156 74 169 73 187', 3.8);
    s += c.stem('M167 284 C160 204 166 77 198 78 C216 77 220 92 217 108', 4);
    s += c.stem('M148 284 C136 240 116 223 101 243 C95 250 96 257 96 261', 3.1);
    s += c.stem('M174 284 C184 236 213 207 229 230 C237 241 234 251 232 259', 3.1);
    s += c.stem('M160 284 C152 203 132 130 113 123', 3.2) + c.ellipse(113, 123, 9, 10);
    s += c.stem('M178 284 C184 261 193 242 200 237', 3.1) + c.ellipse(200, 237, 4.5);
    s += bell(217, 108, 37, 66, 12) + bell(73, 187, 24, 48, -8);
    s += c.path('M96 258 C95 270 86 272 89 282 Q95 292 103 281 C106 273 99 269 99 258Z', { anchor: [96, 258] });
    s += c.ellipse(232, 263, 7, 8) + c.ellipse(231, 281, 3.5, 4.5);
    s += c.star(129, 92, 23) + c.star(177, 183, 20) + c.star(258, 156, 14) + c.star(239, 212, 9);
    s += c.ellipse(154, 88, 8, 9, .85) + c.ellipse(84, 155, 4) + c.ellipse(246, 236, 4.2);
    for (let i = 0; i < p.twigCount; i++) {
      const x = 143 + i * 12, y = 239 - i * 12;
      s += c.stem(`M${151 + i * 8} 284 Q${x - 8} ${y + 7} ${x} ${y}`, 2.4, .75) + c.ellipse(x, y, 3.2, 4.5, .8);
    }
    return s;
  }

  function pad(c, p) {
    let s = '';
    const vertical = p.petalLength / 148, spread = p.spread / 126, roundness = .85 + p.roundness * .003;
    const petal = (x, y, w, h, angle, alpha) => {
      h *= vertical;
      return `<g transform="translate(${round(160 + (x - 160) * spread)} ${y}) rotate(${angle})">${c.path(`M0 0 C${-w * .2} ${-h * .22} ${-w * 1.12} ${-h * .4} ${-w} ${-h * .7} C${-w * .92} ${-h * roundness} ${w * .92} ${-h * roundness} ${w} ${-h * .7} C${w * 1.12} ${-h * .4} ${w * .2} ${-h * .22} 0 0Z`, { opacity: alpha, anchor: [0, 0] })}</g>`;
    };
    s += c.stem('M160 284 C158 245 160 206 160 173', 4);
    s += petal(160, 248, 41, 197, 0, .32);
    const pairs = [[144, 250, 43, 171, -16, .4], [128, 251, 43, 139, -31, .55], [114, 253, 39, 102, -48, .68], [146, 266, 40, 121, -23, .84], [139, 274, 37, 85, -41, .94], [151, 278, 30, 69, -21, .98]];
    const count = Math.min(pairs.length, Math.max(2, Math.floor((p.petalCount - 1) / 2)));
    pairs.slice(0, count).forEach(([x, y, w, h, a, opacity]) => {
      s += c.stem(`M155 284 C149 254 ${x} ${y - 5} ${x} ${y - 20}`, 2.7, .7) + c.stem(`M165 284 C171 254 ${320 - x} ${y - 5} ${320 - x} ${y - 20}`, 2.7, .7);
      s += petal(x, y, w, h, a, opacity) + petal(320 - x, y, w, h, -a, opacity);
    });
    s += petal(160, 280, 39, 81, 0, .96);
    s += c.stem('M145 284 C132 257 107 255 92 264', 3.4) + c.ellipse(91, 264, 7.5, 6.2, .8);
    s += c.stem('M175 284 C188 257 213 255 228 264', 3.4) + c.ellipse(229, 264, 7.5, 6.2, .8);
    return s;
  }
  function columns(c, p) {
    let s = '';
    const heads = [[166, 66, 30, 151, 25], [107, 121, 42, 143, 22], [218, 110, 24, 184, 20], [155, 161, 19, 163, 18], [205, 208, 24, 189, 17], [66, 202, 22, 126, 16]];
    heads.slice(0, p.columnCount).forEach(([x, y, r, base, w], i) => {
      s += c.path(`M${base - w / 2} 284 C${base - w / 2} 230 ${x - w / 2} ${y + 49} ${x - w / 2} ${y} H${x + w / 2} C${x + w / 2} ${y + 57} ${base + w / 2} 230 ${base + w / 2} 284Z`, { fill: c.ref('stem'), opacity: .92, anchor: [base, 284] });
      s += c.path(`M${x - r} ${y - 1} V${y + 12} Q${x} ${y + 24} ${x + r} ${y + 12} V${y - 1}Z`, { opacity: .85 });
      s += c.ellipse(x, y - 2, r, r * .29, .95) + c.ellipse(x - r * .15, y - 3, r * .68, r * .16, .3, c.ref('soft'));
    });
    return s + c.ellipse(69, 246, 6.5) + c.ellipse(53, 235, 4.5) + c.ellipse(244, 231, 13) + c.stem('M244 231 V252', 2.8) + c.ellipse(244, 255, 4) + c.ellipse(251, 165, 4) + c.ellipse(247, 187, 4.4);
  }

  function totem(c, p) {
    let s = '', sw = 7;
    const columns = [[63, 175, 35, 89], [99, 171, 36, 64], [115, 69, 37, 83], [157, 42, 33, 112], [194, 144, 42, 87], [230, 123, 33, 115]];
    s += c.stem('M147 285 C140 234 96 256 84 218', sw);
    s += c.stem('M155 285 C160 247 125 234 119 205', sw);
    s += c.stem('M174 285 C178 246 218 251 214 204', sw);
    s += c.stem('M166 285 C166 258 170 242 170 236', sw);
    s += c.stem('M170 174 L174 151', 5);
    s += c.stem('M142 205 C130 207 125 228 137 247', 4);
    s += c.stem('M197 205 C213 205 219 223 205 247', 4);
    s += columns.slice(0, p.columnCount).map(([x, y, w, h], i) => c.rect(x, y, w, h, w / 2, .75 + (i % 2) * .18)).join('');
    s += c.ellipse(170, 205, p.coreRadius, 32);
    s += c.ring(170, 205, 24, 24, 5, .95) + c.ellipse(170, 205, 14, 14, 1, c.ref('inside')) + c.ellipse(170, 205, 8.5, 8.5, 1, PAPER);
    s += c.stem('M143 285 C131 247 100 244 96 295', 6) + c.ellipse(96, 299, 8);
    s += c.stem('M186 285 C201 245 231 249 230 292', 6) + c.ellipse(230, 299, 8);
    s += c.stem('M130 285 C113 262 114 271 113 307', 3) + c.ellipse(113, 309, 4);
    s += c.stem('M195 285 C217 271 215 296 219 308', 3) + c.ellipse(220, 312, 5);
    if (p.columnCount > 4) s += c.rect(96, 119, 13, 39, 7, .45) + c.rect(204, 82, 16, 41, 8, .6);
    return s + c.ellipse(93, 160, 11) + c.ellipse(93, 133, 6) + c.ellipse(217, 111, 13);
  }
  function lead(c, p) {
    let s = '', r = p.tipRadius, opening = (p.mouthOpen - 22) * .08;
    const rounded = (points, radius) => {
      const offsets = points.map((v, i) => {
        const prev = points[(i - 1 + points.length) % points.length], next = points[(i + 1) % points.length];
        const a = Math.hypot(prev[0] - v[0], prev[1] - v[1]), b = Math.hypot(next[0] - v[0], next[1] - v[1]);
        const d = Math.min(radius, a * .4, b * .4);
        return [[v[0] + (prev[0] - v[0]) * d / a, v[1] + (prev[1] - v[1]) * d / a], [v[0] + (next[0] - v[0]) * d / b, v[1] + (next[1] - v[1]) * d / b]];
      });
      return `M${offsets[0][0].join(' ')} ` + points.map((v, i) => `${i ? 'L' + offsets[i][0].join(' ') : ''} Q${v.join(' ')} ${offsets[i][1].join(' ')}`).join(' ') + 'Z';
    };
    const star = (x, y, size) => c.path(rounded([[x, y-size], [x+size*.18, y-size*.18], [x+size*.72, y], [x+size*.18, y+size*.18], [x, y+size], [x-size*.18, y+size*.18], [x-size*.72, y], [x-size*.18, y-size*.18]], r * .5), { opacity: .88 });
    // Preserve the three original flared silhouettes and their root-to-leaf anchors.
    s += c.stem('M154 284 C149 238 132 198 122 166', 3.7);
    s += c.stem('M146 284 C136 268 126 253 120 244', 3.6);
    s += c.stem('M171 284 C171 264 174 251 177 235', 3.8);
    s += c.path(`M120 174 C112 124 99 100 ${61+r} ${82+r*.18} Q59 81 ${63+r*.25} ${80-r*.1} Q95 ${67-opening} ${136-r} ${63-opening} Q139 ${62-opening} ${137-r*.3} ${65+r-opening} C117 94 120 130 125 173 Q123 177 120 174Z`, { anchor: [122, 166] });
    s += c.path(`M119 247 C102 223 73 209 ${42+r*.18} 218 Q39 220 ${41+r*.1} ${216-r*.5} C50 188 73 165 ${87-r*.25} ${154+r*.4} Q89 152 ${88-r*.2} ${156+r*.6} C79 191 105 220 123 244 Q125 249 119 247Z`, { anchor: [120, 244] });
    s += c.path(`M174 242 C180 202 194 166 ${177+r*.5} ${146+r*.3} Q175 143 ${179+r*.25} ${145+r*.15} Q218 ${151-opening} ${249-r} ${174+opening} Q253 ${177+opening} ${247-r*.2} ${176+opening} C218 172 189 209 179 242 Q177 246 174 242Z`, { anchor: [177, 235] });
    const reeds = [[164,104,159,219,4.5,10], [178,76,164,184,3.2,9], [194,35,172,170,4.4,9], [221,84,177,170,3.3,6], [243,76,186,188,3.2,5], [272,125,198,214,3.2,5], [255,195,206,230,5.5,6], [224,223,193,251,3.4,5], [143,148,148,211,3.4,6], [137,202,144,245,3.5,5], [188,154,172,216,2.8,5], [201,241,178,267,3.6,5], [236,148,185,215,3,5], [113,215,138,255,3,4], [207,112,171,201,3,5], [262,163,196,229,3,4], [155,183,156,237,2.8,5], [231,261,184,280,3,4]];
    reeds.slice(0, p.reedCount).forEach(([x,y,cx,cy,rx,ry],i) => {
      s += c.stem(`M${151+i%5*6} 284 C${cx-7} ${cy+16} ${cx} ${cy} ${x} ${y}`, 2.3 + i%3*.35, .7 + i%3*.1) + c.ellipse(x,y,rx,ry,.9);
    });
    s += star(246,108,18) + star(271,231,8) + star(217,61,6) + star(65,143,5) + star(212,224,6);
    return s + c.ellipse(111,185,5) + c.ellipse(82,239,4.5) + c.ellipse(237,263,3.5);
  }

  function dust(c, p) {
    let s = '', rand = rng(p.seed);
    const anchors = [[144, 92, 21, 'rect', .96], [185, 132, 20, 'circle', .72], [105, 185, 19, 'circle', .96], [209, 192, 20, 'rect', .87], [83, 223, 13, 'rect', .69], [174, 232, 14, 'circle', .84], [231, 117, 11, 'circle', .93]];
    anchors.forEach(([x, y], i) => { s += c.stem(`M${148 + i * 4} 284 C${142 + i * 6} 241 ${x} ${y + 34} ${x} ${y}`, i % 2 ? 3.3 : 4.2, .8); });
    s += c.stem('M182 132 Q208 94 231 117', 2.6, .65);
    const n = p.particleCount;
    for (let i = 0; i < n; i++) {
      const angle = i * 2.39996 + rand() * .36, radius = .45 + Math.sqrt(rand()) * .55;
      const x = 160 + Math.cos(angle) * 108 * radius * p.scatterWidth / 100;
      const y = 170 + Math.sin(angle) * 100 * radius * p.scatterHeight / 100;
      const size = (i % 13 === 0 ? 8 + rand() * 3 : 2 + rand() * 4.5) * p.particleSize;
      const opacity = [.2, .38, .72, .97, .88][i % 5] * p.particleOpacity / 100;
      if (rand() * 100 > p.squareRatio) s += c.ellipse(round(x), round(y), round(size), round(size), round(opacity));
      else s += `<g transform="rotate(${i % 5 === 0 ? 45 : 0} ${round(x)} ${round(y)})">${c.rect(round(x - size), round(y - size), round(size * 2), round(size * 2), 2, round(opacity))}</g>`;
    }
    anchors.forEach(([x, y, r, kind, opacity]) => {
      if (kind === 'circle') s += c.ellipse(x, y, r, r, opacity);
      else s += c.path(`M${x - r * .55} ${y - r} H${x + r * .55} L${x + r} ${y - r * .55} V${y + r * .55} L${x + r * .55} ${y + r} H${x - r * .55} L${x - r} ${y + r * .55} V${y - r * .55}Z`, { opacity });
    });
    s += c.rect(155, 156, 19, 19, 3, .5) + c.rect(117, 119, 14, 14, 3, .78) + c.ellipse(228, 240, 8, 8, .9);
    return s;
  }

  function choir(c, p) {
    let s = '';
    const funnel = (x, y, size, target) => c.path(`M${x - size} ${y} C${x - size * .35} ${y + 28} ${target - 9} 222 ${target - 4} 282 H${target + 4} C${target + 5} 226 ${x + size * .3} ${y + 27} ${x + size} ${y}Z`, { opacity: .94, anchor: [target, 282] })
      + c.ellipse(x, y, size, size * .29, .94, c.ref('soft')) + c.ellipse(x, y - .5, size * .74, size * .17, .8, c.ref('inside'));
    s += c.stem('M160 282 C159 226 164 161 160 116', 3.3) + c.ellipse(160, 94, 21, 30);
    s += c.ring(160, 57, 36, 12.2, 4.8, .64) + c.ring(160, 57, 25, 8.4, 1.8, .82);
    s += c.ring(107, 131, 43, 14.5, 8, .24) + c.ring(213, 131, 43, 14.5, 8, .24);
    if (p.funnelCount > 1) s += funnel(111, 156, 31, 148);
    if (p.funnelCount > 2) s += funnel(209, 156, 31, 174);
    s += funnel(160, 216, 25, 161);
    s += c.stem('M143 282 C128 240 111 220 87 205', 3.3) + c.ellipse(86, 205, 15, 16);
    s += c.stem('M182 282 C201 242 218 232 235 225', 3.3) + c.ellipse(237, 225, 13, 14);
    s += c.ellipse(103, 111, 7.5) + c.ellipse(224, 107, 10) + c.ellipse(88, 246, 6.5) + c.ellipse(228, 265, 5.5);
    return s;
  }
  function cymbals(c, p) {
    let s = '';
    const discs = [[103, 171, 53, 17, -16, 151], [191, 107, 53, 15, 21, 169], [229, 200, 44, 14, 24, 183], [80, 236, 13, 7, -17, 135], [155, 216, 12, 7, 4, 159]];
    discs.slice(0, Math.min(5, p.leafCount)).forEach(([x, y, rx, ry, angle, base], i) => {
      s += c.stem(`M${base} 284 C${base} 251 ${x + (i % 2 ? -5 : 7)} ${y + 26} ${x} ${y}`, i < 3 ? 4.2 : 2.8);
      const tilt = angle + (p.orbitAngle + 27) * .3;
      s += `<g transform="rotate(${tilt} ${x} ${y})">${c.ellipse(x, y, rx * p.ringScale / 100, ry, .94)}${c.ellipse(x, y, rx * .79, ry * .72, .23, c.ref('soft'))}${c.path(`M${x - 5} ${y + 2} Q${x - 7} ${y - 16} ${x} ${y - 19} Q${x + 7} ${y - 16} ${x + 5} ${y + 2} Q${x} ${y + 6} ${x - 5} ${y + 2}Z`, { opacity: .88 })}</g>`;
    });
    for (const [x, y, r, base] of [[79, 257, 10, 143], [224, 250, 9, 184], [242, 227, 7, 189], [133, 236, 7, 151]]) {
      s += c.stem(`M${base} 284 Q${base + (x - base) * .2} ${y - 2} ${x} ${y}`, 2.7) + c.ellipse(x, y, r);
    }
    return s + c.ellipse(211, 158, 5) + c.ellipse(227, 147, 3.5) + c.ellipse(64, 216, 3) + c.path('M116 279 Q104 269 91 273 Q101 285 116 279Z') + c.path('M200 279 Q216 264 231 270 Q219 285 200 279Z');
  }

  function ambient(c, p) {
    let s = '';
    // Rear half is drawn before the canopy, front half after it.
    const a = p.orbitAngle * Math.PI / 180, rx = p.orbitWidth, ry = 24;
    const pt = t => [round(160 + rx * Math.cos(t) * Math.cos(a) - ry * Math.sin(t) * Math.sin(a)), round(169 + rx * Math.cos(t) * Math.sin(a) + ry * Math.sin(t) * Math.cos(a))];
    const left = pt(Math.PI), right = pt(0);
    s += c.stem(`M${left.join(' ')} A${rx} ${ry} ${p.orbitAngle} 0 1 ${right.join(' ')}`, p.orbitWeight, .35);
    const canopy = [[117, 124, 35, 30, .34], [154, 89, 35, 35, .4], [199, 91, 33, 36, .48], [220, 137, 43, 34, .4], [104, 169, 39, 29, .47], [163, 132, 42, 37, .68], [202, 175, 40, 33, .48], [241, 190, 27, 30, .3]];
    canopy.slice(0, p.leafCount).forEach(([x, y, w, h, alpha], i) => { s += c.ellipse(x, y, w, h, alpha, i % 3 ? c.ref('body') : c.ref('soft')); });
    s += c.stem('M154 284 C152 227 133 198 129 176', 3.8) + c.stem('M163 284 C163 215 180 186 188 165', 3.8) + c.stem('M173 284 C180 241 212 218 226 211', 3.2);
    s += c.path('M150 270 C145 229 119 215 113 190 C108 171 118 155 135 157 C155 160 158 178 151 188 C145 198 137 192 133 184 C127 180 124 184 127 192 C137 211 156 231 158 268Z', { opacity: .9 });
    s += c.ellipse(188, 165, 8.5, 9, .8) + c.ellipse(226, 211, 9, 10, .66);
    s += c.stem(`M${right.join(' ')} A${rx} ${ry} ${p.orbitAngle} 0 1 ${left.join(' ')}`, p.orbitWeight, .8);
    s += c.ellipse(79, 254, 12, 12, .78) + c.ellipse(237, 248, 8, 9, .7) + c.ellipse(252, 95, 11, 12, .73);
    s += c.path('M148 282 Q130 260 113 268 Q116 280 148 282Z', { opacity: .82 }) + c.path('M175 282 Q192 258 208 269 Q203 284 175 282Z', { opacity: .8 });
    return s;
  }

  function fragments(c, p) {
    let s = '';
    const squares = [[89, 190, 49, 48, 4], [136, 109, 36, 39, 3], [173, 59, 34, 35, 4], [176, 163, 38, 41, 3], [221, 115, 33, 34, 4], [210, 225, 31, 30, 3], [145, 239, 23, 22, 2]];
    s += c.stem('M150 285 C137 255 108 263 112 228', 5) + c.stem('M162 285 L155 146', 4);
    s += c.stem('M178 285 V94', 4) + c.stem('M187 285 L238 150', 3);
    s += c.stem('M171 285 L191 202', 4) + c.stem('M184 285 C195 254 215 264 225 245', 4);
    s += squares.slice(0, p.fragmentCount).map(([x, y, w, h, r], i) => c.rect(x, y, w, h, p.cornerRadius, .82 + (i % 2) * .14)).join('');
    s += c.stem('M159 285 Q132 268 100 250', 3) + c.path('M100 250 Q74 252 70 230 Q97 224 103 244Z');
    s += c.stem('M196 218 Q225 186 254 173', 3) + c.path('M239 188 Q245 156 274 159 Q271 184 239 188Z');
    s += c.stem('M194 285 Q210 258 234 265', 3) + c.path('M234 265 Q242 252 253 259 Q248 280 234 265Z');
    s += c.ellipse(118, 166, 6) + c.ellipse(201, 120, 6) + c.ellipse(263, 209, 6) + c.ellipse(108, 267, 5);
    if (p.fragmentCount > 5) s += c.rect(131, 74, 13, 15, 2, .65) + c.rect(222, 190, 17, 19, 2, .65);
    return s;
  }
  const DRAW = [glass, pad, columns, lead, dust, choir, cymbals, fragments, totem, ambient];
  const POTS = ['facet', 'bowl', 'bass-tray', 'choir', 'bonsai', 'multi-neck', 'pedestal', 'bonsai', 'lotus', 'orbit-bowl'];
  const POT_NAMES = { facet: '晶面镂空盆', bowl: '花心浅碗', 'bass-tray': '宽足根盆', choir: '圆润竖槽盆', bonsai: '浮雕盆景托盘', 'multi-neck': '三颈共鸣瓶', pedestal: '高足饰孔钵', lotus: '莲瓣碗', 'orbit-bowl': '圆心轨道碗', round: '圆润盆', block: '方孔盆' };
  function glyphs(type, x = 281, y = 224) {
    const wave = '<path d="M0 0 C5 0 5 -13 10 -13 S14 13 19 8 S23 -4 28 -4"/>';
    const rings = '<circle cx="8" cy="0" r="8"/><circle cx="19" cy="0" r="8"/><circle cx="30" cy="0" r="8"/>';
    const sliders = '<path d="M3 -12 V12 M13 -12 V12 M23 -12 V12"/><circle cx="3" cy="2" r="2.8" fill="currentColor"/><circle cx="13" cy="-5" r="2.8" fill="currentColor"/><circle cx="23" cy="5" r="2.8" fill="currentColor"/>';
    const dots = Array.from({ length: 9 }, (_, i) => `<circle cx="${(i % 3) * 8}" cy="${Math.floor(i / 3) * 8 - 8}" r="1.8" fill="currentColor" stroke="none"/>`).join('');
    const step = '<path d="M0 10 H8 V3 H17 V-5 H27 V-12"/>';
    const sets = [[wave, '<circle cx="15" cy="0" r="9"/><path d="M9 -7 L15 0 L21 -7"/>', '<path d="M8 -11 V10 M22 -12 L15 11"/>'], [wave, rings, '<path d="M0 -6 H21 L32 10"/>'], [rings, wave, sliders], [wave, sliders, '<path d="M0 0 L5 -11 L10 12 L15 -7 L21 9 L28 -2"/>'], [dots, '<path d="M2 8 V0 M8 8 V-8 M14 8 V-13 M20 8 V-4 M26 8 V-10"/>', '<rect x="0" y="-12" width="26" height="25" rx="2"/>' + dots], [wave, rings, sliders], [rings, wave, sliders], ['<path d="M0 -9 H7 V-2 H0Z M11 -9 H18 V-2 H11Z M22 -9 H29 V-2 H22Z M0 3 H7 V10 H0Z M11 3 H18 V10 H11Z M22 3 H29 V10 H22Z"/>', step, sliders]];
    return `<g transform="translate(${x} ${y})" fill="none" stroke="${SOFT}" color="${SOFT}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${(type === 8 ? sets[2] : type === 9 ? sets[6] : type === 6 ? [rings, wave, sliders] : sets[type]).map((g, i) => `<g transform="translate(0 ${i * 35})">${g}</g>`).join('')}</g>`;
  }
  function scene(index, input, id, decorations = true) {
    const preset = PRESETS[index], p = normalize(input, preset), c = painter(id, p);
    const shape = DRAW[index](c, p), rand = rng(p.seed + 918);
    let s = defs(id, p);
    if (decorations) s += lettering(String(index + 1).padStart(2, '0'), 9, 69, 17, { fill: SOFT }) + [94, 108, 122].map((cy, i) => `<circle cx="15" cy="${cy}" r="3" fill="${SOFT}" opacity="${.8 - i * .21}"/>`).join('') + glyphs(index);
    s += `<g data-part="plant" transform="translate(${160 + p.x} ${282 + p.y}) rotate(${p.rotation}) scale(${p.width / 100} ${p.height / 100}) translate(-160 -282)">`;
    s += `<g data-part="atmosphere" pointer-events="none" opacity="${round(p.hazeOpacity / 100)}">${c.ellipse(160, 173, 132, 115, .85, c.ref('mist'))}${c.ellipse(104, 142, 56, 44, .48, c.ref('mist'))}${c.ellipse(218, 163, 55, 58, .48, c.ref('mist'))}</g>`;
    if (p.echoCount > 0) {
      // Each echo is the same source silhouette, with a weaker and offset recurrence.
      for (let i = p.echoCount; i >= 1; i--) s += `<g data-part="echo" pointer-events="none" opacity="${round(p.echoOpacity / 100 * Math.pow(.62, i - 1))}" transform="translate(${i * p.echoX} ${i * p.echoY}) translate(160 170) scale(${round(Math.pow(p.echoScale / 100, i))}) translate(-160 -170)">${shape}</g>`;
    }
    s += `<g filter="url(#${id}-print)">${shape}`;
    if (index !== 4) {
      for (let i = 0; i < p.particleCount; i++) {
        const a = rand() * Math.PI * 2, r = .8 + rand() * .2;
        const x = round(160 + Math.cos(a) * 108 * r * p.scatterWidth / 100), y = round(163 + Math.sin(a) * 106 * r * p.scatterHeight / 100), size = round((1.4 + rand() * 2.5) * p.particleSize), opacity = round((.25 + rand() * .45) * p.particleOpacity / 100);
        s += rand() * 100 < p.squareRatio ? c.rect(x - size, y - size, size * 2, size * 2, .4, opacity) : c.ellipse(x, y, size, size, opacity);
      }
    }
    s += '</g></g>';
    const pc = painter(id, { ...p, organWidth: 100, organLength: 100, organOpacity: 100 }, 'pot');
    s += `<g filter="url(#${id}-print)">${pot(pc, p.potType, p)}</g>`;
    return s;
  }
  function renderPot(type, color = '#b5a1ce', id = 'standalone-pot') {
    const p = { ...initial(PRESETS[0]), color, materials: palette(color), potType: type };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="80 255 160 90">${defs(id, p)}${pot(painter(id, p, 'pot'), type, p)}</svg>`;
  }
  function renderPlant(index, state, options = {}) {
    const id = options.id || `plant-${index}`;
    const preset = PRESETS[index];
    const label = `${preset.name} — ${preset.words}`;
    const background = options.background ? `<rect width="320" height="350" fill="${PAPER}"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="700" viewBox="0 0 320 350" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${esc(label)}</title>${background}${scene(index, state, id, options.decorations !== false)}</svg>`;
  }
  function plantDocument(index, state, options = {}) {
    if (!options.labels) return '<?xml version="1.0" encoding="UTF-8"?>\n' + renderPlant(index, state, { ...options, id: 'export-plant' });
    const p = PRESETS[index], id = 'export-plant';
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 360 450" role="img"><title>${esc(p.name)}</title>${options.background ? `<rect width="360" height="450" fill="${PAPER}"/>` : ''}<g transform="translate(20 0)">${scene(index, state, id, options.decorations !== false)}</g>${lettering(p.name, 24, 385, 20)}${lettering(p.words, 24, 407, 9.5, { fill: SOFT })}${lettering(p.note, 24, 427, 8.1, { fill: SOFT })}</svg>`;
  }
  function logicStrip(x = 20, y = 0, width = 1400) {
    let s = `<g transform="translate(${x} ${y})"><rect width="${width}" height="136" rx="10" fill="none" stroke="#e1daed"/>`;
    s += lettering('POT FAMILIES', 20, 25, 11, { tracking: 3 });
    const families = [['bonsai', 'Bonsai Tray'], ['multi-neck', 'Multi-Neck Vase'], ['pedestal', 'Pedestal Urn'], ['lotus', 'Lotus Bowl'], ['facet', 'Facet Pot']];
    families.forEach(([type, label], i) => {
      const p = initial(PRESETS[8]), id = `legend-pot-${i}`, c = painter(id, p, 'pot');
      s += defs(id, p) + `<g transform="translate(${90 + i * 144} 72) scale(.69) translate(-160 -305)" filter="url(#${id}-print)">${pot(c, type, p)}</g>`;
      s += lettering(label, 90 + i * 144, 113, 10, { anchor: 'middle', fill: SOFT });
    });
    s += '<path d="M756 17 V119" stroke="#e1daed"/>' + lettering('DESIGN LOGIC', 784, 26, 11, { tracking: 3 });
    s += `<g fill="#b4a0dc" opacity=".85"><ellipse cx="828" cy="68" rx="9" ry="17"/><ellipse cx="808" cy="77" rx="8" ry="13" transform="rotate(-35 808 77)"/><ellipse cx="848" cy="77" rx="8" ry="13" transform="rotate(35 848 77)"/></g><path d="M808 77 L828 95 L848 77 M828 95 V79" fill="none" stroke="#a18ad1" stroke-width="2"/>`;
    s += lettering('+', 894, 82, 23, { fill: SOFT }) + lettering('~', 970, 83, 39, { fill: SOFT });
    s += lettering('+', 1050, 82, 23, { fill: SOFT });
    s += glyphs(5, 1130, 74).replace(/translate\(0 35\)/g, 'translate(40 0)').replace(/translate\(0 70\)/g, 'translate(80 0)');
    s += lettering('timbre character', 827, 115, 9, { anchor: 'middle', fill: SOFT });
    s += lettering('inner structure', 989, 115, 9, { anchor: 'middle', fill: SOFT });
    s += lettering('musical symbols', 1172, 115, 9, { anchor: 'middle', fill: SOFT });
    return s + '</g>';
  }
  function renderAtlas(states, options = {}) {
    let s = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1110" viewBox="0 0 1800 1110" role="img"><title>synth-plant — ten timbre specimens</title>`;
    if (options.background !== false) s += `<rect width="1800" height="1110" fill="${PAPER}"/>`;
    s += lettering('synth-plant', 37, 62, 47, { bold: true }) + '<path d="M397 28 V65" stroke="#d6cdeb" stroke-width="1.5"/>';
    s += lettering('SOUND GROWS HERE', 420, 39, 10, { fill: SOFT, tracking: 2 }) + lettering('A PLANT-BASED TIMBRE SYSTEM', 420, 56, 8, { fill: SOFT, tracking: 1.5 });
    s += lettering('10 TIMBRE SPECIMENS', 1761, 40, 10, { anchor: 'end', fill: SOFT, tracking: 2 }) + lettering('v0.2 / FORM STUDIES', 1761, 58, 9, { anchor: 'end', fill: SOFT, tracking: 1 });
    PRESETS.forEach((p, i) => {
      const x = 30 + (i % 5) * 354, y = 82 + Math.floor(i / 5) * 440;
      s += `<g transform="translate(${x} ${y})"><g transform="scale(1.02)">${scene(i, states[i], `atlas-${i}`)}</g>${lettering(p.name, 9, 365, 18)}${lettering(p.words, 10, 390, 10.4, { fill: SOFT })}${lettering(p.note, 10, 411, 9, { fill: SOFT })}</g>`;
    });
    s += '<g transform="translate(180 0)">' + logicStrip(20, 955) + '</g></svg>';
    return s;
  }
  root.SynthPlant = { VERSION, PAPER, INK, SOFT, PRESETS, PARAMS, GROUPS, FAMILY_KEYS, MATERIALS, POT_NAMES, palette, gradient, initial, normalize, recipe, validateRecipe, renderPot, renderPlant, plantDocument, renderAtlas, logicStrip, lettering, esc };
})(typeof window !== 'undefined' ? window : globalThis);
