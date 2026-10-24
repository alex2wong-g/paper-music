export function pianoSVG(){return `<svg class="piano-svg" viewBox="0 0 800 650" xmlns="http://www.w3.org/2000/svg" aria-label="Vintage ivory upright player piano"><defs>
<linearGradient id="ivory" x2="1" y2=".4"><stop stop-color="#e2d8c6"/><stop offset=".25" stop-color="#f2eadb"/><stop offset=".7" stop-color="#e7decc"/><stop offset="1" stop-color="#c8bca5"/></linearGradient>
<linearGradient id="edge" x2="0" y2="1"><stop stop-color="#faf5e9"/><stop offset=".35" stop-color="#ddd0b8"/><stop offset="1" stop-color="#a89b81"/></linearGradient>
<linearGradient id="gold"><stop stop-color="#6c5935"/><stop offset=".3" stop-color="#c4a56a"/><stop offset=".55" stop-color="#e4d3a2"/><stop offset="1" stop-color="#8e7548"/></linearGradient>
<linearGradient id="key" x2="0" y2="1"><stop stop-color="#c9c0af"/><stop offset=".18" stop-color="#faf7ec"/><stop offset="1" stop-color="#e1d9c7"/></linearGradient>
<linearGradient id="black" x2="0" y2="1"><stop stop-color="#4d4940"/><stop offset=".9" stop-color="#242421"/><stop offset="1" stop-color="#151714"/></linearGradient>
<linearGradient id="well" x2="0" y2="1"><stop stop-color="#1e211c"/><stop offset=".5" stop-color="#4b493c"/><stop offset="1" stop-color="#252820"/></linearGradient>
<filter id="shadow"><feGaussianBlur stdDeviation="13"/></filter><filter id="grain"><feTurbulence baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter></defs>
<ellipse cx="402" cy="607" rx="287" ry="21" fill="#4c4435" opacity=".15" filter="url(#shadow)"/>
<path d="M121 94L148 73H668L687 89V569L667 590H141Z" fill="#c7bca5" stroke="#a99d87"/>
<path d="M668 83L686 91V567L666 582Z" fill="#b9ad94"/>
<rect x="128" y="84" width="544" height="13" rx="3" fill="url(#edge)" stroke="#a99d86"/><path d="M125 81L145 70H670L680 79L672 85H128Z" fill="#ece4d4" stroke="#b8ac96"/>
<rect x="141" y="100" width="518" height="218" fill="url(#ivory)" stroke="#bcaf98"/>
<rect x="154" y="110" width="112" height="176" rx="2" fill="none" stroke="#c0b298" stroke-width="3"/><rect x="162" y="118" width="96" height="160" rx="2" fill="#e4dac7" stroke="#d5c9b2"/>
<rect x="535" y="110" width="111" height="176" rx="2" fill="none" stroke="#bdb096" stroke-width="3"/><rect x="543" y="118" width="95" height="160" rx="2" fill="#e1d7c2" stroke="#d5c9b2"/>
<rect x="280" y="109" width="241" height="177" rx="3" fill="#b5a78a" stroke="#eae1cd" stroke-width="3"/><rect x="287" y="116" width="227" height="163" fill="url(#well)"/>
<rect x="300" y="133" width="203" height="8" rx="4" fill="url(#gold)"/><rect x="300" y="248" width="203" height="11" rx="4" fill="url(#gold)"/>
<foreignObject x="308" y="138" width="186" height="111"><canvas xmlns="http://www.w3.org/1999/xhtml" class="roll-canvas" width="744" height="444"></canvas></foreignObject>
<rect x="303" y="245" width="193" height="5" fill="#252b24"/><path d="M307 247H493" stroke="#b5a475" stroke-dasharray="1 2"/>
<circle cx="296" cy="139" r="4" fill="url(#gold)"/><circle cx="506" cy="139" r="4" fill="url(#gold)"/>
<path d="M143 295H657L665 332L134 332Z" fill="url(#ivory)" stroke="#b3a68c"/>
<path d="M144 298H657" stroke="#f8f1e4" stroke-width="3"/><text x="400" y="318" text-anchor="middle" font-family="Georgia" font-size="12" letter-spacing="4" fill="#867552">PIANOLA</text>
<path d="M133 335H667L684 373L119 373Z" fill="#a5987f" stroke="#ac9f85"/><g id="piano-keys"></g>
<path d="M119 373H684V385H119Z" fill="url(#edge)" stroke="#a7987c"/><path d="M113 386H690V398H113Z" fill="url(#ivory)" stroke="#b5a88e"/>
<path d="M144 399H659V568H144Z" fill="url(#ivory)" stroke="#b7aa91"/><rect x="177" y="418" width="449" height="125" rx="2" fill="none" stroke="#bdaf94" stroke-width="2"/><rect x="183" y="424" width="437" height="112" fill="none" stroke="#f4ecd9"/>
<path d="M129 400H155V566H129Z" fill="url(#edge)" stroke="#b4a58b"/><path d="M646 400H672V566H646Z" fill="url(#edge)" stroke="#b4a58b"/>
<path d="M126 561H675V577H126Z" fill="url(#edge)" stroke="#aa9c80"/><path d="M131 578H160V596H133Z" fill="url(#ivory)" stroke="#a99b80"/><path d="M644 578H671V596H646Z" fill="url(#ivory)" stroke="#a99b80"/>
<circle cx="145" cy="600" r="7" fill="#686048"/><circle cx="658" cy="600" r="7" fill="#686048"/>
<path d="M341 547H459L470 582H330Z" fill="#b9ad94" stroke="#9a8c72"/><path d="M346 550H389L383 577H338Z" fill="#d9cdb6" stroke="#93866b"/><path d="M412 550H453L462 577H418Z" fill="#d9cdb6" stroke="#93866b"/>
<path d="M388 553L386 587Q387 595 395 590L398 555M408 555L410 588Q416 595 421 589L418 554" fill="url(#gold)" stroke="#91764a" stroke-width="2"/>
<path d="M152 105V284M650 105V284" stroke="#f7f0e2" stroke-width="2"/><rect x="140" y="99" width="519" height="190" fill="#e7ddc9" opacity=".07" filter="url(#grain)"/>
</svg>`;}
export function addKeys(){
 const whites=[];
 for(let midi=21;midi<=108;midi++)if(![1,3,6,8,10].includes(midi%12))whites.push(midi);
 // A shared perspective keeps adjacent white keys edge-to-edge.
 const rear=i=>132+i*538/52;
 const front=i=>124+i*556/52;
 const at=(i,y)=>rear(i)+(front(i)-rear(i))*(y-338)/31;
 const whiteKeys=whites.map((midi,i)=>{
  const left=rear(i),right=rear(i+1)-.45,bottomLeft=front(i),bottomRight=front(i+1)-.45;
  return `<g class="white-key"><path data-key="${midi}" d="M${left} 338H${right}L${bottomRight} 369H${bottomLeft}Z" fill="url(#key)" stroke="#aaa08e" stroke-width=".35"/><path d="M${bottomLeft} 369H${bottomRight}V373H${bottomLeft}Z" fill="#d2c8b3" stroke="#aaa08e" stroke-width=".3"/></g>`;
 }).join('');
 const blackKeys=whites.flatMap((midi,i)=>{
  if(![0,2,5,7,9].includes(midi%12)||midi>=108)return [];
  const back=rear(i+1),tip=at(i+1,355),halfBack=3.05,halfTip=3.2;
  return [`<g class="black-key"><path d="M${back-halfBack} 338H${back+halfBack+1}L${tip+halfTip+1.2} 359H${tip-halfTip+.7}Z" fill="#68604c" opacity=".24" transform="translate(1 1)"/><path data-key="${midi+1}" d="M${back-halfBack} 337H${back+halfBack}L${tip+halfTip} 354H${tip-halfTip}Z" fill="url(#black)" stroke="#24251f" stroke-width=".4"/><path d="M${tip-halfTip} 354H${tip+halfTip}V358H${tip-halfTip}Z" fill="#1c1d19" stroke="#141612" stroke-width=".35"/><path d="M${back-halfBack+.7} 338L${tip-halfTip+.7} 353M${tip-halfTip+.4} 354H${tip+halfTip-.4}" fill="none" stroke="#827c6b" stroke-width=".45" opacity=".65"/></g>`];
 }).join('');
 // All black keys must paint after all white keys to remain fully visible.
 document.querySelector('#piano-keys').innerHTML=`<g class="white-keys">${whiteKeys}</g><g class="black-keys">${blackKeys}</g>`;
}
