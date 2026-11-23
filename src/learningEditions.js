export const JUNIOR = Object.freeze({
 id:'junior',name:'BijakLearn Junior',label:'Preschool–Year 3',years:Object.freeze([0,1,2,3])
});
export const JUNIOR_PLUS = Object.freeze({
 id:'junior-plus',name:'BijakLearn Junior Plus',label:'Years 4–6',years:Object.freeze([4,5,6])
});
export const LEARNING_EDITIONS = Object.freeze([JUNIOR,JUNIOR_PLUS]);

export function learningEditionForYear(year){
 if(typeof year==='string'&&!year.trim())return null;
 if(typeof year!=='number'&&typeof year!=='string')return null;
 return LEARNING_EDITIONS.find(edition=>edition.years.includes(Number(year)))||null;
}

export function inLearningEdition(edition,year){
 return learningEditionForYear(year)===edition;
}
