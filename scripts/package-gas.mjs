import fs from 'node:fs';import path from 'node:path';
const dir='dist';const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const jsPath=html.match(/src="\/(assets\/[^\"]+\.js)"/)?.[1];const cssPath=html.match(/href="\/(assets\/[^\"]+\.css)"/)?.[1];
if(!jsPath) throw new Error('JS asset not found');
const js=fs.readFileSync(path.join(dir,jsPath),'utf8').replace(/<\/script/gi,'<\\/script');
const css=cssPath?fs.readFileSync(path.join(dir,cssPath),'utf8'):'';
const out=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>BijakLearn Junior</title><style>${css}</style></head><body><div id="root"></div><script src="https://accounts.google.com/gsi/client" async defer></script><script>window.BIJAKLEARN_GOOGLE_CLIENT_ID=<?!= JSON.stringify(clientId) ?>;</script><script type="module">${js}</script></body></html>`;
fs.mkdirSync('release',{recursive:true});fs.writeFileSync('release/App.html',out);fs.copyFileSync('apps-script/Code.gs','release/Code.gs');fs.copyFileSync('apps-script/appsscript.json','release/appsscript.json');console.log('Ready: release/App.html, Code.gs, appsscript.json');
