from pathlib import Path
ROOT=Path(__file__).resolve().parent
p=ROOT/'audio-v2.js';s=p.read_text(encoding='utf-8');p.write_text(s[:s.index('const RHYTHMS=')]+(ROOT/'audio-body-v3.txt').read_text(encoding='utf-8'),encoding='utf-8')
p=ROOT/'index-v2.html';s=p.read_text(encoding='utf-8');s=s.replace('<input id="family-range" type="range" min="0" max="15" value="0">','<input id="scale-range" type="range" min="0" max="9" value="0">').replace('<span>16</span></div><div id="screen"','<span id="vertical-max">10</span></div><div id="screen"').replace('<input id="scale-range" type="range" min="0" max="9" value="0"><span id="scale-label"','<input id="family-range" type="range" min="0" max="15" value="0"><span id="scale-label"')
s=s.replace('<script src="art-v2.js">','<script src="lettering-cache.js"></script><script src="art-v2.js">').replace('<script src="audio-v2.js">','<script src="music-excerpts.js"></script><script src="audio-v2.js">').replace('<script src="app-v2.js">','<script src="controls-v3.js"></script><script src="app-v2.js">')
p.write_text(s,encoding='utf-8');(ROOT/'index.html').write_text(s,encoding='utf-8')
