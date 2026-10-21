/* ================= CURIOLANDIA 3D: el mundo en tres dimensiones ================= */
// La portada, el mapa (la isla), las zonas, las casitas de tema y el cofre se dibujan con Three.js en #gl.
// Los juegos, la asamblea, la tienda, el álbum y la casa por dentro siguen en el lienzo 2D (#cv), que va encima.
// Para no reescribir la lógica de siempre, en cada cuadro se proyectan las posiciones 3D a coordenadas 1600x900
// (MZ2, ZPOS, stationPos, TITO, HOUSE_AT) y los enter/down/hint originales trabajan sobre esas posiciones.
let R3frame=null;
(function(){
if(!window.THREE)return;
let R;try{R=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:true,powerPreference:'high-performance'})}catch(e){return}
if(!R.getContext())return;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
// en móviles y tablets la sombra a 1024 se ve casi igual y ahorra memoria de GPU y batería
const SHM=matchMedia('(pointer:coarse)').matches?1024:2048;
let W3=null;
function fitCam(w){const a=innerWidth/innerHeight,c=w.cam,f=w.fov||40,A=16/9;c.aspect=a;
  c.fov=a<A?2*Math.atan(Math.tan(f*PI/360)*A/a)*180/PI:f;c.updateProjectionMatrix()}
let PRK=1;
function rs(){const b=Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.5:1.75);R.setPixelRatio(Math.max(Math.min(b,.75),b*PRK));R.setSize(innerWidth,innerHeight,false);if(W3)fitCam(W3)}
addEventListener('resize',rs);rs();

/* ---------- proyección 3D → 1600x900 y selección con el puntero ---------- */
const _v=new THREE.Vector3(),_w=new THREE.Vector3(),_u=new THREE.Vector3();
function proj(p){_v.copy(p).project(W3.cam);return[((_v.x+1)/2*innerWidth-OX)/SC,((1-_v.y)/2*innerHeight-OY)/SC]}
function projO(o,dy=0){o.getWorldPosition(_w);_w.y+=dy;return proj(_w)}
function projR(o,r,dy=0){o.getWorldPosition(_w);_w.y+=dy;const a=proj(_w);_u.set(0,1,0).applyQuaternion(W3.cam.quaternion).multiplyScalar(r).add(_w);const b=proj(_u);return[a[0],a[1],Math.hypot(a[0]-b[0],a[1]-b[1])]}
const RC=new THREE.Raycaster(),_m=new THREE.Vector2();
function pickAt(x,y){if(!W3)return null;_m.set((x*SC+OX)/innerWidth*2-1,-((y*SC+OY)/innerHeight)*2+1);RC.setFromCamera(_m,W3.cam);
  for(const h of RC.intersectObjects(W3.pick,true)){let o=h.object;while(o&&!o.userData.id)o=o.parent;if(o)return o.userData}return null}

/* ---------- materiales con estilo de dibujo: sombreado en 3 tonos + contorno marrón ---------- */
const GRAD=(()=>{const t=new THREE.DataTexture(new Uint8Array([150,150,150,255,212,212,212,255,255,255,255,255]),3,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
const MC={};
function M(c,o){const k=c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:GRAD},o||{})))}
const OLC={};
function OLm(w){w=Math.round(w*1000)/1000;return OLC[w]||(OLC[w]=new THREE.ShaderMaterial({uniforms:{w:{value:w}},side:THREE.BackSide,
  vertexShader:'attribute vec3 onorm;uniform float w;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+onorm*w,1.0);}',
  fragmentShader:'void main(){gl_FragColor=vec4(0.29,0.204,0.157,1.0);}'}))}
// normales suavizadas sólo para el contorno (si no, las cajas quedan con huecos en las aristas)
function olGeo(g){if(g.userData.ol)return g;const p=g.attributes.position,n=g.attributes.normal,map=new Map(),o=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*500)+','+Math.round(p.getY(i)*500)+','+Math.round(p.getZ(i)*500);let a=map.get(k);if(!a)map.set(k,a=[]);a.push(i)}
  for(const a of map.values()){let x=0,y=0,z=0;for(const i of a){x+=n.getX(i);y+=n.getY(i);z+=n.getZ(i)}const l=Math.hypot(x,y,z)||1;for(const i of a){o[i*3]=x/l;o[i*3+1]=y/l;o[i*3+2]=z/l}}
  g.setAttribute('onorm',new THREE.BufferAttribute(o,3));g.userData.ol=1;return g}
function mk(geo,c,o={}){const m=new THREE.Mesh(geo,typeof c==='string'?M(c):c);m.castShadow=o.cs!==false;m.receiveShadow=o.rs!==false;
  if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);
  if(o.s!=null){if(typeof o.s==='number')m.scale.setScalar(o.s);else m.scale.set(o.s[0],o.s[1],o.s[2])}
  if(o.ol!==0){const sc=(m.scale.x+m.scale.y+m.scale.z)/3,l=new THREE.Mesh(olGeo(geo),OLm((o.ol||.05)/sc));l.castShadow=false;l.receiveShadow=false;l.raycast=()=>{};m.add(l)}
  if(o.to)o.to.add(m);return m}
const grp=(to,p,s)=>{const g=new THREE.Group();if(p)g.position.set(p[0],p[1],p[2]);if(s)g.scale.setScalar(s);if(to)to.add(g);return g};
const Box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Sph=(r,a=20,b=14)=>new THREE.SphereGeometry(r,a,b),Cyl=(a,b,h,n=20)=>new THREE.CylinderGeometry(a,b,h,n),Cone=(r,h,n=20)=>new THREE.ConeGeometry(r,h,n);
function prism(w,h,d){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return g}
function rbox(w,h,d,r){const s=new THREE.Shape(),x=-w/2+r,y=-h/2+r,W_=w-2*r,H_=h-2*r;s.moveTo(x,-h/2);s.lineTo(x+W_,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,y);s.lineTo(w/2,y+H_);s.quadraticCurveTo(w/2,h/2,x+W_,h/2);s.lineTo(x,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,y+H_);s.lineTo(-w/2,y);s.quadraticCurveTo(-w/2,-h/2,x,-h/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:d-r,bevelEnabled:true,bevelThickness:r/2,bevelSize:r/2,bevelSegments:2,curveSegments:6});g.translate(0,0,-(d-r)/2);return g}
function starGeo(r,d){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=PI/2+i*PI/5,q=i%2?r*.45:r;i?s.lineTo(Math.cos(a)*q,Math.sin(a)*q):s.moveTo(Math.cos(a)*q,Math.sin(a)*q)}s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:d*.3,bevelSize:d*.3,bevelSegments:1});g.translate(0,0,-d/2);return g}

// une varias piezas del mismo color en una sola geometría (menos llamadas de dibujo): [[geo,[x,y,z],[sx,sy,sz]|s,[rx,ry,rz]],...]
const _o3=new THREE.Object3D();
function mg(parts){const pos=[],nor=[];for(const [g0,p,sc,r] of parts){const g=g0.index?g0.toNonIndexed():g0.clone();_o3.position.set(...(p||[0,0,0]));if(sc==null)_o3.scale.set(1,1,1);else if(typeof sc==='number')_o3.scale.setScalar(sc);else _o3.scale.set(...sc);_o3.rotation.set(...(r||[0,0,0]));_o3.updateMatrix();g.applyMatrix4(_o3.matrix);
  pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g}
const GC={};const keep=g=>{g.userData.keep=1;return g};
const gcache=(k,f)=>GC[k]||(GC[k]=keep(olGeo(f())));
/* ---------- texturas hechas con el dibujo 2D de siempre ---------- */
const TXC={};
function canvasTex(w,h,fn,key){if(key&&TXC[key])return TXC[key];const c=document.createElement('canvas');c.width=w;c.height=h;
  const draw=()=>{const g=c.getContext('2d'),old=ctx;g.clearRect(0,0,w,h);ctx=g;const mo=mouseOn;mouseOn=false;try{fn(g)}catch(e){console.error(e)}mouseOn=mo;ctx=old};draw();
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.redraw=()=>{draw();t.needsUpdate=true};if(key)TXC[key]=t;return t}
const picsReady=ks=>ks.every(k=>!IMG[k]||IMG[k].complete);
function picTex(k,px=256){const t=canvasTex(px,px,g=>{const i=IMG[k];if(i&&i.complete)g.drawImage(i,0,0,px,px)},'pic:'+k+px);
  if(IMG[k]&&!IMG[k].complete)IMG[k].addEventListener('load',()=>t.redraw(),{once:true});return t}
function spr(tex,w,h,o={}){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:o.dt!==false,opacity:o.op??1}));m.scale.set(w,h??w,1);if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.to)o.to.add(m);m.renderOrder=o.ro||0;return m}
function plane(tex,w,h,o={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.02,side:o.ds?THREE.DoubleSide:THREE.FrontSide}));if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);if(o.to)o.to.add(m);return m}
// cartel en forma de píldora: [texto, fondo, color del texto]
function pillTex(t,bg='#fff',fg=K,sz=56){return canvasTex(512,128,g=>{g.font=`700 ${sz}px ${DF}`;const tw=Math.min(470,g.measureText(t).width+60);card(256-tw/2,14,tw,100,bg,8,50);text(t,256,64+sz*.36,sz,fg)},'pill:'+t+bg+fg+sz)}
const pillSpr=(t,bg,fg,o={})=>spr(pillTex(t,bg,fg),o.w||2.4,(o.w||2.4)/4,o);
function flowerTex(c,n){return canvasTex(256,128,()=>{card(14,14,228,100,'#fff',8,50);flower(80,64,28,c,4);const L=String(n).length>1;text(String(n),L?168:170,L?84:92,L?52:72,K,{f:LF})},'fl:'+c+n)}

/* ---------- utilería ---------- */
function flower3(to,x,z,c,s=1,y=0){const g=grp(to,[x,y,z],s);mk(gcache('stem',()=>Cyl(.035,.035,.5,5)),'#6FB84F',{p:[0,.25,0],ol:0,cs:false,to:g});const h=grp(g,[0,.55,0]);h.rotation.x=-.5;
  mk(gcache('petals',()=>mg([0,1,2,3,4].map(i=>{const a=i/5*PI*2;return[Sph(.12,9,7),[Math.cos(a)*.13,Math.sin(a)*.13,0],[1,1,.5]]}))),c,{ol:.02,cs:false,to:h});mk(gcache('fcenter',()=>Sph(.09,9,7)),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:0,cs:false,to:h});
  const hit=new THREE.Mesh(gcache('fhit',()=>Sph(.32,6,4)),FHIT);hit.position.y=.45;g.add(hit);g.userData.flower=h;return g}
const FHIT=new THREE.MeshBasicMaterial({visible:false});// zona de toque de las flores (son muy pequeñas para un dedo)
const TREEC={primavera:['#9BD86A','#F58BB4'],verano:['#6FC25A',null],'otoño':['#FFA94D','#FF6B5E'],invierno:['#E8F4F8',null],gris:['#C9C2B8',null]};
function tree3(to,x,z,s=1,kind='verano',pine){const g=grp(to,[x,0,z],s),c=TREEC[kind]||TREEC.verano;mk(Cyl(.18,.26,1.4,10),kind==='gris'?'#B8AFA4':'#A86B43',{p:[0,.7,0],to:g});
  if(pine){[[1.1,1.3,1.5],[.85,1.1,2.2],[.55,.9,2.85]].forEach(([r,h,y])=>mk(Cone(r,h,9),kind==='gris'?'#C9C2B8':'#4FA36A',{p:[0,y,0],to:g}))}
  else{mk(gcache('canopy',()=>mg([[0,2.1,0,.95],[-.55,1.75,.2,.7],[.55,1.8,-.1,.72],[.1,2.6,-.1,.6]].map(([a,b,d,r])=>[Sph(r,14,10),[a,b,d]]))),c[0],{to:g});
    if(c[1])mk(gcache('berries',()=>mg([0,1,2,3,4].map(i=>{const a=i*1.3;return[Sph(.13,8,6),[Math.cos(a)*.75,1.9+Math.sin(i*2)*.4,Math.sin(a)*.75+.2]]}))),c[1],{ol:.02,cs:false,to:g})}
  g.userData.tree=1;return g}
function bush3(to,x,z,s=1,c='#7CC86E'){const g=grp(to,[x,0,z],s);mk(gcache('bush',()=>mg([[0,.35,0,.45],[-.4,.28,.1,.33],[.4,.3,0,.35]].map(([a,b,d,r])=>[Sph(r,12,8),[a,b,d]]))),c,{to:g});g.userData.bush=1;return g}
function rock3(to,x,z,s=1,c='#B9B2A8'){const m=mk(new THREE.DodecahedronGeometry(.5,0),c,{p:[x,.2*s,z],s:[s,s*.7,s],r:[0,x*3,0],to});m.userData.rock=1;return m}
function lock3(to,p,s=1){const g=grp(to,p,s);mk(rbox(1.1,.85,.45,.12),'#FFC93C',{to:g,ol:.05});
  const sh=new THREE.TorusGeometry(.33,.09,10,20,PI);mk(sh,'#B8B0A6',{p:[0,.42,0],to:g,ol:.04});
  mk(Cyl(.09,.09,.1,12),K,{p:[0,.05,.24],r:[PI/2,0,0],ol:0,to:g});mk(Box(.07,.22,.08),K,{p:[0,-.12,.24],ol:0,to:g});return g}
function arrow3(to,p,s=1){const sh=new THREE.Shape();[[-15,-46],[15,-46],[15,-16],[32,-16],[0,18],[-32,-16],[-15,-16]].forEach(([x,y],i)=>i?sh.lineTo(x/30,-y/30):sh.moveTo(x/30,-y/30));
  const g=new THREE.ExtrudeGeometry(sh,{depth:.25,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:1});g.translate(0,0,-.125);return mk(g,'#FFC93C',{p,s,to,ol:.05,cs:false})}
// la flecha de "siguiente" ya no gira entera (de canto se veía como una rayita): mira a la cámara y se balancea un poco
const arrowSway=(w,ar)=>{ar.rotation.y=Math.atan2(w.cam.position.x-ar.position.x,w.cam.position.z-ar.position.z)+Math.sin(T*1.5)*.45};
function ring3(to,p,r,c='#FFC93C'){const m=new THREE.Mesh(new THREE.TorusGeometry(r,.09,8,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.8}));m.rotation.x=-PI/2;m.position.set(p[0],p[1],p[2]);to.add(m);return m}
// cinta plana (caminos): pts = [[x,z],...]
function ribbon(to,pts,w,c,y=.02,o={}){const pos=[],idx=[];const n=pts.length;
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    pos.push(pts[i][0]-dz*w/2,y,pts[i][1]+dx*w/2,pts[i][0]+dz*w/2,y,pts[i][1]-dx*w/2);if(i)idx.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,M(c,Object.assign({side:THREE.DoubleSide},o.polygonOffset?{polygonOffset:true,polygonOffsetFactor:-1-o.polygonOffset,polygonOffsetUnits:-4*o.polygonOffset}:{})));m.receiveShadow=true;to.add(m);
  if(o.dash){for(let i=2;i<n-2;i+=o.dash){mk(Cyl(.07,.07,.03,8),o.dashC||'#E4CFA0',{p:[pts[i][0],y+.02,pts[i][1]],ol:0,cs:false,to})}}return m}
function bez(a,c,b,n=24){const r=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;r.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return r}
// punto suave y redondo para partículas (luciérnagas, nieve)
function softTex(){return canvasTex(64,64,()=>{const g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.25,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64)},'ffly')}
// partículas que caen despacio sobre una zona (nieve, confeti…): un solo dibujo para todas, y no se pueden tocar
function fallPts(w,n,cols,o){const pos=new Float32Array(n*3),col=new Float32Array(n*3),ph=[],c=new THREE.Color(),H=o.h||9,WX=o.wx||36,WZ=o.wz||18,CX=o.cx||0,CZ=o.cz||0;
  for(let i=0;i<n;i++){pos[i*3]=CX+(Math.random()-.5)*WX;pos[i*3+1]=Math.random()*H;pos[i*3+2]=CZ+(Math.random()-.5)*WZ;c.set(cols[i%cols.length]);col.set([c.r,c.g,c.b],i*3);ph.push(Math.random()*6.28)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size:o.size,map:o.map,vertexColors:true,transparent:true,depthWrite:false,opacity:o.op||1}));p.raycast=()=>{};w.sc.add(p);
  w.upd.push(dt=>{for(let i=0;i<n;i++){const k=i*3;pos[k+1]-=o.sp*dt*(.7+(i%5)*.15);pos[k]+=Math.sin(T*.8+ph[i])*o.sw*dt;if(pos[k+1]<0){pos[k+1]=H;pos[k]=CX+(Math.random()-.5)*WX}}g.attributes.position.needsUpdate=true});return p}
// mariposa: dos alas que aletean y un vuelo en curvas alrededor de un punto
function butterfly3(w,cx,cz,c,ph,o={}){const g=grp(w.sc,[cx,1.5,cz],o.s||1.7);g.userData.bfly=1;g.add(new THREE.Mesh(gcache('bhit',()=>Sph(.4,6,4)),FHIT));const wg=gcache('wing',()=>{const c=r=>new THREE.CircleGeometry(r,12).rotateX(-PI/2);return mg([[c(.3),[0,0,-.13]],[c(.2),[-.06,0,.17]]])});// ala de dos lóbulos
  mk(Cyl(.035,.035,.42,6),K,{r:[PI/2,0,0],ol:0,cs:false,to:g});const W=[];
  for(const sd of[-1,1]){const pv=grp(g,[0,0,0]);mk(wg,M(c,{side:THREE.DoubleSide}),{p:[sd*.3,0,0],ol:0,cs:false,to:pv});W.push([pv,sd])}
  let lx=cx,lz=cz;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,up=e<1.4?Math.sin(Math.min(e/1.4,1)*PI)*1.6:0;// al tocarla sube asustada y vuelve
    const t=T*.5+ph,R=o.r||3.2,x=cx+Math.cos(t)*R,z=cz+Math.sin(t*1.3)*R*.5;g.position.set(x,(o.h||1.9)+Math.sin(T*1.7+ph)*.4+up,z);
    g.rotation.y=Math.atan2(x-lx,z-lz);lx=x;lz=z;for(const [pv,sd] of W)pv.rotation.z=sd*(.45+Math.sin(T*(e<1.4?30:16)+ph)*.6)});return g}// alas en V: se ven también desde una cámara baja
// gaviota: vuela en círculos sobre el mar aleteando de vez en cuando
function gull3(w,R,Rz,h,ph,dir){const g=grp(w.sc,[0,h,0],1.6);g.userData.gull=1;g.add(new THREE.Mesh(gcache('ghit',()=>Sph(.9,6,4)),FHIT));// zona de toque invisible
  mk(Sph(.18,10,8),'#FFFFFF',{s:[1,.8,1.6],ol:.02,cs:false,to:g});mk(Cone(.06,.2,6),'#FFA94D',{p:[0,0,.36],r:[PI/2,0,0],ol:0,cs:false,to:g});
  const W=[];for(const sd of[-1,1]){const pv=grp(g,[sd*.12,.04,0]);mk(Box(.8,.04,.26),'#FFFFFF',{p:[sd*.4,0,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const t=T*.12*dir+ph,x=Math.cos(t)*R,z=Math.sin(t)*Rz;g.position.set(x,h+Math.sin(T*.7+ph)*.5,z);g.rotation.y=Math.atan2(-Math.sin(t)*R*dir,Math.cos(t)*Rz*dir);
    const fl=Math.sin(T*.9+ph)>-.2?Math.sin(T*9+ph)*.5:.15;for(const [pv,sd] of W)pv.rotation.z=sd*fl;
    const k=g.userData.wob,e=k==null?9:T-k;g.rotation.z=e<.8?Math.min(e/.8,1)*PI*2:0});return g}// al tocarla da una voltereta
// luciérnagas que flotan y parpadean (de noche); un solo dibujo para todas
function fireflies(w,WX,WZ,sz){const n=24,pos=new Float32Array(n*3),ph=[];for(let i=0;i<n;i++)ph.push([(Math.random()-.5)*WX,(Math.random()-.5)*WZ,Math.random()*6.28]);
    const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const ff=new THREE.Points(fg,new THREE.PointsMaterial({color:'#FFF06A',size:sz||2.2,blending:THREE.AdditiveBlending,map:softTex(),transparent:true,depthWrite:false}));ff.raycast=()=>{};w.sc.add(ff);
    w.upd.push(()=>{for(let i=0;i<n;i++){const [x,z,a]=ph[i];pos[i*3]=x+Math.sin(T*.5+a)*1.2;pos[i*3+1]=1.3+Math.sin(T*.9+a*2)*.6;pos[i*3+2]=z+Math.cos(T*.4+a)*1.2}fg.attributes.position.needsUpdate=true;ff.material.opacity=.65+.35*Math.sin(T*3)})}
// seta de sombrero rojo con lunares; al tocarla se aplasta y rebota como los arbustos
function mush3(to,x,z,s){const g=grp(to,[x,0,z],s);g.userData.mush=1;mk(Cyl(.16,.2,.5,12),'#FFF6E6',{p:[0,.25,0],to:g,ol:.025});
  const nt=skyNow().night,cap=new THREE.SphereGeometry(.42,16,10,0,PI*2,0,PI/2);/* de noche las setas brillan un poco */mk(cap,nt?M('#E8503C',{emissive:'#6A1A0E'}):'#E8503C',{p:[0,.48,0],s:[1,.75,1],to:g,ol:.03});
  const dc=nt?M('#FFFFFF',{emissive:'#8FE3FF'}):'#FFFFFF';for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Sph(.06,8,6),dc,{p:[Math.cos(a)*.26,.68,Math.sin(a)*.26],s:[1,.5,1],ol:0,cs:false,to:g})}mk(Sph(.07,8,6),dc,{p:[0,.8,0],s:[1,.5,1],ol:0,cs:false,to:g});return g}
// autobús rojo de dos pisos que va y viene; al tocarlo da un saltito y pita
function bus3(w,z){const D=w.sc,b=grp(D,[0,0,z],.9),body=grp(b,[0,0,0]);b.userData.bus=1;
  mk(rbox(3,1.9,1.2,.12),'#D9302C',{p:[0,1.25,0],to:body,ol:.05});mk(Box(3.02,.12,1.22),'#FFF3D6',{p:[0,1.3,0],ol:0,to:body});
  const nt=skyNow().night;for(const y of[.95,1.75])for(const sd of[-1,1])mk(Box(2.5,.38,.02),nt?M('#FFE08A',{emissive:'#C98A00'}):'#BFE6F8',{p:[0,y,sd*.61],ol:0,cs:false,to:body});
  for(const sd of[-1,1])mk(Sph(.13,10,8),nt?M('#FFF6C0',{emissive:'#FFD23C'}):'#F2EEE0',{p:[1.5,.62,sd*.38],s:[.5,1,1],ol:.015,cs:false,to:body});/* faros (de noche encendidos, y las ventanas con luz) */
  for(const x of[-.95,.95])for(const sd of[-1,1])mk(Cyl(.28,.28,.2,14),'#3A2E2A',{p:[x,.3,sd*.55],r:[PI/2,0,0],ol:.02,to:b});
  let x=-14,dir=1;w.upd.push(dt=>{x+=dir*dt*1.6;if(x>14){x=14;dir=-1}if(x<-14){x=-14;dir=1}b.position.x=x;b.rotation.y+=((dir>0?0:PI)-b.rotation.y)*Math.min(1,dt*4);
    const k=b.userData.wob,e=k==null?9:T-k;body.position.y=(e<.5?Math.sin(e/.5*PI)*.4:0)+Math.abs(Math.sin(T*8))*.02});return b}
// muñeco de nieve; al tocarlo el sombrero da un salto y gira
function snowman3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.snowman=1;
  mk(Sph(.7,18,14),'#FFFFFF',{p:[0,.62,0],to:g,ol:.03});mk(Sph(.5,18,14),'#FFFFFF',{p:[0,1.6,0],to:g,ol:.03});
  for(const sd of[-1,1])mk(Sph(.06,8,6),K,{p:[sd*.17,1.7,.44],ol:0,cs:false,to:g});mk(Cone(.07,.4,8),'#FF8A3D',{p:[0,1.58,.6],r:[PI/2,0,0],ol:0,to:g});
  for(let i=0;i<3;i++)mk(Sph(.06,8,6),K,{p:[0,.5+i*.25,.68-Math.abs(i-1)*.05],ol:0,cs:false,to:g});
  mk(new THREE.TorusGeometry(.42,.09,8,20),'#E8503C',{p:[0,1.22,0],r:[PI/2,0,0],ol:0,to:g});
  const hat=grp(g,[0,2.02,0]);mk(Cyl(.45,.45,.06,16),'#3A2E2A',{to:hat,ol:.02});mk(Cyl(.3,.3,.5,16),'#3A2E2A',{p:[0,.28,0],to:hat,ol:.02});g.userData.hat=hat;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/.9,1);hat.position.y=2.02+(e<.9?Math.sin(q*PI)*.9:0);hat.rotation.y=e<.9?q*PI*2:0});return g}
function pinata3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.pinata=1;
  mk(Cyl(.08,.1,3.6,8),'#B07A4A',{p:[-1.2,1.8,0],to:g,ol:.02});mk(Cyl(.07,.07,1.5,8),'#B07A4A',{p:[-.5,3.55,0],r:[0,0,PI/2],to:g,ol:.02});
  const sw=grp(g,[.2,3.55,0]);mk(Cyl(.012,.012,.9,4),K,{p:[0,-.45,0],ol:0,cs:false,to:sw});mk(starGeo(.6,.4),'#FF6FA5',{p:[0,-1.45,0],to:sw,ol:.04});
  for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5;mk(Cone(.08,.4,6),DIAC[i%7],{p:[Math.cos(a)*.62,-1.45+Math.sin(a)*.62,0],r:[0,0,a-PI/2],ol:0,cs:false,to:sw})}
  const cd=[];for(let i=0;i<7;i++){const m=mk(Sph(.12,8,6),DIAC[i%7],{to:g,ol:.02,cs:false});m.visible=false;m.raycast=()=>{};cd.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;sw.rotation.z=e<2.6?Math.sin(e*6)*.45*Math.exp(-e*1.4):0;sw.rotation.y=e<2.6?e*3*Math.exp(-e):0;
    for(let i=0;i<cd.length;i++){const m=cd[i];if(e>2.4){m.visible=false;continue}const a=i/cd.length*PI*2,vx=Math.cos(a)*1.3,vz=Math.sin(a)*1.3,t=Math.min(e,.75);
      m.visible=e>.05;m.position.set(.2+vx*t,Math.max(.12,2.1+3*t-6*t*t),vz*t)}});return g}
// abeja: zumba de flor en flor; al tocarla sube dando vueltas (cuenta como mariposa para tocarla primero)
function bee3(w,cx,cz,ph,sc){const g=grp(w.sc,[cx,1.2,cz],sc||1.5);g.userData.bfly=1;g.userData.bee=1;g.add(new THREE.Mesh(gcache('bhit',()=>Sph(.4,6,4)),FHIT));
  mk(Sph(.2,12,10),'#FFC93C',{s:[1,1,1.35],ol:.02,cs:false,to:g});for(const z of[-.08,.1])mk(new THREE.TorusGeometry(.19,.035,6,16),K,{p:[0,0,z],s:[1,1,1],ol:0,cs:false,to:g});
  mk(Sph(.12,10,8),K,{p:[0,.02,.27],ol:0,cs:false,to:g});const W=[];
  for(const sd of[-1,1]){const pv=grp(g,[sd*.08,.14,0]);mk(Sph(.16,10,8),M('#FFFFFF',{transparent:true,opacity:.75}),{p:[sd*.14,.04,-.04],s:[1,.2,.6],ol:0,cs:false,to:pv});W.push([pv,sd])}
  let lx=cx,lz=cz;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.2,1),up=e<1.2?Math.sin(q*PI)*1.4:0;
    const t=T*.7+ph,x=cx+Math.sin(t)*4.5,z=cz+Math.sin(t*2)*1;g.position.set(x,1.1+Math.abs(Math.sin(T*2.4+ph))*.5+up,z);
    g.rotation.y=(e<1.2?q*PI*4:0)+Math.atan2(x-lx,z-lz);lx=x;lz=z;for(const [pv,sd] of W)pv.rotation.z=sd*Math.sin(T*40+ph)*.5});return g}
// búho sobre un tocón: parpadea; al tocarlo gira la cabeza y ulula
function owl3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.owl=1;mk(Cyl(.55,.62,.9,14),'#8A5A3A',{p:[0,.45,0],to:g,ol:.03});mk(Cyl(.5,.5,.02,14),'#D9B58A',{p:[0,.91,0],ol:0,cs:false,to:g});
  mk(Sph(.48,16,12),'#9C6B45',{p:[0,1.38,0],s:[1,1.15,.9],to:g,ol:.03});mk(Sph(.32,14,10),'#E9D2AE',{p:[0,1.3,.2],s:[1,1.2,.6],ol:0,cs:false,to:g});
  const hd=grp(g,[0,1.95,0]);mk(Sph(.4,16,12),'#9C6B45',{to:hd,ol:.03});mk(Sph(.33,14,10),'#E9D2AE',{p:[0,0,.16],s:[1.05,.85,.7],ol:0,cs:false,to:hd});const E=[],EW=[],nt=skyNow().night;
  for(const sd of[-1,1]){EW.push(mk(Sph(.19,12,10),nt?M('#FFE070',{emissive:'#C9A000'}):'#FFFFFF',{p:[sd*.17,.06,.3],s:[1,1,.5],ol:.02,cs:false,to:hd}));const pu=mk(Sph(.1,10,8),K,{p:[sd*.17,.07,.39],s:[1,1,.5],ol:0,cs:false,to:hd});E.push(pu);
    mk(Cone(.09,.26,6),'#7A4E30',{p:[sd*.24,.4,0],r:[0,0,-sd*.35],ol:0,cs:false,to:hd})}
  mk(Cone(.06,.16,6),'#FFA94D',{p:[0,-.08,.4],r:[PI/2+.6,0,0],ol:0,cs:false,to:hd});
  const zz=nt?null:zzz3(w,g,2.4);// el búho es nocturno: de día duerme y de noche está despierto
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.2,1),sl=!nt&&e>3,bl=sl?.12:(T%4.3)<.15?.15:1;for(const pu of E)pu.scale.y=bl;for(const m of EW)m.scale.y=sl?.15:1;if(zz)zz.forEach(z=>z.visible=sl);
    hd.rotation.y=e<1.2?Math.sin(q*PI*2)*1.2:sl?0:Math.sin(T*.4)*.15;hd.rotation.x=sl?.25:0;hd.rotation.z=e<1.2?Math.sin(q*PI)*.2:0});return g}
// cabina de teléfono roja (rincón de inglés): al tocarla tiembla y suena ring-ring
function phone3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.phone=1;const R='#D9372C';
  mk(Box(1,2.3,1),R,{p:[0,1.15,0],to:g,ol:.04});mk(Box(1.12,.18,1.12),R,{p:[0,2.38,0],to:g,ol:.03});mk(Sph(.5,14,8,0,PI*2,0,PI/2),R,{p:[0,2.46,0],s:[1,.35,1],to:g,ol:.03});
  const gl=canvasTex(64,128,()=>{ctx.fillStyle='#BFE6F5';ctx.fillRect(0,0,64,128);ctx.fillStyle='#D9372C';for(let i=1;i<4;i++)ctx.fillRect(0,i*32-3,64,6);ctx.fillRect(29,0,6,128)},'phonegl');
  mk(Box(.7,1.4,.02),skyNow().night?new THREE.MeshBasicMaterial({map:gl,color:'#FFF2B0'}):new THREE.MeshToonMaterial({map:gl}),{p:[0,1.15,.51],ol:0,cs:false,to:g});/* de noche la cabina tiene luz dentro */
  mk(Box(.8,.2,.02),'#FFFFFF',{p:[0,2.14,.51],ol:0,cs:false,to:g});return g}
// charca con una rana sobre un nenúfar: al tocarla da un salto y croa
function frog3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.frog=1;mk(Cyl(1.3,1.3,.06,24),'#7FC8E8',{p:[0,.03,0],s:[1,1,.7],ol:.02,to:g});
  mk(Cyl(.5,.5,.04,16,1,false,.4,PI*2-.6),'#5BB04B',{p:[-.2,.08,0],ol:0,cs:false,to:g});mk(Cyl(.28,.28,.04,12,1,false,1,PI*2-.6),'#5BB04B',{p:[.75,.08,.2],ol:0,cs:false,to:g});
  const f=grp(g,[-.2,.1,0]);mk(Sph(.32,14,10),'#6CC24A',{p:[0,.22,0],s:[1,.7,1.1],to:f,ol:.03});
  const FE=[],nt=skyNow().night;for(const sd of[-1,1]){mk(Sph(.11,10,8),'#6CC24A',{p:[sd*.15,.42,.18],to:f,ol:.02});FE.push(mk(Sph(.06,8,6),K,{p:[sd*.15,.46,.27],ol:0,cs:false,to:f}));mk(Sph(.12,8,6),'#5AAE3C',{p:[sd*.28,.08,.15],s:[1,.5,1.4],ol:.02,cs:false,to:f})}
  const th=mk(Sph(.12,10,8),'#F2E3A0',{p:[0,.2,.3],s:[1.2,.7,.6],ol:0,cs:false,to:f});
  const zz=nt?zzz3(w,f,.8):null;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/.8,1),sl=nt&&e>=.8;f.position.y=.1+(e<.8?Math.sin(q*PI)*1.1:0);f.rotation.x=e<.8?-Math.sin(q*PI)*.4:0;
    th.scale.setScalar(sl?1:1+Math.max(0,Math.sin(T*5))*.5*((T%3)<1.2?1:0));for(const m of FE)m.scale.y=sl?.15:1;if(zz)zz.forEach(z=>z.visible=sl)});return g}// de noche duerme sobre el nenúfar
