import re,os,zipfile
VER='curiolandia3d-v1.234'
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src=open('index.html',encoding='utf-8').read()
src=re.sub(r'<link rel="preconnect"[^>]*>\n?','',src)
src=re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>',
 '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#7CC86E"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Curiolandia 3D"><meta name="description" content="Curiolandia 3D: un juego para aprender los temas de Educación Infantil (3, 4 y 5 años) con Tito el caracol, en un mundo en 3D.">'
 '<style>@font-face{font-family:"Andika";font-weight:400 700;font-display:swap;src:url(fonts/andika-700-latin.woff2) format("woff2")}@font-face{font-family:"Fredoka";font-weight:300 700;font-display:swap;src:url(fonts/fredoka-latin.woff2) format("woff2")}</style>',src)
src=src.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','three.min.js')
src=src.replace('</html>','<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script></html>')
open('web/index.html','w',encoding='utf-8').write(src)
open('web/manifest.webmanifest','w').write('''{"name":"Curiolandia 3D","short_name":"Curiolandia 3D","description":"Tito y las preguntas escondidas: los temas de Infantil para 3, 4 y 5 años","start_url":"./","scope":"./","display":"fullscreen","orientation":"landscape","background_color":"#FFF6E6","theme_color":"#7CC86E","lang":"es","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}''')
# Ojo: varios juegos comparten el origen fercala.github.io, así que solo borramos NUESTRAS cachés viejas.
import shutil;shutil.copy('three.min.js','web/three.min.js')
open('web/sw.js','w').write('''const C='%s';const F=['./','index.html','three.min.js','manifest.webmanifest','fonts/andika-700-latin.woff2','fonts/fredoka-latin.woff2','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('curiolandia3d-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('index.html'))))});'''%VER)
open('web/.nojekyll','w').write('')
z=zipfile.ZipFile('curiolandia-3d-web.zip','w',zipfile.ZIP_DEFLATED)
for root,_,fs in os.walk('web'):
  for f in fs:
    p=os.path.join(root,f);z.write(p,os.path.relpath(p,'web'))
z.close();print('web ok',VER)
