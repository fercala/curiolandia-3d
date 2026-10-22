// Asamblea en muchas fechas y edades para recoger todas las variantes. node asam.js <webdir> <out> <fechas separadas por coma YYYY-MM-DDTHH>
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const http=require('http'),fs=require('fs'),path=require('path');const [root,out,dates]=process.argv.slice(2);const port=8970+Math.floor(Math.random()*20);
const ct=f=>f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':'text/javascript';
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':ct(f)});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch();const all=[];
 for(const d of dates.split(',')){const p=await b.newPage({viewport:{width:800,height:450}});
  await p.addInitScript(d=>{const R=Date,base=new R(d+':00:00').getTime(),t0=R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(base+(R.now()-t0))}static now(){return base+(R.now()-t0)}};window.Date=D},d);
  await p.goto(`http://localhost:${port}/index.html`);await p.waitForTimeout(1500);
  await p.evaluate(()=>{window.__fast=1;const S=__cl.S;S.name='Lucía';S.variant='es';S.intro=1;const l0=window.later;window.later=(ms,fn)=>l0(ms*.25,fn);
    window.REC=[];const s0=window.say;window.say=function(t,cb,o){o=o||{};REC.push([o.en?t:tx(t),o.en?1:0,'escena asamblea']);return s0(t,cb,o)}});
  for(const age of [3,4,5])for(let rep=0;rep<2;rep++){await p.evaluate(a=>{const S=__cl.S;S.age=a;S.asam={};__cl.go('asamblea')},age);await p.waitForTimeout(800);
   const t0=Date.now();let k=0;while(Date.now()-t0<40000&&await p.evaluate(()=>__cl.name==='asamblea')){await p.evaluate(k=>{const sc=__cl.scene;if(k%3===1){const x=200+Math.random()*1200,y=200+Math.random()*600;sc.down&&sc.down(x,y);sc.up&&sc.up(x,y);return}const h=sc.hint&&sc.hint();if(h){sc.down(h.x,h.y);sc.up&&sc.up(h.x,h.y)}else{const x=200+Math.random()*1200,y=200+Math.random()*600;sc.down&&sc.down(x,y)}},k++);await p.waitForTimeout(250)}}
  all.push(...await p.evaluate(()=>REC));await p.close();console.log(d,all.length)}
 fs.writeFileSync(out,JSON.stringify({said:all}));await b.close();srv.close()})();
