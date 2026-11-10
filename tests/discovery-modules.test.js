import test from 'node:test';
import assert from 'node:assert/strict';
import {DISCOVERY_LESSONS, DISCOVERY_MODULES} from '../src/discoveryModules.js';
import {LESSONS} from '../src/lessons.js';
import {availableSubjects, SCHOOL_STREAMS} from '../src/primarySubjects.js';

test('the interactive module catalogue adds 20 unique, correctly placed lessons', () => {
 assert.equal(DISCOVERY_MODULES.length, 4);
 assert.ok(DISCOVERY_LESSONS.length >= 20);
 assert.equal(new Set(DISCOVERY_LESSONS.map(lesson => lesson.id)).size, DISCOVERY_LESSONS.length);
 assert.deepEqual([...new Set(DISCOVERY_LESSONS.map(lesson => lesson.year))].sort(), [1, 2, 3, 4, 5, 6]);
 for (const lesson of DISCOVERY_LESSONS) {
  assert.equal(LESSONS.filter(item => item.id === lesson.id).length, 1, lesson.id);
  for (const school of lesson.school === 'ALL' ? SCHOOL_STREAMS : [lesson.school]) {
   assert.ok(availableSubjects(school, lesson.year).some(subject => subject.name === lesson.subject), lesson.id);
  }
  assert.equal(lesson.status, 'DRAFT_TEACHER_REVIEW');
  assert.ok(lesson.summary && lesson.visual && lesson.steps.length === 3 && lesson.mind.length === 3);
  assert.ok(lesson.check.length >= 2);
  for (const question of lesson.check) {
   assert.ok(question.text && question.answer && question.why);
   if (question.mode === 'choice') assert.equal(question.options.filter(option => option === question.answer).length, 1);
  }
 }
});

test('every new activity can complete with distinct choices', () => {
 assert.deepEqual(new Set(DISCOVERY_LESSONS.map(lesson => lesson.activity.kind)), new Set(['match', 'order']));
 for (const {id, activity} of DISCOVERY_LESSONS) {
  const answers = activity.kind === 'match' ? activity.pairs.map(pair => pair[1]) : activity.steps;
  assert.ok(activity.prompt && activity.feedback, id);
  assert.ok(answers.length >= 3 && answers.every(Boolean), id);
  assert.equal(new Set(answers).size, answers.length, id);
  if (activity.kind === 'match') {
   assert.ok(activity.pairs.every(([cue]) => cue), id);
   assert.equal(new Set(activity.pairs.map(pair => pair[0])).size, answers.length, id);
  }
 }
});
