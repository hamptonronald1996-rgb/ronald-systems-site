(()=>{
const progress=()=>window.workshopUI.journey();
if(!window.THREE){document.getElementById('fallback').style.display='block';return}
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:innerWidth>900,alpha:true,powerPreference:'high-performance'})}catch(e){document.getElementById('fallback').style.display='block';return}
const mount=document.getElementById('scene');mount.insertBefore(renderer.domElement,mount.firstChild);renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<900?1.2:1.65));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;renderer.setClearColor(0x040609,1);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x05070b,.0158);const camera=new THREE.PerspectiveCamera(innerWidth<700?63:53,innerWidth/innerHeight,.1,280);scene.add(new THREE.AmbientLight(0x6580a3,.24));const blue=0x29c4ff,orange=0xff5a1f;
const key=new THREE.PointLight(blue,2.2,58,2);scene.add(key);const warm=new THREE.PointLight(orange,2.5,52,2);scene.add(warm);const metal=new THREE.MeshStandardMaterial({color:0x101722,metalness:.78,roughness:.32}),dark=new THREE.MeshStandardMaterial({color:0x080d13,metalness:.45,roughness:.5}),blueMat=new THREE.MeshStandardMaterial({color:blue,emissive:0x063850,emissiveIntensity:.85,metalness:.4,roughness:.25}),orangeMat=new THREE.MeshStandardMaterial({color:orange,emissive:0x5c1605,emissiveIntensity:.82,metalness:.45,roughness:.27}),lineBlue=new THREE.MeshBasicMaterial({color:blue,transparent:true,opacity:.55}),lineOrange=new THREE.MeshBasicMaterial({color:orange,transparent:true,opacity:.58});
const world=new THREE.Group();scene.add(world);const floor=new THREE.Mesh(new THREE.PlaneGeometry(28,190,1,1),new THREE.MeshStandardMaterial({color:0x070b11,metalness:.3,roughness:.82}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-3,-73);world.add(floor);const grid=new THREE.GridHelper(190,95,0x164c68,0x0a151f);grid.position.set(0,-2.98,-72);grid.material.transparent=true;grid.material.opacity=.28;world.add(grid);
for(let i=0;i<26;i++){const z=12-i*6.1;[-12,12].forEach(x=>{const post=new THREE.Mesh(new THREE.BoxGeometry(.11,8,.11),dark);post.position.set(x,1,z);world.add(post)});const beam=new THREE.Mesh(new THREE.BoxGeometry(24,.09,.1),dark);beam.position.set(0,5,z);world.add(beam);if(i%2===0){const strip=new THREE.Mesh(new THREE.BoxGeometry(5.6,.035,.04),i%4===0?lineOrange:lineBlue);strip.position.set(i%4===0?-3.5:3.5,4.85,z+.03);world.add(strip)}}
const starCount=innerWidth<700?240:520,sp=new Float32Array(starCount*3);for(let i=0;i<starCount;i++){sp[i*3]=(Math.random()-.5)*35;sp[i*3+1]=(Math.random()-.5)*18+4;sp[i*3+2]=20-Math.random()*180}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));world.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.035,color:0xa8dfff,transparent:true,opacity:.5})));
function monitor(x,y,z,w=3,h=1.9,color=blue){const g=new THREE.Group();const frame=new THREE.Mesh(new THREE.BoxGeometry(w+.16,h+.16,.18),metal);g.add(frame);const screen=new THREE.Mesh(new THREE.BoxGeometry(w,h,.06),new THREE.MeshBasicMaterial({color:color===blue?0x071b27:0x261007}));screen.position.z=.12;g.add(screen);for(let i=0;i<5;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(w*.6-i*.08,.035,.02),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.34}));bar.position.set(-w*.13,h*.25-i*.18,.16);g.add(bar)}g.position.set(x,y,z);scene.add(g);return g}
function bench(x,z){const g=new THREE.Group();const top=new THREE.Mesh(new THREE.BoxGeometry(5.4,.22,2.2),metal);top.position.y=-.3;g.add(top);[-2.25,2.25].forEach(px=>{const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,2.7,.16),dark);leg.position.set(px,-1.65,0);g.add(leg)});g.position.set(x,-.25,z);scene.add(g);return g}
const repairBench=bench(-5,-24);const laptop=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(2.5,.12,1.6),dark);laptop.add(base);const lid=new THREE.Mesh(new THREE.BoxGeometry(2.45,1.45,.1),metal);lid.position.set(0,.72,-.74);lid.rotation.x=-.18;laptop.add(lid);const display=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.2,.02),new THREE.MeshBasicMaterial({color:0x082133}));display.position.set(0,.74,-.68);display.rotation.x=-.18;laptop.add(display);laptop.position.set(-5,.2,-24);scene.add(laptop);const phone=new THREE.Mesh(new THREE.BoxGeometry(.75,.06,1.45),orangeMat);phone.position.set(-3.4,.08,-24);scene.add(phone);
const bizBench=bench(5,-49);monitor(5,1.1,-49,3.2,1.9,blue);const router=new THREE.Mesh(new THREE.BoxGeometry(1.3,.35,.8),dark);router.position.set(5,-.08,-48.6);scene.add(router);for(let i=0;i<3;i++){const led=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshBasicMaterial({color:i===2?orange:blue}));led.position.set(4.7+i*.16,.12,-48.18);scene.add(led)}
const webWall=new THREE.Group();webWall.position.set(-4.8,.5,-75);scene.add(webWall);[-2.3,0,2.3].forEach((x,i)=>{const m=monitor(-4.8+x,1,-75,2.05,1.35,i===1?orange:blue);m.rotation.y=.08*(i-1)});
const rack=new THREE.Group();rack.position.set(5,-.3,-100);scene.add(rack);const rackBody=new THREE.Mesh(new THREE.BoxGeometry(3.2,5,1.6),dark);rack.add(rackBody);for(let i=0;i<8;i++){const tray=new THREE.Mesh(new THREE.BoxGeometry(2.7,.38,1.66),metal);tray.position.y=1.8-i*.5;rack.add(tray);for(let j=0;j<4;j++){const led=new THREE.Mesh(new THREE.SphereGeometry(.025,6,6),new THREE.MeshBasicMaterial({color:(i+j)%4===0?orange:blue}));led.position.set(-.85+j*.28,1.8-i*.5,.86);rack.add(led)}}
const cameraRig=new THREE.Group();cameraRig.position.set(-4.5,.2,-106);const camBody=new THREE.Mesh(new THREE.BoxGeometry(1.6,1,1.4),metal);cameraRig.add(camBody);const lens=new THREE.Mesh(new THREE.CylinderGeometry(.42,.58,.7,24),blueMat);lens.rotation.x=Math.PI/2;lens.position.z=.9;cameraRig.add(lens);scene.add(cameraRig);


