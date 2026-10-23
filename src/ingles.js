// ARCHIVO: ingles.js — el Rincón del inglés (zona 'ingles' del mapa).
// Para qué sirve: define las palabras en inglés (EN), los 4 tipos de juego en inglés (EnConocer, EnEscucha,
//   EnGlobos, EnCuenta) y los 4 temas del rincón (ING), y engancha esos juegos en makeGame.
// Define (globales): sayMix, ENC, enBlob, enNum, enFace, EN, enItems, enEs, enDraw, enCard, enGrid, EnConocer,
//   EnEscucha, EnGlobos, EnCuenta, ENG, ING. ING se añade a TEMAS en scenes.js y a la zona 'ingles' en zonas.js.
// Envuelve: makeGame (temas.js / extras.js).
// Depende de: core.js (say con la opción {en:1}, ctx y funciones de dibujo, AGE, rec, onRight, onWrongTwice, praise,
//   SFX, later, shuffle, pick), temas.js (NUM, DIAC, BG, nRounds, nOpts, drawFace), lex.js (V, cap).
// Voz: say(texto, cb, {en:1, rate:.8}) dice el texto con voz inglesa y SIN pasar por tx() (no se adapta a España/Argentina).
/* ================= EL RINCÓN DEL INGLÉS ================= */
// Las palabras en inglés las dice una voz en inglés (say con {en:1}); las explicaciones, Tito en castellano.
// sayMix(['Tocá','@red'],cb): las partes con @ van en inglés.
// Dice una frase mezclando castellano e inglés, trozo a trozo y en orden. parts: lista de textos; los que
// empiezan por '@' se dicen en inglés (más despacio). Los vacíos se saltan. cb: se llama al terminar el último trozo.
function sayMix(parts,cb){const P=parts.filter(Boolean);const step=i=>{if(i>=P.length){cb&&cb();return}const p=P[i],en=p[0]==='@';say(en?p.slice(1):p,()=>step(i+1),en?{en:1,rate:.8}:{})};step(0)}
// Colores de la lista de colores en inglés: nombre inglés en minúsculas → color.
const ENC={red:'#FF5A5A',blue:'#5B8DEF',yellow:'#FFD66B',green:'#7CC86E',orange:'#FFA94D',pink:'#F58BB4',purple:'#9B8AD9',brown:'#A86B43',black:'#3B3330',white:'#FFFFFF'};
// Devuelve una función de dibujo (x,y,s) de una mancha de pintura del color c (para las tarjetas de colores).
function enBlob(c){return (x,y,s)=>{ctx.save();ctx.translate(x,y);const r=s*.34;ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*PI*2,q=r*(1+.12*Math.sin(a*5));ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();fillStroke(c,Math.max(4,s*.03));
  for(const [a,b,q] of[[.95,-.6,.12],[-.9,.7,.09],[.7,.85,.07]])circ(a*r,b*r,q*s,c,Math.max(3,s*.02));ctx.restore()}}
// Devuelve una función de dibujo (x,y,s) del número n en un círculo con n puntitos debajo (filas de 5).
function enNum(n){return (x,y,s)=>{ctx.save();ctx.translate(x,y);circ(0,-s*.06,s*.3,DIAC[(n-1)%7],Math.max(4,s*.03));text(String(n),0,s*.06,s*.34,'#fff',{f:LF,st:Math.max(4,s*.03),sc:K});
  const per=5,rows=Math.ceil(n/per);for(let i=0;i<n;i++){const r=Math.floor(i/per),c=i%per,inRow=Math.min(per,n-r*per);circ((c-(inRow-1)/2)*s*.12,s*.33+r*s*.1,s*.04,'#FFC93C',Math.max(2,s*.012))}ctx.restore()}}
