/* ================= NÚCLEO DE CURIOLANDIA ================= */
/*
 * core.js: el núcleo de Curiolandia. Va justo después de los dibujos (pics-*.js) y antes que todo lo demás
 * (ver build.sh). Como todo se concatena en un único <script>, lo que se define aquí lo ven todos los archivos siguientes.
 *
 * Qué define (globales que usan los demás archivos):
 *  - Pantalla: W y H (pantalla lógica de 1600x900), cv y ctx (el lienzo 2D), SC/OX/OY/DPR (escala y márgenes), resize().
 *  - Utilidades: rnd, ri, pick, shuffle, clamp, lerp, dist, easeOut, back, PI, hex2, col.
 *  - Estado guardado: KEY, DEF, S, save(), rec(), ymd(), today(), AGE().
 *  - Rioplatense / castellano de España: TU, _tuRe, tx(), V(); nombres de los dibujos: LEX, LEX2, W_, Wn, art, dela, ala.
 *  - Imágenes: IMG, IMGG, svgImg(), greyOf(), pic(), picG().
 *  - Dibujo básico: rr, fillStroke, card, circ, ell, text, star, hand, speaker, sky, cloud, flower.
 *  - Puntero: MX, MY, mouseOn, hovNow, hR, hC, hv, setCursor.
 *  - Tito en 2D: TITO, drawTito(), inTito(), titoKind(), temasDone().
 *  - Sonido: initAudio, setVol, tone, noise, syn, SFX, SOUNDS, ONO, playSound; música: MUSIC, musKey, musicTick.
 *  - Voz: say(), voces grabadas (vozLoad, vozFile, vozGet, vozPlay, vozSeq, sayTTS, vozStop), pickVoice (con S.vozNav, vozCalidad, vocesES), vozProbar, talking, kid, PRAISE, praise, cap.
 *  - Escenas: scene, sceneName, sceneArg, sceneTok, go(), later(), whenQuiet(), sayQ(), T, fade, idle, drag, timers.
 *  - Partículas: parts, burst(), sparkles(), heart(), drawParts().
 *  - Interfaz común: HOME, drawHome, atHome, drawRounds, drawLock (candado de adultos), drawHelp (ayudas).
 *  - Dificultad adaptativa: ADAPT, streak, REP, nOpts, onRight, onWrongTwice, nRounds; tiempo: sessionT, minuteAcc.
 *  - Pegatinas: toast, giveSticker, drawSticker, drawToast. Calendario: DIAS, DIASL, DIAC, MESES, ESTACIONES, estacionDe.
 *
 * Depende de: pics-*.js (PICS, K = color de la tinta, TITO_SVG, ERIZO_SVG, TORTUGA_SVG, CONEJO_SVG, LUPI_SVG,
 * GLASSES_SVG, HAND_SVG). Mientras el juego corre usa también SCENES (scenes.js y otros), titoImg/drawTitoWear (tienda.js).
 * El bucle de dibujo frame() y la entrada (dedo/ratón) están en adult.js; el arranque, en boot.js.
 */