// Workshop dressing: functional objects, grounded furniture and readable signage.
scene.add(new THREE.HemisphereLight(0xb4dfff,0x17202d,.8));
const fill=new THREE.DirectionalLight(0xe8f1ff,.75);fill.position.set(0,8,10);scene.add(fill);
scene.fog.density=.027;
function box(parent,size,pos,mat=metal){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);parent.add(m);return m;}
function label(text,sub,color=blue){
 const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');
 ctx.fillStyle='#08121d';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.fillRect(0,0,8,256);ctx.font='500 62px sans-serif';ctx.fillText(text,40,108);ctx.fillStyle='#a6b8ca';ctx.font='28px monospace';ctx.fillText(sub,40,174);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
 return new THREE.Mesh(new THREE.PlaneGeometry(5,1.25),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
}
const signage=[['REPAIR LAB','01 / DIAGNOSE. REPAIR. RESTORE.',-5,3,-25.4,orange],['BUSINESS IT','02 / CONNECT. BACK UP. SUPPORT.',5,3,-51,blue],['DIGITAL SYSTEMS','03 / WEBSITES. SOFTWARE. WORKFLOWS.',-4.8,3,-76,blue],['NETWORK / SERVER','04 / BUILT TO KEEP YOU RUNNING.',5,3.2,-101,orange],['SECURITY LAB','05 / CAMERAS. SENSORS. SYSTEMS.',-4.5,3,-109,blue]];
signage.forEach(([title,sub,x,y,z,color])=>{const sign=label(title,sub,color);sign.position.set(x,y,z);scene.add(sign);});
const rubber=new THREE.MeshStandardMaterial({color:0x173d49,roughness:.94});
box(scene,[4.7,.035,1.85],[-5,-.405,-24],rubber);
// Keep the devices seated on their work surface.
laptop.position.y=-.32;phone.position.set(-3.3,-.33,-23.8);
const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.15,.018,.12),metal,50);const matrix=new THREE.Matrix4();
for(let row=0;row<5;row++)for(let col=0;col<10;col++){matrix.makeTranslation(-.94+col*.205,.074,-.47+row*.2);keys.setMatrixAt(row*10+col,matrix);}laptop.add(keys);
box(laptop,[.75,.018,.3],[0,.075,.54],metal);
box(scene,[.58,.01,1.2],[-3.3,-.293,-23.8],new THREE.MeshBasicMaterial({color:0x071e30}));
box(scene,[.5,.06,.8],[-6.75,-.33,-23.7],new THREE.MeshStandardMaterial({color:0x164338,roughness:.7}));
box(scene,[.22,.04,.22],[-6.75,-.28,-23.7],metal);
box(scene,[.08,1.6,.08],[-7.25,.35,-24.8],metal);box(scene,[1.1,.08,.08],[-6.75,1.15,-24.8],metal);box(scene,[.65,.05,.2],[-6.3,1.12,-24.7],new THREE.MeshBasicMaterial({color:0xffd19a}));
const benchLight=new THREE.PointLight(0xffb56b,1.9,8,1);benchLight.position.set(-6.3,1,-24);scene.add(benchLight);
const pegboard=box(scene,[5.6,2.2,.1],[-5,1,-25.5],dark);
for(let i=0;i<5;i++){box(scene,[.055,.7,.055],[-6.8+i*.38,.8,-25.38],metal);box(scene,[.13,.28,.1],[-6.8+i*.38,1.16,-25.35],i%2?blueMat:orangeMat);}
box(scene,[.13,1.1,.13],[5,.1,-49.15],metal);box(scene,[1.4,.07,.75],[5,-.4,-49],metal);
for(const x of [4.45,5.55])box(scene,[.055,.8,.055],[x,.36,-48.8],metal);
// Patch panel, ventilation and visible cable runs make the rack read as infrastructure.
for(let i=0;i<8;i++)for(let j=0;j<6;j++)box(rack,[.14,.035,.02],[.25+j*.18,1.72-i*.5,.842],dark);
function cable(points,color){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.025,5,false),new THREE.MeshBasicMaterial({color}));scene.add(mesh);}
for(let i=0;i<4;i++)cable([[4.05+i*.24,1.2,-99.12],[4.05+i*.24,.8-i*.08,-98.8],[6.15,.4-i*.18,-98.8],[6.3,-2.7,-100]],i%2?blue:orange);
box(scene,[3.6,.15,2.1],[5,-2.84,-100],metal);
box(cameraRig,[.18,1.3,.18],[0,-1.1,-.3],metal);box(cameraRig,[1,.1,.75],[0,-1.8,-.3],dark);
const lensGlass=new THREE.Mesh(new THREE.CircleGeometry(.3,24),new THREE.MeshBasicMaterial({color:0x081523}));lensGlass.position.z=1.26;cameraRig.add(lensGlass);
const securityBench=bench(-4.5,-107);
const securityDisplay=monitor(-2.6,.8,-108,2.6,1.7,blue);
const securityLabel=label('LOCAL MONITORING','CAMERAS / SENSORS / ACCESS',blue);securityLabel.scale.setScalar(.43);securityLabel.position.set(-2.6,.8,-107.81);scene.add(securityLabel);
box(scene,[8,4.6,.14],[-4.8,.6,-75.4],dark);
box(scene,[8,.18,1.2],[-4.8,-1.5,-75],metal);
for(const x of [-8.2,-1.4])box(scene,[.16,1.4,.16],[x,-2.25,-75],metal);
// Real public-project imagery on the systems wall; no third-party requests during the journey.
new THREE.TextureLoader().load('assets/projects/fur-love-logo.webp',texture=>{const board=document.createElement('canvas');board.width=1024;board.height=672;const ctx=board.getContext('2d');ctx.fillStyle='#f8f4ec';ctx.fillRect(0,0,1024,672);const scale=Math.min(860/texture.image.width,510/texture.image.height),w=texture.image.width*scale,h=texture.image.height*scale;ctx.drawImage(texture.image,(1024-w)/2,(672-h)/2,w,h);const displayTexture=new THREE.CanvasTexture(board);displayTexture.encoding=THREE.sRGBEncoding;texture.dispose();const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.04,1.34),new THREE.MeshBasicMaterial({map:displayTexture,toneMapped:false}));screen.position.set(-4.8,1,-74.8);scene.add(screen);invalidate();},undefined,()=>{});
const opsScreen=label('OPERATIONS','FUR THE LOVE / THE BUSINESS BEHIND THE CARE',blue);opsScreen.scale.set(.405,.9,1);opsScreen.position.set(-7.1,1,-74.76);scene.add(opsScreen);
const codeScreen=label('CODECREDIT','AI WORKSPACE / BUILD WITH PURPOSE',orange);codeScreen.scale.set(.405,.9,1);codeScreen.position.set(-2.5,1,-74.76);scene.add(codeScreen);
const webLabel=label('SELECTED BUILDS','FUR THE LOVE / SECURE WATCH / CODECREDIT',orange);webLabel.scale.setScalar(.54);webLabel.position.set(-4.8,-.5,-74.75);scene.add(webLabel);
// Replace the abstract destination rings with a grounded dispatch workstation.