// Devuelve una función de dibujo (x,y,s) de una carita con la emoción m (drawFace de temas.js).
const enFace=m=>(x,y,s)=>drawFace(x,y,s*.36,m);
// a: edad desde la que aparece la palabra
// Palabras de cada tema de inglés: EN[conjunto] = lista de {en (palabra en inglés), es (traducción; puede ser
// [rioplatense, España]), a (edad mínima: 3, 4 o 5), y para dibujarla k (id de dibujo de PICS) o draw(x,y,s)}.
// Los colores llevan además col (su color) y los números n (su valor). Conjuntos: hello, colors, numbers, animals.
const EN={
  hello:[{en:'Hello',es:'Hola',k:'mano',a:3},{en:'Happy',es:'Contento',draw:enFace('alegria'),a:3},{en:'Sad',es:'Triste',draw:enFace('tristeza'),a:3},{en:'Good night',es:'Buenas noches',k:'luna',a:3},
    {en:'Good morning',es:'Buenos días',k:'sol',a:4},{en:'Thank you',es:'Gracias',k:'regalo',a:4},{en:'I love you',es:'Te quiero',k:'corazon',a:5},{en:'Angry',es:['Enojado','Enfadado'],draw:enFace('enojo'),a:5}],
  colors:[['red','Rojo',3],['blue','Azul',3],['yellow','Amarillo',3],['green','Verde',3],['orange','Naranja',4],['pink','Rosa',4],['purple',['Violeta','Morado'],4],['brown','Marrón',5],['black','Negro',5],['white','Blanco',5]].map(([en,es,a])=>({en:en[0].toUpperCase()+en.slice(1),es,a,col:ENC[en],draw:enBlob(ENC[en])})),
  numbers:['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'].map((en,i)=>({en,es:cap(NUM[i+1]),n:i+1,a:i<5?3:i<8?4:5,draw:enNum(i+1)})),
  animals:[['Dog','Perro','perro',3],['Cat','Gato','gato',3],['Cow','Vaca','vaca',3],['Duck','Pato','pato',3],['Fish','Pez','pez',4],['Horse','Caballo','caballo',4],['Pig',['Chancho','Cerdo'],'cerdo',4],['Sheep','Oveja','oveja',4],
    ['Lion','León','leon',5],['Elephant','Elefante','elefante',5],['Monkey','Mono','mono',5],['Frog','Rana','rana',5]].map(([en,es,k,a])=>({en,es,k,a}))
};
// Palabras del conjunto set que tocan a la edad del niño (AGE()).
const enItems=set=>EN[set].filter(i=>i.a<=Math.max(3,AGE()));
// Traducción al castellano de la palabra (elige la variante de España o Argentina con V).
const enEs=it=>V(it.es);
// Dibuja la palabra it centrada en (x,y) con tamaño s (su draw propio o su dibujo pic).
function enDraw(it,x,y,s){if(it.draw)it.draw(x,y,s);else pic(it.k,x,y,s)}
// Dibuja una tarjeta cuadrada de lado s con la palabra it. Opciones o: s (escala), shake (instante en que empezó
// a temblar), glow (brillo amarillo), bg (color de fondo), label (escribe la palabra en inglés debajo), star (estrella de ya vista).
function enCard(it,x,y,s,o={}){const hs=o.s||1,sh=o.shake?Math.sin((T-o.shake)*40)*10*Math.max(0,1-(T-o.shake)*2.5):0;ctx.save();ctx.translate(x+sh,y);ctx.scale(hs,hs);
  if(o.glow){ctx.globalAlpha=.5;circ(0,0,s*.62,'#FFE08A',0);ctx.globalAlpha=1}card(-s/2,-s/2,s,s,o.bg||'#fff',7,36);enDraw(it,0,o.label?-s*.07:0,s*(o.label?.66:.8));
  if(o.label){ctx.font=`600 ${Math.round(s*.13)}px ${DF}`;text(it.en,0,s*.42,Math.min(s*.13,s*.85/Math.max(1,ctx.measureText(it.en).width/(s*.13))),K,{w:600})}
  if(o.star)star(s/2-18,-s/2+18,22,'#FFC93C',3.5);ctx.restore()}
