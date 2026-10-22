/* ================= PALABRAS NUEVAS (v2) ================= */
/*
 * lex.js: amplía el vocabulario de core.js. Va justo después de core.js y solo AÑADE cosas a sus globales:
 *  - LEX: nombre con artículo (en rioplatense) de los dibujos nuevos: {claveDelDibujo: 'el nombre'}.
 *  - LEX2: palabras que cambian demasiado entre variantes: {clave: ['rioplatense', 'España']}. Tiene prioridad sobre LEX.
 *  - SOUNDS: sonidos sintetizados de animales, vehículos e instrumentos nuevos (con syn, tone y noise de core.js).
 *  - ONO: la onomatopeya que dice Tito para cada sonido nuevo (tiene MP3 grabado: no cambies el texto).
 *  - _tuRe: más pares [rioplatense, España] para tx().
 * No define globales nuevas. Para un dibujo nuevo: añade su clave en LEX (y en LEX2 si en España se dice muy distinto);
 * si suena, añade su función en SOUNDS y su onomatopeya en ONO. Las claves 'emo:...' son las emociones de la asamblea.
 */
Object.assign(LEX,{
 escuela:'la escuela',parque:'el parque',piscina:'la pileta',tienda:'la tienda',hospital:'el hospital',calendario:'el calendario',semaforo:'el semáforo',pasoCebra:'el paso de cebra',
 bombera:'la bombera',medico:'el médico',policia:'la policía',panadero:'el panadero',cocinera:'la cocinera',cartero:'el cartero',granjera:'la granjera',peluquero:'el peluquero',
 manguera:'la manguera',fonendo:'el estetoscopio',silbato:'el silbato',carta:'la carta',tijeras:'las tijeras',sarten:'la sartén',ambulancia:'la ambulancia',camionBomberos:'el camión de bomberos',
 patrullero:'el patrullero',submarino:'el submarino',globoAire:'el globo aerostático',tractor:'el tractor',metro:'el subte',camion:'el camión',lupa:'la lupa',campana:'la campana',tambor:'el tambor',
 perfume:'el perfume',cactus:'el cactus',astronauta:'el astronauta',cinturon:'el cinturón',casco:'el casco',stop:'la señal de pare',mapa:'el mapa',maleta:'la valija',
 nuez:'la nuez',granada:'la granada',calabaza:'la calabaza',bellota:'la bellota',erizo:'el erizo',zanahoria:'la zanahoria',lechuga:'la lechuga',patata:'la papa',brocoli:'el brócoli',
 pimiento:'el morrón',pina:'el ananá',kiwi:'el kiwi',limon:'el limón',berenjena:'la berenjena',chocolate:'el chocolate',desayuno:'el desayuno',almuerzo:'el almuerzo',merienda:'la merienda',cena:'la cena',
 pinguino:'el pingüino',osoPolar:'el oso polar',morsa:'la morsa',iglu:'el iglú',hielo:'el hielo',jirafa:'la jirafa',cebra:'la cebra',cocodrilo:'el cocodrilo',tigre:'el tigre',conejo:'el conejo',
 hormiga:'la hormiga',arana:'la araña',gusano:'el gusano',oruga:'la oruga',semilla:'la semilla',brote:'el brote',plantita:'la planta',plantaFlor:'la flor',plantaFruto:'el fruto',
 heladoCaido:'el helado en el piso',torreRota:'la torre rota',cajaSorpresa:'la caja sorpresa',emociones:'las emociones',
 esqueleto:'el esqueleto',hueso:'el hueso',pulmones:'los pulmones',estomago:'el estómago',cerebro:'el cerebro',musculo:'el músculo',corazonOrg:'el corazón',bombilla:'la lamparita',
 pescado:'el pescado',carne:'la carne',huevo:'el huevo',legumbres:'las legumbres',arroz:'el arroz',aceite:'el aceite',queso:'el queso',dulces:'las golosinas',miel:'la miel',aceituna:'la aceituna',trigo:'el trigo',
 tierra:'la Tierra',marte:'Marte',jupiter:'Júpiter',saturno:'Saturno',tiranosaurio:'el tiranosaurio',diplodoco:'el diplodoco',triceratops:'el triceratops',pterodactilo:'el pterodáctilo',
 huevoDino:'el huevo de dinosaurio',fosil:'el fósil',volcan:'el volcán',rayo:'el rayo',termometro:'el termómetro',camello:'el camello',pulpo:'el pulpo',buho:'el búho',lobo:'el lobo',golondrina:'la golondrina',
 botellaPlastico:'la botella de plástico',lata:'la lata',brik:'el cartón de leche',periodico:'el diario',cajaCarton:'la caja de cartón',botellaVidrio:'la botella de vidrio',frasco:'el frasco',
 cascara:'la cáscara de banana',restoManzana:'el corazón de la manzana',grifo:'la canilla',banador:'la malla',esquis:'los esquís',trineo:'el trineo',pluma:'la pluma',piedra:'la piedra',
 corona:'la corona',antifaz:'el antifaz',tarta:'la torta de cumpleaños',arbolNavidad:'el árbol de Navidad',rosaFlor:'la rosa',fuegos:'los fuegos artificiales',libro:'el libro',adorno:'la bola de Navidad',
 reno:'el reno',gorroNavidad:'el gorro de Navidad',vela:'la vela',serpentina:'la serpentina',sombreroPirata:'el sombrero de pirata',capa:'la capa',narizPayaso:'la nariz de payaso',varita:'la varita mágica',
 cerdito:'el cerdito',casaPaja:'la casa de paja',casaMadera:'la casa de madera',casaLadrillo:'la casa de ladrillos',jabon:'el jabón',pastaDientes:'la pasta de dientes',vaso:'el vaso',baul:'el baúl de los juguetes',
 bloques:'los bloques',pijama:'el piyama',alfombra:'la alfombra',lampara:'la lámpara',cuadro:'el cuadro',plantaInterior:'la planta',estanteria:'la biblioteca',cometa:'el barrilete',peluche:'el peluche',
 columpio:'la hamaca',fuente:'la fuente',pecera:'la pecera',guitarra:'la guitarra',xilofono:'el xilófono',robot:'el robot',muneca:'la muñeca',pelotaPlaya:'la pelota de playa',telescopio:'el telescopio',
 trenJuguete:'el tren de juguete',reloj:'el reloj',hamster:'el hámster',casitaPerro:'la casita del perro',banco:'el banco',farol:'el farol',piano:'el piano',moneda:'la moneda',monedas:'las monedas',vale:'el vale',
 candado:'el candado',cofre:'el cofre del tesoro',sombreroCopa:'el sombrero de copa',monio:'el moño',gorroFiesta:'el gorrito de fiesta',
 'emo:alegria':'la alegría','emo:tristeza':'la tristeza','emo:enojo':'el enojo','emo:miedo':'el miedo','emo:sorpresa':'la sorpresa','emo:calma':'la calma','emo:verguenza':'la vergüenza'
});
// LEX2: [rioplatense, España] de las palabras que tx() no sabría cambiar bien (cambia el artículo o la palabra entera).
Object.assign(LEX2,{escuela:['la escuela','el cole'],piscina:['la pileta','la piscina'],fonendo:['el estetoscopio','el fonendo'],patrullero:['el patrullero','el coche de policía'],metro:['el subte','el metro'],
 stop:['la señal de pare','la señal de stop'],maleta:['la valija','la maleta'],patata:['la papa','la patata'],pimiento:['el morrón','el pimiento'],pina:['el ananá','la piña'],bombilla:['la lamparita','la bombilla'],
 dulces:['las golosinas','las chucherías'],brik:['el cartón de leche','el brik de leche'],periodico:['el diario','el periódico'],cascara:['la cáscara de banana','la piel del plátano'],grifo:['la canilla','el grifo'],
 banador:['la malla','el bañador'],tarta:['la torta de cumpleaños','la tarta de cumpleaños'],pijama:['el piyama','el pijama'],estanteria:['la biblioteca','la estantería'],cometa:['el barrilete','la cometa'],
 columpio:['la hamaca','el columpio'],'emo:enojo':['el enojo','el enfado'],almuerzo:['el almuerzo','la comida'],cerdito:['el chanchito','el cerdito']});
