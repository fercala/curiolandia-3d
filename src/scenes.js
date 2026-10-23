/* =====================================================================
 * scenes.js: LAS ESCENAS 2D DEL JUEGO (versión 1) Y LA ASAMBLEA
 * ---------------------------------------------------------------------
 * Para qué sirve:
 *   Define el objeto global SCENES con las pantallas por las que pasa el
 *   niño: portada (title), edad, ¿quién juega? (quien), cuento de
 *   introducción (intro), mapa del pueblo (map), jardín (jardin), casita
 *   de un tema (casita), juego (juego), asamblea, álbum y "a dormir".
 *   Además junta todos los temas en TEMAS / TEMA y da las funciones de
 *   progreso tst() y gDone().
 *
 * Qué es una escena:
 *   Un objeto SCENES.nombre = { music, enter, update, draw, down, move,
 *   up, hint, prompt, dwell, ... }. Todos los métodos son opcionales salvo
 *   draw. Quien los llama (core.js y adult.js):
 *     - go(nombre, o)  (core.js) cambia de escena: borra temporizadores
 *       later(), partículas y la voz, pone la música scene.music y llama a
 *       scene.enter(o). "o" lleva los datos del viaje ({t, g, hello, fin...}).
 *     - El bucle de adult.js llama cada cuadro a scene.update(dt) y
 *       scene.draw(), y a scene.dwell(id) cuando el ratón se queda quieto
 *       ~1 s sobre una zona registrada con hv(id, ...).
 *     - Los punteros llaman a scene.down/move/up(x, y) en coordenadas
 *       lógicas de 1600x900.
 *     - drawHelp() (core.js) pide scene.hint() -> {x, y, r} para el brillo
 *       y la manita de ayuda cuando el niño no toca nada, y entonces llama
 *       una vez a scene.prompt() para repetir la consigna en voz alta.
 *
 * OJO: zonas.js (que va DESPUÉS en el script) reescribe varias cosas de
 * este archivo: SCENES.map (enter, prompt, hint, dwell, draw, down),
 * SCENES.casita (enter, prompt, hint, draw, down), SCENES.jardin (la
 * sustituye entera por zoneScene('jardin')), suggestTema y stationPos.
 * Y world3d.js vuelve a envolver map, casita, cofre, title y las zonas
 * para la capa 3D. Lo que hay aquí de esas escenas es la base 2D.
 *
 * Globales que define y usan otros archivos:
 *   SCENES, TEMAS, TEMA, tst, gDone, drawLogo, drawLogoSmall, pill, inR,
 *   deferredInstall, standalone, MZ, asamHoy, suggestTema, tree,
 *   drawCasita, GNAME, gIcon, stationPos, drawStation, finishGame,
 *   EMO/EMO_AGE/EMO_SAY/EMO_TIP, drawFace, WX/WX_AGE/WX_ROPA,
 *   SEASON_NEXT, dayIdx, ALBUM_KEYS.
 * Depende de:
 *   core.js (S, save, go, later, say, SFX, T, ctx, text, card, circ, hv,
 *   hR, hC, burst, sparkles, giveSticker, AGE, today, rec, kid, praise,
 *   pick, rnd, idle...), lex.js (tx, V), temas*.js (T3/T4/T5, C3/C4/C5),
 *   extras.js (CAN, RUT, TRZ, FIESTAS, playTune...), ingles.js (ING),
 *   comps*.js (makeGame), pics-*.js (pic, PICS), tienda.js / adult.js
 *   (drawTito, TITO, inTito, drawHome/atHome en core).
 * Partes de S que toca: S.age, S.name, S.first (askedName, jardin, wk),
 *   S.intro, S.seenFl, S.last, S.temas[id] ({g:{índice: veces}, done}),
 *   S.stk (figuritas), S.asam[fecha] (asamblea del día), S.stats (rec).
 * ===================================================================== */
/* ================= ESCENAS ================= */
// SCENES: todas las escenas del juego, por nombre. go('nombre', o) cambia a SCENES.nombre.
// Cada escena: {music: clave de música o null, enter(o), update(dt), draw(), down(x,y), move(x,y), up(x,y),
// hint() -> {x,y,r} o null, prompt() (repite la consigna), dwell(id) (dice el nombre de lo que hay bajo el ratón)}.
const SCENES={};
// Cada tema guarda en t.zone a qué zona del mapa pertenece (3 años -> jardín, 4 -> bosque, 5 -> montaña).
// Los temas de extras.js, fiestas e inglés ya traen su propia zone ('extras', 'fiestas', 'ingles').
[...T3,C3].forEach(t=>t.zone='jardin');[...T4,C4].forEach(t=>t.zone='bosque');[...T5,C5].forEach(t=>t.zone='montana');
// TEMAS: lista de todos los temas en orden. TEMA: el mismo tema buscado por su id (TEMA['3A-T1']).
// Formato de un tema (ver temas.js): {id, n: nombre, icon: dibujo, c: color, zone, games: [{t: tipo de juego, ...}],
// words?, concepts? (true en el Rincón de los Conceptos), bg(): dibuja el fondo de su casita, intro?, season?}.
const TEMAS=[...T3,C3,...T4,C4,...T5,C5,CAN,RUT,TRZ,...FIESTAS,...ING], TEMA={};TEMAS.forEach(t=>TEMA[t.id]=t);
// tst(id): progreso guardado del tema con ese id, o uno vacío si aún no se ha jugado.
// Formato: S.temas[id] = {g: {índiceJuego: veces que se ha terminado}, done: 1 si ya se terminaron todos}. No escribe en S.
const tst=id=>S.temas[id]||{g:{},done:0};
// gDone(t): cuántos juegos distintos del tema t se han terminado al menos una vez.
const gDone=t=>t.games.filter((g,j)=>tst(t.id).g[j]).length;
// LOGO: el texto del logotipo; LOGOC: un color por letra.
const LOGO='Curiolandia', LOGOC=['#FF8A7A','#FFA94D','#FFC93C','#7CC86E','#3FC1B0','#7FD3F0','#5B8DEF','#9B8AD9','#F58BB4','#FF8A7A','#FFA94D'];
// drawLogo(x, y, s): dibuja el logotipo grande de la portada centrado en (x, y), con letras de tamaño s
// que suben, bajan y se balancean con el tiempo T. Solo dibuja.
function drawLogo(x,y,s){
  ctx.font=`700 ${s}px ${DF}`; const ws=[...LOGO].map(c=>ctx.measureText(c).width), tw=ws.reduce((a,b)=>a+b,0);
  let cx=x-tw/2; [...LOGO].forEach((c,i)=>{const yy=y+Math.sin(T*3+i*.7)*s*.05; ctx.save();ctx.translate(cx+ws[i]/2,yy);ctx.rotate(Math.sin(T*2+i)*.05);
    text(c,0,0,s,LOGOC[i],{st:s*.08});ctx.restore();cx+=ws[i]});
}
// pill(x, y, w, h, t, f, c, sz): botón redondeado ("píldora") centrado en (x, y) de w x h con el texto t.
// f = color de fondo, c = color del texto, sz = tamaño de letra. Crece un poco al pasar el ratón (hv). Solo dibuja;
// el toque se comprueba aparte en down().
function pill(x,y,w,h,t,f='#fff',c=K,sz=32){const s=hv('pill'+x+y,hR(x,y,w,h));ctx.save();ctx.translate(x,y);ctx.scale(s,s);card(-w/2,-h/2,w,h,f,5,h/2);text(t,0,sz*.36,sz,c,{w:600});ctx.restore()}
// inR(x, y, cx, cy, w, h): true si el punto (x, y) cae dentro del rectángulo de w x h centrado en (cx, cy).
const inR=(x,y,cx,cy,w,h)=>Math.abs(x-cx)<w/2&&Math.abs(y-cy)<h/2;
// deferredInstall: el aviso del navegador para instalar el juego como app (PWA). Se guarda al llegar el
// evento 'beforeinstallprompt' para enseñarlo luego desde el botón "Instalar el juego" de la portada o la zona de adultos.
let deferredInstall=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});
// standalone(): true si el juego ya se está ejecutando instalado (pantalla completa o app), y entonces no se muestran los botones de instalar ni de pantalla completa.
const standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone;

/* ---------- PORTADA ---------- */
// PORTADA. Primera escena. Desde aquí se va a 'edad' (si aún no hay edad), 'intro' (si no se ha visto el cuento)
// o al mapa. También tiene los botones de pantalla completa, instalar, "¿Quién juega?" y "Empezar de nuevo".
// (world3d.js la envuelve para dibujar la portada en 3D.)
SCENES.title={music:null,
// enter(): crea 14 signos de interrogación de colores (this.q) que flotan hacia arriba por el fondo.
  enter(){this.q=Array.from({length:14},(_,i)=>({x:rnd(100,1500),y:rnd(120,820),v:rnd(10,30),ph:rnd(0,6),c:LOGOC[i%LOGOC.length]}))},
// update(dt): sube los interrogantes; el que sale por arriba vuelve a aparecer por abajo.
  update(dt){for(const f of this.q){f.y-=f.v*dt;if(f.y<-80)f.y=980}},
// draw(): fondo, interrogantes, logotipo, subtítulo, Tito, el botón verde de jugar (que late) y, si ya hay
// partida (S.age), los botones "Juega: nombre" y "Empezar de nuevo". Arriba, pantalla completa e instalar si se puede.
  draw(){
    sky('#FFF6E6','#FCE3C0');
    for(const f of this.q){ctx.globalAlpha=.3;text('?',f.x+Math.sin(T+f.ph)*20,f.y,90,f.c);ctx.globalAlpha=1}
    drawLogo(800,230,150);
    text(V(['Tito y las preguntas escondidas','Tito y las preguntas escondidas']),800,310,46,K,{w:600});
    drawTito(470,420,380,{bubble:false});
    const p=hv('play',hC(1080,560,120))*(1+Math.sin(T*4)*.05); ctx.save();ctx.translate(1080,560);ctx.scale(p,p);circ(0,0,110,'#7CC86E',8);ctx.beginPath();ctx.moveTo(-30,-48);ctx.lineTo(54,0);ctx.lineTo(-30,48);ctx.closePath();fillStroke('#fff',6);ctx.restore();
    if(S.age){pill(205,830,330,80,S.name?'Juega: '+S.name:'¿Quién juega?');pill(1395,830,330,80,'Empezar de nuevo','#fff','#C0473C')}
    if(document.fullscreenEnabled&&!standalone()){const s=hv('fs',hR(1515,85,90,90));ctx.save();ctx.translate(1515,85);ctx.scale(s,s);card(-45,-45,90,90,'#fff',6,28);ctx.lineWidth=7;ctx.strokeStyle=K;ctx.lineCap='round';ctx.beginPath();for(const[a,b,c,d]of[[-25,-10,-25,-25],[-25,-25,-10,-25],[25,-25,10,-25],[25,-25,25,-10],[-25,10,-25,25],[-25,25,-10,25],[25,25,10,25],[25,25,25,10]]){ctx.moveTo(a,b);ctx.lineTo(c,d)}ctx.stroke();ctx.restore()}
    if(deferredInstall&&!standalone())pill(185,85,300,74,'Instalar el juego','#FFE08A',K,30);
  },
// down(x, y): el primer toque desbloquea el audio (initAudio). Según dónde toque: pantalla completa, instalar,
// cambiar nombre (openNameDlg), empezar de nuevo (openResetDlg) o, en cualquier otro sitio, empezar a jugar.
  down(x,y){
    initAudio();
    if(inR(x,y,1515,85,100,100)&&document.fullscreenEnabled&&!standalone()){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}return}
    if(deferredInstall&&!standalone()&&inR(x,y,185,85,300,80)){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null});return}
    if(S.age&&y>780&&x<380){SFX.tap();openNameDlg(()=>{});return}
    if(S.age&&y>780&&x>1220){SFX.tap();openResetDlg();return}
    SFX.pop(); pickVoice();
