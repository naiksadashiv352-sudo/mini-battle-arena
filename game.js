import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x82c8e8);
scene.fog = new THREE.Fog(0x82c8e8, 38, 105);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.08, 180);
camera.position.set(0, 3.1, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe5f8ff, 0x4a5b73, 2.1));
const sun = new THREE.DirectionalLight(0xfff2d8, 2.5);
sun.position.set(-24, 38, 18); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
const fill = new THREE.PointLight(0x35d9ff, 45, 55);
fill.position.set(0, 12, -12); scene.add(fill);

const material = (color, roughness=.72, metalness=.05, extra={}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const mats = {
  floor: material(0x718b8c), line: material(0x9cc2b8, .9),
  wallA: material(0xd6a66d), wallB: material(0x3c6479),
  dark: material(0x263c50), crate: material(0xb97845),
  crateTop: material(0xe5b16d), neon: material(0x27d9f4, .25, .5, { emissive: 0x087eaa, emissiveIntensity: 1.4 }),
  red: material(0xf35d56, .48), blue: material(0x39c5e8, .42)
};

// Procedural high-detail industrial floor texture (generated locally; no paid assets).
const texCanvas=document.createElement('canvas');texCanvas.width=512;texCanvas.height=512;
const tx=texCanvas.getContext('2d');tx.fillStyle='#536a70';tx.fillRect(0,0,512,512);
for(let i=0;i<18000;i++){const v=70+Math.random()*55;tx.fillStyle='rgba('+v+','+(v+12)+','+(v+15)+','+(Math.random()*.16)+')';tx.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*3,1+Math.random()*3)}
tx.strokeStyle='rgba(160,205,207,.23)';tx.lineWidth=2;
for(let n=0;n<=512;n+=64){tx.beginPath();tx.moveTo(n,0);tx.lineTo(n,512);tx.stroke();tx.beginPath();tx.moveTo(0,n);tx.lineTo(512,n);tx.stroke()}
const floorTexture=new THREE.CanvasTexture(texCanvas);floorTexture.wrapS=floorTexture.wrapT=THREE.RepeatWrapping;floorTexture.repeat.set(8,8);floorTexture.colorSpace=THREE.SRGBColorSpace;
mats.floor.map=floorTexture;mats.floor.color.set(0xffffff);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100,100), mats.floor);
ground.rotation.x = -Math.PI/2; ground.position.y = -.08; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(100, 50, 0x6cc7d4, 0x91aaa6);
grid.position.y = -.055; grid.material.transparent = true; grid.material.opacity = .22; scene.add(grid);

function box(w,h,d,mat,x,y,z, opts={}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true;
  if (opts.rot) m.rotation.y = opts.rot;
  scene.add(m); return m;
}
function buildArena() {
  // Outer perimeter and tall landmark structures
  for (let i=0;i<4;i++) {
    const a=i*Math.PI/2, x=Math.sin(a)*31, z=Math.cos(a)*31;
    const wall=box(66,5,1.2,mats.wallB,x,2.4,z,{rot:a});
    box(66,.28,1.35,mats.neon,x,5.05,z,{rot:a});
  }
  // Central combat structures, lanes and chest-high cover
  box(8,3.5,2.2,mats.wallA,-10,1.75,-12);
  box(7,3.5,2.2,mats.wallA,11,1.75,-10);
  box(2.2,3.2,9,mats.wallB,-18,1.6,2);
  box(2.2,3.2,9,mats.wallB,18,1.6,-1);
  box(9,2.5,2,mats.wallB,0,1.25,17);
  // Cover blocks
  const crates=[[-6,0,-5],[6,0,-4],[-14,0,12],[13,0,10],[0,0,-20],[-22,0,-14],[22,0,-16],[-4,0,13],[8,0,19]];
  crates.forEach(([x,_,z],i)=>{
    box(2.8,1.8,2.8,mats.crate,x,.9,z);
    box(2.85,.14,2.85,mats.crateTop,x,1.84,z);
    for(let k=-1;k<=1;k++) box(.12,1.7,.12,mats.dark,x+k*.75,.9,z+1.43);
  });
  // Pillars, ramps and elevated platforms
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4, x=Math.cos(a)*25, z=Math.sin(a)*25;
    box(2.3,5,2.3,i%2?mats.wallA:mats.wallB,x,2.5,z);
    box(3.2,.22,3.2,mats.neon,x,5.1,z);
  }
  const ramp=box(8,.55,7,mats.wallA,0,.55,-10,{rot:0});
  ramp.rotation.x=-.18;
  box(10,.8,5,mats.dark,0,2.8,-27);
  box(10,.25,5,mats.neon,0,3.32,-27);
  // Floor lane markings
  for(let z=-28;z<=28;z+=7) box(.12,.015,60,mats.line,-30,.005,z);
  for(let x=-28;x<=28;x+=7) box(60,.015,.12,mats.line,x,.006,0);
  // Decorative industrial towers
  for(let i=0;i<6;i++){
    const x=(i%3-1)*23, z=(i<3?-25:25);
    box(4,8,4,mats.dark,x,4,z);
    box(4.15,.22,4.15,mats.neon,x,8.12,z);
  }
}
buildArena();

