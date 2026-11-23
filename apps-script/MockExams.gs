const MOCK_EXAM_DURATION_=3600000;
const MOCK_EXAM_HEADINGS_=['attemptId','childId','parentSub','paperId','startedAtMs','paperJson','answersJson'];
const MOCK_EXAM_SUBJECTS_={maths:'Mathematics',science:'Science',english:'English'};

function mockExamRequest(token,action,input){
 const user=portalIdentity_(token);
 if(action==='results'){
  if(user.role!=='PARENT')throw Error('Parent sign-in is required to view family mock results.');
  const child=requireChild_(user,String(input?.childId||''));
  const now=Date.now();
  return mockExamRows_().filter(row=>row[1]===String(child.childId)&&row[2]===String(user.sub)&&now>=row[4]+MOCK_EXAM_DURATION_)
    .slice(-12).reverse().map(row=>mockExamView_(row,now,true));
 }
 if(user.role!=='STUDENT'||!user.studentChildId)throw Error('A linked student sign-in is required for mock exams.');
 requireModule_(user,'mock-exams');
 const child=requireChild_(user,user.studentChildId),year=Number(child.year);
 if(!Number.isInteger(year)||year<1||year>6)throw Error('Mock exams are available for Years 1 to 6.');
 const owns=row=>row[1]===String(child.childId)&&row[2]===String(user.familySub);
 if(action==='catalog'){
  const now=Date.now(),attempts=mockExamRows_().filter(owns).reverse();
  return {papers:Object.entries(MOCK_EXAM_SUBJECTS_).map(([subject,title])=>({id:year+'-'+subject,title,year})),
   active:attempts.find(row=>now<row[4]+MOCK_EXAM_DURATION_)?.[0]||null,
   completed:attempts.filter(row=>now>=row[4]+MOCK_EXAM_DURATION_).slice(0,10).map(row=>mockExamView_(row,now,true))};
 }
 if(action==='state'){
  const row=mockExamRows_().find(item=>owns(item)&&item[0]===input?.attemptId);
  if(!row)throw Error('Mock exam attempt unavailable.');
  return mockExamView_(row,Date.now());
 }
 if(!['start','save'].includes(action))throw Error('Unknown exam request.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const sheet=mockExamSheet_(true),rows=mockExamRows_(sheet),now=Date.now();
  if(action==='start'){
   const subject=String(input?.paperId||'').split('-')[1];
   if(!Object.prototype.hasOwnProperty.call(MOCK_EXAM_SUBJECTS_,subject)||input?.paperId!==year+'-'+subject)throw Error('Choose a paper for your linked school year.');
   const active=rows.find(row=>owns(row)&&now<row[4]+MOCK_EXAM_DURATION_);
   if(active)return mockExamView_(active,now);
   const id='exam-'+Utilities.getUuid(),paper=makeMockExamPaper_(year,subject,id);
   const row=[id,String(child.childId),String(user.familySub),input.paperId,now,JSON.stringify(paper),'{}'];
   sheet.appendRow(row);
   return mockExamView_(row,now);
  }
  const rowIndex=rows.findIndex(item=>owns(item)&&item[0]===input?.attemptId),row=rows[rowIndex];
  if(!row)throw Error('Mock exam attempt unavailable.');
  if(now>=row[4]+MOCK_EXAM_DURATION_)return mockExamView_(row,now);
  const questions=JSON.parse(row[5]).questions,answers=JSON.parse(row[6]),index=input?.index,value=input?.answer;
  const question=Number.isInteger(index)?questions[index]:null;
  if(!question||typeof value!=='string'||value.length>26||
   value!==''&&(question.options?!/^[0-9]$/.test(value)||Number(value)>=question.options.length:!/^[-+]?\d{0,12}(?:\.\d{0,10})?$/.test(value)||!Number.isFinite(Number(value))))throw Error('Enter a valid answer.');
  if(value==='')delete answers[index];else answers[index]=value;
  sheet.getRange(rowIndex+2,7).setValue(JSON.stringify(answers));
  return {saved:true};
 }finally{try{SpreadsheetApp.flush()}finally{lock.releaseLock()}}
}
function mockExamSheet_(create){
 const db=database_();
 let sheet=db.getSheetByName('Year End Mock Exams');
 if(!sheet&&create)sheet=db.insertSheet('Year End Mock Exams');
 if(sheet&&create&&sheet.getLastRow()===0){
  sheet.getRange(1,1,1,MOCK_EXAM_HEADINGS_.length).setValues([MOCK_EXAM_HEADINGS_]);
  sheet.setFrozenRows(1);
  // A Google subject identifier can exceed spreadsheet numeric precision.
  sheet.getRange('A:D').setNumberFormat('@');
 }
 return sheet;
}
function mockExamRows_(sheet=mockExamSheet_(false)){
 if(!sheet||sheet.getLastRow()<2)return [];
 const headers=sheet.getRange(1,1,1,MOCK_EXAM_HEADINGS_.length).getValues()[0];
 if(headers.some((value,index)=>value!==MOCK_EXAM_HEADINGS_[index]))throw Error('Mock exam records require review by the BijakLearn Team.');
 return sheet.getRange(2,1,sheet.getLastRow()-1,MOCK_EXAM_HEADINGS_.length).getValues();
}
function mockExamView_(row,now,summary=false){
 const {title,year,questions}=JSON.parse(row[5]),answers=JSON.parse(row[6]);
 const endsAt=row[4]+MOCK_EXAM_DURATION_,finished=now>=endsAt;
 const view={id:row[0],title,year,endsAt,serverNow:now,finished,total:questions.length};
 if(finished){
  const review=questions.map((q,i)=>{
   const value=answers[i],correct=value!==undefined&&(q.options?Number(value)===q.key:Number(value)===q.key);
   const display=choice=>q.options?q.options[Number(choice)]:String(choice);
   return {prompt:q.prompt,passage:q.passage||'',answer:display(q.key),submitted:value===undefined?null:display(value),correct,explanation:q.explanation||''};
  });
  view.score=review.filter(answer=>answer.correct).length;
  view.answered=Object.keys(answers).length;
  if(!summary)view.review=review;
 }else if(!summary){
  view.answers=answers;
  view.questions=questions.map(({prompt,passage,options})=>({prompt,passage:passage||'',options:options||null}));
 }
 return view;
}