// sonidos nuevos
// sonidos nuevos: misma clave que el dibujo; ver syn() en core.js para el significado de cada campo.
Object.assign(SOUNDS,{
  ambulancia:()=>{for(let i=0;i<4;i++)syn({f:i%2?660:880,d:.38,type:'square',lp:2000,v:.18,delay:i*.4})},
  camionBomberos:()=>{syn({f:500,f2:1100,d:.9,type:'sawtooth',lp:1800,v:.2});syn({f:1100,f2:500,d:.9,type:'sawtooth',lp:1800,v:.2,delay:.9})},
  patrullero:()=>{for(let i=0;i<6;i++)syn({f:i%2?700:1000,d:.2,type:'square',lp:2200,v:.16,delay:i*.2})},
  helicoptero:()=>{for(let i=0;i<10;i++)noise(.07,.4,180,i*.11,1.2)},
  submarino:()=>{[0,.9].forEach(dl=>{tone(1200,.9,'sine',.25,1,dl);tone(1200,.4,'sine',.08,1,dl+.25)})},
  tractor:()=>{for(let i=0;i<8;i++){syn({f:60,d:.1,type:'sawtooth',lp:300,v:.5,delay:i*.14});noise(.08,.2,200,i*.14)}},
  globoAire:()=>{noise(.8,.3,700,0,.4);noise(.6,.25,900,.9,.4)},
  metro:()=>{[0,.18,.36,.54,.72].forEach(dl=>noise(.12,.3,900,dl,.7));syn({f:740,d:.5,type:'triangle',v:.2,delay:1});syn({f:587,d:.6,type:'triangle',v:.2,delay:1.5})},
  campana:()=>{[0,.7].forEach(dl=>{tone(880,1.2,'sine',.4,1,dl);tone(1760,.8,'sine',.12,1,dl);tone(2640,.5,'sine',.06,1,dl)})},
  tambor:()=>{for(let i=0;i<4;i++){tone(110,.25,'sine',.6,.5,i*.22);noise(.08,.3,300,i*.22)}},
  pinguino:()=>{[0,.18].forEach(dl=>syn({f:500,f2:700,d:.16,type:'sawtooth',bp:900,q:3,v:.3,delay:dl}))},
  osoPolar:()=>{syn({f:90,fm:120,f2:70,d:1,type:'sawtooth',lp:400,vib:18,vibA:10,v:.5,att:.1})},
  lobo:()=>{syn({f:420,fm:700,f2:520,d:1.6,type:'sine',vib:5,vibA:14,v:.35,att:.3})},
  buho:()=>{[0,.45].forEach(dl=>syn({f:380,f2:340,d:.35,type:'sine',v:.4,delay:dl,att:.05}))},
  tigre:()=>{syn({f:130,fm:180,f2:80,d:1,type:'sawtooth',lp:550,vib:24,vibA:18,v:.5,att:.08});noise(.9,.18,350,0,.6)},
  conejo:()=>{[0,.1,.2].forEach(dl=>noise(.05,.25,2500,dl,2))},
  cocodrilo:()=>{[0,.25].forEach(dl=>{noise(.12,.5,400,dl,1);tone(150,.1,'square',.2,.6,dl)})},
  camello:()=>{syn({f:200,fm:260,f2:150,d:.9,type:'sawtooth',lp:700,vib:9,vibA:25,v:.35})},
  morsa:()=>{[0,.3].forEach(dl=>syn({f:140,f2:110,d:.25,type:'sawtooth',lp:500,v:.45,delay:dl}))},
  jirafa:()=>{syn({f:300,f2:260,d:.4,type:'sine',lp:600,v:.2})},
  cebra:()=>{syn({f:600,f2:300,d:.7,vib:14,vibA:80,lp:2200,v:.25,att:.05})}
});
// onomatopeyas de los sonidos nuevos (las dice la voz con say()).
Object.assign(ONO,{ambulancia:'¡Niinoo, niinoo!',camionBomberos:'¡Uuuiiiuuu!',patrullero:'¡Uiu, uiu, uiu!',helicoptero:'¡Tacatacataca!',submarino:'¡Piiing!',tractor:'¡Put, put, put!',globoAire:'¡Fsssh!',
 metro:'¡Tucutú, tucutú!',campana:'¡Talán, talán!',tambor:'¡Pum, pum, pum!',pinguino:'¡Cua, cua!',osoPolar:'¡Grrrooo!',lobo:'¡Auuuuu!',buho:'¡Uh, uh!',tigre:'¡Grrraaa!',conejo:'¡Snif, snif!',cocodrilo:'¡Clac, clac!',camello:'¡Gruuu!',morsa:'¡Oh, oh!',cebra:'¡Iiiii!'});
