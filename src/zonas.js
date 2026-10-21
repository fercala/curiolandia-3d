/* ================= ZONAS, CAMINO, MAPA Y CASITAS (v3) ================= */
const ZAGE={jardin:3,bosque:4,montana:5};
const ZONES={
  jardin:{temas:[...T3,C3],name:'el Jardín de los 3 años',hello:'¡Bienvenido al Jardín de los 3 años! Seguí el camino: las casitas se abren de a una. ',bg:()=>sky('#E9F7FC','#F4FBEA'),bands:['#FFE2B8','#D6EEFA','#DDF3D2'],cbox:'#EDE7FF'},
  bosque:{temas:[...T4,C4],name:'el Bosque de los 4 años',hello:'¡Bienvenido al Bosque de los 4 años! Seguí el camino: las casitas se abren de a una. ',bg:()=>{sky('#D8F0CC','#F1FAE8');for(let i=0;i<12;i++){ctx.globalAlpha=.35;tree(120+i*130,880,.9+(i%3)*.15,i%2?'verano':'primavera');ctx.globalAlpha=1}},bands:['#F7DDB8','#D9ECF7','#CDEBC0'],cbox:'#E4DDF8'},
  montana:{temas:[...T5,C5],name:'la Montaña de los 5 años',hello:'¡Bienvenido a la Montaña de los 5 años! Seguí el camino: las casitas se abren de a una. ',bg:()=>{sky('#E2EAF8','#F6F2EA');ctx.globalAlpha=.4;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(i*300-60,900);ctx.lineTo(i*300+120,560+(i%2)*80);ctx.lineTo(i*300+300,900);ctx.closePath();fillStroke('#B9C3D6',0)}ctx.globalAlpha=1},bands:['#F9E0C4','#DCE7F7','#DDEFD5'],cbox:'#E8E1FA'},
  fiestas:{temas:FIESTAS,name:'los días especiales',hello:'¡Los días especiales! Se abren de a una, como un camino. ',bg:()=>BG.fiesta()},
  ingles:{temas:ING,name:'el Rincón del inglés',hello:'¡Bienvenido al Rincón del inglés! Acá aprendemos palabras en inglés, como los nenes de Inglaterra. Las casitas se abren de a una. ',
    bg:()=>{sky('#E3F0FF','#FFF4E6');for(let i=0;i<7;i++){const x=300+i*150,y=110+(i%2)*40;ctx.globalAlpha=.5;card(x-44,y-28,88,56,'#fff',4,24);text(['Hi!','ABC','1 2 3','Yes!','Wow!'][i%5],x,y+12,26,DIAC[i%7],{f:LF});ctx.globalAlpha=1}}}
};
const MAINZ=['jardin','bosque','montana'];
const zoneOf=t=>t.zone||'jardin';
const flowersIn=z=>ZONES[z].temas.filter(t=>tst(t.id).done).length;
const pathOf=z=>ZONES[z].temas.filter(t=>!t.concepts);
const pathDone=z=>pathOf(z).filter(t=>tst(t.id).done).length;
const mainDone=()=>MAINZ.reduce((a,z)=>a+pathDone(z),0);
function zoneOpen(z){if(z==='jardin'||!ZAGE[z])return true;if(S.unlockAll||ZAGE[z]<=AGE())return true;const prev=z==='bosque'?'jardin':'bosque';return zoneOpen(prev)&&flowersIn(prev)>=6}

/* ---------- el orden: qué está abierto ---------- */
// cuántas casitas del camino hay que terminar para abrir cada cosa
const NEED={'X-CAN':1,'X-RUT':2,'X-TRZ':3,fiestas:4,ingles:2,concepts:3};
const fiestaNow=()=>{const m=new Date().getMonth();return m===11||m===0?'F-navidad':m===1||m===2?'F-carnaval':m===3?'F-libro':null};
const started=t=>{const s=tst(t.id);return !!s.done||Object.keys(s.g).length>0};
function temaOpen(t){if(!t)return false;if(S.unlockAll||started(t))return true;const z=t.zone;
  if(MAINZ.includes(z)){if(!zoneOpen(z))return false;if(t.concepts)return pathDone(z)>=NEED.concepts;const L=pathOf(z),i=L.indexOf(t);return i<=0||!!tst(L[i-1].id).done}
  if(z==='fiestas'||z==='ingles'){if(mainDone()<NEED[z])return false;const L=ZONES[z].temas,i=L.indexOf(t);return i<=0||!!tst(L[i-1].id).done||fiestaNow()===t.id}
  if(NEED[t.id]!=null)return mainDone()>=NEED[t.id];
  return true}
// un juego se abre cuando terminaste el anterior (los ya jugados se pueden repetir)
const gameOpen=(t,j)=>S.unlockAll||j===0||!!tst(t.id).g[j]||!!tst(t.id).g[j-1];
const nextGameOf=t=>t.games.findIndex((g,j)=>!tst(t.id).g[j]&&gameOpen(t,j));
const ageZoneOpen=()=>{const z=({3:'jardin',4:'bosque',5:'montana'})[AGE()]||'jardin';return zoneOpen(z)?z:'jardin'};
function curTema(z){if(z==='fiestas')return FIESTAS.find(t=>!tst(t.id).done&&temaOpen(t))||null;
  const t=pathOf(z).find(t=>!tst(t.id).done&&temaOpen(t));if(t)return t;const c=ZONES[z].temas.find(t=>t.concepts);return c&&!tst(c.id).done&&temaOpen(c)?c:null}
function nextTema(){const z0=ageZoneOpen();
  for(const z of[z0,...MAINZ.filter(z=>z!==z0)]){if(!zoneOpen(z))continue;const t=pathOf(z).find(t=>!tst(t.id).done&&temaOpen(t));if(t)return t}
  for(const t of[CAN,RUT,...ING,TRZ,...MAINZ.map(z=>ZONES[z].temas.find(t=>t.concepts)),...FIESTAS])if(t&&!tst(t.id).done&&temaOpen(t))return t;
  return null}
suggestTema=function(z){return curTema(z||ageZoneOpen())};
const lowName=t=>t.concepts?'el Rincón de los Conceptos':V(t.n).replace(/^./,c=>c.toLowerCase());
function lockMsg(t){const z=t.zone;
  if(t.concepts)return 'El Rincón de los Conceptos se abre cuando termines tres casitas del camino. ¡Ya terminaste '+(NUM[pathDone(z)]||pathDone(z))+'!';
  if(z==='fiestas'&&mainDone()<NEED.fiestas)return 'Los días especiales se abren cuando termines cuatro casitas del camino.';
  if(z==='ingles'&&mainDone()<NEED.ingles)return 'El Rincón del inglés se abre cuando termines dos casitas del camino.';
  const L=z==='fiestas'?FIESTAS:pathOf(z),prev=L[L.indexOf(t)-1];
  return 'Esta casita todavía está cerrada. Primero terminá '+(prev?lowName(prev):'la anterior')+'. ¡Seguí el camino!'}

