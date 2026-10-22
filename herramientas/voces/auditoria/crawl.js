// Juega todos los juegos (siguiendo hint()) y visita las escenas, guardando todo lo que dice Tito.
// node crawl.js <webdir> <worker> <nworkers> <out.json>
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const http=require('http'),fs=require('fs'),path=require('path');
const [root,W,NW,out]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]];
const port=8900+W;
const ct=f=>f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':f.endsWith('.mp3')?'audio/mpeg':'text/javascript';
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':ct(f)});r.end(d)})}).listen(port);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:800,height:450}});const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto(`http://localhost:${port}/index.html`);await p.waitForTimeout(2000);
 await p.evaluate(()=>{window.__fast=1;const S=__cl.S;S.name='Lucía';S.variant='es';S.intro=1;S.unlockAll=true;
   window.REC=[];window.CTX='';const l0=window.later;window.later=(ms,fn)=>l0(ms*.25,fn);const s0=window.say;window.say=function(t,cb,o){o=o||{};REC.push([o.en?t:tx(t),o.en?1:0,CTX]);return s0(t,cb,o)}});
 const jobs=await p.evaluate(()=>{const j=[];for(const t of __cl.TEMAS)t.games.forEach((g,i)=>j.push([t.id,i,g.t]));return j});
 const only=process.env.ONLY?fs.readFileSync(process.env.ONLY,'utf8').split('\n').filter(Boolean):null;
 const mine=only?jobs.filter(j=>only.includes(j[0]+'#'+j[1])):jobs.filter((_,i)=>i%NW===W);
 const drive=async(maxMs,until)=>{const t0=Date.now();let k=0;
   while(Date.now()-t0<maxMs){if(await p.evaluate(until))return true;
    const h=await p.evaluate(()=>{const sc=__cl.scene;const h=sc&&sc.hint&&sc.hint();return h?{x:h.x,y:h.y,dx:h.dx,dy:h.dy,path:h.path&&h.path.slice(0,60)}:null});
    if(k++%7===3)await p.evaluate(()=>{const sc=__cl.scene;const x=200+Math.random()*1200,y=150+Math.random()*650;sc.down&&sc.down(x,y);sc.up&&sc.up(x,y)});
    else if(h){await p.evaluate(h=>{const sc=__cl.scene;if(h.path){sc.down&&sc.down(h.x,h.y);for(const q of h.path)sc.move&&sc.move(q[0],q[1]);const l=h.path[h.path.length-1];sc.up&&sc.up(l[0],l[1])}
      else if(h.dx!=null||h.dy!=null){const dx=h.dx||0,dy=h.dy||0;sc.down&&sc.down(h.x,h.y);for(let i=1;i<=8;i++)sc.move&&sc.move(h.x+dx*i/8,h.y+dy*i/8);sc.up&&sc.up(h.x+dx,h.y+dy)}
      else{sc.down&&sc.down(h.x,h.y);sc.up&&sc.up(h.x,h.y)}},h)}
    await p.waitForTimeout(h?200:300)}
   return false};
 const res={games:[],fail:[]};
 for(const [tid,gi,gt] of mine){for(const rep of [0]){
   await p.evaluate(([tid,gi,rep])=>{const S=__cl.S,t=__cl.TEMA[tid];S.age=+(tid.match(/^(\d)A/)||[0,4])[1]||4;
     const st=S.temas[tid]||(S.temas[tid]={g:[],done:false});st.g[gi]=rep;window.CTX=tid+'#'+gi;__cl.go('juego',{t:tid,g:gi})},[tid,gi,rep]);
   await p.waitForTimeout(300);
   const ok=await drive(+(process.env.MS||40000),()=>__cl.name!=='juego');
   (ok?res.games:res.fail).push(tid+'#'+gi+':'+gt+':'+rep);console.log(W,res.games.length+res.fail.length,'/',mine.length,ok?'ok':'FAIL',tid+'#'+gi+':'+gt);
 }}
 res.said=await p.evaluate(()=>REC);res.errs=errs;
 fs.writeFileSync(out,JSON.stringify(res));console.log('worker',W,'ok',res.games.length,'fail',res.fail.length,'said',res.said.length,'errs',errs.length);
 await b.close();srv.close()})();
