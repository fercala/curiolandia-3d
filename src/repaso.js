// ARCHIVO: repaso.js — el repaso diario con Tito (botón de la lupa en el mapa).
// Para qué sirve: apunta qué habilidades practica cada juego y cómo le va al niño en cada juego,
// y con eso prepara cada día una lista de 3 juegos para repasar (escena SCENES.repaso).
// Define (globales usadas en otros archivos): REP_ON, NOREP, repOk, repWeak, repOld, repBuild, repToday,
//   repAllDone, repDue, REPBTN y la escena SCENES.repaso. Añade a S los campos kg, gs y rep.
// Envuelve (cambia el comportamiento de) funciones de otros archivos: rec (core.js), finishGame (scenes.js),
//   SCENES.casita.enter y goSeguir (zonas.js) y los métodos draw/down/dwell de SCENES.map (zonas.js).
// Depende de: core.js (S, DEF, save, say, rec, today, later, SFX, dibujo), scenes.js (TEMA, TEMAS, tst,
//   finishGame, drawStation, GNAME), zonas.js (goSeguir, asamHoy, drawRoad, lockOver, unlockFx),
//   tienda.js (STARS, giveCoins, drawCoinHUD, inCoinHUD).
// Formato del estado guardado:
//   S.kg = { habilidad: ['temaId#juego', ...] }  últimos 6 juegos (el más reciente primero) donde salió esa habilidad.
//   S.gs = { 'temaId#juego': {ok, err, d} }      aciertos, fallos y último día jugado ('AAAA-MM-DD' de today()).
//   S.rep = {d, list, done, weak, paid, seen}    el repaso del día d: list = 3 ids 'temaId#juego',
//           done = {id:1} los ya hechos, weak = cuántos salieron por "cuesta", paid = premio ya dado,
//           seen = el botón verde ya pasó hoy por el repaso.
/* ================= REPASO INTELIGENTE ================= */
// Cada habilidad recuerda en qué juegos aparece (S.kg) y cada juego cómo le fue (S.gs).
// Todos los días Tito arma un repaso de 3 juegos: primero lo que cuesta, después lo que hace más tiempo que no se juega.
// Valores por defecto de los campos nuevos y arreglo de partidas antiguas que no los tienen.
Object.assign(DEF,{kg:{},gs:{},rep:null});
for(const k of['kg','gs'])if(!S[k]||typeof S[k]!=='object')S[k]={};
// Envuelve rec(habilidad, acierto) de core.js: además de las estadísticas normales, si estamos en un juego
// apunta en S.kg que esa habilidad sale en este juego (sin repetir, máximo 6) y suma el acierto/fallo en S.gs.
{const r0=rec;rec=function(k,ok){r0(k,ok);if(sceneName==='juego'&&scene.t&&scene.gi!=null){const id=scene.t.id+'#'+scene.gi,m=S.kg[k]||(S.kg[k]=[]);
  if(m[0]!==id){const i=m.indexOf(id);if(i>=0)m.splice(i,1);m.unshift(id);if(m.length>6)m.pop()}
  const g=S.gs[id]||(S.gs[id]={ok:0,err:0,d:''});ok?g.ok++:g.err++;save()}}}
