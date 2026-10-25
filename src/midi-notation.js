// MIDI has no spelling, hand assignments or written rhythm. This creates a
// readable, explicitly quantized 16th-note transcription without changing audio.
const escapeXML=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const pitches=[['C',0],['C',1],['D',0],['D',1],['E',0],['F',0],['F',1],['G',0],['G',1],['A',0],['A',1],['B',0]];
const values=[[16,'whole'],[12,'half',true],[8,'half'],[6,'quarter',true],[4,'quarter'],[3,'eighth',true],[2,'eighth'],[1,'16th']];
function fragments(duration){const parts=[];for(const [value,type,dot] of values)while(duration>=value){parts.push({value,type,dot});duration-=value;}return parts;}
function noteXML(pitch,chunk,voice,staff,{chord=false,start=false,stop=false}={}){
 const p=pitch===null?'<rest/>':`<pitch><step>${pitches[pitch%12][0]}</step>${pitches[pitch%12][1]?'<alter>1</alter>':''}<octave>${Math.floor(pitch/12)-1}</octave></pitch>`;
 return `<note>${chord?'<chord/>':''}${p}<duration>${chunk.value}</duration>${stop?'<tie type="stop"/>':''}${start?'<tie type="start"/>':''}<voice>${voice}</voice><type>${chunk.type}</type>${chunk.dot?'<dot/>':''}<staff>${staff}</staff>${start||stop?`<notations>${stop?'<tied type="stop"/>':''}${start?'<tied type="start"/>':''}</notations>`:''}</note>`;
}
export function midiNotation(midi,score){
 const ppq=midi.header.ppq;const notes=midi.tracks.filter(t=>t.channel!==9).flatMap(t=>t.notes).filter(n=>n.midi>=21&&n.midi<=108).map(n=>({midi:n.midi,start:Math.round(n.ticks/ppq*4),end:Math.max(Math.round((n.ticks+n.durationTicks)/ppq*4),Math.round(n.ticks/ppq*4)+1),staff:n.midi<60?2:1}));
 if(notes.length>30000)return {notationUnavailable:'MIDI 音符过多，请导出 MusicXML 以查看完整五线谱。',measures:[],tempoMap:[]};
 const groups=new Map();for(const n of notes){const key=`${n.staff}:${n.start}:${n.end}`;if(!groups.has(key))groups.set(key,{...n,pitches:[]});groups.get(key).pitches.push(n.midi);}
 const voices=[];for(const g of [...groups.values()].sort((a,b)=>a.start-b.start||a.end-b.end)){let v=voices.find(v=>v.staff===g.staff&&v.end<=g.start);if(!v){v={staff:g.staff,end:0,notes:[],id:voices.length+1};voices.push(v);}v.notes.push(g);v.end=g.end;}
 // Preserve changes of meter; every measure's notation is mapped back to MIDI seconds.
 const signatures=(midi.header.timeSignatures.length?midi.header.timeSignatures:[{ticks:0,timeSignature:[4,4]}]).map(t=>({unit:Math.round(t.ticks/ppq*4),beats:t.timeSignature[0],type:t.timeSignature[1]})).sort((a,b)=>a.unit-b.unit);
 if(signatures[0].unit>0)signatures.unshift({unit:0,beats:4,type:4});
 const end=Math.max(...notes.map(n=>n.end));const measures=[];let unit=0,number=1;
 while(unit<end){let sig=signatures[0];for(const s of signatures){if(s.unit>unit)break;sig=s;}const next=signatures.find(s=>s.unit>unit)?.unit??Infinity;const length=Math.max(1,Math.min(Math.round(sig.beats*16/sig.type),next-unit));measures.push({sourceIndex:measures.length,number:String(number++),unit,length,beats:sig.beats,beatType:sig.type,startBeat:unit/4,endBeat:(unit+length)/4,startTime:midi.header.ticksToSeconds(unit/4*ppq),endTime:midi.header.ticksToSeconds((unit+length)/4*ppq)});unit+=length;}
 const measuresXML=measures.map((m,i)=>{
  let body=`<attributes><divisions>4</divisions>${i===0?'<key><fifths>0</fifths></key>':''}<time><beats>${m.beats}</beats><beat-type>${m.beatType}</beat-type></time>${i===0?'<staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>':''}</attributes>`;
  for(const [vi,v] of voices.entries()){if(vi)body+=`<backup><duration>${m.length}</duration></backup>`;let cursor=m.unit;
   for(const n of v.notes){if(n.end<=m.unit||n.start>=m.unit+m.length)continue;const start=Math.max(n.start,m.unit),end=Math.min(n.end,m.unit+m.length);
    for(const chunk of fragments(start-cursor))body+=noteXML(null,chunk,v.id,v.staff);
    const chunks=fragments(end-start);for(const [ci,chunk] of chunks.entries())for(const [pi,pitch] of n.pitches.entries())body+=noteXML(pitch,chunk,v.id,v.staff,{chord:pi>0,stop:n.start<m.unit||ci>0,start:n.end>m.unit+m.length||ci<chunks.length-1});cursor=end;
   }
   for(const chunk of fragments(m.unit+m.length-cursor))body+=noteXML(null,chunk,v.id,v.staff);
  }
  return `<measure number="${m.number}">${body}</measure>`;
 }).join('');
 const tempoMap=(midi.header.tempos.length?midi.header.tempos:[{ticks:0,bpm:120}]).map(t=>({beat:t.ticks/ppq,bpm:t.bpm,time:midi.header.ticksToSeconds(t.ticks)}));if(tempoMap[0].beat>0)tempoMap.unshift({beat:0,bpm:120,time:0});
 return {notationXML:`<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${escapeXML(score.title)}</work-title></work><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">${measuresXML}</part></score-partwise>`,measures,tempoMap,hasFingerings:false};
}
