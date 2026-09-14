// Run the real workshop scene and vendored Three.js math without WebGL or a browser.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const Three=require('../assets/vendor/three.min.js');
const source=fs.readFileSync(path.join(__dirname,'../assets/workshop.js'),'utf8');
const catalogue=fs.readFileSync(path.join(__dirname,'../assets/workshop-items.js'),'utf8');

class TestEvent {
 constructor(type,properties={}){this.type=type;Object.assign(this,properties);}
 preventDefault(){this.defaultPrevented=true;}
}
function eventTarget(){
 const listeners=new Map();
 return {
  addEventListener(type,callback){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(callback);},
  dispatchEvent(event){for(const callback of listeners.get(event.type)||[])callback(event);return !event.defaultPrevented;}
 };
}
function element(){
 return Object.assign(eventTarget(),{style:{},hidden:true,attributes:{},setAttribute(name,value){this.attributes[name]=value;},insertBefore(){}});
}
function createHarness({reduced=false,width=1440,height=900,rendererFails=false}={}){
 const nodes=Object.fromEntries(['scene','fallback','motionToggle','motionMenuToggle'].map(id=>[id,element()]));
 const frames=new Map(),renders=[],textureLoads=[],availability=[];
 let frameId=0,clock=0,journey=0,renderer;
 class Renderer {
  constructor(){
   if(rendererFails)throw new Error('WebGL unavailable');
   this.domElement=element();renderer=this;
  }
  setSize(width,height){this.size={width,height};}
  setPixelRatio(value){this.pixelRatio=value;}
  setClearColor(){}
  render(scene,camera){
   renders.push({position:camera.position.clone(),quaternion:camera.quaternion.clone(),view:camera.view?{...camera.view}:null,far:camera.far,scene});
  }
 }
 class TextureLoader {
  load(url,onLoad){textureLoads.push(()=>onLoad(new Three.Texture({width:320,height:160})));}
 }
 const document=Object.assign(eventTarget(),{
  hidden:false,getElementById:id=>nodes[id],
  createElement(tag){
   assert.equal(tag,'canvas');
   return {...element(),getContext:()=>({fillRect(){},fillText(){},drawImage(){},createRadialGradient:()=>({addColorStop(){}})})};
  }
 });
 const motion=Object.assign(eventTarget(),{matches:reduced});
 const context=Object.assign(eventTarget(),{
  THREE:{...Three,WebGLRenderer:Renderer,TextureLoader},document,
  innerWidth:width,innerHeight:height,devicePixelRatio:3,
  matchMedia:()=>motion,Event:TestEvent,
  requestAnimationFrame(callback){const id=++frameId;frames.set(id,callback);return id;},
  cancelAnimationFrame(id){frames.delete(id);},
  performance:{now:()=>clock},workshopUI:{journey:()=>journey},console
 });
 context.window=context;
 context.addEventListener('workshopavailability',()=>availability.push(context.workshopScene.available()));
 vm.runInNewContext(catalogue,context,{filename:'workshop-items.js'});
 vm.runInNewContext(source,context,{filename:'workshop.js'});
 function frame(){
  const next=frames.entries().next();if(next.done)return false;
  const [id,callback]=next.value;frames.delete(id);clock+=1000/60;callback(clock);return true;
 }
 function settle(){let count=0;while(frame()){count++;assert(count<240,'The demand renderer must settle in fewer than 240 frames');}return count;}
 function setJourney(value){journey=value;context.dispatchEvent(new TestEvent('workshopjourneychange'));}
 return {context,nodes,renderer,renders,textureLoads,availability,frames,motion,frame,settle,setJourney,last:()=>renders.at(-1)};
}
function closeVector(actual,expected,message){assert(actual.distanceTo(new Three.Vector3(...expected))<.00001,message);}

const scene=createHarness();
assert.equal(scene.frames.size,1,'Startup must schedule only one frame');
assert.equal(scene.settle(),1,'An idle initial scene must not run continuously');
assert.equal(scene.last().far,95,'Distant invisible geometry should remain clipped');
assert.equal(scene.renderer.pixelRatio,1.5,'Desktop pixel density should stay capped');
assert.deepEqual(scene.availability,[true]);
scene.setJourney(3);
const travelFrames=scene.settle();assert(travelFrames>1,'Enabled motion should ease into another chapter');
closeVector(scene.last().position,[9.4,2,-91.6],'Journey events must move the camera to the selected chapter');
assert.equal(scene.frames.size,0,'The renderer must stop after camera movement settles');
scene.context.dispatchEvent(new TestEvent('pointermove',{pointerType:'mouse',clientX:720,clientY:450}));
assert.equal(scene.settle(),1,'A stationary pointer update should render once');
scene.textureLoads.shift()();assert.equal(scene.settle(),1,'An arriving project texture must request a fresh frame');
scene.textureLoads.shift()();assert.equal(scene.settle(),1,'The Secure Watch screen must refresh after its texture arrives');

