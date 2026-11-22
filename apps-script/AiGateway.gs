/**
 * One place for every online AI call. Keys live only in Script Properties and never reach the browser.
 *
 * Script Properties (all optional; the first provider that is configured and answers wins):
 *   AI_BASE_URL   OpenAI-compatible base address ending in /v1, for example https://api.example.com/v1
 *   AI_API_KEY    secret key for that provider
 *   AI_MODEL      model name from that provider's dashboard
 *   GEMINI_API_KEY / GEMINI_MODEL   Google Gemini, used as the second choice
 *   AI_DAILY_LIMIT   maximum paid/free provider calls per day for everyone together (default 1000)
 */
function aiProviders_(){
 const settings=props_(),list=[];
 const base=String(settings.getProperty('AI_BASE_URL')||'').trim().replace(/\/+$/,''),key=settings.getProperty('AI_API_KEY'),model=String(settings.getProperty('AI_MODEL')||'').trim();
 if(base&&key&&model){
  if(!/^https:\/\/[a-z0-9.-]+(?::\d{2,5})?(?:\/[\w.\/-]*)?$/i.test(base))throw Error('Invalid AI endpoint configuration');
  if(!/^[\w.:\/-]{2,100}$/.test(model))throw Error('Invalid AI model configuration');
  list.push({type:'openai',base,key,model});
 }
 const gemini=settings.getProperty('GEMINI_API_KEY');
 if(gemini){
  const model=settings.getProperty('GEMINI_MODEL')||'gemini-3.5-flash-lite';
  if(!/^gemini-[\w.-]{3,60}$/.test(model))throw Error('Invalid tutor model configuration');
  list.push({type:'gemini',key:gemini,model});
 }
 return list;
}
function aiConfigured_(){return aiProviders_().length>0}

/** Everyone together may use at most AI_DAILY_LIMIT provider calls a day, so a viral post cannot drain credits. */
function aiBudgetTake_(){
 const limit=Math.max(1,Math.floor(Number(props_().getProperty('AI_DAILY_LIMIT'))||1000));
 const lock=LockService.getScriptLock();lock.waitLock(5000);
 try{
  const settings=props_(),day=Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur','yyyy-MM-dd');
  const used=settings.getProperty('AI_BUDGET_DAY')===day?Number(settings.getProperty('AI_BUDGET_COUNT')||0):0;
  if(used>=limit)throw Error('[AI_BUDGET] The online helper is resting for today. Try the lesson helper.');
  settings.setProperty('AI_BUDGET_DAY',day);settings.setProperty('AI_BUDGET_COUNT',String(used+1));
 }finally{lock.releaseLock()}
}
function aiJsonText_(text){
 let raw=String(text||'').trim().slice(0,8000);
 const fence=raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);if(fence)raw=fence[1];
 const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
 if(start<0||end<start)throw Error('Tutor response could not be read.');
 try{return JSON.parse(raw.slice(start,end+1))}catch(error){throw Error('Tutor response could not be read.')}
}
function callOpenAiCompatible_(provider,system,userText,maxTokens){
 const response=UrlFetchApp.fetch(provider.base+'/chat/completions',{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+provider.key},muteHttpExceptions:true,
  payload:JSON.stringify({model:provider.model,temperature:0.2,max_tokens:maxTokens,messages:[{role:'system',content:system},{role:'user',content:userText}]})});
 if(response.getResponseCode()!==200)throw Error('provider unavailable');
 const result=JSON.parse(response.getContentText());
 return aiJsonText_(result.choices&&result.choices[0]&&result.choices[0].message&&result.choices[0].message.content);
}
function callGemini_(provider,system,userText,maxTokens){
 const payload={systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:userText}]}],generationConfig:{responseMimeType:'application/json',temperature:0.2,maxOutputTokens:maxTokens}};
 const response=UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(provider.model)+':generateContent',{method:'post',contentType:'application/json',headers:{'x-goog-api-key':provider.key},payload:JSON.stringify(payload),muteHttpExceptions:true});
 if(response.getResponseCode()!==200)throw Error('provider unavailable');
 const result=JSON.parse(response.getContentText());
 return aiJsonText_((result.candidates||[]).flatMap(c=>(c.content&&c.content.parts||[]).map(p=>p.text||'')).join(''));
}
/** Returns {data, provider}. Falls through the providers in order; throws one friendly message if none answers. */
function aiJson_(system,userText,maxTokens){
 const providers=aiProviders_();
 if(!providers.length)throw Error('AI tutor is not configured. Use the built-in lesson helper.');
 aiBudgetTake_();
 for(const provider of providers){
  try{
   const data=provider.type==='openai'?callOpenAiCompatible_(provider,system,userText,maxTokens||650):callGemini_(provider,system,userText,maxTokens||650);
   return {data,provider:provider.type};
  }catch(error){/* try the next provider */}
 }
 throw Error('Online tutor is temporarily unavailable.');
}

/** Answers are shared between learners, so skip questions that look like they contain personal details. */
function aiQuestionIsPrivate_(text){return /@|\d{7,}|\b(my name is|nama saya|i live|saya tinggal|my address|alamat)\b/i.test(text)}
function aiCacheKey_(question,subject,year){
 const normal=String(question).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s.+*\/%=-]/gu,' ').replace(/\s+/g,' ').trim();
 return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,year+'|'+subject.toLowerCase()+'|'+normal).map(b=>('0'+(b&255).toString(16)).slice(-2)).join('');
}
function aiCacheGet_(key){
 const row=rows_('TutorCache').find(item=>String(item.keyHash)===key);
 if(!row)return null;
 try{const value=JSON.parse(String(row.answerJson));return value&&Array.isArray(value.steps)?value:null}catch(error){return null}
}
function aiCachePut_(key,value){
 if(rows_('TutorCache').length>=5000)return;
 append_('TutorCache',{keyHash:key,answerJson:JSON.stringify(value),createdAt:new Date().toISOString()});
}
/** Cross-check a model's numeric answer with the same checked calculator the app uses on-device. */
function aiVerifyNumeric_(parsed){
 const expression=typeof parsed.expression==='string'?parsed.expression.trim():'';
 if(!expression||typeof calculateExpression_!=='function'||typeof numericValue_!=='function')return {status:'unchecked'};
 const calculated=calculateExpression_(arithmeticExpression_(expression));
 if(!calculated||calculated.error||!Number.isFinite(calculated.value))return {status:'unchecked'};
 const claimed=numericValue_(String(parsed.answer==null?'':parsed.answer).replace(/[^\d.\/+-]/g,'').slice(0,40));
 if(claimed===null||!Number.isFinite(claimed))return {status:'unchecked',value:calculated.answer};
 const same=Math.abs(claimed-calculated.value)<=1e-6*Math.max(1,Math.abs(calculated.value));
 return {status:same?'verified':'mismatch',value:calculated.answer};
}