/* ---------- dibujos del camino ---------- */
function roadPath(pts,o){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];
  if(Math.abs(a[1]-b[1])<6)ctx.lineTo(b[0],b[1]);else{const sd=(a[0]+b[0])/2>800?1:-1;ctx.bezierCurveTo(a[0]+sd*o,a[1],b[0]+sd*o,b[1],b[0],b[1])}}}
function drawRoad(pts,upto,o=170){if(pts.length<2)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  roadPath(pts,o);ctx.lineWidth=60;ctx.strokeStyle='#D9C49A';ctx.stroke();ctx.lineWidth=48;ctx.strokeStyle='#FFF6E0';ctx.stroke();
  if(upto>0){roadPath(pts.slice(0,upto+1),o);ctx.lineWidth=48;ctx.strokeStyle='#FFE08A';ctx.stroke()}
  roadPath(pts,o);ctx.lineWidth=7;ctx.setLineDash([3,24]);ctx.strokeStyle='#C9AE7A';ctx.stroke();ctx.setLineDash([]);ctx.restore()}
function lockOver(x,y,r){ctx.save();ctx.globalAlpha=.62;circ(x,y,r,'#FFF6E6',0);ctx.globalAlpha=1;pic('candado',x,y+4,r*.78);ctx.restore()}
// candado que salta y se va cuando algo se abre; devuelve false cuando terminó
function unlockFx(x,y,r,t0){const k=T-t0;if(k<0){lockOver(x,y,r);return true}if(k>1.3)return false;const e=k/1.3;
  ctx.save();ctx.globalAlpha=Math.max(0,.62*(1-e*2.5));circ(x,y,r,'#FFF6E6',0);ctx.restore();ctx.save();ctx.globalAlpha=Math.max(0,1-e);ctx.translate(x+e*60,y-e*e*220);ctx.rotate(e*1.4);pic('candado',0,4,r*.78*(1+e*.4));ctx.restore();return true}
function arrowAt(x,y){const b=Math.abs(Math.sin(T*4))*16;ctx.save();ctx.translate(x,y-b);ctx.beginPath();ctx.moveTo(-15,-46);ctx.lineTo(15,-46);ctx.lineTo(15,-16);ctx.lineTo(32,-16);ctx.lineTo(0,18);ctx.lineTo(-32,-16);ctx.lineTo(-15,-16);ctx.closePath();fillStroke('#FFC93C',5);ctx.restore()}

// posiciones de las casitas de una zona: un camino en zigzag (izquierda→derecha, derecha→izquierda...)
function zonePos(z){const P={},L=ZONES[z].temas;
  if(!MAINZ.includes(z)){L.forEach((t,i)=>P[t.id]={x:900-(L.length-1)*170+i*340,y:500,s:1.25});return P}
  const path=pathOf(z),rows=[[0,1,2,3,4],[5,6,7,8],[9,10,11]],ys=[250,490,725];
  rows.forEach((r,ri)=>r.forEach((n,j)=>{const t=path[n];if(t)P[t.id]={x:ri===0?440+j*256:ri===1?1290-j*280:450+j*280,y:ys[ri],band:ri,s:1}}));
  const c=L.find(t=>t.concepts);if(c)P[c.id]={x:1420,y:690,band:3,s:1};return P}
const ZPOS={};for(const z in ZONES)ZPOS[z]=zonePos(z);
// ¿se abrió algo nuevo desde la última vez? (para la animación del candado)
function newlyOpen(key,ids){const prev=S.seenOpen[key];S.seenOpen[key]=ids;save();return prev?ids.filter(i=>!prev.includes(i)):[]}

function zoneScene(z){const Z=ZONES[z],P=ZPOS[z],path=z==='fiestas'?FIESTAS:pathOf(z);
  return {music:z==='fiestas'?'plaza':'jardin',
    enter(o){this.cur=curTema(z);this.unl=null;
      const nw=newlyOpen('z:'+z,Z.temas.filter(temaOpen).map(t=>t.id));
      if(nw.length){const t=TEMA[nw[0]];this.unl={id:t.id,t:T+1};later(1000,()=>{SFX.sparkle();const p=P[t.id];burst(p.x,p.y,40)});
        later(500,()=>say('¡Mirá! ¡Se abrió '+(t.concepts?'el Rincón de los Conceptos':'una casita nueva: '+lowName(t))+'! Tocala para jugar.'))}
      else if(o.from&&!this.cur)later(400,()=>say('¡Terminaste todo el camino'+kid()+'! ¡Increíble! Podés repetir la casita que quieras.'))
      else if(o.hello)later(400,()=>this.prompt(!S.first[z]));
      S.first[z]=1;save()},
    prompt(long){const c=this.cur;say((long?Z.hello:'')+(c?'Tocá la casita que brilla: '+lowName(c)+'.':'¡Terminaste todo el camino! Podés repetir la casita que quieras.'))},
    hint(){const c=this.cur;if(!c)return null;const p=P[c.id];return{x:p.x,y:p.y,r:110*p.s}},
    dwell(id){const t=TEMA[id.slice(2)];if(t)say(V(t.n)+'.')},
    draw(){Z.bg();
      if(Z.bands){[250,490,725].forEach((y,i)=>{card(250,y-112,i===0?1330:i===1?1120:840,224,Z.bands[i],0,60)});card(1300,580,240,230,Z.cbox,0,50);
        ['hojaNaranja','copo','flor'].forEach((k,i)=>{const y=[250,490,725][i];circ(292,y,40,'#fff',5);pic(k,292,y,62)})}
      else{card(330,250,1140,480,'rgba(255,255,255,.55)',0,60)}
      const pts=path.map(t=>[P[t.id].x,P[t.id].y]),ci=this.cur?path.indexOf(this.cur):path.length-1;drawRoad(pts,ci<0?0:ci);
      for(const t of Z.temas){const p=P[t.id],acc=temaOpen(t),s=acc?hv('j:'+t.id,hR(p.x,p.y,220*p.s,220*p.s)):1;
        drawCasita(t,p.x,p.y,{s:s*p.s,glow:this.cur===t});
        const un=this.unl&&this.unl.id===t.id&&unlockFx(p.x,p.y-10,118*p.s,this.unl.t);
        if(!un&&!acc)lockOver(p.x,p.y-10,118*p.s);
        if(this.cur===t&&!(this.unl&&this.unl.id===t.id&&T<this.unl.t+.4))arrowAt(p.x,p.y-150*p.s)}
      const c=Z.temas.find(t=>t.concepts);if(c&&!temaOpen(c)){const p=P[c.id];card(p.x-70,p.y+104,140,50,'#fff',5,25);flower(p.x-36,p.y+129,12,FLC[0],2.5);text(Math.min(pathDone(z),3)+'/3',p.x+20,p.y+142,32,K,{f:LF})}
      drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
    down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}if(inTito(x,y)){this.prompt(true);return}if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
      for(const t of Z.temas){const p=P[t.id];if(inR(x,y,p.x,p.y,220*p.s,230*p.s)){
        if(!temaOpen(t)){SFX.boing();say(lockMsg(t));return}
        SFX.pop();go('casita',{t:t.id,hello:true});return}}
      SFX.tap();sparkles(x,y)}};
}
for(const z in ZONES)SCENES[z]=zoneScene(z);