// true mientras se juega un juego lanzado desde el repaso (para volver al repaso al terminar).
let REP_ON=false;
// Envuelve finishGame(tema, nº de juego): guarda la fecha en que se jugó (S.gs[id].d) y,
// si el juego venía del repaso de hoy, lo marca como hecho. Después llama al finishGame original.
{const f0=finishGame;finishGame=function(t,gi){const id=t.id+'#'+gi,g=S.gs[id]||(S.gs[id]={ok:0,err:0,d:''});g.d=today();if(REP_ON&&S.rep&&S.rep.list.includes(id))S.rep.done[id]=1;save();f0(t,gi)}}
// Tipos de juego que no sirven para repasar (no tienen acierto/fallo o son solo de mirar/escuchar).
const NOREP=['conocer','enConocer','cuento','cancion','trazo','decora','mifamilia','velas'];
// repOk(id): ¿se puede usar el juego id ('temaId#juego') en el repaso? Tiene que existir,
// no ser de un tipo de NOREP y estar ya jugado al menos una vez.
const repOk=id=>{const [tid,j]=id.split('#'),t=TEMA[tid],g=t&&t.games[+j];return !!(g&&!NOREP.includes(g.t)&&tst(tid).g[j])};
// Lista de juegos "que cuestan": primero, por cada habilidad con 4+ intentos y menos de 70% de aciertos
// (de peor a mejor), el juego más reciente donde salió; después, juegos con 3+ intentos y menos de 70%.
// Devuelve un array de ids 'temaId#juego' sin repetir.
function repWeak(){const out=[];
  const sk=Object.keys(S.stats).map(k=>{const s=S.stats[k],n=s.ok+s.err;return{k,n,r:n?s.ok/n:1}}).filter(o=>o.n>=4&&o.r<.7).sort((a,b)=>a.r-b.r);
  for(const o of sk)for(const id of(S.kg[o.k]||[]))if(repOk(id)&&!out.includes(id)){out.push(id);break}
  Object.keys(S.gs).map(id=>{const g=S.gs[id],n=g.ok+g.err;return{id,n,r:n?g.ok/n:1}}).filter(o=>o.n>=3&&o.r<.7&&repOk(o.id)).sort((a,b)=>a.r-b.r).forEach(o=>{if(!out.includes(o.id))out.push(o.id)});
  return out}
// Todos los juegos repasables ordenados del que hace más tiempo que no se juega al más reciente.
function repOld(){const L=[];for(const t of TEMAS){const g=tst(t.id).g;for(const j in g){const id=t.id+'#'+j;if(repOk(id))L.push({id,d:(S.gs[id]&&S.gs[id].d)||''})}}
  return L.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0).map(o=>o.id)}
// Prepara el repaso de hoy (3 juegos como máximo) y lo guarda en S.rep:
// hasta 3 juegos que cuestan; si faltan, los más antiguos de temas distintos; si aún faltan, cualquier antiguo.
function repBuild(){const w=repWeak().slice(0,3),L=[...w],old=repOld(),tm=id=>id.split('#')[0];
  for(const id of old)if(L.length<3&&!L.includes(id)&&!L.some(x=>tm(x)===tm(id)))L.push(id);
  for(const id of old)if(L.length<3&&!L.includes(id))L.push(id);
  S.rep={d:today(),list:L,done:{},weak:w.length,paid:0,seen:0};save()}
// Devuelve el repaso de hoy (S.rep). Lo vuelve a preparar si es de otro día, si no tenía juegos
// "que cuestan" pero ahora los hay (y aún no se ha hecho ninguno), o si estaba vacío y ya hay juegos.
function repToday(){const R=S.rep;if(!R||R.d!==today()||(!R.weak&&!Object.keys(R.done).length&&repWeak().length)||(!R.list.length&&repOld().length))repBuild();return S.rep}
// ¿Están hechos todos los juegos del repaso de hoy?
const repAllDone=()=>!!(S.rep&&S.rep.d===today()&&S.rep.list.length&&S.rep.list.every(id=>S.rep.done[id]));
// ¿Toca repasar? Con 6+ estrellas, si hoy no se ha terminado y hay algo que cuesta (sale el "!" rojo).
const repDue=()=>STARS()>=6&&!repAllDone()&&repWeak().length>0;

