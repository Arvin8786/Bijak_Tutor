import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

/** A small stand-in for Google Sheets that parses typed strings the way the real grid does. */
function fakeSheet(name) {
  const sheet = {name, rows: [], formats: {}, maxRows: 1000, frozen: 0};
  const parse = (value, col) => {
    if (typeof value !== 'string') return value;
    if (sheet.formats[col] === '@') return value;
    if (value.startsWith("'")) return value.slice(1);
    if (/^[+-]?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
    if (/^\d{1,2}\/\d{1,2}$/.test(value.trim())) { const [a, b] = value.split('/').map(Number); return new Date(Date.UTC(2026, a - 1, b)); }
    if (value === 'TRUE') return true;
    if (value === 'FALSE') return false;
    return value;
  };
  const range = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({length: nr}, (_, i) => Array.from({length: nc}, (_, j) => (sheet.rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
    setValue(v) { this.setValues([[v]]); return this; },
    setValues(values) { values.forEach((row, i) => row.forEach((v, j) => { const rr = r - 1 + i; sheet.rows[rr] = sheet.rows[rr] || []; sheet.rows[rr][c - 1 + j] = parse(v, c + j); })); return this; },
    setNumberFormat(f) { for (let j = 0; j < nc; j++) sheet.formats[c + j] = f; return this; },
    setDataValidation() { return this; }, setFontWeight() { return this; },
  });
  Object.assign(sheet, {
    appendRow(row) { sheet.rows.push(row.map((v, i) => parse(v, i + 1))); },
    getDataRange: () => range(1, 1, sheet.rows.length, Math.max(1, ...sheet.rows.map(r => r.length))),
    getRange: (r, c, nr, nc) => range(r, c, nr, nc),
    getLastRow: () => sheet.rows.length,
    getLastColumn: () => Math.max(0, ...sheet.rows.map(r => r.length)),
    getMaxRows: () => sheet.maxRows, getMaxColumns: () => 60,
    setFrozenRows(n) { sheet.frozen = n; }, insertColumnsAfter() {},
  });
  return sheet;
}

function makeWorld() {
  const sheets = new Map(), props = new Map(), cache = new Map(), fetches = [];
  const tokens = new Map();
  const world = {sheets, props, fetches, tokens};
  const owner = 'owner@example.test';
  const ctx = {
    console,
    SpreadsheetApp: {getActiveSpreadsheet: () => ({getId: () => 'db', getSheetByName: n => sheets.get(n) || null, insertSheet: n => { const s = fakeSheet(n); sheets.set(n, s); return s; }}), flush() {}},
    PropertiesService: {getScriptProperties: () => ({getProperty: k => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v)})},
    CacheService: {getScriptCache: () => ({get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, String(v)), remove: k => cache.delete(k)})},
    LockService: {getScriptLock: () => ({waitLock() {}, releaseLock() {}})},
    Session: {getEffectiveUser: () => ({getEmail: () => owner}), getActiveUser: () => ({getEmail: () => owner})},
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      base64Decode: s => Array.from(Buffer.from(s, 'base64')).map(b => (b > 127 ? b - 256 : b)),
      base64Encode: b => Buffer.from(b).toString('base64'),
      base64EncodeWebSafe: b => Buffer.from(b).toString('base64url'),
      newBlob: (bytes, mimeType, name) => ({bytes, mimeType, name}),
      computeDigest: (_alg, text) => Array.from(crypto.createHash('sha256').update(String(text)).digest()),
      DigestAlgorithm: {SHA_256: 'sha256'},
      formatDate: d => new Date(d).toISOString().slice(0, 7),
    },
    UrlFetchApp: {fetch: url => { fetches.push(url); const token = decodeURIComponent(url.split('id_token=')[1]); const p = tokens.get(token); return {getResponseCode: () => (p ? 200 : 400), getContentText: () => JSON.stringify(p || {})}; }},
    DriveApp: (() => {
      const root = {getId: () => 'root'};
      const files = [];
      const folder = {getId: () => 'folder', getOwner: () => ({getEmail: () => owner}), getParents: () => { let done = false; return {hasNext: () => !done, next: () => { done = true; return root; }}; }, getSharingAccess: () => 'PRIVATE', getEditors: () => [], getViewers: () => [],
        createFile: blob => { const file = {id: 'file-' + files.length, blob, trashed: false, getId() { return this.id; }, getSharingAccess: () => 'PRIVATE', getEditors: () => [], getViewers: () => [], setTrashed() { this.trashed = true; }}; files.push(file); return file; }};
      return {Access: {PRIVATE: 'PRIVATE'}, getRootFolder: () => root, getFolderById: () => folder, files};
    })(),
  };
  vm.createContext(ctx);
  const read = f => fs.readFileSync(new URL('../apps-script/' + f, import.meta.url), 'utf8');
  for (const f of ['Code.gs', 'AccountAccess.gs', 'TierAccess.gs', 'PremiumKasih.gs', 'StudentAccess.gs', 'ModuleService.gs', 'AdminOperations.gs', 'TutorAI.gs', 'Commerce.gs', 'RolePortals.gs', 'CurriculumImport.gs']) vm.runInContext(read(f), ctx, {filename: f});
  const marking = fs.readFileSync(new URL('../src/answerMarking.js', import.meta.url), 'utf8').replaceAll('export ', '').replace(/\b(markPractice|normalizedAnswer|numericValue)\b/g, '$1_');
  vm.runInContext(marking, ctx);
  props.set('GOOGLE_CLIENT_ID', 'client-1');
  props.set('PIN_PEPPER', 'pepper');
  props.set('KASIH_DOCUMENTS_FOLDER_ID', 'folder');
  props.set('ACCOUNT_ADMIN_GOOGLE_SUB', '900000000000000000001');
  world.run = code => vm.runInContext(code, ctx);
  world.ctx = ctx;
  world.person = (sub, email) => {
    const token = ('tok-' + sub + '-' + 'x'.repeat(60)).slice(0, 100);
    tokens.set(token, {aud: 'client-1', iss: 'accounts.google.com', email_verified: 'true', exp: String(Math.floor(Date.now() / 1000) + 3600), sub, email, name: email.split('@')[0]});
    return token;
  };
  vm.runInContext('initializeDatabase_()', ctx);
  return world;
}

