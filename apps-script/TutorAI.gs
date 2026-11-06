/**
 * Authenticated optional live tutor for Apps Script HTML-service only.
 * Never expose GEMINI_API_KEY to frontend code. Not reachable from GitHub Pages.
 * Requires owner deployment and Script Properties: GEMINI_API_KEY and optional GEMINI_MODEL.
 */
function askTutor(token,question,context){
 return withAuth_(token,function(user){
   const q=String(question||'').trim();
   if(!q||q.length>500)throw Error('Please ask a question of 1–500 characters');
   const info=context&&typeof context==='object'?context:{};
   const year=Math.max(1,Math.min(6,Math.floor(Number(info.year)||1)));
   const subject=String(info.subject||'').replace(/[\r\n\t]/g,' ').slice(0,75);
   const lessonId=String(info.lessonId||'').slice(0,80);
   // Do not transmit account identity, child identity, or learner records.
   const settings=props_();
   const key=settings.getProperty('GEMINI_API_KEY');
   if(!key)throw Error('AI tutor is not configured. Use the built-in lesson helper.');
   const cache=CacheService.getScriptCache();
   const rateKey='tutor_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,user.sub)).slice(0,25);
   const minute=Math.floor(Date.now()/60000);
   const day=Math.floor(Date.now()/86400000);
   for(const [suffix,limit,ttl] of [['m'+minute,8,90],['d'+day,60,90000]]){
     const name=rateKey+'_'+suffix;
     const n=Number(cache.get(name)||0);
     if(n>=limit)throw Error('Tutor question limit reached; please try again later.');
     cache.put(name,String(n+1),ttl);
   }
   // Restrict lesson context to published content, never private student data.
   const row=lessonId?rows_('Lessons').find(l=>String(l.lessonId)===lessonId):null;
   const contextText=row?('Study topic: '+String(row.title).slice(0,110)+'\nLesson summary: '+String(row.summary).slice(0,600)):'';
   const model=settings.getProperty('GEMINI_MODEL')||'gemini-3.5-flash-lite';
   if(!/^gemini-[\w.-]{3,60}$/.test(model))throw Error('Invalid tutor model configuration');
   const system='You are BijakLearn Study Buddy, a warm Malaysian primary school tutor for ages 6–12. Answer only educational questions. Be accurate and age appropriate. For maths, show clear numbered working steps and check arithmetic. For science, explain cause, evidence and a safe concrete example. Use the language of the question (Malay, English, Chinese or Tamil) when possible. Never request personal details, make medical or legal diagnoses, or instruct unsafe experiments. Never claim you are a human teacher. If uncertain, state uncertainty and suggest asking an educator. Respond with strictly valid JSON: {"title":"short heading","steps":["simple step 1","step 2","step 3"]}. Limit to 6 steps and 150 words.';
   const payload={systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:'Year: '+year+'\nSubject: '+subject+'\n'+contextText+'\nStudent question: '+q}]}],generationConfig:{responseMimeType:'application/json',temperature:0.2,maxOutputTokens:650}};
   const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';
   const response=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},payload:JSON.stringify(payload),muteHttpExceptions:true});
   if(response.getResponseCode()!==200)throw Error('Online tutor is temporarily unavailable.');
   const result=JSON.parse(response.getContentText());
   const raw=(result.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||'')).join('').slice(0,7000);
   const parsed=JSON.parse(raw);
   if(!parsed||typeof parsed.title!=='string'||!Array.isArray(parsed.steps))throw Error('Tutor response could not be read.');
   return {title:parsed.title.slice(0,180),steps:parsed.steps.slice(0,6).map(s=>String(s).slice(0,750)),kind:'ai',source:'AI-generated explanation; verify important answers with a teacher'};
 });
}
