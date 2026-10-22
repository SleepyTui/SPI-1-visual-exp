(function () {
  'use strict';
  const S = window.SynthPlant;
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const STORAGE = 'synth-plant-visual-v2';
  const meta = new Map(S.PARAMS.map(p => [p[0], p]));
  let states = S.PRESETS.map(S.initial), selected = 0, selectedNode = null, nodeMaterial = 'body';
  let target = 'body', selectedStop = 0, history = [], historyIndex = -1, frame = 0, saveTimer = 0, toastTimer = 0, drag = null;
  let symbols = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (saved) { states = S.validateRecipe(saved); if ((saved.revision || 0) < 3) { localStorage.setItem(STORAGE + '-before-reed-update', JSON.stringify(saved)); states[3] = S.initial(S.PRESETS[3]); } selected = Math.max(0, Math.min(S.PRESETS.length - 1, Math.trunc(Number(saved.selected) || 0))); }
  } catch { /* A corrupt or unavailable browser store must not prevent drawing. */ }
  const current = () => states[selected];
  const snapshot = () => JSON.stringify(S.recipe(states, selected));
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800); }
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE, snapshot()); $('save-status').textContent = '已保存在此浏览器'; }
      catch { $('save-status').textContent = '请保存配方以保留修改'; }
    }, 250);
  }
  function commit() {
    const next = snapshot();
    if (next === history[historyIndex]) return;
    history = history.slice(0, historyIndex + 1); history.push(next);
    if (history.length > 70) history.shift();
    historyIndex = history.length - 1;
    updateHistory(); persist();
  }
  function updateHistory() { $('undo').disabled = historyIndex <= 0; $('redo').disabled = historyIndex >= history.length - 1; }
  function timeTravel(delta) {
    commit();
    const index = historyIndex + delta;
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    const data = JSON.parse(history[index]); states = S.validateRecipe(data); selected = data.selected; selectedNode = null;
    renderAtlas(); renderEditor(); updateHistory(); persist();
  }
  function renderAtlas() {
    $('specimens').innerHTML = S.PRESETS.map((p, i) => `<article class="specimen" tabindex="0" role="button" aria-label="编辑 ${S.esc(p.name)}" data-index="${i}"><span class="edit-hint">编辑视觉 ↗</span><div id="card-art-${i}">${S.renderPlant(i, states[i], { id: `card-${i}` })}</div><h2>${p.name}</h2><p>${p.words}</p><p class="tech">${p.note}</p></article>`).join('');
  }
  function renderPlant() {
    $('stage-art').innerHTML = S.renderPlant(selected, current(), { id: 'workbench', decorations: symbols });
    $(`card-art-${selected}`).innerHTML = S.renderPlant(selected, current(), { id: `card-${selected}` });
    updateSelection();
  }
  function scheduleRender() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; renderPlant(); updateGradientVisual(); });
    persist(); $('save-status').textContent = '正在保存…';
  }
  function inputPair(key, label, min, max, step, unit, value, scope = 'param') {
    const id = `${scope}-${key}`;
    const percent = Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
    return `<div class="control-row"><label for="${id}-range">${label}</label><div class="number-wrap"><input id="${id}-number" type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-scope="${scope}" data-key="${key}" aria-label="${label}数值"><span>${unit}</span></div><input id="${id}-range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-scope="${scope}" data-key="${key}" aria-label="${label}" style="--range:${percent}%"></div>`;
  }
  function sectionControls(keys) { return keys.map(key => { const [k, label, min, max, step, unit] = meta.get(key); return inputPair(k, label, min, max, step, unit, current()[k]); }).join(''); }
  function renderSections() {
    $('parameter-sections').innerHTML = S.GROUPS.map((g, i) => {
      const keys = i === 1 ? [...g.keys, ...S.FAMILY_KEYS[selected]] : g.keys;
      let extra = '';
      if (i === 2) extra = `<div class="field-pair" style="margin-top:14px"><label>线条端点<select id="linecap"><option value="round">圆头</option><option value="butt">平头</option><option value="square">方头</option></select></label></div>`;
      if (i === 6) extra = `<label class="muted">盆器形态<select id="pot-type">${Object.entries(S.POT_NAMES).map(([key, name]) => `<option value="${key}">${name}</option>`).join('')}</select></label>`;
      return `<details class="control-section"${i < 2 ? ' open' : ''}><summary><span>${g.name}<small>${g.en}</small></span><span class="section-marker">＋</span></summary><div class="section-content">${extra}${sectionControls(keys)}</div></details>`;
    }).join('');
    $('linecap').value = current().linecap; $('pot-type').value = current().potType;
  }
  function renderObjectControls() {
    const node = selectedNode && $('stage-art').querySelector(`[data-node="${selectedNode}"]`);
    $('object-name').textContent = node?.dataset.label || '尚未选择';
    if (!node) { $('object-controls').innerHTML = '<p class="muted">点击左侧的一个形体，即可独立调整。</p>'; return; }
    const e = current().elements[selectedNode] || {};
    const fields = [['x', '水平位移', -150, 150, 1, 'px', 0], ['y', '垂直位移', -150, 150, 1, 'px', 0], ['scaleX', '对象宽度', 10, 300, 1, '%', 100], ['scaleY', '对象高度', 10, 300, 1, '%', 100], ['rotation', '对象旋转', -180, 180, 1, '°', 0], ['opacity', '对象透明度', 0, 100, 1, '%', 100]];
    if (node.querySelector('[stroke-width]')) fields.push(['strokeWidth', '对象线宽', .1, 30, .1, 'px', Number(node.querySelector('[stroke-width]').getAttribute('stroke-width'))]);
    $('object-controls').innerHTML = fields.map(([key, label, min, max, step, unit, fallback]) => inputPair(key, label, min, max, step, unit, e[key] ?? fallback, 'object')).join('') + '<div class="object-reset"><button id="reset-object" class="text-button">重置这个对象</button></div>';
  }
  function renderTargets() {
    $('material-target').innerHTML = (selectedNode ? '<option value="object">当前选中对象</option>' : '') + Object.entries(S.MATERIALS).map(([key, label]) => `<option value="${key}">${label}</option>`).join('');
    if (!selectedNode && target === 'object') target = 'body';
    $('material-target').value = target;
  }
  function material(writable = false) {
    if (target !== 'object' || !selectedNode) return current().materials[target] || current().materials.body;
    const e = current().elements[selectedNode];
    if (e?.gradient) return e.gradient;
    const inherited = current().materials[nodeMaterial] || current().materials.body;
    if (!writable) return inherited;
    current().elements[selectedNode] ||= {};
    current().elements[selectedNode].gradient = clone(inherited);
    return current().elements[selectedNode].gradient;
  }
  function gradientCoordFields() {
    const g = material();
    const fields = g.type === 'radial' ? [['cx', '中心 X'], ['cy', '中心 Y'], ['fx', '焦点 X'], ['fy', '焦点 Y'], ['r', '半径']] : [['x1', '起点 X'], ['y1', '起点 Y'], ['x2', '终点 X'], ['y2', '终点 Y']];
    $('gradient-numbers').innerHTML = fields.map(([key, label]) => `<label>${label}<input aria-label="渐变${label}" data-gradient="${key}" type="number" value="${g[key]}" min="${key === 'r' ? 5 : 0}" max="${key === 'r' ? 150 : 100}" step="1"></label>`).join('');
  }
  function buildGradient() {
    const g = material();
    selectedStop = Math.min(selectedStop, g.stops.length - 1);
    $('gradient-type').value = g.type;
    $('base-color').value = current().color;
    gradientCoordFields();
    $('gradient-stops').innerHTML = g.stops.map((stop, i) => `<div class="stop-row" data-stop-row="${i}"><input type="color" value="${stop.color}" data-stop="${i}" data-field="color" aria-label="色标 ${i + 1} 颜色"><input type="text" value="${stop.color}" maxlength="7" pattern="#[0-9a-fA-F]{6}" data-stop="${i}" data-field="hex" aria-label="色标 ${i + 1} 十六进制颜色"><label><input type="number" min="0" max="100" step="1" value="${stop.offset}" data-stop="${i}" data-field="offset" aria-label="色标 ${i + 1} 位置">%</label><label><input type="number" min="0" max="100" step="1" value="${Math.round(stop.opacity * 100)}" data-stop="${i}" data-field="opacity" aria-label="色标 ${i + 1} 透明度">α</label><button data-delete-stop="${i}" aria-label="删除色标 ${i + 1}"${g.stops.length <= 2 ? ' disabled' : ''}>×</button></div>`).join('');
    $('stop-track').innerHTML = g.stops.map((s, i) => `<button class="stop-handle" style="left:${s.offset}%;background:${s.color}" data-stop-handle="${i}" aria-label="拖动色标 ${i + 1}" aria-pressed="${selectedStop === i}"></button>`).join('');
    $('gradient-tip').textContent = g.type === 'radial' ? '拖动 C 中心、F 焦点与 R 半径；数值均为形体内的百分比。' : '拖动 A 起点与 B 终点，调整渐变方向与覆盖范围。';
    $('add-stop').disabled = g.stops.length >= 8;
    updateGradientVisual();
  }
  function updateGradientVisual() {
    if (!$('editor').open) return;
    const g = material(), color = '#8171b1';
    const px = n => 20 + n * 2.4, py = n => 16 + n * 1.36;
    const handle = (key, x, y, label, shape = 'circle') => `<g data-handle="${key}">${shape === 'square' ? `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="#fff" stroke="${color}"/>` : `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${color}"/>`}<text x="${x + 8}" y="${y - 7}" fill="${color}">${label}</text></g>`;
    let handles;
    if (g.type === 'radial') {
      const rx = Math.min(267, px(g.cx) + g.r * 1.35);
      handles = `<path d="M${px(g.cx)} ${py(g.cy)} L${rx} ${py(g.cy)} M${px(g.cx)} ${py(g.cy)} L${px(g.fx)} ${py(g.fy)}" fill="none" stroke="${color}" stroke-width=".7" stroke-dasharray="3 3"/>` + handle('center', px(g.cx), py(g.cy), 'C', 'square') + handle('radius', rx, py(g.cy), 'R') + handle('focus', px(g.fx), py(g.fy), 'F');
    } else handles = `<path d="M${px(g.x1)} ${py(g.y1)} L${px(g.x2)} ${py(g.y2)}" stroke="${color}" stroke-width=".7" stroke-dasharray="3 3"/>` + handle('start', px(g.x1), py(g.y1), 'A', 'square') + handle('end', px(g.x2), py(g.y2), 'B');
    $('gradient-canvas').innerHTML = `<defs>${S.gradient('gradient-preview', g)}</defs><rect x="20" y="16" width="240" height="136" rx="3" fill="url(#gradient-preview)"/>${handles}`;
    $('stop-track').style.background = `linear-gradient(90deg,${[...g.stops].sort((a, b) => a.offset - b.offset).map(s => `${s.color}${Math.round(s.opacity * 255).toString(16).padStart(2, '0')} ${s.offset}%`).join(',')})`;
    g.stops.forEach((s, i) => {
      const handle = $('stop-track').querySelector(`[data-stop-handle="${i}"]`);
      if (handle) { handle.style.left = s.offset + '%'; handle.style.background = s.color; handle.setAttribute('aria-pressed', String(selectedStop === i)); }
      for (const input of $('gradient-stops').querySelectorAll(`[data-stop="${i}"]`)) if (input !== document.activeElement) input.value = input.dataset.field === 'opacity' ? Math.round(s.opacity * 100) : input.dataset.field === 'offset' ? s.offset : s.color;
    });
    for (const input of $('gradient-numbers').querySelectorAll('input')) if (input !== document.activeElement) input.value = g[input.dataset.gradient];
  }
  function renderEditor() {
    const p = S.PRESETS[selected];
    $('plant-tabs').innerHTML = S.PRESETS.map((p, i) => `<button class="plant-tab" data-plant="${i}" aria-label="选择 ${p.name}" aria-pressed="${selected === i}" style="--plant-color:${states[i].color}">${String(i + 1).padStart(2, '0')}</button>`).join('');
    $('specimen-number').textContent = `SPECIMEN ${String(selected + 1).padStart(2, '0')} / ${String(S.PRESETS.length).padStart(2, '0')}`;
    $('specimen-kind').textContent = p.kind;
    $('plant-name').textContent = p.name; $('plant-words').textContent = p.words; $('plant-meaning').textContent = p.meaning;
    renderPlant(); renderSections(); renderObjectControls(); renderTargets(); buildGradient();
  }
  function openEditor(index = selected) {
    selected = index; selectedNode = null; target = 'body';
    if (!$('editor').open) $('editor').showModal();
    document.body.style.overflow = 'hidden'; renderEditor();
  }
  function selectObject(node) {
    selectedNode = node.dataset.node; nodeMaterial = node.dataset.material || 'body'; target = 'object';
    renderObjectControls(); renderTargets(); buildGradient(); updateSelection();
  }
  function clearSelection() { selectedNode = null; if (target === 'object') target = 'body'; renderObjectControls(); renderTargets(); buildGradient(); updateSelection(); }
  function updateSelection() {
    const node = selectedNode && $('stage-art').querySelector(`[data-node="${selectedNode}"]`);
    const box = $('selection-box');
    if (!node) { box.style.display = 'none'; return; }
    const b = node.getBBox(), svg = $('stage-art').querySelector('svg');
    const matrix = svg.getCTM().inverse().multiply(node.getCTM());
    const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
    const x = Math.min(...pts.map(p => p.x)), y = Math.min(...pts.map(p => p.y));
    box.setAttribute('x', x - 3); box.setAttribute('y', y - 3); box.setAttribute('width', Math.max(...pts.map(p => p.x)) - x + 6); box.setAttribute('height', Math.max(...pts.map(p => p.y)) - y + 6); box.style.display = 'block';
  }
  function syncPair(scope, key, value) {
    const range = $(`${scope}-${key}-range`), number = $(`${scope}-${key}-number`);
    if (range) { range.value = value; range.style.setProperty('--range', (value - Number(range.min)) / (Number(range.max) - Number(range.min)) * 100 + '%'); }
    if (number && number !== document.activeElement) number.value = value;
  }
  $('editor').addEventListener('input', event => {
    const input = event.target;
    if (input.dataset.scope) {
      if (input.value === '' || !Number.isFinite(Number(input.value))) return;
      const min = Number(input.min), max = Number(input.max), step = Number(input.step);
      const value = Math.min(max, Math.max(min, Math.round(Number(input.value) / step) * step));
      if (input.dataset.scope === 'param') current()[input.dataset.key] = Number(value.toFixed(3));
      else { if (!selectedNode) return; current().elements[selectedNode] ||= {}; current().elements[selectedNode][input.dataset.key] = Number(value.toFixed(3)); }
      syncPair(input.dataset.scope, input.dataset.key, value); scheduleRender();
    } else if (input.dataset.gradient) {
      if (input.value === '') return;
      material(true)[input.dataset.gradient] = Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value))); scheduleRender();
    } else if (input.dataset.stop !== undefined) {
      const g = material(true), stop = g.stops[Number(input.dataset.stop)], field = input.dataset.field;
      if (field === 'color' || field === 'hex') { if (!/^#[0-9a-f]{6}$/i.test(input.value)) return; stop.color = input.value; }
      else { if (input.value === '') return; const value = Math.max(0, Math.min(100, Number(input.value))); stop[field] = field === 'opacity' ? value / 100 : value; }
      selectedStop = Number(input.dataset.stop); scheduleRender();
    } else if (input.id === 'base-color') {
      current().color = input.value; current().materials = S.palette(input.value); buildGradient(); scheduleRender();
    }
  });
  $('editor').addEventListener('change', event => {
    const el = event.target;
    if (el.id === 'material-target') { target = el.value; selectedStop = 0; buildGradient(); }
    if (el.id === 'gradient-type') { material(true).type = el.value; buildGradient(); scheduleRender(); }
    if (el.id === 'linecap') { current().linecap = el.value; scheduleRender(); }
    if (el.id === 'pot-type') { current().potType = el.value; clearSelection(); scheduleRender(); }
    if (el.id === 'checker') $('stage').classList.toggle('checker', el.checked);
    if (el.id === 'show-symbols') { symbols = el.checked; renderPlant(); }
    commit();
  });
  function addStop(offset = null) {
    const g = material(true); if (g.stops.length >= 8) return;
    const stops = [...g.stops].sort((a, b) => a.offset - b.offset);
    let left = stops[0], right = stops[1];
    if (offset === null) {
      for (let i = 0; i < stops.length - 1; i++) if (stops[i + 1].offset - stops[i].offset > right.offset - left.offset) { left = stops[i]; right = stops[i + 1]; }
      offset = Math.round((left.offset + right.offset) / 2);
    } else { left = stops.filter(s => s.offset <= offset).at(-1) || stops[0]; right = stops.find(s => s.offset >= offset) || stops.at(-1); }
    g.stops.push({ offset, color: left.color, opacity: (left.opacity + right.opacity) / 2 }); selectedStop = g.stops.length - 1;
    buildGradient(); scheduleRender(); commit();
  }
  $('add-stop').addEventListener('click', () => addStop());
  $('gradient-stops').addEventListener('click', event => {
    const b = event.target.closest('[data-delete-stop]'); if (!b || material().stops.length <= 2) return;
    material(true).stops.splice(Number(b.dataset.deleteStop), 1); buildGradient(); scheduleRender(); commit();
  });
  $('gradient-canvas').addEventListener('pointerdown', event => {
    const h = event.target.closest('[data-handle]'); if (!h) return;
    event.preventDefault(); const svg = $('gradient-canvas'); svg.setPointerCapture(event.pointerId);
    drag = { kind: 'gradient', handle: h.dataset.handle, startX: event.clientX, startY: event.clientY, gradient: clone(material()) };
  });
  $('gradient-canvas').addEventListener('pointermove', event => {
    if (drag?.kind !== 'gradient') return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform($('gradient-canvas').getScreenCTM().inverse());
    const x = Math.max(0, Math.min(100, Math.round((point.x - 20) / 2.4))), y = Math.max(0, Math.min(100, Math.round((point.y - 16) / 1.36)));
    const g = material(true);
    if (drag.handle === 'center') { g.cx = x; g.cy = y; }
    if (drag.handle === 'focus') { g.fx = x; g.fy = y; }
    if (drag.handle === 'radius') {
      const dx = (event.clientX - drag.startX) / $('gradient-canvas').getBoundingClientRect().width * 280 / 1.35;
      g.r = Math.max(5, Math.min(150, Math.round(drag.gradient.r + dx)));
    }
    if (drag.handle === 'start') { g.x1 = x; g.y1 = y; }
    if (drag.handle === 'end') { g.x2 = x; g.y2 = y; }
    scheduleRender();
  });
  $('stop-track').addEventListener('dblclick', event => {
    if (event.target.closest('[data-stop-handle]')) return;
    const r = $('stop-track').getBoundingClientRect(); addStop(Math.max(0, Math.min(100, Math.round((event.clientX - r.left) / r.width * 100))));
  });
  $('stop-track').addEventListener('pointerdown', event => {
    const h = event.target.closest('[data-stop-handle]'); if (!h) return;
    event.preventDefault(); $('stop-track').setPointerCapture(event.pointerId); selectedStop = Number(h.dataset.stopHandle);
    drag = { kind: 'stop', index: selectedStop }; updateGradientVisual();
  });
  $('stop-track').addEventListener('pointermove', event => {
    if (drag?.kind !== 'stop') return;
    const r = $('stop-track').getBoundingClientRect(); material(true).stops[drag.index].offset = Math.max(0, Math.min(100, Math.round((event.clientX - r.left) / r.width * 100))); scheduleRender();
  });
  $('stop-track').addEventListener('keydown', event => {
    const h = event.target.closest('[data-stop-handle]'); if (!h || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); const stop = material(true).stops[Number(h.dataset.stopHandle)]; stop.offset = Math.max(0, Math.min(100, stop.offset + (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 10 : 1))); scheduleRender(); commit();
  });
  $('stage').addEventListener('pointerdown', event => {
    const node = event.target.closest('[data-node]');
    if (!node || !node.closest('#stage-art')) return;
    event.preventDefault(); selectObject(node);
    const e = current().elements[selectedNode] || {};
    drag = { kind: 'object', x: e.x || 0, y: e.y || 0, clientX: event.clientX, clientY: event.clientY, matrix: node.parentNode.getScreenCTM().inverse() };
    $('stage').setPointerCapture(event.pointerId);
  });
  $('stage').addEventListener('pointermove', event => {
    if (drag?.kind !== 'object' || !selectedNode) return;
    const dx = event.clientX - drag.clientX, dy = event.clientY - drag.clientY;
    if (Math.abs(dx) + Math.abs(dy) < 2) return;
    current().elements[selectedNode] ||= {};
    const e = current().elements[selectedNode];
    e.x = Math.max(-150, Math.min(150, Math.round(drag.x + drag.matrix.a * dx + drag.matrix.c * dy)));
    e.y = Math.max(-150, Math.min(150, Math.round(drag.y + drag.matrix.b * dx + drag.matrix.d * dy)));
    syncPair('object', 'x', e.x); syncPair('object', 'y', e.y); scheduleRender();
  });
  function endDrag() { if (drag) { drag = null; commit(); } }
  for (const id of ['gradient-canvas', 'stop-track', 'stage']) { $(id).addEventListener('pointerup', endDrag); $(id).addEventListener('pointercancel', endDrag); }
  $('object-controls').addEventListener('click', event => {
    if (event.target.id === 'reset-object' && selectedNode) { delete current().elements[selectedNode]; renderPlant(); renderObjectControls(); buildGradient(); commit(); }
  });
  $('reset-gradient').addEventListener('click', () => {
    if (target === 'object' && selectedNode) delete (current().elements[selectedNode] || {}).gradient;
    else current().materials[target] = clone(S.palette(current().color)[target]);
    buildGradient(); scheduleRender(); commit();
  });
  $('clear-selection').addEventListener('click', clearSelection);
  $('reset-plant').addEventListener('click', () => { states[selected] = S.initial(S.PRESETS[selected]); selectedNode = null; renderEditor(); commit(); toast('已恢复这株的初始设计，可撤销。'); });
  $('plant-tabs').addEventListener('click', event => { const b = event.target.closest('[data-plant]'); if (b) { commit(); selected = Number(b.dataset.plant); selectedNode = null; target = 'body'; renderEditor(); } });
  $('specimens').addEventListener('click', event => { const card = event.target.closest('[data-index]'); if (card) openEditor(Number(card.dataset.index)); });
  $('specimens').addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { const card = event.target.closest('[data-index]'); if (card) { event.preventDefault(); openEditor(Number(card.dataset.index)); } } });
  $('open-editor').addEventListener('click', () => openEditor());
  $('close-editor').addEventListener('click', () => $('editor').close());
  $('editor').addEventListener('close', () => { commit(); document.body.style.overflow = ''; });
  $('editor').addEventListener('click', event => { if (event.target === $('editor')) { const r = $('editor').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('editor').close(); } });
  $('undo').addEventListener('click', () => timeTravel(-1)); $('redo').addEventListener('click', () => timeTravel(1));
  document.addEventListener('keydown', event => {
    if (!$('editor').open || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); timeTravel(event.shiftKey ? 1 : -1); }
  });
  function download(text, filename, type) {
    const url = URL.createObjectURL(new Blob([text], { type })), link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function fitExport(source) {
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('SVG 生成失败，请保存配方后重试。');
    const svg = document.importNode(doc.documentElement, true), holder = document.createElement('div');
    holder.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none'; holder.append(svg); document.body.append(holder);
    const b = svg.getBBox(), vb = svg.viewBox.baseVal, pad = 12;
    const x = Math.min(vb.x, Math.floor(b.x - pad)), y = Math.min(vb.y, Math.floor(b.y - pad));
    const w = Math.max(vb.x + vb.width, Math.ceil(b.x + b.width + pad)) - x, h = Math.max(vb.y + vb.height, Math.ceil(b.y + b.height + pad)) - y;
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`); svg.setAttribute('width', String(w * 2)); svg.setAttribute('height', String(h * 2));
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata'); metadata.textContent = JSON.stringify(S.recipe(states, selected)); svg.prepend(metadata);
    const result = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg); holder.remove(); return result;
  }
  $('export-plant').addEventListener('click', () => {
    try { download(fitExport(S.plantDocument(selected, current(), { background: $('export-background').checked, labels: $('export-labels').checked, decorations: symbols })), `${S.PRESETS[selected].id}.svg`, 'image/svg+xml;charset=utf-8'); toast('已导出这株 SVG。'); }
    catch (error) { toast(error.message); }
  });
  $('export-atlas').addEventListener('click', () => { try { download(fitExport(S.renderAtlas(states)), 'synth-plant-atlas.svg', 'image/svg+xml;charset=utf-8'); toast('已导出完整图鉴 SVG。'); } catch (error) { toast(error.message); } });
  $('save-recipe').addEventListener('click', () => { download(JSON.stringify(S.recipe(states, selected), null, 2), 'synth-plant-recipe.json', 'application/json'); toast('配方已保存，包含全部植物与对象修改。'); });
  $('import').addEventListener('click', () => $('recipe-file').click());
  $('recipe-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error('配方文件过大，请选择小于 3 MB 的 JSON。');
      const data = JSON.parse(await file.text()); const clean = S.validateRecipe(data);
      states = clean; selected = Math.max(0, Math.min(S.PRESETS.length - 1, Math.trunc(Number(data.selected) || 0))); selectedNode = null; renderAtlas(); if ($('editor').open) renderEditor(); commit(); toast('配方已载入，可撤销。');
    } catch (error) { toast(error instanceof SyntaxError ? '无法读取 JSON，请选择导出的配方文件。' : error.message); }
    event.target.value = '';
  });
  window.addEventListener('resize', () => { if ($('editor').open) updateSelection(); });
  $('design-logic').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 156" role="img"><title>timbre character + inner structure + musical node symbols = synth-plant</title>${S.logicStrip(20, 10)}</svg>`;
  window.addEventListener('storage', event => {
    if(event.key!==STORAGE||!event.newValue)return;
    try {
      const data=JSON.parse(event.newValue),before=event.oldValue?JSON.parse(event.oldValue):null, incoming=S.validateRecipe(data);
      let changed=false;
      incoming.forEach((plant,i)=>{if(JSON.stringify(data.plants[i])!==JSON.stringify(before?.plants?.[i])){states[i]=plant;changed=true;}});
      if(changed){selectedNode=null;renderAtlas();if($('editor').open)renderEditor();commit();$('save-status').textContent='已同步温室配色';}
    } catch {}
  });
  renderAtlas(); commit();
  const requested = new URLSearchParams(location.search).get('plant');
  if (requested !== null && Number.isInteger(Number(requested)) && Number(requested) >= 0 && Number(requested) < S.PRESETS.length) openEditor(Number(requested));
})();
