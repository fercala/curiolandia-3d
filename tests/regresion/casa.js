// Comprueba las habitaciones de la casa de Tito y los premios nuevos de la tienda (v1.590): que las habitaciones se abran
// con las casitas terminadas, que Tito anuncie la nueva y vaya a ella, que una partida antigua (cosas sin habitación) siga
// teniéndolo todo en el salón, que lo comprado vaya a su habitación, que se pueda llevar una cosa a otra habitación
// arrastrándola hasta su botón, que la tienda no deje comprar lo de una habitación cerrada y que pase de página.
// Uso: node tests/regresion/casa.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('casa');
// temas(n): S.temas con n casitas terminadas
const temas = n => { const o = {}; for (let i = 1; i <= n; i++) o['3A-T' + i] = { done: 1, g: {} }; return o };

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const nuevo = async (o = {}) => { const p = await L.abrir(b, srv.port, Object.assign({ hora: 11, fecha: '2026-10-21' }, o)); await p.evaluate(() => { const S = __cl.S; S.variant = 'es'; S.intro = true; S.age = 3; S.first.askedName = 1; window.__fast = 1; save() }); return p };
  const caso = async (id, titulo, fn, o) => { let p; try { p = await nuevo(o); const prob = await fn(p); if (prob) { R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) }); await R.captura(p, id + '.png') } else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3)); else R.bien(id, titulo) } catch (e) { R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]) } finally { p && await p.context().close() } };

  await caso('C1', 'Las habitaciones se abren con las casitas (1, 3, 5, 8, 11, 14)', async p => {
    const v = await p.evaluate(() => { const t = n => { const o = {}; for (let i = 1; i <= n; i++) o['3A-T' + i] = { done: 1, g: {} }; return o }; return [0, 1, 2, 3, 5, 8, 11, 14].map(n => { __cl.S.temas = t(n); return roomsOpen().length }) });
    if (v.join() !== '1,2,2,3,4,5,6,7') return 'habitaciones abiertas: ' + v.join();
  });
  await caso('C2', 'Al abrirse una habitación, Tito la anuncia y la casa va a ella', async p => {
    await p.evaluate(t => { __cl.S.temas = JSON.parse(t); __cl.S.rooms = 1; window.__said = []; SCENES.casaTito.room = 'salon'; __cl.go('casaTito', {}) }, JSON.stringify(temas(3))); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => [SCENES.casaTito.room, __cl.S.rooms, (window.__said || []).join(' | ')]);
    if (r[0] !== 'cocina' || r[1] !== 3) return 'habitación ' + r[0] + ', S.rooms ' + r[1];
    if (!/habitación nueva: la cocina/.test(r[2])) return 'Tito dice: ' + r[2];
    await p.evaluate(() => __cl.go('map', {})); await p.evaluate(() => { window.__said = []; __cl.go('casaTito', {}) }); await p.waitForTimeout(1200);
    if (/habitación nueva/.test(await p.evaluate(() => window.__said.join(' ')))) return 'lo vuelve a anunciar en la visita siguiente';
  });
  await caso('C3', 'Una partida antigua (cosas sin habitación) sigue con todo en el salón', async p => {
    await p.evaluate(() => { const S = __cl.S; S.owned.piano = 1; S.owned.robot = 1; S.home = { piano: { x: 930, y: 720 }, robot: { x: 1180, y: 740 } }; S.temas = {}; for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} }; save() });
    await p.reload(); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => [homeRoom('piano'), homeRoom('robot'), homeItems('salon').length, homeItems('juegos').length]);
    if (r.join() !== 'salon,salon,2,0') return 'habitaciones: ' + r.join();
  });
  await caso('C4', 'Lo comprado va a su habitación; un juguete, al cuarto de juegos si está abierto', async p => {
    const r = await p.evaluate(() => { const S = __cl.S; S.home = {}; S.temas = {}; for (let i = 1; i <= 8; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      ['cama', 'nevera', 'robot', 'gato'].forEach(id => { S.owned[id] = 1; placeHome(id) }); return ['cama', 'nevera', 'robot', 'gato'].map(homeRoom).join() });
    if (r !== 'dormitorio,cocina,juegos,salon') return 'habitaciones: ' + r;
  });
  await caso('C5', 'Arrastrar una cosa hasta el botón de otra habitación la lleva allí', async p => {
    await p.evaluate(() => { const S = __cl.S; S.home = {}; S.temas = {}; for (let i = 1; i <= 3; i++) S.temas['3A-T' + i] = { done: 1, g: {} }; S.rooms = 3; S.owned.piano = 1; placeHome('piano'); SCENES.casaTito.room = 'salon'; __cl.go('casaTito', {}) }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const sc = __cl.scene, o = S.home.piano, bt = roomBtns().find(b => b.R.id === 'cocina'), bl = roomBtns().find(b => b.R.id === 'bano');
      sc.down(o.x, o.y - 60); sc.move(o.x + 40, o.y - 100); sc.move(bt.x, bt.y); sc.up(bt.x, bt.y); const a = homeRoom('piano');
      // a una habitación cerrada no se puede: vuelve a su sitio
      sc.room = 'cocina'; const q = S.home.piano, x0 = q.x, y0 = q.y; sc.down(q.x, q.y - 60); sc.move(q.x + 40, q.y - 100); sc.move(bl.x, bl.y); sc.up(bl.x, bl.y);
      return [a, homeRoom('piano'), S.home.piano.x === x0 && S.home.piano.y === y0] });
    if (r[0] !== 'cocina') return 'tras soltarlo en la cocina está en ' + r[0];
    if (r[1] !== 'cocina' || !r[2]) return 'soltarlo en una habitación cerrada lo mueve: ' + JSON.stringify(r);
  });
  await caso('C6', 'La tienda no deja comprar lo de una habitación cerrada y tiene páginas', async p => {
    await p.evaluate(() => { const S = __cl.S; S.coins = 500; S.temas = {}; window.__said = []; __cl.go('tienda', {}); const sc = __cl.scene; sc.cat = 'casa'; sc.page = 0 }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const sc = __cl.scene, n = sc.pages(); sc.down(1550, 570); const pg = sc.page; const g = sc.grid().find(g => g.it.id === 'cama'); sc.down(g.x, g.y); return [n, pg, !!sc.conf, window.__said.slice(-1)[0] || ''] });
    if (r[0] < 3) return 'la pestaña de la casa tiene ' + r[0] + ' páginas';
    if (r[1] !== 1) return 'la flecha no pasa de página';
    if (r[2] || !/es para el dormitorio/.test(r[3])) return 'la cama se puede comprar sin el dormitorio: ' + r[3];
    const q = await p.evaluate(() => { const S = __cl.S, sc = __cl.scene; S.temas = { '3A-T1': { done: 1, g: {} } }; const g = sc.grid().find(g => g.it.id === 'cama'); sc.down(g.x, g.y); sc.confT = -9; sc.down(680, 690); return [S.owned.cama, homeRoom('cama')] });
    if (q.join() !== '1,dormitorio') return 'con el dormitorio abierto, la cama: ' + q.join();
  });
  await caso('C7', 'Cada habitación se dibuja sin errores con todo comprado', async p => {
    await p.evaluate(() => { const S = __cl.S; S.temas = {}; for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} }; S.rooms = 7; for (const it of SHOP) if (!it.slot) { S.owned[it.id] = 1; placeHome(it.id) } __cl.go('casaTito', {}) }); await p.waitForTimeout(500);
    for (const r of ['salon', 'dormitorio', 'cocina', 'bano', 'juegos', 'jardin', 'torre']) { await p.evaluate(r => { __cl.scene.room = r }, r); await p.waitForTimeout(250) }
    const fuera = await p.evaluate(() => homeItems().filter(o => o.x + o.s * .5 > 1610 || o.x - o.s * .5 < 0).map(o => o.id));
    if (fuera.length) return 'se salen de la pantalla: ' + fuera.join();
  });

  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
