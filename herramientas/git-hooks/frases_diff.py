"""Compara las frases que dice Tito antes y después del commit (lo usa el gancho pre-commit).

Lee `git diff --cached -U0` de src/*.js y saca, de las líneas de código quitadas (-) y añadidas (+), los textos
entre comillas que van como primer argumento de say(), sayQ(), say3(), sayMix() o sayMix3(). Si las dos listas son iguales
(misma frase en una línea que solo cambia en otra cosa, como un `if` nuevo), ningún diálogo ha cambiado.

Salida: imprime las frases nuevas o cambiadas, una por línea, y termina con código 1 si hay alguna; con 0 si no.
Las llamadas con algo que no es un texto entre comillas (una expresión, una plantilla con ${}) se comparan por el
texto de esa expresión: si solo cambia la función (say → sayQ) o el resto de la línea, no cuentan como cambiadas.
Las que pasan una sola variable (say(t, cb), dentro de sayQ) no se cuentan: la frase está donde se escribe el texto.
Las definiciones (function sayQ(...)) no son llamadas.
"""
import re
import subprocess
import sys
from collections import Counter

# primer argumento de say/sayQ/say3/sayMix/sayMix3: texto entre comillas simples, dobles o acentos graves
LLAMADA = re.compile(r"\bsay(?:Mix)?[3Q]?\(\s*(?:(['\"`])((?:\\.|(?!\1).)*)\1|([^)\s,]*))")


def primer_argumento(linea, i):
    """Texto del primer argumento de la llamada cuyo '(' está en linea[i]: hasta la ',' o ')' del mismo nivel.
    Si la llamada sigue en otra línea, devuelve lo que haya hasta el final."""
    nivel, j = 0, i + 1
    while j < len(linea):
        c = linea[j]
        if c in '([{':
            nivel += 1
        elif c in ')]}':
            if nivel == 0:
                break
            nivel -= 1
        elif c == ',' and nivel == 0:
            break
        j += 1
    return linea[i + 1:j].strip()


def frases(linea):
    """Devuelve la lista de frases de una línea; las llamadas sin texto fijo salen como '?<expresión>'."""
    out = []
    for m in LLAMADA.finditer(linea):
        if linea[:m.start()].rstrip().endswith('function'):
            continue  # definición (function sayQ(t,cb,o)), no llamada
        if m.group(1) and not (m.group(1) == '`' and '${' in m.group(2)):
            out.append(m.group(2))
            continue
        arg = primer_argumento(linea, m.end(0) - len(m.group(0)) + m.group(0).index('('))
        if re.fullmatch(r'[A-Za-z_$][\w$]*', arg):
            continue  # pasa una variable: la frase se comprueba donde se escribe
        out.append('?' + arg)
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
