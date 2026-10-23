# Registro de cambios

Cada versión publicada añade una entrada arriba del todo (ver [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md), apartado 1.3). Las versiones anteriores a la v1.579 están en el historial de git (`git log`).

## v1.582 (2026-10-23)
- Para el niño: en el cofre, al tocar el cangrejo Tito dice «uno» una sola vez; antes contaba dos veces seguidas. Sin frases nuevas.
- Por dentro (`world3d.js`, rama `u.crab` de `wobTap`): el grupo del mapa (`map4`) solo cuenta en el mapa; en el cofre cuenta solo `cof2`.

## v1.581 (2026-10-23)
- Para el niño: al tocar una abeja, Tito dice «La abeja. Hace miel con las flores.» y escribe ABEJA; antes decía «La mariposa.». Frase ya grabada, sin frases nuevas.
- Por dentro (`world3d.js`): en `NAMES3` la fila `bee` va antes que `bfly` (las abejas llevan las dos marcas y gana la primera); `allTap` con `'bfly'` ya no cuenta las abejas como mariposas.
- Gancho de git: ya no para el commit por tocar una línea que habla si la frase no cambia; ahora compara los textos de `say()` antes y después (`herramientas/git-hooks/frases_diff.py`).

### Publicado junto con la v1.581
- Carpeta `dialogos/`: `pendientes.txt` (diálogos por grabar, 1.130: los 1.097 nuevos más 33 por regrabar) y `todos.csv` (catálogo de los 3.281 diálogos, grabados y pendientes, para grabar y para traducir algún día), con `herramientas/voces/dialogos.py` para rehacerlo. Cada diálogo nuevo o cambiado se apunta ahí; el gancho de git lo comprueba. El juego no cambia.
- `dialogos/informe-sin-voz.md`: el informe de la revisión de frases sin voz, que antes solo estaba en la carpeta del proyecto.

## v1.580 (2026-10-22)
- Para el niño: si la familia ha puesto su nombre, Tito lo dice (con la voz del navegador) antes de la frase grabada; antes, con voz grabada, el nombre se perdía. Las frases que solo están grabadas en parte ya no pasan enteras a la voz del navegador: lo grabado suena con la voz grabada y solo lo que falta con la del navegador. Las fechas, monedas y estrellas se arman con piezas grabadas (cuando se graben).
- Por dentro (`core.js`): `vozFile` devuelve un plan de trozos (mp3 o `{t}` para la voz del navegador), busca el trozo grabado más largo de izquierda a derecha y usa `vozPieces`/`vozNum` para las oraciones con números; `vozSeq` reproduce el plan; `sayTTS` dice el nombre y los trozos sin grabar; `vozGet` descarga un mp3 una sola vez.
- Herramienta nueva `herramientas/voces/auditoria/` (busca todas las frases sin voz) y lista de 1.097 frases y piezas pendientes de grabar (ahora en `dialogos/pendientes.txt`).
- Política de documentación obligatoria ([POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md)), comprobación automática de comentarios (`tests/comentarios.py`), gancho de git que la ejecuta en cada commit (`herramientas/git-hooks/pre-commit`) y plantilla de pull request con la lista de documentación.

## v1.579 (2026-10-22)
- Para el niño: nada cambia.
- Por dentro: todo el código de `src/` comentado (cabecera de cada archivo y de cada función, y comentarios dentro de la lógica complicada). Documentación nueva en `docs/`, README, prueba de escenas `tests/humo.js` y scripts de voces en `herramientas/voces/`.
