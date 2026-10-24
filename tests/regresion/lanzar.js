// Adaptador opcional para ejecutar las pruebas existentes en Windows, macOS o Linux.
// npm install --no-save playwright
// node tests/regresion/lanzar.js ampliada.js .
// PLAYWRIGHT_CHANNEL=chrome (o msedge), o PLAYWRIGHT_EXECUTABLE_PATH=/ruta/al/navegador
const path = require('path');
const pw = require('playwright');
const original = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = options => original({
 ...options,
 ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}),
 ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {})
});
const [suite='ampliada.js',...args]=process.argv.slice(2);
const target=path.resolve(__dirname,suite);
if(path.dirname(target)!==__dirname||!target.endsWith('.js'))throw new Error('La prueba debe estar en tests/regresion');
process.argv=[process.argv[0],target,...args];
require(target);

