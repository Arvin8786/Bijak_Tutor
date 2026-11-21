import React,{useEffect,useRef,useState} from 'react';
export async function encodePrivateFile(file){
 if(!file||!['application/pdf','image/png','image/jpeg'].includes(file.type)||file.size<=0||file.size>1024*1024)throw Error('Choose a PDF, PNG or JPEG of at most 1 MB.');
 const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Unable to read file'));reader.readAsDataURL(file)});return {mimeType:file.type,data};
}
export function usePrivateMedia(request,method,args){
 const [state,setState]=useState({url:'',mimeType:'',error:''}),key=JSON.stringify(args);
 useEffect(()=>{let active=true,url;setState({url:'',mimeType:'',error:''});request(method,...JSON.parse(key)).then(result=>{
  if(!['application/pdf','image/png','image/jpeg'].includes(result.mimeType)||typeof result.data!=='string'||result.data.length>1400000)throw Error('Unsupported private document');
  const bytes=Uint8Array.from(atob(result.data),c=>c.charCodeAt(0));if(!active)return;url=URL.createObjectURL(new Blob([bytes],{type:result.mimeType}));setState({url,mimeType:result.mimeType,error:''});
 }).catch(error=>{if(active)setState({url:'',mimeType:'',error:error.message})});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[request,method,key]);return state;
}
export default function PrivateDocument({request,method='getPrivateUpload',args,onClose}){
 const media=usePrivateMedia(request,method,args),dialog=useRef();
 useEffect(()=>{dialog.current.showModal()},[]);
 return <dialog ref={dialog} className="private-document" aria-label="Private document viewer" onCancel={e=>{e.preventDefault();onClose()}}><header><h2>Private document</h2><button autoFocus onClick={onClose}>Close document</button></header>{media.error?<p role="alert">{media.error}</p>:!media.url?<p role="status">Loading private document…</p>:<>{media.mimeType==='application/pdf'?<object aria-label="PDF preview" data={media.url} type="application/pdf"><p>Your browser cannot preview this PDF. Use the download button below.</p></object>:<img src={media.url} alt="Private uploaded document"/>}<a href={media.url} download={'private-document.'+(media.mimeType==='application/pdf'?'pdf':media.mimeType==='image/png'?'png':'jpg')}>Download a private copy</a></>}</dialog>;
}
export function PaymentQr({request,id}){return id?<QrImage request={request} id={id}/>:<p role="status">The BijakLearn Team has not uploaded the Touch ’n Go payment QR yet. Contact the BijakLearn Team before paying.</p>}
function QrImage({request,id}){const media=usePrivateMedia(request,'getPrivateUpload',[id]);return media.error?<p role="alert">{media.error}</p>:media.url?<img className="payment-qr" src={media.url} alt="BijakLearn Team Touch ’n Go payment QR. Verify the recipient and quoted amount before paying."/>:<p role="status">Loading payment QR…</p>}
