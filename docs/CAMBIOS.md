# Registro de cambios

Cada versión publicada añade una entrada arriba del todo (ver [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md), apartado 1.3). Las versiones anteriores a la v1.579 están en el historial de git (`git log`).

## Sin publicar
- Política de documentación obligatoria ([POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md)), comprobación automática de comentarios (`tests/comentarios.py`), gancho de git que la ejecuta en cada commit (`herramientas/git-hooks/pre-commit`) y plantilla de pull request con la lista de documentación. El juego no cambia.

## v1.579 (2026-10-22)
- Para el niño: nada cambia.
- Por dentro: todo el código de `src/` comentado (cabecera de cada archivo y de cada función, y comentarios dentro de la lógica complicada). Documentación nueva en `docs/`, README, prueba de escenas `tests/humo.js` y scripts de voces en `herramientas/voces/`.
