/* ================= CANCIONES ================= */
const DLYR=[['Lunes, empieza la semana.','Lunes, empieza la semana.'],'Martes, jugamos con ganas.','Miércoles, ¡ya estamos en la mitad!','Jueves, ¡qué bien se está!',['Viernes, último día de escuela.','Viernes, último día de cole.'],'Sábado, ¡a jugar y a pasear!','Domingo, en familia a descansar.'];
const SONGS={
  dias:()=>({tune:'dias',cols:7,s:170,intro:'¡Vamos a cantar la canción de los días de la semana! Escuchá.',ask2:'¡Ahora te toca a vos! Tocá los días en orden, empezando por el lunes.',okAll:'¡Bravo! ¡Los siete días de la semana!',
    lines:DIASL.map((d,i)=>({say:DLYR[i],draw:dayCard(i).draw,n:'el '+d,n2:cap(d)+'.'}))}),
  estaciones:()=>({tune:'estaciones',s:240,mode:AGE()<=3?'pedido':'orden',intro:'¡La canción de las estaciones! Escuchá.',ask2:AGE()<=3?'¡Ahora jugamos! Tocá la estación que te digo.':'¡Ahora te toca a vos! Tocá las estaciones en orden, como en la canción.',okAll:'¡Qué bien! Otoño, invierno, primavera y verano.',
    lines:[['otoño','En otoño, las hojas se caen. ¡Chas, chas!'],['invierno','En invierno hace frío. ¡Brrr, brrr!'],['primavera','En primavera salen las flores. ¡Qué lindo olor!'],['verano',['En verano hace calor. ¡A la pileta!','En verano hace calor. ¡A la piscina!']]].map(([e,l])=>({say:l,draw:(x,y,s)=>tree(x,y+s*.28,s/290,e),n:ESTS[e]}))}),
  colores:()=>{const C=[['rojo','fresa','Rojo como la fresa.'],['amarillo','sol','Amarillo como el sol.'],['azul','ballena','Azul como el mar.'],['verde','rana','Verde como la rana.'],['naranja','zanahoria','Naranja como la zanahoria.'],['rosa','cerdo',['Rosa como el chanchito.','Rosa como el cerdito.']],['violeta','uva',['Violeta como las uvas.','Morado como las uvas.']],['marron','chocolate','Marrón como el chocolate.']].slice(0,AGE()<=3?4:AGE()===4?6:8);
    return {tune:'colores',cols:C.length>4?4:4,s:200,mode:'pedido',intro:'¡La canción de los colores! Escuchá.',ask2:'¡Ahora jugamos! Tocá el color que te digo.',okAll:'¡Qué bien! ¡Sabés un montón de colores!',
      lines:C.map(([c,k,l])=>({say:l,draw:(x,y,s)=>{swatch(c).draw(x-s*.16,y+s*.14,s*.74);pic(k,x+s*.18,y-s*.12,s*.56)},n:'el '+V(COLORES[c].n)}))}},
  meses:()=>({tune:'meses',cols:6,s:170,intro:'¡La canción de los meses del año! Escuchá.',ask2:'¡Ahora te toca a vos! Tocá los meses en orden, empezando por enero.',okAll:'¡Bravo! ¡Los doce meses del año!',
    lines:MESES.map((m,i)=>({say:i===0?'Enero, ¡empieza el año!':i===11?'Y diciembre, ¡termina el año!':cap(m)+'.',draw:monthCard(i).draw,n:m,n2:cap(m)+'.'}))})
};