/* ---------- la casa de Tito y Pipo, el dinosaurio que crece ---------- */
const HOUSE_AT=[1040,800];
const houseLevel=()=>{const n=temasDone();return n<2?0:n<5?1:n<9?2:n<14?3:4};
const HOUSE_NEXT=[2,5,9,14];
const HOUSE_SAY=['','¡La casa de Tito creció! Ahora tiene un jardín con cerca y flores.','¡La casa de Tito creció! Ahora tiene un piso más, con balcón.','¡La casa de Tito creció! Ahora tiene una torre con bandera.','¡La casa de Tito es un castillo! Tiene estrella y arcoíris.'];
const petStage=()=>{const s=STARS();return s<4?0:s<15?1:s<35?2:s<70?3:4};
const PET_NEXT=[4,15,35,70];
const PET_SAY=['¡Mirá! En el jardín de Tito apareció un huevo misterioso. ¡Si jugás, se va a abrir!','¡El huevo se abrió! ¡Nació Pipo, un dinosaurio bebé!','¡Pipo salió del cascarón y ya camina!','¡Pipo está creciendo un montón!','¡Pipo es un dinosaurio grandote! ¡Y tiene corona!'];
function drawPet(x,y,s,o={}){const st=o.st??petStage(),j=o.jump?Math.max(0,1-(T-o.jump)*1.6)*Math.abs(Math.sin((T-o.jump)*10))*-s*.35:0;ctx.save();ctx.translate(x,y+j);
  if(st===0){const w=Math.sin(T*9)*.1*(Math.sin(T*.8)>.55?1:0);ctx.rotate(w);ell(0,-s*.42,s*.31,s*.41,'#FFF6E0',Math.max(3,s*.05));for(const [a,b,r] of[[-.12,-.6,.08],[.13,-.46,.07],[-.08,-.25,.06],[.15,-.7,.05],[.02,-.38,.04]])circ(a*s,b*s,r*s,'#9BD86A',0)}
  else if(st===1)pic('huevoDino',0,-s*.46,s*.95);
  else{const k=st===2?.72:st===3?.92:1.1,b=Math.abs(Math.sin(T*3))*-s*.03;pic('dinosaurio',0,-s*k*.44+b,s*k);if(st>=4)pic('corona',s*k*.27,-s*k*.9+b,s*k*.3)}
  ctx.restore()}
// emblema de Tito (puerta de su casa, tienda): espiral de caracol, púas de erizo, placas de tortuga o mochila de conejo, con el color de la tienda
function shellIcon(x,y,r,sh,kind){sh=sh||(S.tito&&S.tito.shell);const c=SHELLC[sh]||SHELLC.naranja,tk=kind||(typeof titoKind==='function'?titoKind():'caracol'),lw=Math.max(3,r*.12);ctx.lineCap='round';ctx.lineJoin='round';
  if(tk==='erizo'){const nar=!SHELLC[sh]||sh==='naranja',f=nar?'#B07A4F':c[0],st=nar?'#7A5030':c[1];ctx.beginPath();for(let i=0;i<24;i++){const a=i/24*PI*2,q=i%2?r*.72:r*1.02;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}ctx.closePath();fillStroke(f,lw);
    ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*PI*2+.2;ctx.moveTo(x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.2);ctx.lineTo(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55)}ctx.lineWidth=r*.11;ctx.strokeStyle=st;ctx.stroke();return}
  if(tk==='conejo'){ctx.save();ctx.translate(x,y);card(-r*.78,-r*.82,r*1.56,r*1.7,c[0],lw,r*.3);ctx.beginPath();ctx.moveTo(-r*.6,-r*.2);ctx.lineTo(r*.6,-r*.2);ctx.moveTo(-r*.3,-r*.2);ctx.lineTo(-r*.3,-r*.75);ctx.moveTo(r*.3,-r*.2);ctx.lineTo(r*.3,-r*.75);ctx.lineWidth=r*.13;ctx.strokeStyle=c[1];ctx.stroke();ctx.restore();return}
  circ(x,y,r,c[0],lw);ctx.beginPath();
  if(tk==='tortuga'){const h=r*.4;for(let i=0;i<=6;i++){const a=i/6*PI*2+PI/6;ctx.lineTo(x+Math.cos(a)*h,y+Math.sin(a)*h)}for(let i=0;i<6;i++){const a=i/6*PI*2+PI/6;ctx.moveTo(x+Math.cos(a)*h,y+Math.sin(a)*h);ctx.lineTo(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86)}}
  else for(let i=0;i<=30;i++){const a=i/30*PI*4,q=r*.08+i/30*r*.62;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}
  ctx.lineWidth=r*.14;ctx.strokeStyle=c[1];ctx.stroke()}
function drawTitoHouse(x,gy,lvl,o={}){const s=o.s||1,sh=o.shake?Math.sin(T*40)*7*Math.max(0,1-(T-o.shake)/1.4):0;ctx.save();ctx.translate(x+sh,gy);ctx.scale(s,s);
  if(lvl>=4)['#FF6B5E','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9'].forEach((c,i)=>{ctx.beginPath();ctx.arc(0,-60,178-i*10,PI,0);ctx.lineWidth=10;ctx.strokeStyle=c;ctx.globalAlpha=.75;ctx.stroke();ctx.globalAlpha=1});
  ell(0,8,172,36,'#9FD88A',5);
  if(lvl>=3){card(92,-250,70,250,'#FFE3B0',6,8);ctx.beginPath();ctx.moveTo(82,-246);ctx.lineTo(127,-330);ctx.lineTo(172,-246);ctx.closePath();fillStroke('#9B8AD9',6);
    circ(127,-185,16,'#BFEAF7',5);card(117,-118,20,34,'#BFEAF7',4,8);ctx.beginPath();ctx.moveTo(127,-330);ctx.lineTo(127,-382);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.stroke();
    const f=Math.sin(T*5)*6;ctx.beginPath();ctx.moveTo(127,-382);ctx.quadraticCurveTo(150,-374+f,174,-368);ctx.lineTo(127,-352);ctx.closePath();fillStroke('#FF6B5E',4)}
  const two=lvl>=2,top=two?-210:-120;
  card(40,top-64,30,62,'#C98A4B',5,4);for(let i=0;i<3;i++){const k=(T*.35+i/3)%1;ctx.globalAlpha=.75*(1-k);circ(55+Math.sin(T+i)*8+k*24,top-74-k*90,9+k*14,'#fff',3,'#D8D0C4');ctx.globalAlpha=1}
  card(-95,top,190,-top,'#FFF3D6',7,10);
  ctx.beginPath();ctx.moveTo(-120,top+4);ctx.lineTo(0,top-94);ctx.lineTo(120,top+4);ctx.closePath();fillStroke('#FF8A7A',7);
  shellIcon(0,top-36,24);if(lvl>=4)star(0,top-110,28,'#FFC93C',4);
  const h=new Date().getHours(),lit=h>=19||h<7;
  for(const [wx,wy] of[[-58,-86],[58,-86],...(two?[[-58,-176],[58,-176]]:[])]){card(wx-19,wy-17,38,34,lit?'#FFE08A':'#BFEAF7',5,6);ctx.beginPath();ctx.moveTo(wx,wy-17);ctx.lineTo(wx,wy+17);ctx.moveTo(wx-19,wy);ctx.lineTo(wx+19,wy);ctx.lineWidth=3;ctx.strokeStyle=K;ctx.stroke()}
  if(two){card(-48,-150,96,14,'#C98A4B',4,5);for(let i=0;i<3;i++)flower(-30+i*30,-158,9,FLC[i+2],2)}
  card(-22,-72,44,72,'#C98A4B',5,16);circ(12,-34,4,K,0);
  if(lvl>=1){ctx.lineWidth=5;ctx.strokeStyle=K;for(const sd of[-1,1]){ctx.fillStyle='#FFF6E0';for(let i=0;i<4;i++){const px=sd*(48+i*30);card(px-5,-4,10,32,'#FFF6E0',3,3)}card(sd>0?40:-148,6,108,8,'#FFF6E0',3,3)}
    for(let i=0;i<8;i++)flower(-150+i*43,40+(i%2)*6,8,FLC[i%7],2)}
  const own=k=>S.owned&&S.owned[k];
  if(own('farol'))pic('farol',-150,-50,84);
  if(own('fuente'))pic('fuente',-128,18,70);
  if(own('casitaPerro')){pic('casitaPerro',118,10,72);pic('perro',150,26,40)}
  if(own('banco'))pic('banco',-70,30,56);
  card(-92,48,184,44,'#FFA94D',5,22);text(tx('Casa de Tito'),0,80,27,'#fff');
  ctx.restore()}

