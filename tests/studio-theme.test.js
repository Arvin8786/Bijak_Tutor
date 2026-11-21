import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../src/studio.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('studio theme loads after the shared design system so it can refine it', () => {
  assert.ok(main.indexOf("import './studio.css'")>main.indexOf("import './design-system.css'"));
});

test('studio stylesheet is balanced and keeps its responsive and motion contracts', () => {
  let depth=0;
  for(const ch of css){ if(ch==='{')depth++; if(ch==='}')depth--; assert.ok(depth>=0); }
  assert.equal(depth,0);
  assert.match(css,/@media\(min-width:1100px\)[\s\S]*nav\.nav/, 'desktop sidebar');
  assert.match(css,/@media\(max-width:1099px\)[\s\S]*overflow-x:auto/, 'phone swipe strip');
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/data-motion=off/);
});

test('headings keep emoji visible (no transparent gradient text)', () => {
  assert.ok(!/background-clip:text[^}]*color:transparent|color:transparent[^}]*background-clip:text/.test(css));
});
