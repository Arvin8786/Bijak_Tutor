/**
 * Import reviewed OR draft authored curriculum data into the private master workbook.
 * This function is called manually by the Apps Script owner after deploying the
 * generated release/CurriculumData.gs from npm run build.
 * It does NOT mark any lesson teacher-approved.
 */
function importFullJuniorCurriculum_(){
  if(typeof BIJAK_CURRICULUM_BUNDLE==='undefined')throw Error('Missing CurriculumData.gs from release build');
  initializeDatabase_();
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const data=BIJAK_CURRICULUM_BUNDLE;
    const existingLessons=new Set(rows_('Lessons').map(x=>String(x.lessonId)));
    const existingQuestions=new Set(rows_('Questions').map(x=>String(x.lessonId)+'/'+String(x.questionId)));
    let addedLessons=0,addedQuestions=0,skipped=0;
    const pendingLessons=[],pendingQuestions=[];
    for(const l of data){
      if(!l.id||!l.year||!l.subject||!l.title)continue;
      // Respect existing content: never overwrite local edits or teacher review.
      if(!existingLessons.has(l.id)){
        pendingLessons.push({lessonId:l.id,year:l.year,subject:l.subject,title:l.title,summary:l.summary,icon:l.icon,
          mindJson:JSON.stringify(l.mind||[]),stepsJson:JSON.stringify(l.steps||[]),premium:'FALSE',
          chapter:l.chapter||'',visual:l.visual||'',school:l.school||'ALL',contentStatus:l.status||'DRAFT_TEACHER_REVIEW'});
        existingLessons.add(l.id);
      }else skipped++;
      for(const q of (l.check||[])){
        if(!q.id||!q.text||q.answer===undefined||existingQuestions.has(l.id+'/'+q.id))continue;
        pendingQuestions.push({questionId:q.id,lessonId:l.id,mode:q.mode||'choice',text:q.text,
          optionsJson:JSON.stringify(q.options||[]),correctAnswer:String(q.answer),why:q.why||'',
          transfer:q.transfer?'TRUE':'FALSE',misconceptionsJson:JSON.stringify(l.misconceptions||{})});
        existingQuestions.add(l.id+'/'+q.id);
      }
    }
    const write=(name,rows)=>{
      const sheet=sheet_(name),columns=TABLES[name];
      for(let i=0;i<rows.length;i+=100){
        const block=rows.slice(i,i+100);
        sheet.getRange(sheet.getLastRow()+1,1,block.length,columns.length).setValues(block.map(row=>columns.map(k=>cell_(row[k]))));
      }
    };
    write('Lessons',pendingLessons);addedLessons=pendingLessons.length;
    write('Questions',pendingQuestions);addedQuestions=pendingQuestions.length;
    return {addedLessons,addedQuestions,skippedExistingLessons:skipped,totalAuthoredLessons:data.length,
      reviewStatus:'DRAFT — independent educational review required before production'};
  }finally{lock.releaseLock()}
}
