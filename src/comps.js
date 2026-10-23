/* ================= COMPONENTES DE JUEGO ================= */
// ============================================================================
// ARCHIVO comps.js — Componentes de juego (parte 1)
// ============================================================================
// Aquí están los "motores" de cada TIPO de juego (elegir, buscar, arrastrar,
// contar, memoria, puzle...). Un tema (temas.js, temas4.js, temas5.js, extras.js)
// no programa sus juegos: elige un componente de este archivo o de comps2.js y le
// pasa una configuración (cfg) con los dibujos, las frases y el fondo.
//
// ---------- INTERFAZ COMÚN DE UN COMPONENTE DE JUEGO ----------
// CREACIÓN: cada componente es una función  Nombre(cfg, onDone)  que DEVUELVE un
//   objeto "juego" (no se usa `new`). La llama makeGame() (temas.js, ampliada en
//   extras.js e ingles.js) desde la escena SCENES.juego (scenes.js):
//       this.g = makeGame(tema.games[j], tema, onDone)
//   - cfg: objeto de configuración propio de cada tipo (ver cabecera de cada uno).
//     Casi todos aceptan cfg.bg (función que pinta el fondo, p. ej. t.bg = BG.aula),
//     cfg.key (nombre de la estadística para rec()) y cfg.rounds (número de rondas).
//   - onDone: función que el componente llama UNA vez cuando el niño termina todo
//     el juego. La escena llama entonces a finishGame() (scenes.js).
// CAMPOS del objeto juego que lee la escena:
//   - total: número de estrellas/pasos del juego (las estrellitas grises de arriba
//     a la derecha, drawRounds en core.js). Si es 0 o falta, no se dibujan.
//   - done: cuántos pasos lleva bien. El componente hace this.done++ en cada
//     acierto y pone scene.starPop=T para que la estrella nueva haga "pop".
// MÉTODOS (todos opcionales salvo draw; la escena comprueba si existen):
//   - enter(): arranca el juego (primera ronda, frase de bienvenida...).
//   - update(dt): se llama cada cuadro con los segundos pasados (animaciones,
//     cosas que se mueven solas, objetos que vuelven a su sitio con lerp).
//   - draw(): pinta TODO el juego en el lienzo 2D de 1600x900 (fondo incluido).
//   - down(x,y) / move(x,y) / up(x,y): el dedo o el ratón toca, se mueve y se
//     levanta, en coordenadas lógicas 1600x900. Para arrastrar se usa la global
//     `drag` (core.js): drag={it, dx, dy}; mientras drag no es null, la ayuda no
//     se dibuja.
//   - prompt(): repite la consigna en voz alta (al tocar a Tito, o cuando salta la
//     ayuda por inactividad).
//   - hint(): devuelve dónde está la respuesta para la AYUDA automática (drawHelp
//     en core.js), o null si no hay que ayudar. Formato: {x, y, r} = círculo que
//     brilla (a los 6 s sin tocar nada); opcional dx, dy = hacia dónde se desliza
//     la manita (arrastres); opcional path = lista de puntos [[x,y],...] que la
//     manita recorre (trazos, girar). A los 11 s sale la manita y se llama prompt().
// CÓMO INFORMA DEL ACIERTO / ERROR:
//   - rec(clave, ok) (core.js): suma un acierto o error en S.stats[clave]
//     (estadísticas de la zona de adultos). Se suele llamar solo en el primer
//     intento de cada pregunta.
//   - onRight(primeraVez) (core.js): acierto. Si fue a la primera, sube la racha
//     y la dificultad adaptativa (ADAPT). tienda.js la envuelve para dar 1 MONEDA
//     por cada acierto a la primera, como mucho 5 monedas por partida.
//   - onWrongTwice() (core.js): dos fallos seguidos; baja la dificultad (ADAPT).
//     Algunos componentes también ponen idle=12 para que salga la ayuda ya.
//   - Sonidos y efectos: SFX.good()/SFX.bad(), burst(), sparkles() (core.js).
// FINAL Y ESTRELLAS / MONEDAS:
//   - Al acabar, el componente llama onDone() (normalmente tras la frase final y
//     un later()). La escena llama a finishGame(t, gi): apunta el juego en
//     S.temas[t.id].g[gi] (eso es la ESTRELLA del juego en el camino del tema),
//     marca el tema como terminado si ya están todos y da una figurita la primera
//     vez. tienda.js añade 3 monedas (primera vez) o 2 (repetición).
//   - REP (core.js) = veces que ya se jugó este juego (0..2): algunos
//     componentes ponen más opciones o más rondas en la repetición.
// DIFICULTAD POR EDAD: AGE() (3, 4 o 5), nOpts() (cuántas opciones mostrar,
//   2..4) y nRounds() (cuántas rondas, 4..6) vienen de core.js.
// TIEMPOS: later(ms, fn) (core.js) programa algo para dentro de ms milisegundos;
//   si se cambia de escena antes, ya no se ejecuta.
// VOZ: say(texto, alAcabar) habla y luego llama a alAcabar. V(x) elige la variante
//   de idioma si x es una lista ['rioplatense','España'] (lex.js). NO cambies el
//   texto de ninguna frase: cada frase tiene su MP3 grabado.
//
// ---------- QUÉ HAY EN ESTE ARCHIVO ----------
// Ayudas de texto (thing, nameT, esta, eseEs, plural, unN...), el niño dibujado
// (drawKid, kidPartAt), y los componentes: ChoiceGame (base de "elige el dibujo
// correcto"), Busca, Sonido, Conocer, Cuerpo, Arrastra (arrastrar y soltar),
// Atrapa, Memoria, Cuenta, Puzzle, Excava, Riega y Pinta. comps2.js añade más.
// GLOBALES QUE USAN OTROS ARCHIVOS: thing, nameT, isPl, esta, eseEs, NUM, plural,
// plW, fem, unN, KID_PARTS, KID_C, KID_FINE, drawKid, kidPartAt, layoutChoice,
// drawChoice, hitItem, drawBasket, dotsCard, COLORES, paintPot, colorAdj y todos
// los componentes.
// DEPENDE DE: core.js (ctx, T, W, H, say, later, SFX, rec, onRight,
// onWrongTwice, AGE, nOpts, nRounds, REP, idle, drag, scene, MX/MY, mouseOn,
// burst, sparkles, parts, card, circ, ell, star, text, rr, fillStroke, hv, hR,
// hC, back, lerp, clamp, dist, rnd, ri, pick, shuffle, cap, praise, SOUNDS,
// playSound, ONO, IMG...), lex.js (W_, Wn, V, tx) y los pics-*.js (pic, picG).
// ============================================================================
// una "cosa" es una clave de dibujo o un objeto {name, draw(x,y,s)}
// Dibuja una "cosa" k centrada en (x,y) con tamaño s.
// k puede ser una clave de dibujo (texto, se pinta con pic()) o un objeto con
// su propio método draw(x,y,s). comps2.js la amplía para las caritas 'emo:...'.
function thing(k,x,y,s){if(typeof k==='string')pic(k,x,y,s);else k.draw(x,y,s)}
// Nombre con artículo de una cosa k, para decirlo en voz alta ('el perro').
// Si k es una clave usa W_() (lex.js); si es un objeto usa su campo name.
const nameT=k=>typeof k==='string'?W_(k):V(k.name);
// true si el nombre de la cosa k va en plural ('los ojos', 'las uvas').
const isPl=k=>/^(los|las) /.test(nameT(k));
// Pregunta "¿Dónde está el perro?" / "¿Dónde están los ojos?" para la cosa k.
const esta=k=>(isPl(k)?'¿Dónde están ':'¿Dónde está ')+nameT(k)+'?';
// Frase "Ese es el perro" / "Esa es la mesa" / "Esos son..." según el artículo
// de la cosa k. Se usa al tocar una opción equivocada.
const eseEs=k=>{const n=nameT(k),a=(n.match(/^(el|la|los|las) /)||[])[1];return ({el:'Ese es ',la:'Esa es ',los:'Esos son ',las:'Esas son '}[a]||'Es ')+n};
// Números del 0 al 10 escritos en palabras (para decirlos con say()).
const NUM=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'];
// Plural de la palabra de la clave k sin artículo ('perros', 'lápices').
// Usa una lista de excepciones (PLX) y, si la palabra tiene complemento
// ('caja de lápices'), solo pone en plural la primera parte.
function plural(k){const PLX={lapiz:'lápices',pez:'peces',avion:'aviones',leon:'leones',corazon:'corazones',tobogan:'toboganes',uva:'uvas',gafas:'anteojos'};
  if(PLX[k])return tx(PLX[k]); const w=Wn(k),i=w.search(/ (de|del|para|con) /);
  if(i>0)return plW(w.slice(0,i))+w.slice(i); return plW(w)}
// Regla sencilla del plural en castellano para una palabra w: vocal → +s,
// z → ces, y si no, quita la tilde final y añade 'es' ('camión' → 'camiones').
function plW(w){if(/[aeiouáéó]$/i.test(w))return w+'s'; if(/z$/.test(w))return w.slice(0,-1)+'ces';
  return w.replace(/ón$/,'on').replace(/ín$/,'in').replace(/án$/,'an')+'es'}
// true si la cosa k es femenina (su nombre empieza por 'la' o 'las').
const fem=k=>/^(la|las) /.test(nameT(k));
// Cantidad en palabras: unN(1,k) → 'un perro' / 'una mesa'; unN(3,k) → 'tres perros'.
const unN=(n,k)=>n===1?(fem(k)?'una ':'un ')+Wn(k):NUM[n]+' '+plural(k);

/* ---------- el nene dibujado (para el cuerpo y para vestir) ---------- */
// Partes del cuerpo del niño dibujado. Formato: {id, n}; id = nombre interno
// (lo usan kidPartAt y KID_C), n = nombre con artículo para decirlo
// (texto o lista ['rioplatense','España'] que resuelve V()).
const KID_PARTS=[
  {id:'ojos',n:'los ojos'},{id:'nariz',n:'la nariz'},{id:'boca',n:'la boca'},{id:'orejas',n:'las orejas'},{id:'pelo',n:'el pelo'},{id:'cabeza',n:'la cabeza'},
  {id:'manos',n:'las manos'},{id:'brazos',n:'los brazos'},{id:'barriga',n:['la panza','la barriga']},{id:'piernas',n:'las piernas'},{id:'pies',n:'los pies'}];
