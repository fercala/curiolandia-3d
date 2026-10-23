// Casos límite y caminos alternativos: partidas guardadas rotas o viejas, almacenamiento bloqueado, copias de seguridad
// raras, toques muy rápidos, salir a mitad de juego, cambiar de edad o de modo, pantallas raras, sin WebGL, sin voz,
// límite de tiempo, noche, fechas especiales, nombres raros... En cada caso se comprueba que no hay errores de
// JavaScript y que después se puede seguir jugando (mapa, casita, juego, cofre, tienda...).
// Uso: node tests/regresion/limites.js <carpeta web> [filtro: solo los casos cuyo id contenga este texto]
const L = require('./lib');
const [raiz, filtro = ''] = process.argv.slice(2);
const R = L.registro('limites' + (filtro ? '-' + filtro : ''));

// Partida normal de 4 años con algo de progreso (para los casos que parten de una partida en marcha).
const BASE = { age: 4, name: 'Mateo', variant: 'es', intro: true, first: { askedName: 1 }, temas: { '4A-T1': { g: { 0: 1, 1: 1 }, done: false } }, coins: 12, coinsTot: 30 };

// recorrido(p, edad): visita las escenas principales y da unos pasos en un juego. Devuelve lista de problemas.
async function recorrido(p, edad) {
  const mal = [];
  const tema = (edad || 4) + 'A-T1';
  const ir = async (n, o, pasos = 4) => {
    try { await p.evaluate(([n, o]) => __cl.go(n, o), [n, o]) } catch (e) { mal.push(n + ': ' + String(e).split('\n')[0]); return }
    await p.waitForTimeout(700);
    const esc = await p.evaluate(() => __cl.name);
    if (esc !== n) mal.push(`fui a ${n} y estoy en ${esc}`);
    // unos toques siguiendo la ayuda (pueden llevar a otra escena: eso es normal)
    for (let i = 0; i < pasos; i++) { const h = await L.paso(p, 0.5); if (h && h.err) { mal.push(n + ' hint: ' + h.err); break } await p.waitForTimeout(150) }
  };
  await ir('map', {}); await ir('casita', { t: tema }); await ir('juego', { t: tema, g: 0 }, 10); await ir('cofre', { t: tema });
  await ir('tienda', {}); await ir('casaTito', {}); await ir('album', {}); await ir('asamblea', {}, 6); await ir('map', {});
  return mal;
}

// caso(id, titulo, opciones de abrir, accion(p) -> lista de problemas extra o nada, o)
const CASOS = [];
const caso = (id, titulo, abrirO, accion, o = {}) => CASOS.push({ id, titulo, abrirO, accion, o });

// ---------- Partidas guardadas ----------
caso('guardado-corrupto', 'localStorage con JSON roto', { crudo: '{"age":4,"temas":{' }, async p => recorrido(p, 4));
caso('guardado-nulos', 'Partida guardada con campos a null (temas, vol, tito, owned, home)', { guardado: { age: 4, intro: true, temas: null, vol: null, tito: null, owned: null, home: null, stats: null, days: null } }, async p => recorrido(p, 4));
caso('guardado-tipos', 'Partida guardada con tipos raros (edad en texto, monedas en texto, temas como lista)', { guardado: { age: '5', intro: 1, coins: '7', temas: [], name: 123 } }, async p => recorrido(p, 5));
caso('guardado-edad-rara', 'Edad fuera de rango (7)', { guardado: { age: 7, intro: true, temas: {} } }, async p => recorrido(p, 5));
caso('guardado-viejo', 'Partida de una versión vieja (sin tienda ni repaso)', { guardado: { age: 3, name: 'Ana', intro: true, temas: { '3A-T1': { g: { 0: 1 }, done: false } }, stats: {}, days: {}, asam: {} } }, async p => recorrido(p, 3));
caso('guardado-tema-raro', 'Tema guardado que ya no existe y juegos con índices raros', { guardado: Object.assign({}, BASE, { temas: { 'NO-EXISTE': { g: { 0: 1 }, done: true }, '4A-T1': { g: { 99: 1, '-1': 1 }, done: true }, '4A-T2': null } }) }, async p => recorrido(p, 4));
caso('guardado-tito-raro', 'Personaje y ropa de Tito que no existen', { guardado: Object.assign({}, BASE, { tito: { kind: 'dragon', shell: 'xx', scarf: 'yy', hat: 'zz' } }) }, async p => recorrido(p, 4));
caso('guardado-letrilandia', 'Primera vez con partida de Letrilandia en el mismo navegador', { crudo: null, antes: () => { try { if (!sessionStorage.getItem('__l')) { sessionStorage.setItem('__l', 1); localStorage.setItem('letrilandia.v1', JSON.stringify({ name: 'Leo', age: 5, accent: 'es', vol: { voz: .5 } })) } } catch (e) { } } }, async p => {
  const S = await p.evaluate(() => ({ n: __cl.S.name, a: __cl.S.age, v: __cl.S.variant }));
  const m = await recorrido(p, 5); if (S.n !== 'Leo' || S.a !== 5 || S.v !== 'es') m.push('no se trajo bien Letrilandia: ' + JSON.stringify(S)); return m
});
caso('sin-almacenamiento', 'localStorage bloqueado (modo privado estricto)', { antes: () => { const e = () => { throw new DOMException('bloqueado', 'SecurityError') }; Storage.prototype.getItem = e; Storage.prototype.setItem = e; Storage.prototype.clear = e } }, async p => { await L.clic(p, 800, 450); await p.waitForTimeout(800); await L.clic(p, 800, 520); await p.waitForTimeout(800); return recorrido(p, 4) });
caso('almacenamiento-lleno', 'localStorage lleno (setItem falla con QuotaExceeded)', { guardado: BASE, antes: () => { const s0 = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'curiolandia.v1' && sessionStorage.getItem('__puesto')) throw new DOMException('lleno', 'QuotaExceededError'); return s0.call(this, k, v) } } }, async p => recorrido(p, 4));

