/* ================= TEMAS DE 3 AÑOS ================= */
Object.assign(LEX,{lancha:'la lancha',helicoptero:'el helicóptero'});
Object.assign(LEX2,{pinturas:['los crayones','las pinturas']});

/* ---------- fondos ---------- */
function floor(y,c){ctx.fillStyle=c;ctx.fillRect(0,y,W,H-y)}
function grass(y,c='#9FDC8F'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=W;x+=80)ctx.quadraticCurveTo(x+40,y-14,x+80,y);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill()}
function fallingDeco(cols,n=10,sp=30){for(let i=0;i<n;i++){const x=(i*173+T*sp*(i%3+1))%1700-50,y=(i*97+T*sp*1.4)%1000-50;ctx.save();ctx.translate(x,y);ctx.rotate(T+i);ctx.globalAlpha=.35;ell(0,0,16,9,cols[i%cols.length],0);ctx.restore()}ctx.globalAlpha=1}
const BG={
  aula(){sky('#FFF3D6','#FCE7C8');floor(700,'#E9C99A');card(1020,36,500,120,'#3E6B4E',8,12);text('A  B  C  1  2  3',1270,118,52,'#fff',{f:LF});for(let i=0;i<6;i++){ctx.save();ctx.translate(330+i*120,60);ctx.rotate(Math.sin(T+i)*.05);ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(40,0);ctx.lineTo(0,56);ctx.closePath();fillStroke(DIAC[i],4);ctx.restore()}},
  cuerpo(){sky('#FFE9EC','#FFD7DC');floor(760,'#F5C1C9');for(let i=0;i<10;i++)circ((i*211)%1600,(i*137)%700+40,18,'rgba(255,255,255,.5)',0)},
  colores(){sky('#FFFFFF','#FFF4E2');floor(740,'#F1E2C8');[['#FF5A5A',300,90],['#5B8DEF',1500,120],['#FFD66B',1420,640],['#7CC86E',260,600]].forEach(([c,x,y])=>{ctx.globalAlpha=.25;circ(x,y,80,c,0);circ(x+60,y+40,40,c,0);ctx.globalAlpha=1})},
  otono(){sky('#FFE2B8','#FFD08A');grass(760,'#C98A4B');fallingDeco(['#FFA94D','#FF6B5E','#C98A4B'])},
  familia(){sky('#FFF0DC','#FBE1C0');floor(720,'#D9A877');card(1180,60,300,220,'#BFEAF7',8,16);ctx.beginPath();ctx.moveTo(1330,60);ctx.lineTo(1330,280);ctx.moveTo(1180,170);ctx.lineTo(1480,170);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke();for(let i=0;i<3;i++)circ(330+i*70,90,14+i*3,DIAC[i+3],4)},
  invierno(){sky('#CFE8F7','#EAF6FB');grass(740,'#FFFFFF');for(let i=0;i<24;i++){const x=(i*137+T*20)%1600,y=(i*89+T*50*(1+i%3)/2)%900;ctx.globalAlpha=.8;circ(x,y,4+i%3*2,'#fff',0)}ctx.globalAlpha=1},
  cocina(){sky('#FFF8E8','#FFF1D6');ctx.fillStyle='#FFE3E0';for(let x=0;x<W;x+=80)for(let y=0;y<300;y+=80)if((x+y)/80%2===0)ctx.fillRect(x,y,80,80);floor(720,'#D9B48A')},
  casa(){sky('#FFF7DA','#FFF0C2');floor(740,'#E2C08F')},
  granja(){sky('#BFEAF7','#E9F7FC');cloud(220,120,1);cloud(1180,90,1.2);grass(560,'#9FDC8F');ctx.fillStyle='#A8D88F';ctx.fillRect(0,700,W,200);ctx.strokeStyle='#C98A4B';ctx.lineWidth=10;for(let x=0;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,560);ctx.lineTo(x,620);ctx.stroke()}ctx.beginPath();ctx.moveTo(0,580);ctx.lineTo(W,580);ctx.moveTo(0,605);ctx.lineTo(W,605);ctx.stroke()},
  primavera(){sky('#D5F0FA','#EFFAF2');grass(700,'#9FDC8F');for(let i=0;i<14;i++){const x=(i*117)%1600+20,y=740+(i*53)%140;ctx.fillStyle='#5FA84E';ctx.fillRect(x-2,y,4,24);flower(x,y,12,FLC[i%FLC.length],2)}},
  ciudad(){sky('#D5F0FA','#EAF6FB');for(let i=0;i<8;i++){const x=i*210,h=160+(i*67)%140;card(x+10,560-h,170,h+20,['#F7C7DA','#FFE08A','#BFE6B5','#CFE0FF'][i%4],6,10)}floor(560,'#9AA5B4');ctx.fillStyle='#fff';for(let x=0;x<W;x+=120)ctx.fillRect(x,700,60,10);floor(800,'#B9D99A')},
  playa(){sky('#BFEAF7','#E9F7FC');ctx.fillStyle='#7FD3F0';ctx.fillRect(0,220,W,140);for(let i=0;i<8;i++){ctx.beginPath();const x=i*210+(T*20%210);ctx.moveTo(x,280);ctx.quadraticCurveTo(x+25,265,x+50,280);ctx.lineWidth=5;ctx.strokeStyle='#B9E9F8';ctx.stroke()}floor(350,'#FFE6A8');circ(1460,110,60,'#FFD66B',6)},
  conceptos(){sky('#F3ECFF','#FFF6E6');floor(740,'#E4D3B8');for(let i=0;i<6;i++){ctx.globalAlpha=.25;const x=(i*277)%1600,y=(i*151)%600+40;i%2?circ(x,y,40,DIAC[i],0):(rr(x-36,y-36,72,72,10),fillStroke(DIAC[i],0));ctx.globalAlpha=1}}
};

