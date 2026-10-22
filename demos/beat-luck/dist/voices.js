/* Original drum-synthesis presets: each track loads the matching style voice.
   Names describe sonic references, not sampled or exact hardware emulations. */
const voice=(name,model,synth,tune,decay,color,punch,drive,fm,level=78,pan=0)=>({name,model,synth,tune,decay,color,punch,drive,fm,level,pan});
const DRUM_KITS=[
[voice('Warehouse 909','909','va',-2,430,62,88,44,18,86),voice('Steel snare','909','va',1,180,73,80,34,25,74),voice('Open metal','metal','va',0,165,80,68,22,32,58,12),voice('Machine rim','rim','fm',-3,100,65,85,35,52,62,-16)],
[voice('Trance punch','punch','va',1,310,76,96,30,22,88),voice('Wide clap','clap','va',2,270,82,88,18,18,72),voice('Bright 909','metal','va',3,120,92,82,12,34,55,15),voice('Laser tom','zap','fm',5,220,84,78,16,65,58,-20)],
[voice('Round 909','909','va',-1,350,48,74,20,12,84),voice('House clap','clap','va',-1,220,65,70,12,16,74),voice('Disco shaker','shaker','va',0,95,72,56,8,12,61,20),voice('Conga wood','conga','va',0,180,43,70,12,10,66,-22)],
[voice('Garage sub','808','va',2,270,38,83,18,12,88),voice('Rim + clap','rimclap','va',4,145,76,91,20,22,75),voice('Skippy hat','metal','va',5,47,89,88,12,25,58,17),voice('2-step rim','rim','va',7,66,62,96,18,20,66,-19)],
[voice('Square sub','sub','va',-5,620,35,92,52,38,89),voice('Cold snare','metalSnare','fm',-4,210,65,90,39,70,77),voice('Tight chrome','metal','va',-2,44,78,94,28,38,54,7),voice('Grime zap','zap','fm',-7,270,58,89,41,82,64,-10)],
[voice('Dusty kick','acoustic','va',-5,290,24,52,29,8,86),voice('Tape break','acoustic','va',-4,260,29,58,35,12,78),voice('Brushed dust','dust','va',-6,120,28,35,22,8,59,15),voice('Vinyl knock','wood','va',-5,95,22,65,31,9,58,-26)],
[voice('Boom bap 808','808','va',-3,370,35,86,32,15,88),voice('Crate snare','acoustic','va',-2,190,46,87,38,20,81),voice('Closed 808','noise','va',-2,63,58,70,16,10,56,12),voice('Bronx bell','cowbell','va',-3,180,49,74,27,20,62,-18)],
[voice('Long-tail 808','808','va',-7,1120,30,84,38,16,87),voice('Snap rim','rimclap','va',5,120,80,98,20,18,77),voice('Rolling 808','noise','va',5,31,96,92,12,24,55,15),voice('Sub tom','tom','va',-8,360,39,82,29,22,68,-15)],
[voice('FM impact','fmKick','fm',1,230,80,92,40,76,86),voice('Alloy snare','metalSnare','fm',7,170,88,84,30,91,74),voice('Inharmonic hat','digital','fm',4,71,94,90,36,88,54,24),voice('Micro circuit','glitch','fm',8,83,90,96,62,95,60,-26)],
[voice('Break kick','acoustic','va',1,245,58,89,34,18,87),voice('Break snare','acoustic','va',2,240,65,94,30,25,82),voice('Break shaker','shaker','va',2,88,81,75,22,19,61,18),voice('Percussion wood','wood','va',3,110,61,85,26,26,65,-20)],
[voice('Neuro punch','punch','va',3,175,68,100,48,34,88),voice('Jungle snap','909','va',5,145,88,99,42,38,83),voice('Tight break hat','noise','va',4,38,93,98,23,36,58,16),voice('Ghost rim','rim','va',6,55,78,86,30,35,63,-18)],
[voice('Crunch kick','punch','va',-3,310,60,94,67,50,85),voice('Broken clap','clap','va',-3,200,69,89,64,60,76),voice('Bit hat','digital','fm',-1,83,80,85,72,73,56,22),voice('Glitch circuit','glitch','fm',-4,150,76,92,78,92,65,-25)]
];
const VOICE_PARAMS=[
{key:'tune',label:'TUNE',min:-12,max:12,unit:' st'},
{key:'decay',label:'DECAY',min:20,max:1600,step:5,unit:' ms'},
{key:'color',label:'COLOR',min:0,max:100,unit:'%'},
{key:'punch',label:'PUNCH / SNAP',min:0,max:100,unit:'%'},
{key:'drive',label:'DRIVE',min:0,max:100,unit:'%'},
{key:'fm',label:'FM DEPTH',min:0,max:100,unit:'%'},
{key:'pan',label:'PAN',min:-100,max:100,unit:''},
{key:'level',label:'LEVEL',min:0,max:100,unit:'%'}
];
if(typeof module==='object'&&module.exports)module.exports={DRUM_KITS,VOICE_PARAMS};
