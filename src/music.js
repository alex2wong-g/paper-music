import { Midi } from '@tonejs/midi';
import { unzipSync, strFromU8 } from 'fflate';
export async function readScore(file) {
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(String.fromCharCode(...bytes.slice(0,4))==='MThd') {const m=new Midi(bytes);if(m.header.ppq===undefined)throw Error('SMPTE MIDI is not supported.');return finish({title:m.name||file.name.replace(/\.[^.]+$/,''),composer:'Imported MIDI',bpm:m.header.tempos[0]?.bpm||120,notes:m.tracks.filter(t=>t.channel!==9).flatMap(t=>t.notes.map(n=>({midi:n.midi,time:n.time,duration:n.duration,velocity:n.velocity})))})}
 let xml;
 if(bytes[0]===80&&bytes[1]===75){const z=unzipSync(bytes);const container=z['META-INF/container.xml'];const root=container&&new DOMParser().parseFromString(strFromU8(container),'application/xml').querySelector('rootfile')?.getAttribute('full-path');const key=root||Object.keys(z).find(k=>/\.(musicxml|xml)$/i.test(k)&&!k.startsWith('META-INF'));if(!key||!z[key])throw Error('No MusicXML score found in this archive.');xml=strFromU8(z[key]);}else xml=new TextDecoder().decode(bytes);
 return parseXML(xml,file.name);
}
export function finish(s){s.notes=s.notes.filter(n=>Number.isFinite(n.time)&&n.midi>=21&&n.midi<=108&&n.duration>0).sort((a,b)=>a.time-b.time);if(!s.notes.length)throw Error('No playable piano notes were found (A0–C8).');s.duration=Math.max(...s.notes.map(n=>n.time+n.duration))+.8;return s;}
function expandRepeats(part){
 const measures=[...part.querySelectorAll(':scope > measure')],endingAt=[],state=new Map(),prepared=[];let ending=[];
 for(const measure of measures){const start=measure.querySelector('ending[type="start"]');if(start)ending=start.getAttribute('number').split(/[, ]+/).map(Number);endingAt.push([...ending]);const attrs=measure.querySelector('attributes');if(attrs)for(const a of attrs.children)state.set(a.tagName,a.cloneNode(true));const copy=measure.cloneNode(true);copy.querySelector('attributes')?.remove();const merged=part.ownerDocument.createElement('attributes');for(const a of state.values())merged.appendChild(a.cloneNode(true));copy.prepend(merged);prepared.push(copy);if(measure.querySelector('ending[type="stop"], ending[type="discontinue"]'))ending=[];}
 let i=0,repeatStart=0,pass=1,steps=0;const passes=new Map(),expanded=[];
 while(i<measures.length&&steps++<10000){const m=measures[i];if(m.querySelector('repeat[direction="forward"]'))repeatStart=i;if(!endingAt[i].length||endingAt[i].includes(pass))expanded.push(prepared[i].cloneNode(true));const backward=m.querySelector('repeat[direction="backward"]');if(backward){const count=passes.get(i)||1,total=Math.min(8,Math.max(2,Number(backward.getAttribute('times'))||2));if(count<total){passes.set(i,count+1);pass=count+1;i=repeatStart;continue;}passes.delete(i);pass=count;repeatStart=i+1;}i++;}
 if(steps>=10000)throw Error('This score contains an invalid repeat structure.');part.replaceChildren(...expanded);
}
export function parseXML(xml,name='Untitled'){
 const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw Error('This MusicXML file is not valid XML.');if(doc.documentElement.localName!=='score-partwise')throw Error('Please export as partwise MusicXML.');
 for(const part of doc.querySelectorAll('score-partwise > part'))expandRepeats(part);
 const notes=[],tempos=[{beat:0,bpm:120}],steps={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const val=(el,q,def=0)=>Number(el.querySelector(q)?.textContent??def);
 for(const part of doc.querySelectorAll('score-partwise > part')){let cursor=0,div=1,beats=4,beatType=4,transpose=0;const ties=new Map();
 for(const measure of part.querySelectorAll(':scope > measure')){const start=cursor;let end=start,lastStart=start;
 for(const el of measure.children){if(el.tagName==='attributes'){div=val(el,'divisions',div);beats=val(el,'time > beats',beats);beatType=val(el,'time > beat-type',beatType);if(el.querySelector('transpose'))transpose=val(el,'transpose > chromatic')+12*val(el,'transpose > octave-change');}
 if(el.tagName==='direction'){const sound=el.querySelector('sound[tempo]');const metro=el.querySelector('metronome');let bpm=sound?Number(sound.getAttribute('tempo')):0;if(!bpm&&metro){const unit={whole:4,half:2,quarter:1,eighth:.5,'16th':.25}[metro.querySelector('beat-unit')?.textContent]||1;bpm=val(metro,'per-minute',120)*unit*(metro.querySelector('beat-unit-dot')?1.5:1);}if(bpm>0)tempos.push({beat:cursor+val(el,'offset')/div,bpm});}
 if(el.tagName==='backup')cursor-=val(el,'duration')/div;
 if(el.tagName==='forward'){cursor+=val(el,'duration')/div;end=Math.max(end,cursor);}
 if(el.tagName==='note'){const duration=val(el,'duration')/div,chord=!!el.querySelector('chord'),onset=chord?lastStart:cursor;if(!chord)lastStart=cursor;
 const pitch=el.querySelector('pitch');if(pitch&&duration>0){const midi=(val(pitch,'octave',4)+1)*12+steps[pitch.querySelector('step')?.textContent]+val(pitch,'alter')+transpose;const key=`${val(el,'voice',1)}:${midi}`;const ts=[...el.querySelectorAll('tie')].map(t=>t.getAttribute('type'));if(ts.includes('stop')&&ties.has(key)){const n=ties.get(key);n.duration=Math.max(n.duration,onset+duration-n.time);if(!ts.includes('start'))ties.delete(key);}else{const n={midi,time:onset,duration,velocity:.7};notes.push(n);if(ts.includes('start'))ties.set(key,n);}}
 if(!chord)cursor+=duration;end=Math.max(end,cursor);}}
 cursor=Math.max(end,start+(measure.getAttribute('implicit')==='yes'?0:beats*4/beatType));}}
 tempos.sort((a,b)=>a.beat-b.beat);const unique=[];for(const t of tempos){if(unique.at(-1)?.beat===t.beat)unique[unique.length-1]=t;else unique.push(t);}const seconds=b=>{let t=0;for(let i=0;i<unique.length;i++){const p=unique[i],next=unique[i+1]?.beat??Infinity;if(b<=p.beat)break;t+=(Math.min(b,next)-p.beat)*60/p.bpm;if(b<=next)break;}return t;};
 return finish({title:doc.querySelector('work-title, movement-title')?.textContent||name.replace(/\.[^.]+$/,''),composer:doc.querySelector('creator[type="composer"]')?.textContent||'Imported MusicXML',bpm:unique[0]?.bpm||120,notes:notes.map(n=>({...n,time:seconds(n.time),duration:seconds(n.time+n.duration)-seconds(n.time)}))});
}
export function demo(){const melody=[76,75,76,75,76,71,74,72,69,60,64,69,71,64,68,71,72,64,76,75,76,75,76,71,74,72,69,60,64,69,71,64,72,71,69];const n=[];let t=0;for(let r=0;r<4;r++)for(let i=0;i<melody.length;i++){const d=[8,12,16,26,30,34].includes(i)?.48:.24;n.push({midi:melody[i],time:t,duration:d*.88,velocity:.65});if(i%4===0){n.push({midi:i<17?45:40,time:t,duration:.7,velocity:.36});n.push({midi:i<17?52:56,time:t+.24,duration:.42,velocity:.3});}t+=d;}return finish({title:'Für Elise',composer:'Ludwig van Beethoven',bpm:104,notes:n});}
export class PianoAudio {
 async init(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=.65;this.master.connect(this.ctx.destination);this.voices=new Set();}await this.ctx.resume();}
 setVolume(v){if(this.master)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.02);}
 note(midi,duration,velocity=.65,delay=0){if(!this.ctx)return;const at=this.ctx.currentTime+delay;const g=this.ctx.createGain();const freq=440*2**((midi-69)/12);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(velocity*.19,at+.006);g.gain.exponentialRampToValueAtTime(.035*velocity,at+.18);g.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.22,duration+.15));g.connect(this.master);const waves=[[1,1],[2,.23],[3,.10],[4.01,.035]];for(const [ratio,vol] of waves){const o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type='sine';o.frequency.value=freq*ratio;a.gain.value=vol;o.connect(a);a.connect(g);o.start(at);o.stop(at+Math.max(.24,duration+.2));}this.voices.add(g);setTimeout(()=>{g.disconnect();this.voices.delete(g)},(delay+duration+.5)*1000);}
 stop(){for(const g of this.voices||[]){g.gain.cancelScheduledValues(this.ctx.currentTime);g.gain.setTargetAtTime(0,this.ctx.currentTime,.008);}}
}
