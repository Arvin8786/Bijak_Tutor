const NOTICE_SHEET_ = 'ParentNotices';
const NOTICE_FIELDS_ = ['id','title','message','starts','ends','imageType','imageAlt','published','createdAt','author','kind'];
const NOTICE_IMAGE_COLUMNS_ = 12;
const NOTICE_IMAGE_LIMIT_ = 350000;
const NOTICE_IMAGE_CHUNK_ = 40000;

function noticeSheet_(create){
 const book=database_();
 let sheet=book.getSheetByName(NOTICE_SHEET_);
 if(!sheet&&create){
  sheet=book.insertSheet(NOTICE_SHEET_);
  const titles=[...NOTICE_FIELDS_,...Array.from({length:NOTICE_IMAGE_COLUMNS_},(_,i)=>'image'+(i+1))];
  sheet.getRange(1,1,1,titles.length).setValues([titles]);
  sheet.setFrozenRows(1);
  sheet.getRange('D:E').setNumberFormat('@');
 }
 return sheet;
}

function noticeRows_(sheet){
 if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,NOTICE_FIELDS_.length).getDisplayValues()
  .map((values,index)=>({...Object.fromEntries(NOTICE_FIELDS_.map((field,i)=>[field,values[i]])),row:index+2}));
}

function noticeDay_(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');
 return !isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value;
}

function noticeToday_(){return Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur','yyyy-MM-dd');}
function activeNotice_(notice,today){return notice.published==='YES'&&notice.starts<=today&&today<=notice.ends;}
function noticeSummary_(notice){
 const {id,title,message,starts,ends,imageAlt,published,kind}=notice;
 return {id,title,message,starts,ends,imageAlt,kind,hasImage:!!notice.imageType,published:published==='YES'};
}
function noticeText_(value){return typeof value==='string'?value.trim():'';}
function noticeCell_(value){return /^[\s]*[=+\-@]/.test(value)||value.startsWith("'")?"'"+value:value;}

function getParentNotices(token){
 requirePortalParent_(token);
 const today=noticeToday_();
 return noticeRows_(noticeSheet_(false)).reverse().filter(notice=>activeNotice_(notice,today)).map(noticeSummary_);
}

function getParentNoticeImage(token,id){
 requirePortalParent_(token);
 const sheet=noticeSheet_(false);
 const notice=noticeRows_(sheet).find(item=>item.id===id&&activeNotice_(item,noticeToday_()));
 if(!notice||!['image/jpeg','image/png'].includes(notice.imageType))throw Error('Notice image is unavailable');
 const data=sheet.getRange(notice.row,NOTICE_FIELDS_.length+1,1,NOTICE_IMAGE_COLUMNS_).getDisplayValues()[0].map(chunk=>chunk.slice(2)).join('');
 return {mimeType:notice.imageType,data};
}

function listParentNoticesAdmin(token){
 requireAccountAdmin_(token);
 return noticeRows_(noticeSheet_(false)).reverse().map(noticeSummary_);
}

function publishParentNotice(token,input){
 const admin=requireAccountAdmin_(token);
 const title=noticeText_(input?.title),message=noticeText_(input?.message),imageAlt=noticeText_(input?.imageAlt);
 const {starts,ends,image,kind}=input||{};
 if(!['Announcement','Release notes'].includes(kind))throw Error('Choose a notice type.');
 if(!title||title.length>120||message.length>2500||(!message&&!image))throw Error('Enter a title and a message or image.');
 if(!noticeDay_(starts)||!noticeDay_(ends)||starts>ends)throw Error('Choose a valid start and end date.');
 let imageType='',chunks=[];
 if(image){
  const {mimeType,data}=image;
  if(!imageAlt||imageAlt.length>200)throw Error('Describe the image in 200 characters or fewer.');
  if(!['image/png','image/jpeg'].includes(mimeType)||typeof data!=='string'||data.length>Math.ceil(NOTICE_IMAGE_LIMIT_/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(data)||data.length%4)throw Error('Use a PNG or JPEG image up to 350 KB.');
  const bytes=Utilities.base64Decode(data).map(byte=>byte&255);
  const signature=mimeType==='image/png'?[137,80,78,71,13,10,26,10]:[255,216,255];
  if(bytes.length>NOTICE_IMAGE_LIMIT_||!signature.every((byte,i)=>bytes[i]===byte))throw Error('Use a valid PNG or JPEG image up to 350 KB.');
  imageType=mimeType;
  for(let i=0;i<data.length;i+=NOTICE_IMAGE_CHUNK_)chunks.push("b:"+data.slice(i,i+NOTICE_IMAGE_CHUNK_));
 }
 const id=Utilities.getUuid(),lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  const sheet=noticeSheet_(true);
  sheet.appendRow([id,noticeCell_(title),noticeCell_(message),starts,ends,imageType,imageType?noticeCell_(imageAlt):'','YES',new Date().toISOString(),accountKey_(admin.sub),kind,...chunks]);
  SpreadsheetApp.flush();
  return {id};
 }finally{lock.releaseLock()}
}

function unpublishParentNotice(token,id){
 requireAccountAdmin_(token);
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  const sheet=noticeSheet_(false),notice=noticeRows_(sheet).find(item=>item.id===id);
  if(!notice)throw Error('Notice not found');
  sheet.getRange(notice.row,NOTICE_FIELDS_.indexOf('published')+1).setValue('NO');
  SpreadsheetApp.flush();
  return {ok:true};
 }finally{lock.releaseLock()}
}

function parentNoticeRequest(method,args){
 const methods={getParentNotices,getParentNoticeImage,listParentNoticesAdmin,publishParentNotice,unpublishParentNotice};
 if(!Array.isArray(args)||args.length>2||!Object.prototype.hasOwnProperty.call(methods,method))throw Error('Unsupported notice request');
 return methods[method](...args);
}