// Orden de la primera vez: edad -> (¿quién juega?) -> cuento de intro -> mapa.
    if(!S.age)go('edad'); else if(!S.intro)go('intro'); else go('map',{hello:true});
  }
};

/* ---------- EDAD ---------- */
// EDAD. Un adulto elige 3, 4 o 5 años (globos). Guarda S.age y pasa a 'quien' (si no hay nombre ni se ha
// saltado antes) o a 'intro'/mapa. La edad decide qué zona se abre sola y qué pasos tiene la asamblea.
SCENES.edad={music:'title',
// enter(): Tito pide que un adulto toque la edad.
  enter(){say('¡Hola! Para empezar, un grande tiene que tocar la edad de quien va a jugar.')},
// draw(): título y tres globos (3, 4, 5 años) que se mecen; cada globo crece al pasar el ratón.
  draw(){
    sky('#FFF6E6','#FCE3C0');
    text('¿Cuántos años tiene quien va a jugar?',800,170,56,K,{w:600});
    text(tx('(Lo elige un adulto. Se puede cambiar después.)'),800,230,30,'#7A6252',{w:500});
    [3,4,5].forEach((n,i)=>{const x=480+i*320,y=520,b=Math.sin(T*2+i)*8,s=hv('age'+n,hC(x,y,140));
      ctx.beginPath();ctx.moveTo(x,y+130+b);ctx.quadraticCurveTo(x+20,y+200,x-10,y+260);ctx.lineWidth=4;ctx.strokeStyle=K;ctx.stroke();
      ctx.save();ctx.translate(x,y+b);ctx.scale(s,s);ell(0,0,120,140,['#FF8A7A','#7CC86E','#5B8DEF'][i],7);text(String(n),0,30,140,'#fff',{f:LF,st:10});text('años',0,84,36,'#fff',{w:600});ctx.restore()});
  },
// down(x, y): si toca un globo, guarda S.age, reinicia la dificultad adaptativa (ADAPT=0) y sigue con
// 'quien' o con 'intro'/'map'.
  down(x,y){[3,4,5].forEach((n,i)=>{if(dist(x,y,480+i*320,520)<150){S.age=n;ADAPT=0;save();SFX.good();if(!S.name&&!S.first.askedName)go('quien');else go(S.intro?'map':'intro',{hello:true})}})}
};
/* ---------- ¿QUIÉN JUEGA? ---------- */
// ¿QUIÉN JUEGA? Pide el nombre del niño (lo escribe un adulto en el diálogo openNameDlg). Se puede saltar.
SCENES.quien={music:'title',
// enter(): Tito se presenta y pide el nombre.
  enter(){later(300,()=>sayQ('¡Hola! Yo soy Tito. ¿Cómo te llamás? Pedile a un grande que escriba tu nombre.'))},
// prompt(): repite la consigna (la llama drawHelp cuando el niño no hace nada).
  prompt(){say('Pedile a un grande que escriba tu nombre.')},
// hint(): la ayuda señala el botón "Escribir el nombre".
  hint(){return{x:800,y:640,r:150}},
// done(v): se llama al cerrar el diálogo del nombre (v = nombre escrito, o '' si se salta). Si hay nombre,
// lo celebra diciéndolo; después va a 'intro' o al mapa.
  done(v){if(v){SFX.tada();burst(800,400,50);say(`¡Hola, ${v}! ¡Qué lindo nombre!`,()=>later(400,()=>go(S.intro?'map':'intro',{hello:true})))}else go(S.intro?'map':'intro',{hello:true})},
// down(x, y): botón "Escribir el nombre" -> abre el diálogo; "Saltar" -> marca S.first.askedName para no
// volver a preguntar y sigue; en otro sitio, solo chispas.
  down(x,y){
    if(Math.abs(x-800)<230&&Math.abs(y-640)<75){SFX.pop();openNameDlg(v=>this.done(v));return}
    if(Math.abs(x-800)<140&&Math.abs(y-790)<40){SFX.tap();S.first.askedName=1;save();this.done('');return}
    SFX.tap();sparkles(x,y,3)},
// draw(): título, Tito, botón verde para escribir el nombre y "Saltar".
  draw(){sky('#FFF6E6','#FCE3C0');text(tx('¿Cómo te llamás?'),800,170,72,K,{w:600});
    drawTito(640,250,320,{bubble:false});
    pill(800,640,460,150,'Escribir el nombre','#7CC86E','#fff',48);
    text('Saltar',800,800,34,'#7A6252')}
};

/* ---------- INTRO (cuento) ---------- */
// INTRO: el cuento del principio, en 4 frases (this.ph = frase actual). Al acabar, o al tocar el botón de saltar,
// marca S.intro = true para no repetirlo y va al mapa.
SCENES.intro={music:'title',
// enter(): empieza por la primera frase. this.qs = interrogantes que salen volando de la mochila.
  enter(){this.ph=0;this.t=0;this.qs=[];this.next()},
// next(): dice la frase this.ph y, cuando termina de hablar (callback de say) y pasan 0,7 s, pasa a la siguiente.
// En la frase 1 lanza los 16 interrogantes. Cuando ya no quedan frases guarda S.intro y va al mapa.
  next(){
    // la presentación cambia con el personaje de Tito (zona de adultos); la del caracol es la de siempre
    const lines=[({erizo:'¡Hola! Yo soy Tito, el erizo curioso. En mi mochila guardo un montón de preguntas.',tortuga:'¡Hola! Yo soy Tito, la tortuga curiosa. En mi mochila guardo un montón de preguntas.',conejo:'¡Hola! Yo soy Tito, el conejo curioso. En mi mochila guardo un montón de preguntas.'})[titoKind()]||'¡Hola! Yo soy Tito, el caracol curioso. En mi mochila guardo un montón de preguntas.','Pero hoy la mochila se abrió... ¡y las preguntas se escaparon por todo el pueblo!','¿Qué día es hoy? ¿De qué color es el cielo? ¿Qué come la vaca?','¿Me ayudás a encontrar las respuestas'+kid()+'? ¡Vamos a Curiolandia!'];
    if(this.ph>=lines.length){S.intro=true;save();go('map',{hello:true});return}
    this.t=0; if(this.ph===1){SFX.whoosh();for(let i=0;i<16;i++)this.qs.push({a:rnd(-2.6,-.4),v:rnd(200,520),c:pick(LOGOC),r:rnd(-1,1),t0:T+i*.06})}
    say(lines[this.ph],()=>later(700,()=>{this.ph++;this.next()}));
  },
// update(dt): cuenta el tiempo de la frase actual (para que Tito tiemble en la frase 1).
  update(dt){this.t+=dt},
// draw(): prado, nubes y flores, Tito, los interrogantes que vuelan en abanico desde la mochila (cada uno sale
// t0 segundos después y frena con easeOut), los dibujos sol/vaca/nube en la frase 2 y el botón de saltar.
  draw(){
    sky('#BFEAF7','#FFF6E6');ctx.fillStyle='#9FDC8F';ctx.beginPath();ctx.ellipse(800,980,1100,260,0,0,PI*2);ctx.fill();
    cloud(200,160,1);cloud(1200,120,1.2);
    for(const [x,c] of [[300,'#FF6B5E'],[1300,'#F58BB4'],[1450,'#FFC93C'],[150,'#9B8AD9']]){ctx.fillStyle='#7CC86E';ctx.fillRect(x-4,760,8,40);circ(x,750,22,c,4)}
    drawTito(560,390,440,{sq:this.ph===1?Math.sin(this.t*20)*.03:0});
    for(const q of this.qs){const k=Math.max(0,T-q.t0);if(k<=0)continue;const d=Math.min(1,k/1.6);const x=720+Math.cos(q.a)*q.v*easeOut(d)*1.6,y=560+Math.sin(q.a)*q.v*easeOut(d)+Math.sin(T*3+q.r*5)*10;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(T*2+q.r)*.3);text('?',0,0,90,q.c,{st:7});ctx.restore()}
    if(this.ph===2){[['sol',1180,300],['vaca',1380,420],['nube',1180,520]].forEach(([k,x,y],i)=>pic(k,x,y+Math.sin(T*2+i)*8,150))}
    const s=hv('skip',hR(1500,820,120,100));ctx.save();ctx.translate(1500,820);ctx.scale(s,s);card(-60,-50,120,100,'#fff',6,34);ctx.beginPath();ctx.moveTo(-22,-25);ctx.lineTo(20,0);ctx.lineTo(-22,25);ctx.closePath();fillStroke(K,0);ctx.restore();
  },
// down(x, y): el botón de saltar (abajo a la derecha) termina el cuento.
  down(x,y){if(x>1420&&y>750){S.intro=true;save();go('map',{hello:true})}}
};