// cangrejo de la playa del mapa: anda de lado de un lado a otro; al tocarlo abre y cierra las pinzas y corre
function crab3(w,x0,x1,z,s){const g=grp(w.sc,[x0,0,z],s);g.userData.crab=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),FHIT));const C='#F0603C';
  mk(Sph(.4,14,10),C,{p:[0,.3,0],s:[1.2,.6,.9],to:g,ol:.03});const P=[],CE=[],nt=skyNow().night;
  for(const sd of[-1,1]){mk(Cyl(.03,.03,.25,5),C,{p:[sd*.13,.55,.18],ol:0,cs:false,to:g});CE.push(mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.13,.7,.18],ol:.015,cs:false,to:g}),mk(Sph(.035,6,5),K,{p:[sd*.13,.71,.24],ol:0,cs:false,to:g}));
    const cl=grp(g,[sd*.48,.35,.3]);mk(Sph(.16,10,8),C,{s:[1,.8,1.2],to:cl,ol:.02});const j=grp(cl,[0,0,.12]);mk(Box(.07,.06,.2),C,{p:[0,0,.08],ol:.01,cs:false,to:j});P.push(j);
    for(let i=0;i<3;i++)mk(Cyl(.025,.025,.35,4),C,{p:[sd*.42,.18,-.15+i*.15],r:[0,0,sd*1.1],ol:0,cs:false,to:g})}
  const zz=nt?zzz3(w,g,1):null;let ph=0;w.upd.push(dt=>{const k=g.userData.wob,e=k==null?9:T-k,fast=e<1.2,sl=nt&&!fast;ph+=sl?0:dt*(fast?1.6:.35);for(const m of CE)m.scale.y=sl?.2:1;if(zz)zz.forEach(z=>z.visible=sl);// de noche duerme en la arena
    g.position.x=x0+(x1-x0)*(.5-.5*Math.cos(ph));
    g.position.y=Math.abs(Math.sin(ph*14))*.04;for(const j of P)j.rotation.y=fast?Math.abs(Math.sin(e*16))*.7:Math.max(0,Math.sin(T*3))*.3});return g}
// tarta de cumpleaños con velas: al tocarla se apagan con un soplido y al rato se vuelven a encender
function cake3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.cake=1;g.userData.dur=2.5;mk(Cyl(.95,.95,.08,20),'#FFFFFF',{p:[0,.04,0],to:g,ol:.02});
  mk(Cyl(.75,.75,.5,20),'#F7A8C4',{p:[0,.33,0],to:g,ol:.03});mk(Cyl(.77,.77,.08,20),'#FFFFFF',{p:[0,.6,0],ol:.01,cs:false,to:g});mk(Cyl(.55,.55,.38,20),'#FFE08A',{p:[0,.83,0],to:g,ol:.03});
  for(let i=0;i<8;i++){const a=i/8*PI*2;mk(Sph(.07,8,6),DIAC[i%7],{p:[Math.cos(a)*.76,.5,Math.sin(a)*.76],ol:0,cs:false,to:g})}
  const F=[];for(let i=0;i<5;i++){const a=i/5*PI*2+.3,cx=Math.cos(a)*.32,cz=Math.sin(a)*.32;mk(Cyl(.035,.035,.32,6),DIAC[i%7],{p:[cx,1.18,cz],ol:.01,cs:false,to:g});
    const f=mk(Sph(.065,8,6),M('#FFB53C',{emissive:'#FF8A00'}),{p:[cx,1.42,cz],s:[1,1.7,1],ol:0,cs:false,to:g});F.push(f)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,off=e<2.4;for(let i=0;i<F.length;i++){const f=F[i];f.visible=!off||e<.08*i;f.scale.set(1,1.7+Math.sin(T*12+i*2)*.25,1)}});return g}
// mariquita que pasea en círculo por el suelo; al tocarla abre las alas y da un saltito volando
function lady3(w,cx,cz,s){const g=grp(w.sc,[cx,0,cz],s);g.userData.lady=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),FHIT));
  const b=grp(g,[0,0,0]);mk(Sph(.12,10,8),K,{p:[0,.14,.3],ol:0,cs:false,to:b});const W=[];
  for(const sd of[-1,1]){const pv=grp(b,[0,.2,.05]);mk(new THREE.SphereGeometry(.3,14,10,sd<0?PI:0,PI,0,PI/2),'#E8402C',{s:[1,.8,1.2],to:pv,ol:.02});
    for(const [dx,dz] of[[.13,.1],[.16,-.14]])mk(Sph(.05,8,6),K,{p:[sd*dx,.2,dz],s:[1,.4,1],ol:0,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.1,1),fl=e<1.1;const a=T*.35;
    b.position.set(Math.cos(a)*.9,fl?Math.sin(q*PI)*1.3:0,Math.sin(a)*.9);b.rotation.y=-a;for(const [pv,sd] of W)pv.rotation.z=fl?sd*(.9+Math.sin(T*40)*.3):0});return g}
// pajarito que picotea el suelo dando saltitos; al tocarlo echa a volar, da una vuelta y vuelve piando
function bird3(w,cx,cz,s,c){const g=grp(w.sc,[cx,0,cz],s);g.userData.bird=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),FHIT));
  const b=grp(g,[0,0,0]);mk(Sph(.3,14,10),c,{p:[0,.35,0],s:[1,.9,1.25],to:b,ol:.03});mk(Sph(.2,12,8),'#FFF1D6',{p:[0,.3,.12],s:[1,.8,1],ol:0,cs:false,to:b});
  const hd=grp(b,[0,.62,.2]);mk(Sph(.19,12,10),c,{to:hd,ol:.03});mk(Cone(.06,.16,6),'#FFA94D',{p:[0,-.02,.22],r:[PI/2,0,0],ol:0,cs:false,to:hd});
  const BE=[],nt=skyNow().night;for(const sd of[-1,1])BE.push(mk(Sph(.035,6,5),K,{p:[sd*.11,.05,.13],ol:0,cs:false,to:hd}));const zz=nt?zzz3(w,g,1):null;mk(Box(.18,.04,.3),c,{p:[0,.42,-.38],r:[-.5,0,0],ol:.02,cs:false,to:b});
  const W=[];for(const sd of[-1,1]){const pv=grp(b,[sd*.25,.42,0]);mk(Box(.32,.04,.26),c,{p:[sd*.16,0,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,fl=e<1.6,q=Math.min(e/1.6,1);
    if(fl){const a=q*PI*2;b.position.set(Math.sin(a)*1.4,Math.sin(q*PI)*2.4,(1-Math.cos(a))*.7);b.rotation.y=a+PI/2;hd.rotation.x=0;for(const [pv,sd] of W)pv.rotation.z=sd*Math.sin(T*35)*.7}
    else if(nt){b.position.set(0,0,0);b.rotation.y=.5;hd.rotation.x=.45;b.scale.set(1,1+Math.sin(T*2)*.03,1);for(const [pv] of W)pv.rotation.z=0}// de noche duerme
    else{const c2=T%3.2,hop=c2>2.6?Math.sin((c2-2.6)/.6*PI):0;b.position.set(Math.sin(T*.4)*.6,hop*.25,0);b.rotation.y=Math.sin(T*.4)>0?.9:-.9;
      hd.rotation.x=c2<1.2?Math.max(0,Math.sin(c2*PI*2.5))*.7:0;for(const [pv] of W)pv.rotation.z=0}
    for(const m of BE)m.scale.y=nt&&!fl?.15:1;if(zz)zz.forEach(q=>q.visible=!fl)});return g}
// pingüino que pasea de un lado a otro balanceándose; al tocarlo da un saltito aleteando y chilla
function peng3(w,x0,x1,z,s){const g=grp(w.sc,[x0,0,z],s);g.userData.peng=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),FHIT));
  const b=grp(g,[0,0,0]);mk(Sph(.42,16,12),'#2F3446',{p:[0,.55,0],s:[1,1.35,.95],to:b,ol:.03});mk(Sph(.33,14,10),'#FFFFFF',{p:[0,.5,.14],s:[1,1.3,.8],ol:0,cs:false,to:b});
  mk(Sph(.28,14,10),'#2F3446',{p:[0,1.18,0],to:b,ol:.03});const PE=[],nt=skyNow().night;for(const sd of[-1,1]){PE.push(mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.11,1.22,.22],ol:.01,cs:false,to:b}),mk(Sph(.035,6,5),K,{p:[sd*.11,1.22,.28],ol:0,cs:false,to:b}));
    mk(Sph(.12,8,6),'#FFA94D',{p:[sd*.15,.04,.12],s:[1,.35,1.5],ol:.01,cs:false,to:b})}
  mk(Cone(.07,.18,6),'#FFA94D',{p:[0,1.14,.3],r:[PI/2,0,0],ol:0,cs:false,to:b});const W=[];
  for(const sd of[-1,1]){const pv=grp(b,[sd*.38,.85,0]);mk(Box(.08,.5,.22),'#2F3446',{p:[0,-.22,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  const zz=nt?zzz3(w,g,1.6):null;let ph=0;w.upd.push(dt=>{const k=g.userData.wob,e=k==null?9:T-k,j=e<.9,q=Math.min(e/.9,1);if(!nt)ph+=dt*.25;const c=Math.cos(ph);g.position.x=x0+(x1-x0)*(.5-.5*c);
    for(const m of PE)m.scale.y=nt&&!j?.15:1;if(zz)zz.forEach(z=>z.visible=!j);// de noche duerme de pie, sin pasear
    b.rotation.y=j||nt?0:Math.sin(ph)>0?PI/2:-PI/2;b.rotation.z=j||nt?0:Math.sin(T*6)*.12;b.position.y=j?Math.sin(q*PI)*.7:0;for(const [pv,sd] of W)pv.rotation.z=sd*(j?.6+Math.sin(T*30)*.5:.15)});return g}
// ardilla con una bellota: mueve la cola; al tocarla salta y da una vuelta
function squir3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.squir=1;hitS(g,.65,.6);const C='#C9772E';
  const b=grp(g,[0,0,0]);mk(Sph(.32,14,10),C,{p:[0,.42,0],s:[1,1.25,.95],to:b,ol:.03});mk(Sph(.2,12,8),'#F2D6A8',{p:[0,.4,.16],s:[1,1.2,.7],ol:0,cs:false,to:b});
  mk(Sph(.24,14,10),C,{p:[0,.9,.06],to:b,ol:.03});const SE=[],nt=skyNow().night;for(const sd of[-1,1]){mk(Cone(.08,.18,6),C,{p:[sd*.13,1.13,.02],ol:.01,cs:false,to:b});SE.push(mk(Sph(.045,6,5),K,{p:[sd*.1,.95,.25],ol:0,cs:false,to:b}))}
  mk(Sph(.04,6,5),K,{p:[0,.88,.3],ol:0,cs:false,to:b});
  const ac=grp(b,[0,.62,.28]);mk(Sph(.1,10,8),'#A0662E',{s:[1,1.15,1],ol:.01,cs:false,to:ac});mk(Sph(.11,10,6,0,PI*2,0,PI/2),'#6B4423',{p:[0,.05,0],ol:0,cs:false,to:ac});
  const tl=grp(b,[0,.3,-.28]);mk(Sph(.26,12,10),C,{p:[0,.4,-.12],s:[.8,1.5,.7],to:tl,ol:.03});
  const zz=nt?zzz3(w,g,1.3):null;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,j=e<.8,q=Math.min(e/.8,1);tl.rotation.x=nt&&!j?.25:Math.sin(T*3)*.18;
    b.position.y=j?Math.sin(q*PI)*.9:0;b.rotation.y=j?q*PI*2:0;b.rotation.x=j?0:nt?.15:Math.max(0,Math.sin(T*1.3))*.12;for(const m of SE)m.scale.y=nt&&!j?.15:1;if(zz)zz.forEach(z=>z.visible=!j)});return g}// de noche duerme con la cola quieta
// madriguera con un conejito que se asoma de vez en cuando; al tocarlo salta fuera y vuelve a meterse
function burrow3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.burrow=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),FHIT));
  mk(new THREE.TorusGeometry(.5,.16,8,20),'#B88A5A',{p:[0,.04,0],r:[PI/2,0,0],s:[1,1,.6],to:g,ol:.02});mk(Cyl(.48,.48,.02,20),'#4A3324',{p:[0,.03,0],ol:0,cs:false,to:g});
  const r=grp(g,[0,0,0]),W='#FFFFFF';mk(Sph(.3,14,10),W,{p:[0,.3,0],s:[1,1.1,.95],to:r,ol:.03});
  for(const sd of[-1,1]){const e=grp(r,[sd*.12,.52,-.02]);mk(Sph(.08,8,6),W,{p:[0,.24,0],s:[1,3.2,.6],to:e,ol:.02});mk(Sph(.045,6,5),'#FFB3C7',{p:[0,.24,.03],s:[1,2.6,.4],ol:0,cs:false,to:e});e.rotation.z=-sd*.15;
    mk(Sph(.045,6,5),K,{p:[sd*.11,.36,.25],ol:0,cs:false,to:r})}
  mk(Sph(.04,6,5),'#FF8FB1',{p:[0,.29,.29],ol:0,cs:false,to:r});const nt=skyNow().night,zz=nt?zzz3(w,g,.3):null;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let y;if(zz)zz.forEach(z=>z.visible=e>=1.1);
    if(e<1.1){const q=e/1.1;y=-.1+Math.sin(q*PI)*1.3;r.rotation.y=q*PI*2}else if(nt){y=-.8;r.rotation.y=0}// de noche duerme dentro: solo salen las z
    else{const c=T%5.5,o=c<.4?c/.4:c<3.2?1:c<3.6?1-(c-3.2)/.4:0;y=-.75+o*.6;r.rotation.y=c<3.2?Math.sin(T*1.5)*.4:0}
    r.position.y=y;r.visible=y>-.7});return g}
// torre del reloj (como el Big Ben): al tocarla suenan las campanas ding-dong y las agujas dan una vuelta
function clock3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.clock=1;const C='#D9B77A',D2='#8A6A3C';
  mk(Box(1.1,3.2,1.1),C,{p:[0,1.6,0],to:g,ol:.04});for(let i=0;i<4;i++)mk(Box(1.16,.08,1.16),D2,{p:[0,.6+i*.7,0],ol:0,cs:false,to:g});
  mk(Box(1.3,1.3,1.3),C,{p:[0,3.85,0],to:g,ol:.04});mk(Cone(.95,1.5,4),'#3E5A4A',{p:[0,5.25,0],r:[0,PI/4,0],to:g,ol:.04});mk(Sph(.1,8,6),'#FFC93C',{p:[0,6.05,0],ol:0,cs:false,to:g});
  mk(Cyl(.5,.5,.04,24),skyNow().night?M('#FFF8E6',{emissive:'#E0B040'}):'#FFF8E6',{p:[0,3.85,.66],r:[PI/2,0,0],to:g,ol:.025});/* de noche la esfera del reloj se ilumina */const H=[];
  for(const [l,wd] of[[.38,.06],[.26,.08]]){const hd=grp(g,[0,3.85,.7]);mk(Box(wd,l,.02),K,{p:[0,l/2,0],ol:0,cs:false,to:hd});H.push(hd)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.5,1);H[0].rotation.z=-(e<1.5?q*PI*2:0)-T*.05;H[1].rotation.z=-(e<1.5?q*PI/2:0)-.9-T*.004});return g}
// iglú con una foca que se asoma por la puerta; al tocarlo la foca sale, aplaude y vuelve a entrar
function igloo3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.igloo=1;g.userData.dur=2.1;
  mk(new THREE.SphereGeometry(1.2,20,12,0,PI*2,0,PI/2),'#F4FAFF',{to:g,ol:.04});
  for(let i=1;i<4;i++)mk(new THREE.TorusGeometry(1.2*Math.cos(i*.38),.02,4,32),'#BFD6E8',{p:[0,1.2*Math.sin(i*.38),0],r:[PI/2,0,0],ol:0,cs:false,to:g});
  mk(new THREE.CylinderGeometry(.5,.5,.8,16,1,true,-PI/2,PI),'#F4FAFF',{p:[0,.4,1.05],r:[PI/2,0,0],s:[1,1,1],to:g,ol:.03});mk(new THREE.CircleGeometry(.42,16,0,PI),skyNow().night?M('#FFC96B',{emissive:'#E08A20'}):'#3A4A66',{p:[0,.02,1.46],ol:0,cs:false,to:g});
  const sl=grp(g,[0,0,1.1]),C='#8C9AAE';mk(Sph(.3,14,10),C,{p:[0,.28,0],s:[1,.9,1.3],to:sl,ol:.03});mk(Sph(.22,12,10),C,{p:[0,.55,.25],to:sl,ol:.03});
  for(const sd of[-1,1]){mk(Sph(.045,6,5),K,{p:[sd*.09,.62,.44],ol:0,cs:false,to:sl});const f=grp(sl,[sd*.27,.3,.15]);mk(Box(.08,.26,.14),C,{p:[0,0,.06],ol:.01,cs:false,to:f});sl.userData['f'+sd]=f}
  mk(Sph(.05,6,5),K,{p:[0,.55,.47],ol:0,cs:false,to:sl});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){const q=Math.min(e/.4,1),o=e<1.6?q:1-(e-1.6)/.4;sl.position.z=1.1+o*.9;sl.position.y=0;
      const c=e>.4&&e<1.6?Math.abs(Math.sin((e-.4)*PI*5)):0;sl.userData.f1.rotation.z=.2+c*.9;sl.userData['f-1'].rotation.z=-.2-c*.9}
    else{const c=T%6,o=c<.5?c/.5:c<2.5?1:c<3?1-(c-2.5)/.5:0;sl.position.z=1.1+o*.35;sl.userData.f1.rotation.z=.2;sl.userData['f-1'].rotation.z=-.2}
    sl.visible=sl.position.z>1.15});return g}
// tambor de fiesta: al tocarlo se aplasta y suena un redoble
function drum3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.drum=1;
  mk(Cyl(.7,.7,.9,20),'#E8503C',{p:[0,.45,0],to:g,ol:.04});for(const y of[.06,.84])mk(Cyl(.73,.73,.1,20),'#FFC93C',{p:[0,y,0],ol:.02,cs:false,to:g});
  mk(Cyl(.66,.66,.02,20),'#FFF8E6',{p:[0,.91,0],ol:0,cs:false,to:g});for(let i=0;i<8;i++){const a=i/8*PI*2;mk(Cyl(.02,.02,.7,4),'#FFFFFF',{p:[Math.cos(a)*.71,.45,Math.sin(a)*.71],r:[0,0,i%2?.5:-.5],ol:0,cs:false,to:g})}
  for(const sd of[-1,1]){const st=grp(g,[sd*.35,1.05,.2]);mk(Cyl(.03,.03,.8,6),'#C9A57A',{p:[0,.3,0],r:[0,0,-sd*.5],ol:.01,cs:false,to:st});mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.19,.64,0],ol:.01,cs:false,to:st})}
  return g}
// buzón rojo inglés: al tocarlo sale volando una carta que da una vuelta y vuelve a entrar
function post3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.post=1;const R='#D9372C';
  mk(Cyl(.42,.46,1.5,18),R,{p:[0,.75,0],to:g,ol:.04});mk(new THREE.SphereGeometry(.44,18,8,0,PI*2,0,PI/2),R,{p:[0,1.5,0],to:g,ol:.035});
  mk(Cyl(.5,.5,.12,18),'#2F2A28',{p:[0,.06,0],ol:.02,cs:false,to:g});mk(Box(.42,.07,.04),'#2F2A28',{p:[0,1.25,.43],ol:0,cs:false,to:g});
  mk(Box(.3,.2,.02),'#FFF3B0',{p:[0,.9,.44],ol:0,cs:false,to:g});
  const lt=grp(g,[0,1.25,.45]),lm=mk(Box(.62,.4,.02),'#FFFFFF',{ol:.015,cs:false,to:lt});mk(Box(.12,.12,.025),'#E8503C',{p:[.2,.1,0],ol:0,cs:false,to:lt});lt.visible=false;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.6){const q=e/1.6,a=q*PI*2;lt.visible=true;lt.position.set(Math.sin(a)*1.2,1.25+Math.sin(q*PI)*1.6,.45+(1-Math.cos(a))*.5);lt.rotation.set(-.3,0,Math.sin(T*10)*.3)}else lt.visible=false});return g}
// fila de hormigas que dan vueltas; al tocarlas se dispersan corriendo y vuelven a la fila
function ants3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.ants=1;const hit=new THREE.Mesh(gcache('ahit',()=>Cyl(1.6,1.6,.6,10)),FHIT);hit.position.y=.3;g.add(hit);
  mk(Sph(.5,12,8),'#B07A4A',{p:[0,0,0],s:[1,.5,1],to:g,ol:.02});mk(Cyl(.08,.08,.04,8),'#4A3324',{p:[0,.25,0],ol:0,cs:false,to:g});
  const A=[],n=9,nt=skyNow().night,zz=nt?zzz3(w,g,.5):null;for(let i=0;i<n;i++){const a=grp(g,[0,0,0]);for(const z2 of[-.09,0,.09])mk(Sph(.055,6,5),'#2F2420',{p:[0,.06,z2],ol:0,cs:false,to:a});A.push(a)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,sc=e<1.6?Math.sin(Math.min(e/1.6,1)*PI)*1.2:0,ins=nt&&e>=1.6;if(zz)zz.forEach(z=>z.visible=ins);
    for(let i=0;i<n;i++){A[i].visible=!ins;// de noche están dentro del hormiguero
      const a=i/n*PI*2-T*.35,r=1.15+sc*(.6+.4*Math.sin(i*2.3)),ox=Math.cos(a)*r,oz=Math.sin(a)*r*.7;A[i].position.set(ox,0,oz);A[i].rotation.y=-a+(sc>.05?Math.sin(T*20+i)*.8:0)}});return g}
// faro de la orilla: la luz gira; al tocarlo suena la sirena y la luz parpadea
function lighthouse3(w,x,z,s){const g=grp(w.sc,[x,0,z],s),nt=skyNow().night;g.userData.light=1;g.userData.dur=1.9;
  for(let i=0;i<4;i++)mk(Cyl(.5-i*.06,.56-i*.06,.7,16),i%2?'#E8503C':'#FFFFFF',{p:[0,.35+i*.7,0],to:g,ol:.035});
  mk(Cyl(.42,.42,.1,16),'#3A3A3A',{p:[0,2.85,0],ol:.02,cs:false,to:g});const lm=mk(Cyl(.26,.26,.4,12),M('#FFF3B0',{emissive:'#FFC93C'}),{p:[0,3.1,0],ol:.02,cs:false,to:g});
  mk(Cone(.38,.4,12),'#E8503C',{p:[0,3.5,0],to:g,ol:.03});const bm=grp(g,[0,3.1,0]);
  const beam=new THREE.Mesh(new THREE.ConeGeometry(nt?.8:.5,nt?5:3,10,1,true).rotateZ(PI/2).translate(nt?2.6:1.6,0,0),new THREE.MeshBasicMaterial({color:'#FFF6C0',transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));beam.raycast=()=>{};bm.add(beam);
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,f=e<1.8;bm.rotation.y=T*(f?3:.8);beam.material.opacity=f?(Math.sin(e*18)>0?.6:.15):nt?.55:.3;lm.scale.setScalar(f?1+Math.max(0,Math.sin(e*18))*.25:1)});return g}
// guirnalda de bombillas de colores que parpadean al fondo de la zona de fiestas (de noche brillan más)
function garland3(w,z,h){const n=26,pos=new Float32Array(n*3),col=new Float32Array(n*3),wp=[];
  for(let i=0;i<n;i++){const q=i/(n-1),x=-16+q*32,y=h-Math.sin((q*3%1)*PI)*.7;pos.set([x,y,z],i*3);const c=new THREE.Color(DIAC[i%7]);col.set([c.r,c.g,c.b],i*3);wp.push(new THREE.Vector3(x,y+.12,z))}
  const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints(wp),new THREE.LineBasicMaterial({color:'#5A4636'}));wire.raycast=()=>{};w.sc.add(wire);
  for(const x of[-16,-5.33,5.33,16]){mk(Cyl(.06,.06,h+.2,6),'#B07A4A',{p:[x,(h+.2)/2,z],ol:.015,cs:false,to:w.sc})}
  const night=skyNow().night,mk2=(odd)=>{const gg=new THREE.BufferGeometry(),P=[],C=[];for(let i=odd;i<n;i+=2){P.push(pos[i*3],pos[i*3+1],pos[i*3+2]);C.push(col[i*3],col[i*3+1],col[i*3+2])}
    gg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const pt=new THREE.Points(gg,new THREE.PointsMaterial({size:night?1.6:1,vertexColors:true,map:night?softTex():canvasTex(32,32,()=>{ctx.beginPath();ctx.arc(16,16,11,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=K;ctx.stroke()},'bulb'),transparent:true,depthWrite:false,blending:night?THREE.AdditiveBlending:THREE.NormalBlending}));pt.raycast=()=>{};w.sc.add(pt);return pt};
  const A=mk2(0),B=mk2(1);w.upd.push(()=>{const k=(Math.sin(T*2.2)+1)/2;A.material.opacity=.45+.55*k;B.material.opacity=1-.55*k})}
// ballena en el mar (se ve en pantallas anchas): asoma y echa un chorro de agua; al tocarla, chorro grande y coletazo
function whale3(w,x,z,s){const g=grp(w.sc,[x,-1.1,z],s);g.userData.whale=1;g.userData.dur=2.2;g.add(new THREE.Mesh(gcache('whit',()=>Sph(2.2,6,4)),FHIT));const C='#5B7FB8';
  const b=grp(g,[0,0,0]);mk(Sph(1.2,18,12),C,{s:[1.6,.75,1],to:b,ol:.05});mk(Sph(.9,14,10),'#DCE8F5',{p:[.2,-.25,0],s:[1.5,.5,.9],ol:0,cs:false,to:b});
  for(const sd of[-1,1]){mk(Sph(.1,8,6),K,{p:[1.25,.25,sd*.62],ol:0,cs:false,to:b})}
  const tl=grp(b,[-1.8,.1,0]);mk(Box(.6,.12,1.3),C,{p:[-.3,.3,0],r:[0,0,.5],to:tl,ol:.03});
  const n=24,pos=new Float32Array(n*3),sp=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(pos,3)),new THREE.PointsMaterial({color:'#EAF6FF',size:.9,map:softTex(),transparent:true,depthWrite:false}));sp.raycast=()=>{};g.add(sp);
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,big=e<2.2,c=T%8,up=big?1:c<5?Math.min(1,c/.8,(5-c)/.8):0;
    b.position.y=-1.2+up*1.05;tl.rotation.z=big?Math.sin(e*8)*.6:Math.sin(T*1.5)*.2;
    const st=big?e:c-1,on=up>.6&&st>0&&st<1.6,hh=big?4:2.2;sp.visible=on;if(on){for(let i=0;i<n;i++){const q=((st*1.2+i/n)%1),a=i*2.4;pos[i*3]=.6+Math.cos(a)*q*.8;pos[i*3+1]=.6+Math.sin(q*PI)*hh*(1-q*.3);pos[i*3+2]=Math.sin(a)*q*.8}sp.geometry.attributes.position.needsUpdate=true}});return g}
// delfín que salta en arco de vez en cuando (pantallas anchas); al tocarlo da un salto con voltereta
function dolph3(w,x,z,s){const g=grp(w.sc,[x,-1.1,z],s);g.rotation.y=PI/2;g.userData.dolph=1;g.userData.dur=1.4;g.add(new THREE.Mesh(gcache('whit',()=>Sph(2.2,6,4)),FHIT));const C='#7FA8D8';
  const b=grp(g,[0,0,0]);mk(Sph(.5,14,10),C,{s:[2,.7,.7],to:b,ol:.04});mk(Cone(.18,.5,8),C,{p:[1.15,-.05,0],r:[0,0,-PI/2],ol:.02,cs:false,to:b});
  mk(Cone(.22,.45,6),C,{p:[0,.45,0],r:[0,0,-.4],s:[1,1,.3],ol:.02,cs:false,to:b});mk(Box(.2,.08,.8),C,{p:[-1.05,0,0],ol:.02,cs:false,to:b});mk(Sph(.06,6,5),K,{p:[.75,.12,.3],ol:0,cs:false,to:b});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let q,fl=0;if(e<1.4){q=e/1.4;fl=1}else{const c=T%7;q=c<1.2?c/1.2:-1}
    if(q<0){b.visible=false;return}b.visible=true;b.position.set((q-.5)*5,-1+Math.sin(q*PI)*(fl?4:2.6),0);b.rotation.z=(.5-q)*2.2-(fl?q*PI*2:0)});return g}
// "Zzz" que suben y se desvanecen sobre un animalito dormido (de noche)
function zzz3(w,to,y){const Z=[];for(let i=0;i<2;i++){const q=spr(canvasTex(64,64,()=>text('z',32,52,56,'#FFFFFF',{f:LF,st:8,sc:'#5F6FB4'}),'zzz'),.5,.5,{p:[.2,y,0],to});q.raycast=()=>{};Z.push(q)}
  w.upd.push(()=>{Z.forEach((q,i)=>{const k=(T*.35+i*.5)%1;q.position.set(.2+k*.5,y+k*1.1,0);q.scale.setScalar(.3+k*.4);q.material.opacity=k<.15?k/.15:1-(k-.15)/.85})});return Z}
// según el mes del año, en el mapa caen hojas (otoño), nieve (invierno) o pétalos (primavera); en verano, nada
function seasonFx(w){const m=new Date().getMonth(),O={sp:.6,sw:1.2,h:12,wx:42,wz:24},
    leaf=()=>canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf');
  if(m===9||m===10)fallPts(w,45,['#F28C38','#E8603C','#F2C14E','#C9772E'],{...O,size:1.8,map:leaf()});
  else if(m===11||m<=1)fallPts(w,70,['#FFFFFF','#F4FAFF'],{...O,size:1.1,sp:.9,sw:.5,map:canvasTex(64,64,()=>{ctx.beginPath();ctx.arc(32,32,20,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#9DBFE3';ctx.stroke()},'snow')});
  else if(m>=2&&m<=4)fallPts(w,35,['#FFB3C7','#FFD1DC','#FFFFFF'],{...O,size:1,sp:.45,map:leaf()})}
// Navidad (del 1 de diciembre al 6 de enero): árbol con bolas y luces junto a la casa de Tito; al tocarlo la estrella gira y suenan cascabeles
const xmasNow=()=>{const d=new Date(),m=d.getMonth();return m===11||(m===0&&d.getDate()<=6)};
function xtree3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.xtree=1;g.userData.dur=1.6;mk(Cyl(.18,.22,.6,8),'#8A5A3A',{p:[0,.3,0],to:g,ol:.03});
  [[1.4,1.6,1.2],[1.1,1.4,2.1],[.75,1.2,2.9]].forEach(([r,h,y])=>mk(Cone(r,h,14),'#3E9A55',{p:[0,y,0],to:g,ol:.04}));
  for(let i=0;i<12;i++){const y=.9+(i%4)*.55+Math.floor(i/4)*.1,a=i*2.1,r=1.25-(y-.8)*.38;mk(Sph(.1,8,6),DIAC[i%7],{p:[Math.cos(a)*r,y,Math.sin(a)*r],ol:.01,cs:false,to:g})}
  const st=mk(starGeo(.35,.12),M('#FFC93C',{emissive:'#C98A00'}),{p:[0,3.75,0],to:g,ol:.03});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;st.rotation.y=e<1.6?Math.min(e/1.6,1)*PI*4:Math.sin(T*1.2)*.4;st.scale.setScalar(e<1.6?1+Math.sin(e/1.6*PI)*.4:1)});return g}
// Halloween (del 15 de octubre al 2 de noviembre): calabaza sonriente junto a la casa de Tito; al tocarla bota y salta la tapa; de noche la cara brilla como una vela
const hallowNow=()=>{const d=new Date(),m=d.getMonth(),n=d.getDate();return (m===9&&n>=15)||(m===10&&n<=2)};
function pump3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.pump=1;g.userData.dur=1.5;const b=grp(g,[0,0,0]),nt=skyNow().night;
  for(let i=0;i<6;i++){const a=i/6*PI;mk(Sph(.62,16,12),'#F28A1E',{p:[Math.cos(a)*.16,.55,Math.sin(a)*.16],s:[.8,.85,1],r:[0,a,0],to:b,ol:.03})}
  const lid=grp(b,[0,1.02,0]);mk(Cyl(.07,.1,.32,8),'#5E8A3A',{p:[0,.12,0],r:[0,0,.2],to:lid,ol:.02});mk(Sph(.12,8,6),'#6CC24A',{p:[.16,.06,0],s:[1.4,.4,1],to:lid,ol:.01,cs:false});
  const fm=nt?new THREE.MeshBasicMaterial({color:'#FFC24A'}):M('#3A2414');
  const fc=grp(b,[0,.6,0]);fc.rotation.x=-.5;for(const sd of[-1,1])mk(new THREE.CircleGeometry(.14,3),fm,{p:[sd*.22,.16,.72],r:[0,0,PI/2],to:fc,ol:0,cs:false});
  mk(new THREE.CircleGeometry(.1,3),fm,{p:[0,0,.75],r:[0,0,-PI/2],to:fc,ol:0,cs:false});mk(new THREE.CircleGeometry(.3,16,PI,PI),fm,{p:[0,-.08,.72],s:[1,.55,1],to:fc,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(nt)fm.color.setHSL(.11,1,.6+Math.sin(T*9)*.04+Math.sin(T*23)*.03);
    if(e<1.5){const h=Math.abs(Math.sin(e/1.5*PI*3))*(1-e/1.5)*.7;b.position.y=h;b.scale.set(1+(h<.05?.15:0),1-(h<.05?.15:0),1);lid.position.y=1.02+Math.sin(Math.min(e/.8,1)*PI)*.6;lid.rotation.z=Math.sin(Math.min(e/.8,1)*PI)*.8}
    else{b.position.y=0;b.scale.set(1,1,1);lid.position.y=1.02;lid.rotation.z=0}});return g}
// Bosque: montón de hojas secas; al tocarlo las hojas saltan por el aire y vuelven a caer en su sitio
function leafs3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.leafs=1;g.userData.dur=1.9;mk(Sph(.9,14,8,0,PI*2,0,PI/2),'#C9772E',{s:[1.3,.45,1],to:g,ol:.03});
  const LC=['#F28C38','#E8603C','#F2C14E','#C9772E','#D9502E'],L=[];for(let i=0;i<16;i++){const a=i*2.4,r=.25+(i%4)*.25,y=.42-r*.28,l=mk(Sph(.2,6,4),LC[i%5],{p:[Math.cos(a)*r*1.3,y,Math.sin(a)*r],s:[1.3,.25,.8],r:[0,a,.3],ol:.01,cs:false,to:g});
    l.userData.b=[l.position.x,y,l.position.z,Math.cos(a)*(1+i%3*.4),2.6+(i%5)*.5,Math.sin(a)*(1+i%3*.4)];L.push(l)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;for(const l of L){const b=l.userData.b;if(e<1.9){const q=e/1.9,h=Math.sin(q*PI)*b[4];l.position.set(b[0]+b[3]*Math.sin(q*PI)*.8,b[1]+h,b[2]+b[5]*Math.sin(q*PI)*.8);l.rotation.z=.3+Math.sin(e*7+b[3])*.8}else if(l.position.y!==b[1]){l.position.set(b[0],b[1],b[2]);l.rotation.z=.3}}});return g}