// ---------- Copia de seguridad ----------
caso('copia-ida-vuelta', 'Copia de seguridad: código -> recuperar en otra partida', { guardado: BASE }, async p => {
  const m = [];
  const r = await p.evaluate(async () => { const c = await bkEncode(); const d = await bkDecode(c); return { c: c.slice(0, 7), ok: d.name === __cl.S.name && d.coins === __cl.S.coins } });
  if (!r.ok) m.push('la copia no devuelve los mismos datos ' + JSON.stringify(r));
  for (const [cod, debe] of [['basura', 'formato'], ['CURIO1.@@@', 'formato'], ['CURIO1.AAAA', 'cualquiera'], ['{"temas":5}', 'formato'], ['{"temas":null}', 'formato'], ['{"a":1}', 'formato'], ['', 'formato'], ['CURIO0.' + Buffer.from('{"temas":{}}').toString('base64'), 'ok']]) {
    const e = await p.evaluate(async c => { try { await bkDecode(c); return 'ok' } catch (e) { return e.message || String(e) } }, cod);
    if (debe !== 'cualquiera' && e !== debe) m.push(`bkDecode(${cod.slice(0, 20)}) da «${e}», se esperaba «${debe}»`);
  }
  return m.concat(await recorrido(p, 4));
});
caso('copia-minima', 'Recuperar una copia mínima ({"temas":{}}) y seguir jugando', { crudo: '{"temas":{}}' }, async p => { await L.clic(p, 800, 450); await p.waitForTimeout(900); const e = await p.evaluate(() => __cl.name); const m = e === 'edad' ? [] : ['con una copia mínima la portada lleva a ' + e]; return m.concat(await recorrido(p, 3)) });
caso('copia-xss', 'Copia con un nombre con HTML (se enseña en el resumen de la zona de adultos)', { guardado: BASE }, async p => {
  await p.evaluate(() => { window.__xss = 0; openAdult() }); await p.waitForTimeout(500);
  await p.evaluate(() => { const ta = document.querySelector('#a-bk-txt'); ta.value = JSON.stringify({ temas: {}, name: '<img src=x onerror="window.__xss=1">' }); document.querySelector('#a-bk-load').click() }); await p.waitForTimeout(800);
  const x = await p.evaluate(() => window.__xss); await p.evaluate(() => closeAdult()); return x ? ['el nombre de la copia se ejecuta como HTML'] : [];
});