/* ---------- MAPA DEL PUEBLO ---------- */
// MZ: zonas del mapa ANTIGUO (v1) de scenes.js. Formato: {id, x, y, r: radio tocable, name: nombre para la voz}.
// OJO: zonas.js sustituye el dibujo y los toques del mapa y usa MZ2 en su lugar; MZ ya solo lo usa el código viejo.
const MZ=[
  {id:'plaza',x:800,y:470,r:150,name:'la plaza de la asamblea'},
  {id:'jardin',x:390,y:560,r:150,name:'el Jardín de los 3 años'},
  {id:'bosque',x:1170,y:280,r:140,name:'el Bosque de los 4 años'},
  {id:'montana',x:1310,y:620,r:150,name:'la Montaña de los 5 años'},
  {id:'album',x:1480,y:110,r:80,name:'el álbum'}
];
// asamHoy(): true si hoy ya se ha hecho la asamblea (S.asam[fecha de hoy].done).
const asamHoy=()=>S.asam[today()]&&S.asam[today()].done;
// suggestTema(): tema de 3 años recomendado (versión antigua): primero el de la estación actual, luego uno
// según el mes del curso escolar (L: mes -> números de tema de T3) y si no, el primero sin terminar. Devuelve el tema o null.
// OJO: zonas.js la sustituye por suggestTema=function(z){return curTema(...)}, que sigue el camino en orden.
function suggestTema(){
  const sea=estacionDe(),st=T3.find(t=>t.season===sea);if(st&&!tst(st.id).done)return st;
  const m=new Date().getMonth(),L={8:[1],9:[4,2,3,5],10:[5,2,3,6],11:[6,7],0:[6,7],1:[7,8,9],2:[9,8,10],3:[10,9],4:[11,10],5:[12,11],6:[12],7:[12]}[m]||[1];
  for(const n of L){const t=T3[n-1];if(t&&!tst(t.id).done)return t}
  return T3.find(t=>!tst(t.id).done)||null;
}
// tree(x, y, s, season): dibuja un árbol en (x, y) a escala s según la estación: 'invierno' (ramas con nieve),
// 'primavera' (flores), 'verano' (frutas), 'otoño' (hojas caídas) o 'gris' (zona dormida). Lo usan el mapa, las zonas
// y la asamblea (pregunta de las estaciones).
function tree(x,y,s,season){ctx.save();ctx.translate(x,y);ctx.scale(s,s);card(-12,-10,24,90,'#A86B43',6,6);
  if(season==='invierno'){ctx.lineWidth=8;ctx.strokeStyle='#A86B43';ctx.lineCap='round';for(const [a,b,c,d] of[[0,-10,-40,-70],[0,-10,40,-80],[0,-30,0,-100],[-40,-70,-60,-90],[40,-80,60,-96]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke()}for(const [a,b] of[[-40,-74],[40,-84],[0,-104]])ell(a,b,18,8,'#fff',3)}
  else{const c=season==='gris'?'#C9CFC2':season==='otoño'?'#FFA94D':season==='verano'?'#5FA84E':'#8FD67F';circ(0,-80,74,c,6);
    if(season==='primavera')for(let i=0;i<7;i++)flower(Math.cos(i*.9)*44,-80+Math.sin(i*.9)*40,11,'#F58BB4',2);
    if(season==='verano')for(let i=0;i<5;i++)circ(Math.cos(i*1.3)*40,-80+Math.sin(i*1.3)*36,10,'#FF5A5A',3);
    if(season==='otoño')for(let i=0;i<4;i++){ell(-60+i*40,60+Math.sin(i)*6,12,6,i%2?'#FF6B5E':'#C98A4B',2)}}
  ctx.restore()}
// MAPA DEL PUEBLO (versión 1). zonas.js reescribe enter, prompt, hint, dwell, draw y down con Object.assign
// (mapa v3 con MZ2, botón "seguir el camino", casa de Tito...), y world3d.js lo vuelve a envolver para el 3D.
// Lo que queda de aquí: el objeto SCENES.map y su música.
SCENES.map={music:'map',
// enter(o): si hay temas terminados nuevos (flores) lo celebra y actualiza S.seenFl; si no, saluda (o.hello).
// Tras 15 minutos de sesión propone descansar una vez. (Sustituido en zonas.js.)
  enter(o){
    const n=temasDone();
    if(n>S.seenFl){S.seenFl=n;save();later(600,()=>{SFX.sparkle();burst(130,740,40);say(`¡Mirá${kid()}! ¡Tito tiene ${n===1?'una flor':NUM[n]+' flores'} en su caparazón!`)})}
    else if(o.hello)later(400,()=>this.prompt(true));
    if(sessionT>15*60&&!restAsked&&!S.limit){restAsked=true;later(3000,()=>sayQ('Jugamos un montón. ¿Descansamos un ratito? Tito te espera cuando quieras.'))}
  },
// prompt(first): saludo según la hora (si first) y consigna: asamblea si no se ha hecho hoy; si no, el jardín. (Sustituido en zonas.js.)
  prompt(first){const h=new Date().getHours(),sal=h<13?'¡Buen día':h<20?'¡Buenas tardes':'¡Buenas noches';
    if(!asamHoy())say((first?sal+kid()+'! ':'')+'Vamos a la plaza a hacer la asamblea. Tocá la plaza.');
    else say((first?sal+kid()+'! ':'')+'Tocá el jardín para jugar.')},
// hint(): señala la plaza (si falta la asamblea) o el jardín. (Sustituido en zonas.js.)
  hint(){const z=MZ.find(z=>z.id===(asamHoy()?'jardin':'plaza'));return{x:z.x,y:z.y,r:z.r*.8}},
// dwell(id): id = 'mz' + id de zona; dice su nombre. (Sustituido en zonas.js.)
  dwell(id){const z=MZ.find(z=>'mz'+z.id===id);if(z)say(cap(z.name)+(z.id==='bosque'||z.id==='montana'?'. Todavía está dormido.':'.'))},
// draw(): mar, isla, caminos, plaza (brilla si falta la asamblea), jardín, bosque y montaña dormidos y álbum.
// (Sustituido en zonas.js.)
  draw(){
    ctx.fillStyle='#7FD3F0';ctx.fillRect(0,0,W,H);
    for(let i=0;i<14;i++){const x=(i*233)%1600,y=60+(i*137)%800;ctx.beginPath();ctx.moveTo(x+Math.sin(T+i)*10,y);ctx.quadraticCurveTo(x+20,y-14,x+40,y);ctx.quadraticCurveTo(x+60,y+14,x+80,y);ctx.lineWidth=6;ctx.strokeStyle='#B9E9F8';ctx.lineCap='round';ctx.stroke()}
    ctx.beginPath();ctx.moveTo(150,560);ctx.bezierCurveTo(110,330,330,190,560,210);ctx.bezierCurveTo(760,120,1060,140,1250,170);ctx.bezierCurveTo(1460,180,1560,340,1520,520);ctx.bezierCurveTo(1540,740,1340,830,1080,800);ctx.bezierCurveTo(840,860,560,850,380,810);ctx.bezierCurveTo(200,790,160,690,150,560);ctx.closePath();fillStroke('#BFE6A0',8);
    // caminos
    ctx.lineCap='round';for(const [a,b,c,d,e,f] of[[390,560,560,520,800,470],[800,470,980,380,1170,280],[800,470,1030,560,1310,620]]){ctx.beginPath();ctx.moveTo(a,b);ctx.quadraticCurveTo(c,d,e,f);ctx.lineWidth=40;ctx.strokeStyle='#FFF3D6';ctx.stroke();ctx.lineWidth=10;ctx.setLineDash([4,30]);ctx.strokeStyle='#E4CFA0';ctx.stroke();ctx.setLineDash([])}
    // plaza
    const zP=MZ[0],sP=hv('mzplaza',hC(zP.x,zP.y,zP.r));ctx.save();ctx.translate(zP.x,zP.y);ctx.scale(sP,sP);
    if(!asamHoy()){const p=(Math.sin(T*4)+1)/2;ctx.globalAlpha=.4+.3*p;circ(0,0,150+p*10,null,12,'#FFC93C');ctx.globalAlpha=1}
    circ(0,0,130,'#F1E2C8',7);circ(0,0,56,'#7FD3F0',6);circ(0,0,20,'#fff',4);for(let i=0;i<6;i++){const a=T*2+i;circ(Math.cos(a)*30,-10+Math.sin(a)*8-Math.abs(Math.sin(T*4+i))*14,5,'#BFEAF7',0)}
    card(-120,-170,240,90,'#fff',6,16);DIAC.forEach((c,i)=>{circ(-90+i*30,-140,11,c,3)});text('ASAMBLEA',0,-95,30,K,{f:LF});ctx.restore();
    // jardín
    const zJ=MZ[1],sJ=hv('mzjardin',hC(zJ.x,zJ.y,zJ.r));ctx.save();ctx.translate(zJ.x,zJ.y);ctx.scale(sJ,sJ);
    ell(0,10,170,120,'#9FDC8F',7);for(let i=0;i<12;i++){const a=i/12*PI*2;ctx.fillStyle='#C98A4B';ctx.fillRect(Math.cos(a)*160-4,10+Math.sin(a)*110-26,8,30)}
    [[-70,-20],[20,-40],[90,10],[-30,50]].forEach(([a,b],i)=>{card(a-30,b-20,60,46,'#FFF3B0',4,6);ctx.beginPath();ctx.moveTo(a-38,b-20);ctx.lineTo(a,b-52);ctx.lineTo(a+38,b-20);ctx.closePath();fillStroke(FLC[i],4)});
    for(let i=0;i<6;i++)flower(-120+i*48,82+(i%2)*10,9,FLC[i],2);
    card(-60,-150,120,54,'#FF8A7A',5,27);text(tx('3 años'),0,-113,30,'#fff');ctx.restore();
    // bosque (dormido)
    const zB=MZ[2];hv('mzbosque',hC(zB.x,zB.y,zB.r));hv('mzmontana',hC(MZ[3].x,MZ[3].y,MZ[3].r));ctx.save();ctx.globalAlpha=.8;for(const [a,b,s] of[[-80,20,.7],[0,-10,.85],[80,25,.7],[-30,60,.6],[50,70,.6]])tree(zB.x+a,zB.y+b,s,'gris');ctx.restore();
    card(zB.x-60,zB.y-150,120,54,'#B8B0A6',5,27);text(tx('4 años'),zB.x,zB.y-113,30,'#fff');
    // montaña (dormida)
    const zM=MZ[3];ctx.beginPath();ctx.moveTo(zM.x-170,zM.y+90);ctx.lineTo(zM.x-40,zM.y-110);ctx.lineTo(zM.x+20,zM.y-30);ctx.lineTo(zM.x+80,zM.y-120);ctx.lineTo(zM.x+180,zM.y+90);ctx.closePath();fillStroke('#CFC8BF',7);
    ctx.beginPath();ctx.moveTo(zM.x-72,zM.y-62);ctx.lineTo(zM.x-40,zM.y-110);ctx.lineTo(zM.x-10,zM.y-66);ctx.closePath();fillStroke('#fff',5);
    card(zM.x-60,zM.y+100,120,54,'#B8B0A6',5,27);text(tx('5 años'),zM.x,zM.y+137,30,'#fff');
    for(const [x,y] of[[zB.x+110,zB.y-60],[zM.x+120,zM.y-120]]){ctx.globalAlpha=.55+.3*Math.sin(T*2+x);text('z',x,y+Math.sin(T+x)*6,34,'#7A6252');text('z',x+22,y-26+Math.sin(T+x)*6,26,'#7A6252');ctx.globalAlpha=1}
    // álbum
    const zA=MZ[4],sA=hv('mzalbum',hC(zA.x,zA.y,zA.r));ctx.save();ctx.translate(zA.x,zA.y);ctx.scale(sA,sA);ctx.rotate(-.08);card(-60,-50,120,100,'#9B8AD9',6,14);card(-48,-40,96,80,'#FFF6E6',4,10);star(0,0,26,'#FFC93C',4);ctx.restore();
    // título
    card(560,22,480,88,'#fff',6,44);drawLogoSmall(800,86,56);
    drawHome();drawTito(TITO.x,TITO.y,TITO.w);
  },
// down(x, y): casa -> portada; Tito -> consigna; plaza -> asamblea; jardín; álbum; bosque/montaña -> "dormido". (Sustituido en zonas.js.)
  down(x,y){
    if(atHome(x,y)){SFX.tap();go('title');return}
    if(inTito(x,y)){this.prompt(false);return}
    for(const z of MZ)if(dist(x,y,z.x,z.y)<z.r){
      if(z.id==='plaza'){SFX.pop();go('asamblea');return}
      if(z.id==='jardin'){SFX.pop();go('jardin',{hello:true});return}
      if(z.id==='album'){SFX.pop();go('album');return}
      SFX.boing();say(cap(z.name)+' todavía está dormido. ¡Muy pronto lo vamos a despertar! Mientras tanto, jugamos en el jardín.');return}
    SFX.tap();sparkles(x,y);
  }
};
// drawLogoSmall(x, y, s): versión pequeña y más quieta del logotipo (cabecera del mapa). Solo dibuja.
function drawLogoSmall(x,y,s){ctx.font=`700 ${s}px ${DF}`;const ws=[...LOGO].map(c=>ctx.measureText(c).width),tw=ws.reduce((a,b)=>a+b,0);let cx=x-tw/2;[...LOGO].forEach((c,i)=>{text(c,cx+ws[i]/2,y+Math.sin(T*3+i*.7)*2,s,LOGOC[i],{st:s*.08});cx+=ws[i]})}

/* ---------- EL JARDÍN DE LOS 3 AÑOS ---------- */
// JPOS: posición de cada casita en el jardín antiguo: {id de tema: {x, y, band: fila}}. Tres filas (5, 4 y 3 casitas)
// y el Rincón de los Conceptos abajo a la derecha. Solo lo usa la escena 'jardin' de este archivo, que zonas.js sustituye
// (allí las posiciones salen de zonePos/ZPOS).
const JPOS=(()=>{const P={};const rows=[[1,2,3,4,5],[6,7,8,9],[10,11,12]],ys=[250,490,725];
  rows.forEach((r,ri)=>r.forEach((n,j)=>{P['3A-T'+n]={x:ri===0?440+j*256:450+j*280,y:ys[ri],band:ri}}));P['3A-C']={x:1420,y:690,band:3};return P})();
// BANDC: colores de las tres franjas (filas) del jardín antiguo.
const BANDC=['#FFE2B8','#D6EEFA','#DDF3D2'];
// drawCasita(t, x, y, o): dibuja la casita del tema t en (x, y). o.s = escala, o.glow = halo amarillo (la recomendada).
// Las casitas normales llevan tejado del color t.c y el dibujo t.icon; el Rincón de los Conceptos (t.concepts) es un
// cuadro con formas. Debajo, un punto por juego (amarillo = terminado) y, si el tema está terminado, estrella y flores.
// Solo dibuja. La usan las zonas (zonas.js) y world3d.js para las etiquetas.
function drawCasita(t,x,y,o={}){
  const st=tst(t.id),done=st.done,n=gDone(t),s=o.s||1;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  if(o.glow){const p=(Math.sin(T*4)+1)/2;ctx.globalAlpha=.35+.35*p;circ(0,10,128+p*8,null,12,'#FFC93C');ctx.globalAlpha=1}
  if(t.concepts){card(-110,-70,220,150,'#9B8AD9',7,20);card(-96,-56,192,122,'#EDE7FF',5,14);circ(-50,0,30,'#FF8A7A',5);card(-6,-30,56,56,'#5BB8E6',5,6);star(70,-6,30,'#FFC93C',4);ctx.beginPath();ctx.moveTo(-50,50);ctx.lineTo(-20,30);ctx.lineTo(10,50);ctx.closePath();fillStroke('#7CC86E',4)}
  else{card(-88,-40,176,120,'#FFF6E6',7,10);ctx.beginPath();ctx.moveTo(-108,-36);ctx.lineTo(0,-118);ctx.lineTo(108,-36);ctx.closePath();fillStroke(t.c,7);
    card(-62,-26,92,82,'#fff',5,14);pic(t.icon,-16,16,84);card(44,6,34,74,'#C98A4B',5,8)}
  for(let j=0;j<t.games.length;j++)circ(-((t.games.length-1)*13)+j*26,98,9,j<n?'#FFC93C':'#EADFCF',3);
  if(done){star(90,-96,30,'#FFC93C',4);flower(-100,70,14,FLC[1],2.5);flower(100,70,14,FLC[3],2.5)}
  ctx.restore();
}
// EL JARDÍN DE LOS 3 AÑOS (versión 1). OJO: zonas.js hace SCENES.jardin = zoneScene('jardin'), así que este objeto
// ya no se usa (código antiguo). Ver zoneScene en zonas.js.
SCENES.jardin={music:'jardin',
// enter(o): calcula el tema recomendado y saluda (más largo la primera vez, S.first.jardin).
  enter(o){this.sug=suggestTema();
    if(o.hello)later(400,()=>this.prompt(!S.first.jardin));S.first.jardin=1;save()},
// prompt(long): presenta el jardín (si long) y recomienda la casita que brilla.
  prompt(long){const s=this.sug;say((long?'¡Bienvenido al Jardín de los 3 años! Cada casita es un tema. ':'')+(s?'Hoy te recomiendo '+V(s.n).toLowerCase().replace(/^mi /,'mi ')+'. ¡Es la casita que brilla!':'Tocá una casita para jugar.'))},
// hint(): señala la casita recomendada.
  hint(){const s=this.sug;if(!s)return null;const p=JPOS[s.id];return{x:p.x,y:p.y,r:110}},
// dwell(id): id = 'j:' + id de tema; dice el nombre del tema.
  dwell(id){const t=TEMA[id.slice(2)];if(t)say(V(t.n)+'.')},
// draw(): franjas, iconos de estación y todas las casitas en JPOS.
  draw(){
    sky('#E9F7FC','#F4FBEA');
    [250,490,725].forEach((y,i)=>{card(250,y-112,i===0?1330:i===1?1120:840,224,BANDC[i],0,60)});
    card(1300,580,240,230,'#EDE7FF',0,50);
    ['hojaNaranja','copo','flor'].forEach((k,i)=>{const y=[250,490,725][i];circ(292,y,40,'#fff',5);pic(k,292,y,62)});
    for(const t of TEMAS){const p=JPOS[t.id];const s=hv('j:'+t.id,hR(p.x,p.y,220,220));drawCasita(t,p.x,p.y,{s,glow:this.sug===t})}
    drawHome();drawTito(TITO.x,TITO.y,TITO.w);
  },
// down(x, y): casa -> mapa; casita -> go('casita', {t: id del tema, hello: true}).
  down(x,y){
    if(atHome(x,y)){SFX.tap();go('map');return}
    if(inTito(x,y)){this.prompt(true);return}
    for(const t of TEMAS){const p=JPOS[t.id];if(inR(x,y,p.x,p.y,220,230)){SFX.pop();go('casita',{t:t.id,hello:true});return}}
    SFX.tap();sparkles(x,y);
  }
};

/* ---------- CASITA DE UN TEMA ---------- */
// GNAME: nombre que dice Tito para cada tipo de juego (g.t), cuando el juego no trae su propio g.name.
// zonas.js añade más tipos con Object.assign(GNAME, {...}).
const GNAME={conocer:'Conocer',busca:'¿Dónde está?',memoria:'Memoria',sonido:'¿Quién hace este sonido?',cuerpo:'Mi cuerpo',toca:'Tocá la parte del cuerpo',puzzle:'Rompecabezas',pinta:'Pintar',clasifica:'Las canastas',
  burbujas:'Burbujas de colores',cae:'¡Atrapalas!',viste:'Vestir al nene',ordena:'Ordenar',mifamilia:'Armá tu familia',arma:'Hacer un muñeco de nieve',macedonia:'Ensalada de frutas',cuenta:'Contar',corral:'Dentro y fuera del corral',
  guarda:'Dentro y fuera',riega:'Regar las flores',excava:'Cavar en la arena'};
// gIcon(g, t): dibujo de la estación del juego g del tema t: g.icon si lo trae; si no 'lupa' (conocer), 'busca',
// 'memo' (memoria) o el icono del tema.
const gIcon=(g,t)=>g.icon||(g.t==='conocer'?'lupa':g.t==='busca'?'busca':g.t==='memoria'?'memo':t.icon);
// stationPos(t, j): posición [x, y] en pantalla de la estación (círculo) del juego j dentro de la casita del tema t.
// Hasta 4 juegos van en una fila; si hay más, en dos filas de 3. OJO: zonas.js la reescribe (camino en zigzag y hasta
// 8 juegos) y world3d.js la vuelve a envolver con las posiciones proyectadas del 3D.
function stationPos(t,j){const n=t.games.length;if(n<=4){return[860-(n-1)*180+j*360,560]}const r=Math.floor(j/3),c=j%3;return[540+c*360,r?700:420]}
// drawStation(t, j, x, y, o): dibuja la estación del juego j del tema t en (x, y): círculo blanco (amarillo si es el
// primero y no está hecho), el dibujo del juego (lupa, búsqueda, cartas de memoria o el icono) y, si está terminado,
// una estrella con "×N" veces. o.s = escala. Solo dibuja.
function drawStation(t,j,x,y,o={}){
  const g=t.games[j],done=tst(t.id).g[j],ic=gIcon(g,t),s=o.s||1;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ell(0,130,120,24,'rgba(74,52,40,.15)',0);
  circ(0,0,128,j===0&&!done?'#FFF3B0':'#fff',8);
  if(ic==='lupa'){circ(-14,-14,52,'#DDF3FB',9);ctx.beginPath();ctx.moveTo(24,24);ctx.lineTo(62,62);ctx.lineWidth=20;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();pic(t.words&&t.words[0]&&t.words[0].k||t.icon,-14,-14,74)}
  else if(ic==='busca'){const k=t.words&&t.words[1]&&t.words[1].k||t.icon;pic(k,0,0,150);text('?',70,-50,70,'#5B8DEF',{st:6})}
  else if(ic==='memo'){ctx.save();ctx.rotate(-.15);card(-78,-58,80,104,'#FFA94D',6,14);ctx.restore();ctx.save();ctx.rotate(.12);card(-6,-56,84,108,'#fff',6,14);pic(t.icon,36,-2,70);ctx.restore()}
  else pic(ic,0,0,170);
  if(done){star(92,-92,32,'#FFC93C',4);if(done>1){text('×'+done,92,-40,26,K)}}
  ctx.restore();
}
// CASITA DE UN TEMA: las estaciones de sus juegos. Se entra con go('casita', {t: id del tema, hello?, fin?}).
// OJO: zonas.js reescribe enter, prompt, hint, draw y down (juegos en camino con candados, y si o.fin va al cofre);
// de aquí sigue valiendo dwell. Luego world3d.js y repaso.js la vuelven a envolver.
SCENES.casita={music:'casita',
// enter(o): guarda en S.last el último tema visitado. Si viene de terminar el tema (o.fin) lo celebra con figurita;
// si no, saluda. (Sustituido en zonas.js.)
  enter(o){this.t=TEMA[o.t];S.last=o.t;save();
    if(o.fin){later(400,()=>{SFX.tada();burst(800,300,90);const fl=temasDone();giveSticker(this.t.icon);say(('¡Terminaste todos los juegos de '+(this.t.concepts?'el Rincón de los Conceptos':V(this.t.n).replace(/^./,c=>c.toLowerCase()))).replace(/ de el /,' del ')+kid()+'! ¡Le creció una flor a Tito!')})}
    else if(o.hello)later(300,()=>this.prompt(true))},
// prompt(long): dice el nombre del tema (si long) y qué juego tocar. (Sustituido en zonas.js.)
  prompt(long){const t=this.t,nx=t.games.findIndex((g,j)=>!tst(t.id).g[j]);say((long?V(t.n)+'. ':'')+(nx===0?'Empezá por el primero: ¡vamos a conocer!':nx>0?'Tocá un juego. Te falta el que no tiene estrella.':'¡Ya jugaste todos! Podés repetir el que más te guste.'))},
// hint(): señala el primer juego sin terminar. (Sustituido en zonas.js.)
  hint(){const t=this.t,nx=t.games.findIndex((g,j)=>!tst(t.id).g[j]);if(nx<0)return null;const [x,y]=stationPos(t,nx);return{x,y,r:140}},
// dwell(id): id = 'g:' + número de juego; dice el nombre del juego (g.name o GNAME[g.t]).
  dwell(id){const j=+id.slice(2);const g=this.t.games[j];if(g)say(V(g.name||GNAME[g.t]||''))},
// draw(): fondo del tema (t.bg), cartel con su nombre y las estaciones de los juegos. (Sustituido en zonas.js.)
  draw(){const t=this.t;t.bg();
    {ctx.font=`600 54px ${DF}`;const tw=Math.min(900,ctx.measureText(V(t.n)).width);card(170,34,tw+190,112,'#fff',6,56);pic(t.icon,250,90,90);text(V(t.n),310+tw/2,110,54,K,{w:600})}
    t.games.forEach((g,j)=>{const [x,y]=stationPos(t,j);drawStation(t,j,x,y,{s:hv('g:'+j,hC(x,y,130))})});
    drawHome();drawTito(TITO.x,TITO.y,TITO.w);
  },
// down(x, y): casa -> jardín; estación -> go('juego', {t, g: número de juego}). (Sustituido en zonas.js.)
  down(x,y){
    if(atHome(x,y)){SFX.tap();go('jardin');return}
    if(inTito(x,y)){this.prompt(true);return}
    for(let j=0;j<this.t.games.length;j++){const [gx,gy]=stationPos(this.t,j);if(dist(x,y,gx,gy)<140){SFX.pop();go('juego',{t:this.t.id,g:j});return}}
    SFX.tap();sparkles(x,y);
  }
};

/* ---------- JUEGO ---------- */
// finishGame(t, gi): se llama cuando el niño acaba el juego gi del tema t (desde SCENES.juego).
// Efectos en S: suma 1 a S.temas[t.id].g[gi] (veces jugado) y, si con esto ya están todos los juegos, pone done = 1
// (el tema da una flor a Tito). La primera vez que acaba ese juego regala una figurita (S.stk) de una palabra del tema
// que aún no tenga. Celebra, dice una felicitación (cuando Tito acaba la que esté diciendo) y vuelve a go('casita', {t, fin}); fin = true si se acaba de terminar
// el tema (entonces la casita manda al cofre).
function finishGame(t,gi){
  const st=S.temas[t.id]||(S.temas[t.id]={g:{},done:0});const first=!st.g[gi];st.g[gi]=(st.g[gi]||0)+1;
// fin solo es true la PRIMERA vez que se completan todos los juegos del tema.
  let fin=false;if(!st.done&&t.games.every((g,j)=>st.g[j])){st.done=1;fin=true}
  save();SFX.tada();burst(800,380,90);
// Figurita: una palabra del tema con dibujo que aún no esté en el álbum; si no queda ninguna, el icono del juego
// (si es un dibujo real: los nombres cortos como 'lupa'/'memo' no lo son) o el del tema.
  if(first){const pool=(t.words||[]).map(w=>w.k).filter(k=>k&&PICS[k]&&!S.stk[k]);giveSticker(pool.length?pick(pool):(gIcon(t.games[gi],t).length>4&&PICS[gIcon(t.games[gi],t)]?gIcon(t.games[gi],t):t.icon))}
  sayQ(pick(['¡Lo lograste! ¡Ganaste una estrella!','¡Muy bien'+kid()+'! ¡Una estrella más!','¡Bravo! ¡Terminaste el juego!']),()=>later(600,()=>go('casita',{t:t.id,fin})));// espera a que acabe la última felicitación del juego
}
// JUEGO: escena "contenedor". makeGame (comps*.js) crea el juego concreto a partir de su descripción
// (t.games[g], con g.t = tipo) y esta escena le pasa update/draw/down/move/up/hint/prompt. Se entra con
// go('juego', {t: id del tema, g: número de juego}). Cuando el juego llama a su callback de fin, se ejecuta finishGame.
// tienda.js y world3d.js envuelven enter/draw (monedas del juego, recordar el último juego).
SCENES.juego={music:'game',
// enter(o): REP = veces que ya se ha terminado este juego (máx. 2): sube el "Nivel" y la dificultad al repetir.
// Crea el juego con makeGame(desc, tema, alAcabar); this.fin evita terminar dos veces.
  enter(o){this.t=TEMA[o.t];this.gi=o.g;REP=Math.min(2,tst(o.t).g[o.g]||0);this.fin=false;this.g=makeGame(this.t.games[o.g],this.t,()=>{if(this.fin)return;this.fin=true;drag=null;finishGame(this.t,o.g)});this.g.enter&&this.g.enter()},
// update(dt): pasa el tiempo al juego.
  update(dt){this.g.update&&this.g.update(dt)},
// draw(): dibuja el juego, la casa, las estrellas de rondas (g.done de g.total), el cartel "Nivel N" al repetir y Tito.
  draw(){this.g.draw();drawHome();if(this.g.total)drawRounds(Math.min(this.g.done,this.g.total),this.g.total);if(REP>0){card(1400,140,160,56,'#9B8AD9',5,28);text('Nivel '+(REP+1),1480,180,30,'#fff')}drawTito(TITO.x,TITO.y,TITO.w)},
// down(x, y): casa -> vuelve a la casita sin terminar; si ya terminó, solo chispas; Tito -> repite la consigna del juego;
// si no, se lo pasa al juego.
  down(x,y){if(atHome(x,y)){SFX.tap();go('casita',{t:this.t.id});return}if(this.fin){sparkles(x,y,4);return}if(inTito(x,y)){this.g.prompt&&this.g.prompt();return}this.g.down&&this.g.down(x,y)},
// move(x, y) / up(x, y): arrastres; se pasan al juego mientras no haya terminado.
  move(x,y){if(!this.fin)this.g.move&&this.g.move(x,y)},/* up(x, y): soltar, se pasa al juego. */up(x,y){if(!this.fin)this.g.up&&this.g.up(x,y)},
// hint(): la ayuda la decide el juego (nada si ya terminó).
  hint(){return this.fin?null:this.g.hint&&this.g.hint()},/* prompt(): la consigna la dice el juego. */prompt(){this.g.prompt&&this.g.prompt()}
};

/* ================= LA ASAMBLEA ================= */
// EMO: emociones de la asamblea. {clave: {c: color de la carita, n: nombre (o [rioplatense, España])}}.
// EMO_AGE: qué emociones salen según la edad. EMO_SAY: lo que dice Tito al elegir cada una. EMO_TIP: consejo extra (5 años).
const EMO={alegria:{c:'#FFD66B',n:'alegría'},tristeza:{c:'#7FB0FF',n:'tristeza'},enojo:{c:'#FF6B5E',n:['enojo','enfado']},miedo:{c:'#9B8AD9',n:'miedo'},sorpresa:{c:'#FFA94D',n:'sorpresa'},calma:{c:'#7CC86E',n:'calma'},verguenza:{c:'#F58BB4',n:'vergüenza'}};
const EMO_AGE={3:['alegria','tristeza','enojo'],4:['alegria','tristeza','enojo','miedo','sorpresa'],5:['alegria','tristeza','enojo','miedo','sorpresa','calma','verguenza']};
const EMO_SAY={alegria:'¡Qué bueno! Hoy sentís alegría. ¡Yo también estoy feliz de verte!',tristeza:'Hoy sentís tristeza. Está bien estar triste a veces. Un abrazo ayuda mucho.',enojo:'Hoy sentís enojo. Cuando me enojo, respiro como un globo: inflo, inflo... y suelto despacito.',
  miedo:'Hoy sentís miedo. Si tenés miedo, buscá a un grande que te cuide.',sorpresa:'¡Hoy sentís sorpresa! ¡Qué emocionante!',calma:'Hoy sentís calma. ¡Qué lindo sentirse así!',verguenza:'Hoy sentís vergüenza. Nos pasa a todos. Respirá hondo y sonreí.'};
const EMO_TIP={tristeza:' Podés contarle a alguien lo que te pasa.',enojo:' Y después contá lo que te enojó con palabras.',miedo:' Hablar de lo que da miedo lo hace más chiquito.'};
// drawFace(x, y, r, m): dibuja la carita de la emoción m (clave de EMO) de radio r en (x, y). Solo dibuja.
function drawFace(x,y,r,m){const e=EMO[m];ctx.save();ctx.translate(x,y);circ(0,0,r,e.c,6);const ey=-r*.12,ex=r*.34,L=r*.07;ctx.lineCap='round';ctx.lineWidth=L;ctx.strokeStyle=K;
// eyes(rr): dos ojos de radio rr con brillo blanco.
  const eyes=(rr)=>{circ(-ex,ey,rr,K,0);circ(ex,ey,rr,K,0);circ(-ex+rr*.35,ey-rr*.35,rr*.35,'#fff',0);circ(ex+rr*.35,ey-rr*.35,rr*.35,'#fff',0)};
// mouth(a, b, c): boca curva; a y c = altura de las comisuras, b = altura del centro (en fracciones de r).
  const mouth=(a,b,c)=>{ctx.beginPath();ctx.moveTo(-r*.32,r*a);ctx.quadraticCurveTo(0,r*b,r*.32,r*c);ctx.stroke()};
  if(m==='alegria'){eyes(r*.1);ctx.beginPath();ctx.moveTo(-r*.4,r*.2);ctx.quadraticCurveTo(0,r*.75,r*.4,r*.2);ctx.closePath();fillStroke('#C0473C',L)}
  if(m==='tristeza'){eyes(r*.09);mouth(.48,.2,.48);ell(-ex-r*.06,ey+r*.22,r*.06,r*.1,'#5BB8E6',0)}
  if(m==='enojo'){eyes(r*.09);ctx.beginPath();ctx.moveTo(-ex-r*.18,ey-r*.26);ctx.lineTo(-ex+r*.14,ey-r*.12);ctx.moveTo(ex+r*.18,ey-r*.26);ctx.lineTo(ex-r*.14,ey-r*.12);ctx.stroke();mouth(.5,.28,.5)}
  if(m==='miedo'){circ(-ex,ey,r*.16,'#fff',L*.6);circ(ex,ey,r*.16,'#fff',L*.6);circ(-ex,ey,r*.07,K,0);circ(ex,ey,r*.07,K,0);ctx.beginPath();ctx.moveTo(-r*.3,r*.42);for(let i=1;i<=6;i++)ctx.lineTo(-r*.3+i*r*.1,r*.42+(i%2?-1:1)*r*.06);ctx.stroke()}
  if(m==='sorpresa'){eyes(r*.11);ctx.beginPath();ctx.arc(-ex,ey-r*.24,r*.14,PI*1.15,PI*1.85);ctx.stroke();ctx.beginPath();ctx.arc(ex,ey-r*.24,r*.14,PI*1.15,PI*1.85);ctx.stroke();ell(0,r*.4,r*.13,r*.17,'#C0473C',L)}
  if(m==='calma'){for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*ex,ey,r*.1,PI*.1,PI*.9);ctx.stroke()}mouth(.3,.5,.3)}
  if(m==='verguenza'){eyes(r*.08);circ(-r*.5,r*.18,r*.13,'#FF5A8A',0);circ(r*.5,r*.18,r*.13,'#FF5A8A',0);ctx.beginPath();ctx.moveTo(-r*.16,r*.42);ctx.quadraticCurveTo(0,r*.5,r*.16,r*.42);ctx.stroke()}
  ctx.restore()}
