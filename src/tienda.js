// ARCHIVO: tienda.js — las recompensas: monedas, la tienda, la ropa y colores de Tito, la casa de Tito y los vales.
// Cómo encaja: se ganan monedas al acertar en los juegos (envoltura de onRight) y al terminar un juego (envoltura de
//   finishGame); se gastan en SCENES.tienda; lo comprado se ve en Tito (titoImg, drawTitoWear) o en SCENES.casaTito.
//   Los regalos del cofre (GIFTS, nextGift, grantGift) NO están aquí sino en zonas.js, pero usan SHOP, wear y placeHome.
//   Los vales los configura un adulto en adult.js (S.vales) y se compran aquí (quedan apuntados en S.valesLog).
// Define (globales): DEF2, VALES_DEF, shownCoins/coinFx/coinBanner (animación de monedas), hudAt, STARS, drawCoinHUD,
//   inCoinHUD, giveCoins, spendCoins, drawCoinFx, SHELLC, SCARFC, titoImg, HATPOS, drawTitoWear, titoHouseIc, SHOPCAT,
//   SHOP, TIER_NEED, shopItems, itemName, isWorn, wear, drawItemPic, HOMESPOT, WALLITEMS, WALLSPOT, ROOMS (habitaciones de
//   la casa), roomOf, roomOpen, roomsOpen, homeRoom, homeSpot, placeHome, HSIZE, homeItems, homeAction, homeLight, roomBg,
//   roomBtns y las escenas SCENES.tienda y SCENES.casaTito.
// Envuelve: onRight y finishGame (core.js/scenes.js), SCENES.juego.enter y SCENES.juego.draw (scenes.js).
// Depende de: core.js (S, DEF, save, say, T, ctx, pic, card, text, circ, SFX, tone, hv, TITO, drawTito, titoKind,
//   TITO_SVG...), lex.js (V, W_), scenes.js (SCENES, finishGame), zonas.js (houseLevel, drawTitoHouse, drawPet, petStage,
//   PET_NEXT, HOUSE_NEXT, temasDone, shellIcon), comps2.js (playTune, TUNES).
/* ================= MONEDAS, TIENDA Y CASA DE TITO ================= */
// Campos del estado guardado S que añade este archivo (valores por defecto):
//   coins: monedas que tiene ahora; coinsTot: monedas ganadas en total; gift: (antiguo) regalo pendiente;
//   home: {idObjeto:{x,y,r}} dónde está cada cosa en la casa de Tito (r: habitación de ROOMS; sin r, el salón);
//   rooms: cuántas habitaciones ya se vieron abiertas (para anunciar la nueva; ausente = 1); tito: {shell, scarf, hat, glasses, bow} lo que lleva
//   puesto (color del caparazón, color de la bufanda, id del sombrero, 'gafas' o '', 'monio' o '');
//   owned: {idArtículo:1} lo comprado o regalado; vales: lista de vales (ver VALES_DEF); valesLog: vales comprados
//   [{id, txt, d:fecha, given:0/1}]; cofres: cofres abiertos. El resto (woke, bday, bdayDone, unlockAll, seenOpen,
//   houseSeen, petSeen) lo usan otros archivos (zonas.js, adult.js, world3d.js).
// OJO: no cambies el formato de estos campos, hay partidas guardadas en los móviles.
const DEF2={coins:0,coinsTot:0,gift:'',woke:{},home:{},tito:{shell:'naranja',scarf:'roja',hat:'',glasses:'',bow:''},owned:{'caparazon:naranja':1,'bufanda:roja':1},vales:null,valesLog:[],bday:null,bdayDone:'',unlockAll:false,seenOpen:{},houseSeen:null,petSeen:null,cofres:0};
// Se añaden a DEF (copia profunda) y se rellenan en S los que falten en partidas antiguas.
Object.assign(DEF,JSON.parse(JSON.stringify(DEF2)));
const _oldSave=S.coins===undefined&&Object.keys(S.temas||{}).length>0;
sanoS(S,DEF2);// campos de una partida rota (null o de otro tipo) → valor por defecto, como los que faltan
for(const k in DEF2)if(S[k]===undefined)S[k]=JSON.parse(JSON.stringify(DEF2[k]));
// quien ya jugaba la versión 1 recibe monedas por lo que ya había jugado
if(_oldSave){const n=Object.values(S.temas).reduce((a,t)=>a+Object.keys((t&&t.g)||{}).length,0)*2;S.coins=S.coinsTot=n;save()}
// Vales por defecto que un adulto puede activar en la zona de adultos: id, txt (lo que se promete),
// ic (dibujo), p (precio en monedas), on (1 = se ve en la tienda). Se copian a S.vales la primera vez.
const VALES_DEF=[{id:'v1',txt:'Un cuento extra antes de dormir',ic:'libro',p:30,on:1},{id:'v2',txt:'Ir a jugar al parque',ic:'parque',p:50,on:1},{id:'v3',txt:'Elegir a qué jugamos juntos',ic:'bloques',p:40,on:1},
  {id:'v4',txt:'Cocinar algo rico juntos',ic:'olla',p:60,on:0},{id:'v5',txt:'Elegir la película del fin de semana',ic:'tele',p:60,on:0},{id:'v6',txt:'Un abrazo de oso gigante',ic:'oso',p:10,on:0}];
if(!S.vales)S.vales=JSON.parse(JSON.stringify(VALES_DEF));

/* ---------- monedas ---------- */
// Animación de monedas: shownCoins es el número que se ve (va subiendo cuando cada moneda llega al marcador),
// coinFx las monedas que vuelan, coinBanner el cartel "+N", coinBumpT cuándo saltó el marcador por última vez,
// gameCoins cuántas monedas de acierto se han dado en el juego actual (máximo 5 por juego).
let shownCoins=S.coins,coinFx=[],coinBanner=null,coinBumpT=-9,gameCoins=0;
// Posición del marcador de monedas (cambia en los juegos para no tapar otros botones).
let HUDX=1450,HUDY=64;
// Coloca el marcador de monedas: a la izquierda en los juegos, arriba a la derecha en el resto.
const hudAt=()=>{if(sceneName==='juego'){HUDX=300;HUDY=74}else{HUDX=1450;HUDY=64}};
// Número de estrellas: total de juegos terminados en todos los temas (S.temas[id].g). Abre artículos de la tienda.
const STARS=()=>Object.values(S.temas).reduce((a,t)=>a+Object.keys((t&&t.g)||{}).length,0);
// Dibuja el marcador de monedas (tarjeta amarilla con la moneda y el número); la moneda da un saltito al cambiar.
function drawCoinHUD(){hudAt();const b=1+.3*Math.max(0,1-(T-coinBumpT)*4),s=hv('coins',hR(HUDX+10,HUDY,220,84));ctx.save();ctx.translate(HUDX,HUDY);ctx.scale(s,s);card(-96,-38,216,76,'#FFF6D6',6,38);
  ctx.save();ctx.translate(-50,0);ctx.scale(b,b);pic('moneda',0,0,70);ctx.restore();text(String(Math.max(0,Math.round(shownCoins))),40,16,44,K,{f:LF});ctx.restore()}
// ¿El toque (x,y) está sobre el marcador de monedas?
const inCoinHUD=(x,y)=>{hudAt();return inR(x,y,HUDX+10,HUDY,220,84)};
// Da n monedas: las suma a S.coins y S.coinsTot y guarda. Lanza hasta 10 monedas animadas desde (x,y)
// hacia el marcador (la última lleva el resto) y, si son 3 o más o se pasa icon, muestra el cartel "+n" con ese dibujo.
function giveCoins(n,x,y,icon){if(!(n>0))return;S.coins=(S.coins||0)+n;S.coinsTot=(S.coinsTot||0)+n;save();const m=Math.min(n,10);
  for(let i=0;i<m;i++)coinFx.push({x:x+rnd(-36,36),y:y+rnd(-36,36),t:T+i*.09,v:i<m-1?1:n-(m-1)});if(n>=3||icon)coinBanner={n,t:T,icon}}
