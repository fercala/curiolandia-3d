/* ================= FONDOS NUEVOS ================= */
function bunting(y,n=16){ctx.beginPath();ctx.moveTo(0,y);for(let i=0;i<=n;i++)ctx.quadraticCurveTo(i*W/n-W/n/2,y+30,i*W/n,y);ctx.lineWidth=4;ctx.strokeStyle=K;ctx.stroke();for(let i=0;i<n;i++){const x=i*W/n+W/n/2;ctx.beginPath();ctx.moveTo(x-30,y+16);ctx.lineTo(x+30,y+16);ctx.lineTo(x,y+70);ctx.closePath();fillStroke(DIAC[i%7],4)}}
function fern(x,y,s,c='#5FA84E'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);for(let i=-3;i<=3;i++){ctx.save();ctx.rotate(i*.32);ell(0,-60,16,62,c,4);ctx.restore()}ctx.restore()}
function acacia(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineWidth=18;ctx.strokeStyle='#8A5A3C';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-120);ctx.lineTo(-50,-180);ctx.moveTo(0,-120);ctx.lineTo(60,-185);ctx.stroke();ell(0,-200,170,40,'#7CB342',5);ctx.restore()}
function palm(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(20,-100,10,-200);ctx.lineTo(26,-200);ctx.quadraticCurveTo(36,-100,10,0);ctx.closePath();fillStroke('#C98A4B',5);for(let i=0;i<6;i++){ctx.save();ctx.translate(18,-205);ctx.rotate(-PI+i*PI/5);ell(60,0,64,16,'#5FA84E',4);ctx.restore()}ctx.restore()}
Object.assign(BG,{
  semana(){sky('#FFF3D6','#FCE7C8');floor(720,'#E9C99A');bunting(30)},
  bosque(){sky('#DDF3D2','#F4FBEA');for(let i=0;i<9;i++)tree(80+i*190,640+(i%2)*30,1.2+(i%3)*.2,i%3?'primavera':'verano');grass(700,'#9FDC8F')},
  polo(){sky('#CFE8F7','#EAF6FB');ctx.fillStyle='#7FB8D8';ctx.fillRect(0,520,W,140);for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(i*360-40,560);ctx.lineTo(i*360+60,500);ctx.lineTo(i*360+170,560);ctx.closePath();fillStroke('#FFFFFF',5)}grass(660,'#FFFFFF');ctx.fillStyle='#E3F2FA';ctx.fillRect(0,800,W,100);for(let i=0;i<16;i++){ctx.globalAlpha=.8;circ((i*137+T*14)%1600,(i*89+T*40)%900,4,'#fff',0)}ctx.globalAlpha=1},
  sabana(){sky('#FFE2A8','#FFF3D6');circ(1350,170,70,'#FFD66B',6);grass(640,'#E8C46A');acacia(260,650,1);acacia(1250,640,.8);ctx.fillStyle='#D9AE4E';for(let i=0;i<40;i++)ctx.fillRect((i*97)%1600,700+(i*53)%180,4,18)},
  selva(){sky('#BFE6B5','#E6F7DC');for(let i=0;i<7;i++)palm(80+i*240,700,1.1+(i%2)*.3);grass(690,'#7CC86E');ctx.strokeStyle='#5FA84E';ctx.lineWidth=7;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(200+i*260,0);ctx.quadraticCurveTo(230+i*260,120,200+i*260,200);ctx.stroke();ell(200+i*260,200,14,22,'#7CC86E',4)}},
  mar(){sky('#7FD3F0','#2E6FA8');for(let i=0;i<14;i++){const k=(T*.2+i/14)%1;ctx.globalAlpha=.5;circ((i*173)%1600,900-k*900,6+i%3*4,null,3,'#DFF6FF');ctx.globalAlpha=1}floor(780,'#F3D9A0');for(let i=0;i<8;i++){const x=80+i*210;ctx.beginPath();ctx.moveTo(x,790);ctx.quadraticCurveTo(x+Math.sin(T+i)*20-20,700,x+Math.sin(T+i)*20,620);ctx.lineWidth=12;ctx.strokeStyle='#3FA597';ctx.lineCap='round';ctx.stroke()}},
  espacio(){sky('#141A3C','#2E3F7A');for(let i=0;i<60;i++){ctx.globalAlpha=.5+.5*Math.sin(T*2+i);star((i*197)%1600,(i*131)%900,3+i%3*2,'#FFE08A',0)}ctx.globalAlpha=1;circ(1420,150,60,'#C9A0FF',5);ell(1420,150,100,18,null,5,'#FFE08A')},
  noche(){sky('#1F2A5C','#3D4F8F');for(let i=0;i<30;i++){ctx.globalAlpha=.5+.5*Math.sin(T*2+i);star((i*197)%1600,(i*131)%520,4+i%3*2,'#FFE08A',0)}ctx.globalAlpha=1;pic('luna',1380,150,160);grass(720,'#3D5A3E')},
  huerta(){sky('#D5F0FA','#F4FBEA');grass(560,'#9FDC8F');for(let r=0;r<3;r++){ctx.fillStyle='#A86B43';ctx.fillRect(0,600+r*100,W,46);for(let i=0;i<16;i++){const x=40+i*100+r*30;ctx.fillStyle='#5FA84E';ell(x-10,596+r*100,10,16,'#7CC86E',3);ell(x+10,596+r*100,10,16,'#7CC86E',3)}}},
  calle(){BG.ciudad();for(let i=0;i<6;i++){ctx.fillStyle='#fff';ctx.fillRect(700+i*40,560,26,240)}},
  prehistoria(){sky('#FFD8A8','#FFF0D6');ctx.beginPath();ctx.moveTo(1050,620);ctx.lineTo(1250,250);ctx.lineTo(1330,250);ctx.lineTo(1550,620);ctx.closePath();fillStroke('#A86B43',6);for(let i=0;i<4;i++){ctx.globalAlpha=.5;circ(1290+Math.sin(T+i)*30,200-i*50-((T*20)%50),30+i*8,'#B8B0A6',0)}ctx.globalAlpha=1;grass(640,'#9FC86E');fern(160,700,1.2);fern(420,720,.9);fern(1480,720,1)},
  fiesta(){sky('#FFF0F6','#FFF6E6');floor(740,'#F7D6E6');bunting(20,14);for(let i=0;i<6;i++){const x=200+i*250,y=200+Math.sin(T*1.5+i)*14;ctx.beginPath();ctx.moveTo(x,y+60);ctx.lineTo(x+(i%2?10:-10),y+200);ctx.lineWidth=3;ctx.strokeStyle=K;ctx.stroke();ell(x,y,44,56,DIAC[(i+2)%7],5)}},
  bano(){sky('#EAF6FB','#D5F0FA');ctx.fillStyle='#CFE8F7';for(let x=0;x<W;x+=80)for(let y=0;y<700;y+=80)if((x+y)/80%2===0)ctx.fillRect(x,y,80,80);floor(720,'#BFD9E8')},
  dormitorio(){sky('#EDE7FF','#E2DAFA');floor(720,'#C9A0FF');card(1200,80,280,220,'#2E3F7A',8,16);pic('luna',1290,160,90);star(1420,140,12,'#FFE08A',0);star(1380,240,8,'#FFE08A',0)},
  desierto(){sky('#FFE8B0','#FFF6E0');circ(1350,160,80,'#FFD66B',6);ctx.fillStyle='#F3C97A';ctx.beginPath();ctx.moveTo(0,620);ctx.quadraticCurveTo(400,520,800,620);ctx.quadraticCurveTo(1200,700,1600,580);ctx.lineTo(1600,900);ctx.lineTo(0,900);ctx.fill();ctx.fillStyle='#E8B45E';ctx.beginPath();ctx.moveTo(0,760);ctx.quadraticCurveTo(500,660,1000,770);ctx.quadraticCurveTo(1300,820,1600,740);ctx.lineTo(1600,900);ctx.lineTo(0,900);ctx.fill()},
  lluvia(){sky('#B8C2CF','#E2E7EE');cloud(200,120,1.4,'#9AA5B4');cloud(900,90,1.6,'#9AA5B4');grass(720,'#8FC07F');ctx.strokeStyle='#5BB8E6';ctx.lineWidth=4;for(let i=0;i<40;i++){const x=(i*97+T*60)%1600,y=(i*61+T*500)%900;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+26);ctx.stroke()}},
  parque(){sky('#D5F0FA','#EFFAF2');grass(640,'#9FDC8F');tree(200,600,1.6,'verano');tree(1420,620,1.4,'primavera');card(620,600,360,26,'#C98A4B',5,10);card(650,626,20,80,'#A86B43',4,4);card(930,626,20,80,'#A86B43',4,4)}
});

