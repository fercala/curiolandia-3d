// Recorre las escenas (no juegos) y toca los objetos 3D, guardando lo que dice Tito. node scenes.js <webdir> <hora> <out>
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const http=require('http'),fs=require('fs'),path=require('path');const [root,HR,out]=process.argv.slice(2);const port=8950+(+HR);
const ct=f=>f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':'text/javascript';
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':ct(f)});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:800,height:450}});const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.addInitScript(h=>{Date.prototype.getHours=()=>h},+HR);
 await p.goto(`http://localhost:${port}/index.html`);await p.waitForTimeout(2000);
 await p.evaluate(()=>{window.__fast=1;const S=__cl.S;S.name='Lucía';S.variant='es';
   window.REC=[];window.CTX='';const s0=window.say;window.say=function(t,cb,o){o=o||{};REC.push([o.en?t:tx(t),o.en?1:0,CTX]);return s0(t,cb,o)}});
 const dump=async()=>{try{fs.writeFileSync(out,JSON.stringify({said:await p.evaluate(()=>REC),errs}))}catch(e){}};
 const go=async(sc,o,ms)=>{await dump();console.log('escena',sc,JSON.stringify(o||{}));await p.evaluate(([sc,o])=>{window.CTX='escena '+sc;__cl.go(sc,o||{})},[sc,o]);await p.waitForTimeout(ms||1500)};
 const drive=async(ms,until)=>{const t0=Date.now();let k=0;while(Date.now()-t0<ms){if(await p.evaluate(until))return 1;
   await p.evaluate(k=>{const sc=__cl.scene;if(k%6===5){const x=200+Math.random()*1200,y=150+Math.random()*650;sc.down&&sc.down(x,y);sc.up&&sc.up(x,y);return}const h=sc.hint&&sc.hint();if(h){sc.down&&sc.down(h.x,h.y);sc.up&&sc.up(h.x,h.y)}},k++);await p.waitForTimeout(400)}return 0};
 const tap3=async(rounds)=>{for(let r=0;r<rounds;r++){const n=await p.evaluate(()=>{const w=__w3.W;if(!w||!w.trees)return 0;const TH=__w3.THREE;let n=0;
   for(const t of w.trees){const bx=new TH.Box3().setFromObject(t),c=new TH.Vector3();bx.getCenter(c);const [x,y]=__w3.proj(c);if(x<0||x>1600||y<20||y>880)continue;
     try{__cl.scene.down(x,y);__cl.scene.up&&__cl.scene.up(x,y)}catch(e){}n++;if(__cl.name!==window.CTX.slice(7))return n}return n});
   await p.waitForTimeout(4000)}};
 // primera vez: portada, edad, quién, intro
 await p.evaluate(()=>{const S=__cl.S;S.name='';S.intro=0;S.age=0});await go('title');await drive(4000,()=>__cl.name!=='title');
 await go('edad');await p.evaluate(()=>{__cl.S.name='Lucía';__cl.scene.down(800,520)});await p.waitForTimeout(1500);
 await go('quien');await go('intro',{hello:true},3000);await drive(15000,()=>__cl.name!=='intro');
 for(const age of [3,4,5]){await p.evaluate(a=>{const S=__cl.S;S.age=a;S.intro=1;S.unlockAll=false},age);
   await go('map',{hello:true},3000);await go('asamblea',{},1500);await drive(60000,()=>__cl.name!=='asamblea');
   await go('map',{},3000);await tap3(2)}
 await p.evaluate(()=>{__cl.S.unlockAll=true});
 for(const z of ['map','jardin','bosque','montana','fiestas','ingles']){await go(z,{hello:true},3000);await tap3(3)}
 for(const t of await p.evaluate(()=>__cl.TEMAS.map(t=>t.id))){await go('casita',{t,hello:true},1200)}
 await go('casita',{t:'3A-T1'},2000);await tap3(2);
 await p.evaluate(()=>{const S=__cl.S;S.temas['3A-T1']={g:[1,1,1,1,1,1,1,1],done:true}});await go('casita',{t:'3A-T1',fin:true},3000);
 await go('cofre',{t:'3A-T1',from:'jardin'},2000);await drive(15000,()=>__cl.name!=='cofre');await tap3(1);
 await p.evaluate(()=>{__cl.S.coins=500});await go('tienda',{},2000);await drive(30000,()=>false);
 await go('casaTito',{},2000);await drive(10000,()=>false);await go('album',{},2000);await drive(5000,()=>false);
 await go('repaso',{},2000);await drive(20000,()=>false);await go('dormir',{},3000);
 const res={said:await p.evaluate(()=>REC),errs};fs.writeFileSync(out,JSON.stringify(res));console.log('said',res.said.length,'errs',errs.length,errs.slice(0,3));await b.close();srv.close()})();
