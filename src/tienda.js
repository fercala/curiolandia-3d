/* ================= MONEDAS, TIENDA Y CASA DE TITO ================= */
const DEF2={coins:0,coinsTot:0,gift:'',woke:{},home:{},tito:{shell:'naranja',scarf:'roja',hat:'',glasses:'',bow:''},owned:{'caparazon:naranja':1,'bufanda:roja':1},vales:null,valesLog:[],bday:null,bdayDone:'',unlockAll:false,seenOpen:{},houseSeen:null,petSeen:null,cofres:0};
Object.assign(DEF,JSON.parse(JSON.stringify(DEF2)));
const _oldSave=S.coins===undefined&&Object.keys(S.temas||{}).length>0;
for(const k in DEF2)if(S[k]===undefined)S[k]=JSON.parse(JSON.stringify(DEF2[k]));
// quien ya jugaba la versión 1 recibe monedas por lo que ya había jugado
if(_oldSave){const n=Object.values(S.temas).reduce((a,t)=>a+Object.keys((t&&t.g)||{}).length,0)*2;S.coins=S.coinsTot=n;save()}
const VALES_DEF=[{id:'v1',txt:'Un cuento extra antes de dormir',ic:'libro',p:30,on:1},{id:'v2',txt:'Ir a jugar al parque',ic:'parque',p:50,on:1},{id:'v3',txt:'Elegir a qué jugamos juntos',ic:'bloques',p:40,on:1},
  {id:'v4',txt:'Cocinar algo rico juntos',ic:'olla',p:60,on:0},{id:'v5',txt:'Elegir la película del fin de semana',ic:'tele',p:60,on:0},{id:'v6',txt:'Un abrazo de oso gigante',ic:'oso',p:10,on:0}];
if(!S.vales)S.vales=JSON.parse(JSON.stringify(VALES_DEF));

/* ---------- monedas ---------- */
let shownCoins=S.coins,coinFx=[],coinBanner=null,coinBumpT=-9,gameCoins=0;
let HUDX=1450,HUDY=64;
const hudAt=()=>{if(sceneName==='juego'){HUDX=300;HUDY=74}else{HUDX=1450;HUDY=64}};
const STARS=()=>Object.values(S.temas).reduce((a,t)=>a+Object.keys((t&&t.g)||{}).length,0);
function drawCoinHUD(){hudAt();const b=1+.3*Math.max(0,1-(T-coinBumpT)*4),s=hv('coins',hR(HUDX+10,HUDY,220,84));ctx.save();ctx.translate(HUDX,HUDY);ctx.scale(s,s);card(-96,-38,216,76,'#FFF6D6',6,38);
  ctx.save();ctx.translate(-50,0);ctx.scale(b,b);pic('moneda',0,0,70);ctx.restore();text(String(Math.max(0,Math.round(shownCoins))),40,16,44,K,{f:LF});ctx.restore()}
const inCoinHUD=(x,y)=>{hudAt();return inR(x,y,HUDX+10,HUDY,220,84)};
function giveCoins(n,x,y,icon){if(!(n>0))return;S.coins=(S.coins||0)+n;S.coinsTot=(S.coinsTot||0)+n;save();const m=Math.min(n,10);
  for(let i=0;i<m;i++)coinFx.push({x:x+rnd(-36,36),y:y+rnd(-36,36),t:T+i*.09,v:i<m-1?1:n-(m-1)});if(n>=3||icon)coinBanner={n,t:T,icon}}
