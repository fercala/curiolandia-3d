/* ================= NÚCLEO DE CURIOLANDIA ================= */
const W=1600,H=900, LF='Andika, Fredoka, "Trebuchet MS", sans-serif', DF='Fredoka, "Baloo 2", system-ui, sans-serif';
const cv=document.getElementById('cv'); let ctx=cv.getContext('2d');
let SC=1,OX=0,OY=0,DPR=1;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  const w=innerWidth,h=innerHeight; cv.width=Math.round(w*DPR); cv.height=Math.round(h*DPR);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  SC=Math.min(w/W,h/H); OX=(w-W*SC)/2; OY=(h-H*SC)/2;
}
addEventListener('resize',resize); resize();
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const easeOut=t=>1-Math.pow(1-t,3), back=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const PI=Math.PI;
function hex2(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
const _cc={};
function col(c,s){ // mezcla un color hacia su gris (s=1 color pleno, 0 gris)
  if(s>=.999)return c; const k=c+'|'+s.toFixed(2); if(_cc[k])return _cc[k];
  const [r,g,b]=hex2(c), l=r*.3+g*.59+b*.11, m=v=>Math.round(clamp(l*.85+40+(v-(l*.85+40))*s,0,255));
  return _cc[k]=`rgb(${m(r)},${m(g)},${m(b)})`;
}

/* ---------- guardado ---------- */
const KEY='curiolandia.v1';
const DEF={age:0,name:'',variant:'',hemi:'N',vol:{voz:1,mus:.45,fx:.8},limit:0,temas:{},stats:{},days:{},asam:{},stk:{},album:[],intro:false,first:{},seenFl:0};
let S=JSON.parse(JSON.stringify(DEF));
(function load(){
  let d=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(d){S=Object.assign(S,d,{vol:Object.assign({},DEF.vol,d.vol||{})});return}
  // primera vez: si Letrilandia ya se jugó en este dispositivo, traemos nombre, edad, acento y volúmenes
  try{const l=JSON.parse(localStorage.getItem('letrilandia.v1')||'null');
    if(l){if(l.name)S.name=l.name;if(l.age)S.age=l.age;if(l.accent)S.variant=l.accent==='es'?'es':'ar';if(l.vol)S.vol=Object.assign({},DEF.vol,l.vol);S.first.fromLetri=1}}catch(e){}
})();
if(!S.variant)S.variant='ar';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>ymd(new Date());
function rec(k,ok){const s=S.stats[k]||(S.stats[k]={ok:0,err:0});ok?s.ok++:s.err++;save()}
const AGE=()=>S.age||3;

/* ---------- variante del español: el texto se escribe en rioplatense y se adapta ---------- */
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
const _tuRe=TU.map(([a,b])=>[new RegExp('(^|[^\\p{L}])('+a+')(?=[^\\p{L}]|$)','giu'),b]);
function tx(s){
  if(S.variant!=='es'||!s)return s;
  for(const [re,b] of _tuRe)s=s.replace(re,(m,p,w)=>p+(w[0]!==w[0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b));
  return s;
}
const V=x=>Array.isArray(x)?(S.variant==='es'?x[1]:x[0]):tx(x);

/* ---------- imágenes SVG ---------- */
const IMG={},IMGG={};
function svgImg(inner,vb,px){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${px}" height="${Math.round(px*(+vb.split(' ')[3])/(+vb.split(' ')[2]))}">${inner}</svg>`);return i}
for(const k in PICS) IMG[k]=svgImg(PICS[k],'-62 -62 124 124',320);
IMG.tito=svgImg(TITO_SVG,'0 0 240 200',480);IMG.erizo=svgImg(ERIZO_SVG,'0 0 240 200',480);IMG.tortuga=svgImg(TORTUGA_SVG,'0 0 240 200',480);IMG.conejo=svgImg(CONEJO_SVG,'0 0 240 200',480); IMG.lupi=svgImg(LUPI_SVG,'0 0 200 230',420); IMG.glasses=svgImg(GLASSES_SVG,'0 0 200 230',420); IMG.hand=svgImg(HAND_SVG,'0 0 80 110',160);
function greyOf(k){if(!IMGG[k]&&PICS[k])IMGG[k]=svgImg(PICS[k].replace(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g,(m,a,c)=>c.toUpperCase()===K.toUpperCase()?m:(a==='fill'?'fill="#FBF8F2"':'stroke="#D8D0C4"')),'-62 -62 124 124',320);return IMGG[k]}
function pic(n,x,y,s,a=1){const i=IMG[n]; if(!i||!i.complete)return; ctx.globalAlpha*=a; ctx.drawImage(i,x-s/2,y-s/2,s,s); ctx.globalAlpha/=a}
function picG(n,x,y,s){const i=greyOf(n); if(!i||!i.complete)return; ctx.drawImage(i,x-s/2,y-s/2,s,s)}

/* ---------- nombres de los dibujos (rioplatense; tx() los pasa a España) ---------- */
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
const W_=k=>LEX2[k]?V(LEX2[k]):tx(LEX[k]||k);              // con artículo
const Wn=k=>W_(k).replace(/^(el|la|los|las) /,'');           // sin artículo
const art=k=>{const m=W_(k).match(/^(el|la|los|las) /);return m?m[1]:''};
const dela=k=>{const a=art(k);return a==='el'?'del '+Wn(k):(a?'de '+W_(k):'de '+W_(k))};
const ala=k=>{const a=art(k);return a==='el'?'al '+Wn(k):'a '+W_(k)};

/* ---------- dibujo básico ---------- */
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function fillStroke(f,lw=6,s=K){if(f){ctx.fillStyle=f;ctx.fill()} if(lw){ctx.lineWidth=lw;ctx.strokeStyle=s;ctx.lineJoin='round';ctx.stroke()}}
function card(x,y,w,h,f='#fff',lw=6,r=36,s=K){rr(x,y,w,h,r);fillStroke(f,lw,s)}
function circ(x,y,r,f,lw=6,s=K){ctx.beginPath();ctx.arc(x,y,r,0,PI*2);fillStroke(f,lw,s)}
function ell(x,y,rx,ry,f,lw=6,s=K){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);fillStroke(f,lw,s)}
function text(t,x,y,size,color=K,o={}){
  ctx.font=`${o.w||700} ${size}px ${o.f||DF}`; ctx.textAlign=o.al||'center'; ctx.textBaseline=o.bl||'alphabetic';
  if(o.st){ctx.lineJoin='round';ctx.lineWidth=o.st;ctx.strokeStyle=o.sc||K;ctx.strokeText(t,x,y)}
  ctx.fillStyle=color; ctx.fillText(t,x,y);
}
function star(x,y,r,f,lw){ctx.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,q=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}ctx.closePath();fillStroke(f,lw??r*.13)}
function hand(x,y,w,rot=-.2){const i=IMG.hand;if(!i.complete)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(i,-w*.47,0,w,w*1.37);ctx.restore()}
function speaker(x,y,s,c=K){ctx.save();ctx.translate(x,y);ctx.scale(s/60,s/60);ctx.beginPath();ctx.moveTo(-24,-8);ctx.lineTo(-12,-8);ctx.lineTo(4,-21);ctx.lineTo(4,21);ctx.lineTo(-12,8);ctx.lineTo(-24,8);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle=c;ctx.lineCap='round';ctx.beginPath();ctx.arc(6,0,12,-.9,.9);ctx.stroke();ctx.beginPath();ctx.arc(6,0,22,-.9,.9);ctx.stroke();ctx.restore()}
function sky(top,bot){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function cloud(x,y,s,c='#fff'){ctx.fillStyle=c;for(const [a,b,r] of [[0,0,40],[40,-18,46],[86,0,38],[44,12,40]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,PI*2);ctx.fill()}}
function flower(x,y,r,c,lw=3){for(let i=0;i<5;i++){const a=i*PI*2/5+T*.0;circ(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.5,c,lw)}circ(x,y,r*.42,'#FFD66B',lw)}

/* ---------- puntero: ratón grande, pasar por encima ---------- */
let MX=-9,MY=-9,mouseOn=false,hovNow=null,hovPrev=null,hovT=0,dwellDone=false;
const hR=(x,y,w,h)=>mouseOn&&!drag&&Math.abs(MX-x)<w/2&&Math.abs(MY-y)<h/2;
const hC=(x,y,r)=>mouseOn&&!drag&&dist(MX,MY,x,y)<r;
function hv(id,hit){if(hit){hovNow=id;return 1.07}return 1}
let CUR={},curMode='';
(function makeCursors(){
  const mk=(draw,hx,hy)=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');draw(g);return `url(${c.toDataURL()}) ${hx} ${hy}, pointer`};
  const pt=g=>{g.lineJoin='round';g.lineCap='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#fff';
    g.beginPath();g.moveTo(15,3);g.quadraticCurveTo(21,0,22,7);g.lineTo(22,20);g.lineTo(34,20);g.quadraticCurveTo(43,21,43,30);g.lineTo(42,36);g.quadraticCurveTo(40,45,30,45);g.lineTo(18,45);g.quadraticCurveTo(8,44,7,34);g.lineTo(7,26);g.quadraticCurveTo(7,22,11,22);g.lineTo(11,7);g.quadraticCurveTo(11,2,15,3);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(28,21);g.lineTo(28,29);g.moveTo(35,22);g.lineTo(35,30);g.stroke()};
  const fist=g=>{g.lineJoin='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#FFE08A';
    g.beginPath();g.moveTo(8,18);g.quadraticCurveTo(8,10,16,10);g.lineTo(36,10);g.quadraticCurveTo(44,10,44,20);g.lineTo(44,32);g.quadraticCurveTo(44,44,30,44);g.lineTo(18,44);g.quadraticCurveTo(8,44,8,32);g.closePath();g.fill();g.stroke();
    g.beginPath();for(const x of[17,26,35]){g.moveTo(x,10);g.lineTo(x,22)}g.stroke()};
  try{CUR.pt=mk(pt,15,3);CUR.grab=mk(fist,24,24)}catch(e){CUR.pt='pointer';CUR.grab='grabbing'}
})();
function setCursor(m){if(m!==curMode){curMode=m;cv.style.cursor=CUR[m]||'pointer'}}
setCursor('pt');

/* ---------- Tito ---------- */
const TITO={x:14,y:700,w:226};
const temasDone=()=>Object.values(S.temas).filter(t=>t&&t.done).length;
const FLPOS=[[-2.4,58],[-1.9,60],[-1.4,62],[-.9,61],[-.4,60],[-2.9,56],[2.6,52],[-2.15,38],[-1.6,40],[-1.05,40],[-.5,38],[-2.65,36],[2.9,40],[-1.9,22],[-1.2,22]];
const FLC=['#FF8A7A','#F58BB4','#FFC93C','#9B8AD9','#7FD3F0','#FF6B5E','#FFA94D'];
// personaje de Tito (zona de adultos): 'caracol' (por defecto), 'erizo', 'tortuga' o 'conejo'; ojos [x,y,r], boca y centro de las flores en el dibujo 2D de 240x200
const titoKind=()=>{const k=S.tito&&S.tito.kind;return k==='erizo'||k==='tortuga'||k==='conejo'?k:'caracol'};
const TITO_EYES={caracol:[[174,20,15],[222,20,15]],erizo:[[184,94,13],[210,92,12]],tortuga:[[196,88,11],[220,86,10]],conejo:[[186,94,12],[210,90,11]]},TITO_2D={caracol:{skin:'#9BD86A',mouth:[206,116],fl:[96,100,1]},erizo:{skin:'#F2D6B0',mouth:[216,124],fl:[98,118,.82]},tortuga:{skin:'#8FD07A',mouth:[216,110],fl:[100,116,.95]},conejo:{skin:'#EDE3D6',mouth:[220,122],fl:[69,142,.5]}};
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
const inTito=(x,y)=>x>TITO.x&&x<TITO.x+TITO.w&&y>TITO.y-40&&y<TITO.y+TITO.w*.85;

/* ---------- audio ---------- */
let AC=null,FX=null,MUS=null;
let SPK_OK=false;
function initAudio(){
  if('speechSynthesis' in window){try{if(!SPK_OK){SPK_OK=true;const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);pickVoice()}else if(speechSynthesis.paused)speechSynthesis.resume()}catch(e){}}
  if(AC){if(AC.state!=='running')AC.resume();return}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();FX=AC.createGain();MUS=AC.createGain();FX.connect(AC.destination);MUS.connect(AC.destination);setVol()}catch(e){AC=null}
}
function setVol(){if(!AC)return;FX.gain.value=S.vol.fx*.6;MUS.gain.value=S.vol.mus*.22}
function tone(f,d=.15,type='sine',v=.5,slide=0,delay=0,bus){
  if(!AC)return; const t=AC.currentTime+delay, o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g); g.connect(bus||FX); o.start(t); o.stop(t+d+.05);
}
function noise(d=.2,v=.3,f=1200,delay=0,q=1){
  if(!AC)return; const t=AC.currentTime+delay, n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), da=b.getChannelData(0);
  for(let i=0;i<n;i++)da[i]=Math.random()*2-1; const s=AC.createBufferSource(); s.buffer=b;
  const fl=AC.createBiquadFilter(); fl.type='bandpass'; fl.frequency.value=f; fl.Q.value=q; const g=AC.createGain();
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl); fl.connect(g); g.connect(FX); s.start(t);
}
// voz sintetizada para animales y vehículos: o={f,f2,d,type,v,vib,vibA,lp,delay,att}
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
const ONO={vaca:'¡Muuu!',oveja:'¡Beee!',cerdo:'¡Oinc, oinc!',gallina:'¡Clo, clo, clo!',caballo:'¡Iiiiii!',pato:'¡Cuac, cuac!',perro:'¡Guau, guau!',gato:'¡Miau!',pollito:'¡Pío, pío!',pajaro:'¡Pío, pío, pío!',
 abeja:'¡Bzzz!',auto:'¡Bip, bip!',autobus:'¡Mooc, mooc!',tren:'¡Chu, chu!',avion:'¡Fiuuum!',barco:'¡Buuuu!',bici:'¡Rin, rin!',moto:'¡Brum, brum!',rana:'¡Croac!',leon:'¡Grrr!',elefante:'¡Prrrr!',mono:'¡U, u, a, a!'};