// Gasta n monedas (sin comprobar si hay suficientes) y anima monedas que salen del marcador hacia (x,y).
function spendCoins(n,x,y){S.coins-=n;save();shownCoins-=n;coinBumpT=T;for(let i=0;i<Math.min(n,8);i++)coinFx.push({x,y,t:T+i*.06,spend:1})}
// Dibuja y avanza las monedas que vuelan y el cartel "+N". Cada moneda tarda 0,75 s; cuando llega
// suma su valor al número visible y suena. Se llama en cada cuadro desde el bucle de dibujo.
function drawCoinFx(){hudAt();
  for(const c of coinFx){const k=(T-c.t)/.75;if(k<0)continue;
    if(k>=1){if(!c.done){c.done=1;if(!c.spend){shownCoins+=c.v;coinBumpT=T;try{tone(1568,.08,'square',.06);tone(2093,.14,'triangle',.12,0,.05)}catch(e){}}}continue}
    // e = curva suave (smoothstep) de 0 a 1; la moneda sube en arco (seno) mientras va de a hacia b.
    const e=k*k*(3-2*k),a=c.spend?[HUDX-50,HUDY]:[c.x,c.y],b=c.spend?[c.x,c.y]:[HUDX-50,HUDY];
    pic('moneda',lerp(a[0],b[0],e),lerp(a[1],b[1],e)-Math.sin(k*PI)*130,62*(1-k*.25))}
  coinFx=coinFx.filter(c=>!c.done);if(!coinFx.length)shownCoins=S.coins;
  // Cartel "+N": entra con rebote (0-0,3 s), se queda y se desvanece entre 2,2 y 2,6 s.
  if(coinBanner){const k=T-coinBanner.t;if(k>2.6){coinBanner=null;return}const a=k<.3?back(k/.3):k>2.2?1-(k-2.2)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(coinBanner.x||800,coinBanner.y||470);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
    card(-250,-90,500,180,'#FFF6D6',7,50);pic(coinBanner.icon||'monedas',-140,0,150);text('+'+coinBanner.n,60,26,92,'#D9962A',{f:LF,st:8,sc:'#fff'});ctx.restore()}}
// Envuelve onRight: el primer acierto de cada ronda en un juego da 1 moneda (máximo 5 por juego).
{const or0=onRight;onRight=function(first){or0(first);if(first&&sceneName==='juego'&&gameCoins<5){gameCoins++;giveCoins(1,MX||800,MY||450)}}}
// Envuelve la entrada a un juego para poner a cero el contador gameCoins.
{const e0=SCENES.juego.enter;SCENES.juego.enter=function(o){gameCoins=0;e0.call(this,o)}}
// Envuelve finishGame: terminar un juego da 3 monedas la primera vez y 2 si se repite. (La variable now no se usa.)
{const f0=finishGame;finishGame=function(t,gi){const st=S.temas[t.id],first=!(st&&st.g[gi]),was=!!(st&&st.done);f0(t,gi);const now=!!(S.temas[t.id]&&S.temas[t.id].done)&&!was;
  giveCoins(first?3:2,800,420)}}

/* ---------- Tito con ropa y colores ---------- */
// Colores del caparazón (o púas, caparazón de tortuga, mochila del conejo): nombre → [relleno, borde].
const SHELLC={naranja:['#FFA94D','#D9762A'],azul:['#7FB0FF','#4A6FD0'],rosa:['#F58BB4','#C95A8A'],verde:['#7FD8C8','#3E9E8E'],violeta:['#B9A6F0','#7A62C9'],dorado:['#FFD34E','#C9962A']};
// Colores de la bufanda: nombre → color.
const SCARFC={roja:'#FF6B5E',azul:'#5B8DEF',amarilla:'#FFC93C',violeta:'#9B8AD9'};
// Caché de imágenes de Tito ya coloreadas, por clave "animal|caparazón|bufanda".
const TITOIMG={};
// Devuelve la imagen de Tito con los colores elegidos en S.tito. Crea (una sola vez) un SVG cambiando los
// colores originales por los de SHELLC/SCARFC; mientras la imagen nueva no ha cargado devuelve la de siempre.
function titoImg(){const t=S.tito||{},sh=SHELLC[t.shell]?t.shell:'naranja',sc=SCARFC[t.scarf]?t.scarf:'roja',tk=titoKind(),er=tk==='erizo',key=(tk==='caracol'?'':tk+'|')+sh+'|'+sc;if(key==='naranja|roja')return IMG.tito;
  // el erizo lleva el color de la tienda en las púas (con el naranja de siempre, púas marrones); la tortuga en el caparazón y el conejo en la mochila
  if(!TITOIMG[key])TITOIMG[key]=er?svgImg(ERIZO_SVG.replace('fill="#B07A4F"','fill="'+(sh==='naranja'?'#B07A4F':SHELLC[sh][0])+'"').replace('stroke="#7A5030"','stroke="'+(sh==='naranja'?'#7A5030':SHELLC[sh][1])+'"').replace('fill="#FF6B5E"','fill="'+SCARFC[sc]+'"'),'0 0 240 200',480)
    :svgImg(({caracol:TITO_SVG,tortuga:TORTUGA_SVG,conejo:CONEJO_SVG})[tk].replace('fill="#FFA94D"','fill="'+SHELLC[sh][0]+'"').replace('stroke="#D9762A"','stroke="'+SHELLC[sh][1]+'"').replace('fill="#FF6B5E"','fill="'+SCARFC[sc]+'"'),'0 0 240 200',480);
  const i=TITOIMG[key];return i.complete?i:(IMG[tk==='caracol'?'tito':tk]||IMG.tito)}
// Dónde va cada sombrero sobre el dibujo de Tito: id → [x, y, tamaño] en coordenadas del dibujo (240x200).
const HATPOS={gorroFiesta:[198,28,86],gorra:[204,44,84],gorro:[198,40,84],gorroNavidad:[202,32,92],sombreroCopa:[198,34,78],sombreroPirata:[198,38,100],corona:[198,42,72]};
// Dibuja encima de Tito lo que lleva puesto (moño, sombrero, gafas). k = escala del dibujo de Tito.
// Las posiciones dependen del animal (titoKind); TITO_EYES da dónde están los ojos.
function drawTitoWear(k){const t=S.tito||{};
  const tk=titoKind(),E=TITO_EYES[tk],BW={caracol:[126,42],erizo:[104,66],tortuga:[100,70],conejo:[66,104]}[tk],HY={caracol:0,erizo:4,tortuga:10,conejo:4}[tk];
  if(t.bow)pic('monio',BW[0]*k,BW[1]*k,56*k);
  // en el caracol el sombrero tapa los ojos (están en las antenas) y se vuelven a dibujar encima; en los demás no hace falta
  if(t.hat&&HATPOS[t.hat]){const [x,y,s]=HATPOS[t.hat];pic(t.hat,x*k,(y+HY)*k,s*k);
    if(tk==='caracol')for(const ex of[174,222]){circ(ex*k,20*k,15*k,'#fff',5*k);circ((ex+3)*k,22*k,7*k,K,0);circ((ex+5)*k,19*k,2.5*k,'#fff',0)}}
  if(t.glasses){for(const [ex,ey,er_] of E)circ(ex*k,ey*k,(er_+3)*k,'rgba(40,40,70,.38)',6*k);const [a,b]=E;ctx.beginPath();ctx.moveTo((a[0]+a[2]+3)*k,(a[1]-2)*k);ctx.lineTo((b[0]-b[2]-3)*k,(b[1]-2)*k);ctx.lineWidth=4*k;ctx.strokeStyle=K;ctx.stroke();for(const [ex,ey] of E){ctx.beginPath();ctx.arc((ex-4)*k,(ey-6)*k,6*k,PI*1.1,PI*1.6);ctx.lineWidth=3*k;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.stroke()}}}

