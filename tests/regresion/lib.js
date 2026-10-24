// Utilidades comunes de las pruebas de regresión (tests/regresion/*.js).
// Sirven la web por http, abren páginas de Chromium con la hora y la fecha que se quiera, recogen los errores de
// JavaScript y "juegan" siguiendo la ayuda de cada escena (scene.hint()), como haría un niño al que se le señala.
const path = require('path'), fs = require('fs'), http = require('http');
let pw; try { pw = require('playwright') } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright') }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

// servir(raiz): servidor http mínimo para la carpeta de la web. Devuelve {port, close()}.
function servir(raiz) {
  const srv = http.createServer((q, r) => {
    let ruta = decodeURIComponent(q.url.split('?')[0]);
    if (ruta.endsWith('/')) ruta += 'index.html'; // la URL usa / también en Windows
    const f = path.join(raiz, ruta);
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d) });
  }).listen(0);
  return { get port() { return srv.address().port }, close: () => srv.close() };
}

// navegador(): Chromium sin ventana con WebGL por software (swiftshader), como en humo.js.
const navegador = () => pw.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });

// abrir(b, port, o): abre el juego en una página nueva y espera a que cargue. Opciones de o:
//   hora (0-23) y fecha ('AAAA-MM-DD'): fijan el reloj del juego; ancho/alto: tamaño de la ventana; tactil: pantalla táctil;
//   guardado: objeto que se escribe en localStorage antes de cargar (null = partida nueva); crudo: texto tal cual para
//   localStorage; antes: función que se ejecuta en la página antes del juego (addInitScript); rapido: window.__fast.
// Devuelve la página con p.errs (lista de errores de JavaScript y de consola).
async function abrir(b, port, o = {}) {
  const ctx = await b.newContext({ viewport: { width: o.ancho || 1280, height: o.alto || 720 }, hasTouch: !!o.tactil, isMobile: !!o.tactil });
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => p.errs.push(String(e).split('\n')[0]));
  p.on('console', m => { if (m.type() === 'error' && !/404|ERR_|Failed to load resource/.test(m.text())) p.errs.push('consola: ' + m.text().slice(0, 200)) });
  await p.addInitScript(([hora, fecha, rapido]) => {
    if (fecha || hora != null) {
      const D0 = Date, base = fecha ? new D0(fecha + 'T' + String(hora != null ? hora : 11).padStart(2, '0') + ':00:00').getTime() : null;
      const t0 = D0.now();
      // Reloj falso: empieza en la fecha/hora pedida y avanza al ritmo real.
      const ahora = () => base != null ? base + (D0.now() - t0) : (() => { const d = new D0(); d.setHours(hora, d.getMinutes()); return d.getTime() })();
      class FD extends D0 { constructor(...a) { if (a.length) super(...a); else super(ahora()) } static now() { return ahora() } }
      window.Date = FD;
    }
    if (rapido) window.__fast = 1;
  }, [o.hora, o.fecha, o.rapido !== false]);
  if (o.guardado !== undefined || o.crudo !== undefined) {
    await p.addInitScript(([g, c]) => { try { if (!sessionStorage.getItem('__puesto')) { sessionStorage.setItem('__puesto', '1'); localStorage.clear(); if (c !== undefined && c !== null) localStorage.setItem('curiolandia.v1', c); else if (g) localStorage.setItem('curiolandia.v1', JSON.stringify(g)) } } catch (e) { } }, [o.guardado, o.crudo]);
  }
  if (o.antes) await p.addInitScript(o.antes);
  await p.goto(`http://localhost:${port}/index.html`);
  await p.waitForTimeout(o.espera || 2000);
  // __cl.go guarda el go() de antes de que world3d.js lo envuelva: sin el envoltorio, al saltar de una escena 3D a un
  // juego no se restaura el rectángulo 2D de Tito (TITO) y los toques donde estaba Tito en 3D se toman por toques a Tito.
  await p.evaluate(() => { if (window.__cl) __cl.go = (n, o) => go(n, o) }).catch(() => { });
  return p;
}

// paso(p): un toque siguiendo la ayuda de la escena actual (hint): toque simple, arrastre (dx, dy) o recorrido (path).
// Si la escena no da ayuda, toca al azar con probabilidad azar (0-1). Devuelve la ayuda usada o null.
async function paso(p, azar = 0.3) {
  return p.evaluate((azar) => {
    const sc = __cl.scene; if (!sc) return null;
    const marca = () => { if (window.__ev) __ev.push([__now(), 'toque']) };// para audio.js: distinguir cortes por toques
    let h = null; try { h = sc.hint && sc.hint() } catch (e) { return { err: String(e) } }
    if (!h) { if (Math.random() < azar) { marca(); const x = 150 + Math.random() * 1300, y = 120 + Math.random() * 680; sc.down && sc.down(x, y); sc.up && sc.up(x, y) } return null }
    marca();
    if (h.path) { sc.down && sc.down(h.x, h.y); for (const q of h.path) sc.move && sc.move(q[0], q[1]); const l = h.path[h.path.length - 1]; sc.up && sc.up(l[0], l[1]) }
    else if (h.dx != null || h.dy != null) { const dx = h.dx || 0, dy = h.dy || 0; sc.down && sc.down(h.x, h.y); for (let i = 1; i <= 8; i++) sc.move && sc.move(h.x + dx * i / 8, h.y + dy * i / 8); sc.up && sc.up(h.x + dx, h.y + dy) }
    else { sc.down && sc.down(h.x, h.y); sc.up && sc.up(h.x, h.y) }
    return { x: Math.round(h.x), y: Math.round(h.y) };
  }, azar);
}