/* ================= RUTINAS Y HÁBITOS ================= */
const bubbles=(x,y,s,n=7)=>{for(let j=0;j<n;j++)circ(x+Math.cos(j*2.1)*s*.3,y+Math.sin(j*1.7)*s*.24,s*(.04+(j%3)*.02),'rgba(255,255,255,.85)',3,'#9ED9F5')};
const drops=(x,y,s)=>{for(let j=0;j<3;j++)ell(x-s*.06+j*s*.06,y+j*s*.07,s*.025,s*.04,'#5BB8E6',2)};
const RP={
  mojar:panel(['mojamos las manos','mojamos las manos'],[['grifo',-.08,-.16,.58],['manos',.04,.24,.46]],(x,y,s)=>drops(x-s*.18,y-s*.02,s)),
  jabon:panel('el jabón',[['jabon',0,0,.7]]),
  frotar:panel('frotamos',[['manos',0,.02,.66]],(x,y,s)=>bubbles(x,y-s*.05,s)),
  secar:panel('secamos',[['toalla',0,0,.7]]),
  pasta:panel('la pasta de dientes',[['pastaDientes',0,0,.75]]),
  cepillar:panel('cepillamos',[['dientes',-.04,.08,.62],['cepillo',.2,-.22,.42]]),
  enjuagar:panel('nos enjuagamos',[['vaso',0,0,.7]]),
  sonrisa:panel('la sonrisa',[['cara',0,0,.72]],(x,y,s)=>{star(x+s*.28,y-s*.28,s*.07,'#FFC93C',3)})
};
const RUT={id:'X-RUT',n:'Rutinas y hábitos',icon:'manos',c:'#5BB8E6',trim:0,bg:BG.bano,zone:'extras',
 intro:'Las cosas que hacemos todos los días.',
 games:[
  {t:'manos',icon:'jabon',name:'Lavarse las manos',make:(d,t)=>Secuencia({bg:t.bg,key:'rutinas',panels:AGE()<=3?[RP.mojar,RP.frotar,RP.secar]:[RP.mojar,RP.jabon,RP.frotar,RP.secar],first:true,
    ask:'¿Cómo nos lavamos las manos? Ordená del primero al último.',okAll:'¡Muy bien! Mojamos, ponemos jabón, frotamos y secamos. ¡Manos limpitas!'},d)},
  {t:'frotaManos',icon:'manos',name:'¡Chau, bichitos!',make:(d,t)=>Frota({spots:[[770,560,42],[1030,560,42],[800,420,36],[1000,420,36],[730,300,30],[1070,300,30]].slice(0,AGE()<=3?4:6),bg:t.bg,base:()=>pic('manos',900,470,620),spot:germ,tool:()=>pic('jabon',0,0,130),key:'rutinas',
    intro:'¡Las manos tienen bichitos! Frotá con el jabón hasta que no quede ninguno.',okAll:'¡Manos limpitas! Antes de comer y después de ir al baño, nos lavamos las manos.'},d)},
  {t:'dientes',icon:'cepillo',name:'Lavarse los dientes',make:(d,t)=>Secuencia({bg:t.bg,key:'rutinas',panels:AGE()<=3?[RP.pasta,RP.cepillar,RP.enjuagar]:[RP.pasta,RP.cepillar,RP.enjuagar,RP.sonrisa],first:true,
    ask:'¿Cómo nos lavamos los dientes? Ordená del primero al último.',okAll:'¡Muy bien! Pasta, cepillo, agua... ¡y una sonrisa brillante!'},d)},
  {t:'frotaDientes',icon:'dientes',name:'Dientes limpitos',make:(d,t)=>Frota({spots:[[760,400,30],[900,380,30],[1040,400,30],[790,600,28],[900,615,28],[1010,600,28]].slice(0,AGE()<=3?4:6),bg:t.bg,base:()=>pic('dientes',900,480,640),spot:germ,tool:()=>pic('cepillo',0,0,150),key:'rutinas',
    intro:'¡Hay bichitos en los dientes! Cepillá arriba y abajo hasta que se vayan.',okAll:'¡Dientes limpitos! Nos cepillamos después de comer y antes de dormir.'},d)},
  {t:'juguetes',icon:'baul',name:'Ordenar los juguetes',make:(d,t)=>Arrastra({rounds:1,key:'rutinas',bg:BG.dormitorio,sayPick:true,
    gen(){const P=shuffle([[420,560],[640,720],[820,520],[560,380],[760,820],[980,700],[400,780]]),ks=shuffle(['pelota','peluche','bloques','robot','muneca','trenJuguete','cuento','xilofono']).slice(0,AGE()<=3?4:AGE()===4?5:6);
      return {ask:'¡Qué lío! Guardemos los juguetes en el baúl.',zones:[{id:'baul',x:1300,y:520,w:360,h:320,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}pic('baul',1300,520,400);ctx.restore()},slot:n=>[1230+(n%3)*70,470-Math.floor(n/3)*30],ps:.45}],
        items:ks.map((k,j)=>({k,zone:'baul',x:P[j][0],y:P[j][1],s:150})),okAll:'¡Todo ordenado! ¡Qué lindo queda el cuarto!'}}},d)},
  {t:'dormir',icon:'cama',name:'Antes de dormir',make:(d,t)=>Secuencia({bg:BG.dormitorio,key:'rutinas',panels:AGE()<=3?['banera','pijama','cama']:AGE()===4?['banera','pijama','cuento','cama']:['cena','banera','pijama','cepillo','cuento','cama'],first:true,
    ask:'¿Qué hacemos antes de dormir? Ordená del primero al último.',okAll:'¡Muy bien! Y al final, a la cama. ¡Buenas noches!'},d)}]};