// WX: tipos de tiempo. {clave: {k: dibujo, s: frase de Tito}}. WX_AGE: cuáles salen según la edad.
// WX_ROPA: prendas correctas para cada tiempo (paso 'ropa' de 4 años).
const WX={sol:{k:'sol',s:'¡Hoy hace sol!'},nublado:{k:'nublado',s:'¡Hoy está nublado!'},lluvia:{k:'lluvia',s:'¡Hoy llueve!'},viento:{k:'viento',s:'¡Hoy hay viento!'},nieve:{k:'nieve',s:'¡Hoy nieva!'},tormenta:{k:'tormenta',s:'¡Hoy hay tormenta!'},niebla:{k:'niebla',s:'¡Hoy hay niebla!'}};
const WX_AGE={3:['sol','nublado','lluvia'],4:['sol','nublado','lluvia','viento','nieve'],5:['sol','nublado','lluvia','viento','nieve','tormenta','niebla']};
const WX_ROPA={sol:['gorra','gafas'],nublado:['abrigo'],lluvia:['paraguas','botasAgua'],viento:['bufanda','abrigo'],nieve:['gorro','guantes'],tormenta:['paraguas','botasAgua'],niebla:['abrigo','bufanda']};
// SEASON_NEXT: qué estación viene después de cada una (paso 'siguiente' de 5 años).
const SEASON_NEXT={primavera:'verano',verano:'otoño',otoño:'invierno',invierno:'primavera'};
// dayIdx(d): día de la semana con el lunes = 0 y el domingo = 6 (Date.getDay empieza en domingo).
const dayIdx=d=>(d.getDay()+6)%7; // lunes=0

