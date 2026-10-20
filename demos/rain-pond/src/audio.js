import * as Tone from 'tone';
import {RainProcess} from './domain.js';

// One persistent sound entity owns voices, effects, clock and the note generator.
// UI skins receive its events but cannot reconstruct or reset this instance.
export class SoundEntity {
  constructor(state) {
    this.state=state;this.process=new RainProcess(state);this.listeners=new Set();
    this.running=false;this.initialized=false;this.events=[];this.counts={water:0,leaf:0,dish:0};
    this.instanceId=crypto.randomUUID();this.error='';this.lastChord='Dm9';this.step=0;
    this.generation=0;this.timer=null;
    this.reservations={water:[],leaf:[],dish:[]};
    this.lastTails={water:state.waterTail,leaf:state.leafTail,dish:state.dishTail};
  }
  async init() {
    if(this.initialized) {await Tone.start();return;}
    await Tone.start();
    this.output=new Tone.Gain(0);
    this.limiter=new Tone.Limiter(-3).toDestination();
    this.meter=new Tone.Meter({normalRange:true,smoothing:.75});
    this.waveform=new Tone.Waveform(512);
    this.output.connect(this.limiter);this.limiter.connect(this.meter);
    this.limiter.connect(this.waveform);
    this.reverb=new Tone.Reverb({decay:3.2,preDelay:.055,wet:1});
    this.reverbFilter=new Tone.Filter(2600,'lowpass');
    this.wet=new Tone.Gain(this.state.reverb*.55);
    this.reverb.chain(this.reverbFilter,this.wet,this.output);
    this.channels={};this.filters={};this.sends={};this.voices={};
    const configs={
      water:{voice:Tone.AMSynth,maxPolyphony:10,options:{harmonicity:1.5,oscillator:{type:'sine'},modulation:{type:'sine'},envelope:{attack:.045,decay:.9,sustain:.2,release:2.8},modulationEnvelope:{attack:.12,decay:.75,sustain:.3,release:1.2}},cutoff:2400,send:.60},
      // Subtractive bass: a sawtooth and a moving low-pass give the low root
      // audible upper harmonics, including on speakers with weak sub response.
      leaf:{voice:Tone.MonoSynth,maxPolyphony:2,options:{volume:-7,oscillator:{type:'sawtooth'},filter:{type:'lowpass',rolloff:-24,Q:.8},envelope:{attack:.008,decay:.25,sustain:.3,release:1.5},filterEnvelope:{attack:.006,decay:.28,sustain:.12,release:.5,baseFrequency:220,octaves:2.5,exponent:1.2}},cutoff:1800,send:.09},
      // Short, inharmonic ceramic partials; independent of the water instrument.
      dish:{voice:Tone.FMSynth,maxPolyphony:4,options:{harmonicity:2.71,modulationIndex:3.2,oscillator:{type:'sine'},modulation:{type:'sine'},envelope:{attack:.001,decay:.19,sustain:0,release:.75},modulationEnvelope:{attack:.001,decay:.12,sustain:0,release:.15}},cutoff:4200,send:.34}
    };
    for(const [name,c] of Object.entries(configs)) {
      const voice=new Tone.PolySynth({voice:c.voice,maxPolyphony:c.maxPolyphony,options:c.options});
      const filter=new Tone.Filter(c.cutoff,'lowpass');
      const gain=new Tone.Gain(this.state[name]*(name==='leaf'?.95:name==='dish'?.55:.42));
      const send=new Tone.Gain(c.send);
      voice.chain(filter,gain);gain.connect(this.output);gain.chain(send,this.reverb);
      this.voices[name]=voice;this.filters[name]=filter;this.channels[name]=gain;this.sends[name]=send;
    }
    await this.reverb.ready;
    this.initialized=true;this.apply();
  }
  async start() {
    if(this.running)return;
    const request=++this.generation;
    await this.init();
    if(request!==this.generation)return;
    this.running=true;this.next=Tone.now()+.65;
    this.output.gain.rampTo(this.state.master*.35,.12);
    this.pump();this.timer=setInterval(()=>this.pump(),25);
  }
  pause() {
    ++this.generation;this.running=false;clearInterval(this.timer);this.timer=null;
    if(this.initialized) {this.output.gain.rampTo(0,.08);for(const voice of Object.values(this.voices))voice.releaseAll(Tone.now()+.085);}
    // Keep in-flight event history for a rapid resume; the output is muted.
  }
  pump() {
    if(!this.running)return;
    const now=Tone.now();
    if(this.next<now+.08)this.next=now+.65;
    while(this.next<now+.85) {
      const events=this.process.generate(this.next,this.step++);
      this.lastChord=this.process.chord.name;
      for(let event of events) {
        const name=event.material,capacity={water:10,leaf:2,dish:4}[name];
        this.reservations[name]=this.reservations[name].filter(end=>end>event.time);
        if(event.audible&&this.reservations[name].length>=capacity)event=Object.freeze({...event,audible:false,reason:'voice-cap'});
        if(event.audible) {
          this.voices[event.material].triggerAttackRelease(Tone.Frequency(event.midi,'midi').toFrequency(),event.material==='water'?.5:event.material==='leaf'?.28:.06,event.time,event.velocity);
          const duration=event.material==='water'?.5:event.material==='leaf'?.28:.06;
          this.reservations[name].push(event.time+duration+this.state[name+'Tail']+.15);
          this.counts[event.material]++;
        }
        this.events.push(event);
        for(const fn of this.listeners)fn(event);
      }
      this.next+=60/this.state.bpm/2;
    }
    this.events=this.events.filter(e=>e.time>now-9).slice(-200);
  }
  apply() {
    if(!this.initialized)return;
    const s=this.state;
    // Tone schedules release just in time. Increasing a release while notes are
    // still pending can lengthen their occupancy, so retain their slots longer.
    for(const name of ['water','leaf','dish']){const tail=s[name+'Tail'],extra=Math.max(0,tail-this.lastTails[name]);if(extra)this.reservations[name]=this.reservations[name].map(end=>end+extra);this.lastTails[name]=tail;}
    this.output.gain.rampTo(this.running?s.master*.35:0,.07);
    for(const name of ['water','leaf','dish'])this.channels[name].gain.rampTo(s[name]*(name==='leaf'?.95:name==='dish'?.55:.42),.08);
    this.wet.gain.rampTo(s.reverb*.55,.12);
    this.filters.water.frequency.rampTo(1000+s.brightness*3200,.1);
    this.filters.dish.frequency.rampTo(1800+s.brightness*5200,.1);
    this.voices.water.set({envelope:{release:s.waterTail}});
    this.voices.leaf.set({envelope:{release:s.leafTail}});
    this.voices.dish.set({envelope:{release:s.dishTail}});
  }
  now() {return this.initialized?Tone.getContext().rawContext.currentTime:0;}
  level() {return this.initialized?this.meter.getValue():0;}
  samplePeak(){return this.initialized?Math.max(...Array.from(this.waveform.getValue(),Math.abs)):0;}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  dispose(){this.pause();if(!this.initialized)return;for(const dict of [this.voices,this.filters,this.channels,this.sends])Object.values(dict).forEach(n=>n.dispose());[this.output,this.limiter,this.meter,this.waveform,this.reverb,this.reverbFilter,this.wet].forEach(n=>n.dispose());}
}
