// check.js: pasa cada frase por tx() del juego (castellano de España) y apunta vozFile() de las dos voces. Se usa para
// convertir frases literales del código (rioplatense) a como las dice Tito. node check.js <webdir> <in.json: [{t, raw}]> <out.json>
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const http=require('http'),fs=require('fs'),path=require('path');const [root,inp,out]=process.argv.slice(2);
const ct=f=>f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':'text/javascript';
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':ct(f)});r.end(d)})}).listen(8899);
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:8899/index.html');await p.waitForTimeout(1500);
 const items=JSON.parse(fs.readFileSync(inp));
 const res=await p.evaluate(async items=>{const S=__cl.S;S.name='Lucía';S.variant='es';
   const load=v=>new Promise(r=>{S.voz=v;vozLoad(r)});
   for(const it of items)it.tt=it.raw?tx(it.t):it.t;
   await load('');for(const it of items)it.voz=vozFile(it.tt);
   await load('fer');for(const it of items)it.fer=vozFile(it.tt);return items},items);
 fs.writeFileSync(out,JSON.stringify(res));console.log(res.length,res.filter(i=>!i.voz).length,'sin voz;',res.filter(i=>!i.fer).length,'sin fer');await b.close();srv.close()})();
