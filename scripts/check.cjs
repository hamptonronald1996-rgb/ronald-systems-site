const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
for(const [,url] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
 if(url.startsWith('#')) assert(ids.includes(url.slice(1)),`Missing section: ${url}`);
 else if(!/^(https?:|mailto:|data:)/.test(url)) assert(fs.existsSync(path.join(root,url)),`Missing asset: ${url}`);
}
for(const file of ['site.js','workshop.js','vendor/three.min.js'])new vm.Script(fs.readFileSync(path.join(root,'assets',file),'utf8'),{filename:file});
const scene=fs.readFileSync(path.join(root,'assets/workshop.js'),'utf8');
for(const [,file] of scene.matchAll(/\.load\('(assets\/[^']+)'/g))assert(fs.existsSync(path.join(root,file)),`Missing scene texture: ${file}`);
for(const [,id] of html.matchAll(/<label for="([^"]+)"/g))assert(ids.includes(id),`Missing labelled control: ${id}`);
assert(html.includes('mailto:hampton.ronald1996@gmail.com'),'Keep the direct contact fallback');
assert(!html.includes('id="boot"'),'Content must not depend on a blocking loader');
console.log('PASS: script syntax, local assets, scene textures, anchors, unique IDs, labels, and direct email fallback');