// Jardín (de día): una cometa de colores ondea en el cielo; al tocarla da una vuelta en el aire
function kite3(w,x,y,z,s){const g=grp(w.sc,[x,y,z],s);g.userData.kite=1;hitS(g,1.1,-.4,1,1.5);g.userData.dur=1.4;const k=grp(g,[0,0,0]);
  [['#FF6B6B',0],['#FFC93C',1],['#5BB8F5',2],['#6CC24A',3]].forEach(([c,i])=>{const P=[[0,1],[-1,0],[0,-1],[1,0]],A=P[i],B=P[(i+1)%4],gq=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(B[0]*.6,B[1]*.95,0),new THREE.Vector3(A[0]*.6,A[1]*.95,0)]);gq.computeVertexNormals();mk(gq,M(c,{side:THREE.DoubleSide}),{ol:0,cs:false,to:k})});mk(Cyl(.02,.02,1.9,4),'#8A5A3A',{p:[0,0,.01],ol:0,cs:false,to:k});mk(Cyl(.02,.02,1.2,4),'#8A5A3A',{p:[0,0,.01],r:[0,0,PI/2],ol:0,cs:false,to:k});
  const tl=[];for(let i=0;i<5;i++)tl.push(mk(Box(.22,.12,.02),DIAC[i%7],{p:[0,-1.1-i*.38,0],r:[0,0,.6],ol:0,cs:false,to:k}));
  mk(Cyl(.012,.012,9,3),'#FFFFFF',{p:[1.6,-4.4,.5],r:[.1,0,.36],ol:0,cs:false,rs:false,to:g});
  w.upd.push(()=>{const q=g.userData.wob,e=q==null?9:T-q;g.position.x=x+Math.sin(T*.5)*.6;g.position.y=y+Math.sin(T*.8)*.3;
    k.rotation.z=(e<1.4?Math.min(e/1.4,1)*PI*2:0)+Math.sin(T*1.1)*.15;tl.forEach((t,i)=>t.position.x=Math.sin(T*3-i*.8)*.12*(i+1));
    if(e<1.4)g.position.y+=Math.sin(e/1.4*PI)*.5});return g}
// Mapa (de día): un globo aerostático de rayas flota sobre el mar; al tocarlo se enciende la llama y sube un poco
function hab3(w,x,y,z,s){const g=grp(w.sc,[x,y,z],s);g.userData.hab=1;g.userData.dur=2.2;const nt=skyNow().night;/* de noche la llama queda encendida y el globo brilla */
  ['#FF6B6B','#FFC93C','#5BB8F5','#FF6B6B','#FFC93C','#5BB8F5'].forEach((c,i)=>mk(new THREE.SphereGeometry(1.2,6,14,i*PI/3,PI/3),nt?M(c,{emissive:'#'+new THREE.Color(c).multiplyScalar(.4).getHexString()}):c,{p:[0,1.6,0],s:[1,1.15,1],ol:.03,to:g}));
  mk(Cyl(.45,.25,.5,12),'#FF6B6B',{p:[0,.35,0],ol:.02,cs:false,to:g});mk(Box(.55,.4,.55),'#B07A4A',{p:[0,-.7,0],ol:.03,to:g});
  for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])mk(Cyl(.015,.015,.75,3),'#6B4423',{p:[a*.22,-.15,b*.22],ol:0,cs:false,to:g});
  const fl=mk(Cone(.12,.35,8),M('#FFB020',{emissive:'#FF7A00'}),{p:[0,.05,0],ol:0,cs:false,to:g});fl.visible=false;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;g.position.x=x+Math.sin(T*.13)*.8;g.position.y=y+Math.sin(T*.6)*.2+(e<2.2?Math.sin(e/2.2*PI)*1.2:0);fl.visible=nt||e<1.2;if(fl.visible)fl.scale.setScalar((e<1.2?1:.6)*(1+Math.sin(T*30)*.25))});return g}
// Inglés: una tetera para la hora del té; al tocarla tiembla, silba y echa vapor por el pitorro
function tea3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.tea=1;g.userData.dur=1.8;const b=grp(g,[0,0,0]),C='#5BB8F5';
  mk(Sph(.5,16,12),C,{p:[0,.45,0],s:[1,.85,1],to:b,ol:.03});mk(Sph(.3,14,8,0,PI*2,0,PI/2),'#FFFFFF',{p:[0,.8,0],s:[1,.5,1],to:b,ol:.02});mk(Sph(.08,8,6),'#FFC93C',{p:[0,.97,0],to:b,ol:.01,cs:false});
  mk(Cyl(.06,.1,.5,8),C,{p:[.55,.6,0],r:[0,0,-.9],to:b,ol:.02});mk(new THREE.TorusGeometry(.2,.05,6,12),C,{p:[-.5,.5,0],to:b,ol:.02});
  for(let i=0;i<6;i++){const a=i/6*PI*2;mk(Sph(.06,6,5),'#FFFFFF',{p:[Math.cos(a)*.47,.45,Math.sin(a)*.47],ol:0,cs:false,to:b})}
  const cp=grp(g,[.95,0,.45]);mk(Cyl(.17,.13,.26,12),'#FFFFFF',{p:[0,.13,0],to:cp,ol:.02});mk(Cyl(.3,.3,.03,14),'#FFFFFF',{p:[0,.01,0],to:cp,ol:.02,cs:false});mk(new THREE.TorusGeometry(.08,.025,5,10),'#FFFFFF',{p:[.19,.15,0],to:cp,ol:.01,cs:false});
  const sm=new THREE.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:0,depthWrite:false}),ST=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(gcache('steam',()=>Sph(.14,8,6)),sm);m.raycast=()=>{};g.add(m);ST.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.rotation.z=e<1.2?Math.sin(e*40)*.05*(1-e/1.2):0;sm.opacity=e<1.8?Math.min(e*4,1)*(1-e/1.8)*.9:0;
    ST.forEach((m,i)=>{const q=((e*1.2+i*.25)%1);m.position.set(.8+q*.5,.85+q*1.1,0);m.scale.setScalar(.6+q*1.4)})});return g}
// Fiestas: caja sorpresa; al tocarla se abre la tapa y sale un payaso con muelle que rebota
function jack3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.jack=1;g.userData.dur=2.4;
  ['#FF6B6B','#5BB8F5','#FFC93C','#6CC24A'].forEach((c,i)=>mk(Box(.9,.9,.02),c,{p:[Math.sin(i*PI/2)*.45,.45,Math.cos(i*PI/2)*.45],r:[0,i*PI/2,0],to:g,ol:.02}));mk(Box(.9,.02,.9),'#C9772E',{p:[0,.01,0],to:g,ol:0,cs:false});
  const lid=grp(g,[0,.9,-.45]);mk(Box(.94,.06,.94),'#B48CE0',{p:[0,.03,.45],to:lid,ol:.02});mk(Cyl(.04,.04,.4,6),'#8A5A3A',{p:[.5,.45,0],r:[0,0,PI/2],ol:0,cs:false,to:g});mk(Sph(.07,8,6),'#FF6B6B',{p:[.72,.6,0],to:g,ol:.01,cs:false});
  const j=grp(g,[0,.3,0]),sp=[];for(let i=0;i<6;i++)sp.push(mk(new THREE.TorusGeometry(.16,.035,5,10),'#BFC6D1',{p:[0,i*.17,0],r:[PI/2,0,0],ol:0,cs:false,to:j}));
  const hd=grp(j,[0,1.1,0]);mk(Sph(.26,14,10),'#FFE0C2',{to:hd,ol:.03});mk(Sph(.07,8,6),'#FF3B3B',{p:[0,-.02,.25],to:hd,ol:0,cs:false});for(const sd of[-1,1]){mk(Sph(.035,6,5),K,{p:[sd*.09,.07,.23],ol:0,cs:false,to:hd});mk(Sph(.1,8,6),'#FF8FB1',{p:[sd*.27,.12,0],to:hd,ol:0,cs:false})}
  mk(Cone(.2,.4,10),'#FFC93C',{p:[0,.35,0],to:hd,ol:.02});mk(Sph(.06,8,6),'#FF6B6B',{p:[0,.56,0],to:hd,ol:0,cs:false});
  j.visible=false;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2.4){const o=Math.min(e/.15,1)*(e<2?1:1-(e-2)/.4);lid.rotation.x=-o*2;j.visible=e<2.3;
    const st=e<2?1+Math.sin(e*14)*Math.exp(-e*2.5)*.45:Math.max(0,1-(e-2)/.3);j.scale.y=st*o;hd.scale.set(1,1/Math.max(st*o,.2),1);hd.rotation.z=Math.sin(e*9)*.25*Math.exp(-e*1.5)}else{lid.rotation.x=0;j.visible=false}});return g}
// Jardín: una regadera; al tocarla se inclina y riega con gotitas
function can3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.can=1;g.userData.dur=1.8;const b=grp(g,[0,0,0]),C='#5BB8F5';
  mk(Cyl(.32,.36,.6,14),C,{p:[0,.3,0],to:b,ol:.03});mk(new THREE.TorusGeometry(.22,.045,6,12,PI),C,{p:[-.05,.6,0],to:b,ol:.02});mk(Cyl(.04,.07,.7,8),C,{p:[.5,.45,0],r:[0,0,-1],to:b,ol:.02});mk(Cyl(.1,.05,.1,10),'#FFC93C',{p:[.8,.66,0],r:[0,0,-1],to:b,ol:.01,cs:false});
  const dm=new THREE.MeshBasicMaterial({color:'#7FC8F8',transparent:true,opacity:0}),DR=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(gcache('drop',()=>Sph(.05,6,5)),dm);m.raycast=()=>{};g.add(m);DR.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,o=e<1.8?Math.min(e/.3,1)*Math.min((1.8-e)/.3,1):0;b.rotation.z=-o*.5;dm.opacity=o>.8?.9:0;
    DR.forEach((m,i)=>{const q=(e*2+i/6)%1;m.position.set(1+q*.35+(i%3-1)*.05,.55-q*.55,(i%3-1)*.1)})});return g}
// Montaña: un trineo rojo; al tocarlo se desliza por la nieve y vuelve
function sled3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.sled=1;g.userData.dur=2;const b=grp(g,[0,0,0]);
  mk(Box(1.4,.08,.6),'#E8503C',{p:[0,.32,0],to:b,ol:.03});for(const sd of[-1,1]){mk(Box(1.5,.05,.05),'#8A5A3A',{p:[0,.05,sd*.26],to:b,ol:.01,cs:false});mk(new THREE.TorusGeometry(.12,.025,5,10,PI),'#8A5A3A',{p:[.75,.17,sd*.26],r:[0,0,-PI/2],to:b,ol:0,cs:false});
    for(const px of[-.45,.35])mk(Cyl(.025,.025,.27,4),'#8A5A3A',{p:[px,.18,sd*.26],to:b,ol:0,cs:false})}
  mk(Box(.08,.3,.6),'#E8503C',{p:[-.68,.48,0],to:b,ol:.02});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){const q=e/2,d=Math.sin(q*PI);b.position.x=d*2.2;b.rotation.z=Math.cos(q*PI)*.08*Math.min(d*4,1)}else{b.position.x=0;b.rotation.z=0}});return g}
// Bosque: un pájaro carpintero en un tronco; de vez en cuando picotea, y al tocarlo hace toc-toc-toc muy rápido; de noche duerme
function wpk3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.wpk=1;hitS(g,.6,1.3,1,1.6);g.userData.dur=1.3;mk(Cyl(.32,.4,2.4,12),'#8A5A3A',{p:[0,1.2,0],to:g,ol:.04});mk(Cyl(.33,.33,.04,12),'#E3C08F',{p:[0,2.41,0],to:g,ol:0,cs:false});
  mk(Sph(.12,10,8),'#3A2414',{p:[.05,1.7,.33],s:[1,1.3,.3],to:g,ol:0,cs:false});const bd=grp(g,[.22,1.15,.42],1.5),nt=skyNow().night;
  mk(Sph(.18,12,10),'#2F3446',{p:[0,0,0],s:[.9,1.3,.8],to:bd,ol:.02});mk(Sph(.12,10,8),'#FFFFFF',{p:[0,-.02,.1],s:[.9,1.2,.6],to:bd,ol:0,cs:false});
  const hd=grp(bd,[0,.26,.04]);mk(Sph(.13,12,10),'#2F3446',{to:hd,ol:.02});mk(Sph(.09,10,8),'#E8503C',{p:[0,.1,-.04],s:[1,.8,1.4],to:hd,ol:0,cs:false});mk(Cone(.035,.2,6),'#FFC93C',{p:[0,-.02,.18],r:[PI/2,0,0],to:hd,ol:0,cs:false});
  for(const sd of[-1,1])mk(Sph(.03,6,5),nt?'#2F3446':'#FFFFFF',{p:[sd*.08,.03,.09],s:nt?[1,.3,1]:[1,1,1],to:hd,ol:0,cs:false});const zz=nt?zzz3(w,g,1.6):null;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.3)hd.rotation.x=Math.abs(Math.sin(e*PI*7))*.6;else if(nt)hd.rotation.x=.5;else{const c=T%4.5;hd.rotation.x=c<.6?Math.abs(Math.sin(c*PI*5))*.5:0}});return g}
// Casitas: una pelota de playa; al tocarla bota tres veces rodando y vuelve a su sitio
function ball3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.ball=1;g.userData.dur=1.8;const b=grp(g,[0,.45,0]);
  ['#FF6B6B','#FFFFFF','#5BB8F5','#FFFFFF','#FFC93C','#FFFFFF'].forEach((c,i)=>mk(new THREE.SphereGeometry(.45,5,12,i*PI/3,PI/3),c,{to:b,ol:.02}));
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.8){const q=e/1.8,ph=q*3,h=Math.abs(Math.sin(ph*PI))*(1-q)*1.6,d=Math.sin(q*PI)*1.2;b.position.set(d,.45+h,0);b.rotation.z=-d/.45;b.scale.set(1,h<.08?.85:1,1)}
    else if(b.position.x!==0){b.position.set(0,.45,0);b.rotation.z=0;b.scale.set(1,1,1)}});return g}
// Inglés: un soldado de la guardia con gorro alto; al tocarlo saluda y marca el paso
function guard3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.guard=1;g.userData.dur=2;const b=grp(g,[0,0,0]),L=[];
  for(const sd of[-1,1]){const l=grp(b,[sd*.12,.55,0]);mk(Cyl(.08,.08,.55,8),'#2F3446',{p:[0,-.27,0],to:l,ol:.02});mk(Box(.14,.08,.22),K,{p:[0,-.52,.04],to:l,ol:0,cs:false});L.push(l)}
  mk(Cyl(.24,.22,.6,12),'#E03A3A',{p:[0,.85,0],to:b,ol:.03});mk(Cyl(.25,.25,.07,12),'#FFFFFF',{p:[0,.7,0],to:b,ol:0,cs:false});for(let i=0;i<3;i++)mk(Sph(.025,6,5),'#FFC93C',{p:[0,.8+i*.12,.23],to:b,ol:0,cs:false});
  mk(Sph(.17,12,10),'#FFE0C2',{p:[0,1.3,0],to:b,ol:.02});for(const sd of[-1,1])mk(Sph(.025,6,5),K,{p:[sd*.06,1.32,.15],to:b,ol:0,cs:false});
  mk(Cyl(.19,.21,.5,12),'#1E1E28',{p:[0,1.65,0],to:b,ol:.03});mk(Sph(.19,12,8),'#1E1E28',{p:[0,1.9,0],s:[1,.6,1],to:b,ol:0,cs:false});
  const A=[];for(const sd of[-1,1]){const a=grp(b,[sd*.29,1.08,0]);mk(Cyl(.06,.06,.45,8),'#E03A3A',{p:[0,-.2,0],to:a,ol:.02});mk(Sph(.07,8,6),'#FFFFFF',{p:[0,-.45,0],to:a,ol:0,cs:false});A.push(a)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){A[1].rotation.z=e<.25?e/.25*2.6:e<1?2.6:Math.max(0,2.6-(e-1)*5);A[1].rotation.x=e<1?-.4:0;
    const m=e>.8?Math.sin((e-.8)*PI*4):0;L[0].rotation.x=Math.max(0,m)*-.9;L[1].rotation.x=Math.max(0,-m)*-.9;b.position.y=Math.abs(m)*.05}else{A[1].rotation.set(0,0,0);L[0].rotation.x=L[1].rotation.x=0;b.position.y=0}});return g}
// Fiestas: un cañón de confeti; al tocarlo da un respingo con un ¡pum! y lanza confeti de colores
function cann3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.cann=1;g.userData.dur=2;const b=grp(g,[0,0,0]);
  for(const sd of[-1,1])mk(Cyl(.28,.28,.08,14),'#FFC93C',{p:[sd*.32,.28,0],r:[0,0,PI/2],to:b,ol:.02});mk(Box(.5,.18,.5),'#8A5A3A',{p:[0,.3,0],to:b,ol:.02});
  const tb=grp(b,[0,.45,0]);tb.rotation.x=-.7;mk(Cyl(.2,.24,.9,14),'#B48CE0',{p:[0,.3,0],to:tb,ol:.03});mk(Cyl(.23,.23,.08,14),'#FF6B6B',{p:[0,.72,0],to:tb,ol:.01,cs:false});
  const P=[];for(let i=0;i<18;i++){const m=mk(Box(.2,.03,.12),DIAC[i%7],{ol:0,cs:false,to:g});m.raycast=()=>{};m.visible=false;const a=i*2.4,r=.4+(i%5)*.25;m.userData.v=[Math.cos(a)*r,3.4+(i%4)*.5,1.6+Math.sin(a)*r];P.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.position.z=e<.4?-Math.sin(e/.4*PI)*.18:0;tb.scale.y=e<.2?1-Math.sin(e/.2*PI)*.2:1;
    for(const m of P){if(e<2){const v=m.userData.v,t=Math.max(e-.05,0);m.visible=e>.05;m.position.set(v[0]*t,Math.max(.05,.9+v[1]*t-2.6*t*t),Math.min(.6+v[2]*t,.6+v[2]*1.2));m.rotation.set(t*9+v[0],t*7,t*5)}else if(m.visible)m.visible=false}});return g}
// Montaña: una cabra montés sobre una roca; mueve la cabeza y al tocarla da un salto y bala
function goat3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.goat=1;g.userData.dur=1.6;mk(Sph(.7,10,8),'#9AA3AE',{p:[0,.2,0],s:[1.2,.75,1],to:g,ol:.04});
  const b=grp(g,[0,.68,0]),C='#F1E7D6',nt=skyNow().night,zz=nt?zzz3(w,g,1.4):null;mk(Sph(.32,12,10),C,{p:[0,.42,0],s:[1.35,.9,.9],to:b,ol:.03});for(const [px,pz] of[[-.28,-.14],[-.28,.14],[.28,-.14],[.28,.14]])mk(Cyl(.05,.05,.32,6),C,{p:[px,.16,pz],to:b,ol:.01,cs:false});
  const hd=grp(b,[.42,.62,0]);mk(Sph(.17,10,8),C,{s:[1.2,1,.9],to:hd,ol:.02});for(const sd of[-1,1]){mk(new THREE.TorusGeometry(.1,.03,5,10,PI*1.2),'#8A6A4A',{p:[-.05,.14,sd*.07],r:[0,0,.6],to:hd,ol:0,cs:false});mk(Sph(.025,6,5),K,{p:[.1,.04,sd*.1],to:hd,ol:0,cs:false})}
  mk(Cone(.05,.14,6),'#FFFFFF',{p:[.12,-.18,0],r:[PI,0,0],to:hd,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;hd.rotation.z=nt&&!(e<1.6)?-.45:Math.sin(T*.9)*.15;if(e<1.6){const q=e/1.6;b.position.y=.68+Math.sin(q*PI)*1.1;b.rotation.y=q*PI*2;b.scale.y=q<.08||q>.92?.85:1}else{b.position.y=nt?.6:.68;b.rotation.y=0;b.scale.y=nt?.8:1}});return g}
// Mapa: una palmera en la playa; al tocarla se balancea y se le cae un coco que bota
function palm3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.palm=1;g.userData.dur=1.8;const t=grp(g,[0,0,0]);
  for(let i=0;i<6;i++)mk(Cyl(.17-i*.012,.2-i*.012,.5,8),i%2?'#B88A5A':'#A47548',{p:[Math.sin(i*.25)*.25*i/5,.25+i*.46,0],r:[0,0,-.12*i/5],to:t,ol:.02});
  const cr=grp(t,[.3,2.85,0]);for(let i=0;i<7;i++){const l=grp(cr,[0,0,0]);l.rotation.y=i/7*PI*2;mk(Cone(.32,1.6,4),i%2?'#4FAF5A':'#3E9A55',{p:[.75,-.12,0],r:[0,0,-PI/2-.35],s:[1,1,.25],to:l,ol:.02})}
  const C=[];for(const [a,b] of[[.18,.12],[-.14,.15],[.02,-.18]])C.push(mk(Sph(.14,10,8),'#6B4423',{p:[a,-.2,b],to:cr,ol:.02}));const cc=C[0];
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;t.rotation.z=Math.sin(T*.8)*.03+(e<1.8?Math.sin(e*8)*.12*(1-e/1.8):0);
    if(e<1.8){const f=Math.max(e-.2,0),y=-.2-Math.min(f*f*14,2.55)+(f>.43?Math.abs(Math.sin((f-.43)*9))*.5*Math.max(0,1-(f-.43)*1.4):0);cc.position.set(.18+Math.min(f,.43)*.8,y,.12)}else if(cc.position.y!==-.2)cc.position.set(.18,-.2,.12)});return g}
// Jardín: un girasol que mira hacia Tito; al tocarlo gira los pétalos y sonríe
function sunf3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.sunf=1;hitS(g,.7,1.6,1,1.7);g.userData.dur=1.5;mk(Cyl(.06,.08,2.2,6),'#5E8A3A',{p:[0,1.1,0],to:g,ol:.02});for(const sd of[-1,1])mk(Sph(.22,8,6),'#6CC24A',{p:[sd*.22,.9+sd*.2,0],s:[1.4,.3,.8],r:[0,0,sd*.4],to:g,ol:.01,cs:false});
  const hd=grp(g,[0,2.25,.05]),pt=grp(hd,[0,0,0]),nt=skyNow().night,zz=nt?zzz3(w,g,2.6):null;for(let i=0;i<12;i++){const a=i/12*PI*2;mk(Sph(.15,8,6),'#FFC93C',{p:[Math.cos(a)*.42,Math.sin(a)*.42,0],s:[1.6,.7,.3],r:[0,0,a],to:pt,ol:.01,cs:false})}
  mk(Cyl(.32,.32,.12,16),'#8A5A3A',{r:[PI/2,0,0],p:[0,0,.03],to:hd,ol:.02});for(const sd of[-1,1])mk(Sph(.04,6,5),K,{p:[sd*.11,.07,.1],s:nt?[1.2,.3,1]:[1,1,1],to:hd,ol:0,cs:false});const sm=mk(new THREE.TorusGeometry(.1,.025,5,10,PI),K,{p:[0,-.02,.1],r:[0,0,PI],to:hd,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;const tx=w.tito?w.tito.position.x-x:0;if(nt&&!(e<1.5)){hd.rotation.y*=.9;hd.rotation.x+=(.6-hd.rotation.x)*.1;pt.scale.setScalar(.7)}else{hd.rotation.x*=.85;pt.scale.setScalar(1);hd.rotation.y+=((Math.max(-.7,Math.min(.7,tx*.12)))-hd.rotation.y)*.05}
    pt.rotation.z=e<1.5?e/1.5*PI*2:0;sm.scale.set(1,e<1.5?1.6:1,1);hd.position.y=2.25+(e<1.5?Math.sin(e/1.5*PI)*.15:0)});return g}
// Cofre: un loro pirata en su percha; mueve la cabeza, al tocarlo aletea y grazna, y lo celebra cuando se abre el cofre
function parrot3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.parrot=1;hitS(g,.7,1.6,1,2);g.userData.dur=1.4;mk(Cyl(.06,.08,2,8),'#8A5A3A',{p:[0,1,0],to:g,ol:.02});mk(Cyl(.3,.36,.08,12),'#8A5A3A',{p:[0,.04,0],to:g,ol:.02});mk(Cyl(.04,.04,.9,6),'#A47548',{p:[0,2,0],r:[0,0,PI/2],to:g,ol:.02});
  const b=grp(g,[0,2.04,0]);mk(Sph(.24,12,10),'#E8503C',{p:[0,.28,0],s:[.9,1.3,.85],to:b,ol:.03});mk(Box(.14,.4,.05),'#5BB8F5',{p:[0,.02,-.2],r:[.5,0,0],to:b,ol:.01,cs:false});
  const W=[];for(const sd of[-1,1]){const wg=grp(b,[sd*.2,.38,0]);mk(Sph(.14,8,6),'#5BB8F5',{p:[sd*.04,-.12,-.02],s:[.45,1.3,.8],to:wg,ol:.01,cs:false});mk(Sph(.08,8,6),'#FFC93C',{p:[sd*.05,-.28,-.04],s:[.5,1,.7],to:wg,ol:0,cs:false});W.push(wg)}
  const hd=grp(b,[0,.62,.05]),nt=skyNow().night,zz=nt?zzz3(w,g,2.9):null;mk(Sph(.17,12,10),'#E8503C',{to:hd,ol:.02});mk(Sph(.09,8,6),'#FFFFFF',{p:[0,.02,.12],s:[1.3,.8,.6],to:hd,ol:0,cs:false});mk(Cone(.06,.16,6),'#3A2414',{p:[0,-.04,.19],r:[PI/2+.6,0,0],to:hd,ol:0,cs:false});
  for(const sd of[-1,1])mk(Sph(.03,6,5),K,{p:[sd*.1,.05,.12],s:nt?[1.3,.3,1]:[1,1,1],to:hd,ol:0,cs:false});for(const sd of[-1,1])mk(Sph(.04,6,5),'#FFC93C',{p:[sd*.06,-.02,0],s:[1,.5,1.6],to:b,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,sl=nt&&!(e>=0&&e<1.4);hd.rotation.z=sl?.35:Math.sin(T*1.3)*.2;hd.rotation.y=sl?0:Math.sin(T*.7)*.4;
    if(e>=0&&e<1.4){const f=Math.sin(e*28)*.8*(1-e/1.4);W[0].rotation.z=-.3+f;W[1].rotation.z=.3-f;b.position.y=2.04+Math.sin(e/1.4*PI)*.35;hd.rotation.x=Math.sin(e*12)*.2}else{W[0].rotation.z=W[1].rotation.z=0;b.position.y=2.04;hd.rotation.x=0}});return g}
const squawk=(d=0)=>{tone(1100,.12,'sawtooth',.04,1.4,d);tone(1300,.16,'sawtooth',.04,.7,d+.15)};
// Inglés: la bandera del Reino Unido ondea en su mástil; al tocarla ondea con fuerza y suena una fanfarria
function flag3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.flag=1;hitS(g,.8,2.6,1.1,1.8);g.userData.dur=1.8;mk(Cyl(.05,.06,3.4,8),'#E8E8EE',{p:[0,1.7,0],to:g,ol:.02});mk(Sph(.1,8,6),'#FFC93C',{p:[0,3.45,0],to:g,ol:.01,cs:false});
  const tx=canvasTex(256,128,()=>{ctx.fillStyle='#1F3D8F';ctx.fillRect(0,0,256,128);ctx.lineCap='butt';const X=(c,wd)=>{ctx.strokeStyle=c;ctx.lineWidth=wd;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(256,128);ctx.moveTo(256,0);ctx.lineTo(0,128);ctx.stroke()};X('#fff',26);X('#D7263D',9);
    ctx.fillStyle='#fff';ctx.fillRect(108,0,40,128);ctx.fillRect(0,44,256,40);ctx.fillStyle='#D7263D';ctx.fillRect(116,0,24,128);ctx.fillRect(0,52,256,24)},'ukflag');
  const geo=new THREE.PlaneGeometry(1.6,.8,10,1);geo.translate(.8,0,0);const fl=new THREE.Mesh(geo,new THREE.MeshToonMaterial({map:tx,gradientMap:GRAD,side:THREE.DoubleSide}));fl.position.set(.04,3,0);g.add(fl);const P=geo.attributes.position,X0=[];for(let i=0;i<P.count;i++)X0.push(P.getX(i));
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,a=e<1.8?.22*(1-e/1.8)+.07:.07,sp=e<1.8?9:3.5;for(let i=0;i<P.count;i++){const x=X0[i];P.setZ(i,Math.sin(x*4-T*sp)*a*x)}P.needsUpdate=true});return g}
// Fiestas: una máquina de pompas; las pompas suben despacio y, al tocarlas, explotan con un "plop"
function bubbles3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);mk(rbox(.7,.5,.5,.08),'#5BB8F5',{p:[0,.25,0],to:g,ol:.03});mk(Cyl(.12,.15,.2,10),'#FFC93C',{p:[0,.58,0],to:g,ol:.02});
  const bm=new THREE.MeshBasicMaterial({color:'#7FC8FF',transparent:true,opacity:.6,depthWrite:false}),hm=new THREE.MeshBasicMaterial({color:'#FFFFFF'}),B=[];
  for(let i=0;i<5;i++){const b=grp(g,[0,0,0]);b.userData.bub=1;b.userData.dur=.35;const m=new THREE.Mesh(gcache('bub',()=>Sph(.3,14,10)),bm);b.add(m);const h=new THREE.Mesh(gcache('bubh',()=>Sph(.05,6,5)),hm);h.position.set(-.1,.12,.21);h.raycast=()=>{};b.add(h);b.userData.ph=i/5;B.push(b)}
  w.upd.push(dt=>{for(const b of B){const u=b.userData;if(u.wob!=null&&T-u.wob<.35){b.scale.setScalar(1+(T-u.wob)*3);b.children[0].material===bm&&(b.visible=(T-u.wob)<.12);if(T-u.wob>.3)u.ph=0;continue}b.visible=true;
    u.ph=(u.ph+dt*.12)%1;const q=u.ph,i=B.indexOf(b);b.position.set(Math.sin(q*9+i*2)*.5+(i-2)*.25,.7+q*4.2,Math.cos(q*7+i)*.3);b.scale.setScalar(Math.min(q*8,1)*(.8+(i%3)*.15))}});return g}
