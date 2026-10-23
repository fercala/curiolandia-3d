// Regresión de todos los juegos: abre cada juego de cada tema (a su edad) y lo juega siguiendo la ayuda (hint) hasta
// que termina. Apunta los que no terminan en el tiempo dado (con captura y la última ayuda) y los errores de JavaScript.
// Va en modo rápido (window.__fast: la voz no espera al audio). Se puede repartir en varios trabajadores en paralelo.
// Uso: node tests/regresion/juegos.js <carpeta web> [trabajador] [nº de trabajadores] [segundos por juego] [filtro]
const L = require('./lib');
const [raiz, W = '0', NW = '1', segTxt = '60', filtro = ''] = process.argv.slice(2);
const R = L.registro('juegos-' + W);

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  let p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21' });
  const prep = () => p.evaluate(() => { const S = __cl.S; S.name = 'Lucía'; S.variant = 'es'; S.intro = true; S.unlockAll = true; S.first.askedName = 1 });
  await prep();
  const jobs = (await p.evaluate(() => { const j = []; for (const t of __cl.TEMAS) t.games.forEach((g, i) => j.push([t.id, i, g.t || ''])); return j })).filter((j, i) => i % +NW === +W && (j[0] + '#' + j[1]).includes(filtro));
  let ok = 0;
  for (const [tid, gi, nom] of jobs) {
    const id = tid + '#' + gi;
    p.errs.length = 0;
    await p.evaluate(([tid, gi]) => { const S = __cl.S; S.age = +(tid.match(/^(\d)A/) || [0, 4])[1] || 4; __cl.go('juego', { t: tid, g: gi }) }, [tid, gi]);
    await p.waitForTimeout(300);
    let fin = false;
    try { fin = await L.conducir(p, () => __cl.name !== 'juego', +segTxt * 1000, { azar: 0.3, cada: 9 }) } catch (e) { p.errs.push('excepción: ' + String(e).split('\n')[0]) }
    const errs = [...new Set(p.errs)];
    if (!fin) {
      const info = await p.evaluate(() => { const sc = __cl.scene, g = sc && sc.g; let h = null; try { h = sc.hint && sc.hint() } catch (e) { h = String(e) } return { escena: __cl.name, ayuda: h && (h.x != null ? { x: Math.round(h.x), y: Math.round(h.y), arrastre: h.dx != null || !!h.path } : h), hechas: g && g.done, total: g && g.total, fin: sc && sc.fin } }).catch(e => ({ err: String(e) }));
      R.apuntar('juego-' + id, 'alta', `El juego ${id} (${nom}) no se termina en ${segTxt} s siguiendo la ayuda`, Object.assign(info, { errores: errs.slice(0, 3) }));
      await R.captura(p, 'juego-' + id.replace('#', '-') + '.png');
    } else ok++;
    if (fin && errs.length) R.apuntar('juego-err-' + id, 'alta', `Errores de JavaScript en el juego ${id} (${nom})`, errs.slice(0, 5));
    console.log(W, ok, '/', jobs.length, fin ? 'ok' : 'NO TERMINA', id, nom);
    if (p.isClosed()) { p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21' }); await prep() }
  }
  R.bien('juegos-' + W, `${ok} de ${jobs.length} juegos terminados siguiendo la ayuda`);
  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