/* ---------- el mapa ---------- */
const MZ2=[
  {id:'plaza',x:790,y:500,r:125,name:'la plaza de la asamblea'},
  {id:'jardin',x:390,y:590,r:140,name:'el Jardín de los 3 años'},
  {id:'bosque',x:1090,y:300,r:135,name:'el Bosque de los 4 años'},
  {id:'montana',x:1385,y:610,r:140,name:'la Montaña de los 5 años'},
  {id:'canciones',x:300,y:300,r:90,name:'las canciones',t:'X-CAN'},
  {id:'trazos',x:530,y:255,r:85,name:'los trazos',t:'X-TRZ'},
  {id:'rutinas',x:770,y:240,r:85,name:'las rutinas y los hábitos',t:'X-RUT'},
  {id:'album',x:1450,y:270,r:80,name:'el álbum'},
  {id:'ingles',x:1290,y:458,r:74,name:'el Rincón del inglés'},
  {id:'fiestas',x:575,y:785,r:90,name:'los días especiales'},
  {id:'tienda',x:790,y:800,r:90,name:'la tienda'},
  {id:'casaTito',x:1040,y:715,r:150,name:'la casa de Tito'}
];
const SEGUIR={x:340,y:812,r:64};
const mzOf=id=>MZ2.find(z=>z.id===id);
function spotOpen(id){if(S.unlockAll)return true;if(id==='canciones')return temaOpen(CAN);if(id==='rutinas')return temaOpen(RUT);if(id==='trazos')return temaOpen(TRZ);if(id==='fiestas')return mainDone()>=NEED.fiestas;if(id==='ingles')return mainDone()>=NEED.ingles;if(ZAGE[id])return zoneOpen(id);return true}
const spotNeed=id=>({canciones:NEED['X-CAN'],rutinas:NEED['X-RUT'],trazos:NEED['X-TRZ'],fiestas:NEED.fiestas,ingles:NEED.ingles})[id];
function goSeguir(){if(!asamHoy()){go('asamblea');return}const t=nextTema();if(!t){say('¡Terminaste todos los caminos'+kid()+'! Podés repetir lo que más te guste.');return}go('casita',{t:t.id,hello:true})}
function drawSeguir(){const p=(Math.sin(T*4)+1)/2,s=hv('seguir',hC(SEGUIR.x,SEGUIR.y,SEGUIR.r+8));ctx.save();ctx.translate(SEGUIR.x,SEGUIR.y);ctx.scale(s*(1+p*.05),s*(1+p*.05));
  ctx.globalAlpha=.35+.3*p;circ(0,0,SEGUIR.r+12,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,SEGUIR.r,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-18,-28);ctx.lineTo(30,0);ctx.lineTo(-18,28);ctx.closePath();fillStroke('#fff',5);ctx.restore()}