scene.nodes.motionToggle.dispatchEvent(new TestEvent('click'));
scene.settle();assert.equal(scene.nodes.motionToggle.attributes['aria-pressed'],'true');
scene.context.workshopScene.enter();assert.equal(scene.settle(),1);
scene.context.workshopScene.station(4);assert.equal(scene.settle(),1,'Paused station selections must snap in one frame');
closeVector(scene.last().position,[-.8,2.2,-98],'Explicit security selection must work while paused');
const beforeOrbit=scene.last().position.clone();
scene.context.workshopScene.orbit(.3);assert.equal(scene.settle(),1);assert(scene.last().position.distanceTo(beforeOrbit)>.1,'Keyboard orbit must remain usable with reduced motion');
scene.context.workshopScene.reset();scene.settle();closeVector(scene.last().position,[-.8,2.2,-98],'Reset must restore the selected station view');
scene.context.workshopScene.frameAt(720,360,400);scene.settle();assert.equal(scene.last().view.enabled,true);
const tourPosition=scene.last().position.clone();scene.setJourney(1);assert.equal(scene.frames.size,0,'Page layout updates must not disturb an active tour');
assert(scene.last().position.equals(tourPosition));
scene.context.workshopScene.exit();assert.equal(scene.settle(),1);assert.equal(scene.last().view.enabled,false,'Leaving the tour must clear the camera offset');
closeVector(scene.last().position,[9.5,2.4,-40.6],'Leaving the tour must restore the current page chapter');

scene.setJourney(4);assert.equal(scene.frames.size,1);
const loss=new TestEvent('webglcontextlost');scene.renderer.domElement.dispatchEvent(loss);
assert.equal(loss.defaultPrevented,true);assert.equal(scene.frames.size,0,'Context loss must cancel a queued frame');
assert.equal(scene.context.workshopScene.available(),false);assert.equal(scene.nodes.fallback.style.display,'block');
assert.equal(scene.renderer.domElement.style.display,'none');assert.equal(scene.nodes.motionToggle.hidden,true);assert.equal(scene.nodes.motionMenuToggle.hidden,true);
scene.setJourney(2);assert.equal(scene.frames.size,0,'No frames may be requested while the WebGL context is lost');
scene.renderer.domElement.dispatchEvent(new TestEvent('webglcontextrestored'));
assert.equal(scene.context.workshopScene.available(),true);assert.equal(scene.nodes.fallback.style.display,'none');
assert.equal(scene.renderer.domElement.style.display,'block');assert.equal(scene.nodes.motionToggle.hidden,false);assert.equal(scene.nodes.motionMenuToggle.hidden,false);
assert.equal(scene.settle(),1,'Restoring a paused context must produce one fresh frame');
closeVector(scene.last().position,[-9.4,2.3,-65.6],'A restored renderer must use the latest journey state');
assert.deepEqual(scene.availability,[true,false,true]);

scene.setJourney(3);scene.context.document.hidden=true;scene.context.document.dispatchEvent(new TestEvent('visibilitychange'));
assert.equal(scene.frames.size,0,'Background tabs must cancel pending frames');
scene.setJourney(4);assert.equal(scene.frames.size,0);
scene.context.document.hidden=false;scene.context.document.dispatchEvent(new TestEvent('visibilitychange'));
assert.equal(scene.settle(),1,'A visible tab must refresh its current state once');

const reduced=createHarness({reduced:true});reduced.settle();reduced.setJourney(2);
assert.equal(reduced.settle(),1,'The OS motion preference must snap page choreography');
closeVector(reduced.last().position,[-9.4,2.3,-65.6]);
reduced.context.workshopScene.enter();reduced.context.workshopScene.station(1);assert.equal(reduced.settle(),1);
closeVector(reduced.last().position,[8.2,2.4,-40],'Business IT must be an independent selectable station');
reduced.motion.dispatchEvent(new TestEvent('change',{matches:false}));reduced.settle();
reduced.context.workshopScene.station(4);assert(reduced.settle()>1,'Re-enabling motion must restore smooth station transitions');
assert.equal(reduced.frames.size,0);

const mobile=createHarness({width:390,height:844,reduced:true});mobile.settle();
assert.equal(mobile.renderer.pixelRatio,1,'Mobile pixel density should stay capped');
const mobileRenders=mobile.renders.length;
mobile.context.dispatchEvent(new TestEvent('pointermove',{pointerType:'touch',clientX:100,clientY:200}));
assert.equal(mobile.frames.size,0);assert.equal(mobile.renders.length,mobileRenders,'Touch interaction must not enable background parallax');
mobile.context.workshopScene.enter();mobile.context.workshopScene.frameAt(195,300,240);mobile.context.workshopScene.station(4);
assert.equal(mobile.settle(),1);assert(mobile.last().position.toArray().every(Number.isFinite),'Narrow tour framing must produce a finite camera position');