// Reparte las tarjetas en una cuadrícula centrada en la zona (cx, top, w, h): elige columnas según cuántas hay
// y pone a cada elemento x, y, s (tamaño) e in (cuándo aparece, escalonado).
function enGrid(items,top=180,h=660,w=1220,cx=900){const n=items.length,cols=n<=3?n:n===4?4:n<=6?3:n<=8?4:5,rows=Math.ceil(n/cols),s=Math.min(w/cols-34,h/rows-34,290);
  items.forEach((it,i)=>{const r=Math.floor(i/cols),c=i%cols,inRow=Math.min(cols,n-r*cols);it.x=cx-(inRow-1)*(s+34)/2+c*(s+34);it.y=top+((h-rows*(s+34))/2)+(s+34)/2+r*(s+34);it.s=s;it.in=T+i*.08})}

// 1) Escuchá y repetí: tocar cada dibujo para oír la palabra en inglés
// Juego "Escuchá y repetí" (tipo enConocer). cfg: {items (palabras), bg (fondo), intro (frase opcional)}.
// Al tocar una tarjeta se abre en grande y suena inglés-castellano-inglés; se cierra sola o tocando.
// Termina (onDone) cuando se han visto todas. No cuenta aciertos ni fallos.
function EnConocer(cfg,onDone){const items=cfg.items.map(o=>Object.assign({},o));enGrid(items);const n=items.length;
  return {total:n,done:0,open:null,
    // Al empezar: explica el juego.
    enter(){later(300,()=>sayQ(cfg.intro||'Tocá cada dibujo y escuchá cómo se dice en inglés. ¡Repetilo en voz alta!'))},
    // Recuerda qué hacer.
    prompt(){say(this.open?'Tocá para cerrar.':'Tocá un dibujo que todavía no tenga estrella.')},
    // Pista: la tarjeta abierta (cuando ya habló) o la primera sin ver.
    hint(){if(this.open)return this.spoke?{x:900,y:450,r:200}:null;const it=items.find(i=>!i.seen);return it?{x:it.x,y:it.y,r:it.s*.6}:null},
    // Abre la tarjeta it en grande, dice la palabra y, si es nueva, suma una estrella.
    show(it){this.open=it;this.ot=T;this.spoke=0;SFX.pop();later(200,()=>sayMix(['@'+it.en,enEs(it)+'.','@'+it.en],()=>{this.spoke=T}));if(!it.seen){it.seen=T;this.done++;scene.starPop=T}},
    // Cierra la tarjeta abierta; si ya se han visto todas, termina el juego.
    close(){this.open=null;SFX.tap();if(this.done>=n&&!this.fin){this.fin=true;later(400,onDone)}},
    // Cada cuadro: cierra sola la tarjeta 2,2 s después de terminar de hablar.
    update(){if(this.open&&this.spoke&&T-this.spoke>2.2)this.close()},
    // Dibuja las tarjetas (aparecen con rebote) y, encima, la tarjeta abierta en grande.
    draw(){cfg.bg();for(const it of items){const ap=clamp((T-it.in)*3,0,1);enCard(it,it.x,it.y,it.s,{s:(ap<1?back(ap):1)*(this.open?1:hv(it,hR(it.x,it.y,it.s,it.s))),star:it.seen,bg:it.col==='#FFFFFF'?'#E9F3FA':null})}
      if(this.open){const it=this.open,k=clamp((T-this.ot)*4,0,1);ctx.fillStyle=`rgba(46,36,32,${.45*k})`;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(900,430);ctx.scale(back(k),back(k));
        card(-280,-290,560,580,it.col==='#FFFFFF'?'#E9F3FA':'#FFF6E6',8,50);enDraw(it,0,-60,330);text(it.en.toUpperCase(),0,190,it.en.length>9?60:76,'#5B8DEF',{f:LF});text(enEs(it),0,252,40,'#7A6252');ctx.restore()}},
    // Toque: con una tarjeta abierta la cierra (cuando ya habló o tras 4 s); si no, abre la tarjeta tocada.
    down(x,y){if(this.open){if(this.spoke||T-this.ot>4)this.close();return}const it=items.find(i=>inR(x,y,i.x,i.y,i.s,i.s));if(it)this.show(it);else{SFX.tap();sparkles(x,y,3)}}}}