/* ================= TRAZOS ================= */
const lineP=(x0,y0,x1,y1,n=60)=>pathPts(t=>[lerp(x0,x1,t),lerp(y0,y1,t)],n);
const polyP=(P,n=24)=>{const out=[];for(let i=0;i<P.length-1;i++)for(let j=0;j<(i===P.length-2?n+1:n);j++){const t=j/n;out.push([lerp(P[i][0],P[i+1][0],t),lerp(P[i][1],P[i+1][1],t)])}return out};
BG.trazo=()=>{sky('#FFFDF6','#FFF6E6');ctx.strokeStyle='rgba(91,141,239,.12)';ctx.lineWidth=3;for(let y=180;y<880;y+=60){ctx.beginPath();ctx.moveTo(280,y);ctx.lineTo(1560,y);ctx.stroke()}};
const TRZ_L=()=>{const a3=AGE()<=3;return [
  {n:'Líneas acostadas',icon:'abeja',paths:(a3?[360,620]:[300,500,700]).map((y,j)=>({pts:lineP(430,y,1290,y),who:'abeja',end:'flor',ex:80,c:DIAC[j],say:j?'¡Otra abeja! Llevala a su flor.':'La abeja quiere llegar a la flor. Empezá en el punto verde y seguí el camino.'}))},
  {n:'Líneas paradas',icon:'gota',bg:()=>{BG.trazo();for(const x of[500,900,1300])cloud(x-70,170,.8,'#CFE0FF')},paths:(a3?[650,1150]:[500,900,1300]).map((x,j)=>({pts:lineP(x,240,x,700),who:'gota',ws:90,end:'maceta',ey:80,c:'#5BB8E6',say:j?'Otra gota. ¡De arriba para abajo!':'¡Hagamos llover! Llevá la gota desde la nube hasta la maceta, de arriba para abajo.'}))},
  {n:'Líneas inclinadas',icon:'tobogan',paths:[[460,230,1180,720],[1340,230,620,720],[460,720,1180,230]].slice(0,a3?2:3).map(([a,b,c,e],j)=>({pts:lineP(a,b,c,e),who:'pelota',ws:100,end:'perro',ex:j===1?-60:60,c:DIAC[j+3],say:j?'¡Otra vez! Llevá la pelota hasta el perro.':'La pelota baja por el tobogán. Llevala hasta el perro.'}))},
  {n:'Curvas',icon:'arcoiris',paths:[[440,'#FF5A5A'],[340,'#FFC93C'],[240,'#5B8DEF']].slice(0,a3?2:3).map(([r,c],j)=>({pts:pathPts(t=>[900+Math.cos(PI+t*PI)*r,760+Math.sin(PI+t*PI)*r],70),who:'pajaro',ws:110,end:'nube',ex:40,c,say:j?'¡Otro color del arcoíris!':'¡Pintemos un arcoíris! Seguí la curva de un lado al otro.'}))},
  {n:'Olas',icon:'barco',bg:()=>{BG.trazo();ctx.fillStyle='rgba(127,211,240,.25)';ctx.fillRect(280,260,1280,520)},paths:(a3?[420]:[340,620]).map((y,j)=>({pts:pathPts(t=>[420+t*940,y+Math.sin(t*PI*4)*60],90),who:'barco',ws:130,end:'concha',ex:80,c:'#3FA597',say:j?'¡Otra ola!':'El barco navega sobre las olas. Seguí el camino que sube y baja.'}))},
  {n:'Zigzag',icon:'conejo',paths:(a3?[[650,300]]:[[620,300],[780,460]]).map(([y1,y0],j)=>({pts:polyP(Array.from({length:7},(_,q)=>[420+q*150,q%2?y0:y1]).map(([x,y])=>[x,y+(j?100:0)])),who:'conejo',ws:120,end:'zanahoria',ex:80,c:'#FFA94D',say:j?'¡Otra montaña!':'El conejo salta las montañas. Subí y bajá, en zigzag.'}))},
  {n:'Bucles',icon:'mariposa',paths:[0,1].slice(0,a3?1:2).map(j=>({pts:pathPts(t=>{const a=t*PI*2*(a3?3:4);return[440+t*(a3?760:880)-60*Math.sin(a),(j?640:420)-60*(1-Math.cos(a))]},140),who:'mariposa',ws:110,end:'flor',ex:80,c:'#F58BB4',say:j?'¡Otra vez, con muchas vueltas!':'La mariposa vuela dando vueltitas. Seguí el camino con rulos.'}))},
  {n:'Espiral',icon:'caracol',paths:[{pts:pathPts(t=>{const a=t*PI*2*(a3?2:2.6),r=290*(1-t)+24;return[900+Math.cos(a+PI)*r*1.25,500+Math.sin(a+PI)*r]},160),who:'caracol',ws:110,end:'lechuga',es:110,c:'#9B8AD9',say:'El caracol va dando vueltas hasta la lechuga del medio. Seguí la espiral.',ok:'¡Lo lograste! Con estos trazos tu mano ya está lista para escribir letras. ¡Probalas en Letrilandia!'}]}]};
