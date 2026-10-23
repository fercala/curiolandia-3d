/* ================= COMPONENTES NUEVOS (v2) ================= */
// ============================================================================
// ARCHIVO comps2.js — Componentes de juego (parte 2, "v2")
// ============================================================================
// Más tipos de juego, con la MISMA interfaz que los de comps.js (lee allí la
// explicación completa): Nombre(cfg, onDone) devuelve un objeto con total, done,
// enter, update(dt), draw, down/move/up(x,y), prompt y hint; informa con rec(),
// onRight(), onWrongTwice(), this.done++ y scene.starPop=T, y llama a onDone()
// al terminar.
// COMPONENTES: Secuencia (ordenar viñetas, sobre Arrastra), Une (unir con
// flechas), Series (qué viene después, sobre ChoiceGame), Lens (lupa o
// linterna), TocaPartes (tocar partes de un dibujo), Apaga (apagar luces y
// grifos), Frota (frotar para limpiar), Llena (meter N cosas), Velas (soplar
// velas), Gira (girar la Tierra), Semaforo, Cruce (derecha/izquierda), Tracer
// (seguir un trazo), Song (canción) y Story (cuento con preguntas; lo crea
// extras.js para {t:'cuento'}).
// OTRAS GLOBALES QUE USAN OTROS ARCHIVOS: IMGS, shadowOf, picS, picF, numCard,
// arrowBtn, refCard, panel, germ, pathPts, NOTE, TUNES, playTune, sceneTokBump.
// Además REDEFINE thing() (comps.js) para dibujar caritas 'emo:...'.
// DEPENDE DE: comps.js (thing, ChoiceGame, Arrastra, layoutChoice, drawChoice,
// hitItem, nameT, eseEs, NUM), core.js (dibujo, voz, SFX, tone, AC, sayTok,
// talking, DIAC, ala, sky, hand, inR...), lex.js (V, Wn, tx), pics-*.js
// (PICS, pic, svgImg), scenes.js (drawFace, BG) y cuentos.js (CUENTOS, datos
// de Story). Al ir todo en un mismo script, se resuelven cuando se ejecutan.
// ============================================================================
// siluetas para "¿de quién es esta sombra?"
// caché de siluetas ya creadas: clave de dibujo → imagen
const IMGS={};
// Devuelve (y guarda en IMGS) la silueta del dibujo k: el mismo SVG de PICS[k]
// con todos los colores cambiados por un azul oscuro. Se crea una sola vez.
function shadowOf(k){if(!IMGS[k]&&PICS[k])IMGS[k]=svgImg(PICS[k].replace(/(fill|stroke)="#[0-9A-Fa-f]{6}"/g,(m,a)=>a+'="#3B3F58"'),'-62 -62 124 124',320);return IMGS[k]}
// Dibuja la silueta del dibujo n centrada en (x,y) con tamaño s (si ya cargó).
function picS(n,x,y,s){const i=shadowOf(n);if(!i||!i.complete)return;ctx.drawImage(i,x-s/2,y-s/2,s,s)}
// una "cosa" puede ser una carita de emoción: 'emo:alegria'
// guardamos la thing() original de comps.js para llamarla desde la nueva
const _thing0=thing;
// Nueva thing(): si k es 'emo:alegria' (etc.) dibuja la carita de esa emoción
// con drawFace (scenes.js); si no, hace lo de siempre.
thing=function(k,x,y,s){if(typeof k==='string'&&k.startsWith('emo:')){drawFace(x,y,s*.44,k.slice(4));return}_thing0(k,x,y,s)};
// Como thing(), pero si flip es verdadero dibuja la cosa reflejada (mirando
// al otro lado).
function picF(k,x,y,s,flip){if(!flip){thing(k,x,y,s);return}ctx.save();ctx.translate(x,y);ctx.scale(-1,1);thing(k,0,0,s);ctx.restore()}
// tarjeta con número (0-10) y puntitos
// Tarjeta con el número n (0-10) y debajo n puntitos en filas de 5.
// o: {bg: color de fondo, dots: false para no dibujar los puntitos}.
function numCard(n,x,y,s,o={}){card(x-s/2,y-s/2,s,s,o.bg||'#fff',6,s*.16);text(String(n),x,y+s*(o.dots===false?.17:.05),s*(o.dots===false?.55:.42),K,{f:LF});
  if(o.dots!==false&&n>0){const r=s*.045,cols=Math.min(5,n),rows=Math.ceil(n/5);for(let i=0;i<n;i++){const c=i%5,rw=Math.floor(i/5),nc=rw<rows-1?5:n-rw*5;circ(x-(nc-1)*r*1.5+c*r*3,y+s*.3+rw*r*2.6-(rows-1)*r*1.3,r,'#5B8DEF',0)}}}
// Botón redondo de color c con una flecha blanca; dir 1 = derecha, -1 = izquierda;
// s = escala (para el efecto de pasar el ratón).
function arrowBtn(x,y,dir,c,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s*dir,s);circ(0,0,90,c,7);ctx.beginPath();ctx.moveTo(-40,-14);ctx.lineTo(8,-14);ctx.lineTo(8,-42);ctx.lineTo(50,0);ctx.lineTo(8,42);ctx.lineTo(8,14);ctx.lineTo(-40,14);ctx.closePath();fillStroke('#fff',6);ctx.restore()}
// cartel de pregunta con un dibujo de referencia arriba
// Tarjeta blanca de w x h centrada en (x,y); f(x,y) dibuja lo de dentro.
function refCard(x,y,w,h,f){card(x-w/2,y-h/2,w,h,'#fff',7,36);f&&f(x,y)}

/* ---------- ordenar escenas (secuencias) ---------- */
// cfg.panels: [{name, draw(x,y,s)}|picKey] en el orden correcto; cfg.ask; cfg.okAll
// COMPONENTE Secuencia: ordenar viñetas (qué pasa primero, después...).
// Es un Arrastra con una zona numerada por viñeta ('s0','s1'...) y cada
// viñeta solo vale en su zona. cfg: panels (lista en el orden correcto de
// claves de dibujo o de objetos {name, draw(x,y,s)}, ver panel()) o sets
// (varias listas = varias rondas), ask, okAll, why(it,z), placeSay, key, bg,
// first (a 3 y 4 años deja ya puesta la primera viñeta).
function Secuencia(cfg,onDone){
  const sets=cfg.sets||[cfg.panels];
  return Arrastra({rounds:sets.length,key:cfg.key||'secuencia',bg:cfg.bg,rect:true,sayPick:false,
    // frase de fallo: la del tema o la genérica (la misma en las dos variantes)
    why:(it,z)=>cfg.why?cfg.why(it,z):V(['Mmm, eso no va ahí. ¿Qué pasa primero? ¿Y después?','Mmm, eso no va ahí. ¿Qué pasa primero? ¿Y después?']),
    placeSay:cfg.placeSay,
    // Ronda i: calcula el tamaño de las viñetas para que quepan en fila, crea las
    // zonas punteadas con su número encima (draw) y su único hueco (slot), y las
    // viñetas con su zona correcta.
    gen(i){const P=sets[i],n=P.length,s=Math.min(230,(1240-(n-1)*28)/n),x0=900-(n-1)*(s+28)/2;
      const zones=P.map((p,j)=>({id:'s'+j,x:x0+j*(s+28),y:330,w:s,h:s,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=30}ctx.setLineDash([14,12]);rr(z.x-s/2,z.y-s/2,s,s,26);fillStroke('rgba(255,255,255,.75)',6,hl?'#FFC93C':'#B8A890');ctx.setLineDash([]);ctx.restore();
        circ(z.x,z.y-s/2-34,26,'#FFC93C',5);text(String(j+1),z.x,z.y-s/2-23,32,K,{f:LF})},slot:()=>[x0+j*(s+28),330],ps:1}));
      const fixed=cfg.first&&AGE()<=4?1:0;
      const items=P.map((p,j)=>({k:p,zone:'s'+j,s:Math.min(200,s)}));
      return {ask:cfg.ask,zones,items,tray:{x0:360,x1:1500,y:700},okAll:cfg.okAll,preset:fixed?[0]:null}}},onDone);
}
// panel dibujado a partir de dibujos sueltos
// panel(name, parts, extra): crea una viñeta {name, draw(x,y,s)} juntando
// dibujos sueltos. parts: lista de [clave, x, y, tamaño, reflejar] con x, y y
// tamaño relativos al lado s de la viñeta (0,1 = 10 %); extra(x,y,s): dibujo
// adicional opcional.
const panel=(name,parts,extra)=>({name,draw:(x,y,s)=>{card(x-s*.46,y-s*.46,s*.92,s*.92,'#FFFBF2',0,s*.12);for(const [k,a,b,z,f] of parts)picF(k,x+a*s,y+b*s,z*s,f);extra&&extra(x,y,s)}});