// Bosque: un nido con tres huevos sobre un tocón; al tocarlo los huevos se abren, asoman tres pollitos piando y se vuelven a esconder
function nest3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.nest=1;g.userData.dur=2.4;mk(Cyl(.45,.5,.6,12),'#8A5A3A',{p:[0,.3,0],to:g,ol:.03});mk(Cyl(.44,.44,.03,12),'#E3C08F',{p:[0,.61,0],to:g,ol:0,cs:false});
  mk(new THREE.TorusGeometry(.32,.12,6,14),'#B07A4A',{p:[0,.7,0],r:[PI/2,0,0],to:g,ol:.02});mk(Cyl(.3,.24,.1,12),'#9A6A3E',{p:[0,.66,0],to:g,ol:0,cs:false});
  const E=[];[[-.12,-.06],[.13,-.04],[0,.12]].forEach(([a,b],i)=>{const e=grp(g,[a,.72,b]);const lo=mk(Sph(.11,10,8,0,PI*2,PI/2,PI/2),'#F6F0E2',{s:[1,1.25,1],to:e,ol:.01,cs:false});
    const ck=grp(e,[0,0,0]);mk(Sph(.1,10,8),'#FFD84A',{p:[0,.06,0],to:ck,ol:.01,cs:false});mk(Cone(.03,.07,5),'#FF9A3C',{p:[0,.06,.1],r:[PI/2,0,0],to:ck,ol:0,cs:false});for(const sd of[-1,1])mk(Sph(.018,5,4),K,{p:[sd*.04,.1,.08],to:ck,ol:0,cs:false});
    const top=mk(Sph(.11,10,8),'#F6F0E2',{s:[1,1.25,1],to:e,ol:.01,cs:false});E.push({e,ck,top,i})});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;for(const o of E){const d=e-o.i*.15;if(d>0&&d<2.4-o.i*.15){const q=Math.min(d/.3,1)*Math.min((2.2-d)/.3,1);o.top.position.set(q*.1,.06+q*.22,0);o.top.rotation.z=-q*.8;o.top.scale.set(1,1.25,1);o.ck.position.y=q*.1+Math.abs(Math.sin(d*10))*.03*q;o.ck.visible=q>.05}
    else{o.top.position.set(0,0,0);o.top.rotation.z=0;o.ck.visible=false;o.e.rotation.z=Math.sin(T*3+o.i*2)*.05}}});return g}
// Montaña: una marmota se asoma de su madriguera en la nieve; al tocarla silba y se esconde, y vuelve a salir
function marm3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.marm=1;hitS(g,.6,.5);g.userData.dur=2;mk(Cyl(.5,.6,.16,14),'#FFFFFF',{p:[0,.08,0],to:g,ol:.03});mk(Cyl(.3,.3,.02,12),'#3A2D28',{p:[0,.17,0],to:g,ol:0,cs:false});
  const m=grp(g,[0,0,0]),C='#A07850';mk(Sph(.26,12,10),C,{p:[0,.4,0],s:[1,1.5,.9],to:m,ol:.03});mk(Sph(.17,10,8),'#E8D2B0',{p:[0,.4,.14],s:[1,1.4,.6],to:m,ol:0,cs:false});
  const hd=grp(m,[0,.82,.04]);mk(Sph(.2,12,10),C,{to:hd,ol:.02});mk(Sph(.1,8,6),'#E8D2B0',{p:[0,-.05,.15],s:[1.2,.8,.7],to:hd,ol:0,cs:false});mk(Sph(.035,6,5),K,{p:[0,-.01,.21],to:hd,ol:0,cs:false});
  for(const sd of[-1,1]){mk(Sph(.03,6,5),K,{p:[sd*.08,.06,.16],to:hd,ol:0,cs:false});mk(Sph(.06,8,6),C,{p:[sd*.15,.14,0],s:[1,.8,.6],to:hd,ol:0,cs:false});mk(Sph(.06,8,6),C,{p:[sd*.12,.5,.18],to:m,ol:0,cs:false})}
  const nt=skyNow().night;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let y=nt?-.75:0;if(e<2){y=e<.3?0:e<.5?-(e-.3)/.2*.85:e<1.3?-.85:Math.min(0,-.85+(e-1.3)/.4*.85);if(nt&&e>1.3)y=-.75}m.position.y=y;m.visible=y>-.8;hd.rotation.y=nt?0:Math.sin(T*.8)*.5});return g}
// Jardín: un espantapájaros con un cuervo en el brazo; al tocarlo el espantapájaros se menea, el cuervo sale volando, da una vuelta y vuelve
function scare3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.scare=1;g.userData.dur=2.6;const b=grp(g,[0,0,0]);mk(Cyl(.05,.06,2.2,6),'#8A5A3A',{p:[0,1.1,0],to:b,ol:.02});mk(Cyl(.04,.04,1.6,6),'#8A5A3A',{p:[0,1.55,0],r:[0,0,PI/2],to:b,ol:.02});
  mk(Box(.6,.7,.3),'#5BB8F5',{p:[0,1.3,0],to:b,ol:.03});for(let i=0;i<3;i++)mk(Box(.12,.12,.31),'#FFC93C',{p:[-.15+i*.15,1.1+(i%2)*.25,0],to:b,ol:0,cs:false});
  for(const sd of[-1,1]){mk(Box(.4,.22,.24),'#E8503C',{p:[sd*.48,1.55,0],to:b,ol:.02});mk(Cone(.08,.2,6),'#F2C14E',{p:[sd*.76,1.55,0],r:[0,0,-sd*PI/2],to:b,ol:0,cs:false})}
  mk(Sph(.22,12,10),'#E9C99A',{p:[0,1.92,0],to:b,ol:.02});for(const sd of[-1,1])mk(Box(.06,.06,.02),K,{p:[sd*.08,1.96,.21],r:[0,0,PI/4],to:b,ol:0,cs:false});mk(new THREE.TorusGeometry(.08,.015,4,8,PI),K,{p:[0,1.86,.2],r:[0,0,PI],to:b,ol:0,cs:false});
  mk(Cyl(.42,.42,.04,14),'#C9772E',{p:[0,2.08,0],to:b,ol:.02});mk(Cyl(.2,.24,.28,12),'#C9772E',{p:[0,2.24,0],to:b,ol:.02});
  const cr=grp(g,[.6,1.7,0]),W=[],nt=skyNow().night,zz=nt?zzz3(w,g,2.1):null;mk(Sph(.12,10,8),'#2F3446',{s:[1.3,1,.9],to:cr,ol:.02});mk(Sph(.08,8,6),'#2F3446',{p:[.12,.1,0],to:cr,ol:.01,cs:false});mk(Cone(.03,.1,5),'#F2C14E',{p:[.22,.09,0],r:[0,0,-PI/2],to:cr,ol:0,cs:false});
  for(const sd of[-1,1]){const wg=grp(cr,[0,.04,sd*.08]);mk(Box(.18,.02,.14),'#2F3446',{p:[0,0,sd*.07],to:wg,ol:0,cs:false});W.push(wg)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.rotation.z=e<1.2?Math.sin(e*12)*.12*(1-e/1.2):0;
    if(e<2.6){const q=Math.min(e/2.6,1),a=q*PI*2;cr.position.set(.6+Math.sin(a)*1.6,1.7+Math.sin(q*PI)*1.6,Math.cos(a)*1.2-1.2+1.2*(1-Math.cos(q*PI*2))*.0);cr.rotation.y=-a;const f=Math.sin(T*30)*.7;W[0].rotation.x=f;W[1].rotation.x=-f}
    else{cr.position.set(.6,1.7,0);cr.rotation.y=0;W[0].rotation.x=W[1].rotation.x=0;cr.rotation.z=nt?-.35:0}});return g}
// Inglés: un paraguas en su soporte (en Londres llueve a menudo); al tocarlo se abre y llueve un ratito
function umb3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.umb=1;g.userData.dur=2.4;mk(Cyl(.25,.3,.5,12),'#2F3446',{p:[0,.25,0],to:g,ol:.02});mk(Cyl(.025,.025,1.8,6),'#2F3446',{p:[0,1.1,0],to:g,ol:.01});
  const cn=grp(g,[0,2,0]),P=[];for(let i=0;i<8;i++){const p=grp(cn,[0,0,0]);p.rotation.y=i/8*PI*2;mk(Cone(.3,1.1,3),i%2?'#E8503C':'#FFFFFF',{p:[0,-.5,0],s:[1,1,.25],r:[0,0,0],to:p,ol:.01,cs:false});P.push(p)}
  const dm=new THREE.MeshBasicMaterial({color:'#7FC8F8',transparent:true,opacity:0}),D=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(gcache('rdrop',()=>Cyl(.015,.015,.22,4)),dm);m.raycast=()=>{};g.add(m);D.push(m)}
  /* arcoíris que sale cuando para la lluvia */const RB=['#E8503C','#F5A623','#F8E04A','#6CC56C','#4A90E2'].map((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(1.5-i*.12,.06,6,28,PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false}));m.raycast=()=>{};m.position.set(0,2.3,-.4);g.add(m);return m});let rbT=-99;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(k!=null)rbT=k;const re=T-rbT,ro=re>2&&re<5.5?Math.min((re-2)/.5,1)*Math.min((5.5-re)/.8,1)*.75:0;RB.forEach(m=>{m.material.opacity=ro;m.visible=ro>0});const o=e<2.4?Math.min(e/.3,1)*Math.min((2.4-e)/.4,1):0;P.forEach(p=>p.children[0].rotation.x=-o*1.15);cn.position.y=2-o*.0;dm.opacity=o>.5?.8:0;
    D.forEach((m,i)=>{const a=i*2.4,r=1.25+(i%3)*.12,q=(e*1.6+i*.13)%1;m.position.set(Math.cos(a)*r,3.2-q*3,Math.sin(a)*r)})});return g}
// Verano (del 21 de junio al 15 de septiembre): sombrilla y castillo de arena en la playa del mapa; la sombrilla gira al tocarla y el castillo ondea su banderita
const summerNow=()=>{const d=new Date(),m=d.getMonth(),n=d.getDate();return (m===5&&n>=21)||m===6||m===7||(m===8&&n<=15)};
const winterNow=()=>{const d=new Date(),m=d.getMonth(),n=d.getDate();return (m===11&&n>=21)||m===0||m===1};
function sunb3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.sunb=1;g.userData.dur=1.6;mk(Cyl(.04,.04,2,6),'#FFFFFF',{p:[0,1,0],r:[0,0,.15],to:g,ol:.01});
  const tp=grp(g,[-.15,2,0]);tp.rotation.z=.15;['#FF6B6B','#FFFFFF','#5BB8F5','#FFFFFF','#FFC93C','#FFFFFF'].forEach((c,i)=>mk(new THREE.ConeGeometry(1.1,.5,3,1,false,i*PI/3,PI/3),c,{to:tp,ol:.02}));
  mk(Box(1,.06,.5),'#FF8FB1',{p:[.9,.03,.4],r:[0,.4,0],to:g,ol:.02,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;tp.rotation.y=e<1.6?(1-Math.cos(e/1.6*PI))*PI:0;tp.position.y=2+(e<1.6?Math.sin(e/1.6*PI)*.25:0)});return g}
function sandc3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.sandc=1;g.userData.dur=1.4;const C='#EBCB8B';mk(Box(1.1,.5,.8),C,{p:[0,.25,0],to:g,ol:.03});
  for(const [a,b] of[[-.5,-.35],[.5,-.35],[-.5,.35],[.5,.35]]){mk(Cyl(.16,.18,.8,8),C,{p:[a,.4,b],to:g,ol:.02});mk(Cone(.2,.25,8),'#E0B870',{p:[a,.92,b],to:g,ol:.01,cs:false})}
  mk(Cyl(.25,.28,.7,10),C,{p:[0,.85,0],to:g,ol:.02});mk(Cyl(.015,.015,.5,4),'#8A5A3A',{p:[0,1.45,0],to:g,ol:0,cs:false});const fl=mk(Box(.28,.16,.02),'#FF6B6B',{p:[.14,1.62,0],to:g,ol:0,cs:false});
  mk(Cyl(.2,.14,.3,10),'#5BB8F5',{p:[.9,.15,.3],to:g,ol:.02,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;fl.rotation.y=Math.sin(T*(e<1.4?14:3))*(e<1.4?.6:.25);fl.scale.y=e<1.4?1.3:1});return g}
// zona de toque invisible más grande, para que los dedos pequeños acierten con las cosas pequeñas o finas
function hitS(g,r,y,sx=1,sy=1){const h=new THREE.Mesh(gcache('xhit',()=>Sph(1,6,4)),FHIT);h.position.y=y;h.scale.set(r*sx,r*sy,r*sx);g.add(h);return h}
// Tito lo celebra con un salto y una fanfarria (cada 5 pompas explotadas, o al tocar H-E-L-L-O en orden)
function titoCheer(x,y){const st=SCENES[sceneName];if(st)st.hop=T+.15;[523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.08,1,.2+i*.1));for(let i=0;i<3;i++)sparkles(x+(i-1)*60,y-40*i)}
// reacciones en cadena: al tocar algo, otras cosas de su tipo reaccionan después, escalonadas
function dropParts(x,y,n,cols,k){/* al sacudir un árbol cae nieve (Montaña) u hojas (Bosque) */for(let i=0;i<n;i++)parts.push({x:x+rnd(-55,55),y:y+rnd(-30,20),vx:rnd(-30,30),vy:rnd(-40,20),life:rnd(1,1.6),t:0,c:pick(cols),r:rnd(5,10),rot:rnd(0,6),k,g:260})}
function allTap(w,t,kind,x,y,N){/* premio de Tito al tocar todos los de un tipo */const k='_all'+kind,n=N||(w.trees||[]).filter(o=>o.userData[kind]).length;(w[k]=w[k]||new Set).add(t);if(n>1&&w[k].size>=n){w[k]=null;titoCheer(x,y)}}
function chainWob(w,kind,d0,step,max){let i=0;for(const o of w.trees||[])if(o.userData[kind]&&i<max){o.userData.wobAt=T+d0+i*step;i++}}
function cloud3(to,x,y,z,s){const g=grp(to,[x,y,z],s);mk(gcache('cloud',()=>mg([[0,0,0,1],[1.1,.3,0,1.2],[2.2,0,0,.9],[1.1,-.2,.5,1]].map(([a,b,c,r])=>[Sph(r,14,10),[a,b,c]]))),'#FFFFFF',{cs:false,rs:false,ol:.04,to:g});return g}
function balloon3(to,x,z,c,h=2.4){const g=grp(to,[x,0,z]);mk(Cyl(.012,.012,h,4),K,{p:[0,h/2,0],ol:0,cs:false,to:g});mk(Sph(.38,14,12),c,{p:[0,h+.35,0],s:[1,1.2,1],to:g,ol:.03});g.userData.balloon=1;return g}

/* ---------- Tito, el caracol, en 3D ---------- */
class Spiral extends THREE.Curve{constructor(R,b,turns,a0){super();this.R=R;this.b=b;this.T=turns*PI*2;this.a0=a0}
  getPoint(t,o=new THREE.Vector3()){const th=t*this.T,r=this.R*Math.exp(-this.b*th),a=this.a0+th;return o.set(Math.cos(a)*r,Math.sin(a)*r,0)}}
function shellGeo(){const R=.74,b=.12,k=.36,zs=1.85,sp=new Spiral(R,b,2.1,-1.0),seg=150,rad=14,g=new THREE.TubeGeometry(sp,seg,1,rad,false),p=g.attributes.position;
  for(let i=0;i<=seg;i++){const P=sp.getPointAt(i/seg),tr=k*Math.hypot(P.x,P.y);for(let j=0;j<=rad;j++){const v=i*(rad+1)+j;p.setXYZ(v,P.x+(p.getX(v)-P.x)*tr,P.y+(p.getY(v)-P.y)*tr,(p.getZ(v)-P.z)*tr*zs)}}
  g.computeVertexNormals();return {g,sp,k,zs}}
