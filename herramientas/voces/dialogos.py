#!/usr/bin/env python3
"""dialogos.py: mantiene el catálogo de todos los diálogos de Tito (dialogos/todos.csv). Ver dialogos/LEEME.md.

Uso, desde la raíz del repo:
  python3 herramientas/voces/dialogos.py              rehace dialogos/todos.csv
  python3 herramientas/voces/dialogos.py --comprobar  solo comprueba que el catálogo está al día (código 1 si no)
  python3 herramientas/voces/dialogos.py --donde lista.json   añade dónde se oye cada frase (salida de auditoria/lista.py
                                                               o del recorrido) a la columna "donde"

El catálogo junta:
  - las frases grabadas en voz/manifest.json (estado "grabada"; columna "fer" = si también está en voz-fer/),
  - las frases de dialogos/pendientes.txt: estado "pendiente" si aún no están grabadas, "regrabar" si lo están pero
    salieron mal y hay que repetirlas.
Cada fila: id (md5 de 12 letras, el mismo nombre que el mp3/wav), texto (castellano de España, tal como lo dice Tito),
estado, fer, tipo (frase, pieza o numero), donde (pantalla o juego donde se oye, si se sabe) y mp3.
Se conserva la columna "donde" que ya hubiera. Las filas van por orden alfabético del texto para que los cambios se
vean bien en git.
"""
import csv, hashlib, json, os, re, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
CSV = os.path.join(RAIZ, 'dialogos', 'todos.csv')
PEND = os.path.join(RAIZ, 'dialogos', 'pendientes.txt')
CAMPOS = ['id', 'texto', 'estado', 'fer', 'tipo', 'donde', 'mp3']

def clave(t):
    """La misma normalización que vozK() en core.js: espacios simples, sin punto final, minúsculas."""
    return re.sub(r'[.\s]+$', '', re.sub(r'\s+', ' ', t).strip()).lower()

def tipo(t):
    """numero: cifras o centenas; pieza: trozo en minúsculas sin signos (ver vozPieces); frase: lo demás."""
    if re.fullmatch(r'\d+|ciento|doscientos|trescientos|cuatrocientos|quinientos|seiscientos|setecientos|ochocientos|novecientos', t):
        return 'numero'
    if t == t.lower() and not re.search(r'[.!?¡¿,:;]', t):
        return 'pieza'
    return 'frase'

def catalogo(donde_extra=None):
    voz = json.load(open(os.path.join(RAIZ, 'voz', 'manifest.json'), encoding='utf-8'))['f']
    fer = {clave(k) for k in json.load(open(os.path.join(RAIZ, 'voz-fer', 'manifest.json'), encoding='utf-8'))['f']}
    antes = {}
    if os.path.exists(CSV):
        with open(CSV, encoding='utf-8', newline='') as f:
            antes = {clave(r['texto']): r.get('donde', '') for r in csv.DictReader(f)}
    filas = {}
    for t, mp3 in voz.items():
        filas[clave(t)] = {'texto': t, 'estado': 'grabada', 'mp3': mp3}
    for t in (l.strip() for l in open(PEND, encoding='utf-8')):
        if not t: continue
        if clave(t) in filas: filas[clave(t)]['estado'] = 'regrabar'   # grabada, pero hay que repetirla
        else: filas[clave(t)] = {'texto': t, 'estado': 'pendiente', 'mp3': ''}
    out = []
    for k, r in filas.items():
        t = r['texto']
        donde = antes.get(k, '') or (donde_extra or {}).get(k, '')
        out.append({'id': hashlib.md5(t.encode('utf-8')).hexdigest()[:12], 'texto': t, 'estado': r['estado'],
                    'fer': 'sí' if k in fer else 'no', 'tipo': tipo(t), 'donde': donde, 'mp3': r['mp3']})
    out.sort(key=lambda r: clave(r['texto']))
    return out

def escribe(filas):
    with open(CSV, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, CAMPOS)
        w.writeheader()
        w.writerows(filas)

def main():
    args = sys.argv[1:]
    donde = None
    if '--donde' in args:
        d = json.load(open(args[args.index('--donde') + 1], encoding='utf-8'))
        donde = {}
        for parte in ('grabar', 'fijas_con_numero'):
            for t, ctx in d.get(parte, {}).items():
                donde[clave(t)] = ', '.join(ctx[:3])
    filas = catalogo(donde)
    if '--comprobar' in args:
        actual = open(CSV, encoding='utf-8', newline='').read() if os.path.exists(CSV) else ''
        import io
        buf = io.StringIO(newline='')
        w = csv.DictWriter(buf, CAMPOS); w.writeheader(); w.writerows(filas)
        if buf.getvalue() != actual:
            print('dialogos/todos.csv no está al día: ejecuta python3 herramientas/voces/dialogos.py')
            sys.exit(1)
        print(f'{len(filas)} diálogos en el catálogo: TODO BIEN')
        return
    escribe(filas)
    n = {e: sum(1 for r in filas if r['estado'] == e) for e in ('grabada', 'pendiente', 'regrabar')}
    print(f"{len(filas)} diálogos en dialogos/todos.csv ({n['grabada']} grabados, {n['pendiente']} pendientes, {n['regrabar']} por regrabar)")

if __name__ == '__main__':
    main()