/* ---------- unir con flechas ---------- */
// COMPONENTE Une: unir cada dibujo de la izquierda con su pareja de la derecha
// arrastrando una línea (o tocando uno y luego el otro).
// cfg: pairs ([izquierda, derecha] = parejas), n (parejas por ronda, 3-4 según
// la edad), rounds (2), ask, okSay(a,b), why(a,b), key, bg.
// Una estrella por pareja unida.
function Une(cfg,onDone){
  const n=cfg.n||(AGE()<=3?3:AGE()===4?3:4),R=cfg.rounds||2;
  return {total:n*R,done:0,i:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: elige n parejas; la columna izquierda en orden y la derecha barajada.
    // m = número de pareja (sirve para comprobar y para el color de la línea).
    load(){const ps=shuffle(cfg.pairs).slice(0,n),gap=Math.min(190,600/Math.max(1,n-1)),s=Math.min(160,gap-24);
      this.s=s;this.L=ps.map((p,j)=>({k:p[0],m:j,x:560,y:480-(n-1)*gap/2+j*gap,in:T+j*.08}));
      const ry=shuffle(ps.map((p,j)=>j));this.R=ps.map((p,j)=>({k:p[1],m:j,x:1240,y:480-(n-1)*gap/2+ry[j]*gap,in:T+.3+j*.08}));
      this.sel=null;this.errs=0;later(300,()=>sayQ(V(cfg.ask)))},
    // Repite la consigna.
    prompt(){say(V(cfg.ask))},
    // Ayuda: desde el punto de la primera tarjeta izquierda sin unir hasta su pareja.
    hint(){const a=this.L.find(l=>!l.ok);if(!a)return null;const b=this.R.find(r=>r.m===a.m);return{x:a.x+this.s/2+24,y:a.y,r:60,dx:b.x-this.s/2-24-(a.x+this.s/2+24),dy:b.y-a.y}},
    // Tarjeta de la lista (columna) que hay en el punto (x,y), con margen.
    at(list,x,y){return list.find(o=>Math.abs(x-o.x)<this.s/2+40&&Math.abs(y-o.y)<this.s/2+10)},
    // Dibuja las líneas ya unidas (curvas de colores), la línea punteada que se
    // está arrastrando y las tarjetas de las dos columnas con su punto de unión.
    draw(){cfg.bg();const s=this.s;
      for(const l of this.L)if(l.ok){const r=this.R.find(r=>r.m===l.m);ctx.beginPath();ctx.moveTo(l.x+s/2+24,l.y);ctx.bezierCurveTo(900,l.y,900,r.y,r.x-s/2-24,r.y);ctx.lineWidth=12;ctx.strokeStyle=DIAC[l.m%7];ctx.lineCap='round';ctx.stroke()}
      if(this.sel){const l=this.sel,tx=this.mx??l.x+s/2+24,ty=this.my??l.y;ctx.beginPath();ctx.moveTo(l.x+s/2+24,l.y);ctx.lineTo(tx,ty);ctx.lineWidth=10;ctx.setLineDash([16,12]);ctx.strokeStyle='#FFC93C';ctx.stroke();ctx.setLineDash([])}
      for(const side of[this.L,this.R])for(const o of side){const ap=clamp((T-o.in)*3,0,1),hs=o.ok?1:hv(o,hR(o.x,o.y,s,s));ctx.save();ctx.translate(o.x,o.y);const sc=(ap<1?back(ap):1)*hs*(this.sel===o?1.08:1);ctx.scale(sc,sc);
        const sx=o.shake>0?Math.sin((T-o.shake)*40)*10*Math.max(0,1-(T-o.shake)*2.5):0;ctx.translate(sx,0);
        card(-s/2,-s/2,s,s,o.ok?'#F1FAEE':'#fff',this.sel===o?9:6,30,this.sel===o?'#FFC93C':K);thing(o.k,0,0,s*.82);ctx.restore();
        circ(o.x+(side===this.L?1:-1)*(s/2+24),o.y,13,o.ok?DIAC[o.m%7]:'#fff',5)}},
    // Toque: en una tarjeta izquierda empieza la línea; en una derecha con una
    // izquierda elegida, comprueba la pareja; si no, Tito dice el nombre.
    down(x,y){if(this.busy)return;const l=this.at(this.L,x,y);
      if(l&&!l.ok){this.sel=l;this.mx=x;this.my=y;this.dragging=true;drag={it:l,une:1};setCursor('grab');SFX.pop();if(Math.random()<.5)say(cap(nameT(l.k))+'.');return}
      const r=this.at(this.R,x,y);if(r&&!r.ok&&this.sel){this.check(this.sel,r);return}
      if(r&&!r.ok){SFX.tap();say(cap(nameT(r.k))+'.');return}SFX.tap()},
    // Mueve el extremo de la línea que se arrastra.
    move(x,y){if(this.dragging){this.mx=x;this.my=y}},
    // Soltar: si se suelta sobre una tarjeta derecha, comprueba la pareja; si no,
    // la tarjeta izquierda sigue elegida para tocar luego su pareja.
    up(x,y){if(!this.dragging)return;this.dragging=false;drag=null;setCursor('pt');const r=this.at(this.R,x,y);if(r&&!r.ok)this.check(this.sel,r);else{this.mx=null;this.my=null}},
    // Comprueba si l y r son pareja: sí → estrella, línea fija y, si están todas,
    // siguiente ronda u onDone; no → temblor y frase de error.
    check(l,r){if(l.m===r.m){l.ok=r.ok=T;this.sel=null;SFX.good();burst(r.x,r.y,20);rec(cfg.key||'une',this.errs===0);onRight(this.errs===0);this.errs=0;this.done++;scene.starPop=T;this.busy=true;
        say(cfg.okSay?cfg.okSay(l.k,r.k):praise(),()=>later(250,()=>{this.busy=false;if(this.L.every(o=>o.ok)){this.i++;if(this.i>=R)onDone();else this.load()}}))}
      else{SFX.bad();r.shake=T;this.errs++;if(this.errs===1)rec(cfg.key||'une',false);this.sel=null;say(cfg.why?cfg.why(l.k,r.k):'Mmm, '+nameT(l.k)+' no va con '+nameT(r.k)+'.');if(this.errs>=2){onWrongTwice();idle=12}}}
  };
}

/* ---------- series: ¿qué viene después? ---------- */
// COMPONENTE Series: una fila que se repite (A B A B ...) y hay que elegir qué
// viene después. Usa ChoiceGame. cfg: pool (claves; se usan 4 al azar),
// rounds, bg. A 3-4 años y en la primera ronda el patrón es AB; a 5 años
// también ABC, AAB o ABB.
function Series(cfg,onDone){
  const R=cfg.rounds||nRounds();
  return ChoiceGame({rounds:R,bg:cfg.bg,key:()=>'series',y:700,
    // Dibuja la fila de la serie en una tarjeta y un hueco con '?' al final.
    ref(r){const n=r.row.length,s=Math.min(150,1180/(n+1)),x0=900-(n)*(s+14)/2;card(x0-s/2-30,330-s/2-30,(n+1)*(s+14)+44,s+60,'#fff',6,30);
      r.row.forEach((k,j)=>{const b=Math.sin(T*3+j)*4;thing(k,x0+j*(s+14),330+b,s*.86)});const qx=x0+n*(s+14),p=1+Math.sin(T*5)*.06;ctx.save();ctx.translate(qx,330);ctx.scale(p,p);ctx.setLineDash([10,9]);rr(-s/2+6,-s/2+6,s-12,s-12,22);fillStroke('#FFF3B0',5,'#FFC93C');ctx.setLineDash([]);text('?',0,s*.2,s*.6,'#FFA94D',{f:LF});ctx.restore()},
    // Ronda i: elige el patrón (unit) y la longitud; la respuesta es lo que toca
    // en la posición len; las opciones son la respuesta, las piezas del patrón y
    // una cosa más (pool[3]), recortadas según nOpts().
    gen(i){const pool=shuffle(cfg.pool),age=AGE();const kind=age<=4||i<1?'AB':pick(['ABC','AAB','ABB']);
      const A=pool[0],B=pool[1],C=pool[2],unit={AB:[A,B],ABC:[A,B,C],AAB:[A,A,B],ABB:[A,B,B]}[kind];
      const len=kind==='AB'?(age<=3?4:5+(i%2)):6+(i%2);const row=Array.from({length:len},(_,j)=>unit[j%unit.length]);const ans=unit[len%unit.length];
      const opts=[...new Set([ans,...unit,pool[3]])].slice(0,Math.min(nOpts()+(age>=5?1:0),4));if(!opts.includes(ans))opts[0]=ans;
      return {row,words:opts,ok:[ans],ask:'Mirá la fila. ¿Qué viene después? Tocalo.',okSay:w=>'¡Sí! Después va '+nameT(w)+'.',badSay:w=>'Mmm, '+nameT(w)+' no. Mirá cómo se repite la fila.'}}},onDone);
}