/* ---------- piezas dibujadas para algunos juegos ---------- */
const swatch=c=>({name:COLORES[c].n,draw:(x,y,s)=>{ctx.save();ctx.translate(x,y);ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*PI*2,r=s*.36*(1+.12*Math.sin(i*2.3));ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();fillStroke(COLORES[c].c,6);circ(-s*.1,-s*.1,s*.06,'rgba(255,255,255,.6)',0);ctx.restore()}});
const shape=(f,c)=>({name:f==='circulo'?'el círculo':'el cuadrado',draw:(x,y,s)=>{if(f==='circulo')circ(x,y,s*.38,c,6);else card(x-s*.36,y-s*.36,s*.72,s*.72,c,6,8)}});
const snowPart=(id)=>({name:{base:'la bola grande',medio:'la bola mediana',cabeza:'la cabeza',sombrero:'el sombrero',nariz:'la nariz de zanahoria'}[id],id,
  draw:(x,y,s)=>{const k=s/170;ctx.save();ctx.translate(x,y);ctx.scale(k,k);
    if(id==='base')circ(0,0,80,'#fff',7);if(id==='medio')circ(0,0,62,'#fff',7);
    if(id==='cabeza'){circ(0,0,48,'#fff',7);circ(-16,-6,6,K,0);circ(16,-6,6,K,0);ctx.beginPath();ctx.arc(0,10,16,.2*PI,.8*PI);ctx.lineWidth=5;ctx.strokeStyle=K;ctx.stroke()}
    if(id==='sombrero'){card(-34,-56,68,62,K,0,6);card(-56,0,112,18,K,0,8);card(-34,-14,68,12,'#FF6B5E',0,2)}
    if(id==='nariz'){ctx.beginPath();ctx.moveTo(-30,-10);ctx.lineTo(40,0);ctx.lineTo(-30,10);ctx.closePath();fillStroke('#FFA94D',5)}
    ctx.restore()}});
const plateOf=n=>({name:n>4?'muchas galletas':'pocas galletas',draw:(x,y,s)=>{pic('plato',x,y+s*.14,s*1.05);const P=[[0,0],[-.2,.02],[.2,.02],[-.1,-.1],[.1,-.1],[0,-.2],[-.3,-.06],[.3,-.06],[-.2,-.2],[.2,-.2]];for(let i=0;i<n;i++)pic('galleta',x+P[i][0]*s,y+P[i][1]*s,s*.26)}});
const dayNight=d=>({name:d?'de día':'de noche',draw:(x,y,s)=>{ctx.save();rr(x-s/2+8,y-s/2+8,s-16,s-16,30);ctx.clip();ctx.fillStyle=d?'#9ED9F5':'#2E3F7A';ctx.fillRect(x-s/2,y-s/2,s,s);
  if(d){pic('sol',x+s*.18,y-s*.18,s*.38);cloud(x-s*.36,y-s*.02,s*.0035,'#fff')}else{pic('luna',x+s*.18,y-s*.2,s*.36);for(let i=0;i<6;i++)star(x-s*.4+i*s*.13,y-s*.3+(i%2)*s*.18,7,'#FFE08A',0)}
  ctx.fillStyle=d?'#9FDC8F':'#3D5A3E';ctx.fillRect(x-s/2,y+s*.22,s,s*.3);ctx.restore()}});

/* ---------- zonas dibujadas ---------- */
const roomZone=(id,x,y,w,h,c,icon,nm)=>({id,x,y,w,h,nm,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=34}card(x-w/2,y-h/2,w,h,c,7,26);ctx.restore();ctx.save();ctx.beginPath();ctx.moveTo(x-w/2,y+h*.25);ctx.lineTo(x+w/2,y+h*.25);ctx.lineWidth=5;ctx.strokeStyle='rgba(74,52,40,.25)';ctx.stroke();ctx.restore();card(x-w/2+14,y-h/2+14,90,90,'#fff',5,22);pic(icon,x-w/2+59,y-h/2+59,76)},
  slot:(n)=>[x-w*.12+(n%3)*w*.24,y+h*.06+Math.floor(n/3)*-60],ps:.62});
const mochilaZone={id:'dentro',x:600,y:450,w:380,h:420,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}pic('mochila',600,450,470);ctx.restore();ell(600,330,120,30,'#2E4E9A',5)},slot:n=>[540+(n%3)*60,440+Math.floor(n/3)*50],ps:.55};
const mesaZone={id:'fuera',x:1210,y:440,w:480,h:260,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=34}card(970,460,480,40,'#C98A4B',7,10);ctx.restore();card(1000,500,30,150,'#A86B43',6,6);card(1390,500,30,150,'#A86B43',6,6)},slot:n=>[1060+n*110,400],ps:.7};
const corralZone={id:'dentro',x:600,y:470,w:520,h:330,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}card(340,305,520,330,'#E8D49A',0,30);ctx.restore();ctx.strokeStyle='#A86B43';ctx.lineWidth=12;ctx.lineCap='round';for(let i=0;i<=8;i++){ctx.beginPath();ctx.moveTo(340+i*65,280);ctx.lineTo(340+i*65,650);ctx.stroke()}
  ctx.lineWidth=10;for(const yy of[320,600]){ctx.beginPath();ctx.moveTo(330,yy);ctx.lineTo(870,yy);ctx.stroke()}ctx.lineWidth=5;ctx.strokeStyle=K;ctx.strokeRect(340,305,520,330)},slot:n=>[430+(n%3)*170,420+Math.floor(n/3)*130],ps:.75};
const pradoZone={id:'fuera',x:1230,y:470,w:520,h:330,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}card(970,305,520,330,'rgba(124,200,110,.35)',5,30);ctx.restore();for(let i=0;i<6;i++)flower(1010+i*85,610,10,FLC[i],2)},slot:n=>[1070+(n%3)*160,420+Math.floor(n/3)*130],ps:.75};
const kidZone=(wear)=>({id:'kid',x:1000,y:560,w:420,h:700,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=40}drawKid(1000,880,1.15,{wear});ctx.restore()},slot:()=>[1000,500],ps:.01});
const panelZone=(id,x,y,w,h,draw)=>({id,x,y,w,h,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=36}draw(x,y,w,h);ctx.restore()},slot:n=>[x-w*.38+(n%5)*w*.19,y+(Math.floor(n/5)%2?-40:110)],ps:1.15});
const sizeSlot=(id,x,s)=>({id,x,y:430,w:s,h:s,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=30}ctx.setLineDash([14,12]);rr(x-s/2,430-s/2,s,s,24);fillStroke('rgba(255,255,255,.7)',6,hl?'#FFC93C':'#B8A890');ctx.setLineDash([]);ctx.restore()},slot:()=>[x,430],ps:s/170});