let SHELL=null;
// personajes de Tito que ya tienen modelo (S.tito.kind; los demás vuelven al caracol)
const TITO_KINDS=['caracol','erizo','tortuga','conejo'];
// sonido al tocar a Tito, según el animal: el caracol con su boing de siempre, el conejo un pip-pip agudo, la tortuga un bonk grave y el erizo un resoplido
function titoTapSfx(){const k=S.tito&&S.tito.kind;try{if(k==='conejo'){tone(1180,.07,'triangle',.22,1.3);tone(1400,.07,'triangle',.2,1.3,.1)}else if(k==='tortuga'){tone(190,.22,'sine',.45,.6);tone(130,.18,'triangle',.18,0,.06)}else if(k==='erizo'){noise(.06,.18,2600);noise(.06,.16,3200,.09);tone(700,.06,'sine',.08,1.3,.16)}else SFX.boing()}catch(e){}}
const HOP={caracol:[.9,.6],erizo:[.65,.45],tortuga:[.4,.5],conejo:[1.4,.7]};
function makeTito(into){const root=into||new THREE.Group(),b=grp(root);root.userData.id='tito';const t=S.tito||{},GR='#9BD86A';
  const kind=TITO_KINDS.includes(t.kind)?t.kind:'caracol';root.userData.kind=kind;
  const sc=(SHELLC[t.shell]||SHELLC.naranja),scarf=SCARFC[t.scarf]||SCARFC.roja;
  let head,mouth,mo,sh,nose=null;const eyes=[],wig=[],stalks=[],ears=[];
  if(kind==='caracol'){
  mk(Sph(1,26,16),GR,{p:[.15,.46,0],s:[1.4,.48,.56],to:b,ol:.06});mk(Cone(.36,.8,14),GR,{p:[-1.3,.3,0],r:[0,0,PI/2+.2],s:[1,1,.8],to:b,ol:.05});
  mk(Cyl(.42,.55,1.25,18),GR,{p:[.95,.95,0],r:[0,0,-.22],to:b,ol:.05});
  head=grp(b,[1.2,1.72,0]);mk(Sph(.6,24,18),GR,{to:head,ol:.05});
  for(const z of[-.26,.26]){const st=grp(head,[.05,.4,z]);st.rotation.set(z*.5,0,-.12);stalks.push(st);mk(Cyl(.06,.08,.75,8),GR,{p:[0,.37,0],to:st,ol:.03});
    const e=grp(st,[0,.82,0]);mk(Sph(.22,16,12),'#FFFFFF',{to:e,ol:.03});mk(Sph(.11,12,10),K,{p:[.12,.02,.11],ol:0,to:e});mk(Sph(.035,8,6),'#FFFFFF',{p:[.19,.07,.16],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.16,.04,8,16,PI),'#7A2E3A',{p:[.48,-.15,.28],r:[0,.9,PI],ol:0,to:head});
  mo=mk(Sph(.12,12,10),'#7A2E3A',{p:[.5,-.2,.26],s:[1,.2,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.38,-.05,z*.42],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.92,1.02,0]);sg.rotation.z=-.22;mk(new THREE.TorusGeometry(.47,.15,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}mk(Box(.22,.5,.12),scarf,{p:[.62,.62,.38],r:[0,0,.3],to:b,ol:.03});
  if(!SHELL)SHELL=shellGeo();sh=grp(b,[-.32,1.55,0]);mk(SHELL.g,sc[0],{to:sh,ol:.045});mk(Sph(.18,12,10),sc[0],{s:[1,1,1.4],to:sh,ol:.03});
  // la raya del caparazón
  {const sp=SHELL.sp,pts=[];for(let i=0;i<=120;i++){const P=sp.getPointAt(i/120),tr=SHELL.k*Math.hypot(P.x,P.y);pts.push(new THREE.Vector3(P.x,P.y,tr*SHELL.zs*.97))}
   const cv3=new THREE.CatmullRomCurve3(pts);for(const sg of[1,-1]){const m=mk(new THREE.TubeGeometry(cv3,120,.035,6,false),sc[1],{ol:0,cs:false,to:sh});m.scale.z=sg}}
  // flores en el caparazón (una por casita terminada)
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const P=SHELL.sp.getPointAt(.02+j*.034),tr=SHELL.k*Math.hypot(P.x,P.y),f=grp(sh,[P.x*1.04,P.y*1.04,tr*SHELL.zs*.9],.55);
    for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a)*.14,Math.sin(a)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else if(kind==='erizo'){
  // ERIZO: cuerpo crema, abrigo de púas (una sola geometría) del color elegido en la tienda (marrón con el naranja de siempre)
  const CR='#F2D6B0',PU=t.shell&&t.shell!=='naranja'?sc[0]:'#9A6A45';
  mk(Sph(1,26,16),CR,{p:[.1,.72,0],s:[1.25,.72,.82],to:b,ol:.06});
  mk(Sph(1,24,16),PU,{p:[-.12,.98,0],s:[1.18,.82,.86],to:b,ol:.05});
  const sp=gcache('puas',()=>{const parts=[],cn=Cone(.12,.46,6),q=new THREE.Quaternion(),e=new THREE.Euler(),U=new THREE.Vector3(0,1,0);
    for(let i=0;i<70;i++){const y=1-(i+.5)/70*1.25,r=Math.sqrt(Math.max(0,1-y*y)),a=i*2.39996,d=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);if(d.x>.55||y<-.2)continue;
      const P=[d.x*1.15,d.y*.8,d.z*.84],n=new THREE.Vector3(d.x/1.15,d.y/.8,d.z/.84).normalize();q.setFromUnitVectors(U,n);e.setFromQuaternion(q);parts.push([cn,[P[0]+n.x*.16,P[1]+n.y*.16,P[2]+n.z*.16],1,[e.x,e.y,e.z]])}return mg(parts)});
  mk(sp,PU,{p:[-.12,.98,0],to:b,ol:.025});
  for(const [x,z] of[[.6,.42],[.6,-.42],[-.55,.45],[-.55,-.45]])mk(Sph(.17,10,8),'#8A5A3C',{p:[x,.14,z],s:[1.3,.7,1],to:b,ol:.025});
  head=grp(b,[1.08,1.02,0]);mk(Sph(.56,22,16),CR,{s:[1.08,1,1],to:head,ol:.05});
  mk(Cone(.27,.62,16),CR,{p:[.62,-.1,0],r:[0,0,-PI/2],to:head,ol:.035});nose=mk(Sph(.12,12,10),K,{p:[.94,-.1,0],ol:0,to:head});
  for(const z of[-.34,.34])mk(Sph(.15,10,8),'#E8B98A',{p:[-.12,.44,z],s:[1,1,.55],to:head,ol:.025});
  for(const z of[-.24,.24]){const e=grp(head,[.36,.16,z]);mk(Sph(.16,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.085,10,8),K,{p:[.1,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.16,.05,z*.25],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.12,.035,8,14,PI),'#7A2E3A',{p:[.62,-.3,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.09,10,8),'#7A2E3A',{p:[.64,-.32,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.46,-.14,z*.36],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.72,.86,0]);sg.rotation.z=-.85;mk(new THREE.TorusGeometry(.44,.14,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  sh=grp(b,[-.12,.98,0]);
  // flores entre las púas (una por casita terminada)
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.15+(j%5)*.36,y=.3+Math.floor(j/5)*.24,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.28,d.y*.92,d.z*.95],.5);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else if(kind==='tortuga'){
  // TORTUGA: caparazón con el color de la tienda (el naranja de siempre) y dibujo de placas del color oscuro
  const SK='#8FD07A',U=new THREE.Vector3(0,1,0);
  for(const [x,z] of[[.68,.5],[.68,-.5],[-.62,.5],[-.62,-.5]])mk(Cyl(.2,.24,.5,10),SK,{p:[x,.25,z],to:b,ol:.03});
  wig.push([mk(Cone(.16,.42,8),SK,{p:[-1.3,.42,0],r:[0,0,PI/2+.3],to:b,ol:.025}),'y',0,.35,5,0]);
  mk(Cyl(.2,.26,.7,12),SK,{p:[1.15,.72,0],r:[0,0,-.95],to:b,ol:.035});
  mk(Sph(1,22,12),'#F3E2A9',{p:[0,.44,0],s:[1.22,.2,.92],to:b,ol:.04});
  mk(new THREE.SphereGeometry(1,28,14,0,PI*2,0,PI/2),sc[0],{p:[0,.46,0],s:[1.25,.95,.95],to:b,ol:.06});
  mk(new THREE.TorusGeometry(1,.1,8,36),sc[1],{p:[0,.47,0],r:[PI/2,0,0],s:[1.25,.95,1],to:b,ol:.03});
  sh=grp(b,[0,.46,0]);
  for(const [x,y,z] of[[0,1,0],[.6,.72,.35],[.6,.72,-.35],[-.6,.72,.35],[-.6,.72,-.35],[0,.62,.78],[0,.62,-.78]]){const d=new THREE.Vector3(x,y,z).normalize(),m=mk(Sph(.3,14,8),sc[1],{p:[d.x*1.25,d.y*.95,d.z*.95],s:[1,.22,1],ol:0,cs:false,to:sh});m.quaternion.setFromUnitVectors(U,d)}
  head=grp(b,[1.48,1.05,0]);mk(Sph(.46,20,14),SK,{s:[1.15,1,1],to:head,ol:.05});
  for(const z of[-.22,.22]){const e=grp(head,[.28,.16,z]);mk(Sph(.15,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.08,10,8),K,{p:[.09,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.15,.05,z*.25],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.12,.035,8,14,PI),'#7A2E3A',{p:[.5,-.14,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.09,10,8),'#7A2E3A',{p:[.52,-.16,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.09,10,8),'#FF9EAA',{p:[.38,-.08,z*.34],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[1.18,.78,0]);sg.rotation.z=-.95;mk(new THREE.TorusGeometry(.32,.11,10,22),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.15+(j%5)*.36,y=.45+Math.floor(j/5)*.2,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.29,d.y*.99,d.z*.99],.5);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else{
  // CONEJO: pelo claro, orejas largas y la mochila de las preguntas con el color de la tienda
  const FU='#EDE3D6',IN='#FFB3C1';
  mk(Sph(1,24,16),FU,{p:[0,.88,0],s:[.98,.86,.8],to:b,ol:.06});mk(Sph(.6,16,12),'#FFFFFF',{p:[.5,.72,0],s:[.6,1,.95],ol:0,to:b});
  for(const z of[-.38,.38])mk(Sph(.25,12,10),FU,{p:[.38,.12,z],s:[1.8,.6,1],to:b,ol:.03});
  mk(Sph(.28,12,10),'#FFFFFF',{p:[-.95,.8,0],to:b,ol:.03});
  const mb=grp(b,[-.78,1.05,0]);mb.rotation.y=PI/2;mk(rbox(.95,1,.5,.12),sc[0],{to:mb,ol:.04});mk(rbox(.95,.4,.12,.05),sc[1],{p:[0,.32,.27],to:mb,ol:.03});
  head=grp(b,[.78,1.78,0]);mk(Sph(.55,22,16),FU,{s:[1.05,.95,.95],to:head,ol:.05});
  for(const z of[-.13,.13])mk(Sph(.2,12,10),'#FFFFFF',{p:[.42,-.14,z],ol:0,to:head});mk(Sph(.08,10,8),'#FF8AA0',{p:[.57,-.02,0],ol:0,to:head});
  for(const z of[-.2,.2]){const ear=grp(head,[-.05,.42,z]);ear.rotation.x=z*1.1;ears.push(ear);wig.push([ear,'x',z*1.1,.07,2.4,z*6]);mk(Sph(.18,12,10),FU,{p:[0,.45,0],s:[1,3,.55],to:ear,ol:.03});mk(Sph(.11,10,8),IN,{p:[.08,.45,0],s:[.6,2.5,.4],ol:0,to:ear})}
  for(const z of[-.22,.22]){const e=grp(head,[.32,.14,z]);mk(Sph(.15,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.08,10,8),K,{p:[.09,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.15,.05,z*.25],ol:0,to:e});eyes.push(e)}
  // boca pegada al hocico (antes quedaba colgando por debajo de la barbilla)
  mouth=mk(new THREE.TorusGeometry(.08,.026,8,14,PI),'#7A2E3A',{p:[.6,-.25,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.065,10,8),'#7A2E3A',{p:[.61,-.27,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.38,-.1,z*.38],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.7,1.32,0]);sg.rotation.z=-.4;mk(new THREE.TorusGeometry(.4,.13,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  sh=grp(b,[0,.88,0]);
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.35+(j%5)*.3,y=.05+Math.floor(j/5)*.28,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.0,d.y*.88,d.z*.83],.45);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }
  // ropa: sombrero en la cabeza y moño, en el sitio de cada personaje
  const HP={caracol:[.05,.95,0],erizo:[-.05,.85,0],tortuga:[-.05,.72,0],conejo:[.07,.74,0]}[kind],BP={caracol:[-.3,2.55,.3],erizo:[-.25,1.95,.3],tortuga:[-.3,1.55,.3],conejo:[.35,2.4,.4]}[kind];
  if(t.hat&&IMG[t.hat])spr(picTex(t.hat),1.35,1.35,{p:HP,to:head});
  if(t.bow)spr(picTex('monio'),.8,.8,{p:BP,to:b});
  if(t.glasses)for(const e of eyes){const gm=new THREE.Mesh(new THREE.TorusGeometry(.25,.04,8,20),M(K));gm.position.set(.16,0,.1);gm.rotation.y=PI/2.4;e.add(gm);const ln=new THREE.Mesh(new THREE.CircleGeometry(.24,20),new THREE.MeshBasicMaterial({color:0x28284a,transparent:true,opacity:.38}));ln.position.copy(gm.position);ln.rotation.copy(gm.rotation);e.add(ln)}
  // caja invisible para tocarlo
  const hit=new THREE.Mesh(Box(4,3.6,1.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(.2,1.5,0);root.add(hit);
  root.userData.parts={b,head,eyes,mouth,mo,sh};
  const hx0=head.position.x;
  // con el ratón encima Tito crece un poco, como las casitas y los lugares (hs = escala actual, suave)
  let hs=1,la=0;
  root.userData.anim=(dt,o={})=>{const tt=T+(o.ph||0),wk=o.walk||0;
    hs+=((o.hov?1.08:1)-hs)*Math.min(1,(dt||0)*10);const br=Math.sin(tt*2.2)*.04;
    // cada animal camina a su manera: el caracol se estira y encoge, el conejo da saltitos, la tortuga se balancea despacio y el erizo trota
    if(kind==='conejo'){const ph=tt*6,u=Math.abs(Math.sin(ph)),sq=wk*Math.max(0,.35-u)*.5;b.position.y=u*.5*wk+br;b.rotation.z=-Math.cos(ph)*Math.sign(Math.sin(ph))*.12*wk;b.scale.set(hs*(1+sq),hs*(1-sq),hs)}
    else if(kind==='tortuga'){b.position.y=Math.abs(Math.sin(tt*5))*.06*wk+br;b.rotation.x=Math.sin(tt*5)*.09*wk;b.scale.setScalar(hs)}
    else if(kind==='erizo'){b.position.y=Math.abs(Math.sin(tt*12))*.12*wk+br;b.rotation.x=Math.sin(tt*12)*.05*wk;b.scale.set(hs,hs*(1-Math.abs(Math.sin(tt*12))*.03*wk),hs)}
    else{b.position.y=Math.abs(Math.sin(tt*9))*.18*wk+br;b.scale.set(hs*(1+Math.sin(tt*9)*.05*wk),hs*(1-Math.sin(tt*9)*.05*wk),hs)}
    const bl=((tt+.5)%3.9)<.14?.12:1;for(const e of eyes)e.scale.y=bl;
    head.rotation.z=Math.sin(tt*1.3)*.06+(o.look||0);
    // si está quieto y callado, cada tanto mira a un lado y al otro (como buscando las preguntas); al caminar o hablar mira al frente
    {const c=(tt+(o.ph||0)*3)%9;let lt=!wk&&!talking&&c<2.4?Math.sin(c/2.4*PI*2)*.45:0;const lk=root.userData.lk;
      if(lk&&!wk&&T-lk.t<2.2){const v=root.worldToLocal(lk.p.clone());lt=Math.max(-1.1,Math.min(1.1,Math.atan2(-v.z,v.x)))}// y si se toca algo del paisaje, gira la cabeza para mirarlo
      la+=(lt-la)*Math.min(1,(dt||0)*5);head.rotation.y=la}
    // el erizo olisquea: la nariz da unos saltitos rápidos cada pocos segundos
    if(nose){const c=(tt+1.7)%4.3;nose.scale.setScalar(c<.6?1+Math.abs(Math.sin(c*PI*5))*.3:1)}
    // orejas del conejo (se mueven solas y de vez en cuando dan un respingo) y cola de la tortuga
    for(const [m,ax,b0,amp,sp,ph] of wig){const tw=((tt+ph*.3)%5)<.35?Math.sin(((tt+ph*.3)%5)/.35*PI)*2.5:0;m.rotation[ax]=b0+Math.sin(tt*sp+ph)*amp+tw*amp*Math.sign(b0||1)}const tk=talking&&o.talk!==false&&(T*7|0)%2;mo.visible=!!tk;mouth.visible=!tk;
    // al terminar el salto vuelve justo al suelo (antes se quedaba flotando a la altura del último cuadro del salto)
    // al tocarlo salta a su manera: el conejo alto, la tortuga apenas (pesa con su caparazón), el erizo un brinco corto
    if(o.hop!=null){const k=T-o.hop,[hh,hd]=HOP[kind]||HOP.caracol;root.position.y=(o.y0||0)+(k>=0&&k<hd?Math.sin(k/hd*PI)*hh:0)}
    // al tocarlo, el erizo da una voltereta en el aire (gira alrededor de su centro, no de las patas)
    if(kind==='erizo'){const k=o.hop!=null?T-o.hop:9,hd=HOP.erizo[1],a2=k>=0&&k<hd?-(k/hd)*PI*2:0,cy=.9;b.rotation.z=a2;b.position.x=cy*Math.sin(-a2)*-1;b.position.y+=cy-cy*Math.cos(a2)}
    // y la tortuga esconde la cabeza un momento en el caparazón
    // el conejo echa las orejas hacia atrás con el salto y vuelven con un rebote
    if(ears.length){const k=o.hop!=null?T-o.hop:9,e=k<0||k>1.1?0:k<.25?k/.25:Math.cos((k-.25)*9)*Math.exp(-(k-.25)*4);for(const ea of ears)ea.rotation.z=.75*e}
    // el caracol mete los ojos (encoge las antenas) un momento y los vuelve a sacar
    if(stalks.length){const k=o.hop!=null?T-o.hop:9,e=k<0?0:k<.12?k/.12:k<.7?1:Math.max(0,1-(k-.7)/.35);for(const st of stalks)st.scale.y=1-.65*e}
    if(kind==='tortuga'){const k=o.hop!=null?T-o.hop:9,e=k<0?0:k<.15?k/.15:k<.9?1:Math.max(0,1-(k-.9)/.3);head.position.x=hx0-.5*e;head.scale.setScalar(1-.25*e)}};
  root.traverse(o=>{if(o.isMesh&&o.material&&o.material.type==='MeshToonMaterial')o.castShadow=true});
  return root}

/* ---------- Pipo, el dinosaurio que crece ---------- */
function makePipo(st){const g=new THREE.Group(),b=grp(g);g.userData.id='pipo';
  if(st<=1){mk(Sph(.62,22,16),'#FFF6E0',{p:[0,.78,0],s:[1,1.28,1],to:b,ol:.04});
    [[.2,1,.5],[-.25,.6,.5],[.35,.5,.4],[-.1,1.3,.42],[.45,1.05,.2]].forEach(([x,y,z])=>mk(Sph(.11,10,8),'#9BD86A',{p:[x,y,z],s:[1,1,.3],ol:0,to:b}));
    if(st===1){const hd=grp(b,[0,1.5,0]);mk(Sph(.38,16,12),'#7CC86E',{to:hd,ol:.03});for(const z of[-.15,.15]){mk(Sph(.09,10,8),'#fff',{p:[.25,.08,z],ol:.02,to:hd});mk(Sph(.045,8,6),K,{p:[.32,.08,z*1.1],ol:0,to:hd})}
      mk(Sph(.35,14,10,0),'#FFF6E0',{p:[0,.22,0],s:[1,.55,1],to:hd,ol:.03})}}
  else{const k=st===2?.62:st===3?.82:1,G2='#7CC86E';b.scale.setScalar(k);
    mk(Sph(.8,22,16),G2,{p:[0,1.05,0],s:[1.15,.9,.82],to:b,ol:.05});mk(Sph(.55,16,12),'#C9EFA5',{p:[.35,.95,.3],s:[1,1,.5],ol:0,to:b});
    const hd=grp(b,[.95,1.85,0]);mk(Sph(.5,18,14),G2,{s:[1.15,1,1],to:hd,ol:.045});
    for(const z of[-.2,.2]){mk(Sph(.13,12,10),'#fff',{p:[.25,.18,z],ol:.025,to:hd});mk(Sph(.065,8,6),K,{p:[.35,.2,z*1.15],ol:0,to:hd})}
    mk(new THREE.TorusGeometry(.14,.03,6,12,PI),K,{p:[.48,-.08,0],r:[0,PI/2,PI],ol:0,to:hd});
    mk(Cone(.42,1.4,14),G2,{p:[-1.15,.95,0],r:[0,0,PI/2+.35],to:b,ol:.04});
    for(const [x,z] of[[.4,.35],[.4,-.35],[-.4,.35],[-.4,-.35]])mk(Cyl(.17,.2,.6,10),G2,{p:[x,.3,z],to:b,ol:.04});
    for(let i=0;i<5;i++)mk(Cone(.16,.38,6),'#FFA94D',{p:[-.7+i*.35,1.82-Math.abs(i-2.2)*.1,0],to:b,ol:.025});
    if(st>=4){const cr=grp(hd,[-.05,.5,0]);mk(Cyl(.28,.28,.22,16),'#FFC93C',{to:cr,ol:.03});for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Cone(.07,.2,6),'#FFC93C',{p:[Math.cos(a)*.24,.2,Math.sin(a)*.24],to:cr,ol:.02})}}}
  const hit=new THREE.Mesh(Box(2,2.6,1.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.1;g.add(hit);
  g.userData.anim=(jump)=>{if(st===0){const w=Math.sin(T*.8)>.55?Math.sin(T*9)*.12:0;b.rotation.z=w}else b.position.y=Math.abs(Math.sin(T*3))*.06;
    const j=jump?Math.max(0,1-(T-jump)*1.6)*Math.abs(Math.sin((T-jump)*10)):0;g.position.y=(g.userData.y0||0)+j*.8};
  return g}

/* ---------- la casa de Tito, que crece con las casitas terminadas ---------- */
function shellTex(){const c=(SHELLC[S.tito&&S.tito.shell]||SHELLC.naranja)[0];return canvasTex(128,128,()=>{shellIcon(64,64,52)},'shell:'+titoKind()+':'+c)}
function makeHouse(lvl,o={}){const g=new THREE.Group();g.userData.id='casaTito';const h=new Date().getHours(),lit=h>=19||h<7,win=lit?'#FFE08A':'#BFEAF7';
  const two=lvl>=2,H1=two?3.6:2.1;
  mk(Cyl(3.4,3.5,.25,40),'#9FD88A',{p:[0,.12,0],s:[1,1,.75],to:g,ol:.04});
  mk(Box(3.1,H1,2.4),'#FFF3D6',{p:[0,.25+H1/2,0],to:g,ol:.06});
  mk(prism(3.9,1.7,2.9),'#FF8A7A',{p:[0,.25+H1,0],to:g,ol:.06});
  mk(Box(.5,1.1,.5),'#C98A4B',{p:[.8,.25+H1+1.0,-.4],to:g,ol:.04});
  const smoke=[];for(let i=0;i<3;i++)smoke.push(mk(Sph(.22,10,8),'#FFFFFF',{p:[.8,.25+H1+1.7,-.4],to:g,ol:.025,cs:false}));
  g.userData.emb=plane(shellTex(),.8,.8,{p:[0,.25+H1+.65,1.46],to:g});
  mk(Box(.75,1.25,.12),'#C98A4B',{p:[0,.25+.62,1.22],to:g,ol:.04});mk(Sph(.06,8,6),K,{p:[.22,.9,1.3],ol:0,to:g});
  const wins=[[-1,1.3],[1,1.3]];if(two)wins.push([-1,2.85],[1,2.85]);
  for(const [x,y] of wins){mk(Box(.62,.56,.1),win,{p:[x,y,1.22],to:g,ol:.035,cs:false});mk(Box(.62,.05,.12),K,{p:[x,y,1.24],ol:0,to:g});mk(Box(.05,.56,.12),K,{p:[x,y,1.24],ol:0,to:g})}
  if(two){mk(Box(1.7,.12,.6),'#C98A4B',{p:[0,2.25,1.45],to:g,ol:.03});for(let i=0;i<3;i++)flower3(g,-.5+i*.5,1.55,FLC[i+2],.55,2.3)}
  if(lvl>=1){for(const sd of[-1,1]){for(let i=0;i<4;i++)mk(Box(.14,.6,.1),'#FFF6E0',{p:[sd*(1.1+i*.5),.5,2.1],to:g,ol:.025});mk(Box(1.75,.1,.08),'#FFF6E0',{p:[sd*1.85,.62,2.12],to:g,ol:.02})}
    for(let i=0;i<8;i++)flower3(g,-2.8+i*.8,2.45+(i%2)*.2,FLC[i%7],.7,.2)}
  if(lvl>=3){const tw=grp(g,[2.05,0,-.4]);mk(Cyl(.62,.62,4.6,20),'#FFE3B0',{p:[0,2.55,0],to:tw,ol:.05});mk(Cone(.85,1.5,20),'#9B8AD9',{p:[0,5.6,0],to:tw,ol:.05});
    mk(Cyl(.03,.03,1.1,6),K,{p:[0,6.8,0],ol:0,to:tw});
    const fg=new THREE.PlaneGeometry(.8,.45,8,1);fg.translate(.4,0,0);const flag=new THREE.Mesh(fg,new THREE.MeshToonMaterial({color:'#FF6B5E',gradientMap:GRAD,side:THREE.DoubleSide}));flag.position.set(0,7.1,0);tw.add(flag);g.userData.flag=flag;
    mk(Box(.36,.5,.1),'#BFEAF7',{p:[0,2.6,.6],to:tw,ol:.03})}
  if(lvl>=4){const st=mk(starGeo(.55,.18),'#FFC93C',{p:[0,.25+H1+2.3,0],to:g,ol:.04});g.userData.star=st;
    ['#FF6B5E','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9'].forEach((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(4.6-i*.22,.12,6,40,PI),M(c));m.position.set(0,.3,-1.9);g.add(m)})}
  const own=k=>S.owned&&S.owned[k];
  if(own('farol'))spr(picTex('farol'),1.5,1.5,{p:[-2.7,.9,1],to:g});
  if(own('fuente'))spr(picTex('fuente'),1.3,1.3,{p:[-2.3,.75,1.9],to:g});
  if(own('casitaPerro')){spr(picTex('casitaPerro'),1.3,1.3,{p:[2.7,.75,1.2],to:g});spr(picTex('perro'),.75,.75,{p:[3.2,.45,1.8],to:g})}
  if(own('banco'))spr(picTex('banco'),1.1,1.1,{p:[-1.5,.55,2.2],to:g});
  spr(pillTex(tx('Casa de Tito'),'#FFA94D','#fff',72),3.4,.85,{p:[0,.55,2.5],to:g});
  const hit=new THREE.Mesh(Box(5,5,4),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=2.2;g.add(hit);
  g.userData.anim=(shake)=>{for(let i=0;i<3;i++){const k=(T*.35+i/3)%1,s=smoke[i];s.position.set(.8+Math.sin(T+i)*.2+k*.5,.25+H1+1.7+k*1.8,-.4);s.scale.setScalar(.6+k*1.4);s.visible=k<.92}
    if(g.userData.star)g.userData.star.rotation.y=Math.sin(T*1.5)*.55;
    if(g.userData.flag){const p=g.userData.flag.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(T*6-x*6)*.12*x)}p.needsUpdate=true}
    const sk=shake?Math.sin(T*40)*.15*Math.max(0,1-(T-shake)/1.4):0;g.children[0].parent.rotation.z=sk*.15};
  return g}

/* ---------- el mundo activo ---------- */
function newWorld(o={}){const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(o.fov||40,16/9,.1,400);
  const w={sc,cam,fov:o.fov||40,pick:[],upd:[],kind:o.kind};
  sc.background=new THREE.Color(o.bg||'#BFE9F8');if(o.fog)sc.fog=new THREE.Fog(o.bg||'#BFE9F8',o.fog[0],o.fog[1]);
  sc.add(new THREE.HemisphereLight(0xffffff,0xb7d39c,.44));sc.add(new THREE.AmbientLight(0xffffff,.12));
  const sun=new THREE.DirectionalLight(0xfff4e0,.48);sun.position.set(-14,30,18);sun.castShadow=true;const s=o.shadow||24;
  Object.assign(sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:90});sun.shadow.mapSize.setScalar(SHM);sun.shadow.bias=-.0006;sun.shadow.radius=3;sc.add(sun);sc.add(sun.target);w.sun=sun;
  fitCam(w);return w}
// las piezas diminutas (pétalos, piedritas, puntitos) no proyectan sombra: no se nota y ahorra una pasada de dibujo por pieza
function trimShadows(w){const s=new THREE.Vector3(),keep=new Set();if(w.tito)w.tito.traverse(o=>keep.add(o));w.sc.updateMatrixWorld(true);
  w.sc.traverse(o=>{if(!o.isMesh||!o.castShadow||keep.has(o))return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();o.getWorldScale(s);
    if(g.boundingSphere.radius*Math.max(s.x,s.y,s.z)<.3)o.castShadow=false})}
function setWorld(w){if(W3&&W3!==w)disposeWorld(W3);W3=w;fitCam(w);FPS.last=0;trimShadows(w)}
// también se liberan las texturas de usar y tirar (las guardadas en TXC se reutilizan) y el mapa de sombras del sol;
// sin esto cada visita a una escena dejaba en la GPU ~11 texturas y una sombra de 2048x2048
function disposeWorld(w){const kept=new Set(Object.values(TXC)),tx=t=>{if(t&&t.isTexture&&!kept.has(t))t.dispose()};
  w.sc.traverse(o=>{if(o.geometry&&!o.geometry.userData.keep&&o.geometry!==(SHELL&&SHELL.g))o.geometry.dispose();
    if(o.isLight&&o.shadow&&o.shadow.map){o.shadow.map.dispose();o.shadow.map=null}
    for(const m of [].concat(o.material||[]))tx(m.map);if(o.material&&o.material.isSpriteMaterial)o.material.dispose()});tx(w.sc.background)}
// cámara: base + pequeño paralaje con el mouse
function camRig(w,pos,look,par=1){w.cb={pos:pos.clone(),look:look.clone(),par};w.cam.position.copy(pos);w.cam.lookAt(look);w.camT={pos:pos.clone(),look:look.clone()};w.camL=look.clone()}
function camTick(w,dt){const c=w.cb;if(!c)return;const k=1-Math.exp(-dt*3);
  const mx=mouseOn?(MX-800)/800:0,my=mouseOn?(MY-450)/450:0;
  const tp=w.camT.pos.clone().add(V3(mx*c.par,-my*c.par*.5,0)),tl=w.camT.look;
  w.cam.position.lerp(tp,k);w.camL.lerp(tl,k);w.cam.lookAt(w.camL)}

// calidad adaptable: si el aparato no llega a ~24 cuadros por segundo en 3D, se baja la resolución (nunca se sube);
// debajo de 20 cuadros el juego entero va más lento porque el paso de tiempo está topado en 0,05 s
const FPS={n:0,t0:0,last:0};
function fpsTick(){const now=performance.now();if(now-FPS.last>1000||document.hidden){FPS.n=0;FPS.t0=now}FPS.last=now;FPS.n++;
  if(now-FPS.t0>=4000){const fps=FPS.n*1000/(now-FPS.t0);if(fps<24&&PRK>.5){PRK=Math.max(.5,PRK*.75);if(FPS.up)FPS.noUp=true;rs()}
    // si fue un tirón pasajero (cargando, otra app) y ahora va sobrado, la nitidez vuelve a subir; si vuelve a ir lento después de subir, se queda baja
    else if(fps>=55&&PRK<1&&!FPS.noUp){PRK=Math.min(1,PRK/.75);FPS.up=true;rs()}
    FPS.n=0;FPS.t0=now}}
R3frame=function(dt){if(!W3||!scene||!scene.three)return;fpsTick();
  for(const f of W3.upd)try{f(dt)}catch(e){console.error(e)}camTick(W3,dt);R.render(W3.sc,W3.cam)};
// Tito camina hasta un punto y después pasa algo (entrar a un lugar)
function walkTo(w,tito,to,cb,o={}){const from=tito.position.clone(),d=from.distanceTo(to),dur=clamp(d/(o.speed||9),.35,o.max||1.1);
  if(tito.userData.rest==null)tito.userData.rest=tito.rotation.y;
  w.walk={t0:T,dur,from,to:to.clone(),cb,free:!!o.free};const dx=to.x-from.x,dz=to.z-from.z;if(Math.hypot(dx,dz)>.1)tito.userData.face=Math.atan2(-dz,dx);
  if(o.zoom){w.camT.pos=w.cb.pos.clone().lerp(to.clone().add(o.zoom),.35);w.camT.look=w.cb.look.clone().lerp(to,.35)}}
// tocar el suelo vacío (después de pickAt): Tito camina hasta ahí, solo por la cara de arriba del suelo (nunca al mar ni al borde)
// al tocarlos, los árboles se sacuden, los arbustos se aplastan, las flores saltan y las piedras botan; luego se calman solos; en el mapa, las zonas y las casitas
const WOBK=o=>o.userData.tree||o.userData.bush||o.userData.flower||o.userData.rock||o.userData.boat||o.userData.balloon||o.userData.gift||o.userData.letter||o.userData.sign||o.userData.mount||o.userData.gull||o.userData.bfly||o.userData.mush||o.userData.bus||o.userData.snowman||o.userData.pinata||o.userData.owl||o.userData.phone||o.userData.frog||o.userData.crab||o.userData.cake||o.userData.lady||o.userData.bird||o.userData.peng||o.userData.squir||o.userData.burrow||o.userData.clock||o.userData.igloo||o.userData.drum||o.userData.post||o.userData.ants||o.userData.light||o.userData.whale||o.userData.dolph||o.userData.xtree||o.userData.pump||o.userData.leafs||o.userData.kite||o.userData.hab||o.userData.tea||o.userData.jack||o.userData.can||o.userData.sled||o.userData.wpk||o.userData.ball||o.userData.guard||o.userData.cann||o.userData.goat||o.userData.palm||o.userData.sunf||o.userData.parrot||o.userData.flag||o.userData.bub||o.userData.nest||o.userData.marm||o.userData.scare||o.userData.umb||o.userData.sunb||o.userData.sandc||o.userData.abc;
function wobInit(w){w.trees=[];w.sc.traverse(o=>{if(WOBK(o)){o.userData.s0=o.scale.x;o.userData.y0=o.position.y;w.trees.push(o)}});if(!w.trees.length)return;
  w.upd.push(()=>{for(const t of w.trees){if(t.userData.wobAt&&T>=t.userData.wobAt){t.userData.wob=T;t.userData.wobAt=0}/* reacción en cadena programada */const k=t.userData.wob;if(k==null)continue;const e=T-k,s0=t.userData.s0,u=t.userData;
    if(u.pinata){if(e>2.6)u.wob=null;continue}if(u.boat||u.gull||u.bfly||u.bus||u.crab||u.cake||u.lady||u.bird||u.peng||u.squir||u.burrow||u.clock||u.igloo||u.post||u.ants||u.light||u.whale||u.dolph||u.xtree||u.pump||u.leafs||u.kite||u.hab||u.tea||u.jack||u.can||u.sled||u.wpk||u.ball||u.guard||u.cann||u.goat||u.palm||u.sunf||u.parrot||u.flag||u.bub||u.nest||u.marm||u.scare||u.umb||u.sunb||u.sandc||u.abc){if(e>(u.dur||1.6))u.wob=null;continue}// los barquitos se animan en su propio paso
    if(e>1.6){t.rotation.x=t.rotation.z=0;if(u.bush||u.mush||u.drum)t.scale.setScalar(s0);t.position.y=u.y0;if(u.flower){u.flower.rotation.z=0;u.flower.scale.setScalar(1)}t.userData.wob=null;continue}
    if(u.drum){const a=Math.abs(Math.sin(e*22))*.12*Math.exp(-e*2.5);t.scale.set(s0*(1+a*.4),s0*(1-a),s0*(1+a*.4))}else if(u.bush||u.mush){const a=Math.sin(e*14)*(u.mush?.3:.2)*Math.exp(-e*3.2);t.scale.set(s0*(1+a*.5),s0*(1-a),s0*(1+a*.5))}// los arbustos se aplastan y rebotan
    else if(u.flower){const q=Math.min(e/.7,1);t.position.y=u.y0+Math.sin(q*PI)*.25*s0;u.flower.rotation.z=q*PI*2;u.flower.scale.setScalar(1+Math.sin(q*PI)*.5)}// las flores dan un saltito girando
    else if(u.balloon){const q=Math.min(e/1.4,1);t.position.y=u.y0+Math.sin(q*PI)*.9;t.rotation.z=Math.sin(e*7)*.18*Math.exp(-e*2)}// los globos suben y vuelven
    else if(u.gift||u.letter){const q=Math.min(e/.6,1);t.position.y=u.y0+Math.sin(q*PI)*.7;t.rotation.z=Math.sin(q*PI*2)*.15}// los regalos y las letras saltan
    else if(u.mount||u.snowman||u.owl||u.frog){}else if(u.phone){t.rotation.z=Math.sin(e*40)*.05*Math.exp(-e*2.2)}// la cabina tiembla al sonar// las montañas no se mueven: responden con eco
    else if(u.rock){t.position.y=u.y0+Math.abs(Math.sin(e*9))*.3*Math.exp(-e*4)}// las piedras botan
    else{const a=Math.sin(e*16)*.13*Math.exp(-e*2.6);t.rotation.z=a;t.rotation.x=a*.4}}})}
// tras pickAt: lo que vuela (mariposas, gaviotas) va por delante de las casitas, así que se mira primero
function flyTap(w,x,y){if(!w.fly)w.fly=(w.trees||[]).filter(t=>t.userData.bfly||t.userData.gull||t.userData.crab||t.userData.lady||t.userData.bird||t.userData.xtree||t.userData.pump||t.userData.kite||t.userData.hab||t.userData.sled||t.userData.wpk||t.userData.ball||t.userData.goat||t.userData.palm||t.userData.bub||t.userData.nest||t.userData.marm||t.userData.scare||t.userData.umb||t.userData.sunb||t.userData.sandc||t.userData.snowman);return !!(w.fly.length&&RC.intersectObjects(w.fly,true).length)&&wobTap(w,x,y)}
// tras pickAt (que deja RC apuntando al toque): ¿se tocó un árbol?
function wobTap(w,x,y){const th=w.trees&&w.trees.length&&RC.intersectObjects(w.trees,true)[0];let t=th&&th.object;while(t&&!WOBK(t))t=t.parent;
  if(!t)return false;const u=t.userData;if(u.wob!=null&&T-u.wob<.3)return true;u.wob=T;if(w.tito){const v=new THREE.Vector3();t.getWorldPosition(v);w.tito.userData.lk={p:v,t:T}}// Tito mira hacia lo que se ha tocado
  if(u.bush){dropParts(x,y-20,4,sceneName==='montana'?['#FFFFFF','#EAF4FF']:['#7CC86E','#5DAA52'],sceneName==='montana'?'d':'c');tone(330,.18,'sine',.14,1.8);noise(.18,.06,1800)}else if(u.flower){dropParts(x,y-15,4,['#F7B6CF','#FFE07A','#C9B6F2','#FFFFFF'],'d');const f=pick([523,587,659,784,880]);tone(f,.3,'sine',.12);tone(f*2,.2,'sine',.05,1,.06)}
  else if(u.rock){for(let i=0;i<5;i++)parts.push({x:x+rnd(-25,25),y:y+rnd(0,15),vx:rnd(-60,60),vy:rnd(-50,-10),life:rnd(.4,.7),t:0,c:pick(['#CFC6B8','#E3DCD0']),r:rnd(5,9),rot:0,k:'d',g:60});/* polvito al botar la piedra */tone(150,.09,'triangle',.12,.7);noise(.06,.1,700)}else if(u.pinata){allTap(w,t,'fie4',x,y,4);chainWob(w,'jack',.7,0,1);tone(300,.4,'sine',.1,3,.7);/* al caer los caramelos salta el payaso de la caja sorpresa */noise(.08,.22,900);tone(330,.08,'triangle',.12,1.2,.05);for(let i=0;i<5;i++)tone(1200+i*180,.06,'sine',.05,1,.25+i*.07)}else if(u.snowman){allTap(w,t,'snowman',x,y);dropParts(x,y-40,8,['#FFFFFF','#EAF4FF'],'d');tone(660,.1,'triangle',.1,1.4);tone(990,.14,'triangle',.08,1,.12);noise(.25,.05,3000,.05)}else if(u.bus){allTap(w,t,'ing4',x,y,4);for(let i=0;i<5;i++)parts.push({x:x+rnd(-40,40),y:y+30,vx:rnd(-25,25),vy:rnd(-60,-30),life:rnd(.8,1.2),t:0,c:pick(['#CFCFCF','#E4E4E4','#B8B8B8']),r:rnd(8,13),rot:0,k:'d',g:-20});/* al pitar, el autobús echa unas nubecitas de humo */chainWob(w,'abc',.3,.08,10);/* el pitido del autobús hace bailar las letras que flotan */tone(523,.12,'square',.05);tone(523,.14,'square',.05,1,.18)}else if(u.mush){allTap(w,t,'mush',x,y);for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y+rnd(-30,-5),vx:rnd(-40,40),vy:rnd(-90,-40),life:rnd(.7,1.1),t:0,c:pick(['#FFF6C8','#F3E9B5','#FFFFFF']),r:rnd(4,7),rot:0,k:'d',g:-20});/* la seta suelta una nubecita de esporas */if(!skyNow().night){chainWob(w,'ants',.35,0,1);for(let i=0;i<6;i++)tone(2000+i*150,.03,'square',.02,1,.35+i*.05)}/* el boing de la seta dispersa a las hormigas */tone(220,.2,'sine',.14,2.2);tone(440,.12,'triangle',.06,1.5,.12)}else if(u.phone){allTap(w,t,'ing4',x,y,4);chainWob(w,'post',1.1,0,1);noise(.12,.08,2500,1.1);tone(880,.1,'triangle',.05,1.5,1.2);/* después del ring-ring sale volando una carta del buzón */for(const d of[0,.5])for(let i=0;i<6;i++)tone(i%2?1250:1000,.05,'square',.04,1,d+i*.05)}else if(u.frog){allTap(w,t,'jar4',x,y,4);if(!skyNow().night)for(let i=0;i<7;i++)parts.push({x:x+rnd(-25,25),y:y+rnd(0,10),vx:rnd(-110,110),vy:rnd(-260,-120),life:rnd(.4,.7),t:0,c:pick(['#7FC8F8','#BFE6FF','#FFFFFF']),r:rnd(4,7),rot:0,k:'d',g:900});/* salpicadura al saltar la rana */if(!skyNow().night){chainWob(w,'burrow',.6,0,1);tone(700,.08,'sine',.07,1.8,.6)}/* el croar hace asomarse al conejito */tone(180,.12,'square',.06,.7);tone(150,.16,'square',.06,.7,.18)}else if(u.abc){const f=[523,587,659,784,880,1046,1175,1318,1568,1760][u.abc-1];tone(f,.25,'triangle',.1);tone(f*2,.15,'sine',.04,1,.05);noise(.05,.05,4000,.1)}else if(u.sunb){noise(.6,.06,2500);tone(660,.1,'sine',.06,1.5,.2)}else if(u.sandc){[784,988,1175].forEach((f,i)=>tone(f,.12,'triangle',.06,1,i*.1))}else if(u.scare){allTap(w,t,'jar4',x,y,4);dropParts(x,y-40,6,['#E8C75A','#D9B140','#F2DC8A'],'c');/* al tocar el espantapájaros caen unas pajitas */if(!skyNow().night){chainWob(w,'bfly',.45,.12,4);[1568,2093,2637].forEach((f,i)=>tone(f,.1,'sine',.035,1,.45+i*.08))}/* el cuervo al volar espanta a las mariposas */noise(.3,.08,1800);tone(700,.18,'sawtooth',.04,.7,.2);tone(650,.2,'sawtooth',.04,.7,.45)}else if(u.umb){allTap(w,t,'ing4b',x,y,4);tone(600,.08,'triangle',.06,1.5);noise(1.8,.05,6000,.3)}else if(u.nest){allTap(w,t,'bos4',x,y,4);for(let i=0;i<4;i++)parts.push({x:x+rnd(-15,15),y:y-10,vx:rnd(-40,40),vy:rnd(-80,-40),life:rnd(1,1.5),t:0,c:pick(['#FFF3B0','#FFE07A','#FFFFFF']),r:rnd(4,6),rot:rnd(0,6),k:'c',g:30});/* plumitas de los pollitos */if(!skyNow().night){chainWob(w,'squir',1.1,0,1);tone(1500,.05,'triangle',.05,1.2,1.1);tone(1900,.06,'triangle',.04,1,1.24)}/* la ardilla salta de alegría al ver a los pollitos */for(let i=0;i<3;i++){noise(.03,.08,3500,i*.15);tone(2600+i*200,.06,'sine',.05,1.2,.35+i*.15);tone(2800+i*200,.06,'sine',.05,1.2,.55+i*.15)}}else if(u.marm){allTap(w,t,'mon4',x,y,4);for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y+10,vx:rnd(-100,100),vy:rnd(-200,-90),life:rnd(.4,.7),t:0,c:pick(['#8A5A3A','#A8774E','#FFFFFF']),r:rnd(4,7),rot:0,k:'d',g:800});/* tierra y nieve al esconderse la marmota */if(!skyNow().night){chainWob(w,'goat',.55,0,1);tone(520,.35,'sawtooth',.035,.95,.6)}/* la cabra contesta al silbido de la marmota */tone(2400,.35,'sine',.07,1.25);noise(.15,.06,2000,.32)}else if(u.bub){for(let i=0;i<6;i++){const an=i/6*PI*2;parts.push({x:x+Math.cos(an)*12,y:y+Math.sin(an)*12,vx:Math.cos(an)*rnd(80,130),vy:Math.sin(an)*rnd(80,130),life:rnd(.3,.5),t:0,c:pick(['#CFF0FF','#E9D8FF','#FFFFFF']),r:rnd(3,4),rot:0,k:'d',g:100})}/* al explotar, la pompa suelta gotitas en círculo */tone(900+Math.random()*500,.06,'sine',.1,.4);noise(.04,.06,3000);w.bubN=(w.bubN||0)+1;if(w.bubN%5===0)titoCheer(x,y)}else if(u.flag){allTap(w,t,'ing4b',x,y,4);chainWob(w,'guard',.9,0,1);/* con la fanfarria el guardia saluda */[523,523,523,659,784].forEach((f,i)=>tone(f,i<3?.1:.25,'square',.04,1,[0,.12,.24,.38,.6][i]))}else if(u.parrot){if(sceneName==='cofre')allTap(w,t,'cof2',x,y,2);if(!skyNow().night){dropParts(x,y-40,5,['#E8483C','#3FAE5A','#FFD23C'],'c');/* al aletear el loro suelta unas plumas de colores */chainWob(w,'crab',.6,0,1);for(let i=0;i<4;i++)noise(.03,.1,4200,.6+i*.09)}/* el cangrejo contesta al loro moviendo las pinzas */squawk()}else if(u.palm){allTap(w,t,'map4',x,y,4);for(let i=0;i<4;i++)parts.push({x:x+rnd(-40,40),y:y-80+rnd(-10,10),vx:rnd(-40,40),vy:rnd(-30,10),life:rnd(1,1.5),t:0,c:pick(['#5DAA52','#7CC86E']),r:rnd(7,11),rot:rnd(0,6),k:'c',g:180});/* caen hojas de la palmera */if(!skyNow().night){chainWob(w,'crab',.75,0,1);for(let i=0;i<4;i++)noise(.03,.1,4200,.75+i*.09)}/* el coco al caer asusta al cangrejo */noise(.5,.1,2000);tone(300,.08,'sine',.12,.6,.58);tone(260,.06,'sine',.08,.6,.85);tone(240,.05,'sine',.05,.6,1.05)}else if(u.sunf){allTap(w,t,'jar4',x,y,4);if(!skyNow().night){for(let i=0;i<7;i++)parts.push({x:x+rnd(-30,30),y:y-40+rnd(-15,15),vx:rnd(-40,40),vy:rnd(-40,-10),life:rnd(1,1.5),t:0,c:pick(['#FFD23C','#FFE680','#F2B830']),r:rnd(3,5),rot:0,k:'d',g:20});/* al girar los pétalos, el girasol suelta polen */chainWob(w,'bee',.4,.25,4);tone(240,.4,'sawtooth',.03,1.15,.4)}/* las abejas acuden al girasol */[659,784,988,1318].forEach((f,i)=>tone(f,.14,'sine',.07,1,i*.1))}else if(u.cann){chainWob(w,'balloon',.3,.12,12);/* el ¡pum! hace bailar los globos de la guirnalda */tone(90,.3,'sine',.25,.4);noise(.3,.2,900);for(let i=0;i<6;i++)tone(1400+i*200,.05,'triangle',.04,1,.25+i*.06)}else if(u.goat){allTap(w,t,'mon4',x,y,4);if(!skyNow().night)setTimeout(()=>{for(let i=0;i<6;i++)parts.push({x:x+rnd(-30,30),y:y+30,vx:rnd(-70,70),vy:rnd(-50,-10),life:rnd(.35,.6),t:0,c:pick(['#D8CDBE','#C8BCAA']),r:rnd(5,8),rot:0,k:'d',g:40})},700);/* polvito al aterrizar la cabra */if(!skyNow().night){chainWob(w,'snowman',.6,.3,2);tone(660,.1,'triangle',.06,1.4,.6);tone(660,.1,'triangle',.06,1.4,.9)}/* el salto de la cabra hace saltar el sombrero de los muñecos de nieve */tone(520,.35,'sawtooth',.04,.95,.1);tone(500,.1,'sawtooth',.03,1,.18);tone(510,.1,'sawtooth',.03,1,.26)}else if(u.ball){if(sceneName==='casita')allTap(w,t,'cas3',x,y,3);chainWob(w,'lady',.35,0,1);tone(1760,.06,'sine',.05,1,.35);tone(2349,.08,'sine',.04,1,.42);/* la pelota asusta a la mariquita, que da un saltito volando */[0,.6,1.2].forEach((d,i)=>tone(260-i*30,.12,'sine',.14/(1+i*.6),2,d))}else if(u.guard){allTap(w,t,'ing4',x,y,4);[800,1050,1300,1550].forEach(d=>setTimeout(()=>{for(let i=0;i<3;i++)parts.push({x:x+rnd(-20,20),y:y+40,vx:rnd(-50,50),vy:rnd(-40,-10),life:rnd(.3,.5),t:0,c:'#D8CDBE',r:rnd(4,7),rot:0,k:'d',g:40})},d));/* polvito a cada paso del guardia */chainWob(w,'flag',1.6,0,1);/* al marcar el paso del guardia ondea la bandera */tone(784,.12,'square',.04);tone(1046,.25,'square',.04,1,.13);for(let i=0;i<4;i++){tone(110,.1,'sine',.2,.6,.8+i*.25);noise(.04,.1,1200,.8+i*.25)}}else if(u.sled){for(let i=0;i<10;i++)parts.push({x:x+rnd(-30,30),y:y+rnd(0,20),vx:rnd(-160,160),vy:rnd(-220,-80),life:rnd(.5,.9),t:0,c:pick(['#FFFFFF','#EAF4FF']),r:rnd(5,9),rot:0,k:'d',g:600});/* el trineo levanta nieve al arrancar */if(!skyNow().night){chainWob(w,'peng',1.2,0,1);tone(900,.08,'square',.04,1.4,1.2);tone(1100,.1,'square',.04,.8,1.3)}/* el pingüino salta al ver pasar el trineo */noise(1.6,.08,2200,.05);tone(784,.12,'triangle',.05,1.3,.1);tone(988,.14,'triangle',.05,.8,1)}else if(u.wpk){allTap(w,t,'bos4',x,y,4);if(!skyNow().night)for(let i=0;i<5;i++)parts.push({x:x+rnd(-10,10),y:y+rnd(-10,10),vx:rnd(-120,120),vy:rnd(-160,-60),life:rnd(.5,.8),t:0,c:pick(['#A0703C','#C99A5E']),r:rnd(5,8),rot:rnd(0,6),k:'c',g:700});/* astillas del toc-toc */for(let i=0;i<9;i++){tone(900,.03,'square',.05,.6,i*.14);noise(.02,.12,1500,i*.14)}if(!skyNow().night){chainWob(w,'nest',1.3,0,1);/* el toc-toc despierta a los pollitos del nido */for(let i=0;i<3;i++){tone(2600+i*200,.06,'sine',.05,1.2,1.65+i*.15);tone(2800+i*200,.06,'sine',.05,1.2,1.85+i*.15)}}}else if(u.jack){allTap(w,t,'fie4',x,y,4);for(let i=0;i<8;i++)parts.push({x:x+rnd(-20,20),y:y-40,vx:rnd(-120,120),vy:rnd(-280,-160),life:rnd(1,1.4),t:0,c:pick(['#FF5A5F','#FFD23C','#4CC3FF','#7BD66B','#C08CF0']),r:rnd(6,9),rot:rnd(0,6),k:'c',g:300});/* al saltar el payaso sale confeti */chainWob(w,'pinata',.45,0,1);noise(.08,.18,900,.45);for(let i=0;i<5;i++)tone(1200+i*180,.06,'sine',.04,1,.7+i*.07);/* el payaso da a la piñata, que suelta caramelos */[523,587,659,698].forEach((f,i)=>tone(f,.08,'triangle',.06,1,i*.06));tone(300,.4,'sine',.12,3,.25);tone(1200,.1,'sine',.05,1.2,.5)}else if(u.can){chainWob(w,'flower',.8,.08,5);/* las flores dan un saltito al recibir el agua */noise(1.2,.07,4500,.25);tone(1046,.08,'sine',.04,1,.3);tone(1318,.08,'sine',.04,1,.55);if(!skyNow().night){chainWob(w,'frog',.7,0,1);tone(180,.12,'square',.06,.7,.7);tone(150,.16,'square',.06,.7,.88)}/* al regar, la rana de la charca salta y croa */}else if(u.hab){allTap(w,t,'map4',x,y,4);for(let i=0;i<6;i++)parts.push({x:x+rnd(-12,12),y:y+10,vx:rnd(-30,30),vy:rnd(-90,-50),life:rnd(.5,.8),t:0,c:pick(['#FFB43C','#FF7A2E','#FFE07A']),r:rnd(4,6),rot:0,k:'d',g:-30});/* al encender la llama del globo saltan chispitas */chainWob(w,'gull',.8,.2,3);tone(1300,.14,'triangle',.05,.6,.8);/* el fuego del globo hace dar volteretas a las gaviotas */noise(1,.12,900);tone(196,.8,'sine',.06,1.1,.1)}else if(u.tea){allTap(w,t,'ing4b',x,y,4);chainWob(w,'phone',1.4,0,1);for(let i=0;i<6;i++)tone(i%2?1250:1000,.05,'square',.03,1,1.4+i*.05);/* cuando silba la tetera suena el teléfono */tone(1400,1.1,'sine',.05,1.25,.15);tone(2100,1,'sine',.025,1.2,.2);noise(1.2,.05,5000,.1)}else if(u.leafs){if(!skyNow().night){chainWob(w,'squir',.6,0,1);tone(1500,.05,'triangle',.06,1.2,.6);tone(1900,.06,'triangle',.05,1,.74)}/* el ruido de las hojas asusta a la ardilla, que salta */for(let i=0;i<5;i++)noise(.12,.1,2600+i*400,i*.06);noise(.5,.05,3000,1.2)}else if(u.kite){chainWob(w,'bfly',.4,.15,4);[1568,2093,2637].forEach((f,i)=>tone(f,.1,'sine',.04,1,.4+i*.08));/* las mariposas suben a jugar con la cometa */noise(.9,.08,1600);tone(523,.18,'sine',.07,1.5,.1);tone(784,.2,'sine',.06,1.3,.5)}else if(u.pump){allTap(w,t,'pump',x,y);for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y-30,vx:rnd(-90,90),vy:rnd(-260,-140),life:rnd(.6,1),t:0,c:pick(['#FF9A2E','#FFC93C','#8B5CC7']),r:rnd(7,11),rot:0,k:'s'});/* chispas de Halloween al saltar la tapa */tone(520,.5,'sine',.1,.6);tone(780,.08,'triangle',.06,1.2,.55);tone(980,.08,'triangle',.06,1.2,.65);tone(1180,.1,'triangle',.05,1.2,.75)}else if(u.xtree){for(let i=0;i<8;i++){tone(2093+(i%3)*300,.08,'triangle',.04,1,i*.09);noise(.04,.05,6000,i*.09)}}else if(u.whale){for(let i=0;i<10;i++)parts.push({x:x+rnd(-15,15),y:y-30,vx:rnd(-80,80),vy:rnd(-300,-180),life:rnd(.9,1.2),t:0,c:pick(['#BFE6FF','#8FD0FA','#FFFFFF']),r:rnd(4,7),rot:0,k:'d',g:500});/* el chorro de la ballena salpica gotitas */chainWob(w,'boat',.6,.2,3);tone(392,.18,'triangle',.06,1,.6);/* el chorro de la ballena mece los barquitos */tone(140,.8,'sine',.14,.7);noise(.9,.1,1200,.2)}else if(u.dolph){tone(2200,.12,'sine',.06,1.4);tone(2600,.12,'sine',.05,1.3,.12);noise(.25,.08,1500,1)}else if(u.ants){for(let i=0;i<6;i++)parts.push({x:x+rnd(-25,25),y:y+10,vx:rnd(-70,70),vy:rnd(-150,-80),life:rnd(.5,.8),t:0,c:pick(['#A0703F','#7A522C','#C2925A']),r:rnd(3,5),rot:0,k:'d',g:500});/* al dispersarse las hormigas saltan granitos de tierra */for(let i=0;i<6;i++)tone(2000+i*150,.03,'square',.025,1,i*.05)}else if(u.light){allTap(w,t,'map4',x,y,4);setTimeout(()=>sparkles(x,y-60,6),300);/* al sonar la sirena, la luz del faro echa destellos */chainWob(w,'whale',1,0,1);chainWob(w,'dolph',1.6,0,1);tone(140,.8,'sine',.1,.7,1);noise(.25,.06,1500,2.6);/* la sirena del faro hace salir a la ballena y al delfín */tone(110,.9,'sawtooth',.06,.98);tone(82,.9,'sine',.12,.98,.05)}else if(u.post){allTap(w,t,'ing4b',x,y,4);chainWob(w,'bus',1.3,0,1);tone(523,.12,'square',.04,1,1.3);tone(523,.14,'square',.04,1,1.48);/* el autobús pita al ver volar la carta */noise(.12,.1,2500);tone(880,.1,'triangle',.07,1.5,.1);tone(1320,.12,'triangle',.06,1,1.3)}else if(u.igloo){allTap(w,t,'mon4',x,y,4);setTimeout(()=>sparkles(x,y-40,8),500);/* la foca aplaude con estrellitas */if(!skyNow().night){chainWob(w,'peng',1.1,0,1);tone(900,.08,'square',.04,1.4,1.1);tone(1100,.1,'square',.04,.8,1.2)}/* el pingüino aplaude con la foca dando un salto */tone(500,.1,'square',.05,1.3,.45);tone(500,.1,'square',.05,1.3,.75);tone(500,.1,'square',.05,1.3,1.05)}else if(u.drum){allTap(w,t,'fie4',x,y,4);[0,180,360,500,620].forEach(d=>setTimeout(()=>sparkles(x+rnd(-30,30),y-30,3),d));/* estrellitas a cada golpe del tambor */chainWob(w,'gift',.2,.13,8);/* al ritmo del tambor saltan los regalos */for(const [d,f] of[[0,90],[.18,90],[.36,120],[.5,90],[.62,150]]){tone(f,.16,'sine',.25,.5,d);noise(.05,.08,1800,d)}}else if(u.burrow){allTap(w,t,'jar4',x,y,4);if(!skyNow().night)for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y+10,vx:rnd(-110,110),vy:rnd(-190,-80),life:rnd(.4,.7),t:0,c:pick(['#8A5A3A','#A8774E']),r:rnd(4,7),rot:0,k:'d',g:800});/* tierra al salir el conejito */if(!skyNow().night){chainWob(w,'frog',.7,0,1);tone(180,.12,'square',.05,.7,.7);tone(150,.16,'square',.05,.7,.88)}/* la rana salta al ver salir al conejito */tone(700,.08,'sine',.08,1.8);tone(1300,.1,'sine',.06,.6,.6)}else if(u.clock){allTap(w,t,'ing4',x,y,4);[0,550,1100,1650].forEach(d=>setTimeout(()=>sparkles(x,y-120,4),d));/* estrellitas con cada campanada */chainWob(w,'guard',2.3,0,1);/* tras las campanadas el guardia saluda y marca el paso */for(let i=0;i<4;i++){tone(110,.1,'sine',.18,.6,3.1+i*.25);noise(.04,.1,1200,3.1+i*.25)}tone(659,.6,'sine',.12);tone(523,.6,'sine',.12,1,.55);tone(587,.6,'sine',.12,1,1.1);tone(392,.9,'sine',.12,1,1.65)}else if(u.peng){allTap(w,t,'mon4',x,y,4);if(!skyNow().night)for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y+20,vx:rnd(-90,90),vy:rnd(-140,-60),life:rnd(.4,.7),t:0,c:pick(['#FFFFFF','#EAF4FF']),r:rnd(4,7),rot:0,k:'d',g:500});/* nieve al saltar el pingüino */chainWob(w,'igloo',.5,0,1);[0,.3,.6].forEach(d=>tone(500,.1,'square',.04,1.3,.95+d));/* la foca sale del iglú a aplaudir al pingüino */tone(900,.08,'square',.04,1.4);tone(1100,.1,'square',.04,.8,.1)}else if(u.squir){allTap(w,t,'bos4',x,y,4);if(!skyNow().night)for(let i=0;i<5;i++)parts.push({x:x+rnd(-15,15),y:y+rnd(-10,10),vx:rnd(-120,120),vy:rnd(-220,-100),life:rnd(.5,.8),t:0,c:pick(['#A8743A','#7A5230','#5E8C3A']),r:rnd(4,7),rot:rnd(0,6),k:'c',g:700});/* trocitos de hoja y bellota al saltar la ardilla */if(!skyNow().night){chainWob(w,'wpk',.6,0,1);for(let i=0;i<5;i++){tone(900,.03,'square',.04,.6,.6+i*.14);noise(.02,.1,1500,.6+i*.14)}}/* el pájaro carpintero contesta a la ardilla */tone(1500,.05,'triangle',.07,1.2);tone(1700,.05,'triangle',.06,1.2,.07);tone(1900,.06,'triangle',.05,1,.14)}else if(u.lady){if(sceneName==='casita')allTap(w,t,'cas3',x,y,3);for(let i=0;i<4;i++)parts.push({x:x+rnd(-10,10),y:y,vx:rnd(-50,50),vy:rnd(-70,-30),life:rnd(.4,.7),t:0,c:pick(['#FFF3A0','#FFFFFF']),r:rnd(3,5),rot:0,k:'d',g:60});/* al saltar volando, la mariquita deja un polvito brillante */tone(1760,.06,'sine',.06);tone(2349,.08,'sine',.05,1,.07);noise(.4,.03,5000,.05)}else if(u.bird){if(sceneName==='casita')allTap(w,t,'cas3',x,y,3);if(!skyNow().night){dropParts(x,y-20,4,['#7FA8E8','#A9C6F2','#FFFFFF'],'c');/* al echar a volar el pajarito suelta unas plumitas */chainWob(w,'lady',.5,0,1);tone(1760,.06,'sine',.04,1,.5)}/* al echar a volar el pajarito, la mariquita también da un saltito */tone(2600,.07,'sine',.07,1.3);tone(2900,.07,'sine',.06,1.3,.1);tone(3100,.09,'sine',.05,.8,.2)}else if(u.crab){if(sceneName==='cofre')allTap(w,t,'cof2',x,y,2);allTap(w,t,'map4',x,y,4);if(!skyNow().night)for(let i=0;i<6;i++)parts.push({x:x+rnd(-20,20),y:y+10,vx:rnd(-120,120),vy:rnd(-120,-50),life:rnd(.35,.6),t:0,c:pick(['#F2D9A6','#E6C68A']),r:rnd(4,6),rot:0,k:'d',g:500});/* arena al correr el cangrejo */for(let i=0;i<4;i++)noise(.03,.12,4200,i*.09)}else if(u.cake){allTap(w,t,'fie4',x,y,4);for(let i=0;i<5;i++)parts.push({x:x+rnd(-30,30),y:y-50,vx:rnd(-15,15),vy:rnd(-50,-30),life:rnd(.9,1.3),t:0,c:pick(['#D6D6D6','#ECECEC','#C2C2C2']),r:rnd(6,10),rot:0,k:'d',g:-15});/* al soplar las velas sale un hilito de humo */chainWob(w,'drum',.95,0,1);for(const [d,f] of[[0,90],[.12,90],[.24,90],[.36,150]]){tone(f,.14,'sine',.18,.5,.95+d);noise(.04,.07,1800,.95+d)}/* al soplar las velas el tambor toca un redoble */noise(.45,.12,1400);tone(880,.12,'triangle',.06,1,.5);tone(1320,.16,'triangle',.06,1,.62)}else if(u.bee){allTap(w,t,'bee',x,y);if(!skyNow().night){for(let i=0;i<5;i++)parts.push({x:x+rnd(-12,12),y:y,vx:rnd(-50,50),vy:rnd(-60,-20),life:rnd(.6,1),t:0,c:pick(['#FFD23C','#FFE680']),r:rnd(3,4),rot:0,k:'d',g:40});/* la abeja suelta un poco de polen al subir */chainWob(w,'sunf',.5,0,1);[659,784,988].forEach((f,i)=>tone(f,.12,'sine',.05,1,.5+i*.1))}/* el girasol gira sus pétalos al recibir a la abeja */tone(240,.4,'sawtooth',.04,1.15);tone(300,.3,'sawtooth',.03,1.1,.12)}else if(u.owl){allTap(w,t,'bos4',x,y,4);dropParts(x,y-50,4,['#A7825A','#C9A77C','#E8D8BC'],'c');/* al girar la cabeza, el búho suelta unas plumitas */tone(392,.28,'sine',.16,.85);tone(392,.36,'sine',.14,.85,.42)}else if(u.bfly){for(let i=0;i<5;i++)parts.push({x:x+rnd(-15,15),y:y+rnd(-10,10),vx:rnd(-40,40),vy:rnd(-30,10),life:rnd(.6,1),t:0,c:pick(['#FFE9F6','#E9E2FF','#FFF7C2']),r:rnd(3,5),rot:0,k:'d',g:50});/* al asustarse, la mariposa deja un polvito de colores */if(sceneName==='casita')allTap(w,t,'bfly',x,y);tone(1568,.1,'sine',.07);tone(2093,.12,'sine',.06,1,.08);tone(2637,.14,'sine',.05,1,.16)}else if(u.gull){allTap(w,t,'gull',x,y);dropParts(x,y,3,['#FFFFFF','#E6EEF5'],'c');/* al dar la voltereta, la gaviota suelta unas plumitas */tone(1300,.16,'triangle',.08,.6);tone(1200,.2,'triangle',.07,.55,.2)}else if(u.mount){if(!skyNow().night){chainWob(w,'marm',1.5,0,1);tone(2400,.35,'sine',.05,1.25,1.5)}/* la marmota contesta al eco con un silbido */[0,1,2].forEach(i=>{const v=.13/(1+i*1.6),d=i*.45;tone(523,.14,'triangle',v,1,d);tone(392,.22,'triangle',v,1,d+.15)})}else if(u.sign){allTap(w,t,'sign',x,y);dropParts(x,y-40,5,[['#F08A3C','#E0662C','#F2B13C'],['#FFFFFF','#DDEEFF'],['#F7A6C8','#FFE07A','#FFFFFF']][u.sk||0],u.sk===0?'c':'d');/* cada cartel suelta lo suyo: hojas, copos o pétalos */tone(1046,.5,'sine',.08);tone(1568,.4,'sine',.04,1,.05)}else if(u.gift){allTap(w,t,'gift',x,y);for(let i=0;i<6;i++)parts.push({x:x+rnd(-15,15),y:y-20,vx:rnd(-120,120),vy:rnd(-320,-180),life:rnd(.7,1.1),t:0,c:pick(['#FFC93C','#F58BB4','#7CC86E','#5B8DEF']),r:rnd(6,10),rot:rnd(0,6),k:'c'});/* confeti al saltar el regalo */[523,659,784].forEach((f,i)=>tone(f,.15,'sine',.1,1,i*.07))}else if(u.letter){tone([392,440,523,523,659][u.letter-1],.22,'triangle',.12);w.hseq=u.letter===(w.hseq||0)+1?(w.hseq||0)+1:u.letter===1?1:0;if(w.hseq===5){w.hseq=0;titoCheer(x,y)}}else if(u.balloon){allTap(w,t,'balloon',x,y);for(let i=0;i<3;i++)parts.push({x:x+rnd(-15,15),y:y+20,vx:rnd(-20,20),vy:rnd(40,80),life:rnd(.6,.9),t:0,c:pick(['#FFF3B0','#FFFFFF']),r:rnd(3,4),rot:0,k:'d',g:-60});/* al subir, el globo deja un rastro de brillitos */tone(620,.14,'sine',.1,1.7);tone(880,.12,'sine',.07,1.5,.1)}else if(u.boat){for(let i=0;i<6;i++)parts.push({x:x+rnd(-30,30),y:y+25,vx:rnd(-70,70),vy:rnd(-180,-100),life:rnd(.6,.9),t:0,c:pick(['#9ED6FF','#6FBDF2','#FFFFFF']),r:rnd(4,6),rot:0,k:'d',g:500});/* al saltar, el barquito salpica */chainWob(w,'gull',.5,.2,3);tone(1300,.14,'triangle',.05,.6,.5);tone(1200,.18,'triangle',.05,.55,.75);/* la bocina del barco hace dar volteretas a las gaviotas */tone(392,.22,'triangle',.12);tone(330,.35,'triangle',.12,1,.26)}else{noise(.35,.14,2400);noise(.25,.08,3600,.12);if(u.tree&&sceneName==='montana')dropParts(x,y-60,10,['#FFFFFF','#EAF4FF'],'d');else if(u.tree&&sceneName==='bosque')dropParts(x,y-60,7,['#E8803C','#D9A23A','#C2542D'],'c');else if(u.tree&&sceneName==='jardin')dropParts(x,y-60,8,['#F7B6CF','#FBD3E0','#FFFFFF'],'d');else if(u.tree&&sceneName==='map')dropParts(x,y-50,5,['#7CC86E','#5DAA52'],'c')}sparkles(x,y);return true}
