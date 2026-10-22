# Registro de cambios

Cada versión publicada añade una entrada arriba del todo (ver [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md), apartado 1.3). Las versiones anteriores a la v1.579 están en el historial de git (`git log`).

## v1.580 (2026-10-22)
- Para el niño: si la familia ha puesto su nombre, Tito lo dice (con la voz del navegador) antes de la frase grabada; antes, con voz grabada, el nombre se perdía. Las frases que solo están grabadas en parte ya no pasan enteras a la voz del navegador: lo grabado suena con la voz grabada y solo lo que falta con la del navegador. Las fechas, monedas y estrellas se arman con piezas grabadas (cuando se graben).
- Por dentro (`core.js`): `vozFile` devuelve un plan de trozos (mp3 o `{t}` para la voz del navegador), busca el trozo grabado más largo de izquierda a derecha y usa `vozPieces`/`vozNum` para las oraciones con números; `vozSeq` reproduce el plan; `sayTTS` dice el nombre y los trozos sin grabar; `vozGet` descarga un mp3 una sola vez.
- Herramienta nueva `herramientas/voces/auditoria/` (busca todas las frases sin voz) y lista de 1.097 frases y piezas pendientes de grabar en `herramientas/voces/frases-curiolandia-nuevas.txt`.
- Política de documentación obligatoria ([POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md)), comprobación automática de comentarios (`tests/comentarios.py`), gancho de git que la ejecuta en cada commit (`herramientas/git-hooks/pre-commit`) y plantilla de pull request con la lista de documentación.

## v1.579 (2026-10-22)
- Para el niño: nada cambia.
- Por dentro: todo el código de `src/` comentado (cabecera de cada archivo y de cada función, y comentarios dentro de la lógica complicada). Documentación nueva en `docs/`, README, prueba de escenas `tests/humo.js` y scripts de voces en `herramientas/voces/`.