const heroColors = { ROBO:0x39c9e6, BLAZE:0xff704e, TITAN:0x9ea9bb, VOLT:0xa78bfa };
function makeBot(color, elite=false) {
  const g = new THREE.Group();
  const armor = material(color,.43,.22);
  const dark = material(0x233348,.58,.2);
  const visor = material(0x101e2e,.2,.65,{emissive:0x071d2b,emissiveIntensity:.8});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.82,1.05,.48),armor);
  torso.position.y=1.25; torso.castShadow=true; g.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(.48,.23,.06),material(0xe5f6ff,.28,.4));
  chest.position.set(0,1.35,.27); g.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),material(0xc8d6df,.35,.35));
  head.position.y=2.02; head.castShadow=true; g.add(head);
  const face = new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.07),visor);
  face.position.set(0,2.03,.31); g.add(face);
  for(const s of [-1,1]){
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.22,.82,.25),armor);
    arm.position.set(s*.56,1.25,.02); arm.rotation.z=s*-.12; arm.castShadow=true; g.add(arm);
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.28,.62,.32),dark);
    leg.position.set(s*.22,.35,0); leg.castShadow=true; g.add(leg);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.34,.18,.48),dark);
    boot.position.set(s*.22,.09,.07); g.add(boot);
  }
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.56,.58,.22),dark);
  pack.position.set(0,1.35,-.32); g.add(pack);
  g.userData={hp:elite?160:100, attack:Math.random()+.3, speed:elite?2.5:3.1, alive:true};
  return g;
}

