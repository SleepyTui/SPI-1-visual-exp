from pathlib import Path
import zipfile
ROOT=Path(__file__).resolve().parent
names=['duotone-v11.js','duotone-v11.css','qa-duotone-v11.mjs','README-duotone-v11.md','qa-rail-v10.mjs','README-rail-v10.md','menu-v9.js','menu-v9.css','qa-menu-v9.mjs','README-menu-v9.md','depth-v8.js','depth-v8.css','qa-depth-v8.mjs','README-depth-v8.md','mounts-v7.js','qa-rig-v7.mjs','README-rig-v7.md','studio-v6.js','studio-v6.css','user-defaults-v6.js','qa-studio-v6.mjs','README-studio-v6.md','dream-art-v5.js','dream-circuits-v5.js','dream-motion-v5.js','dream-ui-v5.js','dream-ui-v5.css','README-dream-v5.md','VALIDATION-dream-v5.md','qa-dream-v5.mjs','index.html','index-v2.html','street-v2.css','visual-controls-v3.css','controls-v3.js','motion-v4.js','ambience-v4.js','ambience-cache.js','qa-atmosphere-v4.mjs','data.js','catalog-v2.js','glyph-cache.js','glyphs.json','lettering-cache.js','lettering-report.json','build-lettering.mjs','union_lettering.py','music-excerpts.js','maps-v2.js','art-v2.js','audio-v2.js','app-v2.js','generate-v2.mjs','prepare_fonts.py','font-characters.txt','native-phrases.json','serve.mjs','verify-v2.mjs','qa-v2.mjs','qa-controls-v3.mjs','package_v2.py','package.json','manifest-v2.json','README-v2.md','VALIDATION-v2.md']
files=[ROOT/n for n in names]
for folder in ['assets-native','font-sources','references','music-sources','ambience']:
 files.extend(p for p in (ROOT/folder).rglob('*') if p.is_file())
report=ROOT/'test-output-v2'/'report.json'
if report.exists():files.append(report)
report=ROOT/'test-output-v2'/'controls-report.json'
if report.exists():files.append(report)
report=ROOT/'test-output-v2'/'atmosphere-report.json'
if report.exists():files.append(report)
files.extend(p for p in (ROOT/'test-output-dream-v5').glob('*') if p.suffix in ['.json','.png'])
files.extend(p for p in (ROOT/'test-output-studio-v6').glob('*') if p.suffix in ['.json','.png'])
if (ROOT/'user-defaults-v6.json').exists(): files.append(ROOT/'user-defaults-v6.json')
files.extend(p for p in (ROOT/'test-output-rig-v7').glob('*') if p.suffix in ['.json','.png'])
files.extend(p for p in (ROOT/'test-output-depth-v8').glob('*') if p.suffix in ['.json','.png'] and not p.name.startswith('debug-') and 'first' not in p.name)
files.extend(p for p in (ROOT/'test-output-menu-v9').glob('*') if p.suffix in ['.json','.png'])
files.extend(p for p in (ROOT/'test-output-rail-v10').glob('*') if p.suffix in ['.json','.png'])
files.extend(p for p in (ROOT/'test-output-duotone-v11').glob('*') if p.suffix in ['.json','.png','.svg'] and not p.name.startswith('first-'))
target=ROOT/'scale-street-duotone-v11.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,'scale-street/'+p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(target) as z:
 assert z.testzip() is None
 assert sum(n.startswith('scale-street/assets-native/') and n.endswith('.svg') for n in z.namelist())==329
print(f'Package ready: {len(files)} files / {target.stat().st_size/1024/1024:.1f} MiB / 329 SVG files / ZIP integrity OK')