// Execute every close-up against real Three.js matrices and the shared catalogue.
const inspection=createHarness({reduced:true}),projections=[];
inspection.settle();inspection.context.workshopScene.onFrame(points=>projections.push(points));inspection.settle();
assert.equal(projections.length,0,'Page choreography must not publish tour hotspots');
inspection.context.workshopScene.enter();inspection.settle();
const equipment=inspection.context.workshopItems;
assert.equal(equipment.length,12);
for(let station=0;station<5;station++){
 inspection.context.workshopScene.station(station);assert.equal(inspection.settle(),1);
 const stationItems=equipment.filter(item=>item.station===station),overviewPosition=inspection.last().position.clone();
 assert.deepEqual(Array.from(projections.at(-1),point=>point.id),Array.from(stationItems,item=>item.id),'A station must publish exactly its own equipment anchors');
 for(const point of projections.at(-1)){
  assert(Number.isFinite(point.x)&&Number.isFinite(point.y),'Projected hotspot coordinates must be finite');
  assert(point.x>0&&point.x<1440&&point.y>0&&point.y<900,`The ${point.id} overview hotspot must remain within the client viewport`);
  assert.equal(point.visible,true,'Settled overview anchors must be in front of the camera');
 }
 for(const item of stationItems){
  assert.equal(inspection.context.workshopScene.inspect(item.id),true);
  assert.equal(inspection.settle(),1,`${item.id} must snap in one frame when motion is paused`);
  closeVector(inspection.last().position,item.camera,`${item.id} must select its equipment camera`);
  assert.equal(projections.at(-1).length,0,'Inspection must hide overview hotspots');
  assert.equal(inspection.frames.size,0,'An inspected object must not create a continuous render loop');
  const selectedPosition=inspection.last().position.clone();
  assert.equal(inspection.context.workshopScene.inspect('missing-equipment'),false);
  assert.equal(inspection.context.workshopScene.inspect(equipment.find(other=>other.station!==station).id),false);
  assert.equal(inspection.frames.size,0,'Rejected IDs must not schedule work or change the camera');
  assert(inspection.last().position.equals(selectedPosition));
  inspection.context.workshopScene.orbit(.3);inspection.settle();
  assert(inspection.last().position.distanceTo(selectedPosition)>.1,'An equipment close-up must still support orbit controls');
  inspection.context.workshopScene.reset();inspection.settle();closeVector(inspection.last().position,item.camera);
  assert.equal(inspection.context.workshopScene.inspect(null),true);inspection.settle();
  assert(inspection.last().position.equals(overviewPosition),'Whole station must restore the selected overview');
  assert.equal(projections.at(-1).length,stationItems.length);
 }
 // Selecting another station must clear an active close-up.
 inspection.context.workshopScene.inspect(stationItems[0].id);inspection.settle();
 inspection.context.workshopScene.station(station);inspection.settle();
 assert(inspection.last().position.equals(overviewPosition),'Station selection must reset inspection');
 assert.equal(projections.at(-1).length,stationItems.length);
}
inspection.context.workshopScene.inspect('camera');inspection.settle();inspection.context.workshopScene.exit();inspection.settle();
inspection.context.workshopScene.enter();inspection.settle();
assert.deepEqual(Array.from(projections.at(-1),point=>point.id),['laptop','phone'],'Reopening the tour must restore the first overview after an inspected exit');

const mobilePoints=[];mobile.context.workshopScene.onFrame(points=>mobilePoints.push(points));mobile.settle();
for(let station=0;station<5;station++){
 mobile.context.workshopScene.station(station);mobile.settle();
 for(const point of mobilePoints.at(-1)){
  assert(Number.isFinite(point.x)&&Number.isFinite(point.y));
  assert(point.x>0&&point.x<390&&point.y>0&&point.y<844,`The ${point.id} hotspot must project into the narrow client viewport`);
 }
}

const fallback=createHarness({rendererFails:true});
assert.equal(fallback.nodes.fallback.style.display,'block');assert.equal(fallback.context.workshopScene,undefined);assert.equal(fallback.frames.size,0);
console.log('PASS: real Three.js scene execution, demand settling, journey updates, paused station snap, orbit/reset, tour exit, and project texture invalidation');
console.log('PASS: reduced motion, mobile density and touch behavior, hidden tab suspension, context loss/restoration, and WebGL-unavailable fallback');
console.log('PASS: all 12 equipment close-ups, guarded inspection IDs, projected desktop/mobile hotspots, paused orbit/reset, and station/exit cleanup');