// tocar el mar (solo en el mapa): un chapuzón con dos ondas que se abren
function seaTap(w){if(!w.sea)return false;const h=RC.intersectObjects(w.sc.children,true).find(i=>i.object.visible!==false&&!(i.object.material&&i.object.material.visible===false));if(!h||h.object!==w.sea)return false;
  if(!w.spl){w.spl=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(1,.07,6,32),new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-PI/2;m.visible=false;w.sc.add(m);return m});
    w.upd.push(()=>{const e=T-w.splT;w.spl.forEach((m,i)=>{const q=(e-i*.18)/.9;m.visible=q>0&&q<1;if(m.visible){m.scale.setScalar(.3+q*2.2);m.material.opacity=.85*(1-q)}})})}
  w.splT=T;w.spl.forEach(m=>{m.position.set(h.point.x,-.95,h.point.z)});noise(.28,.14,700);tone(520,.1,'sine',.1,1.8,.04);return true}
function walkGround(w){const h=w.ground&&RC.intersectObject(w.ground,false)[0];
  if(!(h&&h.face&&h.face.normal.y>.7))return;const B=w.gb;let x=B?clamp(h.point.x,B[0],B[1]):h.point.x,z=B?clamp(h.point.z,B[2],B[3]):h.point.z;
  // si el punto cae detrás o dentro de una casita, Tito se queda delante (o al costado) para que no quede tapado
  for(const [cx,cz,r] of w.avoid||[])if(Math.hypot(x-cx,z-cz)<r){if(!B||cz+r<=B[3])z=cz+r;else x=cx+(x>=cx?r:-r)}
  walkTo(w,w.tito,V3(x,w.tito.position.y,z),()=>{},{speed:7,max:2.2,free:true})}
// un paseo libre (tocar el suelo vacío) no bloquea: se puede tocar una casita, el inicio o el suelo otra vez mientras Tito camina
const busy3=w=>!!(w.walk&&!w.walk.free);
// pasitos suaves mientras pasea (sonido de pisadas, alterna dos notas);
// al terminar un paseo libre Tito se vuelve a mirar al niño (si no, quedaba de espaldas al caminar hacia el fondo)
// Tito caracol: al caminar deja un rastro brillante que se desvanece (24 discos reutilizables para todo el juego)
const TRAIL=[],TRC=new THREE.Raycaster();let trailGeo=null;
function trailTick(w,tito,dt,walking,dust){
  if(!trailGeo){trailGeo=new THREE.CircleGeometry(.3,18);trailGeo.rotateX(-PI/2);trailGeo.userData.keep=true}
  for(const d of TRAIL)if(d.parent===w.sc&&d.visible){const u=d.userData;u.a-=dt/(u.dust?.7:2.5);if(u.a<=0)d.visible=false;else{d.material.opacity=(u.dust?.75:.6)*u.a;if(u.dust)d.scale.setScalar(u.s*(1.7-u.a))}}
  if(!walking){w.trT=0;return}if((w.trT=(w.trT||0)+dt)<(dust?.24:.09))return;w.trT=0;
  let d=TRAIL.find(d=>d.parent!==w.sc||!d.visible);
  if(!d){if(TRAIL.length<24){d=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({color:'#E4F7FF',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));d.renderOrder=1;TRAIL.push(d)}
    else d=TRAIL.reduce((a,b)=>a.userData.a<b.userData.a?a:b)}
  // altura del suelo justo debajo (la plaza y los caminos están más altos que el pasto)
  const P=tito.position,inT=o=>{for(;o;o=o.parent)if(o===tito)return true;return false};TRC.set(V3(P.x,P.y+4,P.z),V3(0,-1,0));TRC.camera=w.cam;
  const h=TRC.intersectObjects(w.sc.children,true).find(h=>!h.object.isSprite&&!TRAIL.includes(h.object)&&h.point.y<P.y+.5&&!inT(h.object));
  if(d.parent!==w.sc)w.sc.add(d);d.userData.dust=!!dust;d.userData.s=tito.scale.x*(dust?1.1:1);d.scale.setScalar(d.userData.s);d.material.color.set(dust?'#E6D3A8':'#E4F7FF');
  // el polvito sale un poco por detrás, donde pisó (si no, queda escondido bajo el animal)
  const L=w.trL&&w.trL.distanceTo(P)<2?w.trL:P;d.position.set(dust?(P.x+L.x)/2:P.x,(h?h.point.y:P.y)+.015,dust?(P.z+L.z)/2:P.z);w.trL=(w.trL||P.clone()).copy(P);d.visible=true;d.userData.a=1;d.material.opacity=dust?.75:.6}
function walkTick(w,tito,dt){const k=w.walk;let wk=0;
  if(k){const e=clamp((T-k.t0)/k.dur,0,1),s=e*e*(3-2*e);tito.position.lerpVectors(k.from,k.to,s);wk=1;
    // pasos al ritmo de cada animal (v1.36): saltito blando del conejo, pasos lentos y graves de la tortuga, trote ligero del erizo; el caracol como siempre
    if(k.free){const kd=tito.userData.kind,P=kd==='conejo'?[PI/6,[300,260],.1,.16]:kd==='tortuga'?[PI/5,[330,294],.09,.11]:kd==='erizo'?[PI/12,[700,620],.05,.08]:[.26,[520,440],.07,.12];
      if((k.st=(k.st||0)+dt)>=P[0]){k.st=0;w.steps=(w.steps||0)+1;tone(P[1][w.steps%2],P[2],kd==='conejo'?'triangle':'sine',P[3],.8)}}
   if(e>=1){w.walk=null;if(k.free)tito.userData.face=tito.userData.rest;const cb=k.cb;setTimeout(()=>{try{cb()}catch(err){console.error(err)}},60)}}
  const f=tito.userData.face;if(f!=null){let d=f-tito.rotation.y;while(d>PI)d-=PI*2;while(d<-PI)d+=PI*2;tito.rotation.y+=d*Math.min(1,dt*8)}
  // el caracol deja su rastro brillante; los demás animales levantan un polvito a cada paso
  trailTick(w,tito,dt,wk,tito.userData.kind!=='caracol');return wk}

// TITO (rectángulo 2D) y HOUSE_AT siguen al modelo 3D; al volver al 2D se restauran
const TITO0={x:TITO.x,y:TITO.y,w:TITO.w},HOUSE0=[HOUSE_AT[0],HOUSE_AT[1]];
function titoRect(o){const [x,y,r]=projR(o,1.6,1.4);TITO.w=r*1.6;TITO.x=x-TITO.w/2;TITO.y=y-TITO.w*.42}
function restore2D(){Object.assign(TITO,TITO0);HOUSE_AT[0]=HOUSE0[0];HOUSE_AT[1]=HOUSE0[1]}
// llamar a la lógica original sin que el rectángulo de Tito ni la mascota capturen el toque
function call0(fn,self,x,y){const tx_=TITO.x,h0=HOUSE_AT[0];TITO.x=-9999;HOUSE_AT[0]=-9999;try{fn.call(self,x,y)}finally{if(sceneName&&scene&&scene.three){TITO.x=tx_;HOUSE_AT[0]=h0}}}
const go0=go;go=function(n,o){go0(n,o);if(!(scene&&scene.three)){restore2D();setCursor('pt')}};
// cambiar de personaje (zona de adultos): Tito se rehace dentro del mismo grupo, así la escena sigue igual
function retito(){const w=W3,t=w&&w.tito;if(!t)return;const keepUD={face:t.userData.face,rest:t.userData.rest};
  for(const c of t.children.slice()){t.remove(c);c.traverse(o=>{if(o.geometry&&!o.geometry.userData.keep)o.geometry.dispose()})}makeTito(t);Object.assign(t.userData,keepUD);
  // el emblema de la puerta de su casa también cambia al momento (antes seguía el del animal anterior hasta salir del mapa)
  const h=w.spots&&w.spots.casaTito&&w.spots.casaTito.userData.house,e=h&&h.userData.emb;if(e){e.material.map=shellTex();e.material.needsUpdate=true}}
window.__w3={get W(){return W3},retito,get PRK(){return PRK},set PRK(v){PRK=v;rs()},FPS,pickAt,proj,THREE,R};

/* ================= EL MAPA: la isla de Curiolandia ================= */
const MZB={};for(const z of MZ2)MZB[z.id]={x:z.x,y:z.y,r:z.r};
const MP=(x,y)=>[(x-800)/40,(y-500)/40];
const MAPPOS={plaza:[790,520],jardin:[360,560],bosque:[1110,300],montana:[1400,560],canciones:[330,310],trazos:[560,250],rutinas:[790,250],album:[1440,250],ingles:[1270,450],fiestas:[560,790],tienda:[800,820],casaTito:[1070,740]};
function skyNow(){const h=new Date().getHours();return h>=20||h<7?{bg:'#3B4A86',sea:'#3F78B5',night:1}:h>=18?{bg:'#FFD2A6',sea:'#78C3E6',night:0}:{bg:'#BFE9F8',sea:'#7FD3F0',night:0}}
function sea3(w,c){const g=new THREE.PlaneGeometry(220,160,70,50);g.rotateX(-PI/2);const m=new THREE.Mesh(g,M(c));m.position.y=-1.1;m.receiveShadow=true;w.sc.add(m);w.sea=m;
  // olas: altura y normal calculadas a mano (derivada de la fórmula); computeVertexNormals en cada cuadro costaba ~0,6 ms
  const p=g.attributes.position,nm=g.attributes.normal,b=Float32Array.from(p.array),A=p.array,N=nm.array;w.upd.push(()=>{for(let i=0,j=0;i<p.count;i++,j+=3){const ax=b[j]*.35+T*1.2,az=b[j+2]*.4+T*.9;
    A[j+1]=Math.sin(ax)*.12+Math.cos(az)*.12;const nx=-.042*Math.cos(ax),nz=.048*Math.sin(az),l=1/Math.sqrt(nx*nx+1+nz*nz);N[j]=nx*l;N[j+1]=l;N[j+2]=nz*l}p.needsUpdate=true;nm.needsUpdate=true})}
function island3(w){const pts=[[150,560],[100,330,180,170,420,170],[640,130,1000,130,1250,170],[1500,170,1590,330,1570,520],[1580,760,1400,880,1100,870],[840,895,520,885,330,850],[180,810,160,690,150,560]];
  const s=new THREE.Shape(),P=(x,y)=>MP(x,y);s.moveTo(...P(...pts[0]));for(let i=1;i<pts.length;i++){const q=pts[i];s.bezierCurveTo(...P(q[0],q[1]),...P(q[2],q[3]),...P(q[4],q[5]))}
  const g=new THREE.ExtrudeGeometry(s,{depth:2.2,bevelEnabled:true,bevelThickness:.45,bevelSize:.7,bevelSegments:3,curveSegments:40});g.rotateX(PI/2);
  const m=new THREE.Mesh(g,[M('#9BDB82'),M('#D9A86C')]);m.position.y=-.45;m.receiveShadow=true;m.castShadow=false;w.sc.add(m);w.ground=m;
  const ol=new THREE.Mesh(olGeo(g),OLm(.12));ol.position.copy(m.position);w.sc.add(ol);
  // la playa alrededor
  const g2=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:true,bevelThickness:.2,bevelSize:1.6,bevelSegments:2,curveSegments:40});g2.rotateX(PI/2);const b=new THREE.Mesh(g2,M('#FFE9B8'));b.position.y=-.75;b.receiveShadow=true;w.sc.add(b)}