// aPantalla(p, x, y): pasa coordenadas lógicas del juego (1600x900) a píxeles de la ventana (usa SC, OX, OY de core.js).
const aPantalla = (p, x, y) => p.evaluate(([x, y]) => [OX + x * SC, OY + y * SC], [x, y]);
// clic(p, x, y): toque de verdad con el ratón (pasa por los eventos pointer del lienzo, el candado de adultos, etc.).
async function clic(p, x, y) { const [a, b] = await aPantalla(p, x, y); await p.mouse.click(a, b) }
// arrastrar(p, x1, y1, x2, y2): arrastre de verdad con el ratón, en 10 pasos.
async function arrastrar(p, x1, y1, x2, y2) { const [a, b] = await aPantalla(p, x1, y1), [c, d] = await aPantalla(p, x2, y2); await p.mouse.move(a, b); await p.mouse.down(); await p.mouse.move(c, d, { steps: 10 }); await p.mouse.up() }
// pasoReal(p): como paso(), pero con el ratón de verdad (más lento; para los recorridos de punta a punta).
async function pasoReal(p, azar = 0.3) {
  const h = await p.evaluate(() => { const sc = __cl.scene; try { const h = sc && sc.hint && sc.hint(); return h ? { x: h.x, y: h.y, dx: h.dx, dy: h.dy, path: h.path && h.path.slice(0, 40) } : null } catch (e) { return { err: String(e) } } });
  if (h && h.err) return h;
  if (!h) { if (Math.random() < azar) await clic(p, 150 + Math.random() * 1300, 120 + Math.random() * 640); return null }
  if (h.path) { const [a, b] = await aPantalla(p, h.x, h.y); await p.mouse.move(a, b); await p.mouse.down(); for (const q of h.path) { const [c, d] = await aPantalla(p, q[0], q[1]); await p.mouse.move(c, d) } await p.mouse.up() }
  else if (h.dx != null || h.dy != null) await arrastrar(p, h.x, h.y, h.x + (h.dx || 0), h.y + (h.dy || 0));
  else await clic(p, h.x, h.y);
  return h;
}

// conducir(p, hasta, ms, o): da pasos hasta que hasta() (función evaluada en la página) sea verdad o pasen ms
// milisegundos. o.esperarVoz: antes de cada toque espera a que Tito calle. o.real: con el ratón de verdad (pasoReal). o.azar: probabilidad de tocar al azar cuando no hay ayuda; o.cada: cada cuántos pasos se toca al azar
// aunque haya ayuda (para destrabar). Devuelve true si se cumplió.
async function conducir(p, hasta, ms, o = {}) {
  const t0 = Date.now(); let k = 0;
  while (Date.now() - t0 < ms) {
    if (await p.evaluate(hasta)) return true;
    // Como un niño que escucha: espera a que Tito termine de hablar (máximo 12 s) y un momento más antes de tocar.
    if (o.esperarVoz) { const t1 = Date.now(); while (Date.now() - t1 < 12000 && await p.evaluate(() => talking)) await p.waitForTimeout(150); await p.waitForTimeout(400) }
    const f = o.real ? pasoReal : paso;
    const h = (o.cada && k++ % o.cada === o.cada - 1) ? await f(p, 1).then(() => null) : await f(p, o.azar == null ? 0.3 : o.azar);
    await p.waitForTimeout(h ? 220 : 300);
  }
  return !!(await p.evaluate(hasta));
}

// estado(p): resumen del juego para los informes: escena, edad, temas terminados, monedas, estrellas.
const estado = p => p.evaluate(() => { const S = __cl.S; return { escena: __cl.name, edad: S.age, temas: Object.entries(S.temas).filter(([, t]) => t && t.done).map(([k]) => k), monedas: S.coins, juegos: Object.values(S.temas).reduce((a, t) => a + ((t && t.g) ? Object.values(t.g).filter(Boolean).length : 0), 0) } });

// Hallazgos: cada prueba apunta lo que encuentra con apuntar(id, gravedad, titulo, detalle) y al final se escribe en
// tests/regresion/salida/<prueba>.json; informe.py los junta en docs/PRUEBAS-REGRESION.md.
const SAL = path.join(__dirname, 'salida'); fs.mkdirSync(SAL, { recursive: true });
function registro(nombre) {
  const hs = [], ok = [];
  return {
    apuntar(id, gravedad, titulo, detalle) { hs.push({ id, gravedad, titulo, detalle }); console.log('  ✗', gravedad, id, titulo, detalle ? JSON.stringify(detalle).slice(0, 300) : '') },
    bien(id, titulo) { ok.push({ id, titulo }); console.log('  ✓', id, titulo) },
    guardar() { fs.writeFileSync(path.join(SAL, nombre + '.json'), JSON.stringify({ prueba: nombre, fecha: new Date().toISOString(), hallazgos: hs, bien: ok }, null, 1)); return hs.length },
    captura: (p, f) => p.screenshot({ path: path.join(SAL, f) }).catch(() => { }),
  };
}

module.exports = { servir, navegador, abrir, paso, pasoReal, clic, arrastrar, conducir, estado, registro, SAL };