// LA ASAMBLEA: rutina diaria de la plaza. Es una máquina de estados: this.steps es la lista de pasos según la edad
// y this.si el paso actual (this.s = su nombre). Para cada paso X hay un método in_X() que lo prepara (opciones y
// pregunta); down() comprueba la respuesta y, si es buena, llama a next() para pasar al siguiente.
// Lo que se responde se guarda en this.rec y al final en S.asam[fecha de hoy] = {done, age, tiempo, emo, dia}.
// zonas.js añade el paso 'cumple' (cumpleaños) envolviendo enter/draw/down/hint/prompt/in_fin.
SCENES.asamblea={music:'plaza',
// enter(): fecha de hoy (this.d), día de la semana (this.ti), lo ya guardado hoy (this.rec) y la lista de pasos:
// 3 años: hola, día/noche, día, tiempo, emoción. 4 años: + ropa y estación. 5 años: + mañana, mes, estación siguiente.
  enter(){const a=AGE();this.d=new Date();this.ti=dayIdx(this.d);this.rec=S.asam[today()]||{};
    this.steps=['hola',a<=3?'dianoche':null,'dia',a>=5?'manana':null,a>=5?'mes':null,'tiempo',a===4?'ropa':null,a>=4?'estacion':null,a>=5?'siguiente':null,'emocion','fin'].filter(Boolean);
    this.si=-1;this.next()},
// next(): pasa al siguiente paso: reinicia errores, opciones y selección y llama a in_<paso>() si existe.
// busy = true bloquea los toques mientras Tito habla.
  next(){this.si++;this.s=this.steps[this.si];this.t0=T;this.errs=0;this.busy=false;this.opts=[];this.sel=null;this.bounce=-1;this.extra=null;const f=this['in_'+this.s];f&&f.call(this)},
// ask(fn): pregunta del paso (fn dice la frase) a los 0,3 s y cuando Tito calle; no se dice si mientras tanto el niño ya
// respondió (this.sel) o se pasó a otro paso. Así una respuesta rápida no queda cortada por su propia pregunta.
  ask(fn){const si=this.si;later(300,()=>whenQuiet(()=>{if(this.si===si&&this.sel===null)fn()}))},
  // opciones genéricas: {x,y,s,draw(x,y,s),v,ok}
// setOpts(list, y, s): coloca en fila, centradas, las opciones de un paso. Cada opción: {draw(x,y,s): la dibuja,
// v: valor, ok: si es correcta}; se le añaden x, y, s (tamaño) e "in" (momento en que aparece, para la animación).
  setOpts(list,y=520,s=230){const n=list.length,gap=s+24;this.opts=list.map((o,i)=>Object.assign({x:800-(n-1)*gap/2+i*gap,y,s,in:T+i*.08},o))},
// in_hola(): paso 1, pasar lista: tocar la foto propia.
  in_hola(){this.ask(()=>say(`¡Buen día${kid()}! Empieza la asamblea. ¿Estás acá? ¡Tocá tu foto!`))},
// in_dianoche(): (3 años) ¿es de día o de noche? Correcto según la hora real (de 7 a 20 h es de día).
  in_dianoche(){const h=this.d.getHours(),day=h>=7&&h<20;this.setOpts([{draw:(x,y,s)=>dayNight(1).draw(x,y,s),ok:day,v:'dia'},{draw:(x,y,s)=>dayNight(0).draw(x,y,s),ok:!day,v:'noche'}],500,300);this.ask(()=>say('¿Ahora es de día o de noche?'))},
// in_dia(): el tren de los días (this.wag, un vagón por día). 3 años: Tito canta los días (sing) y hace saltar el
// vagón de hoy. 4-5 años: dice qué día fue ayer y el niño busca hoy.
  in_dia(){const a=AGE();this.wag=DIASL.map((d,i)=>({x:330+i*168,y:520,i}));
    if(a<=3){this.busy=true;later(300,()=>sayQ('Cantemos los días de la semana.',()=>this.sing(()=>{this.bounce=this.ti;say('Hoy es '+DIASL[this.ti]+'. ¡Tocá el vagón de hoy, el que salta!',()=>{this.busy=false})})))}
    else{const y=DIASL[(this.ti+6)%7];this.ask(()=>say('Ayer fue '+y+'. ¿Qué día es hoy? Tocá el vagón.'))}},
// in_manana(): (5 años) el tren con "HOY" marcado; hay que tocar mañana.
  in_manana(){this.wag=DIASL.map((d,i)=>({x:330+i*168,y:520,i}));this.mark=this.ti;this.ask(()=>say('Hoy es '+DIASL[this.ti]+'. ¿Y mañana qué día será? Tocá el vagón de mañana.'))},
// in_mes(): (5 años) calendario del mes (this.cal: {n, x, y} por día, empezando en lunes); hay que tocar el número de hoy.
  in_mes(){const d=this.d,first=new Date(d.getFullYear(),d.getMonth(),1),n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),o=dayIdx(first);
    this.cal=[];for(let i=1;i<=n;i++){const p=o+i-1;this.cal.push({n:i,x:520+(p%7)*110,y:300+Math.floor(p/7)*92})}
    this.ask(()=>say('Estamos en '+MESES[d.getMonth()]+'. Hoy es '+d.getDate()+'. Tocá el número '+d.getDate()+' en el calendario.'))},
