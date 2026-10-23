// Espía del audio para las pruebas (audio.js, audio-espera.js). Se ejecuta en la página antes que el juego.
// Se ejecuta en la página antes que el juego: voz del navegador falsa y registro de todo lo que suena.
module.exports = function espia() {
  const t0 = performance.now(), now = () => Math.round(performance.now() - t0);
  const EV = window.__ev = [];
  // Voz del navegador falsa: "habla" 70 ms por letra (más o menos como la real a 0,9) y avisa al acabar.
  // cancel() corta la frase actual con onerror('interrupted'), como Chrome.
  let cur = null, tm = null; const q = [];
  const fin = (ev) => { if (!cur) return; const u = cur; cur = null; clearTimeout(tm); EV.push([now(), ev === 'end' ? 'tts-fin' : 'tts-corte', u.text]); (ev === 'end' ? u.onend : u.onerror) && (ev === 'end' ? u.onend : u.onerror)({ error: 'interrupted' }); sig() };
  const sig = () => { if (cur || !q.length) return; cur = q.shift(); EV.push([now(), 'tts', cur.text]); tm = setTimeout(() => fin('end'), 300 + cur.text.length * 70) };
  const voces = [{ name: 'Falsa España', lang: 'es-ES', localService: true }, { name: 'Falsa Argentina', lang: 'es-AR', localService: true }, { name: 'Falsa English', lang: 'en-GB', localService: true }];
  const SS = { speak(u) { q.push(u); sig() }, cancel() { q.length = 0; if (cur) fin('cancel') }, pause() { }, resume() { }, getVoices: () => voces, get speaking() { return !!cur }, get pending() { return q.length > 0 }, onvoiceschanged: null, addEventListener() { } };
  Object.defineProperty(window, 'speechSynthesis', { value: SS, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.rate = 1; this.pitch = 1; this.volume = 1 };
  // MP3: qué archivo es cada blob, y cuándo empieza, acaba o se para cada uno.
  const BN = new Map(), of = window.fetch;
  window.fetch = function (u, ...a) { return of.call(this, u, ...a).then(r => { if (/voz(-fer)?\/[0-9a-f]+\.mp3/.test(String(u))) { const r2 = r.clone(); r2.__n = String(u).split('/').pop(); const b0 = r2.blob.bind(r2); r2.blob = () => b0().then(b => { BN.set(b, r2.__n); return b }); return r2 } return r }) };
  const cu = URL.createObjectURL; URL.createObjectURL = function (b) { const u = cu.call(URL, b); if (BN.has(b)) BN.set(u, BN.get(b)); return u };
  const nm = el => BN.get(el.src) || el.src.slice(-12);
  const pl = HTMLMediaElement.prototype.play, pa = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.play = function () { if (!this.__w) { this.__w = 1; this.addEventListener('ended', () => EV.push([now(), 'mp3-fin', nm(this)])); this.addEventListener('error', () => EV.push([now(), 'mp3-error', nm(this)])) } EV.push([now(), 'mp3', nm(this), this.duration]); const p = pl.call(this); if (p) p.catch(e => EV.push([now(), 'mp3-rechazo', nm(this), String(e).slice(0, 60)])); return p };
  HTMLMediaElement.prototype.pause = function () { if (!this.paused && !this.ended) EV.push([now(), 'mp3-corte', nm(this)]); return pa.call(this) };
  window.__now = now;
}