/* ---------- catálogo ---------- */
// icono de la casa de Tito: la casita con caparazón para el caracol; para los otros animales, su casa en pequeño (con el emblema de su animal)
function titoHouseIc(x,y,s){if(titoKind()==='caracol')return pic('casaCaracol',x,y,s);ctx.save();ctx.translate(x,y);ctx.scale(s/280,s/280);drawTitoHouse(0,110,Math.min(1,houseLevel()));ctx.restore()}
// Pestañas de la tienda: id de categoría, n (nombre que dice Tito) e ic (dibujo de la pestaña).
const SHOPCAT=[{id:'ropa',n:'Ropa para Tito',ic:'gorroFiesta'},{id:'colores',n:'Colores para Tito',ic:'caracol'},{id:'casa',n:'Cosas para la casa',ic:'lampara'},{id:'juguetes',n:'Juguetes',ic:'peluche'},{id:'jardin',n:'Cosas para el jardín',ic:'columpio'},{id:'mascotas',n:'Mascotas',ic:'hamster'},{id:'vales',n:'Vales para canjear',ic:'vale'}];
// Catálogo de la tienda. Cada artículo: {id, cat, p (precio), tier (nivel 1-3, ver TIER_NEED),
//   slot (solo ropa/colores: 'hat', 'glasses', 'bow', 'shell' o 'scarf'), v (color para shell/scarf),
//   n (nombre que dice Tito, si no se usa W_(id)), draw(x,y,s) (dibujo propio, si no se usa pic(id)),
//   room (habitación de ROOMS a la que va; mientras esté cerrada, el artículo sale con candado en la tienda) o
//   pref (habitación preferida, sin candado: si está cerrada, va al salón)}.
// Los artículos sin slot van a la casa de Tito (necesitan dibujo en PICS y tamaño en HSIZE).
// Se escriben como listas cortas [id, precio, nivel, slot] que .map convierte en objetos.
const SHOP=[
  ...[['gorroFiesta',6,1],['gorra',8,1],['monio',6,1,'bow'],['gafas',10,1,'glasses'],['gorro',10,1],['gorroNavidad',12,2],['sombreroCopa',18,2],['sombreroPirata',18,2],['corona',30,3]].map(([id,p,tier,slot])=>({id,cat:'ropa',slot:slot||'hat',p,tier})),
  ...[['naranja',0,1],['azul',15,1],['rosa',15,2],['verde',20,2],['violeta',25,3],['dorado',40,3]].map(([c,p,tier])=>({id:'caparazon:'+c,cat:'colores',slot:'shell',v:c,p,tier,n:'el caparazón '+(c==='rosa'?'rosa':c==='verde'?'verde':c),draw:(x,y,s)=>{if(titoKind()!=='caracol')return shellIcon(x,y,s*.36,c);circ(x,y,s*.36,SHELLC[c][0],6);ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*PI*4.4,r=4+i/40*s*.26;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.lineWidth=s*.05;ctx.strokeStyle=SHELLC[c][1];ctx.lineCap='round';ctx.stroke()}})),
  ...[['roja',0,1],['azul',8,1],['amarilla',8,1],['violeta',10,2]].map(([c,p,tier])=>({id:'bufanda:'+c,cat:'colores',slot:'scarf',v:c,p,tier,n:'la bufanda '+c,draw:(x,y,s)=>{ctx.save();ctx.translate(x,y);card(-s*.38,-s*.16,s*.76,s*.2,SCARFC[c],6,s*.1);card(s*.08,-s*.04,s*.16,s*.38,SCARFC[c],6,s*.06);ctx.restore()}})),
  ...[['alfombra',10,1],['cuadro',8,1],['plantaInterior',8,1],['lampara',12,1],['banco',12,2],['estanteria',15,2],['reloj',15,2],['farol',15,2],['piano',30,3],['fuente',35,3]].map(([id,p,tier])=>({id,cat:'casa',p,tier})),
  ...[['pelotaPlaya',6,1],['bloques',8,1],['peluche',10,1],['cometa',10,1],['xilofono',12,1],['muneca',15,2],['robot',18,2],['trenJuguete',18,2],['guitarra',20,2],['telescopio',30,3]].map(([id,p,tier])=>({id,cat:'juguetes',p,tier})),
  ...[['pecera',20,1],['hamster',25,2],['casitaPerro',40,3]].map(([id,p,tier])=>({id,cat:'mascotas',p,tier})),
  // v1.590: cosas para cada habitación nueva de la casa (room) y más juguetes y mascotas.
  // [id, precio, nivel, habitación, categoría, nombre (si W_ no lo dice bien)]
  ...[['sofa',15,1,'salon'],['tele',20,2,'salon'],
    ['cama',15,1,'dormitorio'],['baul',12,1,'dormitorio'],['cuento',6,1,'dormitorio'],['estrellas',15,2,'dormitorio','casa','las estrellas que brillan'],
    ['mesa',10,1,'cocina'],['silla',6,1,'cocina'],['nevera',18,1,'cocina'],['olla',8,1,'cocina'],['tarta',12,2,'cocina'],
    ['banera',18,1,'bano'],['toalla',6,1,'bano'],['jabon',4,1,'bano'],['pato',6,1,'bano','casa','el patito de goma'],
    ['tambor',12,1,'juegos','juguetes'],['pizarra',15,1,'juegos','juguetes','la pizarra'],['pinturas',10,1,'juegos','juguetes'],['globo',6,1,'juegos','juguetes'],['tobogan',25,2,'juegos','juguetes'],
    ['arbol',15,1,'jardin','jardin'],['plantaFlor',8,1,'jardin','jardin'],['regadera',6,1,'jardin','jardin'],['columpio',25,2,'jardin','jardin'],['castillo',20,2,'jardin','jardin'],['piscina',30,3,'jardin','jardin'],
    ['tierra',20,2,'torre','casa','el globo terráqueo'],['saturno',25,2,'torre','casa','Saturno'],['cohete',40,3,'torre','juguetes']
  ].map(([id,p,tier,room,cat,n])=>Object.assign({id,cat:cat||'casa',p,tier,room},n?{n}:{})),
  ...[['gato',30,2],['pajaro',25,2],['conejo',35,3]].map(([id,p,tier])=>({id,cat:'mascotas',p,tier,pref:'jardin'}))
];
// Habitación preferida de los artículos de antes (sin candado): los juguetes, al cuarto de juegos (el telescopio, a la
// torre); las mascotas, al jardín.
SHOP.forEach(it=>{if(!it.room&&!it.slot&&!it.pref&&(it.cat==='juguetes'||it.cat==='mascotas'))it.pref=it.cat==='juguetes'?'juegos':'jardin'});
SHOP.find(i=>i.id==='telescopio').pref='torre';// el telescopio, a la torre de las estrellas
// Estrellas (STARS) necesarias para abrir cada nivel de artículos: nivel 1 siempre, 2 con 8, 3 con 20.
const TIER_NEED={1:0,2:8,3:20};
// Artículos de una categoría. Para "vales" crea artículos a partir de los vales activos de S.vales (máx. 10).
const shopItems=cat=>cat==='vales'?S.vales.filter(v=>v.on).slice(0,10).map(v=>({id:'vale:'+v.id,cat:'vales',p:v.p,tier:1,vale:v,n:'el vale: '+v.txt})):SHOP.filter(i=>i.cat===cat);
// Nombre de un artículo para decirlo en voz alta (it.n o el nombre del diccionario W_).
const itemName=it=>it.n?V(it.n):W_(it.id);
// ¿Tito lleva puesto ahora este artículo de ropa o color?
const isWorn=it=>{const t=S.tito;return it.slot==='hat'?t.hat===it.id:it.slot==='glasses'?!!t.glasses:it.slot==='bow'?!!t.bow:it.slot==='shell'?t.shell===it.v:it.slot==='scarf'?t.scarf===it.v:false};
// Pone (on=true) o quita la prenda it a Tito en S.tito y guarda. Los colores siempre se ponen (no se quitan).
function wear(it,on){const t=S.tito;if(it.slot==='hat')t.hat=on?it.id:'';if(it.slot==='glasses')t.glasses=on?'gafas':'';if(it.slot==='bow')t.bow=on?'monio':'';if(it.slot==='shell')t.shell=it.v;if(it.slot==='scarf')t.scarf=it.v;save()}
// Dibuja el artículo en (x,y) con tamaño s: su draw propio, un vale (con su icono en un circulito) o su dibujo pic.
function drawItemPic(it,x,y,s){if(it.draw)it.draw(x,y,s);else if(it.vale){pic('vale',x,y,s);circ(x+s*.26,y-s*.24,s*.2,'#fff',4);pic(it.vale.ic,x+s*.26,y-s*.24,s*.32)}else pic(it.id,x,y,s)}
// Huecos del suelo de la casa de Tito donde se colocan las cosas nuevas, por orden.
const HOMESPOT=[[930,720],[1180,740],[780,800],[1420,720],[1050,560],[830,560],[1290,560],[1500,560],[1010,840],[1300,850],[700,580],[1500,850]];
// Cosas que van colgadas en la pared (se dibujan detrás y no bajan al suelo) y huecos de la pared, por orden.
const WALLITEMS=['cuadro','reloj','pizarra','estrellas','saturno'],WALLSPOT=[[800,330],[1030,330],[580,320],[380,300]];
// ROOMS: habitaciones de la casa de Tito (v1.590). Cada una: id, n (nombre con artículo, lo dice Tito), need (casitas
// —temas— terminadas para que se abra; 0 = siempre), ic (dibujo de su botón) y cer (cómo se dice "cerrado/a").
// Las cosas de la casa guardan su habitación en S.home[id].r (sin r = el salón, como en las partidas de antes).
const ROOMS=[{id:'salon',n:'el salón',need:0,ic:'sofa',cer:'cerrado'},{id:'dormitorio',n:'el dormitorio',need:1,ic:'cama',cer:'cerrado'},
  {id:'cocina',n:'la cocina',need:3,ic:'olla',cer:'cerrada'},{id:'bano',n:'el baño',need:5,ic:'banera',cer:'cerrado'},
  {id:'juegos',n:'el cuarto de juegos',need:8,ic:'bloques',cer:'cerrado'},{id:'jardin',n:'el jardín',need:11,ic:'arbol',cer:'cerrado'},
  {id:'torre',n:'la torre de las estrellas',need:14,ic:'telescopio',cer:'cerrada'}];
