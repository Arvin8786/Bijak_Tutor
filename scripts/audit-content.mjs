import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {auditContent} from '../src/contentAudit.js';
const report=auditContent(LESSONS);
fs.mkdirSync('release',{recursive:true});
fs.writeFileSync('release/CONTENT_QUALITY.json',JSON.stringify(report,null,2)+'\n');
console.log('Content quality:',JSON.stringify({...report,missingMaterials:report.missingMaterials.length,limits:undefined}));
if(report.errors.length)process.exitCode=1;