/* ================= TEMAS DE 4 AÑOS: EL BOSQUE ================= */
const dayCard=i=>({name:'el '+DIASL[i],day:i,draw:(x,y,s)=>{card(x-s*.44,y-s*.34,s*.88,s*.62,DIAC[i],6,s*.1);card(x-s*.36,y-s*.26,s*.72,s*.32,'#fff',4,s*.06);const nm=DIASL[i].toUpperCase();text(nm,x,y-s*.03,s*(nm.length>7?.12:.15),K,{f:LF});circ(x-s*.24,y+s*.3,s*.08,'#5B5F6B',4);circ(x+s*.24,y+s*.3,s*.08,'#5B5F6B',4);if(i>=5)star(x+s*.3,y-s*.36,s*.08,'#FFC93C',3)}});
const DSAY=['El lunes. Es el primer día de la semana. ¡Volvemos a la escuela!','El martes. Viene después del lunes.','El miércoles. Estamos en la mitad de la semana.','El jueves. ¡Ya falta poquito para el fin de semana!','El viernes. Es el último día de escuela de la semana.','El sábado. ¡Es fin de semana! No hay escuela.','El domingo. Descansamos y estamos en familia.'];
function locomotive(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);card(-80,-70,150,120,'#FF6B5E',7,20);card(-60,-130,60,70,'#5B5F6B',6,8);card(20,-40,60,50,'#BFEAF7',5,8);circ(-50,62,24,'#5B5F6B',6);circ(30,62,24,'#5B5F6B',6);for(let i=0;i<3;i++){ctx.globalAlpha=.5;circ(-30+i*10,-150-i*34-((T*30)%34),16+i*6,'#fff',3,'#B8B0A6')}ctx.globalAlpha=1;ctx.restore()}
const ESTS={otoño:'el otoño',invierno:'el invierno',primavera:'la primavera',verano:'el verano'};
const seasonTree=e=>({name:ESTS[e],draw:(x,y,s)=>tree(x,y+s*.28,s/290,e)});
const shape2=(f,c)=>({name:{circulo:'el círculo',cuadrado:'el cuadrado',triangulo:'el triángulo',rectangulo:'el rectángulo',ovalo:'el óvalo',rombo:'el rombo'}[f],f,draw:(x,y,s)=>{ctx.beginPath();
  if(f==='circulo')ctx.arc(x,y,s*.38,0,PI*2);else if(f==='cuadrado')rr(x-s*.34,y-s*.34,s*.68,s*.68,8);else if(f==='rectangulo')rr(x-s*.44,y-s*.24,s*.88,s*.48,8);else if(f==='ovalo')ctx.ellipse(x,y,s*.44,s*.28,0,0,PI*2);
  else if(f==='triangulo'){ctx.moveTo(x,y-s*.38);ctx.lineTo(x+s*.42,y+s*.32);ctx.lineTo(x-s*.42,y+s*.32);ctx.closePath()}else if(f==='rombo'){ctx.moveTo(x,y-s*.42);ctx.lineTo(x+s*.32,y);ctx.lineTo(x,y+s*.42);ctx.lineTo(x-s*.32,y);ctx.closePath()}fillStroke(c,6)}});
function zoneIcon(k){return (x,y,s)=>pic(k,x,y,s)}
const SENT={ojo:'Con los ojos vemos.',oreja:'Con las orejas oímos.',nariz:'Con la nariz olemos.',boca:'Con la boca saboreamos.',mano:'Con las manos tocamos.'};
const SENTQ=[['campana','oreja','¿Con qué escuchamos la campana?'],['tambor','oreja','¿Con qué oímos el tambor?'],['perfume','nariz','¿Con qué olemos el perfume?'],['flor','nariz','¿Con qué olemos la flor?'],['helado','boca','¿Con qué sentimos que el helado es dulce?'],
  ['limon','boca','¿Con qué sentimos que el limón es ácido?'],['cactus','mano','¿Con qué sentimos que el cactus pincha?'],['peluche','mano','¿Con qué sentimos que el peluche es suave?'],['arcoiris','ojo','¿Con qué vemos los colores del arcoíris?'],['estrella','ojo','¿Con qué vemos las estrellas?']];
const EMO4=[['alegria',['contento','contento'],'Contento. Cuando algo nos gusta mucho, sentimos alegría y sonreímos.'],['tristeza',['triste','triste'],'Triste. Cuando perdemos algo o extrañamos a alguien, sentimos tristeza.'],['enojo',['enojado','enfadado'],['Enojado. Cuando algo nos parece injusto, nos enojamos.','Enfadado. Cuando algo nos parece injusto, nos enfadamos.']],['miedo',['con miedo','con miedo'],'Con miedo. Cuando algo nos asusta, sentimos miedo.'],['sorpresa',['sorprendido','sorprendido'],'Sorprendido. Cuando pasa algo que no esperábamos, sentimos sorpresa.']];
const EMOADJ={alegria:'contento',tristeza:'triste',enojo:['enojado','enfadado'],miedo:'con miedo',sorpresa:'sorprendido',calma:'tranquilo',verguenza:'con vergüenza'};
const SITS=[['heladoCaido','tristeza','Al nene se le cayó el helado al piso. ¿Cómo se siente?'],['regalo','alegria','La nena recibió un regalo que quería mucho. ¿Cómo se siente?'],['tormenta','miedo','Hay una tormenta con truenos muy fuertes. ¿Cómo se siente el nene?'],['torreRota','enojo','Alguien le tiró la torre que había hecho con mucho trabajo. ¿Cómo se siente?'],['cajaSorpresa','sorpresa','¡Abrió la caja y saltó un payaso! ¿Cómo se siente?']];
const FRUTAS=['manzana','banana','pera','fresa','uva','naranja','pina','kiwi','sandia'],VERDURAS=['zanahoria','lechuga','patata','brocoli','pimiento','berenjena'];
const OFICIOS=[['bombera','manguera'],['medico','fonendo'],['policia','silbato'],['panadero','pan'],['cartero','carta'],['peluquero','tijeras'],['cocinera','sarten'],['granjera','tractor'],['maestra','cuento']];
const ADIV=[['bombera','Uso casco y manguera. Apago los incendios. ¿Quién soy?'],['medico','Uso un estetoscopio y te curo cuando estás enfermo. ¿Quién soy?'],['policia','Cuido la calle y ayudo a la gente. Uso silbato. ¿Quién soy?'],['panadero','Me levanto muy temprano para hacer pan. ¿Quién soy?'],['cartero','Llevo las cartas a todas las casas. ¿Quién soy?'],['peluquero','Corto el pelo con tijeras y peine. ¿Quién soy?'],['cocinera','Cocino comidas ricas en la cocina. ¿Quién soy?'],['granjera','Cuido los animales y planto verduras en el campo. ¿Quién soy?']];
const SALVAJES=['leon','elefante','jirafa','mono','cebra','cocodrilo','tigre'],DOMESTICOS=['perro','gato','conejo','vaca','oveja','caballo','gallina'];
const plantDraw=(hl)=>{ctx.fillStyle='#A86B43';ctx.fillRect(540,620,720,200);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.strokeRect(540,620,720,200);
  ctx.lineCap='round';ctx.strokeStyle='#E9D1A6';ctx.lineWidth=9;for(const [a,b] of[[-60,90],[0,140],[60,90],[-30,60],[40,120]]){ctx.beginPath();ctx.moveTo(900,630);ctx.quadraticCurveTo(900+a*.5,630+b*.6,900+a,630+b);ctx.stroke()}
  ctx.strokeStyle='#5FA84E';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(900,630);ctx.quadraticCurveTo(910,450,900,300);ctx.stroke();
  for(const [x,y,r] of[[830,470,-.5],[975,400,.5],[835,360,-.4]]){ctx.save();ctx.translate(x,y);ctx.rotate(r);ell(0,0,70,30,'#7CC86E',5);ctx.restore()}
  flower(900,260,58,'#F58BB4',5);ctx.beginPath();ctx.moveTo(945,520);ctx.lineTo(1000,560);ctx.lineWidth=6;ctx.strokeStyle='#5FA84E';ctx.stroke();circ(1005,585,34,'#FF5A5A',5);ell(1012,552,10,6,'#7CC86E',3)};
