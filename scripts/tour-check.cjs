// Exercise the actual tour controller, including asynchronous native dialog close events.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../assets/workshop-tour.js'),'utf8');
class TestEvent {
 constructor(type,properties={}){this.type=type;Object.assign(this,properties);}
 preventDefault(){this.defaultPrevented=true;}
}
function eventTarget(){
 const listeners=new Map();
 return {addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);return !event.defaultPrevented;}};
}
function harness({available=true,scenePresent=true,dialogSupported=true}={}){
 const tasks=[],frames=[],log=[],calls=[],categories=[],changes=[];
 let context,document,observedResize;
 function element(id){
  const classes=new Set();
  return Object.assign(eventTarget(),{id,hidden:true,style:{},attributes:{},children:[],textContent:'',value:'',
   classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)},
   append(child){this.children.push(child);},setAttribute(name,value){this.attributes[name]=value;},
   focus(options){document.activeElement=this;log.push({type:'focus',id,options,locked:document.body.classList.contains('is-exploring'),top:document.body.style.top});},
   scrollIntoView(options){log.push({type:'scrollIntoView',id,options});},
   setPointerCapture(pointerId){this.pointerCapture=pointerId;}
  });
 }
 const ids=['workshopTour','tourTitle','tourCopy','tourNumber','tourDetail','tourPrimary','tourRequest','tourStations','tourStage','tourClose','tourPrevious','tourNext','tourLeft','tourRight','tourReset','serviceType','services','work','contact','project-secure-watch'];
 const nodes=Object.fromEntries(ids.map(id=>[id,element(id)]));
 const launchers=[element('heroLauncher'),element('secondaryLauncher')];
 document=Object.assign(eventTarget(),{body:element('body'),activeElement:null,getElementById:id=>nodes[id],querySelector:selector=>nodes[selector.slice(1)],querySelectorAll:selector=>selector==='[data-open-workshop]'?launchers:[],createElement:tag=>element(`${tag}-${nodes.tourStations.children.length}`)});
 const dialog=nodes.workshopTour;dialog.open=false;
 dialog.querySelector=selector=>nodes[selector.slice(1)];
 dialog.querySelectorAll=selector=>selector==='button:not([disabled]), a[href]'?
  [nodes.tourClose,...nodes.tourStations.children,nodes.tourPrimary,nodes.tourRequest,nodes.tourLeft,nodes.tourReset,nodes.tourRight,nodes.tourPrevious,nodes.tourNext].filter(control=>!control.disabled):[];
 let nativeOpener;
 if(dialogSupported)dialog.showModal=()=>{assert.equal(dialog.open,false);nativeOpener=document.activeElement;dialog.open=true;log.push({type:'showModal'});};
 dialog.close=()=>{
  if(!dialog.open)return;dialog.open=false;
  // Native dialog focus restoration precedes its queued close event.
  nativeOpener?.focus({preventScroll:true});
  tasks.push(()=>dialog.dispatchEvent(new TestEvent('close')));
 };
 const stage=nodes.tourStage;stage.rect={x:20,y:160,width:1000,height:360};stage.getBoundingClientRect=()=>({...stage.rect});
 const scene={available:()=>available,enter:()=>calls.push(['enter']),exit:()=>{calls.push(['exit']);log.push({type:'exit'});},station:index=>calls.push(['station',index]),frameAt:(...args)=>calls.push(['frameAt',...args]),orbit:delta=>calls.push(['orbit',delta]),reset:()=>calls.push(['reset'])};
 context=Object.assign(eventTarget(),{document,scrollY:0,Event:TestEvent,
  workshopServices:{select:id=>categories.push(id)},
  scrollTo(options){context.scrollY=options.top;log.push({type:'scrollTo',top:options.top,locked:document.body.classList.contains('is-exploring')});},
  history:{replaceState(state,title,destination){context.hash=destination;log.push({type:'history',destination});}},
  requestAnimationFrame:callback=>{frames.push(callback);return frames.length;},
  ResizeObserver:class{constructor(callback){observedResize=callback;}observe(){}},console
 });
 if(scenePresent)context.workshopScene=scene;
 context.window=context;
 nodes.serviceType.addEventListener('change',event=>changes.push({value:nodes.serviceType.value,bubbles:event.bubbles}));
 vm.runInNewContext(source,context,{filename:'workshop-tour.js'});
 return {context,document,nodes,launchers,dialog,stage,tasks,frames,log,calls,categories,changes,
  flushTasks(){while(tasks.length)tasks.shift()();},flushFrames(){while(frames.length)frames.shift()();},
  availability(value){available=value;context.dispatchEvent(new TestEvent('workshopavailability'));},resize:()=>observedResize()
 };
}
function click(element){const event=new TestEvent('click');element.dispatchEvent(event);return event;}
function launch(test,index=0,scroll=1250){test.context.scrollY=scroll;test.launchers[index].focus();click(test.launchers[index]);}
function selected(test,index){
 const buttons=test.nodes.tourStations.children;
 assert.equal(buttons.length,5);
 buttons.forEach((button,i)=>assert.equal(button.attributes['aria-pressed'],String(i===index),'Exactly one station must expose its selected state'));
 assert.equal(test.nodes.tourNumber.textContent,`0${index+1} / 05`);
 assert.equal(test.calls.filter(call=>call[0]==='station').at(-1)[1],index);
 assert(test.nodes.tourTitle.textContent.length>0);assert(test.nodes.tourCopy.textContent.length>0);
}

