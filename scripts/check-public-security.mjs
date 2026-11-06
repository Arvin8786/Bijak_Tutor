/** CI guard against committing obvious credentials to the public frontend/repo.
 * This check does not replace GitHub secret scanning, history review or private backend.
 */
import fs from 'node:fs';
import path from 'node:path';
const roots=['src','public','apps-script','.github/workflows'];
const patterns=[
 ['Google API credential',/AIza[0-9A-Za-z_-]{30,}/g],
 ['OpenAI secret',/sk-(?:proj-)?[0-9A-Za-z_-]{24,}/g],
 ['GitHub token',/gh(?:p|o|u|s|r)_[A-Za-z0-9]{30,}/g],
 ['AWS access key',/AKIA[0-9A-Z]{16}/g],
 ['Cloudflare API token',/cfpat_[A-Za-z0-9_-]{30,}/g],
 ['Private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g]
];
let count=0,failed=0;
function walk(location){
 if(!fs.existsSync(location))return;
 for(const entry of fs.readdirSync(location,{withFileTypes:true})){
  const full=path.join(location,entry.name);
  if(entry.isDirectory()){walk(full);continue}
  if(!entry.isFile()||!/[.](?:js|jsx|ts|tsx|json|html|css|yml|yaml|gs|svg)$/.test(entry.name))continue;
  const content=fs.readFileSync(full,'utf8');count++;
  for(const [kind,pattern] of patterns){
   pattern.lastIndex=0;
   if(pattern.test(content)){console.error('POTENTIAL CREDENTIAL: '+kind+' in '+full);failed++}
  }
 }
}
roots.forEach(walk);
const dangerous=['.env','.env.production','.env.local','service-account.json','credentials.json','id_rsa','client_secret.json'];
for(const item of dangerous)if(fs.existsSync(item)){console.error('Do not keep a live credential file in project root: '+item);failed++}
const sw=fs.readFileSync('public/sw.js','utf8');
if(!sw.includes("pathWithinApp.startsWith('/private/')")||!sw.includes("req.method !== 'GET'")){console.error('Service worker privacy bypass was changed');failed++}
const app=fs.readFileSync('src/main.jsx','utf8');
if(/VITE_(?:GEMINI|OPENAI|API_SECRET|SERVICE_ACCOUNT|PIN_PEPPER)/.test(app)){console.error('Never bundle private keys through VITE_ variables');failed++}
console.log('Public source credential scan:',count,'files;',failed,'finding(s).');
if(failed)process.exit(1);