// in_tiempo(): ¿qué tiempo hace? Todas las opciones valen (ok: true): se apunta lo que diga el niño.
  in_tiempo(){this.setOpts(WX_AGE[AGE()].map(w=>({draw:(x,y,s)=>pic(WX[w].k,x,y,s*.85),v:w,ok:true})),520,AGE()>=5?170:AGE()===4?200:250);this.ask(()=>say('¿Qué tiempo hace hoy? Mirá por la ventana de tu casa y tocá el dibujo.'))},
// in_ropa(): (4 años) una prenda buena para el tiempo elegido y dos que no van, mezcladas.
  in_ropa(){const w=this.rec.tiempo||'sol',good=pick(WX_ROPA[w]),bad=shuffle(['gafas','gorra','guantes','gorro','paraguas','remera','bufanda'].filter(k=>!WX_ROPA[w].includes(k))).slice(0,2);
    this.setOpts(shuffle([good,...bad]).map(k=>({draw:(x,y,s)=>pic(k,x,y,s*.8),v:k,ok:k===good})),540,250);this.ask(()=>say('Con este tiempo, ¿qué nos ponemos para salir?'))},
// in_estacion(): (4-5 años) cuatro árboles; correcto el de la estación actual (estacionDe, según el hemisferio).
  in_estacion(){const e=estacionDe(this.d);this.setOpts(ESTACIONES.map(s=>({draw:(x,y,sz)=>tree(x,y+sz*.25,sz/280,s),v:s,ok:s===e})),520,250);this.ask(()=>say('¿En qué estación estamos? Tocá el árbol.'))},