// roomOf(id de habitación) → la habitación; roomOpen(id): ¿está abierta? (casitas terminadas, temasDone de zonas.js);
// roomsOpen(): las abiertas, en orden; homeRoom(id de objeto): habitación donde está ese objeto.
const roomOf=r=>ROOMS.find(x=>x.id===r)||ROOMS[0],roomOpen=r=>{const R=roomOf(r);return R.need===0||temasDone()>=R.need},roomsOpen=()=>ROOMS.filter(R=>roomOpen(R.id)),
  homeRoom=id=>(S.home[id]&&S.home[id].r)||'salon';
// homeSpot(id, r): un hueco libre para el objeto id en la habitación r: los de pared en WALLSPOT, la alfombra en el
// centro y el resto en el primer hueco libre de HOMESPOT (o en un sitio al azar si están todos ocupados).
function homeSpot(id,r){const used=Object.entries(S.home).filter(([k,p])=>k!==id&&(p.r||'salon')===r).map(([k,p])=>[p.x,p.y]),
    free=p=>!used.some(u=>Math.abs(u[0]-p[0])<170&&Math.abs(u[1]-p[1])<40);// libre: ningún objeto casi en ese sitio
  if(WALLITEMS.includes(id))return WALLSPOT.find(free)||WALLSPOT[0];
  if(id==='alfombra')return [960,760];
  const sp=HOMESPOT.find(free)||[rnd(700,1400)|0,rnd(560,800)|0],hs=HSIZE[id]||160;
  return [clamp(sp[0],300+hs*.3,W-hs/2-10),sp[1]]}// que las cosas grandes no se salgan por la derecha
// Coloca un objeto nuevo en la casa (S.home[id]={x,y,r}) si no estaba, en un hueco libre (homeSpot) de su habitación:
// la de it.room o it.pref si está abierta; si no, el salón. No guarda.
function placeHome(id){if(S.home[id])return;const it=SHOP.find(i=>i.id===id),want=it&&(it.room||it.pref),r=want&&roomOpen(want)?want:'salon';
  const sp=homeSpot(id,r);S.home[id]={x:sp[0],y:sp[1],r}}

