"""Union every sign's entire shaped/positioned lettering, preserving counters.
Requires project-local fonttools and skia-pathops; no tracing or bitmap step.
"""
from pathlib import Path
import sys,json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'.tools'))
import pathops
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.misc.transform import Transform

def transform(raw):
 t=Transform()
 for name,args in re.findall(r'(translate|scale)\(([^)]+)\)',raw):
  a=[float(v) for v in re.split(r'[ ,]+',args.strip())]
  t=t.translate(a[0],a[1] if len(a)>1 else 0) if name=='translate' else t.scale(a[0],a[1] if len(a)>1 else a[0])
 return t
def svg(path):
 pen=SVGPathPen(None,ntos=lambda n:format(n,'.5f').rstrip('0').rstrip('.') or '0')
 path.draw(pen)
 return pen.getCommands()
cache={}
for key,source in json.loads((ROOT/'lettering-layouts.json').read_text(encoding='utf-8')).items():
 root=ET.fromstring(source);form=next(e for e in root.iter() if e.get('class')=='letter-form')
 combined=pathops.Path();input_paths=0
 for el in form.iter():
  if el.tag.endswith('path') and el.get('d'):
   parse_path(el.get('d'),TransformPen(combined.getPen(),transform(el.get('transform',''))));input_paths+=1
 # WINDING simplify is a real geometric union; reverse coincident contours removed.
 result=pathops.simplify(combined,fix_winding=True,keep_starting_points=False,clockwise=True)
 outer=pathops.Path();inner=pathops.Path()
 for contour in result.contours:
  contour.draw((outer if contour.clockwise else inner).getPen())
 cache[key]={'d':svg(result),'outer':svg(outer),'inner':svg(inner),'inputPaths':input_paths,'contours':len(list(result.contours)),'operation':'Skia PathOps WINDING union'}
(ROOT/'lettering-cache.js').write_text('globalThis.STREET_LETTERING='+json.dumps(cache,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(ROOT/'lettering-report.json').write_text(json.dumps({'signs':len(cache),'engine':'skia-pathops','operation':'union/simplify','entries':{k:{'inputPaths':v['inputPaths'],'contours':v['contours']} for k,v in cache.items()}},indent=2),encoding='utf-8')
print('Boolean-unioned complete lettering:',len(cache),'signs; exterior and counter paths retained separately.')