const PLANT_PARTS=[{id:'raiz',n:'la raíz',x:900,y:720,r:90,say:'Toma el agua de la tierra.'},{id:'tallo',n:'el tallo',x:902,y:540,r:40,say:'Sostiene la planta.'},{id:'tallo',n:'el tallo',x:906,y:420,r:30},{id:'hojas',n:'las hojas',x:830,y:470,r:62,say:'Toman la luz del sol.'},{id:'hojas',n:'las hojas',x:975,y:400,r:62},{id:'hojas',n:'las hojas',x:835,y:360,r:55},
  {id:'flor',n:'la flor',x:900,y:260,r:80,say:'¡Qué linda!'},{id:'fruto',n:'el fruto',x:1005,y:585,r:45,say:'Adentro tiene las semillas.'}];
const towerOf=n=>({name:n>3?'la torre alta':'la torre baja',draw:(x,y,s)=>{for(let i=0;i<n;i++)card(x-s*.22,y+s*.42-(i+1)*s*.15,s*.44,s*.14,DIAC[i%7],4,6)}});
const pencilOf=(l,c)=>({name:l>.6?'el lápiz largo':'el lápiz corto',draw:(x,y,s)=>{const w=s*l*.9;ctx.save();ctx.translate(x-w/2,y);card(0,-s*.08,w-s*.14,s*.16,c,5,6);ctx.beginPath();ctx.moveTo(w-s*.14,-s*.08);ctx.lineTo(w,0);ctx.lineTo(w-s*.14,s*.08);ctx.closePath();fillStroke('#F2C29B',4);ctx.restore()}});
// escenas de posiciones
const posScene=(kind,a)=>({name:{delante:'delante',detras:'detrás',encima:'encima',debajo:'debajo',cerca:'cerca',lejos:'lejos'}[a],draw:(x,y,s)=>{ctx.save();rr(x-s/2+8,y-s/2+8,s-16,s-16,26);ctx.clip();ctx.fillStyle='#E9F7FC';ctx.fillRect(x-s/2,y-s/2,s,s);ctx.fillStyle='#BFE6A0';ctx.fillRect(x-s/2,y+s*.2,s,s*.3);
  if(kind==='caja'){if(a==='detras')pic('gato',x+s*.12,y-s*.08,s*.42);card(x-s*.3,y-s*.05,s*.42,s*.36,'#C98A4B',5,8);if(a==='delante')pic('gato',x+s*.05,y+s*.16,s*.42)}
  if(kind==='mesa'){card(x-s*.36,y-s*.06,s*.72,s*.07,'#C98A4B',5,6);card(x-s*.32,y,s*.05,s*.3,'#A86B43',4,3);card(x+s*.27,y,s*.05,s*.3,'#A86B43',4,3);pic('pelota',x,a==='encima'?y-s*.17:y+s*.2,s*.2)}
  if(kind==='casa'){pic('casa',x-s*.22,y-s*.02,s*.42);pic('perro',a==='cerca'?x+s*.02:x+s*.34,a==='cerca'?y+s*.17:y+s*.06,a==='cerca'?s*.26:s*.12)}
  ctx.restore()}});
const momentScene=m=>({name:{manana:'la mañana',tarde:'la tarde',noche:'la noche'}[m],draw:(x,y,s)=>{ctx.save();rr(x-s/2+8,y-s/2+8,s-16,s-16,26);ctx.clip();ctx.fillStyle={manana:'#FFE3B0',tarde:'#9ED9F5',noche:'#2E3F7A'}[m];ctx.fillRect(x-s/2,y-s/2,s,s);
  if(m==='manana')pic('sol',x-s*.2,y+s*.05,s*.34);if(m==='tarde')pic('sol',x+s*.18,y-s*.18,s*.34);if(m==='noche'){pic('luna',x+s*.16,y-s*.18,s*.3);star(x-s*.22,y-s*.24,8,'#FFE08A',0);star(x-s*.05,y-s*.3,6,'#FFE08A',0)}
  ctx.fillStyle=m==='noche'?'#3D5A3E':'#9FDC8F';ctx.fillRect(x-s/2,y+s*.22,s,s*.3);ctx.restore()}});
const plateN=(n,k)=>({name:unN(n,k),n,draw:(x,y,s)=>{pic('plato',x,y+s*.1,s*1.05);const P=[[0,0],[-.2,.04],[.2,.04],[-.1,-.12],[.1,-.12],[0,.17],[-.24,-.12],[.24,-.12],[-.12,.2],[.12,.2]];for(let i=0;i<n;i++)pic(k,x+P[i][0]*s,y+P[i][1]*s,s*.24)}});
const COLS4=[['calabaza','naranja'],['zanahoria','naranja'],['naranja','naranja'],['berenjena','violeta'],['uva','violeta'],['cerdo','rosa'],['flor','rosa'],['chocolate','marron'],['ardilla','marron'],['castana','marron'],['elefante','gris'],['piedra','gris']];
Object.assign(COLORES,{gris:{c:'#9AA5B4',n:'gris'},blanco:{c:'#FFFFFF',n:'blanco'},negro:{c:'#3B3F58',n:'negro'},celeste:{c:'#7FD3F0',n:'celeste'}});

