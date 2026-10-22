# Auditoría de voces

Busca todas las frases que dice Tito y que no tienen MP3 grabado, y prepara la lista para grabarlas.

```sh
# desde la raíz del repo, con la web montada en src/web (copia también voz/ y voz-fer/ dentro)
sh herramientas/voces/auditoria/auditar.sh src/web
```

Necesita Node.js y Playwright (igual que `tests/humo.js`). Tarda cerca de una hora y deja todo en `salida/` (está en `.gitignore`):

- `frases-nuevas.txt`: lo que hay que grabar, una frase por línea. Se copia (o se añade) a `../frases-curiolandia-nuevas.txt` y se graba como dice [docs/VOCES.md](../../../docs/VOCES.md).
- `lista.json`: lo mismo por secciones y con dónde se oyó cada frase (`grabar`, `fijas_con_numero`, `piezas`, `numeros`, `nombre`, `variables`, `fer_solo`).

## Cómo funciona

1. `crawl.js` juega cada juego de cada tema siguiendo `hint()` (la ayuda), con algún toque al azar para oír también los fallos. `scenes.js` recorre portada, mapa, zonas, casitas, cofre, tienda, casa, álbum y repaso, y toca los objetos 3D. `asam.js` repite la asamblea en varias fechas (días, meses, estaciones, día y noche). `variants.js` escribe las frases de la tienda para cada artículo. Todos ponen el nombre "Lucía" y guardan cada `say()` ya pasado por `tx()`.
2. `lista.py` quita el nombre, parte las frases en oraciones como `vozFile()` (core.js) y busca qué trozos faltan en `voz/manifest.json`. Las felicitaciones (`¡Muy bien!`, `¡Genial!`…) ya están grabadas, así que se graba solo lo que va detrás.
3. Las oraciones con números (fechas, monedas, estrellas) no se graban enteras: se graban piezas (`hoy es jueves`, `de octubre`, `tienes`, `monedas`…) y los números del 0 al 100 más las centenas, y `vozPieces()` las junta al hablar. Las que tienen un número fijo (precios de la tienda, "los 4 años") sí se graban enteras.

Límites: el robot no siempre termina todos los juegos (unos 15 se quedan a medias) y las frases al azar pueden tener combinaciones que no salieron. Lo que falte lo dice la voz del navegador.
