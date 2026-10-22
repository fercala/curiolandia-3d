// Frases finitas de la tienda, la casa y el cofre para cada artículo (texto en castellano de España). node variants.js <webdir> <out>
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const http=require('http'),fs=require('fs'),path=require('path');const [root,out]=process.argv.slice(2);
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200);r.end(d)})}).listen(8995);
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:8995/index.html');await p.waitForTimeout(1500);
 const L=await p.evaluate(()=>{__cl.S.variant='es';const o=[];const add=(s,c)=>o.push({said:tx(s),ctx:c});
  for(const it of SHOP){const X=itemName(it),C=cap(X),c='tienda '+it.id;
    add(C+'.',c);add('¿Querés comprar '+X+' por '+it.p+' monedas? Tocá el verde para comprar.',c);add(C+'. Cuesta '+it.p+' monedas.',c);
    if(it.tier>1)add(C+' se abre cuando tengas '+TIER_NEED[it.tier]+' estrellas.',c);
    if(it.slot){add('¡Tito se puso '+X+'!',c);add('¡Me puse '+X+'!',c);if(it.slot!=='shell'&&it.slot!=='scarf'){add('Tito se quitó '+X+'.',c);add('Me quité '+X+'.',c)}}
    else{add(C+' ya es tuyo. Está en la casa de Tito.',c)}
    add('¡Aquí está '+X+'!',c);add('¡Mira lo que había: '+X+'!',c)}
  for(const c of SHOPCAT)add(c.n+'.','tienda pestaña');
  return o});
 fs.writeFileSync(out,JSON.stringify({said:L.map(x=>[x.said,0,x.ctx])}));console.log(L.length);await b.close();srv.close()})();
