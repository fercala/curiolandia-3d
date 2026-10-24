# Ampliación de QA — 24 de octubre de 2026

Código del juego probado: **v1.591**, commit `e1a8af377ce85cd41f8fe97adcb8d27a005aed6d`. Copia local exacta del repositorio, Chrome sin ventana en Windows, con Playwright. Solo se añaden documentación y pruebas; no se corrige ni modifica el juego.

## Hallazgos confirmados

Se publicaron **siete bugs nuevos, B8–B14**, como **PENDIENTES** en [bugs.md](../bugs.md), con reproducción, causa y propuesta de solución:

| ID | Hallazgo | Prioridad |
|---|---|---|
| B8 | Siete prendas quedan fuera del armario con la colección completa | Media |
| B9 | Recargar con el cofre cerrado pierde el regalo y diez monedas | Alta |
| B10 | Salir de la celebración del repaso pierde sus cinco monedas | Media |
| B11 | Arrastrar muebles grandes al borde derecho los recorta | Baja |
| B12 | Un objeto colocado en la región de Tito queda imposible de mover | Media |
| B13 | La vista previa de una copia interpreta HTML del campo monedas | Alta, seguridad |
| B14 | Cuatro estructuras internas de copias dañadas rompen pantallas | Media |

Los cuatro casos de B14 cuentan como una incidencia de validación, no cuatro bugs distintos. La demostración de B13 solo establece una variable en el navegador de prueba aislado: no extrae datos ni confirma una importación.

## Batería reproducible

[ampliada.js](../tests/regresion/ampliada.js), [lanzar.js](../tests/regresion/lanzar.js) e [instrucciones](../tests/regresion/AMPLIADA.md).

La batería contiene 17 casos. Diez verificaciones detectan los siete bugs anteriores; el resto son controles positivos, reinicio, ajustes y comprobación del guion de regar. Los fallos esperados quedan visibles para que la misma batería sirva de regresión cuando se arreglen.

- Matriz de **36 combinaciones** de los controles reales del panel: tres edades, dos modos, tres voces y dos variantes. Se activan sus eventos DOM en un lote, se comprueba cada valor aplicado y se verifica la persistencia final tras recargar. No se completó cada actividad con cada combinación.
- La batería existente `voces.js` pasó sus **tres casos**: selección automática, lista de voces y conservación/recuperación de la voz elegida. Usa voces simuladas, como indica su código.
- Se comprobaron los manifiestos de las voces: **2217** referencias de la voz principal y **3303** de Fer; todos sus archivos existen en la copia del repositorio. Esto no demuestra que suenen correctamente.

Los resultados detallados y las reejecuciones se guardan en [QA-AUTOMATIZADA-2026-10-24.json](QA-AUTOMATIZADA-2026-10-24.json). Las capturas se conservan en la carpeta local de salida; no se enlazan rutas locales desde GitHub.

## Recorrido general y avisos descartados

Se ejecutó parcialmente el guion existente `juegos.js`: **78 actividades terminaron**, con tres avisos de tiempo en regar, alimentos que caen y Memoria. Se detuvo ese barrido para revisar los avisos, no se presenta como una ejecución completa de las 253 actividades.

El guion antiguo suelta la regadera en el mismo paso en que la mueve y no permite regar durante los segundos necesarios. Se añadió un control con ratón real que mantiene el arrastre hasta que crece cada flor, espera el retorno de la regadera y utiliza el número real de macetas para la edad del perfil. Las iteraciones previas del propio control se clasificaron como errores del guion y se conservaron como historial; no se registraron como fallos del juego.

Los avisos de tiempo de alimentos y Memoria no se consideran bugs confirmados: requieren una ejecución aislada con presupuesto suficiente. Tampoco se afirma haber verificado Safari, un móvil físico, funcionamiento sin conexión ni la calidad audible.

## Límites de las pruebas

Se usan partidas sintéticas para preparar progreso, ropa y estados de recompensa. En las pruebas de cofre, salida y arrastre se envían eventos reales de ratón al lienzo. El avance previo importado no se cuenta como actividades jugadas.

`__fast` omite el audio en la batería nueva. Las comprobaciones de voces se refieren a controles, manifiestos y selección; no certifican timbre, pronunciación, volumen ni ausencia de cortes de sonido.

