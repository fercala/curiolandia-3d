#!/bin/sh
cd "$(dirname "$0")"
{ cat head.html; echo '<script>'; cat pics-base.js pics-new.js pics-a.js pics-b.js pics-c.js pics-d.js pics-e.js pics-mine.js core.js lex.js comps.js comps2.js temas.js temas4.js temas5.js cuentos.js extras.js ingles.js scenes.js zonas.js tienda.js repaso.js adult.js world3d.js boot.js; echo '</script>'; } > artifact.html
{ echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'; cat artifact.html; echo '</html>'; } > index.html
ls -la artifact.html index.html