function spendCoins(n,x,y){S.coins-=n;save();shownCoins-=n;coinBumpT=T;for(let i=0;i<Math.min(n,8);i++)coinFx.push({x,y,t:T+i*.06,spend:1})}
function drawCoinFx(){hudAt();
  for(const c of coinFx){const k=(T-c.t)/.75;if(k<0)continue;
    if(k>=1){if(!c.done){c.done=1;if(!c.spend){shownCoins+=c.v;coinBumpT=T;try{tone(1568,.08,'square',.06);tone(2093,.14,'triangle',.12,0,.05)}catch(e){}}}continue}
    const e=k*k*(3-2*k),a=c.spend?[HUDX-50,HUDY]:[c.x,c.y],b=c.spend?[c.x,c.y]:[HUDX-50,HUDY];
    pic('moneda',lerp(a[0],b[0],e),lerp(a[1],b[1],e)-Math.sin(k*PI)*130,62*(1-k*.25))}
  coinFx=coinFx.filter(c=>!c.done);if(!coinFx.length)shownCoins=S.coins;
  if(coinBanner){const k=T-coinBanner.t;if(k>2.6){coinBanner=null;return}const a=k<.3?back(k/.3):k>2.2?1-(k-2.2)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(coinBanner.x||800,coinBanner.y||470);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
    card(-250,-90,500,180,'#FFF6D6',7,50);pic(coinBanner.icon||'monedas',-140,0,150);text('+'+coinBanner.n,60,26,92,'#D9962A',{f:LF,st:8,sc:'#fff'});ctx.restore()}}
{const or0=onRight;onRight=function(first){or0(first);if(first&&sceneName==='juego'&&gameCoins<5){gameCoins++;giveCoins(1,MX||800,MY||450)}}}
{const e0=SCENES.juego.enter;SCENES.juego.enter=function(o){gameCoins=0;e0.call(this,o)}}
{const f0=finishGame;finishGame=function(t,gi){const st=S.temas[t.id],first=!(st&&st.g[gi]),was=!!(st&&st.done);f0(t,gi);const now=!!(S.temas[t.id]&&S.temas[t.id].done)&&!was;
  giveCoins(first?3:2,800,420)}}

/* ---------- Tito con ropa y colores ---------- */
const SHELLC={naranja:['#FFA94D','#D9762A'],azul:['#7FB0FF','#4A6FD0'],rosa:['#F58BB4','#C95A8A'],verde:['#7FD8C8','#3E9E8E'],violeta:['#B9A6F0','#7A62C9'],dorado:['#FFD34E','#C9962A']};
const SCARFC={roja:'#FF6B5E',azul:'#5B8DEF',amarilla:'#FFC93C',violeta:'#9B8AD9'};
const TITOIMG={};
function titoImg(){const t=S.tito||{},sh=SHELLC[t.shell]?t.shell:'naranja',sc=SCARFC[t.scarf]?t.scarf:'roja',tk=titoKind(),er=tk==='erizo',key=(tk==='caracol'?'':tk+'|')+sh+'|'+sc;if(key==='naranja|roja')return IMG.tito;
  // el erizo lleva el color de la tienda en las púas (con el naranja de siempre, púas marrones); la tortuga en el caparazón y el conejo en la mochila
  if(!TITOIMG[key])TITOIMG[key]=er?svgImg(ERIZO_SVG.replace('fill="#B07A4F"','fill="'+(sh==='naranja'?'#B07A4F':SHELLC[sh][0])+'"').replace('stroke="#7A5030"','stroke="'+(sh==='naranja'?'#7A5030':SHELLC[sh][1])+'"').replace('fill="#FF6B5E"','fill="'+SCARFC[sc]+'"'),'0 0 240 200',480)
    :svgImg(({caracol:TITO_SVG,tortuga:TORTUGA_SVG,conejo:CONEJO_SVG})[tk].replace('fill="#FFA94D"','fill="'+SHELLC[sh][0]+'"').replace('stroke="#D9762A"','stroke="'+SHELLC[sh][1]+'"').replace('fill="#FF6B5E"','fill="'+SCARFC[sc]+'"'),'0 0 240 200',480);
  const i=TITOIMG[key];return i.complete?i:(IMG[tk==='caracol'?'tito':tk]||IMG.tito)}
