import React,{useLayoutEffect,useRef,useState} from 'react';
import rain from './books/rain.epub?url&inline';
import lantern from './books/lantern.epub?url&inline';
import seed from './books/seed.epub?url&inline';
import shop from './books/shop.epub?url&inline';

const books=[
 ['Nila and the Rain Gauge','Weather and measurement',rain],
 ['The Lantern Trail','Maps and directions',lantern],
 ['The Seed in the Cup','Growing and testing',seed],
 ['The Ten-Ringgit Shop','Money and choices',shop]
];

// These bundled EPUBs use ZIP's stored format. Only story text is rendered.
function readBook(url) {
 const buffer=Uint8Array.from(atob(url.split(',')[1]), character=>character.charCodeAt(0)).buffer;
 const view=new DataView(buffer), decoder=new TextDecoder();
 for(let offset=0;offset+30<=buffer.byteLength&&view.getUint32(offset,true)===0x04034b50;){
  const size=view.getUint32(offset+18,true), nameLength=view.getUint16(offset+26,true);
  const name=decoder.decode(new Uint8Array(buffer,offset+30,nameLength));
  const start=offset+30+nameLength+view.getUint16(offset+28,true);
  if(name==='story.xhtml'&&view.getUint16(offset+8,true)===0){
   const xml=decoder.decode(new Uint8Array(buffer,start,size));
   const document=new DOMParser().parseFromString(xml,'application/xhtml+xml');
   const chapters=[...document.querySelectorAll('section')].map(section=>({
    title:section.querySelector('h2')?.textContent||'',
    paragraphs:[...section.querySelectorAll('p')].map(paragraph=>paragraph.textContent)
   }));
   if(chapters.length)return chapters;
   break;
  }
  offset=start+size;
 }
 throw Error('This book could not be opened.');
}

function BookPage({chapter}){
 return <><h3>{chapter.title}</h3>{chapter.paragraphs.map((text,index)=><p key={index}>{text}</p>)}</>;
}

function BookReader({book,onBack}){
 const [content]=useState(()=>{
  try{return {chapters:readBook(book[2])}}
  catch{return {error:'This book could not be opened. Return to the shelf and try again.'}}
 });
 const [{page,previous},setPage]=useState({page:0,previous:null});
 const dialog=useRef(null),readingArea=useRef(null),touch=useRef(null);
 const {chapters,error}=content;

 useLayoutEffect(()=>{
  const reader=dialog.current;
  reader.showModal();
  return ()=>{if(reader.open)reader.close()};
 },[]);
 useLayoutEffect(()=>{
  if(readingArea.current)readingArea.current.scrollTop=0;
 },[page]);

 function turn(direction){
  if(!chapters)return;
  setPage(current=>{
   const next=current.page+direction;
   return next<0||next>=chapters.length?current:{page:next,previous:current.page};
  });
 }
 function keyDown(event){
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();
  turn(event.key==='ArrowRight'?1:-1);
 }
 function startSwipe(event){
  if(!event.isPrimary||event.pointerType==='mouse')return;
  touch.current={id:event.pointerId,x:event.clientX,y:event.clientY};
 }
 function finishSwipe(event){
  const start=touch.current;
  if(start?.id!==event.pointerId)return;
  touch.current=null;
  const horizontal=event.clientX-start.x,vertical=event.clientY-start.y;
  if(Math.abs(horizontal)>=48&&Math.abs(horizontal)>1.5*Math.abs(vertical))turn(horizontal<0?1:-1);
 }
 function closeReader(){
  dialog.current.close();
  onBack();
 }

 return <dialog className="epub-reader" ref={dialog} aria-labelledby="epub-title"
  onKeyDown={keyDown} onCancel={event=>{event.preventDefault();closeReader()}}>
  <div className="epub-reader-layout">
   <div className="epub-toolbar">
    <button type="button" className="epub-back" onClick={closeReader}><span aria-hidden="true">←</span> Back to books</button>
    <h2 id="epub-title">{book[0]}</h2>
    <a href={book[2]} download={book[0]+'.epub'} aria-label="Download EPUB"><span aria-hidden="true">↓</span><span className="epub-download-label"> EPUB</span></a>
   </div>
   {error?<p className="epub-error" role="alert">{error}</p>:<>
    <div className="epub-reading-area" ref={readingArea} onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={()=>{touch.current=null}}>
     <div className="epub-paper">
      <article className="epub-leaf" key={page}><BookPage chapter={chapters[page]}/></article>
      {previous!==null&&<div key={previous+'-'+page} className={'epub-leaf epub-turn '+(page>previous?'epub-turn-next':'epub-turn-prev')} aria-hidden="true"
       onAnimationEnd={()=>setPage(current=>current.page===page&&current.previous===previous?{page,previous:null}:current)}>
       <BookPage chapter={chapters[previous]}/>
      </div>}
     </div>
    </div>
    <div className="epub-pagination" role="group" aria-label="Book pages">
     <button type="button" disabled={!page} onClick={()=>turn(-1)}><span aria-hidden="true">←</span> Previous</button>
     <span role="status" aria-atomic="true">Page {page+1} of {chapters.length}</span>
     <button type="button" disabled={page===chapters.length-1} onClick={()=>turn(1)}>Next <span aria-hidden="true">→</span></button>
    </div>
   </>}
  </div>
 </dialog>;
}

export default function FreeBooks(){
 const [book,setBook]=useState(null);
 const opener=useRef(null);
 function close(){
  setBook(null);
  opener.current?.focus({preventScroll:true});
 }
 return <section><h2>Free EPUB books</h2><p>Choose a book to read here. These BijakLearn short stories are available under CC0.</p>
  <div className="free-grid">{books.map(item=><button type="button" key={item[0]} onClick={event=>{opener.current=event.currentTarget;setBook(item)}}><strong>{item[0]}</strong><small>{item[1]}</small></button>)}</div>
  {book&&<BookReader book={book} onBack={close}/>}
 </section>;
}
