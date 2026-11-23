/** Run after Vite build: make the active release discoverable without caching it. */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
function revision(){
 if(process.env.GITHUB_SHA)return process.env.GITHUB_SHA.slice(0,12);
 try{return execFileSync('git',['rev-parse','--short=12','HEAD'],{encoding:'utf8'}).trim()}catch{return 'local-dev'}
}
const version=revision();
if(!/^[a-zA-Z0-9-]{4,30}$/.test(version))throw Error('Invalid build revision');
fs.writeFileSync('dist/release.json',JSON.stringify({version,publishedAt:new Date().toISOString()},null,2)+'\n');
const path='dist/sw.js';let sw=fs.readFileSync(path,'utf8');
const before="const VERSION = 'bijaklearn-static-v9';";
if(!sw.includes(before))throw Error('Expected worker cache version marker not found');
sw=sw.replace(before,`const VERSION = 'bijaklearn-static-${version}';`);
const assetMarker = 'const BUNDLED_ASSETS = [];';
if (!sw.includes(assetMarker)) throw Error('Expected offline asset marker not found');
const assets = fs.readdirSync('dist/assets')
 .filter(file => /\.(?:js|css)$/.test(file))
 .sort()
 .map(file => 'assets/' + file);
if (!assets.some(asset => asset.endsWith('.js'))) throw Error('Missing built JavaScript for offline use');
sw = sw.replace(assetMarker, `const BUNDLED_ASSETS = ${JSON.stringify(assets)};`);
fs.writeFileSync(path,sw);
console.log('Stamped PWA release',version);