// Distancia del punto (px,py) al segmento que va de (ax,ay) a (bx,by).
// Proyecta el punto sobre el segmento (t entre 0 y 1) y mide hasta ahí.
function segD(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy),0,1);return dist(px,py,ax+dx*t,ay+dy*t)}
// Dice qué parte del cuerpo hay en el punto tocado (px,py) cuando el niño está
// dibujado en (x,y) con escala s (como drawKid). Devuelve un id de KID_PARTS
// o null. Pasa el punto a las coordenadas del dibujo (u,v) y usa |u| porque el
// niño es simétrico. El orden importa: primero las partes pequeñas de la cara.
function kidPartAt(px,py,x,y,s){
  const u=(px-x)/s,v=(py-y)/s,ax=Math.abs(u);
  if(dist(ax,v,32,-495)<30)return 'ojos'; if(dist(u,v,0,-466)<22)return 'nariz'; if(dist(u,v,0,-436)<28)return 'boca';
  if(dist(ax,v,98,-485)<34)return 'orejas';
  if(dist(u,v,0,-490)<100)return v<-548?'pelo':'cabeza';
  if(dist(ax,v,158,-200)<46)return 'manos'; if(segD(ax,v,70,-370,152,-220)<38)return 'brazos';
  if(ax<86&&v>-400&&v<-232)return 'barriga'; if(ax<84&&v>=-232&&v<-34)return 'piernas';
  if(dist(ax,v,54,-16)<60)return 'pies'; return null;
}
// Centro de cada parte del cuerpo en coordenadas del dibujo del niño (escala 1,
// origen entre los pies). Se usa para colocar la ayuda (hint) sobre la parte.
const KID_C={ojos:[32,-495],nariz:[0,-466],boca:[0,-436],orejas:[98,-485],pelo:[0,-570],cabeza:[60,-520],manos:[158,-200],brazos:[110,-300],barriga:[0,-310],piernas:[44,-130],pies:[54,-16]};
// Dibuja el niño de pie con los pies en (x,y) y escala s (mide unos 600*s de alto).
// o: {skin, hair, shirt, pants} colores; wear: objeto con la ropa puesta
// ({gorro:1, botas:1, abrigo:1...}, juego de vestirse); hl: id de la parte que
// brilla en amarillo; sad: boca triste. Solo dibuja, no cambia el estado.
function drawKid(x,y,s,o={}){
  const sk=o.skin||'#F2C29B',hr=o.hair||'#8A5A3C',sh=o.shirt||'#FFFFFF',pn=o.pants||'#5B8DEF',wr=o.wear||{},hl=o.hl;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);const L=7;
  // glow(id,f): ejecuta la función de dibujo f; si id es la parte resaltada (hl),
  // antes la pinta con un halo amarillo (sombra) por debajo.
  const glow=(id,f)=>{if(hl===id){ctx.save();ctx.shadowColor='#FFC93C';ctx.shadowBlur=40;f();ctx.restore()}f()};
  // piernas y pies
  glow('piernas',()=>{card(-64,-175,42,160,sk,L,18);card(22,-175,42,160,sk,L,18)});
  if(wr.botasAgua||wr.botas){const c=wr.botasAgua?'#FFC93C':'#8A5A3C';for(const sx of[-1,1]){card(sx*43-26,-130,52,120,c,L,14);ell(sx*54,-14,46,22,c,L)}}
  else glow('pies',()=>{ell(-54,-14,44,20,sk,L);ell(54,-14,44,20,sk,L)});
  card(-84,-240,168,96,pn,L,26);ctx.beginPath();ctx.moveTo(0,-200);ctx.lineTo(0,-150);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.stroke();
  // brazos
  glow('brazos',()=>{for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*70,-370);ctx.lineTo(sx*150,-215);ctx.lineCap='round';ctx.lineWidth=52;ctx.strokeStyle=K;ctx.stroke();ctx.lineWidth=40;ctx.strokeStyle=sk;ctx.stroke()}});
  for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*70,-372);ctx.lineTo(sx*96,-322);ctx.lineCap='round';ctx.lineWidth=58;ctx.strokeStyle=K;ctx.stroke();ctx.lineWidth=46;ctx.strokeStyle=sh;ctx.stroke()}
  glow('barriga',()=>card(-84,-400,168,176,sh,L,46));
  if(wr.remera){card(-84,-400,168,176,'#FFC93C',L,46);circ(0,-300,26,'#FF8A7A',0)}
  if(wr.abrigo){for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*70,-370);ctx.lineTo(sx*150,-222);ctx.lineCap='round';ctx.lineWidth=62;ctx.strokeStyle=K;ctx.stroke();ctx.lineWidth=50;ctx.strokeStyle='#FF6B5E';ctx.stroke()}
    card(-90,-404,180,200,'#FF6B5E',L,40);ctx.beginPath();ctx.moveTo(0,-396);ctx.lineTo(0,-206);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.stroke();for(const by of[-360,-310,-260])circ(-14,by,7,K,0)}
  glow('manos',()=>{if(wr.guantes){for(const sx of[-1,1]){circ(sx*158,-200,34,'#7CC86E',L);circ(sx*130,-220,14,'#7CC86E',5)}}else{circ(-158,-200,28,sk,L);circ(158,-200,28,sk,L)}});
  // cuello y cabeza
  card(-22,-425,44,40,sk,L,10);
  glow('orejas',()=>{circ(-96,-485,24,sk,L);circ(96,-485,24,sk,L)});
  glow('cabeza',()=>circ(0,-490,94,sk,L));
  glow('pelo',()=>{ctx.beginPath();ctx.arc(0,-490,96,PI*1.06,PI*1.94);ctx.quadraticCurveTo(60,-560,20,-552);ctx.quadraticCurveTo(-10,-528,-40,-552);ctx.quadraticCurveTo(-80,-548,-91,-520);ctx.closePath();fillStroke(hr,L)});
  if(wr.bufanda){card(-70,-420,140,40,'#FF8A7A',L,18);card(20,-400,36,90,'#FF8A7A',L,12)}
  // cara
  // parpadeo: los ojos se cierran un momento cada 3,6 segundos
  const bl=((T+.9)%3.6)<.13;
  glow('ojos',()=>{for(const sx of[-1,1]){if(bl){ctx.beginPath();ctx.moveTo(sx*32-12,-494);ctx.lineTo(sx*32+12,-494);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke()}else{circ(sx*32,-495,12,K,0);circ(sx*32+4,-499,4,'#fff',0)}}});
  glow('nariz',()=>{ctx.beginPath();ctx.arc(0,-466,13,.15*PI,.85*PI);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke()});
  glow('boca',()=>{ctx.beginPath();ctx.moveTo(-26,-444);ctx.quadraticCurveTo(0,o.sad?-452:-420,26,-444);ctx.closePath();fillStroke('#C0473C',5)});
  circ(-56,-458,13,'rgba(255,138,122,.45)',0);circ(56,-458,13,'rgba(255,138,122,.45)',0);
  if(wr.gafas)pic('gafas',0,-494,190);
  if(wr.gorro)pic('gorro',0,-566,220);
  if(wr.gorra)pic('gorra',14,-560,215);
  if(wr.paraguas)pic('paraguas',210,-330,300);
  if(wr.crema){ctx.globalAlpha=.8;for(const [a,b] of[[-150,-280],[150,-280],[-40,-460],[40,-460],[-44,-90],[44,-90]])star(a,b,12,'#FFFFFF',0);ctx.globalAlpha=1}
  ctx.restore();
}