const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.getElementById('motionToggle'),menuToggle=document.getElementById('motionMenuToggle');const motionButtons=[toggle,menuToggle];motionButtons.forEach(button=>button.hidden=false);
let paused=motionQuery.matches,mouseX=0,mouseY=0,currentP=progress(),last=0,raf=0,dirty=true;
let contextLost=false;
const diagnostic=label('DIAGNOSTICS','DEVICE / STORAGE / SYSTEM CHECK',blue);diagnostic.scale.set(.44,.7,1);diagnostic.position.set(0,.74,-.655);diagnostic.rotation.x=-.18;laptop.add(diagnostic);
const backlight=new THREE.PointLight(blue,2.5,12,1);backlight.position.set(-3,1,-25);scene.add(backlight);
function updateToggle(){motionButtons.forEach(button=>{button.textContent=paused?'Enable 3D motion':'Pause 3D motion';button.setAttribute('aria-pressed',String(paused));});}
updateToggle();
motionButtons.forEach(button=>button.addEventListener('click',()=>{paused=!paused;mouseX=mouseY=0;updateToggle();invalidate();}));
motionQuery.addEventListener('change',e=>{paused=e.matches;updateToggle();invalidate();});
// Alternating compositions leave clear space for each chapter's copy.
const views=[
 {p:[-8.8,2.8,-15.8],t:[-8.1,.35,-24]},
 {p:[-.1,2.4,-15.6],t:[-.2,.35,-24]},
 {p:[-9.4,2.3,-65.6],t:[-8.4,.7,-75]},
 {p:[9.4,2,-91.6],t:[8.7,.2,-100]},
 {p:[-9.1,2.4,-98],t:[-7.8,.3,-107]}
];
const pos=new THREE.Vector3(),look=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3();
function invalidate(){dirty=true;if(!raf&&!document.hidden&&!contextLost)raf=requestAnimationFrame(frame);}
function frame(now){
 raf=0;if(document.hidden||contextLost)return;
 const dt=Math.min(.05,(now-last)/1000||.016);last=now;
 const target=progress();currentP=paused?currentP:THREE.MathUtils.lerp(currentP,target,1-Math.exp(-dt*7));
 if(!paused&&Math.abs(currentP-target)<.0001)currentP=target;
 const i=Math.min(3,Math.floor(currentP)),mix=Math.min(1,currentP-i);
 pos.copy(a.fromArray(views[i].p)).lerp(b.fromArray(views[i+1].p),mix);
 look.copy(a.fromArray(views[i].t)).lerp(b.fromArray(views[i+1].t),mix);
 if(innerWidth<900){pos.x=look.x+(i===0&&mix<.5?1.3:0);pos.y+=1.1;pos.z+=3.5;look.y+=2.6;look.x=i===0&&mix<.5?-5:look.x;}
 camera.position.set(pos.x+(paused?0:mouseX*.3),pos.y+(paused?0:mouseY*.12),pos.z);camera.lookAt(look);
 key.position.set(pos.x+3,pos.y+4,pos.z-5);warm.position.set(pos.x-3,pos.y+1,pos.z-5);
 renderer.render(scene,camera);dirty=false;
 if(!paused&&currentP!==target)invalidate();
}
addEventListener('scroll',()=>{if(!paused)invalidate();},{passive:true});
addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse'||innerWidth<900)return;mouseX=e.clientX/innerWidth-.5;mouseY=e.clientY/innerHeight-.5;invalidate();},{passive:true});
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?63:53;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<900?1:1.5));invalidate();}
addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();invalidate();}});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;renderer.domElement.style.display='none';document.getElementById('fallback').style.display='block';motionButtons.forEach(button=>button.hidden=true);});
renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;renderer.domElement.style.display='block';document.getElementById('fallback').style.display='none';motionButtons.forEach(button=>button.hidden=false);invalidate();});
resize();
})();