const SPOT3={
  plaza(g){mk(Cyl(2.9,3,.18,40),'#F1E2C8',{p:[0,.09,0],to:g,ol:.05});mk(Cyl(2.2,2.2,.04,40),'#E8D4B0',{p:[0,.2,0],ol:0,to:g});
    mk(Cyl(1.25,1.35,.5,32),'#FFFFFF',{p:[0,.35,0],to:g,ol:.05});const wt=mk(Cyl(1.08,1.08,.1,32),'#7FD3F0',{p:[0,.58,0],ol:0,to:g});
    mk(Cyl(.2,.3,1.1,12),'#FFFFFF',{p:[0,.9,0],to:g,ol:.04});mk(Cyl(.55,.45,.18,20),'#FFFFFF',{p:[0,1.45,0],to:g,ol:.04});
    const drops=[];for(let i=0;i<8;i++)drops.push(mk(Sph(.09,8,6),'#BFEAF7',{ol:.015,cs:false,to:g}));
    g.userData.anim=()=>{drops.forEach((d,i)=>{const a=i/8*PI*2,k=(T*.9+i*.37)%1;d.position.set(Math.cos(a)*(.4+k*.6),1.55+Math.sin(k*PI)*.7-k*.6,Math.sin(a)*(.4+k*.6))})};
    DIAC.forEach((c,i)=>{const a=PI*1.05+i/6*PI*.9,x=Math.cos(a)*2.55,z=Math.sin(a)*2.55;mk(Cyl(.05,.05,1.6,6),'#FFFFFF',{p:[x,.8,z],to:g,ol:.025});
      const f=mk(new THREE.PlaneGeometry(.55,.38),new THREE.MeshToonMaterial({color:c,gradientMap:GRAD,side:THREE.DoubleSide}),{p:[x+.27,1.4,z],ol:0,to:g});f.userData.wave=i});
    spr(canvasTex(512,150,()=>{card(16,16,480,118,'#fff',8,30);DIAC.forEach((c,i)=>circ(100+i*52,44,13,c,4));text('ASAMBLEA',256,124,66,K,{f:LF})},'asamblea'),3.9,1.15,{p:[0,2.8,-.6],to:g})},
  jardin(g,open){mk(Cyl(3.2,3.3,.2,36),'#B5E89E',{p:[0,.1,0],s:[1,1,.78],to:g,ol:.05});
    mk(mg(Array.from({length:16},(_,i)=>{const a=i/16*PI*2;return[Box(.14,.6,.14),[Math.cos(a)*3.05,.45,Math.sin(a)*2.35]]})),'#C98A4B',{to:g,ol:.025});
    [[-1.4,-.4,0],[.3,-.9,1],[1.6,.2,2],[-.4,.9,3]].forEach(([x,z,i])=>{const h=grp(g,[x,.2,z],.75);mk(Box(1.1,.8,.9),'#FFF3B0',{p:[0,.4,0],to:h,ol:.04});mk(Cone(.95,.75,4),FLC[i],{p:[0,1.18,0],r:[0,PI/4,0],to:h,ol:.04});mk(Box(.28,.45,.06),'#C98A4B',{p:[0,.25,.46],to:h,ol:.02})});
    for(let i=0;i<7;i++)flower3(g,-2.4+i*.8,1.75+(i%2)*.25,FLC[i%7],.7,.2);
    pillSpr(tx('3 años'),'#FF8A7A','#fff',{p:[0,2.9,0],w:3.2,to:g})},
  bosque(g,open){mk(Cyl(3.1,3.2,.2,30),open?'#8CCB78':'#CFC8BF',{p:[0,.1,0],s:[1,1,.8],to:g,ol:.05});
    [[-1.7,.4,.85,'otoño'],[0,-.6,1.05,'verano'],[1.7,.3,.9,'verano'],[-.7,1.4,.7,'otoño'],[1,1.5,.7,'primavera'],[-2.2,-.9,.7,null],[2.3,-.9,.7,null]].forEach(([x,z,s,k])=>tree3(g,x,z,s,open?(k||'verano'):'gris',!k));
    spr(pillTex(tx('4 años'),open?'#7CC86E':'#B8B0A6','#fff',72),4,1,{p:[0,.65,3.1],to:g});if(!open)zzz(g,[2,3.2,0])},
  montana(g,open){const gc=open?'#A7BCD6':'#CFC8BF';mk(Cone(2.4,4.2,9),gc,{p:[-1,2.1,-.4],to:g,ol:.07});mk(Cone(2,3.4,9),gc,{p:[1.5,1.7,.2],to:g,ol:.07});
    mk(Cone(.95,1.65,9),'#FFFFFF',{p:[-1,3.4,-.4],to:g,ol:.05});mk(Cone(.75,1.3,9),'#FFFFFF',{p:[1.5,2.8,.2],to:g,ol:.05});
    if(open)for(let i=0;i<5;i++)flower3(g,-2+i*1,2+(i%2)*.3,FLC[i+1],.75,0);rock3(g,2.8,1.4,.8);rock3(g,-3,1.2,.6);
    pillSpr(tx('5 años'),open?'#5B8DEF':'#B8B0A6','#fff',{p:[0,.6,2.9],w:3.2,to:g});if(!open)zzz(g,[2.3,4,0])},
  canciones(g){mk(Cyl(1.5,1.5,1.3,16),M('#fff',{map:stripesTex()}),{p:[0,.65,0],to:g,ol:.05});mk(Cone(1.85,1.6,16),'#FF6B5E',{p:[0,2.1,0],to:g,ol:.05});
    mk(Cyl(.03,.03,.7,6),K,{p:[0,3.1,0],ol:0,to:g});mk(new THREE.PlaneGeometry(.5,.3),new THREE.MeshToonMaterial({color:'#FFC93C',gradientMap:GRAD,side:THREE.DoubleSide}),{p:[.25,3.3,0],ol:0,to:g});
    mk(Box(.8,.95,.1),'#7A4C30',{p:[0,.48,1.47],to:g,ol:.03});
    const notes=[0,1,2].map(i=>spr(canvasTex(128,128,()=>text('♪',64,100,110,DIAC[i*2],{st:8}),'nota'+i),.9,.9,{to:g}));
    g.userData.anim=()=>notes.forEach((n,i)=>{const k=(T*.5+i/3)%1;n.position.set(-1+i+Math.sin(T*2+i)*.3,2.6+k*1.8,.5);n.material.opacity=1-k})},
  trazos(g){const e=grp(g,[0,0,0]);for(const x of[-.7,.7])mk(Box(.12,2.6,.12),'#C98A4B',{p:[x,1.25,0],r:[-.12,0,x>0?-.12:.12],to:e,ol:.03});
    mk(Box(2,1.4,.12),'#C98A4B',{p:[0,1.75,.12],r:[-.12,0,0],to:e,ol:.04});
    plane(canvasTex(256,180,()=>{ctx.fillStyle='#3E7A5A';ctx.fillRect(0,0,256,180);ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();for(let x=20;x<230;x+=6)ctx.lineTo(x,60+Math.sin(x/14)*22);ctx.stroke();ctx.beginPath();ctx.arc(70,130,24,0,PI*2);ctx.stroke();text('a',160,150,60,'#FFE08A',{f:LF})},'pizarra3'),1.8,1.25,{p:[0,1.75,.19],r:[-.12,0,0],to:e});
    mk(Box(1.9,.1,.25),'#C98A4B',{p:[0,1,.28],to:e,ol:.02})},
  rutinas(g){mk(Box(1.9,1.3,1.6),'#BFEAF7',{p:[0,.65,0],to:g,ol:.05});mk(prism(2.4,1.1,2),'#5BB8E6',{p:[0,1.3,0],to:g,ol:.05});
    plane(canvasTex(160,160,()=>{circ(80,80,70,'#fff',8);pic('manos',80,80,110)},'manos3'),1,1,{p:[0,.75,.82],to:g});
    const bub=[0,1,2,3].map(i=>{const m=new THREE.Mesh(Sph(.16+i*.04,12,10),new THREE.MeshToonMaterial({color:'#E8F8FF',gradientMap:GRAD,transparent:true,opacity:.75}));g.add(m);return m});
    g.userData.anim=()=>bub.forEach((b,i)=>{const k=(T*.6+i/4)%1;b.position.set(1.1+Math.sin(T*3+i)*.2,1.2+k*2,.3);b.scale.setScalar(1-k*.3);b.visible=k<.95})},
  album(g){const b=grp(g,[0,.2,0]);b.rotation.y=-.25;mk(Box(1.5,.25,2),'#9B8AD9',{p:[-.78,.12,0],r:[0,0,.12],to:b,ol:.04});mk(Box(1.5,.25,2),'#9B8AD9',{p:[.78,.12,0],r:[0,0,-.12],to:b,ol:.04});
    mk(Box(1.35,.12,1.8),'#FFF6E6',{p:[-.72,.32,0],r:[0,0,.12],to:b,ol:.02});mk(Box(1.35,.12,1.8),'#FFF6E6',{p:[.72,.32,0],r:[0,0,-.12],to:b,ol:.02});
    const st=mk(starGeo(.45,.15),'#FFC93C',{p:[0,1.3,0],to:b,ol:.03});g.userData.anim=()=>{st.rotation.y=Math.sin(T*1.4)*.55;st.position.y=1.3+Math.sin(T*2)*.12}},
  ingles(g){mk(Cyl(.08,.08,1.8,8),'#C98A4B',{p:[0,.9,0],to:g,ol:.03});
    spr(canvasTex(256,180,()=>{card(14,14,228,120,'#fff',8,50);ctx.beginPath();ctx.moveTo(90,128);ctx.lineTo(70,170);ctx.lineTo(125,128);ctx.closePath();fillStroke('#fff',8);ctx.fillStyle='#fff';ctx.fillRect(80,118,50,14);text('Hello!',128,95,58,'#5B8DEF',{f:LF})},'hello3'),1.9,1.33,{p:[0,2.35,0],to:g});
    ['A','B','C'].forEach((l,i)=>{const t=canvasTex(128,128,()=>{ctx.fillStyle=['#FF6B5E','#FFC93C','#7CC86E'][i];ctx.fillRect(0,0,128,128);text(l,64,100,96,'#fff',{f:LF,st:8})},'abc'+l);
      const m=new THREE.Mesh(Box(.7,.7,.7),new THREE.MeshToonMaterial({map:t,gradientMap:GRAD}));m.position.set(-.85+i*.85,.35+(i===1?.0:0),.9);m.rotation.y=(i-1)*.3;m.castShadow=true;g.add(m);m.add(Object.assign(new THREE.Mesh(olGeo(m.geometry),OLm(.035)),{raycast:()=>{}}))})},
  fiestas(g){const c=grp(g,[0,0,0]);mk(Cyl(1,1,.6,24),'#F58BB4',{p:[0,.3,0],to:c,ol:.04});mk(Cyl(.75,.75,.5,24),'#FFF6E6',{p:[0,.85,0],to:c,ol:.04});
    for(let i=0;i<4;i++){const a=i/4*PI*2;mk(Cyl(.05,.05,.35,6),DIAC[i],{p:[Math.cos(a)*.4,1.27,Math.sin(a)*.4],to:c,ol:.015});const fl=mk(Sph(.07,8,6),'#FFC93C',{p:[Math.cos(a)*.4,1.5,Math.sin(a)*.4],s:[1,1.6,1],ol:0,cs:false,to:c});fl.userData.fl=1}
    [[1.6,.5,'#5B8DEF'],[-1.5,.7,'#7CC86E']].forEach(([x,z,cc])=>{const p=grp(g,[x,0,z]);mk(Box(.8,.7,.8),cc,{p:[0,.35,0],to:p,ol:.035});mk(Box(.84,.74,.18),'#FFC93C',{p:[0,.35,0],ol:.02,to:p});mk(Box(.18,.74,.84),'#FFC93C',{p:[0,.35,0],ol:.02,to:p})});
    const bl=[['#FF6B5E',-1.2,-.8],['#FFC93C',-.4,-1.2],['#9B8AD9',.6,-1.1],['#7FD3F0',1.3,-.6]].map(([cc,x,z])=>balloon3(g,x,z,cc,2.2));
    g.userData.anim=()=>bl.forEach((b,i)=>{b.rotation.z=Math.sin(T*1.5+i)*.06;b.rotation.x=Math.cos(T*1.2+i)*.05})},
  tienda(g){mk(Box(2.6,1,1.1),'#FFF3D6',{p:[0,.5,.3],to:g,ol:.05});for(const x of[-1.2,1.2])for(const z of[-.3,.8])mk(Box(.13,2.3,.13),'#C98A4B',{p:[x,1.15,z],to:g,ol:.025});
    const aw=grp(g,[0,2.35,.25]);aw.rotation.x=.25;for(let i=0;i<6;i++)mk(Box(.47,.12,1.6),i%2?'#fff':'#FF6B5E',{p:[-1.18+i*.47,0,0],to:aw,ol:.025});
    spr(pillTex(tx('Tienda'),'#7CC86E','#fff',80),3.2,.8,{p:[0,3.3,0],to:g});
    for(let i=0;i<5;i++)mk(Cyl(.2,.2,.07,16),'#FFC93C',{p:[-.7+(i%3)*.3,1.05+Math.floor(i/3)*.08,.4+(i%2)*.15],to:g,ol:.02});
    spr(picTex('manzana'),.6,.6,{p:[.5,1.3,.4],to:g});spr(picTex('pelota'),.6,.6,{p:[.95,1.3,.4],to:g});
    if(S.coins>0){const c=mk(Cyl(.4,.4,.1,24),'#FFC93C',{p:[1.4,2.6,.6],r:[PI/2,0,0],to:g,ol:.03});g.userData.anim=()=>{c.rotation.z=T*3;c.position.y=2.9+Math.sin(T*3)*.12}}},
};
function stripesTex(){return canvasTex(256,64,()=>{for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#FFF6E6':'#FF6B5E';ctx.fillRect(i*32,0,32,64)}},'stripes')}
function zzz(g,p){const zs=[0,1].map(i=>spr(canvasTex(96,96,()=>text('z',48,76,80,'#7A6252',{st:6,sc:'#fff'}),'z'),.6+i*.2,.6+i*.2,{to:g}));
  const a=g.userData.anim;g.userData.anim=()=>{a&&a();zs.forEach((z,i)=>{const k=(T*.4+i*.5)%1;z.position.set(p[0]+k*.6,p[1]+k*1.4,p[2]);z.material.opacity=Math.sin(k*PI)})}}
function greyAll(g,on){g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshToonMaterial){if(on){o.userData.m0=o.userData.m0||o.material;o.material=M('#CFC8BF')}else if(o.userData.m0)o.material=o.userData.m0}})}

function buildMap(st){const sk=skyNow(),w=newWorld({fov:36,bg:sk.bg,kind:'map',shadow:26});
  sea3(w,sk.sea);island3(w);
  if(sk.night){w.sc.children.forEach(o=>{if(o.isLight)o.intensity*=.82});const moon=mk(Sph(2,20,16),'#FFF3B0',{p:[-30,22,-40],ol:.2,cs:false,rs:false});w.sc.add(moon)}
  if(sk.night)fireflies(w,30,14);// de noche, luciérnagas sobre la isla
  seasonFx(w);
  // nubes y estrellas se mueven según el tiempo, no por cuadro: igual en una pantalla de 30, 60 o 120 Hz
  for(let i=0;i<6;i++){const c=cloud3(w.sc,-34+i*14,9+(i%3)*1.5,-18+(i%2)*6,1+(i%3)*.3);w.upd.push(dt=>{c.position.x+=.3*dt;if(c.position.x>40)c.position.x=-40})}
  // gaviotas que vuelan en círculos sobre la orilla de la isla
  crab3(w,-4,3,10.2,1);whale3(w,-21.8,0,.85);dolph3(w,22.9,.5,.9);lighthouse3(w,11.9,9.9,1);if(summerNow()){sunb3(w,7.2,10.1,.9);sandc3(w,9.3,10.5,1.15)}palm3(w,-11.4,10,1);hab3(w,12,2.8,-6,.9);gull3(w,18,10,7,0,1);gull3(w,16,9,8,2.2,1);gull3(w,19,11,6.5,4,-1);
  // barquitos
  for(const [x,z,c] of[[-22,4,'#FF6B5E'],[24,-6,'#5B8DEF'],[16,14,'#FFC93C']]){const b=grp(w.sc,[x,-1,z]);mk(Box(1.6,.4,.7),c,{p:[0,.2,0],to:b,ol:.04});mk(Cyl(.04,.04,1.6,6),'#C98A4B',{p:[0,1.1,0],ol:0,to:b});mk(prism(.9,1.2,.05),'#fff',{p:[.1,.5,0],r:[0,0,0],to:b,ol:.02});
    const hb=new THREE.Mesh(Box(2.6,2.4,1.6),FHIT);hb.position.y=.8;b.add(hb);b.userData.boat=1;// al tocarlo, salta dando una vuelta y toca la bocina
    w.upd.push(()=>{const k=b.userData.wob,e=k==null?9:T-k,q=Math.min(e/.8,1);b.position.y=-1+Math.sin(T*1.3+x)*.15+(e<.8?Math.sin(q*PI)*.9:0);b.rotation.z=Math.sin(T*1.1+z)*.08;b.rotation.y=e<.8?q*PI*2:0})}
  // caminos desde la plaza
  const P=MP(...MAPPOS.plaza);
  for(const id in MAPPOS){if(id==='plaza')continue;const Q=MP(...MAPPOS[id]),c=[(P[0]+Q[0])/2+(Q[1]-P[1])*.12,(P[1]+Q[1])/2-(Q[0]-P[0])*.08];ribbon(w.sc,bez(P,c,Q,30),.9,'#FFF3D6',.03,{dash:3})}
  // decoración: árboles, arbustos, flores, piedras en lugares libres
  [[-14.5,-5,'verano'],[-12.5,7,'primavera'],[2.5,-7.2,'otoño'],[17.5,-2,'verano'],[14,8.5,'primavera'],[-4,7.8,null],[18,5.5,null],[-15.5,1.5,null],[8.5,-7.5,null],[11.5,-.5,'verano']].forEach(([x,z,k],i)=>tree3(w.sc,x,z,.75+(i%3)*.1,k||'verano',!k));
  [[-8,-1],[3.8,1.8],[7.8,2.5],[-3,4.5],[12,4],[-13,4],[5,-3.2]].forEach(([x,z],i)=>bush3(w.sc,x,z,.8,i%2?'#7CC86E':'#6FC25A'));
  for(let i=0;i<26;i++){const a=i*2.4,r=6+(i*37%11);const x=Math.cos(a)*r*1.35+1,z=Math.sin(a)*r*.62+1;if(Math.abs(z)<8.5&&Math.abs(x)<17)flower3(w.sc,x,z,FLC[i%7],.6)}
  rock3(w.sc,-16,-2.5,1);rock3(w.sc,19,1,.9);rock3(w.sc,6,9.5,.7);
  // los lugares
  w.spots={};
  for(const z of MZ2){const [x,zz]=MP(...MAPPOS[z.id]),g=grp(w.sc,[x,0,zz]);g.userData.id='mz:'+z.id;g.userData.spot=z.id;
    const open=ZAGE[z.id]?zoneOpen(z.id):spotOpen(z.id);
    if(z.id==='casaTito'){const h=makeHouse(houseLevel());g.add(h);h.position.set(-.6,0,-.6);h.scale.setScalar(1.12);g.userData.house=h;
      const p=makePipo(petStage());p.position.set(3.4,.1,1.6);p.scale.setScalar(.8);g.add(p);g.userData.pet=p;w.pick.push(p)}
    else SPOT3[z.id](g,open);
    const hit=new THREE.Mesh(Cyl(z.id==='casaTito'?3:2.4,2.4,3.4,12),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.5;g.add(hit);
    const lk=!spotOpen(z.id)&&!ZAGE[z.id];
    if(lk||(st.unl&&st.unl.id===z.id)){const ly=z.id==='ingles'?4.3:3.3;g.userData.lockY=ly;g.userData.lock=lock3(g,[0,ly,0],1.15);// el bocadillo de Hello! no queda tapado por el candado
    if(lk){g.userData.need=spr(flowerTex(FLC[0],spotNeed(z.id)),2.3,1.15,{p:[0,2.2,1.7],to:g});greyAll(g,true)}}
    if(st.wake&&st.wake.z===z.id)greyAll(g,true);
    w.spots[z.id]=g;w.pick.push(g)}
  if(xmasNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;xtree3(w,p.x-4.2,p.z+.6,.9)}if(winterNow()&&!xmasNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;snowman3(w,p.x-4.2,p.z+.8,.8)}/* en invierno, pasado Reyes, un muñeco de nieve ocupa el sitio del árbol de Navidad */if(hallowNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;pump3(w,p.x-3.9,p.z+1,1.1)}
  // Tito
  const tito=makeTito();tito.scale.setScalar(.75);const at=w.spots[st.titoAt||'plaza']||w.spots.plaza,ap=at.position;
  tito.position.set(ap.x+(st.titoAt&&st.titoAt!=='plaza'?1.5:2.2),0,ap.z+(st.titoAt&&st.titoAt!=='plaza'?2.6:1.6));tito.rotation.y=-.35;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  const asam=w.spots.plaza,gl=ring3(asam,[0,.25,0],3.1);
  w.upd.push(dt=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    gl.visible=!asamHoy();gl.material.opacity=.45+.35*Math.sin(T*4);gl.scale.setScalar(1+Math.sin(T*4)*.03);
    for(const id in w.spots){const g=w.spots[id];g.userData.anim&&g.userData.anim();
      // banderitas y llamitas: se buscan una sola vez, no recorriendo todo el lugar en cada cuadro
      const wf=g.userData.wf||(g.userData.wf=[]);if(!g.userData.wfOk){g.userData.wfOk=1;g.traverse(o=>{if(o.userData.wave!=null||o.userData.fl)wf.push(o)})}
      for(const o of wf){if(o.userData.wave!=null)o.rotation.y=Math.sin(T*3+o.userData.wave)*.4;if(o.userData.fl)o.scale.set(1+Math.sin(T*14+o.position.x*9)*.15,1.6,1)}
      const hs=st.hov===id&&!busy3(w)?1.06:1;g.scale.setScalar(lerp(g.scale.x,hs,.2));
      const L=g.userData.lock;if(L){if(st.unl&&st.unl.id===id&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){g.remove(L);g.userData.lock=null;if(g.userData.need){g.remove(g.userData.need);g.userData.need=null}greyAll(g,false)}else{L.position.set(k*2,(g.userData.lockY||3.3)+k*k*5,0);L.rotation.z=k*3;L.scale.setScalar(1.15*(1+k*.4));if(k>.15)greyAll(g,false)}}
        else{L.position.y=(g.userData.lockY||3.3)+Math.sin(T*2+g.position.x)*.15;L.rotation.y=Math.sin(T*1.2)*.4;const sh=st.lockShake&&st.lockShake.id===id?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}}
    if(st.wake){const g=w.spots[st.wake.z];if(T>st.wake.t&&!st.wake.done){st.wake.done=1;greyAll(g,false)}if(st.wake.done&&T<st.wake.t+1.5)g.position.x=MP(...MAPPOS[st.wake.z])[0]+Math.sin(T*40)*.15*(1-(T-st.wake.t)/1.5)}
    const h=w.spots.casaTito;h.userData.house.userData.anim(st.shake);h.userData.pet.userData.anim(st.petJump)});
  wobInit(w);
  camRig(w,V3(1.2,25,20.5),V3(1.2,0,1.4),1.6);
  return w}

