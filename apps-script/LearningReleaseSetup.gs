// Run from the owner's editor to prepare the new tables and import legacy video titles.
function prepareLearningRelease(){
 const actor=Session.getActiveUser().getEmail();
 if(!actor||actor.toLowerCase()!==adminEmail_()||actor!==Session.getEffectiveUser().getEmail())throw Error('Open the project as its owner.');
 const result=prepareLearningRelease_();
 console.log(JSON.stringify(result));
 return result;
}