const TRZ={id:'X-TRZ',n:'Los trazos',icon:'pizarra',c:'#5B8DEF',trim:0,bg:BG.trazo,zone:'extras',seq:true,
 intro:'Con los trazos preparamos la mano para escribir. Se juegan en orden: cuando terminás uno, se abre el siguiente.',
 games:Array.from({length:8},(_,j)=>({t:'trazo',lv:j,icon:['abeja','gota','tobogan','arcoiris','barco','conejo','mariposa','caracol'][j],name:['Líneas acostadas','Líneas paradas','Líneas inclinadas','Curvas','Olas','Zigzag','Bucles','Espiral'][j],
   make:(d,t)=>{const L=TRZ_L()[j];return Tracer({paths:L.paths,bg:L.bg||t.bg,ask:'Seguí el camino con el dedo.'},d)}}))};

/* ================= CANCIONES (tema) ================= */
const CAN={id:'X-CAN',n:'Las canciones',icon:'notas',c:'#F58BB4',trim:0,bg:BG.fiesta,zone:'extras',
 games:[{t:'cancion',song:'dias',icon:'calendario',name:'Los días de la semana'},{t:'cancion',song:'estaciones',icon:'hojaNaranja',name:'Las estaciones'},{t:'cancion',song:'colores',icon:'pinturas',name:'Los colores'},{t:'cancion',song:'meses',icon:'tarta',name:'Los meses del año'}]};

/* ================= DÍAS ESPECIALES ================= */
const COSTUME={antifaz:[0,-495,230],narizPayaso:[0,-462,70],sombreroPirata:[0,-596,250],corona:[0,-600,190],sombreroCopa:[0,-626,230],gorroFiesta:[0,-626,190],varita:[196,-262,190],capa:[0,-300,430]};
const HATS=['sombreroPirata','corona','sombreroCopa','gorroFiesta'];
const costumeZone=(wear)=>({id:'kid',x:1000,y:560,w:440,h:720,draw:(z,hl)=>{const X=a=>1000+a*1.15,Y=b=>880+b*1.15;ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}
  if(wear.capa){const [a,b,s]=COSTUME.capa;pic('capa',X(a),Y(b),s*1.15)}drawKid(1000,880,1.15,{});ctx.restore();
  for(const k of['antifaz','narizPayaso','varita'])if(wear[k]){const [a,b,s]=COSTUME[k];pic(k,X(a),Y(b),s*1.15)}
  if(wear.hat){const [a,b,s]=COSTUME[wear.hat];pic(wear.hat,X(a),Y(b),s*1.15)}},slot:()=>[1000,500],ps:.01});
