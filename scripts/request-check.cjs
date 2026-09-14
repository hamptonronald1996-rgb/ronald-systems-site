// Exercise the real contact handlers without opening an email app or sending a request.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function element(){const classes=new Set();return {value:'',hidden:true,style:{},dataset:{},handlers:{},attributes:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x);return on;}},addEventListener(name,fn){this.handlers[name]=fn;},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},querySelectorAll:()=>[],contains:()=>false,focus(){this.focused=true;},select(){this.selected=true;},setCustomValidity(message){this.message=message;}};}
const ids=Object.fromEntries(['mobilePanel','menuBtn','hudText','progress','requestForm','serviceType','requestDetails','serviceMode','requestStatus','requestFallback','copyRequest'].map(id=>[id,element()]));
const chapters=['home','services','work','process','contact'].map((id,i)=>Object.assign(element(),{id,offsetTop:i*1000,dataset:{label:id}}));
const serviceLink=Object.assign(element(),{dataset:{service:'Networking & Wi-Fi'}});
ids.requestForm.reportValidity=()=>!!ids.requestDetails.value.trim()&&!ids.requestDetails.message;
const context={document:{documentElement:{scrollHeight:5000},querySelectorAll:s=>s==='.chapter'?chapters:s==='[data-service]'?[serviceLink]:[],querySelector:()=>element(),getElementById:id=>ids[id],addEventListener(){}},innerWidth:1280,innerHeight:720,scrollY:0,addEventListener(){},requestAnimationFrame:fn=>fn(),ResizeObserver:class{observe(){}},location:{href:''},navigator:{},console};
context.window=context;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/site.js'),'utf8'),context);
(async()=>{
 serviceLink.handlers.click();assert.equal(ids.serviceType.value,'Networking & Wi-Fi');
 ids.requestDetails.value='   ';ids.requestForm.handlers.submit({preventDefault(){}});assert.equal(context.location.href,'','Blank requests must not open an email app');
 ids.requestDetails.value='Router & laptop\nUSB-C: reconnect? #1';ids.serviceMode.value='Remote support / project';
 ids.requestForm.handlers.submit({preventDefault(){}});
 const draft=new URL(context.location.href);
 assert.equal(draft.protocol,'mailto:');assert.equal(draft.pathname,'hampton.ronald1996@gmail.com');
 assert.equal(draft.searchParams.get('subject'),'Build With Ronald — Networking & Wi-Fi');
 assert(draft.searchParams.get('body').includes('Router & laptop\nUSB-C: reconnect? #1'));
 assert(draft.searchParams.get('body').includes('Remote support / project'));
 let copied='';context.navigator.clipboard={writeText:async text=>{copied=text;}};
 await ids.copyRequest.handlers.click();assert(copied.includes('To: hampton.ronald1996@gmail.com'));
 assert(copied.includes('Networking & Wi-Fi'));assert.equal(ids.requestFallback.hidden,true);
 context.navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied');};
 await ids.copyRequest.handlers.click();assert.equal(ids.requestFallback.hidden,false);assert(ids.requestFallback.selected);assert.equal(ids.requestFallback.value,copied);
 serviceLink.dataset.project='CodeCredit';serviceLink.dataset.service='Custom software & AI';
 ids.requestDetails.value='';serviceLink.handlers.click();assert(ids.requestDetails.value.includes('CodeCredit'));assert.equal(ids.serviceType.value,'Custom software & AI');
 ids.requestDetails.value='Keep my existing request';serviceLink.handlers.click();assert.equal(ids.requestDetails.value,'Keep my existing request');
 console.log('PASS: service selection, blank validation, encoded email draft, copy content, clipboard-denied fallback, and project enquiry preservation');
})().catch(error=>{console.error(error);process.exitCode=1;});