/* ---------- lupa / linterna: buscar cosas escondidas ---------- */
// cfg.items:[{k,x,y,s}], cfg.base(): dibuja el fondo; cfg.cover(): lo que tapa (pasto); cfg.inside(o,lens): dibuja lo escondido dentro de la lente
// COMPONENTE Lens: lupa o linterna que se mueve con el dedo y deja ver lo
// escondido. cfg: items [{k, x, y, s}], base() dibuja el fondo, cover() lo que
// tapa (pasto, oscuridad), inside(items, lente) dibuja lo que se ve dentro de
// la lente, shown(o) cómo se ve una cosa encontrada, r (radio), ring (color
// del aro), handle (false = sin mango), intro, ask(k) (si existe, hay que
// encontrarlas en orden: "busca el...") , foundSay(k), key.
// Una estrella por cosa encontrada.
function Lens(cfg,onDone){
  const items=cfg.items.map(o=>Object.assign({found:0},o)),order=shuffle(items),R=cfg.ask?items.length:items.length;
  // la lente: posición actual y radio
  const L={x:900,y:470,r:cfg.r||140};
  return {total:R,done:0,i:0,
    // Dice la explicación y, en modo pedido, lo primero que hay que buscar.
    enter(){later(300,()=>sayQ(V(cfg.intro),()=>this.ask()))},
    // Cosa que hay que buscar ahora (modo pedido) o null (modo libre).
    cur(){return cfg.ask?order[this.i]:null},
    // Pide la cosa actual.
    ask(){const o=this.cur();if(o)say(V(cfg.ask(o.k)))},
    // Repite lo que hay que buscar o la explicación.
    prompt(){const o=this.cur();say(o?V(cfg.ask(o.k)):V(cfg.intro))},
    // Ayuda: la cosa pedida o la primera sin encontrar.
    hint(){const o=this.cur()||items.find(o=>!o.found);return o?{x:o.x,y:o.y,r:o.s*.5+30}:null},
    // Con ratón, la lente sigue al puntero con suavidad.
    update(){if(mouseOn){L.x=lerp(L.x,MX,.5);L.y=lerp(L.y,MY,.5)}},
    // Dibuja el fondo, las cosas encontradas, lo que tapa y, recortado al círculo
    // de la lente (clip), lo que se ve dentro; luego el aro, el mango y estrellas.
    draw(){cfg.base();for(const o of items)if(o.found){const b=1+.1*Math.max(0,1-(T-o.found)*2);ctx.save();ctx.translate(o.x,o.y);ctx.scale(b,b);cfg.shown?cfg.shown(o):thing(o.k,0,0,o.s);ctx.restore()}
      cfg.cover&&cfg.cover();
      // lente
      ctx.save();ctx.beginPath();ctx.arc(L.x,L.y,L.r,0,PI*2);ctx.clip();cfg.inside(items,L);ctx.restore();
      circ(L.x,L.y,L.r,null,14,cfg.ring||'#5B5F6B');circ(L.x,L.y,L.r+7,null,4,K);
      if(cfg.handle!==false){ctx.save();ctx.translate(L.x,L.y);ctx.rotate(.7);card(L.r+4,-16,120,32,'#A86B43',5,14);ctx.restore()}
      for(const o of items)if(o.found){star(o.x+o.s*.4,o.y-o.s*.4,20,'#FFC93C',3)}},
    // Toque: mueve la lente ahí. Si toca una cosa escondida: si no es la pedida,
    // Tito dice qué es; si vale, estrella y siguiente (o onDone al acabar).
    down(x,y){L.x=x;L.y=y;this.on=1;if(this.busy)return;
      const o=items.filter(o=>!o.found&&dist(x,y,o.x,o.y)<o.s*.55+20).sort((a,b)=>dist(x,y,a.x,a.y)-dist(x,y,b.x,b.y))[0];if(!o){SFX.tap();return}
      const t=this.cur();
      if(t&&o!==t){SFX.boing();say(eseEs(o.k)+'. '+V(cfg.ask(t.k)));rec(cfg.key||'lupa',false);return}
      o.found=T;SFX.good();burst(o.x,o.y,24);rec(cfg.key||'lupa',true);onRight(true);this.done++;scene.starPop=T;this.busy=true;
      say((cfg.foundSay?V(cfg.foundSay(o.k)):'¡Encontraste '+nameT(o.k)+'!'),()=>later(250,()=>{this.busy=false;if(this.done>=R){if(!this.fin){this.fin=1;onDone()}}else if(cfg.ask){this.i++;this.ask()}}))},
    // Mueve la lente con el dedo apoyado (o con el ratón).
    move(x,y){if(this.on||!mouseOn){L.x=x;L.y=y}},/* soltar el dedo */ up(){this.on=0}
  };
}

