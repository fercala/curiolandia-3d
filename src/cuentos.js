/* ================= CUENTOS: un cuento ilustrado por tema, narrado por Tito ================= */
// ==========================================================================
// cuentos.js: un cuento ilustrado por cada tema de 3, 4 y 5 años, narrado por Tito.
// ==========================================================================
// Solo DATOS: no tiene funciones. Define la global CUENTOS.
// Quién lo usa: extras.js recorre T3, T4 y T5 y, si CUENTOS[tema.id] existe, añade al FINAL de
// los juegos del tema {t:'cuento', icon:'libro', name:'El cuento'}; al abrir ese juego llama a
// Story(CUENTOS[tema.id], {}, onDone) (comps2.js), que pasa las páginas y luego hace las preguntas.
// Depende de: BG (temas.js / temas4.js) para los fondos y PICS (pics-*.js) para los dibujos.
//
// FORMATO: CUENTOS['id del tema'] = {title, pages, qs}
//   title   título del cuento: texto o [rioplatense, España].
//   pages   lista de páginas. Cada página es {bg, items, say}:
//             bg     nombre de un fondo de BG ('aula', 'parque', 'noche'...); si no existe se usa
//                    BG.conceptos.
//             items  dibujos de la página: [clave de PICS, x, y, tamaño, volteado]. x,y = centro en la
//                    pantalla de 1600x900 (el dibujo se balancea suavemente arriba y abajo); tamaño en px;
//                    volteado (opcional) = true para dibujarlo mirando al otro lado. La clave también
//                    puede ser una carita 'emo:alegria'.
//             say    lo que lee Tito en esa página: texto o [rioplatense, España]. En la primera página
//                    Tito dice antes "Escucha el cuento: <título>. ".
//   qs      preguntas al final (lo normal: 2 o 3). Cada una es {q, ok, opts, okSay}:
//             q      pregunta (texto o [rioplatense, España]);
//             ok     clave de PICS de la respuesta correcta;
//             opts   claves de PICS de todas las opciones (incluida la correcta; se barajan);
//             okSay  (opcional) frase tras acertar (Tito antes dice un elogio).
// Cada pregunta acertada da una estrella del juego; los aciertos se apuntan con la clave 'cuentos'.
// ¡No cambies ningún texto de say, title, q ni okSay: todos tienen MP3 grabado!
// Las frases nuevas se escriben en castellano de España y se apuntan para grabarlas.
// ==========================================================================
const CUENTOS={

/* ---------------- 3 AÑOS: EL JARDÍN ---------------- */
'3A-T1':{title:'La mochila de Teo',
  pages:[
    {bg:'aula',items:[['nene',600,540,330],['mochila',920,610,200]],
     say:'Teo llegó a la escuela con su mochila nueva. ¡Era azul y tenía un bolsillo secreto!'},
    {bg:'aula',items:[['nene',470,540,300],['mesa',900,620,320],['lapiz',800,520,120],['pinturas',910,505,130],['cuento',1010,525,120]],
     say:['Teo sacó todo: el lápiz, los crayones y el cuento. ¡Y lo dejó desparramado por toda la mesa! ¡Qué lío!','Teo sacó todo: el lápiz, las pinturas y el cuento. ¡Y lo dejó todo tirado por la mesa! ¡Qué lío!']},
    {bg:'aula',items:[['maestra',500,540,330],['mochila',850,610,200],['lapiz',790,420,120],['cuento',920,410,130],['nene',1190,540,300]],
     say:['La seño lo ayudó a ordenar: el lápiz, los crayones y el cuento... ¡adentro de la mochila!','La profe le ayudó a ordenar: el lápiz, las pinturas y el cuento... ¡dentro de la mochila!']},
    {bg:'parque',items:[['nene',560,540,330],['tobogan',930,560,300],['pelota',1250,650,150]],
     say:['La pelota se quedó afuera, ¡para el recreo! Y en el recreo, Teo se tiró por el tobogán. ¡Uiii!','La pelota se quedó fuera, ¡para el recreo! Y en el recreo, Teo se tiró por el tobogán. ¡Uiii!']}
  ],
  qs:[
    {q:['¿Qué guardó Teo adentro de la mochila?','¿Qué guardó Teo dentro de la mochila?'],ok:'lapiz',opts:['lapiz','pelota'],
     okSay:['¡El lápiz! La pelota se quedó afuera.','¡El lápiz! La pelota se quedó fuera.']},
    {q:'¿Dónde jugó Teo en el recreo?',ok:'tobogan',opts:['tobogan','banera'],okSay:'¡En el tobogán! ¡Uiii!'}
  ]},

'3A-T2':{title:'Lola, de la cabeza a los pies',
  pages:[
    {bg:'dormitorio',items:[['hermana',600,540,330],['ojo',930,380,150],['sol',1280,290,180]],
     say:'Lola se despertó y abrió los ojos. Con los ojos vio el sol, que ya entraba por la ventana.'},
    {bg:'cocina',items:[['hermana',540,540,330],['nariz',860,350,150],['pan',880,630,160],['boca',1190,350,150],['leche',1200,610,150]],
     say:'Con la nariz olió algo rico: ¡pan calentito! Y con la boca, ñam, ñam, se lo comió todo.'},
    {bg:'casa',items:[['hermana',560,540,330],['oreja',880,350,150],['gato',1160,610,220]],
     say:'Con las orejas escuchó: ¡miau, miau! Era el gato, que quería jugar con ella.'},
    {bg:'parque',items:[['hermana',560,540,330],['mano',870,360,140],['pie',870,620,140],['gato',1180,610,220]],
     say:'Con las manos aplaudió y con los pies bailó. ¡Y el gato también bailó, pero con cuatro patas!'}
  ],
  qs:[
    {q:'¿Con qué olió Lola el pan?',ok:'nariz',opts:['nariz','pie'],okSay:'¡Con la nariz! La nariz sirve para oler.'},
    {q:'¿Con qué escuchó Lola al gato?',ok:'oreja',opts:['oreja','mano'],okSay:'¡Con las orejas! Miau, miau.'}
  ]},

'3A-T3':{title:['Los crayones de Nico','Las pinturas de Nico'],
  pages:[
    {bg:'colores',items:[['nene',580,540,330],['pinturas',920,610,200]],
     say:['Nico tenía cuatro crayones: rojo, azul, amarillo y verde. ¿Qué iba a pintar?','Nico tenía cuatro pinturas: roja, azul, amarilla y verde. ¿Qué iba a pintar?']},
    {bg:'colores',items:[['fresa',490,480,160],['tomate',720,520,160],['ballena',1120,500,320]],
     say:'Con el rojo pintó una frutilla y un tomate. Con el azul, ¡una ballena enorme!'},
    {bg:'colores',items:[['sol',480,320,170],['banana',500,610,170],['rana',880,580,220],['hoja',1250,520,190]],
     say:'Con el amarillo pintó el sol y una banana. Con el verde, una rana y una hoja.'},
    {bg:'colores',items:[['nene',560,540,330],['rana',960,450,220,1],['hoja',1260,640,150]],
     say:'¡Sorpresa! La rana verde saltó del papel, ¡croac!, y se fue a pasear. ¡Nico se rió un montón!'}
  ],
  qs:[
    {q:'¿Qué pintó Nico con el azul?',ok:'ballena',opts:['ballena','fresa'],okSay:'¡La ballena! Una ballena azul.'},
    {q:'¿Qué pintó Nico con el verde?',ok:'rana',opts:['rana','tomate'],okSay:'¡La rana verde! Croac.'}
  ]},

'3A-T4':{title:'Leo y la ardilla',
  pages:[
    {bg:'otono',items:[['hermano',540,540,330],['arbol',920,470,340],['viento',1300,280,180],['hojaNaranja',1180,620,120],['hojaRoja',1370,600,120]],
     say:'Leo salió a pasear. Sopló el viento, fiuuu, ¡y las hojas se cayeron de los árboles!'},
    {bg:'otono',items:[['hermano',540,540,330],['castana',830,650,130],['ardilla',1150,580,250]],
     say:'Debajo de un árbol, Leo encontró una castaña. ¡Y una ardilla la miraba con muchas ganas!'},
    {bg:'otono',items:[['ardilla',650,580,260],['seta',1050,610,200],['castana',1190,690,110]],
     say:['Leo le regaló la castaña a la ardilla. ¡Y ella la escondió debajo de un hongo, para el invierno!','Leo le regaló la castaña a la ardilla. ¡Y ella la escondió debajo de una seta, para el invierno!']},
    {bg:'lluvia',items:[['hermano',600,540,330],['paraguas',620,300,220],['botasAgua',930,650,150],['lluvia',1200,290,200]],
     say:['Después empezó a llover. Leo abrió el paraguas, se puso las botas de lluvia y... ¡splash, a saltar en los charcos!','Después empezó a llover. Leo abrió el paraguas, se puso las botas de agua y... ¡splash, a saltar en los charcos!']}
  ],
  qs:[
    {q:'¿Qué se cayó de los árboles con el viento?',ok:'hojaNaranja',opts:['hojaNaranja','pelota'],okSay:'¡Las hojas! En otoño se caen de los árboles.'},
    {q:'¿Qué le regaló Leo a la ardilla?',ok:'castana',opts:['castana','helado'],okSay:'¡Una castaña! La ardilla la guardó.'}
  ]},

'3A-T5':{title:'Familias de todos los tamaños',
  pages:[
    {bg:'aula',items:[['maestra',520,540,330],['pinturas',830,620,150],['hermana',1060,560,280],['hermano',1290,560,280]],
     say:['La seño dijo: hoy vamos a dibujar a nuestra familia. ¡Y todos sacaron los crayones!','La profe dijo: hoy vamos a dibujar a nuestra familia. ¡Y todos sacaron las pinturas!']},
    {bg:'familia',items:[['mama',450,520,290],['papa',690,520,300],['abuela',930,520,290],['hermana',1160,570,250],['bebe',1360,640,170]],
     say:'La familia de Sofi es grande: mamá, papá, la abuela, Sofi... ¡y un bebé que llora muy fuerte! Buaaa.'},
    {bg:'parque',items:[['papa',600,520,340],['nene',880,560,280],['pelota',1180,650,150]],
     say:'La familia de Juan es chiquita: Juan y su papá. ¡Y juntos juegan a la pelota todas las tardes!'},
    {bg:'casa',items:[['abuela',560,520,330],['hermano',840,560,280],['gato',1120,620,190],['corazon',1180,320,150]],
     say:'Y Omar vive con su abuela y un gato. Todas las familias son distintas... ¡y en todas se quieren mucho!'}
  ],
  qs:[
    {q:'¿Quién lloraba muy fuerte en la familia de Sofi?',ok:'bebe',opts:['bebe','abuelo'],okSay:'¡El bebé! Buaaa.'},
    {q:'¿Con quién vive Omar?',ok:'abuela',opts:['abuela','maestra'],okSay:'¡Con su abuela! Y con un gato.'}
  ]},

'3A-T6':{title:'Mía y el muñeco de nieve',
  pages:[
    {bg:'invierno',items:[['hermana',580,540,330],['copo',900,300,130],['copo',1150,430,120],['nieve',1300,270,180]],
     say:'¡Nevó! Mía quería salir corriendo a la nieve... ¡pero en remera hacía muuucho frío! Brrr.'},
    {bg:'casa',items:[['gorro',520,300,150],['bufanda',770,300,170],['abrigo',560,600,210],['guantes',840,620,150],['mama',1180,540,330]],
     say:'Mamá la ayudó a abrigarse: primero el abrigo, después el gorro, la bufanda... ¡y los guantes en las manos!'},
    {bg:'invierno',items:[['hermana',540,540,330],['muneco',930,510,330]],
     say:'Mía quedó tan abrigada que solo se le veía la nariz. ¡Y así salió a hacer un muñeco de nieve!'},
    {bg:'invierno',items:[['hermana',540,540,330],['muneco',930,510,330],['bufanda',1270,560,160]],
     say:'Pero el muñeco tenía frío en el cuello. ¡Entonces Mía le prestó su bufanda! Qué buena amiga.'}
  ],
  qs:[
    {q:'¿Qué se puso Mía en las manos?',ok:'guantes',opts:['guantes','gafas'],okSay:'¡Los guantes! Para las manos.'},
    {q:'¿Qué le prestó Mía al muñeco de nieve?',ok:'bufanda',opts:['bufanda','zapato'],okSay:'¡Su bufanda! Para el cuello.'}
  ]},

'3A-T7':{title:'El desayuno de Pablo',
  pages:[
    {bg:'cocina',items:[['hermano',560,540,330],['abuelo',900,520,340]],
     say:['Pablo se despertó con mucha hambre. ¡Le hacía ruido la panza: grrr! Y el abuelo dijo: ¡a desayunar!','Pablo se despertó con mucha hambre. ¡Le sonaba la tripa: grrr! Y el abuelo dijo: ¡a desayunar!']},
    {bg:'cocina',items:[['abuelo',480,520,330],['naranja',760,620,150],['zumo',960,590,170],['pan',1160,620,150],['leche',1360,590,160]],
     say:'El abuelo exprimió unas naranjas e hizo jugo. ¡Y puso en la mesa pan y leche!'},
    {bg:'cocina',items:[['macedonia',900,560,240],['banana',520,440,150],['fresa',520,660,140],['uva',1280,440,150],['pera',1280,660,150]],
     say:['Después hicieron una ensalada de frutas con banana, frutilla, uvas y pera. ¡Cuántos colores!','Después hicieron una macedonia con plátano, fresa, uvas y pera. ¡Cuántos colores!']},
    {bg:'parque',items:[['hermano',600,540,330],['pelota',950,650,150],['abuelo',1250,520,330]],
     say:'Pablo se comió todo. ¡Y salió a jugar con energía de superhéroe! El abuelo no lo podía alcanzar.'}
  ],
  qs:[
    {q:'¿Qué hizo el abuelo con las naranjas?',ok:'zumo',opts:['zumo','helado'],okSay:'¡Jugo de naranja! Mmm.'},
    {q:['¿Qué fruta había en la ensalada de frutas?','¿Qué fruta había en la macedonia?'],ok:'uva',opts:['uva','galleta'],
     okSay:['¡Las uvas! Y también banana, frutilla y pera.','¡Las uvas! Y también plátano, fresa y pera.']}
  ]},

'3A-T8':{title:'Coco, el perro escondedor',
  pages:[
    {bg:'casa',items:[['hermana',560,540,330],['perro',940,600,240]],
     say:'Coco, el perro de Clara, era muy travieso: ¡escondía las cosas en lugares rarísimos!'},
    {bg:'cocina',items:[['hermana',500,540,330],['nevera',880,500,300],['cepillo',1200,380,150],['perro',1250,620,200]],
     say:['Clara abrió la heladera y... ¡el cepillo de dientes estaba adentro, al lado de la leche! ¡Qué frío!','Clara abrió la nevera y... ¡el cepillo de dientes estaba dentro, al lado de la leche! ¡Qué frío!']},
    {bg:'dormitorio',items:[['perro',440,640,170],['cama',820,590,340],['olla',820,500,150],['hermana',1230,540,310]],
     say:['Y en la cama, tapadita con la frazada, ¡estaba la olla durmiendo la siesta!','Y en la cama, tapadita con la manta, ¡estaba la olla durmiendo la siesta!']},
    {bg:'casa',items:[['hermana',560,540,330],['perro',900,600,230],['corazon',1200,350,150]],
     say:'Clara puso cada cosa en su lugar: el cepillo en el baño y la olla en la cocina. ¡Y a Coco le dio un abrazo!'}
  ],
  qs:[
    {q:'¿Qué encontró Clara en la heladera?',ok:'cepillo',opts:['cepillo','pelota'],okSay:'¡El cepillo de dientes! Pero va en el baño.'},
    {q:'¿Quién dormía la siesta en la cama?',ok:'olla',opts:['olla','gato'],okSay:'¡La olla! Pero la olla va en la cocina.'}
  ]},

'3A-T9':{title:'¿Dónde está mi mamá?',
  pages:[
    {bg:'granja',items:[['pollito',800,590,250],['flor',1200,660,140]],
     say:'Un pollito salió a pasear solito y se perdió. ¡Pío, pío! ¿Dónde está mi mamá?'},
    {bg:'granja',items:[['pollito',560,620,200],['vaca',1000,560,320]],
     say:'Le preguntó a la vaca: ¿Sos mi mamá? Y la vaca dijo: ¡Muuu! No, yo soy la mamá del ternerito.'},
    {bg:'granja',items:[['cerdo',520,590,240],['pollito',850,630,190],['oveja',1200,580,260]],
     say:'Después le preguntó al chancho, ¡oinc, oinc!, y a la oveja, ¡beee! Pero ninguno hacía pío, pío.'},
    {bg:'granja',items:[['pollito',620,630,200],['gallina',1000,560,320]],
     say:'De pronto escuchó: ¡clo, clo! Era la gallina, ¡su mamá! Y le dio un abrazo bien calentito, de plumas.'}
  ],
  qs:[
    {q:'¿Qué animal hacía muuu?',ok:'vaca',opts:['vaca','pato'],okSay:'¡La vaca! Muuu.'},
    {q:'¿Quién era la mamá del pollito?',ok:'gallina',opts:['gallina','oveja'],okSay:'¡La gallina! Clo, clo.'}
  ]},

'3A-T10':{title:'Alba y la primavera',
  pages:[
    {bg:'primavera',items:[['hermana',540,540,330],['sol',1300,270,180],['flor',880,640,150],['flor',1080,620,170],['flor',1280,640,150]],
     say:'Llegó la primavera. El sol calentó el jardín de Alba y, ¡pop, pop, pop!, salieron flores por todos lados.'},
    {bg:'primavera',items:[['mariposa',640,330,200],['flor',640,640,160],['hoja',1050,620,220],['mariquita',1050,600,120]],
     say:['Una mariposa vino a visitar las flores. Y una vaquita de San Antonio paseaba por una hoja, despacito.','Una mariposa vino a visitar las flores. Y una mariquita paseaba por una hoja, despacito.']},
    {bg:'primavera',items:[['hermana',600,540,330],['abeja',880,380,150],['flor',1150,640,160]],
     say:'Bzzz... una abeja pasó tan cerquita de la nariz de Alba que le hizo cosquillas. ¡Achís!'},
    {bg:'primavera',items:[['hermana',480,560,290],['arbol',900,470,360],['nido',930,380,140],['pajaro',1250,320,160]],
     say:'Y en el árbol, un pájaro armaba su nido, cantando. ¡La primavera estaba llena de vida!'}
  ],
  qs:[
    {q:'¿Qué salió por todos lados en primavera?',ok:'flor',opts:['flor','copo'],okSay:'¡Las flores! En primavera salen flores.'},
    {q:'¿Qué le hizo cosquillas a Alba en la nariz?',ok:'abeja',opts:['abeja','pez'],okSay:'¡La abeja! Bzzz... ¡achís!'}
  ]},

'3A-T11':{title:'Rafa va a la isla',
  pages:[
    {bg:'ciudad',items:[['nene',470,570,260],['mama',690,520,320],['autobus',1120,560,330]],
     say:'Rafa y mamá se iban de viaje a visitar a la abuela. Primero subieron al colectivo. ¡Bip, bip!'},
    {bg:'ciudad',items:[['tren',700,500,330],['auto',1060,650,170],['moto',1240,650,150],['bici',1400,650,140]],
     say:'Después subieron al tren, ¡chu, chu! Por la ventana, Rafa vio autos, motos y bicis.'},
    {bg:'mar',items:[['barco',800,520,340],['pez',1220,680,150],['sol',1300,270,170]],
     say:'La abuela vivía en una isla, así que subieron a un barco. ¡El barco iba por el agua, sobre las olas!'},
    {bg:'playa',items:[['abuela',560,520,340],['nene',840,570,270],['avion',1150,280,220],['helicoptero',1360,430,170]],
     say:'¡Por fin, la isla! La abuela les dio un abrazo gigante. Y en el cielo, un avión y un helicóptero pasaron a saludar.'}
  ],
  qs:[
    {q:'¿En qué viajaron por el agua?',ok:'barco',opts:['barco','bici'],okSay:'¡En barco! El barco va por el agua.'},
    {q:'¿Qué pasó volando por el cielo?',ok:'avion',opts:['avion','tren'],okSay:'¡El avión! Vuela por el cielo.'}
  ]},

'3A-T12':{title:'El castillo de Nora',
  pages:[
    {bg:'playa',items:[['hermana',500,540,330],['mama',760,520,320],['crema',1000,630,150],['gorra',1180,630,150],['gafas',1360,630,150]],
     say:['¡Qué calor! Antes de jugar, mamá le puso a Nora crema para el sol, la gorra y los anteojos de sol.','¡Qué calor! Antes de jugar, mamá le puso a Nora crema solar, la gorra y las gafas de sol.']},
    {bg:'playa',items:[['hermana',480,560,300],['castillo',850,560,300],['cubo',1180,650,150],['pala',1350,600,170]],
     say:['Con el balde y la pala, Nora hizo un castillo de arena. ¡Con torres y todo!','Con el cubo y la pala, Nora hizo un castillo de arena. ¡Con torres y todo!']},
    {bg:'playa',items:[['castillo',850,560,300],['concha',850,370,130],['hermana',1220,540,320]],
     say:['Arriba del castillo puso una concha, como si fuera una corona. ¡Era el castillo de la reina Nora!','Encima del castillo puso una concha, como si fuera una corona. ¡Era el castillo de la reina Nora!']},
    {bg:'playa',items:[['hermana',560,540,330],['helado',850,430,160],['sol',1300,270,180]],
     say:'Al final, ¡un helado! Pero hacía tanto calor que se derretía... ¡y Nora se lo comió rapidísimo!'}
  ],
  qs:[
    {q:'¿Qué le puso mamá a Nora para cuidarse del sol?',ok:'crema',opts:['crema','helado'],
     okSay:['¡La crema para el sol! Y la gorra y los anteojos.','¡La crema solar! Y la gorra y las gafas.']},
    {q:['¿Qué puso Nora arriba del castillo?','¿Qué puso Nora encima del castillo?'],ok:'concha',opts:['concha','zapato'],okSay:'¡Una concha, como una corona!'}
  ]},

/* ---------------- 4 AÑOS: EL BOSQUE ---------------- */
'4A-T1':{title:'La semana de Hugo',
  pages:[
    {bg:'ciudad',items:[['hermano',560,540,330],['mochila',800,630,140],['escuela',1120,470,340]],
     say:'El lunes empezó la semana. Hugo se puso la mochila ¡y fue a la escuela!'},
    {bg:'aula',items:[['hermano',540,540,330],['pinturas',860,620,150],['cuento',1080,600,150],['maestra',1300,540,320]],
     say:['Martes, miércoles, jueves... ¡días de escuela! Hugo pintó, escuchó cuentos y cantó con la seño.','Martes, miércoles, jueves... ¡días de cole! Hugo pintó, escuchó cuentos y cantó con la profe.']},
    {bg:'casa',items:[['hermano',560,540,330],['mano',880,380,160],['calendario',1200,440,240]],
     say:['El viernes, Hugo contó con los dedos: ¡mañana no hay escuela! Llegaba el fin de semana.','El viernes, Hugo contó con los dedos: ¡mañana no hay cole! Llegaba el fin de semana.']},
    {bg:'parque',items:[['papa',480,520,320],['hermano',730,560,270],['piscina',1130,600,320]],
     say:['El sábado fue a la pileta con papá. ¡Hugo nadó como un pececito... con flotadores!','El sábado fue a la piscina con papá. ¡Hugo nadó como un pececito... con manguitos!']},
    {bg:'familia',items:[['abuelo',500,520,320],['abuela',760,520,320],['hermano',1020,560,270],['almuerzo',1280,620,170]],
     say:'El domingo almorzaron en la casa de los abuelos. Y después del domingo... ¡otra vez lunes! La semana vuelve a empezar.'}
  ],
  qs:[
    {q:'¿Adónde fue Hugo el lunes?',ok:'escuela',opts:['escuela','piscina','hospital'],
     okSay:['¡A la escuela! De lunes a viernes hay escuela.','¡Al cole! De lunes a viernes hay cole.']},
    {q:'¿Adónde fue Hugo el sábado?',ok:'piscina',opts:['piscina','escuela','tienda'],
     okSay:['¡A la pileta! A nadar con papá.','¡A la piscina! A nadar con papá.']},
    {q:'¿A quiénes visitó Hugo el domingo?',ok:'abuelo',opts:['abuelo','medico','bombera'],okSay:'¡A los abuelos! El domingo es fin de semana.'}
  ]},

'4A-T2':{title:'El juego de los sentidos',
  pages:[
    {bg:'casa',items:[['hermana',500,540,330],['abuelo',790,520,330],['ojo',1080,360,150],['mariposa',1300,360,170]],
     say:'Inés y su abuelo jugaron al juego de los sentidos. Primero, con los ojos, Inés vio una mariposa en la ventana.'},
    {bg:'casa',items:[['hermana',560,540,330],['oreja',880,360,150],['campana',1180,520,200]],
     say:'Después cerró los ojos y escuchó: ¡din, don! Con las orejas descubrió que era una campana.'},
    {bg:'cocina',items:[['hermana',500,540,330],['nariz',800,330,140],['flor',800,610,160],['boca',1150,330,140],['miel',1150,610,170]],
     say:'Con la nariz olió unas flores: ¡mmm, qué perfume! Y con la boca probó algo dulce: ¡miel!'},
    {bg:'casa',items:[['hermana',560,540,330],['mano',880,360,150],['gato',1170,610,230]],
     say:'Con las manos tocó algo suave y peludito... ¿Un peluche? ¡No! Era el gato, que se había metido en el juego.'},
    {bg:'casa',items:[['hermana',560,540,330],['abuelo',920,520,330],['emo:alegria',1260,350,160]],
     say:'Inés se rió tanto que bailó doblando los codos y las rodillas. Ver, oír, oler, saborear y tocar: ¡cinco sentidos!'}
  ],
  qs:[
    {q:'¿Qué escuchó Inés con las orejas?',ok:'campana',opts:['campana','pez','zapato'],okSay:'¡La campana! Din, don.'},
    {q:'¿Qué probó Inés con la boca?',ok:'miel',opts:['miel','lapiz','piedra'],okSay:'¡Miel! Con la boca sentimos los sabores.'},
    {q:'¿Qué tocó Inés con las manos?',ok:'gato',opts:['gato','tortuga','pez'],okSay:'¡El gato! Suave y peludito.'}
  ]},

'4A-T3':{title:'La despensa de Bruna',
  pages:[
    {bg:'bosque',items:[['ardilla',560,570,290],['bellota',900,650,130],['nuez',1080,650,130],['castana',1260,650,130]],
     say:'En otoño, la ardilla Bruna juntaba comida para el invierno: bellotas, nueces y castañas. ¡Una, dos y tres!'},
    {bg:'bosque',items:[['arbol',820,470,360],['bellota',830,420,110],['ardilla',1200,580,250]],
     say:'Las guardaba en un agujero del árbol, su despensa secreta. ¡Así, en invierno, cuando no hay comida, no iba a pasar hambre!'},
    {bg:'huerta',items:[['abuela',500,520,330],['calabaza',830,630,220],['uva',1080,610,160],['granada',1300,610,160]],
     say:'Cerca de ahí, en la huerta de la abuela Rosa, también había frutos de otoño: uvas, granadas ¡y una calabaza gigante!'},
    {bg:'bosque',items:[['ardilla',560,590,260],['seta',900,620,180],['erizo',1220,630,200]],
     say:['Pero Bruna era muy olvidadiza. ¿Dónde había guardado las nueces? Buscó debajo de un hongo y encontró... ¡un erizo dormido!','Pero Bruna era muy olvidadiza. ¿Dónde había guardado las nueces? Buscó debajo de una seta y encontró... ¡un erizo dormido!']},
    {bg:'huerta',items:[['abuela',520,520,330],['nuez',830,560,130],['ardilla',1150,590,260]],
     say:'Entonces la abuela Rosa le dejó unas nueces en la ventana. ¡Y Bruna las guardó en su árbol, contentísima!'}
  ],
  qs:[
    {q:'¿Qué juntaba Bruna para el invierno?',ok:'bellota',opts:['bellota','helado','zapato'],okSay:'¡Bellotas, nueces y castañas!'},
    {q:'¿Dónde guardaba Bruna su comida?',ok:'arbol',opts:['arbol','nevera','barco'],okSay:'¡En un agujero del árbol!'},
    {q:'¿Qué fruto gigante había en la huerta?',ok:'calabaza',opts:['calabaza','fresa','pan'],okSay:'¡La calabaza! Un fruto de otoño.'}
  ]},

'4A-T4':{title:'Un día de emociones',
  pages:[
    {bg:'casa',items:[['nene',560,540,330],['emo:alegria',930,380,170],['sol',1260,290,180]],
     say:'Martín se despertó contento: había sol y era sábado. ¡Sonreía de oreja a oreja!'},
    {bg:'parque',items:[['nene',560,540,330],['heladoCaido',900,650,170],['emo:tristeza',1200,360,170]],
     say:['En la plaza, a Martín se le cayó el helado al piso. ¡Plaf! Y se puso triste, muy triste.','En el parque, a Martín se le cayó el helado al suelo. ¡Plaf! Y se puso triste, muy triste.']},
    {bg:'casa',items:[['nene',500,540,330],['torreRota',840,630,200],['bebe',1080,650,170],['emo:enojo',1300,360,160]],
     say:'Después armó una torre altísima con bloques... ¡y el bebé la tiró! Martín se enojó mucho. ¡Grrr!'},
    {bg:'noche',items:[['papa',560,520,340],['nene',830,570,270],['tormenta',1180,300,220],['emo:miedo',1290,580,150]],
     say:['A la noche hubo tormenta. ¡Brrrum! Martín tuvo miedo y abrazó fuerte a papá.','Por la noche hubo tormenta. ¡Brrrum! Martín tuvo miedo y abrazó fuerte a papá.']},
    {bg:'dormitorio',items:[['nene',540,540,330],['cajaSorpresa',880,600,220],['emo:sorpresa',1220,360,170]],
     say:'Antes de dormir, papá le dio una caja. ¡Boing! Salió un muñeco saltarín. ¡Qué sorpresa! Y Martín volvió a reírse.'}
  ],
  qs:[
    {q:'¿Cómo se sintió Martín cuando se le cayó el helado?',ok:'emo:tristeza',opts:['emo:tristeza','emo:alegria','emo:sorpresa'],okSay:'Triste. ¡Pobre Martín, su helado!'},
    {q:'¿Qué hizo enojar a Martín?',ok:'torreRota',opts:['torreRota','sol','pelota'],okSay:'¡El bebé le tiró la torre!'},
    {q:'¿Cómo se sintió Martín con la tormenta?',ok:'emo:miedo',opts:['emo:miedo','emo:alegria','emo:enojo'],okSay:'Miedo. Y papá lo abrazó fuerte.'}
  ]},

'4A-T5':{title:'Paula come de todo',
  pages:[
    {bg:'cocina',items:[['hermana',540,540,330],['desayuno',900,600,200],['kiwi',1200,610,160]],
     say:'En el desayuno, Paula probó un kiwi. ¡Por fuera era marrón y peludito, y por dentro verde!'},
    {bg:'cocina',items:[['lechuga',560,600,180],['tomate',820,610,160],['zanahoria',1080,600,180],['almuerzo',1320,600,170]],
     say:'En el almuerzo comió ensalada de verduras: lechuga, tomate y zanahoria. ¡Crunch, crunch!'},
    {bg:'parque',items:[['hermana',560,540,330],['sandia',920,620,200],['merienda',1230,600,170]],
     say:'A la hora de la merienda, una fruta fresquita: ¡sandía! Paula terminó con la cara toda roja.'},
    {bg:'cocina',items:[['papa',520,520,340],['patata',860,630,150],['brocoli',1100,610,170],['cena',1330,600,170]],
     say:['En la cena, papá hizo puré de papas y brócoli. Paula dijo: ¡el brócoli parece un arbolito!','En la cena, papá hizo puré de patatas y brócoli. Paula dijo: ¡el brócoli parece un arbolito!']},
    {bg:'cocina',items:[['hermana',540,540,330],['kiwi',880,440,140],['sandia',1110,440,150],['brocoli',880,650,140],['zanahoria',1110,650,150]],
     say:'Se comió el bosque de brócoli entero. Y aprendió: el kiwi y la sandía son frutas; el brócoli y la zanahoria, verduras.'}
  ],
  qs:[
    {q:'¿Qué fruta probó Paula en el desayuno?',ok:'kiwi',opts:['kiwi','brocoli','pan'],okSay:'¡El kiwi! Verde por dentro.'},
    {q:'¿Qué verdura parecía un arbolito?',ok:'brocoli',opts:['brocoli','sandia','zanahoria'],okSay:'¡El brócoli! Un arbolito para comer.'},
    {q:'¿Con qué fruta se manchó Paula la cara?',ok:'sandia',opts:['sandia','lechuga','patata'],okSay:'¡Con la sandía! Roja y jugosa.'}
  ]},

'4A-T6':{title:'Nilo y Pipo, amigos por carta',
  pages:[
    {bg:'polo',items:[['osoPolar',640,540,340],['iglu',1100,570,280],['copo',1300,280,120]],
     say:'Nilo, el osito polar, vivía en el Polo Norte, donde todo es nieve y hielo. ¡Su pelo blanco y espeso lo tenía calentito!'},
    {bg:'polo',items:[['foca',600,580,270],['pelota',560,400,120],['morsa',1100,560,330]],
     say:'Sus vecinos eran una foca muy juguetona y una morsa de dientes larguísimos que roncaba muy fuerte. ¡Rrrrr!'},
    {bg:'polo',items:[['osoPolar',600,540,330],['carta',950,420,150],['pinguino',1260,570,260]],
     say:'Un día, Nilo le escribió una carta a su amigo Pipo, un pingüino que vivía lejísimos: en el Polo Sur.'},
    {bg:'polo',items:[['pinguino',650,570,280],['pluma',950,400,140],['hielo',1150,650,200]],
     say:['Pipo le contestó: ¡Acá también hace frío! Pero mis plumas me abrigan. ¡Y me tiro de panza por el hielo!','Pipo le contestó: ¡Aquí también hace frío! Pero mis plumas me abrigan. ¡Y me tiro de barriga por el hielo!']},
    {bg:'polo',items:[['osoPolar',640,540,340],['carta',1000,400,140],['hielo',1150,650,180]],
     say:['Nilo se rió tanto que también se tiró de panza por el hielo, ¡fiuuu! Dos amigos bien abrigados, en las dos puntas del mundo.','Nilo se rió tanto que también se tiró de barriga por el hielo, ¡fiuuu! Dos amigos bien abrigados, en los dos extremos del mundo.']}
  ],
  qs:[
    {q:'¿Quién roncaba muy fuerte?',ok:'morsa',opts:['morsa','foca','conejo'],okSay:'¡La morsa! Rrrrr.'},
    {q:'¿Qué le mandó Nilo a Pipo?',ok:'carta',opts:['carta','pelota','helado'],okSay:'¡Una carta! Porque Pipo vivía lejísimos.'},
    {q:'¿Qué abriga a Pipo del frío?',ok:'pluma',opts:['pluma','hoja','pez'],okSay:'¡Sus plumas! Lo tienen calentito.'}
  ]},

'4A-T7':{title:'Toby, el perro travieso',
  pages:[
    {bg:'ciudad',items:[['cartero',540,540,340],['perro',960,600,230],['carta',1200,470,140]],
     say:'Toby era un perro muy travieso. Una mañana, ¡se llevó la carta del cartero y salió corriendo!'},
    {bg:'ciudad',items:[['panadero',540,540,340],['perro',960,600,230],['pan',1200,500,150]],
     say:'Después pasó por la panadería y se llevó un pan calentito. ¡El panadero lo persiguió, todo lleno de harina!'},
    {bg:'ciudad',items:[['medico',520,540,340],['hermana',800,580,260],['fonendo',1060,380,140],['perro',1200,610,220]],
     say:['Después le sacó el estetoscopio al médico, que estaba escuchando el corazón de una nena. ¡Pum, pum!','Después le quitó el fonendo al médico, que estaba escuchando el corazón de una niña. ¡Pum, pum!']},
    {bg:'ciudad',items:[['bombera',520,540,340],['manguera',830,610,200],['perro',1150,600,230],['gota',1150,400,120]],
     say:'¡Y le tiró de la manguera a la bombera! ¡Splash! Toby quedó empapado de la cabeza a la cola.'},
    {bg:'ciudad',items:[['policia',520,540,340],['silbato',800,360,130],['perro',1020,610,220],['carta',1270,460,130],['pan',1300,650,140]],
     say:'Entonces la policía tocó el silbato: ¡priiip! Toby se sentó, devolvió todo y movió la cola. ¡Y todos se rieron!'}
  ],
  qs:[
    {q:'¿A quién le quitó Toby el pan?',ok:'panadero',opts:['panadero','bombera','cartero'],okSay:'¡Al panadero! El panadero hace el pan.'},
    {q:'¿Qué usa el médico para escuchar el corazón?',ok:'fonendo',opts:['fonendo','manguera','tijeras'],okSay:['¡El estetoscopio! Pum, pum.','¡El fonendo! Pum, pum.']},
    {q:'¿Qué tocó la policía para que Toby se quedara quieto?',ok:'silbato',opts:['silbato','campana','tambor'],okSay:'¡El silbato! Priiip.'}
  ]},

'4A-T8':{title:'Bruno cruza la calle',
  pages:[
    {bg:'calle',items:[['mama',480,520,320],['hermano',720,570,260],['tienda',1060,470,260],['hospital',1330,460,260]],
     say:['Bruno y mamá iban al parque caminando por la vereda. Pasaron por la tienda y por el hospital.','Bruno y mamá iban al parque caminando por la acera. Pasaron por la tienda y por el hospital.']},
    {bg:'calle',items:[['mama',520,520,330],['hermano',760,570,270],['semaforo',1100,440,300]],
     say:'En la esquina, el semáforo estaba en rojo. Se quedaron quietitos, esperando. ¡Ni un pasito!'},
    {bg:'calle',items:[['hermano',560,560,290],['pelota',920,660,140],['auto',1220,620,240]],
     say:'De repente, la pelota de Bruno rodó hasta la calle. Bruno quiso correr a buscarla, pero se acordó: ¡nunca hay que correr a la calle!'},
    {bg:'calle',items:[['pasoCebra',850,660,300],['mama',740,500,300],['hermano',960,540,250],['semaforo',1280,430,260]],
     say:['Cuando el semáforo se puso en verde, miraron a los dos lados y cruzaron por la senda peatonal, de la mano.','Cuando el semáforo se puso en verde, miraron a los dos lados y cruzaron por el paso de cebra, de la mano.']},
    {bg:'parque',items:[['hermano',520,560,290],['pelota',780,650,150],['mama',1000,520,320],['parque',1300,470,280]],
     say:'Del otro lado, la pelota los esperaba quietita. ¡Y en el parque jugaron toda la tarde!'}
  ],
  qs:[
    {q:'¿Qué se le escapó a Bruno?',ok:'pelota',opts:['pelota','globo','gorra'],okSay:'¡La pelota! Y Bruno no corrió a la calle.'},
    {q:'¿Por dónde cruzaron la calle?',ok:'pasoCebra',opts:['pasoCebra','tobogan','tren'],okSay:['¡Por la senda peatonal, de la mano!','¡Por el paso de cebra, de la mano!']},
    {q:'¿Adónde iban Bruno y mamá?',ok:'parque',opts:['parque','hospital','escuela'],okSay:'¡Al parque! A jugar toda la tarde.'}
  ]},

'4A-T9':{title:'El sueño de Zoe',
  pages:[
    {bg:'casa',items:[['hermana',500,540,330],['perro',800,610,200],['gato',1030,610,200],['conejo',1260,610,200]],
     say:'Zoe vivía con un perro, un gato y un conejo. ¡Eran animales domésticos: vivían en casa, con ella!'},
    {bg:'sabana',items:[['leon',560,570,280],['jirafa',900,470,360],['cebra',1240,580,260]],
     say:'Una noche, Zoe soñó que viajaba a la sabana. ¡Allá vivían animales salvajes: el león, la jirafa y la cebra!'},
    {bg:'selva',items:[['mono',580,360,220],['tigre',1020,600,300]],
     say:'Después llegó a la selva. Un mono se colgaba de las ramas, y un tigre dormía la siesta. ¡Shhh!'},
    {bg:'selva',items:[['cocodrilo',850,630,340],['emo:sorpresa',1260,330,150]],
     say:'En el río, un cocodrilo abrió una boca enorme... ¡pero solo estaba bostezando! Uaaah, qué sueño.'},
    {bg:'dormitorio',items:[['hermana',500,540,330],['perro',800,610,200],['gato',1030,610,200],['conejo',1260,610,200]],
     say:'Zoe se despertó y ahí estaban sus animales. Los salvajes viven en la selva y la sabana; ¡los domésticos, en casa con ella!'}
  ],
  qs:[
    {q:'¿Qué animal vivía en la casa de Zoe?',ok:'conejo',opts:['conejo','leon','cocodrilo'],okSay:'¡El conejo! Es un animal doméstico.'},
    {q:'¿Quién dormía la siesta en la selva?',ok:'tigre',opts:['tigre','vaca','pato'],okSay:'¡El tigre! Shhh.'},
    {q:'¿Quién bostezaba en el río?',ok:'cocodrilo',opts:['cocodrilo','conejo','oveja'],okSay:'¡El cocodrilo! Uaaah.'}
  ]},

'4A-T10':{title:'La plantita de Tomás',
  pages:[
    {bg:'huerta',items:[['nene',540,540,330],['maceta',900,630,190],['semilla',900,440,120]],
     say:'Tomás plantó una semilla en una maceta. ¡Era chiquita, como una miguita de pan!'},
    {bg:'huerta',items:[['nene',520,540,330],['regadera',820,430,180],['maceta',960,630,180],['sol',1300,270,180]],
     say:'Todos los días la regaba con la regadera y la ponía al sol. ¡Las plantas necesitan agua y sol para crecer!'},
    {bg:'huerta',items:[['nene',540,540,330],['brote',950,600,240],['sol',1300,270,170]],
     say:['Abajo de la tierra le crecieron raíces para tomar agua. Y arriba salió un tallo con dos hojitas. ¡Hola!','Debajo de la tierra le crecieron raíces para beber agua. Y arriba salió un tallo con dos hojitas. ¡Hola!']},
    {bg:'huerta',items:[['nene',540,540,330],['plantaFlor',950,520,320]],
     say:['Tomás la saludaba cada mañana: ¡buen día, plantita! Y la planta creció y creció... ¡y le salió una flor amarilla!','Tomás la saludaba cada mañana: ¡buenos días, plantita! Y la planta creció y creció... ¡y le salió una flor amarilla!']},
    {bg:'huerta',items:[['nene',540,540,330],['plantaFruto',950,520,320],['tomate',1300,630,150]],
     say:'Un día, donde estaba la flor, apareció un fruto rojo y redondo: ¡un tomate! Tomás lo compartió con toda su familia.'}
  ],
  qs:[
    {q:'¿Qué plantó Tomás en la maceta?',ok:'semilla',opts:['semilla','pelota','zapato'],okSay:'¡Una semilla chiquita!'},
    {q:'¿Qué necesita la planta, además de agua?',ok:'sol',opts:['sol','helado','luna'],okSay:'¡El sol! Agua y sol para crecer.'},
    {q:'¿Qué fruto le salió a la planta?',ok:'tomate',opts:['tomate','banana','galleta'],okSay:'¡Un tomate rojo y redondo!'}
  ]},

'4A-T11':{title:'¡Uiu, uiu! Un día de vehículos',
  pages:[
    {bg:'ciudad',items:[['abuela',480,520,320],['hermano',720,570,260],['metro',1120,540,340]],
     say:['Dani y su abuela tomaron el subte. ¡Iba por debajo de la tierra, por un túnel larguísimo!','Dani y su abuela cogieron el metro. ¡Iba por debajo de la tierra, por un túnel larguísimo!']},
    {bg:'ciudad',items:[['camionBomberos',780,560,360],['arbol',1240,460,300],['gato',1240,370,120]],
     say:'Al salir, escucharon: ¡uiu, uiu! Pasó un camión de bomberos. ¡Iba a rescatar a un gatito que no podía bajar de un árbol!'},
    {bg:'ciudad',items:[['ambulancia',760,560,360],['hospital',1240,470,280]],
     say:'Después pasó una ambulancia, también con sirena. Las ambulancias llevan a las personas enfermas al hospital, para curarlas.'},
    {bg:'ciudad',items:[['helicoptero',700,330,260],['globoAire',1180,400,280]],
     say:'En el cielo, un helicóptero hacía ¡taca, taca, taca! Y más arriba, un globo de colores flotaba despacito.'},
    {bg:'bano',items:[['banera',820,600,340],['submarino',780,510,160],['pato',1220,590,170]],
     say:['A la noche, en la bañera, Dani jugó con su submarino de juguete: ¡glu, glu, a rescatar al patito!','Por la noche, en la bañera, Dani jugó con su submarino de juguete: ¡glu, glu, a rescatar al patito!']}
  ],
  qs:[
    {q:'¿En qué viajaron por debajo de la tierra?',ok:'metro',opts:['metro','avion','barco'],okSay:['¡En subte! Por un túnel.','¡En metro! Por un túnel.']},
    {q:'¿Qué vehículo fue a rescatar al gatito?',ok:'camionBomberos',opts:['camionBomberos','tractor','bici'],okSay:'¡El camión de bomberos! Uiu, uiu.'},
    {q:'¿Qué lleva a las personas enfermas al hospital?',ok:'ambulancia',opts:['ambulancia','globoAire','submarino'],okSay:'¡La ambulancia! Para que las curen.'}
  ]},

'4A-T12':{title:'La oruga de Iván',
  pages:[
    {bg:'parque',items:[['hermano',520,540,330],['lupa',800,400,150],['hoja',1100,630,220],['oruga',1100,600,150]],
     say:'Con su lupa, Iván descubrió una oruga verde comiéndose una hoja: ñam, ñam, ñam. ¡Qué hambre tenía!'},
    {bg:'parque',items:[['hormiga',520,650,140],['arana',850,330,180],['caracol',1200,620,190]],
     say:'También vio hormigas que llevaban miguitas en fila, una araña tejiendo su tela y un caracol que paseaba despacito.'},
    {bg:'parque',items:[['hermano',520,540,330],['abuelo',820,520,330],['oruga',1180,650,150]],
     say:'Iván quería llevarse la oruga a casa. Pero el abuelo le explicó: los bichitos viven mejor en su jardín. ¡Hay que cuidarlos!'},
    {bg:'parque',items:[['hermano',520,540,330],['arbol',1000,470,340],['oruga',1000,400,130]],
     say:'Iván iba a mirarla todos los días. Un día, la oruga se envolvió en un capullo y se quedó quietita, durmiendo.'},
    {bg:'primavera',items:[['hermano',540,540,330],['mariposa',880,370,200],['flor',1200,630,170]],
     say:'¡Y una mañana el capullo se abrió y salió una mariposa! Voló hasta la nariz de Iván, como diciendo: ¡gracias!'}
  ],
  qs:[
    {q:'¿Qué descubrió Iván con su lupa?',ok:'oruga',opts:['oruga','pez','elefante'],okSay:'¡Una oruga verde! Ñam, ñam.'},
    {q:'¿Quién llevaba miguitas en fila?',ok:'hormiga',opts:['hormiga','arana','caracol'],okSay:'¡Las hormigas! Una detrás de la otra.'},
    {q:'¿En qué se convirtió la oruga?',ok:'mariposa',opts:['mariposa','abeja','gusano'],okSay:'¡En una mariposa! Qué linda.'}
  ]},

/* ---------------- 5 AÑOS: LA MONTAÑA ---------------- */
'5A-T1':{title:'El calendario de Vera',
  pages:[
    {bg:'casa',items:[['hermana',520,540,330],['calendario',930,430,280]],
     say:'Vera colgó un calendario nuevo. Tenía doce meses: enero, febrero, marzo... ¡hasta diciembre! Más que los dedos de las dos manos.'},
    {bg:'playa',items:[['hermana',520,540,330],['maleta',850,630,190],['sol',1300,270,180]],
     say:['En enero llegaron las vacaciones de verano. Vera fue a la playa con su valija. ¡Qué calor!','En agosto llegaron las vacaciones de verano. Vera fue a la playa con su maleta. ¡Qué calor!']},
    {bg:'aula',items:[['hermana',520,540,330],['mochila',820,620,170],['maestra',1150,540,330]],
     say:['En marzo, ¡vuelta a la escuela! Vera estrenó mochila y abrazó a sus amigos. ¡Los extrañaba un montón!','En septiembre, ¡vuelta al cole! Vera estrenó mochila y abrazó a sus amigos. ¡Los echaba mucho de menos!']},
    {bg:'fiesta',items:[['hermana',520,540,330],['tarta',870,620,220],['globo',1150,330,160],['regalo',1250,640,160]],
     say:['En noviembre, ¡su cumpleaños! Vera cumplió cinco y sopló las velitas de la torta. ¡Feliz cumple!','En noviembre, ¡su cumpleaños! Vera cumplió cinco y sopló las velitas de la tarta. ¡Feliz cumple!']},
    {bg:'casa',items:[['arbolNavidad',800,470,360],['regalo',1080,650,150],['hermana',1290,560,290]],
     say:['Y en diciembre, el último mes, llegó la Navidad. ¡Armaron el arbolito todos juntos!','Y en diciembre, el último mes, llegó la Navidad. ¡Pusieron el árbol todos juntos!']},
    {bg:'noche',items:[['hermana',520,540,330],['calendario',880,450,240],['fuegos',1240,320,240]],
     say:'Cuando terminó diciembre, el calendario volvió a empezar: ¡otra vez enero! Un año nuevo, lleno de aventuras.'}
  ],
  qs:[
    {q:'¿Qué llegó antes: el cumpleaños de Vera o la Navidad?',ok:'tarta',opts:['tarta','arbolNavidad','fuegos'],okSay:'¡El cumpleaños! Noviembre viene antes que diciembre.'},
    {q:['¿Qué estrenó Vera en la vuelta a la escuela?','¿Qué estrenó Vera en la vuelta al cole?'],ok:'mochila',opts:['mochila','maleta','paraguas'],okSay:'¡Una mochila nueva!'},
    {q:'¿Qué llegó en diciembre, el último mes del año?',ok:'arbolNavidad',opts:['arbolNavidad','maleta','mochila'],okSay:['¡La Navidad! Con el arbolito.','¡La Navidad! Con el árbol.']}
  ]},

'5A-T2':{title:'Una carrera por dentro',
  pages:[
    {bg:'parque',items:[['hermana',560,540,330],['esqueleto',1000,500,300]],
     say:['Sara se preparó para una carrera en el parque. ¡Y adentro de su cuerpo, todo se preparó también!','Sara se preparó para una carrera en el parque. ¡Y dentro de su cuerpo, todo se preparó también!']},
    {bg:'cuerpo',items:[['hermana',520,540,330],['cerebro',900,380,200]],
     say:'Primero, su cerebro dio la orden: ¡a correr! El cerebro es el jefe: piensa y le dice al cuerpo qué hacer.'},
    {bg:'cuerpo',items:[['hermana',500,540,330],['musculo',820,380,180],['esqueleto',1150,520,300]],
     say:'Los músculos tiraron de los huesos, y las piernas se movieron rapidísimo. ¡Sin huesos, Sara sería blandita como una gelatina!'},
    {bg:'cuerpo',items:[['hermana',500,540,330],['corazonOrg',840,380,190],['pulmones',1150,400,220]],
     say:'Su corazón latía fuerte, ¡pum, pum, pum!, para llevar sangre a todo el cuerpo. Y los pulmones se inflaban como globos para tomar aire.'},
    {bg:'parque',items:[['hermana',520,540,330],['banana',850,600,150],['estomago',1150,420,200]],
     say:['¡Sara llegó a la meta! Después comió una banana, y su estómago la convirtió en energía.','¡Sara llegó a la meta! Después comió un plátano, y su estómago lo convirtió en energía.']},
    {bg:'dormitorio',items:[['hermana',520,540,330],['cama',900,610,320],['luna',1290,280,170]],
     say:'Esa noche, Sara durmió como un tronco. Pero su corazón y sus pulmones siguieron trabajando, despacito. ¡Nunca se toman vacaciones!'}
  ],
  qs:[
    {q:'¿Qué parte del cuerpo dio la orden de correr?',ok:'cerebro',opts:['cerebro','estomago','hueso'],okSay:'¡El cerebro! Piensa y manda.'},
    {q:'¿Qué se infla como un globo para tomar aire?',ok:'pulmones',opts:['pulmones','corazonOrg','musculo'],okSay:'¡Los pulmones! Sirven para respirar.'},
    {q:['¿Qué convirtió la banana en energía?','¿Qué convirtió el plátano en energía?'],ok:'estomago',opts:['estomago','cerebro','pulmones'],okSay:'¡El estómago! Ahí va la comida.'}
  ]},

'5A-T3':{title:'La golondrina de Lucía',
  pages:[
    {bg:'parque',items:[['hermana',480,560,300],['casa',880,460,340],['nido',990,330,130],['golondrina',1250,300,170]],
     say:'Debajo del techo de la casa de Lucía vivía una golondrina, en su nido de barro. ¡Todo el verano cantó, pío, pío!'},
    {bg:'otono',items:[['hermana',520,540,330],['bufanda',840,600,160],['nublado',1150,300,240]],
     say:'Pero llegó el otoño. Los días se hicieron más cortos y empezó a hacer fresco. Lucía sacó la bufanda.'},
    {bg:'otono',items:[['arbol',720,470,360],['viento',1120,320,200],['hojaNaranja',1080,620,130],['hojaRoja',1300,600,130]],
     say:'Las hojas de los árboles se pusieron amarillas, naranjas y rojas. Y con el viento, fiuuu, ¡se cayeron! En otoño, los árboles descansan.'},
    {bg:'lluvia',items:[['hermana',500,540,330],['niebla',880,380,260],['perro',1200,620,190]],
     say:'Hubo días de lluvia y mañanas de niebla, tan espesa que Lucía casi no veía a su perro. ¿Dónde estás, Rulo?'},
    {bg:'otono',items:[['hermana',500,560,300],['golondrina',830,330,200],['sol',1300,270,170]],
     say:'Un día, la golondrina se despidió. Con el frío hay pocos bichitos para comer, ¡así que voló a un lugar calentito!'},
    {bg:'casa',items:[['hermana',520,540,330],['mama',800,520,330],['nido',1180,400,180]],
     say:['Lucía la extrañó un poquito. Pero mamá le contó: ¡en primavera, la golondrina va a volver a su nido!','Lucía la echó un poquito de menos. Pero mamá le contó: ¡en primavera, la golondrina volverá a su nido!']}
  ],
  qs:[
    {q:'¿Qué hizo que se cayeran las hojas?',ok:'viento',opts:['viento','luna','arcoiris'],okSay:'¡El viento! Fiuuu, y las hojas se cayeron.'},
    {q:'¿Qué no dejaba ver al perro Rulo?',ok:'niebla',opts:['niebla','sol','nieve'],okSay:'¡La niebla! Era muy espesa.'},
    {q:'¿Quién se fue a un lugar calentito?',ok:'golondrina',opts:['golondrina','perro','ardilla'],okSay:'¡La golondrina! Y en primavera vuelve.'}
  ]},

'5A-T4':{title:'Max y el plato de colores',
  pages:[
    {bg:'cocina',items:[['nene',520,540,330],['dulces',860,600,190],['abuela',1200,520,340]],
     say:['Max quería comer solo golosinas: ¡caramelos en el desayuno, en el almuerzo y en la cena! Pero la abuela tuvo una idea.','Max quería comer solo chucherías: ¡caramelos en el desayuno, en la comida y en la cena! Pero la abuela tuvo una idea.']},
    {bg:'granja',items:[['gallina',520,590,250],['huevo',760,650,130],['vaca',1050,560,300],['queso',1320,640,150]],
     say:'Primero fueron a la granja. La gallina les regaló un huevo, y la vaca les dio leche para hacer queso. ¡Muuu!'},
    {bg:'huerta',items:[['trigo',560,520,260],['pan',820,620,160],['aceituna',1070,520,170],['aceite',1300,580,200]],
     say:'En el campo vieron el trigo, que se hace harina y después pan. ¡Y las aceitunas, que se convierten en aceite!'},
    {bg:'mar',items:[['barco',750,480,330],['pescado',1180,620,200]],
     say:'En el puerto, los pescadores volvían del mar con pescado fresquito. ¡Del mar a la mesa!'},
    {bg:'cocina',items:[['arroz',560,440,170],['pescado',820,440,170],['legumbres',1080,440,170],['brocoli',690,650,160],['manzana',950,650,160]],
     say:['En casa armaron un plato con un poquito de todo: arroz, pescado, legumbres y verduras. ¡Y una manzana de postre!','En casa prepararon un plato con un poquito de todo: arroz, pescado, legumbres y verduras. ¡Y una manzana de postre!']},
    {bg:'cocina',items:[['nene',520,540,330],['abuela',820,520,330],['dulces',1180,620,150]],
     say:['¡Max se comió todo y quedó lleno de energía! ¿Y las golosinas? A veces, de postre, y solo un poquito.','¡Max se comió todo y quedó lleno de energía! ¿Y las chucherías? A veces, de postre, y solo un poquito.']}
  ],
  qs:[
    {q:'¿Qué les regaló la gallina?',ok:'huevo',opts:['huevo','queso','pan'],okSay:'¡Un huevo! Los huevos vienen de la gallina.'},
    {q:'¿De qué se hace el aceite?',ok:'aceituna',opts:['aceituna','trigo','pescado'],okSay:'¡De las aceitunas!'},
    {q:'¿Qué hay que comer solo un poquito, a veces?',ok:'dulces',opts:['dulces','manzana','arroz'],
     okSay:['¡Las golosinas! Solo un poquito, de vez en cuando.','¡Las chucherías! Solo un poquito, de vez en cuando.']}
  ]},

'5A-T5':{title:'El baúl de las fiestas',
  pages:[
    {bg:'casa',items:[['hermana',520,540,330],['baul',920,610,250]],
     say:['Ana tenía un baúl de recuerdos. En cada fiesta del año guardaba algo adentro, ¡como un tesoro!','Ana tenía un baúl de recuerdos. En cada fiesta del año guardaba algo dentro, ¡como un tesoro!']},
    {bg:'noche',items:[['zapato',560,660,150],['camello',900,540,320],['corona',1250,380,170]],
     say:'El seis de enero llegaron los Reyes Magos. Ana había dejado sus zapatos y agua para los camellos. ¡Le trajeron una corona!'},
    {bg:'fiesta',items:[['hermana',520,540,330],['antifaz',860,330,160],['capa',880,610,190],['serpentina',1200,400,180]],
     say:'En carnaval, Ana se disfrazó con un antifaz y una capa, y bailó entre serpentinas. ¡El antifaz fue directo al baúl!'},
    {bg:'casa',items:[['abuela',520,520,330],['libro',860,580,180],['rosaFlor',1120,580,170]],
     say:'En el Día del Libro, la abuela le regaló un cuento de dragones y una rosa. ¡El libro también fue al baúl!'},
    {bg:'fiesta',items:[['hermana',520,560,310],['fuegos',900,330,260],['tambor',1250,600,180]],
     say:'En la fiesta del pueblo hubo música, tambores y fuegos artificiales en el cielo. ¡Pum, pum, cuántos colores!'},
    {bg:'fiesta',items:[['hermana',520,540,330],['tarta',850,610,200],['vela',1200,420,120],['baul',1200,620,220]],
     say:['Para su cumpleaños, Ana abrió el baúl y recordó todas sus fiestas. ¡Y guardó una vela de su torta, como recuerdo!','Para su cumpleaños, Ana abrió el baúl y recordó todas sus fiestas. ¡Y guardó una vela de su tarta, como recuerdo!']}
  ],
  qs:[
    {q:'¿Qué le trajeron los Reyes Magos a Ana?',ok:'corona',opts:['corona','antifaz','libro'],okSay:'¡Una corona!'},
    {q:'¿Qué se puso Ana en carnaval?',ok:'antifaz',opts:['antifaz','gorroNavidad','casco'],okSay:'¡Un antifaz! Y una capa.'},
    {q:'¿Qué guardó Ana de su cumpleaños?',ok:'vela',opts:['vela','rosaFlor','zapato'],okSay:['¡Una vela de la torta!','¡Una vela de la tarta!']}
  ]},

'5A-T6':{title:'Luz, la astronauta',
  pages:[
    {bg:'ciudad',items:[['astronauta',540,540,330],['cohete',1050,460,360]],
     say:'La astronauta Luz subió a su cohete. Tres, dos, uno... ¡despegue! ¡Fiuuum, hacia el espacio!'},
    {bg:'espacio',items:[['estrella',480,280,120],['tierra',850,460,340],['cohete',1300,300,180]],
     say:'Desde allá arriba, Luz vio la Tierra: redonda como una pelota gigante, azul y verde. ¡Qué linda!'},
    {bg:'espacio',items:[['tierra',850,460,340],['estrella',480,620,120],['estrella',1300,300,120]],
     say:'Y descubrió un secreto: la Tierra gira y gira, despacito, como un trompo. ¡Pero nadie se marea!'},
    {bg:'espacio',items:[['sol',480,430,240],['tierra',900,450,300],['luna',1300,330,170]],
     say:'Del lado que mira al Sol es de día, y los chicos van a la escuela. Del otro lado es de noche, ¡y todos duermen!'},
    {bg:'espacio',items:[['marte',520,420,160],['jupiter',830,460,280],['saturno',1230,440,280]],
     say:'Luz también saludó a otros planetas: Marte, rojo; Júpiter, el más grande; y Saturno, ¡con su anillo!'},
    {bg:'noche',items:[['astronauta',520,540,330],['hermana',800,580,260],['luna',1200,280,180],['estrella',1400,420,110]],
     say:'Cuando volvió a casa ya era de noche: su lado de la Tierra ya no miraba al Sol. Su hija Noa la esperaba con un abrazo.'}
  ],
  qs:[
    {q:'¿En qué viajó Luz al espacio?',ok:'cohete',opts:['cohete','globoAire','barco'],okSay:'¡En cohete! Tres, dos, uno... ¡despegue!'},
    {q:'¿Qué gira y gira como un trompo?',ok:'tierra',opts:['tierra','cohete','estrella'],okSay:'¡La Tierra! Gira despacito.'},
    {q:'¿Qué hace que sea de día?',ok:'sol',opts:['sol','luna','estrella'],okSay:'¡El Sol! Del lado que mira al Sol es de día.'}
  ]},

'5A-T7':{title:'El fósil de Simón',
  pages:[
    {bg:'parque',items:[['nene',520,540,330],['pala',800,610,170],['fosil',1120,640,200]],
     say:['Cavando en el arenero de la plaza, Simón encontró una piedra rara, con forma de hueso. ¡Era un fósil!','Cavando en el arenero del parque, Simón encontró una piedra rara, con forma de hueso. ¡Era un fósil!']},
    {bg:'prehistoria',items:[['abuelo',520,520,330],['fosil',800,620,140],['diplodoco',1150,480,380]],
     say:'El abuelo le contó: hace muchísimo tiempo, antes de que existieran las personas, en la Tierra vivían los dinosaurios.'},
    {bg:'prehistoria',items:[['diplodoco',700,470,380],['triceratops',1180,590,300]],
     say:'El diplodoco y el triceratops comían plantas: ¡eran herbívoros! El diplodoco, con su cuello larguísimo, llegaba a las hojas más altas.'},
    {bg:'prehistoria',items:[['tiranosaurio',820,480,380]],
     say:'El tiranosaurio, en cambio, comía carne: ¡era carnívoro! Tenía dientes enormes... y unos bracitos tan cortos que no se podía rascar la nariz.'},
    {bg:'prehistoria',items:[['volcan',560,470,320],['pterodactilo',950,280,200],['huevoDino',1230,630,200]],
     say:'En el cielo volaba un pterodáctilo, y a lo lejos humeaba un volcán. De pronto, un huevo enorme hizo ¡crac!, y salió un dinosaurio bebé.'},
    {bg:'parque',items:[['nene',520,540,330],['abuelo',800,520,330],['fosil',1150,600,180]],
     say:'Simón guardó su fósil como un tesoro. ¿Sería un huesito de aquel dinosaurio bebé? ¡Quién sabe!'}
  ],
  qs:[
    {q:'¿Qué encontró Simón en el arenero?',ok:'fosil',opts:['fosil','pelota','concha'],okSay:'¡Un fósil! Una piedra muy, muy antigua.'},
    {q:'¿Qué dinosaurio comía carne?',ok:'tiranosaurio',opts:['tiranosaurio','diplodoco','triceratops'],okSay:'¡El tiranosaurio! Era carnívoro.'},
    {q:'¿De dónde salió el dinosaurio bebé?',ok:'huevoDino',opts:['huevoDino','volcan','fosil'],okSay:'¡De un huevo enorme! Crac.'}
  ]},

'5A-T8':{title:'El viaje en globo de Olivia',
  pages:[
    {bg:'parque',items:[['papa',500,520,330],['hermana',740,570,270],['mapa',760,300,140],['globoAire',1140,420,340]],
     say:'Olivia y su papá subieron a un globo, con un mapa. Querían conocer las casas de los animales. ¡Arriba!'},
    {bg:'desierto',items:[['cactus',520,580,220],['camello',900,540,360],['sol',1300,260,180]],
     say:['Primero llegaron al desierto: arena y mucho calor. Allí vivía el camello, que aguanta muchos días sin tomar agua.','Primero llegaron al desierto: arena y mucho calor. Allí vivía el camello, que aguanta muchos días sin beber agua.']},
    {bg:'mar',items:[['ballena',720,440,340],['pulpo',1200,600,240]],
     say:'Después volaron sobre el mar. Una ballena les tiró un chorro de agua, ¡fsss!, y un pulpo los saludó con sus ocho brazos.'},
    {bg:'polo',items:[['pinguino',640,560,300],['pinguino',940,580,250,1],['hielo',1250,640,190]],
     say:'En el Polo Sur todo era hielo. Allí vivían los pingüinos, abrigados con plumas y una capa de grasa. ¡Ni se enteraban del frío!'},
    {bg:'bosque',items:[['arbol',600,470,340],['buho',620,380,140],['lobo',1050,560,300],['luna',1330,270,160]],
     say:'Ya de noche, pasaron por el bosque. Un búho de ojos enormes veía todo en la oscuridad, y un lobo le aullaba a la luna: ¡auuu!'},
    {bg:'dormitorio',items:[['hermana',520,540,330],['cama',920,610,320],['mapa',1280,350,160]],
     say:'Olivia volvió a casa feliz. Cada animal vive donde encuentra comida y está a gusto. ¿Y Olivia? ¡En su camita!'}
  ],
  qs:[
    {q:'¿Quién vivía en el desierto?',ok:'camello',opts:['camello','pulpo','pinguino'],okSay:['¡El camello! Aguanta sin tomar agua.','¡El camello! Aguanta sin beber agua.']},
    {q:'¿Quién los saludó con sus ocho brazos?',ok:'pulpo',opts:['pulpo','ballena','lobo'],okSay:'¡El pulpo! Vive en el mar.'},
    {q:'¿Quién veía todo en la oscuridad del bosque?',ok:'buho',opts:['buho','camello','pez'],okSay:'¡El búho! Ve muy bien de noche.'}
  ]},

'5A-T9':{title:'El pronóstico de Lucas',
  pages:[
    {bg:'casa',items:[['hermano',520,540,330],['termometro',840,450,200],['nublado',1200,300,220]],
     say:'Lucas jugaba a dar el pronóstico del tiempo. Cada mañana miraba el cielo y su termómetro, ¡como un científico!'},
    {bg:'parque',items:[['hermano',520,540,330],['gorra',840,340,150],['termometro',1050,460,180],['sol',1300,270,180]],
     say:'El lunes, sol y mucho calor: el termómetro subió y subió. Pronóstico de Lucas: ¡gorra, agua fresquita y a la sombra!'},
    {bg:'parque',items:[['hermano',520,540,330],['cometa',1000,300,220],['viento',1250,540,200]],
     say:['El martes sopló un viento fuertísimo. ¡Ideal para remontar el barrilete! Voló tan alto que casi tocaba las nubes.','El martes sopló un viento fuertísimo. ¡Ideal para volar la cometa! Subió tan alto que casi tocaba las nubes.']},
    {bg:'lluvia',items:[['hermano',520,560,300],['tormenta',900,300,240],['rayo',1250,430,200]],
     say:'El miércoles, nubes negras, rayos y truenos: ¡tormenta! Lucas se quedó en casa jugando, bien sequito.'},
    {bg:'calle',items:[['hermano',520,560,300],['niebla',900,420,340]],
     say:'El jueves, una niebla espesa tapó todo. ¡Lucas no se veía ni la punta de la nariz!'},
    {bg:'parque',items:[['hermano',520,540,330],['paraguas',800,330,170],['arcoiris',1100,330,300]],
     say:'El viernes llovió un ratito y enseguida salió el sol... ¡y apareció un arcoíris enorme! El mejor pronóstico de la semana.'}
  ],
  qs:[
    {q:['¿Qué remontó Lucas el día de viento?','¿Qué voló Lucas el día de viento?'],ok:'cometa',opts:['cometa','paraguas','pelota'],
     okSay:['¡El barrilete! Con el viento vuela alto.','¡La cometa! Con el viento vuela alto.']},
    {q:'¿Por qué se quedó Lucas en casa el miércoles?',ok:'tormenta',opts:['tormenta','sol','arcoiris'],okSay:'¡Por la tormenta! Con rayos y truenos.'},
    {q:'¿Qué apareció cuando salió el sol después de la lluvia?',ok:'arcoiris',opts:['arcoiris','nieve','niebla'],okSay:'¡El arcoíris! Sale cuando hay sol y lluvia.'}
  ]},

'5A-T10':{title:'La sandía de Julia',
  pages:[
    {bg:'huerta',items:[['abuela',480,520,320],['hermana',730,570,270],['semilla',1000,650,120],['pala',1230,610,180]],
     say:'Julia y su abuela hicieron un pocito en la tierra y pusieron una semilla de sandía. ¡A dormir, semillita!'},
    {bg:'huerta',items:[['hermana',520,560,300],['regadera',820,440,180],['gota',1000,580,120],['sol',1300,260,180]],
     say:'Le dieron agua con la regadera, y el sol le dio luz y calorcito. ¡Las plantas necesitan agua, luz y tierra!'},
    {bg:'huerta',items:[['brote',620,600,220],['plantita',1050,560,280]],
     say:'A los pocos días, ¡pip!, asomó un brote verde. Y el brote fue creciendo hasta convertirse en una planta con hojas grandes.'},
    {bg:'huerta',items:[['hermana',500,560,300],['plantita',850,580,260],['emo:tristeza',850,330,130],['regadera',1220,440,180]],
     say:'Un día de mucho calor, Julia se olvidó de regarla, ¡y la planta se puso caída y triste! Julia corrió con la regadera.'},
    {bg:'huerta',items:[['plantaFlor',760,540,320],['abeja',1100,340,150],['hermana',1260,560,290]],
     say:'Con agua otra vez, la planta se puso contenta. Le salieron flores amarillas, y las abejas vinieron a visitarlas. ¡Bzzz!'},
    {bg:'huerta',items:[['plantaFruto',560,540,300],['sandia',880,630,200],['semilla',1080,650,120],['hermana',1300,560,280]],
     say:['Las flores se convirtieron en frutos: ¡sandías! Y adentro había un montón de semillas... ¡para plantar otra vez!','Las flores se convirtieron en frutos: ¡sandías! Y dentro había un montón de semillas... ¡para plantar otra vez!']}
  ],
  qs:[
    {q:'¿Qué salió primero de la semilla?',ok:'brote',opts:['brote','plantaFlor','sandia'],okSay:'¡El brote! Después vinieron la planta, la flor y el fruto.'},
    {q:'¿Qué le faltó a la planta el día de calor?',ok:'gota',opts:['gota','pelota','luna'],okSay:'¡Agua! Sin agua, la planta se pone triste.'},
    {q:['¿Qué había adentro de la sandía?','¿Qué había dentro de la sandía?'],ok:'semilla',opts:['semilla','pez','estrella'],okSay:'¡Semillas! Para plantar otra vez.'}
  ]},

'5A-T11':{title:'Martina, superheroína del planeta',
  pages:[
    {bg:'casa',items:[['hermana',520,540,330],['capa',830,600,190],['tierra',1200,380,240]],
     say:'Martina se puso su capa: ¡era la superheroína del planeta! Su misión: separar la basura y no desperdiciar nada.'},
    {bg:'cocina',items:[['botellaPlastico',560,600,180],['lata',820,620,150],['brik',1080,600,170]],
     say:['Las botellas de plástico, las latas y los cartones de leche, ¡al tacho amarillo! Ahí van los envases.','Las botellas de plástico, las latas y los briks, ¡al contenedor amarillo! Ahí van los envases.']},
    {bg:'cocina',items:[['periodico',520,600,170],['cajaCarton',780,600,180],['botellaVidrio',1080,580,190],['frasco',1320,620,150]],
     say:['El diario y las cajas de cartón, al tacho azul. Los frascos y las botellas de vidrio, al verde. ¡Con cuidado!','El periódico y las cajas de cartón, al contenedor azul. Los frascos y las botellas de vidrio, al verde. ¡Con cuidado!']},
    {bg:'huerta',items:[['cascara',560,620,170],['restoManzana',820,620,160],['plantita',1150,560,260]],
     say:['La cáscara de banana y el corazón de la manzana, al marrón. ¡Se convierten en abono para las plantas!','La piel del plátano y el corazón de la manzana, al marrón. ¡Se convierten en abono para las plantas!']},
    {bg:'bano',items:[['hermana',520,540,330],['grifo',900,420,200],['cepillo',1180,480,150]],
     say:['Cuando se lavaba los dientes, Martina cerraba la canilla. ¡Así no se escapa el agua que no usamos!','Cuando se lavaba los dientes, Martina cerraba el grifo. ¡Así no se escapa el agua que no usamos!']},
    {bg:'noche',items:[['hermana',520,560,310],['bombilla',880,330,180],['tierra',1200,450,260]],
     say:'Y al salir de un cuarto, ¡clic!, apagaba la luz. El planeta Tierra estaba feliz con su superheroína.'}
  ],
  qs:[
    {q:['¿Qué tiró Martina al tacho verde?','¿Qué tiró Martina al contenedor verde?'],ok:'botellaVidrio',opts:['botellaVidrio','periodico','cascara'],okSay:'¡La botella de vidrio! El vidrio va al verde.'},
    {q:['¿Qué fue al tacho marrón?','¿Qué fue al contenedor marrón?'],ok:'cascara',opts:['cascara','lata','periodico'],
     okSay:['¡La cáscara de banana! Se convierte en abono.','¡La piel del plátano! Se convierte en abono.']},
    {q:'¿Qué cerraba Martina para ahorrar agua?',ok:'grifo',opts:['grifo','bombilla','cajaCarton'],okSay:['¡La canilla! Así cuidamos el agua.','¡El grifo! Así cuidamos el agua.']}
  ]},

'5A-T12':{title:'El viaje de Mateo',
  pages:[
    {bg:'casa',items:[['nene',500,540,330],['maleta',820,620,190],['abrigo',1060,580,170],['peluche',1290,600,170]],
     say:['La familia de Mateo se iba de viaje a la montaña. Mateo armó su valija: abrigo, gorro... ¡y su peluche, claro!','La familia de Mateo se iba de viaje a la montaña. Mateo hizo su maleta: abrigo, gorro... ¡y su peluche, claro!']},
    {bg:'calle',items:[['cinturon',600,500,320],['auto',1080,600,300],['mapa',1330,320,160]],
     say:'Antes de arrancar, todos se pusieron el cinturón de seguridad. ¡Clic! Mateo, en su sillita. Y mamá miró el mapa.'},
    {bg:'calle',items:[['stop',640,420,240],['auto',1050,600,300]],
     say:['En la ruta apareció una señal roja de pare. Papá frenó, miró bien a los dos lados... y siguió.','En la carretera apareció una señal roja de stop. Papá paró, miró bien a los dos lados... y siguió.']},
    {bg:'ciudad',items:[['semaforo',460,420,240],['pasoCebra',900,660,300],['mama',820,500,290],['nene',1030,540,240],['papa',1260,520,300]],
     say:['Pararon a comer en un pueblo. Para cruzar la calle, esperaron el semáforo en verde y cruzaron por la senda peatonal.','Pararon a comer en un pueblo. Para cruzar la calle, esperaron el semáforo en verde y cruzaron por el paso de cebra.']},
    {bg:'bosque',items:[['nene',520,540,330],['casco',820,330,150],['bici',1000,620,220]],
     say:['¡Por fin, la montaña! Mateo anduvo en bici por un caminito, con el casco bien puesto. ¡Qué aire tan fresco!','¡Por fin, la montaña! Mateo montó en bici por un caminito, con el casco bien puesto. ¡Qué aire tan fresco!']},
    {bg:'noche',items:[['nene',500,540,330],['peluche',760,610,150],['estrella',1050,250,110],['luna',1250,280,180],['estrella',1400,420,110]],
     say:['A la noche, Mateo miró las estrellas abrazado a su peluche. ¡Qué lindo es viajar... y viajar seguros!','Por la noche, Mateo miró las estrellas abrazado a su peluche. ¡Qué bonito es viajar... y viajar seguros!']}
  ],
  qs:[
    {q:'¿Qué se pusieron todos antes de arrancar?',ok:'cinturon',opts:['cinturon','gafas','bufanda'],okSay:'¡El cinturón de seguridad! Clic.'},
    {q:['¿Qué hizo frenar a papá en la ruta?','¿Qué hizo parar a papá en la carretera?'],ok:'stop',opts:['stop','arcoiris','globo'],
     okSay:['¡La señal de pare! Hay que frenar y mirar.','¡La señal de stop! Hay que parar y mirar.']},
    {q:['¿Qué se puso Mateo para andar en bici?','¿Qué se puso Mateo para montar en bici?'],ok:'casco',opts:['casco','corona','antifaz'],okSay:'¡El casco! Cuida la cabeza.'}
  ]}

};