// 2) ¿Dónde está? Tito dice la palabra en inglés y hay que tocar el dibujo
// Juego "¿Dónde está?" (tipo enEscucha): Tito dice una palabra en inglés y hay que tocar su dibujo.
// cfg: {items, bg, key (habilidad para rec), rounds}. Cada ronda tiene 3-4 opciones; dos fallos quitan una opción.
function EnEscucha(cfg,onDone){const pool=cfg.items,R=cfg.rounds||Math.min(nRounds(),pool.length+1);let order=shuffle(pool.slice());
  return {total:R,done:0,i:0,
    // Al empezar: primera ronda.
    enter(){this.round()},
    // Prepara una ronda: la palabra buscada (en orden barajado) y otras al azar. Durante la frase inicial (lock)
    // tocar una opción equivocada solo dice su nombre, sin contar como fallo.
    round(){const t=order[this.i%order.length],n=clamp(nOpts()+1,3,Math.min(4,pool.length)),others=shuffle(pool.filter(w=>w!==t)).slice(0,n-1);
      this.t=t;this.items=shuffle([t,...others]).map(o=>({it:o,ok:o===t}));enGrid(this.items,240,560,1200);this.errs=0;this.busy=false;this.lock=true;
      later(400,()=>this.prompt(()=>{this.lock=false}));later(2800,()=>{this.lock=false})},
    // Dice "Tocá" + la palabra en inglés.
    prompt(cb){sayMix(['Tocá','@'+this.t.en],cb)},
    // Pista: la tarjeta correcta (cuando ya ha terminado de hablar).
    hint(){const c=this.items.find(c=>c.ok&&!c.win);return c&&!this.lock?{x:c.x,y:c.y,r:c.s*.6}:null},
    // Dibuja el botón de volver a escuchar y las tarjetas (la correcta late y muestra la palabra).
    draw(){cfg.bg();{const s=hv('en:spk',hR(800,160,300,84));ctx.save();ctx.translate(800,160);ctx.scale(s,s);card(-150,-42,300,84,'#fff',6,42);speaker(-60,0,64);pic('oreja',60,0,64);ctx.restore()}
      for(const c of this.items){if(c.gone&&T-c.gone>.4)continue;ctx.save();if(c.gone)ctx.globalAlpha=Math.max(0,1-(T-c.gone)*2.5);enCard(c.it,c.x,c.y,c.s,{s:c.win?1+.1*Math.sin((T-c.win)*12):hv(c,hR(c.x,c.y,c.s,c.s)),shake:c.shake,glow:!!c.win,bg:c.it.col==='#FFFFFF'?'#E9F3FA':null,label:!!c.win});ctx.restore()}},
    // Toque: altavoz (repite), tarjeta correcta (acierto: rec, onRight, siguiente ronda) o equivocada
    // (dice qué es y vuelve a pedir; solo el primer fallo de la ronda cuenta en rec).
    down(x,y){if(inR(x,y,800,160,300,84)){this.prompt();return}
      const c=this.items.find(c=>!c.gone&&inR(x,y,c.x,c.y,c.s,c.s));if(!c){SFX.tap();sparkles(x,y,3);return}if(c.win||this.busy)return;
      if(this.lock&&!c.ok){sayMix(['@'+c.it.en]);return}
      if(c.ok){this.busy=true;c.win=T;SFX.good();burst(c.x,c.y,30);rec(cfg.key||'ingles',this.errs===0);onRight(this.errs===0);this.done++;scene.starPop=T;
        sayMix(['@'+c.it.en+'!',praise()],()=>later(400,()=>{this.i++;if(this.i>=R)onDone();else this.round()}))}
      else{SFX.bad();c.shake=T;if(this.errs===0)rec(cfg.key||'ingles',false);this.errs++;sayMix(['Ese es','@'+c.it.en,'. Buscá','@'+this.t.en]);
        if(this.errs===2){onWrongTwice();c.gone=T}}}}}