// ---------- Nombres ----------
for (const [k, nombre] of [['html', '<b>Ana</b>'], ['coma', 'Ana, Luz'], ['tito', 'Tito'], ['emoji', 'Lu 🌟'], ['largo', 'María de los Ángeles'], ['espacios', '   ']]) {
  caso('nombre-' + k, 'Nombre raro: ' + JSON.stringify(nombre), { guardado: Object.assign({}, BASE, { name: nombre }) }, async p => {
    const m = [];
    const plan = await p.evaluate(() => { const t = tx('¡Muy bien' + kid() + '! ¡Una estrella más!'); return { t, plan: VOZ ? vozFile(t) : 'sin VOZ' } });
    if (plan.plan && plan.plan !== 'sin VOZ' && !plan.plan.some(x => typeof x === 'string')) m.push('con este nombre la felicitación no suena grabada: ' + JSON.stringify(plan));
    await p.evaluate(() => openAdult()); await p.waitForTimeout(400); const html = await p.evaluate(() => document.getElementById('adult').innerHTML.includes('<b>Ana</b>')); await p.evaluate(() => closeAdult());
    if (html) m.push('el nombre se mete como HTML en la zona de adultos');
    return m.concat(await recorrido(p, 4));
  });
}

// ---------- Toques y navegación ----------
caso('toques-rapidos', 'Muchos toques seguidos en el mapa, en una casita y en un juego (doble toque, toque durante la transición)', { guardado: BASE }, async p => {
  const m = [];
  for (const [n, o] of [['map', {}], ['casita', { t: '4A-T1' }], ['juego', { t: '4A-T1', g: 2 }], ['cofre', { t: '4A-T1' }], ['tienda', {}]]) {
    await p.evaluate(([n, o]) => __cl.go(n, o), [n, o]); await p.waitForTimeout(100);
    await p.evaluate(() => { const sc = __cl.scene; for (let i = 0; i < 40; i++) { const h = sc.hint && sc.hint(); const x = h ? h.x : 200 + Math.random() * 1200, y = h ? h.y : 150 + Math.random() * 600; sc.down && sc.down(x, y); sc.up && sc.up(x, y) } });
    await p.waitForTimeout(1200);
  }
  for (let i = 0; i < 15; i++) await p.evaluate(i => __cl.go(['map', 'casita', 'juego', 'cofre', 'tienda'][i % 5], { t: '4A-T1', g: i % 3 }), i);
  await p.waitForTimeout(1500);
  return m.concat(await recorrido(p, 4));
});
caso('salir-a-mitad', 'Salir de un juego a mitad de frase o de animación y volver a entrar (con la voz real)', { guardado: BASE, rapido: false }, async p => {
  const m = [];
  for (let g = 0; g < 4; g++) {
    await p.evaluate(g => __cl.go('juego', { t: '4A-T1', g }), g); await p.waitForTimeout(900);
    await L.paso(p); await p.waitForTimeout(300); await p.evaluate(() => __cl.go('casita', { t: '4A-T1' })); await p.waitForTimeout(300);
    await p.evaluate(g => __cl.go('juego', { t: '4A-T1', g }), g); await p.waitForTimeout(1500);
    const e = await p.evaluate(() => __cl.name); if (e !== 'juego') m.push(`al volver a entrar al juego ${g} estoy en ${e}`);
  }
  await p.waitForTimeout(4000);
  const e = await p.evaluate(() => __cl.name); if (e !== 'juego') m.push('tras esperar, una respuesta vieja me sacó del juego: ' + e);
  return m;
});
caso('candado-adultos', 'Abrir la zona de adultos manteniendo el candado y cambiar todos los ajustes', { guardado: BASE }, async p => {
  const m = []; await p.evaluate(() => __cl.go('map', {})); await p.waitForTimeout(800);
  const [a, b] = await p.evaluate(() => [OX + 1550 * SC, OY + 860 * SC]); await p.mouse.move(a, b); await p.mouse.down(); const t0 = Date.now(); while (Date.now() - t0 < 10000 && await p.evaluate(() => document.getElementById('adult').hidden)) await p.waitForTimeout(200); const tard = Date.now() - t0; await p.mouse.up(); if (tard > 4500) m.push('INFO: hubo que mantener el candado ' + (tard / 1000).toFixed(1) + ' s (cuenta en tiempo de juego: con pocos fotogramas por segundo tarda más)'); await p.waitForTimeout(500);
  const ab = await p.evaluate(() => !document.getElementById('adult').hidden); if (!ab) { m.push('mantener el candado 10 s no abre la zona de adultos'); await p.evaluate(() => openAdult()) }
  for (const nm of ['a-age', 'a-var', 'a-voz', 'a-hemi', 'a-lim', 'a-kind', 'a-mode', 'a-mi']) {
    const n = await p.evaluate(nm => document.querySelectorAll(`#adult [name=${nm}]`).length, nm);
    for (let i = 0; i < n; i++) { await p.evaluate(([nm, i]) => { const r = document.querySelectorAll(`#adult [name=${nm}]`)[i]; r.checked = true; r.dispatchEvent(new Event('change')) }, [nm, i]); await p.waitForTimeout(120) }
  }
  await p.evaluate(() => { const r = document.querySelector('#adult [name=a-voz][value=""]'); r.checked = true; r.dispatchEvent(new Event('change')); const v = document.querySelector('#adult [name=a-var][value=es]'); if (v) { v.checked = true; v.dispatchEvent(new Event('change')) } });
  await p.evaluate(() => closeAdult()); await p.waitForTimeout(500);
  return m.concat(await recorrido(p, await p.evaluate(() => __cl.S.age)));
});
caso('borrar-todo', 'Borrar todo el progreso y empezar de nuevo', { guardado: BASE }, async p => {
  await p.evaluate(() => doReset()); await p.waitForTimeout(800);
  const m = []; const s = await p.evaluate(() => ({ e: __cl.name, age: __cl.S.age, temas: Object.keys(__cl.S.temas).length, coins: __cl.S.coins }));
  if (s.e !== 'title' || s.age || s.temas || s.coins) m.push('tras borrar: ' + JSON.stringify(s));
  await L.clic(p, 800, 450); await p.waitForTimeout(900); await L.clic(p, 800, 520); await p.waitForTimeout(900);
  return m.concat(await recorrido(p, 4));
});
caso('modo-libre', 'Modo libre: entrar en todas las casitas de todas las zonas y en el primer juego de cada tema', { guardado: Object.assign({}, BASE, { unlockAll: true }) }, async p => {
  const m = []; const ts = await p.evaluate(() => __cl.TEMAS.map(t => t.id));
  for (const z of ['jardin', 'bosque', 'montana', 'fiestas', 'ingles']) { await p.evaluate(z => __cl.go(z, {}), z); await p.waitForTimeout(600); await L.paso(p, 1) }
  for (const t of ts) {
    await p.evaluate(t => { __cl.S.age = +(t.match(/^(\d)A/) || [0, 4])[1] || 4; __cl.go('casita', { t }) }, t); await p.waitForTimeout(250);
    await p.evaluate(t => __cl.go('juego', { t, g: 0 }), t); await p.waitForTimeout(350); await L.paso(p);
    const e = await p.evaluate(() => __cl.name); if (e !== 'juego') m.push(`el primer juego de ${t} no se abre (escena ${e})`);
  }
  return m;
});
caso('cambiar-edad', 'Cambiar de edad con temas a medias de otra edad', { guardado: Object.assign({}, BASE, { temas: { '3A-T1': { g: { 0: 1, 1: 1, 2: 1 }, done: true }, '4A-T1': { g: { 0: 1 }, done: false }, '5A-T3': { g: { 1: 1 }, done: false } } }) }, async p => {
  const m = []; for (const a of [5, 3, 4]) { await p.evaluate(a => { __cl.S.age = a }, a); m.push(...(await recorrido(p, a))) } return m
});