// Escena del repaso: hasta 3 estaciones numeradas en un caminito; se abren en orden.
// Al terminar todas, premio (pegatina de la lupa y 5 monedas) y flecha verde para seguir el camino.
SCENES.repaso={music:'casita',
  // Al entrar. o.seguir: viene del botón verde (se apunta seen); o.back: vuelve de un juego del repaso
  // (anima la apertura del siguiente). Si está todo hecho y sin cobrar, da el premio.
  enter(o){const R=repToday();this.L=R.list;this.unl=null;REP_ON=false;if(o.seguir){R.seen=1;save()}
    if(repAllDone()&&!R.paid){R.paid=1;save();later(500,()=>{SFX.tada();burst(800,350,90);giveSticker('lupa');say('¡Terminaste el repaso de hoy'+kid()+'! Tito te regala cinco monedas.',()=>{giveCoins(5,800,420);later(900,()=>sayQ('Tocá la flecha verde para seguir el camino.'))})});return}
    const nx=this.next();
    if(o.back&&nx>=0&&nx!==this.prevNx){this.unl={j:nx,t:T+.8};later(800,()=>{SFX.sparkle();const [x,y]=this.pos(nx);burst(x,y,30)});later(300,()=>sayQ('¡Muy bien! Ahora el número '+(nx+1)+'.'));return}
    later(300,()=>this.prompt(!o.back))},
  // Posición en pantalla [x,y] de la estación j (centradas en fila).
  pos(j){const n=this.L.length;return[860-(n-1)*180+j*360,500]},
  // La estación j está abierta si es la primera, si la anterior está hecha o si ella misma ya está hecha.
  open(j){return S.unlockAll||j===0||!!S.rep.done[this.L[j-1]]||!!S.rep.done[this.L[j]]},
  // Índice de la siguiente estación por hacer (abierta y sin hacer), o -1 si no queda ninguna.
  next(){return this.L.findIndex((id,j)=>!S.rep.done[id]&&this.open(j))},
  // Tito explica qué hacer; con long=true añade la explicación de por qué se repasa.
  prompt(long){const R=S.rep;if(!this.L.length){say('Todavía no hay nada para repasar. ¡Primero jugá algunos juegos del camino!');return}
    const nx=this.next();if(nx<0){say('¡Ya hiciste el repaso de hoy! Mañana Tito prepara otro. Tocá la flecha verde para seguir el camino.');return}
    say((long?(R.weak?'¡Hora de repasar! Tito eligió juegos que todavía cuestan un poquito. ¡Practicando salen cada vez mejor! ':'¡Hora de repasar! Tito eligió juegos que jugaste hace tiempo. '):'')+(nx===0?'Empezá por el primero.':'Tocá el número '+(nx+1)+'.'))},
  // Pista (círculo que parpadea): la siguiente estación o, si se ha terminado, la flecha verde.
  hint(){const nx=this.next();if(nx<0)return this.L.length?{x:1300,y:800,r:80}:null;const [x,y]=this.pos(nx);return{x,y,r:140}},
  // Al dejar el dedo encima de la estación "r:j": dice el nombre del juego y del tema.
  dwell(id){const j=+id.slice(2),e=this.L[j];if(!e)return;const [tid,g]=e.split('#'),t=TEMA[tid],gm=t.games[+g];say(V(gm.name||GNAME[gm.t]||t.n)+'. '+V(t.n)+'.')},
  // Dibuja el repaso: título, camino, estaciones con número, candado o check, y la flecha verde al final.
  draw(){sky('#EAF4FF','#FFF6E6');floor(760,'#E6DCC8');
    card(170,34,600,112,'#fff',6,56);pic('lupa',250,90,90);text('Repaso con Tito',490,112,52,K,{w:600});
    const pts=this.L.map((id,j)=>this.pos(j)),nx=this.next();if(pts.length>1)drawRoad(pts,nx<0?pts.length-1:nx,150);
    this.L.forEach((id,j)=>{const [tid,g]=id.split('#'),t=TEMA[tid],[x,y]=pts[j],lk=!this.open(j),dn=!!S.rep.done[id];
      drawStation(t,+g,x,y,{s:lk?1:hv('r:'+j,hC(x,y,130))});
      const nm=V(t.n);ctx.font=`600 28px ${DF}`;const fs=Math.min(28,28*230/Math.max(1,ctx.measureText(nm).width)),tw=Math.min(230,ctx.measureText(nm).width);
      card(x-tw/2-48,y+156,tw+96,58,'#fff',5,29);pic(t.icon,x-tw/2-14,y+185,42);text(nm,x+20,y+185+fs*.36,fs,K,{w:600});
      const un=this.unl&&this.unl.j===j&&unlockFx(x,y,124,this.unl.t);if(!un&&lk)lockOver(x,y,124);
      circ(x-96,y-96,30,lk?'#EADFCF':dn?'#7CC86E':'#5B8DEF',5);text(String(j+1),x-96,y-84,34,'#fff',{f:LF});
      if(dn){circ(x+96,y+96,30,'#7CC86E',5);ctx.beginPath();ctx.moveTo(x+82,y+96);ctx.lineTo(x+93,y+108);ctx.lineTo(x+111,y+84);ctx.lineWidth=7;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.stroke()}
      if(j===nx&&!(this.unl&&this.unl.j===j&&T<this.unl.t+.4))arrowAt(x,y-170)});
    if(nx<0&&this.L.length){const p=(Math.sin(T*4)+1)/2,s=hv('rp:seguir',hC(1300,800,74));ctx.save();ctx.translate(1300,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  // Toques: casa (mapa), Tito (explica), monedas (tienda), flecha verde (seguir el camino)
  // o una estación (si está abierta lanza el juego con REP_ON=true).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}if(inTito(x,y)){this.prompt(true);return}if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
    const nx=this.next();if(nx<0&&this.L.length&&dist(x,y,1300,800)<80){SFX.pop();goSeguir();return}
    for(let j=0;j<this.L.length;j++){const [gx,gy]=this.pos(j);if(dist(x,y,gx,gy)<140){
      if(!this.open(j)){SFX.boing();say('Este todavía está cerrado. Primero terminá el número '+((nx<0?j-1:nx)+1)+'.');return}
      const [tid,g]=this.L[j].split('#');SFX.pop();this.prevNx=nx;REP_ON=true;go('juego',{t:tid,g:+g});return}}
    SFX.tap();sparkles(x,y)}
};
// al volver de un juego del repaso (o al tocar la casita desde el juego) se vuelve al repaso
{const e0=SCENES.casita.enter;SCENES.casita.enter=function(o){if(REP_ON&&!o.fin){REP_ON=false;go('repaso',{back:1});return}REP_ON=false;return e0.call(this,o)}}
// el botón verde pasa una vez por día por el repaso, si hay algo que cuesta
{const g0=goSeguir;goSeguir=function(){if(asamHoy()&&repDue()&&!(S.rep&&S.rep.d===today()&&S.rep.seen)){go('repaso',{seguir:1});return}g0()}}
// botón del repaso en el mapa, arriba
const REPBTN={x:1215,y:66};
// Envuelve draw/down/dwell del mapa para dibujar el botón del repaso, abrirlo al tocarlo y decir su nombre.
{const M=SCENES.map,d0=M.draw,dn0=M.down,dw0=M.dwell;
  // Dibuja el mapa original y encima el botón de la lupa: "!" rojo si toca repasar, punto verde si ya se hizo hoy.
  M.draw=function(){d0.call(this);const s=hv('repaso',hC(REPBTN.x,REPBTN.y,50)),due=repDue();ctx.save();ctx.translate(REPBTN.x,REPBTN.y);ctx.scale(s,s);circ(0,0,46,'#fff',6);pic('lupa',0,0,64);
    if(due){const p=1+.12*Math.sin(T*5);circ(32,-32,16*p,'#FF6B5E',4);text('!',32,-22,22,'#fff',{f:LF})}else if(repAllDone()){circ(32,-32,16,'#7CC86E',4)}ctx.restore()};
  // Si se toca la lupa abre el repaso; si no, el comportamiento normal del mapa.
  M.down=function(x,y){if(dist(x,y,REPBTN.x,REPBTN.y)<52){SFX.pop();go('repaso',{hello:true});return}return dn0.call(this,x,y)};
  // Dedo encima de la lupa: dice "El repaso con Tito."; si no, lo normal.
  M.dwell=function(id){if(id==='repaso'){say('El repaso con Tito.');return}return dw0&&dw0.call(this,id)}}