// palabras rioplatenses nuevas que cambian en España
// Función que se ejecuta una vez: convierte cada par de add en expresión regular (igual que _tuRe en core.js) y lo añade al
// final de _tuRe, así que se aplica DESPUÉS de los pares de TU. Las expresiones largas van antes que las cortas.
(function(){const add=[['las golosinas','las chucherías'],['golosinas','chucherías'],['la valija','la maleta'],['valija','maleta'],['el subte','el metro'],['subte','metro'],['el morrón','el pimiento'],['morrón','pimiento'],
  ['el ananá','la piña'],['ananá','piña'],['la lamparita','la bombilla'],['lamparita','bombilla'],['la malla','el bañador'],['el piyama','el pijama'],['piyama','pijama'],['el barrilete','la cometa'],['barrilete','cometa'],
  ['la vereda','la acera'],['vereda','acera'],['la torta','la tarta'],['torta','tarta'],['el diario','el periódico'],['la hamaca','el columpio'],['el balde','el cubo'],['manejar','conducir'],['manejamos','conducimos'],
  ['la pollera','la falda'],['el durazno','el melocotón'],['durazno','melocotón'],['el chanchito','el cerdito'],['chanchito','cerdito'],['los chanchitos','los cerditos'],['chanchitos','cerditos'],
  ['jugá','juega'],['cantá','canta'],['cantamos','cantamos'],['soplá','sopla'],['doblá','dobla'],['frená','frena'],['cruzá','cruza'],['apagá','apaga'],['decorá','decora'],['unilos','únelos'],['uní','une'],['uní','une'],
  ['seguilo','síguelo'],['seguí','sigue'],['comprá','compra'],['comprás','compras'],['juntás','juntas'],['ganás','ganas'],['canjeá','canjea'],['mostrale','muéstrale'],['mostrá','muestra'],['elegilo','elígelo'],['elegila','elígela'],
  ['girala','gírala'],['ponela','ponla'],['ponelo','ponlo'],['ponelos','ponlos'],['ponelas','ponlas'],['llevalas','llévalas'],['armalo','ármalo'],['dibujá','dibuja'],['repasá','repasa'],['pasá','pasa'],['te acordás','te acuerdas'],['acordás','acuerdas'],
  ['escuchala','escúchala'],['escuchalo','escúchalo'],['mirala','mírala'],['miralo','míralo'],['tocalas','tócalas'],['tocalos','tócalos'],['vení','ven'],['andá','ve'],['tenés','tienes'],['querés','quieres'],['agarrala','cógela'],['agarralo','cógelo'],
  ['los chicos','los niños'],['chicos','niños'],['la pieza','el dormitorio'],['el living','el salón'],['prendida','encendida'],['prendidas','encendidas'],['prendido','encendido'],['prendidos','encendidos'],['prender','encender'],
  ['frotá','frota'],['enjuagá','enjuaga'],['secá','seca'],['lavá','lava'],['cepillá','cepilla'],['ordená','ordena'],['guardalos','guárdalos'],['guardalas','guárdalas'],['arrastralos','arrástralos'],['arrastralas','arrástralas']];
  for(const [a,b] of add)_tuRe.push([new RegExp('(^|[^\\p{L}])('+a+')(?=[^\\p{L}]|$)','giu'),b]);})();
