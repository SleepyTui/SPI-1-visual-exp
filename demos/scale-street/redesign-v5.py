from pathlib import Path
R=Path(__file__).resolve().parent
def edit(name,changes):
 p=R/name;s=p.read_text(encoding='utf-8')
 for a,b in changes:
  if a not in s: raise RuntimeError(name+' missing '+a[:90])
  s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
edit('art-v2.js',[
 ("const F=globalThis.STREET_CATALOG,G=globalThis.STREET_GLYPHS;", "const F=globalThis.STREET_CATALOG,G=globalThis.STREET_GLYPHS,Dream=globalThis.DreamStreetArt||(typeof module!=='undefined'?require('./dream-art-v5.js'):null);"),
 ("col=fam.color,acc=fam.accent,ink='#111c29',neon=light==='neon'", "col=light==='neon'?Dream.palettes[f][0]:fam.color,acc=light==='neon'?Dream.palettes[f][1]:fam.accent,ink='#111c29',neon=light==='neon'"),
 ("p(outline,'#1b343c','#4c6670',2", "p(outline,'#253149','#9c95ae',1.2"),
 ("neon?'#0b1420':col,neon?'#25323b':acc", "neon?'#141c30':col,neon?'#47516c':acc"),
 ("if(neon)a+=`<g class=\"neon-emission\">${p(outline,'none',col,ns.outer,'class=\"neon-border\"')}`;", "if(neon)a+=`<g class=\"neon-emission\">${Dream.structure(f,outline,ns,uid).replace(`stroke=\"${col}\" stroke-width=\"${ns.outer}\"`,`class=\"neon-border\" stroke=\"${col}\" stroke-width=\"${ns.outer}\"`)}`;"),
 ("if(neon&&ns.glow)a+=p(outline,'none',col,ns.outer*2,`opacity=\".4\" filter=\"url(#${uid}glow)\"`);", "// Parallel glass tubes and intentional electrode gaps are part of the frame artwork."),
 ("a+=ornaments(f,neon?acc:'#253339',light,uid,ns.inner);", "a+=neon?Dream.internal(f,si,ns,uid):ornaments(f,'#253339',light,uid,ns.inner);"),
 ("${p(union.d,'none',foreground,ns.inner,'class=\"neon-inner-line\"')}", "${p(union.d,'none',foreground,ns.inner,`id=\"${uid}letter\" class=\"neon-inner-line\" stroke-dasharray=\"49 1.5 27 1.1\"`)}${Array.from({length:5},(_,j)=>`<defs><clipPath id=\"${uid}scan${j}\"><rect x=\"${40+j*48}\" y=\"30\" width=\"48\" height=\"260\"/></clipPath></defs><g class=\"letter-cell program-cell\" data-cell=\"${j+30}\" data-tone=\"${Dream.palettes[f][2]}\" color=\"${Dream.palettes[f][2]}\" clip-path=\"url(#${uid}scan${j})\"><use href=\"#${uid}letter\" stroke=\"currentColor\" stroke-width=\"${ns.inner*.55}\" style=\"stroke:currentColor;stroke-width:${ns.inner*.55}\"/></g>`).join('')}"),
 ("['#101b26','#16212c','#0d1a26'][j%3]", "'url(#dream-side)'"),
 ("['#263038','#192b38','#303130','#1d2b32','#343538'][j%5]", "'url(#dream-wall)'"),
 ("out+=quad([a,b,cc,d],'url(#dream-wall)','#4c565d',.6);", "out+=quad([a,b,cc,d],'url(#dream-wall)','#b4c6d0',.6);out+=quad([a,b,cc,d],['#e8bad4','#9ebfe5','#c7b2ea','#97dbcf'][j%4],'none',0).replace('<polygon','<polygon opacity=\".13\"');out+=p(`M${a}L${d}`,'none',side<0?'#f3bdd2':'#9edfdc',1.1,'opacity=\".65\"');"),
 ("quad(win,'#0b1723','#5f6767',.35)", "quad(win,'#24394f','#afc6d0',.35)"),
 ("?'#d3c091':'#708484'", "?'#ffe7b9':['#c1dbe0','#e0b4d7','#a8d5cb'][(floor+col)%3]"),
 ("+r(0,0,640,640,'#08121e')+c(320,320,200,'url(#sky-haze)');", "+Dream.sky(depth);"),
 ("'url(#wet-road)'", "'url(#dream-road)'"),
 ("out+=p('M0 63Q182 124 320 77t320-6M0 68Q182 133 320 83t320-6','none','#090d15',2);", "out+=Dream.atmosphere();out+=p('M0 63Q182 124 320 77t320-6M0 68Q182 133 320 83t320-6','none','#394255',1.2);"),
 ("aria-label=\"${lang==='zh'?'世界音阶霓虹长街':'World scale neon street'}\"", "data-edition=\"dream-v5\" aria-label=\"${lang==='zh'?'梦游音阶长街':'Dream scale street'}\"")
])
edit('controls-v3.js',[
 ("const modes=['steady'", "const modes=['program','steady'"),
 ("return {signScale:100", "return {dreamSettings:{mist:65,grain:3.5,sky:85},signScale:100"),
 ("effect:{mode:'steady',speed:1,amount:.7}", "effect:{mode:'program',speed:1,amount:.85}"),
 ("function effect(v,d={mode:'steady',speed:1,amount:.7})", "function effect(v,d={mode:'program',speed:1,amount:.85})"),
 ("out.signScale=clamp", "out.dreamSettings={mist:clamp(x.dreamSettings?.mist,0,100,65),grain:clamp(x.dreamSettings?.grain,0,12,3.5),sky:clamp(x.dreamSettings?.sky,0,100,85)};out.signScale=clamp"),
 ("zh:{soundOff", "zh:{program:'独立灯效程序',dreamControls:'梦境光场',mist:'街道雾光',grain:'胶片颗粒',skyLight:'天空辉光',soundOff"),
 ("en:{soundOff", "en:{program:'Individual light programs',dreamControls:'Dream light field',mist:'Street haze',grain:'Film grain',skyLight:'Sky glow',soundOff"),
 ("const html=`${range('sign-scale'", "const html=`<details class=\"advanced dream-controls\" open><summary data-t=\"dreamControls\"></summary>${range('dream-mist','mist',0,100)}${range('dream-grain','grain',0,12,.5)}${range('dream-sky','skyLight',0,100)}</details>${range('sign-scale'"),
 ("const bindings={'window-amount'", "const bindings={'dream-mist':['dreamSettings','mist'],'dream-grain':['dreamSettings','grain'],'dream-sky':['dreamSettings','sky'],'window-amount'")
])
edit('app-v2.js',[
 ("const state={lang:'zh'", "Object.assign(words.zh,{brand:'梦游音阶长街',edition:'夜间漫游 / 世界音阶档案',title:'梦里有条街，霓虹会唱歌。',intro:'穿过薄雾与玻璃灯管，听见十六种不同的夜色。',controlHeading:'光与声音',controlTitle:'编辑这个梦。',controlIntro:'原文招牌，独立灯效。把街景调成属于你的夜晚。',street:'漫游',assets:'招牌档案',references:'灵感札记',referenceHeading:'玻璃灯管，柔软的夜。',referenceIntro:'断开的复线、接力点亮的纹样，以及雾光、颗粒与彩色建筑的梦境。',referenceOne:'分段灯管与复线结构',referenceTwo:'柔软的彩色雾光',referenceThree:'建筑、夜空与超现实尺度',footer:'梦游音阶长街 · 原创矢量 / 离线可用'});Object.assign(words.en,{brand:'Dream Scale Street',edition:'NIGHT WALK / AN ATLAS OF SCALES',title:'A street of luminous dreams.',intro:'Wander through soft haze and glass tubes. Sixteen different ways to hear the night.',controlHeading:'LIGHT & SOUND',controlTitle:'Shape the dream.',controlIntro:'Native lettering. Individual light programs. Make this night your own.',street:'Wander',assets:'Sign archive',references:'Field notes',referenceHeading:'Glass tubes. A softer night.',referenceIntro:'Broken parallel tubes, sequenced ornaments, spectral haze and dreamlike architecture.',referenceOne:'Segmented, parallel glass tubes',referenceTwo:'Soft spectral light and haze',referenceThree:'Architecture, night sky and dreamlike scale',footer:'Dream Scale Street · Original vectors / Works offline'});\nconst state={lang:'zh'"),
 ("size:320,family:0", "size:window.innerWidth>1100?640:320,family:0"),
 ("localStorage.getItem('scale-street-v2')", "localStorage.getItem('scale-street-dream-v5')"),
 ("localStorage.setItem('scale-street-v2'", "localStorage.setItem('scale-street-dream-v5'"),
 ("<button data-family-button=\"${i}\" aria-pressed=\"${i===state.family}\"><strong>", "<button data-family-button=\"${i}\" aria-pressed=\"${i===state.family}\" style=\"--family-color:${DreamStreetArt.palettes[i][0]}\"><span class=\"family-glyph\" aria-hidden=\"true\">${Art.iconSVG(i,state.indices[i])}</span><strong>"),
 ("controls?.apply();}\nfunction selectFamily", "controls?.apply();globalThis.DreamStudioUI?.sync();}\nfunction selectFamily"),
 ("save();if(play){player.stop();", "save();globalThis.DreamStudioUI?.sync();if(play){player.stop();"),
 ("if(state.page==='reference')renderMotifs();}\nfunction enablePlay", "if(state.page==='reference')renderMotifs();globalThis.DreamStudioUI?.sync();}\nfunction enablePlay")
])
for name in ['index.html','index-v2.html']:
 edit(name,[
  ('<link rel="stylesheet" href="visual-controls-v3.css">','<link rel="stylesheet" href="visual-controls-v3.css"><link rel="stylesheet" href="dream-ui-v5.css">'),
  ('<script src="art-v2.js">','<script src="dream-art-v5.js"></script><script src="art-v2.js">'),
  ('<script src="controls-v3.js">','<script src="dream-motion-v5.js"></script><script src="controls-v3.js">'),
  ('<script src="app-v2.js"></script>','<script src="app-v2.js"></script><script src="dream-ui-v5.js"></script>'),
  ('references/hong-kong-dense-street.jpg','references/dream-tube-structure.jpg'),('references/hong-kong-light-trails.jpg','references/dream-soft-light.jpg'),('references/street-sign-variety.jpg','references/dream-architecture.jpg'),
  ('href="scale-street-v2.zip"','href="scale-street-dream-v5.zip"'),('href="README-v2.md"','href="README-dream-v5.md"')
 ])
edit('motion-v4.js',[("mixer.configure", "mixer.configure")]) if False else None
edit('controls-v3.js',[("StreetMotion.apply(svg,state,globalThis.ScaleStreetArt);", "StreetMotion.apply(svg,state,globalThis.ScaleStreetArt);DreamStreetMotion.apply(svg,state);globalThis.DreamStudioUI?.sync();")])
print('Dream revision integrated; original backup untouched.')
