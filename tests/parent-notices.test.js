import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function fixture(){
 let day='2026-11-23',sheet;
 const rows=[];
 const ctx=vm.createContext({
  database_:()=>({getSheetByName:()=>sheet,insertSheet(){
   sheet={
    getLastRow:()=>rows.length,
    appendRow:row=>rows.push(row),
    setFrozenRows(){},
    getRange(row,col,height,width){
     return {setNumberFormat(){},setValues(values){rows.push(...values)},setValue(value){rows[row-1][col-1]=value},
      getDisplayValues(){return rows.slice(row-1,row-1+height).map(values=>Array.from({length:width},(_,index)=>values[col+index-1]||''));}};
    }
   };
   return sheet;
  }}),
  requirePortalParent_:token=>{if(token!=='parent')throw Error('Parent account required')},
  requireAccountAdmin_:token=>{if(token!=='admin')throw Error('Administrator access required');return {sub:'owner'}},
  Utilities:{formatDate:()=>day,getUuid:()=>String(rows.length),base64Decode:data=>Array.from(Buffer.from(data,'base64'))},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},SpreadsheetApp:{flush(){}},accountKey_:sub=>'google:'+sub
 });
 vm.runInContext(fs.readFileSync('apps-script/ParentNotices.gs','utf8'),ctx);
 return {ctx,rows,setDay:value=>{day=value}};
}

const notice={kind:'Release notes',title:'Library update',message:'New lessons',starts:'2026-11-24',ends:'2026-11-25'};
test('parents see only active notices, including both Malaysia date boundaries',()=>{
 const {ctx,rows,setDay}=fixture();
 assert.throws(()=>ctx.publishParentNotice('parent',notice),/Administrator/);
 assert.throws(()=>ctx.getParentNotices('student'),/Parent/);
 assert.throws(()=>ctx.publishParentNotice('admin',{...notice,ends:'2026-02-30'}),/date/);
 const {id}=ctx.publishParentNotice('admin',{...notice,message:'=1+1'});
 assert.equal(rows[1][2],"'=1+1");
 assert.equal(ctx.getParentNotices('parent').length,0);
 for(const day of [notice.starts,notice.ends]){
  setDay(day);
  assert.equal(ctx.getParentNotices('parent')[0].id,id);
 }
 setDay('2026-11-26');
 assert.equal(ctx.getParentNotices('parent').length,0);
 setDay(notice.starts);
 ctx.unpublishParentNotice('admin',id);
 assert.equal(ctx.getParentNotices('parent').length,0);
});

test('notice images are authenticated, validated and reassembled from safe cells',()=>{
 const {ctx,rows,setDay}=fixture();
 const image={mimeType:'image/png',data:Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(37000)]).toString('base64')};
 const input={...notice,message:'',image,imageAlt:'A classroom'};
 assert.throws(()=>ctx.publishParentNotice('admin',{...input,image:{...image,mimeType:'image/jpeg'}}),/valid PNG or JPEG/);
 const {id}=ctx.publishParentNotice('admin',input);
 assert.equal(rows[1][11].startsWith('b:'),true);
 assert.equal(rows[1][12].startsWith('b:'),true);
 assert.throws(()=>ctx.getParentNoticeImage('parent',id),/unavailable/);
 setDay(notice.starts);
 assert.throws(()=>ctx.getParentNoticeImage('student',id),/Parent/);
 assert.equal(ctx.getParentNoticeImage('parent',id).data,image.data);
 assert.throws(()=>ctx.parentNoticeRequest('database_',[]),/Unsupported/);
});
