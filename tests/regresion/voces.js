// Comprueba la elección de la voz del navegador (v1.589) con voces de mentira: sin elegir nada, pickVoice coge la más
// natural del país (España en modo España); la zona de adultos lista las voces en español de mejor a peor, con ★ en las
// naturales, y la guía de voces; elegir una la guarda en S.vozNav, sigue tras recargar y, si no existe, vuelve a la automática.
// Uso: node tests/regresion/voces.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('voces');
// Voces de mentira: se cambian las de speechSynthesis antes de que cargue el juego (window.__voces las puede cambiar).
const antes = () => {
  const V = (name, lang) => ({ name, lang, voiceURI: name, localService: true, default: false });
  window.__voces = [V('Google US English', 'en-US'), V('Mónica', 'es-ES'), V('Paulina', 'es-MX'), V('Microsoft Elvira Online (Natural) - Spanish (Spain)', 'es-ES'), V('Google español', 'es-ES'), V('Jorge (mejorada)', 'es-ES')];
  try { speechSynthesis.getVoices = () => window.__voces } catch (e) { }
};
(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const nuevo = async (o = {}) => { const p = await L.abrir(b, srv.port, Object.assign({ antes }, o)); await p.evaluate(() => { const S = __cl.S; S.variant = 'es'; S.intro = true; S.age = 3; S.first.askedName = 1; save(); pickVoice() }); return p };
  const caso = async (id, titulo, fn) => { let p; try { p = await nuevo(); const prob = await fn(p); if (prob) { R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) }); await R.captura(p, id + '.png') } else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3)); else R.bien(id, titulo) } catch (e) { R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]) } finally { p && await p.context().close() } };

  await caso('V1', 'Sin elegir, la voz automática es la más natural de España', async p => {
    const v = await p.evaluate(() => VOICE && VOICE.name);
    if (!/Elvira/.test(v)) return 'la voz automática es ' + v;
  });
  await caso('V2', 'La zona de adultos lista las voces en español de mejor a peor, con ★ y la guía', async p => {
    const r = await p.evaluate(() => { openAdult(); const o = [...document.querySelectorAll('#a-vnav option')].map(o => o.textContent); const g = document.querySelector('#adult details'); return { o, g: g ? g.textContent : '' } });
    if (r.o.length !== 6) return 'opciones: ' + r.o.join(' | ');
    if (!/Automática/.test(r.o[0]) || !/Elvira.*★/.test(r.o[1]) || !/Jorge.*★/.test(r.o[2]) || /English/.test(r.o.join())) return 'orden: ' + r.o.join(' | ');
    if (!/Android/.test(r.g) || !/Edge/.test(r.g) || !/prémium/.test(r.g)) return 'falta la guía de voces';
  });
  await caso('V3', 'Elegir una voz la guarda, sigue tras recargar y, si desaparece, vuelve la automática', async p => {
    await p.evaluate(() => { openAdult(); const s = document.querySelector('#a-vnav'); s.value = 'Paulina'; s.dispatchEvent(new Event('change')) });
    const a = await p.evaluate(() => [__cl.S.vozNav, VOICE.name]);
    if (a[0] !== 'Paulina' || a[1] !== 'Paulina') return 'tras elegir: ' + a.join(', ');
    await p.reload(); await p.waitForTimeout(1500);
    const c = await p.evaluate(() => { pickVoice(); return VOICE.name });
    if (c !== 'Paulina') return 'tras recargar la voz es ' + c;
    const d = await p.evaluate(() => { window.__voces = window.__voces.filter(v => v.name !== 'Paulina'); pickVoice(); return VOICE.name });
    if (!/Elvira/.test(d)) return 'sin la voz elegida queda ' + d;
    const e = await p.evaluate(() => { document.querySelector('#a-vprueba') || openAdult(); document.querySelector('#a-vprueba').click(); return true });
    if (!e) return 'el botón Probar no está';
  });
  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