const W=1600,H=900, LF='Andika, Fredoka, "Trebuchet MS", sans-serif', DF='Fredoka, "Baloo 2", system-ui, sans-serif';
const cv=document.getElementById('cv'); let ctx=cv.getContext('2d');
let SC=1,OX=0,OY=0,DPR=1;
// resize(): ajusta el lienzo al tamaño de la ventana. El juego siempre "piensa" en una pantalla de 1600x900 (W x H):
// SC es la escala para que quepa entera, OX/OY el margen (bandas) para centrarla y DPR la densidad de píxeles
// (como mucho 2, para no gastar de más en móviles). Se llama al cargar y cada vez que cambia el tamaño.
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  const w=innerWidth,h=innerHeight; cv.width=Math.round(w*DPR); cv.height=Math.round(h*DPR);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  SC=Math.min(w/W,h/H); OX=(w-W*SC)/2; OY=(h-H*SC)/2;
}
addEventListener('resize',resize); resize();
// Azar: rnd(a,b) número decimal entre a y b; ri(a,b) entero entre a y b (los dos incluidos); pick(lista) un elemento al azar.
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
// shuffle(lista): devuelve una COPIA desordenada (algoritmo de Fisher-Yates); no toca la lista original.
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// clamp(v,a,b) limita v entre a y b; lerp(a,b,t) mezcla lineal (t=0 da a, t=1 da b); dist(x1,y1,x2,y2) distancia entre dos puntos.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
// Curvas de animación para t de 0 a 1: easeOut frena al final; back se pasa un poco de 1 y vuelve (efecto de rebote al aparecer).
const easeOut=t=>1-Math.pow(1-t,3), back=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const PI=Math.PI;
// hex2('#RRGGBB'): devuelve [r,g,b] con números de 0 a 255.
function hex2(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
// _cc: caché de los colores ya calculados por col() (para no recalcularlos en cada cuadro).
const _cc={};
// col(color, s): devuelve el color apagado hacia su gris ('rgb(...)'); s=1 lo deja igual y s=0 lo deja gris del todo.
function col(c,s){ // mezcla un color hacia su gris (s=1 color pleno, 0 gris)
  if(s>=.999)return c; const k=c+'|'+s.toFixed(2); if(_cc[k])return _cc[k];
  const [r,g,b]=hex2(c), l=r*.3+g*.59+b*.11, m=v=>Math.round(clamp(l*.85+40+(v-(l*.85+40))*s,0,255));
  return _cc[k]=`rgb(${m(r)},${m(g)},${m(b)})`;
}

/* ---------- guardado ---------- */
/*
 * ESTADO GUARDADO S
 * -----------------
 * S es un único objeto con TODO el progreso y los ajustes del niño. Se guarda entero, como JSON, en el localStorage
 * del navegador con la clave KEY ('curiolandia.v1') cada vez que se llama a save(). No hay guardado automático:
 * después de cambiar algo de S hay que llamar a save().
 *
 * Campos que crea DEF (aquí):
 *   age      3, 4 o 5 (0 = aún no elegida; AGE() devuelve entonces 3).
 *   name     nombre del niño ('' si no se dio). Tito lo dice en voz alta (kid(), praise()).
 *   variant  'ar' (rioplatense) o 'es' (castellano de España): cambia palabras con tx()/V() y la voz del navegador.
 *   hemi     'N' o 'S': hemisferio, para calcular la estación del año (estacionDe).
 *   vol      {voz, mus, fx}: volúmenes de 0 a 1 de la voz, la música y los efectos.
 *   limit    minutos de juego por sesión (0 = sin límite; 10, 15 o 20). Al llegar, Tito se va a dormir (escena 'dormir').
 *   temas    {idTema: {g: {númeroDeJuego: veces jugado}, done: 0/1}}: progreso de cada tema (scenes.js).
 *   stats    {habilidad: {ok, err}}: aciertos y fallos por habilidad (rec()); se ven en la zona de adultos.
 *   days     {'AAAA-MM-DD': minutos}: tiempo jugado cada día (se guardan los últimos 30; lo apunta frame() en adult.js).
 *   asam     {'AAAA-MM-DD': {done, age, dia, tiempo, emo}}: la asamblea de cada día (scenes.js).
 *   stk      {dibujo: cantidad}: pegatinas (figuritas) del álbum (giveSticker()).
 *   album    lista vacía que no usa ningún archivo (se conserva por compatibilidad).
 *   intro    true cuando ya se vio el cuento de bienvenida.
 *   first    marcas de "primera vez": fromLetri (datos traídos de Letrilandia), askedName (ya se preguntó el nombre).
 *   seenFl   cuántas flores del caparazón de Tito ya se celebraron (para avisar solo de las nuevas).
 *
 * Campos que añaden otros archivos al arrancar (si faltan en la partida, les ponen su valor por defecto):
 *   tienda.js (DEF2): coins, coinsTot, gift, woke, home, tito {shell, scarf, hat, glasses, bow y kind}, owned,
 *                     vales, valesLog, bday, bdayDone, unlockAll, seenOpen, houseSeen, petSeen, cofres.
 *   repaso.js: kg {habilidad: [juegos donde sale]}, gs {'idTema#juego': {ok, err, d}} y rep (el repaso del día).
 *   Sueltos (pueden no existir): voz ('' o 'fer'), quiet3 (1 = Tito no comenta el paisaje 3D), last (último tema abierto).
 *
 * REGLA DE ORO: hay partidas guardadas en los móviles. Nunca cambies de forma incompatible un campo que ya existe
 * (ni su nombre, ni su tipo, ni lo que significan sus valores) ni la clave KEY. Para algo nuevo, añade un campo
 * nuevo y recuerda que en las partidas viejas NO estará: dale un valor por defecto (en DEF, en DEF2 de tienda.js
 * o con "S.x||valor" al leerlo). Ojo: al cargar, Object.assign solo mezcla el primer nivel: dentro de un objeto
 * (salvo vol) no se añaden valores por defecto que falten.
 */
const KEY='curiolandia.v1';
// DEF: valores de una partida nueva (ver la explicación de arriba). doReset() (adult.js) también parte de aquí.
const DEF={age:0,name:'',variant:'',hemi:'N',vol:{voz:1,mus:.45,fx:.8},limit:0,temas:{},stats:{},days:{},asam:{},stk:{},album:[],intro:false,first:{},seenFl:0};
// S empieza siendo una copia de DEF (JSON.parse(JSON.stringify(...)) hace una copia profunda) y load() la completa.
let S=JSON.parse(JSON.stringify(DEF));
// sanoS(d, def): arregla en el sitio los campos de una partida guardada d que no tienen el tipo de su valor por defecto
// en def, para que una partida o copia rota no rompa el juego. Solo mira los campos que def tiene con un valor no null:
//   - null o undefined: se borra (queda el valor por defecto);
//   - def es objeto/lista y d no lo es (o uno es lista y el otro no): se borra;
//   - def es texto: un número se pasa a texto (nombre 123 → "123"); otra cosa se borra;
//   - def es número: un texto con número se pasa a número ("4" → 4); otra cosa se borra;
//   - def es sí/no: se deja como esté (las partidas viejas pueden tener 1/0).
// Dentro de temas quita las entradas que no son objetos ({"3A-T1": null}). Devuelve d.
function sanoS(d,def){
  for(const k in def){const v=d[k],dv=def[k];if(dv===null||!(k in d))continue;
    if(v==null){delete d[k];continue}
    if(typeof dv==='object'){if(typeof v!=='object'||Array.isArray(v)!==Array.isArray(dv))delete d[k]}
    else if(typeof dv==='string'){if(typeof v==='number')d[k]=String(v);else if(typeof v!=='string')delete d[k]}
    else if(typeof dv==='number'){if(typeof v==='string'&&v.trim()!==''&&isFinite(+v))d[k]=+v;else if(typeof v!=='number'||!isFinite(v))delete d[k]}}
  if(d.temas&&typeof d.temas==='object')for(const t in d.temas)if(!d.temas[t]||typeof d.temas[t]!=='object')delete d.temas[t];
  return d}
// load(): se ejecuta una sola vez, al arrancar. Lee la partida guardada y la mezcla encima de DEF: lo que falte en una
// partida vieja queda con su valor por defecto; vol se mezcla aparte para no perder volúmenes nuevos. Antes, sanoS() quita
// los campos con un tipo imposible (null, un nombre que no es texto...), que también quedan con su valor por defecto.
// Si no hay partida, intenta traer nombre, edad, acento y volumen de Letrilandia (otro juego que guarda en
// 'letrilandia.v1' en el mismo dominio). Los try/catch evitan fallos si el navegador bloquea localStorage.
(function load(){
  let d=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(d&&typeof d==='object'&&!Array.isArray(d)){sanoS(d,DEF);if(d.vol)sanoS(d.vol,DEF.vol);S=Object.assign(S,d,{vol:Object.assign({},DEF.vol,d.vol||{})});return}
  // primera vez: si Letrilandia ya se jugó en este dispositivo, traemos nombre, edad, acento y volúmenes
  try{const l=JSON.parse(localStorage.getItem('letrilandia.v1')||'null');
    if(l){if(l.name)S.name=l.name;if(l.age)S.age=l.age;if(l.accent)S.variant=l.accent==='es'?'es':'ar';if(l.vol)S.vol=Object.assign({},DEF.vol,l.vol);S.first.fromLetri=1}}catch(e){}
})();
// Por defecto (partida nueva), castellano de España: es el acento de las voces grabadas (voz/, voz-fer/); con
// rioplatense casi todas las frases irían con la voz del navegador. Las partidas que ya eligieron acento no cambian.
// El texto original está escrito en rioplatense y tx() lo pasa a España.
if(!S.variant)S.variant='es';
// save(): guarda S entero en localStorage. Llámala después de cada cambio de S. Si falla (modo privado, sin espacio)
// no pasa nada: el juego sigue, pero sin guardar.
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
// ymd(fecha): devuelve 'AAAA-MM-DD' (hora local). Es el formato de las claves de S.days, S.asam, S.gift...
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
// today(): la fecha de hoy como 'AAAA-MM-DD'.
const today=()=>ymd(new Date());
// rec(habilidad, acierto): suma un acierto (ok verdadero) o un fallo en S.stats[habilidad] y guarda.
// repaso.js la envuelve para apuntar además el resultado por juego (S.gs, S.kg).
function rec(k,ok){const s=S.stats[k]||(S.stats[k]={ok:0,err:0});ok?s.ok++:s.err++;save()}
// AGE(): edad elegida (3, 4 o 5); si aún no se eligió, 3.
const AGE=()=>S.age||3;

/* ---------- variante del español: el texto se escribe en rioplatense y se adapta ---------- */
// TU: lista de pares [rioplatense, España]. Los textos del juego se escriben en rioplatense y tx() los pasa a
// castellano de España cuando S.variant==='es'. El ORDEN importa: primero las expresiones largas ('las bananas')
// y luego las cortas ('banana'), para no cambiar media expresión. lex.js añade más pares al final.
// Para añadir una palabra: ['palabra rioplatense','palabra de España'], en minúsculas.
const TU=[['las bananas','los plátanos'],['la banana','el plátano'],['una banana','un plátano'],['banana','plátano'],['bananas','plátanos'],
 ['los anteojos de sol','las gafas de sol'],['unos anteojos de sol','unas gafas de sol'],['anteojos de sol','gafas de sol'],['los anteojos','las gafas'],['anteojos','gafas'],
 ['los autos','los coches'],['el auto','el coche'],['un auto','un coche'],['autos','coches'],['auto','coche'],['el colectivo','el autobús'],['colectivo','autobús'],
 ['la heladera','la nevera'],['heladera','nevera'],['la pileta','la piscina'],['pileta','piscina'],['la campera','la chaqueta'],['campera','chaqueta'],
 ['el chancho','el cerdo'],['los chanchos','los cerdos'],['chancho','cerdo'],['las frutillas','las fresas'],['la frutilla','la fresa'],['frutillas','fresas'],['frutilla','fresa'],
 ['la remera','la camiseta'],['remera','camiseta'],['el jugo','el zumo'],['jugo','zumo'],['la papa','la patata'],['canilla','grifo'],['figuritas','pegatinas'],['figurita','pegatina'],
 ['el jardín de infantes','el cole'],['a la escuela','al cole'],['de la escuela','del cole'],['la escuela','el cole'],
 ['un grande','un mayor'],['acá','aquí'],['allá','allí'],['lindos','bonitos'],['lindas','bonitas'],['lindo','bonito'],['linda','bonita'],
 ['chiquitos','pequeñitos'],['chiquitas','pequeñitas'],['chiquito','pequeñito'],['chiquita','pequeñita'],['nenes','niños'],['nenas','niñas'],['nene','niño'],['nena','niña'],
 ['tocá','toca'],['tocás','tocas'],['mirá','mira'],['buscá','busca'],['arrastrá','arrastra'],['arrastrás','arrastras'],['llevá','lleva'],['poné','pon'],['ponés','pones'],['ponele','ponle'],
 ['elegí','elige'],['elegís','eliges'],['vení','ven'],['escuchá','escucha'],['atrapá','atrapa'],['pintá','pinta'],['guardá','guarda'],['contá','cuenta'],['contalas','cuéntalas'],['contalos','cuéntalos'],
 ['ordená','ordena'],['regá','riega'],['regalas','riégalas'],['encontrá','encuentra'],['ayudá','ayuda'],['ayudás','ayudas'],['armá','arma'],['vestí','viste'],['vestilo','vístelo'],['vestila','vístela'],
 ['descubrí','descubre'],['cavá','cava'],['juntá','junta'],['probá','prueba'],['decí','di'],['decime','dime'],['contame','cuéntame'],['sabés','sabes'],['querés','quieres'],['podés','puedes'],['tenés','tienes'],
 ['sos','eres'],['llamás','llamas'],['jugás','juegas'],['fijate','fíjate'],['esperá','espera'],['sentís','sientes'],['hacés','haces'],['hacé','haz'],['ponete','ponte'],['sacá','saca'],['soplá','sopla'],
 ['tomá','toma'],['respirá','respira'],['pedile','pídele'],['abrazá','abraza'],['seguí','sigue'],['volvé','vuelve'],['acordate','acuérdate'],['dale','vale'],['vos','tú'],['pasá','pasa'],['agarrá','coge'],
 ['empezá','empieza'],['terminá','termina'],['llená','llena'],['tirá','tira'],['salís','sales'],['estás','estás'],['cuidás','cuidas'],['regás','riegas'],['tapá','tapa'],['frotá','frota'],['limpiá','limpia'],['sacudí','sacude'],['sonreí','sonríe'],['dejá','deja'],['tocalo','tócalo'],['tocala','tócala'],['llevala','llévala'],['llevalas','llévalas'],['llevalo','llévalo'],['llevalos','llévalos'],['atrapalas','atrápalas'],['atrapalos','atrápalos'],['buscalo','búscalo'],['buscala','búscala'],['girá','gira'],['contá','cuenta'],['llamás','llamas'],
 ['comprás','compras'],['comprá','compra'],['ganás','ganas'],['mostráselo','enséñaselo'],['mostrale','enséñale'],['acomodá','coloca'],['tocalas','tócalas'],['tocalos','tócalos'],['tocala','tócala'],['juntás','juntas'],['canjeás','canjeas'],['el moño','el lazo'],['moño','lazo'],['el trencito','el trenecito'],['trencito','trenecito'],['cantá','canta'],['cantás','cantas'],['seguilo','síguelo'],['seguila','síguela'],['dibujá','dibuja'],['unila','únela'],['uní','une'],['soplale','sóplale'],['decorá','decora'],['disfrazá','disfraza'],['lavá','lava'],['secá','seca'],['cepillá','cepilla'],['enjuagá','enjuaga'],['mojá','moja'],['tenías','tenías'],['andá','ve'],['subí','sube'],['bajá','baja'],['apagá','apaga'],['prendé','enciende'],['cerrá','cierra'],['abrí','abre'],['pensá','piensa'],['adiviná','adivina'],['escondé','esconde'],['pegá','pega'],['mové','mueve'],['movés','mueves'],['ordenás','ordenas'],['inflá','infla'],['probalas','pruébalas'],['probalos','pruébalos'],['ordenalas','ordénalas'],['ordenalos','ordénalos'],['una carpa','una tienda de campaña'],['la frazada','la manta'],['frazada','manta'],['terminás','terminas'],['reventá','revienta'],['repetilo','repítelo'],['jugá','juega'],['repetí','repite'],['abrilo','ábrelo']];
// _tuRe: TU convertida en expresiones regulares que solo cambian palabras enteras (\p{L} = cualquier letra, también con tilde), sin distinguir mayúsculas.
const _tuRe=TU.map(([a,b])=>[new RegExp('(^|[^\\p{L}])('+a+')(?=[^\\p{L}]|$)','giu'),b]);
// tx(texto): adapta un texto rioplatense a castellano de España si S.variant==='es'; si no, lo devuelve igual.
// Respeta la mayúscula inicial de cada palabra cambiada. say() la aplica siempre (salvo en inglés). OJO: el MP3
// grabado se busca con el texto YA adaptado, así que cambiar un par de TU puede dejar frases sin audio.
function tx(s){
  if(S.variant!=='es'||!s)return s;
  for(const [re,b] of _tuRe)s=s.replace(re,(m,p,w)=>p+(w[0]!==w[0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b));
  return s;
}
// V(x): si x es una lista [rioplatense, España], elige según S.variant; si es un texto, le pasa tx().
// Se usa cuando la frase cambia demasiado entre variantes para que baste con tx().
const V=x=>Array.isArray(x)?(S.variant==='es'?x[1]:x[0]):tx(x);

/* ---------- imágenes SVG ---------- */
// IMG: imágenes listas para dibujar (clave = nombre del dibujo en PICS, más tito, erizo, tortuga, conejo, lupi, glasses y hand).
// IMGG: versiones "sin colorear" (gris) que crea greyOf() la primera vez que se piden.
const IMG={},IMGG={};
// svgImg(interior, viewBox, px): crea una imagen a partir de un trozo de SVG. px es el ancho en píxeles y el alto sale de
// la proporción del viewBox. La imagen carga de forma asíncrona: hay que mirar .complete antes de dibujarla.
function svgImg(inner,vb,px){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${px}" height="${Math.round(px*(+vb.split(' ')[3])/(+vb.split(' ')[2]))}">${inner}</svg>`);return i}
// Se convierten en imagen todos los dibujos de pics-*.js (cada uno está dibujado en un cuadro de -62 a 62).
for(const k in PICS) IMG[k]=svgImg(PICS[k],'-62 -62 124 124',320);
// Personajes: Tito en sus cuatro formas, Lupi, las gafas y la mano que señala en las ayudas.
IMG.tito=svgImg(TITO_SVG,'0 0 240 200',480);IMG.erizo=svgImg(ERIZO_SVG,'0 0 240 200',480);IMG.tortuga=svgImg(TORTUGA_SVG,'0 0 240 200',480);IMG.conejo=svgImg(CONEJO_SVG,'0 0 240 200',480); IMG.lupi=svgImg(LUPI_SVG,'0 0 200 230',420); IMG.glasses=svgImg(GLASSES_SVG,'0 0 200 230',420); IMG.hand=svgImg(HAND_SVG,'0 0 80 110',160);
// greyOf(dibujo): versión "sin colorear" del dibujo (rellenos crema y bordes claros; lo que es tinta K se mantiene).
// Se crea la primera vez y se guarda en IMGG.
function greyOf(k){if(!IMGG[k]&&PICS[k])IMGG[k]=svgImg(PICS[k].replace(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g,(m,a,c)=>c.toUpperCase()===K.toUpperCase()?m:(a==='fill'?'fill="#FBF8F2"':'stroke="#D8D0C4"')),'-62 -62 124 124',320);return IMGG[k]}
// pic(dibujo, x, y, tamaño, alfa): dibuja IMG[dibujo] centrado en (x,y). Si aún no ha cargado, no dibuja nada.
function pic(n,x,y,s,a=1){const i=IMG[n]; if(!i||!i.complete)return; ctx.globalAlpha*=a; ctx.drawImage(i,x-s/2,y-s/2,s,s); ctx.globalAlpha/=a}
// picG(dibujo, x, y, tamaño): igual que pic() pero con la versión en gris.
function picG(n,x,y,s){const i=greyOf(n); if(!i||!i.complete)return; ctx.drawImage(i,x-s/2,y-s/2,s,s)}

/* ---------- nombres de los dibujos (rioplatense; tx() los pasa a España) ---------- */
// LEX: nombre con artículo de cada dibujo, en rioplatense (tx() lo pasa a España). Formato {claveDelDibujo: 'el nombre'}.
// lex.js añade muchos más. Para un dibujo nuevo, añade aquí o en lex.js su clave con su nombre.
const LEX={gato:'el gato',pato:'el pato',sol:'el sol',luna:'la luna',mesa:'la mesa',fresa:'la frutilla',casa:'la casa',bota:'la bota',pelota:'la pelota',mono:'el mono',pan:'el pan',manzana:'la manzana',
 mariposa:'la mariposa',leon:'el león',abeja:'la abeja',avion:'el avión',arbol:'el árbol',elefante:'el elefante',estrella:'la estrella',oso:'el oso',ojo:'los ojos',oveja:'la oveja',uva:'las uvas',pez:'el pez',
 corazon:'el corazón',caracol:'el caracol',lapiz:'el lápiz',tortuga:'la tortuga',tomate:'el tomate',nube:'la nube',nariz:'la nariz',nido:'el nido',dinosaurio:'el dinosaurio',foca:'la foca',flor:'la flor',
 perro:'el perro',auto:'el auto',vaca:'la vaca',cama:'la cama',silla:'la silla',zapato:'el zapato',banana:'la banana',helado:'el helado',pera:'la pera',leche:'la leche',globo:'el globo',barco:'el barco',
 tren:'el tren',rana:'la rana',mano:'la mano',pie:'el pie',sandia:'la sandía',cohete:'el cohete',regalo:'el regalo',papa:'papá',pino:'el pino',moto:'la moto',pala:'la pala',
 hoja:'la hoja',hojaNaranja:'la hoja naranja',hojaRoja:'la hoja roja',hojaMarron:'la hoja marrón',mochila:'la mochila',pinturas:'las pinturas',cuento:'el cuento',tobogan:'el tobogán',boca:'la boca',
 oreja:'la oreja',cara:'la cara',gota:'la gota de agua',ballena:'la ballena',castana:'la castaña',seta:'la seta',paraguas:'el paraguas',botasAgua:'las botas de lluvia',lluvia:'la lluvia',nublado:'las nubes',
 nieve:'la nieve',tormenta:'la tormenta',viento:'el viento',niebla:'la niebla',arcoiris:'el arcoíris',ardilla:'la ardilla',abrigo:'el abrigo',gorro:'el gorro',bufanda:'la bufanda',guantes:'los guantes',
 copo:'el copo de nieve',muneco:'el muñeco de nieve',remera:'la remera',gafas:'los anteojos de sol',gorra:'la gorra',naranja:'la naranja',zumo:'el jugo',banera:'la bañera',nevera:'la heladera',sofa:'el sillón',
 inodoro:'el inodoro',tele:'la tele',cepillo:'el cepillo de dientes',olla:'la olla',cerdo:'el chancho',gallina:'la gallina',caballo:'el caballo',pollito:'el pollito',mariquita:'la mariquita',pajaro:'el pájaro',
 regadera:'la regadera',autobus:'el colectivo',bici:'la bici',cubo:'el balde',toalla:'la toalla',crema:'la crema para el sol',castillo:'el castillo de arena',concha:'la concha',galleta:'la galleta',
 plato:'el plato',bol:'el bol',macedonia:'la ensalada de frutas',maceta:'la maceta',estrellaMar:'la estrella de mar',mama:'mamá',hermano:'el hermano',hermana:'la hermana',bebe:'el bebé',
 abuelo:'el abuelo',abuela:'la abuela',maestra:'la maestra',nene:'el nene'};
// palabras que cambian mucho entre variantes: [rioplatense, España]
const LEX2={sofa:['el sillón','el sofá'],cubo:['el balde','el cubo'],macedonia:['la ensalada de frutas','la macedonia'],crema:['la crema para el sol','la crema solar'],mariquita:['la vaquita de San Antonio','la mariquita'],
 maestra:['la seño','la profe'],botasAgua:['las botas de lluvia','las botas de agua'],tele:['la tele','la tele'],seta:['el hongo','la seta'],sandia:['la sandía','la sandía']};
// Para nombrar dibujos (k = clave del dibujo): W_ con artículo ('el gato'), usando LEX2 si la palabra cambia mucho y si no LEX + tx().
const W_=k=>LEX2[k]?V(LEX2[k]):tx(LEX[k]||k);              // con artículo
// Wn(k): nombre sin artículo ('gato').
const Wn=k=>W_(k).replace(/^(el|la|los|las) /,'');           // sin artículo
// art(k): solo el artículo ('el', 'la', 'los', 'las' o '').
const art=k=>{const m=W_(k).match(/^(el|la|los|las) /);return m?m[1]:''};
// dela(k): 'del gato', 'de la luna' (contrae de + el).
const dela=k=>{const a=art(k);return a==='el'?'del '+Wn(k):(a?'de '+W_(k):'de '+W_(k))};
// ala(k): 'al gato', 'a la luna' (contrae a + el).
const ala=k=>{const a=art(k);return a==='el'?'al '+Wn(k):'a '+W_(k)};

/* ---------- dibujo básico ---------- */
// rr(x,y,ancho,alto,radio): traza (sin pintarlo) un rectángulo con esquinas redondeadas; después hay que rellenar o bordear.
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
// fillStroke(relleno, grosor, colorBorde): rellena y/o bordea el trazo actual. relleno null = solo borde; grosor 0 = sin borde.
function fillStroke(f,lw=6,s=K){if(f){ctx.fillStyle=f;ctx.fill()} if(lw){ctx.lineWidth=lw;ctx.strokeStyle=s;ctx.lineJoin='round';ctx.stroke()}}
// card(x,y,w,h,relleno,grosor,radio,borde): tarjeta redondeada con borde; (x,y) es la esquina de arriba a la izquierda.
function card(x,y,w,h,f='#fff',lw=6,r=36,s=K){rr(x,y,w,h,r);fillStroke(f,lw,s)}
// circ(x,y,radio,relleno,grosor,borde): círculo con relleno y borde.
function circ(x,y,r,f,lw=6,s=K){ctx.beginPath();ctx.arc(x,y,r,0,PI*2);fillStroke(f,lw,s)}
// ell(x,y,rx,ry,relleno,grosor,borde): elipse.
function ell(x,y,rx,ry,f,lw=6,s=K){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);fillStroke(f,lw,s)}
// text(texto,x,y,tamaño,color,o): escribe texto. Opciones o: w (grosor de letra), f (fuente), al (alineación),
// bl (línea base), st (grosor del contorno; sin él no hay contorno), sc (color del contorno).
function text(t,x,y,size,color=K,o={}){
  ctx.font=`${o.w||700} ${size}px ${o.f||DF}`; ctx.textAlign=o.al||'center'; ctx.textBaseline=o.bl||'alphabetic';
  if(o.st){ctx.lineJoin='round';ctx.lineWidth=o.st;ctx.strokeStyle=o.sc||K;ctx.strokeText(t,x,y)}
  ctx.fillStyle=color; ctx.fillText(t,x,y);
}
// star(x,y,radio,relleno,grosor): estrella de 5 puntas (rondas, premios, partículas).
function star(x,y,r,f,lw){ctx.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,q=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}ctx.closePath();fillStroke(f,lw??r*.13)}
// hand(x,y,ancho,giro): la manita que señala en las ayudas; (x,y) queda cerca de la punta del dedo.
function hand(x,y,w,rot=-.2){const i=IMG.hand;if(!i.complete)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(i,-w*.47,0,w,w*1.37);ctx.restore()}
// speaker(x,y,tamaño,color): icono de altavoz (bocadillo de Tito mientras habla, botones de volver a escuchar).
function speaker(x,y,s,c=K){ctx.save();ctx.translate(x,y);ctx.scale(s/60,s/60);ctx.beginPath();ctx.moveTo(-24,-8);ctx.lineTo(-12,-8);ctx.lineTo(4,-21);ctx.lineTo(4,21);ctx.lineTo(-12,8);ctx.lineTo(-24,8);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle=c;ctx.lineCap='round';ctx.beginPath();ctx.arc(6,0,12,-.9,.9);ctx.stroke();ctx.beginPath();ctx.arc(6,0,22,-.9,.9);ctx.stroke();ctx.restore()}
// sky(colorArriba, colorAbajo): pinta todo el fondo con un degradado vertical.
function sky(top,bot){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
// cloud(x,y,escala,color): nube hecha con 4 círculos.
function cloud(x,y,s,c='#fff'){ctx.fillStyle=c;for(const [a,b,r] of [[0,0,40],[40,-18,46],[86,0,38],[44,12,40]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,PI*2);ctx.fill()}}
// flower(x,y,radio,color,grosor): flor de 5 pétalos con centro amarillo (las del caparazón de Tito).
// Nota: T*.0 vale siempre 0, así que la flor no gira.
function flower(x,y,r,c,lw=3){for(let i=0;i<5;i++){const a=i*PI*2/5+T*.0;circ(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.5,c,lw)}circ(x,y,r*.42,'#FFD66B',lw)}

/* ---------- puntero: ratón grande, pasar por encima ---------- */
// Puntero en coordenadas lógicas (1600x900): MX/MY posición; mouseOn solo es true con ratón (con el dedo no hay "pasar por encima").
// hovNow: id de lo que está bajo el ratón en este cuadro (lo apunta hv() al dibujar); hovPrev, hovT y dwellDone sirven para
// el sonidito al pasar por encima y para decir el nombre si el ratón se queda quieto (hoverTick() en adult.js).
let MX=-9,MY=-9,mouseOn=false,hovNow=null,hovPrev=null,hovT=0,dwellDone=false;
// hR(x,y,w,h): ¿el ratón está dentro del rectángulo centrado en (x,y)? Nunca con el dedo ni mientras se arrastra.
const hR=(x,y,w,h)=>mouseOn&&!drag&&Math.abs(MX-x)<w/2&&Math.abs(MY-y)<h/2;
// hC(x,y,r): ¿el ratón está dentro del círculo de centro (x,y) y radio r?
const hC=(x,y,r)=>mouseOn&&!drag&&dist(MX,MY,x,y)<r;
// hv(id, encima): si encima es cierto, apunta id como lo que hay bajo el ratón y devuelve 1.07 (escala para agrandarlo un poco);
// si no, devuelve 1. Uso típico al dibujar un botón: const s=hv('boton',hC(x,y,r)).
function hv(id,hit){if(hit){hovNow=id;return 1.07}return 1}
// CUR: cursores dibujados a mano (pt = mano que señala, grab = puño al arrastrar); curMode: el que está puesto.
let CUR={},curMode='';
// makeCursors(): dibuja los dos cursores en un lienzo de 48x48 y los convierte en imagen para el CSS. Si falla, usa los del sistema.
(function makeCursors(){
  // mk(dibujo, x, y): crea un cursor con su punto activo en (x,y).
  const mk=(draw,hx,hy)=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');draw(g);return `url(${c.toDataURL()}) ${hx} ${hy}, pointer`};
  // pt: mano blanca con el índice levantado.
  const pt=g=>{g.lineJoin='round';g.lineCap='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#fff';
    g.beginPath();g.moveTo(15,3);g.quadraticCurveTo(21,0,22,7);g.lineTo(22,20);g.lineTo(34,20);g.quadraticCurveTo(43,21,43,30);g.lineTo(42,36);g.quadraticCurveTo(40,45,30,45);g.lineTo(18,45);g.quadraticCurveTo(8,44,7,34);g.lineTo(7,26);g.quadraticCurveTo(7,22,11,22);g.lineTo(11,7);g.quadraticCurveTo(11,2,15,3);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(28,21);g.lineTo(28,29);g.moveTo(35,22);g.lineTo(35,30);g.stroke()};
  // fist: puño amarillo (mientras se arrastra).
  const fist=g=>{g.lineJoin='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#FFE08A';
    g.beginPath();g.moveTo(8,18);g.quadraticCurveTo(8,10,16,10);g.lineTo(36,10);g.quadraticCurveTo(44,10,44,20);g.lineTo(44,32);g.quadraticCurveTo(44,44,30,44);g.lineTo(18,44);g.quadraticCurveTo(8,44,8,32);g.closePath();g.fill();g.stroke();
    g.beginPath();for(const x of[17,26,35]){g.moveTo(x,10);g.lineTo(x,22)}g.stroke()};
  try{CUR.pt=mk(pt,15,3);CUR.grab=mk(fist,24,24)}catch(e){CUR.pt='pointer';CUR.grab='grabbing'}
})();
// setCursor('pt' o 'grab'): cambia el cursor del lienzo (solo si cambia, para no tocar el CSS en cada cuadro).
function setCursor(m){if(m!==curMode){curMode=m;cv.style.cursor=CUR[m]||'pointer'}}
setCursor('pt');

/* ---------- Tito ---------- */
// TITO: posición y ancho de Tito en las escenas 2D (abajo a la izquierda).
const TITO={x:14,y:700,w:226};
// temasDone(): cuántos temas están completos; es el número de flores del caparazón de Tito.
const temasDone=()=>Object.values(S.temas).filter(t=>t&&t.done).length;
// FLPOS: sitio de cada flor del caparazón como [ángulo, distancia] desde el centro de las flores (15 como mucho). FLC: sus colores.
const FLPOS=[[-2.4,58],[-1.9,60],[-1.4,62],[-.9,61],[-.4,60],[-2.9,56],[2.6,52],[-2.15,38],[-1.6,40],[-1.05,40],[-.5,38],[-2.65,36],[2.9,40],[-1.9,22],[-1.2,22]];
const FLC=['#FF8A7A','#F58BB4','#FFC93C','#9B8AD9','#7FD3F0','#FF6B5E','#FFA94D'];
// personaje de Tito (zona de adultos): 'caracol' (por defecto), 'erizo', 'tortuga' o 'conejo'; ojos [x,y,r], boca y centro de las flores en el dibujo 2D de 240x200
// titoKind(): forma elegida para Tito (S.tito.kind); cualquier valor desconocido cuenta como 'caracol'.
const titoKind=()=>{const k=S.tito&&S.tito.kind;return k==='erizo'||k==='tortuga'||k==='conejo'?k:'caracol'};
// TITO_EYES: ojos de cada forma, para dibujar el parpadeo encima. TITO_2D: color de la piel (tapa los ojos al parpadear),
// sitio de la boca y [x, y, escala] del centro de las flores.
const TITO_EYES={caracol:[[174,20,15],[222,20,15]],erizo:[[184,94,13],[210,92,12]],tortuga:[[196,88,11],[220,86,10]],conejo:[[186,94,12],[210,90,11]]},TITO_2D={caracol:{skin:'#9BD86A',mouth:[206,116],fl:[96,100,1]},erizo:{skin:'#F2D6B0',mouth:[216,124],fl:[98,118,.82]},tortuga:{skin:'#8FD07A',mouth:[216,110],fl:[100,116,.95]},conejo:{skin:'#EDE3D6',mouth:[220,122],fl:[69,142,.5]}};
// drawTito(x,y,ancho,o): dibuja a Tito en 2D (en el mapa 3D lo dibuja world3d.js) con su balanceo, parpadeo, la boca
// que se abre mientras talking es true, las flores del caparazón y la ropa de la tienda (drawTitoWear).
// Opciones o: flip (mira a la izquierda), sq (aplastado, para saltar), sleep (ojos cerrados), mouth:false (sin boca),
// bubble:false (sin bocadillo de altavoz), flowers (número fijo de flores), plain (sin ropa).
function drawTito(x,y,w,o={}){
  const k=w/240,h=200*k,b=Math.sin(T*2.2)*w*.02,i=typeof titoImg==='function'?titoImg():IMG.tito; if(!i.complete)return;
  ctx.save();ctx.translate(x,y+b);
  if(o.flip){ctx.translate(w,0);ctx.scale(-1,1)}
  const sq=o.sq||0;ctx.translate(w/2,h);ctx.scale(1+sq,1-sq);ctx.translate(-w/2,-h);
  // antenas que se mueven
  ctx.drawImage(i,0,0,w,h);
  const blink=o.sleep||((T+.5)%3.9)<.14;
  const tk=titoKind(),D=TITO_2D[tk];
  if(blink)for(const [ex,ey,er] of TITO_EYES[tk]){circ(ex*k,ey*k,(er+1)*k,D.skin,5*k);ctx.beginPath();ctx.moveTo((ex-10)*k,(ey+2)*k);ctx.quadraticCurveTo(ex*k,(ey+(o.sleep?10:7))*k,(ex+10)*k,(ey+2)*k);ctx.lineWidth=4*k;ctx.strokeStyle=K;ctx.stroke()}
  if(talking&&o.mouth!==false&&(T*7|0)%2){ell(D.mouth[0]*k,D.mouth[1]*k,11*k,9*k,'#7A2E3A',3.5*k)}
  // flores en el caparazón
  const n=Math.min(FLPOS.length,o.flowers??temasDone());
  for(let j=0;j<n;j++){const [a,r]=FLPOS[j],[fx,fy,fs]=D.fl;flower((fx+Math.cos(a)*r*fs)*k,(fy+Math.sin(a)*r*fs)*k,13*k*(1+Math.sin(T*3+j)*.05),FLC[j%FLC.length],2.5*k)}
  if(typeof drawTitoWear==='function'&&!o.plain)drawTitoWear(k);
  ctx.restore();
  if(talking&&o.bubble!==false&&!o.flip){const bx=x+w*.92,by=y-30;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}
}
// inTito(x,y): ¿el punto toca a Tito? (rectángulo aproximado alrededor de TITO).
const inTito=(x,y)=>x>TITO.x&&x<TITO.x+TITO.w&&y>TITO.y-40&&y<TITO.y+TITO.w*.85;

/* ---------- audio ---------- */
/* SONIDO. Todo se genera con Web Audio (no hay archivos de efectos). AC es el AudioContext; FX y MUS son dos
   "buses" de volumen (efectos y música) conectados a los altavoces; setVol() les pone el volumen de S.vol.
   Los navegadores no dejan sonar nada hasta que se toca la pantalla: por eso initAudio() se llama en cada toque. */
let AC=null,FX=null,MUS=null;
// SPK_OK: ya se "desbloqueó" la voz del navegador (en iOS hay que hablar una vez dentro de un toque).
let SPK_OK=false;
// initAudio(): se llama en cada toque (pointerdown en adult.js). Desbloquea la voz del navegador con una frase vacía
// y elige voz, crea y desbloquea el reproductor de voces grabadas (VOZ_EL), crea el AudioContext la primera vez (o lo
// reanuda si estaba parado) y aplica los volúmenes.
function initAudio(){
  if('speechSynthesis' in window){try{if(!SPK_OK){SPK_OK=true;const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);pickVoice()}else if(speechSynthesis.paused)speechSynthesis.resume()}catch(e){}}
  // Reproductor de las voces grabadas: se crea aquí, dentro del primer toque, y suena un instante de silencio. Safari
  // (iPhone/iPad) solo deja reproducir más tarde (vozPlay, tras descargar el MP3) un <audio> que ya sonó en un toque.
  if(!VOZ_EL&&typeof Audio==='function'){try{const a=VOZ_EL=new Audio(),sil='data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
    a.src=sil;const p=a.play();if(p)p.then(()=>{if(a.src===sil)a.pause()}).catch(()=>{})}catch(e){}}
  if(AC){if(AC.state!=='running')AC.resume();return}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();FX=AC.createGain();MUS=AC.createGain();FX.connect(AC.destination);MUS.connect(AC.destination);setVol()}catch(e){AC=null}
}
// setVol(): aplica S.vol.fx y S.vol.mus a los buses FX y MUS (con un factor para que no suenen demasiado fuerte).
function setVol(){if(!AC)return;FX.gain.value=S.vol.fx*.6;MUS.gain.value=S.vol.mus*.22}
// tone(frecuencia Hz, duración s, tipo, volumen, slide, retraso s, bus): un pitido sencillo.
// tipo de onda: 'sine' (suave), 'triangle', 'square' (más electrónico) o 'sawtooth' (áspero). slide: si no es 0, la
// frecuencia acaba en f*slide (2 sube una octava, .5 la baja). El volumen sube en 12 ms y luego se apaga poco a poco.
// bus: por defecto FX (efectos); la música usa MUS. Si el audio aún no está creado, no hace nada.
function tone(f,d=.15,type='sine',v=.5,slide=0,delay=0,bus){
  if(!AC)return; const t=AC.currentTime+delay, o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g); g.connect(bus||FX); o.start(t); o.stop(t+d+.05);
}
// noise(duración, volumen, frecuencia, retraso, q): ruido blanco pasado por un filtro de banda centrado en frecuencia
// (q alto = filtro más estrecho, sonido más "afinado"). Sirve para golpes, soplidos, chapoteos, pasos... Se apaga poco a poco.
function noise(d=.2,v=.3,f=1200,delay=0,q=1){
  if(!AC)return; const t=AC.currentTime+delay, n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), da=b.getChannelData(0);
  for(let i=0;i<n;i++)da[i]=Math.random()*2-1; const s=AC.createBufferSource(); s.buffer=b;
  const fl=AC.createBiquadFilter(); fl.type='bandpass'; fl.frequency.value=f; fl.Q.value=q; const g=AC.createGain();
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl); fl.connect(g); g.connect(FX); s.start(t);
}
// voz sintetizada para animales y vehículos: o={f,f2,d,type,v,vib,vibA,lp,delay,att}
// syn(o): un sonido con forma, para imitar animales y vehículos. Campos de o: f frecuencia inicial; fm frecuencia al 40%;
// f2 frecuencia final; d duración; type onda; v volumen; vib/vibA velocidad y amplitud del vibrato; lp filtro paso bajo (Hz);
// bp filtro de banda; q anchura del filtro; delay retraso; att tiempo de subida del volumen.
function syn(o){
  if(!AC)return; const t=AC.currentTime+(o.delay||0),d=o.d||.4,os=AC.createOscillator(),g=AC.createGain();
  os.type=o.type||'sawtooth'; os.frequency.setValueAtTime(o.f,t); if(o.fm)os.frequency.linearRampToValueAtTime(o.fm,t+d*.4); if(o.f2)os.frequency.linearRampToValueAtTime(o.f2,t+d);
  let last=os;
  if(o.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibA||10;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05)}
  if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=o.q||1;last.connect(f);last=f}
  if(o.bp){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=o.bp;f.Q.value=o.q||2;last.connect(f);last=f}
  const v=o.v||.4,a=o.att||.03; g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-.12));g.gain.linearRampToValueAtTime(0,t+d);
  last.connect(g);g.connect(FX);os.start(t);os.stop(t+d+.05);
}
// SFX: efectos cortos de la interfaz. Uso: SFX.good(). tap toque; hov ratón encima; pop; good acierto; bad fallo; whoosh;
// tada premio; sparkle brillo; munch comer; boing; drip gota; dig cavar; snap encajar; grow crecer; splash agua;
// count(n) nota que sube con cada número al contar.
const SFX={
  tap:()=>tone(660,.08,'triangle',.25),
  hov:()=>tone(1100,.05,'sine',.06,1.3),
  pop:()=>{tone(900,.09,'sine',.5,.4);noise(.06,.2,3000)},
  good:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.22,'triangle',.35,0,i*.08)),
  bad:()=>{tone(300,.25,'sine',.3,.6);tone(240,.3,'triangle',.18,.7,.08)},
  whoosh:()=>noise(.5,.25,900),
  tada:()=>[523,659,784,1046,1318].forEach((f,i)=>{tone(f,.4,'triangle',.3,0,i*.1);tone(f*2,.3,'sine',.1,0,i*.1+.05)}),
  sparkle:()=>{for(let i=0;i<6;i++)tone(1200+i*220,.12,'sine',.15,0,i*.05)},
  munch:()=>{for(let i=0;i<4;i++)noise(.07,.35,500+i*150,i*.12)},
  boing:()=>tone(220,.35,'sine',.4,2.2),
  drip:()=>{tone(1400,.08,'sine',.25,.5);tone(900,.1,'sine',.15,.6,.08)},
  dig:()=>noise(.12,.25,500+Math.random()*400,0,.7),
  snap:()=>{tone(500,.06,'square',.12,1.5);tone(800,.08,'triangle',.25,0,.05)},
  grow:()=>[392,494,587,784].forEach((f,i)=>tone(f,.18,'sine',.2,1.02,i*.07)),
  splash:()=>{noise(.3,.3,1500,0,.5);tone(700,.15,'sine',.15,.5)},
  count:n=>tone(440*Math.pow(2,(n*2)/12),.18,'triangle',.3)
};
// SOUNDS: sonido de cada animal o vehículo, con la misma clave que su dibujo; suena con playSound(clave). lex.js añade más.
// Para uno nuevo: añade clave:()=>{syn({...})} aquí o en lex.js, y su onomatopeya en ONO.
const SOUNDS={
  vaca:()=>{syn({f:150,fm:165,f2:118,d:1.1,lp:520,v:.55,vib:4,vibA:3,att:.12})},
  oveja:()=>{syn({f:420,f2:380,d:.8,lp:1700,vib:11,vibA:30,v:.4,att:.06})},
  cerdo:()=>{for(let i=0;i<3;i++){syn({f:95,f2:80,d:.16,lp:420,v:.6,delay:i*.2,type:'sawtooth'});noise(.15,.25,350,i*.2,2)}},
  gallina:()=>{[0,.16,.32].forEach(dl=>syn({f:620,f2:480,d:.11,type:'square',bp:900,q:3,v:.3,delay:dl}));syn({f:760,fm:1100,f2:700,d:.35,type:'square',bp:1000,q:3,v:.3,delay:.5})},
  caballo:()=>{syn({f:950,f2:420,d:1.1,vib:13,vibA:90,lp:2600,v:.3,att:.05})},
  pato:()=>{[0,.25].forEach(dl=>syn({f:330,f2:290,d:.18,type:'sawtooth',bp:1100,q:4,v:.5,delay:dl}))},
  perro:()=>{[0,.3].forEach(dl=>{noise(.12,.5,600,dl,1.5);syn({f:260,f2:150,d:.14,type:'sawtooth',lp:900,v:.4,delay:dl})})},
  gato:()=>{syn({f:520,fm:820,f2:470,d:.75,type:'triangle',vib:6,vibA:12,v:.35,att:.08})},
  pollito:()=>{[0,.18,.36].forEach(dl=>syn({f:2300,f2:2900,d:.1,type:'sine',v:.25,delay:dl}))},
  pajaro:()=>{[0,.12,.24,.5,.62].forEach((dl,i)=>syn({f:2600+i*120,f2:3400,d:.08,type:'sine',v:.2,delay:dl}))},
  abeja:()=>{syn({f:220,f2:240,d:1,type:'sawtooth',vib:30,vibA:8,lp:900,v:.25})},
  auto:()=>{[0,.26].forEach(dl=>{syn({f:440,d:.18,type:'square',lp:1800,v:.22,delay:dl});syn({f:554,d:.18,type:'square',lp:1800,v:.18,delay:dl})})},
  autobus:()=>{syn({f:220,d:.6,type:'square',lp:900,v:.25});syn({f:277,d:.6,type:'square',lp:900,v:.2})},
  tren:()=>{[0,.22,.44,.66].forEach(dl=>noise(.16,.35,1600,dl,.8));syn({f:880,d:.7,type:'triangle',v:.2,delay:.95});syn({f:1100,d:.7,type:'triangle',v:.16,delay:.95})},
// avion: ruido largo cuyo filtro sube de 300 a 2400 Hz (como un avión que se acerca y pasa).
  avion:()=>{if(!AC)return;const t=AC.currentTime,n=AC.sampleRate*1.6,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2400,t+1.5);const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.4,t+.8);g.gain.linearRampToValueAtTime(0,t+1.6);s.connect(f);f.connect(g);g.connect(FX);s.start(t)},
  barco:()=>{syn({f:98,d:1.2,type:'sawtooth',lp:500,v:.45,att:.1});syn({f:147,d:1.2,type:'sawtooth',lp:500,v:.25,att:.1})},
  bici:()=>{[0,.3].forEach(dl=>{tone(2100,.6,'sine',.25,0,dl);tone(2620,.5,'sine',.12,0,dl)})},
  moto:()=>{syn({f:70,fm:150,f2:110,d:1.1,type:'sawtooth',lp:700,vib:28,vibA:12,v:.4})},
  rana:()=>{[0,.3].forEach(dl=>syn({f:180,f2:140,d:.2,type:'square',bp:600,q:3,v:.35,delay:dl}))},
  leon:()=>{syn({f:110,fm:160,f2:70,d:1.1,type:'sawtooth',lp:600,vib:20,vibA:15,v:.5,att:.1});noise(1,.2,400,0,.6)},
  elefante:()=>{syn({f:600,fm:900,f2:500,d:.9,type:'sawtooth',lp:2000,vib:8,vibA:30,v:.3})},
  mono:()=>{[0,.15,.3,.45].forEach((dl,i)=>syn({f:500+i*80,f2:900,d:.12,type:'square',bp:1200,q:2,v:.2,delay:dl}))}
};
// onomatopeyas que dice la voz
// ONO: {clave: onomatopeya} que dice la voz después del sonido (tienen MP3 grabado: no cambies el texto).
const ONO={vaca:'¡Muuu!',oveja:'¡Beee!',cerdo:'¡Oinc, oinc!',gallina:'¡Clo, clo, clo!',caballo:'¡Iiiiii!',pato:'¡Cuac, cuac!',perro:'¡Guau, guau!',gato:'¡Miau!',pollito:'¡Pío, pío!',pajaro:'¡Pío, pío, pío!',
 abeja:'¡Bzzz!',auto:'¡Bip, bip!',autobus:'¡Mooc, mooc!',tren:'¡Chu, chu!',avion:'¡Fiuuum!',barco:'¡Buuuu!',bici:'¡Rin, rin!',moto:'¡Brum, brum!',rana:'¡Croac!',leon:'¡Grrr!',elefante:'¡Prrrr!',mono:'¡U, u, a, a!'};