function drawZoneSpot(z,o={}){const {x,y}=z,open=zoneOpen(z.id),s=hv('mz'+z.id,hC(x,y,z.r));ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.translate(-x,-y);
  if(o.glow){const p=(Math.sin(T*4)+1)/2;ctx.globalAlpha=.4+.3*p;circ(x,y,z.r+10+p*10,null,12,'#FFC93C');ctx.globalAlpha=1}
  const wk=o.wake?Math.max(0,1-(T-o.wake)/1.5):0;if(wk){ctx.translate(Math.sin(T*40)*8*wk,0)}
  if(z.id==='plaza'){circ(x,y,115,'#F1E2C8',7);circ(x,y,50,'#7FD3F0',6);circ(x,y,18,'#fff',4);for(let i=0;i<6;i++){const a=T*2+i;circ(x+Math.cos(a)*28,y-10+Math.sin(a)*8-Math.abs(Math.sin(T*4+i))*14,5,'#BFEAF7',0)}
    card(x-112,y-160,224,84,'#fff',6,16);DIAC.forEach((c,i)=>{circ(x-84+i*28,y-132,10,c,3)});text('ASAMBLEA',x,y-90,28,K,{f:LF})}
  if(z.id==='jardin'){ell(x,y+10,160,112,'#9FDC8F',7);for(let i=0;i<12;i++){const a=i/12*PI*2;ctx.fillStyle='#C98A4B';ctx.fillRect(x+Math.cos(a)*150-4,y+10+Math.sin(a)*102-26,8,30)}
    [[-66,-18],[18,-38],[84,8],[-28,46]].forEach(([a,b],i)=>{card(x+a-28,y+b-18,56,42,'#FFF3B0',4,6);ctx.beginPath();ctx.moveTo(x+a-36,y+b-18);ctx.lineTo(x+a,y+b-48);ctx.lineTo(x+a+36,y+b-18);ctx.closePath();fillStroke(FLC[i],4)});
    for(let i=0;i<6;i++)flower(x-112+i*45,y+76+(i%2)*10,9,FLC[i],2);card(x-58,y-146,116,50,'#FF8A7A',5,25);text(tx('3 años'),x,y-111,28,'#fff')}
  if(z.id==='bosque'){for(const [a,b,sc] of[[-80,20,.7],[0,-10,.85],[80,25,.7],[-30,60,.6],[50,70,.6]])tree(x+a,y+b,sc,open?(a<0?'otoño':'verano'):'gris');
    card(x-58,y-150,116,50,open?'#7CC86E':'#B8B0A6',5,25);text(tx('4 años'),x,y-115,28,'#fff')}
  if(z.id==='montana'){ctx.beginPath();ctx.moveTo(x-160,y+86);ctx.lineTo(x-40,y-104);ctx.lineTo(x+20,y-28);ctx.lineTo(x+80,y-114);ctx.lineTo(x+170,y+86);ctx.closePath();fillStroke(open?'#A9C98A':'#CFC8BF',7);
    for(const [a,b] of[[-40,-104],[80,-114]]){ctx.beginPath();ctx.moveTo(x+a-30,y+b+44);ctx.lineTo(x+a,y+b);ctx.lineTo(x+a+30,y+b+44);ctx.closePath();fillStroke('#fff',5)}
    if(open)for(let i=0;i<5;i++)flower(x-100+i*50,y+60-(i%2)*14,9,FLC[i+1],2);card(x-58,y+96,116,50,open?'#5B8DEF':'#B8B0A6',5,25);text(tx('5 años'),x,y+131,28,'#fff')}
  if(!open&&(z.id==='bosque'||z.id==='montana')){ctx.globalAlpha=.55+.3*Math.sin(T*2+x);text('z',x+110,y-60+Math.sin(T+x)*6,34,'#7A6252');text('z',x+132,y-86+Math.sin(T+x)*6,26,'#7A6252');ctx.globalAlpha=1}
  if(z.id==='canciones'){pic('carpa',x,y,180);for(let i=0;i<3;i++){const k=(T*.5+i/3)%1;ctx.globalAlpha=1-k;text('♪',x-50+i*50+Math.sin(T*2+i)*10,y-70-k*60,34,DIAC[i*2],{st:3});ctx.globalAlpha=1}}
  if(z.id==='trazos'){pic('pizarra',x,y,170)}
  if(z.id==='rutinas'){card(x-62,y-26,124,90,'#BFEAF7',6,10);ctx.beginPath();ctx.moveTo(x-80,y-24);ctx.lineTo(x,y-90);ctx.lineTo(x+80,y-24);ctx.closePath();fillStroke('#5BB8E6',6);circ(x,y+18,34,'#fff',5);pic('manos',x,y+18,58);for(let i=0;i<3;i++){const k=(T*.6+i/3)%1;ctx.globalAlpha=1-k;circ(x+60+Math.sin(T*3+i)*8,y-30-k*60,6+i*2,'rgba(255,255,255,.8)',2,'#9ED9F5')}ctx.globalAlpha=1}
  if(z.id==='album'){ctx.save();ctx.translate(x,y);ctx.rotate(-.08);card(-60,-50,120,100,'#9B8AD9',6,14);card(-48,-40,96,80,'#FFF6E6',4,10);star(0,0,26,'#FFC93C',4);ctx.restore()}
  if(z.id==='fiestas'){pic('fuegos',x,y-44,130);pic('tarta',x-38,y+26,110);pic('regalo',x+46,y+34,90)}
  if(z.id==='ingles'){ctx.save();ctx.translate(x,y);const b=Math.sin(T*2)*3;card(-70,-58+b,140,84,'#fff',6,30);ctx.beginPath();ctx.moveTo(-24,24+b);ctx.lineTo(-40,52+b);ctx.lineTo(0,24+b);ctx.closePath();fillStroke('#fff',6);card(-26,18+b,40,10,'#fff',0,0);
    text('Hello!',0,-4+b,36,'#5B8DEF',{f:LF});card(-54,40,108,40,'#FF6B5E',5,20);text('ABC',0,70,26,'#fff',{f:LF});ctx.restore()}
  if(z.id==='tienda'){pic('tienda',x,y,180);if(S.coins>0){pic('moneda',x+62,y-60,50+Math.sin(T*4)*4)}}
  if(z.id==='casaTito'){drawTitoHouse(HOUSE_AT[0],HOUSE_AT[1],houseLevel(),{shake:o.shake});drawPet(HOUSE_AT[0]+170,HOUSE_AT[1]+40,96,{jump:o.petJump})}
  const lk=!spotOpen(z.id)&&!ZAGE[z.id];
  if(o.unl&&unlockFx(x,y,z.r*.85,o.unl)){}else if(lk){lockOver(x,y,z.r*.85);card(x-46,y+z.r*.6,92,44,'#fff',5,22);flower(x-20,y+z.r*.6+22,11,FLC[0],2.5);text(String(spotNeed(z.id)),x+18,y+z.r*.6+35,30,K,{f:LF})}
  ctx.restore()}
