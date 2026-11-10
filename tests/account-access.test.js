import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const operator = '100000000000000000001';
const newcomer = '100000000000000000002';
const existing = '100000000000000000003';
const lookalike = '100000000000000000004';
const token = sub => 'test-id-token-' + sub.padStart(60, '0');
const code = ['Code', 'AccountAccess', 'ModuleService', 'TutorAI']
 .map(file => fs.readFileSync(new URL('../apps-script/' + file + '.gs', import.meta.url), 'utf8')).join('\n');

function backend() {
 const tables = {
  Parents: [{googleSub: existing, email: 'existing@example.test', displayName: 'Existing', parentPinHash: 'private hash'}],
  Children: [{childId: 'child-1', parentSub: existing, nickname: 'Test child', year: 1}],
  AccountAccess: [],
 };
 let locked = false;
 const payloads = new Map([operator, newcomer, existing, lookalike].map(sub => [token(sub), {
  sub, aud: 'test-client', iss: 'accounts.google.com', exp: Math.floor(Date.now() / 1000) + 3600,
  email_verified: true, email: sub === operator || sub === lookalike ? 'operator@example.test' : 'test@example.test',
 }]));
 const context = vm.createContext({
  PropertiesService: {getScriptProperties: () => ({
   getProperty: key => ({ACCOUNT_ADMIN_GOOGLE_SUB: operator, GOOGLE_CLIENT_ID: 'test-client'})[key],
  })},
  UrlFetchApp: {fetch: url => {
   const payload = payloads.get(new URL(url).searchParams.get('id_token'));
   return {getResponseCode: () => payload ? 200 : 400, getContentText: () => JSON.stringify(payload)};
  }},
  LockService: {getScriptLock: () => ({
   waitLock() { assert.equal(locked, false); locked = true; },
   releaseLock() { assert.equal(locked, true); locked = false; },
  })},
  SpreadsheetApp: {flush() { assert.equal(locked, true); }},
 });
 vm.runInContext(code, context);
 context.rows_ = name => tables[name] || [];
 context.append_ = (name, row) => {
  if (name === 'AccountAccess') assert.equal(locked, true);
  (tables[name] ||= []).push(row);
 };
 return {context, tables, payloads};
}

test('new accounts are queued once and gain access only after an administrator approves', () => {
 const {context: api, tables} = backend();
 assert.throws(() => api.getLesson(token(newcomer), 'child-1', 'lesson'), /ACCOUNT_PENDING/);
 assert.equal(tables.AccountAccess.length, 0);
 assert.throws(() => api.getBootstrap(token(newcomer)), /ACCOUNT_PENDING/);
 assert.throws(() => api.getBootstrap(token(newcomer)), /ACCOUNT_PENDING/);
 assert.equal(tables.AccountAccess.length, 1);
 assert.equal(tables.Parents.length, 1);
 assert.equal(api.getBootstrap(token(operator)).canManageAccounts, true);
 assert.equal(api.listAccountAccess(token(operator)).find(a => a.id === 'google:' + newcomer).status, 'PENDING');
 api.setAccountAccess(token(operator), 'google:' + newcomer, 'ACTIVE', 'Test approval');
 assert.equal(api.getBootstrap(token(newcomer)).canManageAccounts, false);
 assert.ok(tables.Parents.some(parent => parent.googleSub === newcomer));
});

test('blocking denies already signed-in accounts at every protected entry point and restoration preserves records', () => {
 const {context: api, tables} = backend();
 const credential = token(existing);
 assert.equal(api.getBootstrap(credential).children[0].id, 'child-1');
 const id = 'google:' + existing;
 assert.throws(() => api.setAccountAccess(token(operator), id, 'REVOKED', ''), /reason/);
 api.setAccountAccess(token(operator), id, 'REVOKED', 'Abuse reported');
 api.setAccountAccess(token(operator), id, 'REVOKED', 'Duplicate request');
 assert.equal(tables.AccountAccess.length, 1);
 assert.equal(tables.AccountAccess[0].reason, 'Abuse reported');
 assert.equal(tables.AccountAccess[0].changedBy, 'google:' + operator);
 for (const method of ['getBootstrap', 'addChild', 'getLesson', 'submitAttempt', 'getParentReport',
  'setParentPin', 'requestScholarship', 'getGrowthModule', 'checkGrowthAnswer', 'askTutor']) {
  assert.throws(() => api[method](credential), /ACCOUNT_REVOKED/, method);
 }
 api.setAccountAccess(token(operator), id, 'ACTIVE', '');
 assert.equal(api.getBootstrap(credential).children[0].id, 'child-1');
 assert.equal(tables.Parents[0].parentPinHash, 'private hash');
 assert.equal(tables.AccountAccess.length, 2);
});

test('admin access requires the verified Google ID and cannot be changed through the account controls', () => {
 const {context: api, tables, payloads} = backend();
 const target = 'google:' + existing;
 assert.throws(() => api.listAccountAccess(token(lookalike)), /administrator access required/);
 assert.throws(() => api.setAccountAccess(token(existing), target, 'ACTIVE', ''), /administrator access required/);
 assert.throws(() => api.setAccountAccess(token(operator), 'google:' + operator, 'REVOKED', 'Test'), /Script Properties/);
 assert.throws(() => api.setAccountAccess(token(operator), target, 'ADMIN', ''), /valid access status/);
 assert.equal(tables.AccountAccess.length, 0);
 const roster = api.listAccountAccess(token(operator));
 assert.equal(roster.length, 1);
 assert.deepEqual(Object.keys(roster[0]), ['id', 'email', 'name', 'status']);
 payloads.get(token(operator)).exp = 'invalid';
 assert.throws(() => api.listAccountAccess(token(operator)), /Invalid Google identity/);
 assert.equal(api.upgradeCurriculumV5, undefined);
});
