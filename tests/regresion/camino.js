// Prueba de punta a punta: una partida nueva para cada edad (3, 4 y 5 años) jugada con el ratón de verdad siguiendo la
// ayuda de cada pantalla: portada -> edad -> nombre -> cuento -> mapa -> asamblea -> casitas -> juegos -> cofre -> ...
// Comprueba que se avanza (temas terminados, monedas, regalos), que nada se queda atascado y que tras recargar la
// página el progreso sigue ahí.
// Uso: node tests/regresion/camino.js <carpeta web> [edades, p. ej. 3,4,5] [minutos por edad]
const L = require('./lib');
const [raiz, edadesTxt = '3,4,5', minTxt = '8'] = process.argv.slice(2);
const R = L.registro('camino');

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  for (const edad of edadesTxt.split(',').map(Number)) {
    console.log('== Partida nueva,', edad, 'años');
    const p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21', guardado: null });
    // Lista de escenas por las que pasa (envolviendo go, que es global).
    await p.evaluate(() => { window.__esc = []; const g0 = go; go = function (n, o) { window.__esc.push(n); return g0(n, o) } });
    const esc = () => p.evaluate(() => __cl.name);
    const id = 'camino-' + edad;
    // 1. Portada -> edad
    await L.clic(p, 800, 450); await p.waitForTimeout(1200);
    if (await esc() !== 'edad') R.apuntar(id + '-portada', 'alta', 'Tocar la portada no lleva a elegir la edad', { escena: await esc() });
    // 2. Globo de la edad
    await L.clic(p, 480 + (edad - 3) * 320, 520); await p.waitForTimeout(1200);
    if (await esc() !== 'quien') R.apuntar(id + '-edad', 'alta', 'Elegir la edad no lleva a «¿Cómo te llamás?»', { escena: await esc() });
    // 3. Nombre (a los 5 años se salta, para probar ese camino)
    if (edad === 5) { await L.clic(p, 800, 790); }
    else {
      await L.clic(p, 800, 640); await p.waitForTimeout(500);
      const vis = await p.evaluate(() => !document.getElementById('nameDlg').hidden);
      if (!vis) R.apuntar(id + '-nombre', 'alta', 'El botón «Escribir el nombre» no abre el diálogo');
      await p.fill('#nm-in', edad === 3 ? 'Lucía' : 'Mateo'); await p.click('#nm-ok');
    }
    await p.waitForTimeout(1200);
    if (await esc() !== 'intro') R.apuntar(id + '-quien', 'alta', 'Tras el nombre no empieza el cuento', { escena: await esc() });
    // 4. Cuento: a los 3 años se escucha entero (tocando para avanzar), a los 4 y 5 se salta con el botón
    if (edad === 3) { const ok = await L.conducir(p, () => __cl.name === 'map', 60000, { real: true, azar: 1 }); if (!ok) R.apuntar(id + '-intro', 'alta', 'El cuento del principio no termina en el mapa', { escena: await esc() }) }
    else { await L.clic(p, 1460, 790); await p.waitForTimeout(1500); if (await esc() !== 'map') R.apuntar(id + '-saltar', 'media', 'El botón de saltar el cuento no lleva al mapa', { escena: await esc() }) }
    // 5. Jugar siguiendo la ayuda hasta terminar varios temas o agotar el tiempo
    const t0 = Date.now(), lim = +minTxt * 60000; let ultimo = '', quieto = Date.now(), atascos = 0;
    const meta = edad === 3 ? 3 : 2;
    while (Date.now() - t0 < lim) {
      const st = await L.estado(p);
      const firma = st.escena + '|' + st.juegos + '|' + st.temas.length + '|' + (await p.evaluate(() => __cl.scene && __cl.scene.si != null ? __cl.scene.si : (__cl.scene && __cl.scene.g ? __cl.scene.g.done : '')));
      if (firma !== ultimo) { ultimo = firma; quieto = Date.now() }
      if (Date.now() - quieto > 90000) {
        atascos++; const h = await p.evaluate(() => { try { return __cl.scene.hint && __cl.scene.hint() } catch (e) { return String(e) } });
        R.apuntar(id + '-atasco-' + atascos, 'alta', 'Partida atascada 90 s en la misma pantalla siguiendo la ayuda', { estado: st, ayuda: h, arg: await p.evaluate(() => JSON.stringify(sceneArg).slice(0, 120)) });
        await R.captura(p, id + '-atasco-' + atascos + '.png');
        await p.evaluate(() => __cl.go('map', {})); quieto = Date.now();
        if (atascos >= 3) break;
      }
      if (st.temas.length >= meta) break;
      // Ir a la tienda o a la casa de Tito no forma parte del camino: si se entra, volver al mapa
      if (['tienda', 'casaTito', 'album', 'repaso'].includes(st.escena) && Date.now() - quieto > 20000) await p.evaluate(() => __cl.go('map', {}));
      await L.pasoReal(p, 0.15); await p.waitForTimeout(250);
    }
    const st = await L.estado(p), lista = await p.evaluate(() => window.__esc);
    console.log('  estado', JSON.stringify(st), 'escenas', lista.length);
    if (st.temas.length >= meta) R.bien(id, `${st.temas.length} temas terminados (${st.temas.join(', ')}), ${st.juegos} juegos, ${st.monedas} monedas`);
    else R.apuntar(id + '-avance', 'alta', `En ${minTxt} min solo se terminaron ${st.temas.length} temas siguiendo la ayuda`, st);
    for (const e of ['asamblea', 'casita', 'juego', 'cofre']) if (!lista.includes(e)) R.apuntar(id + '-sin-' + e, 'media', 'El camino no pasó por la escena ' + e, { escenas: [...new Set(lista)] });
    if (!(st.monedas > 0)) R.apuntar(id + '-monedas', 'media', 'Tras jugar no hay monedas', st);
    const cofres = await p.evaluate(() => __cl.S.cofres || 0);
    if (st.temas.length && !cofres) R.apuntar(id + '-cofre', 'media', 'Tema terminado pero S.cofres vacío', st);
    // 6. Recargar: el progreso debe seguir
    await p.reload(); await p.waitForTimeout(2500);
    const st2 = await L.estado(p);
    if (st2.temas.length !== st.temas.length || st2.monedas !== st.monedas || st2.edad !== edad) R.apuntar(id + '-recarga', 'alta', 'Al recargar la página cambia el progreso', { antes: st, despues: st2 });
    else R.bien(id + '-recarga', 'el progreso se conserva al recargar');
    await L.clic(p, 800, 450); await p.waitForTimeout(1500);
    if (await esc() !== 'map') R.apuntar(id + '-vuelta', 'alta', 'Tras recargar, tocar la portada no vuelve al mapa', { escena: await esc() });
    const nom = await p.evaluate(() => __cl.S.name);
    if (edad !== 5 && !nom) R.apuntar(id + '-nombre-guardado', 'media', 'El nombre no se guardó');
    if (p.errs.length) R.apuntar(id + '-errores', 'alta', `${p.errs.length} errores de JavaScript en la partida`, [...new Set(p.errs)].slice(0, 8));
    else R.bien(id + '-errores', 'sin errores de JavaScript');
    await R.captura(p, id + '-fin.png');
    await p.context().close();
  }
  const n = R.guardar(); await b.close(); srv.close(); console.log('hallazgos:', n); process.exit(0);
})();
