/* ================= TEMAS DE 5 AÑOS: LA MONTAÑA ================= */
const seasonOfMonth=m=>estacionDe(new Date(2026,m,15));
const SEAS_IC={otoño:'hojaNaranja',invierno:'copo',primavera:'flor',verano:'sol'},SEAS_C={otoño:'#FFD6A0',invierno:'#D6EEFA',primavera:'#FBD3E4',verano:'#FFF0A8'};
const monthCard=i=>({name:MESES[i],m:i,draw:(x,y,s)=>{const e=seasonOfMonth(i);card(x-s*.46,y-s*.34,s*.92,s*.7,SEAS_C[e],5,s*.1);card(x-s*.46,y-s*.34,s*.92,s*.16,'#FF8A7A',5,s*.06);
  circ(x-s*.26,y-s*.34,s*.04,'#fff',3);circ(x+s*.26,y-s*.34,s*.04,'#fff',3);pic(SEAS_IC[e],x-s*.27,y+s*.12,s*.28);const nm=MESES[i].toUpperCase();text(nm,x+s*.1,y+s*.18,s*(nm.length>7?.105:nm.length>5?.13:.15),K,{f:LF})}});
const numObj=n=>({name:NUM[n],n,draw:(x,y,s)=>numCard(n,x,y,s*.92)});
const MSAY=['Enero. Es el primer mes del año.','Febrero. Es el mes más cortito.','Marzo.','Abril.','Mayo.','Junio.','Julio.','Agosto.','Septiembre.','Octubre.','Noviembre.','Diciembre. Es el último mes del año.'];
const thermo=(lv)=>({name:lv>.5?'el termómetro alto':'el termómetro bajo',lv,draw:(x,y,s)=>{card(x-s*.1,y-s*.42,s*.2,s*.7,'#fff',6,s*.1);circ(x,y+s*.3,s*.14,'#FF5A5A',6);card(x-s*.05,y+s*.24-s*.62*lv,s*.1,s*.62*lv+s*.04,'#FF5A5A',0,s*.05);
  for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x+s*.1,y-s*.34+j*s*.12);ctx.lineTo(x+s*.18,y-s*.34+j*s*.12);ctx.lineWidth=4;ctx.strokeStyle=K;ctx.stroke()}
  pic(lv>.5?'sol':'copo',x+s*.32,y-s*.24,s*.26)}});
const binDraw=(c,lb)=>(z,hl)=>{const {x,y}=z;ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=36}ctx.beginPath();ctx.moveTo(x-110,y-90);ctx.lineTo(x+110,y-90);ctx.lineTo(x+92,y+130);ctx.lineTo(x-92,y+130);ctx.closePath();fillStroke(c,7);ctx.restore();
  card(x-124,y-128,248,44,c,7,14);card(x-40,y-150,80,26,c,6,10);ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=8;for(const dx of[-50,0,50]){ctx.beginPath();ctx.moveTo(x+dx,y-60);ctx.lineTo(x+dx*.85,y+100);ctx.stroke()}
  card(x-62,y-50,124,124,'#fff',5,24);lb(x,y+12,104)};
const BINS={amarillo:{c:'#FFD34E',n:'el contenedor amarillo',it:['botellaPlastico','lata','brik'],lb:(x,y,s)=>{pic('botellaPlastico',x-s*.2,y,s*.7);pic('lata',x+s*.22,y+s*.08,s*.55)}},
  azul:{c:'#5B8DEF',n:'el contenedor azul',it:['periodico','cajaCarton'],lb:(x,y,s)=>pic('periodico',x,y,s*.9)},
  verde:{c:'#5FA84E',n:'el contenedor verde',it:['botellaVidrio','frasco'],lb:(x,y,s)=>pic('botellaVidrio',x,y,s*.9)},
  marron:{c:'#A86B43',n:'el contenedor marrón',it:['cascara','restoManzana'],lb:(x,y,s)=>pic('restoManzana',x,y,s*.9)}};
const BINSAY={amarillo:'En el amarillo van los envases: botellas de plástico, latas y cartones de leche.',azul:'En el azul va el papel y el cartón.',verde:'En el verde va el vidrio.',marron:'En el marrón van los restos de comida.'};
const binOf=k=>Object.keys(BINS).find(b=>BINS[b].it.includes(k));
const fern2=(x,y,s)=>fern(x,y+s*.3,s/150,'#7CC86E');
const habZ={mar:{c:'#9ED9F5',ic:zoneIcon('ballena'),nm:'el mar',it:['pulpo','ballena','pez','estrellaMar']},polo:{c:'#E3F2FA',ic:zoneIcon('iglu'),nm:'el polo',it:['pinguino','osoPolar','foca','morsa']},
  selva:{c:'#C9EBB5',ic:(x,y,s)=>palm(x-10,y+s*.45,s*.0042),nm:'la selva',it:['mono','tigre','cocodrilo','jirafa']},bosque:{c:'#DDF3D2',ic:(x,y,s)=>tree(x,y+s*.38,s/260,'verano'),nm:'el bosque',it:['buho','lobo','ardilla','erizo']},
  desierto:{c:'#FFE8B0',ic:zoneIcon('cactus'),nm:'el desierto',it:['camello']}};
const capullo={name:'el capullo',draw:(x,y,s)=>{card(x-s*.46,y-s*.46,s*.92,s*.92,'#FFFBF2',0,s*.12);ctx.beginPath();ctx.moveTo(x-s*.4,y-s*.3);ctx.lineTo(x+s*.4,y-s*.36);ctx.lineWidth=s*.05;ctx.strokeStyle='#A86B43';ctx.lineCap='round';ctx.stroke();ell(x,y+s*.02,s*.12,s*.28,'#C9B06B',5);for(let j=-2;j<=2;j++){ctx.beginPath();ctx.moveTo(x-s*.1,y+j*s*.09);ctx.quadraticCurveTo(x,y+j*s*.09+s*.03,x+s*.1,y+j*s*.09);ctx.lineWidth=3;ctx.strokeStyle='rgba(74,52,40,.4)';ctx.stroke()}}};
const hojaHuevos={name:'los huevitos en la hoja',draw:(x,y,s)=>{card(x-s*.46,y-s*.46,s*.92,s*.92,'#FFFBF2',0,s*.12);ctx.save();ctx.translate(x,y);ctx.rotate(-.4);ell(0,0,s*.38,s*.2,'#7CC86E',5);ctx.beginPath();ctx.moveTo(-s*.36,0);ctx.lineTo(s*.36,0);ctx.lineWidth=4;ctx.strokeStyle='#5FA84E';ctx.stroke();for(let j=0;j<5;j++)circ(-s*.18+j*s*.09,-s*.06+(j%2)*s*.1,s*.035,'#FFF3B0',3);ctx.restore()}};
const pVivo=['perro','flor','pez','mariposa','arbol','pajaro','plantita','gato','nene'],pNoVivo=['piedra','pelota','auto','silla','lapiz','robot','reloj','zapato'];
const NECES=[['plantita',['gota','sol'],['¿Qué necesita la planta para vivir?','La planta necesita agua y sol.']],['perro',['plato','gota'],['¿Qué necesita el perro para vivir?','El perro necesita comida y agua.']],['pez',['gota','plato'],['¿Qué necesita el pez para vivir?','El pez necesita agua limpia y comida.']],['nene',['plato','cama'],['¿Qué necesitamos las personas para vivir?','Necesitamos comer y dormir.']]];
const NOVIVOS=['pelota','tele','robot','auto','trenJuguete','guitarra'];
const MIX=[['rojo','amarillo','naranja'],['azul','amarillo','verde'],['rojo','azul','violeta'],['rojo','blanco','rosa'],['blanco','negro','gris']];
const FORMQ=[['huevo','ovalo','¿Qué forma tiene el huevo?'],['cometa','rombo','¿Qué forma tiene el barrilete?'],['pelota','circulo','¿Qué forma tiene la pelota?'],['reloj','circulo','¿Qué forma tiene el reloj?'],['libro','rectangulo','¿Qué forma tiene el libro?'],['gorroFiesta','triangulo','¿Qué forma tiene el gorro de fiesta?'],['cuadro','cuadrado','¿Qué forma tiene el cuadro?'],['sandia','ovalo','¿Qué forma tiene la sandía?']];
const FCOL={circulo:'#FF8A7A',cuadrado:'#5BB8E6',triangulo:'#FFD66B',rectangulo:'#7CC86E',ovalo:'#F58BB4',rombo:'#9B8AD9'};
function rowOf(ks,x,y,s,gap=18,fx){const n=ks.length;ks.forEach((k,j)=>{const xx=x-(n-1)*(s+gap)/2+j*(s+gap);fx?fx(k,xx,y,s,j):thing(k,xx,y,s)})}
const FILA=['pato','perro','gato','conejo','oveja','cerdo','vaca','caballo','gallina','oso'];
const ORD=['el primero','el segundo','el tercero','el cuarto','el quinto'];
const PESO=[['elefante','pluma'],['camion','globo'],['piedra','hojaNaranja'],['sandia','uva'],['oso','pajaro'],['ballena','pez']];
const trunk=(w,c='#A86B43')=>({name:w>.5?'el tronco grueso':'el tronco delgado',draw:(x,y,s)=>{const ww=s*(w>.5?.42:.12);card(x-ww/2,y-s*.36,ww,s*.72,c,6,ww*.2);ell(x,y-s*.36,ww/2,s*.05,'#E9D1A6',5)}});
const bookOf=(w)=>({name:w>.5?'el libro grueso':'el libro delgado',draw:(x,y,s)=>{const h=s*(w>.5?.34:.07);card(x-s*.36,y-h/2,s*.72,h,'#FFF6E6',5,6);card(x-s*.4,y-h/2-s*.04,s*.8,s*.06,'#5B8DEF',5,6);card(x-s*.4,y+h/2-s*.02,s*.8,s*.06,'#5B8DEF',5,6)}});
Object.assign(LEX,{hoja:'la hoja'});

