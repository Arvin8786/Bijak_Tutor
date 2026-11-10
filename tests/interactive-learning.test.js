import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS} from '../src/lessons.js';
import {EXPLORE_LESSONS} from '../src/exploreLessons.js';
import {SUBJECT_MAPS} from '../src/subjectMaps.js';
import {availableSubjects, PRIMARY_SUBJECT_CATALOG, SCHOOL_STREAMS} from '../src/primarySubjects.js';

test('each catalogue subject has a map with distinct, actionable branches', () => {
 assert.equal(Object.keys(SUBJECT_MAPS).length, PRIMARY_SUBJECT_CATALOG.length);
 for (const {name} of PRIMARY_SUBJECT_CATALOG) {
  const map = SUBJECT_MAPS[name];
  assert.equal(map.branches.length, 3, name);
  assert.equal(new Set(map.branches.map(([label]) => label)).size, 3, name);
  assert.ok(map.branches.every(([label, detail, prompt]) => label && detail && prompt), name);
 }
});

test('the new lessons appear in the right stream and year with a playable quick challenge', () => {
 const supported = PRIMARY_SUBJECT_CATALOG.filter(({name}) => !SUBJECT_MAPS[name].guidedByTeacher);
 assert.deepEqual(new Set(EXPLORE_LESSONS.map(lesson => lesson.subject)), new Set(supported.map(subject => subject.name)));
 for (const lesson of EXPLORE_LESSONS) {
  assert.ok(LESSONS.includes(lesson));
  const streams = lesson.school === 'ALL' ? SCHOOL_STREAMS : [lesson.school];
  for (const stream of streams) {
   assert.ok(availableSubjects(stream, lesson.year, {includeOptional: true}).some(subject => subject.name === lesson.subject), lesson.id);
  }
  assert.equal(lesson.status, 'DRAFT_TEACHER_REVIEW');
  assert.equal(lesson.mind.length, 3);
  assert.equal(lesson.check.length, 2);
  for (const item of [lesson.activity, ...lesson.check]) {
   assert.equal(new Set(item.options).size, 3, item.id);
   assert.ok(item.options.includes(item.answer) && item.why.length > 10, item.id);
  }
 }
});
