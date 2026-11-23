/**
 * Authenticated optional live tutor for Apps Script HTML-service only.
 * The front end already solves checked maths on the device for free; this runs only for questions it could not answer.
 * Provider keys (AI_API_KEY, GEMINI_API_KEY) stay in Script Properties; see AiGateway.gs. Never expose them to frontend code.
 */
function askTutor(token,question,context){
 return withAuth_(token,function(user){
   requireModule_(user,'study-buddy');
   const q=String(question||'').trim();
   if(!q||q.length>500)throw Error('Please ask a question of 1–500 characters');
   const info=context&&typeof context==='object'?context:{};
   const year=Math.max(1,Math.min(6,Math.floor(Number(info.year)||1)));
   requireLearnerSection_(user,year);
   const subject=String(info.subject||'').replace(/[\r\n\t]/g,' ').slice(0,75);
   const lessonId=String(info.lessonId||'').slice(0,80);
   // Do not transmit account identity, child identity, or learner records.
   if(!aiConfigured_())throw Error('AI tutor is not configured. Use the built-in lesson helper.');
   const cache=CacheService.getScriptCache();
   const rateKey='tutor_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,user.sub)).slice(0,25);
   const minute=Math.floor(Date.now()/60000);
   const day=Math.floor(Date.now()/86400000);
   for(const [suffix,limit,ttl] of [['m'+minute,8,90],['d'+day,60,21600]]){
     const name=rateKey+'_'+suffix;
     const n=Number(cache.get(name)||0);
     if(n>=limit)throw Error('Tutor question limit reached; please try again later.');
     cache.put(name,String(n+1),ttl);
   }
   // Restrict lesson context to published content, never private student data.
   const row=lessonId?rows_('Lessons').find(l=>String(l.lessonId)===lessonId):null;
   if(row)requireLessonAccess_(user,row);
   const contextText=row?('Study topic: '+String(row.title).slice(0,110)+'\nLesson summary: '+String(row.summary).slice(0,600)):'';
   // Shared answers first: the same question from another learner costs nothing.
   const shareable=!aiQuestionIsPrivate_(q),cacheKey=aiCacheKey_(q,subject,year);
   if(shareable){const hit=aiCacheGet_(cacheKey);if(hit)return Object.assign({},hit,{cached:true})}
   const system='You are BijakLearn Study Buddy, a warm Malaysian primary school tutor for ages 6–12. Answer only educational questions. Be accurate and age appropriate. For maths, show clear numbered working steps and check arithmetic. For science, explain cause, evidence and a safe concrete example. Use the language of the question (Malay, English, Chinese or Tamil) when possible. Never request personal details, make medical or legal diagnoses, or instruct unsafe experiments. Never claim you are a human teacher. If uncertain, state uncertainty and suggest asking an educator. Respond with strictly valid JSON: {"title":"short heading","steps":["simple step 1","step 2","step 3"],"answer":"final numeric answer for a maths question, else empty","expression":"for a maths question that reduces to arithmetic: one expression using only digits, + - * / ( ) and . whose value is the final answer, else empty"}. Limit to 7 steps and 170 words.';
   const outcome=aiJson_(system,'Year: '+year+'\nSubject: '+subject+'\n'+contextText+'\nStudent question: '+q,700);
   const parsed=outcome.data;
   if(!parsed||typeof parsed.title!=='string'||!Array.isArray(parsed.steps))throw Error('Tutor response could not be read.');
   const check=aiVerifyNumeric_(parsed);
   const steps=parsed.steps.slice(0,7).map(s=>String(s).slice(0,750));
   const answer={title:parsed.title.slice(0,180),steps,kind:check.status==='verified'?'math':'ai'};
   if(check.status==='verified'){answer.answer=check.value;answer.source='AI explanation; the final answer was checked by our calculator';}
   else if(check.status==='mismatch'){steps.push('⚠️ Our calculator got '+check.value+' for this problem, which is different. Please check this answer with a teacher.');answer.source='AI explanation that did NOT pass the calculator check';}
   else answer.source='AI-generated explanation; verify important answers with a teacher';
   // Only share answers that are safe to repeat: not private, and not a failed maths check.
   if(shareable&&check.status!=='mismatch')aiCachePut_(cacheKey,answer);
   return answer;
 });
}
