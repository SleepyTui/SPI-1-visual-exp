/* Offline square capture. GIF89a is encoded locally in an inline Blob Worker.
   MP4 uses the browser's genuine MP4 muxer; WebM is never renamed to MP4. */
(() => {
'use strict';
function gifWorker(){
 const frames=[];let width=0,height=0;
 const u16=n=>[n&255,(n>>8)&255];
 function quantize(rgba){
  const histogram=new Uint32Array(32768),keys=new Uint16Array(rgba.length/4);
  for(let i=0,j=0;i<rgba.length;i+=4,j++){const key=(rgba[i]>>3)<<10|(rgba[i+1]>>3)<<5|(rgba[i+2]>>3);keys[j]=key;histogram[key]++;}
  const bins=[];for(let k=0;k<32768;k++)if(histogram[k])bins.push({key:k,n:histogram[k],r:(k>>10)*255/31,g:((k>>5)&31)*255/31,b:(k&31)*255/31});
  function box(colors){let lo=[255,255,255],hi=[0,0,0],count=0;for(const c of colors){const rgb=[c.r,c.g,c.b];for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],rgb[i]);hi[i]=Math.max(hi[i],rgb[i]);}count+=c.n;}const spans=hi.map((v,i)=>v-lo[i]),axis=spans.indexOf(Math.max(...spans));return{colors,count,axis,score:colors.length<2?0:spans[axis]*Math.pow(count,.35)};}
  const boxes=[box(bins)];while(boxes.length<256){let best=0;for(let i=1;i<boxes.length;i++)if(boxes[i].score>boxes[best].score)best=i;const current=boxes[best];if(current.score===0)break;const channel=['r','g','b'][current.axis],sorted=current.colors.sort((a,b)=>a[channel]-b[channel]);let sum=0,split=0;while(split<sorted.length-1&&sum<current.count/2)sum+=sorted[split++].n;split=Math.max(1,split);boxes.splice(best,1,box(sorted.slice(0,split)),box(sorted.slice(split)));}
  const palette=new Uint8Array(768),lookup=new Uint8Array(32768);
  boxes.forEach((b,i)=>{let red=0,green=0,blue=0;for(const c of b.colors){red+=c.r*c.n;green+=c.g*c.n;blue+=c.b*c.n;lookup[c.key]=i;}palette[i*3]=Math.round(red/b.count);palette[i*3+1]=Math.round(green/b.count);palette[i*3+2]=Math.round(blue/b.count);});
  return{palette,indices:Uint8Array.from(keys,k=>lookup[k])};
 }
 function lzw(indices){
  // Clear before the first bit-width boundary. Fixed 9-bit codes keep the
  // encoder small, bounded and interoperable while compressing repeated pixels.
  const output=[];let bits=0,acc=0,next=258,dict=new Map();
  const write=code=>{acc|=code<<bits;bits+=9;while(bits>=8){output.push(acc&255);acc>>>=8;bits-=8;}};
  write(256);let prefix=indices[0];for(let i=1;i<indices.length;i++){const k=indices[i],key=prefix*256+k,found=dict.get(key);if(found!==undefined){prefix=found;continue;}write(prefix);dict.set(key,next++);prefix=k;if(next>=510){write(256);dict.clear();next=258;}}
  write(prefix);write(257);if(bits)output.push(acc&255);
  const blocks=[8];for(let i=0;i<output.length;i+=255){const chunk=output.slice(i,i+255);blocks.push(chunk.length,...chunk);}blocks.push(0);return Uint8Array.from(blocks);
 }
 onmessage=event=>{try{
  const data=event.data;
  if(data.type==='frame'){width=data.width;height=data.height;const q=quantize(new Uint8ClampedArray(data.buffer));frames.push({time:data.time,palette:q.palette,data:lzw(q.indices)});postMessage({type:'frameDone'});}
  else if(data.type==='finish'){
   if(!frames.length)throw new Error('尚未采集到画面');
   const parts=[Uint8Array.from([...Array.from('GIF89a',c=>c.charCodeAt(0)),...u16(width),...u16(height),0x70,0,0,0x21,0xff,0x0b,...Array.from('NETSCAPE2.0',c=>c.charCodeAt(0)),3,1,0,0,0])];
   frames.forEach((f,i)=>{const delay=Math.max(2,Math.round((frames[i+1]?.time??data.duration)*100)-Math.round(f.time*100));parts.push(Uint8Array.from([0x21,0xf9,4,4,...u16(delay),0,0,0x2c,0,0,0,0,...u16(width),...u16(height),0x87]),f.palette,f.data);});parts.push(Uint8Array.from([0x3b]));postMessage({type:'done',blob:new Blob(parts,{type:'image/gif'})});
  }
 }catch(error){postMessage({type:'error',message:error.message});}};
}
class OrbitalCapture{
 constructor(options){Object.assign(this,options);this.output=document.createElement('canvas');this.output.width=this.output.height=this.size;this.ctx=this.output.getContext('2d',{willReadFrequently:this.format==='gif'});this.running=false;this.pending=0;this.nextFrame=0;this.lastProgress=0;this.chunks=[];}
 start(){
  this.startTime=performance.now();this.running=true;this.ctx.drawImage(this.source,0,0,this.size,this.size);
  if(this.format==='gif'){
   this.workerURL=URL.createObjectURL(new Blob(['('+gifWorker.toString()+')()'],{type:'text/javascript'}));this.worker=new Worker(this.workerURL);this.worker.onmessage=e=>{if(e.data.type==='frameDone')this.pending--;else if(e.data.type==='done')this.complete(e.data.blob);else if(e.data.type==='error')this.fail(new Error(e.data.message));};this.worker.onerror=()=>this.fail(new Error('GIF 编码器无法启动'));this.frame(this.startTime);
  }else{
   if(!this.mime)throw new Error('浏览器未提供 MP4 编码');this.stream=this.output.captureStream(this.fps);if(this.audioStream)for(const track of this.audioStream.getAudioTracks())this.stream.addTrack(track);
   this.recorder=new MediaRecorder(this.stream,{mimeType:this.mime,videoBitsPerSecond:this.size>=1080?7000000:4000000,audioBitsPerSecond:128000});this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};this.recorder.onerror=e=>this.fail(e.error||new Error('MP4 编码器出错'));this.recorder.onstop=()=>{if(!this.cancelled){if(!this.chunks.length)this.fail(new Error('录制未产生视频数据'));else this.complete(new Blob(this.chunks,{type:'video/mp4'}));}};this.recorder.start(250);
  }
  this.onProgress({elapsed:0,total:this.duration,encoding:false});
 }
 frame(now){
  if(!this.running)return;const elapsed=Math.max(0,(now-this.startTime)/1000);
  if(elapsed>=this.duration){this.stop();return;}
  if(elapsed>=this.nextFrame){this.nextFrame=(Math.floor(elapsed*this.fps)+1)/this.fps;this.ctx.drawImage(this.source,0,0,this.size,this.size);if(this.format==='gif'&&this.pending<3){const pixels=this.ctx.getImageData(0,0,this.size,this.size);this.pending++;this.worker.postMessage({type:'frame',buffer:pixels.data.buffer,width:this.size,height:this.size,time:elapsed},[pixels.data.buffer]);}}
  if(now-this.lastProgress>100){this.lastProgress=now;this.onProgress({elapsed,total:this.duration,encoding:false});}
 }
 stop(){if(!this.running)return;this.running=false;const elapsed=Math.min(this.duration,(performance.now()-this.startTime)/1000);this.onProgress({elapsed,total:this.duration,encoding:true});if(this.format==='gif')this.worker.postMessage({type:'finish',duration:elapsed});else if(this.recorder.state!=='inactive')this.recorder.stop();}
 cleanup(){if(this.worker){this.worker.terminate();this.worker=null;}if(this.workerURL)URL.revokeObjectURL(this.workerURL);if(this.stream)this.stream.getVideoTracks().forEach(t=>t.stop());this.chunks=[];}
 cancel(){this.cancelled=true;this.running=false;if(this.recorder&&this.recorder.state!=='inactive')this.recorder.stop();this.cleanup();}
 complete(blob){if(this.cancelled)return;this.cleanup();this.onDone(blob);}
 fail(error){if(this.cancelled)return;this.cancel();this.onError(error);}
}
window.OrbitalCapture=OrbitalCapture;
})();