// playSound(clave): hace el sonido SOUNDS[clave] si existe (los errores de audio se ignoran).
function playSound(k){if(SOUNDS[k])try{SOUNDS[k]()}catch(e){}}

/* música suave generativa */
// MUSIC: música de fondo; cada escena elige una con su campo music. s = escala (semitonos sobre la nota base),
// b = nota base (número MIDI: 60 es el do central), sp = segundos entre notas.
const MUSIC={
  title:{s:[0,2,4,7,9],b:64,sp:.5},map:{s:[0,2,4,7,9],b:60,sp:.5},plaza:{s:[0,4,5,7,9],b:62,sp:.46},jardin:{s:[0,2,4,7,9],b:65,sp:.44},
  casita:{s:[0,2,4,5,7,9],b:62,sp:.48},game:{s:[0,2,4,5,7,9],b:60,sp:.48},book:{s:[0,3,5,7,10],b:57,sp:.6}
};
// musKey: música que suena (null = ninguna); musNext: momento (en el reloj de audio) de la siguiente nota; musStep: número de nota.
let musKey=null,musNext=0,musStep=0;
// musicTick(): se llama en cada cuadro desde frame(). Programa con 0,3 s de antelación las notas que tocan (así el ritmo no
// depende de los cuadros por segundo): una melodía de 16 pasos que recorre la escala y, cada 8 pasos, una nota grave larga.
// Algunas notas se saltan al azar para que no suene siempre igual.
function musicTick(){
  if(!AC||!musKey||S.vol.mus<=0)return; const m=MUSIC[musKey]; if(!m)return;
  while(musNext<AC.currentTime+.3){
    if(musNext<AC.currentTime)musNext=AC.currentTime+.05;
    const d=musNext-AC.currentTime, st=musStep%16;
// nota de la escala para este paso: cada 16 pasos cambia el punto de partida y en el paso 4 de cada 8 sube una octava.
    const deg=m.s[(st*3+((musStep/16|0)%4)*2)%m.s.length]+(st%8===4?12:0);
    if(st%2===0||Math.random()<.35) tone(440*Math.pow(2,(m.b+deg-69)/12),m.sp*1.6,'triangle',.25,0,d,MUS);
    if(st%8===0) tone(440*Math.pow(2,(m.b-12+m.s[(musStep/8|0)%3]-69)/12),m.sp*6,'sine',.3,0,d,MUS);
    musNext+=m.sp; musStep++;
  }
}
/* ---------- voz ---------- */
// VOICE / VOICE_EN: voces del navegador elegidas para español e inglés. talking: true mientras Tito habla (mueve la boca).
// sayTok: número de la última frase; sirve para ignorar el final de frases que ya se cortaron.
let VOICE=null,VOICE_EN=null,talking=false,sayTok=0;
// vozCalidad(v): puntos de calidad de una voz del navegador según su nombre. Las «naturales» o en línea (Edge: «Online
// (Natural)») valen 4; las mejoradas de Apple («Premium», «Enhanced», «Mejorada») 3; las de Google y Siri 2; el resto 0.
const vozCalidad=v=>/natural|online|neural/i.test(v.name)?4:/premium|enhanced|mejorad/i.test(v.name)?3:/google|siri/i.test(v.name)?2:0;
// vocesES(): las voces en español del navegador, de mejor a peor calidad (vozCalidad); a igual calidad, el orden del navegador.
function vocesES(){if(!('speechSynthesis' in window))return [];return speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang)).map((v,i)=>[v,i]).sort((a,b)=>vozCalidad(b[0])-vozCalidad(a[0])||a[1]-b[1]).map(a=>a[0])}
// pickVoice(): elige la voz del navegador. Si en la zona de adultos se eligió una (S.vozNav, su voiceURI o nombre) y está
// en este aparato, usa esa. Si no, la automática: primero por país (España, o Argentina/Uruguay en rioplatense) y,
// dentro del país, la de más calidad (vozCalidad). También elige la voz inglesa (británica en modo España).
function pickVoice(){
  if(!('speechSynthesis' in window))return; const all=speechSynthesis.getVoices(),en=all.filter(v=>/^en/i.test(v.lang));
  if(en.length){const pe=S.variant==='es'?['en-GB','en-IE','en-US','en-AU']:['en-US','en-GB','en-CA','en-AU'],Le=v=>v.lang.replace('_','-').toLowerCase();VOICE_EN=null;
    for(const p of pe){const c=en.filter(v=>Le(v)===p.toLowerCase());if(c.length){VOICE_EN=c.find(v=>/google|natural|premium|enhanced/i.test(v.name))||c[0];break}}if(!VOICE_EN)VOICE_EN=en[0]}
  const vs=vocesES(); if(!vs.length)return;
  if(typeof S.vozNav==='string'&&S.vozNav){const v=vs.find(v=>v.voiceURI===S.vozNav||v.name===S.vozNav);if(v){VOICE=v;return}}// la elegida (si no está en este aparato, la automática)
  const pref=S.variant==='es'?['es-ES','es-MX','es-US','es-419','es-AR']:['es-AR','es-UY','es-US','es-419','es-MX','es-CO','es-ES'];
  const L=v=>v.lang.replace('_','-');
  for(const p of pref){const c=vs.find(v=>L(v).toLowerCase()===p.toLowerCase()); if(c){VOICE=c;return}}// vs ya va de mejor a peor
  VOICE=vs[0];
}
// vozProbar(): dice un saludo con la voz del navegador elegida (VOICE), aunque S.voz sea la grabada, para comparar voces
// en la zona de adultos. Corta lo que estuviera sonando. Usa una frase que ya existe (no hay frase nueva).
function vozProbar(){try{speechSynthesis.cancel()}catch(e){}const tok=++sayTok;sayTTS(tx('¡Hola! Soy Tito. ¿Jugamos? Tocá la plaza.'),tok,()=>{})}
// Algunos navegadores cargan las voces tarde: se vuelve a elegir cuando avisan de que cambiaron.
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
/* ---------- voces grabadas: solo en la web (carpeta voz/ con manifest.json); si una frase no tiene audio, habla el navegador ---------- */
// vozN: junta espacios repetidos; vozK: clave de búsqueda en el manifest (sin punto final, en minúsculas). Así
// "¡Hola!  " y "¡hola!" encuentran el mismo audio.
const vozN=t=>t.replace(/\s+/g,' ').trim(),vozK=t=>vozN(t).replace(/[.\s]+$/,'').toLowerCase();
// S.voz: '' = la voz grabada de siempre (voz/), 'fer' = la voz de Fer (voz-fer/, mismos nombres de archivo); 'nav' = todo con la voz del navegador (no se usa ningún MP3)
// VOZ: {clave de frase: archivo mp3} leído del manifest (null si no hay); VOZ_DIR: carpeta actual; VOZ_EL: el único
// reproductor <audio>; VOZ_FIN: qué hacer al acabar la frase actual; VOZ_RATE: velocidad (0,9); VOZ_BL: audios ya descargados.
let VOZ=null,VOZ_DIR='voz/',VOZ_EL=null,VOZ_FIN=null;const VOZ_RATE=.9,VOZ_BL={};
// vozLoad(cb): carga voz/manifest.json o voz-fer/manifest.json (según S.voz) y llama a cb al acabar.
// Con S.voz 'nav' no carga nada: VOZ queda en null y say() habla siempre con la voz del navegador.
// El manifest tiene la forma {"f": {"Frase exacta.": "archivo.mp3", ...}}. Solo funciona servido por http(s), no con file://.
// Si mientras tanto se cambió de carpeta, la respuesta vieja se descarta.
function vozLoad(cb){const dir=S.voz==='fer'?'voz-fer/':'voz/';VOZ=null;VOZ_DIR=dir;
  if(S.voz==='nav'){VOZ_DIR='';cb&&cb();return}// solo voz del navegador
  try{if(/^https?:/.test(location.protocol))fetch(dir+'manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(VOZ_DIR!==dir)return;if(m&&m.f){const v={};for(const k in m.f)v[vozK(k)]=m.f[k];VOZ=v}cb&&cb()}).catch(()=>{cb&&cb()})}catch(e){}}
vozLoad();
// vozFile(texto): plan para decir la frase con lo grabado: lista de trozos en orden, cada uno el nombre de un mp3
// (texto) o {t: texto} para lo que no está grabado (lo dice la voz del navegador). null si no hay nada grabado.
// Quita antes ", nombre" del niño (las grabaciones no lo llevan; say() lo añade aparte).
// Si la frase entera no está grabada, la parte en oraciones y busca trozos grabados de izquierda a derecha, cada vez el
// trozo más largo posible: "¡Súper!" + "¡Sus plumas! Lo tienen calentito." o "¡Muy bien!" + "La pelota.". Así una
// felicitación al azar (praise) delante de una frase grabada sin ella también suena con MP3. Las oraciones sin grabar
// (por ejemplo con datos que cambian: "Tienes 12 monedas.") quedan como {t} y se mezclan con las grabadas.
function vozFile(t){if(!VOZ)return null;t=vozN(S.name?t.split(', '+S.name).join(''):t);const one=VOZ[vozK(t)];if(one)return [one];
  const ss=(t.match(/[^.!?…]+[.!?…]*/g)||[]).map(vozN).filter(s=>vozK(s));if(!ss.length)return null;const fs=[];
  for(let i=0;i<ss.length;){let j=ss.length,f=null;for(;j>i;j--){f=VOZ[vozK(ss.slice(i,j).join(' '))];if(f)break}// j: fin del trozo más largo grabado que empieza en i
    if(f){fs.push(f);i=j;continue}
    const pz=vozPieces(ss[i]);if(pz){fs.push(...pz);i++;continue}// oración con números: por piezas grabadas
    const l=fs[fs.length-1];if(l&&l.t)l.t+=' '+ss[i];else fs.push({t:ss[i]});i++}// sin grabar: a la voz del navegador
  return fs.some(f=>typeof f==='string')?fs:null}
// VOZ_CIEN: cómo se dicen las centenas (101-199 "ciento", 200 "doscientos"...). Cada una es una pieza grabada.
const VOZ_CIEN=['ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
// vozNum(n): claves de manifiesto para decir el número n con piezas grabadas: "0".."100" tal cual, y de 101 a 999 la
// centena más el resto ("cuatrocientos" + "53"). null si es más grande o si falta alguna pieza por grabar.
function vozNum(n){if(VOZ[String(n)])return [String(n)];if(n<101||n>999)return null;const c=VOZ_CIEN[Math.floor(n/100)-1],r=n%100,k=r?[c,String(r)]:[c===VOZ_CIEN[0]?'cien':c];return k.every(x=>VOZ[x])?k:null}
// vozPieces(oración): solo para oraciones con números (fechas, monedas, estrellas...). Quita los signos (¡!¿?.,:), parte
// en palabras y las junta en piezas grabadas de izquierda a derecha, cada vez la más larga: "Hoy es jueves 22 de
// octubre." = "hoy es jueves" + "22" + "de octubre". Los números se dicen con vozNum. Devuelve la lista de mp3, o null
// si falta alguna pieza (entonces la oración la dice la voz del navegador).
function vozPieces(s){if(!/\d/.test(s))return null;const w=s.replace(/[¡!¿?.,:;]/g,' ').toLowerCase().split(/\s+/).filter(Boolean),fs=[];
  for(let i=0;i<w.length;){if(/^\d+$/.test(w[i])){const k=vozNum(+w[i]);if(!k)return null;for(const x of k)fs.push(VOZ[x]);i++;continue}
    let j=w.length,f=null;for(;j>i;j--){if(w.slice(i,j).some(x=>/^\d+$/.test(x)))continue;f=VOZ[w.slice(i,j).join(' ')];if(f)break}// j: fin de la pieza más larga
    if(!f)return null;fs.push(f);i=j}
  return fs}
// como speechSynthesis.cancel(): cortar una frase también la da por terminada
// vozStop(): para el MP3 que suena y llama a su "fin" (así quien esperaba el final de la frase sigue).
function vozStop(){const f=VOZ_FIN;VOZ_FIN=null;if(VOZ_EL){VOZ_EL.onended=VOZ_EL.onerror=null;try{VOZ_EL.pause()}catch(e){}}f&&f()}
// Truco: se envuelve speechSynthesis.cancel() para que, al cortar la voz (por ejemplo en go()), también se corte el MP3.
if('speechSynthesis' in window){try{const c0=speechSynthesis.cancel.bind(speechSynthesis);speechSynthesis.cancel=()=>{vozStop();c0()}}catch(e){}}
// vozGet(archivo): promesa con la URL (blob) del mp3, descargándolo una sola vez (se guarda la promesa en VOZ_BL, así la
// precarga y la reproducción piden el mismo archivo una sola vez). Si falla, se borra para poder reintentar.
function vozGet(f){f=VOZ_DIR+f;return VOZ_BL[f]||(VOZ_BL[f]=fetch(f).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>URL.createObjectURL(b)).catch(e=>{delete VOZ_BL[f];throw e}))}
// vozPlay(archivos, tok, fin, fallo): reproduce los mp3 uno tras otro con el mismo <audio>. Los descarga todos a la vez
// (precarga) y los guarda como blob en VOZ_BL. Si entretanto empezó otra frase (tok!==sayTok), no suena.
// Al acabar el último llama a fin(); si algo falla llama a fallo() (say() usa entonces la voz del navegador).
function vozPlay(fs,tok,fin,fail){
  const a=VOZ_EL||(VOZ_EL=new Audio()),get=vozGet;
  const step=n=>{if(n>=fs.length){VOZ_FIN=null;fin();return}get(fs[n]).then(u=>{if(tok!==sayTok)return;if(n===0)vozStop();a.src=u;a.playbackRate=VOZ_RATE;a.preservesPitch=true;a.volume=Math.min(1,S.vol.voz);VOZ_FIN=fin;
    a.onended=()=>step(n+1);a.onerror=()=>{VOZ_FIN=null;fail()};const p=a.play();if(p)p.catch(()=>{VOZ_FIN=null;fail()})}).catch(()=>{VOZ_FIN=null;fail()})};
  Promise.all(fs.map(get)).catch(()=>{});step(0);
}
// sayTTS(texto, tok, luego): dice un trozo con la voz del navegador y después llama a luego() (una sola vez; también si
// se corta). Si la frase ya no es la actual (tok!==sayTok), no habla. Lo usa vozSeq para el nombre del niño y para las oraciones sin grabar de una frase mezclada.
// Sin voz del navegador, o si no avisa del final a tiempo, sigue igualmente.
function sayTTS(tt,tok,next){let go=false;const nx=()=>{if(go)return;go=true;next()};
  if(!('speechSynthesis' in window)||tok!==sayTok){nx();return}
  try{const u=new SpeechSynthesisUtterance(tt);if(VOICE){u.voice=VOICE;u.lang=VOICE.lang}else u.lang=S.variant==='es'?'es-ES':'es-AR';
    u.rate=.9;u.pitch=1.1;u.volume=S.vol.voz;u.onend=nx;u.onerror=nx;speechSynthesis.speak(u)}catch(e){nx();return}
  setTimeout(nx,1500+tt.length*95)}
// vozSeq(plan, tok, fin, fallo): dice un plan de vozFile (mp3 y trozos {t}) en orden: los mp3 seguidos se juntan en un
// solo vozPlay y los {t} los dice sayTTS. Precarga todos los mp3 al empezar. Al acabar llama a fin(); si falla un mp3,
// a fallo() (say() dice entonces la frase entera con la voz del navegador).
function vozSeq(plan,tok,fin,fail){plan.forEach(f=>{if(typeof f==='string')vozGet(f).catch(()=>{})});
  const step=i=>{if(tok!==sayTok||i>=plan.length){fin();return}// cortada por otra frase: también se da por terminada
    if(plan[i].t!=null){sayTTS(plan[i].t,tok,()=>step(i+1));return}
    let j=i;while(j<plan.length&&typeof plan[j]==='string')j++;// i..j-1: mp3 seguidos
    vozPlay(plan.slice(i,j),tok,()=>step(j),fail)};
  step(0)}
/* say(texto, cb, o): Tito dice una frase. Es LA función de voz del juego.
   - texto: se pasa por tx() (salvo en inglés, o.en). Con el texto final se busca un MP3 grabado (voz/manifest.json o
     voz-fer/); si lo hay suena el MP3 y, si no, habla la voz del navegador (speechSynthesis).
     Si solo una parte está grabada, se mezclan: lo grabado con MP3 y el resto (datos que cambian, como fechas o
     monedas) con la voz del navegador (vozFile/vozSeq). Si lleva el nombre del niño (", nombre"), el nombre lo dice
     antes la voz del navegador y luego suena lo grabado sin el nombre.
   - cb: se llama al terminar la frase, pero solo si no se ha cambiado de escena mientras tanto (sceneTok).
   - o: en (inglés, voz VOICE_EN, sin tx ni MP3), rate (velocidad), pitch (tono).
   Cada frase nueva corta la anterior (sayTok). Mientras habla, talking=true y la música baja. Hay temporizadores de
   seguridad por si el navegador nunca avisa del final. window.__fast es para las pruebas automáticas (no habla).
   REGLA: no cambies el texto de ninguna frase que ya exista: el MP3 se busca por el texto exacto y se perdería.
   Las frases nuevas se escriben en castellano de España y se apuntan para grabarlas. */
function say(t,cb,o={}){
  if(!o.en)t=tx(t);
  const tok=++sayTok, my=sceneTok; let done=false;
  idle=0;// la ayuda cuenta desde que Tito calla (quien quiera la ayuda enseguida pone idle=12 después de say)
  const fin=()=>{if(done)return;done=true;if(tok===sayTok)talking=false;if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.22,AC.currentTime,.2);if(cb&&my===sceneTok)cb()};
// est: duración estimada de la frase en ms (para los temporizadores de seguridad).
  const est=900+t.length*85/(o.rate||1);
  if(window.__fast){if(window.__said)window.__said.push(t);talking=true;setTimeout(fin,30);return}
// vf: plan de vozFile para la frase (mp3 grabados y trozos {t}), o null/false si no hay nada grabado o la voz está a 0.
  const vf=!o.en&&S.vol.voz>0&&vozFile(t);
// Sin MP3 y sin voz del navegador (o con volumen 0): se hace como que habla un rato para que el juego siga.
  if(!vf&&(!('speechSynthesis' in window)||S.vol.voz<=0)){talking=true;setTimeout(fin,Math.min(est,2500));return}
  try{speechSynthesis.cancel()}catch(e){}
  if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.07,AC.currentTime,.1);
  talking=true;
// speak(): habla con la voz del navegador, si esta sigue siendo la frase actual.
  const speak=()=>{ if(tok!==sayTok||!('speechSynthesis' in window))return;
    const u=new SpeechSynthesisUtterance(t),vv=o.en?VOICE_EN:VOICE; if(vv){u.voice=vv;u.lang=vv.lang}else u.lang=o.en?(S.variant==='es'?'en-GB':'en-US'):S.variant==='es'?'es-ES':'es-AR';
    u.rate=o.rate||.9; u.pitch=o.pitch||1.1; u.volume=S.vol.voz; u.onend=fin; u.onerror=fin;
    speechSynthesis.speak(u);
  };
// Con MP3: si falla, se usa speak(). El temporizador final es de seguridad.
// Si la frase lleva el nombre del niño (", Lucía", de kid() o praise()), el MP3 grabado no lo tiene: Tito dice antes
// el nombre con la voz del navegador y después suena lo grabado ("Lucía. ¡Muy bien! ¡Una estrella más!").
  if(vf){if(S.name&&t.includes(', '+S.name))vf.unshift({t:S.name+'.'});
    vozSeq(vf,tok,fin,()=>{if(tok===sayTok&&!done)speak()});setTimeout(fin,est/VOZ_RATE+4000+vf.filter(f=>f.t!=null).length*2500);return}
  setTimeout(speak,60);
  setTimeout(fin,est+1500);
}
// kid(): ', nombre' si se sabe el nombre del niño (para añadirlo a una frase); si no, ''.
const kid=()=>S.name?(', '+S.name):'';
// PRAISE: felicitaciones (tienen MP3: no cambies el texto).
const PRAISE=['¡Muy bien!','¡Genial!','¡Bravo!','¡Excelente!','¡Eso es!','¡Qué bien!','¡Súper!','¡Lo encontraste!'];
// praise(): una felicitación al azar; la mitad de las veces le añade el nombre del niño.
const praise=()=>{const p=pick(PRAISE);return S.name&&Math.random()<.5?p.slice(0,-1)+', '+S.name+'!':p};
// cap(texto): pone en mayúscula la primera letra.
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;

/* ---------- escenas, temporizadores, partículas ---------- */
/* SISTEMA DE ESCENAS
   Cada pantalla del juego es una "escena": un objeto guardado en SCENES[nombre] (scenes.js, zonas.js, tienda.js,
   repaso.js, world3d.js...). Lo que puede tener una escena (todo opcional salvo draw):
     enter(o)      al entrar; o son las opciones que se pasaron a go().
     update(dt)    en cada cuadro, antes de dibujar (dt = segundos desde el cuadro anterior).
     draw()        dibuja la escena en la pantalla lógica de 1600x900.
     down(x,y) / move(x,y) / up(x,y)   tocar, mover y soltar (dedo o ratón), en coordenadas lógicas.
     hint()        devuelve {x,y,r} (o un path) de lo que hay que tocar, para la ayuda si el niño no hace nada.
     prompt()      repite la consigna cuando aparece la manita de ayuda.
     dwell(id)     el ratón se quedó quieto sobre el elemento id (suele decir su nombre).
     music         clave de MUSIC; three: true si la escena se dibuja en 3D (world3d.js); starPop (ver drawRounds).
   Variables: scene (escena actual), sceneName (su nombre), sceneArg (opciones de go), sceneTok (sube con cada cambio
   de escena y anula temporizadores y callbacks de la anterior), T (segundos desde el arranque; para animar),
   fade (velo de transición, de 1 a 0), timers (de later), parts (partículas), idle (segundos sin tocar; activa
   las ayudas), hintSaid (ya se repitió la consigna), drag (lo que se está arrastrando, o null). */
let scene=null,sceneName='',sceneTok=0,T=0,fade=0,timers=[],parts=[],idle=0,hintSaid=false,drag=null,sceneArg={};
// later(ms, fn): ejecuta fn dentro de ms milisegundos, pero solo si se sigue en la misma escena. Dentro de las escenas
// usa esto en vez de setTimeout: lo cuenta frame() con el reloj del juego y go() lo anula.
function later(ms,fn){timers.push({t:ms/1000,fn,tok:sceneTok})}
// whenQuiet(fn, max): llama a fn en cuanto Tito calla (talking false), o como mucho a los max segundos (8) por si la
// voz se queda colgada. Va con later(), así que si se cambia de escena mientras espera, fn no se llama.
function whenQuiet(fn,max=8){const t0=T,chk=()=>{if(!talking||T-t0>max)fn();else later(100,chk)};chk()}
// sayQ(texto, cb, o): como say(), pero espera a que Tito acabe la frase que esté diciendo (whenQuiet). Para las frases
// que el juego dice solo, programadas con later() (consignas, presentaciones): así no cortan una frase que dijo Tito al
// responder a un toque del niño en ese rato.
function sayQ(t,cb,o){whenQuiet(()=>say(t,cb,o))}
// go(nombre, o): cambia a la escena SCENES[nombre]. Anula temporizadores, partículas, arrastre y voz de la escena anterior,
// pone el velo de transición (fade=1), elige la música (scene.music) y llama a enter(o) de la nueva escena.
// Si SCENES[nombre] no existe, avisa en la consola y no cambia de escena.
// Ejemplos: go('map',{hello:true}) vuelve al mapa saludando; go('casita',{t:idTema}) abre un tema.
function go(n,o={}){
  if(!SCENES[n]){console.warn('go: no existe la escena',n);return}// nombre mal escrito: se queda en la escena actual en vez de romperse
  sceneTok++; timers=[]; parts=[]; idle=0; hintSaid=false; drag=null; setCursor('pt');
  try{speechSynthesis.cancel()}catch(e){} talking=false;
  sceneName=n; sceneArg=o; scene=SCENES[n]; fade=1; musKey=scene.music||null; scene.enter&&scene.enter(o);
}
/* PARTÍCULAS. parts es una lista de objetos {x, y, vx, vy (velocidad en px/s), life (segundos que dura), t (edad),
   c (color), r (tamaño), rot (giro), g (gravedad; 900 si no se da; 0 = flota), k (tipo)}.
   Tipos k: 's' estrella; 'c' confeti (rectángulo que gira; es lo que se dibuja con cualquier otro valor); 'd' punto;
   'h' corazón; 'o' onda (anillo que se agranda, como en el agua); 'n' nota musical; 't' texto que sube (p.tx; con
   hl la primera letra va en rojo y con dots salen puntitos debajo para contar); 'z' una "z" de dormir.
   Cualquier archivo puede añadir partículas con parts.push({...}); drawParts() las mueve, dibuja y borra al caducar.
   go() vacía la lista. */
// burst(x,y,n,colores): explosión de n confetis y estrellas desde (x,y), para aciertos y premios.
function burst(x,y,n=24,cols=['#FFC93C','#F58BB4','#7CC86E','#5B8DEF','#FF8A7A','#9B8AD9']){
  for(let i=0;i<n;i++){const a=rnd(0,PI*2),v=rnd(200,620);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,life:rnd(.8,1.5),t:0,c:pick(cols),r:rnd(7,15),rot:rnd(0,6),k:Math.random()<.35?'s':'c'})}
}
// heart(x,y,radio,color): corazón relleno (partículas de tipo 'h').
function heart(x,y,r,f){/* corazoncito para las partículas */ctx.beginPath();ctx.moveTo(x,y+r*.9);ctx.bezierCurveTo(x-r*1.4,y,x-r*.7,y-r*1.1,x,y-r*.35);ctx.bezierCurveTo(x+r*.7,y-r*1.1,x+r*1.4,y,x,y+r*.9);ctx.fillStyle=f;ctx.fill()}
// sparkles(x,y,n): unos pocos brillos (estrellas) que suben flotando, sin gravedad.
function sparkles(x,y,n=6){for(let i=0;i<n;i++)parts.push({x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-80,80),vy:rnd(-160,-40),life:rnd(.4,.8),t:0,c:pick(['#FFC93C','#FFF3B0','#F58BB4']),r:rnd(6,11),rot:0,k:'s',g:0})}
// drawParts(dt): mueve cada partícula (velocidad y gravedad), la dibuja según su tipo k, la vuelve transparente al
// envejecer y quita las caducadas. La llama frame() en cada cuadro, encima de la escena.
function drawParts(dt){
  for(const p of parts){p.t+=dt;p.vy+=(p.g??900)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*6;
    const a=1-p.t/p.life; if(a<=0)continue; ctx.globalAlpha=a;
    if(p.k==='s')star(p.x,p.y,p.r,p.c,0); else if(p.k==='d'){circ(p.x,p.y,p.r,p.c,0)} else if(p.k==='h'){heart(p.x,p.y,p.r,p.c)} else if(p.k==='o'){const q=1+p.t/p.life*2;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*q,p.r*.42*q,0,0,PI*2);ctx.lineWidth=3;ctx.strokeStyle=p.c;ctx.stroke()} else if(p.k==='n'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(p.rot*.5)*.3);ctx.lineWidth=3;ctx.strokeStyle='#FFFFFF';ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(0,0,p.r*.55,p.r*.4,-.4,0,PI*2);ctx.stroke();ctx.fill();ctx.fillRect(p.r*.38,-p.r*1.7,p.r*.18,p.r*1.7);ctx.beginPath();ctx.moveTo(p.r*.56,-p.r*1.7);ctx.quadraticCurveTo(p.r*1.2,-p.r*1.3,p.r*.95,-p.r*.8);ctx.lineWidth=p.r*.16;ctx.strokeStyle=p.c;ctx.stroke();ctx.restore()} else if(p.k==='t'){/* un número que sube flotando al contar, y entra con un saltito */const q=Math.min(1,p.t/.18),sc=.5+.5*q+Math.sin(q*PI)*.25;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);ctx.font=`800 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=7;ctx.lineJoin='round';ctx.strokeStyle='#FFFFFF';ctx.strokeText(p.tx,0,0);ctx.fillStyle=p.c;if(p.hl){/* la primera letra de la palabra, en rojo, como en Letrilandia */const W=ctx.measureText(p.tx).width,w1=ctx.measureText(p.tx[0]).width;ctx.textAlign='left';ctx.fillText(p.tx.slice(1),-W/2+w1,0);ctx.fillStyle='#E84A4A';ctx.fillText(p.tx[0],-W/2,0)}else ctx.fillText(p.tx,0,0);if(p.dots){/* debajo del número, tantos puntitos como dice, para verlo de un vistazo */const n=p.dots,r1=n>5?2:1,per=Math.ceil(n/r1);for(let i=0;i<n;i++){const row=Math.floor(i/per),col=i%per,cn=row?n-per:per;ctx.beginPath();ctx.arc((col-(cn-1)/2)*22,24+row*22,8,0,PI*2);ctx.fillStyle=p.c;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()}}ctx.restore()} else if(p.k==='z'){ctx.font=`700 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#5F6FB4';ctx.strokeText('z',p.x,p.y);ctx.fillStyle=p.c;ctx.fillText('z',p.x,p.y)} else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore()}
  } ctx.globalAlpha=1; parts=parts.filter(p=>p.t<p.life);
}
/* ---------- HUD ---------- */
// HOME: botón de la casita (volver) arriba a la izquierda: centro y radio.
const HOME={x:80,y:80,r:52};
// drawHome(): dibuja el botón de volver (se agranda con el ratón encima).
function drawHome(){const s=hv('home',hC(HOME.x,HOME.y,HOME.r+10));ctx.save();ctx.translate(HOME.x,HOME.y);ctx.scale(s,s);ctx.translate(-HOME.x,-HOME.y);circ(HOME.x,HOME.y,HOME.r,'#fff',6);ctx.beginPath();ctx.moveTo(52,86);ctx.lineTo(80,60);ctx.lineTo(108,86);ctx.lineTo(108,108);ctx.lineTo(52,108);ctx.closePath();fillStroke('#FF8A7A',5);ctx.fillStyle=K;ctx.fillRect(72,90,16,18);ctx.restore()}
// atHome(x,y): ¿se tocó el botón de volver?
const atHome=(x,y)=>dist(x,y,HOME.x,HOME.y)<72;
// drawRounds(hechas, total, y): fila de estrellas arriba a la derecha con las rondas del juego. Si la escena tiene
// starPop (el momento T del último acierto), la última estrella ganada hace un "pop".
function drawRounds(done,of,y=80){
  const w=of*66+30, x=1560-w; card(x,y-44,w,88,'#fff',6,44);
  for(let i=0;i<of;i++){const sc=i===done-1&&scene.starPop?1+.4*Math.max(0,1-(T-scene.starPop)*3):1;star(x+48+i*66,y,25*sc,i<done?'#FFC93C':'#EADFCF',3.5)}
}
// Candado de la zona de adultos (abajo a la derecha): hay que mantenerlo pulsado 3 s. lockDown = se está pulsando;
// lockHold = segundos que lleva, en tiempo real (aunque el aparato vaya a pocos cuadros por segundo); lockPrev = hora
// del cuadro anterior. Lo gestionan pointerdown y frame() en adult.js.
let lockHold=0,lockDown=false,lockPrev=0;
// drawLock(): dibuja el candado semitransparente y, mientras se pulsa, un arco que se va llenando.
function drawLock(){
  const x=1546,y=852; ctx.globalAlpha=.45; ctx.fillStyle=K; rr(x-18,y-12,36,28,6); ctx.fill(); ctx.beginPath(); ctx.arc(x,y-12,11,PI,0); ctx.lineWidth=5; ctx.strokeStyle=K; ctx.stroke(); ctx.globalAlpha=1;
  if(lockDown){ctx.beginPath();ctx.arc(x,y,40,-PI/2,-PI/2+PI*2*lockHold/3);ctx.lineWidth=8;ctx.strokeStyle='#9B8AD9';ctx.stroke()}
}
/* ayuda: brillo y manito */
// drawHelp(): ayuda automática si el niño no hace nada. Pide a la escena su hint(): a los 6 s sin tocar dibuja un brillo
// alrededor; a los 11 s, la manita (siguiendo h.path si lo hay, o moviéndose con h.dx/h.dy) y repite una vez la consigna con scene.prompt().
// idle no cuenta mientras Tito habla (frame) y vuelve a 0 con cada say(): la ayuda nunca corta una frase de Tito.
function drawHelp(){
  if(!scene.hint||drag)return; const h=scene.hint(); if(!h)return;
  if(idle>6){const p=(Math.sin(T*5)+1)/2;ctx.save();ctx.globalAlpha=.35+.35*p;ctx.lineWidth=12;ctx.strokeStyle='#FFC93C';ctx.beginPath();ctx.arc(h.x,h.y,(h.r||110)+10+p*12,0,PI*2);ctx.stroke();ctx.restore()}
  if(idle>11){const k=(T*1.2)%1;if(h.path&&h.path.length>1){const q=(T*.5)%1,f=q*(h.path.length-1),i=Math.floor(f),a=h.path[i],b=h.path[Math.min(h.path.length-1,i+1)];hand(lerp(a[0],b[0],f-i)+20,lerp(a[1],b[1],f-i)+14,90)}else hand(h.x+30-k*20+(h.dx||0)*k,h.y+20-k*10+(h.dy||0)*k,90);
    if(!hintSaid&&scene.prompt&&!talking){hintSaid=true;scene.prompt()}}// nunca mientras Tito habla: cortaría su frase
}
/* adaptativo */
// Dificultad adaptativa (no se guarda en S): ADAPT va de -1 (más fácil) a 1 (más difícil); streak cuenta aciertos a la
// primera seguidos; REP = veces que ya se jugó este juego (0 a 2; lo pone la escena 'juego' de scenes.js).
let ADAPT=0,streak=0,REP=0;
// nOpts(): cuántas opciones enseñar en un juego (de 2 a 4): 2 a los 3 años y 3 a los 4 y 5, más ADAPT, y +1 al repetir.
function nOpts(){return clamp(({3:2,4:3,5:3})[AGE()]+ADAPT+(REP>=1?1:0),2,4)}
// onRight(aLaPrimera): avisar de un acierto; 4 aciertos seguidos a la primera suben la dificultad.
function onRight(first){if(first){streak++;if(streak>=4){ADAPT=Math.min(1,ADAPT+1);streak=0}}}
// onWrongTwice(): avisar de que se falló dos veces; baja la dificultad.
function onWrongTwice(){ADAPT=Math.max(-1,ADAPT-1);streak=0}
// nRounds(): rondas de cada juego: 4 a los 3 años y 5 después; una más a partir de la segunda repetición.
const nRounds=()=>(AGE()<=3?4:5)+(REP>=2?1:0);
/* tiempo de juego */
// sessionT: segundos jugados en esta sesión (para S.limit); restAsked: ya se propuso descansar; minuteAcc: segundos aún
// no apuntados en S.days. Los usa frame() en adult.js.
// La sesión sigue al recargar la página: si S.ses ({t: segundos, at: hora en ms}, se guarda cada 15 s) es de hace menos
// de 30 min, sessionT sigue desde ahí. Así recargar no se salta el límite de tiempo («a dormir»).
let sessionT=(()=>{const s=S.ses,ago=s&&Date.now()-s.at;return s&&isFinite(+s.t)&&ago>=0&&ago<30*60e3?+s.t:0})(),restAsked=false,minuteAcc=0;