const HATPOS={gorroFiesta:[198,28,86],gorra:[204,44,84],gorro:[198,40,84],gorroNavidad:[202,32,92],sombreroCopa:[198,34,78],sombreroPirata:[198,38,100],corona:[198,42,72]};
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
const SHOPCAT=[{id:'ropa',n:'Ropa para Tito',ic:'gorroFiesta'},{id:'colores',n:'Colores para Tito',ic:'caracol'},{id:'casa',n:'Cosas para la casa',ic:'lampara'},{id:'juguetes',n:'Juguetes',ic:'peluche'},{id:'mascotas',n:'Mascotas',ic:'hamster'},{id:'vales',n:'Vales para canjear',ic:'vale'}];
const SHOP=[
  ...[['gorroFiesta',6,1],['gorra',8,1],['monio',6,1,'bow'],['gafas',10,1,'glasses'],['gorro',10,1],['gorroNavidad',12,2],['sombreroCopa',18,2],['sombreroPirata',18,2],['corona',30,3]].map(([id,p,tier,slot])=>({id,cat:'ropa',slot:slot||'hat',p,tier})),
  ...[['naranja',0,1],['azul',15,1],['rosa',15,2],['verde',20,2],['violeta',25,3],['dorado',40,3]].map(([c,p,tier])=>({id:'caparazon:'+c,cat:'colores',slot:'shell',v:c,p,tier,n:'el caparazón '+(c==='rosa'?'rosa':c==='verde'?'verde':c),draw:(x,y,s)=>{if(titoKind()!=='caracol')return shellIcon(x,y,s*.36,c);circ(x,y,s*.36,SHELLC[c][0],6);ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*PI*4.4,r=4+i/40*s*.26;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.lineWidth=s*.05;ctx.strokeStyle=SHELLC[c][1];ctx.lineCap='round';ctx.stroke()}})),
  ...[['roja',0,1],['azul',8,1],['amarilla',8,1],['violeta',10,2]].map(([c,p,tier])=>({id:'bufanda:'+c,cat:'colores',slot:'scarf',v:c,p,tier,n:'la bufanda '+c,draw:(x,y,s)=>{ctx.save();ctx.translate(x,y);card(-s*.38,-s*.16,s*.76,s*.2,SCARFC[c],6,s*.1);card(s*.08,-s*.04,s*.16,s*.38,SCARFC[c],6,s*.06);ctx.restore()}})),
  ...[['alfombra',10,1],['cuadro',8,1],['plantaInterior',8,1],['lampara',12,1],['banco',12,2],['estanteria',15,2],['reloj',15,2],['farol',15,2],['piano',30,3],['fuente',35,3]].map(([id,p,tier])=>({id,cat:'casa',p,tier})),
  ...[['pelotaPlaya',6,1],['bloques',8,1],['peluche',10,1],['cometa',10,1],['xilofono',12,1],['muneca',15,2],['robot',18,2],['trenJuguete',18,2],['guitarra',20,2],['telescopio',30,3]].map(([id,p,tier])=>({id,cat:'juguetes',p,tier})),
  ...[['pecera',20,1],['hamster',25,2],['casitaPerro',40,3]].map(([id,p,tier])=>({id,cat:'mascotas',p,tier}))
];
const TIER_NEED={1:0,2:8,3:20};
const shopItems=cat=>cat==='vales'?S.vales.filter(v=>v.on).slice(0,10).map(v=>({id:'vale:'+v.id,cat:'vales',p:v.p,tier:1,vale:v,n:'el vale: '+v.txt})):SHOP.filter(i=>i.cat===cat);
const itemName=it=>it.n?V(it.n):W_(it.id);
const isWorn=it=>{const t=S.tito;return it.slot==='hat'?t.hat===it.id:it.slot==='glasses'?!!t.glasses:it.slot==='bow'?!!t.bow:it.slot==='shell'?t.shell===it.v:it.slot==='scarf'?t.scarf===it.v:false};
function wear(it,on){const t=S.tito;if(it.slot==='hat')t.hat=on?it.id:'';if(it.slot==='glasses')t.glasses=on?'gafas':'';if(it.slot==='bow')t.bow=on?'monio':'';if(it.slot==='shell')t.shell=it.v;if(it.slot==='scarf')t.scarf=it.v;save()}
function drawItemPic(it,x,y,s){if(it.draw)it.draw(x,y,s);else if(it.vale){pic('vale',x,y,s);circ(x+s*.26,y-s*.24,s*.2,'#fff',4);pic(it.vale.ic,x+s*.26,y-s*.24,s*.32)}else pic(it.id,x,y,s)}
const HOMESPOT=[[930,720],[1180,740],[780,800],[1420,720],[1050,560],[830,560],[1290,560],[1500,560],[1010,840],[1300,850],[700,580],[1500,850]];
const WALLITEMS=['cuadro','reloj'];
function placeHome(id){if(S.home[id])return;const used=Object.values(S.home).map(p=>p.x+','+p.y);
  if(WALLITEMS.includes(id)){S.home[id]={x:WALLITEMS.indexOf(id)?1030:800,y:330};return}
  if(id==='alfombra'){S.home[id]={x:960,y:760};return}
  const sp=HOMESPOT.find(p=>!used.includes(p[0]+','+p[1]))||[rnd(700,1400)|0,rnd(560,800)|0];S.home[id]={x:sp[0],y:sp[1]}}