/* ---------- la tienda ---------- */
// Escena de la tienda: pestañas de categorías, cuadrícula de artículos (5 por fila, 10 por página, con flechas si
// hay más), ventana de confirmación (this.conf) y botón para ir a la casa de Tito. Estado: cat (pestaña), page
// (página de la pestaña), conf/confT (artículo a confirmar y cuándo), newHome/newId (se acaba de comprar algo
// para la casa: el botón de la casa salta).
SCENES.tienda={music:'casita',
  // Al entrar: Tito saluda (la primera vez explica cómo funciona; S.first.tienda lo recuerda).
  enter(o){this.cat=this.cat||'ropa';this.page=this.page||0;this.conf=null;this.newHome=0;const seen=S.first.tienda;later(300,()=>sayQ(seen?'¡La tienda! Tenés '+S.coins+' monedas. Tocá algo para ver cuánto cuesta.':V(['¡Bienvenido a la tienda! Con las monedas que ganás jugando, podés comprar cosas para mí y para mi casa. Arriba elegís qué mirar.','¡Bienvenido a la tienda! Con las monedas que ganas jugando, puedes comprar cosas para mí y para mi casa. Arriba eliges qué mirar.'])));S.first.tienda=1;save()},
  // Pestañas visibles con su posición y ancho w (la de vales solo si hay algún vale activo). Con muchas pestañas se
  // juntan un poco para que quepan.
  tabs(){const a=SHOPCAT.filter(c=>c.id!=='vales'||S.vales.some(v=>v.on)),st=Math.min(204,1330/a.length);return a.map((c,i)=>Object.assign({x:900-(a.length-1)*st/2+i*st,y:215,w:Math.min(184,st-12)},c))},
  // Número de páginas de la pestaña actual (10 artículos por página).
  pages(){return Math.max(1,Math.ceil(shopItems(this.cat).length/10))},
  // Artículos de la página actual con su posición en la cuadrícula.
  grid(){const pg=Math.min(this.page||0,this.pages()-1),L=shopItems(this.cat).slice(pg*10,pg*10+10);return L.map((it,i)=>Object.assign({x:400+(i%5)*240,y:i<5?440:700,it}))},
  // Flechas para cambiar de página: [x, y, dirección] de las que se pueden usar.
  arrows(){const pg=this.page||0,n=this.pages(),A=[];if(pg>0)A.push([170,570,-1]);if(pg<n-1)A.push([1550,570,1]);return A},
  // Tito repite qué hay que hacer (al tocar a Tito o tras un rato sin tocar).
  prompt(){if(this.conf)say('¿Lo comprás? Tocá el verde para comprar o la cruz para volver.');else say('Tocá algo para ver cuánto cuesta. Tenés '+S.coins+' monedas.')},
  // Pista: en la confirmación señala el botón verde de comprar.
  hint(){if(this.conf)return{x:680,y:690,r:80};return null},
  // Dedo encima de algo: dice el nombre de la pestaña, o el del artículo y su precio, o las monedas.
  dwell(id){if(id.startsWith('tab:')){const c=SHOPCAT.find(c=>c.id===id.slice(4));if(c)say(c.n+'.')}else if(id.startsWith('it:')){const g=this.grid().find(g=>g.it.id===id.slice(3));if(g)say(cap(itemName(g.it))+'.'+(S.owned[g.it.id]&&!g.it.vale?' Ya es tuyo.':' Cuesta '+g.it.p+' monedas.'))}else if(id==='coins')say('Tenés '+S.coins+' monedas.')},
  // Dibuja la tienda: toldo, título, botón de la casa, estrellas, pestañas y artículos.
  // Cada artículo muestra check verde (ya es tuyo), precio (fondo amarillo si llegan las monedas) o candado con
  // las estrellas que faltan. Encima, si hay, la ventana de confirmación con los botones verde y rojo.
  draw(){sky('#FFF6E6','#FDE6C6');for(let i=0;i<16;i++){ctx.fillStyle=i%2?'#FF8A7A':'#FFF6E6';ctx.beginPath();ctx.moveTo(i*100,0);ctx.lineTo(i*100+100,0);ctx.lineTo(i*100+100,26);ctx.quadraticCurveTo(i*100+50,62,i*100,26);ctx.closePath();ctx.fill()}
    floor(820,'#E9C99A');
    card(170,44,520,100,'#fff',6,50);pic('tienda',230,94,80);text(V(['La tienda','La tienda']),470,112,54,K,{w:600});
    {const s=hv('btn:casa',hC(1240,70,52)),j=this.newHome?Math.abs(Math.sin((T-this.newHome)*6))*-14:0;ctx.save();ctx.translate(1240,70+j);ctx.scale(s,s);if(this.newHome){ctx.globalAlpha=.4+.3*Math.sin(T*6);circ(0,0,64,null,10,'#FFC93C');ctx.globalAlpha=1}circ(0,0,50,'#fff',6);titoHouseIc(0,0,84);ctx.restore()}
    card(1012,40,150,60,'#fff',5,30);star(1050,70,20,'#FFC93C',3);text(String(STARS()),1110,84,36,K,{f:LF});
    for(const tb of this.tabs()){const on=tb.id===this.cat,s=on?1:hv('tab:'+tb.id,hR(tb.x,tb.y,tb.w,110));ctx.save();ctx.translate(tb.x,tb.y-(on?8:0));ctx.scale(s,s);card(-tb.w/2,-52,tb.w,104,on?'#FFE08A':'#fff',on?8:5,30,on?'#D9962A':K);if(tb.id==='colores'&&titoKind()!=='caracol')shellIcon(0,0,32,'naranja');else pic(tb.ic,0,0,80);ctx.restore()}
    // flechas de página y puntitos con la página actual
    for(const [ax,ay,d] of this.arrows()){const s=hv('pg'+d,hC(ax,ay,50));ctx.save();ctx.translate(ax,ay);ctx.scale(s*d,s);circ(0,0,46,'#fff',6);ctx.beginPath();ctx.moveTo(-12,-22);ctx.lineTo(14,0);ctx.lineTo(-12,22);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}
    {const n=this.pages();if(n>1)for(let i=0;i<n;i++)circ(880-(n-1)*18+i*36,850,i===(this.page||0)?12:8,i===(this.page||0)?'#FFC93C':'#fff',4)}
    // own = ya es suyo, lk = bloqueado por estrellas, lr = su habitación de la casa aún está cerrada, w = lo lleva puesto.
    for(const g of this.grid()){const it=g.it,own=S.owned[it.id]&&!it.vale,lk=STARS()<TIER_NEED[it.tier],lr=!own&&!lk&&it.room&&!roomOpen(it.room),w=own&&it.slot&&isWorn(it),s=lk?1:hv('it:'+it.id,hR(g.x,g.y,210,230));
      ctx.save();ctx.translate(g.x,g.y);ctx.scale(s,s);card(-105,-115,210,230,w?'#FFF6D6':'#fff',w?9:6,32,w?'#FFC93C':K);drawItemPic(it,0,-22,150);
      if(own){circ(0,82,26,'#7CC86E',5);ctx.beginPath();ctx.moveTo(-11,82);ctx.lineTo(-2,92);ctx.lineTo(13,72);ctx.lineWidth=7;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.stroke()}
      else if(lr){ctx.globalAlpha=.7;card(-105,-115,210,230,'#F4EDE2',0,32);ctx.globalAlpha=1;pic('candado',0,-30,110);card(-62,40,124,50,'#fff',4,25);pic('casa',-30,65,40);text(String(roomOf(it.room).need),22,78,30,K,{f:LF})}
      else if(!lk){card(-62,62,124,44,S.coins>=it.p?'#FFF3B0':'#F4EDE2',4,22);pic('moneda',-36,84,40);text(String(it.p),18,98,34,K,{f:LF})}
      if(lk){ctx.globalAlpha=.7;card(-105,-115,210,230,'#F4EDE2',0,32);ctx.globalAlpha=1;pic('candado',0,-30,110);card(-56,40,112,50,'#fff',4,25);star(-24,65,16,'#FFC93C',3);text(String(TIER_NEED[it.tier]),20,78,30,K,{f:LF})}
      ctx.restore()}
    if(this.conf){const it=this.conf,k=clamp((T-this.confT)*4,0,1);ctx.fillStyle=`rgba(46,36,32,${.45*k})`;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(800,450);ctx.scale(back(k),back(k));
      card(-300,-300,600,600,'#FFF6E6',8,50);drawItemPic(it,0,-90,300);card(-90,90,180,64,'#FFF3B0',5,32);pic('moneda',-46,122,54);text(String(it.p),30,140,44,K,{f:LF});ctx.restore();
      if(k>=1){for(const [x,c,ok] of[[680,'#7CC86E',1],[920,'#FF6B5E',0]]){const s=hv('cf'+ok,hC(x,690,70));ctx.save();ctx.translate(x,690);ctx.scale(s,s);circ(0,0,66,c,7);ctx.lineWidth=14;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.beginPath();if(ok){ctx.moveTo(-26,2);ctx.lineTo(-6,24);ctx.lineTo(30,-20)}else{ctx.moveTo(-22,-22);ctx.lineTo(22,22);ctx.moveTo(22,-22);ctx.lineTo(-22,22)}ctx.stroke();ctx.restore()}}}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  // Toques. Con la confirmación abierta: verde compra, rojo o fuera cierra. Si no: casa (mapa), Tito, botón de
  // la casa de Tito, monedas, estrellas, pestañas o un artículo. Al tocar un artículo: si está bloqueado dice cuántas
  // estrellas faltan; si ya es suyo y es ropa se lo pone o quita; si no llegan las monedas dice cuántas faltan; si llegan
  // abre la confirmación.
  down(x,y){
    if(this.conf){if(T-this.confT<.3)return;if(dist(x,y,680,690)<75){this.buy(this.conf);return}if(dist(x,y,920,690)<75||!inR(x,y,800,450,600,600)){SFX.tap();this.conf=null;say('Bueno, ¡otra vez será!')}return}
    if(atHome(x,y)){SFX.tap();go('map');return}
    if(inTito(x,y)){this.prompt();return}
    if(dist(x,y,1240,70)<56){SFX.pop();go('casaTito',{hello:true,nuevo:this.newHome?this.newId:null});return}
    if(inCoinHUD(x,y)){say('Tenés '+S.coins+' monedas.');return}
    if(inR(x,y,1087,70,150,60)){say('Tenés '+STARS()+' estrellas. Las ganás terminando juegos.');return}
    const tb=this.tabs().find(t=>inR(x,y,t.x,t.y,t.w,110));if(tb){SFX.pop();this.cat=tb.id;this.page=0;say(tb.n+'.');return}
    const ar=this.arrows().find(([ax,ay])=>dist(x,y,ax,ay)<56);if(ar){SFX.whoosh();this.page=(this.page||0)+ar[2];return}
    const g=this.grid().find(g=>inR(x,y,g.x,g.y,210,230));if(!g){SFX.tap();sparkles(x,y,3);return}
    const it=g.it,need=TIER_NEED[it.tier];
    if(STARS()<need){SFX.boing();say(cap(itemName(it))+' se abre cuando tengas '+need+' estrellas. ¡Ya tenés '+STARS()+'! Ganás estrellas terminando juegos.');return}
    // su habitación de la casa aún está cerrada: se abre al terminar casitas (ROOMS)
    if(it.room&&!roomOpen(it.room)&&!S.owned[it.id]){SFX.boing();const R=roomOf(it.room);say(cap(itemName(it))+(/^(las|los) /.test(itemName(it))?' son para ':' es para ')+R.n+'. '+cap(R.n)+' se abre cuando termines '+(R.need===1?'una casita.':R.need+' casitas.'));return}
    if(S.owned[it.id]&&!it.vale){
      if(it.slot){const on=it.slot==='shell'||it.slot==='scarf'?true:!isWorn(it);wear(it,on);SFX.pop();sparkles(TITO.x+150,TITO.y+40,12);say(on?'¡Tito se puso '+itemName(it)+'!':V(['Tito se sacó ','Tito se quitó '])+itemName(it)+'.');return}
      SFX.pop();say(cap(itemName(it))+' ya es tuyo. Está en la casa de Tito.');return}
    if(S.coins<it.p){SFX.boing();const f=it.p-S.coins;say(cap(itemName(it))+' cuesta '+it.p+' monedas. Te '+(f===1?'falta una':'faltan '+f)+'. ¡Jugando ganás más!');return}
    SFX.pop();this.conf=it;this.confT=T;say('¿Querés comprar '+itemName(it)+' por '+it.p+' monedas? Tocá el verde para comprar.')},
  // Compra el artículo: gasta las monedas, celebra y lo da. Un vale se apunta en S.valesLog (para que el adulto lo
  // canjee); la ropa se pone a Tito; lo demás se coloca en la casa y hace saltar el botón de la casa.
  buy(it){this.conf=null;spendCoins(it.p,800,400);SFX.tada();burst(800,420,60);
    if(it.vale){S.valesLog.push({id:it.vale.id,txt:it.vale.txt,d:today(),given:0});save();say('¡Compraste el vale! '+it.vale.txt+'. Mostráselo a un adulto de tu familia para canjearlo.');return}
    S.owned[it.id]=1;if(it.slot)wear(it,true);else placeHome(it.id);save();
    if(!it.slot){this.newHome=T;this.newId=it.id}
    say(it.slot?'¡Es tuyo! ¡Mirá qué lindo le queda a Tito!':'¡Es tuyo! Ya está en la casa de Tito. Tocá la casita de arriba para verlo.')}
};

/* ---------- la casa de Tito ---------- */
// Tamaño con el que se dibuja cada objeto en la casa de Tito (160 si no está en la lista).
const HSIZE={alfombra:360,piano:240,estanteria:250,fuente:240,farol:240,banco:250,plantaInterior:180,lampara:220,reloj:140,cuadro:170,casitaPerro:230,pecera:170,hamster:110,telescopio:200,guitarra:170,robot:170,trenJuguete:170,muneca:160,cometa:170,xilofono:170,bloques:150,peluche:160,pelotaPlaya:130,columpio:240,
  sofa:280,tele:200,cama:300,baul:200,cuento:120,estrellas:150,mesa:240,silla:160,nevera:260,olla:130,tarta:150,banera:300,toalla:150,jabon:100,pato:110,
  tambor:150,pizarra:200,pinturas:130,globo:170,tobogan:280,arbol:320,plantaFlor:150,regadera:130,castillo:220,piscina:330,tierra:180,saturno:170,cohete:260,gato:140,pajaro:120,conejo:140};
// Objetos de la casa: los de S.home que además son del niño, con su posición y tamaño. Con r, solo los de esa habitación.
const homeItems=r=>Object.keys(S.home).filter(id=>S.owned[id]&&(!r||homeRoom(id)===r)).map(id=>({id,x:S.home[id].x,y:S.home[id].y,s:HSIZE[id]||160}));
// Al tocar un objeto de la casa: chispitas, su sonido o acción propia (tabla A) y Tito dice su nombre.
function homeAction(id,x,y){SFX.pop();sparkles(x,y,8);
  // A: id del objeto → función que hace al tocarlo (música, sonidos, la lámpara enciende/apaga la luz).
  const A={piano:()=>playTune(TUNES.colores,180),xilofono:()=>playTune(TUNES.meses,220),guitarra:()=>[0,4,7,12].forEach((n,i)=>tone(NOTE(55+n),.5,'triangle',.18,0,i*.06)),trenJuguete:()=>playSound('tren'),
    reloj:()=>{tone(1200,.05,'square',.1);tone(900,.05,'square',.1,0,.5)},robot:()=>[0,1,2].forEach(i=>tone(600+i*200,.1,'square',.1,0,i*.12)),casitaPerro:()=>playSound('perro'),hamster:()=>tone(2400,.08,'sine',.15),
    fuente:()=>SFX.splash(),pecera:()=>SFX.drip(),
    // v1.590
    tele:()=>playTune(TUNES.colores,240),tambor:()=>[0,1,2].forEach(i=>noise(.12,.5,180,i*.18)),pato:()=>playSound('pato'),gato:()=>playSound('gato'),pajaro:()=>playSound('pajaro'),
    conejo:()=>SFX.boing(),globo:()=>SFX.pop(),piscina:()=>SFX.splash(),banera:()=>SFX.splash(),jabon:()=>SFX.sparkle(),regadera:()=>SFX.drip(),columpio:()=>SFX.whoosh(),tobogan:()=>SFX.whoosh(),
    cohete:()=>{SFX.whoosh();SFX.sparkle()},nevera:()=>tone(180,.4,'sine',.15),olla:()=>SFX.munch(),cama:()=>playTune(TUNES.meses,300),cometa:()=>SFX.whoosh(),pelotaPlaya:()=>SFX.boing(),bloques:()=>SFX.snap(),telescopio:()=>SFX.sparkle(),lampara:()=>{homeLight=!homeLight}};
  (A[id]||(()=>{}))();say(cap(W_(id))+'.')}
// Luz de la casa de Tito (la lámpara la cambia: de noche se oscurece la habitación). No se guarda.
let homeLight=true;
// roomBg(id, hl): dibuja el fondo fijo de la habitación id de la casa de Tito (pared, ventana, suelo y adornos propios);
// hl es el nivel de la casa (houseLevel): en el salón añade flores, banderines y arcoíris como antes. El suelo empieza
// siempre en y = 600 (los objetos se colocan del 420 al 780). Con la luz apagada (homeLight) se ve la noche.
function roomBg(id,hl){
  const win=(x,y,w,h,cort)=>{card(x,y,w,h,homeLight?'#BFEAF7':'#2E3F7A',8,16);if(homeLight)pic('sol',x+w/3,y+70,90);else pic('luna',x+w/3,y+70,80);ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w/2,y+h);ctx.moveTo(x,y+h/2);ctx.lineTo(x+w,y+h/2);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke();
    if(cort){ctx.fillStyle=cort;for(const sd of[0,1]){ctx.beginPath();const cx=sd?x+w+10:x-10;ctx.moveTo(cx,y-14);ctx.lineTo(cx+(sd?-70:70),y-14);ctx.quadraticCurveTo(cx+(sd?-30:30),y+h/2,cx+(sd?-50:50),y+h+20);ctx.lineTo(cx,y+h+20);ctx.closePath();fillStroke(cort,5)}}};
  const wood=c=>{floor(600,c);ctx.strokeStyle='rgba(74,52,40,.15)';ctx.lineWidth=4;for(let y=640;y<900;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}card(-10,588,W+20,24,'#C98A4B',5,6)};
  const checker=(a,b,z)=>{for(let y=600;y<H;y+=z)for(let x=0;x<W;x+=z){ctx.fillStyle=(Math.floor(x/z)+Math.floor((y-600)/z))%2?a:b;ctx.fillRect(x,y,z,z)}card(-10,588,W+20,20,'#fff',5,6)};
  if(id==='salon'){sky('#FFEFD9','#FFE6C6');ctx.fillStyle='rgba(255,201,60,.12)';for(let x=0;x<W;x+=80)ctx.fillRect(x,0,40,600);win(1200,130,300,230);wood('#E2B98A');
    if(hl>=1)for(let i=0;i<20;i++)flower(40+i*80,592,12,FLC[i%7],2.5);if(hl>=3)bunting(16,14);
    if(hl>=4){ctx.save();ctx.beginPath();ctx.rect(1200,130,300,230);ctx.clip();['#FF6B5E','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9'].forEach((c,i)=>{ctx.beginPath();ctx.arc(1350,400,200-i*14,PI,0);ctx.lineWidth=14;ctx.strokeStyle=c;ctx.stroke()});ctx.restore()}}
  else if(id==='dormitorio'){sky('#EDE6FB','#E2D8F7');for(let y=180;y<600;y+=90)for(let x=(y/90%2)*60;x<W;x+=120)star(x,y,9,'rgba(155,138,217,.35)',0);win(1210,160,280,210,'#9B8AD9');wood('#D9B58A')}
  else if(id==='cocina'){sky('#FFF9EC','#FFF4DC');ctx.fillStyle='#fff';ctx.fillRect(0,380,W,220);ctx.strokeStyle='#BFE3F0';ctx.lineWidth=3;for(let y=380;y<=600;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=0;x<W;x+=55){ctx.beginPath();ctx.moveTo(x,380);ctx.lineTo(x,600);ctx.stroke()}
    win(1210,160,280,190,'#FF8A7A');checker('#F2E1C8','#E0C49E',75)}
  else if(id==='bano'){sky('#DDF4FA','#CDEFF7');ctx.strokeStyle='rgba(91,184,230,.35)';ctx.lineWidth=3;for(let y=150;y<600;y+=70){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=0;x<W;x+=70){ctx.beginPath();ctx.moveTo(x,150);ctx.lineTo(x,600);ctx.stroke()}
    circ(1350,260,110,'#E8FAFF',8);ctx.save();ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(1290,220);ctx.lineTo(1330,180);ctx.moveTo(1300,260);ctx.lineTo(1360,200);ctx.lineWidth=10;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.stroke();ctx.restore();checker('#FFFFFF','#BDE8F2',70)}
  else if(id==='juegos'){sky('#FFF6C9','#FFEFA8');const C=['#FF8A7A','#7CC86E','#5BB8E6','#FFA94D','#9B8AD9'];for(let i=0;i<26;i++)circ((i*263)%W,170+(i*137)%400,14+(i%3)*6,C[i%5],0);bunting(150,12);
    for(let y=600;y<H;y+=100)for(let x=0;x<W;x+=100){ctx.fillStyle=C[((x+y)/100)%5];ctx.fillRect(x,y,100,100)}ctx.strokeStyle='rgba(74,52,40,.2)';ctx.lineWidth=4;ctx.strokeRect(-2,600,W+4,H);card(-10,588,W+20,20,'#fff',5,6)}
  else if(id==='jardin'){sky(homeLight?'#9FDDF5':'#2E3F7A',homeLight?'#E2F6FF':'#55639A');if(homeLight){pic('sol',1430,190,130);pic('nube',300,220,180);pic('nube',820,170,140)}else pic('luna',1430,190,110);
    floor(520,'#A6DC7F');for(let x=0;x<W;x+=60){card(x+8,430,40,150,'#fff',4,10)}card(-10,470,W+20,22,'#fff',4,6);card(-10,530,W+20,22,'#fff',4,6);floor(600,'#9BD67A');for(let i=0;i<14;i++)flower(60+i*115,620+(i%3)*90,10,FLC[i%7],2)}
  else if(id==='torre'){sky('#1E2A55','#34417A');for(let i=0;i<60;i++){const x=(i*397)%W,y=40+(i*211)%520;star(x,y,3+(i%4)*2,'rgba(255,230,140,'+(.5+.5*Math.sin(T*2+i))+')',0)}
    circ(1330,280,150,'#0F1838',10,'#C98A4B');pic('luna',1290,240,90);for(let i=0;i<8;i++)star(1220+(i*53)%220,180+(i*71)%200,5,'#FFE08A',0);wood('#8C6A4E')}
  if(!homeLight&&id!=='torre'){ctx.fillStyle='rgba(30,30,70,.25)';ctx.fillRect(0,0,W,H)}}
