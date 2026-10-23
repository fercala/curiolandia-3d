// Audio cuando el niño escucha sin tocar: entra en cada juego, no toca nada durante 14 s y mira si alguna frase de
// Tito se corta (por ejemplo, la ayuda automática que repite la consigna a los 11 s mientras Tito todavía habla).
// Después falla dos veces seguidas (si el juego da una ayuda) y mira si la explicación del fallo se oye entera.
// Usa la voz de verdad: los MP3 de voz/ y una voz del navegador falsa que tarda lo que tardaría (ver audio.js).
// Uso: node tests/regresion/audio-espera.js <carpeta web> <trabajador> <nº de trabajadores> [filtro de temas]
const L = require('./lib'), fs = require('fs'), path = require('path');
const [raiz, W = '0', NW = '1', filtro = ''] = process.argv.slice(2);
const R = L.registro('audio-espera-' + W);
const espia = require('./espia');

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21', rapido: false, antes: espia, espera: 3000 });
  await p.evaluate(() => { const S = __cl.S; S.intro = true; S.name = 'Lucía'; S.variant = 'es'; S.voz = ''; S.unlockAll = true; S.first.askedName = 1; save(); vozLoad() });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__dichos = []; const s0 = say; say = function (t, cb, o = {}) { __dichos.push({ t: __now(), texto: o.en ? t : tx(t), escena: sceneName, ctx: window.__ctx || '' }); return s0(t, cb, o) } });
  const jobs = (await p.evaluate(() => { const j = []; for (const t of __cl.TEMAS) t.games.forEach((g, i) => j.push([t.id, i])); return j })).filter((j, i) => i % +NW === +W && j[0].includes(filtro));
  const cortes = [], fallos = [];
  for (const [tid, gi] of jobs) {
    const ctx = tid + '#' + gi;
    await p.evaluate(([tid, gi, ctx]) => { window.__ctx = ctx; __cl.S.age = +(tid.match(/^(\d)A/) || [0, 4])[1] || 4; __cl.go('juego', { t: tid, g: gi }) }, [tid, gi, ctx]);
    const t0 = await p.evaluate(() => __now());
    await p.waitForTimeout(14000);
    // fallar dos veces: tocar lejos de la ayuda (si la hay) dos veces, esperando a que Tito calle entre medias
    for (let k = 0; k < 2; k++) {
      await p.evaluate(() => { const sc = __cl.scene; const h = sc.hint && sc.hint(); if (!h || h.dx != null || h.path) return; const x = h.x > 800 ? 300 : 1300, y = h.y > 450 ? 250 : 700; sc.down && sc.down(x, y); sc.up && sc.up(x, y) });
      const t1 = Date.now(); while (Date.now() - t1 < 9000 && await p.evaluate(() => talking)) await p.waitForTimeout(150);
      await p.waitForTimeout(500);
    }
    const [D, EV] = await p.evaluate(t0 => [__dichos.filter(d => d.t >= t0), __ev.filter(e => e[0] >= t0)], t0);
    for (let i = 0; i + 1 < D.length; i++) {
      const d = D[i], fin = D[i + 1].t, ev = EV.filter(e => e[0] >= d.t && (e[0] < fin || (e[0] <= fin + 2 && /fin$/.test(e[1]))));// un final en el mismo instante en que empieza la siguiente cuenta como entero
      const empezo = ev.some(e => e[1] === 'mp3' || e[1] === 'tts');
      const cortada = ev.some(e => e[1] === 'mp3-corte' || e[1] === 'tts-corte') || (empezo && !ev.some(e => e[1] === 'mp3-fin' || e[1] === 'tts-fin'));
      if (empezo && cortada && D[i + 1].escena === 'juego' && d.escena === 'juego') cortes.push({ juego: ctx, texto: d.texto, oidoMs: fin - d.t, siguiente: D[i + 1].texto, enS: Math.round((d.t - t0) / 100) / 10 });
    }
    process.stdout.write('.');
    if (p.errs.length) { fallos.push({ juego: ctx, errores: [...new Set(p.errs)].slice(0, 3) }); p.errs.length = 0 }
  }
  console.log();
  fs.writeFileSync(path.join(L.SAL, 'audio-espera-' + W + '-cortes.json'), JSON.stringify(cortes, null, 1));
  // Agrupar por qué la cortó: la siguiente frase.
  if (cortes.length) R.apuntar('audio-espera-' + W, 'alta', `${cortes.length} frases cortadas en ${new Set(cortes.map(c => c.juego)).size} de ${jobs.length} juegos sin que el niño toque nada (o tras fallar)`, cortes.slice(0, 40));
  else R.bien('audio-espera-' + W, `ninguna frase cortada en ${jobs.length} juegos`);
  if (fallos.length) R.apuntar('audio-espera-errores-' + W, 'alta', 'errores de JavaScript', fallos);
  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