/* ---------- elegir dibujo ---------- */
// Coloca en fila, centradas en x, las tarjetas de opciones de un juego de elegir.
// ws: lista de cosas; ok: lista de las correctas; y: altura de la fila;
// big: tarjetas más grandes. Devuelve los items {w, ok, x, y, s, shake, gone,
// win, in} que usan drawChoice y hitItem (shake/gone/win guardan el instante T
// del temblor, la desaparición y el acierto; in = cuándo aparece).
function layoutChoice(ws,ok,y,big){
  const n=ws.length,s=big?(n<=2?320:n===3?290:250):(n<=2?280:n===3?250:220),gap=44,tot=n*s+(n-1)*gap,x0=Math.max(300+s/2,900-tot/2+s/2);
  return ws.map((w,i)=>({w,ok:ok.includes(w),x:x0+i*(s+gap),y,s,shake:-9,gone:0,win:0,in:T+i*.12}));
}
// Dibuja las tarjetas de layoutChoice con sus animaciones: aparecer con rebote,
// temblar al fallar, desvanecerse (gone) y latir con borde dorado al acertar.
function drawChoice(items){
  for(const it of items){
    let a=1; if(it.gone){a=Math.max(0,1-(T-it.gone)*2);if(a<=0)continue}
    const ap=clamp((T-it.in)*3,0,1),hs=(it.win||it.gone)?1:hv(it,hR(it.x,it.y,it.s,it.s)),sc=(ap<1?back(ap):1+(it.win?Math.sin((T-it.win)*10)*.04:0))*hs,sx=it.shake>0?Math.sin((T-it.shake)*40)*14*Math.max(0,1-(T-it.shake)*2.5):0;
    ctx.save();ctx.globalAlpha=a;ctx.translate(it.x+sx,it.y);ctx.scale(sc,sc);
    card(-it.s/2,-it.s/2,it.s,it.s,it.bg||'#fff',it.win?12:7,40,it.win?'#FFC93C':K);thing(it.w,0,0,it.s*.78);
    ctx.restore();
  }
}
// Devuelve la tarjeta (de layoutChoice) que hay en el punto (x,y), o undefined.
const hitItem=(items,x,y)=>items.find(it=>!it.gone&&Math.abs(x-it.x)<it.s/2+10&&Math.abs(y-it.y)<it.s/2+10);
// COMPONENTE BASE "elige el dibujo correcto": en cada ronda salen varias
// tarjetas y hay que tocar la buena. Lo usan Busca, Sonido, Series y muchos temas.
// cfg: rounds (nº de rondas), bg() fondo, key(r) clave para rec(), y (altura de
// la fila, 600), big (tarjetas grandes), gen(i) → ronda i, ref(r,juego) dibujo
// extra encima (opcional), refTap(juego,x,y) toque sobre ese dibujo (devuelve
// true si lo gestiona). gen(i) devuelve {words: opciones, ok: correctas, ask:
// pregunta, snd: sonido opcional, okSay(w) y badSay(w): frases de acierto/fallo}.
// Al 2º fallo de una ronda quita una opción incorrecta para ayudar.
function ChoiceGame(cfg,onDone){
  return {total:cfg.rounds,done:0,i:0,
    // Empieza la primera ronda.
    enter(){this.round()},
    // Prepara la ronda this.i: pide los datos a cfg.gen, coloca las tarjetas
    // barajadas y dice la pregunta. lock=true: mientras Tito pregunta, tocar una
    // opción incorrecta solo dice su nombre (no cuenta como fallo); se desbloquea
    // al acabar la frase o, por si la voz falla, a los 2,6 s. La pregunta espera a que Tito calle (whenQuiet) y no se
    // dice si el niño ya acertó antes de oírla (busy): así no corta el «¡Muy bien!» de su respuesta.
    round(){this.r=cfg.gen(this.i);this.items=layoutChoice(shuffle(this.r.words),this.r.ok,cfg.y||600,cfg.big);this.errs=0;this.lock=true;this.busy=false;
      const i0=this.i;later(400,()=>whenQuiet(()=>{if(this.busy||this.i!==i0)return;this.r.snd&&this.r.snd();say(this.r.ask,()=>{this.lock=false})}));later(2600,()=>{this.lock=false})},
    // Repite el sonido (si hay) y la pregunta.
    prompt(){this.r.snd&&this.r.snd();say(this.r.ask)},
    // Ayuda: señala la tarjeta correcta que aún no se ha acertado.
    hint(){const it=this.items.find(i=>i.ok&&!i.win);return it?{x:it.x,y:it.y,r:it.s*.62}:null},
    // Pinta el fondo, el dibujo de referencia (si hay) y las tarjetas.
    draw(){cfg.bg();cfg.ref&&cfg.ref(this.r,this);drawChoice(this.items)},
    // Toque: acierto → estrella, rec, onRight, frase y siguiente ronda (o onDone);
    // fallo → temblor, rec (solo el primero), frase de ayuda; al 2º fallo,
    // onWrongTwice y se quita una opción incorrecta (si quedan más de una).
    down(x,y){
      if(cfg.refTap&&cfg.refTap(this,x,y))return;
      const it=hitItem(this.items,x,y); if(!it){SFX.tap();sparkles(x,y,3);return}
      if(it.win||this.busy)return; if(this.lock&&!it.ok){say(cap(nameT(it.w)));return}
      if(it.ok){this.busy=true;it.win=T;SFX.good();burst(it.x,it.y,30);rec(cfg.key(this.r),this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(this.r.okSay(it.w),()=>later(450,()=>{this.i++;if(this.i>=cfg.rounds)onDone();else this.round()}))}
      else{SFX.bad();it.shake=T;if(this.errs===0)rec(cfg.key(this.r),false);this.errs++;say(this.r.badSay(it.w));
        if(this.errs===2){onWrongTwice();const w=this.items.find(i=>!i.ok&&!i.gone&&i!==it);if(w&&this.items.filter(i=>!i.gone&&!i.ok).length>1)w.gone=T}}
    }
  };
}
// COMPONENTE Busca: "¿Dónde está...?". Usa ChoiceGame.
// cfg: items (claves o {k}), bg, rounds (por defecto nRounds()), key, ask(k)
// (pregunta propia), okSay(w), sound (si true, suena SOUNDS[k] al preguntar).
// Cada ronda busca el siguiente de la lista barajada entre nOpts() opciones.
// Lo crea makeGame para {t:'busca'} con las palabras del tema.
// "¿Dónde está...?" con una lista de dibujos
function Busca(cfg,onDone){
  const pool=cfg.items.map(i=>i.k||i), R=cfg.rounds||nRounds(); let order=shuffle(pool);
  return ChoiceGame({rounds:R,bg:cfg.bg,key:()=>cfg.key||'busca',y:600,big:true,
    // Ronda i: el objetivo t y otras n-1 cosas al azar como distractores.
    gen(i){const t=order[i%order.length];const n=Math.min(nOpts(),pool.length);const others=shuffle(pool.filter(w=>w!==t)).slice(0,n-1);
      return {words:[t,...others],ok:[t],ask:cfg.ask?cfg.ask(t):esta(t),snd:cfg.sound&&SOUNDS[t]?()=>playSound(t):null,
        okSay:w=>praise()+' '+(cfg.okSay?cfg.okSay(w):cap(nameT(w))+'.'),badSay:w=>eseEs(w)+'. '+(cfg.ask?cfg.ask(t):esta(t))}}},onDone);
}
// COMPONENTE Sonido: "¿Quién hace este sonido?". Usa ChoiceGame.
// cfg: items (claves; solo valen las que tienen sonido en SOUNDS), bg, rounds.
// Dibuja un altavoz arriba (ref) que repite el sonido al tocarlo (refTap).
// ¿Quién hace este sonido?
function Sonido(cfg,onDone){
  const pool=cfg.items.filter(k=>SOUNDS[k]), R=cfg.rounds||nRounds(); const order=shuffle(pool);
  return ChoiceGame({rounds:R,bg:cfg.bg,key:()=>'sonidos',y:620,big:true,refTap:(g,x,y)=>{if(dist(x,y,900,230)<95&&g.r){g.r.snd();return true}},
    // Dibuja el altavoz grande en (900,230); late mientras Tito habla.
    ref(r){const p=1+Math.sin(T*6)*.06*(talking?1:0);ctx.save();ctx.translate(900,230);ctx.scale(p,p);circ(0,0,80,'#fff',7);speaker(4,0,90,'#5B8DEF');ctx.restore()},
    // Ronda i: el animal o vehículo que suena y los distractores (al menos 1).
    gen(i){const t=order[i%order.length];const n=Math.min(nOpts()+(AGE()<=3?0:0),pool.length);const others=shuffle(pool.filter(w=>w!==t)).slice(0,Math.max(1,n-1));
      return {words:[t,...others],ok:[t],ask:'¿Quién hace '+ONO[t].replace(/[¡!]/g,'').toLowerCase()+'?',snd:()=>playSound(t),
        okSay:w=>praise()+' '+cap(nameT(w))+' hace '+ONO[w],badSay:w=>cap(nameT(w))+' hace '+ONO[w].replace(/[¡!]/g,'').toLowerCase()+'. Escuchá otra vez.'}}},onDone);
}

/* ---------- conocer: tarjetas con voz ---------- */
// COMPONENTE Conocer: tarjetas en cuadrícula; al tocar una se abre en grande,
// suena su sonido y Tito dice su frase. Cada tarjeta vista da una estrella;
// cuando se han visto todas se llama onDone. No hay fallos.
// cfg: items (claves o {k, say, label, snd, draw, ex, bg}: say = frase, label =
// texto debajo, snd = sonido propio, draw = dibujo propio, ex = lista de
// ejemplos pequeños), bg, intro (frase inicial).
// Lo crea makeGame para {t:'conocer'} con las palabras del tema (t.words).
function Conocer(cfg,onDone){
  const items=cfg.items.map(o=>typeof o==='string'?{k:o}:o), n=items.length;
  // Cuadrícula: columnas según el número de tarjetas y tamaño s que quepa en
  // la zona de 1220x660; luego se centra cada fila (la última puede ir incompleta).
  const cols=n<=3?n:n===4?4:n<=6?3:n<=8?4:5, rows=Math.ceil(n/cols), s=Math.min(1220/cols-34,660/rows-34,290);
  items.forEach((it,i)=>{const r=Math.floor(i/cols),c=i%cols,inRow=Math.min(cols,n-r*cols);it.x=900-(inRow-1)*(s+34)/2+c*(s+34);it.y=180+((660-rows*(s+34))/2)+(s+34)/2+r*(s+34);it.s=s;it.in=T+i*.08});
  return {total:n,done:0,open:null,
    // Dice la frase de bienvenida.
    enter(){later(300,()=>sayQ(cfg.intro||'Tocá cada dibujo para conocerlo.'))},
    // Recuerda qué hacer (cerrar la tarjeta o tocar una sin estrella).
    prompt(){say(this.open?'Tocá para cerrar.':'Tocá un dibujo que todavía no tenga estrella.')},
    // Ayuda: la tarjeta abierta (para cerrarla) o la primera que no se ha visto.
    hint(){if(this.open)return{x:900,y:450,r:200};const it=items.find(i=>!i.seen);return it?{x:it.x,y:it.y,r:s*.6}:null},
    // Abre la tarjeta it en grande: sonido, frase y, si es nueva, estrella.
    // spoke guarda cuándo terminó la frase (update la cierra 2,2 s después).
    show(it){this.open=it;this.ot=T;SFX.pop();if(it.snd||SOUNDS[it.k])later(250,()=>(it.snd||(()=>playSound(it.k)))());
      const line=it.say?V(it.say):(cap(nameT(it.k||it))+'.');
      later(it.snd||SOUNDS[it.k]?900:200,()=>say(line,()=>{this.spoke=T}));
      if(!it.seen){it.seen=T;this.done++;scene.starPop=T}},
    // Cierra la tarjeta abierta; si ya se vieron todas, termina el juego.
    close(){this.open=null;this.spoke=0;SFX.tap();if(this.done>=n&&!this.fin){this.fin=true;later(400,onDone)}},
    // Cierra sola la tarjeta 2,2 s después de que Tito termine de hablar.
    update(){if(this.open&&this.spoke&&T-this.spoke>2.2)this.close()},
    // Dibuja la cuadrícula de tarjetas (con estrella las vistas) y, si hay una
    // abierta, el fondo oscurecido con la tarjeta grande, su nombre y ejemplos.
    draw(){cfg.bg();
      for(const it of items){const ap=clamp((T-it.in)*3,0,1),hs=this.open?1:hv(it,hR(it.x,it.y,it.s,it.s));ctx.save();ctx.translate(it.x,it.y);ctx.scale((ap<1?back(ap):1)*hs,(ap<1?back(ap):1)*hs);
        card(-it.s/2,-it.s/2,it.s,it.s,it.bg||'#fff',7,36);if(it.draw)it.draw(0,0,it.s*.8);else thing(it.k,0,0,it.s*.8);
        if(it.seen)star(it.s/2-18,-it.s/2+18,22,'#FFC93C',3.5);ctx.restore()}
      if(this.open){const it=this.open,k=clamp((T-this.ot)*4,0,1);ctx.fillStyle=`rgba(46,36,32,${.45*k})`;ctx.fillRect(0,0,W,H);
        ctx.save();ctx.translate(900,430);ctx.scale(back(k),back(k));card(-260,-280,520,560,'#FFF6E6',8,50);
        if(it.draw)it.draw(0,-40,380);else thing(it.k,0,-40,380);
        const lb=(it.label?V(it.label):Wn(it.k||'')).toUpperCase();text(lb,0,230,lb.length>12?50:64,K,{f:LF});
        if(it.ex)it.ex.forEach((e,j)=>{card(-250+j*180,300,140,140,'#fff',5,28);pic(e,-180+j*180,370,115)});
        ctx.restore()}
    },
    // Toque: con una tarjeta abierta la cierra (tras medio segundo); si no, abre
    // la tarjeta tocada.
    down(x,y){if(this.open){if(T-this.ot>.5)this.close();return}const it=items.find(i=>Math.abs(x-i.x)<i.s/2+8&&Math.abs(y-i.y)<i.s/2+8);if(it)this.show(it);else{SFX.tap();sparkles(x,y,3)}}
  };
}

/* ---------- el cuerpo: tocar partes ---------- */
// Partes "finas" del cuerpo (para 5 años, cfg.fine en Cuerpo): mismo formato
// que KID_PARTS. La línea siguiente añade sus centros a KID_C.
const KID_FINE=[{id:'cuello',n:'el cuello'},{id:'hombros',n:'los hombros'},{id:'codos',n:'los codos'},{id:'rodillas',n:'las rodillas'},{id:'tobillos',n:'los tobillos'}];
Object.assign(KID_C,{cuello:[0,-410],hombros:[76,-372],codos:[112,-293],rodillas:[43,-100],tobillos:[43,-36]});
// Como kidPartAt pero mira primero las partes finas (cuello, hombros, codos,
// rodillas, tobillos); si no toca ninguna, usa kidPartAt.
function kidFineAt(px,py,x,y,s){const u=(px-x)/s,v=(py-y)/s,ax=Math.abs(u);
  if(ax<26&&v>-430&&v<-388)return 'cuello';if(dist(ax,v,76,-372)<28)return 'hombros';if(dist(ax,v,112,-293)<28)return 'codos';if(dist(ax,v,43,-100)<30)return 'rodillas';if(dist(ax,v,43,-36)<22)return 'tobillos';return kidPartAt(px,py,x,y,s)}
// COMPONENTE Cuerpo: el niño dibujado en grande.
// cfg.mode='free': tocar partes libremente y Tito dice su nombre (una estrella
// por parte nueva). Otro modo ('ask'): "Toca la nariz" y hay que acertar.
// cfg: only (lista de ids de partes permitidas), fine (incluir KID_FINE),
// rounds, intro, skin, hair (colores), bg.
function Cuerpo(cfg,onDone){
  const ALL=cfg.fine?[...KID_PARTS,...KID_FINE]:KID_PARTS,partAt=cfg.fine?kidFineAt:kidPartAt;
  const parts=ALL.filter(p=>!cfg.only||cfg.only.includes(p.id)), free=cfg.mode==='free';
  const R=free?parts.length:(cfg.rounds||nRounds()+1); let order=shuffle(parts);
  // posición (pies) y escala del niño en pantalla
  const kx=1000,ky=870,ks=1.3;
  return {total:R,done:0,i:0,seen:{},hl:null,hlT:0,
    // Empieza: en modo libre dice la bienvenida; si no, la primera pregunta.
    enter(){if(free)later(300,()=>sayQ(cfg.intro||'Este es mi cuerpo. Tocá cada parte y te digo cómo se llama.'));else this.ask()},
    // Elige la parte objetivo de esta ronda y la pide en voz alta.
    ask(){this.t=order[this.i%order.length];this.errs=0;later(300,()=>sayQ('Tocá '+V(this.t.n)+'.'))},
    // Repite la consigna.
    prompt(){if(free)say('Tocá una parte del cuerpo.');else say('Tocá '+V(this.t.n)+'.')},
    // Ayuda: centro de la parte objetivo (o de la primera no tocada en modo libre),
    // pasado de coordenadas del dibujo a pantalla con kx, ky y ks.
    hint(){if(free){const p=parts.find(p=>!this.seen[p.id]);if(!p)return null;const [a,b]=KID_C[p.id];return{x:kx+a*ks,y:ky+b*ks,r:60}}
      const [a,b]=KID_C[this.t.id];return{x:kx+a*ks,y:ky+b*ks,r:60}},
    // Dibuja el niño con la parte tocada resaltada 1,4 s y su nombre en grande.
    // Las partes finas se marcan además con dos círculos (izquierda y derecha).
    draw(){cfg.bg();drawKid(kx,ky,ks,{hl:T-this.hlT<1.4?this.hl:null,skin:cfg.skin,hair:cfg.hair});
      if(mouseOn&&!this.busy){const p=partAt(MX,MY,kx,ky,ks);if(p)hv('k'+p,true)}
      if(this.hl&&T-this.hlT<1.4){const p=ALL.find(q=>q.id===this.hl);if(KID_FINE.includes(p)){const [a,b]=KID_C[p.id];ctx.globalAlpha=.55;circ(kx+a*ks,ky+b*ks,46,null,10,'#FFC93C');circ(kx-a*ks,ky+b*ks,46,null,10,'#FFC93C');ctx.globalAlpha=1}text(Wn(V(p.n)).toUpperCase(),520,360,72,K,{f:LF})}},
    // Toque: averigua la parte tocada. Modo libre: dice su nombre y suma estrella
    // si es nueva. Modo pregunta: acierto → estrella y siguiente; fallo → dice qué
    // parte tocó y repite la pregunta; al 2º fallo baja la dificultad y fuerza la ayuda.
    down(x,y){const id=partAt(x,y,kx,ky,ks);if(!id){SFX.tap();sparkles(x,y,3);return}
      const p=ALL.find(q=>q.id===id);this.hl=id;this.hlT=T;
      if(free){SFX.pop();sparkles(x,y,5);say(cap(V(p.n))+'.');if(!this.seen[id]&&parts.includes(p)){this.seen[id]=1;this.done++;scene.starPop=T;if(this.done>=R)later(1500,onDone)}return}
      if(this.busy)return;
      if(id===this.t.id){this.busy=true;SFX.good();burst(x,y,24);rec('cuerpo',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(praise()+' '+cap(V(p.n))+'.',()=>later(400,()=>{this.busy=false;this.i++;if(this.i>=R)onDone();else this.ask()}))}
      else{SFX.bad();this.errs++;if(this.errs===1)rec('cuerpo',false);say(cap(V(p.n)).replace(/^(.)/,c=>c)+'. Buscá '+V(this.t.n)+'.');if(this.errs>=2){onWrongTwice();idle=12}}}
  };
}

/* ---------- arrastrar y soltar (clasificar, pedidos, vestir, ordenar) ---------- */
// Dibuja una cesta (zona de soltar por defecto de Arrastra): trapecio relleno
// con el color z.c y rayas. z: {x,y,w,h,c}; hl: brillo dorado cuando se está
// soltando algo encima; icon(x,y,s): dibujo opcional en una tarjeta encima.
function drawBasket(z,hl,icon){
  const {x,y,w,h}=z;ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=30}
  ctx.beginPath();ctx.moveTo(x-w/2,y-h/2+20);ctx.lineTo(x+w/2,y-h/2+20);ctx.lineTo(x+w/2-24,y+h/2);ctx.lineTo(x-w/2+24,y+h/2);ctx.closePath();fillStroke(z.c||'#E8B46A',7);ctx.restore();
  ctx.save();ctx.beginPath();ctx.moveTo(x-w/2,y-h/2+20);ctx.lineTo(x+w/2,y-h/2+20);ctx.lineTo(x+w/2-24,y+h/2);ctx.lineTo(x-w/2+24,y+h/2);ctx.closePath();ctx.clip();
  ctx.strokeStyle='rgba(74,52,40,.25)';ctx.lineWidth=5;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x-w/2,y-h/2+20+i*(h-20)/4);ctx.lineTo(x+w/2,y-h/2+20+i*(h-20)/4);ctx.stroke()}ctx.restore();
  if(icon){card(x-62,y-h/2-120,124,124,'#fff',6,30);icon(x,y-h/2-58,100)}
}
// COMPONENTE Arrastra: arrastrar cosas desde una bandeja abajo y soltarlas en
// zonas (clasificar, vestir, guardar, ordenar). Es el más usado de los temas.
// cfg: rounds (3), total (estrellas; por defecto rounds), key, bg(juego),
// rect (tarjetas cuadradas), noCard (sin círculo blanco), sayPick (decir el
// nombre al cogerlo, por defecto sí), why(it,z) frase de fallo,
// wrongZone(it,z,paso), placeSay(it,z) frase al soltar bien,
// gen(i) → ronda i con:
//   {ask: consigna, zones: [{id, x, y, w, h, c, icon, draw(z,hl,juego),
//    slot(n,it) → [x,y] donde se queda la cosa n.º n, ps: escala al quedarse}],
//    items: [{k, zone: id de su zona o 'no' si no va en ninguna, s: tamaño,
//    x, y opcionales}], tray: {x0, x1, y} bandeja, steps: [{k, zone, say, ok}]
//    (modo por pasos: hay que poner cada cosa cuando Tito la pide),
//    free: true (modo libre: todo vale y aparece un botón ✓ para terminar),
//    preset: índices de 's'+j ya colocados (Secuencia), onPlace(it,z,juego),
//    drawExtra(juego), okAll: frase al completar la ronda}.
// Estrellas: una por paso (steps) o una por ronda completa.
function Arrastra(cfg,onDone){
  const R=cfg.rounds||3;
  return {total:cfg.total||R,done:0,i:0,step:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Carga la ronda this.i: copia los items, los reparte barajados por la bandeja
    // (hx,hy = su sitio de vuelta), coloca los "preset" y dice la consigna (y en
    // modo por pasos, el primer paso). La consigna espera a que Tito calle y no se dice si ya cambió la ronda.
    load(){const r=this.r=cfg.gen(this.i);this.zones=r.zones;this.step=0;this.errs=0;this.placedN=0;
      const its=r.items.map(o=>Object.assign({s:o.s||170},o));
      const tray=r.tray||{x0:360,x1:1520,y:790}, n=its.length, gap=(tray.x1-tray.x0)/n;
      shuffle(its).forEach((it,j)=>{it.hx=it.x=it.x??(tray.x0+gap*(j+.5));it.hy=it.y=it.y??tray.y;it.in=T+j*.07;it.placed=0});
      this.items=its;
      if(r.preset)for(const j of r.preset){const it=its.find(i=>i.zone==='s'+j),zz=it&&this.zones.find(q=>q.id===it.zone);if(!zz)continue;const p=zz.slot(0,it);it.placed=T;it.zid=zz.id;it.px=it.x=p[0];it.py=it.y=p[1];it.ps=zz.ps||.8}
      const i0=this.i;later(300,()=>whenQuiet(()=>{if(this.i===i0)say(V(r.ask),()=>{if(r.steps)this.askStep()})}))},
    // Paso actual (modo steps) o null.
    cur(){return this.r.steps?this.r.steps[this.step]:null},
    // Dice el paso actual.
    askStep(){const s=this.cur();if(s)say(V(s.say))},
    // Repite el paso actual o la consigna.
    prompt(){const s=this.cur();say(V(s?s.say:this.r.ask))},
    // Ayuda: la cosa que toca mover y hacia su zona (dx,dy para la manita).
    // En modo libre, tras colocar 2 cosas señala el botón ✓.
    hint(){if(drag)return null;let it,z;const s=this.cur();
      if(s){it=this.items.find(i=>!i.placed&&i.k===s.k);z=this.zones.find(q=>q.id===s.zone)}
      else{it=this.items.find(i=>!i.placed&&i.zone&&i.zone!=='no');z=it&&this.zones.find(q=>q.id===it.zone)}
      if(this.r.free){if(this.placedN>=2)return{x:1440,y:460,r:70};it=this.items.find(i=>!i.placed);z=this.zones[0];}
      return it&&z?{x:it.x,y:it.y,r:it.s*.6,dx:z.x-it.x,dy:z.y-it.y}:null},
    // Zona sobre la que está el punto (x,y), con 50 px de margen. Si varias
    // coinciden, prefiere la zona correcta de it y si no la más cercana.
    zoneAt(x,y,it){const c=this.zones.filter(z=>Math.abs(x-z.x)<z.w/2+50&&Math.abs(y-z.y)<z.h/2+50);return (it&&c.find(z=>z.id===it.zone))||c.sort((a,b)=>dist(x,y,a.x,a.y)-dist(x,y,b.x,b.y))[0]},
    // Cada cuadro acerca suavemente (lerp) las cosas que no se arrastran a su sitio:
    // el de la zona si ya están colocadas o el de la bandeja si no.
    update(dt){for(const it of this.items){if(drag&&drag.it===it)continue;const tx=it.placed?it.px:it.hx,ty=it.placed?it.py:it.hy;it.x=lerp(it.x,tx,Math.min(1,dt*10));it.y=lerp(it.y,ty,Math.min(1,dt*10))}},
    // Dibuja fondo, extras, zonas (la de debajo del dedo resaltada), las cosas
    // (primero las colocadas), la que se arrastra encima con sombra y el botón ✓.
    draw(){cfg.bg&&cfg.bg(this);this.r.drawExtra&&this.r.drawExtra(this);
      const hz=drag?this.zoneAt(drag.it.x,drag.it.y,this.r.steps?null:drag.it):null;
      for(const z of this.zones)(z.draw||((z,h)=>drawBasket(z,h,z.icon)))(z,z===hz,this);
      const list=this.items.filter(i=>!(drag&&drag.it===i)).sort((a,b)=>(a.placed?0:1)-(b.placed?0:1));
      for(const it of list){if(it.hidden)continue;const ap=clamp((T-it.in)*3,0,1);const hs=it.placed?1:hv(it,hC(it.x,it.y,it.s*.5));
        ctx.save();ctx.translate(it.x+(it.shake>0?Math.sin((T-it.shake)*40)*12*Math.max(0,1-(T-it.shake)*2.5):0),it.y);const sc=(ap<1?back(ap):1)*hs*(it.placed?(it.ps||.8):1);ctx.scale(sc,sc);
        if(cfg.rect)card(-it.s*.48,-it.s*.48,it.s*.96,it.s*.96,'#fff',5,22);else if(!it.placed&&!cfg.noCard)circ(0,0,it.s*.52,'#fff',5);thing(it.k,0,0,it.s*(cfg.rect?.9:.86));ctx.restore()}
      if(drag&&this.items.includes(drag.it)){const it=drag.it;ctx.save();ctx.translate(it.x,it.y+8);ctx.globalAlpha=.25;ell(0,it.s*.5,it.s*.4,14,K,0);ctx.restore();ctx.save();ctx.translate(it.x,it.y);ctx.scale(1.14,1.14);ctx.rotate(Math.sin(T*8)*.04);if(cfg.rect)card(-it.s*.48,-it.s*.48,it.s*.96,it.s*.96,'#fff',5,22);else if(!cfg.noCard)circ(0,0,it.s*.52,'#fff',5);thing(it.k,0,0,it.s*(cfg.rect?.9:.86));ctx.restore()}
      if(this.r.free&&this.placedN>0){const s=hv('ok',hC(1440,460,70));ctx.save();ctx.translate(1440,460);ctx.scale(s*(1+Math.sin(T*4)*.04),s);circ(0,0,62,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-26,2);ctx.lineTo(-6,24);ctx.lineTo(30,-20);ctx.lineWidth=14;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}
    },
    // Toque: botón ✓ del modo libre → termina; si no, coge la cosa más cercana
    // al dedo y empieza el arrastre (drag).
    down(x,y){
      if(this.r.free&&this.placedN>0&&dist(x,y,1440,460)<75){SFX.tada();this.done=this.total;scene.starPop=T;later(300,onDone);return}
      if(this.busy)return;
      const it=this.items.filter(i=>!i.placed&&!i.hidden&&dist(x,y,i.x,i.y)<i.s*.56+14).sort((a,b)=>dist(x,y,a.x,a.y)-dist(x,y,b.x,b.y))[0];
      if(!it){SFX.tap();sparkles(x,y,3);return}
      drag={it,dx:x-it.x,dy:y-it.y};setCursor('grab');SFX.pop();if(!this.r.steps&&cfg.sayPick!==false&&Math.random()<.6)say(cap(nameT(it.k))+'.')},
    // Mueve la cosa arrastrada con el dedo (sin salir de la pantalla).
    move(x,y){if(drag&&drag.it&&this.items.includes(drag.it)){drag.it.x=clamp(x-drag.dx,60,1540);drag.it.y=clamp(y-drag.dy,60,860)}},
    // Soltar: busca la zona. Sin zona, la cosa se queda donde está si se alejó de
    // la bandeja. Con zona: comprueba si es correcta (paso actual, modo libre o
    // it.zone); si lo es la coloca (place) y si no tiembla y Tito explica por qué.
    up(x,y){
      if(!drag||!this.items.includes(drag.it))return;const it=drag.it;drag=null;setCursor('pt');
      const z=this.zoneAt(it.x,it.y,this.r.steps?null:it);
      if(!z){if(it.y<700||Math.abs(it.x-it.hx)>40){it.hx=it.x;it.hy=it.y}return}
      const s=this.cur();
      let ok=s?(it.k===s.k&&z.id===s.zone):this.r.free?true:(it.zone===z.id);
      if(ok){this.place(it,z)}
      else{SFX.bad();it.shake=T;this.errs++;if(this.errs===1)rec(cfg.key||'arrastra',false);
        const why=s?(it.k!==s.k?eseEs(it.k)+'. '+V(s.say):(cfg.wrongZone?cfg.wrongZone(it,z,s):V(s.say))):(cfg.why?cfg.why(it,z):(it.zone==='no'?cap(nameT(it.k))+' no va.':'Mmm, '+nameT(it.k)+' no va ahí. Probá en otro lugar.'));
        say(why);if(this.errs>=2){onWrongTwice();idle=12}}
    },
    // Coloca la cosa it en la zona z (en su hueco slot o en filas de 3), suma
    // rec/onRight y avanza: en modo pasos, siguiente paso; en modo normal, cuando
    // no quedan cosas por colocar, estrella, frase okAll (cuando Tito acaba la de colocar: sayQ) y siguiente ronda u onDone.
    place(it,z){
      it.placed=T;const n=this.items.filter(i=>i.placed&&i.zid===z.id).length;it.zid=z.id;
      const p=z.slot?z.slot(n,it):[z.x+((n%3)-1)*z.w*.27,z.y-z.h*.05+Math.floor(n/3)*-40];it.px=p[0];it.py=p[1];it.ps=z.ps||.8;
      SFX.snap();sparkles(it.px,it.py,8);this.placedN++;rec(cfg.key||'arrastra',this.errs===0);onRight(this.errs===0);this.errs=0;
      this.r.onPlace&&this.r.onPlace(it,z,this);
      const s=this.cur();
      if(s){SFX.good();this.done++;scene.starPop=T;this.step++;this.busy=true;
        say(V(s.ok||praise()),()=>later(300,()=>{this.busy=false;if(this.step>=this.r.steps.length){this.i++;if(this.i>=R)onDone();else this.load()}else this.askStep()}));return}
      if(this.r.free){say(cap(nameT(it.k))+'.');return}
      const left=this.items.filter(i=>!i.placed&&i.zone&&i.zone!=='no').length;
      if(cfg.placeSay)say(cfg.placeSay(it,z));
      if(!left){SFX.good();this.done++;scene.starPop=T;this.busy=true;burst(900,420,40);
        later(cfg.placeSay?1300:200,()=>sayQ(this.r.okAll?V(this.r.okAll):praise(),()=>later(400,()=>{this.busy=false;this.i++;if(this.i>=R)onDone();else this.load()})))}
    }
  };
}

