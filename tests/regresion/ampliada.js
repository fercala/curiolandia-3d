// Casos adicionales de persistencia, recompensas, armario y arrastres reales.
// Uso: node tests/regresion/ampliada.js . [filtro]
// Las preparaciones son fixtures sintéticos, NO partidas completas jugadas.
const L = require('./lib');
const [root = '.', filter = ''] = process.argv.slice(2);
const runName='ampliada'+(filter?'-'+filter:'');
const R = L.registro(runName);
const results = [];
const fs = require('fs'), path = require('path');
const base = {age:5,name:'QA',variant:'es',intro:true,first:{askedName:1},unlockAll:true,coins:100,coinsTot:100,rooms:7};
(async()=>{
 const server=L.servir(root); let browser;
 try {
 browser=await L.navegador();
 async function test(id,title,fn,options={}) {
  if(filter&&!id.includes(filter))return;
  let p; const started=Date.now();
  try {
   p=await L.abrir(browser,server.port,{guardado:base,espera:350,rapido:true,...options});
   await p.waitForFunction(()=>window.__cl&&__cl.name==='title');
   const detail=await fn(p);
   const errors=[...new Set(p.errs)];
   const fail=detail.fail||errors.length>0;
   results.push({id,title,status:fail?'FAIL':'PASS',detail,errors,ms:Date.now()-started});
   if(fail){R.apuntar(id,'pendiente de clasificación',title,detail);await R.captura(p,'ampliada-'+id+'.png')}else R.bien(id,title);
  }catch(e){results.push({id,title,status:'ERROR_HARNESS',error:String(e)});console.log('ERROR_HARNESS',id,String(e).slice(0,350))}
  finally{if(p)await p.context().close()}
 }
 await test('armario','Toda la ropa del armario debe ser accesible dentro del lienzo',async p=>{
  await p.evaluate(()=>{for(const i of SHOP)if(i.slot)S.owned[i.id]=1;__cl.go('casaTito',{})});
  await p.waitForTimeout(250);
  return p.evaluate(()=>{const all=scene.wardrobe(),off=all.filter(i=>i.x-46>W),cut=all.filter(i=>i.x+46>W);return{fail:off.length>0,total:all.length,fuera:off.map(i=>({id:i.it.id,x:i.x})),recortadas:cut.map(i=>i.it.id)}});
 });
 await test('cofre-recarga','El premio de un tema terminado debe sobrevivir a recargar antes de abrir el cofre',async p=>{
  await p.evaluate(()=>{const t=TEMA['3A-T1'];S.temas[t.id]={g:Object.fromEntries(t.games.map((g,j)=>[j,1])),done:0};delete S.temas[t.id].g[0];S.owned={};S.coins=0;__cl.go('juego',{t:t.id,g:0})});
  const done=await L.conducir(p,()=>__cl.name==='cofre',20000,{real:true,azar:0});
  const before=await p.evaluate(()=>({scene:sceneName,done:S.temas['3A-T1'].done,gift:scene.gift&&scene.gift.id,owned:{...S.owned},coins:S.coins,cofres:S.cofres}));
  if(!done)throw new Error('No se llegó al cofre por el juego real: '+JSON.stringify(before));
  await p.reload();await p.waitForTimeout(400);
  await p.evaluate(()=>__cl.go('casita',{t:'3A-T1'}));await p.waitForTimeout(200);
  const after=await p.evaluate(()=>({scene:sceneName,done:S.temas['3A-T1'].done,owned:{...S.owned},coins:S.coins,cofres:S.cofres,remaining:nextGameOf(TEMA['3A-T1'])}));
  return{fail:after.done&&after.remaining===-1&&!after.owned[before.gift]&&after.coins===before.coins,before,after};
 });
 await test('cofre-salida-normal','Control: salir del cofre con la casita entrega el premio una vez',async p=>{
  await p.evaluate(()=>{S.owned={};S.coins=0;__cl.go('cofre',{t:'3A-T1'})});
  await p.waitForFunction(()=>fade<.5);await L.clic(p,80,80);await p.waitForFunction(()=>sceneName!=='cofre');
  return p.evaluate(()=>({fail:S.coins!==10||!S.owned.gorroFiesta,coins:S.coins,owned:S.owned.gorroFiesta}));
 });
 await test('repaso-salida','No perder las cinco monedas si se sale durante la celebración del repaso',async p=>{
  await p.evaluate(()=>{S.coins=0;S.temas['3A-T1']={g:{1:1},done:0};S.rep={d:today(),list:['3A-T1#1'],done:{'3A-T1#1':1},weak:0,paid:0,seen:1};__cl.go('repaso',{})});
  await p.waitForFunction(()=>fade<.59);await L.clic(p,80,80);await p.waitForFunction(()=>sceneName==='map');await p.waitForTimeout(800);
  await p.evaluate(()=>__cl.go('repaso',{}));await p.waitForTimeout(900);
  return p.evaluate(()=>({fail:S.rep.paid===1&&S.coins===0,paid:S.rep.paid,coins:S.coins,done:S.rep.done,scene:sceneName}));
 });
 await test('repaso-espera','Control: esperar la celebración entrega las cinco monedas del repaso',async p=>{
  await p.evaluate(()=>{S.coins=0;S.temas['3A-T1']={g:{1:1},done:0};S.rep={d:today(),list:['3A-T1#1'],done:{'3A-T1#1':1},weak:0,paid:0,seen:1};__cl.go('repaso',{})});
  await p.waitForFunction(()=>S.coins===5);
  return p.evaluate(()=>({fail:S.coins!==5,paid:S.rep.paid,coins:S.coins}));
 });
 await test('arrastre-borde','Los muebles grandes no deben quedar recortados al arrastrarlos al borde',async p=>{
  await p.evaluate(()=>{S.temas['3A-T1']={g:{},done:1};S.owned.cama=1;S.home={cama:{x:930,y:720,r:'dormitorio'}};SCENES.casaTito.room='dormitorio';__cl.go('casaTito',{})});
  await p.waitForFunction(()=>fade<.5);
  await L.arrastrar(p,930,650,1590,650);await p.waitForTimeout(150);
  return p.evaluate(()=>({fail:S.home.cama.x+HSIZE.cama/2>W,position:S.home.cama,size:HSIZE.cama,right:S.home.cama.x+HSIZE.cama/2,width:W}));
 });
 await test('arrastre-tito','Un objeto arrastrado junto a Tito debe poder volver a moverse',async p=>{
  await p.evaluate(()=>{S.owned.robot=1;S.home={robot:{x:930,y:720,r:'salon'}};SCENES.casaTito.room='salon';__cl.go('casaTito',{})});
  await p.waitForFunction(()=>fade<.5);
  await L.arrastrar(p,930,650,440,530);
  const pos=await p.evaluate(()=>({...S.home.robot}));
  await L.arrastrar(p,pos.x,pos.y-70,1000,650);await p.waitForTimeout(150);
  return p.evaluate(before=>({fail:S.home.robot.x===before.x&&S.home.robot.y===before.y,before,after:{...S.home.robot},itemHit:!!scene.itemAt(before.x,before.y-70),titoHit:inR(before.x,before.y-70,440,500,380,330)}),pos);
 });
 await test('arrastre-normal','Control: mover un objeto en el suelo y guardar su posición',async p=>{
  await p.evaluate(()=>{S.owned.robot=1;S.home={robot:{x:930,y:720,r:'salon'}};SCENES.casaTito.room='salon';__cl.go('casaTito',{})});
  await p.waitForFunction(()=>fade<.5);
  await L.arrastrar(p,930,650,1100,650);
  const before=await p.evaluate(()=>({...S.home.robot}));await p.reload();await p.waitForTimeout(350);
  return p.evaluate(b=>({fail:S.home.robot.x!==b.x||S.home.robot.y!==b.y,before:b,after:S.home.robot}),before);
 });
 await test('reinicio','Empezar de nuevo conserva preferencias y limpia progreso',async p=>{
  await p.evaluate(()=>{S.voz='fer';S.limit=10;S.temas['3A-T1']={done:1,g:{0:1}};doReset()});
  return p.evaluate(()=>({fail:STARS()!==0||S.voz!=='fer'||S.limit!==10,stars:STARS(),voz:S.voz,limit:S.limit}));
 });
 await test('copia-html-monedas','La previsualización de copias no debe ejecutar HTML del saldo',async p=>{
  await p.evaluate(()=>{window.__qaXss=0;openAdult()});
  const payload=JSON.stringify({temas:{},coins:'<img src=x onerror="window.__qaXss=1">'});
  await p.locator('#a-bk-txt').fill(payload);await p.locator('#a-bk-load').click();
  await p.waitForTimeout(500);
  return p.evaluate(()=>({fail:window.__qaXss===1,executed:window.__qaXss===1,offeredImport:!!document.querySelector('#a-bk-ok')}));
 });
 const malformed=[['stats',{stats:{busca:null}},'adult'],['home',{home:{robot:null},owned:{robot:1}},'casaTito'],['vales',{vales:[null]},'tienda'],['tema-g',{temas:{'3A-T1':{g:null,done:0}}},'casita'],['gs',{gs:{'3A-T1#1':null}},'map']];
 for(const [key,save,where]of malformed)await test('copia-anidada-'+key,'Una copia con datos anidados incorrectos debe rechazarse o recuperarse: '+key,async p=>{
  const accepted=await p.evaluate(async data=>{try{await bkDecode(JSON.stringify(data));return true}catch{return false}},{temas:{},...save});
  let err=null;try{await p.evaluate(where=>where==='adult'?openAdult():__cl.go(where,{t:'3A-T1'}),where)}catch(e){err=String(e).split('\n')[0]}
  await p.waitForTimeout(100);
  return{fail:accepted&&(!!err||p.errs.length>0),accepted,error:err,errors:[...new Set(p.errs)]};
 },{guardado:{...base,...save}});
 await test('matriz-ajustes','Controles de edad, modo, voz y variante (36 combinaciones) y persistencia final',async p=>{
  // Integración DOM: activa los controles y sus onchange, sin reconstruir 36 mundos 3D.
  const cases=await p.evaluate(()=>{openAdult();const cases=[];
   for(const age of[3,4,5])for(const free of[false,true])for(const voice of['','fer','nav'])for(const variant of['es','ar']){
    for(const [name,value]of[['a-age',String(age)],['a-mode',free?'libre':'camino'],['a-voz',voice],['a-var',variant]]){
     const el=[...document.querySelectorAll(`[name="${name}"]`)].find(e=>e.value===value);if(!el)throw new Error('Control ausente: '+name);el.click();
    }
    const got={age:S.age,free:!!S.unlockAll,voice:S.voz||'',variant:S.variant};
    cases.push({expected:{age,free,voice,variant},got,ok:got.age===age&&got.free===free&&got.voice===voice&&got.variant===variant});
   }return cases;
  });
  await p.reload();await p.waitForFunction(()=>window.__cl&&sceneName==='title');
  const last=await p.evaluate(()=>({age:S.age,free:!!S.unlockAll,voice:S.voz,variant:S.variant}));
  return{fail:cases.some(c=>!c.ok)||last.age!==5||!last.free||last.voice!=='nav'||last.variant!=='ar',count:cases.length,cases,last};
 });
 await test('riega-sostenido','Control del guion: regar exige mantener el arrastre, no soltar inmediatamente',async p=>{
  await p.evaluate(()=>__cl.go('juego',{t:'3A-T10',g:1}));await p.waitForFunction(()=>fade<.5);
  const total=await p.evaluate(()=>scene.g.total);
  for(let n=0;n<total;n++){
   // Tras soltar, esperar el retorno para no intentar coger una posición ya obsoleta.
   await p.waitForFunction(()=>{const h=scene.hint();return h&&h.x>1390});
   const h=await p.evaluate(()=>scene.hint());if(!h)throw new Error('Falta la ayuda de Riega');
   const [x,y]=await p.evaluate(h=>[OX+h.x*SC,OY+h.y*SC],h);
   const [dx,dy]=await p.evaluate(h=>[OX+(h.x+h.dx)*SC,OY+(h.y+h.dy)*SC],h);
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(dx,dy,{steps:10});
   try{await p.waitForFunction(n=>sceneName!=='juego'||scene.g.done>n,n,{timeout:45000})}finally{await p.mouse.up()}
  }
  await p.waitForFunction(()=>sceneName!=='juego');
  return p.evaluate(()=>({fail:!S.temas['3A-T10'].g[1],played:S.temas['3A-T10'].g[1],scene:sceneName}));
 });
 const report={testedCommit:require('child_process').execSync('git rev-parse HEAD',{cwd:root,encoding:'utf8'}).trim(),date:new Date().toISOString(),note:'Fixtures sintéticos + eventos reales de ratón. __fast solo omite audio; no equivale a certificación acústica.',results};
 fs.writeFileSync(path.join(L.SAL,runName+'-detalle.json'),JSON.stringify(report,null,2));R.guardar();
 console.log('RESUMEN',JSON.stringify(results.map(({id,status})=>({id,status}))));
 process.exitCode=results.some(r=>r.status==='ERROR_HARNESS')?2:results.some(r=>r.status==='FAIL')?1:0;
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=2});

