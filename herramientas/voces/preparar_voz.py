"""Convierte los WAV que genera Voicebox (generar-voces.ps1) en MP3 para el juego.
Uso: python3 preparar_voz.py <lista frases-*.txt> <carpetas con los .wav, separadas por comas> <carpeta web/voz de salida> [excluir.txt]
El nombre de cada WAV es md5(frase)[:12], igual que en generar-voces.ps1; el juego busca la frase en voz/manifest.json."""
import sys, os, json, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor
lista, wavs, out = sys.argv[1:4]
# opcional: archivo con nombres .wav a dejar fuera (audios cortados o raros: los dice el navegador)
excluir = set(open(sys.argv[4]).read().split()) if len(sys.argv) > 4 else set()
os.makedirs(out, exist_ok=True)
frases = [l.strip() for l in open(lista, encoding='utf-8-sig') if l.strip()]
man, falta, tareas = {}, 0, []
def convertir(src, dst):
    # recorta silencios del principio y del final, mono 48 kbps
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                    '-ac', '1', '-b:a', '48k', dst], check=True)
for f in frases:
    h = hashlib.md5(f.encode('utf-8')).hexdigest()[:12]
    src = next((os.path.join(d, h + '.wav') for d in wavs.split(',') if os.path.exists(os.path.join(d, h + '.wav'))), None)
    if not src or h + '.wav' in excluir:
        falta += 1
        continue
    dst = os.path.join(out, h + '.mp3')
    if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
        tareas.append((src, dst))
    man[' '.join(f.split())] = h + '.mp3'
with ThreadPoolExecutor(os.cpu_count()) as ex:
    list(ex.map(lambda a: convertir(*a), tareas))
json.dump({'v': 1, 'f': man}, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
tam = sum(os.path.getsize(os.path.join(out, x)) for x in os.listdir(out))
print(f'{len(man)} frases con voz, {falta} sin audio todavia, {tam/1e6:.1f} MB')
