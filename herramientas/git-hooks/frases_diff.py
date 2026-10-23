"""Compara las frases que dice Tito antes y después del commit (lo usa el gancho pre-commit).

Lee `git diff --cached -U0` de src/*.js y saca, de las líneas de código quitadas (-) y añadidas (+), los textos
entre comillas que van como primer argumento de say(), say3(), sayMix() o sayMix3(). Si las dos listas son iguales
(misma frase en una línea que solo cambia en otra cosa, como un `if` nuevo), ningún diálogo ha cambiado.

Salida: imprime las frases nuevas o cambiadas, una por línea, y termina con código 1 si hay alguna; con 0 si no.
Las líneas que llaman a say() con algo que no es un texto entre comillas (una variable, una plantilla con ${})
cuentan siempre como cambiadas, porque no se puede saber qué frase dicen.
"""
import re
import subprocess
import sys
from collections import Counter

# primer argumento de say/say3/sayMix/sayMix3: texto entre comillas simples, dobles o acentos graves
LLAMADA = re.compile(r"\bsay(?:Mix)?3?\(\s*(?:(['\"`])((?:\\.|(?!\1).)*)\1|([^)\s,]*))")


def frases(linea):
    """Devuelve la lista de frases de una línea; las llamadas sin texto fijo salen como '?<línea>'."""
    out = []
    for m in LLAMADA.finditer(linea):
        if m.group(1) and not (m.group(1) == '`' and '${' in m.group(2)):
            out.append(m.group(2))
        else:
            out.append('?' + linea.strip())
    return out


def main():
    diff = subprocess.run(['git', 'diff', '--cached', '-U0', '--', 'src/*.js'],
                          capture_output=True, text=True, check=True).stdout
    antes, despues = Counter(), Counter()
    for l in diff.splitlines():
        if l.startswith(('+++', '---')) or not l[:1] in '+-':
            continue
        cuerpo = l[1:].lstrip()
        if cuerpo.startswith(('//', '/*', '*')):  # comentario, no habla
            continue
        (despues if l[0] == '+' else antes).update(frases(l[1:]))
    nuevas = sorted((despues - antes).elements())
    for f in nuevas:
        print(f)
    return 1 if nuevas else 0


if __name__ == '__main__':
    sys.exit(main())
