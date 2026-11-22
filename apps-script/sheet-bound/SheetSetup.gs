/** Bound to the private BijakTutor Database. This project manages Sheets, not live login. */
const BOUND_DATABASE_ID_='1Cyfwb3JG2Dkh4iP-rGMLF9HntmaRsEabPBameyw_x_4';
function boundOwner_(){
 const sheet=SpreadsheetApp.getActiveSpreadsheet();
 if(!sheet||sheet.getId()!==BOUND_DATABASE_ID_)throw Error('Open this script from the BijakTutor Database spreadsheet.');
 if(Session.getEffectiveUser().getEmail().toLowerCase()!=='arvin8786@gmail.com')throw Error('Only the verified spreadsheet owner can run maintenance.');
 return sheet;
}
function buildBoundSheetMenu_(){
 SpreadsheetApp.getUi().createMenu('BijakLearn')
  .addItem('Check database setup','checkBoundSheet')
  .addItem('Set up or repair tables','setupBoundSheet')
  .addItem('Import missing draft lessons','importBoundCurriculum')
  .addItem('Import missing learning tracks','importBoundLearningTracks')
  .addSeparator().addItem('Open app and production editor','openBijakLearnLinks').addToUi();
}
function setupBoundSheet(){
 boundOwner_();
 initializeDatabase_();const modules=seedModuleAccess_();configureModuleAccessSheet_();buildBoundSheetMenu_();
 const result={ready:true,moduleRules:modules.total,note:'Existing records and production credentials preserved. This script manages the linked Sheet; live login stays in the production backend.'};
 console.log(JSON.stringify(result));return result;
}
function checkBoundSheet(){
 const spreadsheet=boundOwner_();
 const checks=Object.entries(TABLES).map(([name,keys])=>{
  const sheet=spreadsheet.getSheetByName(name);if(!sheet)return {name,ready:false,rows:0};
  const width=sheet.getLastColumn(),headers=width?sheet.getRange(1,1,1,width).getValues()[0].map(String):[];
  return {name,ready:headers.length===keys.length&&keys.every((key,i)=>key===headers[i]),rows:Math.max(0,sheet.getLastRow()-1)};
 });
 const result={ready:checks.every(c=>c.ready),tables:checks.length,checks};console.log(JSON.stringify(result));
 SpreadsheetApp.getUi().alert('BijakLearn database check',checks.filter(c=>!c.ready).length?'Some tables need setup or header repair. See the execution log.':'All '+checks.length+' table schemas are ready. Existing records are preserved.',SpreadsheetApp.getUi().ButtonSet.OK);return result;
}
function importBoundCurriculum(){boundOwner_();const result=importFullJuniorCurriculum_();console.log(JSON.stringify(result));return result}
function importBoundLearningTracks(){boundOwner_();const result=importGrowthModules_();console.log(JSON.stringify(result));return result}
function openBijakLearnLinks(){
 boundOwner_();SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<p><a href="https://arvin8786.github.io/Bijak_Tutor/" target="_blank" rel="noopener">Open BijakLearn Junior</a></p><p><a href="https://script.google.com/home/projects/1MOv6dCfSrsJwjhMHfUwGZui0032XkGLKRgjmFYTTGJyAuGfGtQH8PfPt/edit" target="_blank" rel="noopener">Open production Apps Script editor</a></p><p>This Sheet-bound project manages database setup and imports. The existing production project keeps Google login, private settings and upload retention.</p>').setWidth(440).setHeight(220),'BijakLearn links');
}