function playSound(k){if(SOUNDS[k])try{SOUNDS[k]()}catch(e){}}

/* música suave generativa */
const MUSIC={
  title:{s:[0,2,4,7,9],b:64,sp:.5},map:{s:[0,2,4,7,9],b:60,sp:.5},plaza:{s:[0,4,5,7,9],b:62,sp:.46},jardin:{s:[0,2,4,7,9],b:65,sp:.44},
  casita:{s:[0,2,4,5,7,9],b:62,sp:.48},game:{s:[0,2,4,5,7,9],b:60,sp:.48},book:{s:[0,3,5,7,10],b:57,sp:.6}
};
let musKey=null,musNext=0,musStep=0;
function musicTick(){
  if(!AC||!musKey||S.vol.mus<=0)return; const m=MUSIC[musKey]; if(!m)return;
  while(musNext<AC.currentTime+.3){
    if(musNext<AC.currentTime)musNext=AC.currentTime+.05;
    const d=musNext-AC.currentTime, st=musStep%16;
    const deg=m.s[(st*3+((musStep/16|0)%4)*2)%m.s.length]+(st%8===4?12:0);
    if(st%2===0||Math.random()<.35) tone(440*Math.pow(2,(m.b+deg-69)/12),m.sp*1.6,'triangle',.25,0,d,MUS);
    if(st%8===0) tone(440*Math.pow(2,(m.b-12+m.s[(musStep/8|0)%3]-69)/12),m.sp*6,'sine',.3,0,d,MUS);
    musNext+=m.sp; musStep++;
  }
}
/* ---------- voz ---------- */
let VOICE=null,VOICE_EN=null,talking=false,sayTok=0;
function pickVoice(){
  if(!('speechSynthesis' in window))return; const all=speechSynthesis.getVoices(),en=all.filter(v=>/^en/i.test(v.lang));
  if(en.length){const pe=S.variant==='es'?['en-GB','en-IE','en-US','en-AU']:['en-US','en-GB','en-CA','en-AU'],Le=v=>v.lang.replace('_','-').toLowerCase();VOICE_EN=null;
    for(const p of pe){const c=en.filter(v=>Le(v)===p.toLowerCase());if(c.length){VOICE_EN=c.find(v=>/google|natural|premium|enhanced/i.test(v.name))||c[0];break}}if(!VOICE_EN)VOICE_EN=en[0]}
  const vs=all.filter(v=>/^es/i.test(v.lang)); if(!vs.length)return;
  const pref=S.variant==='es'?['es-ES','es-MX','es-US','es-419','es-AR']:['es-AR','es-UY','es-US','es-419','es-MX','es-CO','es-ES'];
  const L=v=>v.lang.replace('_','-');
  for(const p of pref){const c=vs.filter(v=>L(v).toLowerCase()===p.toLowerCase()); if(c.length){VOICE=c.find(v=>/google|natural|premium|enhanced/i.test(v.name))||c[0];return}}
  VOICE=vs[0];
}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
/* ---------- voces grabadas: solo en la web (carpeta voz/ con manifest.json); si una frase no tiene audio, habla el navegador ---------- */
const vozN=t=>t.replace(/\s+/g,' ').trim(),vozK=t=>vozN(t).replace(/[.\s]+$/,'').toLowerCase();
// S.voz: '' = la voz grabada de siempre (voz/), 'fer' = la voz de Fer (voz-fer/, mismos nombres de archivo)
let VOZ=null,VOZ_DIR='voz/',VOZ_EL=null,VOZ_FIN=null;const VOZ_RATE=.9,VOZ_BL={};
function vozLoad(cb){const dir=S.voz==='fer'?'voz-fer/':'voz/';VOZ=null;VOZ_DIR=dir;
  try{if(/^https?:/.test(location.protocol))fetch(dir+'manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(VOZ_DIR!==dir)return;if(m&&m.f){const v={};for(const k in m.f)v[vozK(k)]=m.f[k];VOZ=v}cb&&cb()}).catch(()=>{cb&&cb()})}catch(e){}}
vozLoad();
// devuelve la lista de audios: la frase entera o, si no está, cada oración por separado ("¡Muy bien!" + "La pelota.")
function vozFile(t){if(!VOZ)return null;t=vozN(S.name?t.split(', '+S.name).join(''):t);const one=VOZ[vozK(t)];if(one)return [one];
  const parts=(t.match(/[^.!?…]+[.!?…]*/g)||[]).map(vozK).filter(Boolean);if(parts.length<2)return null;const fs=parts.map(k=>VOZ[k]);return fs.every(Boolean)?fs:null}
// como speechSynthesis.cancel(): cortar una frase también la da por terminada
function vozStop(){const f=VOZ_FIN;VOZ_FIN=null;if(VOZ_EL){VOZ_EL.onended=VOZ_EL.onerror=null;try{VOZ_EL.pause()}catch(e){}}f&&f()}
if('speechSynthesis' in window){try{const c0=speechSynthesis.cancel.bind(speechSynthesis);speechSynthesis.cancel=()=>{vozStop();c0()}}catch(e){}}
function vozPlay(fs,tok,fin,fail){
  const a=VOZ_EL||(VOZ_EL=new Audio()),get=f=>{f=VOZ_DIR+f;// se guarda la promesa: la precarga y el primer paso piden el mismo archivo una sola vez
    return VOZ_BL[f]||(VOZ_BL[f]=fetch(f).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>URL.createObjectURL(b)).catch(e=>{delete VOZ_BL[f];throw e}))};
  const step=n=>{if(n>=fs.length){VOZ_FIN=null;fin();return}get(fs[n]).then(u=>{if(tok!==sayTok)return;if(n===0)vozStop();a.src=u;a.playbackRate=VOZ_RATE;a.preservesPitch=true;a.volume=Math.min(1,S.vol.voz);VOZ_FIN=fin;
    a.onended=()=>step(n+1);a.onerror=()=>{VOZ_FIN=null;fail()};const p=a.play();if(p)p.catch(()=>{VOZ_FIN=null;fail()})}).catch(()=>{VOZ_FIN=null;fail()})};
  Promise.all(fs.map(get)).catch(()=>{});step(0);
}
function say(t,cb,o={}){
  if(!o.en)t=tx(t);
  const tok=++sayTok, my=sceneTok; let done=false;
  const fin=()=>{if(done)return;done=true;if(tok===sayTok)talking=false;if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.22,AC.currentTime,.2);if(cb&&my===sceneTok)cb()};
  const est=900+t.length*85/(o.rate||1);
  if(window.__fast){if(window.__said)window.__said.push(t);talking=true;setTimeout(fin,30);return}
  const vf=!o.en&&S.vol.voz>0&&vozFile(t);
  if(!vf&&(!('speechSynthesis' in window)||S.vol.voz<=0)){talking=true;setTimeout(fin,Math.min(est,2500));return}
  try{speechSynthesis.cancel()}catch(e){}
  if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.07,AC.currentTime,.1);
  talking=true;
  const speak=()=>{ if(tok!==sayTok||!('speechSynthesis' in window))return;
    const u=new SpeechSynthesisUtterance(t),vv=o.en?VOICE_EN:VOICE; if(vv){u.voice=vv;u.lang=vv.lang}else u.lang=o.en?(S.variant==='es'?'en-GB':'en-US'):S.variant==='es'?'es-ES':'es-AR';
    u.rate=o.rate||.9; u.pitch=o.pitch||1.1; u.volume=S.vol.voz; u.onend=fin; u.onerror=fin;
    speechSynthesis.speak(u);
  };
  if(vf){vozPlay(vf,tok,fin,()=>{if(tok===sayTok&&!done)speak()});setTimeout(fin,est/VOZ_RATE+4000);return}
  setTimeout(speak,60);
  setTimeout(fin,est+1500);
}
const kid=()=>S.name?(', '+S.name):'';
const PRAISE=['¡Muy bien!','¡Genial!','¡Bravo!','¡Excelente!','¡Eso es!','¡Qué bien!','¡Súper!','¡Lo encontraste!'];
const praise=()=>{const p=pick(PRAISE);return S.name&&Math.random()<.5?p.slice(0,-1)+', '+S.name+'!':p};
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;

