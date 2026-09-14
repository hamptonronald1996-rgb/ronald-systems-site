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
 else if(!/^(https?:|mailto:|data:)/.test(url)) assert(fs.existsSync(path.join(root,url.split('?')[0])),`Missing asset: ${url}`);
}
for(const file of ['site.js','workshop.js','workshop-items.js','workshop-tour.js','service-guide.js','project-guide.js','vendor/three.min.js'])new vm.Script(fs.readFileSync(path.join(root,'assets',file),'utf8'),{filename:file});
const scene=fs.readFileSync(path.join(root,'assets/workshop.js'),'utf8');
for(const [,file] of scene.matchAll(/['"](assets\/projects\/[^'"]+)['"]/g))assert(fs.existsSync(path.join(root,file)),`Missing scene texture: ${file}`);
const catalogueContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/workshop-items.js'),'utf8'),catalogueContext,{filename:'workshop-items.js'});
const equipment=catalogueContext.window.workshopItems;
assert.equal(equipment.length,12,'The workshop must contain the 12 routed equipment items');
assert.equal(new Set(equipment.map(item=>item.id)).size,equipment.length,'Equipment IDs must be unique');
const serviceOptions=[...html.match(/<select id="serviceType"[\s\S]*?<\/select>/)[0].matchAll(/<option(?: [^>]*)?>([^<]+)<\/option>/g)].map(match=>match[1]);
for(const item of equipment){
 assert(Number.isInteger(item.station)&&item.station>=0&&item.station<5,`Invalid station for ${item.id}`);
 for(const field of ['anchor','target','camera','size'])assert(item[field].length===3&&item[field].every(Number.isFinite),`Invalid ${field} for ${item.id}`);
 assert(item.size.every(value=>value>0),`Equipment bounds must be positive for ${item.id}`);
 assert(serviceOptions.includes(item.service),`Missing enquiry service for ${item.id}`);
 assert(item.href.startsWith('#')&&ids.includes(item.href.slice(1)),`Missing equipment destination for ${item.id}`);
}
assert.deepEqual(Array.from(equipment.filter(item=>item.station===2),item=>item.href),['#project-fur-love','#project-fur-love-operations','#project-secure-watch','#project-codecredit'],'The project wall must contain exactly the four approved builds');
assert(html.indexOf('assets/workshop-items.js')<html.indexOf('assets/workshop.js'),'Load equipment data before the scene');
assert(html.indexOf('assets/workshop.js')<html.indexOf('assets/workshop-tour.js'),'Load the scene before its controller');
for(const [,id] of html.matchAll(/<label for="([^"]+)"/g))assert(ids.includes(id),`Missing labelled control: ${id}`);
assert(html.includes('mailto:hampton.ronald1996@gmail.com'),'Keep the direct contact fallback');
assert(!html.includes('id="boot"'),'Content must not depend on a blocking loader');
const work=html.match(/<section class="chapter" id="work"[\s\S]*?<\/section>/)[0];
const projects=[...work.matchAll(/<h3>(.*?)<\/h3>/g)].map(m=>m[1]);
assert.deepEqual(projects,['Fur the Love Website','Fur the Love Operations','Secure Watch','CodeCredit'],'Only the four approved projects belong in the showcase');
assert(work.includes('fur-love-dogs-original.jpg'),'Use the original photo with its orientation metadata');
const jpeg=fs.readFileSync(path.join(root,'assets/projects/fur-love-dogs-original.jpg'));
const exif=jpeg.indexOf(Buffer.from('Exif\0\0'));
assert(exif>0,'The original photo must retain EXIF orientation');
const tiff=exif+6,little=jpeg.toString('ascii',tiff,tiff+2)==='II';
const u16=p=>little?jpeg.readUInt16LE(p):jpeg.readUInt16BE(p),u32=p=>little?jpeg.readUInt32LE(p):jpeg.readUInt32BE(p);
const ifd=tiff+u32(tiff+4);let orientation;
for(let n=0;n<u16(ifd);n++){const entry=ifd+2+n*12;if(u16(entry)===0x0112)orientation=u16(entry+8);}
assert.equal(orientation,6,'Original dogs photo must retain its upright display orientation');
console.log('PASS: script syntax, local assets, scene textures, anchors, unique IDs, labels, and direct email fallback');
console.log('PASS: exactly four approved showcase projects and retained photo orientation');
console.log('PASS: 12 unique equipment items, five valid stations, finite scene bounds, enquiry routes, four project destinations, and script dependency order');
