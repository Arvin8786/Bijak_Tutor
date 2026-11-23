/** Simple HTTPS POST for the GitHub Pages app. No browser cookies authenticate these requests. */
function doPost(event){
 const content=event?.postData?.contents;
 let result;
 try{
  if(typeof content!=='string'||content.length>3001000)throw Error('Invalid account request');
  let request;
  try{request=JSON.parse(content)}catch{throw Error('Invalid account request')}
  if(request?.service!=='bijak-account-v1'||typeof request.method!=='string'||!Array.isArray(request.args))throw Error('Invalid account request');
  const {method,args}=request;
  let value;
  if(method==='health'&&args.length===0)value={version:1,release:"sky-atlas-1"};
  else if(method==='passwordSignIn'&&args.length===1)value=passwordSignIn(args[0]);
  else if(method==='passwordSignOut'&&args.length===1)value=passwordSignOut(args[0]);
  else if(['getPasswordSettings','saveParentPassword','saveChildPassword'].includes(method)){
   value=accountPasswordSettingsRequest_(method,args);
  }else if(method==='parentNoticeRequest'&&args.length===2)value=parentNoticeRequest(...args);
  else if(method==='friendMatch'&&args.length===3)value=friendMatch(...args);
  else if(method==='mockExamRequest'&&args.length===3)value=mockExamRequest(...args);
  else value=portalRequest(method,args);
  result={ok:true,value};
 }catch(error){
  result={ok:false,error:typeof error?.message==='string'?error.message.slice(0,350):'Account request failed'};
 }
 return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function accountPasswordSettingsRequest_(method,args){
 if(method==='getPasswordSettings'&&args.length===1)return getPasswordSettings(args[0]);
 if(method==='saveParentPassword'&&args.length===2)return saveParentPassword(...args);
 if(method==='saveChildPassword'&&args.length===3)return saveChildPassword(...args);
 throw Error('Invalid password settings request');
}