/* ---------- atrapar cosas que suben o caen ---------- */
// COMPONENTE Atrapa: suben burbujas (o caen cosas) y hay que tocar solo las
// que cumplen la condición. cfg.targets: lista de objetivos {ask: consigna,
// is(k): true si la cosa k vale, icon(x,y,s) y label opcionales para el
// cartel}; hay que atrapar `per` cosas de cada objetivo (3 o 4 según la edad).
// cfg: pool (cosas posibles), dir ('down' = caen), style ('plain' = sin
// burbuja), ring(k) color del aro, key, bg.
// Nota: los aciertos no llaman a onRight (no dan monedas por acierto).
function Atrapa(cfg,onDone){
  const per=cfg.per||(AGE()<=3?3:4);
  return {total:cfg.targets.length*per,done:0,ti:0,got:0,bs:[],spawn:0,
    enter(){this.announce()},
    // Objetivo actual.
    tgt(){return cfg.targets[Math.min(this.ti,cfg.targets.length-1)]},
    // Dice la consigna del objetivo actual.
    announce(){say(V(this.tgt().ask))},
    // Repite la consigna.
    prompt(){say(V(this.tgt().ask))},
    // Cada cuadro: crea burbujas nuevas (máx. 6 a la vez; si no hay ninguna buena
    // en pantalla, la nueva es buena seguro; si no, 45 % de que lo sea), las mueve
    // haciendo eses y borra las que salieron o ya explotaron. Más lentas a los 3
    // años (slow) y algo más rápidas en cada repetición (REP).
    update(dt){
      if(this.fin)return; this.spawn-=dt; const slow=(AGE()<=3?.65:.85)*(1+.2*REP), up=cfg.dir!=='down';
      if(this.spawn<=0&&this.bs.length<6){this.spawn=rnd(.8,1.3)/slow;const t=this.tgt();
        const hasT=this.bs.filter(b=>t.is(b.k)&&!b.pop).length;const pool=cfg.pool;
        const k=(hasT<1||Math.random()<.45)?pick(pool.filter(t.is)):pick(pool.filter(q=>!t.is(q)));
        this.bs.push({k,x:rnd(380,1440),y:up?990:-110,v:rnd(70,105)*slow,ph:rnd(0,6),r:88,jig:-9,pop:0,rot:rnd(-.4,.4)})}
      for(const b of this.bs){if(b.pop)continue;b.y+=(up?-1:1)*b.v*dt;b.x+=Math.sin(T*1.5+b.ph)*(up?30:60)*dt;if(b.vx){b.x+=b.vx*dt;b.vx*=.95}}
      this.bs=this.bs.filter(b=>(up?b.y>-120:b.y<1020)&&!(b.pop&&T-b.pop>.3));
    },
    // Dibuja las burbujas (o cosas sueltas), las que explotan como un aro que se
    // agranda, y arriba el cartel con el objetivo si tiene icono.
    draw(){cfg.bg();
      for(const b of this.bs){
        if(b.pop){const k=(T-b.pop)/.3;ctx.globalAlpha=1-k;circ(b.x,b.y,b.r*(1+k*.6),null,8,cfg.ring?cfg.ring(b.k):'#5B8DEF');ctx.globalAlpha=1;continue}
        const jx=b.jig>0?Math.sin((T-b.jig)*40)*12*Math.max(0,1-(T-b.jig)*2):0,hs=hv(b,hC(b.x,b.y,b.r));
        ctx.save();ctx.translate(b.x+jx,b.y);ctx.scale(hs,hs);
        if(cfg.style==='plain'){ctx.rotate(Math.sin(T*2+b.ph)*.35+b.rot);thing(b.k,0,0,b.r*1.9)}
        else{const rc=cfg.ring?cfg.ring(b.k):'#5B8DEF';circ(0,0,b.r,'rgba(255,255,255,.6)',8,rc);thing(b.k,0,4,b.r*1.35);ctx.beginPath();ctx.arc(0,0,b.r*.75,PI*1.1,PI*1.45);ctx.lineWidth=10;ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineCap='round';ctx.stroke()}
        ctx.restore()}
      const t=this.tgt();if(t.icon){card(660,24,480,118,'#fff',6,56);text(tx(t.label||''),860,103,48,K);t.icon(1040,83,96)}
    },
    // Ayuda: la burbuja buena más alta que esté bien dentro de la pantalla.
    hint(){const t=this.tgt();const b=this.bs.filter(b=>t.is(b.k)&&!b.pop&&b.y<820&&b.y>150&&b.x>250&&b.x<1450).sort((a,b)=>a.y-b.y)[0];return b?{x:b.x,y:b.y,r:95}:null},
    // Toque: burbuja buena → explota, estrella; al llegar a `per` pasa al
    // siguiente objetivo o termina. Mala → rebota hacia un lado y Tito dice qué es.
    down(x,y){
      const b=this.bs.filter(b=>!b.pop&&dist(x,y,b.x,b.y)<b.r+24).sort((a,c)=>dist(x,y,a.x,a.y)-dist(x,y,c.x,c.y))[0];
      if(!b){SFX.tap();sparkles(x,y,3);return}
      const t=this.tgt();
      if(t.is(b.k)){b.pop=T;SFX.pop();SFX.good();burst(b.x,b.y,22);rec(cfg.key||'atrapa',true);this.done++;scene.starPop=T;this.got++;
        if(this.got>=per){this.got=0;this.ti++;if(this.ti>=cfg.targets.length){this.fin=true;later(600,onDone)}else later(700,()=>this.announce())}
        else if(Math.random()<.5)say(praise());}
      else{b.jig=T;b.vx=(b.x<x?-1:1)*-260;SFX.boing();rec(cfg.key||'atrapa',false);say(eseEs(b.k)+'. '+V(t.ask))}
    }
  };
}