/* ---------- escenas, temporizadores, partículas ---------- */
let scene=null,sceneName='',sceneTok=0,T=0,fade=0,timers=[],parts=[],idle=0,hintSaid=false,drag=null,sceneArg={};
function later(ms,fn){timers.push({t:ms/1000,fn,tok:sceneTok})}
function go(n,o={}){
  sceneTok++; timers=[]; parts=[]; idle=0; hintSaid=false; drag=null; setCursor('pt');
  try{speechSynthesis.cancel()}catch(e){} talking=false;
  sceneName=n; sceneArg=o; scene=SCENES[n]; fade=1; musKey=scene.music||null; scene.enter&&scene.enter(o);
}
function burst(x,y,n=24,cols=['#FFC93C','#F58BB4','#7CC86E','#5B8DEF','#FF8A7A','#9B8AD9']){
  for(let i=0;i<n;i++){const a=rnd(0,PI*2),v=rnd(200,620);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,life:rnd(.8,1.5),t:0,c:pick(cols),r:rnd(7,15),rot:rnd(0,6),k:Math.random()<.35?'s':'c'})}
}
function heart(x,y,r,f){/* corazoncito para las partículas */ctx.beginPath();ctx.moveTo(x,y+r*.9);ctx.bezierCurveTo(x-r*1.4,y,x-r*.7,y-r*1.1,x,y-r*.35);ctx.bezierCurveTo(x+r*.7,y-r*1.1,x+r*1.4,y,x,y+r*.9);ctx.fillStyle=f;ctx.fill()}
function sparkles(x,y,n=6){for(let i=0;i<n;i++)parts.push({x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-80,80),vy:rnd(-160,-40),life:rnd(.4,.8),t:0,c:pick(['#FFC93C','#FFF3B0','#F58BB4']),r:rnd(6,11),rot:0,k:'s',g:0})}
function drawParts(dt){
  for(const p of parts){p.t+=dt;p.vy+=(p.g??900)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*6;
    const a=1-p.t/p.life; if(a<=0)continue; ctx.globalAlpha=a;
    if(p.k==='s')star(p.x,p.y,p.r,p.c,0); else if(p.k==='d'){circ(p.x,p.y,p.r,p.c,0)} else if(p.k==='h'){heart(p.x,p.y,p.r,p.c)} else if(p.k==='o'){const q=1+p.t/p.life*2;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*q,p.r*.42*q,0,0,PI*2);ctx.lineWidth=3;ctx.strokeStyle=p.c;ctx.stroke()} else if(p.k==='n'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(p.rot*.5)*.3);ctx.lineWidth=3;ctx.strokeStyle='#FFFFFF';ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(0,0,p.r*.55,p.r*.4,-.4,0,PI*2);ctx.stroke();ctx.fill();ctx.fillRect(p.r*.38,-p.r*1.7,p.r*.18,p.r*1.7);ctx.beginPath();ctx.moveTo(p.r*.56,-p.r*1.7);ctx.quadraticCurveTo(p.r*1.2,-p.r*1.3,p.r*.95,-p.r*.8);ctx.lineWidth=p.r*.16;ctx.strokeStyle=p.c;ctx.stroke();ctx.restore()} else if(p.k==='t'){/* un número que sube flotando al contar, y entra con un saltito */const q=Math.min(1,p.t/.18),sc=.5+.5*q+Math.sin(q*PI)*.25;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);ctx.font=`800 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=7;ctx.lineJoin='round';ctx.strokeStyle='#FFFFFF';ctx.strokeText(p.tx,0,0);ctx.fillStyle=p.c;if(p.hl){/* la primera letra de la palabra, en rojo, como en Letrilandia */const W=ctx.measureText(p.tx).width,w1=ctx.measureText(p.tx[0]).width;ctx.textAlign='left';ctx.fillText(p.tx.slice(1),-W/2+w1,0);ctx.fillStyle='#E84A4A';ctx.fillText(p.tx[0],-W/2,0)}else ctx.fillText(p.tx,0,0);if(p.dots){/* debajo del número, tantos puntitos como dice, para verlo de un vistazo */const n=p.dots,r1=n>5?2:1,per=Math.ceil(n/r1);for(let i=0;i<n;i++){const row=Math.floor(i/per),col=i%per,cn=row?n-per:per;ctx.beginPath();ctx.arc((col-(cn-1)/2)*22,24+row*22,8,0,PI*2);ctx.fillStyle=p.c;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()}}ctx.restore()} else if(p.k==='z'){ctx.font=`700 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#5F6FB4';ctx.strokeText('z',p.x,p.y);ctx.fillStyle=p.c;ctx.fillText('z',p.x,p.y)} else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore()}
  } ctx.globalAlpha=1; parts=parts.filter(p=>p.t<p.life);
}
/* ---------- HUD ---------- */
const HOME={x:80,y:80,r:52};
function drawHome(){const s=hv('home',hC(HOME.x,HOME.y,HOME.r+10));ctx.save();ctx.translate(HOME.x,HOME.y);ctx.scale(s,s);ctx.translate(-HOME.x,-HOME.y);circ(HOME.x,HOME.y,HOME.r,'#fff',6);ctx.beginPath();ctx.moveTo(52,86);ctx.lineTo(80,60);ctx.lineTo(108,86);ctx.lineTo(108,108);ctx.lineTo(52,108);ctx.closePath();fillStroke('#FF8A7A',5);ctx.fillStyle=K;ctx.fillRect(72,90,16,18);ctx.restore()}
const atHome=(x,y)=>dist(x,y,HOME.x,HOME.y)<72;
function drawRounds(done,of,y=80){
  const w=of*66+30, x=1560-w; card(x,y-44,w,88,'#fff',6,44);
  for(let i=0;i<of;i++){const sc=i===done-1&&scene.starPop?1+.4*Math.max(0,1-(T-scene.starPop)*3):1;star(x+48+i*66,y,25*sc,i<done?'#FFC93C':'#EADFCF',3.5)}
}
let lockHold=0,lockDown=false;
function drawLock(){
  const x=1546,y=852; ctx.globalAlpha=.45; ctx.fillStyle=K; rr(x-18,y-12,36,28,6); ctx.fill(); ctx.beginPath(); ctx.arc(x,y-12,11,PI,0); ctx.lineWidth=5; ctx.strokeStyle=K; ctx.stroke(); ctx.globalAlpha=1;
  if(lockDown){ctx.beginPath();ctx.arc(x,y,40,-PI/2,-PI/2+PI*2*lockHold/3);ctx.lineWidth=8;ctx.strokeStyle='#9B8AD9';ctx.stroke()}
}
/* ayuda: brillo y manito */
function drawHelp(){
  if(!scene.hint||drag)return; const h=scene.hint(); if(!h)return;
  if(idle>6){const p=(Math.sin(T*5)+1)/2;ctx.save();ctx.globalAlpha=.35+.35*p;ctx.lineWidth=12;ctx.strokeStyle='#FFC93C';ctx.beginPath();ctx.arc(h.x,h.y,(h.r||110)+10+p*12,0,PI*2);ctx.stroke();ctx.restore()}
  if(idle>11){const k=(T*1.2)%1;if(h.path&&h.path.length>1){const q=(T*.5)%1,f=q*(h.path.length-1),i=Math.floor(f),a=h.path[i],b=h.path[Math.min(h.path.length-1,i+1)];hand(lerp(a[0],b[0],f-i)+20,lerp(a[1],b[1],f-i)+14,90)}else hand(h.x+30-k*20+(h.dx||0)*k,h.y+20-k*10+(h.dy||0)*k,90);
    if(!hintSaid&&scene.prompt){hintSaid=true;scene.prompt()}}
}
/* adaptativo */
let ADAPT=0,streak=0,REP=0;
function nOpts(){return clamp(({3:2,4:3,5:3})[AGE()]+ADAPT+(REP>=1?1:0),2,4)}
function onRight(first){if(first){streak++;if(streak>=4){ADAPT=Math.min(1,ADAPT+1);streak=0}}}
function onWrongTwice(){ADAPT=Math.max(-1,ADAPT-1);streak=0}
const nRounds=()=>(AGE()<=3?4:5)+(REP>=2?1:0);
/* tiempo de juego */
let sessionT=0,restAsked=false,minuteAcc=0;