// in_siguiente(): (5 años) ¿qué estación viene después? (SEASON_NEXT).
  in_siguiente(){const e=estacionDe(this.d),n=SEASON_NEXT[e];this.setOpts(ESTACIONES.map(s=>({draw:(x,y,sz)=>tree(x,y+sz*.25,sz/280,s),v:s,ok:s===n})),520,250);this.ask(()=>say('Ahora es '+e+'. ¿Qué estación viene después?'))},
// in_emocion(): ¿cómo te sientes? Caritas según la edad; todas valen.
  in_emocion(){this.setOpts(EMO_AGE[AGE()].map(m=>({draw:(x,y,s)=>drawFace(x,y,s*.42,m),v:m,ok:true})),520,AGE()>=5?175:AGE()===4?220:260);this.ask(()=>say(tx('¿Cómo te sentís hoy? Tocá la carita.')))},
// in_fin(): cierra la asamblea: guarda S.asam[hoy] con done y edad, borra las más antiguas (se quedan 120 días) y,
// si es la 3.ª asamblea de la semana (desde el lunes, wk), regala una figurita una sola vez por semana (S.first.wk).
// Después vuelve al mapa.
  in_fin(){const r=this.rec;r.done=1;r.age=AGE();S.asam[today()]=r;
    const ks=Object.keys(S.asam).sort();while(ks.length>120)delete S.asam[ks.shift()];
    const wk=(()=>{const d=new Date(this.d);d.setDate(d.getDate()-dayIdx(d));return ymd(d)})();
    const n=Object.keys(S.asam).filter(k=>k>=wk&&S.asam[k].done).length;save();
    SFX.tada();burst(800,400,80);
    let line='¡Terminamos la asamblea'+kid()+'! ¡Ahora a jugar!';
    if(n>=3&&!(S.first.wk===wk)){S.first.wk=wk;save();giveSticker('estrella');line='¡Tres asambleas esta semana! ¡Ganaste una figurita! Ahora, ¡a jugar!'}
    say(line,()=>later(800,()=>go('map')))},
// sing(cb): canta los siete días uno a uno (this.singI = el que suena, para que su vagón salte) y al acabar llama a cb.
// st() dice un día y, cuando termina, programa el siguiente.
  sing(cb){let i=0;const st=()=>{if(i>=7){this.singI=-1;cb&&cb();return}this.singI=i;SFX.count(i);say(DIASL[i],()=>{i++;later(80,st)},{rate:1})};st()},
// prompt(): repite la pregunta del paso actual.
  prompt(){const f={hola:'¡Tocá tu foto!',dianoche:'¿Ahora es de día o de noche?',dia:AGE()<=3?'Tocá el vagón que salta.':'Ayer fue '+DIASL[(this.ti+6)%7]+'. ¿Qué día es hoy?',manana:'¿Qué día será mañana?',mes:'Tocá el número '+this.d.getDate()+'.',tiempo:'¿Qué tiempo hace hoy?',ropa:'¿Qué nos ponemos?',estacion:'¿En qué estación estamos?',siguiente:'¿Qué estación viene después?',emocion:tx('¿Cómo te sentís hoy?')}[this.s];if(f)say(f)},
// hint(): dónde señalar la ayuda en cada paso. En 'dia'/'manana' con 4-5 años no ayuda enseguida (solo tras un error o
// mucho rato quieto). En 'tiempo' y 'emocion' no hay respuesta correcta, así que no se señala nada.
  hint(){if(this.busy)return null;const s=this.s;
    if(s==='hola')return{x:800,y:500,r:180};
    if(s==='dia'||s==='manana'){if(AGE()>=4&&this.errs<1)return idle>14?{x:this.wag[s==='dia'?this.ti:(this.ti+1)%7].x,y:520,r:90}:null;return{x:this.wag[s==='dia'?this.ti:(this.ti+1)%7].x,y:520,r:90}}
    if(s==='mes'){const c=this.cal[this.d.getDate()-1];return{x:c.x,y:c.y,r:55}}
    const o=this.opts.find(o=>o.ok);return o&&!['tiempo','emocion'].includes(s)?{x:o.x,y:o.y,r:o.s*.6}:null},
// update(): nada que actualizar cada cuadro.
  update(){},
// draw(): la clase (ventana con el cielo según la hora y el tiempo apuntado, cartel ASAMBLEA) y lo propio del paso:
// foto de "presente", tren de los días, calendario, u opciones genéricas (this.opts) con animación de entrada (back) y
// temblor al fallar (o.shake). Abajo, puntos de progreso de los pasos.
  draw(){
    sky('#FFF3D6','#FCE3C0');floor(760,'#E9C99A');
    // ventana con el tiempo real no se conoce: se ve el cielo según la hora
    const h=this.d.getHours(),night=h<7||h>=20,wx=this.rec.tiempo;card(1240,40,300,210,night?'#2E3F7A':'#BFEAF7',8,16);if(wx&&!night)pic(WX[wx].k,1390,145,170);else if(wx&&night){pic('luna',1320,110,80);pic(WX[wx].k,1440,160,120)}else if(night){pic('luna',1330,120,90);star(1460,90,10,'#FFE08A',0)}else{ctx.globalAlpha=.6;cloud(1280,120,.5);cloud(1420,190,.4);ctx.globalAlpha=1}ctx.beginPath();ctx.moveTo(1390,40);ctx.lineTo(1390,250);ctx.moveTo(1240,145);ctx.lineTo(1540,145);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke();
    card(330,40,560,110,'#fff',6,55);text('ASAMBLEA',610,118,62,K,{f:LF});
    const s=this.s;
    if(s==='hola'){const hs=hv('hola',hR(800,500,320,360));ctx.save();ctx.translate(800,500);ctx.scale(hs*(this.sel?1+.05*Math.sin(T*8):1),hs);card(-160,-180,320,360,'#fff',7,40);pic('nene',0,-30,250);text((S.name||'¡Yo!').toUpperCase(),0,140,S.name&&S.name.length>8?40:54,K,{f:LF});ctx.restore();
      if(this.sel){star(960,330,40,'#FFC93C',5);text('¡PRESENTE!',800,760,60,'#7CC86E',{f:LF,st:6,sc:'#fff'});if(AGE()>=5){pic('gorra',800,290,150)}}}
    if(s==='dia'||s==='manana'){
      // tren de los días
      ctx.beginPath();ctx.moveTo(220,640);ctx.lineTo(1520,640);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.stroke();
      card(150,430,150,180,'#FF6B5E',7,20);card(180,370,60,70,'#5B5F6B',6,8);circ(190,620,26,'#5B5F6B',6);circ(260,620,26,'#5B5F6B',6);
      for(const w of this.wag){const we=w.i>=5,b=(this.bounce===w.i?Math.abs(Math.sin(T*6))*30:0)+(this.singI===w.i?16:0),hs=hv('w'+w.i,hR(w.x,w.y,150,170));
        ctx.save();ctx.translate(w.x,w.y-b);ctx.scale(hs,hs);card(-72,-80,144,150,DIAC[w.i],7,18);if(we){star(0,-46,18,'#fff',3)}
        const nm=DIASL[w.i].toUpperCase();text(nm,0,22,nm.length>7?22:26,K,{f:LF});if(s==='manana'&&w.i===this.ti){card(-50,-130,100,40,'#fff',4,20);text('HOY',0,-100,26,K,{f:LF})}
        ctx.restore();circ(w.x-40,620,20,'#5B5F6B',5);circ(w.x+40,620,20,'#5B5F6B',5)}
      if(this.sel!=null&&this.sel!==false){text(s==='dia'?'HOY: '+DIASL[this.ti].toUpperCase():'MAÑANA: '+DIASL[(this.ti+1)%7].toUpperCase(),800,760,54,K,{f:LF})}}
    if(s==='mes'){card(440,170,800,600,'#fff',7,30);text(MESES[this.d.getMonth()].toUpperCase(),840,240,48,K,{f:LF});
      ['L','M','M','J','V','S','D'].forEach((l,i)=>text(l,520+i*110,290-30,28,'#7A6252',{f:LF}));
      for(const c of this.cal){const hs=hv('c'+c.n,hR(c.x,c.y,96,80)),today_=c.n===this.d.getDate()&&this.sel;ctx.save();ctx.translate(c.x,c.y);ctx.scale(hs,hs);card(-48,-38,96,76,today_?'#FFC93C':(this.errs>=2&&Math.abs(c.n-this.d.getDate())<4?'#FFF3B0':'#FFF6E6'),4,14);text(String(c.n),0,13,36,K,{f:LF});ctx.restore()}}
    for(const o of this.opts){const ap=clamp((T-o.in)*3,0,1),hs=this.sel===o?1.12:hv(o,hR(o.x,o.y,o.s,o.s)),sx=o.shake>0?Math.sin((T-o.shake)*40)*12*Math.max(0,1-(T-o.shake)*2.5):0;
      ctx.save();ctx.translate(o.x+sx,o.y);ctx.scale((ap<1?back(ap):1)*hs,(ap<1?back(ap):1)*hs);card(-o.s/2,-o.s/2,o.s,o.s,this.sel===o?'#FFF3B0':'#fff',this.sel===o?10:7,36,this.sel===o?'#FFC93C':K);o.draw(0,0,o.s);ctx.restore()}
    if(this.s==='tiempo'&&this.sel&&AGE()>=5)this.drawWxCal();
    // pasos
    this.steps.forEach((st,i)=>circ(800-(this.steps.length-1)*18+i*36,850,10,i<this.si?'#7CC86E':i===this.si?'#FFC93C':'#EADFCF',3));
    drawHome();drawTito(TITO.x,TITO.y,TITO.w);
  },
