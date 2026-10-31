import {t,applyI18n} from './i18n.js';
import {positionAtTime} from './music.js';
const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const noteName=m=>`${names[m%12]}${Math.floor(m/12)-1}`;
export class SheetView {
 constructor(root,{onPreview,onError}={}){
  this.root=root;this.onError=onError;this.onPreview=onPreview;this.visible=false;this.version=0;this.queue=Promise.resolve();this.lastTime=0;this.follow=true;
  root.innerHTML=`<div class="sheet-heading"><div><span class="sheet-eyebrow" data-i18n="sheetEyebrow">循谱听音</span><span class="sheet-position" id="sheet-position" data-i18n="sheetPosition">五线谱 · 跟随演奏</span></div><button class="follow-button selected" id="sheet-follow" data-i18n="follow" aria-pressed="true">自动跟随</button></div><div class="sheet-scroll" tabindex="0" aria-label="五线谱，可上下滚动" data-i18n-aria="sheetScroll"><div class="sheet-message" role="status">正在准备五线谱…</div><div class="notation-paper"><div id="notation"></div></div></div><div class="study-panel"><div class="study-notes"><div class="hand-readout left"><span data-i18n="left">左手</span><output id="left-notes">—</output></div><div class="hand-readout right"><span data-i18n="right">右手</span><output id="right-notes">—</output></div><span class="study-label" data-i18n="middleC">C4 中央 C · 点击琴键试听</span></div><div class="study-keyboard-scroll"><div class="study-keyboard" aria-label="跟随乐谱的钢琴键盘" data-i18n-aria="keyboardAria"></div></div><p class="fingering-hint"></p></div>`;
  this.host=root.querySelector('#notation');this.scroller=root.querySelector('.sheet-scroll');this.message=root.querySelector('.sheet-message');
  root.querySelector('#sheet-follow').onclick=()=>{this.follow=!this.follow;const b=root.querySelector('#sheet-follow');b.classList.toggle('selected',this.follow);b.setAttribute('aria-pressed',String(this.follow));b.textContent=t(this.follow?'follow':'browse');b.setAttribute('data-i18n',this.follow?'follow':'browse');if(this.follow)this.sync(this.lastTime,true);};
  let width=0;this.resizeObserver=new ResizeObserver(entries=>{const w=Math.round(entries[0].contentRect.width);if(Math.abs(w-width)<4)return;width=w;clearTimeout(this.resizeTimer);this.resizeTimer=setTimeout(()=>{if(this.visible&&this.osmd&&this.renderedScore===this.score)this.renderAgain();},180);});this.resizeObserver.observe(this.scroller);
 }
 setScore(score){this.score=score;this.version++;this.root.dataset.ready='loading';this.renderedScore=null;this.entries=null;this.lastCursorKey=null;this.lastNotesKey=null;this.lastOccurrence=-1;this.host.replaceChildren();this.buildKeyboard();
  this.renderHint();
  if(this.visible)return this.prepare();
 }
 renderHint(){if(this.score)this.root.querySelector('.fingering-hint').textContent=t(this.score.kind==='midi'?'fingersMidi':this.score.hasFingerings?'fingersWritten':'fingersAbsent');}
 localize(){applyI18n(this.root);this.renderHint();this.message.textContent=t(this.root.dataset.ready==='error'?'sheetError':'sheetLoading');this.root.querySelectorAll('[data-study-key]').forEach(b=>b.setAttribute('aria-label',t('preview',{note:noteName(Number(b.dataset.studyKey))})));this.lastNotesKey=null;this.lastCursorKey=null;if(this.score)this.sync(this.lastTime,true);}
 async show(){this.visible=true;if(this.renderedScore!==this.score)await this.prepare();this.sync(this.lastTime,true);}
 hide(){this.visible=false;}
 prepare(){const version=this.version;this.message.hidden=false;this.message.textContent=t('sheetLoading');this.scroller.setAttribute('aria-busy','true');
  this.queue=this.queue.catch(()=>{}).then(async()=>{
   if(version!==this.version||!this.visible)return;
   if(!this.score.notationXML)throw Error(this.score.notationUnavailable||'这份乐谱暂时无法显示五线谱。');
   if(!this.osmd){const module=await import('opensheetmusicdisplay');const lib=module.OpenSheetMusicDisplay?module:module.default;this.lib=lib;this.osmd=new lib.OpenSheetMusicDisplay(this.host,{backend:'svg',autoResize:false,drawTitle:false,drawSubtitle:false,drawComposer:false,drawCredits:false,drawPartNames:false,drawPartAbbreviations:false,drawFingerings:true,drawMeasureNumbers:true,useXMLMeasureNumbers:true,drawSlurs:true,newPageFromXML:false,newSystemFromXML:false,newSystemFromNewPageInXML:false,followCursor:false,defaultColorMusic:'#444337',defaultColorLabel:'#726a54',defaultColorTitle:'#444337',cursorsOptions:[{type:0,color:'#b49860',alpha:.32,follow:false}]});this.osmd.Zoom=.95;}
   if(version!==this.version||!this.visible)return;
   this.host.style.width=`${Math.max(600,this.scroller.clientWidth-40)}px`;
   await this.osmd.load(new DOMParser().parseFromString(this.score.notationXML,'application/xml'));if(version!==this.version)return;
   this.osmd.render();this.indexPositions();this.renderedScore=this.score;this.message.hidden=true;this.root.dataset.ready='true';this.scroller.setAttribute('aria-busy','false');this.sync(this.lastTime,true);
  }).catch(error=>{if(version!==this.version)return;this.message.hidden=false;this.message.textContent=t('sheetError');this.scroller.setAttribute('aria-busy','false');this.root.dataset.ready='error';this.onError?.(error);});
  return this.queue;
 }
 renderAgain(){try{this.host.style.width=`${Math.max(600,this.scroller.clientWidth-40)}px`;this.osmd.render();this.indexPositions();this.sync(this.lastTime,true);}catch(error){this.onError?.(error);}}
 indexPositions(){
  const cursor=this.osmd.cursor;cursor.reset();this.entries=new Map();const it=cursor.Iterator;let count=0;
  while(!it.EndReached&&count++<150000){const sourceIndex=it.CurrentMeasureIndex,relativeBeat=it.CurrentRelativeInMeasureTimestamp?.RealValue*4;
   if(Number.isFinite(relativeBeat)&&sourceIndex>=0&&!it.FrontReached){if(!this.entries.has(sourceIndex))this.entries.set(sourceIndex,[]);const entries=this.entries.get(sourceIndex);if(!entries.some(e=>Math.abs(e.beat-relativeBeat)<1e-7))entries.push({beat:relativeBeat,iterator:it.clone()});}
   it.moveToNext();
  }
  for(const entries of this.entries.values())entries.sort((a,b)=>a.beat-b.beat);cursor.reset();cursor.show();cursor.cursorElement.classList.add('sheet-cursor');this.lastCursorKey=null;
 }
 sync(time,force=false){this.lastTime=time;if(!this.visible)return;this.updateKeys(time,force);const p=positionAtTime(this.score,time);if(!p)return;
  const beat=Math.floor(p.relativeBeat*p.beatType/4+1e-6)+1;const label=`${p.number==='0'?t('pickup'):t('measure',{number:p.number})} · ${t('beat',{number:beat})}`;const position=this.root.querySelector('#sheet-position');if(position.textContent!==label)position.textContent=label;
  this.root.dataset.sourceMeasure=String(p.sourceIndex);this.root.dataset.occurrence=String(p.occurrence);this.root.dataset.relativeBeat=String(p.relativeBeat);
  if(this.renderedScore!==this.score||!this.entries)return;const entries=this.entries.get(p.sourceIndex);if(!entries?.length)return;let target=entries[0],index=0;
  for(let i=0;i<entries.length;i++){if(entries[i].beat>p.relativeBeat+1e-6)break;target=entries[i];index=i;}
  const key=`${p.sourceIndex}:${index}:${p.occurrence}`;if(!force&&key===this.lastCursorKey)return;
  this.lastCursorKey=key;const cursor=this.osmd.cursor;cursor.iterator=target.iterator.clone();cursor.show();cursor.update();cursor.cursorElement.classList.add('sheet-cursor');
  const el=cursor.cursorElement;this.root.dataset.cursorMeasure=String(cursor.Iterator.CurrentMeasureIndex);this.root.dataset.cursorBeat=String(target.beat);
  // Scroll only the paper viewport, never the whole page or the transport bar.
  if(this.follow){const box=el.getBoundingClientRect(),view=this.scroller.getBoundingClientRect();if(force||box.top<view.top+18||box.bottom>view.bottom-18){this.scroller.scrollTop+=box.top-view.top-Math.max(22,(view.height-box.height)/3);}if(box.left<view.left+12||box.right>view.right-12)this.scroller.scrollLeft+=box.left-view.left-view.width/2;}
 }
 buildKeyboard(){const notes=this.score.notes,min=notes.reduce((a,n)=>Math.min(a,n.midi),60),max=notes.reduce((a,n)=>Math.max(a,n.midi),72);this.first=Math.max(21,Math.min(48,Math.floor(min/12)*12));this.last=Math.min(108,Math.max(83,Math.ceil((max+1)/12)*12-1));const white=[];for(let m=this.first;m<=this.last;m++)if(![1,3,6,8,10].includes(m%12))white.push(m);
  const keyboard=this.root.querySelector('.study-keyboard');keyboard.style.minWidth=`${white.length*23}px`;keyboard.innerHTML=white.map(m=>`<button class="study-key white${m===60?' middle-c':''}" data-study-key="${m}" aria-label="${t('preview',{note:noteName(m)})}" title="${noteName(m)}"><span>${noteName(m)}</span><b></b></button>`).join('')+white.flatMap((m,i)=>[0,2,5,7,9].includes(m%12)&&m<this.last?[`<button class="study-key black" data-study-key="${m+1}" aria-label="${t('preview',{note:noteName(m+1)})}" title="${noteName(m+1)}" style="left:${(i+1)/white.length*100}%;width:${.62/white.length*100}%"><b></b></button>`]:[]).join('');
  keyboard.querySelectorAll('[data-study-key]').forEach(button=>button.onclick=()=>this.onPreview?.(Number(button.dataset.studyKey)));
 }
 updateKeys(time,force){const active=this.score.notes.filter(n=>n.time<=time+1e-6&&n.time+n.duration>time+1e-6);const key=active.map(n=>`${n.midi}:${n.hand}:${n.fingering||''}`).join(',');if(!force&&key===this.lastNotesKey)return;this.lastNotesKey=key;
  for(const hand of ['left','right']){const notes=active.filter(n=>(n.hand||'right')===hand);this.root.querySelector(`#${hand}-notes`).textContent=notes.length?[...new Set(notes.map(n=>`${noteName(n.midi)}${n.fingering?t('finger',{number:n.fingering}):''}`))].join('  '):'—';}
  this.root.querySelectorAll('[data-study-key]').forEach(button=>{const n=active.find(n=>n.midi===Number(button.dataset.studyKey));button.classList.toggle('active',!!n);button.classList.toggle('left-hand',n?.hand==='left');button.classList.toggle('right-hand',!!n&&n.hand!=='left');button.querySelector('b').textContent=n?.fingering||'';button.setAttribute('aria-pressed',String(!!n));});
  if(this.follow&&active.length){const center=active.reduce((sum,n)=>sum+n.midi,0)/active.length;const target=this.root.querySelector(`[data-study-key="${Math.round(center)}"]`)||this.root.querySelector(`[data-study-key="${active[0].midi}"]`);const scroller=this.root.querySelector('.study-keyboard-scroll');if(target){const box=target.getBoundingClientRect(),parent=scroller.getBoundingClientRect();if(box.left<parent.left+30||box.right>parent.right-30)scroller.scrollLeft+=box.left-parent.left-parent.width/2;}}
 }
}
