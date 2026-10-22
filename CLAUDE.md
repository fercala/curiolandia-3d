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

## Documentación
La guía completa está en `docs/`: `ARQUITECTURA.md` (cómo está hecho), `COMO-AGREGAR.md` (proceso y recetas), `ESTADO-GUARDADO.md` (campos de `S`), `VOCES.md` (frases grabadas) y `PROBLEMAS-CONOCIDOS.md`. Todo el código de `src/` lleva comentarios de cabecera en cada función: mantenlos al día cuando cambies algo y comenta igual las funciones nuevas.

## Reglas
- No cambies el texto de ninguna frase que ya diga `say()`: cada frase tiene su MP3 grabado (`voz/manifest.json`, `voz-fer/manifest.json`) y si cambia el texto se pierde el audio. Las frases nuevas se escriben en castellano de España y se apuntan para grabarlas.
- No cambies el estado guardado `S` de forma incompatible: hay partidas guardadas en los móviles.
- Las frases nuevas se apuntan en `herramientas/voces/frases-curiolandia-nuevas.txt` para grabarlas.
- Para probar, abre `src/web/index.html` con un servidor local (por ejemplo `python3 -m http.server`) y ejecuta `node tests/humo.js src/web`.