SCENES.map=Object.assign(SCENES.map,{
  enter(o){this.wake=null;this.unl=null;this.shake=0;this.petJump=0;
    let msg=null,fx=null;
    for(const z of['bosque','montana'])if(zoneOpen(z)&&!S.woke[z]){S.woke[z]=1;save();if(ZAGE[z]>AGE()&&!S.unlockAll){this.wake={z,t:T+1};msg='¡Mirá'+kid()+'! ¡Se despertó '+mzOf(z).name+'! Ahora podés jugar ahí también.';break}}
    const nw=newlyOpen('map',MZ2.filter(z=>spotNeed(z.id)&&spotOpen(z.id)).map(z=>z.id));
    if(!msg&&nw.length){const z=mzOf(nw[0]);this.unl={id:z.id,t:T+1};msg='¡Mirá'+kid()+'! ¡Se '+(/^l[ao]s /.test(z.name)?'abrieron ':'abrió ')+z.name+'! Tocá para jugar.';fx=()=>{SFX.sparkle();burst(z.x,z.y,50)}}
    const hl=houseLevel();if(S.houseSeen==null)S.houseSeen=hl;
    if(!msg&&hl>S.houseSeen){S.houseSeen=hl;save();msg=HOUSE_SAY[hl];fx=()=>{this.shake=T;SFX.tada();burst(HOUSE_AT[0],HOUSE_AT[1]-150,80)}}
    const ps=petStage();
    if(!msg&&(S.petSeen==null||ps>S.petSeen)){S.petSeen=ps;save();msg=PET_SAY[ps];fx=()=>{this.petJump=T;SFX.sparkle();burst(HOUSE_AT[0]+170,HOUSE_AT[1],40)}}
    const n=temasDone();
    if(!msg&&n>S.seenFl){S.seenFl=n;save();msg=`¡Mirá${kid()}! ¡Tito tiene ${n===1?'una flor':(n<=10?NUM[n]:n)+' flores'} en su caparazón!`;fx=()=>{SFX.sparkle();burst(130,740,40)}}
    if(msg){later(600,()=>{if(this.wake){SFX.tada();const z=mzOf(this.wake.z);burst(z.x,z.y,70);this.wake.t=T}if(fx)fx();say(msg)})}
    else if(S.gift!==today()){S.gift=today();save();later(900,()=>say(V(['¡Hola'+kid()+'! Te guardé un regalito: ¡tres monedas!','¡Hola'+kid()+'! Te he guardado un regalito: ¡tres monedas!'])));later(1400,()=>giveCoins(3,TITO.x+150,TITO.y+40))}
    else if(o.hello)later(400,()=>this.prompt(true));
    if(sessionT>15*60&&!restAsked&&!S.limit){restAsked=true;later(3000,()=>say('Jugamos un montón. ¿Descansamos un ratito? Tito te espera cuando quieras.'))}
  },
  ageZone(){return ageZoneOpen()},
  prompt(first){const h=new Date().getHours(),sal=h<13?'¡Buen día':h<20?'¡Buenas tardes':'¡Buenas noches';
    if(!asamHoy())say((first?sal+kid()+'! ':'')+'Vamos a la plaza a hacer la asamblea. Tocá la plaza.');
    else say((first?sal+kid()+'! ':'')+'Tocá el botón verde para seguir el camino. También podés ir a la tienda o a la casa de Tito.')},
  hint(){if(!asamHoy()){const z=mzOf('plaza');return{x:z.x,y:z.y,r:z.r*.8}}return{x:SEGUIR.x,y:SEGUIR.y,r:SEGUIR.r+10}},
  dwell(id){if(id==='seguir'){say('Seguir el camino.');return}const z=MZ2.find(z=>'mz'+z.id===id);if(z)say(cap(z.name)+(!spotOpen(z.id)?(ZAGE[z.id]?'. Todavía '+(z.id==='montana'?'está dormida.':'está dormido.'):'. Todavía está cerrado.'):'.'))},
  draw(){
    ctx.fillStyle='#7FD3F0';ctx.fillRect(0,0,W,H);
    for(let i=0;i<14;i++){const x=(i*233)%1600,y=60+(i*137)%800;ctx.beginPath();ctx.moveTo(x+Math.sin(T+i)*10,y);ctx.quadraticCurveTo(x+20,y-14,x+40,y);ctx.quadraticCurveTo(x+60,y+14,x+80,y);ctx.lineWidth=6;ctx.strokeStyle='#B9E9F8';ctx.lineCap='round';ctx.stroke()}
    ctx.beginPath();ctx.moveTo(150,560);ctx.bezierCurveTo(100,330,180,170,420,170);ctx.bezierCurveTo(640,130,1000,130,1250,170);ctx.bezierCurveTo(1500,170,1590,330,1570,520);ctx.bezierCurveTo(1580,760,1400,880,1100,870);ctx.bezierCurveTo(840,895,520,885,330,850);ctx.bezierCurveTo(180,810,160,690,150,560);ctx.closePath();fillStroke('#BFE6A0',8);
    const P=mzOf('plaza');ctx.lineCap='round';
    for(const z of MZ2){if(z.id==='plaza')continue;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.quadraticCurveTo((P.x+z.x)/2+(z.y-P.y)*.12,(P.y+z.y)/2-(z.x-P.x)*.08,z.x,z.y);ctx.lineWidth=34;ctx.strokeStyle='#FFF3D6';ctx.stroke();ctx.lineWidth=8;ctx.setLineDash([4,28]);ctx.strokeStyle='#E4CFA0';ctx.stroke();ctx.setLineDash([])}
    for(const z of MZ2)drawZoneSpot(z,{glow:z.id==='plaza'?!asamHoy():false,wake:this.wake&&this.wake.z===z.id?this.wake.t:0,unl:this.unl&&this.unl.id===z.id?this.unl.t:0,shake:this.shake,petJump:this.petJump});
    card(560,22,480,88,'#fff',6,44);drawLogoSmall(800,86,56);
    drawSeguir();
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w);
  },
  down(x,y){
    if(atHome(x,y)){SFX.tap();go('title');return}
    if(inTito(x,y)){this.prompt(false);return}
    if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
    if(dist(x,y,SEGUIR.x,SEGUIR.y)<SEGUIR.r+10){SFX.pop();goSeguir();return}
    if(dist(x,y,HOUSE_AT[0]+170,HOUSE_AT[1]-10)<55){this.petJump=T;SFX.boing();const ps=petStage();say(ps===0?'Es un huevo misterioso. Le '+((PET_NEXT[0]-STARS())===1?'falta un juego':'faltan '+(PET_NEXT[0]-STARS())+' juegos')+' para abrirse.':'¡Hola! Soy Pipo, el dinosaurio de Tito.');return}
    const z=MZ2.filter(z=>dist(x,y,z.x,z.y)<z.r).sort((a,b)=>dist(x,y,a.x,a.y)-dist(x,y,b.x,b.y))[0];
    if(z){
      if(ZAGE[z.id]&&!zoneOpen(z.id)){SFX.boing();const prev=z.id==='bosque'?'jardin':'bosque',f=flowersIn(prev);say(cap(z.name)+' todavía está '+(z.id==='montana'?'dormida':'dormido')+'. Se despierta cuando Tito tenga seis flores '+(prev==='jardin'?'del jardín':'del bosque')+(f?'. ¡Ya tiene '+(f===1?'una':NUM[f]||f)+'!':'.'));return}
      if(!spotOpen(z.id)){SFX.boing();const n=spotNeed(z.id),d=mainDone();say(cap(z.name)+' se '+(z.id==='trazos'||z.id==='fiestas'||z.id==='canciones'||z.id==='rutinas'?'abren':'abre')+' cuando termines '+(n===1?'una casita':NUM[n]+' casitas')+' del camino.'+(d?' ¡Ya terminaste '+(d===1?'una':NUM[d]||d)+'!':''));return}
      SFX.pop();
      if(z.id==='plaza')go('asamblea');else if(z.t)go('casita',{t:z.t,hello:true});else go(z.id,{hello:true});return}
    SFX.tap();sparkles(x,y);
  }
});

/* ---------- casitas de tema: los juegos también son un camino ---------- */
Object.assign(GNAME,{cuento:'El cuento',cancion:'La canción',trazo:'Trazos',secuencia:'¿Qué va primero?',series:'¿Qué viene después?',memoria:'Memoria',velas:'Soplar las velitas',decora:'Decorar'});
stationPos=function(t,j){const n=t.games.length;if(n<=4)return[860-(n-1)*180+j*360,560];
  if(n<=6){const r=Math.floor(j/3),c=j%3;return[540+(r?2-c:c)*360,r?700:420]}
  const r=Math.floor(j/4),c=j%4;return[400+(r?3-c:c)*340,r?700:410]};