const T5=[
{id:'5A-T1',n:'Los meses del año',icon:'calendario',c:'#FF8A7A',trim:1,bg:BG.semana,
 words:MESES.map((m,i)=>Object.assign(monthCard(i),{label:m,say:MSAY[i]})),intro:'El año tiene doce meses. Tocá cada uno para conocerlo.',
 games:[{t:'conocer',icon:'calendario'},
  {t:'rueda',icon:'reloj',name:'Los meses en orden',make:(d,t)=>Arrastra({rounds:2,key:'meses-orden',bg:t.bg,sayPick:true,rect:false,
    why:()=>'Ese lugar es para otro mes. Pensá cuál viene antes y cuál después.',placeSay:it=>cap(V(it.k.name))+'.',
    gen(i){const m=AGE()<=4?3:4,miss=shuffle([...Array(12).keys()].slice(1)).slice(0,m),X=j=>425+(j%6)*190,Y=j=>j<6?250:470;
      return {ask:'A la fila de los meses le faltan algunos. Llevá cada mes a su lugar.',
        drawExtra:()=>{for(let j=0;j<12;j++)if(!miss.includes(j))monthCard(j).draw(X(j),Y(j),170);ctx.beginPath();ctx.moveTo(1460,250);ctx.quadraticCurveTo(1560,360,1460,470);ctx.lineWidth=8;ctx.setLineDash([12,12]);ctx.strokeStyle='#B8A890';ctx.stroke();ctx.setLineDash([])},
        zones:miss.map(j=>({id:'m'+j,x:X(j),y:Y(j),w:160,h:120,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=30}ctx.setLineDash([12,10]);rr(z.x-78,z.y-58,156,118,16);fillStroke('rgba(255,255,255,.7)',6,'#FF8A7A');ctx.setLineDash([]);ctx.restore();text('?',z.x,z.y+20,60,'#FF8A7A',{f:LF})},slot:()=>[X(j),Y(j)],ps:1})),
        items:miss.map(j=>({k:monthCard(j),zone:'m'+j,s:170})),tray:{x0:420,x1:1400,y:740},okAll:'¡Muy bien! Enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre y diciembre.'}}},d)},
  {t:'falta',icon:'calendario',name:'¿Qué mes viene después?',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'meses-sigue',y:680,
    ref(r){r.seq.forEach((j,q)=>{const x=900-(r.seq.length)*100+q*200;monthCard(j).draw(x,300,180)});const qx=900-(r.seq.length)*100+r.seq.length*200;ctx.setLineDash([12,10]);rr(qx-80,300-62,160,124,16);fillStroke('#FFF3B0',6,'#FFC93C');ctx.setLineDash([]);text('?',qx,322,60,'#FFA94D',{f:LF})},
    gen(){const st=ri(0,11),seq=[st,(st+1)%12],ans=(st+2)%12,A=monthCard(ans),others=shuffle([...Array(12).keys()].filter(x=>x!==ans&&!seq.includes(x))).slice(0,nOpts()-1).map(monthCard);
      const read=seq.map(j=>MESES[j]).join(', ');return {seq,words:[A,...others],ok:[A],ask:cap(read)+'... ¿Qué mes viene después?',okSay:()=>'¡Sí! Después de '+MESES[seq[1]]+' viene '+MESES[ans]+'.',badSay:w=>cap(w.name)+' no. '+cap(read)+'... ¿y después?'}}},d)},
  {t:'cancion',icon:'notas',song:'meses'}]},
{id:'5A-T2',n:'Mi cuerpo por dentro',icon:'esqueleto',c:'#F58BB4',trim:1,bg:BG.cuerpo,
 words:[{k:'esqueleto',say:'El esqueleto. Son todos los huesos juntos. Nos sostiene, ¡como el palo de una carpa!'},{k:'hueso',say:'El hueso. Es duro y fuerte. Tomar leche ayuda a que crezca.'},{k:'musculo',say:'El músculo. Nos ayuda a movernos. Se pone fuerte cuando jugamos y corremos.'},
  {k:'corazonOrg',say:'El corazón. Late, pum pum, y lleva la sangre por todo el cuerpo.'},{k:'pulmones',say:'Los pulmones. Se llenan de aire cuando respiramos. ¡Inflá la panza!'},{k:'estomago',say:'El estómago. Ahí va la comida cuando la tragamos.'},{k:'cerebro',say:'El cerebro. Está adentro de la cabeza. Con él pensamos, aprendemos y soñamos.'}],
 games:[{t:'conocer'},
  {t:'rayos',icon:'esqueleto',name:'Los rayos X',make:(d,t)=>{const kx=900,ky=880,ks=1.25,P=AGE()<=4?['cerebro','corazonOrg','estomago','hueso']:['cerebro','corazonOrg','pulmones','estomago','hueso'];
    const POS={cerebro:[0,-500,150],corazonOrg:[28,-340,110],pulmones:[0,-330,190],estomago:[-6,-262,120],hueso:[44,-110,130]};
    const items=P.map(k=>({k,x:kx+POS[k][0]*ks,y:ky+POS[k][1]*ks,s:POS[k][2]}));
    return Lens({items,r:150,ring:'#3E6B9A',key:'cuerpo-dentro',intro:'Esta es una máquina de rayos X. Mirá adentro del cuerpo con la pantalla.',ask:k=>'Buscá '+W_(k)+'.',foundSay:k=>({cerebro:'¡El cerebro! Con él pensamos.',corazonOrg:'¡El corazón! Pum, pum.',pulmones:'¡Los pulmones! Se llenan de aire.',estomago:'¡El estómago! Ahí va la comida.',hueso:'¡Un hueso de la pierna! Es duro y fuerte.'})[k],
      base:()=>{BG.cuerpo();drawKid(kx,ky,ks,{})},shown:o=>{ctx.globalAlpha=.85;thing(o.k,0,0,o.s);ctx.globalAlpha=1},
      inside:(its,L)=>{ctx.fillStyle='#14234A';ctx.fillRect(L.x-L.r,L.y-L.r,L.r*2,L.r*2);ctx.save();ctx.translate(kx,ky);ctx.scale(ks,ks);ctx.globalAlpha=.35;ctx.lineWidth=8;ctx.strokeStyle='#BFEAF7';circ(0,-490,94,null,8,'#BFEAF7');card(-84,-400,168,176,null,8,46,'#BFEAF7');card(-84,-240,168,96,null,8,26,'#BFEAF7');ctx.globalAlpha=1;
        ctx.strokeStyle='#E8F4FF';ctx.lineWidth=14;ctx.lineCap='round';for(const [a,b,c,e] of[[0,-400,0,-230],[-40,-230,-44,-30],[40,-230,44,-30],[-70,-370,-150,-215],[70,-370,150,-215]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,e);ctx.stroke()}
        for(let j=0;j<5;j++){ctx.beginPath();ctx.ellipse(0,-380+j*28,62-j*4,10,0,0,PI);ctx.lineWidth=7;ctx.stroke()}ctx.restore();for(const o of its)if(!o.found)thing(o.k,o.x,o.y,o.s)}},d)}},
  {t:'funciona',icon:'pulmones',name:'¿Para qué sirve?',make:(d,t)=>{const Q=shuffle([['cuento','cerebro','¿Con qué pensamos y aprendemos?'],['corazon','corazonOrg','¿Qué late y lleva la sangre por el cuerpo?'],['viento','pulmones','¿Con qué respiramos el aire?'],['macedonia','estomago','¿Adónde va la comida cuando la tragamos?'],['pelota','musculo','¿Qué se pone fuerte cuando corremos y saltamos?'],['leche','hueso','¿Qué es duro y crece fuerte si tomamos leche?']]);
    return ChoiceGame({rounds:Math.min(6,nRounds()),bg:t.bg,key:()=>'cuerpo-dentro',y:680,ref(r){refCard(900,290,280,260,()=>pic(r.st,900,290,210))},
      gen(i){const q=Q[i%Q.length],others=shuffle(['cerebro','corazonOrg','pulmones','estomago','musculo','hueso'].filter(k=>k!==q[1])).slice(0,nOpts()-1);return {st:q[0],words:[q[1],...others],ok:[q[1]],ask:q[2],okSay:()=>'¡Sí! '+cap(nameT(q[1]))+'.',badSay:w=>eseEs(w)+'. '+q[2]}}},d)}},
  {t:'puzzle',icon:'hueso',make:(d,t)=>Puzzle({list:['esqueleto','corazonOrg'],bg:t.bg},d)}]},
{id:'5A-T3',n:'El otoño y los cambios',icon:'hojaRoja',c:'#FFA94D',trim:1,bg:BG.otono,season:'otoño',
 words:[{k:'hojaNaranja',say:'Las hojas. En otoño se ponen naranjas y amarillas, y se caen.'},{k:'golondrina',say:'La golondrina. En otoño se va volando a un lugar más calentito.'},{k:'ardilla',say:'La ardilla. Junta comida para el invierno.'},{k:'erizo',say:'El erizo. Duerme todo el invierno escondido entre las hojas.'},
  {k:'seta',say:['El hongo. Sale con la lluvia de otoño.','La seta. Sale con la lluvia de otoño.']},{k:'castana',say:'La castaña. Es un fruto del otoño.'},{k:'paraguas',say:'El paraguas. En otoño llueve más.'},{k:'viento',say:'El viento. Sopla fuerte y hace volar las hojas.'}],
 games:[{t:'conocer'},
  {t:'arbol',icon:'hojaNaranja',name:'El árbol durante el año',make:(d,t)=>Secuencia({bg:t.bg,key:'estaciones',panels:['otoño','invierno','primavera','verano'].map(e=>({name:ESTS[e],draw:(x,y,s)=>{card(x-s*.46,y-s*.46,s*.92,s*.92,{otoño:'#FFE2B8',invierno:'#E3F2FA',primavera:'#FBE3EE',verano:'#FFF3C4'}[e],0,s*.12);tree(x,y+s*.32,s/300,e)}})),first:true,
    ask:'Así cambia el árbol durante el año. Empezamos en otoño. Ordená lo que viene después.',okAll:'¡Muy bien! Otoño, invierno, primavera y verano. ¡Y después vuelve el otoño!'},d)},
  {t:'animales',icon:'golondrina',name:'¿Qué hacen los animales?',make:(d,t)=>{const Q=shuffle([['golondrina','¿Quién se va volando a un lugar calentito?',['ardilla','erizo','caracol']],['ardilla','¿Quién guarda bellotas para el invierno?',['golondrina','erizo','pez']],['erizo','¿Quién duerme todo el invierno?',['golondrina','ardilla','mariposa']],['hormiga','¿Quién lleva comida a su casa bajo la tierra?',['golondrina','pez','mariposa']]]);
    return ChoiceGame({rounds:4,bg:t.bg,key:()=>'otono',y:560,big:true,gen(i){const q=Q[i%Q.length];return {words:[q[0],...q[2].slice(0,nOpts()-1)],ok:[q[0]],ask:q[1],okSay:()=>'¡Sí! '+cap(nameT(q[0]))+'.',badSay:w=>eseEs(w)+'. '+q[1]}}},d)}},
  {t:'viste',icon:'paraguas',make:vestir(['abrigo','paraguas','botasAgua','bufanda'],['gafas','remera','banador'],'Llueve y hace fresquito. Vestí al nene para salir en otoño.',k=>({gafas:'Los anteojos de sol no hacen falta: está nublado.',remera:'Con remera vamos a tener frío.',banador:['La malla es para la pileta.','El bañador es para la piscina.']}[k]||'Eso no va.'))},
  {t:'memoria'}]},
{id:'5A-T4',n:'Comer sano',icon:'manzana',c:'#7CC86E',trim:1,bg:BG.cocina,
 words:[{k:'pescado',say:'El pescado. Nos da proteínas y viene del mar.'},{k:'carne',say:'La carne. Nos ayuda a crecer.'},{k:'huevo',say:'El huevo. Lo pone la gallina.'},{k:'legumbres',say:'Las legumbres: lentejas y garbanzos. ¡Dan mucha energía!'},{k:'arroz',say:'El arroz. Es una semilla que crece en el agua.'},
  {k:'queso',say:'El queso. Se hace con leche.'},{k:'miel',say:'La miel. La hacen las abejas.'},{k:'aceite',say:'El aceite de oliva. Se hace con aceitunas.'},{k:'dulces',say:['Las golosinas. Son ricas, pero son para de vez en cuando.','Las chucherías. Son ricas, pero son para de vez en cuando.']}],
 games:[{t:'conocer'},
  {t:'origen',icon:'vaca',name:'¿Animal o planta?',make:(d,t)=>Arrastra({rounds:2,key:'origen-alimentos',bg:t.bg,
    why:(it,z)=>z.id==='animal'?cap(nameT(it.k))+' viene de una planta.':cap(nameT(it.k))+' viene de un animal.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='animal'?' viene de un animal.':' viene de una planta.'),
    gen(){const a=shuffle(['huevo','leche','queso','pescado','miel','carne']).slice(0,AGE()<=4?2:3),p=shuffle(['arroz','legumbres','aceite','pan','manzana','zanahoria']).slice(0,AGE()<=4?2:3);
      return {ask:'¿De dónde viene cada comida? Lo que viene de los animales va con la vaca. Lo que viene de las plantas va con la planta.',zones:[{id:'animal',x:560,y:440,w:380,h:220,c:'#FFE3B0',icon:zoneIcon('vaca')},{id:'planta',x:1240,y:440,w:380,h:220,c:'#C9EBB5',icon:zoneIcon('plantita')}],
        items:[...a.map(k=>({k,zone:'animal'})),...p.map(k=>({k,zone:'planta'}))],tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'une',icon:'abeja',name:'¿Quién nos lo da?',make:(d,t)=>Une({pairs:[['huevo','gallina'],['leche','vaca'],['miel','abeja'],['pan','trigo'],['aceite','aceituna'],['zumo','naranja']],bg:t.bg,key:'origen-alimentos',ask:'Uní cada comida con quién nos la da. Arrastrá de una a la otra.',okSay:(a,b)=>cap(nameT(a))+' viene '+dela(b)+'.',why:(a,b)=>'Mmm, '+nameT(a)+' no viene '+dela(b)+'.'},d)},
  {t:'plato',icon:'dulces',name:'Todos los días o a veces',make:(d,t)=>Arrastra({rounds:2,key:'comer-sano',bg:t.bg,
    why:(it,z)=>z.id==='siempre'?cap(nameT(it.k))+' es rico, pero tiene mucha azúcar. Es para de vez en cuando.':cap(nameT(it.k))+' es sano. ¡Lo podemos comer todos los días!',placeSay:(it,z)=>z.id==='siempre'?'¡Sí! '+cap(nameT(it.k))+' nos hace crecer sanos.':'¡Sí! '+cap(nameT(it.k))+', solo de vez en cuando.',
    gen(){const s=shuffle(['manzana','zanahoria','pescado','legumbres','brocoli','arroz','leche','pera']).slice(0,AGE()<=4?2:3),v=shuffle(['dulces','chocolate','helado','tarta','galleta']).slice(0,2);
      return {ask:'Lo sano lo comemos todos los días. Los dulces, solo de vez en cuando. Llevá cada comida a su lugar.',zones:[{id:'siempre',x:560,y:440,w:380,h:220,c:'#C9EBB5',icon:zoneIcon('macedonia')},{id:'aveces',x:1240,y:440,w:380,h:220,c:'#FBD3E4',icon:zoneIcon('dulces')}],
        items:[...s.map(k=>({k,zone:'siempre'})),...v.map(k=>({k,zone:'aveces'}))],tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'memoria'}]},
{id:'5A-T5',n:'Las fiestas del año',icon:'fuegos',c:'#9B8AD9',trim:2,bg:BG.fiesta,
 words:[{k:'corona',say:'La corona. En enero llegan los Reyes Magos con regalos.'},{k:'antifaz',say:'El antifaz. En carnaval nos disfrazamos.'},{k:'libro',say:'El libro. El Día del Libro regalamos cuentos.'},{k:'rosaFlor',say:'La rosa. En Sant Jordi se regala una rosa y un libro.'},{k:'tarta',say:['La torta. En el cumpleaños soplamos las velitas.','La tarta. En el cumpleaños soplamos las velas.']},
  {k:'arbolNavidad',say:'El árbol de Navidad. En diciembre lo decoramos con luces.'},{k:'fuegos',say:'Los fuegos artificiales. Iluminan el cielo en las fiestas.'},{k:'regalo',say:'El regalo. ¡Qué lindo es regalar!'}],
 games:[{t:'conocer'},
  {t:'ordena',icon:'calendario',name:'Las fiestas en orden',make:(d,t)=>Secuencia({bg:t.bg,key:'fiestas-orden',panels:['corona','antifaz','libro','arbolNavidad'].map(k=>({name:{corona:'los Reyes',antifaz:'el carnaval',libro:'el Día del Libro',arbolNavidad:'la Navidad'}[k],draw:(x,y,s)=>{card(x-s*.46,y-s*.46,s*.92,s*.92,'#FFFBF2',0,s*.12);pic(k,x,y-s*.06,s*.66);text({corona:'ENERO',antifaz:'FEBRERO',libro:'ABRIL',arbolNavidad:'DICIEMBRE'}[k],x,y+s*.4,s*.12,K,{f:LF})}})),first:true,
    ask:'Ordená las fiestas del año. Empezamos en enero con los Reyes Magos.',okAll:'¡Muy bien! Los Reyes en enero, el carnaval en febrero, el Día del Libro en abril y la Navidad en diciembre.'},d)},
  {t:'que',icon:'antifaz',name:'¿Qué usamos en la fiesta?',make:(d,t)=>{const Q=shuffle([['antifaz','¿Qué nos ponemos en carnaval?',['arbolNavidad','libro','tarta']],['arbolNavidad','¿Qué decoramos en Navidad?',['antifaz','rosaFlor','corona']],['libro','¿Qué regalamos el Día del Libro?',['tarta','antifaz','arbolNavidad']],['tarta','¿Qué tiene velitas en el cumpleaños?',['libro','corona','antifaz']],['corona','¿Qué llevan los Reyes Magos en la cabeza?',['antifaz','tarta','libro']]]);
    return ChoiceGame({rounds:5,bg:t.bg,key:()=>'fiestas',y:560,big:true,gen(i){const q=Q[i%Q.length];return {words:[q[0],...q[2].slice(0,nOpts()-1)],ok:[q[0]],ask:q[1],okSay:()=>'¡Sí! '+cap(nameT(q[0]))+'.',badSay:w=>eseEs(w)+'. '+q[1]}}},d)}},
  {t:'memoria'}]},
{id:'5A-T6',n:'El universo',icon:'saturno',c:'#2E3F7A',trim:2,bg:BG.espacio,
 words:[{k:'sol',say:'El sol. Es una estrella gigante que nos da luz y calor.'},{k:'tierra',say:'La Tierra. Es nuestro planeta. Gira y gira alrededor del sol.'},{k:'luna',say:'La luna. Gira alrededor de la Tierra. De noche la vemos brillar.'},{k:'marte',say:'Marte. Es el planeta rojo.'},{k:'jupiter',say:'Júpiter. Es el planeta más grande de todos.'},
  {k:'saturno',say:'Saturno. Tiene unos anillos enormes.'},{k:'estrella',say:'Las estrellas. Están muy, muy lejos. ¡Por eso las vemos chiquitas!'},{k:'cohete',say:'El cohete. Lleva a los astronautas al espacio.'},{k:'astronauta',say:'La astronauta. Viaja al espacio con un traje especial.'},{k:'telescopio',say:'El telescopio. Sirve para mirar las estrellas de cerca.'}],
 games:[{t:'conocer'},{t:'gira',icon:'tierra',name:'El día y la noche',make:(d,t)=>Gira({rounds:4},d)},
  {t:'estrellas',icon:'estrella',name:'Contar estrellas',make:(d,t)=>Cuenta({pool:['estrella','cohete','luna'],bg:t.bg,max:AGE()>=5?10:6},d)},
  {t:'planetas',icon:'jupiter',name:'Del más chico al más grande',make:(d,t)=>Arrastra({rounds:2,key:'tamanos',bg:t.bg,noCard:true,
    why:()=>'Mmm, ese lugar es de otro tamaño. Mirá bien los cuadros.',placeSay:it=>cap(nameT(it.k))+'.',
    gen(i){const set=i?['luna','tierra','jupiter']:['marte','tierra','jupiter'];return {ask:'Ordená los planetas del más chico al más grande.',zones:[sizeSlot('s0',560,170),sizeSlot('s1',900,240),sizeSlot('s2',1300,330)],
      items:set.map((k,j)=>({k,zone:'s'+j,s:[130,170,230][j]})),tray:{x0:460,x1:1400,y:780},okAll:i?'¡Muy bien! La luna es más chica que la Tierra, y Júpiter es el más grande.':'¡Muy bien! Marte es chiquito, la Tierra es mediana y Júpiter es enorme.'}}},d)}]},
{id:'5A-T7',n:'Los dinosaurios',icon:'tiranosaurio',c:'#5FA84E',trim:2,bg:BG.prehistoria,
 words:[{k:'tiranosaurio',say:'El tiranosaurio. Tenía dientes enormes y comía carne.'},{k:'diplodoco',say:'El diplodoco. Tenía un cuello larguísimo y comía hojas.'},{k:'triceratops',say:'El triceratops. Tenía tres cuernos en la cabeza y comía plantas.'},{k:'pterodactilo',say:'El pterodáctilo. Volaba por el cielo con sus alas grandes.'},
  {k:'huevoDino',say:'El huevo de dinosaurio. Los dinosaurios nacían de huevos.'},{k:'fosil',say:'El fósil. Es una huella de hace muchísimo tiempo, guardada en la piedra.'},{k:'volcan',say:'El volcán. En la época de los dinosaurios había muchos.'}],
 games:[{t:'conocer'},
  {t:'excava',icon:'fosil',name:'Buscar fósiles',make:(d,t)=>Excava({pool:['fosil','hueso','huevoDino','tiranosaurio','triceratops','diplodoco'],bg:t.bg,cover:'#C9A06B',cover2:'#B88A55',under:'#E9D1A6',intro:'Somos paleontólogos. Frotá la tierra para descubrir lo que dejaron los dinosaurios.'},d)},
  {t:'comen',icon:'diplodoco',name:'¿Qué comía?',make:(d,t)=>Arrastra({rounds:1,key:'dinos',bg:t.bg,
    why:(it,z)=>z.id==='plantas'?cap(nameT(it.k))+' comía carne.':cap(nameT(it.k))+' comía plantas.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='plantas'?' comía plantas.':' comía carne.'),
    gen(){return {ask:'¿Qué comía cada dinosaurio? Los que comían plantas van con las hojas. Los que comían carne van con la carne.',zones:[{id:'plantas',x:560,y:440,w:380,h:220,c:'#C9EBB5',icon:fern2},{id:'carne',x:1240,y:440,w:380,h:220,c:'#FFD6D0',icon:zoneIcon('carne')}],
      items:[{k:'diplodoco',zone:'plantas'},{k:'triceratops',zone:'plantas'},{k:'tiranosaurio',zone:'carne'},{k:'pterodactilo',zone:'carne'}],tray:{x0:420,x1:1400,y:790},okAll:'¡Muy bien! El diplodoco y el triceratops comían plantas. El tiranosaurio y el pterodáctilo comían carne.'}}},d)},
  {t:'puzzle',icon:'triceratops',make:(d,t)=>Puzzle({list:['tiranosaurio','triceratops'],bg:t.bg},d)}]},
{id:'5A-T8',n:'Los animales y dónde viven',icon:'pulpo',c:'#3FC1B0',trim:2,bg:BG.mar,
 words:[{k:'pulpo',say:'El pulpo. Vive en el mar y tiene ocho brazos.'},{k:'ballena',say:'La ballena. Vive en el mar, pero respira aire.'},{k:'camello',say:'El camello. Vive en el desierto y aguanta mucho sin tomar agua.'},{k:'buho',say:'El búho. Vive en el bosque y sale de noche.'},{k:'lobo',say:'El lobo. Vive en el bosque y aúlla a la luna.'},
  {k:'pinguino',say:'El pingüino. Vive donde hace mucho frío.'},{k:'mono',say:'El mono. Vive en la selva, entre los árboles.'},{k:'cocodrilo',say:'El cocodrilo. Vive en los ríos de la selva.'}],
 games:[{t:'conocer'},
  {t:'habitats',icon:'iglu',name:'¿Dónde vive?',make:(d,t)=>Arrastra({rounds:AGE()>=5?3:2,key:'habitats',bg:t.bg,
    why:(it,z)=>cap(nameT(it.k))+' no vive en '+habZ[z.id].nm+'.',placeSay:(it,z)=>cap(nameT(it.k))+' vive en '+habZ[z.id].nm+'.',
    gen(i){const zs=[['mar','polo'],['selva','bosque'],['mar','bosque','polo']][i],its=[];zs.forEach(z=>shuffle(habZ[z].it).slice(0,2).forEach(k=>its.push({k,zone:z})));
      return {ask:'¿Dónde vive cada animal? Llevalo a su casa.',zones:zs.map((z,j,a)=>({id:z,x:900-(a.length-1)*230+j*460,y:440,w:360,h:220,c:habZ[z].c,icon:habZ[z].ic})),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'nacen',icon:'huevo',name:'¿Huevo o panza?',make:(d,t)=>Arrastra({rounds:2,key:'nacimiento',bg:BG.granja,
    why:(it,z)=>z.id==='huevo'?cap(nameT(it.k))+' crece en la panza de su mamá.':cap(nameT(it.k))+' nace de un huevo.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='huevo'?' nace de un huevo.':V([' crece en la panza de su mamá.',' crece en la tripa de su mamá.'])),
    gen(){const h=shuffle(['gallina','pato','cocodrilo','pinguino','tortuga','pajaro','rana']).slice(0,2),b=shuffle(['perro','gato','vaca','ballena','caballo','conejo','elefante']).slice(0,2);
      return {ask:V(['¿Cómo nacen? Algunos animales nacen de un huevo. Otros crecen en la panza de su mamá.','¿Cómo nacen? Algunos animales nacen de un huevo. Otros crecen en la tripa de su mamá.']),zones:[{id:'huevo',x:560,y:440,w:380,h:220,c:'#FFF3C4',icon:zoneIcon('huevo')},{id:'panza',x:1240,y:440,w:380,h:220,c:'#FBD3E4',icon:zoneIcon('bebe')}],
        items:[...h.map(k=>({k,zone:'huevo'})),...b.map(k=>({k,zone:'panza'}))],tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'sombras',icon:'buho',name:'¿De quién es la sombra?',make:(d,t)=>{const pool=shuffle(['pulpo','ballena','camello','buho','lobo','pinguino','mono','cocodrilo','jirafa','elefante']);return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'sombras',y:680,
    ref(r){refCard(900,300,320,320,()=>picS(r.k,900,300,280))},
    gen(i){const k=pool[i%pool.length],others=shuffle(pool.filter(x=>x!==k)).slice(0,nOpts()-1);return {k,words:[k,...others],ok:[k],ask:'¿De quién es esta sombra?',okSay:()=>'¡Sí! Es la sombra '+dela(k)+'.',badSay:w=>eseEs(w)+'. Mirá bien la forma.'}}},d)}}]},
{id:'5A-T9',n:'El tiempo y el clima',icon:'termometro',c:'#5BB8E6',trim:3,bg:BG.lluvia,
 words:[{k:'sol',say:'Hace sol. Hace calor y el cielo está despejado.'},{k:'nublado',say:'Está nublado. Las nubes tapan el sol.'},{k:'lluvia',say:'Llueve. Caen gotas de agua de las nubes.'},{k:'viento',say:'Hay viento. El aire sopla fuerte.'},{k:'nieve',say:'Nieva. Caen copos de nieve cuando hace mucho frío.'},
  {k:'rayo',say:'La tormenta. Hay rayos, truenos y mucha lluvia.'},{k:'arcoiris',say:'El arcoíris. Sale cuando hay sol y lluvia a la vez.'},{k:'termometro',say:'El termómetro. Nos dice si hace frío o calor.'}],
 games:[{t:'conocer'},
  {t:'ropa',icon:'paraguas',name:'¿Qué nos ponemos?',make:(d,t)=>{const Q=shuffle([['sol','gorra','Hace mucho sol. ¿Qué nos ponemos en la cabeza?'],['lluvia','paraguas','Llueve. ¿Qué llevamos para no mojarnos?'],['nieve','guantes','Nieva. ¿Qué nos ponemos en las manos?'],['viento','bufanda','Hay viento frío. ¿Qué nos ponemos en el cuello?'],['sol','gafas','Hay mucha luz de sol. ¿Qué nos ponemos en los ojos?'],['lluvia','botasAgua','Llueve y hay charcos. ¿Qué nos ponemos en los pies?']]);
    return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'tiempo-ropa',y:680,ref(r){refCard(900,290,280,260,()=>pic(r.st,900,290,220))},
      gen(i){const q=Q[i%Q.length],others=shuffle(['gorra','paraguas','guantes','bufanda','gafas','botasAgua','gorro','remera'].filter(k=>k!==q[1]&&!(q[0]==='sol'&&['gorra','gafas','remera'].includes(k))&&!(q[0]==='nieve'&&k==='gorro'))).slice(0,nOpts()-1);
        return {st:q[0],words:[q[1],...others],ok:[q[1]],ask:q[2],okSay:()=>'¡Sí! '+cap(nameT(q[1]))+'.',badSay:w=>eseEs(w)+'. '+q[2]}}},d)}},
  {t:'arcoiris',icon:'arcoiris',name:'Los colores del arcoíris',make:(d,t)=>Secuencia({bg:t.bg,key:'arcoiris',panels:(AGE()<=4?['rojo','naranja','amarillo','verde','azul']:['rojo','naranja','amarillo','verde','celeste','azul','violeta']).map(swatch),
    ask:'Ordená los colores del arcoíris. Arriba de todo va el rojo.',okAll:AGE()<=4?'¡Muy bien! Rojo, naranja, amarillo, verde y azul.':'¡Muy bien! Rojo, naranja, amarillo, verde, celeste, azul y violeta.'},d)},
  {t:'termo',icon:'termometro',name:'¿Frío o calor?',make:(d,t)=>{const Q=shuffle([['playa',1,'En la playa hace calor. ¿Cómo está el termómetro?'],['muneco',0,'Hicimos un muñeco de nieve. ¿Cómo está el termómetro?'],['helado',1,'Tomamos helado porque hace calor. ¿Cómo está el termómetro?'],['iglu',0,'En el polo hace mucho frío. ¿Cómo está el termómetro?'],['banador',1,['Nos ponemos la malla porque hace calor. ¿Cómo está el termómetro?','Nos ponemos el bañador porque hace calor. ¿Cómo está el termómetro?']],['guantes',0,'Nos ponemos guantes porque hace frío. ¿Cómo está el termómetro?']]);
    return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'termometro',y:680,ref(r){refCard(900,290,280,260,()=>r.st==='playa'?(pic('sol',860,250,120),pic('pelotaPlaya',950,340,110)):pic(r.st,900,290,210))},
      gen(i){const q=Q[i%Q.length],A=thermo(.9),B=thermo(.15),ok=q[1]?A:B;return {st:q[0],words:[A,B],ok:[ok],ask:V(q[2]),okSay:()=>q[1]?'¡Sí! Cuando hace calor, el rojo sube.':'¡Sí! Cuando hace frío, el rojo baja.',badSay:()=>q[1]?'Ese termómetro marca frío. Cuando hace calor, el rojo sube.':'Ese termómetro marca calor. Cuando hace frío, el rojo baja.'}}},d)}}]},
{id:'5A-T10',n:'Los seres vivos',icon:'oruga',c:'#7CC86E',trim:3,bg:BG.primavera,season:'primavera',
 words:[{k:'semilla',say:'La semilla. De ella nace una planta nueva.'},{k:'plantaFruto',say:'La planta con frutos. Los frutos guardan semillas.'},{k:'huevo',say:'El huevo. Adentro crece el pollito.'},{k:'pollito',say:'El pollito. Sale del huevo y crece hasta ser gallina.'},{k:'gallina',say:'La gallina. Pone huevos, y así empieza otra vez.'},
  {k:'oruga',say:'La oruga. Come hojas, come y come, y después hace un capullo.'},{k:'mariposa',say:'La mariposa. Sale del capullo con sus alas nuevas.'}],
 games:[{t:'conocer'},
  {t:'ciclo',icon:'mariposa',name:'El ciclo de la vida',make:(d,t)=>Secuencia({bg:t.bg,key:'ciclos',sets:AGE()<=4?[['huevo','pollito','gallina'],['semilla','plantita','plantaFlor']]:[['semilla','brote','plantita','plantaFlor','plantaFruto'],['huevo','pollito','gallina'],[hojaHuevos,'oruga',capullo,'mariposa']],
    ask:'¿Cómo crece? Ordená del primero al último.',okAll:'¡Muy bien! Así crecen los seres vivos.'},d)},
  {t:'vivo',icon:'piedra',name:'¿Está vivo?',make:(d,t)=>Arrastra({rounds:2,key:'seres-vivos',bg:t.bg,
    why:(it,z)=>z.id==='vivo'?cap(nameT(it.k))+' no está vivo: no nace, no crece y no come.':cap(nameT(it.k))+' es un ser vivo: nace, crece y se alimenta.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='vivo'?' es un ser vivo.':' no está vivo.'),
    gen(){const v=shuffle(pVivo).slice(0,AGE()<=4?2:3),n=shuffle(pNoVivo).slice(0,2);return {ask:'Los seres vivos nacen, crecen y se alimentan. Llevá los seres vivos con el corazón y las cosas con la piedra.',
      zones:[{id:'vivo',x:560,y:440,w:380,h:220,c:'#C9EBB5',icon:zoneIcon('corazon')},{id:'cosa',x:1240,y:440,w:380,h:220,c:'#E4E9F2',icon:zoneIcon('piedra')}],items:[...v.map(k=>({k,zone:'vivo'})),...n.map(k=>({k,zone:'cosa'}))],tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'necesita',icon:'gota',name:'¿Qué necesita para vivir?',make:(d,t)=>{const Q=shuffle(NECES);return ChoiceGame({rounds:4,bg:t.bg,key:()=>'seres-vivos',y:680,ref(r){refCard(900,290,280,260,()=>pic(r.st,900,290,210))},
    gen(i){const q=Q[i%Q.length],ok=q[1][0],others=shuffle(NOVIVOS).slice(0,nOpts()-1);return {st:q[0],words:[ok,...others],ok:[ok],ask:q[2][0],okSay:()=>'¡Sí! '+q[2][1],badSay:w=>cap(nameT(w))+' no hace falta para vivir. '+q[2][0]}}},d)}},
  {t:'riega',icon:'regadera',make:(d,t)=>Riega({bg:BG.huerta,n:4},d)}]},
{id:'5A-T11',n:'Cuidamos el planeta',icon:'tierra',c:'#3FC1B0',trim:3,bg:BG.parque,
 words:[{k:'botellaPlastico',say:'La botella de plástico. Va al contenedor amarillo.'},{k:'lata',say:'La lata. También va al amarillo.'},{k:'periodico',say:['El diario. El papel va al contenedor azul.','El periódico. El papel va al contenedor azul.']},{k:'cajaCarton',say:'La caja de cartón. Va al azul.'},
  {k:'botellaVidrio',say:'La botella de vidrio. Va al contenedor verde.'},{k:'restoManzana',say:'Los restos de comida van al contenedor marrón.'},{k:'grifo',say:['La canilla. Hay que cerrarla para no gastar agua.','El grifo. Hay que cerrarlo para no gastar agua.']},{k:'bombilla',say:['La lamparita. Apagamos la luz cuando no la usamos.','La bombilla. Apagamos la luz cuando no la usamos.']}],
 games:[{t:'conocer'},
  {t:'recicla',icon:'botellaPlastico',name:'A reciclar',make:(d,t)=>Arrastra({rounds:AGE()>=5?3:2,key:'reciclar',bg:t.bg,
    why:(it,z)=>'Mmm, '+nameT(it.k)+' no va en '+BINS[z.id].n+'. '+BINSAY[binOf(it.k)],placeSay:(it,z)=>cap(nameT(it.k))+' va en '+BINS[z.id].n+'.',
    gen(i){const bs=[['amarillo','azul'],['verde','marron'],['amarillo','azul','verde','marron']][i],per=bs.length>2?1:2,its=[];bs.forEach(b=>shuffle(BINS[b].it).slice(0,per).forEach(k=>its.push({k,zone:b})));
      return {ask:i<2?'Vamos a reciclar. '+BINSAY[bs[0]]+' '+BINSAY[bs[1]]:'¡Ahora con los cuatro contenedores! Llevá cada cosa a su lugar.',zones:bs.map((b,j,a)=>({id:b,x:900-(a.length-1)*(a.length>2?170:230)+j*(a.length>2?340:460),y:430,w:240,h:260,draw:binDraw(BINS[b].c,BINS[b].lb),slot:n=>[900-(a.length-1)*(a.length>2?170:230)+j*(a.length>2?340:460)+(n%2?40:-40),420],ps:.55})),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'apaga',icon:'bombilla',name:'Ahorramos agua y luz',make:(d,t)=>Apaga({spots:[{t:'luz',x:500,y:250},{t:'luz',x:1150,y:250},{t:'grifo',x:420,y:620},{t:'tele',x:1200,y:620}].slice(0,AGE()<=4?3:4),bg:BG.casa,key:'ahorro',
    intro:'Nadie está usando estas cosas. ¡Apaguémoslas para cuidar el planeta! Tocá cada una.',say:{luz:'¡Luz apagada!',grifo:V(['¡Canilla cerrada! Así no se gasta el agua.','¡Grifo cerrado! Así no se gasta el agua.']),tele:'¡Tele apagada!'},okAll:'¡Muy bien! Así ahorramos agua y luz.'},d)},
  {t:'limpia',icon:'parque',name:'Limpiamos el parque',make:(d,t)=>Arrastra({rounds:1,key:'reciclar',bg:t.bg,sayPick:false,
    why:(it)=>it.zone==='no'?cap(nameT(it.k))+' es parte del parque. ¡Se queda!':V(['Eso va al tacho de basura.','Eso va a la papelera.']),
    gen(){const P=shuffle([[420,560],[640,700],[860,560],[1080,720],[1300,560],[520,780],[1220,800]]);const trash=shuffle(['botellaPlastico','lata','periodico','restoManzana','cascara']).slice(0,AGE()<=4?3:4),keep=['flor','mariposa','ardilla'].slice(0,AGE()<=4?2:3);
      const its=[...trash.map(k=>({k,zone:'tacho'})),...keep.map(k=>({k,zone:'no'}))].map((o,j)=>Object.assign(o,{x:P[j][0],y:P[j][1],s:140}));
      return {ask:V(['¡Alguien dejó basura en el parque! Llevá la basura al tacho. Las flores y los animales se quedan.','¡Alguien dejó basura en el parque! Lleva la basura a la papelera. Las flores y los animales se quedan.']),
        zones:[{id:'tacho',x:1440,y:300,w:200,h:240,draw:binDraw('#7CC86E',(x,y,s)=>pic('tierra',x,y,s*.8)),slot:()=>[1440,280],ps:.4}],items:its,okAll:'¡El parque quedó limpito! Gracias por cuidar el planeta.'}}},d)},
  {t:'busca'}]},
{id:'5A-T12',n:'De viaje con cuidado',icon:'maleta',c:'#FFA94D',trim:3,bg:BG.calle,season:'verano',
 words:[{k:'semaforo',say:'El semáforo. Verde, podemos cruzar. Rojo, esperamos.'},{k:'pasoCebra',say:['La senda peatonal. Cruzamos por acá, de la mano de un adulto.','El paso de cebra. Cruzamos por aquí, de la mano de un adulto.']},{k:'stop',say:['La señal de pare. Los autos tienen que frenar.','La señal de stop. Los coches tienen que parar.']},
  {k:'casco',say:'El casco. Lo usamos para andar en bici.'},{k:'cinturon',say:'El cinturón. En el auto siempre lo abrochamos.'},{k:'maleta',say:['La valija. Guardamos la ropa para el viaje.','La maleta. Guardamos la ropa para el viaje.']},{k:'mapa',say:'El mapa. Nos muestra el camino.'}],
 games:[{t:'conocer'},
  {t:'cruce',icon:'mapa',name:'¿Derecha o izquierda?',make:(d,t)=>Cruce({places:['escuela','parque','hospital','tienda','piscina','casa'],rounds:4},d)},
  {t:'seguro',icon:'casco',name:'¿Qué nos cuida?',make:(d,t)=>{const Q=shuffle([['bici','casco','Vamos en bici. ¿Qué nos ponemos en la cabeza?'],['auto','cinturon','Subimos al auto. ¿Qué nos abrochamos?'],['semaforo','pasoCebra','Queremos cruzar la calle. ¿Por dónde cruzamos?'],['moto','casco','Vamos en moto. ¿Qué nos protege la cabeza?']]);
    return ChoiceGame({rounds:4,bg:t.bg,key:()=>'vial',y:680,ref(r){refCard(900,290,280,260,()=>pic(r.st,900,290,210))},
      gen(i){const q=Q[i%Q.length],others=shuffle(['casco','cinturon','pasoCebra','pelota','gorra','maleta'].filter(k=>k!==q[1])).slice(0,nOpts()-1);return {st:q[0],words:[q[1],...others],ok:[q[1]],ask:V(q[2]),okSay:()=>'¡Sí! '+cap(nameT(q[1]))+'. ¡Así viajamos seguros!',badSay:w=>eseEs(w)+'. '+V(q[2])}}},d)}},
  {t:'maleta',icon:'maleta',name:'Armamos la valija',make:(d,t)=>Arrastra({rounds:2,key:'maleta',bg:BG.casa,
    why:(it,z)=>z.id==='playa'?cap(nameT(it.k))+' es para la nieve.':cap(nameT(it.k))+' es para la playa.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='playa'?', para la playa.':', para la nieve.'),
    gen(){const p=shuffle(['banador','gafas','crema','cubo','pelotaPlaya','gorra']).slice(0,AGE()<=4?2:3),n=shuffle(['gorro','guantes','esquis','abrigo','bufanda','trineo']).slice(0,AGE()<=4?2:3);
      return {ask:V(['Nos vamos de vacaciones. ¿Qué llevamos a la playa y qué llevamos a la nieve? Llevá cada cosa a su valija.','Nos vamos de vacaciones. ¿Qué llevamos a la playa y qué llevamos a la nieve? Lleva cada cosa a su maleta.']),
        zones:[{id:'playa',x:560,y:440,w:380,h:220,c:'#FFE6A8',icon:zoneIcon('concha')},{id:'nieve',x:1240,y:440,w:380,h:220,c:'#E3F2FA',icon:zoneIcon('copo')}],items:[...p.map(k=>({k,zone:'playa'})),...n.map(k=>({k,zone:'nieve'}))],tray:{x0:380,x1:1440,y:790}}}},d)}]}
];

/* ---------- Rincón de los Conceptos (5 años) ---------- */
const C5={id:'5A-C',n:'Rincón de los Conceptos',icon:'formas',c:'#9B8AD9',trim:0,bg:BG.conceptos,concepts:true,
 games:[
  {t:'mezclas',icon:'pinturas',name:'Mezclar colores',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'mezclas',y:680,
    ref(r){card(470,170,660,260,'#fff',7,40);swatch(r.q[0]).draw(620,300,200);text('+',800,330,110,K,{f:LF});swatch(r.q[1]).draw(980,300,200);const p=1+Math.sin(T*5)*.06;ctx.save();ctx.translate(1240,300);ctx.scale(p,p);text('=',-60,30,90,K,{f:LF});circ(40,0,70,'#FFF3B0',6,'#FFC93C');text('?',40,30,90,'#FFA94D',{f:LF});ctx.restore()},
    gen(i){const pool=AGE()<=4?MIX.slice(0,3):MIX,q=pool[i%pool.length],A=swatch(q[2]),others=shuffle(['naranja','verde','violeta','rosa','gris','marron'].filter(c=>c!==q[2])).slice(0,nOpts()-1).map(swatch);
      return {q,words:[A,...others],ok:[A],ask:cap(V(COLORES[q[0]].n))+' y '+V(COLORES[q[1]].n)+' mezclados... ¿qué color hacen?',okSay:()=>'¡Sí! '+cap(V(COLORES[q[0]].n))+' y '+V(COLORES[q[1]].n)+' hacen '+V(COLORES[q[2]].n)+'.',badSay:w=>'Ese es el '+V(w.name)+'. Pensá: '+V(COLORES[q[0]].n)+' y '+V(COLORES[q[1]].n)+'.'}}},d)},
  {t:'formas',icon:'formas',name:'¿Qué forma tiene?',make:(d,t)=>{const Q=shuffle(FORMQ);return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'formas',y:680,ref(r){refCard(900,290,280,260,()=>pic(r.st,900,290,210))},
    gen(i){const q=Q[i%Q.length],A=shape2(q[1],FCOL[q[1]]),others=shuffle(Object.keys(FCOL).filter(f=>f!==q[1]&&!(q[1]==='ovalo'&&f==='circulo')&&!(q[1]==='circulo'&&f==='ovalo')&&!(q[1]==='cuadrado'&&f==='rectangulo')&&!(q[1]==='rectangulo'&&f==='cuadrado'))).slice(0,nOpts()-1).map(f=>shape2(f,FCOL[f]));
      return {st:q[0],words:[A,...others],ok:[A],ask:V(q[2]),okSay:()=>'¡Sí! '+cap(A.name)+'.',badSay:w=>'Ese es '+w.name+'. '+V(q[2])}}},d)}},
  {t:'suma',icon:'manzana',name:'Sumar',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'sumar',y:700,
    ref(r){card(300,150,1200,330,'#fff',7,40);const s=r.a+r.b>6?82:100;rowOf(Array(r.a).fill(r.k),560,300,s,8);text('+',860,330,100,K,{f:LF});rowOf(Array(r.b).fill(r.k),1160,300,s,8);text(String(r.a)+' + '+String(r.b)+' = ?',900,450,56,'#5B8DEF',{f:LF})},
    gen(i){const mx=AGE()>=5?8:5,a=ri(1,Math.min(4,mx-1)),b=ri(1,Math.min(4,mx-a)),n=a+b,k=pick(['manzana','pelota','estrella','fresa','pato']),A=numObj(n);const ns=[n];while(ns.length<Math.min(3,nOpts()+1)){const v=ri(Math.max(1,n-2),Math.min(10,n+2));if(!ns.includes(v))ns.push(v)}
      return {a,b,k,words:[A,...ns.slice(1).map(numObj)],ok:[A],ask:cap(unN(a,k))+' y '+unN(b,k)+'. ¿Cuántos hay en total?'.replace('Cuántos',fem(k)?'Cuántas':'Cuántos'),okSay:()=>'¡Sí! '+cap(NUM[a])+' más '+NUM[b]+' son '+NUM[n]+'.',badSay:()=>'Mmm, contá todos juntos: '+Array.from({length:n},(_,j)=>NUM[j+1]).join(', ')+'.'}}},d)},
  {t:'resta',icon:'globo',name:'Restar',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'restar',y:700,
    ref(r){card(300,130,1200,360,'#fff',7,40);const s=r.a>6?110:130;for(let j=0;j<r.a;j++){const x=900-(r.a-1)*(s+10)/2+j*(s+10),gone=j>=r.a-r.b,fy=gone?-Math.min(120,((T-r.t0)*40)%160):0;ctx.globalAlpha=gone?.45:1;pic('globo',x,300+fy,s);ctx.globalAlpha=1;if(gone){ctx.beginPath();ctx.moveTo(x-s*.3,300-s*.3+fy);ctx.lineTo(x+s*.3,300+s*.3+fy);ctx.lineWidth=8;ctx.strokeStyle='#FF5A5A';ctx.stroke()}}
      text(String(r.a)+' − '+String(r.b)+' = ?',900,460,56,'#5B8DEF',{f:LF})},
    gen(i){const mx=AGE()>=5?7:5,a=ri(3,mx),b=ri(1,a-1),n=a-b,A=numObj(n);const ns=[n];while(ns.length<Math.min(3,nOpts()+1)){const v=ri(Math.max(0,n-2),n+2);if(!ns.includes(v))ns.push(v)}
      return {a,b,t0:T,words:[A,...ns.slice(1).map(numObj)],ok:[A],ask:'Teníamos '+NUM[a]+' globos y se volaron '+NUM[b]+'. ¿Cuántos quedan?',okSay:()=>'¡Sí! Quedan '+NUM[n]+'.',badSay:()=>'Mmm, contá solo los globos que quedaron.'}}},d)},
  {t:'fila',icon:'pato',name:'Primero y último',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'ordinales',y:690,
    ref(r){card(240,170,1320,280,'#fff',7,40);pic('casa',1440,300,200);const n=r.row.length;r.row.forEach((k,j)=>{const x=1280-j*190;picF(k,x,320+Math.sin(T*4+j)*4,150,true);text(ORD[j].replace(/^el /,'').toUpperCase(),x,430,24,'#9B8AD9',{f:LF})})},
    gen(i){const n=AGE()>=5?5:4,row=shuffle(FILA).slice(0,n),q=i%3===0?0:i%3===1?n-1:ri(1,n-2),k=row[q],others=shuffle(row.filter(x=>x!==k)).slice(0,nOpts()-1),pos=q===n-1?'el último':ORD[q];
      return {row,words:[k,...others],ok:[k],ask:'Los animales hacen fila para entrar a la casa. ¿Quién es '+pos+' de la fila?',okSay:()=>'¡Sí! '+cap(nameT(k))+' es '+pos+'.',badSay:w=>cap(nameT(w))+' no es '+pos+'. El primero es el que está más cerca de la casa.'}}},d)},
  {t:'lados',icon:'gato',name:'Derecha, izquierda y entre',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'derecha-izquierda',y:690,
    ref(r){card(300,170,1200,300,'#fff',7,40);r.row.forEach((k,j)=>thing(k,600+j*300,320+Math.sin(T*3+j)*4,200));text(tx('IZQUIERDA'),400,450,26,'#9B8AD9',{f:LF});text('DERECHA',1400,450,26,'#9B8AD9',{f:LF})},
    gen(i){const row=shuffle(['gato','perro','pelota','conejo','pato','oso']).slice(0,3),q=i%3,k=q===0?row[1]:q===1?row[2]:row[0];
      const ask=q===0?'¿Quién está entre '+nameT(row[0])+' y '+nameT(row[2])+'?':q===1?'¿Quién está a la derecha '+dela(row[1])+'?':tx('¿Quién está a la izquierda ')+dela(row[1])+'?';
      return {row,words:row.slice(0,Math.max(2,nOpts())).includes(k)?row.slice(0,Math.max(2,nOpts())):[k,...row.filter(x=>x!==k).slice(0,1)],ok:[k],ask,okSay:()=>'¡Sí! '+cap(nameT(k))+'.',badSay:w=>eseEs(w)+'. '+ask}}},d)},
  {t:'pesado',icon:'pluma',name:'Pesado, liviano, grueso y delgado',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'pesado-grueso',y:520,big:true,
    gen(i){const q=i%4;if(q<2){const p=pick(PESO),A=p[0],B=p[1],ok=q===0?A:B,adj=q===0?'más pesado':V(['más liviano','más ligero']);return {words:[A,B],ok:[ok],ask:'¿Qué es '+adj+'?',okSay:()=>'¡Sí! '+cap(nameT(ok))+' es '+adj+'.',badSay:w=>cap(nameT(w))+' no es '+adj+'. ¿Qué es '+adj+'?'}}
      const mk=Math.random()<.5?trunk:bookOf,A=mk(.9),B=mk(.1),ok=q===2?A:B,adj=q===2?'más grueso':V(['más finito','más delgado']);return {words:[A,B],ok:[ok],ask:'¿Cuál es '+adj+'?',okSay:()=>'¡Sí! Ese es '+adj+'.',badSay:()=>'Mirá bien el ancho de cada uno. ¿Cuál es '+adj+'?'}}},d)},
  {t:'series',icon:'estrella',name:'Series difíciles',make:(d,t)=>Series({pool:shuffle(['circulo','triangulo','cuadrado','rombo','ovalo']).map(f=>shape2(f,FCOL[f])),bg:t.bg},d)}]};