// Third-person player avatar with visible armor and shoulder-mounted blaster.
const player = new THREE.Group();scene.add(player);
const playerArmor=material(0x27b9d2,.34,.38);
const playerDark=material(0x15283c,.42,.48);
const playerGlow=material(0x62efff,.22,.5,{emissive:0x087b9d,emissiveIntensity:1.1});
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.43,.82,5,10),playerArmor);torso.position.y=1.22;torso.castShadow=true;player.add(torso);
const chestPlate=new THREE.Mesh(new THREE.BoxGeometry(.58,.42,.18),playerDark);chestPlate.position.set(0,1.32,.34);player.add(chestPlate);
const chestLight=new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.04),playerGlow);chestLight.position.set(0,1.38,.445);player.add(chestLight);
const head=new THREE.Mesh(new THREE.SphereGeometry(.29,18,14),material(0xc7d9e5,.3,.35));head.position.y=2.02;head.castShadow=true;player.add(head);
const visor=new THREE.Mesh(new THREE.BoxGeometry(.38,.12,.08),material(0x071b2a,.18,.7,{emissive:0x0c5e78,emissiveIntensity:.8}));visor.position.set(0,2.04,.27);player.add(visor);
for(const side of [-1,1]){
 const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.55,4,8),playerArmor);arm.position.set(side*.55,1.25,.12);arm.rotation.z=side*-.16;player.add(arm);
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.55,4,8),playerDark);leg.position.set(side*.22,.42,0);player.add(leg);
 const boot=new THREE.Mesh(new THREE.BoxGeometry(.34,.18,.48),playerDark);boot.position.set(side*.22,.12,.1);player.add(boot);
}
const backPack=new THREE.Mesh(new THREE.BoxGeometry(.55,.62,.25),playerDark);backPack.position.set(0,1.3,-.34);player.add(backPack);
const avatarGun=new THREE.Group();avatarGun.position.set(.48,1.35,.48);player.add(avatarGun);
const avatarGunBody=new THREE.Mesh(new THREE.BoxGeometry(.22,.2,.72),material(0x243c55,.28,.7));avatarGun.add(avatarGunBody);
const avatarBarrel=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.38,12),playerGlow);avatarBarrel.rotation.x=Math.PI/2;avatarBarrel.position.z=.48;avatarGun.add(avatarBarrel);
const avatarMuzzle=new THREE.PointLight(0x64eaff,0,4);avatarMuzzle.position.z=.72;avatarGun.add(avatarMuzzle);
const weaponRig = new THREE.Group();camera.add(weaponRig);scene.add(camera);weaponRig.visible=false;
const gunBody = new THREE.Mesh(new THREE.BoxGeometry(.28,.24,.9),material(0x243c55,.32,.65));
gunBody.position.set(.42,-.34,-.72); weaponRig.add(gunBody);
const gunTop = new THREE.Mesh(new THREE.BoxGeometry(.12,.1,.5),mats.neon);
gunTop.position.set(.42,-.2,-.75); weaponRig.add(gunTop);
const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.065,.085,.52,10),material(0x17283a,.25,.8));
barrel.rotation.x=Math.PI/2; barrel.position.set(.42,-.32,-1.28); weaponRig.add(barrel);
const grip = new THREE.Mesh(new THREE.BoxGeometry(.13,.32,.16),mats.dark);
grip.position.set(.42,-.53,-.55); grip.rotation.x=-.2; weaponRig.add(grip);
const muzzle = new THREE.PointLight(0x65eaff,0,5); muzzle.position.set(.42,-.3,-1.35); weaponRig.add(muzzle);