// 3) Los globos: reventar los globos de la palabra que dice Tito
// Juego "Reventá los globos" (tipo enGlobos): suben globos con dibujos y hay que reventar los de la palabra
// que dice Tito. cfg: {items, bg, key}. 3 aciertos (3 años) o 4; la velocidad sube con la edad.
function EnGlobos(cfg,onDone){const pool=cfg.items,R=AGE()<=3?3:4,sp=AGE()<=3?70:AGE()===4?85:100;
  return {total:R,done:0,bs:[],nx:0,
    // Al empezar: elige la palabra y la dice.
    enter(){this.pickT();later(400,()=>this.prompt())},
    // Elige una palabra objetivo nueva (distinta de la anterior si se puede).
    pickT(){const prev=this.t;const L=pool.filter(p=>p!==prev);this.t=pick(L.length?L:pool);this.tn=0},
    // Dice qué globos hay que reventar.
    prompt(){sayMix(['Reventá los globos de','@'+this.t.en])},
    // Lanza un globo nuevo desde abajo en un carril libre. tn cuenta cuántos globos "de relleno" pueden salir
    // antes de forzar uno correcto (así siempre aparecen correctos a menudo).
    spawn(){const lanes=[340,560,780,1000,1220,1440].filter(x=>!this.bs.some(b=>Math.abs(b.x-x)<60&&b.y>620));if(!lanes.length)return;
      const isT=this.tn<=0||Math.random()<.45,it=isT?this.t:pick(pool.filter(p=>p!==this.t))||this.t;if(it===this.t)this.tn=2;else this.tn--;
      this.bs.push({x:pick(lanes),y:980,it,ph:rnd(0,6),c:it.col||pick(['#FF8A7A','#7FD3F0','#FFD66B','#B9A6F0','#9FDC8F','#F58BB4'])})},
    // Cada cuadro: saca un globo cada 1,15 s, sube los globos con un vaivén y quita los que salen o ya explotaron.
    update(dt){if(this.fin)return;this.nx-=dt;if(this.nx<=0){this.spawn();this.nx=1.15}
      for(const b of this.bs){if(!b.pop)b.y-=sp*dt;b.x+=Math.sin(T*1.5+b.ph)*.4}this.bs=this.bs.filter(b=>b.y>-140&&!(b.pop&&T-b.pop>.5))},
    // Pista: el globo correcto más alto que esté en pantalla.
    hint(){const b=this.bs.filter(b=>!b.pop&&b.it===this.t&&b.y<820&&b.y>120).sort((a,c)=>a.y-c.y)[0];return b?{x:b.x,y:b.y,r:80}:null},
    // Dibuja el botón con la palabra buscada y los globos (los colores se pintan del propio color; el resto con su dibujo).
    draw(){cfg.bg();{const s=hv('en:spk',hR(800,160,300,84));ctx.save();ctx.translate(800,160);ctx.scale(s,s);card(-150,-42,300,84,'#fff',6,42);speaker(-60,0,64);enDraw(this.t,60,0,66);ctx.restore()}
      for(const b of this.bs){ctx.save();ctx.translate(b.x,b.y);if(b.pop){const k=(T-b.pop)*2;ctx.globalAlpha=Math.max(0,1-k);ctx.scale(1+k,1+k)}
        ctx.beginPath();ctx.moveTo(0,78);ctx.quadraticCurveTo(12,110,-6,150);ctx.lineWidth=3;ctx.strokeStyle=K;ctx.stroke();ell(0,0,74,86,b.c,6);ctx.beginPath();ctx.moveTo(-10,84);ctx.lineTo(10,84);ctx.lineTo(0,72);ctx.closePath();fillStroke(b.c,4);
        ell(-28,-36,12,20,'rgba(255,255,255,.6)',0);if(!b.it.col){circ(0,4,50,'#fff',4);enDraw(b.it,0,4,82)}ctx.restore()}},
    // Toque: altavoz (repite) o el globo más cercano: si es el bueno explota y cuenta; si no, dice cuál es.
    down(x,y){if(this.fin)return;if(inR(x,y,800,160,300,84)){this.prompt();return}
      const b=this.bs.filter(b=>!b.pop&&dist(x,y,b.x,b.y)<90).sort((a,c)=>dist(x,y,a.x,a.y)-dist(x,y,c.x,c.y))[0];if(!b){SFX.tap();sparkles(x,y,3);return}
      if(b.it===this.t){b.pop=T;SFX.pop();SFX.good();burst(b.x,b.y,24);rec(cfg.key||'ingles',true);onRight(true);this.done++;scene.starPop=T;
        if(this.done>=R){this.fin=true;sayMix(['@'+b.it.en+'!',praise()],()=>later(300,onDone))}else{this.pickT();sayMix(['@'+b.it.en+'!','Ahora, los globos de','@'+this.t.en])}}
      else{SFX.boing();b.ph+=3;rec(cfg.key||'ingles',false);sayMix(['Ese es','@'+b.it.en])}}}}