// drawWxCal(): (5 años, tras elegir el tiempo) calendario del mes con el dibujo del tiempo apuntado cada día en S.asam.
  drawWxCal(){const d=this.d,n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();card(300,180,1000,200,'#fff',6,24);text(tx('Calendario del tiempo de ')+MESES[d.getMonth()],800,220,28,K);
    for(let i=1;i<=n;i++){const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`,r=S.asam[k]||(k===today()?this.rec:null),x=330+((i-1)%16)*60,y=270+Math.floor((i-1)/16)*80;
      card(x-26,y-26,52,52,'#FFF6E6',3,10);if(r&&r.tiempo)pic(WX[r.tiempo].k,x,y,46);else text(String(i),x,y+8,20,'#B8A890')}},
// wrongDay(i, target): el niño tocó el vagón del día i en lugar de target: suma error, dice qué día era el tocado
// con una pista y hace saltar el vagón correcto.
  wrongDay(i,target){const nm=DIASL[i];this.errs++;SFX.bad();say('Ese es el '+nm+'. '+(this.s==='dia'?(AGE()<=3?'Hoy es '+DIASL[this.ti]+', el que salta.':'Ayer fue '+DIASL[(this.ti+6)%7]+'. Hoy es el que viene después.'):'Mañana es el que viene después de hoy.'));if(this.errs>=1)this.bounce=target},
// down(x, y): comprueba la respuesta del paso actual. Acierto: celebra, apunta la estadística con rec() (acierto a la
// primera si errs == 0), guarda en this.rec y llama a next() cuando Tito termina de hablar. Fallo: sacude la opción,
// suma error y da una pista. El paso 'tiempo' guarda ya en S.asam[hoy].
  down(x,y){
    if(atHome(x,y)){SFX.tap();go('map');return}
    if(inTito(x,y)){this.prompt();return}
    if(this.busy)return;const s=this.s;
    if(s==='hola'){if(inR(x,y,800,500,330,370)){this.busy=true;this.sel=true;SFX.tada();burst(800,500,50);say(AGE()>=5?'¡Presente! Y hoy sos el encargado de la asamblea. ¡Te ganaste la gorra!':'¡Presente! ¡Qué bueno que estás acá!',()=>later(500,()=>this.next()))}return}
    if(s==='dia'||s==='manana'){const w=this.wag.find(w=>inR(x,y,w.x,w.y,150,170));if(!w){SFX.tap();return}const target=s==='dia'?this.ti:(this.ti+1)%7;
      if(w.i===target){this.busy=true;this.sel=w.i;this.bounce=w.i;SFX.good();burst(w.x,w.y,40);rec(s==='dia'?'dia-hoy':'dia-manana',this.errs===0);this.rec.dia=DIASL[this.ti];
        const we=this.ti>=5;say(praise()+(s==='dia'?' Hoy es '+DIASL[this.ti]+'. '+(we?'¡Es fin de semana, no hay escuela!':'Es día de escuela.'):' Mañana será '+DIASL[target]+'.'),()=>later(500,()=>this.next()))}
      else this.wrongDay(w.i,target);return}
    if(s==='mes'){const c=this.cal.find(c=>inR(x,y,c.x,c.y,100,84));if(!c){SFX.tap();return}
      if(c.n===this.d.getDate()){this.busy=true;this.sel=true;SFX.good();burst(c.x,c.y,30);rec('calendario',this.errs===0);say(praise()+' Hoy es '+DIASL[this.ti]+' '+c.n+' de '+MESES[this.d.getMonth()]+'.',()=>later(500,()=>this.next()))}
      else{this.errs++;SFX.bad();say('Ese es el '+c.n+'. Buscá el '+this.d.getDate()+'.')}return}
    const o=this.opts.find(o=>inR(x,y,o.x,o.y,o.s+10,o.s+10));if(!o){SFX.tap();sparkles(x,y,3);return}
// El tiempo se guarda en S al momento para que el calendario del tiempo (drawWxCal) lo muestre ya.
    if(s==='tiempo'){this.busy=true;this.sel=o;this.rec.tiempo=o.v;S.asam[today()]=Object.assign(S.asam[today()]||{},this.rec);save();SFX.good();burst(o.x,o.y,30);say(WX[o.v].s+' Lo anotamos en el calendario del tiempo.',()=>later(AGE()>=5?1500:500,()=>this.next()));return}
    if(s==='emocion'){this.busy=true;this.sel=o;this.rec.emo=o.v;SFX.good();sparkles(o.x,o.y,10);say(EMO_SAY[o.v]+(AGE()>=5&&EMO_TIP[o.v]?EMO_TIP[o.v]:''),()=>later(500,()=>this.next()));return}
    if(o.ok){this.busy=true;this.sel=o;SFX.good();burst(o.x,o.y,30);rec('asamblea-'+s,this.errs===0);
      const ok={dianoche:o.v==='dia'?'¡Sí! Ahora es de día.':'¡Sí! Ahora es de noche.',ropa:'¡Sí! Nos ponemos '+W_(o.v)+'.',estacion:'¡Sí! Estamos en '+o.v+'.'+({otoño:' Las hojas se caen.',invierno:' Hace frío.',primavera:' Salen las flores.',verano:' Hace calor.'}[o.v]),siguiente:'¡Sí! Después viene '+(o.v==='otoño'?'el otoño':o.v==='invierno'?'el invierno':o.v==='verano'?'el verano':'la primavera')+'.'}[s];
      say(praise()+' '+ok,()=>later(500,()=>this.next()))}
// Tras dos fallos se pone idle = 7 para que la ayuda (brillo) aparezca enseguida.
    else{o.shake=T;this.errs++;SFX.bad();
      const bad={dianoche:'Mirá por la ventana. '+(o.v==='dia'?'Ahora no hay sol.':'Ahora hay luz.'),ropa:cap(W_(o.v))+' no va con este tiempo.',estacion:'Ese es el árbol '+(o.v==='otoño'?'del otoño':o.v==='invierno'?'del invierno':o.v==='verano'?'del verano':'de la primavera')+'. Probá con otro.',siguiente:'Mmm, después de '+estacionDe(this.d)+' no viene '+o.v+'.'}[s];
      say(bad||'Probá otra vez.');if(this.errs>=2)idle=7}
  }
};

/* ---------- ÁLBUM ---------- */
// ALBUM_KEYS: todas las figuritas posibles del álbum, en orden: las palabras con dibujo y el icono de cada tema, más
// 'estrella' (premio de asambleas). Se calcula una vez al cargar.
const ALBUM_KEYS=(()=>{const s=new Set();for(const t of TEMAS){if(t.words)t.words.forEach(w=>w.k&&PICS[w.k]&&s.add(w.k));s.add(t.icon)}s.add('estrella');return [...s].filter(k=>PICS[k])})();
// ÁLBUM DE FIGURITAS: 18 por página (per); las que se tienen (S.stk) en color, las demás en sombra.
SCENES.album={music:'book',
// enter(): primera página; Tito dice cuántas figuritas hay.
  enter(){this.pg=0;const n=Object.keys(S.stk).length;later(300,()=>sayQ(n?V(['Este es tu álbum. Tenés ','Este es tu álbum. Tienes '])+n+(n===1?V([' figurita.',' pegatina.']):V([' figuritas.',' pegatinas.'])):V(['Todavía no tenés figuritas. ¡Las ganás terminando juegos!','Todavía no tienes pegatinas. ¡Las ganas terminando juegos!'])))},
// per: figuritas por página (6 x 3).
  per:18,
// draw(): la página actual, número de página y flechas de anterior/siguiente.
  draw(){sky('#EDE7FF','#FFF6E6');card(240,40,1300,800,'#FFFBF2',8,40);text(V(['Mi álbum de figuritas','Mi álbum de pegatinas']),890,110,52,K,{w:600});
    const ks=ALBUM_KEYS.slice(this.pg*this.per,(this.pg+1)*this.per);
    ks.forEach((k,i)=>{const x=390+(i%6)*200,y=250+Math.floor(i/6)*200,has=S.stk[k];const hs=has?hv('a'+k,hC(x,y,80)):1;ctx.save();ctx.translate(x,y);ctx.scale(hs,hs);if(has)drawSticker(k,0,0,160,Math.sin(i)*.08);else{circ(0,0,80,'#F1E9DC',4,'#E4D3B8');ctx.globalAlpha=.18;picG(k,0,0,130);ctx.globalAlpha=1}ctx.restore()});
    const pages=Math.ceil(ALBUM_KEYS.length/this.per);text((this.pg+1)+' / '+pages,890,820,30,'#7A6252');
    if(this.pg>0){const s=hv('prev',hC(170,450,60));ctx.save();ctx.translate(170,450);ctx.scale(s,s);circ(0,0,56,'#fff',6);ctx.beginPath();ctx.moveTo(14,-24);ctx.lineTo(-18,0);ctx.lineTo(14,24);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();ctx.restore()}
    if(this.pg<pages-1){const s=hv('next',hC(1530,450,60));ctx.save();ctx.translate(1530,450);ctx.scale(s,s);circ(0,0,56,'#fff',6);ctx.beginPath();ctx.moveTo(-14,-24);ctx.lineTo(18,0);ctx.lineTo(-14,24);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();ctx.restore()}
    drawHome();drawTito(TITO.x,TITO.y,TITO.w)},
// down(x, y): casa -> mapa; flechas cambian de página; tocar una figurita dice su nombre (o que aún no se tiene).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}const pages=Math.ceil(ALBUM_KEYS.length/this.per);
    if(dist(x,y,170,450)<70&&this.pg>0){this.pg--;SFX.whoosh();return}if(dist(x,y,1530,450)<70&&this.pg<pages-1){this.pg++;SFX.whoosh();return}
    const ks=ALBUM_KEYS.slice(this.pg*this.per,(this.pg+1)*this.per);ks.forEach((k,i)=>{const px=390+(i%6)*200,py=250+Math.floor(i/6)*200;if(dist(x,y,px,py)<85){if(S.stk[k]){SFX.pop();sparkles(px,py,6);say(cap(W_(k))+'.')}else{SFX.tap();say('Esta todavía no la tenés.')}}})}
};

/* ---------- A DORMIR (límite de tiempo) ---------- */
// A DORMIR: se muestra cuando se acaba el tiempo de juego fijado por el adulto (S.limit, ver adult.js).
// Tito duerme bajo la luna. No tiene down(): no se puede seguir jugando desde aquí.
SCENES.dormir={music:null,
// enter(): Tito se despide.
  enter(){later(300,()=>sayQ(`¡Qué lindo jugamos${kid()}! Ahora Tito se va a descansar. ¡Hasta mañana!`))},
// draw(): cielo de noche con estrellas que parpadean, luna, Tito dormido y "z" que suben.
  draw(){sky('#2E3F7A','#5B6FB0');for(let i=0;i<30;i++){ctx.globalAlpha=.5+.5*Math.sin(T*2+i);star((i*197)%1600,(i*131)%560,6+i%3*3,'#FFE08A',0)}ctx.globalAlpha=1;
    pic('luna',1300,180,200);drawTito(600,430,400,{sleep:true,bubble:false});
    for(let i=0;i<3;i++){const k=(T*.5+i/3)%1;ctx.globalAlpha=1-k;text('z',1000+k*80,420-k*160,30+k*40,'#fff');ctx.globalAlpha=1}
    text('Es hora de descansar',800,820,48,'#fff')}
};