const T4=[
{id:'4A-T1',n:'Los días de la semana',icon:'calendario',c:'#FF8A7A',trim:1,bg:BG.semana,
 words:DIASL.map((d,i)=>Object.assign(dayCard(i),{label:d,say:DSAY[i]})),intro:'La semana tiene siete días. Tocá cada vagón para conocerlo.',
 games:[{t:'conocer',icon:'calendario'},
  {t:'tren',icon:'tren',name:'El tren de los días',make:(d,t)=>Arrastra({rounds:2,key:'dias-orden',bg:t.bg,sayPick:true,
    why:(it,z)=>'Ese lugar es para otro día. Mirá el color del vagón.',placeSay:(it)=>cap(nameT(it.k))+'.',
    gen(i){const m=AGE()<=3?2:AGE()===4?3:4,miss=shuffle([0,1,2,3,4,5,6]).slice(0,m),X=j=>390+j*168;
      return {ask:'Al tren de los días le faltan vagones. Llevá cada día a su lugar, en orden.',
        drawExtra:()=>{ctx.beginPath();ctx.moveTo(120,470);ctx.lineTo(1520,470);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.stroke();locomotive(220,380,1);for(let j=0;j<7;j++)if(!miss.includes(j))dayCard(j).draw(X(j),380,170)},
        zones:miss.map(j=>({id:'d'+j,x:X(j),y:380,w:150,h:120,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=30}ctx.setLineDash([12,10]);rr(z.x-75,z.y-58,150,106,16);fillStroke('rgba(255,255,255,.7)',6,DIAC[j]);ctx.setLineDash([]);ctx.restore();text('?',z.x,z.y+20,60,DIAC[j],{f:LF})},slot:()=>[X(j),380],ps:1})),
        items:miss.map(j=>({k:dayCard(j),zone:'d'+j,s:170})),tray:{x0:420,x1:1400,y:700},okAll:'¡El tren está completo! Lunes, martes, miércoles, jueves, viernes, sábado y domingo.'}}},d)},
  {t:'falta',icon:'calendario',name:'¿Qué día falta?',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'dias-falta',y:680,
    ref(r){r.seq.forEach((j,q)=>{const x=900-(r.seq.length-1)*95+q*190;if(q===r.blank){ctx.setLineDash([12,10]);rr(x-75,300-58,150,106,16);fillStroke('#FFF3B0',6,'#FFC93C');ctx.setLineDash([]);text('?',x,320,60,'#FFA94D',{f:LF})}else dayCard(j).draw(x,300,170)})},
    gen(){const st=ri(0,AGE()>=5?6:2),len=AGE()<=3?3:4,seq=Array.from({length:len},(_,q)=>(st+q)%7),blank=ri(1,len-1),ans=seq[blank];
      const others=shuffle([0,1,2,3,4,5,6].filter(x=>x!==ans)).slice(0,Math.max(1,nOpts()-1));const read=seq.map((j,q)=>q===blank?'mmm...':DIASL[j]).join(', ');
      const A=dayCard(ans);return {seq,blank,words:[A,...others.map(dayCard)],ok:[A],ask:cap(read)+(/\.\.\.$/.test(read)?' ':'. ')+'¿Qué día falta?',okSay:()=>'¡Sí! Falta el '+DIASL[ans]+'.',badSay:w=>'Ese es '+V(w.name)+'. '+cap(read)+(/\.\.\.$/.test(read)?'':'.')}},
    },d)},
  {t:'finde',icon:'parque',name:'Escuela o fin de semana',make:(d,t)=>Arrastra({rounds:2,key:'dias-finde',bg:t.bg,
    why:(it,z)=>z.id==='escuela'?'El '+DIASL[it.k.day]+' no hay escuela. ¡Es fin de semana!':'El '+DIASL[it.k.day]+' es día de escuela.',placeSay:(it,z)=>'El '+DIASL[it.k.day]+(z.id==='escuela'?' vamos a la escuela.':' es fin de semana.'),
    gen(i){const ds=shuffle([0,1,2,3,4]).slice(0,2).concat(i?[6]:[5]);if(AGE()>=5)ds.push(shuffle([0,1,2,3,4].filter(x=>!ds.includes(x)))[0]);
      return {ask:'Los días de escuela van con la escuela. Los días del fin de semana van con el parque.',zones:[{id:'escuela',x:560,y:420,w:380,h:220,c:'#FFE3B0',icon:zoneIcon('escuela')},{id:'finde',x:1240,y:420,w:380,h:220,c:'#BFE6B5',icon:zoneIcon('parque')}],
        items:ds.map(j=>({k:dayCard(j),zone:j<5?'escuela':'finde',s:170})),tray:{x0:420,x1:1400,y:770}}}},d)},
  {t:'cancion',icon:'notas',song:'dias'}]},
{id:'4A-T2',n:'Mi cuerpo y los sentidos',icon:'oreja',c:'#F58BB4',trim:1,bg:BG.cuerpo,
 words:[{k:'ojo',say:'Los ojos. Con los ojos vemos los colores y las formas.'},{k:'oreja',say:'Las orejas. Con las orejas oímos los sonidos.'},{k:'nariz',say:'La nariz. Con la nariz olemos las flores y la comida.'},{k:'boca',say:'La boca. Con la boca saboreamos lo dulce, lo salado y lo ácido.'},{k:'mano',say:'Las manos. Con las manos tocamos: suave, áspero, frío y caliente.'}],
 intro:'Tenemos cinco sentidos. Tocá cada uno para conocerlo.',
 games:[{t:'conocer'},
  {t:'toca',icon:'nene',name:'Tocá la parte del cuerpo',make:(d,t)=>Cuerpo({mode:'ask',fine:true,bg:t.bg,rounds:6,only:['cuello','hombros','codos','rodillas','tobillos','cabeza','manos','pies','barriga','orejas']},d)},
  {t:'sentidos',icon:'nariz',name:'¿Con qué lo sabemos?',make:(d,t)=>{const Q=shuffle(SENTQ);return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'sentidos',y:660,
    ref(r){refCard(900,290,300,280,()=>pic(r.st,900,290,230))},
    gen(i){const q=Q[i%Q.length],others=shuffle(['ojo','oreja','nariz','boca','mano'].filter(k=>k!==q[1])).slice(0,nOpts());return {st:q[0],words:[q[1],...others],ok:[q[1]],ask:q[2],okSay:()=>SENT[q[1]],badSay:w=>SENT[w]+' '+q[2]}}},d)}},
  {t:'puzzle',icon:'cara',make:(d,t)=>Puzzle({list:['nene','cara'],bg:t.bg},d)}]},
{id:'4A-T3',n:'El otoño y sus frutos',icon:'bellota',c:'#FFA94D',trim:1,bg:BG.otono,season:'otoño',
 words:[{k:'castana',say:'La castaña. Se come asada en otoño.'},{k:'nuez',say:'La nuez. Tiene una cáscara muy dura.'},{k:'granada',say:'La granada. Adentro tiene muchas semillitas rojas.'},{k:'uva',say:'Las uvas. Se cosechan al empezar el otoño.'},{k:'calabaza',say:'La calabaza. Es grande y naranja.'},
  {k:'seta',say:['El hongo. Sale en el bosque cuando llueve.','La seta. Sale en el bosque cuando llueve.']},{k:'bellota',say:'La bellota. Es el fruto del roble. ¡A las ardillas les encanta!'},{k:'erizo',say:'El erizo. Se esconde entre las hojas secas.'},{k:'ardilla',say:'La ardilla. Guarda comida para el invierno.'}],
 games:[{t:'conocer'},
  {t:'cae',icon:'hojaRoja',make:(d,t)=>Atrapa({dir:'down',style:'plain',targets:[{ask:'¡Se caen los frutos del otoño! Atrapá las bellotas.',is:k=>k==='bellota'},{ask:'¡Ahora atrapá las castañas!',is:k=>k==='castana'},{ask:'¡Y ahora las nueces!',is:k=>k==='nuez'}].slice(0,AGE()<=3?2:3),pool:['bellota','castana','nuez','hojaNaranja','hojaRoja','hojaMarron'],bg:t.bg,key:'otono'},d)},
  {t:'despensa',icon:'ardilla',name:'La despensa de la ardilla',make:(d,t)=>Llena({pool:['bellota','nuez','castana'],bg:t.bg,zone:{x:560,y:470,r:170},
    drawZone:(hl,c)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}card(400,180,320,600,'#A86B43',7,60);ctx.restore();ell(560,470,120,140,'#5A3A26',6);pic('ardilla',300,700,200)},
    ask:n=>'La ardilla necesita '+NUM[n]+' frutos para el invierno. Llevá '+NUM[n]+' a su casita del árbol.',okSay:n=>'¡La ardilla tiene '+NUM[n]+' frutos! Gracias.'},d)},
  {t:'memoria'}]},
{id:'4A-T4',n:'Las emociones',icon:'emociones',c:'#FFC93C',trim:1,bg:BG.familia,
 words:EMO4.map(([e,lb,say])=>({k:'emo:'+e,label:lb,say})),intro:'Todos sentimos emociones. Tocá cada carita.',
 games:[{t:'conocer'},
  {t:'caritas',icon:'emociones',name:'¿Cómo se siente?',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'emociones',y:520,big:true,
    gen(i){const all=EMO4.map(e=>e[0]),e=all[i%all.length],others=shuffle(all.filter(x=>x!==e)).slice(0,nOpts()-1);return {words:['emo:'+e,...others.map(x=>'emo:'+x)],ok:['emo:'+e],ask:'¿Quién está '+V(EMOADJ[e])+'? Tocá la carita.',okSay:()=>'¡Sí! Esa carita está '+V(EMOADJ[e])+'.',badSay:w=>'Esa carita está '+V(EMOADJ[w.slice(4)])+'. Buscá la que está '+V(EMOADJ[e])+'.'}}},d)},
  {t:'situaciones',icon:'heladoCaido',name:'¿Qué le pasa?',make:(d,t)=>{const Q=shuffle(SITS);return ChoiceGame({rounds:Math.min(5,nRounds()),bg:t.bg,key:()=>'emociones',y:680,
    ref(r){refCard(900,300,320,300,()=>pic(r.st,900,300,250))},
    gen(i){const q=Q[i%Q.length],others=shuffle(EMO4.map(e=>e[0]).filter(e=>e!==q[1])).slice(0,nOpts()-1);return {st:q[0],words:['emo:'+q[1],...others.map(e=>'emo:'+e)],ok:['emo:'+q[1]],ask:q[2],okSay:()=>'¡Sí! Se siente '+V(EMOADJ[q[1]])+'.',badSay:()=>'Mmm, pensá cómo te sentirías vos. '+q[2]}}},d)}},
  {t:'frascos',icon:'frasco',name:'Cada emoción en su frasco',make:(d,t)=>Arrastra({rounds:2,key:'emociones',bg:t.bg,
    why:(it,z)=>'Ese frasco es de '+V(EMO[z.id].n)+'.',placeSay:(it,z)=>cap(V(EMO[z.id].n))+'.',
    gen(i){const es=shuffle(EMO4.map(e=>e[0])).slice(0,AGE()<=3?2:3);return {ask:'Cada emoción tiene su color. Llevá cada carita a su frasco.',
      zones:es.map((e,j,a)=>({id:e,x:900-(a.length-1)*250+j*500,y:400,w:260,h:300,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=36}card(z.x-120,z.y-140,240,300,'rgba(255,255,255,.8)',7,50);ctx.restore();card(z.x-70,z.y-170,140,40,'#C98A4B',6,10);
        ctx.save();rr(z.x-112,z.y-60,224,212,46);ctx.clip();ctx.fillStyle=EMO[e].c;ctx.globalAlpha=.55;ctx.fillRect(z.x-120,z.y-60,240,220);ctx.restore();ctx.globalAlpha=1;drawFace(z.x,z.y-100,30,e)},slot:n=>[z_x(es,j)+(n%2?50:-50),400+Math.floor(n/2)*-40],ps:.6})),
      items:es.flatMap(e=>[e,e]).map(e=>({k:'emo:'+e,zone:e,s:140})),tray:{x0:420,x1:1400,y:770}}}},d)}]},
{id:'4A-T5',n:'Frutas y verduras',icon:'zanahoria',c:'#7CC86E',trim:1,bg:BG.huerta,
 words:[{k:'zanahoria',say:'La zanahoria. Es una verdura naranja que crece bajo la tierra.'},{k:'tomate',say:'El tomate. Rojo y jugoso, para la ensalada.'},{k:'lechuga',say:'La lechuga. Sus hojas verdes van en la ensalada.'},{k:'patata',say:['La papa. Crece escondida bajo la tierra.','La patata. Crece escondida bajo la tierra.']},
  {k:'brocoli',say:'El brócoli. Parece un arbolito verde.'},{k:'pimiento',say:['El morrón. Puede ser rojo, verde o amarillo.','El pimiento. Puede ser rojo, verde o amarillo.']},{k:'pina',say:['El ananá. Es una fruta con corona.','La piña. Es una fruta con corona.']},{k:'sandia',say:'La sandía. Una fruta grande y fresquita para el verano.'},{k:'kiwi',say:'El kiwi. Por fuera es marrón y por dentro es verde.'}],
 games:[{t:'conocer'},
  {t:'clasifica',icon:'macedonia',name:'Fruta o verdura',make:(d,t)=>Arrastra({rounds:3,key:'fruta-verdura',bg:t.bg,
    why:(it,z)=>z.id==='fruta'?cap(nameT(it.k))+' es una verdura.':cap(nameT(it.k))+' es una fruta.',placeSay:(it,z)=>cap(nameT(it.k))+(z.id==='fruta'?' es una fruta.':' es una verdura.'),
    gen(){const f=shuffle(FRUTAS).slice(0,2),v=shuffle(VERDURAS).slice(0,2);return {ask:'Las frutas van en la canasta de las frutas. Las verduras, en la de las verduras.',zones:[{id:'fruta',x:560,y:430,w:380,h:220,c:'#FFD6A0',icon:zoneIcon('macedonia')},{id:'verdura',x:1240,y:430,w:380,h:220,c:'#C9EBB5',icon:zoneIcon('brocoli')}],
      items:[...f.map(k=>({k,zone:'fruta'})),...v.map(k=>({k,zone:'verdura'}))],tray:{x0:420,x1:1400,y:780}}}},d)},
  {t:'sopa',icon:'olla',name:'Una sopa de verduras',make:(d,t)=>Arrastra({rounds:1,total:AGE()<=3?3:4,key:'pedidos',bg:BG.cocina,sayPick:false,
    gen(){const v=['zanahoria','patata','brocoli','pimiento','lechuga','tomate'],st=shuffle(v).slice(0,AGE()<=3?3:4);return {ask:'¡Hagamos una sopa de verduras! Escuchá qué verdura va en la olla.',
      zones:[{id:'olla',x:900,y:430,w:400,h:300,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=36}pic('olla',900,440,420);ctx.restore()},slot:n=>[800+(n%3)*100,380-Math.floor(n/3)*20],ps:.5}],
      items:v.map(k=>({k,s:150})),tray:{x0:380,x1:1500,y:780},steps:st.map(k=>({k,zone:'olla',say:'Poné '+W_(k)+' en la olla.',ok:pick(['¡Mmm, qué rico!','¡Muy bien!','¡Eso es!'])})),onPlace:()=>SFX.splash()}}},d)},
  {t:'comidas',icon:'desayuno',name:'Las comidas del día',make:(d,t)=>Secuencia({bg:t.bg,key:'comidas',panels:['desayuno','almuerzo','merienda','cena'].slice(0,AGE()<=3?3:4),first:true,
    ask:'Ordená las comidas del día. ¿Cuál comemos primero, cuando nos levantamos?',okAll:V(['¡Muy bien! Desayuno, almuerzo, merienda y cena.','¡Muy bien! Desayuno, comida, merienda y cena.'])},d)}]},
{id:'4A-T6',n:'El invierno y el polo',icon:'pinguino',c:'#7FD3F0',trim:2,bg:BG.polo,season:'invierno',
 words:[{k:'nieve',say:'La nieve. Es agua congelada que cae del cielo.'},{k:'hielo',say:'El hielo. Es agua muy fría que se puso dura.'},{k:'pinguino',say:'El pingüino. Es un pájaro que no vuela, ¡pero nada muy bien!'},{k:'osoPolar',say:'El oso polar. Tiene pelo blanco y grueso para no tener frío.'},
  {k:'foca',say:'La foca. Nada en el agua helada.'},{k:'morsa',say:'La morsa. Tiene dos colmillos largos.'},{k:'iglu',say:'El iglú. Es una casa hecha con bloques de nieve.'}],
 games:[{t:'conocer'},
  {t:'viste',icon:'gorro',make:vestir(['abrigo','gorro','bufanda','guantes','botasAgua'],['gafas','remera','gorra'],'¡Hace muchísimo frío! Vestí al nene para jugar en la nieve.',k=>({gafas:'Los anteojos de sol no abrigan.',remera:'Con remera tenemos frío.',gorra:'La gorra es para el sol. Para el frío, el gorro de lana.'}[k]||'Eso no va.'))},
  {t:'saltos',icon:'pinguino',name:'Contar pingüinos',make:(d,t)=>Cuenta({pool:['pinguino','foca','copo'],bg:t.bg},d)},
  {t:'clasifica',icon:'osoPolar',name:'¿Frío o calor?',make:(d,t)=>Arrastra({rounds:2,key:'frio-calor',bg:t.bg,
    why:(it,z)=>z.id==='frio'?cap(nameT(it.k))+' vive donde hace calor.':cap(nameT(it.k))+' vive donde hace frío.',
    gen(){const f=shuffle(['pinguino','osoPolar','foca','morsa']).slice(0,2),c=shuffle(['leon','jirafa','camello','cocodrilo','mono']).slice(0,2);return {ask:'¿Dónde vive cada animal? Los del frío van con la nieve. Los del calor van con el sol.',
      zones:[{id:'frio',x:560,y:440,w:380,h:220,c:'#CFE8F7',icon:zoneIcon('copo')},{id:'calor',x:1240,y:440,w:380,h:220,c:'#FFE08A',icon:zoneIcon('sol')}],items:[...f.map(k=>({k,zone:'frio'})),...c.map(k=>({k,zone:'calor'}))],tray:{x0:420,x1:1400,y:780}}}},d)}]},
{id:'4A-T7',n:'Los oficios',icon:'bombera',c:'#FF6B5E',trim:2,bg:BG.ciudad,
 words:[{k:'bombera',say:'La bombera. Apaga incendios con la manguera.'},{k:'medico',say:'El médico. Nos cura cuando estamos enfermos.'},{k:'policia',say:'La policía. Cuida la calle y nos ayuda.'},{k:'maestra',say:['La maestra. Nos enseña en la escuela.','La maestra. Nos enseña en el cole.']},{k:'panadero',say:'El panadero. Hace el pan muy temprano.'},
  {k:'cocinera',say:'La cocinera. Prepara comidas ricas.'},{k:'cartero',say:'El cartero. Lleva las cartas a las casas.'},{k:'granjera',say:'La granjera. Cuida los animales y el campo.'},{k:'peluquero',say:'El peluquero. Nos corta el pelo.'}],
 games:[{t:'conocer'},
  {t:'herramientas',icon:'manguera',name:'¿Con qué trabaja?',make:(d,t)=>Une({pairs:OFICIOS,bg:t.bg,key:'oficios',ask:'Uní a cada persona con lo que usa para trabajar. Arrastrá de una a la otra.',okSay:(a,b)=>cap(nameT(a))+' usa '+nameT(b)+'.',why:(a,b)=>'Mmm, '+nameT(a)+' no usa '+nameT(b)+'.'},d)},
  {t:'quien',icon:'policia',name:'¿Quién soy?',make:(d,t)=>{const Q=shuffle(ADIV);return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'oficios',y:560,big:true,
    gen(i){const q=Q[i%Q.length],others=shuffle(ADIV.map(a=>a[0]).filter(k=>k!==q[0])).slice(0,nOpts()-1);return {words:[q[0],...others],ok:[q[0]],ask:q[1],okSay:()=>'¡Sí! Soy '+nameT(q[0])+'.',badSay:w=>eseEs(w)+'. '+q[1]}}},d)}},
  {t:'busca'}]},
{id:'4A-T8',n:'La calle y la ciudad',icon:'semaforo',c:'#5B8DEF',trim:2,bg:BG.calle,
 words:[{k:'semaforo',say:'El semáforo. Rojo para frenar y verde para pasar.'},{k:'pasoCebra',say:'El paso de cebra. Por acá cruzamos la calle.'},{k:'tienda',say:'La tienda. Ahí compramos cosas.'},{k:'parque',say:'El parque. Para jugar al aire libre.'},{k:'hospital',say:'El hospital. Ahí curan a las personas.'},{k:'escuela',say:['La escuela. Ahí aprendemos y jugamos.','El cole. Ahí aprendemos y jugamos.']},{k:'autobus',say:['El colectivo. Lleva a mucha gente por la ciudad.','El autobús. Lleva a mucha gente por la ciudad.']}],
 games:[{t:'conocer'},{t:'semaforo',icon:'semaforo',name:'¿Cruzamos?',make:(d,t)=>Semaforo({},d)},
  {t:'lugares',icon:'hospital',name:'Cada cosa en su lugar',make:(d,t)=>Arrastra({rounds:2,key:'ciudad',bg:t.bg,
    why:(it,z)=>cap(nameT(it.k))+' no va '+V(z.nm)+'.',placeSay:(it,z)=>cap(nameT(it.k))+' va '+V(z.nm)+'.',
    gen(i){const Z={escuela:{it:['mochila','lapiz','cuento'],nm:['a la escuela','al cole']},hospital:{it:['ambulancia','medico','fonendo'],nm:'al hospital'},parque:{it:['tobogan','pelota','bici'],nm:'al parque'},tienda:{it:['pan','manzana','leche'],nm:'a la tienda'}};
      const zs=i?['parque','tienda']:['escuela','hospital'];if(AGE()>=5)zs.push(i?'escuela':'parque');const its=[];zs.forEach(z=>shuffle(Z[z].it).slice(0,2).forEach(k=>its.push({k,zone:z})));
      return {ask:'¿Adónde va cada cosa? Llevala a su lugar de la ciudad.',zones:zs.map((z,j,a)=>({id:z,nm:Z[z].nm,x:900-(a.length-1)*230+j*460,y:440,w:340,h:200,c:'#E4E9F2',icon:zoneIcon(z)})),items:its,tray:{x0:380,x1:1440,y:780}}}},d)},
  {t:'busca'}]},
{id:'4A-T9',n:'Animales domésticos y salvajes',icon:'jirafa',c:'#E8B45E',trim:2,bg:BG.sabana,
 words:[{k:'leon',say:'El león. Es el rey de la sabana. ¡Grrr!'},{k:'elefante',say:'El elefante. Tiene una trompa muy larga.'},{k:'jirafa',say:'La jirafa. Su cuello largo llega a las hojas más altas.'},{k:'mono',say:'El mono. Salta de árbol en árbol.'},{k:'cebra',say:'La cebra. Tiene rayas blancas y negras.'},{k:'cocodrilo',say:'El cocodrilo. Vive en el río.'},{k:'tigre',say:'El tigre. Tiene rayas negras y corre muy rápido.'},
  {k:'perro',say:'El perro. Vive con nosotros en casa.'},{k:'gato',say:'El gato. Le gusta dormir al sol.'},{k:'conejo',say:'El conejo. Come zanahorias y salta.'}],
 games:[{t:'conocer'},
  {t:'clasifica',icon:'leon',name:'¿Dónde vive?',make:(d,t)=>Arrastra({rounds:2,key:'domestico-salvaje',bg:t.bg,
    why:(it,z)=>z.id==='casa'?cap(nameT(it.k))+' es un animal salvaje. Vive en la selva o en la sabana.':cap(nameT(it.k))+' vive en casa o en la granja, con las personas.',
    gen(){const s=shuffle(SALVAJES).slice(0,2),c=shuffle(DOMESTICOS).slice(0,2);return {ask:'Los animales que viven con las personas van a la casa. Los animales salvajes van a la selva.',
      zones:[{id:'casa',x:560,y:440,w:380,h:220,c:'#FFE3B0',icon:zoneIcon('casa')},{id:'selva',x:1240,y:440,w:380,h:220,c:'#C9EBB5',icon:(x,y,s)=>palm(x-10,y+s*.45,s*.0042)}],items:[...c.map(k=>({k,zone:'casa'})),...s.map(k=>({k,zone:'selva'}))],tray:{x0:420,x1:1400,y:780}}}},d)},
  {t:'sonido',icon:'leon',make:(d,t)=>Sonido({items:['leon','elefante','mono','tigre','perro','gato','vaca','conejo','cocodrilo'],bg:t.bg},d)},
  {t:'sombras',icon:'elefante',name:'¿De quién es la sombra?',make:(d,t)=>{const pool=shuffle(['leon','elefante','jirafa','mono','cocodrilo','conejo','perro','gato','cebra','tigre']);return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'sombras',y:680,
    ref(r){refCard(900,300,320,320,()=>picS(r.k,900,300,280))},
    gen(i){const k=pool[i%pool.length],others=shuffle(pool.filter(x=>x!==k)).slice(0,nOpts()-1);return {k,words:[k,...others],ok:[k],ask:'¿De quién es esta sombra?',okSay:()=>'¡Sí! Es la sombra '+dela(k)+'.',badSay:w=>eseEs(w)+'. Mirá bien la forma de la sombra.'}}},d)}}]},
{id:'4A-T10',n:'Las plantas',icon:'plantaFlor',c:'#5FA84E',trim:3,bg:BG.huerta,season:'primavera',
 words:[{k:'semilla',say:'La semilla. Si la plantamos y la regamos, ¡crece una planta!'},{k:'brote',say:'El brote. Es la plantita recién nacida.'},{k:'plantita',say:'La planta. Tiene raíz, tallo y hojas.'},{k:'plantaFlor',say:'La flor. Muchas plantas tienen flores.'},{k:'plantaFruto',say:'El fruto. Adentro tiene semillas nuevas.'},{k:'regadera',say:'La regadera. Las plantas necesitan agua.'},{k:'sol',say:'El sol. Las plantas necesitan luz para crecer.'}],
 games:[{t:'conocer'},
  {t:'partes',icon:'plantaFlor',name:'Las partes de la planta',make:(d,t)=>TocaPartes({parts:PLANT_PARTS,bg:()=>{sky('#D5F0FA','#F4FBEA')},draw:plantDraw,lx:340,ly:300,key:'partes-planta',intro:'Esta es una planta. Vamos a conocer sus partes.'},d)},
  {t:'secuencia',icon:'semilla',name:'¿Cómo crece?',make:(d,t)=>Secuencia({bg:t.bg,key:'secuencia',panels:AGE()<=4?['semilla','plantita','plantaFlor']:['semilla','brote','plantita','plantaFlor','plantaFruto'],ask:'¿Cómo crece una planta? Ordená del primero al último.',okAll:'¡Muy bien! Primero la semilla, después crece la planta y al final sale la flor.'},d)},
  {t:'riega',icon:'regadera',make:(d,t)=>Riega({bg:t.bg,n:AGE()<=3?3:4},d)}]},
{id:'4A-T11',n:'Los transportes por tierra, mar y aire',icon:'ambulancia',c:'#5BB8E6',trim:3,bg:BG.ciudad,
 words:[{k:'ambulancia',say:'La ambulancia. Lleva a los enfermos al hospital. ¡Niinoo!'},{k:'camionBomberos',say:'El camión de bomberos. Va rápido a apagar el fuego.'},{k:'patrullero',say:['El patrullero. Es el auto de la policía.','El coche de policía. Lo usa la policía.']},{k:'helicoptero',say:'El helicóptero. Vuela y puede quedarse quieto en el aire.'},
  {k:'submarino',say:'El submarino. Navega debajo del agua.'},{k:'globoAire',say:'El globo aerostático. Vuela con aire caliente.'},{k:'tractor',say:'El tractor. Trabaja en el campo.'},{k:'metro',say:['El subte. Es un tren que va por debajo de la ciudad.','El metro. Es un tren que va por debajo de la ciudad.']}],
 games:[{t:'conocer'},
  {t:'clasifica',icon:'globoAire',make:(d,t)=>Arrastra({rounds:3,key:'transportes',bg:t.bg,
    why:(it,z)=>({cielo:cap(nameT(it.k))+' no vuela.',agua:cap(nameT(it.k))+' no va por el agua.',tierra:cap(nameT(it.k))+' no va por la tierra.'})[z.id],
    gen(i){const Z={tierra:{c:'#C9CED6',it:['ambulancia','camionBomberos','patrullero','tractor','metro','tren'],ic:zoneIcon('semaforo')},cielo:{c:'#CFEFFD',it:['helicoptero','globoAire','avion'],ic:(x,y,s)=>cloud(x-s*.4,y,s*.005,'#9ED9F5')},agua:{c:'#9ED9F5',it:['submarino','barco','lancha'],ic:zoneIcon('ballena')}};
      const zs=[['tierra','cielo'],['tierra','agua'],['tierra','cielo','agua']][i];const its=[];zs.forEach(z=>shuffle(Z[z].it).slice(0,2).forEach(k=>its.push({k,zone:z})));
      return {ask:'¿Por dónde va cada uno? Por tierra, por el aire o por el agua.',zones:zs.map((z,j,a)=>({id:z,x:900-(a.length-1)*230+j*460,y:450,w:360,h:220,c:Z[z].c,icon:Z[z].ic})),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'sonido',icon:'ambulancia',name:'¿Quién suena así?',make:(d,t)=>Sonido({items:['ambulancia','camionBomberos','patrullero','helicoptero','tractor','submarino','tren','barco'],bg:t.bg},d)},
  {t:'ordena',icon:'autobus',name:'Del más corto al más largo',make:(d,t)=>Arrastra({rounds:2,key:'tamanos',bg:t.bg,
    why:()=>'Mmm, ese lugar es de otro tamaño. Mirá bien los cuadros.',
    gen(i){const set=i?['bici','auto','camion']:['moto','auto','autobus'];return {ask:'Ordená del más corto al más largo. El más corto va primero.',zones:[sizeSlot('s0',560,190),sizeSlot('s1',900,260),sizeSlot('s2',1300,330)],items:set.map((k,j)=>({k,zone:'s'+j,s:170})),tray:{x0:460,x1:1400,y:790},okAll:'¡Muy bien! Del más corto al más largo.'}}},d)}]},
{id:'4A-T12',n:'Los bichitos y el verano',icon:'hormiga',c:'#FF5A5A',trim:3,bg:BG.primavera,season:'verano',
 words:[{k:'hormiga',say:'La hormiga. Trabaja en equipo y es muy fuerte.'},{k:'caracol',say:'El caracol. Lleva su casa en la espalda, ¡como yo!'},{k:'mariposa',say:'La mariposa. Antes fue una oruga.'},{k:'abeja',say:'La abeja. Hace miel con las flores.'},{k:'mariquita',say:['La vaquita de San Antonio. Tiene puntitos negros.','La mariquita. Tiene puntitos negros.']},{k:'arana',say:'La araña. Tiene ocho patas y teje su tela.'},{k:'gusano',say:'El gusano. Vive bajo la tierra y la ayuda a estar sana.'},{k:'oruga',say:'La oruga. Come hojas y un día será mariposa.'}],
 games:[{t:'conocer'},
  {t:'lupa',icon:'lupa',name:'Buscá con la lupa',make:(d,t)=>{const P=shuffle([[420,560],[700,700],[980,520],[1250,690],[560,330],[1150,330],[1380,480]]),bugs=shuffle(['hormiga','arana','mariquita','gusano','oruga','caracol','abeja']).slice(0,AGE()<=3?3:AGE()===4?4:5);
    const items=bugs.map((k,j)=>({k,x:P[j][0],y:P[j][1],s:150}));const blades=Array.from({length:90},(_,j)=>[(j*53)%1300+300,250+(j*97)%560,ri(30,70),rnd(-.3,.3)]);
    const base=()=>{sky('#C9EBB5','#9FDC8F');for(const o of items)if(!o.found){ctx.globalAlpha=.9;thing(o.k,o.x,o.y,o.s*.32);ctx.globalAlpha=1}};
    const cover=()=>{for(const [x,y,h,r] of blades){ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(0,-h,4,-h*1.1);ctx.quadraticCurveTo(6,-h*.5,8,0);ctx.fillStyle='#5FA84E';ctx.fill();ctx.restore()}};
    return Lens({items,base,cover,key:'lupa',intro:'Hay bichitos escondidos en el pasto. Mirá con la lupa y tocalos.',ask:k=>'Buscá '+W_(k)+'.',
      inside:(its,L)=>{ctx.fillStyle='#BFE6A0';ctx.fillRect(L.x-L.r,L.y-L.r,L.r*2,L.r*2);for(const o of its)if(!o.found&&dist(o.x,o.y,L.x,L.y)<L.r+o.s){thing(o.k,L.x+(o.x-L.x)*1.6,L.y+(o.y-L.y)*1.6,o.s*.9)}}},d)}},
  {t:'series',icon:'mariquita',name:'¿Qué viene después?',make:(d,t)=>Series({pool:['mariquita','abeja','hormiga','mariposa','caracol','arana'],bg:t.bg},d)},
  {t:'memoria'}]}
];
const z_x=(a,j)=>900-(a.length-1)*250+j*500;

/* ---------- Rincón de los Conceptos (4 años) ---------- */
const C4={id:'4A-C',n:'Rincón de los Conceptos',icon:'formas',c:'#9B8AD9',trim:0,bg:BG.conceptos,concepts:true,
 games:[
  {t:'pinta',icon:'pinturas',name:'Más colores',make:(d,t)=>Pinta({items:COLS4,bg:t.bg},d)},
  {t:'formas',icon:'formas',name:'Las formas',make:(d,t)=>Arrastra({rounds:2,key:'formas',bg:t.bg,
    why:(it,z)=>'Mmm, esa forma no es '+shape2(z.id).name+'.',placeSay:(it,z)=>cap(shape2(z.id).name)+'.',
    gen(i){const fs=i?['triangulo','rectangulo','circulo']:['cuadrado','triangulo','rectangulo'],cs=shuffle(['#FF5A5A','#5B8DEF','#FFD66B','#7CC86E','#F58BB4','#FFA94D']);const its=[];fs.forEach((f,j)=>{for(let q=0;q<(AGE()<=3?1:2);q++)its.push({k:shape2(f,cs[(j*2+q)%6]),zone:f,s:150})});
      return {ask:'Cada forma va con su forma. Arrastralas.',zones:fs.map((f,j)=>({id:f,x:440+j*460,y:430,w:340,h:210,c:'#E8B46A',icon:(x,y,s)=>shape2(f,'#fff').draw(x,y,s)})),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'masmenos',icon:'galleta',name:'Más y menos',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'mas-menos',y:500,big:true,
    gen(i){const mas=i%2===0,a=ri(1,4),b=Math.min(6,a+ri(2,3)),k=pick(['galleta','fresa','uva','pelota']),A=plateN(b,k),B=plateN(a,k);return {words:[A,B],ok:[mas?A:B],ask:mas?'¿Dónde hay más? Tocá el plato.':'¿Dónde hay menos? Tocá el plato.',okSay:()=>mas?'¡Sí! Ahí hay '+NUM[b]+', es más.':'¡Sí! Ahí hay '+NUM[a]+', es menos.',badSay:()=>mas?'Ahí hay menos. Contá y buscá donde hay más.':'Ahí hay más. Contá y buscá donde hay menos.'}}},d)},
  {t:'alto',icon:'jirafa',name:'Alto, bajo, largo y corto',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'alto-largo',y:500,big:true,
    gen(i){const q=i%4,c=pick(['#5B8DEF','#FF8A7A','#7CC86E']);if(q<2){const A=towerOf(ri(5,6)),B=towerOf(ri(1,2));return {words:[A,B],ok:[q===0?A:B],ask:q===0?'¿Cuál es la torre más alta?':'¿Cuál es la torre más baja?',okSay:()=>q===0?'¡Sí! Esa es la más alta.':'¡Sí! Esa es la más baja.',badSay:()=>'Mirá bien cuántos bloques tiene cada torre.'}}
      const A=pencilOf(.95,c),B=pencilOf(.4,c);return {words:[A,B],ok:[q===2?A:B],ask:q===2?'¿Cuál es el lápiz más largo?':'¿Cuál es el lápiz más corto?',okSay:()=>q===2?'¡Sí! Ese es el más largo.':'¡Sí! Ese es el más corto.',badSay:()=>'Mirá bien el tamaño de cada lápiz.'}}},d)},
  {t:'posiciones',icon:'gato',name:'Delante, detrás, cerca y lejos',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'posiciones',y:500,big:true,
    gen(i){const Q=[['caja','delante','detras','¿Dónde está el gato delante de la caja?'],['caja','detras','delante','¿Dónde está el gato detrás de la caja?'],['mesa','encima','debajo','¿Dónde está la pelota encima de la mesa?'],['mesa','debajo','encima','¿Dónde está la pelota debajo de la mesa?'],['casa','cerca','lejos','¿Dónde está el perro cerca de la casa?'],['casa','lejos','cerca','¿Dónde está el perro lejos de la casa?']];
      const q=Q[(i*2+ri(0,1))%6],A=posScene(q[0],q[1]),B=posScene(q[0],q[2]);return {words:[A,B],ok:[A],ask:q[3],okSay:()=>'¡Sí! '+cap(A.name)+'.',badSay:()=>'Ahí está '+B.name+'. '+q[3]}}},d)},
  {t:'momentos',icon:'luna',name:'Mañana, tarde y noche',make:(d,t)=>ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'momentos-dia',y:500,big:true,
    gen(i){const Q=[['¿Cuándo desayunamos?','manana'],['¿Cuándo dormimos?','noche'],['¿Cuándo merendamos?','tarde'],['¿Cuándo sale el sol?','manana'],['¿Cuándo se ven las estrellas?','noche'],['¿Cuándo jugamos en el parque después de comer?','tarde']];const q=Q[(i+ri(0,5))%Q.length];
      const ids=['manana','tarde','noche'],ws=ids.map(momentScene),ok=ws[ids.indexOf(q[1])],words=AGE()<=3?[ok,ws.find(w=>w!==ok&&w!==ws[1])||ws[1]]:ws;
      return {words,ok:[ok],ask:q[0],okSay:()=>'¡Sí! '+cap(ok.name)+'.',badSay:w=>'Esa es '+w.name+'. '+q[0]}}},d)},
  {t:'series',icon:'estrella',name:'Series',make:(d,t)=>Series({pool:['rojo','azul','amarillo','verde','violeta','naranja'].map(c=>swatch(c)),bg:t.bg},d)},
  {t:'estaciones',icon:'hojaNaranja',name:'El árbol de las estaciones',make:(d,t)=>ChoiceGame({rounds:4,bg:t.bg,key:()=>'estaciones',y:520,big:true,
    gen(i){const es=shuffle(ESTACIONES),e=es[i%4],ws=ESTACIONES.map(seasonTree),ok=ws[ESTACIONES.indexOf(e)],others=shuffle(ws.filter(w=>w!==ok)).slice(0,nOpts()-1);
      const tip={otoño:'Las hojas se ponen naranjas y se caen.',invierno:'Hace frío y a veces nieva.',primavera:'Salen las flores.',verano:'Hace calor y hay frutas.'}[e];
      return {words:[ok,...others],ok:[ok],ask:'¿Cuál es el árbol '+(e==='primavera'?'de la primavera':'del '+e)+'? '+tip,okSay:()=>'¡Sí! Es el árbol '+(e==='primavera'?'de la primavera.':'del '+e+'.'),badSay:w=>'Ese es el árbol '+(w.name==='la primavera'?'de la primavera':'del '+w.name.slice(3))+'. '+tip}}},d)}]};
