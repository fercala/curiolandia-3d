#!/usr/bin/env python3
"""Comprueba la política de documentación del código (docs/POLITICA-DOCUMENTACION.md).

Uso:  python3 tests/comentarios.py            (revisa todo src/)
      python3 tests/comentarios.py src/x.js   (revisa solo esos archivos)

Mira dos cosas en cada .js de src/:
  1. Que el archivo empiece con un comentario de cabecera (/* ... */ o líneas //).
  2. Que cada función escrita al principio de una línea (`function nombre(`,
     `async function nombre(` o `const nombre=(...)=>` / `const nombre=x=>`) tenga un
     comentario en alguna de las 4 líneas de encima, sin líneas en blanco entre medias
     (así vale un comentario que explica a la vez una función y sus ayudantes).
Las funciones dentro de objetos o de otras funciones no se comprueban aquí: revísalas a mano.
Termina con código 1 si falta algo, para poder usarlo antes de cada commit.
"""
import re, sys, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FUNC = re.compile(r'^(?:async\s+)?function\s+([\w$]+)\s*\(|^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>')

def revisa(ruta):
    lineas = ruta.read_text(encoding='utf-8').split('\n')
    fallos = []
    if not lineas or not lineas[0].lstrip().startswith(('/*', '//')):
        fallos.append(f'{ruta.name}:1: falta el comentario de cabecera del archivo')
    for i, l in enumerate(lineas):
        m = FUNC.match(l)
        if not m:
            continue
        nombre = m.group(1) or m.group(2)
        ok = False
        for j in range(i - 1, max(i - 5, -1), -1):
            prev = lineas[j].strip()
            if not prev:
                break
            if prev.startswith(('//', '*')) or prev.endswith('*/'):
                ok = True
                break
        if not ok:
            fallos.append(f'{ruta.name}:{i + 1}: la función {nombre} no tiene comentario de cabecera')
    return fallos

def main():
    rutas = [pathlib.Path(a) for a in sys.argv[1:]] or sorted((RAIZ / 'src').glob('*.js'))
    fallos = [f for r in rutas for f in revisa(r)]
    for f in fallos:
        print(f)
    print(f'{len(rutas)} archivos revisados, {len(fallos)} fallos' + ('' if fallos else ': TODO BIEN'))
    sys.exit(1 if fallos else 0)

if __name__ == '__main__':
    main()
