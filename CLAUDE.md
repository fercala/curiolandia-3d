# Curiolandia 3D

Juego de temas de Educación Infantil (3, 4 y 5 años) con Tito como guía. HTML + JavaScript sin dependencias ni npm; Three.js r128 para la capa 3D.

## Estructura
- `src/`: el código fuente. Los `.js` se concatenan en un solo HTML (orden en `src/build.sh`).
  - `world3d.js`: toda la capa 3D (mapa, zonas, casitas, cofre, portada). Proyecta cada cuadro las posiciones 3D a la pantalla 2D de 1600x900 para que la lógica 2D original funcione sin cambios.
  - `core.js` (estado `S`, sonido, voz `say()`), `scenes.js`, `zonas.js`, `tienda.js`, `adult.js` (zona de adultos), `temas*.js`/`cuentos.js`/`comps*.js` (juegos), `pics-*.js` (dibujos).
- Raíz del repo: la web publicada en GitHub Pages (`index.html`, `sw.js`, `manifest.webmanifest`, `three.min.js`, iconos, `fonts/`, `voz/` y `voz-fer/` con los MP3 grabados).

## Montar y publicar
```sh
mkdir -p src/web
sh src/build.sh            # src/artifact.html y src/index.html
python3 src/build_web.py   # src/web/index.html, sw.js, manifest
cp src/web/index.html src/web/sw.js src/web/manifest.webmanifest .
```
Antes, sube `VER` en `src/build_web.py` (`curiolandia3d-v1.N`): es el nombre de la caché del service worker, y sin cambiarlo los móviles siguen con la versión vieja. Los archivos montados dentro de `src/` están en `.gitignore`.

## Documentación (obligatoria en cada cambio)
Sigue `docs/POLITICA-DOCUMENTACION.md` en cada modificación, por pequeña que sea: comentario de cabecera en cada función nueva o cambiada (y dentro de la lógica compleja), los documentos de `docs/` que toque el cambio y una entrada en `docs/CAMBIOS.md`. Antes de cada commit, `python3 tests/comentarios.py` debe dar TODO BIEN. Un cambio sin documentar no se publica.

La guía completa está en `docs/`: `ARQUITECTURA.md` (cómo está hecho), `COMO-AGREGAR.md` (proceso y recetas), `ESTADO-GUARDADO.md` (campos de `S`), `VOCES.md` (frases grabadas) y `PROBLEMAS-CONOCIDOS.md`. Todo el código de `src/` lleva comentarios de cabecera en cada función: mantenlos al día cuando cambies algo y comenta igual las funciones nuevas.

## Reglas
- Evita cambiar el texto de una frase que ya diga `say()`: cada frase tiene su MP3 grabado (`voz/manifest.json`, `voz-fer/manifest.json`) y si cambia el texto se pierde el audio hasta que se regrabe. Si hay que cambiarla, o es nueva, se escribe en castellano de España y se apunta en `dialogos/pendientes.txt`.
- No cambies el estado guardado `S` de forma incompatible: hay partidas guardadas en los móviles.
- Cada diálogo nuevo o cambiado se apunta en `dialogos/pendientes.txt` y se rehace el catálogo `dialogos/todos.csv` con `python3 herramientas/voces/dialogos.py` (ver `dialogos/LEEME.md`). Lo que no esté grabado lo dice la voz del navegador.
- Para probar, abre `src/web/index.html` con un servidor local (por ejemplo `python3 -m http.server`) y ejecuta `node tests/humo.js src/web`.
