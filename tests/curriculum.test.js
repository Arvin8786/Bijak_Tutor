import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {SKILL_CATALOG,CURRICULUM_INFO} from '../src/skillCatalog.js';
test('every initial skill has one mapping, dependencies and a playable demonstration lesson',()=>{
 const ids=new Set(SKILL_CATALOG.map(s=>s.id));
 assert.equal(ids.size,SKILL_CATALOG.length);
 for(const s of SKILL_CATALOG){
  assert.ok(s.standards.length>0);
  assert.ok(s.prerequisites.every(p=>ids.has(p)));
  const lesson=LESSONS.find(l=>l.title===s.title&&l.year===1&&l.subject==='Matematik');
  assert.ok(lesson,`Missing lesson for ${s.id}`);
  assert.ok(lesson.check.length>=4);
  const modes=new Set(lesson.check.map(q=>q.mode));
  assert.ok(modes.has('number')&&modes.has('reason'));
  assert.ok(lesson.check.some(q=>q.transfer));
 }
});
test('standards retain curriculum version and teacher-review status',()=>{
 assert.equal(CURRICULUM_INFO.curriculumId,'KSSR-SEMAKAN-2017');
 assert.ok(SKILL_CATALOG.every(s=>['demo','DRAFT_TEACHER_REVIEW'].includes(s.status)));
 const gas=fs.readFileSync('apps-script/Code.gs','utf8');
 assert.match(gas,/SkillMap/);
 assert.match(gas,/CurriculumVersions/);
 assert.match(gas,/DEMO_NOT_REVIEWED/);
});