/* ---------- memoria ---------- */
// COMPONENTE Memoria: parejas de cartas boca abajo. cfg: pool (claves),
// pairs (por defecto 3, 4 o 6 según la edad), intro, bg. Una estrella por
// pareja. Lo crea makeGame para {t:'memoria'}. No llama a onRight.
function Memoria(cfg,onDone){
  const np=cfg.pairs||({3:3,4:4,5:6})[AGE()], ks=shuffle(cfg.pool).slice(0,np), cards=shuffle([...ks,...ks]).map(k=>({k,up:0,ok:0,flip:0}));
  const cols=cards.length<=6?3:4,rows=Math.ceil(cards.length/cols),s=Math.min(220,640/rows-30);
  cards.forEach((c,i)=>{c.x=900-(cols-1)*(s+30)/2+(i%cols)*(s+30);c.y=470-(rows-1)*(s+30)/2+Math.floor(i/cols)*(s+30)});
  return {total:np,done:0,open:[],
    // Dice la explicación.
    enter(){later(300,()=>sayQ(cfg.intro||'Juego de memoria. Tocá dos tarjetas y buscá las que son iguales.'))},
    // Repite la consigna.
    prompt(){say('Buscá dos tarjetas iguales.')},
    // Ayuda: si hay una carta levantada, su pareja; si no, una carta sin pareja
    // pero solo tras 14 s sin tocar (para no destripar el juego).
    hint(){const a=this.open[0];if(a){const b=cards.find(c=>c!==a&&c.k===a.k);return{x:b.x,y:b.y,r:s*.6}}const c=cards.find(c=>!c.ok);return c&&idle>14?{x:c.x,y:c.y,r:s*.6}:null},
    // Dibuja las cartas. El giro se simula estrechando la carta en x con
    // |cos(f·π)|: a mitad del giro (f>0,5) se cambia el dorso por la cara.
    draw(){cfg.bg();for(const c of cards){const f=c.up?clamp((T-c.flip)*5,0,1):1-clamp((T-c.flip)*5,0,1),sx=Math.abs(Math.cos(f*PI));const showFace=f>.5;
      const hs=c.up?1:hv(c,hR(c.x,c.y,s,s));ctx.save();ctx.translate(c.x,c.y);ctx.scale(sx*hs*(c.ok?1+Math.sin((T-c.ok)*8)*.03*Math.max(0,1-(T-c.ok)):1),hs);
      if(showFace){card(-s/2,-s/2,s,s,c.ok?'#FFF6D6':'#fff',c.ok?9:7,32,c.ok?'#FFC93C':K);thing(c.k,0,0,s*.8)}
      else{card(-s/2,-s/2,s,s,'#FFA94D',7,32);ctx.save();ctx.beginPath();for(let i=0;i<=60;i++){const a=i/60*PI*2*2.2,r=4+i/60*s*.32;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.lineWidth=8;ctx.strokeStyle='#D9762A';ctx.lineCap='round';ctx.stroke();ctx.restore()}
      ctx.restore()}},
    // Toque: levanta la carta. Con dos levantadas: si son iguales quedan fijas
    // (estrella; al completar todas, onDone); si no, se vuelven a girar en 1,3 s.
    down(x,y){if(this.busy)return;const c=cards.find(c=>Math.abs(x-c.x)<s/2&&Math.abs(y-c.y)<s/2);if(!c||c.up){SFX.tap();return}
      c.up=1;c.flip=T;SFX.pop();this.open.push(c);say(cap(nameT(c.k)));
      if(this.open.length===2){const [a,b]=this.open;this.busy=true;
        if(a.k===b.k){later(500,()=>{a.ok=b.ok=T;SFX.good();burst(a.x,a.y,16);burst(b.x,b.y,16);this.done++;scene.starPop=T;rec('memoria',true);this.open=[];this.busy=false;
          if(this.done>=np){later(500,onDone)}else say(praise())})}
        else later(1300,()=>{a.up=b.up=0;a.flip=b.flip=T;SFX.whoosh();this.open=[];this.busy=false})}}
  };
}

/* ---------- contar ---------- */
// Dibuja una tarjeta con n puntos azules como en un dado (1 a 6) en (x,y) con
// lado s; si dig, también el número debajo.
function dotsCard(n,x,y,s,dig){card(x-s/2,y-s/2,s,s,'#fff',6,30);const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[n]||[];
  for(const [a,b] of P)circ(x+a*s*.22,y+b*s*.22-(dig?s*.1:0),s*.08,'#5B8DEF',0);if(dig)text(String(n),x,y+s*.42,s*.3,K,{f:LF})}
// COMPONENTE Cuenta: primero se toca cada objeto para contarlo (Tito dice
// "uno, dos..."); luego se elige el número en tarjetas de puntos.
// cfg: pool (claves), max (por defecto 3, 6 o 10 según la edad), rounds, bg.
// Modo "uno solo" (cfg.one(n) → cosa): un único dibujo grande que el tema
// dibuja y gestiona con cfg.drawOne(juego,o), cfg.tapOne(juego,x,y),
// cfg.ask(juego), cfg.how(juego) y cfg.okSay(juego).
function Cuenta(cfg,onDone){
  const R=cfg.rounds||nRounds(),mx=cfg.max||({3:3,4:6,5:10})[AGE()];
  let last=0;
  return {total:R,done:0,i:0,
    // Empieza la primera ronda.
    enter(){this.round()},
    // Nueva ronda: elige n (distinto del anterior), la cosa a contar y coloca n
    // copias en filas de hasta 5; fase 'count'.
    round(){let n;do{n=ri(1,mx)}while(n===last&&mx>1);last=n;this.n=n;this.k=cfg.one?cfg.one(n):pick(cfg.pool);this.c=0;this.phase='count';this.errs=0;
      const sz=n<=3?220:n<=5?180:140,cols=Math.min(n,5),rows=Math.ceil(n/cols);
      this.objs=Array.from({length:n},(_,j)=>({x:900-(Math.min(cols,n-Math.floor(j/cols)*cols)-1)*(sz+20)/2+(j%cols)*(sz+20),y:370-(rows-1)*(sz+10)/2+Math.floor(j/cols)*(sz+10),s:sz,c:0,in:T+j*.08}));
      if(cfg.one){this.objs=[{x:900,y:380,s:380,c:0,in:T,one:1}]}
      this.opts=null;later(300,()=>sayQ(cfg.one?cfg.ask(this):'Vamos a contar '+plural(this.k)+'. Tocá cada '+(fem(this.k)?'una.':'uno.')))},
    // Repite la consigna de la fase actual.
    prompt(){say(this.phase==='count'?(cfg.one?cfg.ask(this):'Tocá cada uno para contar.'):'¿Cuántos hay?')},
    // Ayuda: el siguiente objeto sin contar, o la tarjeta con el número correcto.
    hint(){if(this.phase==='count'){if(cfg.one)return null;const o=this.objs.find(o=>!o.c);return o?{x:o.x,y:o.y,r:o.s*.55}:null}const o=this.opts&&this.opts.find(o=>o.n===this.n);return o?{x:o.x,y:o.y,r:110}:null},
    // Fase 'choose': prepara tarjetas de número (la correcta y otras al azar) y
    // pregunta cuántos hay.
    askHow(){this.phase='choose';const ns=[this.n];const n=Math.min(nOpts()+1,3);while(ns.length<n){const v=ri(1,Math.max(3,mx));if(!ns.includes(v))ns.push(v)}
      this.opts=shuffle(ns).map((v,j,a)=>({n:v,x:900-(a.length-1)*130+j*260,y:740,in:T+j*.1}));
      say(cfg.one?cfg.how(this):'¿'+(fem(this.k)?'Cuántas ':'Cuántos ')+plural(this.k)+' hay? Tocá el número.')},
    // Dibuja los objetos (los contados con su número en verde) y las tarjetas.
    draw(){cfg.bg();
      if(cfg.one){const o=this.objs[0];cfg.drawOne(this,o)}
      else for(const o of this.objs){const ap=clamp((T-o.in)*3,0,1),hs=o.c?1:hv(o,hC(o.x,o.y,o.s*.5));ctx.save();ctx.translate(o.x,o.y);const b=o.c?1+Math.max(0,1-(T-o.c)*3)*.2:1;ctx.scale((ap<1?back(ap):1)*hs*b,(ap<1?back(ap):1)*hs*b);thing(this.k,0,0,o.s);ctx.restore();
        if(o.c){circ(o.x+o.s*.36,o.y-o.s*.36,30,'#7CC86E',5);text(String(o.num),o.x+o.s*.36,o.y-o.s*.36+12,36,'#fff',{f:LF})}}
      if(this.opts)for(const o of this.opts){const ap=clamp((T-o.in)*3,0,1),hs=hv(o,hR(o.x,o.y,200,200));ctx.save();ctx.translate(o.x,o.y);ctx.scale((ap<1?back(ap):1)*hs,(ap<1?back(ap):1)*hs);dotsCard(o.n,0,0,200,AGE()>=4||REP>0||true);ctx.restore()}},
    // Toque: en 'count' cuenta el objeto; al contarlos todos pasa a elegir.
    // En 'choose': acierto → estrella y siguiente ronda; fallo → corrige.
    down(x,y){if(this.busy)return;
      if(this.phase==='count'){if(cfg.one){cfg.tapOne(this,x,y);return}
        const o=this.objs.find(o=>!o.c&&dist(x,y,o.x,o.y)<o.s*.55);if(!o){SFX.tap();return}
        this.c++;o.c=T;o.num=this.c;SFX.count(this.c);say(cap(NUM[this.c]));if(this.c>=this.n){this.busy=true;later(900,()=>{this.busy=false;this.askHow()})}return}
      const o=this.opts.find(o=>Math.abs(x-o.x)<110&&Math.abs(y-o.y)<110);if(!o){SFX.tap();return}
      if(o.n===this.n){this.busy=true;SFX.good();burst(o.x,o.y,30);rec('contar',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(praise()+' '+(cfg.one?cfg.okSay(this):'¡Hay '+unN(this.n,this.k)+'!'),()=>later(400,()=>{this.busy=false;this.i++;if(this.i>=R)onDone();else this.round()}))}
      else{SFX.bad();this.errs++;if(this.errs===1)rec('contar',false);say('Ese es el '+NUM[o.n]+'. Contamos '+NUM[this.n]+'.');if(this.errs>=2)onWrongTwice()}}
  };
}

/* ---------- rompecabezas ---------- */
// COMPONENTE Puzzle (rompecabezas): una imagen cortada en piezas (2x2, 3x2 o
// 3x3 según la edad) que se arrastran a su sitio sobre la silueta.
// cfg: list (claves de dibujo; necesitan imagen cargada en IMG[k]), bg.
// Una estrella por rompecabezas completo.
function Puzzle(cfg,onDone){
  const R=cfg.list.length,[cols,rows]=({3:[2,2],4:[3,2],5:[3,3]})[AGE()]||[2,2],B={x:960,y:420,s:460};
  return {total:R,done:0,i:0,
    // Carga el primer rompecabezas.
    enter(){this.load()},
    // Carga el rompecabezas this.i: crea las piezas (tx,ty = su sitio en el
    // cuadro; x,y/hx,hy = su sitio fuera, en posiciones barajadas alrededor).
    load(){this.k=cfg.list[this.i];const pw=B.s/cols,ph=B.s/rows;this.pw=pw;this.ph=ph;this.placed=0;
      const spots=shuffle([[340,250],[340,480],[340,710],[620,790],[1300,790],[1450,250],[1450,480],[1450,710],[960,800]]);
      this.ps=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const sp=spots[this.ps.length];this.ps.push({c,r,tx:B.x-B.s/2+pw*(c+.5),ty:B.y-B.s/2+ph*(r+.5),x:sp[0],y:sp[1],hx:sp[0],hy:sp[1],ok:0,rot:rnd(-.2,.2)})}
      later(300,()=>sayQ(this.i?'¡Otro rompecabezas! ¿Qué será?':'Armá el rompecabezas. Arrastrá cada pieza a su lugar.'))},
    // Repite la consigna.
    prompt(){say('Arrastrá una pieza al cuadro.')},
    // Ayuda: una pieza suelta y hacia dónde va.
    hint(){const p=this.ps.find(p=>!p.ok);return p&&!drag?{x:p.x,y:p.y,r:90,dx:p.tx-p.x,dy:p.ty-p.y}:null},
    // Dibuja la pieza p en (x,y): recorta de la imagen IMG[k] su trozo
    // (columna p.c, fila p.r) dentro de una tarjeta redondeada.
    piece(p,x,y,sc=1){const img=IMG[this.k];if(!img||!img.complete)return;const sw=img.width/cols,sh=img.height/rows;ctx.save();ctx.translate(x,y);ctx.rotate(p.ok?0:p.rot*(drag&&drag.it===p?0:1));ctx.scale(sc,sc);
      card(-this.pw/2,-this.ph/2,this.pw,this.ph,'#fff',p.ok?0:5,10);ctx.save();rr(-this.pw/2,-this.ph/2,this.pw,this.ph,10);ctx.clip();
      ctx.drawImage(img,p.c*sw,p.r*sh,sw,sh,-this.pw/2-1,-this.ph/2-1,this.pw+2,this.ph+2);ctx.restore();if(!p.ok){rr(-this.pw/2,-this.ph/2,this.pw,this.ph,10);fillStroke(null,5)}ctx.restore()},
    // Acerca con suavidad cada pieza no arrastrada a su sitio.
    update(dt){for(const p of this.ps){if(drag&&drag.it===p)continue;const tx=p.ok?p.tx:p.hx,ty=p.ok?p.ty:p.hy;p.x=lerp(p.x,tx,Math.min(1,dt*10));p.y=lerp(p.y,ty,Math.min(1,dt*10))}},
    // Dibuja el marco con la silueta tenue y líneas de corte, las piezas puestas,
    // las sueltas, la arrastrada y, al terminar, el dibujo completo latiendo.
    draw(){cfg.bg();card(B.x-B.s/2-16,B.y-B.s/2-16,B.s+32,B.s+32,'#fff',7,24);ctx.globalAlpha=.28;picG(this.k,B.x,B.y,B.s);ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(74,52,40,.2)';ctx.lineWidth=3;ctx.setLineDash([8,10]);for(let c=1;c<cols;c++){ctx.beginPath();ctx.moveTo(B.x-B.s/2+c*this.pw,B.y-B.s/2);ctx.lineTo(B.x-B.s/2+c*this.pw,B.y+B.s/2);ctx.stroke()}for(let r=1;r<rows;r++){ctx.beginPath();ctx.moveTo(B.x-B.s/2,B.y-B.s/2+r*this.ph);ctx.lineTo(B.x+B.s/2,B.y-B.s/2+r*this.ph);ctx.stroke()}ctx.setLineDash([]);
      for(const p of this.ps)if(p.ok)this.piece(p,p.x,p.y);
      for(const p of this.ps)if(!p.ok&&!(drag&&drag.it===p))this.piece(p,p.x,p.y,hv(p,hR(p.x,p.y,this.pw,this.ph)));
      if(drag&&this.ps.includes(drag.it))this.piece(drag.it,drag.it.x,drag.it.y,1.08);
      if(this.fin){const k=clamp((T-this.fin)*2,0,1);ctx.globalAlpha=k;pic(this.k,B.x,B.y,B.s*(1+.05*Math.sin(T*6)));ctx.globalAlpha=1}},
    // Toque: coge la pieza suelta de más arriba bajo el dedo.
    down(x,y){if(this.fin)return;const p=this.ps.filter(p=>!p.ok&&Math.abs(x-p.x)<this.pw/2+10&&Math.abs(y-p.y)<this.ph/2+10).pop();if(!p){SFX.tap();return}drag={it:p,dx:x-p.x,dy:y-p.y};setCursor('grab');SFX.pop()},
    // Mueve la pieza arrastrada.
    move(x,y){if(drag&&this.ps.includes(drag.it)){drag.it.x=clamp(x-drag.dx,60,1540);drag.it.y=clamp(y-drag.dy,60,860)}},
    // Soltar: si está cerca de su sitio encaja; con todas puestas, estrella y
    // siguiente rompecabezas u onDone. Si no, la pieza se queda donde se soltó.
    up(){if(!drag||!this.ps.includes(drag.it))return;const p=drag.it;drag=null;setCursor('pt');
      if(dist(p.x,p.y,p.tx,p.ty)<Math.max(70,this.pw*.42)){p.ok=T;SFX.snap();sparkles(p.tx,p.ty,8);this.placed++;rec('puzzle',true);
        if(this.placed>=this.ps.length){this.fin=T;SFX.good();burst(B.x,B.y,50);this.done++;scene.starPop=T;
          say(praise()+' ¡Es '+nameT(this.k)+'!',()=>later(900,()=>{this.fin=0;this.i++;if(this.i>=R)onDone();else this.load()}))}}
      else{p.hx=p.x;p.hy=p.y}}
  };
}

/* ---------- cavar en la arena ---------- */
// COMPONENTE Excava: frotar la arena con el dedo para descubrir cosas
// escondidas. cfg: pool (claves), n (cuántas, 4-6 según la edad; como mucho 6,
// que son las posiciones), cover/cover2 (colores de la arena), under (color
// del fondo), intro, bg. Una estrella por cosa descubierta.
function Excava(cfg,onDone){
  const A={x:330,y:180,w:1180,h:640},list=shuffle(cfg.pool).slice(0,cfg.n||({3:4,4:5,5:6})[AGE()]);
  // TRUCO: la arena es un lienzo aparte (a media resolución, sc=0,5) que se pinta
  // encima de las cosas. Cavar borra agujeros en él (destination-out).
  const sc=.5,cnv=document.createElement('canvas');cnv.width=A.w*sc;cnv.height=A.h*sc;const g=cnv.getContext('2d');
  g.fillStyle=cfg.cover||'#F3D9A0';g.fillRect(0,0,cnv.width,cnv.height);g.fillStyle=cfg.cover2||'#E8C47E';for(let i=0;i<500;i++){g.beginPath();g.arc(Math.random()*cnv.width,Math.random()*cnv.height,rnd(1,3),0,PI*2);g.fill()}
  const pos=shuffle([[.17,.28],[.5,.25],[.83,.28],[.17,.74],[.5,.72],[.83,.74]]);
  const objs=list.map((k,i)=>({k,x:A.x+A.w*pos[i][0],y:A.y+A.h*pos[i][1],found:0}));
  const digs=[];
  return {total:objs.length,done:0,
    // Dice la explicación.
    enter(){later(300,()=>sayQ(cfg.intro||'Hay cosas escondidas en la arena. Frotá con el dedo para descubrirlas.'))},
    // Repite la consigna.
    prompt(){say('Frotá la arena para encontrar lo que está escondido.')},
    // Ayuda: la primera cosa sin descubrir (la manita se mueve a los lados).
    hint(){const o=objs.find(o=>!o.found);return o?{x:o.x,y:o.y,r:110,dx:60}:null},
    // Cava un agujero en (x,y) y comprueba cada cosa cercana: mira 36 puntos a su
    // alrededor (12 ángulos x 3 radios); si más de la mitad están cerca de algún
    // agujero (digs), la cosa queda descubierta: estrella, se limpia del todo su
    // zona y Tito la nombra. Al encontrar todas, onDone.
    dig(x,y){if(x<A.x||x>A.x+A.w||y<A.y||y>A.y+A.h)return;g.globalCompositeOperation='destination-out';g.beginPath();g.arc((x-A.x)*sc,(y-A.y)*sc,58*sc,0,PI*2);g.fill();g.globalCompositeOperation='source-over';
      digs.push([x,y]);if(Math.random()<.4){SFX.dig();parts.push({x,y,vx:rnd(-120,120),vy:rnd(-300,-120),life:.6,t:0,c:'#E8C47E',r:rnd(5,9),k:'d'})}
      for(const o of objs){if(o.found||dist(x,y,o.x,o.y)>150)continue;let c=0,n=0;for(let a=0;a<12;a++)for(const rr of[25,60,95]){n++;const px=o.x+Math.cos(a*PI/6)*rr,py=o.y+Math.sin(a*PI/6)*rr;if(digs.some(([dx,dy])=>dist(px,py,dx,dy)<58))c++}
        if(c/n>.5){o.found=T;SFX.good();burst(o.x,o.y,26);this.done++;scene.starPop=T;rec('excava',true);
          g.globalCompositeOperation='destination-out';g.beginPath();g.arc((o.x-A.x)*sc,(o.y-A.y)*sc,120*sc,0,PI*2);g.fill();g.globalCompositeOperation='source-over';
          say('¡Encontraste '+nameT(o.k)+'!',()=>{if(this.done>=objs.length&&!this.fin){this.fin=1;later(500,onDone)}})}}},
    // Dibuja las cosas, la arena encima (recortada al rectángulo), otra vez las
    // encontradas por encima de la arena y un círculo guía bajo el ratón.
    draw(){cfg.bg();card(A.x-12,A.y-12,A.w+24,A.h+24,cfg.under||'#FFE6A8',7,30);
      for(const o of objs){const b=o.found?1+.12*Math.max(0,1-(T-o.found)*2):1;ctx.save();ctx.translate(o.x,o.y);ctx.scale(b,b);thing(o.k,0,0,200);ctx.restore()}
      ctx.save();rr(A.x,A.y,A.w,A.h,24);ctx.clip();ctx.drawImage(cnv,A.x,A.y,A.w,A.h);ctx.restore();
      for(const o of objs)if(o.found){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1+.12*Math.max(0,1-(T-o.found)*2),1);thing(o.k,0,0,200);ctx.restore()}
      if(mouseOn&&MX>A.x&&MX<A.x+A.w&&MY>A.y&&MY<A.y+A.h){ctx.globalAlpha=.35;circ(MX,MY,58,null,4,'#A86B43');ctx.globalAlpha=1}},
    // Al tocar empieza a cavar; al mover con el dedo apoyado sigue cavando.
    down(x,y){this.on=1;this.dig(x,y)},/* mover: sigue cavando si el dedo está apoyado */ move(x,y){if(this.on)this.dig(x,y)},/* soltar: deja de cavar */ up(){this.on=0}
  };
}