// 4) Contar en inglés: tocar cada cosa y Tito cuenta
// Juego "Contar en inglés" (tipo enCuenta): 3 rondas con entre 2 y 5/8/10 cosas (según la edad); al tocar cada
// una Tito dice el número en inglés. cfg: {bg}. La habilidad que se apunta es siempre 'ingles-numeros'.
function EnCuenta(cfg,onDone){const max=AGE()<=3?5:AGE()===4?8:10,R=3,ks=['manzana','estrella','pelota','pato','flor','globo'];
  return {total:R,done:0,i:0,
    // Al empezar: primera ronda.
    enter(){this.round()},
    // Prepara una ronda: cuántas cosas (distinto de la anterior), qué dibujo, y las coloca en una o dos filas.
    round(){const prev=this.n;let n;do{n=Math.floor(rnd(2,max+1))}while(n===prev);this.n=n;this.c=0;this.k=ks[this.i%ks.length];this.busy=false;
      const per=n<=5?n:Math.ceil(n/2),s=Math.min(200,1100/per-30);this.os=Array.from({length:n},(_,j)=>{const r=j<per?0:1,c=r?j-per:j,inRow=r?n-per:per;return{x:900-(inRow-1)*(s+30)/2+c*(s+30),y:(n<=5?470:360)+r*(s+60),s,on:0}});
      later(400,()=>sayQ(this.i===0?'¡Contamos en inglés! Tocá cada dibujo, de a uno.':'Otra vez: tocá cada dibujo y contamos.'))},
    // Recuerda qué hacer.
    prompt(){say('Tocá cada dibujo y contamos en inglés.')},
    // Pista: la primera cosa sin contar.
    hint(){const o=this.os.find(o=>!o.on);return o&&!this.busy?{x:o.x,y:o.y,r:o.s*.6}:null},
    // Dibuja las cosas (las contadas con su número) y, al terminar la ronda, el total en cifra y en inglés.
    draw(){cfg.bg();for(const o of this.os){const b=o.on?Math.max(0,1-(T-o.on)*3)*.25:0;ctx.save();ctx.translate(o.x,o.y);ctx.scale(1+b,1+b);card(-o.s/2,-o.s/2,o.s,o.s,o.on?'#FFF3B0':'#fff',6,30);pic(this.k,0,0,o.s*.78);
        if(o.on){circ(o.s/2-8,-o.s/2+8,26,'#5B8DEF',4);text(String(o.num),o.s/2-8,-o.s/2+20,30,'#fff',{f:LF})}ctx.restore()}
      if(this.busy&&this.c===this.n){card(700,110,400,120,'#fff',7,60);text(String(this.n),760,196,80,'#5B8DEF',{f:LF});text(EN.numbers[this.n-1].en,950,190,56,K,{w:600})}},
    // Toque: cuenta la cosa tocada (dice su número en inglés); al llegar al total, acierto y siguiente ronda.
    down(x,y){if(this.busy)return;const o=this.os.find(o=>!o.on&&inR(x,y,o.x,o.y,o.s,o.s));if(!o){const d=this.os.find(o=>o.on&&inR(x,y,o.x,o.y,o.s,o.s));if(d)sayMix(['@'+EN.numbers[d.num-1].en]);else{SFX.tap();sparkles(x,y,3)}return}
      this.c++;o.on=T;o.num=this.c;SFX.count(this.c);sparkles(o.x,o.y,6);sayMix(['@'+EN.numbers[this.c-1].en]);
      if(this.c===this.n){this.busy=true;rec(cfg.key||'ingles-numeros',true);onRight(true);this.done++;scene.starPop=T;burst(900,300,40);
        later(900,()=>sayMix(['@'+EN.numbers[this.n-1].en+'!',cap(NUM[this.n])+'. ¡Hay '+NUM[this.n]+'!'],()=>later(500,()=>{this.i++;if(this.i>=R)onDone();else this.round()})))}}}}