/* ---------- la tienda ---------- */
SCENES.tienda={music:'casita',
  enter(o){this.cat=this.cat||'ropa';this.conf=null;this.newHome=0;const seen=S.first.tienda;later(300,()=>say(seen?'¡La tienda! Tenés '+S.coins+' monedas. Tocá algo para ver cuánto cuesta.':V(['¡Bienvenido a la tienda! Con las monedas que ganás jugando, podés comprar cosas para mí y para mi casa. Arriba elegís qué mirar.','¡Bienvenido a la tienda! Con las monedas que ganas jugando, puedes comprar cosas para mí y para mi casa. Arriba eliges qué mirar.'])));S.first.tienda=1;save()},
  tabs(){return SHOPCAT.filter(c=>c.id!=='vales'||S.vales.some(v=>v.on)).map((c,i,a)=>Object.assign({x:900-(a.length-1)*102+i*204,y:215},c))},
  grid(){const L=shopItems(this.cat);return L.map((it,i)=>Object.assign({x:400+(i%5)*240,y:i<5?440:700,it}))},
  prompt(){if(this.conf)say('¿Lo comprás? Tocá el verde para comprar o la cruz para volver.');else say('Tocá algo para ver cuánto cuesta. Tenés '+S.coins+' monedas.')},
  hint(){if(this.conf)return{x:680,y:690,r:80};return null},
  dwell(id){if(id.startsWith('tab:')){const c=SHOPCAT.find(c=>c.id===id.slice(4));if(c)say(c.n+'.')}else if(id.startsWith('it:')){const g=this.grid().find(g=>g.it.id===id.slice(3));if(g)say(cap(itemName(g.it))+'.'+(S.owned[g.it.id]&&!g.it.vale?' Ya es tuyo.':' Cuesta '+g.it.p+' monedas.'))}else if(id==='coins')say('Tenés '+S.coins+' monedas.')},
  draw(){sky('#FFF6E6','#FDE6C6');for(let i=0;i<16;i++){ctx.fillStyle=i%2?'#FF8A7A':'#FFF6E6';ctx.beginPath();ctx.moveTo(i*100,0);ctx.lineTo(i*100+100,0);ctx.lineTo(i*100+100,26);ctx.quadraticCurveTo(i*100+50,62,i*100,26);ctx.closePath();ctx.fill()}
    floor(820,'#E9C99A');
    card(170,44,520,100,'#fff',6,50);pic('tienda',230,94,80);text(V(['La tienda','La tienda']),470,112,54,K,{w:600});
    {const s=hv('btn:casa',hC(1240,70,52)),j=this.newHome?Math.abs(Math.sin((T-this.newHome)*6))*-14:0;ctx.save();ctx.translate(1240,70+j);ctx.scale(s,s);if(this.newHome){ctx.globalAlpha=.4+.3*Math.sin(T*6);circ(0,0,64,null,10,'#FFC93C');ctx.globalAlpha=1}circ(0,0,50,'#fff',6);titoHouseIc(0,0,84);ctx.restore()}
    card(1012,40,150,60,'#fff',5,30);star(1050,70,20,'#FFC93C',3);text(String(STARS()),1110,84,36,K,{f:LF});
    for(const tb of this.tabs()){const on=tb.id===this.cat,s=on?1:hv('tab:'+tb.id,hR(tb.x,tb.y,184,110));ctx.save();ctx.translate(tb.x,tb.y-(on?8:0));ctx.scale(s,s);card(-90,-52,180,104,on?'#FFE08A':'#fff',on?8:5,30,on?'#D9962A':K);if(tb.id==='colores'&&titoKind()!=='caracol')shellIcon(0,0,32,'naranja');else pic(tb.ic,0,0,80);ctx.restore()}
    for(const g of this.grid()){const it=g.it,own=S.owned[it.id]&&!it.vale,lk=STARS()<TIER_NEED[it.tier],w=own&&it.slot&&isWorn(it),s=lk?1:hv('it:'+it.id,hR(g.x,g.y,210,230));
      ctx.save();ctx.translate(g.x,g.y);ctx.scale(s,s);card(-105,-115,210,230,w?'#FFF6D6':'#fff',w?9:6,32,w?'#FFC93C':K);drawItemPic(it,0,-22,150);
      if(own){circ(0,82,26,'#7CC86E',5);ctx.beginPath();ctx.moveTo(-11,82);ctx.lineTo(-2,92);ctx.lineTo(13,72);ctx.lineWidth=7;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.stroke()}
      else if(!lk){card(-62,62,124,44,S.coins>=it.p?'#FFF3B0':'#F4EDE2',4,22);pic('moneda',-36,84,40);text(String(it.p),18,98,34,K,{f:LF})}
      if(lk){ctx.globalAlpha=.7;card(-105,-115,210,230,'#F4EDE2',0,32);ctx.globalAlpha=1;pic('candado',0,-30,110);card(-56,40,112,50,'#fff',4,25);star(-24,65,16,'#FFC93C',3);text(String(TIER_NEED[it.tier]),20,78,30,K,{f:LF})}
      ctx.restore()}
    if(this.conf){const it=this.conf,k=clamp((T-this.confT)*4,0,1);ctx.fillStyle=`rgba(46,36,32,${.45*k})`;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(800,450);ctx.scale(back(k),back(k));
      card(-300,-300,600,600,'#FFF6E6',8,50);drawItemPic(it,0,-90,300);card(-90,90,180,64,'#FFF3B0',5,32);pic('moneda',-46,122,54);text(String(it.p),30,140,44,K,{f:LF});ctx.restore();
      if(k>=1){for(const [x,c,ok] of[[680,'#7CC86E',1],[920,'#FF6B5E',0]]){const s=hv('cf'+ok,hC(x,690,70));ctx.save();ctx.translate(x,690);ctx.scale(s,s);circ(0,0,66,c,7);ctx.lineWidth=14;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.beginPath();if(ok){ctx.moveTo(-26,2);ctx.lineTo(-6,24);ctx.lineTo(30,-20)}else{ctx.moveTo(-22,-22);ctx.lineTo(22,22);ctx.moveTo(22,-22);ctx.lineTo(-22,22)}ctx.stroke();ctx.restore()}}}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  down(x,y){
    if(this.conf){if(T-this.confT<.3)return;if(dist(x,y,680,690)<75){this.buy(this.conf);return}if(dist(x,y,920,690)<75||!inR(x,y,800,450,600,600)){SFX.tap();this.conf=null;say('Bueno, ¡otra vez será!')}return}
    if(atHome(x,y)){SFX.tap();go('map');return}
    if(inTito(x,y)){this.prompt();return}
    if(dist(x,y,1240,70)<56){SFX.pop();go('casaTito',{hello:true,nuevo:this.newHome?this.newId:null});return}
    if(inCoinHUD(x,y)){say('Tenés '+S.coins+' monedas.');return}
    if(inR(x,y,1087,70,150,60)){say('Tenés '+STARS()+' estrellas. Las ganás terminando juegos.');return}
    const tb=this.tabs().find(t=>inR(x,y,t.x,t.y,184,110));if(tb){SFX.pop();this.cat=tb.id;say(tb.n+'.');return}
    const g=this.grid().find(g=>inR(x,y,g.x,g.y,210,230));if(!g){SFX.tap();sparkles(x,y,3);return}
    const it=g.it,need=TIER_NEED[it.tier];
    if(STARS()<need){SFX.boing();say(cap(itemName(it))+' se abre cuando tengas '+need+' estrellas. ¡Ya tenés '+STARS()+'! Ganás estrellas terminando juegos.');return}
    if(S.owned[it.id]&&!it.vale){
      if(it.slot){const on=it.slot==='shell'||it.slot==='scarf'?true:!isWorn(it);wear(it,on);SFX.pop();sparkles(TITO.x+150,TITO.y+40,12);say(on?'¡Tito se puso '+itemName(it)+'!':V(['Tito se sacó ','Tito se quitó '])+itemName(it)+'.');return}
      SFX.pop();say(cap(itemName(it))+' ya es tuyo. Está en la casa de Tito.');return}
    if(S.coins<it.p){SFX.boing();const f=it.p-S.coins;say(cap(itemName(it))+' cuesta '+it.p+' monedas. Te '+(f===1?'falta una':'faltan '+f)+'. ¡Jugando ganás más!');return}
    SFX.pop();this.conf=it;this.confT=T;say('¿Querés comprar '+itemName(it)+' por '+it.p+' monedas? Tocá el verde para comprar.')},
  buy(it){this.conf=null;spendCoins(it.p,800,400);SFX.tada();burst(800,420,60);
    if(it.vale){S.valesLog.push({id:it.vale.id,txt:it.vale.txt,d:today(),given:0});save();say('¡Compraste el vale! '+it.vale.txt+'. Mostráselo a un adulto de tu familia para canjearlo.');return}
    S.owned[it.id]=1;if(it.slot)wear(it,true);else placeHome(it.id);save();
    if(!it.slot){this.newHome=T;this.newId=it.id}
    say(it.slot?'¡Es tuyo! ¡Mirá qué lindo le queda a Tito!':'¡Es tuyo! Ya está en la casa de Tito. Tocá la casita de arriba para verlo.')}
};

/* ---------- la casa de Tito ---------- */
const HSIZE={alfombra:360,piano:240,estanteria:250,fuente:240,farol:240,banco:250,plantaInterior:180,lampara:220,reloj:140,cuadro:170,casitaPerro:230,pecera:170,hamster:110,telescopio:200,guitarra:170,robot:170,trenJuguete:170,muneca:160,cometa:170,xilofono:170,bloques:150,peluche:160,pelotaPlaya:130,columpio:240};
const homeItems=()=>Object.keys(S.home).filter(id=>S.owned[id]).map(id=>({id,x:S.home[id].x,y:S.home[id].y,s:HSIZE[id]||160}));
function homeAction(id,x,y){SFX.pop();sparkles(x,y,8);
  const A={piano:()=>playTune(TUNES.colores,180),xilofono:()=>playTune(TUNES.meses,220),guitarra:()=>[0,4,7,12].forEach((n,i)=>tone(NOTE(55+n),.5,'triangle',.18,0,i*.06)),trenJuguete:()=>playSound('tren'),
    reloj:()=>{tone(1200,.05,'square',.1);tone(900,.05,'square',.1,0,.5)},robot:()=>[0,1,2].forEach(i=>tone(600+i*200,.1,'square',.1,0,i*.12)),casitaPerro:()=>playSound('perro'),hamster:()=>tone(2400,.08,'sine',.15),
    fuente:()=>SFX.splash(),pecera:()=>SFX.drip(),cometa:()=>SFX.whoosh(),pelotaPlaya:()=>SFX.boing(),bloques:()=>SFX.snap(),telescopio:()=>SFX.sparkle(),lampara:()=>{homeLight=!homeLight}};
  (A[id]||(()=>{}))();say(cap(W_(id))+'.')}
let homeLight=true;
SCENES.casaTito={music:'casita',
  enter(o){this.drag=null;this.jump=-9;this.petJump=-9;const nv=o.nuevo&&SHOP.find(i=>i.id===o.nuevo);this.nuevo=nv&&S.owned[nv.id]?nv:null;this.t0=T;const n=homeItems().length;
    if(this.nuevo){const it=this.nuevo;if(it.slot)this.jump=T+.3;later(300,()=>{SFX.sparkle();say('¡Acá está '+itemName(it)+'! '+(it.slot?'¡Mirá qué lindo me queda!':V(['Podés cambiar las cosas de lugar arrastrándolas.','Puedes cambiar las cosas de lugar arrastrándolas.'])))});return}
    later(300,()=>say(n?V(['¡Esta es mi casa! Podés mover las cosas arrastrándolas, y tocarlas para jugar.','¡Esta es mi casa! Puedes mover las cosas arrastrándolas, y tocarlas para jugar.']):V(['¡Esta es mi casa! Está vacía. En la tienda podés comprar cosas con tus monedas.','¡Esta es mi casa! Está vacía. En la tienda puedes comprar cosas con tus monedas.'])))},
  wardrobe(){const L=SHOP.filter(i=>i.slot&&S.owned[i.id]);return L.map((it,i)=>({it,x:470+i*100,y:845}))},
  prompt(){say(homeItems().length?'Arrastrá las cosas para acomodar la casa. Abajo está mi ropa: tocala para ponérmela.':'Tocá el carrito para ir a la tienda.')},
  hint(){return homeItems().length?null:{x:1240,y:70,r:60}},
  dwell(id){if(id.startsWith('h:'))say(cap(W_(id.slice(2)))+'.')},
  draw(){sky('#FFEFD9','#FFE6C6');ctx.fillStyle='rgba(255,201,60,.12)';for(let x=0;x<W;x+=80)ctx.fillRect(x,0,40,600);
    card(1200,130,300,230,homeLight?'#BFEAF7':'#2E3F7A',8,16);if(homeLight)pic('sol',1300,200,90);else pic('luna',1300,200,80);ctx.beginPath();ctx.moveTo(1350,130);ctx.lineTo(1350,360);ctx.moveTo(1200,245);ctx.lineTo(1500,245);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke();
    floor(600,'#E2B98A');ctx.strokeStyle='rgba(74,52,40,.15)';ctx.lineWidth=4;for(let y=640;y<900;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}card(-10,588,W+20,24,'#C98A4B',5,6);
    if(!homeLight){ctx.fillStyle='rgba(30,30,70,.25)';ctx.fillRect(0,0,W,H)}
    const hl=houseLevel();if(hl>=1)for(let i=0;i<20;i++)flower(40+i*80,592,12,FLC[i%7],2.5);if(hl>=3)bunting(16,14);
    if(hl>=4){ctx.save();ctx.beginPath();ctx.rect(1200,130,300,230);ctx.clip();['#FF6B5E','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9'].forEach((c,i)=>{ctx.beginPath();ctx.arc(1350,400,200-i*14,PI,0);ctx.lineWidth=14;ctx.strokeStyle=c;ctx.stroke()});ctx.restore()}
    card(170,44,560,100,'#fff',6,50);titoHouseIc(230,94,80);text('La casa de Tito',490,112,50,K,{w:600});
    {const s=hv('lvl',hR(885,94,250,92));ctx.save();ctx.translate(885,94);ctx.scale(s,s);card(-125,-46,250,92,'#fff',6,46);for(let i=0;i<4;i++)star(-84+i*56,0,24,i<hl?'#FFC93C':'#EADFCF',4);ctx.restore()}
    {const s=hv('btn:tienda',hC(1240,70,52));ctx.save();ctx.translate(1240,70);ctx.scale(s,s);circ(0,0,50,'#fff',6);pic('tienda',0,0,84);ctx.restore()}
    const nv=this.nuevo;if(nv&&!nv.slot&&S.home[nv.id]&&(T-this.t0)<12){const p=S.home[nv.id],hs=HSIZE[nv.id]||160;ctx.globalAlpha=.45+.2*Math.sin(T*5);circ(p.x,p.y-hs*.4,hs*.62,'#FFE08A',0);ctx.globalAlpha=1}
    const its=homeItems().sort((a,b)=>(a.id==='alfombra'?-1:b.id==='alfombra'?1:0)||(WALLITEMS.includes(a.id)?-1:WALLITEMS.includes(b.id)?1:0)||a.y-b.y);
    for(const o of its){const dr=this.drag&&this.drag.id===o.id,ox=o.id==='hamster'&&!dr?Math.sin(T*.9)*110:0,b=o.id==='hamster'?Math.abs(Math.sin(T*8))*-6:0,s=dr?1.08:hv('h:'+o.id,hC(o.x,o.y-o.s*.2,o.s*.45));
      ctx.save();ctx.translate(o.x+ox,o.y+b);ctx.scale(s,s);if(o.id==='lampara'&&homeLight){ctx.globalAlpha=.25+.05*Math.sin(T*3);circ(0,-o.s*.3,o.s*.5,'#FFE08A',0);ctx.globalAlpha=1}
      if(o.id==='hamster'&&Math.cos(T*.9)<0)ctx.scale(-1,1);pic(o.id,0,-o.s*.42,o.s);if(o.id==='casitaPerro')pic('perro',o.s*.62,-o.s*.22+Math.abs(Math.sin(T*3))*-6,o.s*.55);ctx.restore()}
    if(nv&&!nv.slot&&S.home[nv.id]&&(T-this.t0)<12){const p=S.home[nv.id],hs=HSIZE[nv.id]||160;arrowAt(p.x,p.y-hs*.9-30)}
    const tb=this.jump>0&&T>this.jump?Math.max(0,1-(T-this.jump)*2)*Math.abs(Math.sin((T-this.jump)*10))*-60:0;drawTito(250,330+tb,380);
    if(nv&&nv.slot&&(T-this.t0)<6&&Math.random()<.15)sparkles(440+rnd(-120,120),420+rnd(-80,80),2);
    drawPet(190,872,150,{jump:this.petJump});
    const wd=this.wardrobe();if(wd.length){card(400,795,Math.min(1080,wd.length*100+40),100,'rgba(255,255,255,.8)',5,50);for(const w of wd){const on=isWorn(w.it),s=hv('w:'+w.it.id,hC(w.x,w.y,44));ctx.save();ctx.translate(w.x,w.y);ctx.scale(s,s);circ(0,0,42,on?'#FFF3B0':'#fff',on?7:4,on?'#FFC93C':K);drawItemPic(w.it,0,0,72);ctx.restore()}}
    drawHome();drawCoinHUD()},
  itemAt(x,y){return homeItems().sort((a,b)=>b.y-a.y).find(o=>{const ox=o.id==='hamster'?Math.sin(T*.9)*110:0;return Math.abs(x-o.x-ox)<o.s*.45&&y<o.y+10&&y>o.y-o.s*.85})},
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}
    if(dist(x,y,1240,70)<56){SFX.pop();go('tienda');return}
    if(inCoinHUD(x,y)){say('Tenés '+S.coins+' monedas.');return}
    if(dist(x,y,190,790)<85){this.petJump=T;SFX.boing();const ps=petStage(),f=ps<4?PET_NEXT[ps]-STARS():0;say(ps===0?'Es el huevo de Pipo. Le '+(f===1?'falta un juego':'faltan '+f+' juegos')+' para abrirse.':ps<4?pick(['¡Pipo te quiere mucho!','Pipo dice: ¡grrr! Así saludan los dinosaurios.','¡Pipo crece cuando jugás! Le '+(f===1?'falta un juego':'faltan '+f+' juegos')+' para crecer.']):'¡Pipo es el dinosaurio más grande del mundo!');return}
    if(inR(x,y,885,94,250,92)){SFX.pop();const hl=houseLevel(),f=hl<4?HOUSE_NEXT[hl]-temasDone():0;say(hl<4?'La casa de Tito crece cuando terminás casitas. '+(f===1?'Falta una':'Faltan '+f)+' para que crezca.':'¡La casa de Tito ya es un castillo!');return}
    if(inR(x,y,440,500,380,330)){this.jump=T;SFX.boing();say(pick(['¡Me encanta mi casa!','¡Gracias por jugar conmigo!','¡Qué lindo día!',V(['¿Viste mi ropa nueva?','¿Has visto mi ropa nueva?'])]));return}
    const w=this.wardrobe().find(w=>dist(x,y,w.x,w.y)<46);if(w){const it=w.it,on=it.slot==='shell'||it.slot==='scarf'?true:!isWorn(it);wear(it,on);SFX.pop();this.jump=T;say(on?'¡Me puse '+itemName(it)+'!':V(['Me saqué ','Me quité '])+itemName(it)+'.');return}
    const o=this.itemAt(x,y);if(o){this.drag={id:o.id,dx:x-o.x,dy:y-o.y,sx:x,sy:y,moved:false};drag={it:o,home:1};setCursor('grab');return}
    SFX.tap();sparkles(x,y,3)},
  move(x,y){const d=this.drag;if(!d)return;if(Math.abs(x-d.sx)+Math.abs(y-d.sy)>12)d.moved=true;if(d.moved){const p=S.home[d.id];p.x=clamp(x-d.dx,300,1500);p.y=clamp(y-d.dy,WALLITEMS.includes(d.id)?300:420,780)}},
  up(x,y){const d=this.drag;if(!d)return;this.drag=null;drag=null;setCursor('pt');save();if(!d.moved){const p=S.home[d.id];homeAction(d.id,p.x,p.y-80)}else SFX.snap()}
};
{const d0=SCENES.juego.draw;SCENES.juego.draw=function(){d0.call(this);drawCoinHUD()}}