/* ---------- pegatinas ---------- */
let toast=null;
function giveSticker(k){S.stk[k]=(S.stk[k]||0)+1;save();toast={k,t:T};setTimeout(()=>SFX.sparkle(),300);return k}
function drawSticker(k,x,y,s,rot=0,grey){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.shadowColor='rgba(74,52,40,.25)';ctx.shadowBlur=s*.08;ctx.shadowOffsetY=s*.04;
  circ(0,0,s*.55,'#fff',0);ctx.shadowColor='transparent';circ(0,0,s*.55,null,3,'#EADFCF');if(grey){ctx.globalAlpha=.25;picG(k,0,0,s*.86);ctx.globalAlpha=1}else pic(k,0,0,s*.86);ctx.restore()}
function drawToast(){if(!toast)return;const k=T-toast.t;if(k>2.8){toast=null;return}
  const a=k<.3?back(k/.3):k>2.4?1-(k-2.4)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(toast.x||800,toast.y||180);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
  card(-230,-80,460,160,'#FFF6E6',6,40);drawSticker(toast.k,-140,0,130,Math.sin(T*4)*.1);text(V(['¡Figurita nueva!','¡Pegatina nueva!']),60,14,38,K);ctx.restore()}

/* ---------- calendario ---------- */
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIASL=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const DIAC=['#FF8A7A','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9','#F58BB4'];
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const ESTACIONES=['primavera','verano','otoño','invierno'];
function estacionDe(d=new Date()){
  const m=d.getMonth()+1,dd=d.getDate(),v=m*100+dd;
  let e=v>=1221||v<321?'invierno':v<621?'primavera':v<923?'verano':'otoño';
  if(S.hemi==='S')e={invierno:'verano',verano:'invierno',primavera:'otoño',otoño:'primavera'}[e];
  return e;
}
