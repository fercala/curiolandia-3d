# lista.py: lista de frases que grabar. Se ejecuta desde la carpeta con los resultados de los recorridos (g*.json, sc*.json;
# ver LEEME.md). Quita el nombre del niño ("Lucía" en los recorridos), parte en oraciones igual que vozFile (core.js), usa
# lo que ya está grabado en voz/manifest.json y deja los trozos que faltan. Las oraciones con números (fechas, monedas...)
# se convierten en piezas (vozPieces en core.js) más los números 0-100 y las centenas.
# Escribe lista.json (todo, por secciones, con dónde se oyó cada frase) y frases-nuevas.txt (una por línea, para grabar).
import json,re,glob,collections
import os
RAIZ=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..')
VOZ=json.load(open(os.path.join(RAIZ,'voz','manifest.json')))['f']
FER=json.load(open(os.path.join(RAIZ,'voz-fer','manifest.json')))['f']
vozN=lambda t:re.sub(r'\s+',' ',t).strip()
vozK=lambda t:re.sub(r'[.\s]+$','',vozN(t)).lower()
K={vozK(k) for k in VOZ};KF={vozK(k) for k in FER}
def sents(t): return [vozN(s) for s in re.findall(r'[^.!?…]+[.!?…]*',t) if vozK(s)]
VAR=re.compile(r'\d')
def faltan(t,keys):
    """Trozos (oraciones seguidas) de t sin grabar, con el mismo reparto que vozFile: de izquierda a derecha, el trozo grabado más largo."""
    if vozK(t) in keys: return []
    ss=sents(t);out=[];run=[];i=0
    while i<len(ss):
        j=len(ss)
        while j>i and vozK(' '.join(ss[i:j])) not in keys: j-=1
        if j>i:
            if run: out.append(run);run=[]
            i=j
        else: run.append(ss[i]);i+=1
    if run: out.append(run)
    return out
frases=collections.OrderedDict()   # texto dicho -> contextos
for f in sorted(glob.glob('g*.json'))+sorted(glob.glob('sc*.json')):
    try: d=json.load(open(f))
    except Exception as e: print('no se pudo leer',f,e);continue
    for t,en,ctx in d['said']:
        if not en: frases.setdefault(t,set()).add(ctx)
for i in (json.load(open('ss-out.json')) if os.path.exists('ss-out.json') else []):# opcional: frases literales del código
    t=i['tt']
    if re.match(r'^[A-ZÁÉÍÓÚÑ¡¿]',t) and re.search(r'[.!?]$',t) and len(t)>8: frases.setdefault(t,set()).add(i['src'][0])
grabar=collections.OrderedDict();variables=collections.OrderedDict();nombre=collections.OrderedDict();fer_solo=collections.OrderedDict()
for t,ctx in frases.items():
    p=vozN(t.replace(', Lucía',''))
    for run in faltan(p,K):
        cur=[]
        for s in run+[None]:
            if s is None or VAR.search(s):
                if cur: grabar.setdefault(' '.join(cur),set()).update(ctx);cur=[]
                if s: variables.setdefault(s,set()).update(ctx)
            else: cur.append(s)
    if 'Lucía' in t and faltan(p,K): nombre[t]=p
    if not faltan(p,K) and faltan(p,KF): fer_solo[p]=ctx
json.dump({'grabar':{k:sorted(v) for k,v in grabar.items()},'variables':{k:sorted(v) for k,v in variables.items()},'nombre':nombre,'fer_solo':{k:sorted(v) for k,v in fer_solo.items()}},open('lista.json','w'),ensure_ascii=False,indent=1)
print('frases distintas',len(frases),'| grabar',len(grabar),'| con dato variable',len(variables),'| llevaban nombre',len(nombre),'| solo faltan en voz de Fer',len(fer_solo))

# ---- piezas para las oraciones con números ----
DIAS=['lunes','martes','miércoles','jueves','viernes','sábado','domingo']
MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
plain=lambda s:re.sub(r'\s+',' ',re.sub(r'[¡!¿?.,:;]',' ',s)).strip()
fijas=collections.OrderedDict();segs=collections.OrderedDict()
extra=['Tienes 7 estrellas.','Te faltan 7.','Le faltan 7 juegos para abrirse.','Faltan 7 para que crezca.','¡Tito tiene 12 flores en su caparazón!','Tienes 7 pegatinas.','¡Ya tienes 8!','Tienes 9 monedas.','Hoy es 9.','Toca el número 9 en el calendario.','Ese es el 9.','Busca el 9.','Hoy es lunes 9 de enero.']
var=dict(variables);[var.setdefault(e,['plantilla']) for e in extra]
for s,ctx in var.items():
    if any(c.startswith('tienda ') for c in ctx) or 'años' in s: fijas[s]=ctx;continue
    for seg in re.split(r'\d+',plain(s)):
        seg=seg.strip()
        if not seg: continue
        if seg.split()[-1] in DIAS: [segs.setdefault(' '.join(seg.split()[:-1]+[d]),1) for d in DIAS]
        elif seg.startswith('de ') and seg[3:] in MESES: [segs.setdefault('de '+m,1) for m in MESES]
        else: segs.setdefault(seg,1)
nums=[str(n) for n in range(0,101)]+['ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos']
segs=[s for s in segs if vozK(s) not in K]
nums=[n for n in nums if vozK(n) not in K]
d=json.load(open('lista.json'));d['fijas_con_numero']={k:sorted(v) for k,v in fijas.items()};d['piezas']=segs;d['numeros']=nums
json.dump(d,open('lista.json','w'),ensure_ascii=False,indent=1)
print('fijas con número',len(fijas),'| piezas',len(segs),'| números',len(nums));print(segs)

# frases-nuevas.txt: primero las frases (o trozos) fijas, luego las fijas con número, las piezas y los números.
out=[];seen=set()
for x in list(d['grabar'])+list(d['fijas_con_numero'])+d['piezas']+d['numeros']:
    k=vozK(x)
    if k not in seen: seen.add(k);out.append(x)
open('frases-nuevas.txt','w',encoding='utf-8').write('\n'.join(out)+'\n');print(len(out),'líneas en frases-nuevas.txt')
