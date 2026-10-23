# Curiolandia 3D

Juego de temas de Educación Infantil (3, 4 y 5 años) en 3D, con Tito como guía y sus voces grabadas.

Jugar: https://fercala.github.io/curiolandia-3d/

Se puede instalar en el móvil o el ordenador (menú del navegador → "Instalar" o "Añadir a pantalla de inicio") y funciona sin conexión.

## Para programadores

El juego es HTML + JavaScript puro (sin npm ni frameworks) con Three.js r128 para el 3D. El código fuente está en `src/` y todo está comentado en castellano.

Empieza por aquí:

| Documento | Qué cuenta |
|---|---|
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Cómo está hecho el juego: archivos, escenas, capa 3D, flujo del niño, recompensas. **Léelo primero.** |
| [docs/COMO-AGREGAR.md](docs/COMO-AGREGAR.md) | El proceso de trabajo (montar, probar, publicar) y recetas paso a paso: objeto 3D, tema, juego, cuento, dibujo, tienda, escena, zona de adultos. |
| [docs/ESTADO-GUARDADO.md](docs/ESTADO-GUARDADO.md) | El estado `S` que se guarda en el móvil y cómo no romper las partidas. |
| [docs/VOCES.md](docs/VOCES.md) | Cómo habla Tito, las frases grabadas y cómo grabar frases nuevas. |
| [docs/POLITICA-DOCUMENTACION.md](docs/POLITICA-DOCUMENTACION.md) | **Obligatoria**: qué hay que documentar en cada cambio y cómo se comprueba. |
| [docs/CAMBIOS.md](docs/CAMBIOS.md) | Registro de cambios de cada versión publicada. |
| [dialogos/LEEME.md](dialogos/LEEME.md) | Todos los diálogos de Tito (`todos.csv`) y los pendientes de grabar (`pendientes.txt`). |
| [docs/PROBLEMAS-CONOCIDOS.md](docs/PROBLEMAS-CONOCIDOS.md) | Fallos y rarezas detectados que aún no se han arreglado. |
| [CLAUDE.md](CLAUDE.md) | Resumen de reglas para trabajar con Claude Code. |

### Arranque rápido

```sh
mkdir -p src/web
cp -r fonts voz voz-fer icon-*.png apple-touch-icon.png src/web/   # solo la primera vez
sh src/build.sh && python3 src/build_web.py
cd src/web && python3 -m http.server 8000                           # abre http://localhost:8000
```

Prueba automática (necesita Playwright): `node tests/humo.js src/web`.

Comprobación de comentarios: `python3 tests/comentarios.py`. Para que se ejecute sola en cada commit: `git config core.hooksPath herramientas/git-hooks`.

### Cuatro reglas de oro

1. Evita cambiar el texto de una frase que ya diga `say()` (cada una tiene su MP3 grabado), y apunta cada diálogo nuevo o cambiado en [`dialogos/pendientes.txt`](dialogos/LEEME.md).
2. No cambies el estado guardado `S` de forma incompatible: hay partidas guardadas en los móviles.
3. Sube `VER` en `src/build_web.py` cada vez que publiques.
4. Ningún cambio está terminado hasta que está documentado: comentarios en el código, `docs/` y `docs/CAMBIOS.md` (ver [la política](docs/POLITICA-DOCUMENTACION.md)).