/* ---------- vestir al nene ---------- */
function vestir(okK,badK,ask,why){
  return (onDone,t)=>{const wear={};const R=2;
    return Arrastra({rounds:R,key:'vestir',noCard:false,bg:t.bg,sayPick:true,
      why:(it)=>V(why(it.k)),
      gen(i){Object.keys(wear).forEach(k=>delete wear[k]);const ok=shuffle(okK).slice(0,AGE()<=3?3:4),bad=shuffle(badK).slice(0,2);
        return {ask,zones:[kidZone(wear)],tray:{x0:300,x1:760,y:0},
          items:[...ok.map(k=>({k,zone:'kid'})),...bad.map(k=>({k,zone:'no'}))].map((o,j)=>Object.assign(o,{x:j%2?660:420,y:200+Math.floor(j/2)*200,s:170})),
          onPlace:(it)=>{wear[it.k]=1;it.hidden=true;say(cap(nameT(it.k))+'.')},okAll:'¡Listo! ¡Quedó muy bien vestido!'}}},onDone)}
}
// los que no van tienen zona 'no' y se rechazan con una explicación

/* ---------- los 12 temas ---------- */
const T3=[
{id:'3A-T1',n:['Mi escuela','Mi cole'],icon:'mochila',c:'#5B8DEF',trim:1,bg:BG.aula,
 words:[{k:'mochila',say:['La mochila. Acá llevo mis cosas a la escuela.','La mochila. Aquí llevo mis cosas al cole.']},{k:'mesa',say:'La mesa. En la mesa pintamos y comemos.'},{k:'silla',say:'La silla. Me siento en la silla.'},
  {k:'lapiz',say:'El lápiz. Con el lápiz dibujo.'},{k:'pinturas',say:['Los crayones. ¡Pintamos de colores!','Las pinturas. ¡Pintamos de colores!']},{k:'cuento',say:['El cuento. La seño nos lee cuentos.','El cuento. La profe nos lee cuentos.']},
  {k:'pelota',say:'La pelota. En el recreo jugamos a la pelota.'},{k:'tobogan',say:'El tobogán. ¡Me tiro por el tobogán! ¡Uiii!'},{k:'maestra',say:['La seño. Nos enseña y nos cuida.','La profe. Nos enseña y nos cuida.']}],
 games:[{t:'conocer'},{t:'busca'},
  {t:'guarda',icon:'mochila',make:(d,t)=>Arrastra({rounds:1,total:AGE()<=3?4:5,key:'dentro-fuera',bg:t.bg,
    gen(){const its=['lapiz','cuento','pinturas','pelota','manzana'];const st=shuffle(its).slice(0,AGE()<=3?4:5).map((k,j)=>({k,zone:j%2?'fuera':'dentro'}));
      return {ask:'Vamos a ordenar. Escuchá bien dónde va cada cosa.',zones:[mochilaZone,mesaZone],items:its.map(k=>({k,s:150})),tray:{x0:330,x1:1520,y:790},
        steps:st.map(s=>({k:s.k,zone:s.zone,say:s.zone==='dentro'?'Guardá '+W_(s.k)+' dentro de la mochila.':'Dejá '+W_(s.k)+' fuera de la mochila, en la mesa.',ok:s.zone==='dentro'?'¡Muy bien! Está dentro de la mochila.':'¡Muy bien! Está fuera de la mochila.'}))}}},d)},
  {t:'memoria'}]},
{id:'3A-T2',n:'Mi cuerpo',icon:'cara',c:'#F58BB4',trim:1,bg:BG.cuerpo,words:[{k:'ojo'},{k:'nariz'},{k:'boca'},{k:'oreja'},{k:'mano'},{k:'pie'}],
 games:[{t:'cuerpo',icon:'nene',make:(d,t)=>Cuerpo({mode:'free',bg:t.bg},d)},{t:'toca',icon:'mano',make:(d,t)=>Cuerpo({mode:'ask',bg:t.bg,only:['ojos','nariz','boca','orejas','pelo','cabeza','manos','brazos','barriga','piernas','pies']},d)},
  {t:'puzzle',icon:'cara',make:(d,t)=>Puzzle({list:['cara','nene'],bg:t.bg},d)},{t:'busca'}]},
{id:'3A-T3',n:'Los colores',icon:'pinturas',c:'#FF5A5A',trim:1,bg:BG.colores,
 words:['rojo','azul','amarillo','verde'].map(c=>Object.assign(swatch(c),{label:COLORES[c].n,say:{rojo:'Rojo. Rojo como la frutilla y el tomate.',azul:'Azul. Azul como el mar y la ballena.',amarillo:'Amarillo. Amarillo como el sol y la banana.',verde:'Verde. Verde como la rana y las hojas.'}[c],ex:{rojo:['fresa','tomate','manzana'],azul:['ballena','gota','pajaro'],amarillo:['sol','banana','pato'],verde:['rana','hoja','pera']}[c]})),
 games:[{t:'conocer',icon:'pinturas',make:(d,t)=>Conocer({items:t.words,bg:t.bg,intro:'Estos son los colores. Tocá cada uno para conocerlo.'},d)},
  {t:'pinta',icon:'pinturas',make:(d,t)=>Pinta({items:COLS3,bg:t.bg},d)},
  {t:'clasifica',icon:'fresa',make:(d,t)=>Arrastra({rounds:3,key:'colores',bg:t.bg,
    why:(it,z)=>'Mmm, '+nameT(it.k)+' no es '+V(COLORES[z.id].n)+'. ¿De qué color es?',placeSay:(it,z)=>cap(nameT(it.k))+(isPl(it.k)?' son ':' es ')+colorAdj(z.id,it.k)+'.',
    gen(i){const cs=shuffle(['rojo','azul','amarillo','verde']).slice(0,AGE()<=3&&i<2?2:3);const its=[];cs.forEach(c=>shuffle(COLS3.filter(q=>q[1]===c)).slice(0,2).forEach(q=>its.push({k:q[0],zone:c,s:150})));
      return {ask:'Poné cada cosa en la canasta de su color.',zones:cs.map((c,j,a)=>({id:c,x:900-(a.length-1)*230+j*460,y:450,w:330,h:220,c:'#E8B46A',icon:(x,y,s)=>swatch(c).draw(x,y,s*1.1)})),items:its,tray:{x0:330,x1:1520,y:790}}}},d)},
  {t:'burbujas',icon:'globo',make:(d,t)=>Atrapa({targets:shuffle(['rojo','amarillo','azul','verde']).slice(0,AGE()<=3?3:4).map(c=>({ask:'¡Atrapá las burbujas de color '+V(COLORES[c].n)+'!',is:k=>(COLS3.find(q=>q[0]===k)||[])[1]===c,label:'',icon:(x,y,s)=>swatch(c).draw(x-180,y,s*1.1)})),
    pool:COLS3.map(q=>q[0]),ring:k=>COLORES[(COLS3.find(q=>q[0]===k)||[,'azul'])[1]].c,bg:()=>{sky('#E8F7FD','#BFE6F7')},key:'colores'},d)}]},
{id:'3A-T4',n:'El otoño',icon:'hojaNaranja',c:'#FFA94D',trim:1,bg:BG.otono,season:'otoño',
 words:[{k:'hojaNaranja',label:'hoja',say:'Las hojas. En otoño se ponen naranjas, rojas y marrones, ¡y se caen de los árboles!'},{k:'castana',say:'La castaña. Es un fruto del otoño.'},{k:'seta',say:['El hongo. Crece cuando llueve.','La seta. Crece cuando llueve.']},
  {k:'lluvia',say:'La lluvia. En otoño llueve mucho.'},{k:'paraguas',say:'El paraguas. Nos tapa de la lluvia.'},{k:'botasAgua',say:['Las botas de lluvia. ¡Para saltar en los charcos!','Las botas de agua. ¡Para saltar en los charcos!']},{k:'ardilla',say:'La ardilla. Junta comida para el invierno.'},{k:'viento',say:'El viento. ¡Sopla y se llevan las hojas! Fiuuu.'}],
 games:[{t:'conocer'},
  {t:'cae',icon:'hojaRoja',make:(d,t)=>Atrapa({dir:'down',style:'plain',targets:[{ask:'¡Se caen las hojas! Atrapá las hojas.',is:k=>/^hoja/.test(k)},{ask:'¡Ahora atrapá las castañas!',is:k=>k==='castana'}],pool:['hojaNaranja','hojaRoja','hojaMarron','castana','castana','seta'],bg:t.bg,key:'otono'},d)},
  {t:'viste',icon:'paraguas',make:vestir(['paraguas','botasAgua','abrigo','gorro'],['gafas','remera','gorra'],'¡Está lloviendo! Vestí al nene para salir con lluvia. Arrastrá la ropa hasta el nene.',k=>({gafas:'Los anteojos de sol son para cuando hay sol, no para la lluvia.',remera:'Con remera nos mojamos y tenemos frío.',gorra:'La gorra es para el sol. Con lluvia mejor el paraguas.'}[k]||'Eso no va.'))},
  {t:'busca'}]},
{id:'3A-T5',n:'Mi familia',icon:'mama',c:'#FF8A7A',trim:1,bg:BG.familia,
 words:[{k:'mama',say:'Mamá.'},{k:'papa',say:'Papá.'},{k:'hermano',say:'El hermano.'},{k:'hermana',say:'La hermana.'},{k:'bebe',say:'El bebé. Es chiquito y toma leche.'},{k:'abuelo',say:'El abuelo. Es el papá de papá o de mamá.'},{k:'abuela',say:'La abuela. Es la mamá de mamá o de papá.'}],
 intro:'Esta es una familia. Todas las familias son distintas, ¡y todas son lindas! Tocá a cada uno.',
 games:[{t:'conocer'},
  {t:'ordena',icon:'bebe',make:(d,t)=>Arrastra({rounds:2,key:'tamanos',bg:t.bg,
    why:()=>'Mmm, ese lugar es de otro tamaño. Mirá bien los cuadros.',
    gen(i){const set=i?['bebe','hermana','papa']:['bebe','hermano','abuela'];
      return {ask:'Ordená de más chiquito a más grande. El más chiquito va primero.',zones:[sizeSlot('s0',560,190),sizeSlot('s1',900,260),sizeSlot('s2',1300,330)],items:set.map((k,j)=>({k,zone:'s'+j,s:170})),tray:{x0:460,x1:1400,y:790},okAll:'¡Muy bien! Del más chiquito al más grande.'}}},d)},
  {t:'mifamilia',icon:'casa',make:(d,t)=>Arrastra({rounds:1,key:'familia',bg:t.bg,sayPick:false,
    gen(){return {free:true,ask:'¡Armá tu familia! Llevá a la casa a las personas que viven con vos. Cuando termines, tocá el botón verde.',
      zones:[panelZone('casa',900,400,620,420,(x,y,w,h)=>{ctx.beginPath();ctx.moveTo(x-w/2-30,y-h/2+60);ctx.lineTo(x,y-h/2-90);ctx.lineTo(x+w/2+30,y-h/2+60);ctx.closePath();fillStroke('#FF8A7A',7);card(x-w/2,y-h/2+60,w,h-60,'#FFF3B0',7,12)})],
      items:['mama','papa','hermano','hermana','bebe','abuelo','abuela','perro','gato'].map(k=>({k,s:140})),tray:{x0:300,x1:1540,y:790}}}},d)},
  {t:'busca'}]},
{id:'3A-T6',n:'El invierno y la ropa',icon:'muneco',c:'#7FD3F0',trim:2,bg:BG.invierno,season:'invierno',
 words:[{k:'copo',say:'La nieve. En invierno hace mucho frío y a veces nieva.'},{k:'muneco',say:'El muñeco de nieve. ¡Lo hacemos con nieve!'},{k:'abrigo',say:['El abrigo. Nos da calorcito.','El abrigo. Nos da calorcito.']},{k:'gorro',say:'El gorro. Para la cabeza.'},
  {k:'bufanda',say:'La bufanda. Para el cuello.'},{k:'guantes',say:'Los guantes. Para las manos.'},{k:'bota',say:'Las botas. Para los pies.'}],
 games:[{t:'conocer'},
  {t:'viste',icon:'gorro',make:vestir(['abrigo','gorro','bufanda','guantes'],['gafas','remera','gorra'],'¡Hace mucho frío! Vestí al nene para salir a la nieve.',k=>({gafas:'Los anteojos de sol son para el verano.',remera:'Con remera tenemos frío. Busquemos ropa abrigada.',gorra:'La gorra es para el sol. Para el frío mejor el gorro.'}[k]||'Eso no va.'))},
  {t:'clasifica',icon:'copo',make:(d,t)=>Arrastra({rounds:2,key:'frio-calor',bg:t.bg,
    why:(it,z)=>z.id==='frio'?cap(nameT(it.k))+' es para cuando hace calor.':cap(nameT(it.k))+' es para cuando hace frío.',
    gen(){const fr=shuffle(['abrigo','gorro','bufanda','guantes','muneco']).slice(0,2),ca=shuffle(['remera','gafas','gorra','helado','sandia']).slice(0,2);
      return {ask:'¿Frío o calor? Las cosas del frío van con la nieve. Las del calor van con el sol.',zones:[{id:'frio',x:560,y:450,w:360,h:230,c:'#CFE8F7',icon:(x,y,s)=>pic('copo',x,y,s)},{id:'calor',x:1240,y:450,w:360,h:230,c:'#FFE08A',icon:(x,y,s)=>pic('sol',x,y,s)}],
        items:[...fr.map(k=>({k,zone:'frio'})),...ca.map(k=>({k,zone:'calor'}))],tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'arma',icon:'muneco',make:(d,t)=>Arrastra({rounds:1,key:'armar',bg:t.bg,noCard:true,
    why:()=>'Esa pieza va en otro lugar. ¡Mirá la sombra!',
    gen(){const P=['base','medio','cabeza','sombrero','nariz'].slice(0,AGE()<=3?4:5);const pos={base:[900,640],medio:[900,500],cabeza:[900,385],sombrero:[900,318],nariz:[948,386]};const sz={base:170,medio:170,cabeza:170,sombrero:150,nariz:90};
      return {ask:'¡Hagamos un muñeco de nieve! Arrastrá cada parte a su sombra.',
        zones:P.map(id=>({id,x:pos[id][0],y:pos[id][1],w:id==='base'?160:id==='nariz'?70:120,h:id==='base'?160:id==='nariz'?60:110,draw:()=>{ctx.save();ctx.globalAlpha=.22;snowPart(id).draw(pos[id][0],pos[id][1],sz[id]);ctx.restore()},slot:()=>pos[id],ps:1.16})),
        items:shuffle(P).map((id,j)=>({k:snowPart(id),zone:id,s:sz[id],x:[380,380,1400,1400,1400][j],y:[330,610,300,520,730][j]})),
        okAll:'¡Qué lindo muñeco de nieve!'}}},d)}]},
{id:'3A-T7',n:'Las frutas y el desayuno',icon:'manzana',c:'#FF6B5E',trim:2,bg:BG.cocina,
 words:[{k:'manzana',say:'La manzana. ¡Crunch!'},{k:'banana',say:'La banana. Se pela y se come.'},{k:'naranja',say:'La naranja. Con la naranja hacemos jugo.'},{k:'pera',say:'La pera. Es dulce y jugosa.'},{k:'fresa',say:'La frutilla. Es roja y chiquita.'},
  {k:'uva',say:'Las uvas. Crecen en racimos.'},{k:'leche',say:'La leche. Para el desayuno.'},{k:'pan',say:'El pan. Rico en el desayuno.'},{k:'zumo',say:'El jugo de naranja. ¡Mmm!'}],
 games:[{t:'conocer'},{t:'busca'},
  {t:'macedonia',icon:'macedonia',make:(d,t)=>Arrastra({rounds:1,total:AGE()<=3?4:5,key:'frutas',bg:t.bg,sayPick:false,
    gen(){const fr=['manzana','banana','naranja','pera','fresa','uva'];const st=shuffle(fr).slice(0,AGE()<=3?4:5);
      return {ask:'¡Hagamos una ensalada de frutas! Te digo qué fruta va en el bol.',zones:[{id:'bol',x:900,y:440,w:420,h:260,draw:(z,hl)=>{ctx.save();if(hl){ctx.shadowColor='#FFC93C';ctx.shadowBlur=36}pic('bol',900,470,460);ctx.restore()},slot:n=>[780+(n%4)*80,400-Math.floor(n/4)*30],ps:.55}],
        items:fr.map(k=>({k,s:150})),tray:{x0:330,x1:1520,y:790},steps:st.map(k=>({k,zone:'bol',say:'Poné '+W_(k)+' en el bol.',ok:pick(['¡Mmm, qué rico!','¡Muy bien!','¡Eso es!'])})),onPlace:()=>SFX.munch()}}},d)},
  {t:'cuenta',icon:'fresa',make:(d,t)=>Cuenta({pool:['manzana','fresa','pera','naranja','banana'],bg:t.bg},d)}]},
{id:'3A-T8',n:'Mi casa',icon:'casa',c:'#FFC93C',trim:2,bg:BG.casa,
 words:[{k:'cama',say:'La cama. Acá dormimos.'},{k:'sofa',say:['El sillón. Para sentarnos todos juntos.','El sofá. Para sentarnos todos juntos.']},{k:'mesa',say:'La mesa. Acá comemos.'},{k:'banera',say:'La bañera. Para bañarnos con burbujas.'},{k:'inodoro',say:'El inodoro. Para hacer pis y caca.'},
  {k:'cepillo',say:'El cepillo de dientes. ¡A lavarse los dientes!'},{k:'nevera',say:'La heladera. Guarda la comida fresquita.'},{k:'olla',say:'La olla. Para cocinar.'},{k:'tele',say:'La tele. Para ver dibujitos un ratito.'}],
 games:[{t:'conocer'},
  {t:'ordena',icon:'cama',make:(d,t)=>Arrastra({rounds:AGE()<=3?2:3,key:'casa',bg:t.bg,
    why:(it,z)=>cap(nameT(it.k))+' no va '+V(z.nm[1])+'.',placeSay:(it,z)=>cap(nameT(it.k))+' va '+V(z.nm[1])+'.',
    gen(i){const R={cocina:{c:'#FFE3E0',ic:'olla',it:['nevera','olla'],nm:['la cocina','en la cocina']},bano:{c:'#D5F0FA',ic:'banera',it:['inodoro','cepillo','banera'],nm:['el baño','en el baño']},dorm:{c:'#EDE7FF',ic:'cama',it:['cama','oso'],nm:[['la pieza','el dormitorio'],['en la pieza','en el dormitorio']]},sala:{c:'#FFF3B0',ic:'sofa',it:['sofa','tele'],nm:[['el living','el salón'],['en el living','en el salón']]}};
      const pairs=[['cocina','bano'],['dorm','sala'],['cocina','dorm']][i%3];const its=[];pairs.forEach(r=>shuffle(R[r].it).slice(0,2).forEach(k=>its.push({k,zone:r,s:150})));
      return {ask:'Cada cosa va en su lugar de la casa. ¡Llevalas a su cuarto!',zones:pairs.map((r,j)=>roomZone(r,560+j*680,430,520,380,R[r].c,R[r].ic,R[r].nm)),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'busca'},{t:'memoria'}]},
{id:'3A-T9',n:'Los animales de la granja',icon:'vaca',c:'#7CC86E',trim:2,bg:BG.granja,
 words:[{k:'vaca',say:'La vaca. Nos da leche. ¡Muuu!'},{k:'cerdo',say:'El chancho. Le encanta el barro. ¡Oinc, oinc!'},{k:'gallina',say:'La gallina. Pone huevos. ¡Clo, clo!'},{k:'oveja',say:'La oveja. Tiene lana. ¡Beee!'},{k:'caballo',say:'El caballo. Corre muy rápido. ¡Iiiii!'},
  {k:'pato',say:'El pato. Nada en el agua. ¡Cuac, cuac!'},{k:'perro',say:'El perro. Cuida la granja. ¡Guau!'},{k:'gato',say:'El gato. ¡Miau!'},{k:'pollito',say:'El pollito. Es el bebé de la gallina. ¡Pío, pío!'}],
 games:[{t:'conocer'},{t:'sonido',icon:'oveja',make:(d,t)=>Sonido({items:['vaca','cerdo','gallina','oveja','caballo','pato','perro','gato','pollito'],bg:t.bg},d)},{t:'memoria'},
  {t:'corral',icon:'caballo',make:(d,t)=>Arrastra({rounds:1,total:AGE()<=3?4:5,key:'dentro-fuera',bg:t.bg,
    gen(){const an=['vaca','cerdo','oveja','caballo','gallina','pato'];const st=shuffle(an).slice(0,AGE()<=3?4:5).map((k,j)=>({k,zone:j%2?'fuera':'dentro'}));
      return {ask:'Es de noche y los animales van a dormir. Escuchá bien.',zones:[corralZone,pradoZone],items:an.map(k=>({k,s:150})),tray:{x0:330,x1:1520,y:800},
        steps:st.map(s=>({k:s.k,zone:s.zone,say:s.zone==='dentro'?'Llevá '+W_(s.k)+' dentro del corral.':'Dejá '+W_(s.k)+' fuera del corral, en el pasto.',ok:s.zone==='dentro'?'¡Eso! Dentro del corral.':'¡Eso! Fuera del corral.'}))}}},d)}]},
{id:'3A-T10',n:'La primavera',icon:'flor',c:'#F58BB4',trim:3,bg:BG.primavera,season:'primavera',
 words:[{k:'flor',say:'La flor. En primavera salen muchas flores.'},{k:'mariposa',say:'La mariposa. Vuela de flor en flor.'},{k:'mariquita',say:['La vaquita de San Antonio. Es roja con puntitos.','La mariquita. Es roja con puntitos.']},{k:'abeja',say:'La abeja. Hace miel. ¡Bzzz!'},
  {k:'pajaro',say:'El pájaro. Canta en primavera.'},{k:'nido',say:'El nido. La casita de los pájaros.'},{k:'sol',say:'El sol. En primavera hay más sol.'}],
 games:[{t:'conocer'},{t:'riega',icon:'regadera',make:(d,t)=>Riega({bg:t.bg,n:AGE()<=3?3:4},d)},
  {t:'cuenta',icon:'mariquita',make:(d,t)=>Cuenta({pool:['mariquita','mariposa','abeja','flor'],bg:t.bg},d)},
  {t:'pinta',icon:'mariposa',make:(d,t)=>Pinta({items:[['mariquita','rojo'],['sol','amarillo'],['pajaro','azul'],['hoja','verde'],['rana','verde'],['fresa','rojo'],['pato','amarillo'],['ballena','azul']],bg:t.bg},d)}]},
{id:'3A-T11',n:'Los transportes',icon:'autobus',c:'#5BB8E6',trim:3,bg:BG.ciudad,
 words:[{k:'auto',say:'El auto. Va por la calle. ¡Bip, bip!'},{k:'autobus',say:['El colectivo. Lleva a mucha gente.','El autobús. Lleva a mucha gente.']},{k:'tren',say:'El tren. Va por las vías. ¡Chu, chu!'},{k:'avion',say:'El avión. Vuela por el cielo.'},
  {k:'barco',say:'El barco. Navega por el agua.'},{k:'bici',say:'La bici. ¡Pedaleamos! ¡Rin, rin!'},{k:'moto',say:'La moto. ¡Brum, brum!'},{k:'helicoptero',say:'El helicóptero. Vuela y hace mucho ruido.'}],
 games:[{t:'conocer'},{t:'sonido',icon:'tren',make:(d,t)=>Sonido({items:['auto','autobus','tren','avion','barco','bici','moto'],bg:t.bg},d)},
  {t:'clasifica',icon:'avion',make:(d,t)=>Arrastra({rounds:3,key:'transportes',bg:t.bg,
    why:(it,z)=>({cielo:cap(nameT(it.k))+' no vuela.',agua:cap(nameT(it.k))+' no va por el agua.',tierra:cap(nameT(it.k))+' no va por la calle.'})[z.id],
    gen(i){const Z={tierra:{c:'#C9CED6',it:['auto','autobus','tren','bici','moto'],ic:(x,y,s)=>{ctx.fillStyle='#9AA5B4';ctx.fillRect(x-s/2,y-s*.15,s,s*.3);ctx.fillStyle='#fff';ctx.fillRect(x-s*.35,y-3,s*.25,6);ctx.fillRect(x+s*.1,y-3,s*.25,6)},nm:'tierra'},
      cielo:{c:'#CFEFFD',it:['avion','helicoptero'],ic:(x,y,s)=>cloud(x-s*.4,y,s*.005,'#9ED9F5'),nm:'cielo'},agua:{c:'#9ED9F5',it:['barco','lancha'],ic:(x,y,s)=>{ctx.beginPath();ctx.moveTo(x-s/2,y);for(let j=0;j<4;j++)ctx.quadraticCurveTo(x-s/2+j*s/4+s/8,y-16,x-s/2+(j+1)*s/4,y);ctx.lineWidth=8;ctx.strokeStyle='#5B8DEF';ctx.stroke()},nm:'agua'}};
      const zs=[['tierra','cielo'],['tierra','agua'],['tierra','cielo','agua']][i];const its=[];zs.forEach(z=>shuffle(Z[z].it).slice(0,2).forEach(k=>its.push({k,zone:z,s:150})));
      return {ask:zs.length>2?'¿Por dónde va? Por la calle, por el cielo o por el agua.':(zs[1]==='cielo'?'¿Va por la calle o vuela por el cielo?':'¿Va por la calle o por el agua?'),zones:zs.map((z,j,a)=>({id:z,x:900-(a.length-1)*230+j*460,y:450,w:360,h:220,c:Z[z].c,icon:Z[z].ic})),items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'busca'}]},
{id:'3A-T12',n:'El verano y la playa',icon:'castillo',c:'#FFD66B',trim:3,bg:BG.playa,season:'verano',
 words:[{k:'sol',say:'El sol. En verano hace mucho calor.'},{k:'castillo',say:'El castillo de arena.'},{k:'cubo',say:['El balde. Para llevar arena y agua.','El cubo. Para llevar arena y agua.']},{k:'pala',say:'La pala. Para cavar en la arena.'},{k:'toalla',say:'La toalla. Para secarnos.'},
  {k:'gafas',say:['Los anteojos de sol. Cuidan los ojos del sol.','Las gafas de sol. Cuidan los ojos del sol.']},{k:'gorra',say:'La gorra. Nos tapa la cabeza del sol.'},{k:'crema',say:['La crema para el sol. ¡Para no quemarnos!','La crema solar. ¡Para no quemarnos!']},{k:'helado',say:'El helado. ¡Fresquito!'},{k:'concha',say:'La concha. La encontramos en la arena.'}],
 games:[{t:'conocer'},
  {t:'viste',icon:'gafas',make:vestir(['gorra','gafas','remera','crema'],['abrigo','gorro','bufanda','guantes'],'¡Hace mucho calor! Preparemos al nene para ir a la playa.',k=>({abrigo:'¡Con abrigo en la playa tendríamos mucho calor!',gorro:'El gorro de lana es para el frío. Mejor la gorra.',bufanda:'La bufanda es para el invierno.',guantes:'Los guantes son para el frío.'}[k]||'Eso no va.'))},
  {t:'cuenta',icon:'estrellaMar',make:(d,t)=>Cuenta({pool:['concha','estrellaMar','helado','pez'],bg:t.bg},d)},
  {t:'excava',icon:'pala',make:(d,t)=>Excava({pool:['concha','estrellaMar','pala','cubo','pez','caracol'],bg:t.bg},d)}]}
];
const COLS3=[['fresa','rojo'],['tomate','rojo'],['manzana','rojo'],['sol','amarillo'],['banana','amarillo'],['pato','amarillo'],['ballena','azul'],['gota','azul'],['pajaro','azul'],['rana','verde'],['hoja','verde'],['pera','verde']];

/* ---------- Rincón de los Conceptos (3 años) ---------- */
const C3={id:'3A-C',n:'Rincón de los Conceptos',icon:'estrella',c:'#9B8AD9',trim:0,bg:BG.conceptos,concepts:true,
 games:[
  {t:'tamano',icon:'elefante',name:'Grande y pequeño',make:(d,t)=>{const pool=['elefante','oso','pelota','casa','arbol','pato','manzana'];return ChoiceGame({rounds:nRounds(),bg:t.bg,key:()=>'grande-pequeno',y:520,big:true,
    gen(i){const k=pick(pool),big=i%2===0,B={name:'el grande',draw:(x,y,s)=>pic(k,x,y,s)},S_={name:'el pequeño',draw:(x,y,s)=>pic(k,x,y+s*.25,s*.42)};
      return {words:[B,S_],ok:[big?B:S_],ask:big?'¿Cuál es '+V(['el más grande','el más grande'])+'? Tocalo.':V(['¿Cuál es el más chiquito? Tocalo.','¿Cuál es el más pequeño? Tócalo.']),okSay:()=>big?'¡Ese es el grande!':V(['¡Ese es el chiquito!','¡Ese es el pequeño!']),badSay:()=>big?'Ese es chiquito. Buscá el grande.':V(['Ese es grande. Buscá el chiquito.','Ese es grande. Busca el pequeño.'])}}},d)}},
  {t:'arriba',icon:'pelota',name:'Arriba y abajo',make:(d,t)=>Arrastra({rounds:1,total:4,key:'arriba-abajo',bg:t.bg,
    gen(){const its=['pelota','gato','oso','globo','pato'];const st=shuffle(its).slice(0,4).map((k,j)=>({k,zone:j%2?'abajo':'arriba'}));
      const mesa=(x,y)=>{card(x-260,y,520,44,'#C98A4B',7,10);card(x-230,y+44,34,200,'#A86B43',6,6);card(x+196,y+44,34,200,'#A86B43',6,6)};
      return {ask:'Escuchá dónde va cada cosa: arriba o abajo de la mesa.',zones:[{id:'arriba',x:900,y:260,w:520,h:200,draw:(z,hl)=>{if(hl){ctx.globalAlpha=.3;card(640,170,520,190,'#FFE08A',0,20);ctx.globalAlpha=1}},slot:n=>[780+n*120,290],ps:.7},
        {id:'abajo',x:900,y:520,w:420,h:180,draw:(z,hl)=>{if(hl){ctx.globalAlpha=.3;card(690,430,420,200,'#FFE08A',0,20);ctx.globalAlpha=1}mesa(900,360)},slot:n=>[820+n*120,560],ps:.62}],
        items:its.map(k=>({k,s:140})),tray:{x0:330,x1:1520,y:790},
        steps:st.map(s=>({k:s.k,zone:s.zone,say:'Poné '+W_(s.k)+(s.zone==='arriba'?' arriba de la mesa.':' abajo de la mesa.'),ok:s.zone==='arriba'?'¡Muy bien! Arriba de la mesa.':'¡Muy bien! Abajo de la mesa.'}))}}},d)},
  {t:'cuenta',icon:'pato',name:'Contar',make:(d,t)=>Cuenta({pool:['pato','pelota','estrella','globo','oso','flor'],bg:t.bg},d)},
  {t:'formas',icon:'formas',name:'Círculo y cuadrado',make:(d,t)=>Arrastra({rounds:2,key:'formas',bg:t.bg,
    why:(it,z)=>'Mmm, '+(z.id==='circulo'?'esa forma no es redonda.':'esa forma no es un cuadrado.'),placeSay:(it,z)=>z.id==='circulo'?'Círculo.':'Cuadrado.',
    gen(){const cs=shuffle(['#FF5A5A','#5B8DEF','#FFD66B','#7CC86E','#F58BB4','#FFA94D']);const its=[0,1,2,3].map(j=>({k:shape(j%2?'cuadrado':'circulo',cs[j]),zone:j%2?'cuadrado':'circulo',s:150}));
      return {ask:'Los círculos van con el círculo. Los cuadrados van con el cuadrado.',zones:[{id:'circulo',x:580,y:450,w:360,h:230,c:'#E8B46A',icon:(x,y,s)=>circ(x,y,s*.38,'#fff',6)},{id:'cuadrado',x:1220,y:450,w:360,h:230,c:'#E8B46A',icon:(x,y,s)=>card(x-s*.36,y-s*.36,s*.72,s*.72,'#fff',6,6)}],items:its,tray:{x0:380,x1:1440,y:790}}}},d)},
  {t:'mucho',icon:'galleta',name:'Mucho y poco',make:(d,t)=>ChoiceGame({rounds:4,bg:t.bg,key:()=>'mucho-poco',y:500,big:true,
    gen(i){const m=i%2===0,A=plateOf(ri(7,10)),B=plateOf(ri(1,2));return {words:[A,B],ok:[m?A:B],ask:m?'¿Dónde hay muchas galletas?':'¿Dónde hay pocas galletas?',okSay:()=>m?'¡Ahí hay muchas!':'¡Ahí hay poquitas!',badSay:()=>m?'Ahí hay pocas. Buscá donde hay muchas.':'Ahí hay muchas. Buscá donde hay pocas.'}}},d)},
  {t:'dianoche',icon:'luna',name:'Día y noche',make:(d,t)=>ChoiceGame({rounds:4,bg:t.bg,key:()=>'dia-noche',y:500,big:true,
    gen(i){const Q=shuffle([['¿Cuándo sale el sol?',1],['¿Cuándo salen las estrellas y la luna?',0],['¿Cuándo dormimos?',0],['¿Cuándo vamos a la escuela?',1],['¿Cuándo jugamos en el parque?',1],['¿Cuándo está oscuro?',0]]);const q=Q[i%Q.length];const D=dayNight(1),N=dayNight(0);
      return {words:[D,N],ok:[q[1]?D:N],ask:q[0],okSay:()=>q[1]?'¡De día!':'¡De noche!',badSay:()=>q[1]?'Ese es de noche. Mirá el otro.':'Ese es de día. Mirá el otro.'}}},d)}]};

/* juegos genéricos que se arman con las palabras del tema */
function makeGame(g,t,onDone){
  if(g.make)return g.make(onDone,t);
  const ks=t.words.map(w=>w.k).filter(Boolean);
  if(g.t==='conocer')return Conocer({items:t.words,bg:t.bg,intro:t.intro},onDone);
  if(g.t==='busca')return Busca({items:ks,bg:t.bg,key:t.id},onDone);
  if(g.t==='memoria')return Memoria({pool:ks,bg:t.bg},onDone);
}
const GICON={conocer:'ojo',busca:'ojo',memoria:'regalo',sonido:'tren'};
