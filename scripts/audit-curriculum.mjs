/**
 * Curriculum coverage is measured from authored content, not an invented
 * percent of the official KSSR. Teacher-approved status is NEVER inferred.
 */
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {availableSubjects} from '../src/primarySubjects.js';
const streams=['SK','SJKC','SJKT'];
const matrix=[];
for(const stream of streams)for(let year=1;year<=6;year++)for(const subject of availableSubjects(stream,year,{includeOptional:true})){
 const lessons=LESSONS.filter(l=>l.year===year&&l.subject===subject.name&&(!l.school||l.school==='ALL'||l.school===stream));
 const assessments=lessons.reduce((n,l)=>n+(l.check?.length||0),0);
 const reviewed=lessons.filter(l=>l.status==='TEACHER_APPROVED').length;
 matrix.push({stream,year,subject:subject.name,optional:subject.group==='optional',authoredLessons:lessons.length,assessments,teacherApproved:reviewed,needsMaterials:lessons.length===0,needsReview:lessons.length>reviewed});
}
const report={generatedAt:new Date().toISOString(),definition:'Counts of authored draft learning material, not complete official curriculum-standard coverage',totalAuthoredLessons:LESSONS.length,totalAssessments:LESSONS.reduce((n,l)=>n+(l.check?.length||0),0),reviewedLessons:LESSONS.filter(l=>l.status==='TEACHER_APPROVED').length,matrix};
fs.mkdirSync('release',{recursive:true});
fs.writeFileSync('release/CURRICULUM_COVERAGE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({totalAuthoredLessons:report.totalAuthoredLessons,totalAssessments:report.totalAssessments,reviewedLessons:report.reviewedLessons,emptySubjectYearStreamCombinations:matrix.filter(x=>x.needsMaterials).length},null,2));
