import {defineConfig} from 'vite';
import {execFileSync} from 'node:child_process';
// The running app and release.json share the same immutable deployment identity.
function revision(){
 if(process.env.GITHUB_SHA)return process.env.GITHUB_SHA.slice(0,12);
 try{return execFileSync('git',['rev-parse','--short=12','HEAD'],{encoding:'utf8'}).trim()}catch{return 'local-dev'}
}
export default defineConfig({
 base:'./',
 define:{__BIJAK_RELEASE__:JSON.stringify(revision())},
 build:{outDir:'dist'}
});
