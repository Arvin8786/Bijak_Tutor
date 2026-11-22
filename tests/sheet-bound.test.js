import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const code=fs.readFileSync('apps-script/Code.gs','utf8'),source=code.slice(code.indexOf('function database_'),code.indexOf('function rows_'));
test('database resolves its bound container without opening a different spreadsheet',()=>{
 const active={getId:()=> 'linked',getSheetByName:name=>({name})},ctx={SpreadsheetApp:{getActiveSpreadsheet:()=>active,openById:()=>{throw Error('Unexpected external workbook access')}},props_:()=>({getProperty:()=>null})};vm.createContext(ctx);vm.runInContext(source,ctx);assert.equal(ctx.database_(),active);assert.equal(ctx.sheet_('Orders').name,'Orders');
});
test('standalone production keeps its configured database and fails closed when absent',()=>{
 const ctx={SpreadsheetApp:{getActiveSpreadsheet:()=>null,openById:id=>({id})},props_:()=>({getProperty:()=> 'production'})};vm.createContext(ctx);vm.runInContext(source,ctx);assert.equal(ctx.database_().id,'production');ctx.props_=()=>({getProperty:()=>null});assert.throws(()=>ctx.database_(),/not configured/);
});
test('bound setup checks the exact spreadsheet and owner before mutating data',()=>{
 let calls=0;const ctx={SpreadsheetApp:{getActiveSpreadsheet:()=>({getId:()=> 'wrong'})},Session:{getEffectiveUser:()=>({getEmail:()=> 'arvin8786@gmail.com'})},initializeDatabase_:()=>calls++};vm.createContext(ctx);vm.runInContext(fs.readFileSync('apps-script/sheet-bound/SheetSetup.gs','utf8'),ctx);assert.throws(()=>ctx.setupBoundSheet(),/BijakTutor/);ctx.SpreadsheetApp.getActiveSpreadsheet=()=>({getId:()=> '1Cyfwb3JG2Dkh4iP-rGMLF9HntmaRsEabPBameyw_x_4'});ctx.Session.getEffectiveUser=()=>({getEmail:()=> 'other@test.invalid'});assert.throws(()=>ctx.setupBoundSheet(),/owner/);assert.equal(calls,0);
});
test('Sheet-bound manifest cannot access Drive, other sheets, external services or triggers',()=>{
 const manifest=JSON.parse(fs.readFileSync('apps-script/sheet-bound/appsscript.json','utf8'));assert.deepEqual(manifest.oauthScopes,['https://www.googleapis.com/auth/spreadsheets.currentonly','https://www.googleapis.com/auth/script.container.ui','https://www.googleapis.com/auth/userinfo.email']);assert.equal(manifest.webapp,undefined);
});