/* ---------- regar plantas ---------- */
// COMPONENTE Riega: arrastrar la regadera sobre cada maceta hasta que crece la
// flor (3 etapas: brote, tallo con capullo, flor). cfg: n (macetas, 3), colors
// (colores de las flores), intro, bg. Una estrella por flor.
function Riega(cfg,onDone){
  const n=cfg.n||3,cols=cfg.colors||['#FF8A7A','#F58BB4','#FFC93C','#9B8AD9'];
  const pots=Array.from({length:n},(_,i)=>({x:900-(n-1)*150+i*300,y:720,w:0,st:0,c:cols[i%cols.length]}));
  const can={x:1400,y:330,hx:1400,hy:330};
  return {total:n,done:0,
    // Dice la explicación.
    enter(){later(300,()=>sayQ(cfg.intro||'Las semillas tienen sed. Agarrá la regadera y llevala arriba de cada maceta.'))},
    // Repite la consigna.
    prompt(){say('Llevá la regadera arriba de una maceta para regarla.')},
    // Ayuda: señala la regadera y la lleva hasta encima de una maceta sin flor.
    hint(){const p=pots.find(p=>p.st<3);return p&&!drag?{x:can.x,y:can.y,r:110,dx:p.x-can.x,dy:p.y-200-can.y}:null},
    // Cada cuadro: si no se sujeta, la regadera vuelve a su sitio. Si se sujeta
    // encima de una maceta (zona sobre ella), suma agua (p.w) con gotas y sonido;
    // cada unidad de agua es una etapa (p.st). En la etapa 3 sale la flor: estrella
    // y frase; con todas, onDone.
    update(dt){const held=drag&&drag.it===can;if(!held){can.x=lerp(can.x,can.hx,dt*6);can.y=lerp(can.y,can.hy,dt*6)}
      if(held)for(const p of pots){if(p.st>=3)continue;if(Math.abs(can.x-60-p.x)<120&&can.y<p.y-80&&can.y>p.y-520){p.w+=dt*.75;if(Math.random()<dt*25)parts.push({x:can.x-95,y:can.y-30,vx:rnd(-40,10),vy:rnd(40,120),life:.7,t:0,c:'#5BB8E6',r:rnd(5,8),k:'d',g:900});if(Math.random()<dt*3)SFX.drip();
        const st=Math.min(3,Math.floor(p.w));if(st>p.st){p.st=st;SFX.grow();sparkles(p.x,p.y-100,8);if(st===3){this.done++;scene.starPop=T;burst(p.x,p.y-220,30);rec('riega',true);say(this.done>=n?'¡Todas las flores crecieron!':pick(['¡Salió una flor!','¡Mirá qué linda flor!','¡Creció!']),()=>{if(this.done>=n&&!this.fin){this.fin=1;later(400,onDone)}})}}}}},
    // Dibuja tallos, hojas, capullos y flores según la etapa de cada maceta, las
    // macetas, y la regadera (inclinada mientras se arrastra).
    draw(){cfg.bg();
      for(const p of pots){const h=[0,60,140,200][p.st]+Math.min(1,p.w-p.st)*40*(p.st<3?1:0);
        if(p.st>=1){ctx.beginPath();ctx.moveTo(p.x,p.y-60);ctx.quadraticCurveTo(p.x+10,p.y-60-h/2,p.x,p.y-60-h);ctx.lineWidth=10;ctx.strokeStyle='#5FA84E';ctx.lineCap='round';ctx.stroke();
          for(const sx of[-1,1]){ctx.save();ctx.translate(p.x,p.y-60-h*.45);ctx.rotate(sx*.6);ell(sx*24,0,26,12,'#7CC86E',4);ctx.restore()}}
        else{ell(p.x,p.y-66,14,9,'#A86B43',4)}
        if(p.st>=2&&p.st<3)circ(p.x,p.y-60-h,18,'#7CC86E',5);
        if(p.st>=3){const b=1+Math.sin(T*3+p.x)*.04;ctx.save();ctx.translate(p.x,p.y-60-h);ctx.scale(b,b);flower(0,0,46,p.c,5);ctx.restore()}
        pic('maceta',p.x,p.y,200);
        const hs=hv(p,hC(p.x,p.y,90));if(hs>1&&!drag&&p.st<3){ctx.globalAlpha=.6;circ(p.x,p.y-30,100,null,5,'#5BB8E6');ctx.globalAlpha=1}}
      const hs=drag&&drag.it===can?1.08:hv(can,hC(can.x,can.y,110));ctx.save();ctx.translate(can.x,can.y);ctx.scale(-hs,hs);ctx.rotate(drag&&drag.it===can?.45:0);pic('regadera',0,0,240);ctx.restore()},
    // Toque: coge la regadera; si se toca una maceta, recuerda que hay que
    // coger primero la regadera.
    down(x,y){if(dist(x,y,can.x,can.y)<130){drag={it:can,dx:x-can.x,dy:y-can.y};setCursor('grab');SFX.pop();return}
      const p=pots.find(p=>dist(x,y,p.x,p.y-40)<110);if(p&&p.st<3){say('Primero agarrá la regadera.');return}SFX.tap()},
    // Mueve la regadera arrastrada.
    move(x,y){if(drag&&drag.it===can){can.x=clamp(x-drag.dx,100,1500);can.y=clamp(y-drag.dy,120,800)}},
    // Suelta la regadera.
    up(){if(drag&&drag.it===can){drag=null;setCursor('pt')}}
  };
}

