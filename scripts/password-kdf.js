import {pbkdf2} from '@noble/hashes/pbkdf2';
import {sha256} from '@noble/hashes/sha256';
export function derive(password,salt,iterations) {
 const utf8=Uint8Array.from(unescape(encodeURIComponent(password)),c=>c.charCodeAt(0));
 const bytes=Uint8Array.from(salt.match(/../g),pair=>parseInt(pair,16));
 return Array.from(pbkdf2(sha256,utf8,bytes,{c:iterations,dkLen:32}),b=>b.toString(16).padStart(2,'0')).join('');
}