const PNG = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(32)]).toString('base64');

test('imported answers that look like fractions, negatives or digits stay exact text', () => {
  const w = makeWorld();
  w.run(`const BIJAK_CURRICULUM_BUNDLE=[{id:'t-frac',year:3,subject:'Matematik',title:'Pecahan',summary:'s',icon:'x',steps:[],mind:[],misconceptions:{},check:[
    {id:'f1',text:'Half?',mode:'number',answer:'1/2',why:'w'},{id:'f2',text:'Neg?',mode:'number',answer:'-3',why:'w'},{id:'f3',text:'Zero?',mode:'text',answer:'007',why:'w'},{id:'f4',text:'Pick',mode:'choice',options:['a','b'],answer:'1/4',why:'w'}]}]`);
  w.run('importFullJuniorCurriculum_()');
  const answers = Object.fromEntries(w.run("rows_('Questions').filter(q=>q.lessonId==='t-frac').map(q=>[q.questionId,q.correctAnswer])"));
  assert.deepEqual({...answers}, {f1: '1/2', f2: '-3', f3: '007', f4: '1/4'});
  assert.ok(w.run("rows_('Questions').every(q=>!(q.correctAnswer instanceof Date))"));
});

test('21-digit Google IDs and numeric-looking references never lose digits', () => {
  const w = makeWorld();
  const sub = '123456789012345678901';
  w.run(`upsertParent_({sub:'${sub}',email:'p@example.test',name:'P'})`);
  w.run(`upsertParent_({sub:'${sub}',email:'p@example.test',name:'P'})`);
  assert.equal(w.run('rows_("Parents").length'), 1, 'a repeated sign-in does not duplicate the parent');
  assert.equal(w.run('rows_("Parents")[0].googleSub'), sub);
  w.run("append_('Payments',{paymentId:'p1',googleSub:'1',reference:'000123456789',amountRM:10,status:'VERIFIED'})");
  assert.equal(w.run('rows_("Payments")[0].reference'), '000123456789');
});

