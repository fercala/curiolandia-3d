// Prueba del audio de Tito con el sistema de voz de verdad (sin window.__fast): reproduce los MP3 de voz/ (o voz-fer/)
// y sustituye la voz del navegador por una falsa que tarda lo que tardaría en hablar, para poder medirlo todo.
// Para cada frase que dice say() apunta: con qué sonó (MP3 entero, mezcla de MP3 y voz del navegador, solo voz del
// navegador), si se oyó entera o la cortó la frase siguiente (y cuánto faltaba), si no sonó nada, si sonaron dos cosas
// a la vez y si el juego siguió (callback de say) antes de que acabara el audio.
// Uso: node tests/regresion/audio.js <carpeta web> [variant es|ar] [voz ''|fer] [minutos]
const L = require('./lib'), fs = require('fs'), path = require('path');
const [raiz, variant = 'es', voz = '', minTxt = '6'] = process.argv.slice(2);
const nombre = 'audio-' + variant + (voz ? '-' + voz : '');
const R = L.registro(nombre);

const espia = require('./espia');

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21', rapido: false, antes: espia, espera: 3000 });
  await p.evaluate(([v, vz]) => { const S = __cl.S; S.age = 3; S.intro = true; S.name = 'Lucía'; S.variant = v; S.voz = vz; S.unlockAll = true; S.first.askedName = 1; save(); vozLoad() }, [variant, voz]);
  await p.waitForTimeout(1500);
  // Cada frase: momento, texto final, plan de vozFile, ¿acabó?, escena, y cuándo se llamó al callback.
  await p.evaluate(() => {
    window.__dichos = []; const s0 = say;
    say = function (t, cb, o = {}) {
      const tt = o.en ? t : tx(t), plan = !o.en && S.vol.voz > 0 && VOZ ? vozFile(tt) : null;
      const d = { t: __now(), texto: tt, en: !!o.en, plan: plan ? plan.map(x => typeof x === 'string' ? x : { t: x.t }) : null, escena: sceneName, cbT: null };
      __dichos.push(d);
      return s0(t, cb ? function () { d.cbT = __now(); return cb.apply(this, arguments) } : cb, o);
    };
  });
  // Recorrido: mapa, asamblea, varias casitas y juegos de cada edad, cofre y tienda, siguiendo la ayuda.
  const jobs = await p.evaluate(() => { const r = []; for (const t of __cl.TEMAS) if (/^[345]A-T(1|5|9)$|^X-|^EN-HELLO$/.test(t.id)) r.push([t.id, Math.min(1, t.games.length - 1)]); return r });
  const t0 = Date.now(), lim = +minTxt * 60000;
  const ir = async (n, o, ms) => { await p.evaluate(([n, o]) => __cl.go(n, o), [n, o]); await L.conducir(p, () => false, ms, { azar: 0, esperarVoz: true }) };
  await ir('map', { hello: true }, 15000);
  await p.evaluate(() => { __cl.S.age = 3; __cl.go('asamblea', {}) });
  await L.conducir(p, () => __cl.name !== 'asamblea', 90000, { azar: 0, esperarVoz: true });
  for (const [tid, gi] of jobs) {
    if (Date.now() - t0 > lim) break;
    await p.evaluate(([tid, gi]) => { const S = __cl.S; S.age = +(tid.match(/^(\d)A/) || [0, 4])[1] || 4; __cl.go('juego', { t: tid, g: gi }) }, [tid, gi]);
    await L.conducir(p, () => __cl.name !== 'juego', 60000, { azar: 0, esperarVoz: true });
  }
  if (Date.now() - t0 < lim) { await ir('cofre', { t: '3A-T1' }, 15000); await ir('tienda', {}, 10000); await ir('jardin', {}, 15000) }
  await p.waitForTimeout(6000);
  const [EV, D] = await p.evaluate(() => [__ev, __dichos]);
  fs.writeFileSync(path.join(L.SAL, nombre + '-crudo.json'), JSON.stringify({ EV, D }));

  // ---- Análisis ----
  // Para cada frase, los sucesos de audio entre su inicio y el de la siguiente frase.
  const res = { total: D.length, cortadasPorToque: 0, mp3: 0, mezcla: 0, tts: 0, cortadas: 0, cortadasPronto: 0, mudas: 0, solapes: 0, cbAntes: 0, rechazos: 0, falloMp3: 0 };
  const ej = { mezcla: [], cortadas: [], mudas: [], cbAntes: [], falloMp3: [] };
  for (let i = 0; i < D.length; i++) {
    const d = D[i], fin = i + 1 < D.length ? D[i + 1].t : d.t + 30000, ev = EV.filter(e => e[0] >= d.t && (e[0] < fin || (e[0] === fin && /fin$/.test(e[1]))));// un final en el mismo instante en que empieza la siguiente cuenta como entero
    const tipo = d.en ? 'tts' : !d.plan ? 'tts' : d.plan.some(x => typeof x !== 'string') ? 'mezcla' : 'mp3';
    if (d.texto.includes(', Lucía') && tipo === 'mp3') { } // el nombre se añade aparte: cuenta como mezcla
    res[d.plan && d.texto.includes(', Lucía') ? 'mezcla' : tipo]++;
    if ((tipo === 'mezcla' || d.texto.includes(', Lucía')) && d.plan && ej.mezcla.length < 25) ej.mezcla.push({ texto: d.texto, plan: d.plan });
    const empezo = ev.some(e => e[1] === 'mp3' || e[1] === 'tts');
    if (!empezo && fin - d.t > 1500) { res.mudas++; if (ej.mudas.length < 15) ej.mudas.push({ texto: d.texto, escena: d.escena, ms: fin - d.t }) }
    const corte = ev.find(e => e[1] === 'mp3-corte' || e[1] === 'tts-corte');
    if (corte && i + 1 < D.length && corte[0] >= D[i + 1].t - 5) { }
    // ¿la cortó la siguiente frase? (hubo audio de esta frase y la siguiente empezó antes de que acabara)
    const termino = ev.some(e => e[1] === 'mp3-fin' || e[1] === 'tts-fin') && !ev.some(e => e[1] === 'mp3-corte' || e[1] === 'tts-corte');
    const toco = ev.some(e => e[1] === 'toque');
    if (empezo && !termino && i + 1 < D.length && !toco) { res.cortadas++; const dur = fin - d.t; if (dur < 1200) res.cortadasPronto++; if (ej.cortadas.length < 25) ej.cortadas.push({ texto: d.texto, siguiente: D[i + 1].texto, oidoMs: dur, escena: d.escena }) }
    if (empezo && !termino && i + 1 < D.length && toco) res.cortadasPorToque++;
    if (ev.some(e => e[1] === 'mp3-rechazo')) res.rechazos++;
    if (ev.some(e => e[1] === 'mp3-error')) { res.falloMp3++; if (ej.falloMp3.length < 10) ej.falloMp3.push(d.texto) }
    // callback antes de acabar el audio: el juego siguió (y quizá habló otra vez) mientras Tito aún hablaba
    if (d.cbT != null) { const finAudio = ev.filter(e => e[1] === 'mp3-fin' || e[1] === 'tts-fin').map(e => e[0]).pop(); if (empezo && (finAudio == null || d.cbT < finAudio - 50) && termino) { res.cbAntes++; if (ej.cbAntes.length < 15) ej.cbAntes.push({ texto: d.texto, cbMs: d.cbT - d.t, finMs: finAudio != null ? finAudio - d.t : null }) } }
  }
  // Solapes: voz del navegador y MP3 sonando a la vez.
  let mp3On = false, ttsOn = false;
  for (const e of EV) { if (e[1] === 'mp3') mp3On = true; if (e[1] === 'mp3-fin' || e[1] === 'mp3-corte' || e[1] === 'mp3-error') mp3On = false; if (e[1] === 'tts') { ttsOn = true; if (mp3On) res.solapes++ } if (e[1] === 'tts-fin' || e[1] === 'tts-corte') ttsOn = false; if (e[1] === 'mp3' && ttsOn) res.solapes++ }
  console.log(JSON.stringify(res));
  fs.writeFileSync(path.join(L.SAL, nombre + '-resumen.json'), JSON.stringify({ res, ej }, null, 1));
  const pc = n => Math.round(100 * n / Math.max(1, res.total)) + '%';
  R.bien(nombre + '-reparto', `${res.total} frases: ${res.mp3} con MP3 (${pc(res.mp3)}), ${res.mezcla} mezcladas MP3 + voz del navegador (${pc(res.mezcla)}), ${res.tts} solo voz del navegador (${pc(res.tts)})`);
  if (res.cortadas) R.apuntar(nombre + '-cortadas', res.cortadasPronto > 5 ? 'alta' : 'media', `${res.cortadas} frases (${pc(res.cortadas)}) se cortan solas (el juego empieza otra frase antes de que acabe, sin que el niño toque); ${res.cortadasPronto} se cortan en menos de 1,2 s`, ej.cortadas.slice(0, 12));
  if (res.mudas) R.apuntar(nombre + '-mudas', 'alta', `${res.mudas} frases no sonaron (ni MP3 ni voz del navegador)`, ej.mudas);
  if (res.solapes) R.apuntar(nombre + '-solapes', 'alta', `${res.solapes} veces suenan a la vez un MP3 y la voz del navegador`);
  if (res.falloMp3 || res.rechazos) R.apuntar(nombre + '-fallos', 'alta', `${res.falloMp3} MP3 con error y ${res.rechazos} reproducciones rechazadas`, ej.falloMp3);
  if (res.cbAntes) R.apuntar(nombre + '-adelanto', 'media', `${res.cbAntes} frases dan paso al juego antes de que acabe el audio (temporizador de seguridad)`, ej.cbAntes);
  if (res.mezcla) R.apuntar(nombre + '-mezcla', 'media', `${res.mezcla} frases mezclan voz grabada y voz del navegador dentro de la misma frase`, ej.mezcla.slice(0, 15));
  if (p.errs.length) R.apuntar(nombre + '-errores', 'alta', `${p.errs.length} errores de JavaScript`, [...new Set(p.errs)].slice(0, 8));
  R.guardar(); await b.close(); srv.close(); process.exit(0);
})();