// Botones de las habitaciones (arriba, entre el título y la tienda): x, y y la habitación.
const roomBtns=()=>ROOMS.map((R,i)=>({R,x:660+i*76,y:94}));
// Escena de la casa de Tito por dentro (2D), con habitaciones (ROOMS) que se abren al terminar casitas: arriba,
// un botón por habitación; los objetos comprados se pueden arrastrar, tocar y llevar a otra habitación soltándolos
// en su botón. Abajo está el armario con la ropa de Tito y la mascota Pipo. Estado: room (habitación que se ve; se
// recuerda entre visitas), drag (objeto que se arrastra), newRoom (cuándo se abrió una habitación, para que brille).
SCENES.casaTito={music:'casita',room:'salon',
  // Al entrar. o.nuevo: id de lo recién comprado (se va a su habitación y se resalta con brillo y flecha durante 12 s;
  // si es ropa, Tito salta). Si no, si se abrió una habitación desde la última visita (S.rooms cuenta las que ya se
  // vieron), se va a ella y Tito lo anuncia. Si no, Tito saluda según haya cosas o la casa esté vacía.
  enter(o){this.drag=null;this.jump=-9;this.petJump=-9;this.newRoom=-9;const nv=o.nuevo&&SHOP.find(i=>i.id===o.nuevo);this.nuevo=nv&&S.owned[nv.id]?nv:null;this.t0=T;
    if(!roomOpen(this.room))this.room='salon';const n=homeItems().length,op=roomsOpen();
    if(this.nuevo){const it=this.nuevo;if(it.slot)this.jump=T+.3;else this.room=homeRoom(it.id);later(300,()=>{SFX.sparkle();say('¡Acá está '+itemName(it)+'! '+(it.slot?'¡Mirá qué lindo me queda!':V(['Podés cambiar las cosas de lugar arrastrándolas.','Puedes cambiar las cosas de lugar arrastrándolas.'])))});return}
    if(op.length>(S.rooms||1)){const R=op[op.length-1];S.rooms=op.length;save();this.room=R.id;this.newRoom=T;later(300,()=>{SFX.tada();burst(800,400,50);sayQ('¡Mi casa creció! Tiene una habitación nueva: '+R.n+'. Arriba podés elegir a qué habitación ir.')});return}
    later(300,()=>sayQ(n?V(['¡Esta es mi casa! Podés mover las cosas arrastrándolas, y tocarlas para jugar.','¡Esta es mi casa! Puedes mover las cosas arrastrándolas, y tocarlas para jugar.']):V(['¡Esta es mi casa! Está vacía. En la tienda podés comprar cosas con tus monedas.','¡Esta es mi casa! Está vacía. En la tienda puedes comprar cosas con tus monedas.'])))},
  // Armario: la ropa y colores que tiene el niño, con su posición en la fila de abajo.
  wardrobe(){const L=SHOP.filter(i=>i.slot&&S.owned[i.id]);return L.map((it,i)=>({it,x:470+i*100,y:845}))},
  // Tito explica qué hacer en la casa.
  prompt(){say(homeItems().length?'Arrastrá las cosas para acomodar la casa. Abajo está mi ropa: tocala para ponérmela.':'Tocá el carrito para ir a la tienda.')},
  // Pista: si la casa está vacía señala el botón de la tienda.
  hint(){return homeItems().length?null:{x:1240,y:70,r:60}},
  // Dedo encima de un objeto: dice su nombre; encima del botón de una habitación, su nombre.
  dwell(id){if(id.startsWith('h:'))say(cap(W_(id.slice(2)))+'.');else if(id.startsWith('room:'))say(cap(roomOf(id.slice(5)).n)+'.')},
  // Dibuja la habitación (roomBg), el título con su nombre, los botones de las habitaciones (la actual en amarillo,
  // las cerradas con candado, la recién abierta brillando), el botón de la tienda, los objetos, Tito, la mascota y el armario.
  draw(){const hl=houseLevel(),R=roomOf(this.room);roomBg(R.id,hl);
    card(170,44,450,100,'#fff',6,50);titoHouseIc(230,94,80);{const nm=cap(R.n),fs=nm.length>16?28:nm.length>11?36:46;text(nm,425,94+fs*.36,fs,K,{w:600})}
    for(const b of roomBtns()){const op=roomOpen(b.R.id),on=b.R.id===R.id,s=on?1:hv('room:'+b.R.id,hC(b.x,b.y,34));ctx.save();ctx.translate(b.x,b.y-(on?4:0));ctx.scale(s,s);
      if(this.newRoom>0&&b.R.id===R.id&&T-this.newRoom<8){ctx.globalAlpha=.4+.3*Math.sin(T*6);circ(0,0,46,null,10,'#FFC93C');ctx.globalAlpha=1}
      if(this.drag&&this.drag.moved&&op&&!on&&dist(this.drag.x||0,this.drag.y||0,b.x,b.y)<44){circ(0,0,44,'#FFE08A',0)}
      circ(0,0,34,on?'#FFE08A':op?'#fff':'#EADFCF',on?7:5,on?'#D9962A':K);if(op)pic(b.R.ic,0,0,50);else{ctx.globalAlpha=.35;pic(b.R.ic,0,0,46);ctx.globalAlpha=1;pic('candado',0,4,36)}ctx.restore()}
    {const s=hv('btn:tienda',hC(1240,70,52));ctx.save();ctx.translate(1240,70);ctx.scale(s,s);circ(0,0,50,'#fff',6);pic('tienda',0,0,84);ctx.restore()}
    const nv=this.nuevo;if(nv&&!nv.slot&&S.home[nv.id]&&homeRoom(nv.id)===R.id&&(T-this.t0)<12){const p=S.home[nv.id],hs=HSIZE[nv.id]||160;ctx.globalAlpha=.45+.2*Math.sin(T*5);circ(p.x,p.y-hs*.4,hs*.62,'#FFE08A',0);ctx.globalAlpha=1}
    // Orden de dibujo: primero la alfombra, luego lo de la pared y después de atrás (y pequeña) hacia delante.
    const its=homeItems(R.id).sort((a,b)=>(a.id==='alfombra'?-1:b.id==='alfombra'?1:0)||(WALLITEMS.includes(a.id)?-1:WALLITEMS.includes(b.id)?1:0)||a.y-b.y);
    for(const o of its){const dr=this.drag&&this.drag.id===o.id,ox=o.id==='hamster'&&!dr?Math.sin(T*.9)*110:0,b=o.id==='hamster'?Math.abs(Math.sin(T*8))*-6:0,s=dr?1.08:hv('h:'+o.id,hC(o.x,o.y-o.s*.2,o.s*.45));
      ctx.save();ctx.translate(o.x+ox,o.y+b);ctx.scale(s,s);if(o.id==='lampara'&&homeLight){ctx.globalAlpha=.25+.05*Math.sin(T*3);circ(0,-o.s*.3,o.s*.5,'#FFE08A',0);ctx.globalAlpha=1}
      if(o.id==='hamster'&&Math.cos(T*.9)<0)ctx.scale(-1,1);pic(o.id,0,-o.s*.42,o.s);if(o.id==='casitaPerro')pic('perro',o.s*.62,-o.s*.22+Math.abs(Math.sin(T*3))*-6,o.s*.55);ctx.restore()}
    if(nv&&!nv.slot&&S.home[nv.id]&&homeRoom(nv.id)===R.id&&(T-this.t0)<12){const p=S.home[nv.id],hs=HSIZE[nv.id]||160;arrowAt(p.x,p.y-hs*.9-30)}
    const tb=this.jump>0&&T>this.jump?Math.max(0,1-(T-this.jump)*2)*Math.abs(Math.sin((T-this.jump)*10))*-60:0;drawTito(250,330+tb,380);
    if(nv&&nv.slot&&(T-this.t0)<6&&Math.random()<.15)sparkles(440+rnd(-120,120),420+rnd(-80,80),2);
    drawPet(190,872,150,{jump:this.petJump});
    const wd=this.wardrobe();if(wd.length){card(400,795,Math.min(1080,wd.length*100+40),100,'rgba(255,255,255,.8)',5,50);for(const w of wd){const on=isWorn(w.it),s=hv('w:'+w.it.id,hC(w.x,w.y,44));ctx.save();ctx.translate(w.x,w.y);ctx.scale(s,s);circ(0,0,42,on?'#FFF3B0':'#fff',on?7:4,on?'#FFC93C':K);drawItemPic(w.it,0,0,72);ctx.restore()}}
    drawHome();drawCoinHUD()},
  // Objeto de la habitación que hay bajo el toque (x,y), mirando primero los de delante; el hámster se mueve solo.
  itemAt(x,y){return homeItems(this.room).sort((a,b)=>b.y-a.y).find(o=>{const ox=o.id==='hamster'?Math.sin(T*.9)*110:0;return Math.abs(x-o.x-ox)<o.s*.45&&y<o.y+10&&y>o.y-o.s*.85})},
  // Toques: casa (mapa), tienda, monedas, mascota (dice cuánto le falta para crecer), botón de una habitación (abierta:
  // va a ella; cerrada: dice cuántas casitas faltan), el título (cuánto falta para que la casa crezca), Tito (salta y
  // dice algo), una prenda del armario (se la pone o quita) o un objeto (empieza a arrastrarlo).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}
    if(dist(x,y,1240,70)<56){SFX.pop();go('tienda');return}
    if(inCoinHUD(x,y)){say('Tenés '+S.coins+' monedas.');return}
    if(dist(x,y,190,790)<85){this.petJump=T;SFX.boing();const ps=petStage(),f=ps<4?PET_NEXT[ps]-STARS():0;say(ps===0?'Es el huevo de Pipo. Le '+(f===1?'falta un juego':'faltan '+f+' juegos')+' para abrirse.':ps<4?pick(['¡Pipo te quiere mucho!','Pipo dice: ¡grrr! Así saludan los dinosaurios.','¡Pipo crece cuando jugás! Le '+(f===1?'falta un juego':'faltan '+f+' juegos')+' para crecer.']):'¡Pipo es el dinosaurio más grande del mundo!');return}
    const rb=roomBtns().find(b=>dist(x,y,b.x,b.y)<38);
    if(rb){const R=rb.R;if(!roomOpen(R.id)){SFX.boing();const f=R.need-temasDone();say(cap(R.n)+' todavía está '+R.cer+'. Se abre cuando termines '+(f===1?'una casita más.':f+' casitas más.'));return}
      if(R.id!==this.room){SFX.pop();this.room=R.id;this.newRoom=-9}say(cap(R.n)+'.');return}
    if(inR(x,y,395,94,450,100)){SFX.pop();const hl=houseLevel(),f=hl<4?HOUSE_NEXT[hl]-temasDone():0;say(hl<4?'La casa de Tito crece cuando terminás casitas. '+(f===1?'Falta una':'Faltan '+f)+' para que crezca.':'¡La casa de Tito ya es un castillo!');return}
    if(inR(x,y,440,500,380,330)){this.jump=T;SFX.boing();say(pick(['¡Me encanta mi casa!','¡Gracias por jugar conmigo!','¡Qué lindo día!',V(['¿Viste mi ropa nueva?','¿Has visto mi ropa nueva?'])]));return}
    const w=this.wardrobe().find(w=>dist(x,y,w.x,w.y)<46);if(w){const it=w.it,on=it.slot==='shell'||it.slot==='scarf'?true:!isWorn(it);wear(it,on);SFX.pop();this.jump=T;say(on?'¡Me puse '+itemName(it)+'!':V(['Me saqué ','Me quité '])+itemName(it)+'.');return}
    const o=this.itemAt(x,y);if(o){const p=S.home[o.id];this.drag={id:o.id,dx:x-o.x,dy:y-o.y,sx:x,sy:y,ox:p.x,oy:p.y,moved:false};drag={it:o,home:1};setCursor('grab');return}
    SFX.tap();sparkles(x,y,3)},
  // Arrastrar: a partir de 12 px se considera que se mueve y el objeto sigue al dedo. Mientras se arrastra puede subir
  // hasta los botones de las habitaciones (para llevarlo a otra); al soltar se vuelve a encajar en el suelo o la pared.
  move(x,y){const d=this.drag;if(!d)return;d.x=x;d.y=y;if(Math.abs(x-d.sx)+Math.abs(y-d.sy)>12)d.moved=true;if(d.moved){const p=S.home[d.id];p.x=clamp(x-d.dx,40,1560);p.y=clamp(y-d.dy,60,780)}},
  // Al soltar: si se soltó sobre el botón de otra habitación abierta, el objeto se va a esa habitación (a un hueco
  // libre) y Tito lo dice; sobre una cerrada, vuelve a su sitio. Si no, se encaja en los límites y se guarda. Si no se
  // movió, era un toque y hace la acción del objeto (homeAction).
  up(x,y){const d=this.drag;if(!d)return;this.drag=null;drag=null;setCursor('pt');const p=S.home[d.id];
    if(!d.moved){save();homeAction(d.id,p.x,p.y-80);return}
    const rb=roomBtns().find(b=>dist(x,y,b.x,b.y)<44&&b.R.id!==this.room);
    if(rb){if(roomOpen(rb.R.id)){const sp=homeSpot(d.id,rb.R.id);Object.assign(p,{x:sp[0],y:sp[1],r:rb.R.id});save();SFX.whoosh();sparkles(rb.x,rb.y,10);say('¡Listo! Ya está en '+rb.R.n+'.');return}
      SFX.boing();p.x=d.ox;p.y=d.oy;save();return}
    p.x=clamp(p.x,300,1500);p.y=clamp(p.y,WALLITEMS.includes(d.id)?300:420,780);save();SFX.snap()}
};
// Envuelve el dibujo de los juegos para pintar también el marcador de monedas.
{const d0=SCENES.juego.draw;SCENES.juego.draw=function(){d0.call(this);drawCoinHUD()}}