/* ---------- pintar con el color correcto ---------- */
// Colores del juego: clave → {c: color en hexadecimal, n: nombre (texto o
// lista ['rioplatense','España'])}. Lo usan Pinta, el tema de los colores...
const COLORES={rojo:{c:'#FF5A5A',n:'rojo'},azul:{c:'#5B8DEF',n:'azul'},amarillo:{c:'#FFD66B',n:'amarillo'},verde:{c:'#7CC86E',n:'verde'},naranja:{c:'#FFA94D',n:'naranja'},rosa:{c:'#F58BB4',n:'rosa'},violeta:{c:'#9B8AD9',n:['violeta','morado']},marron:{c:'#A86B43',n:'marrón'}};
// Dibuja un bote de pintura del color c en (x,y), tamaño s; sel = elegido (brilla).
function paintPot(x,y,s,c,sel){ctx.save();ctx.translate(x,y);if(sel){ctx.shadowColor=c;ctx.shadowBlur=30}card(-s*.38,-s*.2,s*.76,s*.62,'#fff',6,18);ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(0,-s*.2,s*.38,s*.14,0,0,PI*2);fillStroke(c,6);ctx.beginPath();ctx.moveTo(-s*.2,-s*.15);ctx.quadraticCurveTo(-s*.18,s*.12,-s*.1,s*.05);ctx.quadraticCurveTo(-s*.05,-s*.1,0,-s*.15);ctx.fillStyle=c;ctx.fill();ctx.restore()}
// Nombre del color c concordado con la cosa k: 'rojo'→'roja' si k es femenina,
// y en plural si k lo es ('rojas', 'marrones').
function colorAdj(c,k){let w=V(COLORES[c].n);const f=fem(k),p=isPl(k);if(/o$/.test(w)&&f)w=w.slice(0,-1)+'a';if(p)w=/[aeiou]$/.test(w)?w+'s':w.replace('ó','o')+'es';return w}
// COMPONENTE Pinta: dibujos en gris que hay que pintar de su color: primero se
// toca el bote del color y después el dibujo. cfg.items: [[clave, color]]
// (color = clave de COLORES); rounds (2), bg. Por ronda salen 3 o 4 dibujos
// (per). Una estrella por dibujo pintado.
function Pinta(cfg,onDone){
  const R=cfg.rounds||2,per=AGE()<=3?3:4;
  const usedCols=[...new Set(cfg.items.map(i=>i[1]))];
  return {total:R*per,done:0,i:0,brush:null,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: elige `per` dibujos y prepara la paleta: los colores necesarios más
    // otros del juego hasta 3-5 botes (se asegura de que estén todos los necesarios).
    load(){const its=shuffle(cfg.items).filter((v,i,a)=>a.findIndex(q=>q[1]===v[1])===i||true).slice(0,per);
      this.objs=its.map(([k,c],j)=>({k,c,x:900-(its.length-1)*165+j*330,y:380,s:280,done:0}));this.oi=0;
      const pal=shuffle([...new Set([...this.objs.map(o=>o.c),...shuffle(usedCols)])]).slice(0,Math.max(3,Math.min(5,nOpts()+2)));
      this.objs.forEach(o=>{if(!pal.includes(o.c))pal[ri(0,pal.length-1)]=o.c});
      this.pal=[...new Set(pal)].map((c,j,a)=>({c,x:900-(a.length-1)*110+j*220,y:770}));this.brush=null;this.step=0;this.errs=0;
      later(300,()=>this.ask())},
    // Dibujo que toca pintar ahora (el primero sin pintar).
    cur(){return this.objs.find(o=>!o.done)},
    // Pide el dibujo actual: a los 3 años o la primera vez dice el color; si no,
    // pregunta de qué color es.
    ask(){const o=this.cur();if(!o)return;if(AGE()<=3||REP===0)say('Vamos a pintar '+nameT(o.k)+' de '+V(COLORES[o.c].n)+'. Tocá el '+V(COLORES[o.c].n)+'.');else say('¿De qué color es '+nameT(o.k)+'? Tocá ese color y después '+nameT(o.k)+'.')},
    // Repite: si no tiene el color bueno, "toca el ..."; si lo tiene, "toca el dibujo".
    prompt(){const o=this.cur();if(!o)return;if(!this.brush||this.brush!==o.c)say('Tocá el '+V(COLORES[o.c].n)+'.');else say('Ahora tocá '+nameT(o.k)+' para pintarla.'.replace('pintarla',fem(o.k)?'pintarla':'pintarlo'))},
    // Ayuda: el bote correcto o, con el color ya cogido, el dibujo.
    hint(){const o=this.cur();if(!o)return null;if(this.brush!==o.c){const p=this.pal.find(p=>p.c===o.c);return{x:p.x,y:p.y,r:90}}return{x:o.x,y:o.y,r:150}},
    // Dibuja los dibujos (en gris o ya pintados; el actual con marco que parpadea),
    // los botes (el elegido levantado) y una gota del color junto al ratón.
    draw(){cfg.bg();
      for(const o of this.objs){const hs=o.done?1+.06*Math.max(0,1-(T-o.done)*2):hv(o,hR(o.x,o.y,o.s,o.s));ctx.save();ctx.translate(o.x,o.y);ctx.scale(hs,hs);card(-o.s/2-10,-o.s/2-10,o.s+20,o.s+20,'#fff',6,36);
        if(o.done)pic(o.k,0,0,o.s);else picG(o.k,0,0,o.s);ctx.restore();if(o===this.cur()&&!this.busy){ctx.globalAlpha=.4+.3*Math.sin(T*4);rr(o.x-o.s/2-18,o.y-o.s/2-18,o.s+36,o.s+36,40);fillStroke(null,6,'#FFC93C');ctx.globalAlpha=1}}
      for(const p of this.pal){const hs=hv(p,hC(p.x,p.y,90));ctx.save();ctx.translate(p.x,p.y-(this.brush===p.c?16:0));ctx.scale(hs,hs);paintPot(0,0,180,COLORES[p.c].c,this.brush===p.c);ctx.restore()}
      if(this.brush&&mouseOn){ctx.save();ctx.translate(MX+26,MY+30);ctx.beginPath();ctx.moveTo(0,-18);ctx.quadraticCurveTo(14,0,0,12);ctx.quadraticCurveTo(-14,0,0,-18);fillStroke(COLORES[this.brush].c,3);ctx.restore()}},
    // Toque: en un bote, coge ese color. En un dibujo: si no hay color o no es el
    // dibujo actual, avisa; si el color es el bueno lo pinta (estrella); si no, fallo.
    down(x,y){if(this.busy)return;const p=this.pal.find(p=>dist(x,y,p.x,p.y)<95);
      if(p){this.brush=p.c;SFX.drip();say(cap(V(COLORES[p.c].n))+'.');const o=this.cur();if(o&&p.c===o.c)later(700,()=>{if(this.brush===o.c&&this.cur()===o)say('Ahora tocá '+nameT(o.k)+'.')});return}
      const o=this.objs.find(o=>!o.done&&Math.abs(x-o.x)<o.s/2+10&&Math.abs(y-o.y)<o.s/2+10);if(!o){SFX.tap();return}
      if(!this.brush){say('Primero tocá un color.');return}
      const t=this.cur();
      if(o!==t){say('Primero pintamos '+nameT(t.k)+'.');return}
      if(this.brush===o.c){o.done=T;SFX.splash();burst(o.x,o.y,30,[COLORES[o.c].c,'#fff']);rec('colores',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;this.errs=0;this.busy=true;
        say(praise()+' '+cap(nameT(o.k))+(isPl(o.k)?' son ':' es ')+colorAdj(o.c,o.k)+'.',()=>later(300,()=>{this.busy=false;if(!this.cur()){this.i++;if(this.i>=R)onDone();else this.load()}else this.ask()}))}
      else{SFX.bad();this.errs++;rec('colores',false);say('Mmm, '+nameT(o.k)+' no es '+V(COLORES[this.brush].n)+'. Tocá el '+V(COLORES[o.c].n)+'.');if(this.errs>=2){onWrongTwice();idle=7}}}
  };
}
