# Pruebas adicionales de bugs B8–B14

Esta batería añade casos que faltaban en los recorridos anteriores. No modifica fuentes del juego ni necesita jugar una partida completa para preparar cada caso: utiliza partidas sintéticas y las identifica en el informe.

## Ejecutar

Desde la raíz del repositorio, con Node.js:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/regresion/ampliada.js .
```

Para usar Chrome o Edge ya instalados, sin descargar Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome' # o 'msedge'
node tests/regresion/lanzar.js ampliada.js .
```

También se admite `PLAYWRIGHT_EXECUTABLE_PATH`. El lanzador sirve para las otras baterías, por ejemplo `node tests/regresion/lanzar.js voces.js .`.

Se puede pasar un filtro de casos: `node tests/regresion/lanzar.js ampliada.js . cofre`.

## Qué comprueba

- **B8:** límites de las 19 prendas del armario.
- **B9:** completar Conocer con ratón real como último juego pendiente, llegar al cofre y recargar; control de salida normal con recompensa.
- **B10:** cancelar la celebración del repaso pulsando casa; control que espera y recibe cinco monedas.
- **B11/B12:** arrastres reales al borde derecho y junto a Tito; control de movimiento y persistencia tras recarga.
- **B13:** vista previa de una copia con HTML en el saldo. La demostración inocua solo establece una variable en la página aislada.
- **B14:** cinco estructuras internas defectuosas, con comprobación de aceptación y apertura de la pantalla afectada. Solo cuatro variantes fallaron en la referencia inicial.
- Reinicio que limpia progreso y conserva preferencias.
- 36 combinaciones de controles HTML: edades 3/4/5, Camino/Libre, voces principal/Fer/navegador y España/rioplatense. Se comprueban los valores aplicados y la persistencia de la combinación final tras recargar. Esto no significa haber completado cada actividad con cada combinación.

## Resultados y límites

Escribe `tests/regresion/salida/ampliada-detalle.json`, un resumen y capturas de los casos fallidos. Con filtro, añade ese filtro al nombre para conservar la ejecución completa. La carpeta de salida está ignorada por Git.

Códigos de salida: **0** todos los casos pasan, **1** hay un fallo comprobado, **2** algún caso no pudo ejecutarse por un error del propio entorno o la prueba. Un error de ejecución no debe publicarse automáticamente como bug del juego.

Los eventos de las pruebas de cofre y arrastre atraviesan el lienzo y sus manejadores de ratón; las preparaciones usan el punto de acceso de pruebas existente `__cl` y variables del juego. Se espera a que la transición permita recibir el toque para evitar falsos resultados.

`__fast` omite el audio. La batería verifica lógica, controles, persistencia y errores, no la pronunciación, el timbre ni la calidad audible. No usa el perfil personal del navegador ni servicios externos. Revisar el informe antes de añadir hallazgos a `bugs.md`.

