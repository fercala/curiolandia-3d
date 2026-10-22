#!/bin/sh
# auditar.sh: busca todas las frases que dice Tito y que no tienen voz grabada. Ver LEEME.md.
# Uso, desde la raíz del repo y con la web montada en src/web (con voz/ y voz-fer/ dentro):
#   sh herramientas/voces/auditoria/auditar.sh src/web
# Tarda bastante (cerca de una hora): juega cada juego siguiendo la ayuda, recorre las escenas de día y de noche,
# repite la asamblea en 14 fechas y saca las frases de la tienda. Deja todo en herramientas/voces/auditoria/salida/.
set -e
WEB=$(cd "$1" && pwd); D=$(cd "$(dirname "$0")" && pwd); mkdir -p "$D/salida"; cd "$D/salida"
for w in 0 1 2; do node "$D/crawl.js" "$WEB" $w 3 g$w.json > g$w.log 2>&1 & done
node "$D/scenes.js" "$WEB" 11 sc11.json > sc11.log 2>&1 &
wait
node "$D/scenes.js" "$WEB" 22 sc22.json > sc22.log 2>&1 &
node "$D/asam.js" "$WEB" scA.json 2026-01-05T11,2026-02-10T22,2026-03-18T11,2026-04-23T22,2026-05-29T11,2026-06-06T22,2026-07-12T11 > scA.log 2>&1 &
node "$D/asam.js" "$WEB" scB.json 2026-08-14T22,2026-09-16T11,2026-10-21T22,2026-11-26T11,2026-12-31T22,2026-12-20T11,2026-03-01T11 > scB.log 2>&1 &
node "$D/variants.js" "$WEB" scV.json
wait
python3 "$D/lista.py"
