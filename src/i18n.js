// Lightweight translation of the app's fixed on-screen wording.
// App sets the language on every render; tx() returns the Tamil text when Tamil is chosen and the original wording otherwise.
import TAMIL from './uiTamil.json' with {type:'json'};
let current='en';
export const setUiLang=language=>{current=language};
export const tx=text=>current==='ta'&&Object.prototype.hasOwnProperty.call(TAMIL,text)?TAMIL[text]:text;