const freeDeco=(id,x,y,w,h,drawBase,slot)=>({id,x,y,w,h,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}drawBase();ctx.restore()},slot,ps:.5});
const FIESTAS=[
{id:'F-cumple',n:'El cumpleaños',icon:'tarta',c:'#F58BB4',trim:0,bg:BG.fiesta,zone:'fiestas',fiesta:true,
 words:[{k:'tarta'},{k:'vela'},{k:'regalo'},{k:'globo'},{k:'gorroFiesta'},{k:'serpentina'}],
 games:[{t:'velas',icon:'vela',name:'Soplar las velitas',make:(d,t)=>Velas({n:clamp(S.age||AGE(),3,6),bg:t.bg,intro:'¡Es una fiesta de cumpleaños! Soplá las velitas: tocá cada una y contamos.'},d)},
  {t:'decora',icon:'tarta',name:'Decorar la torta',make:(d,t)=>Arrastra({rounds:1,key:'fiesta',bg:t.bg,sayPick:true,
    gen(){return {free:true,ask:V(['¡Decoremos la torta! Poné arriba lo que más te guste. Cuando termines, tocá el botón verde.','¡Decoremos la tarta! Pon encima lo que más te guste. Cuando termines, toca el botón verde.']),
      zones:[freeDeco('torta',860,470,520,400,()=>{card(620,420,480,260,'#F58BB4',8,40);card(650,360,420,90,'#FFF6E6',7,30);card(560,670,600,36,'#E4D3B8',6,18)},n=>[680+(n%5)*90,380+Math.floor(n/5)*90])],
      items:['fresa','estrella','corazon','flor','vela','uva','fresa','vela'].map((k,j)=>({k,zone:'torta',x:j%2?420:250,y:180+Math.floor(j/2)*150,s:130}))}}},d)},
  {t:'cuenta',icon:'regalo',name:'Contar regalos',make:(d,t)=>Cuenta({pool:['regalo','globo','gorroFiesta'],bg:t.bg},d)},
  {t:'secuencia',icon:'carta',name:'Preparamos la fiesta',make:(d,t)=>Secuencia({bg:t.bg,key:'fiesta',panels:AGE()<=3?['carta','tarta','regalo']:['carta','globo','tarta','regalo'],first:true,ask:'¿Cómo preparamos la fiesta? Primero invitamos a los amigos con una carta. Ordená lo que viene después.',okAll:'¡Muy bien! Invitamos, decoramos con globos, soplamos las velas y abrimos los regalos.'},d)}]},
{id:'F-navidad',n:'La Navidad',icon:'arbolNavidad',c:'#5FA84E',trim:0,bg:BG.invierno,zone:'fiestas',fiesta:true,
 words:[{k:'arbolNavidad'},{k:'reno'},{k:'gorroNavidad'},{k:'regalo'},{k:'adorno'},{k:'campana'},{k:'vela'},{k:'estrella'}],
 games:[{t:'decora',icon:'adorno',name:'Decorar el árbol',make:(d,t)=>Arrastra({rounds:1,key:'fiesta',bg:t.bg,sayPick:true,
    gen(){return {free:true,ask:'¡Decoremos el árbol de Navidad! Poné los adornos donde quieras. Cuando termines, tocá el botón verde.',
      zones:[freeDeco('arbol',820,470,520,560,()=>{ctx.beginPath();ctx.moveTo(820,170);ctx.lineTo(1060,700);ctx.lineTo(580,700);ctx.closePath();fillStroke('#5FA84E',8);card(780,700,80,90,'#A86B43',7,10)},n=>[[820,200],[760,360],[880,360],[700,500],[820,480],[940,520],[650,640],[780,620],[900,640],[990,640]][n%10])],
      items:['estrella','adorno','adorno','campana','vela','adorno','regalo','campana'].map((k,j)=>({k,zone:'arbol',x:j%2?420:250,y:180+Math.floor(j/2)*150,s:120}))}}},d)},
  {t:'busca',icon:'reno'},{t:'cuenta',icon:'regalo',name:'Contar regalos',make:(d,t)=>Cuenta({pool:['regalo','adorno','estrella'],bg:t.bg},d)},{t:'memoria'}]},
{id:'F-carnaval',n:'El carnaval',icon:'antifaz',c:'#9B8AD9',trim:0,bg:BG.fiesta,zone:'fiestas',fiesta:true,
 words:[{k:'antifaz'},{k:'narizPayaso'},{k:'sombreroPirata'},{k:'capa'},{k:'corona'},{k:'varita'},{k:'serpentina'},{k:'sombreroCopa'}],
 games:[{t:'disfraz',icon:'capa',name:'Disfrazarse',make:(d,t)=>{const wear={};return Arrastra({rounds:1,key:'fiesta',bg:t.bg,sayPick:true,
    gen(){return {free:true,ask:'¡Es carnaval! Disfrazá al nene como quieras. Cuando termines, tocá el botón verde.',zones:[costumeZone(wear)],
      items:['antifaz','narizPayaso','sombreroPirata','corona','capa','varita','sombreroCopa','gorroFiesta'].map((k,j)=>({k,zone:'kid',x:j%2?640:420,y:180+Math.floor(j/2)*170,s:150})),
      onPlace:(it)=>{if(HATS.includes(it.k)){wear.hat=it.k;}else wear[it.k]=1;it.hidden=true}}}},d)}},
  {t:'atrapa',icon:'narizPayaso',name:'¡Atrapalos!',make:(d,t)=>Atrapa({targets:[{ask:'¡Atrapá los antifaces!',is:k=>k==='antifaz'},{ask:'¡Ahora las narices de payaso!',is:k=>k==='narizPayaso'}],pool:['antifaz','narizPayaso','serpentina','globo','corona','estrella'],bg:t.bg,key:'fiesta'},d)},
  {t:'memoria'},{t:'busca'}]},
{id:'F-libro',n:'El Día del Libro',icon:'libro',c:'#5B8DEF',trim:0,bg:BG.aula,zone:'fiestas',fiesta:true,
 words:[{k:'libro'},{k:'cerdito'},{k:'lobo'},{k:'casaPaja'},{k:'casaMadera'},{k:'casaLadrillo'},{k:'rosaFlor'}],
 games:[{t:'cerditos',icon:'cerdito',name:'Los tres chanchitos',make:(d,t)=>Secuencia({bg:t.bg,key:'cuentos',panels:['casaPaja','casaMadera','casaLadrillo'],first:true,
    ask:V(['¿Te acordás del cuento de los tres chanchitos? El lobo sopló las casas. Ordenalas como en el cuento: primero la de paja.','¿Te acuerdas del cuento de los tres cerditos? El lobo sopló las casas. Ordénalas como en el cuento: primero la de paja.']),okAll:'¡Muy bien! Paja, madera y ladrillo. ¡La casa de ladrillo no se cayó!'},d)},
  {t:'quien',icon:'lobo',name:'Preguntas del cuento',make:(d,t)=>{const Q=[['lobo','¿Quién sopló y sopló?',['cerdito','gato']],['casaLadrillo','¿Qué casa no se cayó?',['casaPaja','casaMadera']],['casaPaja','¿Qué casa se voló con un soplido?',['casaLadrillo','casaMadera']],['cerdito',V(['¿Quiénes construyeron las casas?','¿Quiénes construyeron las casas?']),['lobo','oso']]];
    return ChoiceGame({rounds:4,bg:t.bg,key:()=>'cuentos',y:560,big:true,gen(i){const q=Q[i];return {words:[q[0],...q[2].slice(0,nOpts()-1)],ok:[q[0]],ask:q[1],okSay:()=>'¡Sí! '+cap(nameT(q[0]))+'.',badSay:w=>eseEs(w)+'. '+q[1]}}},d)}},
  {t:'busca'},{t:'puzzle',icon:'cerdito',make:(d,t)=>Puzzle({list:['cerdito','libro'],bg:t.bg},d)}]}
];
Object.assign(LEX2,{cerdito:['el chanchito','el cerdito']});
Object.assign(LEX,{bloques:'los bloques',trenJuguete:'el trencito'});

/* ---------- cuentos y canciones como juegos ---------- */
for(const t of[...T3,...T4,...T5])if(typeof CUENTOS!=='undefined'&&CUENTOS[t.id]&&!t.games.some(g=>g.t==='cuento'))t.games.push({t:'cuento',icon:'libro',name:'El cuento'});
const _makeGame0=makeGame;
makeGame=function(g,t,onDone){
  if(g.t==='cuento')return Story(CUENTOS[t.id],{},onDone);
  if(g.t==='cancion')return Song(Object.assign({bg:t.bg,key:'cancion'},SONGS[g.song]()),onDone);
  return _makeGame0(g,t,onDone);
};
