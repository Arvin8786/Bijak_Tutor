import React,{useState} from 'react';
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
async function readBook(url) {
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
    title:section.querySelector('h2').textContent,
    text:section.querySelector('p').textContent
   }));
   if(chapters.length)return chapters;
   break;
  }
  offset=start+size;
 }
 throw Error('This book could not be opened.');
}

export default function FreeBooks(){
 const [book,setBook]=useState(null),[chapters,setChapters]=useState([]),[page,setPage]=useState(0),[error,setError]=useState('');
 async function open(item){
  setChapters([]);setError('');setPage(0);setBook(item);
  try{setChapters(await readBook(item[2]))}catch{setError('This book could not be opened. Return to the shelf and try again.')}
 }
 if(!book)return <section><h2>Free EPUB books</h2><p>Choose a book to read here. These BijakLearn short stories are available under CC0.</p>
  <div className="free-grid">{books.map(item=><button type="button" key={item[0]} onClick={()=>open(item)}><strong>{item[0]}</strong><small>{item[1]}</small></button>)}</div></section>;
 return <section className="free-book"><button type="button" onClick={()=>setBook(null)}>Back to books</button><h2>{book[0]}</h2>
  {error?<p role="alert">{error}</p>:chapters.length?<><article aria-live="polite"><h3>{chapters[page].title}</h3><p>{chapters[page].text}</p></article>
   <div className="free-controls"><button disabled={!page} onClick={()=>setPage(page-1)}>Previous</button><span>Chapter {page+1} of {chapters.length}</span><button disabled={page===chapters.length-1} onClick={()=>setPage(page+1)}>Next</button></div>
   <a href={book[2]} download={book[0]+'.epub'}>Download EPUB</a>
  </>:<p role="status">Opening book…</p>}</section>;
}
