import {build} from 'esbuild';

await build({
 entryPoints:['scripts/password-kdf.js'],
 outfile:'release/PasswordKdf.gs',
 bundle:true,
 platform:'browser',
 format:'iife',
 globalName:'BijakPasswordKdf',
 minify:true,
 legalComments:'inline'
});