let hero='ROBO', mode='solo', weapon=0, hp=100, kills=0, playing=false, paused=false;
let bots=[], shots=[], effects=[], coins=Number(localStorage.mbaCoins||0), level=Number(localStorage.mbaLevel||1);
let move={x:0,y:0}, yaw=0, pitch=0, last=performance.now(), fireCooldown=0, jumpVelocity=0, vertical=0, playerX=0, playerZ=23;
const weapons=[
 {name:'PULSE RIFLE',damage:34,rate:.24,range:65,color:0x42eaff},
 {name:'PLASMA CANNON',damage:58,rate:.62,range:75,color:0xff934e},
 {name:'NOVA SMG',damage:17,rate:.105,range:48,color:0xb98aff}
];
const raycaster=new THREE.Raycaster();
function toast(t){$('toast').textContent=t;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').textContent='',1250)}
function updateHud(){
 $('hpbar').style.width=hp+'%'; $('hptext').textContent=hp;
 $('round').textContent='KILLS '+kills+' / '+(mode==='survival'?12:mode==='practice'?2:5);
 $('weapon').textContent=weapons[weapon].name; $('coins').textContent='◆ '+coins; $('level').textContent='LV '+level;
}
function removeBattle(){
 bots.forEach(b=>scene.remove(b)); bots=[];
 shots.forEach(s=>scene.remove(s.mesh)); shots=[];
 effects.forEach(e=>scene.remove(e)); effects=[];
}
function spawn(){
 playerX=0;playerZ=23;player.position.set(playerX,0,playerZ);yaw=0;pitch=0;camera.rotation.order='YXZ';
 const count=mode==='survival'?12:mode==='practice'?2:5;
 for(let i=0;i<count;i++){
   const spread=(i-(count-1)/2)*4.2;
   const depth=mode==='practice'? -12-Math.abs(spread)*.25 : -13-(i%3)*5;
   const b=makeBot([0xf15b55,0xe9b54e,0x9c75ef,0x62c88c][i%4],mode==='survival'&&i>7);
   b.position.set(spread,0,depth);
   scene.add(b); bots.push(b);
 }
}
function start(){
 $('menu').classList.add('hidden'); $('result').classList.add('hidden'); $('hud').classList.remove('hidden');
 hp=100;kills=0;weapon=0;paused=false;fireCooldown=0;vertical=0;jumpVelocity=0;
 removeBattle();spawn();playing=true;updateHud();toast('ELIMINATE THE ENEMY TEAM');
}
function finish(win){
 playing=false;$('hud').classList.add('hidden');$('result').classList.remove('hidden');
 $('resulttitle').textContent=win?'VICTORY':'DEFEATED';
 const reward=win?100+kills*25:25+kills*12;coins+=reward;localStorage.mbaCoins=coins;
 if(kills>=5){level++;localStorage.mbaLevel=level}
 $('resulttext').textContent='Eliminations: '+kills+'  •  Reward: '+reward+' coins';updateHud();
}
function nearestTarget(){
 let best=null,dist=Infinity;
 for(const b of bots){if(!b.userData.alive)continue;const d=new THREE.Vector3(playerX,1.4,playerZ).distanceTo(b.position.clone().add(new THREE.Vector3(0,1.2,0)));if(d<dist){dist=d;best=b}}
 return [best,dist];
}
function burst(pos,color=0x63eaff){
 const geo=new THREE.SphereGeometry(.16,8,8);
 const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}));
 mesh.position.copy(pos);scene.add(mesh);effects.push(mesh);
 setTimeout(()=>{scene.remove(mesh);effects=effects.filter(x=>x!==mesh)},220);
}
function fire(){
 if(!playing||paused||fireCooldown>0)return;
 const w=weapons[weapon];fireCooldown=w.rate;muzzle.intensity=0;
 setTimeout(()=>muzzle.intensity=0,65);
 avatarGun.position.z=.4;avatarMuzzle.intensity=4;setTimeout(()=>{avatarGun.position.z=.48;avatarMuzzle.intensity=0},75);
 raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
 const targets=bots.filter(b=>b.userData.alive);
 const hits=raycaster.intersectObjects(targets,true);
 let hitBot=null;
 for(const hit of hits){let p=hit.object;while(p&& !p.userData?.alive)p=p.parent;if(p?.userData?.alive){hitBot=p;burst(hit.point,w.color);break}}
 if(hitBot){
   hitBot.userData.hp-=w.damage;
   hitBot.traverse(o=>{if(o.isMesh&&o.material?.emissive){o.material.emissive.setHex(0x552211);setTimeout(()=>o.material.emissive.setHex(0x000000),80)}});
   $('hitmarker').classList.add('show');setTimeout(()=>$('hitmarker').classList.remove('show'),100);
   if(hitBot.userData.hp<=0){hitBot.userData.alive=false;burst(hitBot.position.clone().add(new THREE.Vector3(0,1,0)),0xffa15c);scene.remove(hitBot);kills++;coins+=5;localStorage.mbaCoins=coins;toast('ELIMINATION +5');}
   updateHud();if(kills>=targets.length && bots.every(b=>!b.userData.alive))finish(true);
 } else {toast('');}
}
function enemyShot(bot){
 const start=bot.position.clone().add(new THREE.Vector3(0,1.35,0));
 const end=new THREE.Vector3(playerX,1.4,playerZ);
 const dir=end.sub(start).normalize();
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshBasicMaterial({color:0xff654f}));
 mesh.position.copy(start);scene.add(mesh);
 shots.push({mesh,dir,life:2,damage:7});
}
function update(dt){
 if(!playing||paused)return;
 fireCooldown=Math.max(0,fireCooldown-dt);
 const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const velocity=forward.multiplyScalar(-move.y).add(right.multiplyScalar(move.x));
 if(velocity.length()>1)velocity.normalize();
 playerX=THREE.MathUtils.clamp(playerX+velocity.x*dt*8,-27,27);
 playerZ=THREE.MathUtils.clamp(playerZ+velocity.z*dt*8,-27,27);
 player.position.set(playerX,vertical,playerZ);
 player.rotation.y=yaw;
 player.rotation.x=0;
 if(jumpVelocity!==0){vertical+=jumpVelocity*dt;jumpVelocity-=19*dt;if(vertical<0){vertical=0;jumpVelocity=0}}
 const camBack=new THREE.Vector3(Math.sin(yaw)*5.4,2.65+vertical,Math.cos(yaw)*5.4);
 camera.position.set(playerX+camBack.x,camBack.y,playerZ+camBack.z);
 const aimPoint=new THREE.Vector3(playerX-Math.sin(yaw)*13,1.55+vertical+Math.sin(pitch)*9,playerZ-Math.cos(yaw)*13);
 camera.lookAt(aimPoint);
 for(const b of bots){
  if(!b.userData.alive)continue;
  const target=new THREE.Vector3(playerX,0,playerZ);
  const dir=target.sub(b.position);const d=dir.length();dir.normalize();
  b.rotation.y=Math.atan2(dir.x,dir.z);
  if(d>7)b.position.addScaledVector(dir,dt*b.userData.speed);
  b.userData.attack-=dt;
  if(d<25&&b.userData.attack<=0){enemyShot(b);b.userData.attack=1.15+Math.random()*.9}
 }
 for(let i=shots.length-1;i>=0;i--){
  const s=shots[i];s.mesh.position.addScaledVector(s.dir,dt*15);s.life-=dt;
  if(s.mesh.position.distanceTo(new THREE.Vector3(playerX,1.2,playerZ))<.85){hp=Math.max(0,hp-s.damage);scene.remove(s.mesh);shots.splice(i,1);updateHud();$('damageflash').classList.add('show');setTimeout(()=>$('damageflash').classList.remove('show'),120);if(hp<=0){finish(false);return}}
  else if(s.life<=0){scene.remove(s.mesh);shots.splice(i,1)}
 }
 player.position.y=vertical+Math.sin(performance.now()*.006)*.012;
}
function loop(now){
 requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera);
}
requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