/* ---------- escena del mapa en 3D ---------- */
{const S0=SCENES.map,enter0=S0.enter,down0=S0.down;
 Object.assign(S0,{three:true,
  enter(o){this.hov=null;this.lockShake=null;this.hop=null;enter0.call(this,o);setWorld(buildMap(this));this.sync()},
  sync(){const w=W3;if(!w||w.kind!=='map')return;
    for(const z of MZ2){const g=w.spots[z.id];if(!g)continue;const [x,y,r]=projR(g,2.6,1.2);z.x=x;z.y=y;z.r=Math.max(60,r)}
    const h=w.spots.casaTito,[hx,hy]=projO(h,0);HOUSE_AT[0]=hx;HOUSE_AT[1]=hy+60;titoRect(w.tito)},
  draw(){this.sync();const w=W3;
    let hv_=null;let hT=false;if(mouseOn&&!drag&&!(w&&busy3(w))){const u=pickAt(MX,MY);if(u&&u.spot){hv_=u.spot;hovNow='mz'+u.spot}else if(u&&u.id==='tito'){hovNow='tito';hT=true}else if(u&&u.id==='pipo')hovNow='pipo'}
    this.hov=hv_;this.hovTito=hT;
    // nombre del lugar bajo el ratón; los de arriba del mapa quedaban escondidos detrás del cartel de Curiolandia
    if(hv_){const z=mzOf(hv_);ctx.font=`600 34px ${DF}`;const t=cap(z.name),tw=ctx.measureText(t).width;const cy=Math.max(z.y-z.r-70,118);card(z.x-tw/2-26,cy,tw+52,58,'rgba(255,255,255,.92)',5,29);text(t,z.x,cy+41,34,K,{w:600})}
    card(560,22,480,88,'#fff',6,44);drawLogoSmall(800,86,56);
    drawSeguir();drawHome();drawCoinHUD();
    if(talking){const bx=TITO.x+TITO.w*.85,by=TITO.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  down(x,y){const w=W3;if(!w||busy3(w))return;
    if(atHome(x,y)||inCoinHUD(x,y)||dist(x,y,SEGUIR.x,SEGUIR.y)<SEGUIR.r+10)return call0(down0,this,x,y);
    const u=pickAt(x,y);if(flyTap(w,x,y))return;
    if(!u){if(wobTap(w,x,y)||seaTap(w))return;SFX.tap();sparkles(x,y);walkGround(w);return}
    if(u.id==='tito'){this.hop=T;titoTapSfx();this.prompt(false);return}
    if(u.id==='pipo'){const [px,py]=projO(w.spots.casaTito.userData.pet,1);const h0=[HOUSE_AT[0],HOUSE_AT[1]];HOUSE_AT[0]=px-170;HOUSE_AT[1]=py+10;this.petJump=T;try{down0.call(this,px,py)}finally{HOUSE_AT[0]=h0[0];HOUSE_AT[1]=h0[1]}return}
    const z=mzOf(u.spot);if(!z)return;const open=ZAGE[z.id]?zoneOpen(z.id):spotOpen(z.id);
    if(!open){this.lockShake={id:z.id,t:T};return call0(down0,this,z.x,z.y)}
    SFX.whoosh&&SFX.whoosh();const g=w.spots[z.id],to=g.position.clone().add(V3(z.id==='casaTito'?1.2:1.4,0,z.id==='casaTito'?2.8:2.4));
    this.titoAt=z.id;walkTo(w,w.tito,to,()=>{if(sceneName==='map')call0(down0,this,z.x,z.y)},{zoom:V3(0,9,8)})}
 });
 // Seguir: Tito camina hacia la plaza o hacia la zona del próximo tema antes de entrar
 const gs0=goSeguir;goSeguir=function(){const w=W3;if(sceneName!=='map'||!w||w.kind!=='map')return gs0();
   let id='plaza';if(asamHoy()){const t=nextTema();if(!t)return gs0();id=MAINZ.includes(t.zone)?t.zone:t.zone==='fiestas'?'fiestas':t.zone==='ingles'?'ingles':t.id==='X-CAN'?'canciones':t.id==='X-RUT'?'rutinas':t.id==='X-TRZ'?'trazos':'plaza'}
   const g=w.spots[id];SCENES.map.titoAt=id;walkTo(w,w.tito,g.position.clone().add(V3(1.4,0,2.4)),()=>{if(sceneName==='map')gs0()},{zoom:V3(0,9,8)})};
}

/* ================= LAS ZONAS: un camino de casitas en 3D ================= */
const ZX=(x,y)=>[(x-930)/37,(y-490)/37];
const ZPB={};for(const z in ZPOS){ZPB[z]={};for(const id in ZPOS[z])ZPB[z][id]={x:ZPOS[z][id].x,y:ZPOS[z][id].y}}
const ZSTYLE={jardin:{bg:'#D9F1FB',g:'#BFE6A0',e:'#D9A86C'},bosque:{bg:'#CFEFD0',g:'#9FD08A',e:'#B98A5B'},montana:{bg:'#DCE6F7',g:'#CFE3B5',e:'#B5A79A'},fiestas:{bg:'#FFE6F0',g:'#FFE3B8',e:'#E8B98A'},ingles:{bg:'#DDEBFF',g:'#CFE8C0',e:'#C9A57A'}};
function slab(to,w,d,c,e,y=0,r=3){const s=new THREE.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);
  const g=new THREE.ExtrudeGeometry(s,{depth:1.6,bevelEnabled:true,bevelThickness:.3,bevelSize:.4,bevelSegments:2,curveSegments:10});g.rotateX(PI/2);const m=new THREE.Mesh(g,[M(c),M(e)]);m.position.y=y-.3;m.receiveShadow=true;to.add(m);
  const o=new THREE.Mesh(olGeo(g),OLm(.1));o.position.copy(m.position);to.add(o);return m}
function casita3(to,t,p,o){const g=grp(to,[p[0],0,p[1]],o.s||1),lk=o.locked,st=tst(t.id),n=gDone(t);g.userData.id='t:'+t.id;g.userData.tema=t.id;
  if(t.concepts){mk(rbox(2.6,1.7,2,.2),lk?'#CFC8BF':'#9B8AD9',{p:[0,.85,0],to:g,ol:.06});mk(Box(2.2,.1,1.6),'#EDE7FF',{p:[0,1.72,0],to:g,ol:.03});
    mk(Sph(.38,16,12),'#FF8A7A',{p:[-.6,2.15,0],to:g,ol:.04});mk(Box(.6,.6,.6),'#5BB8E6',{p:[.25,2.08,.1],r:[0,.5,0],to:g,ol:.04});mk(Cone(.35,.7,4),'#7CC86E',{p:[.9,2.12,-.2],to:g,ol:.04});
    const s2=mk(starGeo(.42,.14),'#FFC93C',{p:[0,2.95,0],to:g,ol:.03});g.userData.spin=s2}
  else{const roof=lk?'#CFC8BF':t.c;mk(Box(2.2,1.55,1.8),'#FFF6E6',{p:[0,.78,0],to:g,ol:.06});mk(Cone(1.8,1.25,4),roof,{p:[0,2.17,0],r:[0,PI/4,0],to:g,ol:.06});
    mk(Box(1.1,1.02,.1),'#FFFFFF',{p:[-.35,.92,.92],to:g,ol:.035});plane(picTex(t.icon),1,1,{p:[-.35,.92,.98],to:g});
    mk(Box(.45,.95,.08),'#C98A4B',{p:[.68,.48,.92],to:g,ol:.03});
    const bt=canvasTex(160,160,()=>{circ(80,80,70,'#fff',8);pic(t.icon,80,82,108)},'badge:'+t.icon);const bs=spr(bt,1.35,1.35,{p:[0,3.35,.2],to:g});if(lk)bs.material.color.set('#C9C2B8');g.userData.badge=bs}
  const k=t.games.length;for(let j=0;j<k;j++)mk(Sph(.17,10,8),j<n?'#FFC93C':'#EADFCF',{p:[-((k-1)*.2)+j*.4,.18,1.4],ol:.02,cs:false,to:g});
  if(st.done){const s=mk(starGeo(.4,.13),'#FFC93C',{p:[.95,2.75,.3],to:g,ol:.03});g.userData.spin=g.userData.spin||s;flower3(g,-1.3,1.1,FLC[1],.7);flower3(g,1.3,1.1,FLC[3],.7)}
  const hit=new THREE.Mesh(Box(2.9,3.4,2.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.5;g.add(hit);
  if(lk||o.unl){g.userData.lock=lock3(g,[.75,2.85,.9],.8);if(lk)g.traverse(m=>{if(m.isMesh&&m.material&&m.material.map&&!m.material.isMeshToonMaterial){m.material=m.material.clone();m.material.color.set('#C9C2B8')}})}
  return g}
function roadPts(P,o){const r=[];for(let i=0;i<P.length;i++){if(!i){r.push(P[0]);continue}const a=P[i-1],b=P[i];
  if(Math.abs(a[1]-b[1])<.2){for(let k=1;k<=12;k++)r.push([lerp(a[0],b[0],k/12),a[1]])}
  else{const sd=(a[0]+b[0])/2>0?1:-1;for(let k=1;k<=24;k++){const t=k/24,u=1-t;const c1=[a[0]+sd*o,a[1]],c2=[b[0]+sd*o,b[1]];r.push([u*u*u*a[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*b[0],u*u*u*a[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*b[1]])}}}return r}
function zoneDecor(w,z){const D=w.sc;
  if(z==='jardin'){frog3(w,7.9,5.4,1.1);can3(w,4.6,6,1.25);sunf3(w,-1.6,7,1.1);scare3(w,-7.5,8.3,.95);burrow3(w,-9.4,7.3,1.2)}if(z==='jardin'&&!skyNow().night){kite3(w,8.6,5.6,-6,1.15);bee3(w,-6,-6.4,0,1.9);bee3(w,8,-6.6,2.5,1.9);/* abejas */[['#FF8FB1',-8,2],['#FFC93C',4,-3],['#9B8AD9',10,3],['#7FD3F0',-2,-6]].forEach(([c,x,zz],i)=>butterfly3(w,x,zz,c,i*1.7))}// mariposas en el jardín (de noche duermen)
  if(z==='jardin'||z==='ingles'){for(let i=0;i<14;i++)flower3(D,-15+i*2.3,-8.2+(i%2)*.4,FLC[i%7],.8);for(let i=0;i<9;i++)bush3(D,-15.5+i*3.9,8.6,.8);for(const x of[-17.5,17.5])for(let i=0;i<5;i++)tree3(D,x,-6+i*3,.75,i%2?'primavera':'verano')}
  if(z==='bosque'){owl3(w,7.9,5.4,1.15);leafs3(w,-1.2,6.8,1.1);nest3(w,.6,8.6,1.25);if(hallowNow())[[-4.2,8.7],[8.3,8.7],[-10.8,8.9]].forEach(([a,b])=>pump3(w,a,b,.55));wpk3(w,10.4,6.4,1.1);ants3(w,5.4,7.8,1.25);squir3(w,-9.4,7.3,1.3);fallPts(w,40,['#F28C38','#E8603C','#F2C14E','#C9772E'],{size:1.5,map:canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf'),sp:.6,sw:1.3});/* hojas que caen */for(let i=0;i<12;i++)tree3(D,-16.5+i*3,-8.6,.85+(i%3)*.15,i%3?'verano':'otoño',i%2);for(const x of[-18,18])for(let i=0;i<5;i++)tree3(D,x,-6+i*3,.8,'verano',i%2);for(let i=0;i<8;i++)rock3(D,-14+i*4,8.7,.5);[[-16,6.5],[-12,8.9],[-5.5,9],[2,8.8],[10,9],[15.5,6.8]].forEach(([x,zz],i)=>mush3(D,x,zz,.9+(i%3)*.2))}
  if(z==='montana'){[[-15,-22,7,10],[-5,-25,8,12.5],[6,-24,7.5,11],[16,-22,7,9.5]].forEach(([x,zz,r,h])=>{mk(Cone(r,h,10),'#B9C7DA',{p:[x,h/2-.3,zz],to:D,ol:.1}).userData.mount=1;mk(Cone(r*.38,h*.38,10),'#FFFFFF',{p:[x,h-.3-h*.19,zz],to:D,ol:.07}).userData.mount=1});
    for(let i=0;i<10;i++)rock3(D,-16+i*3.6,8.6,.6+(i%3)*.2);fallPts(w,70,['#FFFFFF','#F4FAFF'],{size:.9,map:canvasTex(64,64,()=>{ctx.beginPath();ctx.arc(32,32,20,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#9DBFE3';ctx.stroke()},'snow'),sp:.9,sw:.5});/* copos de nieve que caen despacio */snowman3(w,-10.8,6.2,.8);snowman3(w,10,5.2,.9);peng3(w,5.2,7.6,5.6,1.25);igloo3(w,-2,5.8,.9);sled3(w,-6.6,7.4,1.1);goat3(w,1.4,8.6,1.35);marm3(w,7.6,8.4,1.6);for(const x of[-18,18])for(let i=0;i<4;i++)tree3(D,x,-4+i*3,.8,'verano',1)}
  if(z==='fiestas'){fallPts(w,60,DIAC,{size:1,map:canvasTex(32,32,()=>{ctx.fillStyle='#fff';ctx.fillRect(9,4,14,24)},'conf'),sp:.7,sw:.9});/* confeti que cae despacio */pinata3(w,-7.2,5.3,.9);cake3(w,7.9,5,1.4);drum3(w,.8,5.4,1.1);jack3(w,4.4,5.6,1.1);cann3(w,-3.4,5.6,1.5);bubbles3(w,-1.3,6.2,1.25);garland3(w,-6.6,3.9);for(let i=0;i<10;i++)balloon3(D,-15+i*3.3,-7.5,DIAC[i%7],2.5+(i%3)*.5);for(let i=0;i<8;i++){const b=grp(D,[-14+i*4,0,8]);b.userData.gift=1;mk(Box(.8,.7,.8),DIAC[i%7],{p:[0,.35,0],to:b,ol:.035});mk(Box(.18,.72,.82),'#FFC93C',{p:[0,.35,0],ol:.02,to:b})}}
  if(z==='ingles'){// letras del abecedario que suben flotando despacio, como pompas
    const AB='ABCDEFGHIJ';for(let i=0;i<10;i++){const L=AB[i],q=spr(canvasTex(128,128,()=>text(L,64,104,104,DIAC[i%7],{f:LF,st:8,sc:K}),'abcf'+L),1.4,1.4,{p:[-16+i*3.5,(i*37%9),-6+(i*53%12)],to:D,op:.9});
      q.userData.abc=i+1;q.userData.dur=.6;/* al tocar una letra, crece, gira y explota con su nota, y vuelve a salir desde abajo */
      w.upd.push(dt=>{const u=q.userData,e=u.wob==null?9:T-u.wob;if(e<.6){q.scale.setScalar(1.4*(1+e*1.4));q.material.rotation+=dt*12;q.material.opacity=.9*(1-e/.6);u.pp=1;return}
        if(u.pp){u.pp=0;q.position.y=0;q.scale.setScalar(1.4);q.material.opacity=.9}q.position.y+=dt*.45;q.position.x+=Math.sin(T+i)*dt*.3;q.material.rotation=Math.sin(T*.8+i)*.25;if(q.position.y>9)q.position.y=0})}}
  if(z==='ingles'){bus3(w,7.2);phone3(w,8.2,4.4,1);clock3(w,-1.6,4.8,.85);post3(w,3.8,5,1);tea3(w,-5.8,4.6,1.5);guard3(w,-9.6,4.8,1.3);flag3(w,6,3.4,1.1);umb3(w,.9,6.4,1)}
  if(z==='ingles'){['H','E','L','L','O'].forEach((l,i)=>{const t=canvasTex(128,128,()=>{ctx.fillStyle=DIAC[i];ctx.fillRect(0,0,128,128);text(l,64,100,96,'#fff',{f:LF,st:8})},'abc'+l+i);const m=new THREE.Mesh(Box(1.2,1.2,1.2),new THREE.MeshToonMaterial({map:t,gradientMap:GRAD}));m.position.set(-4+i*2,.6,-8.2);m.rotation.y=(i%2?.2:-.2);m.castShadow=true;m.userData.letter=i+1;D.add(m)})}}
function buildZone(z,st){const Z=ZONES[z],P=ZPOS[z],sty=ZSTYLE[z]||ZSTYLE.jardin,w=newWorld({fov:36,bg:sty.bg,kind:'zone',shadow:22});w.z=z;
  w.ground=slab(w.sc,38,20,sty.g,sty.e);w.gb=[-16,16,-8,5.5];// que Tito no se salga del cuadro
  zoneDecor(w,z);
  // de noche, las zonas también: cielo de noche, un poco menos de luz y luciérnagas en las zonas verdes (como el mapa)
  if(skyNow().night){w.sc.background=new THREE.Color('#3B4A86');w.sc.children.forEach(o=>{if(o.isLight)o.intensity*=.82});if(['jardin','bosque','ingles'].includes(z))fireflies(w,30,14)}
  for(let i=0;i<4;i++)cloud3(w.sc,-20+i*13,10+(i%2)*1.5,-14,.9);
  const main=MAINZ.includes(z),path=z==='fiestas'?FIESTAS:main?pathOf(z):Z.temas,B=w.base={};
  for(const t of Z.temas)B[t.id]=ZX(ZPB[z][t.id].x,ZPB[z][t.id].y);
  // carteles de estación de cada fila: en el borde (x≈-17) quedaban detrás de los árboles o fuera de la pantalla;
  // ahora van detrás de la fila, entre la 1.ª y la 2.ª casita, y Tito los esquiva al pasear
  if(main){['hojaNaranja','copo','flor'].forEach((k,i)=>{const zz=ZX(292,[250,490,725][i])[1]-1.8,x=-10.2;const g=grp(w.sc,[x,0,zz]);g.userData.sign=1;g.userData.sk=i;(w.avoid=w.avoid||[]).push([x,zz,.8]);mk(Cyl(.07,.07,1.4,6),'#C98A4B',{p:[0,.7,0],to:g,ol:.025});spr(canvasTex(160,160,()=>{circ(80,80,68,'#fff',8);pic(k,80,80,104)},'season'+k),1.4,1.4,{p:[0,1.75,0],to:g})})}
  const pts=path.map(t=>B[t.id]),ci=st.cur?path.indexOf(st.cur):path.length-1,rp=roadPts(pts,4.4);
  ribbon(w.sc,rp,1.5,'#FFF6E0',.04,{dash:4,dashC:'#C9AE7A'});
  if(ci>0){const per=rp.length/(pts.length-1||1);ribbon(w.sc,rp.slice(0,Math.round(ci*per)+1),1.5,'#FFE08A',.05,{polygonOffset:1})}
  w.cas={};for(const t of Z.temas){const g=casita3(w.sc,t,B[t.id],{s:main?1:1.25,locked:!temaOpen(t),unl:st.unl&&st.unl.id===t.id});w.cas[t.id]=g;w.pick.push(g)}
  w.avoid=(w.avoid||[]).concat(Object.values(w.cas).map(g=>[g.position.x,g.position.z,(main?1:1.25)*2.4]));
  const c=Z.temas.find(t=>t.concepts);if(c&&!temaOpen(c)){spr(flowerTex(FLC[0],Math.min(pathDone(z),3)+'/3'),2.3,1.15,{p:[B[c.id][0],.9,B[c.id][1]+2.4],to:w.sc})}
  let ar=null,rg=null;if(st.cur){const p=B[st.cur.id];ar=arrow3(w.sc,[p[0],5.2,p[1]],.85);rg=ring3(w.sc,[p[0],.08,p[1]],2.1)}
  const tito=makeTito();tito.scale.setScalar(.62);const ta=B[(st.titoAt&&B[st.titoAt]&&st.titoAt)||(st.cur&&st.cur.id)||path[0].id];tito.position.set(ta[0]+1.9,0,ta[1]+1.2);tito.rotation.y=-.3;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  w.upd.push(dt=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    if(ar){ar.position.y=5.1+Math.abs(Math.sin(T*4))*.45;arrowSway(w,ar);rg.material.opacity=.45+.35*Math.sin(T*4)}
    for(const id in w.cas){const g=w.cas[id];if(g.userData.spin)g.userData.spin.rotation.y=T*1.5;const hs=st.hov===id&&!busy3(w)?1.07:1,s0=main?1:1.25;g.scale.setScalar(lerp(g.scale.x,hs*s0,.2));
      const L=g.userData.lock;if(L){if(st.unl&&st.unl.id===id&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){g.remove(L);g.userData.lock=null}else{L.position.set(.75+k*1.5,2.85+k*k*5,.9);if(k>.15&&g.userData.badge)g.userData.badge.material.color.set('#fff');L.rotation.z=k*3}}
        else{L.position.y=2.85+Math.sin(T*2+g.position.x)*.1;const sh=st.lockShake&&st.lockShake.id===id?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}}});
  wobInit(w);
  camRig(w,V3(0,20,24.5),V3(0,0,-.9),1.4);return w}
{for(const z in ZONES){const S0=SCENES[z],enter0=S0.enter,down0=S0.down;
  Object.assign(S0,{three:true,
    enter(o){this.hov=null;this.hop=null;this.lockShake=null;enter0.call(this,o);if(sceneName!==z)return;if(o&&o.from)this.titoAt=o.from;setWorld(buildZone(z,this));this.sync()},
    sync(){const w=W3;if(!w||w.kind!=='zone')return;const P=ZPOS[z];for(const id in w.cas){const [x,y,r]=projR(w.cas[id],1.6,1.3);P[id].x=x;P[id].y=y}titoRect(w.tito)},
    draw(){this.sync();const w=W3,Z=ZONES[z];let hv_=null;
      let hT=false;if(mouseOn&&!drag&&!(w&&busy3(w))){const u=pickAt(MX,MY);if(u&&u.tema){hv_=u.tema;hovNow='j:'+u.tema}else if(u&&u.id==='tito'){hovNow='tito';hT=true}}this.hov=hv_;this.hovTito=hT;
      {const nm=cap(Z.name);ctx.font=`600 44px ${DF}`;const tw=Math.min(900,ctx.measureText(nm).width);card(800-tw/2-40,26,tw+80,80,'rgba(255,255,255,.92)',6,40);text(nm,800,82,44,K,{w:600})}
      // nombre de la casita bajo el ratón; en la fila de arriba no se monta sobre el cartel de la zona
      if(hv_){const t=TEMA[hv_],p=ZPOS[z][hv_];ctx.font=`600 32px ${DF}`;const nm=t.concepts?'Rincón de los Conceptos':V(t.n),tw=ctx.measureText(nm).width,cy=Math.max(p.y-178,116);card(p.x-tw/2-24,cy,tw+48,54,'rgba(255,255,255,.92)',5,27);text(nm,p.x,cy+38,32,K,{w:600})}
      drawHome();drawCoinHUD();
      if(talking){const bx=TITO.x+TITO.w*.85,by=TITO.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
    down(x,y){const w=W3;if(!w||busy3(w))return;
      if(atHome(x,y)||inCoinHUD(x,y))return call0(down0,this,x,y);
      const u=pickAt(x,y);if(flyTap(w,x,y))return;if(!u){if(wobTap(w,x,y))return;SFX.tap();sparkles(x,y);walkGround(w);return}
      if(u.id==='tito'){this.hop=T;titoTapSfx();this.prompt(true);return}
      const t=TEMA[u.tema];if(!t)return;const p=ZPOS[z][t.id];
      if(!temaOpen(t)){this.lockShake={id:t.id,t:T};return call0(down0,this,p.x,p.y)}
      const g=w.cas[t.id];this.titoAt=t.id;walkTo(w,w.tito,g.position.clone().add(V3(1.9,0,1.5)),()=>{if(sceneName===z)call0(down0,this,p.x,p.y)},{zoom:V3(0,7,6)})}})}}

/* ================= LA CASITA DE UN TEMA: los juegos en estaciones ================= */
// dónde se para Tito junto a la estación j: en la fila de atrás (si hay dos filas) se queda más atrás para que el cartel de la fila de delante no lo tape
// la tortuga y el erizo llevan la cabeza baja y larga: un poco más a la izquierda para que el disco del juego no les tape la cara
const st3Tito=(n,j)=>{const g={tortuga:-.7,erizo:-.45}[S.tito&&S.tito.kind]||0;return n>4&&st3Pos(n,j)[1]<0?[-2.3+g,-.5]:[-2+g,1.35]};
function st3Pos(n,j){if(n<=4)return[(j-(n-1)/2)*4.3,.4];const per=n<=6?3:4,r=Math.floor(j/per),c=j%per,cc=r?per-1-c:c;return[(cc-(per-1)/2)*(per===3?4.8:4.2),r?3.4:-2.4]}
function bgSample(t){const c=document.createElement('canvas');c.width=1024;c.height=576;const g=c.getContext('2d'),old=ctx;ctx=g;g.scale(.64,.64);try{t.bg()}catch(e){}
  const c2=document.createElement('canvas');c2.width=64;c2.height=36;const g2=c2.getContext('2d',{willReadFrequently:true});ctx=g2;g2.scale(.04,.04);try{t.bg()}catch(e){}ctx=old;
  const d=g2.getImageData(28,33,8,3).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2]}const n=d.length/4;const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;
  const top=g2.getImageData(32,0,1,1).data;return{tex,ground:new THREE.Color(r/n/255,gg/n/255,b/n/255),top:new THREE.Color(top[0]/255,top[1]/255,top[2]/255)}}
function buildCasita(t,st){const bs=bgSample(t),w=newWorld({fov:38,bg:'#'+bs.top.getHexString(),kind:'casita',shadow:16});w.t=t;
  const back=new THREE.Mesh(new THREE.CylinderGeometry(26,26,18,48,1,true,-PI*.32,PI*.64),new THREE.MeshBasicMaterial({map:bs.tex,side:THREE.BackSide}));back.position.set(0,6,8);back.rotation.y=PI;w.sc.add(back);
  const gc='#'+bs.ground.clone().lerp(new THREE.Color('#BFE6A0'),.35).getHexString();
  w.ground=mk(Cyl(15,15.4,.6,60),gc,{p:[0,-.3,0],s:[1,1,.62],to:w.sc,ol:.1});w.gb=[-12,12,-5,5.5];
  const n=t.games.length,nx=nextGameOf(t),P=[];for(let j=0;j<n;j++)P.push(st3Pos(n,j));
  ribbon(w.sc,roadPts(P,3.2),1.3,'#FFF6E0',.04,{dash:4,dashC:'#C9AE7A'});
  if(nx!==0){const lim=nx<0?n-1:nx,rp=roadPts(P,3.2),per=rp.length/(n-1||1);ribbon(w.sc,rp.slice(0,Math.round(lim*per)+1),1.3,'#FFE08A',.05,{polygonOffset:1})}
  w.st=[];for(let j=0;j<n;j++){const [x,z]=P[j],lk=!gameOpen(t,j),g=grp(w.sc,[x,0,z]);g.userData.id='g:'+j;g.userData.game=j;
    mk(Cyl(1.25,1.4,.45,28),j===nx?'#FFF3B0':'#FFFFFF',{p:[0,.22,0],to:g,ol:.05});
    // número del juego: en los cerrados va en marrón oscuro (blanco sobre el gris claro casi no se leía)
    const tex=canvasTex(320,320,()=>{drawStation(t,j,160,160,{s:1.1});circ(50,50,44,lk?'#EADFCF':tst(t.id).g[j]?'#7CC86E':'#5B8DEF',6);text(String(j+1),50,69,54,lk?'#6B5646':'#fff',{f:LF})});
    const sp=spr(tex,2.9,2.9,{p:[0,2.05,0],to:g});if(lk)sp.material.color.set('#BDB6AC');
    const hit=new THREE.Mesh(Box(2.9,3.6,2),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.7;g.add(hit);
    if(lk||(st.unl&&st.unl.j===j))g.userData.lock=lock3(g,[.75,1.25,.9],.8);
    w.st.push({g,sp,p2:[0,0]});w.pick.push(g)}
  w.avoid=P.map(([x,z])=>[x,z,2.2]);
  for(let i=0;i<10;i++){const a=PI*.15+i/9*PI*.7;flower3(w.sc,Math.cos(a)*13.2,-Math.sin(a)*8+1,FLC[i%7],.8)}
  lady3(w,-10,-4.4,1.3);ball3(w,7.4,-4.6,1.3);bird3(w,10,-4.4,1.3,'#7FA8E8');
  // de noche, también dentro de la casita: fondo más oscuro y azulado, menos luz y luciérnagas en vez de mariposas
  if(skyNow().night){back.material.color.set('#8A93C4');w.sc.background=new THREE.Color(w.sc.background).multiplyScalar(.55);w.sc.children.forEach(o=>{if(o.isLight)o.intensity*=.85});fireflies(w,26,12,1.1)}
  else{butterfly3(w,-7,-6.5,'#FF8FB1',0,{s:1.1,h:3});butterfly3(w,7,-6.5,'#FFC93C',2.4,{s:1.1,h:3})}// dos mariposas junto a las flores del fondo
  let ar=null,rg=null;if(nx>=0){const [x,z]=P[nx];ar=arrow3(w.sc,[x,4.2,z],.75);rg=ring3(w.sc,[x,.5,z],1.7)}
  const tito=makeTito();tito.scale.setScalar(.6);const ta=P[st.titoAt!=null&&P[st.titoAt]?st.titoAt:Math.max(0,nx)];{const ti=st3Tito(n,P.indexOf(ta)),o=ti;tito.position.set(ta[0]+o[0],0,ta[1]+o[1])}tito.rotation.y=-.2;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  w.upd.push(dt=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    if(ar){ar.position.y=4.1+Math.abs(Math.sin(T*4))*.4;arrowSway(w,ar);rg.material.opacity=.45+.35*Math.sin(T*4)}
    w.st.forEach((s,j)=>{const hs=st.hov===j&&!busy3(w)?1.08:1;s.g.scale.setScalar(lerp(s.g.scale.x,hs,.2));s.sp.position.y=2.05+Math.sin(T*2+j)*.06;
      const L=s.g.userData.lock;if(L){if(st.unl&&st.unl.j===j&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){s.g.remove(L);s.g.userData.lock=null;s.sp.material.color.set('#fff')}else{L.position.set(.75+k*1.5,1.25+k*k*5,.9);L.rotation.z=k*3;if(k>.15)s.sp.material.color.set('#fff')}}
        else{L.position.y=1.25+Math.sin(T*2+j)*.1;const sh=st.lockShake&&st.lockShake.j===j?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}})});
  wobInit(w);
  camRig(w,V3(0,11,15.5),V3(0,2.4,0),1.1);return w}
let lastGame=null;{const je=SCENES.juego.enter;SCENES.juego.enter=function(o){lastGame={t:o.t,g:o.g};return je.call(this,o)}}
{const S0=SCENES.casita,enter0=S0.enter,down0=S0.down,sp0=stationPos;
 stationPos=function(t,j){const w=W3;if(w&&w.kind==='casita'&&w.t===t&&w.st&&w.st[j]&&scene===SCENES.casita)return w.st[j].p2;return sp0(t,j)};
 Object.assign(S0,{three:true,
  enter(o){this.hov=null;this.hop=null;this.lockShake=null;this.titoAt=o&&o.g!=null?o.g:(lastGame&&lastGame.t===(o&&o.t)?lastGame.g:null);enter0.call(this,o);if(sceneName!=='casita')return;setWorld(buildCasita(this.t,this));this.sync()},
  sync(){const w=W3;if(!w||w.kind!=='casita')return;w.st.forEach(s=>{const [x,y]=projO(s.sp,0);s.p2=[x,y]});titoRect(w.tito)},
  draw(){this.sync();const t=this.t,w=W3;let hv_=null;
    let hT=false;if(mouseOn&&!drag&&!(w&&busy3(w))){const u=pickAt(MX,MY);if(u&&u.game!=null){hv_=u.game;hovNow='g:'+u.game}else if(u&&u.id==='tito'){hovNow='tito';hT=true}}this.hov=hv_;this.hovTito=hT;
    {ctx.font=`600 54px ${DF}`;const tw=Math.min(900,ctx.measureText(V(t.n)).width);card(170,34,tw+190,112,'#fff',6,56);pic(t.icon,250,90,90);text(V(t.n),310+tw/2,110,54,K,{w:600})}
    if(hv_!=null){const g=t.games[hv_],nm=GNAME[g.t]||'',p=w.st[hv_].p2;if(nm){ctx.font=`600 32px ${DF}`;const tw=ctx.measureText(nm).width;card(p[0]-tw/2-24,p[1]+120,tw+48,54,'rgba(255,255,255,.92)',5,27);text(nm,p[0],p[1]+158,32,K,{w:600})}}
    drawHome();drawCoinHUD();
    if(talking){const bx=TITO.x+TITO.w*.85,by=TITO.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  down(x,y){const w=W3;if(!w||busy3(w))return;const t=this.t;
    if(atHome(x,y)||inCoinHUD(x,y))return call0(down0,this,x,y);
    const u=pickAt(x,y);if(flyTap(w,x,y))return;if(!u){if(wobTap(w,x,y))return;SFX.tap();sparkles(x,y);walkGround(w);return}
    if(u.id==='tito'){this.hop=T;titoTapSfx();this.prompt(true);return}
    if(u.game==null)return;const j=u.game,p=w.st[j].p2;
    if(!gameOpen(t,j)){this.lockShake={j,t:T};return call0(down0,this,p[0],p[1])}
    const g=w.st[j].g;const o=st3Tito(t.games.length,j);walkTo(w,w.tito,g.position.clone().add(V3(o[0],0,o[1])),()=>{if(sceneName==='casita')call0(down0,this,p[0],p[1])},{zoom:V3(0,4,4.5),max:.8})}});
}

/* ================= EL COFRE DEL TESORO ================= */
function gradTex(a,b,key){return canvasTex(16,256,g=>{const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,16,256)},key)}
function buildCofre(st){const w=newWorld({fov:36,kind:'cofre',shadow:10}),nt=skyNow().night;w.sc.background=nt?gradTex('#F3D9E8','#5F6FB4','cofreBgN'):gradTex('#FFE9C2','#FFD7E4','cofreBg');
  // de noche: cielo de anochecer, estrellas que brillan y luciérnagas
  if(nt){w.sc.children.forEach(o=>{if(o.isLight)o.intensity*=.85});fireflies(w,16,8,1)}
  mk(Cyl(7,7.4,.6,48),'#BFE6A0',{p:[0,-.3,0],s:[1,1,.7],to:w.sc,ol:.1});
  for(let i=0;i<12;i++){const a=i/12*PI*2;if(Math.sin(a)>.55)continue;flower3(w.sc,Math.cos(a)*5.8,Math.sin(a)*3.8,FLC[i%7],.8)}
  // estrellas del fondo: se balancean y ladean en vez de girar enteras (de canto se veían como rayitas sueltas)
  const stars=[];for(let i=0;i<14;i++){const s=mk(starGeo(.18+(i%3)*.08,.06),nt?M('#FFF3B0',{emissive:'#C9A000'}):'#FFF3B0',{p:[-9+i*1.4,4+(i*37%5)*.8,-6-(i%3)],ol:.02,cs:false,to:w.sc});s.userData.y0=s.position.y;stars.push(s)}
  const ch=grp(w.sc,[0,0,0]);w.chest=ch;
  mk(rbox(3.2,1.7,2.2,.15),'#B5763F',{p:[0,.85,0],to:ch,ol:.07});
  for(const y of[.55,1.15])mk(Box(3.22,.07,2.22),'#8A5A3C',{p:[0,y,0],ol:0,to:ch});
  for(const x of[-1.05,1.05])mk(Box(.35,1.72,2.26),'#FFC93C',{p:[x,.86,0],to:ch,ol:.04});
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.8),new THREE.MeshBasicMaterial({color:'#FFE08A',transparent:true,opacity:0}));glow.rotation.x=-PI/2;glow.position.y=1.72;ch.add(glow);
  const piv=grp(ch,[0,1.7,-1.1]),lg=new THREE.CylinderGeometry(1.1,1.1,3.2,24,1,false,0,PI);lg.rotateZ(PI/2);lg.rotateX(PI/2);
  const lid=mk(lg,'#C98A4B',{p:[0,0,1.1],s:[1,.62,1],to:piv,ol:.07});for(const x of[-1.05,1.05])mk(new THREE.CylinderGeometry(1.13,1.13,.35,24,1,false,0,PI).rotateZ(PI/2).rotateX(PI/2),'#FFC93C',{p:[x,0,1.1],s:[1,.62,1],to:piv,ol:.04});
  mk(Box(3.2,.1,2.2),'#7A4C30',{p:[0,.02,1.1],ol:.03,to:piv});
  const lock=grp(ch,[0,1.6,1.16]);mk(rbox(.6,.7,.14,.06),'#FFC93C',{to:lock,ol:.035});mk(Cyl(.08,.08,.06,10),K,{p:[0,.08,.08],r:[PI/2,0,0],ol:0,to:lock});
  const rays=grp(w.sc,[0,1.8,-.6]);for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,14),new THREE.MeshBasicMaterial({color:i%2?'#FFF3B0':'#FFE08A',transparent:true,opacity:0,depthWrite:false}));m.geometry.translate(0,7,0);m.rotation.z=i/12*PI*2;rays.add(m)}
  const prt=parrot3(w,-6,-1.4,.85);/* loro pirata junto al cofre */const crb=crab3(w,3.9,4.9,1.8,.75);/* y un cangrejo que pasea por la derecha */
  const tito=makeTito();tito.scale.setScalar(.62);tito.position.set(-4,0,1.1);tito.rotation.y=-.5;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  ch.userData.id='chest';w.pick.push(ch);
  // antes de abrirse el cofre "respira" para invitar a tocarlo, y crece un poco con el ratón encima
  let chS=1;
  w.upd.push(dt=>{const op=st.op||0,sh=Math.max(0,1-(T-st.shakeT)*3)*Math.sin(T*50);ch.rotation.z=sh*.06;ch.position.x=sh*.08;
    const sT=st.openT?1:(st.hov?1.07:1)*(1+Math.sin(T*3)*.025);chS+=(sT-chS)*Math.min(1,dt*10);ch.scale.setScalar(chS);
    piv.rotation.x=-op*1.95;lock.visible=op<.15;glow.material.opacity=Math.min(1,op*2)*.9;
    rays.rotation.z=T*.4;rays.children.forEach(r=>r.material.opacity=Math.min(1,op*1.5)*.55);stars.forEach((s,i)=>{s.rotation.y=Math.sin(T*1.2+i)*.55;s.rotation.z=Math.sin(T*.8+i*1.7)*.25;s.position.y=s.userData.y0+Math.cos(T*2+i)*.06});
    if(st.openT&&!prt.userData.cheer){prt.userData.cheer=1;prt.userData.wob=st.openT+.5;squawk(.5);squawk(.95);crb.userData.wob=st.openT+.8}/* el loro celebra que se abre el cofre */
    tito.userData.anim(dt,{hop:st.openT?st.openT+.2:st.hop})});
  wobInit(w);
  camRig(w,V3(0,4.6,10),V3(0,2.05,0),.5);return w}
{const S0=SCENES.cofre,enter0=S0.enter,down0=S0.down;
 Object.assign(S0,{three:true,
  enter(o){this.hop=null;this.hov=false;enter0.call(this,o);if(sceneName!=='cofre')return;setWorld(buildCofre(this));titoRect(W3.tito)},
  draw(){const w=W3;if(w&&w.kind==='cofre')titoRect(w.tito);
    this.hov=false;if(!this.openT&&mouseOn&&!drag&&w&&w.kind==='cofre'){const u=pickAt(MX,MY);if(u&&u.id==='chest'){this.hov=true;hovNow='cf:cofre'}}
    if(this.openT){const k=T-this.openT;this.op=clamp(k*2.2,0,1)}
    if(this.openT){const k=T-this.openT,e=clamp((k-.25)/.8,0,1),gy=lerp(520,290,e*e*(3-2*e)),gs=back(e)*260;
      if(e>0){if(this.gift)drawItemPic(this.gift,800,gy,gs);else pic('monedas',800,gy,gs)}
      if(k>1.1&&this.gift){ctx.font=`600 44px ${DF}`;const nm=cap(itemName(this.gift)),tw=ctx.measureText(nm).width;card(800-tw/2-40,96,tw+80,84,'#fff',6,42);text(nm,800,152,44,K,{w:600})}}
    else{for(let i=0;i<3;i++){const on=i<this.taps;circ(740+i*60,830,20,on?'#FFC93C':'#fff',5)}}
    if(this.openT&&T>this.openT+1.4){
      {const s=hv('cf:casa',hC(600,800,74));ctx.save();ctx.translate(600,800);ctx.scale(s,s);circ(0,0,72,'#fff',7);ctx.save();ctx.scale(.3,.3);drawTitoHouse(0,90,houseLevel());ctx.restore();ctx.restore()}
      {const p=(Math.sin(T*4)+1)/2,s=hv('cf:seguir',hC(1000,800,74));ctx.save();ctx.translate(1000,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}}
    drawHome();drawCoinHUD();
    if(talking){const bx=TITO.x+TITO.w*.85,by=TITO.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  down(x,y){if(!this.openT){const u=pickAt(x,y);if(u&&u.id==='chest')return call0(down0,this,800,520);if(u&&u.id==='tito'){this.hop=T;return down0.call(this,x,y)}
      // las flores alrededor del cofre también responden (lejos del cofre, para no quitarle toques)
      if(!u&&!atHome(x,y)&&!inR(x,y,800,520,380,360)&&W3&&wobTap(W3,x,y))return}
    return down0.call(this,x,y)}});
 // la casa de Tito por dentro sigue en 2D, pero en su lugar original
}

/* ================= LA PORTADA ================= */
function buildTitle(){const w=newWorld({fov:34,kind:'title',shadow:10}),nt=skyNow().night;w.sc.background=nt?gradTex('#F8DCCF','#5F6FB4','titleBgN'):gradTex('#FFF6E6','#FCE3C0','titleBg');// de noche, cielo de anochecer
  mk(Cyl(5.2,5.5,.7,48),'#BFE6A0',{p:[0,-.35,0],s:[1,1,.75],to:w.sc,ol:.1});mk(Cyl(5.6,4.2,1.6,48),'#D9A86C',{p:[0,-1.45,0],s:[1,1,.75],to:w.sc,ol:.1});
  for(let i=0;i<9;i++){const a=i/9*PI*2;flower3(w.sc,Math.cos(a)*4.3,Math.sin(a)*3,FLC[i%7],.8)}
  tree3(w.sc,-3.6,-1.6,.8,'primavera');bush3(w.sc,3.5,-1.4,.9);
  const tito=makeTito();tito.position.set(-.3,0,.6);tito.rotation.y=-.25;w.sc.add(tito);w.tito=tito;
  if(nt){w.sc.children.forEach(o=>{if(o.isLight)o.intensity*=.85});fireflies(w,14,8,1)}else butterfly3(w,-3.2,-1,'#FF8FB1',0,{s:1,h:2.6,r:1.8});fallPts(w,24,['#FFB3C7','#FFD1DC','#FFFFFF'],{size:.7,map:canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf'),sp:.45,sw:.8,h:7,wx:18,wz:8,cx:2,cz:-1});/* pétalos */if(!nt)butterfly3(w,4.2,-.5,'#7FD3F0',3,{s:1,h:1.6,r:1.8});// mariposas en la portada
  const qs=[];for(let i=0;i<10;i++){const s=spr(canvasTex(128,128,()=>text('?',64,108,120,LOGOC[i%LOGOC.length],{st:8,sc:'#fff'}),'q'+i),.9,.9,{p:[-8+i*1.8,1+(i*53%7)*.8,-3-(i%3)*1.5],to:w.sc,op:.8});qs.push(s)}
  w.upd.push(dt=>{tito.userData.anim(dt,{});tito.rotation.y=-.25+Math.sin(T*.5)*.35;qs.forEach((q,i)=>{q.position.y+=dt*(.3+(i%3)*.15);if(q.position.y>8)q.position.y=-1;q.material.rotation=Math.sin(T+i)*.2;
    // al pasar por detrás del título y del subtítulo se desvanecen para que se lean bien
    if(W3===w){const [x,y]=projO(q),tt=x>470&&x<1270&&y>40&&y<330;q.material.opacity+=((tt?.08:.8)-q.material.opacity)*Math.min(1,dt*6)}})});
  camRig(w,V3(3.2,3.8,12.5),V3(2.6,2.1,0),.6);return w}
{const S0=SCENES.title,enter0=S0.enter;
 Object.assign(S0,{three:true,
  enter(o){enter0.call(this,o);setWorld(buildTitle())},
  draw(){drawLogo(800,200,140);
    text(V(['Tito y las preguntas escondidas','Tito y las preguntas escondidas']),800,280,44,K,{w:600,st:10,sc:'#FFF6E6'});
    {ctx.save();text('3D',1180,150,54,'#fff',{f:LF,st:12,sc:'#9B8AD9'});ctx.restore()}
    const p=hv('play',hC(1180,560,120))*(1+Math.sin(T*4)*.05);ctx.save();ctx.translate(1180,560);ctx.scale(p,p);circ(0,0,110,'#7CC86E',8);ctx.beginPath();ctx.moveTo(-30,-48);ctx.lineTo(54,0);ctx.lineTo(-30,48);ctx.closePath();fillStroke('#fff',6);ctx.restore();
    if(S.age){pill(205,830,330,80,S.name?'Juega: '+S.name:'¿Quién juega?');pill(1395,830,330,80,'Empezar de nuevo','#fff','#C0473C')}
    if(document.fullscreenEnabled&&!standalone()){const s=hv('fs',hR(1515,85,90,90));ctx.save();ctx.translate(1515,85);ctx.scale(s,s);card(-45,-45,90,90,'#fff',6,28);ctx.lineWidth=7;ctx.strokeStyle=K;ctx.lineCap='round';ctx.beginPath();for(const[a,b,c,d]of[[-25,-10,-25,-25],[-25,-25,-10,-25],[25,-25,10,-25],[25,-25,25,-10],[-25,10,-25,25],[-25,25,-10,25],[25,25,10,25],[25,25,25,10]]){ctx.moveTo(a,b);ctx.lineTo(c,d)}ctx.stroke();ctx.restore()}
    if(deferredInstall&&!standalone())pill(185,85,300,74,'Instalar el juego','#FFE08A',K,30)}});
}
window.__w3.ok=true;
})();
