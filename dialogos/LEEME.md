# Diálogos de Tito

Aquí están **todas las frases que dice Tito**, para saber qué falta grabar y para poder traducir el juego algún día.

| Archivo | Qué es |
|---|---|
| `pendientes.txt` | **Diálogos pendientes de grabar**: una frase por línea, con el texto exacto que dice Tito (castellano de España, ya pasado por `tx()`, sin el nombre del niño). Es la lista que lee `herramientas/voces/generar-curiolandia-nuevas.bat`. |
| `todos.csv` | **Catálogo de todos los diálogos**, grabados y pendientes. Se rehace con `python3 herramientas/voces/dialogos.py`. |
| `informe-sin-voz.md` | Informe de la revisión del 22 de octubre de 2026 (v1.580): qué frases se oían sin voz grabada, cuáles llevan el nombre del niño y cómo se arman fechas, monedas y números con piezas. |

## Columnas de `todos.csv`

| Columna | Qué es |
|---|---|
| `id` | Primeras 12 letras del md5 del texto. Es el mismo nombre que el `.wav`/`.mp3` de la grabación. |
| `texto` | La frase tal como la dice Tito. |
| `estado` | `grabada` (está en `voz/manifest.json`), `pendiente` (está en `pendientes.txt` y aún no se ha grabado) o `regrabar` (grabada, pero salió mal y está otra vez en `pendientes.txt`). |
| `fer` | `sí` si también está grabada en la Voz de Fer (`voz-fer/`). |
| `tipo` | `frase`; `pieza` (trozo en minúsculas sin signos que se junta con números, ver `vozPieces` en `core.js`); `numero` (0-100 y centenas). |
| `donde` | Pantalla o juego donde se oye (`3A-T1#2` = tema 3A-T1, juego 3; `escena map` = el mapa), si se sabe. |
| `mp3` | Archivo de la voz principal, si está grabada. |

## Regla: cada diálogo nuevo o cambiado se apunta

Cada vez que una mejora **añade una frase nueva** o **cambia el texto de una que ya existía**:

1. Apunta el texto nuevo, exacto y en castellano de España, al final de `pendientes.txt` (una línea por frase; sin el nombre del niño; si va detrás de una felicitación como "¡Muy bien!", sin la felicitación). Para copiar el texto exacto: en la consola del juego, `window.__fast=1; window.__said=[]`, juega esa parte y mira `__said`.
2. Si la frase lleva números que cambian, ponlos en una oración aparte y apunta las **piezas** nuevas (ver [docs/VOCES.md](../docs/VOCES.md)).
3. Ejecuta `python3 herramientas/voces/dialogos.py` para que `todos.csv` quede al día, y súbelo en el mismo commit.

El gancho de git (`herramientas/git-hooks/pre-commit`) para el commit si el texto de alguna llamada a `say()` de `src/` es nuevo o cambia (lo mira `herramientas/git-hooks/frases_diff.py`) y no tocas `pendientes.txt`, o si `todos.csv` no está al día.

Mientras una frase no esté grabada, **la dice la voz del navegador**; si solo falta un trozo, el resto suena con la voz grabada. Cambiar el texto de una frase grabada hace que deje de sonar su grabación hasta que se grabe la nueva.

## Después de grabar

Cuando Fernando graba la lista: se generan los MP3 y el manifiesto (`docs/VOCES.md`, apartado 5), se quitan de `pendientes.txt` las frases ya grabadas y se ejecuta `dialogos.py`: pasan a `grabada`.

## Para traducir a otro idioma

`todos.csv` es la lista de todo lo que hay que traducir (columna `texto`). Hoy el texto vive dentro del código (en `src/`, en su mayoría en rioplatense, y `tx()` lo pasa a castellano de España), así que traducir el juego pedirá además una mejora del código: buscar cada frase en una tabla por idioma usando el `id`, y grabar una carpeta de voz por idioma con el mismo sistema (`voz-<idioma>/manifest.json`). Lo que no esté grabado lo dirá la voz del navegador en ese idioma.
