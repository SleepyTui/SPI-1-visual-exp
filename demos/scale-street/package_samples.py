"""Package only deliverables and editable sources; exclude installed tooling and caches."""
from pathlib import Path
import zipfile
ROOT=Path(__file__).resolve().parent
target=ROOT/'scale-street-samples.zip'
files=[]
for p in ROOT.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(ROOT)
 if any(part in {'.tools','.git','__pycache__'} for part in rel.parts):continue
 if p.suffix=='.zip' or p.name=='art.js':continue
 if rel.parts[0]=='test-output' and p.name!='browser-report.json':continue
 files.append(p)
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
 for p in sorted(files):archive.write(p,'scale-street/'+p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(target) as archive:
 assert archive.testzip() is None
 assert 'scale-street/index.html' in archive.namelist()
 assert sum(name.startswith('scale-street/assets/') and name.endswith('.svg') for name in archive.namelist())==72
print(f'Packaged {len(files)} files / {target.stat().st_size/1024/1024:.1f} MiB / ZIP integrity OK')