const basic=harness();assert(basic.launchers.every(button=>button.hidden===false));
launch(basic,1,1720);
assert.equal(basic.dialog.open,true);assert.equal(basic.document.body.style.top,'-1720px');
assert.equal(basic.document.body.classList.contains('is-exploring'),true);assert.equal(basic.document.activeElement,basic.nodes.tourClose);selected(basic,0);
const reverseBoundary=new TestEvent('keydown',{key:'Tab',shiftKey:true});basic.dialog.dispatchEvent(reverseBoundary);
assert.equal(reverseBoundary.defaultPrevented,true);assert.equal(basic.document.activeElement,basic.nodes.tourNext,'Shift+Tab from Close must wrap to the last control');
const forwardBoundary=new TestEvent('keydown',{key:'Tab',shiftKey:false});basic.dialog.dispatchEvent(forwardBoundary);
assert.equal(forwardBoundary.defaultPrevented,true);assert.equal(basic.document.activeElement,basic.nodes.tourClose,'Tab from the last control must wrap to Close');
for(const control of [basic.nodes.tourStations.children[2],basic.nodes.tourPrimary]){
 control.focus();
 for(const shiftKey of [false,true]){
  const interiorTab=new TestEvent('keydown',{key:'Tab',shiftKey});basic.dialog.dispatchEvent(interiorTab);
  assert.notEqual(interiorTab.defaultPrevented,true,'Normal interior Tab navigation must remain native');
  assert.equal(basic.document.activeElement,control,'Interior Tab must not trigger programmatic focus changes');
 }
}
for(const [control,shiftKey] of [[basic.nodes.tourClose,false],[basic.nodes.tourNext,true]]){
 control.focus();const inwardTab=new TestEvent('keydown',{key:'Tab',shiftKey});basic.dialog.dispatchEvent(inwardTab);
 assert.notEqual(inwardTab.defaultPrevented,true,'Tab toward another dialog control must not be intercepted');assert.equal(basic.document.activeElement,control);
}
basic.nodes.tourClose.focus();const otherKey=new TestEvent('keydown',{key:'Escape'});basic.dialog.dispatchEvent(otherKey);
assert.notEqual(otherKey.defaultPrevented,true,'The Tab boundary handler must preserve native Escape dismissal');
click(basic.nodes.tourPrevious);selected(basic,4);click(basic.nodes.tourNext);selected(basic,0);
for(let i=0;i<5;i++){click(basic.nodes.tourStations.children[i]);selected(basic,i);assert.equal(basic.nodes.tourStations.children[i].type,'button');}
click(basic.nodes.tourLeft);click(basic.nodes.tourRight);click(basic.nodes.tourReset);
assert.deepEqual(basic.calls.filter(call=>['orbit','reset'].includes(call[0])).slice(-3),[['orbit',-.22],['orbit',.22],['reset']]);
basic.stage.dispatchEvent(new TestEvent('pointerdown',{button:0,clientX:100,pointerId:7}));
basic.stage.dispatchEvent(new TestEvent('pointermove',{clientX:150}));assert.equal(basic.stage.pointerCapture,7);assert.equal(basic.calls.at(-1)[1],-.2);
basic.stage.dispatchEvent(new TestEvent('pointercancel'));const cancelledCalls=basic.calls.length;
basic.stage.dispatchEvent(new TestEvent('pointermove',{clientX:200}));assert.equal(basic.calls.length,cancelledCalls);
basic.stage.rect.y=70;basic.dialog.dispatchEvent(new TestEvent('scroll'));
assert.deepEqual(basic.calls.at(-1),['frameAt',520,250,360],'Dialog scrolling must refresh the stage viewport center');
basic.stage.rect.height=300;basic.resize();assert.deepEqual(basic.calls.at(-1),['frameAt',520,220,300]);
click(basic.nodes.tourClose);assert.equal(basic.dialog.open,false);assert.equal(basic.tasks.length,1);
assert.equal(basic.document.body.classList.contains('is-exploring'),true,'Cleanup must wait for the native close event');
basic.flushTasks();basic.flushFrames();
assert.equal(basic.document.body.classList.contains('is-exploring'),false);assert.equal(basic.document.body.style.top,'');
assert.equal(basic.context.scrollY,1720);assert.equal(basic.document.activeElement,basic.launchers[1]);
assert(basic.calls.some(call=>call[0]==='exit'));assert.equal(basic.frames.length,0);