// Juegos del inglés para usar en los temas: t (tipo de juego que reconoce makeGame), icon y name (nombre en el camino).
const ENG={conocer:{t:'enConocer',icon:'oreja',name:'Escuchá y repetí'},escucha:{t:'enEscucha',icon:'busca',name:'¿Dónde está?'},globos:{t:'enGlobos',icon:'globo',name:'Reventá los globos'},cuenta:{t:'enCuenta',icon:'manzana',name:'Contar en inglés'}};
// Temas del Rincón del inglés (casitas de la zona 'ingles', se abren en orden). Campos: id, n (nombre), icon, c (color),
// bg (fondo de los juegos), zone, en (conjunto de palabras de EN), tip (consejo para la familia en la zona de adultos),
// games (lista de juegos de ENG).
const ING=[
  {id:'EN-HELLO',n:'Los saludos en inglés',icon:'mano',c:'#5BB8E6',bg:BG.aula,zone:'ingles',en:'hello',tip:'saludarse en inglés al llegar y al irse: hello, good morning, good night.',games:[ENG.conocer,ENG.escucha,ENG.globos]},
  {id:'EN-COLORS',n:'Los colores en inglés',icon:'pinturas',c:'#FF5A5A',bg:BG.colores,zone:'ingles',en:'colors',tip:'jugar a "I spy": buscar en casa cosas red, blue, yellow...',games:[ENG.conocer,ENG.escucha,ENG.globos]},
  {id:'EN-NUMBERS',n:'Los números en inglés',icon:'bloques',c:'#7CC86E',bg:BG.aula,zone:'ingles',en:'numbers',tip:'contar en inglés los escalones o los juguetes: one, two, three...',games:[ENG.conocer,ENG.cuenta,ENG.escucha]},
  {id:'EN-ANIMALS',n:'Los animales en inglés',icon:'perro',c:'#FFA94D',bg:BG.granja,zone:'ingles',en:'animals',tip:'mirar un libro de animales y nombrarlos en inglés.',games:[ENG.conocer,ENG.escucha,ENG.globos]}
];
// Envuelve makeGame: si el tema tiene en y el juego es de tipo en*, crea el juego de inglés con las palabras de su edad.
{const mg0=makeGame;makeGame=function(g,t,onDone){
  if(t.en&&g.t.startsWith('en')){const items=enItems(t.en),bg=t.bg;
    if(g.t==='enConocer')return EnConocer({items,bg},onDone);
    if(g.t==='enEscucha')return EnEscucha({items,bg,key:'ingles-'+t.en},onDone);
    if(g.t==='enGlobos')return EnGlobos({items,bg,key:'ingles-'+t.en},onDone);
    if(g.t==='enCuenta')return EnCuenta({bg},onDone)}
  return mg0(g,t,onDone)}}
