(function(){
const F=globalThis.SCALE_FAMILIES;
F[6].cn='印度拉格';F[11].cn='蓝调家族';F[15].cn='比博普家族';
const make=(id,name,notes)=>({id,name,notes,label:name});
if(F[9].scales.length===3)F[9].scales=[F[9].scales[0],make('locrian-natural6','Locrian Natural 6',[0,1,3,5,6,9,10]),make('ionian-augmented','Ionian Augmented',[0,2,4,5,8,9,11]),make('dorian-sharp4','Dorian Sharp 4',[0,2,3,6,7,9,10]),make('harmonic-phrygian-dominant','Phrygian Dominant',[0,1,4,5,7,8,10]),F[9].scales[1],F[9].scales[2]];
if(F[10].scales.length===3)F[10].scales=[F[10].scales[0],make('dorian-flat2','Dorian Flat 2',[0,1,3,5,7,9,10]),make('lydian-augmented','Lydian Augmented',[0,2,4,6,8,9,11]),F[10].scales[1],make('mixolydian-flat6','Mixolydian Flat 6',[0,2,4,5,7,8,10]),make('locrian-natural2','Locrian Natural 2',[0,2,3,5,6,8,10]),F[10].scales[2]];
const names=[
['宫调式','商调式','角调式','徵调式','羽调式','清乐','雅乐','燕乐','六声清角','六声变宫'],
['阳音阶','阴音阶','平调子'],['琉球五声','琉球六声扩展'],['提兹塔大调','提兹塔小调','安巴塞尔'],['斯连德罗示意','佩洛格参考','佩洛格五音选集'],['泰国七等分示意','泰国五音选集一','泰国五音选集二'],['斯里兰贾尼','雅曼','哈姆萨德瓦尼'],['拉斯特','弗里吉亚属调式','双和声大调'],['自然大调','自然小调','多利亚','弗里吉亚','利底亚','混合利底亚','洛克里亚'],['和声小调','洛克里亚还原六','增伊奥尼亚','多利亚升四','弗里吉亚属调式','利底亚升二','超洛克里亚'],['旋律小调上行','多利亚降二','增利底亚','利底亚属调式','混合利底亚降六','洛克里亚还原二','变化音阶'],['大调五声','小调五声','大调蓝调','小调蓝调'],['大调六声省七','多利亚六声省七','小调六声省六'],['全音音阶','增音阶'],['减音阶全半','减音阶半全'],['比博普大调','比博普多利亚','比博普属调式']
];
const marks=[['宫','商','角','徵','羽','清','雅','燕','六清','六宫'],['阳','阴','平调'],['琉五','琉六'],['提大','提小','安'],['锣','佩','五佩'],['泰七','泰五','泰选'],['斯','雅曼','哈姆'],['拉斯','弗属','双和'],['大','小','多','弗','利','混利','洛'],['和小','洛六','增伊','多四','弗属','利二','超洛'],['旋小','多二','增利','利属','混六','洛二','变化'],['大五','小五','大蓝','小蓝'],['大六','多六','小六'],['全音','增'],['全半','半全'],['比大','比多','比属']];
const enmarks=[['G','S','J','Z','Y','Q','A','E','QC','BC'],['YO','IN','HI'],['R5','R6'],['TM','Tm','AM'],['SL','PE','P5'],['T7','T5','TA'],['SR','YA','HA'],['RA','PD','DH'],['MA','MI','DO','PH','LY','MX','LO'],['HM','L6','IA','D4','PD','L2','UL'],['MM','D2','LA','LD','M6','L2','AL'],['MP','mP','MB','mB'],['M6','D6','m6'],['WT','AU'],['WH','HW'],['BM','BD','B7']];
const region=[['中国','CHINA'],['日本','JAPAN'],['琉球群岛','RYUKYU'],['埃塞俄比亚','ETHIOPIA'],['印度尼西亚','INDONESIA'],['泰国','THAILAND'],['印度','INDIA'],['中东','MIDDLE EAST'],['欧洲传统','EUROPE'],['欧洲传统','EUROPE'],['欧洲与美国','EUROPE / USA'],['美国','USA'],['跨地域','GLOBAL'],['欧洲与全球','EUROPE / GLOBAL'],['欧洲与全球','EUROPE / GLOBAL'],['美国','USA']];
const eras=[['古代','ANCIENT'],['传统','TRADITION'],['传统','TRADITION'],['传统','TRADITION'],['传统','TRADITION'],['传统','TRADITION'],['传统','TRADITION'],['传统','TRADITION'],['中世纪','MEDIEVAL'],['近代','EARLY MODERN'],['近现代','MODERN'],['19世纪末','LATE 19C'],['现代','MODERN'],['19世纪起','19C ONWARD'],['19世纪起','19C ONWARD'],['20世纪','20C']];
const motifs=['檐口与斗拱','灯笼与短册','红瓦与海浪','织纹与阶梯塔','重檐与铜锣','翘檐与火焰饰','花窗与莲瓣','穹拱与花饰','卷铁与门楣','尖拱与双塔','藤蔓与玻璃','琴头与剧院灯','竹节与六弦','六瓣花窗','八瓣玫瑰窗','萨克斯与卷带'];
const motifsEn=['Eaves & timber brackets','Lantern & tanzaku','Tile roof & ocean waves','Woven border & stepped tower','Tiered roof & bronze gong','Chofa roof & flame crest','Jharokha & lotus','Ogee arch & arabesque','Iron scroll & cornice','Pointed arch & twin spires','Vines & glass','Guitar head & marquee','Bamboo & six strings','Six-petal tracery','Eight-petal rose window','Saxophone & ribbon'];
const cnfonts=['brush','mincho','happy','qingke','brush','mincho','happy','brush','mincho','qingke','happy','qingke','mincho','qingke','happy','brush'];
const enfonts=['bungee','mincho','happy','ruqaa','bungee','reem','lalezar','ruqaa','space','mincho','space','anton','dot','bungee','dela','anton'];
F.forEach((f,i)=>{f.familyIndex=i;f.regionShort={zh:region[i][0],en:region[i][1]};f.eraShort={zh:eras[i][0],en:eras[i][1]};f.motif={zh:motifs[i],en:motifsEn[i]};f.fontZh=cnfonts[i];f.fontEn=enfonts[i];f.scales.forEach((s,j)=>{s.cn=names[i][j];s.mark=marks[i][j];s.enMark=enmarks[i][j];s.familyIndex=i;s.scaleIndex=j;s.country=f.regionShort;s.era=f.eraShort;});});
// Billboard identity is native and never follows the language of the interface.
const native=[
 {font:'brush',titles:marks[0],icons:marks[0],subs:names[0]},
 {font:'mincho',titles:['陽','陰','平調子'],icons:['陽','陰','平'],subs:['ヨウ','イン','平調子']},
 {font:'mincho',titles:['島唄','琉球'],icons:['島','琉'],subs:['琉球五音','琉球六音']},
 {font:'ethiopic',titles:['ትዝታ','ትዝታ','አምባሰል'],icons:['ት','ዝ','አ'],subs:['ትዝታ ፩','ትዝታ ፪','አምባሰል']},
 {font:'bungee',titles:['SLÉNDRO','PÉLOG','PÉLOG'],icons:['SL','PE','PL'],subs:['Sléndro','Pélog','Lima']},
 {font:'thai',titles:['เสียง','เสียง','เสียง'],icons:['๗','ก','ข'],subs:['เจ็ดเสียง','ห้าเสียง ๑','ห้าเสียง ๒']},
 {font:'devanagari',titles:['श्रीरञ्जनी','यमन','हंसध्वनि'],icons:['श्री','य','हं'],subs:['राग','राग','राग']},
 {font:'ruqaa',titles:['راست','فريجيان','مزدوج'],icons:['ر','ف','م'],subs:['مقام','فريجيان','مزدوج']}
];
F.forEach((f,i)=>{const n=native[i];f.nativeFont=n?n.font:f.fontEn;f.nativeScript=['Han','Japanese','Japanese','Ethiopic','Latin','Thai','Devanagari','Arabic'][i]||'Latin';f.scales.forEach((s,j)=>{s.nativeTitle=n?n.titles[j]:s.enMark;s.nativeIcon=n?n.icons[j]:s.enMark;s.nativeSubtitle=n?n.subs[j]:s.name.replace(/ · .*/,'');});});
globalThis.STREET_CATALOG=F;
if(typeof module!=='undefined')module.exports=F;
})();