/* ---------- pegatinas ---------- */
// toast: aviso de "¡Pegatina nueva!" que se ve unos segundos: {k: dibujo, t: momento T en que salió, x, y opcionales}.
let toast=null;
// giveSticker(dibujo): da una pegatina (suma 1 en S.stk y guarda), enseña el aviso y suena un brillo. Devuelve la clave.
function giveSticker(k){S.stk[k]=(S.stk[k]||0)+1;save();toast={k,t:T};setTimeout(()=>SFX.sparkle(),300);return k}
// drawSticker(dibujo,x,y,tamaño,giro,gris): pegatina redonda con sombra; gris = una que aún no se tiene.
function drawSticker(k,x,y,s,rot=0,grey){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.shadowColor='rgba(74,52,40,.25)';ctx.shadowBlur=s*.08;ctx.shadowOffsetY=s*.04;
  circ(0,0,s*.55,'#fff',0);ctx.shadowColor='transparent';circ(0,0,s*.55,null,3,'#EADFCF');if(grey){ctx.globalAlpha=.25;picG(k,0,0,s*.86);ctx.globalAlpha=1}else pic(k,0,0,s*.86);ctx.restore()}
// drawToast(): dibuja el aviso de pegatina nueva: entra con rebote, se queda y se va a los 2,8 s.
function drawToast(){if(!toast)return;const k=T-toast.t;if(k>2.8){toast=null;return}
  const a=k<.3?back(k/.3):k>2.4?1-(k-2.4)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(toast.x||800,toast.y||180);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
  card(-230,-80,460,160,'#FFF6E6',6,40);drawSticker(toast.k,-140,0,130,Math.sin(T*4)*.1);text(V(['¡Figurita nueva!','¡Pegatina nueva!']),60,14,38,K);ctx.restore()}

/* ---------- calendario ---------- */
// Calendario: DIAS empieza en domingo (como getDay()); DIASL en lunes; DIAC es el color de cada día (desde el lunes).
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIASL=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const DIAC=['#FF8A7A','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9','#F58BB4'];
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const ESTACIONES=['primavera','verano','otoño','invierno'];
// estacionDe(fecha): estación ('primavera', 'verano', 'otoño' o 'invierno') según la fecha (cambia hacia el día 21
// de marzo, junio, septiembre y diciembre) y el hemisferio S.hemi (en el sur se invierte).
function estacionDe(d=new Date()){
  const m=d.getMonth()+1,dd=d.getDate(),v=m*100+dd;
  let e=v>=1221||v<321?'invierno':v<621?'primavera':v<923?'verano':'otoño';
  if(S.hemi==='S')e={invierno:'verano',verano:'invierno',primavera:'otoño',otoño:'primavera'}[e];
  return e;
}
