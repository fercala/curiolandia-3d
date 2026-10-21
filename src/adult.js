/* ================= ZONA DE ADULTOS ================= */
const SKILL={'ingles-hello':'Inglés: saludos','ingles-colors':'Inglés: colores','ingles-numbers':'Inglés: números','ingles-numeros':'Inglés: contar','ingles-animals':'Inglés: animales',busca:'Reconocer palabras (¿Dónde está?)',sonidos:'Sonidos de animales y transportes',memoria:'Memoria',cuerpo:'Partes del cuerpo',contar:'Contar',colores:'Colores',puzzle:'Rompecabezas',excava:'Cavar en la arena',riega:'Regar',
  'dentro-fuera':'Dentro / fuera',vestir:'Ropa según el tiempo',transportes:'Transportes por tierra, aire y agua',tamanos:'Grande / mediano / pequeño',otono:'Otoño',frutas:'Seguir un pedido (frutas)','frio-calor':'Frío / calor',
  formas:'Formas',familia:'Familia',casa:'Las partes de la casa',armar:'Armar por partes','arriba-abajo':'Arriba / abajo',arrastra:'Clasificar arrastrando',atrapa:'Atrapar lo que se pide',
  'dia-hoy':'Asamblea: qué día es hoy','dia-manana':'Asamblea: qué día es mañana',calendario:'Asamblea: el número del día','asamblea-dianoche':'Asamblea: día o noche','asamblea-ropa':'Asamblea: ropa según el tiempo','asamblea-estacion':'Asamblea: estación del año','asamblea-siguiente':'Asamblea: qué estación viene',
  ahorro:'Ahorrar agua y luz',apaga:'Apagar lo que no se usa',arcoiris:'Colores del arcoíris',arrastra:'Clasificar arrastrando',calendario:'Asamblea: el número del día',cancion:'Canciones',ciclos:'Ciclos de vida',ciudad:'La calle y la ciudad','comer-sano':'Comer sano',comidas:'Comidas','cuerpo-dentro':'El cuerpo por dentro','derecha-izquierda':'Derecha / izquierda','dia-noche':'Día / noche','dias-finde':'Días de cole y fin de semana','dias-orden':'Ordenar los días de la semana',dinos:'Dinosaurios','domestico-salvaje':'Animales domésticos y salvajes',emociones:'Emociones',estaciones:'Estaciones del año',fiesta:'Días especiales','fiestas-orden':'Fiestas del año',frota:'Frotar y limpiar','fruta-verdura':'Frutas y verduras',habitats:'Dónde vive cada animal',lupa:'Buscar con la lupa',maleta:'Preparar la maleta','meses-orden':'Los meses del año',nacimiento:'Huevo o panza',oficios:'Oficios','origen-alimentos':'De dónde vienen los alimentos',partes:'Tocar las partes','partes-planta':'Partes de la planta',pedidos:'Seguir pedidos',reciclar:'Reciclar',rutinas:'Rutinas y hábitos',secuencia:'Ordenar lo que pasa primero y después',semaforo:'El semáforo','seres-vivos':'Seres vivos y cosas',trazos:'Trazos (antes de escribir)',une:'Unir parejas',cuentos:'Entender cuentos'};