test('student-typed answers cannot become spreadsheet formulas', () => {
  const w = makeWorld();
  w.run("append_('Attempts',{attemptId:'a',childId:'c',googleSub:'1',lessonId:'l',questionId:'q',mode:'text',correct:false,hints:0,transfer:false,answer:'=IMPORTXML(\"x\")',createdAt:'now'})");
  const raw = w.sheets.get('Attempts').rows[1][9];
  assert.equal(raw.replace(/^'/,''), '=IMPORTXML("x")', 'stored as inert text after the escape');
  assert.equal(w.run("(function(){return cell_('=1+1')})()"), "'=1+1");
});

test('free lessons are not locked by the starter seed', () => {
  const w = makeWorld();
  const premium = w.run("rows_('Lessons').map(l=>String(l.premium).toUpperCase())");
  assert.ok(premium.length > 0 && premium.every(v => v === 'FALSE'));
});

test('identity checks are cached so one sign-in does not call Google for every request', () => {
  const w = makeWorld();
  const token = w.person('555', 'cache@example.test');
  w.run(`verify_('${token}')`); w.run(`verify_('${token}')`); w.run(`verify_('${token}')`);
  assert.equal(w.fetches.length, 1);
  assert.throws(() => w.run("verify_('short')"), /Sign in/);
});

test('a submitted order keeps blocking new orders after its quote window ends', () => {
  const w = makeWorld();
  const admin = w.person('900000000000000000001', 'admin@example.test');
  const parent = w.person('800000000000000000002', 'parent@example.test');
  assert.throws(() => w.run(`getPortalBootstrap('${parent}','parent')`), /ACCOUNT_PENDING/);
  w.run(`setAccountAccess('${admin}','google:800000000000000000002','ACTIVE','')`);
  w.run(`getPortalBootstrap('${parent}','parent')`);
  const order = w.run(`createFamilyOrder('${parent}',{kind:'LIFETIME_PREMIUM'})`);
  assert.equal(order.totalCents, 10000);
  w.run(`submitOrderProof('${parent}','${order.id}','000778899',{mimeType:'image/png',data:'${PNG}'})`);
  w.run(`update_('Orders','orderId','${order.id}',{expiresAt:'2000-01-01T00:00:00.000Z'})`);
  assert.throws(() => w.run(`createFamilyOrder('${parent}',{kind:'LIFETIME_PREMIUM'})`), /reviewed|current order/);
  assert.equal(w.run("rows_('Orders')[0].reference"), '000778899', 'receipt reference keeps its leading zeros');
  w.run(`reviewFamilyOrder('${admin}','${order.id}','REJECTED','Receipt unreadable')`);
  const again = w.run(`createFamilyOrder('${parent}',{kind:'LIFETIME_PREMIUM'})`);
  assert.equal(again.status, 'QUOTED');
});

test('a receipt reference cannot be reused even when it is all digits', () => {
  const w = makeWorld();
  const admin = w.person('900000000000000000001', 'admin@example.test');
  const a = w.person('810000000000000000003', 'a@example.test');
  const b = w.person('820000000000000000004', 'b@example.test');
  for (const [t, sub] of [[a, '810000000000000000003'], [b, '820000000000000000004']]) {
    assert.throws(() => w.run(`getPortalBootstrap('${t}','parent')`), /ACCOUNT_PENDING/);
    w.run(`setAccountAccess('${admin}','google:${sub}','ACTIVE','')`);
  }
  const first = w.run(`createFamilyOrder('${a}',{kind:'LIFETIME_PREMIUM'})`);
  w.run(`submitOrderProof('${a}','${first.id}','12345678',{mimeType:'image/png',data:'${PNG}'})`);
  const second = w.run(`createFamilyOrder('${b}',{kind:'LIFETIME_PREMIUM'})`);
  assert.throws(() => w.run(`submitOrderProof('${b}','${second.id}','12345678',{mimeType:'image/png',data:'${PNG}'})`), /already submitted/);
});

test('removed learners no longer appear in the legacy parent bootstrap', () => {
  const w = makeWorld();
  const admin = w.person('900000000000000000001', 'admin@example.test');
  const parent = w.person('830000000000000000005', 'q@example.test');
  assert.throws(() => w.run(`getPortalBootstrap('${parent}','parent')`), /ACCOUNT_PENDING/);
  w.run(`setAccountAccess('${admin}','google:830000000000000000005','ACTIVE','')`);
  const made = w.run(`linkParentChild('${parent}',{studentEmail:'kid@example.test',name:'Kid',year:1,consent:true})`);
  assert.equal(w.run(`getBootstrap('${parent}').children.length`), 1);
  w.run(`removeChildLink('${admin}','${made.childId}','duplicate profile')`);
  assert.equal(w.run(`getBootstrap('${parent}').children.length`), 0);
});

test('retention job survives a file that was already deleted by hand', () => {
  const w = makeWorld();
  const old = new Date(Date.now() - 120 * 86400000).toISOString();
  w.run(`append_('Scholarships',{requestId:'r1',googleSub:'1',status:'APPROVED',submittedAt:'${old}',reviewedAt:'${old}',guardianName:'G',studentNickname:'S',schoolYear:1,reason:'long enough reason',guardianConsent:'TRUE',documentIdsJson:'["missing-file"]',consentAt:'${old}'})`);
  w.ctx.DriveApp.getFileById = () => { throw new Error('File not found'); };
  assert.equal(w.run('purgeKasihEvidence_()').removed, 0);
  assert.equal(w.run("rows_('Scholarships')[0].guardianName"), '');
});

test('portal allowlist serves both bootstraps and the transport answers when refusing', () => {
  const portal = fs.readFileSync(new URL('../apps-script/RolePortals.gs', import.meta.url), 'utf8');
  assert.match(portal, /operations=\{getBootstrap,getStudentBootstrap,/);
  const transport = fs.readFileSync(new URL('../apps-script/Transport.html', import.meta.url), 'utf8');
  assert.match(transport, /refuse\('Too many requests at once/);
});