document.querySelectorAll('.hero').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.hero').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');hero=btn.dataset.hero;
});
document.querySelectorAll('.mode').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.mode').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');mode=btn.dataset.mode;
});
$('start').onclick=start;$('again').onclick=start;
$('home').onclick=()=>{$('result').classList.add('hidden');$('menu').classList.remove('hidden');removeBattle()};
$('fire').onpointerdown=e=>{e.preventDefault();fire()};
$('switch').onclick=()=>{weapon=(weapon+1)%weapons.length;updateHud();toast(weapons[weapon].name)};
$('jump').onclick=()=>{if(playing&&vertical===0)jumpVelocity=7};
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'▶':'Ⅱ';toast(paused?'PAUSED':'RESUMED')};

const stick=$('stick'),nub=$('nub');let active=null;
stick.onpointerdown=e=>{active=e.pointerId;stick.setPointerCapture(active);stickMove(e)};
stick.onpointermove=e=>{if(e.pointerId===active)stickMove(e)};
function stickMove(e){
 const r=stick.getBoundingClientRect();let x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),len=Math.hypot(x,y),max=43;
 if(len>max){x=x/len*max;y=y/len*max}
 nub.style.transform='translate('+x+'px,'+y+'px)';move={x:x/max,y:y/max};
}
function resetStick(){active=null;move={x:0,y:0};nub.style.transform='translate(0,0)'}
stick.onpointerup=resetStick;stick.onpointercancel=resetStick;

const look=$('lookzone');let lookId=null,lastX=0,lastY=0;
look.onpointerdown=e=>{if(!playing||paused)return;lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;look.setPointerCapture(lookId)};
look.onpointermove=e=>{
 if(e.pointerId!==lookId||!playing||paused)return;
 const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
 yaw-=dx*.0042;pitch=THREE.MathUtils.clamp(pitch-dy*.0032,-.55,.62);
};
function stopLook(){lookId=null}
look.onpointerup=stopLook;look.onpointercancel=stopLook;

$('loading').remove();updateHud();