const stLocked=(t,j)=>!gameOpen(t,j);
Object.assign(SCENES.casita,{
  enter(o){this.t=TEMA[o.t];S.last=o.t;save();this.unl=null;
    if(o.fin){go('cofre',{t:o.t});return}
    const t=this.t,nw=newlyOpen('g:'+t.id,t.games.map((g,j)=>j).filter(j=>gameOpen(t,j)));
    if(nw.length&&!o.hello){const j=nw[0];this.unl={j,t:T+.8};later(800,()=>{SFX.sparkle();const [x,y]=stationPos(t,j);burst(x,y,30)});later(300,()=>say('¡Se abrió el juego número '+(j+1)+'! Tocalo para seguir.'))}
    else if(o.hello)later(300,()=>this.prompt(true))},
  prompt(long){const t=this.t,nx=nextGameOf(t);say((long?V(t.n)+'. '+(t.intro&&!t.words?V(t.intro)+' ':''):'')+(nx===0?(t.games[0].t==='conocer'?'Empezá por el primero: ¡vamos a conocer!':'Empezá por el primero.'):nx>0?'Tocá el que brilla, el número '+(nx+1)+'.':'¡Ya jugaste todos! Podés repetir el que más te guste.'))},
  hint(){const t=this.t,nx=nextGameOf(t);if(nx<0)return null;const [x,y]=stationPos(t,nx);return{x,y,r:140}},
  draw(){const t=this.t;t.bg();
    {ctx.font=`600 54px ${DF}`;const tw=Math.min(900,ctx.measureText(V(t.n)).width);card(170,34,tw+190,112,'#fff',6,56);pic(t.icon,250,90,90);text(V(t.n),310+tw/2,110,54,K,{w:600})}
    const pts=t.games.map((g,j)=>stationPos(t,j)),nx=nextGameOf(t);drawRoad(pts,nx<0?pts.length-1:nx,150);
    t.games.forEach((g,j)=>{const [x,y]=pts[j],lk=stLocked(t,j);drawStation(t,j,x,y,{s:lk?1:hv('g:'+j,hC(x,y,130))});
      const un=this.unl&&this.unl.j===j&&unlockFx(x,y,124,this.unl.t);
      if(!un&&lk)lockOver(x,y,124);
      circ(x-96,y-96,30,lk?'#EADFCF':tst(t.id).g[j]?'#7CC86E':'#5B8DEF',5);text(String(j+1),x-96,y-84,34,'#fff',{f:LF});
      if(j===nx&&!(this.unl&&this.unl.j===j&&T<this.unl.t+.4))arrowAt(x,y-170)});
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  down(x,y){const t=this.t;
    if(atHome(x,y)){SFX.tap();go(ZONES[t.zone]?t.zone:'map');return}
    if(inTito(x,y)){this.prompt(true);return}
    if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
    for(let j=0;j<t.games.length;j++){const [gx,gy]=stationPos(t,j);if(dist(x,y,gx,gy)<140){
      if(stLocked(t,j)){SFX.boing();const nx=nextGameOf(t);say('Este todavía está cerrado. Primero terminá el número '+((nx<0?j-1:nx)+1)+'.');return}
      SFX.pop();go('juego',{t:t.id,g:j});return}}
    SFX.tap();sparkles(x,y)}
});

/* ---------- el cofre del tesoro: premio al terminar una casita ---------- */
// regalos en orden fijo (sorpresa para el nene, pero sin azar); el resto queda en la tienda
const GIFTS=['gorroFiesta','pelotaPlaya','cuadro','bufanda:azul','peluche','plantaInterior','monio','cometa','alfombra','caparazon:azul','xilofono','farol','gorra','bloques','lampara','pecera','gafas','banco','robot','caparazon:rosa','trenJuguete','hamster','sombreroPirata','fuente','telescopio','corona'];
const nextGift=()=>GIFTS.map(id=>SHOP.find(i=>i.id===id)).find(it=>it&&!S.owned[it.id])||null;
function grantGift(it){S.owned[it.id]=1;if(it.slot)wear(it,true);else placeHome(it.id);save()}
function drawChest(x,y,s,op,sh){ctx.save();ctx.translate(x+sh,y);ctx.scale(s,s);
  if(op>0){ctx.save();ctx.globalAlpha=Math.min(1,op*1.5)*.85;for(let i=0;i<12;i++){const a=T*.6+i/12*PI*2;ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(Math.cos(a-.12)*520,-40+Math.sin(a-.12)*520);ctx.lineTo(Math.cos(a+.12)*520,-40+Math.sin(a+.12)*520);ctx.closePath();ctx.fillStyle=i%2?'#FFF3B0':'#FFE08A';ctx.fill()}ctx.restore()}
  ell(0,138,190,26,'rgba(74,52,40,.18)',0);
  card(-150,-30,300,160,'#B5763F',8,18);for(const yy of[20,70])card(-146,yy,292,6,'#8A5A3C',0,3);
  for(const bx of[-110,110])card(bx-16,-30,32,160,'#FFC93C',6,6);
  if(op>0){ell(0,-30,140,26,'#5A3A26',5);ctx.globalAlpha=Math.min(1,op*2);ell(0,-36,110,18,'#FFE08A',0);ctx.globalAlpha=1}
  {const inner=op>.5,h=inner?(op-.5)*2*.75:1-op*1.8;ctx.save();ctx.translate(0,inner?-52:-30);ctx.scale(1,Math.max(h,.04));
   ctx.beginPath();ctx.moveTo(-156,0);ctx.lineTo(-156,-44);ctx.quadraticCurveTo(-150,-118,0,-120);ctx.quadraticCurveTo(150,-118,156,-44);ctx.lineTo(156,0);ctx.closePath();fillStroke(inner?'#7A4C30':'#C98A4B',8/Math.max(.3,h));
   for(const bx of[-110,110])card(bx-16,-110,32,110,'#FFC93C',6/Math.max(.3,h),6);ctx.restore()}
  if(op<.15){card(-30,-56,60,70,'#FFC93C',6,12);circ(0,-30,10,K,0);card(-4,-28,8,22,K,0,3)}
  ctx.restore()}

SCENES.cofre={music:'casita',
  enter(o){coinBanner=null;toast=null;this.t=TEMA[o.t];this.taps=0;this.op=0;this.openT=0;this.shakeT=-9;this.rewarded=false;this.gift=nextGift();this.busy=false;
    S.cofres=(S.cofres||0)+1;save();
    const n=lowName(this.t);later(400,()=>{SFX.tada();burst(800,300,70);say(('¡Terminaste todos los juegos de '+n).replace(/ de el /,' del ')+kid()+'! ¡Ganaste un cofre del tesoro! Tocalo tres veces para abrirlo.')})},
  reward(){if(this.rewarded)return;this.rewarded=true;const it=this.gift;if(it)grantGift(it);giveSticker(this.t.icon);giveCoins(it?10:20,800,560);
    // los carteles de figurita y monedas van a la derecha: en el centro tapaban el regalo y su nombre
    if(toast){toast.x=1290;toast.y=300}if(coinBanner){coinBanner.x=1300;coinBanner.y=540}},
  next(){const z=this.t.zone;go(ZONES[z]?z:'map',{from:this.t.id})},
  prompt(){if(!this.openT)say('Tocá el cofre para abrirlo. ¡Te '+(3-this.taps===1?'falta un toque':'faltan '+(3-this.taps)+' toques')+'!');else say('Tocá la casa para ver tu regalo, o la flecha verde para seguir el camino.')},
  hint(){if(!this.openT)return{x:800,y:560,r:200};if(T<this.openT+3)return null;return{x:1000,y:800,r:80}},
  dwell(id){if(id==='cf:casa')say('La casa de Tito.');if(id==='cf:seguir')say('Seguir el camino.')},
  draw(){sky('#FFE9C2','#FFD7E4');
    for(let i=0;i<10;i++){const x=(i*173+T*30)%1700-50,y=120+(i*97)%300;star(x,y,8+(i%3)*4,'#FFF6D6',0)}
    const sh=Math.max(0,1-(T-this.shakeT)*3)*Math.sin(T*50)*14;
    if(this.openT){const k=T-this.openT;this.op=clamp(k*2.2,0,1)}
    drawChest(800,560,1.15,this.op,sh);
    if(this.openT){const k=T-this.openT,e=clamp((k-.25)/.8,0,1),gy=lerp(520,300,e*e*(3-2*e)),gs=back(e)*260;
      if(e>0){if(this.gift)drawItemPic(this.gift,800,gy,gs);else pic('monedas',800,gy,gs)}
      if(k>1.1&&this.gift){ctx.font=`600 44px ${DF}`;const nm=cap(itemName(this.gift)),tw=ctx.measureText(nm).width;card(800-tw/2-40,96,tw+80,84,'#fff',6,42);text(nm,800,152,44,K,{w:600})}}
    else{for(let i=0;i<3;i++){const on=i<this.taps;circ(740+i*60,830,20,on?'#FFC93C':'#fff',5)}}
    if(this.openT&&T>this.openT+1.4){
      {const s=hv('cf:casa',hC(600,800,74));ctx.save();ctx.translate(600,800);ctx.scale(s,s);circ(0,0,72,'#fff',7);ctx.save();ctx.scale(.3,.3);drawTitoHouse(0,90,houseLevel());ctx.restore();ctx.restore()}
      {const p=(Math.sin(T*4)+1)/2,s=hv('cf:seguir',hC(1000,800,74));ctx.save();ctx.translate(1000,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  down(x,y){
    if(atHome(x,y)){SFX.tap();this.reward();this.next();return}
    if(inTito(x,y)){this.prompt();return}
    if(!this.openT){if(inR(x,y,800,520,380,360)){if(T-this.shakeT<.18)return;this.taps++;this.shakeT=T;SFX.pop();tone(500+this.taps*180,.12,'triangle',.15);sparkles(800,420,10);
        if(this.taps>=3){this.openT=T+.15;later(150,()=>{SFX.tada();burst(800,420,100);burst(400,300,30);burst(1200,300,30);this.reward()});
          const it=this.gift;later(1300,()=>say(it?'¡Mirá lo que había'+kid()+': '+itemName(it)+'! '+(it.slot?'¡Tito ya se lo puso!':'Ya está en la casa de Tito.')+' ¡Y diez monedas!':'¡Mirá cuántas monedas'+kid()+'! ¡Veinte monedas!',()=>later(300,()=>say(it?'Tocá la casa para verlo, o la flecha verde para seguir el camino.':'Tocá la flecha verde para seguir el camino.'))))}
        else say(this.taps===1?'¡Otra vez!':'¡Una vez más!');return}
      SFX.tap();sparkles(x,y,3);return}
    if(T<this.openT+1.4)return;
    if(dist(x,y,600,800)<78){SFX.pop();go('casaTito',{nuevo:this.gift&&this.gift.id});return}
    if(dist(x,y,1000,800)<78){SFX.pop();this.next();return}
    if(this.gift&&dist(x,y,800,300)<140){SFX.pop();sparkles(800,300,10);say(cap(itemName(this.gift))+'.');return}
    SFX.tap();sparkles(x,y,3)}
};
/* ---------- cumpleaños en la asamblea ---------- */
const isBday=(d=new Date())=>!!(S.bday&&S.bday.m===d.getMonth()&&S.bday.d===d.getDate());
{const A=SCENES.asamblea,enter0=A.enter,draw0=A.draw,down0=A.down,hint0=A.hint,prompt0=A.prompt,fin0=A.in_fin;
 A.enter=function(o){enter0.call(this,o);if(isBday()&&S.bdayDone!==today())this.steps.splice(1,0,'cumple')};
 A.in_cumple=function(){const n=clamp(S.age||AGE(),1,7);this.vs=Array.from({length:n},(_,j)=>({x:800-(n-1)*55+j*110,y:340,on:1}));this.vc=0;
   later(300,()=>{playTune(TUNES.cumple);say('¡Hoy es un día muy especial... ¡es tu cumpleaños! ¡Feliz cumpleaños'+kid()+'! Soplá las velitas: tocá cada una.')})};
 A.draw=function(){draw0.call(this);
   if(this.s==='cumple'){bunting(170,12);card(460,430,680,260,'#F58BB4',8,40);card(500,370,600,90,'#FFF6E6',7,30);for(let i=0;i<8;i++)circ(520+i*80,460,22,'#FF5A5A',4);card(400,670,800,40,'#E4D3B8',6,20);
     for(const v of this.vs){card(v.x-14,v.y-10,28,80,DIAC[(v.x/110|0)%7],5,8);if(v.on){const f=1+Math.sin(T*14+v.x)*.12;ctx.save();ctx.translate(v.x,v.y-30);ctx.scale(f,1/f);ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(22,0,0,14);ctx.quadraticCurveTo(-22,0,0,-34);fillStroke('#FFC93C',4);ctx.restore()}}
     if(this.sel){text('¡FELIZ CUMPLE!',800,790,64,'#F58BB4',{f:LF,st:8,sc:'#fff'})}}
   if(this.s==='mes'&&S.bday&&S.bday.m===this.d.getMonth()&&this.cal){const c=this.cal[S.bday.d-1];if(c){pic('tarta',c.x+30,c.y-30,62)}}};
 A.down=function(x,y){if(this.s==='cumple'&&!atHome(x,y)&&!inTito(x,y)){if(this.busy)return;const v=this.vs.find(v=>v.on&&Math.abs(x-v.x)<55&&y<v.y+80&&y>v.y-110);if(!v){SFX.tap();return}
     v.on=0;this.vc++;SFX.whoosh();SFX.count(this.vc);say(cap(NUM[this.vc]||String(this.vc)));
     if(this.vs.every(v=>!v.on)){this.busy=true;this.sel=true;S.bdayDone=today();save();later(700,()=>{SFX.tada();burst(800,400,90);burst(400,300,40);burst(1200,300,40);playTune(TUNES.cumple);giveSticker('tarta');
       say('¡Que los cumplas feliz! Tito te regala diez monedas.',()=>{giveCoins(10,800,400,'cofre');later(1200,()=>this.next())})})}return}
   return down0.call(this,x,y)};
 A.hint=function(){if(this.s==='cumple'){const v=this.vs&&this.vs.find(v=>v.on);return v&&!this.busy?{x:v.x,y:v.y-30,r:60}:null}return hint0.call(this)};
 A.prompt=function(){if(this.s==='cumple'){say('Tocá las velitas para soplarlas.');return}prompt0.call(this)};
 A.in_fin=function(){const first=!(S.asam[today()]&&S.asam[today()].done);fin0.call(this);if(first)later(400,()=>giveCoins(5,800,420))};
}
