import React,{useState} from 'react';
async function encodeDocument(file){
 if(!['application/pdf','image/png','image/jpeg'].includes(file.type)||file.size>1024*1024||file.size===0)throw Error('Use a PDF, PNG or JPEG of at most 1 MB each.');
 const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Unable to read document'));reader.readAsDataURL(file)});
 return {mimeType:file.type,data};
}
export default function PremiumKasihApplication({request,live,onSubmitted,student=false}){
 const [details,setDetails]=useState({guardianName:'',studentNickname:'',schoolYear:'1',reason:'',guardianConsent:false});
 const [files,setFiles]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 const change=(key,value)=>setDetails(current=>({...current,[key]:value}));
 async function submit(event){
  event.preventDefault();if(!live||busy)return;
  setBusy(true);setError('');
  try{
   if(files.length<1||files.length>2)throw Error('Attach one or two supporting documents.');
   const documents=await Promise.all(files.map(encodeDocument));
   const response=await request('submitKasihApplication',{...details,schoolYear:Number(details.schoolYear)},documents);
   setResult(response);setFiles([]);setDetails({guardianName:'',studentNickname:'',schoolYear:'1',reason:'',guardianConsent:false});
   onSubmitted?.();
  }catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 return <section className="panel narrow kasih-application">
  <span className="mini-label">Giving back to our community</span><h1>Apply for Premium Kasih</h1>
  <p>Learning opportunities should be within reach of every family. Tell us how sponsored access would help. Applications are reviewed privately by an BijakLearn Team; submission does not automatically grant access.</p>
  {student?<p role="status">Applications and supporting documents must be submitted by your parent or guardian from their parent account.</p>:!live?<p role="status">Applications and document uploads are available only after signing in to the private learning app. Please do not enter personal information in this demo.</p>:result?<div role="status"><h2>Application received</h2><p>Reference: {result.requestId}</p><p>Your application is awaiting review. You can check its status under Membership.</p></div>:<form className="kasih-form" onSubmit={submit}>
   <label>Parent or guardian name<input autoComplete="name" required minLength={2} maxLength={100} value={details.guardianName} disabled={busy} onChange={e=>change('guardianName',e.target.value)}/></label>
   <label>Student nickname<input required maxLength={40} value={details.studentNickname} disabled={busy} onChange={e=>change('studentNickname',e.target.value)}/></label>
   <label>School year<select aria-label="School year" value={details.schoolYear} disabled={busy} onChange={e=>change('schoolYear',e.target.value)}><option value="0">Preschool</option>{[1,2,3,4,5,6].map(year=><option key={year} value={year}>Tahun {year}</option>)}</select></label>
   <label>Why would Premium Kasih help your family?<textarea required rows={6} minLength={40} maxLength={2000} value={details.reason} disabled={busy} onChange={e=>change('reason',e.target.value)} aria-describedby="kasih-privacy"/></label>
   <p id="kasih-privacy" className="hint">Share only what is needed to explain your circumstances. Attach a redacted support letter or similar evidence. Hide identity numbers, bank account numbers and unrelated personal details. Do not upload full identity documents or bank statements.</p>
   <label>Supporting documents (one or two, PDF/JPEG/PNG, up to 1 MB each)<input type="file" accept="application/pdf,image/png,image/jpeg" multiple required disabled={busy} onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
   <p className="hint">Documents are held privately for BijakLearn Team review. Reviewed evidence is scheduled for deletion after 90 days by the owner’s retention task. You can contact the BijakLearn Team to request earlier deletion.</p>
   <label className="consent-check"><input type="checkbox" required checked={details.guardianConsent} disabled={busy} onChange={e=>change('guardianConsent',e.target.checked)}/> I am the parent or guardian. I consent to private review of these details and documents for the Premium Kasih application.</label>
   {error&&<p role="alert" className="error">{error}</p>}
   <button className="primary" disabled={busy}>{busy?'Submitting application…':'Submit application for review'}</button>
  </form>}
 </section>;
}