// ---------- Pantallas y entorno ----------
caso('movil-vertical', 'Móvil en vertical (390x844, táctil)', { guardado: BASE, ancho: 390, alto: 844, tactil: true }, async p => { await p.touchscreen.tap(195, 420); await p.waitForTimeout(500); return recorrido(p, 4) });
caso('pantalla-diminuta', 'Ventana diminuta (320x200)', { guardado: BASE, ancho: 320, alto: 200 }, async p => recorrido(p, 4));
caso('pantalla-enorme', 'Pantalla enorme (2560x1440)', { guardado: BASE, ancho: 2560, alto: 1440 }, async p => recorrido(p, 4));
caso('girar-pantalla', 'Girar el móvil a mitad de juego', { guardado: BASE, ancho: 844, alto: 390, tactil: true }, async p => {
  await p.evaluate(() => __cl.go('juego', { t: '4A-T1', g: 1 })); await p.waitForTimeout(800);
  for (const [w, h] of [[390, 844], [844, 390], [700, 700], [844, 390]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(400); await L.paso(p) }
  return recorrido(p, 4);
});
caso('sin-webgl', 'Navegador sin WebGL (el juego debe seguir en 2D)', { guardado: BASE, antes: () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (/webgl/i.test(t)) return null; return g.call(this, t, ...a) } } }, async p => recorrido(p, 4));
caso('sin-voz', 'Navegador sin voz (sin speechSynthesis) y sin MP3', { guardado: Object.assign({}, BASE, { voz: 'nav' }), rapido: false, antes: () => { try { delete Window.prototype.speechSynthesis; delete window.speechSynthesis; delete Window.prototype.SpeechSynthesisUtterance; delete window.SpeechSynthesisUtterance } catch (e) { } } }, async p => {
  const m = []; await p.evaluate(() => __cl.go('juego', { t: '4A-T1', g: 0 })); const ok = await L.conducir(p, () => __cl.name !== 'juego', 60000, { azar: 0.1 });
  if (!ok) m.push('sin voz, el juego 0 de 4A-T1 no se termina en 60 s'); return m.concat(await recorrido(p, 4));
});
caso('voz-a-cero', 'Volumen de la voz a 0', { guardado: Object.assign({}, BASE, { vol: { voz: 0, mus: .4, fx: .8 } }), rapido: false }, async p => {
  const m = []; await p.evaluate(() => __cl.go('juego', { t: '4A-T1', g: 0 })); const ok = await L.conducir(p, () => __cl.name !== 'juego', 60000, { azar: 0.1 });
  if (!ok) m.push('con la voz a 0, el juego 0 de 4A-T1 no se termina en 60 s'); return m;
});
caso('mp3-caidos', 'Los MP3 no se pueden descargar (sin conexión): debe hablar la voz del navegador', { guardado: BASE, rapido: false, antes: () => { const f = window.fetch; window.fetch = function (u, ...a) { if (/\.mp3/.test(String(u))) return Promise.reject(new TypeError('sin red')); return f.call(this, u, ...a) }; window.__tts = 0; const S0 = window.speechSynthesis; if (S0) { const sp = S0.speak.bind(S0); S0.speak = u => { window.__tts++; try { sp(u) } catch (e) { } } } } }, async p => {
  const m = []; await p.evaluate(() => __cl.go('juego', { t: '4A-T1', g: 0 })); await p.waitForTimeout(4000);
  const n = await p.evaluate(() => window.__tts); if (!n) m.push('sin MP3, la voz del navegador tampoco habla'); return m;
});
caso('limite-tiempo', 'Se acaba el tiempo de juego (límite 10 min) a mitad de un juego', { guardado: Object.assign({}, BASE, { limit: 10 }) }, async p => {
  const m = []; await p.evaluate(() => __cl.go('juego', { t: '4A-T1', g: 1 })); await p.waitForTimeout(500);
  await p.evaluate(() => { sessionT = 10 * 60 + 1 }); await p.waitForTimeout(1500);
  const e = await p.evaluate(() => __cl.name); if (e !== 'dormir') m.push('al pasar el límite no va a «dormir»: ' + e);
  await L.clic(p, 800, 450); await p.waitForTimeout(800); const e2 = await p.evaluate(() => __cl.name);
  if (e2 !== 'dormir') m.push('tras el límite, tocar la pantalla sale de «dormir» a ' + e2);
  await p.reload(); await p.waitForTimeout(2000); await L.clic(p, 800, 450); await p.waitForTimeout(900);
  const e3 = await p.evaluate(() => __cl.name); if (e3 === 'dormir') m.push('tras recargar la página sigue en «dormir»'); else m.push('INFO: recargar la página permite seguir jugando (escena ' + e3 + ')');
  return m;
});
for (const [k, hora, fecha] of [['noche', 22, '2026-10-21'], ['madrugada', 3, '2026-10-21'], ['navidad', 11, '2026-12-25'], ['anio-nuevo', 0, '2027-01-01'], ['bisiesto', 11, '2028-02-29'], ['cambio-hora', 2, '2026-10-25'], ['domingo', 11, '2026-10-25']]) {
  caso('fecha-' + k, `Fecha y hora especiales: ${fecha} a las ${hora} h`, { guardado: Object.assign({}, BASE, { bday: fecha.slice(5) }), hora, fecha }, async p => recorrido(p, 4));
}
caso('cambio-dia', 'Pasar la medianoche jugando', { guardado: BASE, hora: 23, fecha: '2026-10-21', antes: () => { } }, async p => {
  await p.evaluate(() => __cl.go('asamblea', {})); await p.waitForTimeout(800);
  await p.evaluate(() => { const D = Date, off = 61 * 60 * 1000; const n0 = D.now; Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(n0() + off) } static now() { return n0() + off } } });
  await p.waitForTimeout(500); return recorrido(p, 4);
});
caso('hemisferio-sur', 'Hemisferio sur (estaciones al revés)', { guardado: Object.assign({}, BASE, { hemi: 'S' }) }, async p => recorrido(p, 4));
caso('tienda-sin-monedas', 'Tienda sin monedas y con muchísimas monedas', { guardado: Object.assign({}, BASE, { coins: 0 }) }, async p => {
  const m = []; await p.evaluate(() => __cl.go('tienda', {})); await p.waitForTimeout(600);
  for (let i = 0; i < 30; i++) { await p.evaluate(() => { const sc = __cl.scene, x = 200 + Math.random() * 1200, y = 150 + Math.random() * 650; sc.down && sc.down(x, y); sc.up && sc.up(x, y) }); await p.waitForTimeout(80) }
  const c = await p.evaluate(() => __cl.S.coins); if (c < 0) m.push('monedas negativas: ' + c);
  await p.evaluate(() => { __cl.S.coins = 99999 }); for (let i = 0; i < 60; i++) { await L.paso(p, 1); await p.evaluate(() => { const sc = __cl.scene, x = 200 + Math.random() * 1200, y = 150 + Math.random() * 650; sc.down && sc.down(x, y); sc.up && sc.up(x, y) }); await p.waitForTimeout(60) }
  const c2 = await p.evaluate(() => __cl.S.coins); if (c2 < 0 || isNaN(c2)) m.push('monedas raras tras comprar mucho: ' + c2);
  return m.concat(await recorrido(p, 4));
});
caso('todo-terminado', 'Partida con todos los temas terminados (fin del camino)', { guardado: null }, async p => {
  await p.evaluate(() => { const S = __cl.S; S.age = 5; S.intro = true; S.first.askedName = 1; for (const t of __cl.TEMAS) { const g = {}; t.games.forEach((_, i) => g[i] = 1); S.temas[t.id] = { g, done: true } } S.coins = 500; save() });
  const m = await recorrido(p, 5);
  await p.evaluate(() => __cl.go('map', {})); await p.waitForTimeout(600); for (let i = 0; i < 6; i++) { const h = await L.paso(p, 0.3); if (h && h.err) m.push('ayuda del mapa: ' + h.err); await p.waitForTimeout(500) }
  return m;
});

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  for (const c of CASOS) {
    if (filtro && !c.id.includes(filtro)) continue;
    console.log('==', c.id);
    let p;
    try {
      const o = Object.assign({ hora: 11, fecha: '2026-10-21' }, c.abrirO);
      p = await L.abrir(b, srv.port, o);
      const extra = (await Promise.race([c.accion(p), new Promise(r => setTimeout(() => r(['el caso tardó más de 4 minutos']), 240000))])) || [];
      const info = extra.filter(x => String(x).startsWith('INFO:')), mal = extra.filter(x => !String(x).startsWith('INFO:'));
      const errs = [...new Set(p.errs)].filter(e => !(c.id === 'sin-webgl' && /Error creating WebGL context/.test(e)));// sin WebGL, Three avisa en la consola: es lo esperado
      if (mal.length || errs.length) { R.apuntar(c.id, errs.length ? 'alta' : 'media', c.titulo, { problemas: mal.slice(0, 10), errores: errs.slice(0, 8) }); await R.captura(p, c.id + '.png') }
      else R.bien(c.id, c.titulo + (info.length ? ' — ' + info.join('; ') : ''));
    } catch (e) { R.apuntar(c.id, 'alta', c.titulo + ' (la prueba no pudo terminar)', { excepcion: String(e).split('\n')[0], errores: p ? [...new Set(p.errs)].slice(0, 5) : [] }) }
    if (p) await p.context().close().catch(() => { });
  }
  const n = R.guardar(); await b.close(); srv.close(); console.log('hallazgos:', n); process.exit(0);
})();
