// Comprueba los fallos B1-B7 del informe «Pruebas jugadas de Curiolandia 3D» (23-10-2026, sobre la v1.585), uno a uno.
// B1 repetir «Conocer» sin recargar; B2 Memoria apunta las parejas falladas; B3 el mapa 3D se rehace al cambiar libre/edad;
// B4 Tito 3D se pone el gorro del cofre al momento; B5 el centro de «saltar el cuento» funciona con el ratón de verdad;
// B6 el cartel DÍA/NOCHE no queda debajo de las estrellas de rondas; B7 la copia {"temas":null} se rechaza.
// Uso: node tests/regresion/informe-b.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('informe-b');

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const nuevo = async (o = {}) => { const p = await L.abrir(b, srv.port, Object.assign({ hora: 11, fecha: '2026-10-21' }, o)); await p.evaluate(() => { const S = __cl.S; S.name = 'Lucía'; S.variant = 'es'; S.intro = true; S.age = 3; S.first.askedName = 1; save() }); return p };
  const caso = async (id, titulo, fn, o) => { let p; try { p = await nuevo(o); const prob = await fn(p); if (prob) { R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) }); await R.captura(p, id + '.png') } else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3)); else R.bien(id, titulo) } catch (e) { R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]) } finally { p && await p.context().close() } };

  await caso('B1', 'Repetir «Conocer» dos veces sin recargar', async p => {
    for (let vez = 1; vez <= 3; vez++) {
      await p.evaluate(() => __cl.go('juego', { t: '3A-T1', g: 0 })); await p.waitForTimeout(400);
      const fin = await L.conducir(p, () => __cl.name !== 'juego', 90000, { azar: 0 });
      if (!fin) return `la vez ${vez} no se termina (hechas ${await p.evaluate(() => __cl.scene.g.done)})`;
    }
  });

  await caso('B2', 'Memoria apunta como fallo una pareja errada cuando la pareja ya se había visto', async p => {
    // Rejilla de 6 cartas a los 3 años (3 columnas x 2 filas, como en comps.js). Turno 1: cartas 0 y 1 (nuevas: explorar,
    // no es fallo). Turno 2: carta 2 y carta 0. Si la 2 es igual que la 1 (ya vista) y no se empareja, es fallo.
    const s = 220, xs = [0, 1, 2].map(i => 900 - 250 + i * 250), ys = [470 - 125, 470 + 125], pos = [];
    for (const y of ys) for (const x of xs) pos.push({ x, y });
    let probado = false;
    for (let intento = 0; intento < 12 && !probado; intento++) {
      await p.evaluate(() => __cl.go('juego', { t: '3A-T1', g: 3 })); await p.waitForTimeout(800);
      if (intento === 0) { const tipo = await p.evaluate(() => __cl.scene.t.games[3].t); if (tipo !== 'memoria') return 'el juego 3A-T1#3 no es memoria: ' + tipo }
      const err = () => p.evaluate(() => (__cl.S.stats.memoria || {}).err || 0);
      const ver = async i => { const k = await p.evaluate(([x, y]) => { const g = __cl.scene.g; g.down(x, y); const o = g.open[g.open.length - 1]; return o ? o.k : null }, [pos[i].x, pos[i].y]); await p.waitForTimeout(1700); return k };
      const e0 = await err(), k0 = await ver(0), k1 = await ver(1);
      if (k0 === k1) continue;
      if (await err() !== e0) return 'destapar dos cartas nuevas distintas ya cuenta como fallo';
      const k2 = await ver(2); await ver(0);
      if (k2 === k0) continue;
      const d = await err() - e0;
      if (k2 === k1) { if (d !== 1) return 'una pareja errada sabiendo dónde estaba la pareja no cuenta como fallo'; probado = true }
      else if (d !== 0) return 'una pareja errada con una carta nueva cuenta como fallo';
    }
    if (!probado) return 'no salió el caso a probar en 12 intentos';
  });

  await caso('B3', 'Al cambiar a libre y 4 años desde el mapa, el mapa se rehace', async p => {
    await p.evaluate(() => { __cl.S.unlockAll = false; __cl.go('map', {}) }); await p.waitForTimeout(1500);
    const w0 = await p.evaluate(() => { window.__w0 = __w3.W; return true });
    await p.evaluate(() => { openAdult(); __cl.S.unlockAll = true; __cl.S.age = 4; save(); closeAdult() }); await p.waitForTimeout(1500);
    const [mismo, esc] = await p.evaluate(() => [__w3.W === window.__w0, __cl.name]);
    if (esc !== 'map') return 'tras cerrar la zona de adultos la escena es ' + esc;
    if (mismo) return 'el mundo 3D del mapa no se ha rehecho';
    // sin cambios no se rehace
    await p.evaluate(() => { window.__w0 = __w3.W; openAdult(); closeAdult() }); await p.waitForTimeout(800);
    if (!(await p.evaluate(() => __w3.W === window.__w0))) return 'se rehace el mapa aunque no se cambió nada';
  });

  await caso('B4', 'En el cofre, Tito 3D se pone el gorro al momento', async p => {
    await p.evaluate(() => { __cl.S.owned = { 'caparazon:naranja': 1, 'bufanda:roja': 1 }; __cl.S.tito.hat = ''; __cl.go('cofre', { t: '3A-T1' }) }); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const cuenta = () => { let n = 0; __w3.W.tito.traverse(() => n++); return n }; const a = cuenta(); const it = nextGift(); grantGift(it); return [it.id, __cl.S.tito.hat, a, cuenta()] });
    if (!r[1]) return 'el regalo ' + r[0] + ' no es un sombrero';
    if (r[2] === r[3]) return 'el modelo de Tito no cambia al ponerse el gorro (' + r[2] + ' piezas)';
  });

  await caso('B5', 'Tocar el centro del botón de saltar el cuento (ratón de verdad)', async p => {
    await p.evaluate(() => { __cl.S.intro = false; __cl.go('intro', {}) }); await p.waitForTimeout(1500);
    if (await p.evaluate(() => __cl.name) !== 'intro') return 'no se pudo abrir el cuento';
    await L.clic(p, 1500, 820); await p.waitForTimeout(1500);
    const esc = await p.evaluate(() => __cl.name); if (esc !== 'map') return 'sigue en ' + esc;
    // el candado sigue funcionando: mantener pulsado 3,5 s sobre él
    const [a, c] = await p.evaluate(() => [OX + 1546 * SC, OY + 852 * SC]); await p.mouse.move(a, c); await p.mouse.down(); await p.waitForTimeout(4000); await p.mouse.up();
    if (!(await p.evaluate(() => !document.getElementById('adult').hidden))) return 'el candado ya no abre la zona de adultos';
  }, { rapido: false });// con voz de verdad: en modo rápido el cuento se acaba solo en 3 s

  await caso('B6', 'El cartel DÍA/NOCHE de «Gira» no queda debajo de las estrellas ni del «Nivel»', async p => {
    await p.evaluate(() => { __cl.S.age = 5; __cl.go('juego', { t: __cl.TEMAS.find(t => t.games.some(g => g.t === 'gira')).id, g: 1 }) }); await p.waitForTimeout(1200);
    const nom = await p.evaluate(() => __cl.scene.t.games[1].t); 
    const src = await p.evaluate(() => String(__cl.scene.g.draw));
    const m = src.match(/card\((\d+),(\d+),(\d+),(\d+),'#fff',6,48\)/); if (!m) return 'no encuentro el cartel en ' + nom;
    const [x, y, w, h] = m.slice(1).map(Number), tot = await p.evaluate(() => __cl.scene.g.total);
    const rw = tot * 66 + 30, rx = 1560 - rw, ry = 36, rh = 88;// drawRounds (core.js)
    const tapa = (ax, ay, aw, ah) => x < ax + aw && ax < x + w && y < ay + ah && ay < y + h;
    if (tapa(rx, ry, rw, rh)) return `el cartel (${x},${y},${w},${h}) se cruza con las estrellas (${rx},${ry},${rw},${rh})`;
    if (tapa(1400, 140, 160, 56)) return 'el cartel se cruza con «Nivel»';
    await R.captura(p, 'B6-gira.png');
  });

  await caso('B7', 'Copia de seguridad {"temas":null}', async p => {
    const r = await p.evaluate(async () => { const out = []; for (const c of ['{"temas":null}', '{"temas":[]}', '[]', 'null', '{"temas":{}}']) { try { await bkDecode(c); out.push(c + ' ok') } catch (e) { out.push(c + ' ' + e.message) } } return out });
    const mal = r.filter(x => !x.startsWith('{"temas":{}}') && x.endsWith(' ok')); if (mal.length) return 'acepta: ' + mal.join(', ');
    if (!r.includes('{"temas":{}} ok')) return 'rechaza una copia mínima válida';
  });

  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
