/**
 * Primary KSSR subject selector. This is the COURSE CATALOG, not a promise of
 * completed or teacher-approved materials. See content/PRIMARY_SUBJECT_MATRIX.md.
 * School-specific/optional enrolment must be confirmed with the student's school.
 */
const S = [
 ['bm','Bahasa Melayu','📖','all','all'],
 ['en','Bahasa Inggeris','🔤','all','all'],
 ['math','Matematik','🧮','all','all'],
 ['science','Sains','🔬','all','all'],
 ['islam','Pendidikan Islam','🌙','all','all','religion'],
 ['moral','Pendidikan Moral','🤝','all','all','religion'],
 ['pjpk','Pendidikan Jasmani dan Pendidikan Kesihatan','🏃','all','all'],
 ['psv','Pendidikan Seni Visual','🖼️','all','all'],
 ['music','Pendidikan Muzik','🎵','all','all'],
 ['history','Sejarah','🌏','all','upper'],
 ['rbt','Reka Bentuk dan Teknologi','🛠️','all','upper'],
 ['chinese','Bahasa Cina','🀄',['SJKC'],'all'],
 ['tamil','Bahasa Tamil','🪷',['SJKT'],'all'],
 ['arabic','Bahasa Arab','✍️',['SK'],'all','optional'],
 ['chinese-sk','Bahasa Cina SK','🀄',['SK'],'all','optional'],
 ['tamil-sk','Bahasa Tamil SK','🪷',['SK'],'all','optional'],
 ['iban','Bahasa Iban','🌿',['SK'],'all','optional'],
 ['kadazandusun','Bahasa Kadazandusun','🌿',['SK'],'all','optional'],
 ['semai','Bahasa Semai','🌿',['SK'],'all','optional'],
 ];
export const PRIMARY_SUBJECT_CATALOG = S.map(([id,name,icon,streams,stage,group='core'])=>Object.freeze({id,name,icon,streams,stage,group,contentStatus:'CATALOG_ONLY'}));
export const SCHOOL_STREAMS=['SK','SJKC','SJKT'];
export function availableSubjects(school='SK',year=1,{includeOptional=false}={}) {
  if(!SCHOOL_STREAMS.includes(school)|| !Number.isInteger(+year)||+year<1||+year>6)return [];
  return PRIMARY_SUBJECT_CATALOG.filter(x=>(x.streams==='all'||x.streams.includes(school))&&(x.stage==='all'||(x.stage==='lower'?+year<=3:+year>=4))&&(includeOptional||x.group!=='optional'));
}
export function lessonCountForSubject(lessons,subject,year) {return (lessons||[]).filter(l=>l.subject===subject&&Number(l.year)===Number(year)).length;}