const routes=[
 [0,'repair','services'],[1,'business','services'],[2,null,'work'],[3,'systems','services'],[4,null,'project-secure-watch']
];
for(const [station,category,destination] of routes){
 const test=harness();launch(test,0,900);click(test.nodes.tourStations.children[station]);
 const event=click(test.nodes.tourPrimary);assert.equal(event.defaultPrevented,true);assert.equal(test.dialog.open,false);
 assert.deepEqual(test.categories,category?[category]:[],'The selected station must open the matching service category');
 assert.equal(test.frames.length,0,'Navigation must not schedule before the queued close event');
 assert(!test.log.some(item=>item.type==='focus'&&item.id===destination),'A destination must not receive focus while background content is hidden');
 test.flushFrames();assert.equal(test.document.body.classList.contains('is-exploring'),true);
 test.flushTasks();assert.equal(test.document.body.classList.contains('is-exploring'),false);assert.equal(test.context.scrollY,900);
 assert.equal(test.frames.length,1);test.flushFrames();
 assert.equal(test.document.activeElement,test.nodes[destination]);assert.equal(test.nodes[destination].attributes.tabindex,'-1');
 assert.equal(test.context.hash,`#${destination}`);
 const focused=test.log.find(item=>item.type==='focus'&&item.id===destination);assert.equal(focused.locked,false);assert.equal(focused.top,'');
 assert(test.log.findIndex(item=>item.type==='scrollTo')<test.log.findIndex(item=>item.type==='scrollIntoView'),'Restore saved scroll before the requested destination navigation');
 assert.equal(test.log.at(-1).type,'history');
}

const requestServices=['Computer & laptop repair','Small-business IT','Websites & online systems','Servers & security technology','Servers & security technology'];
requestServices.forEach((service,station)=>{
 const test=harness();launch(test);click(test.nodes.tourStations.children[station]);
 assert.equal(click(test.nodes.tourRequest).defaultPrevented,true);
 assert.equal(test.nodes.serviceType.value,service);assert.deepEqual(test.changes,[{value:service,bubbles:true}]);
 assert.deepEqual(test.categories,[],'Starting a request must not alter the service filter');
 assert.equal(test.frames.length,0);test.flushTasks();test.flushFrames();
 assert.equal(test.document.activeElement,test.nodes.contact);assert.equal(test.context.hash,'#contact');
});

const lost=harness();launch(lost,1,333);lost.availability(false);
assert.equal(lost.dialog.open,false);assert(lost.launchers.every(button=>button.hidden));
lost.flushTasks();lost.flushFrames();assert.equal(lost.document.body.classList.contains('is-exploring'),false);
assert.equal(lost.context.scrollY,333);assert.equal(lost.document.activeElement,lost.launchers[1]);
click(lost.launchers[0]);assert.equal(lost.dialog.open,false,'An unavailable scene must not open a tour even if a stale launcher is invoked');
lost.availability(true);assert(lost.launchers.every(button=>!button.hidden));launch(lost);selected(lost,0);
lost.dialog.close();lost.flushTasks();assert.equal(lost.document.activeElement,lost.launchers[0],'A native dismissal must restore the opener');

for(const options of [{available:false},{scenePresent:false},{dialogSupported:false}]){
 const test=harness(options);assert(test.launchers.every(button=>button.hidden));click(test.launchers[0]);assert.equal(test.dialog.open,false);
}
console.log('PASS: tour launch/close, native queued-close cleanup, scroll/focus restoration, bidirectional Tab wrapping, station cycling and accessible selection');
console.log('PASS: service-category navigation, request preselection, post-cleanup destination focus, drag/buttons, scrolled-stage framing, and unavailable/context-loss behavior');