/* ---------- tocar partes de un dibujo ---------- */
// cfg.parts:[{id,n,x,y,r}], cfg.draw(hl)
// COMPONENTE TocaPartes: "Toca la rueda": tocar partes de un dibujo grande.
// cfg.parts: [{id, n, x, y, r, say}] = círculos sensibles en pantalla (varios
// con el mismo id cuentan como la misma parte, p. ej. dos ruedas); n = nombre
// con artículo; say = frase extra al acertar. cfg.draw(hl) dibuja el dibujo
// resaltando la parte hl; intro, rounds, lx/ly (dónde escribir el nombre), key, bg.
function TocaPartes(cfg,onDone){
  const uniq=[...new Map(cfg.parts.map(p=>[p.id,p])).values()],R=cfg.rounds||Math.min(uniq.length,nRounds()+1);let order=shuffle(uniq);
  return {total:R,done:0,i:0,hl:null,hlT:0,
    // Dice la explicación y pide la primera parte.
    enter(){later(300,()=>sayQ(V(cfg.intro),()=>this.ask()))},
    // Elige la parte objetivo y la pide.
    ask(){this.t=order[this.i%order.length];this.errs=0;say('Tocá '+V(this.t.n)+'.')},
    // Repite la parte que hay que tocar.
    prompt(){this.t&&say('Tocá '+V(this.t.n)+'.')},
    // Ayuda: el círculo de la parte objetivo.
    hint(){return this.t?{x:this.t.x,y:this.t.y,r:this.t.r+10}:null},
    // Parte tocada en (x,y): de las que contienen el punto, la más cercana en
    // proporción a su radio.
    partAt(x,y){return cfg.parts.filter(p=>dist(x,y,p.x,p.y)<p.r).sort((a,b)=>dist(x,y,a.x,a.y)/a.r-dist(x,y,b.x,b.y)/b.r)[0]},
    // Dibuja el dibujo y, 1,4 s tras un toque, resalta la parte tocada y su nombre.
    draw(){cfg.bg();cfg.draw(T-this.hlT<1.4?this.hl:null);if(mouseOn&&!this.busy){const p=this.partAt(MX,MY);if(p)hv('p'+p.id,true)}
      if(this.hl&&T-this.hlT<1.4){const p=cfg.parts.find(q=>q.id===this.hl);ctx.globalAlpha=.5;for(const q of cfg.parts)if(q.id===p.id)circ(q.x,q.y,q.r,null,10,'#FFC93C');ctx.globalAlpha=1;text(Wn(V(p.n)).toUpperCase(),cfg.lx||420,cfg.ly||300,64,K,{f:LF})}},
    // Toque: acierto → estrella y siguiente parte (u onDone); fallo → Tito dice
    // qué parte es y repite; al 2º fallo baja la dificultad y fuerza la ayuda.
    down(x,y){if(this.busy||!this.t)return;const p=this.partAt(x,y);if(!p){SFX.tap();sparkles(x,y,3);return}this.hl=p.id;this.hlT=T;
      if(p.id===this.t.id){this.busy=true;SFX.good();burst(x,y,24);rec(cfg.key||'partes',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(praise()+' '+cap(V(p.n))+'.'+(p.say?' '+V(p.say):''),()=>later(350,()=>{this.busy=false;this.i++;if(this.i>=R)onDone();else this.ask()}))}
      else{SFX.bad();this.errs++;if(this.errs===1)rec(cfg.key||'partes',false);say(cap(V(p.n))+'. Buscá '+V(this.t.n)+'.');if(this.errs>=2){onWrongTwice();idle=12}}}
  };
}

/* ---------- apagar luces y canillas ---------- */
// COMPONENTE Apaga: tocar luces, grifos y teles encendidos para apagarlos.
// cfg.spots: [{t: 'luz'|'grifo'|'tele', x, y}]; cfg.say: frase por tipo
// {luz, grifo, tele}; intro, okAll, key, bg. Una estrella por cosa apagada.
function Apaga(cfg,onDone){
  const spots=cfg.spots.map(s=>Object.assign({on:1},s));
  return {total:spots.length,done:0,
    // Dice la explicación.
    enter(){later(300,()=>sayQ(V(cfg.intro)))},
    // Repite la explicación.
    prompt(){say(V(cfg.intro))},
    // Ayuda: la primera cosa encendida.
    hint(){const s=spots.find(s=>s.on);return s?{x:s.x,y:s.y,r:80}:null},
    // Dibuja cada cosa: bombilla con halo, grifo con gotas o tele con colores.
    draw(){cfg.bg();for(const s of spots){const hs=s.on?hv(s,hC(s.x,s.y,80)):1;ctx.save();ctx.translate(s.x,s.y);ctx.scale(hs,hs);
      if(s.t==='luz'){ctx.beginPath();ctx.moveTo(0,-140);ctx.lineTo(0,-50);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.stroke();if(s.on){ctx.globalAlpha=.35+.1*Math.sin(T*6);circ(0,0,95,'#FFE08A',0);ctx.globalAlpha=1}pic(s.on?'bombilla':'bombilla',0,0,120,s.on?1:.35)}
      if(s.t==='grifo'){pic('grifo',0,0,130);if(s.on){for(let i=0;i<3;i++){const k=(T*1.6+i/3)%1;circ(-30,30+k*90,7,'#5BB8E6',0)}}}
      if(s.t==='tele'){card(-70,-50,140,100,'#5B5F6B',6,12);ctx.fillStyle=s.on?['#7FD3F0','#FFD66B','#F58BB4'][Math.floor(T*2)%3]:'#2E2420';ctx.fillRect(-56,-38,112,76);card(-24,50,48,14,'#5B5F6B',4,4)}
      ctx.restore()}},
    // Toque: apaga la cosa encendida tocada (estrella y frase); con todas
    // apagadas, frase final y onDone.
    down(x,y){const s=spots.find(s=>s.on&&dist(x,y,s.x,s.y)<90);if(!s){SFX.tap();return}
      s.on=0;SFX.snap();sparkles(s.x,s.y,10);rec(cfg.key||'apaga',true);onRight(true);this.done++;scene.starPop=T;
      say(V(cfg.say[s.t]),()=>{if(this.done>=spots.length&&!this.fin){this.fin=1;SFX.good();burst(800,400,50);say(V(cfg.okAll),()=>later(400,onDone))}})}
  };
}

/* ---------- frotar para limpiar (manos, dientes) ---------- */
// COMPONENTE Frota: frotar con el dedo para limpiar (gérmenes de las manos,
// restos de los dientes...). cfg.spots: [[x, y, r]] manchas; cfg.spot(s)
// dibuja una mancha (p. ej. germ); base() dibuja lo que se limpia; tool()
// dibuja la herramienta junto al ratón; intro, okAll, key, bg.
// Cada mancha tiene "vida" h de 1 a 0; una estrella por mancha limpia.
function Frota(cfg,onDone){
  const spots=cfg.spots.map(([x,y,r])=>({x,y,r,h:1,ph:rnd(0,6)})),bub=[];
  return {total:spots.length,done:0,
    // Dice la explicación.
    enter(){later(300,()=>sayQ(V(cfg.intro)))},
    // Repite la explicación.
    prompt(){say(V(cfg.intro))},
    // Ayuda: la primera mancha que queda.
    hint(){const s=spots.find(s=>s.h>0);return s?{x:s.x,y:s.y,r:s.r+20,dx:40}:null},
    // Frota en (x,y): resta vida a las manchas cercanas (0,12 por llamada) y echa
    // burbujas (máx. 60). Al llegar a 0 la mancha desaparece y suma estrella; con
    // todas, frase final y onDone.
    rub(x,y){for(const s of spots){if(s.h<=0||dist(x,y,s.x,s.y)>s.r+40)continue;s.h-=.12;if(Math.random()<.5)SFX.dig();
        if(s.h<=0){s.h=0;SFX.pop();sparkles(s.x,s.y,10);this.done++;scene.starPop=T;rec(cfg.key||'frota',true);
          if(this.done>=spots.length&&!this.fin){this.fin=1;later(300,()=>{SFX.good();burst(800,420,50);say(V(cfg.okAll),()=>later(400,onDone))})}else if(Math.random()<.4)say(pick(['¡Chau!','¡Limpito!','¡Otro menos!']))}}
      if(bub.length<60)bub.push({x:x+rnd(-30,30),y:y+rnd(-30,30),r:rnd(8,20),t:T})},
    // Dibuja la base, las manchas (más pequeñas y transparentes según su vida),
    // las burbujas que suben (se borran a los 2 s) y la herramienta.
    draw(){cfg.bg();cfg.base();
      for(const s of spots)if(s.h>0){ctx.save();ctx.translate(s.x,s.y+Math.sin(T*3+s.ph)*3);ctx.globalAlpha=Math.max(.15,s.h);ctx.scale(.6+.4*s.h,.6+.4*s.h);cfg.spot(s);ctx.restore()}
      for(const b of bub){const k=(T-b.t)/2;if(k>1)continue;ctx.globalAlpha=(1-k)*.8;circ(b.x,b.y-k*30,b.r,'rgba(255,255,255,.7)',3,'#9ED9F5')}ctx.globalAlpha=1;
      while(bub.length&&T-bub[0].t>2)bub.shift();
      if(mouseOn&&cfg.tool){ctx.save();ctx.translate(MX,MY);ctx.rotate(-.5);cfg.tool();ctx.restore()}},
    // Tocar empieza a frotar; mover con el dedo apoyado sigue frotando.
    down(x,y){this.on=1;this.rub(x,y)},/* mover: sigue frotando */ move(x,y){if(this.on)this.rub(x,y)},/* soltar: deja de frotar */ up(){this.on=0}
  };
}
// germ(s): dibuja un germen (bichito ondulado con ojos) para la mancha s de
// Frota; el color sale de s.ph. Se pasa como cfg.spot.
const germ=s=>{const c=['#7CC86E','#9B8AD9','#5FA84E'][Math.floor(s.ph)%3];ctx.beginPath();for(let i=0;i<=16;i++){const a=i/16*PI*2,r=s.r*(1+.18*Math.sin(i*3+T*4))*.9;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();fillStroke(c,4);circ(-s.r*.3,-s.r*.1,s.r*.16,'#fff',0);circ(s.r*.3,-s.r*.1,s.r*.16,'#fff',0);circ(-s.r*.28,-s.r*.08,s.r*.08,K,0);circ(s.r*.32,-s.r*.08,s.r*.08,K,0)};

/* ---------- llenar contando ---------- */
// COMPONENTE Llena: meter exactamente N cosas en un recipiente (Tito cuenta en
// voz alta). cfg: pool (claves), zone {x, y, r} recipiente, drawZone(hl, c)
// lo dibuja (hl = algo encima, c = cuántas hay), ask(n) consigna, okSay(n),
// min (2) y max (3, 6 u 8 según la edad), rounds (3), showInside, bg.
// Una estrella por ronda.
function Llena(cfg,onDone){
  const R=cfg.rounds||3,mx=cfg.max||({3:3,4:6,5:8})[AGE()];let last=0;
  return {total:R,done:0,i:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: elige N (distinto del anterior, salvo que min = max) y pone al menos N+2 cosas a la derecha.
    load(){let n;do{n=ri(cfg.min||2,mx)}while(n===last&&mx>(cfg.min||2));/* si min = max solo hay un número posible: se repite en vez de buscar otro para siempre */last=n;this.n=n;this.c=0;this.busy=false;
      const P=Array.from({length:Math.max(n+2,7)},(_,j)=>j);this.its=P.map((j)=>({k:pick(cfg.pool),x:1080+(j%4)*120+(Math.floor(j/4)%2)*50,y:300+Math.floor(j/4)*170,s:130,in:T+j*.05}));this.its.forEach(o=>{o.hx=o.x;o.hy=o.y});
      later(300,()=>sayQ(V(cfg.ask(n))))},
    // Repite cuántas hay que meter.
    prompt(){say(V(cfg.ask(this.n)))},
    // Ayuda: una cosa que queda fuera y hacia el recipiente.
    hint(){const o=this.its.find(o=>!o.in2);return o&&!drag?{x:o.x,y:o.y,r:70,dx:cfg.zone.x-o.x,dy:cfg.zone.y-o.y}:null},
    // Acerca cada cosa no arrastrada a su sitio (hx,hy).
    update(dt){for(const o of this.its){if(drag&&drag.it===o)continue;o.x=lerp(o.x,o.hx,Math.min(1,dt*10));o.y=lerp(o.y,o.hy,Math.min(1,dt*10))}},
    // Dibuja el recipiente, la tarjeta con el número N, una fila de N círculos
    // (amarillos los ya metidos) y las cosas.
    draw(){cfg.bg();const z=cfg.zone;const hl=drag&&dist(drag.it.x,drag.it.y,z.x,z.y)<z.r;cfg.drawZone(hl,this.c);
      numCard(this.n,z.x+z.r*.85,z.y-z.r*.95,120);
      for(let j=0;j<this.n;j++)circ(z.x-(this.n-1)*22+j*44,z.y+z.r+34,15,j<this.c?'#FFC93C':'#fff',4);
      for(const o of this.its){if(o.in2&&!cfg.showInside)continue;const hs=o.in2?1:hv(o,hC(o.x,o.y,60));ctx.save();ctx.translate(o.x,o.y);ctx.scale(hs*(drag&&drag.it===o?1.12:1)*(o.in2?.7:1),hs*(drag&&drag.it===o?1.12:1)*(o.in2?.7:1));thing(o.k,0,0,o.s);ctx.restore()}},
    // Toque: coge una cosa que esté fuera.
    down(x,y){if(this.busy)return;const o=this.its.filter(o=>!o.in2&&dist(x,y,o.x,o.y)<75).pop();if(!o){SFX.tap();return}drag={it:o,dx:x-o.x,dy:y-o.y};setCursor('grab');SFX.pop()},
    // Mueve la cosa arrastrada.
    move(x,y){if(drag&&this.its.includes(drag.it)){drag.it.x=clamp(x-drag.dx,60,1540);drag.it.y=clamp(y-drag.dy,60,860)}},
    // Soltar: dentro del recipiente cuenta una más (Tito dice el número); al
    // llegar a N, estrella y siguiente ronda. Fuera, se queda donde se soltó.
    // Nota: no hay error posible (no se puede meter de más porque se bloquea).
    up(){if(!drag||!this.its.includes(drag.it))return;const o=drag.it;drag=null;setCursor('pt');const z=cfg.zone;
      if(dist(o.x,o.y,z.x,z.y)<z.r+30){this.c++;o.in2=T;o.hx=z.x+rnd(-z.r*.4,z.r*.4);o.hy=z.y+rnd(-z.r*.2,z.r*.3);SFX.count(this.c);say(cap(NUM[this.c]));
        if(this.c>=this.n){this.busy=true;rec('contar',true);onRight(true);this.done++;scene.starPop=T;later(700,()=>{SFX.good();burst(z.x,z.y,30);say(praise()+' '+V(cfg.okSay(this.n)),()=>later(400,()=>{this.i++;if(this.i>=R)onDone();else this.load()}))})}}
      else{o.hx=o.x;o.hy=o.y}}
  };
}

/* ---------- soplar velitas ---------- */
// COMPONENTE Velas: tarta con velas (edad + 1) que se soplan tocándolas
// mientras se cuenta. cfg: n, intro, okAll, bg. Al final suena el
// "cumpleaños feliz" (playTune) y se llama onDone. No usa rec ni onRight.
function Velas(cfg,onDone){
  const n=cfg.n||AGE()+1;const vs=Array.from({length:n},(_,j)=>({x:900-(n-1)*55+j*110,y:330,on:1}));let c=0;
  return {total:n,done:0,
    // Dice la explicación.
    enter(){later(300,()=>sayQ(V(cfg.intro||'¡Es la fiesta de cumpleaños! Soplá las velitas: tocá cada una y contamos.')))},
    // Repite la consigna.
    prompt(){say('Tocá las velitas para soplarlas.')},
    // Ayuda: la primera vela encendida.
    hint(){const v=vs.find(v=>v.on);return v?{x:v.x,y:v.y-30,r:60}:null},
    // Dibuja la tarta, las velas con llama que tiembla y humo en las apagadas.
    draw(){cfg.bg();card(560,420,680,260,'#F58BB4',8,40);card(600,360,600,90,'#FFF6E6',7,30);for(let i=0;i<8;i++)circ(620+i*80,450,22,'#FF5A5A',4);card(500,660,800,40,'#E4D3B8',6,20);
      for(const v of vs){card(v.x-14,v.y-10,28,80,DIAC[(v.x/110|0)%7],5,8);if(v.on){const f=1+Math.sin(T*14+v.x)*.12;ctx.save();ctx.translate(v.x,v.y-30);ctx.scale(f,1/f);ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(22,0,0,14);ctx.quadraticCurveTo(-22,0,0,-34);fillStroke('#FFC93C',4);ctx.restore()}
        else{ctx.globalAlpha=.4;circ(v.x+Math.sin(T*2)*6,v.y-50-((T*30)%40),8,'#B8B0A6',0);ctx.globalAlpha=1}}},
    // Toque: apaga la vela y cuenta (c); con todas, fiesta, canción y onDone.
    down(x,y){const v=vs.find(v=>v.on&&Math.abs(x-v.x)<55&&y<v.y+80&&y>v.y-110);if(!v){SFX.tap();return}v.on=0;c++;SFX.whoosh();SFX.count(c);this.done++;scene.starPop=T;say(cap(NUM[c]));
      if(c>=n&&!this.fin){this.fin=1;later(800,()=>{SFX.tada();burst(900,400,90);burst(500,300,40);burst(1300,300,40);playTune(TUNES.cumple);say(V(cfg.okAll||'¡Feliz cumpleaños! ¡Que los cumplas feliz!'),()=>later(1600,onDone))})}}
  };
}

/* ---------- girar la Tierra (día y noche) ---------- */
// COMPONENTE Gira: girar la Tierra con el dedo para que donde está Leo sea de
// día (mirando al sol, a la izquierda) o de noche. Las rondas alternan
// noche/día. cfg: rounds (4). Ignora cfg.bg: dibuja su propio cielo.
// a = ángulo (radianes) de la posición de Leo sobre la Tierra.
function Gira(cfg,onDone){
  const R=cfg.rounds||4,C={x:960,y:470,r:230};let a=-PI/2;
  return {total:R,done:0,i:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: decide si se pide noche (rondas pares) o día y lo dice.
    load(){this.want=this.i%2===0?'noche':'dia';this.ok=false;later(300,()=>sayQ(this.want==='noche'?'Girá la Tierra para que sea de noche donde está Leo. ¡Que no le dé el sol!':'Ahora girá la Tierra para que sea de día donde está Leo. ¡Que le dé el sol!'))},
    // 'dia' si Leo mira hacia el sol (cos(a) < -0,35, lado izquierdo), 'noche' si
    // está en el lado derecho (cos(a) > 0,35) y 'medio' entre los dos.
    state(){return Math.cos(a)<-.35?'dia':Math.cos(a)>.35?'noche':'medio'},
    // Repite la consigna.
    prompt(){say(this.want==='noche'?'Girá la Tierra hasta que Leo quede del lado oscuro.':'Girá la Tierra hasta que Leo quede del lado del sol.')},
    // Ayuda: un arco (path) desde Leo hasta el lado bueno, por el camino más
    // corto (d = diferencia de ángulo normalizada a -π..π con atan2).
    hint(){if(this.ok)return null;const tgt=this.want==='noche'?0:PI,cur=a;let d=Math.atan2(Math.sin(tgt-cur),Math.cos(tgt-cur));const p0=[C.x+Math.cos(cur)*C.r*.6,C.y+Math.sin(cur)*C.r*.6],p1=[C.x+Math.cos(cur+d)*C.r*.6,C.y+Math.sin(cur+d)*C.r*.6];return{x:p0[0],y:p0[1],r:70,path:Array.from({length:12},(_,i)=>[C.x+Math.cos(cur+d*i/11)*C.r*.6,C.y+Math.sin(cur+d*i/11)*C.r*.6])}},
    // Dibuja cielo con estrellas, el sol, sus rayos, la Tierra girada, a Leo de
    // pie sobre ella, la sombra de la noche en la mitad derecha y el cartel DÍA/NOCHE.
    draw(){sky('#1B2350','#2E3F7A');for(let i=0;i<40;i++){ctx.globalAlpha=.4+.4*Math.sin(T+i);star((i*197)%1600,(i*131)%900,3+i%3,'#FFE08A',0)}ctx.globalAlpha=1;
      // sol
      ctx.save();ctx.translate(220,470);ctx.rotate(T*.2);for(let i=0;i<12;i++){ctx.rotate(PI/6);ctx.fillStyle='#FFC93C';ctx.fillRect(150,-10,50,20)}ctx.restore();circ(220,470,150,'#FFD66B',8);
      for(let i=0;i<5;i++){ctx.globalAlpha=.08;ctx.fillStyle='#FFE08A';ctx.beginPath();ctx.moveTo(370,470-60-i*30);ctx.lineTo(C.x,C.y-C.r);ctx.lineTo(C.x,C.y+C.r);ctx.lineTo(370,470+60+i*30);ctx.fill()}ctx.globalAlpha=1;
      // tierra girando
      ctx.save();ctx.translate(C.x,C.y);ctx.rotate(a+PI/2);pic('tierra',0,0,C.r*2.25);ctx.restore();
      // nene parado sobre la tierra
      ctx.save();ctx.translate(C.x+Math.cos(a)*(C.r+50),C.y+Math.sin(a)*(C.r+50));ctx.rotate(a+PI/2);pic('nene',0,0,120);ctx.restore();
      // sombra de la noche (lado derecho)
      ctx.save();ctx.beginPath();ctx.arc(C.x,C.y,C.r+110,-PI/2,PI/2);ctx.closePath();ctx.fillStyle='rgba(10,14,40,.55)';ctx.fill();ctx.restore();
      // cartel del estado debajo de las estrellas de rondas y del cartel «Nivel» (scenes.js), que antes lo tapaban
      const st=this.state();card(1260,214,300,96,'#fff',6,48);if(st==='dia'){pic('sol',1320,262,80);text('DÍA',1440,278,46,K,{f:LF})}else if(st==='noche'){pic('luna',1320,262,80);text('NOCHE',1450,278,42,K,{f:LF})}else text('...',1410,278,46,K)},
    // Toque cerca de la Tierra: empieza a girar; this.on guarda el ángulo del dedo.
    down(x,y){if(this.ok)return;if(dist(x,y,C.x,C.y)<C.r+120){this.on=Math.atan2(y-C.y,x-C.x);SFX.whoosh();setCursor('grab');drag={it:this,gira:1}}},
    // Girar: suma a 'a' lo que ha girado el dedo alrededor del centro desde el
    // último movimiento (diferencia de ángulos normalizada con atan2).
    move(x,y){if(this.on==null)return;const b=Math.atan2(y-C.y,x-C.x);a+=Math.atan2(Math.sin(b-this.on),Math.cos(b-this.on));this.on=b},
    // Soltar: si el estado es el pedido, estrella y siguiente ronda; si es el
    // contrario, Tito avisa (en 'medio' no dice nada). No cuenta errores.
    up(){if(this.on==null)return;this.on=null;drag=null;setCursor('pt');const st=this.state();
      if(st===this.want){this.ok=true;SFX.good();burst(C.x+Math.cos(a)*(C.r+50),C.y+Math.sin(a)*(C.r+50),30);rec('dia-noche',true);onRight(true);this.done++;scene.starPop=T;
        say(this.want==='noche'?'¡Sí! Ahora Leo está del lado oscuro: es de noche y ve la luna.':'¡Sí! Ahora a Leo le da el sol: es de día.',()=>later(400,()=>{this.i++;if(this.i>=R)onDone();else this.load()}))}
      else if(st!=='medio'){say(this.want==='noche'?'Ahí le da el sol, es de día. Seguí girando.':'Ahí no le da el sol, es de noche. Seguí girando.')}}
  };
}

/* ---------- semáforo: ¿cruzamos o esperamos? ---------- */
// COMPONENTE Semaforo: mirar el semáforo de peatones y tocar CRUZAMOS (verde)
// o ESPERAMOS (rojo). cfg: rounds (5). seq = colores barajados (1 = verde).
// Ignora cfg.bg: dibuja su propia calle.
function Semaforo(cfg,onDone){
  const R=cfg.rounds||5;let seq=shuffle([1,0,1,0,1,0,1]).slice(0,R);
  return {total:R,done:0,i:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: color del semáforo (this.g) y pregunta.
    load(){this.g=seq[this.i];this.walk=0;this.errs=0;this.lock=false;later(300,()=>sayQ(this.g?'Mirá el semáforo de las personas. ¿Cruzamos o esperamos?':'Mirá el semáforo. ¿Cruzamos o esperamos?'))},
    // Repite la pregunta.
    prompt(){say('¿Cruzamos o esperamos? Mirá el color del semáforo.')},
    // Ayuda: el botón correcto.
    hint(){if(this.walk)return null;return this.g?{x:620,y:780,r:100}:{x:1180,y:780,r:100}},
    // Dibuja la calle, coches pasando si está en rojo, el semáforo, el niño (que
    // cruza si se acierta verde) y los dos botones.
    draw(){sky('#D5F0FA','#EAF6FB');for(let i=0;i<6;i++){const x=i*280,h=200+(i*67)%120;card(x+20,320-h,220,h+20,['#F7C7DA','#FFE08A','#BFE6B5','#CFE0FF'][i%4],6,10)}
      ctx.fillStyle='#C9CED6';ctx.fillRect(0,330,W,40);ctx.fillStyle='#6B7280';ctx.fillRect(0,370,W,260);ctx.fillStyle='#C9CED6';ctx.fillRect(0,630,W,50);
      ctx.fillStyle='#fff';for(let i=0;i<7;i++)ctx.fillRect(760,386+i*34,280,20);
      // autos pasando si está en rojo para las personas
      if(!this.g){const x=((T*500)%2200)-300;pic('auto',x,470,220);pic('autobus',((T*380+900)%2400)-400,560,260)}
      // semáforo de personas
      card(1120,120,120,230,'#5B5F6B',7,20);card(1170,350,20,300,'#5B5F6B',5,6);
      circ(1180,185,46,this.g?'#4A2A2A':'#FF5A5A',5);circ(1180,290,46,this.g?'#7CC86E':'#1F3A22',5);
      ctx.save();ctx.translate(1180,185);ctx.globalAlpha=this.g?.25:1;ctx.fillStyle='#fff';circ(0,-20,9,'#fff',0);ctx.fillRect(-10,-8,20,30);ctx.restore();ctx.globalAlpha=1;
      ctx.save();ctx.translate(1180,290);ctx.globalAlpha=this.g?1:.25;circ(0,-22,9,'#fff',0);ctx.lineCap='round';ctx.lineWidth=8;ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.moveTo(0,10);ctx.lineTo(-12,28);ctx.moveTo(0,10);ctx.lineTo(12,26);ctx.moveTo(0,-6);ctx.lineTo(-14,6);ctx.moveTo(0,-6);ctx.lineTo(14,4);ctx.stroke();ctx.restore();ctx.globalAlpha=1;
      // el nene
      const k=this.walk?clamp((T-this.walk)/2,0,1):0;pic('nene',900,lerp(650,300,k)+(this.walk&&k<1?Math.abs(Math.sin(T*10))*-8:0),160);
      // botones
      for(const [x,ok,lb,c] of[[620,1,'CRUZAMOS','#7CC86E'],[1180,0,'ESPERAMOS','#FF6B5E']]){const s=hv('b'+x,hR(x,790,320,120));ctx.save();ctx.translate(x,790);ctx.scale(s,s);card(-160,-60,320,120,c,7,60);text(lb,30,14,36,'#fff',{f:LF});
        if(ok){ctx.lineCap='round';ctx.lineWidth=8;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(-110,-26,9,0,PI*2);ctx.moveTo(-110,-14);ctx.lineTo(-110,10);ctx.lineTo(-124,32);ctx.moveTo(-110,10);ctx.lineTo(-96,30);ctx.stroke()}else{card(-132,-30,44,60,'#fff',0,14)}ctx.restore()}},
    // Toque en un botón: acierto → estrella y siguiente ronda; fallo → explica.
    down(x,y){if(this.lock)return;let c=null;if(inR(x,y,620,790,320,120))c=1;else if(inR(x,y,1180,790,320,120))c=0;if(c==null){SFX.tap();return}
      if(c===this.g){this.lock=true;SFX.good();rec('semaforo',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;if(c)this.walk=T;
        say(c?'¡Muy bien! Está verde: cruzamos por el paso de cebra, mirando a los dos lados.':'¡Muy bien! Está rojo: esperamos en la vereda.',()=>later(c?900:300,()=>{this.i++;if(this.i>=R)onDone();else this.load()}))}
      else{SFX.bad();this.errs++;if(this.errs===1)rec('semaforo',false);say(c?'¡Cuidado! Está rojo: los autos pasan. Esperamos.':'Está verde para las personas. ¡Podemos cruzar!')}}
  };
}

/* ---------- el cruce: derecha o izquierda ---------- */
// COMPONENTE Cruce: un coche llega a un cruce; hay que elegir derecha o
// izquierda para llegar al sitio pedido. cfg.places: claves de lugares (se
// usan 2 por ronda), rounds (4). Ignora cfg.bg.
function Cruce(cfg,onDone){
  const R=cfg.rounds||4,places=cfg.places;
  return {total:R,done:0,i:0,
    // Carga la primera ronda.
    enter(){this.load()},
    // Ronda: lugar de la izquierda (L), de la derecha (Rr) y adónde ir (go: -1/1).
    load(){const ps=shuffle(places);this.L=ps[0];this.Rr=ps[1];this.go=Math.random()<.5?-1:1;this.car={t:0,dir:0};this.errs=0;this.lock=false;
      later(300,()=>sayQ('Vamos '+V(ala(this.go<0?this.L:this.Rr))+'. ¿Doblamos a la derecha o a la izquierda?'))},
    // Repite adónde queremos ir.
    prompt(){say('Queremos ir '+V(ala(this.go<0?this.L:this.Rr))+'. ¿Derecha o izquierda?')},
    // Ayuda: la flecha correcta.
    hint(){return this.lock?null:{x:this.go<0?380:1420,y:760,r:100}},
    // Dibuja las carreteras, los dos lugares, el coche (sube 0,45 del tiempo y
    // luego gira hacia el lado elegido), las flechas y las manos guía.
    draw(){sky('#BFEAF7','#E9F7FC');ctx.fillStyle='#9FDC8F';ctx.fillRect(0,200,W,700);
      ctx.fillStyle='#8B93A3';ctx.fillRect(820,330,160,600);ctx.fillRect(250,330,1300,140);
      ctx.fillStyle='#fff';for(let y=500;y<900;y+=70)ctx.fillRect(895,y,10,36);for(let x=280;x<1520;x+=90)if(x<800||x>1000)ctx.fillRect(x,396,44,8);
      card(160,170,240,240,'#fff',6,30);pic(this.L,280,290,200);card(1400,170,240,240,'#fff',6,30);pic(this.Rr,1520,290,200);
      // auto
      const c=this.car;let x=900,y=760,rot=0;if(c.dir){const k=clamp((T-c.t)/1.6,0,1);if(k<.45){y=lerp(760,400,k/.45)}else{const q=(k-.45)/.55;y=400;x=900+c.dir*q*560;rot=c.dir*Math.min(1,q*3)*PI/2}}
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);card(-50,-80,100,160,'#FF6B5E',6,26);card(-38,-56,76,40,'#BFEAF7',4,10);circ(-50,-44,13,K,0);circ(50,-44,13,K,0);circ(-50,46,13,K,0);circ(50,46,13,K,0);ctx.restore();
      // botones con flechas
      const sl=hv('bl',hC(380,760,95)),sr=hv('br',hC(1420,760,95));arrowBtn(380,760,-1,'#5B8DEF',sl);arrowBtn(1420,760,1,'#FFA94D',sr);
      text(tx('IZQUIERDA'),380,890,34,K,{f:LF});text('DERECHA',1420,890,34,K,{f:LF});
      // manos guía
      ctx.save();ctx.translate(530,780);ctx.scale(-1,1);hand(0,-30,70,0);ctx.restore();hand(1270,750,70,0)},
    // Toque en una flecha: acierto → el coche gira, estrella y siguiente ronda;
    // fallo → Tito dice adónde lleva ese lado.
    down(x,y){if(this.lock)return;let d=0;if(dist(x,y,380,760)<110)d=-1;else if(dist(x,y,1420,760)<110)d=1;if(!d){SFX.tap();return}
      if(d===this.go){this.lock=true;this.car={t:T,dir:d};SFX.good();rec('derecha-izquierda',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(praise()+' '+(d<0?'Doblamos a la izquierda':'Doblamos a la derecha')+' y llegamos '+V(ala(d<0?this.L:this.Rr))+'.',()=>later(700,()=>{this.i++;if(this.i>=R)onDone();else this.load()}))}
      else{SFX.bad();this.errs++;if(this.errs===1)rec('derecha-izquierda',false);say('Por ahí vamos '+V(ala(d<0?this.L:this.Rr))+'. Queremos ir '+V(ala(this.go<0?this.L:this.Rr))+'.')}}
  };
}

/* ---------- trazos ---------- */
// un trazo es una lista de puntos; el nene lo recorre desde el comienzo
// Convierte una función f(t) → [x,y] (t de 0 a 1) en una lista de n+1 puntos.
// Sirve para definir los trazos de Tracer.
function pathPts(f,n=80){return Array.from({length:n+1},(_,i)=>f(i/n))}
// COMPONENTE Tracer: seguir con el dedo un camino punteado desde el punto
// verde hasta el final. cfg.paths: [{pts: [[x,y],...], say, ok, c (color de la
// tinta), who/ws (dibujo que avanza y su tamaño), end/es/ex/ey (dibujo de la
// meta, tamaño y desplazamiento)}]; ask, bg. tol = tolerancia en px (más
// grande a los 3 años). Una estrella por trazo.
function Tracer(cfg,onDone){
  const R=cfg.paths.length,tol=AGE()<=3?75:60;
  return {total:R,done:0,i:0,
    // Carga el primer trazo.
    enter(){this.load(true)},
    // Carga el trazo this.i; prog = índice del último punto alcanzado; len =
    // distancias acumuladas (se calculan pero no se usan después).
    load(first){const P=cfg.paths[this.i];this.P=P;this.pts=P.pts;this.prog=0;this.on=false;this.ink=[];this.fin=0;
      const L=[0];for(let j=1;j<this.pts.length;j++)L.push(L[j-1]+dist(...this.pts[j-1],...this.pts[j]));this.len=L;
      later(first?300:100,()=>sayQ(V(P.say||cfg.ask)))},
    // Repite la consigna del trazo.
    prompt(){say(V(this.P.say||cfg.ask))},
    // Ayuda: la manita recorre el resto del camino desde donde se quedó (path).
    hint(){if(this.fin)return null;const j=Math.min(this.pts.length-1,this.prog);const p=this.pts[j];return{x:p[0],y:p[1],r:50,path:this.pts.slice(j)}},
    // Dibuja el camino ancho y punteado, la tinta hasta prog, la meta, el punto
    // verde de inicio y el dibujo que avanza (mirando hacia donde va).
    draw(){cfg.bg();const P=this.P,pts=this.pts;
      // camino punteado
      ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.lineWidth=70;ctx.strokeStyle='rgba(255,255,255,.75)';ctx.stroke();
      ctx.setLineDash([2,26]);ctx.lineWidth=14;ctx.strokeStyle='#B8A890';ctx.stroke();ctx.setLineDash([]);
      // tinta
      if(this.prog>0){ctx.beginPath();for(let j=0;j<=this.prog;j++){const p=pts[j];j?ctx.lineTo(...p):ctx.moveTo(...p)}ctx.lineWidth=22;ctx.strokeStyle=P.c||'#5B8DEF';ctx.stroke()}
      // fin y comienzo
      const e=pts[pts.length-1],s=pts[0];if(P.end)pic(P.end,e[0]+(P.ex||0),e[1]+(P.ey||0),P.es||150);
      circ(s[0],s[1],22,'#7CC86E',5);
      const cur=pts[Math.min(this.prog,pts.length-1)];const nxt=pts[Math.min(this.prog+3,pts.length-1)];const ang=Math.atan2(nxt[1]-cur[1],nxt[0]-cur[0]);
      if(P.who){ctx.save();ctx.translate(cur[0],cur[1]);if(Math.cos(ang)<0)ctx.scale(-1,1);const b=this.on?Math.sin(T*16)*.06:0;ctx.rotate(b);pic(P.who,0,0,P.ws||130);ctx.restore()}
      else{circ(cur[0],cur[1],26,'#FFC93C',6)}
      if(this.fin){const k=clamp((T-this.fin)*2,0,1);ctx.globalAlpha=k;text('¡Muy bien!',900,140,72,'#7CC86E',{f:LF,st:8,sc:'#fff'});ctx.globalAlpha=1}},
    // Busca entre los 12 puntos siguientes a prog el más avanzado que esté a menos
    // de tol del dedo. Devuelve su índice o -1. Así no se puede saltar el camino.
    near(x,y){// avanza si el puntero está cerca de los próximos puntos
      let best=-1;for(let j=this.prog;j<Math.min(this.pts.length,this.prog+12);j++)if(dist(x,y,...this.pts[j])<tol)best=j;return best},
    // Toque: si es cerca del punto donde se quedó, empieza a trazar.
    down(x,y){if(this.fin)return;const cur=this.pts[this.prog];if(dist(x,y,...cur)<tol+30){this.on=true;SFX.pop()}else{SFX.tap();if(this.prog===0)say('Empezá en el punto verde.')}},
    // Al mover: avanza prog si el dedo sigue el camino (con un tono cada 10
    // puntos); si el dedo se aleja mucho, se suelta (boing). Al final, complete().
    move(x,y){if(!this.on||this.fin)return;const j=this.near(x,y);if(j>this.prog){if(Math.floor(j/10)>Math.floor(this.prog/10))tone(500+j*6,.06,'sine',.12);this.prog=j}
      else if(j<0&&dist(x,y,...this.pts[this.prog])>tol*2.2){this.on=false;SFX.boing()}
      if(this.prog>=this.pts.length-1)this.complete()},
    // Soltar: deja de trazar (se puede seguir luego desde el mismo punto).
    up(){this.on=false},
    // Trazo terminado: estrella, frase y siguiente trazo u onDone.
    complete(){if(this.fin)return;this.fin=T;this.on=false;SFX.good();const e=this.pts[this.pts.length-1];burst(e[0],e[1],36);rec('trazos',true);onRight(true);this.done++;scene.starPop=T;
      say(V(this.P.ok||praise()),()=>later(500,()=>{this.i++;if(this.i>=R)onDone();else this.load()}))}
  };
}

/* ---------- melodías ---------- */
// Frecuencia en Hz de la nota MIDI n (69 = La 440 Hz).
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// Melodías: nombre → lista de [nota MIDI, duración en tiempos].
const TUNES={
  cumple:[[60,.75],[60,.25],[62,1],[60,1],[65,1],[64,2],[60,.75],[60,.25],[62,1],[60,1],[67,1],[65,2]],
  dias:[[60,.5],[64,.5],[67,.5],[64,.5],[65,.5],[69,.5],[67,1]],
  estaciones:[[67,.5],[64,.5],[65,.5],[62,.5],[64,.5],[60,.5],[62,1]],
  colores:[[64,.5],[64,.5],[67,.5],[67,.5],[69,.5],[69,.5],[67,1]],
  meses:[[60,.5],[62,.5],[64,.5],[65,.5],[67,.5],[69,.5],[71,.5],[72,.5]],
  fin:[[60,.25],[64,.25],[67,.25],[72,.75]]
};
// Toca la melodía t (de TUNES) a bpm tiempos por minuto y volumen v, con
// la nota y su octava baja (tone de core.js). Devuelve la duración en segundos.
function playTune(t,bpm=150,v=.28){if(!AC)return;let d=0;const b=60/bpm;for(const [n,l] of t){tone(NOTE(n),l*b*.95,'triangle',v,0,d);tone(NOTE(n-12),l*b*.9,'sine',v*.4,0,d);d+=l*b}return d}

/* ---------- canción ---------- */
// cfg.lines:[{say, k|draw, n}], cfg.mode:'orden'|'pedido' (segunda parte: el nene toca)
// COMPONENTE Song (canción). Fase 'sing': Tito canta cada línea y su tarjeta
// salta. Fase 'play' (si part2 no es false): hay que tocar las tarjetas en el
// orden de la canción (mode 'orden') o la que pide Tito (mode 'pedido').
// cfg.lines: [{say: verso, k o draw: dibujo, n: nombre que pide, n2: lo que se
// dice al acertar}]; tune (nombre en TUNES), intro, ask2, okAll, cols, s, key, bg.
// Lo crea extras.js para {t:'cancion'} con los datos de SONGS.
function Song(cfg,onDone){
  const L=cfg.lines,n=L.length,cols=cfg.cols||Math.min(n,7),rows=Math.ceil(n/cols),s=Math.min(cfg.s||190,1200/cols-24,560/rows-30);
  L.forEach((l,i)=>{const r=Math.floor(i/cols),c=i%cols,inRow=Math.min(cols,n-r*cols);l.x=900-(inRow-1)*(s+24)/2+c*(s+24);l.y=470-(rows-1)*(s+40)/2+r*(s+40);l.s=s;l.jump=-9});
  const part2=cfg.part2!==false;
  return {total:part2?n:1,done:0,ph:'sing',li:-1,
    // Dice la introducción, toca la melodía y empieza a cantar.
    enter(){later(300,()=>sayQ(V(cfg.intro||'¡Vamos a cantar! Escuchá la canción.'),()=>{playTune(TUNES[cfg.tune]||TUNES.dias);later(1400,()=>this.next())}))},
    // Canta la línea siguiente (nota + verso). Al acabar las líneas: melodía
    // final y, si hay segunda parte, pasa a 'play'; si no, onDone.
    next(){this.li++;if(this.li>=n){this.ph='fin1';playTune(TUNES.fin);later(700,()=>{if(!part2){this.done=1;scene.starPop=T;onDone();return}this.ph='play';this.order=cfg.mode==='pedido'?shuffle(L):L.slice();this.k=0;say(V(cfg.ask2||'¡Ahora te toca a vos! Tocá cada uno en orden, como en la canción.'),()=>this.askNext())});return}
      const l=L[this.li];l.jump=T;const tune=TUNES[cfg.tune]||TUNES.dias;tone(NOTE(tune[this.li%tune.length][0]+12),.3,'triangle',.18);say(V(l.say),()=>later(120,()=>this.next()),{rate:1})},
    // Pide la siguiente tarjeta (en 'pedido') o pregunta cuál va primero.
    askNext(){const l=this.order[this.k];if(cfg.mode==='pedido')say('Tocá '+V(l.n)+'.');else if(this.k===0)say('¿Cuál va primero?')},
    // Repite qué tarjeta tocar (solo en la fase de jugar).
    prompt(){if(this.ph==='play'){const l=this.order[this.k];say(cfg.mode==='pedido'?'Tocá '+V(l.n)+'.':'¿Cuál sigue? Tocá '+V(l.n)+'.')}},
    // Ayuda: la tarjeta que toca ahora.
    hint(){if(this.ph!=='play')return null;const l=this.order[this.k];return l?{x:l.x,y:l.y,r:l.s*.6}:null},
    // Dibuja las tarjetas (saltan, bailan mientras se canta, estrella en las
    // acertadas) y notas musicales que suben durante el canto.
    draw(){cfg.bg();for(const l of L){const j=l.jump>0?Math.max(0,1-(T-l.jump)*1.4):0,b=Math.abs(Math.sin((T-l.jump)*8))*j*60+Math.sin(T*3+l.x)*4,
        hs=this.ph==='play'&&!l.okT?hv(l,hR(l.x,l.y,l.s,l.s)):1,dance=Math.sin(T*6+l.x)*.05*(this.ph==='sing'?1:0);
        ctx.save();ctx.translate(l.x,l.y-b);ctx.rotate(dance+(j?Math.sin((T-l.jump)*12)*.08*j:0));ctx.scale(hs*(1+j*.18),hs*(1+j*.18));card(-l.s/2,-l.s/2,l.s,l.s,l.okT?'#F1FAEE':'#fff',l===L[this.li]&&this.ph==='sing'?10:6,30,l===L[this.li]&&this.ph==='sing'?'#FFC93C':K);
        if(l.draw)l.draw(0,0,l.s*.84);else thing(l.k,0,0,l.s*.8);if(l.okT)star(l.s/2-14,-l.s/2+14,20,'#FFC93C',3);ctx.restore()}
      // notas musicales
      if(this.ph==='sing'){for(let i=0;i<5;i++){const k=(T*.4+i/5)%1;ctx.globalAlpha=1-k;text('♪',300+i*260+Math.sin(T*2+i)*30,860-k*200,54,DIAC[i],{st:4});ctx.globalAlpha=1}}},
    // Toque: mientras se canta solo hace saltar la tarjeta. Jugando: acierto →
    // estrella y siguiente; al acabar, frase final y onDone. Fallo → explica.
    down(x,y){const l=L.find(l=>inR(x,y,l.x,l.y,l.s+10,l.s+10));if(!l){SFX.tap();return}
      if(this.ph!=='play'){l.jump=T;SFX.pop();return}
      if(this.busy||l.okT)return;const want=this.order[this.k];
      if(l===want){l.okT=T;l.jump=T;SFX.count(this.k+1);rec(cfg.key||'cancion',true);onRight(true);this.done++;scene.starPop=T;this.k++;this.busy=true;
        say(V(l.n2||l.n),()=>{this.busy=false;if(this.k>=n){SFX.tada();burst(900,450,70);say(V(cfg.okAll||'¡Qué bien cantamos!'),()=>later(400,onDone))}else if(cfg.mode==='pedido')this.askNext()})}
      else{SFX.bad();l.jump=T;rec(cfg.key||'cancion',false);say(cap(V(l.n))+'. '+(cfg.mode==='pedido'?'Buscá '+V(want.n)+'.':'Ese va después. ¿Cuál sigue?'))}}
  };
}

/* ---------- cuento ilustrado con preguntas ---------- */
// COMPONENTE Story (cuento ilustrado con preguntas). Fase 'read': pasa las
// páginas leyéndolas (solas o con la flecha). Fase 'quiz': preguntas con
// tarjetas como ChoiceGame. Una estrella por pregunta acertada.
// data (de CUENTOS en cuentos.js): {title, pages: [{bg: nombre de BG, say:
// texto, items: [[clave, x, y, tamaño, reflejar]]}], qs: [{q: pregunta,
// opts: claves, ok: la correcta, okSay}]}. cfg no se usa.
function Story(data,cfg,onDone){
  const P=data.pages,Q=data.qs||[];
  return {total:Q.length,done:0,ph:'read',pi:0,
    // Empieza por la primera página.
    enter(){this.page(0)},
    // Muestra la página i y la lee (la primera con el título); 0,9 s después de
    // terminar pasa sola a la siguiente si sigue en esa página.
    page(i){this.pi=i;this.pT=T;this.said=false;const p=P[i];
      later(i?250:400,()=>sayQ((i===0?V(['Escuchá el cuento: ','Escucha el cuento: '])+V(data.title)+'. ':'')+V(p.say),()=>{this.said=T;later(900,()=>{if(this.ph==='read'&&this.pi===i)this.turn()})}))},
    // Pasa a la página siguiente o, tras la última, a las preguntas.
    turn(){if(this.pi<P.length-1){SFX.whoosh();this.page(this.pi+1)}else this.quiz(0)},
    // Pregunta i: coloca las opciones y la lee. Sin más preguntas → onDone.
    quiz(i){this.ph='quiz';this.qi=i;const q=Q[i];if(!q){this.ph='end';onDone();return}this.errs=0;this.busy=false;
      this.items=layoutChoice(shuffle(q.opts),[q.ok],660,false);later(300,()=>sayQ((i===0?'Ahora te pregunto. ':'')+V(q.q)))},
    // Repite la pregunta o la página actual.
    prompt(){if(this.ph==='quiz')say(V(Q[this.qi].q));else say(V(P[this.pi].say))},
    // Ayuda: la opción correcta o, tras leer la página, la flecha.
    hint(){if(this.ph==='quiz'){const it=this.items.find(i=>i.ok&&!i.win);return it?{x:it.x,y:it.y,r:it.s*.6}:null}return this.said?{x:1470,y:470,r:70}:null},
    // Dibuja el fondo de la página p y sus dibujos balanceándose; yo y sc
    // desplazan y escalan en vertical respecto al centro.
    drawPage(p,yo=0,sc=1){(BG[p.bg]||BG.conceptos)();for(const it of p.items||[]){const [k,x,y,s,f]=it;const b=Math.sin(T*2+x*.01)*5;picF(k,x,(y-470)*sc+470+yo+b,s*sc,f)}},
    // Lectura: página (con fundido al entrar), puntitos de página, flecha y
    // título. Preguntas: fondo tenue, cartel con libro y '?', y las opciones.
    draw(){if(this.ph==='read'){const p=P[this.pi],k=clamp((T-this.pT)*3,0,1);ctx.globalAlpha=1;this.drawPage(p);if(k<1){ctx.fillStyle=`rgba(255,246,230,${1-k})`;ctx.fillRect(0,0,W,H)}
        // puntitos de página y flecha
        P.forEach((q,j)=>circ(800-(P.length-1)*20+j*40,860,10,j<this.pi?'#7CC86E':j===this.pi?'#FFC93C':'#EADFCF',3));
        const s=hv('next',hC(1470,470,70))*(this.said?1+Math.sin(T*5)*.06:1);ctx.save();ctx.translate(1470,470);ctx.scale(s,s);ctx.globalAlpha=this.said?1:.45;circ(0,0,62,'#fff',6);ctx.beginPath();ctx.moveTo(-14,-26);ctx.lineTo(20,0);ctx.lineTo(-14,26);ctx.lineWidth=12;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();ctx.restore();ctx.globalAlpha=1;
        card(560,22,480,80,'#FFFBF2',5,40);pic('libro',620,62,64);text(V(data.title),830,76,V(data.title).length>24?28:34,K,{w:600})}
      else{const p=P[Math.min(P.length-1,this.qi)];ctx.save();(BG[P[0].bg]||BG.conceptos)();ctx.restore();ctx.fillStyle='rgba(255,246,230,.6)';ctx.fillRect(0,0,W,H);
        card(330,110,940,280,'#fff',6,36);pic('libro',440,250,140);text('?',1170,310,160,'#FFA94D',{f:LF,st:8,sc:'#fff'});
        text(V(data.title),800,250,V(data.title).length>24?44:54,K,{w:600});
        if(this.items)drawChoice(this.items)}},
    // Lectura: la flecha pasa de página (corta la voz y anula su callback con
    // sceneTokBump). Preguntas: acierto → estrella y siguiente; fallo → repite y,
    // al 2º fallo, quita una opción incorrecta.
    down(x,y){if(this.ph==='read'){if(dist(x,y,1470,470)<80){if(this.said||T-this.pT>1.5){SFX.tap();try{speechSynthesis.cancel()}catch(e){}sceneTokBump();this.turn()}}return}
      if(this.ph!=='quiz')return;const it=hitItem(this.items,x,y);if(!it){SFX.tap();return}if(it.win||this.busy)return;const q=Q[this.qi];
      if(it.ok){this.busy=true;it.win=T;SFX.good();burst(it.x,it.y,30);rec('cuentos',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        say(praise()+' '+V(q.okSay||''),()=>later(400,()=>this.quiz(this.qi+1)))}
      else{SFX.bad();it.shake=T;if(this.errs===0)rec('cuentos',false);this.errs++;say(V(['Mmm, no. Pensá en el cuento. ','Mmm, no. Piensa en el cuento. '])+V(q.q));
        if(this.errs===2){const w=this.items.find(i=>!i.ok&&!i.gone&&i!==it);if(w&&this.items.filter(i=>!i.gone&&!i.ok).length>1)w.gone=T}}}
  };
}
// para saltar de página sin que el callback viejo dispare
// Invalida la frase en curso: al subir sayTok, el callback de say() de la
// página anterior ya no se ejecuta (así no pasa dos páginas de golpe).
function sceneTokBump(){sayTok++;talking=false}