const WX_E={sol:'☀️',nublado:'☁️',lluvia:'🌧️',viento:'💨',nieve:'❄️',tormenta:'⛈️',niebla:'🌫️'},EMO_E={alegria:'😀',tristeza:'😢',enojo:'😠',miedo:'😨',sorpresa:'😮',calma:'😌',verguenza:'😳'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function installHTML(){
  if(standalone())return '<p class="note">El juego ya está instalado en este dispositivo.</p>';
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  return (deferredInstall?'<p><button id="a-install" style="background:#FFE08A">Instalar Curiolandia</button></p>':'')+
   `<ul><li><b>iPhone o iPad (Safari):</b> tocá el botón Compartir (el cuadrado con la flecha) y elegí «Agregar a inicio».</li>
   <li><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación» o «Agregar a la pantalla principal».</li>
   <li><b>Computadora (Chrome o Edge):</b> el ícono de instalar en la barra de direcciones.</li></ul>
   <p class="note">Una vez instalado, se abre a pantalla completa y funciona sin internet. ${ios?'En iPhone la voz depende de las voces en español instaladas en Ajustes → Accesibilidad → Contenido leído.':''}</p>`}
function openAdult(){
  lockDown=false;lockHold=0;try{speechSynthesis.cancel()}catch(e){}
  const el=document.getElementById('adult');el.hidden=false;
  const tmOf=L=>L.map(t=>{const n=gDone(t),N=t.games.length;return `<div class="tm ${tst(t.id).done?'done':''}"><b>${esc(V(t.n))}</b>${n}/${N} juegos${tst(t.id).done?' · completo 🌼':''}<div class="bar"><i style="width:${Math.round(n/N*100)}%"></i></div></div>`}).join('');
  const tm=[['Jardín de 3 años',[...T3,C3]],['Bosque de 4 años',[...T4,C4]],['Montaña de 5 años',[...T5,C5]],['Canciones, rutinas y trazos',[CAN,RUT,TRZ]],['Días especiales',FIESTAS],['Rincón del inglés',ING]].map(([h,L],i)=>`<section><h3>${h}</h3><div class="temas">${tmOf(L)}</div></section>`).join('');
  const vales=S.vales.map((v,i)=>`<div class="row vale"><label class="opt"><input type="checkbox" data-von="${i}" ${v.on?'checked':''}></label><input data-vtxt="${i}" maxlength="60" value="${esc(v.txt)}" style="flex:1;min-width:180px"><label>🪙 <input type="number" data-vp="${i}" min="5" max="500" value="${v.p}" style="width:70px"></label></div>`).join('');
  const pend=S.valesLog.map((v,i)=>[v,i]).filter(([v])=>!v.given).map(([v,i])=>`<div class="row"><span>🎟️ ${esc(v.txt)} <small>(${v.d.slice(5).split('-').reverse().join('/')})</small></span><button data-vgive="${i}">Entregado ✔</button></div>`).join('');
  const sk=Object.keys(S.stats).filter(k=>S.stats[k].ok+S.stats[k].err>0).sort((a,b)=>(S.stats[b].ok+S.stats[b].err)-(S.stats[a].ok+S.stats[a].err)).map(k=>{const s=S.stats[k],n=s.ok+s.err,r=Math.round(s.ok/n*100);
    const lbl=n<5?'Recién empieza':r>=80?'Lo sabe':r>=60?'En camino':'Le cuesta',cls=lbl==='Lo sabe'?'pAprendida':lbl==='Le cuesta'?'pLecuesta':lbl==='En camino'?'pEncamino':'';
    return `<tr><td>${esc(SKILL[k]||k.replace(/-/g,' '))}</td><td>${r}%</td><td>${n}</td><td><span class="pill ${cls}">${lbl}</span></td></tr>`}).join('');
  const cal=Object.keys(S.asam).sort().slice(-14).map(d=>{const a=S.asam[d],dt=new Date(d+'T12:00');return `<span><small>${DIASL[dayIdx(dt)].slice(0,3)} ${dt.getDate()}/${dt.getMonth()+1}</small><b>${a.tiempo?WX_E[a.tiempo]:'·'} ${a.emo?EMO_E[a.emo]:''}</b></span>`}).join('')||'<span>Todavía no hay asambleas.</span>';
  const days=Object.keys(S.days).sort().slice(-7).map(d=>`<span class="day"><b>${Math.round(S.days[d])}</b> min<br><small>${d.slice(5).split('-').reverse().join('/')}</small></span>`).join('')||'<span>Todavía no hay datos.</span>';
  const vname=VOICE?`${VOICE.name} (${VOICE.lang})`:'no se encontró una voz en español en este dispositivo';
  const sug=suggestTema();
  el.querySelector('.body').innerHTML=`
  <section><h3>Modo de juego</h3>
   <div class="row">${[['camino','<b>Camino</b> (recomendado): todo se abre de a uno'],['libre','<b>Libre</b> (todo abierto)']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-mode" value="${k}" ${(k==='libre')===!!S.unlockAll?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note"><b>Camino:</b> los temas son un camino y se abren de a uno; dentro de cada tema, los juegos también se abren en orden. El botón verde del mapa lleva siempre al que sigue y lo ya jugado se puede repetir. El Bosque de 4 años y la Montaña de 5 años se abren con la edad elegida o al juntar 6 flores en la zona anterior. Las canciones se abren al terminar 1 tema del camino; las rutinas y el Rincón del inglés, al terminar 2; los trazos, 3, y los días especiales, 4.</p>
   <p class="note"><b>Libre:</b> se puede elegir cualquier tema, cualquier juego y cualquier zona, también las de 4 y 5 años, sin importar la edad. Se puede cambiar en cualquier momento y no se pierde nada de lo jugado.</p></section>
  <section><h3>Perfil</h3>
   <label>Nombre de quien juega <input id="a-name" maxlength="20" value="${esc(S.name||'')}" placeholder="Opcional"></label>
   <div class="row"><span>Edad</span>${[3,4,5].map(n=>`<label class="opt"><input type="radio" name="a-age" value="${n}" ${S.age===n?'checked':''}> ${n} años</label>`).join('')}</div>
   <div class="row"><span>Cumpleaños</span><select id="a-bd">${['—',...Array.from({length:31},(_,i)=>i+1)].map((d,i)=>`<option value="${i}" ${S.bday&&S.bday.d===i?'selected':''}>${d}</option>`).join('')}</select><select id="a-bm">${['—',...MESES].map((m,i)=>`<option value="${i}" ${S.bday&&S.bday.m===i-1?'selected':''}>${m}</option>`).join('')}</select></div>
   <p class="note">El día del cumpleaños, la Asamblea lo celebra con una torta y velitas.</p></section>
  <section><h3>Personaje de Tito</h3>
   <div class="row">${[['caracol','🐌 Caracol'],['erizo','🦔 Erizo'],['tortuga','🐢 Tortuga'],['conejo','🐰 Conejo']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-kind" value="${k}" ${((S.tito&&S.tito.kind)||'caracol')===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Tito sigue llamándose Tito. La ropa y los colores de la tienda le quedan igual (en el erizo el color va en las púas, en la tortuga en el caparazón y en el conejo en la mochila).</p></section>
  <section><h3>Idioma y voz</h3>
   <div class="row"><span>Palabras</span>${[['ar','Rioplatense (vos, remera, auto)'],['es','España (tú, camiseta, coche)']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-var" value="${k}" ${S.variant===k?'checked':''}> ${l}</label>`).join('')}</div>
   <div class="row"><span>Estaciones</span>${[['N','Hemisferio norte (España)'],['S','Hemisferio sur (Argentina, Uruguay)']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-hemi" value="${k}" ${S.hemi===k?'checked':''}> ${l}</label>`).join('')}</div>
   <div class="row"><span>Voz de Tito</span>${[['','Voz grabada de siempre'],['fer','Voz de Fer']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-voz" value="${k}" ${(S.voz||'')===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Las voces grabadas hablan en castellano de España; con las palabras rioplatenses, o si una frase no está grabada, habla la voz del navegador. Voz del navegador: ${esc(vname)}.</p>
   ${['voz','mus','fx'].map(k=>`<label class="rng">${({voz:'Voz',mus:'Música',fx:'Efectos'})[k]} <input type="range" id="a-${k}" min="0" max="1" step="0.05" value="${S.vol[k]}"></label>`).join('')}</section>
  <section><h3>Tiempo de juego</h3>
   <div class="row">${[[0,'Sin límite'],[10,'10 min'],[15,'15 min'],[20,'20 min']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-lim" value="${k}" ${S.limit===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Al llegar al límite, Tito se despide y se va a dormir. Para seguir, hay que abrir esta zona.</p>
   <div class="days">${days}</div></section>
  ${tm}
  <section><h3>Monedas y premios</h3>
   <p>Tiene <b>${S.coins}</b> monedas (ganó ${S.coinsTot} en total) y <b>${STARS()}</b> estrellas.</p>
   <p class="note">Gana 1 moneda por cada acierto a la primera (hasta 5 por juego), 3 al terminar un juego nuevo, 2 al repetirlo, 10 en el cofre del tesoro al completar un tema (que además trae un regalo sorpresa para Tito o su casa), 3 de regalo al entrar cada día y 5 al terminar la Asamblea. Con las monedas compra ropa y colores para Tito, cosas para su casa, juguetes y mascotas. Las cosas más especiales se abren con estrellas (una por cada juego terminado). La casa de Tito crece en el mapa al terminar 2, 5, 9 y 14 temas, y Pipo, su dinosaurio, nace y crece con las estrellas (4, 15, 35 y 70). Lleva abiertos <b>${S.cofres||0}</b> cofres. No hay compras con dinero real ni premios al azar.</p>
   <h4>Vales para canjear en la vida real</h4><p class="note">Los vales marcados aparecen en la tienda. Cuando compre uno, aparece abajo para que se lo den.</p>${vales}
   ${pend?`<h4>Vales por entregar</h4>${pend}`:''}</section>
  ${sug?`<section><h3>Lo que sigue</h3><p class="tip">Próximo tema del camino: <b>${esc(V(sug.n))}</b>. Para seguir fuera de la pantalla: ${esc(tx(sug.tip||'nombrar juntos las cosas del tema que encuentren en casa o en la calle.'))}</p></section>`:''}
  <section><h3>Asambleas</h3><p class="note">El tiempo que eligió y cómo se sentía cada día.</p><div class="cal">${cal}</div></section>
  <section><h3>Cómo le va</h3><p class="note">Con esto Tito arma cada día un <b>repaso</b> de 3 juegos: primero los de lo que le cuesta y, si no hay, los que jugó hace más tiempo. El botón verde del mapa pasa una vez por día por el repaso cuando hay algo que cuesta; también se abre con la lupa de arriba del mapa.</p>${sk?`<table><thead><tr><th>Habilidad</th><th>Aciertos</th><th>Intentos</th><th></th></tr></thead><tbody>${sk}</tbody></table>`:'<p class="note">Todavía no hay datos.</p>'}</section>
  <section><h3>Copia de seguridad</h3>
   <p class="note">Guarda todo el progreso (el camino, las monedas, la casa de Tito, las figuritas y los ajustes) para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador. Conviene hacer una copia cada tanto.</p>
   <div class="row"><button id="a-bk-dl">⬇️ Descargar copia</button><button id="a-bk-code">🔑 Ver código de copia</button><label class="opt" style="cursor:pointer">📂 Cargar archivo de copia<input type="file" id="a-bk-file" accept=".json,.txt,application/json,text/plain" hidden></label></div>
   <textarea id="a-bk-txt" rows="3" style="width:100%;box-sizing:border-box;font:13px/1.3 monospace;border:2px solid var(--ink);border-radius:12px;padding:8px;background:#fff" placeholder="Acá aparece el código para copiar, o pegá acá un código para recuperar una copia."></textarea>
   <div class="row"><button id="a-bk-copy">📋 Copiar código</button><button id="a-bk-load">♻️ Recuperar con este código</button></div>
   <div id="a-bk-msg" class="note"></div></section>
  <section><h3>Instalar en el celular o la tablet</h3>${installHTML()}</section>
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="jardin">Jardín de 3 años</button><button data-go="bosque">Bosque de 4 años</button><button data-go="montana">Montaña de 5 años</button><button data-go="fiestas">Días especiales</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button><button data-go="intro">Ver el cuento del inicio</button></div>
   <div class="row"><select id="a-tema">${TEMAS.map(t=>`<option value="${t.id}">${esc(V(t.n))}</option>`).join('')}</select><button id="a-gotema">Ir al tema</button></div></section>
  <section><h3>Empezar de cero</h3><button id="a-reset" class="danger">Borrar todo el progreso</button><span id="a-confirm" hidden> ¿Seguro? <button id="a-yes" class="danger">Sí, borrar</button> <button id="a-no">No</button></span></section>`;
  const q=s=>el.querySelector(s);
  bkWire(q);
  q('#a-name').oninput=e=>{S.name=e.target.value.trim().slice(0,20);save()};
  el.querySelectorAll('[name=a-age]').forEach(r=>r.onchange=()=>{S.age=+r.value;ADAPT=0;save()});
  el.querySelectorAll('[name=a-kind]').forEach(r=>r.onchange=()=>{S.tito=S.tito||{};S.tito.kind=r.value;save();try{if(window.__w3&&__w3.retito)__w3.retito()}catch(e){console.error(e)}});
  el.querySelectorAll('[name=a-var]').forEach(r=>r.onchange=()=>{S.variant=r.value;save();pickVoice();say(tx('¡Hola! Soy Tito. ¿Jugamos? Tocá la plaza.'))});
  el.querySelectorAll('[name=a-voz]').forEach(r=>r.onchange=()=>{S.voz=r.value;save();vozLoad(()=>say(((S.tito&&S.tito.kind)||'caracol')==='caracol'?'¡Hola! Yo soy Tito, el caracol curioso. En mi mochila guardo un montón de preguntas.':'Hola.'))});
  el.querySelectorAll('[name=a-hemi]').forEach(r=>r.onchange=()=>{S.hemi=r.value;save()});
  el.querySelectorAll('[name=a-lim]').forEach(r=>r.onchange=()=>{S.limit=+r.value;save()});
  ['voz','mus','fx'].forEach(k=>q('#a-'+k).oninput=e=>{S.vol[k]=+e.target.value;save();setVol()});
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{closeAdult();go(b.dataset.go,{hello:true})});
  q('#a-gotema').onclick=()=>{const id=q('#a-tema').value;closeAdult();go('casita',{t:id,hello:true})};
  const ib=q('#a-install');if(ib)ib.onclick=()=>{if(!deferredInstall)return;deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;openAdult()})};
  const bdc=()=>{const d=+q('#a-bd').value,m=+q('#a-bm').value;S.bday=d&&m?{d,m:m-1}:null;S.bdayDone='';save()};q('#a-bd').onchange=bdc;q('#a-bm').onchange=bdc;
  el.querySelectorAll('[data-von]').forEach(c=>c.onchange=()=>{S.vales[+c.dataset.von].on=c.checked?1:0;save()});
  el.querySelectorAll('[data-vtxt]').forEach(c=>c.oninput=()=>{const t=c.value.trim();if(t){S.vales[+c.dataset.vtxt].txt=t;save()}});
  el.querySelectorAll('[data-vp]').forEach(c=>c.onchange=()=>{const n=Math.round(+c.value);if(n>=1){S.vales[+c.dataset.vp].p=Math.min(500,n);save()}});
  el.querySelectorAll('[data-vgive]').forEach(b=>b.onclick=()=>{S.valesLog[+b.dataset.vgive].given=1;save();openAdult()});
  el.querySelectorAll('[name=a-mode]').forEach(r=>r.onchange=()=>{S.unlockAll=r.value==='libre';S.seenOpen={};if(!S.unlockAll)for(const z of['bosque','montana'])if(!zoneOpen(z))delete S.woke[z];save()});
  q('#a-reset').onclick=()=>{q('#a-confirm').hidden=false};q('#a-no').onclick=()=>{q('#a-confirm').hidden=true};
  q('#a-yes').onclick=()=>{closeAdult();doReset()};
}
function closeAdult(){document.getElementById('adult').hidden=true;sessionT=0;if(sceneName==='dormir')go('map',{hello:true})}
document.getElementById('a-close').onclick=()=>closeAdult();

/* ---------- nombre y reinicio ---------- */
let nameAfter=null;
function openNameDlg(after){nameAfter=after||null;const d=document.getElementById('nameDlg'),i=document.getElementById('nm-in');d.hidden=false;i.value=S.name||'';setTimeout(()=>i.focus(),50)}
document.getElementById('nm-ok').onclick=()=>{const v=document.getElementById('nm-in').value.trim().slice(0,20);document.getElementById('nameDlg').hidden=true;S.first.askedName=1;if(v)S.name=v;save();const a=nameAfter;nameAfter=null;if(a)a(v)};
document.getElementById('nm-x').onclick=()=>{document.getElementById('nameDlg').hidden=true;if(nameAfter){S.first.askedName=1;save();const a=nameAfter;nameAfter=null;a('')}};
document.getElementById('nm-in').onkeydown=e=>{if(e.key==='Enter')document.getElementById('nm-ok').click()};
function openResetDlg(){document.getElementById('resetDlg').hidden=false}
function doReset(){const keep={variant:S.variant,voz:S.voz,hemi:S.hemi,vol:S.vol,limit:S.limit,vales:S.vales,bday:S.bday};S=Object.assign(JSON.parse(JSON.stringify(DEF)),keep);ADAPT=0;save();go('title')}
document.getElementById('rs-yes').onclick=()=>{document.getElementById('resetDlg').hidden=true;doReset()};
document.getElementById('rs-no').onclick=()=>{document.getElementById('resetDlg').hidden=true};

/* ================= BUCLE E INPUT ================= */
let portraitOk=false;
function toLogical(e){return[(e.clientX-OX)/SC,(e.clientY-OY)/SC]}
const dlgOpen=()=>!document.getElementById('adult').hidden||!document.getElementById('nameDlg').hidden||!document.getElementById('resetDlg').hidden;
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}initAudio();idle=0;hintSaid=false;
  const [x,y]=toLogical(e);MX=x;MY=y;mouseOn=e.pointerType==='mouse';
  if(isPortrait()&&!portraitOk){portraitOk=true;return}
  if(x>1490&&y>800&&sceneName!=='title'){lockDown=true;lockHold=0;return}
  if(fade>.6||!scene)return;
  try{scene.down&&scene.down(x,y)}catch(err){console.error(err)}});
cv.addEventListener('pointermove',e=>{const [x,y]=toLogical(e);MX=x;MY=y;mouseOn=e.pointerType==='mouse';if(e.pointerType==='mouse')idle=Math.min(idle,4);if(scene&&scene.move)try{scene.move(x,y)}catch(err){console.error(err)}});
cv.addEventListener('pointerleave',()=>{mouseOn=false});
const upH=e=>{lockDown=false;if(!scene)return;const [x,y]=toLogical(e);if(e.pointerType!=='mouse')mouseOn=false;try{scene.up&&scene.up(x,y)}catch(err){console.error(err)}};
cv.addEventListener('pointerup',upH);cv.addEventListener('pointercancel',upH);
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(dlgOpen())return;if(e.key==='Escape'&&sceneName!=='title'){const d=scene.down;if(d)try{d.call(scene,HOME.x,HOME.y)}catch(err){}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){try{speechSynthesis.cancel()}catch(e){}if(AC)AC.suspend().catch(()=>{})}else if(AC)AC.resume().catch(()=>{})});
const isPortrait=()=>innerHeight>innerWidth*1.15&&matchMedia('(pointer:coarse)').matches;
let lastF=performance.now();
function hoverTick(dt){
  if(!mouseOn||drag||dlgOpen()){hovPrev=null;hovT=0;return}
  if(hovNow!==hovPrev){if(hovNow!=null&&fade<.3)try{SFX.hov()}catch(e){}hovPrev=hovNow;hovT=0;dwellDone=false;return}
  if(hovNow!=null){hovT+=dt;if(hovT>1.1&&!dwellDone&&!talking&&scene.dwell&&typeof hovNow==='string'){dwellDone=true;try{scene.dwell(hovNow)}catch(e){console.error(e)}}}
}
function frame(now){
  const dt=Math.min(.05,(now-lastF)/1000);lastF=now;T+=dt;idle+=dt;fade=Math.max(0,fade-dt*3);
  for(const t of timers){t.t-=dt;if(t.t<=0&&!t.done){t.done=1;if(t.tok===sceneTok)try{t.fn()}catch(e){console.error(e)}}}timers=timers.filter(t=>!t.done);
  if(lockDown){lockHold+=dt;if(lockHold>=3)openAdult()}
  if(document.getElementById('adult').hidden&&sceneName!=='title'&&sceneName!=='dormir'){sessionT+=dt;minuteAcc+=dt;
    if(minuteAcc>=15){const d=today();S.days[d]=(S.days[d]||0)+minuteAcc/60;minuteAcc=0;
      const ks=Object.keys(S.days).sort();while(ks.length>30)delete S.days[ks.shift()];save()}
    if(S.limit&&sessionT>=S.limit*60)go('dormir')}
  try{musicTick();scene.update&&scene.update(dt)}catch(e){console.error(e)}
  ctx.setTransform(DPR,0,0,DPR,0,0);if(scene&&scene.three&&typeof R3frame==='function'){ctx.clearRect(0,0,cv.width,cv.height);try{R3frame(dt)}catch(e){console.error(e)}}else{ctx.fillStyle='#2E2420';ctx.fillRect(0,0,cv.width,cv.height)}
  ctx.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  hovNow=null;
  try{scene.draw();drawHelp();drawParts(dt);drawToast();drawCoinFx()}catch(e){console.error(e)}if(sceneName!=='title')drawLock();
  hoverTick(dt);
  if(fade>0){ctx.fillStyle=`rgba(255,246,230,${fade})`;ctx.fillRect(0,0,W,H)}
  ctx.restore();
  // pantallas 2D en móviles alargados: las bandas de los lados (antes marrón oscuro) continúan el borde de la escena, como si siguiera
  if(!(scene&&scene.three)&&(OX>2||OY>2)){try{ctx.save();ctx.setTransform(1,0,0,1,0,0);const x0=Math.round(OX*DPR),y0=Math.round(OY*DPR),gw=Math.round(W*SC*DPR),gh=Math.round(H*SC*DPR),rw=cv.width-x0-gw,rh=cv.height-y0-gh;
    if(x0>0){ctx.drawImage(cv,x0+2,y0,1,gh,0,y0,x0,gh);if(rw>0)ctx.drawImage(cv,x0+gw-3,y0,1,gh,x0+gw,y0,rw,gh)}
    if(y0>0){ctx.drawImage(cv,0,y0+2,cv.width,1,0,0,cv.width,y0);if(rh>0)ctx.drawImage(cv,0,y0+gh-3,cv.width,1,0,y0+gh,cv.width,rh)}
    ctx.fillStyle='rgba(46,36,32,.08)';if(x0>0){ctx.fillRect(0,0,x0,cv.height);ctx.fillRect(x0+gw,0,rw,cv.height)}if(y0>0){ctx.fillRect(0,0,cv.width,y0);ctx.fillRect(0,y0+gh,cv.width,rh)}
    ctx.restore()}catch(e){}}
  // fuera del recorte de la franja del juego: el velo oscuro tapa toda la pantalla (antes solo la franja del juego y en vertical se veía el 3D arriba y abajo)
  if(isPortrait()&&!portraitOk){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(46,36,32,.88)';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();ctx.save();ctx.translate(800,400);ctx.rotate(Math.sin(T*2)*.8-.8);card(-90,-160,180,320,'#fff',10,30);ctx.restore();text(V(['Girá el teléfono','Gira el móvil']),800,700,90,'#fff');text(V(['(tocá para seguir igual)','(toca para seguir igual)']),800,790,44,'#FCEBD0')}
  requestAnimationFrame(frame);
}
window.__cl={go,get S(){return S},get scene(){return scene},get name(){return sceneName},SCENES,TEMA,TEMAS,
  tap(x,y){scene.down&&scene.down(x,y);scene.up&&scene.up(x,y)},drag(a,b,c,d){scene.down(a,b);scene.move&&scene.move(c,d);scene.up&&scene.up(c,d)},
  hover(x,y){MX=x;MY=y;mouseOn=true},T:()=>T,say,openAdult,closeAdult};

/* ---------- copia de seguridad del progreso ---------- */
const bk64=u=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const bkUn64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function bkEncode(){const j=JSON.stringify(S);
  if(typeof CompressionStream==='function'){try{const st=new Blob([j]).stream().pipeThrough(new CompressionStream('gzip'));return 'CURIO1.'+bk64(new Uint8Array(await new Response(st).arrayBuffer()))}catch(e){}}
  return 'CURIO0.'+bk64(new TextEncoder().encode(j))}
async function bkDecode(code){code=String(code||'').trim();let j;
  if(code.startsWith('{'))j=code;
  else{code=code.replace(/\s+/g,'');const m=code.match(/^CURIO([01])\.([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('formato');const u=bkUn64(m[2]);
    if(m[1]==='1'){if(typeof DecompressionStream!=='function')throw new Error('navegador');j=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
    else j=new TextDecoder().decode(u)}
  const d=JSON.parse(j);if(!d||typeof d!=='object'||typeof d.temas!=='object')throw new Error('formato');return d}
function bkWire(q){const msg=(h)=>{q('#a-bk-msg').innerHTML=h},ta=q('#a-bk-txt');
  q('#a-bk-code').onclick=async()=>{ta.value=await bkEncode();ta.select();msg('Este código tiene todo el progreso. Copialo y guardalo, por ejemplo mandándotelo por mensaje.')};
  q('#a-bk-copy').onclick=async()=>{if(!ta.value.startsWith('CURIO'))ta.value=await bkEncode();ta.select();let ok=false;try{await navigator.clipboard.writeText(ta.value);ok=true}catch(e){try{ok=document.execCommand('copy')}catch(e2){}}
    msg(ok?'✅ Código copiado.':'Seleccioná el código de arriba y copialo a mano.')};
  q('#a-bk-dl').onclick=()=>{const b=new Blob([JSON.stringify(S)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='curiolandia-copia-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
    msg('Si no se descargó nada, usá el código de copia.')};
  const ask=async(src)=>{let d;try{d=await bkDecode(src)}catch(e){msg(e.message==='navegador'?'Este navegador no puede abrir ese código. Probá con el archivo de copia.':'❌ Eso no parece una copia de Curiolandia. Revisá que el código esté completo.');return}
    const nT=Object.values(d.temas||{}).filter(t=>t&&t.done).length,nG=Object.values(d.temas||{}).reduce((a,t)=>a+Object.keys((t&&t.g)||{}).length,0);
    msg(`Copia encontrada${d.name?' de <b>'+esc(d.name)+'</b>':''}: ${nT} temas terminados, ${nG} juegos jugados y ${d.coins||0} monedas. <b>Reemplaza el progreso actual de este dispositivo.</b> <button id="a-bk-ok" class="danger">Sí, recuperar esta copia</button>`);
    q('#a-bk-ok').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){msg('❌ No se pudo guardar en este navegador.');return}location.reload()}};
  q('#a-bk-load').onclick=()=>ask(ta.value);
  q('#a-bk-file').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;f.text().then(t=>ask(t))}}
