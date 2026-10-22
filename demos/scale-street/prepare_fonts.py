"""Fetch OFL sources and build a compact vector glyph cache; no font is needed at runtime."""
from pathlib import Path
import sys, json, urllib.request, concurrent.futures
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'.tools'))
SOURCES={
 'brush':('mashanzheng','MaShanZheng-Regular.ttf'),
 'mincho':('shipporimincho','ShipporiMincho-Bold.ttf'),
 'ruqaa':('arefruqaa','ArefRuqaa-Bold.ttf'),
 'bungee':('bungee','Bungee-Regular.ttf'),
 'qingke':('zcoolqingkehuangyou','ZCOOLQingKeHuangYou-Regular.ttf'),
 'dot':('dotgothic16','DotGothic16-Regular.ttf'),
 'reem':('reemkufi','ReemKufi[wght].ttf'),
 'space':('spacegrotesk','SpaceGrotesk[wght].ttf'),
 'happy':('zcoolkuaile','ZCOOLKuaiLe-Regular.ttf'),
 'dela':('delagothicone','DelaGothicOne-Regular.ttf'),
 'lalezar':('lalezar','Lalezar-Regular.ttf'),
 'anton':('anton','Anton-Regular.ttf'),
 'thai':('notoserifthai','NotoSerifThai[wdth,wght].ttf'),
 'devanagari':('notoserifdevanagari','NotoSerifDevanagari[wdth,wght].ttf'),
 'ethiopic':('notoserifethiopic','NotoSerifEthiopic[wdth,wght].ttf')
}
BASE='https://raw.githubusercontent.com/google/fonts/main/ofl/'
def fetch(entry):
 key,(folder,name)=entry
 dest=ROOT/'font-sources'/folder
 dest.mkdir(parents=True,exist_ok=True)
 for filename in (name,'OFL.txt'):
  target=dest/filename
  if not target.exists():
   req=urllib.request.Request(BASE+folder+'/'+urllib.parse.quote(filename),headers={'User-Agent':'ScaleStreet/1.0'})
   with urllib.request.urlopen(req,timeout=90) as res: target.write_bytes(res.read())
 return key
if __name__=='__main__':
 from fontTools.ttLib import TTFont
 from fontTools.pens.svgPathPen import SVGPathPen
 from fontTools.varLib.instancer import instantiateVariableFont
 import uharfbuzz as hb
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
  print('Fetched OFL sources:',', '.join(pool.map(fetch,SOURCES.items())),flush=True)
 cache={}
 chars=''.join(chr(n) for n in range(32,127))+'五音閣阁宮宫商角徵羽樂聲平調子和の間島唄清雅燕六宮音全旋律音階Ééōā♯♭'
 extra=ROOT/'font-characters.txt'
 if extra.exists(): chars+=''.join(sorted(set(extra.read_text(encoding='utf-8'))))
 for key,(folder,name) in SOURCES.items():
  path=ROOT/'font-sources'/folder/name
  font=TTFont(path)
  if 'fvar' in font:
   font=instantiateVariableFont(font,{'wght':650 if key=='space' else 600},inplace=False)
  glyphset=font.getGlyphSet(); cmap=font.getBestCmap(); upem=font['head'].unitsPerEm
  def glyph(gname):
   pen=SVGPathPen(glyphset); glyphset[gname].draw(pen)
   return {'d':pen.getCommands(),'w':font['hmtx'][gname][0]}
  glyphs={c:glyph(cmap[ord(c)]) for c in chars if ord(c) in cmap}
  phrases={}
  native_phrases=ROOT/'native-phrases.json'
  requested=json.loads(native_phrases.read_text(encoding='utf-8')) if native_phrases.exists() else {}
  words=list(dict.fromkeys((['راست','مقام'] if key in ('ruqaa','reem','lalezar') else [])+requested.get(key,[])))
  if words:
   face=hb.Face(path.read_bytes()); hf=hb.Font(face); hf.scale=(upem,upem)
   if 'fvar' in TTFont(path): hf.set_variations({'wght':650 if key=='space' else 600})
   for word in words:
    if any(ord(ch) not in cmap for ch in word): continue
    buf=hb.Buffer();buf.add_str(word);buf.guess_segment_properties();hb.shape(hf,buf)
    cursor=0;parts=[]
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
     g=glyph(font.getGlyphName(info.codepoint))
     parts.append({'d':g['d'],'x':cursor+pos.x_offset,'y':pos.y_offset})
     cursor+=pos.x_advance
    phrases[word]={'w':cursor,'parts':parts}
  cache[key]={'upem':upem,'glyphs':glyphs,'phrases':phrases,'source':BASE+folder+'/'+name}
 (ROOT/'glyphs.json').write_text(json.dumps(cache,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 (ROOT/'font-sources'/'SOURCES.json').write_text(json.dumps(SOURCES,indent=2),encoding='utf-8')
 print('Vector glyph cache ready:',len(cache),'typefaces',flush=True)
