# Cobertura funcional y huecos pendientes

Actualizado: **24-10-2026**. Última campaña sobre el código del juego **v1.591**, `e1a8af377ce85cd41f8fe97adcb8d27a005aed6d`. El repositorio al comenzar era `d63f28e15032ce665f8f10f629716943027e3017`; entre ambas referencias solo cambiaban pruebas y documentación.

**No hay una medida instrumentada de cobertura por línea, función o rama.** Por tanto, no se puede afirmar un porcentaje ni decir que un módulo esté totalmente cubierto. Este documento describe cobertura funcional observada y separa una prueba existente de una prueba ejecutada y con aserciones útiles.

## Resultado de ampliar los huecos

Se añadieron **15 casos** en [cobertura.js](../tests/regresion/cobertura.js). Resultado consolidado: **9 controles pasan y 6 casos reproducen 5 incidencias**, B15–B19, pendientes en [bugs.md](../bugs.md). El regalo diario y el de cumpleaños se agrupan en B18, en lugar de inflar el número de bugs. No quedaron errores pendientes del guion en estos resultados.

| Hueco examinado | Evidencia nueva | Resultado |
|---|---|---|
| Dos pestañas escribiendo la misma partida | Completar una actividad con ratón en A, cambiar volumen en B, recargar A; control con una sola pestaña | **B15:** se pierde actividad, estadísticas y ocho monedas |
| Salidas alternativas del repaso | Atajo al mapa y elección de otra casita; control con botón de casa | **B16:** redirección indebida al repaso |
| Reloj con rendimiento bajo | Tres segundos reales a 10 FPS simulados, comparados con cadencia normal | **B17:** cuenta aproximadamente la mitad del tiempo |
| Entrega del regalo diario | Salir antes del temporizador y volver; control que espera y reentra | **B18:** día marcado como cobrado sin recibir tres monedas |
| Cumpleaños con datos válidos | Apagar las velas mediante ratón y salir o esperar; fecha bisiesta como control | **B18:** se pierde el premio de diez monedas y la pegatina al salir pronto |
| Vales cambiados con compra pendiente | Desactivar en el panel y confirmar después; compra/canje/recarga normales | **B19:** aún se compra un vale desactivado |
| Navegación por teclado | Escape desde el cofre cerrado | Pasa: entrega el premio una vez y sale |
| Arranque sin conexión con caché preparada | Service worker activo, navegador sin red y recarga | Pasa: portada y Three.js disponibles; no equivale a probar toda la PWA |

La batería escribe un resultado después de cada caso, incluye versión, referencia Git y huella SHA-256 del HTML, y permite filtros por identificador. Se conservan los [resultados detallados](QA-COBERTURA-2026-10-24.json).

## Qué continúa sin cobertura suficiente

| Área | Qué existe / qué se ha comprobado | Hueco pendiente | Prioridad |
|---|---|---|---|
| Progreso de las 253 actividades | Hay `juegos.js` y campañas anteriores; esta auditoría tiene un barrido parcial de 78 actividades terminadas | Verificar el catálogo completo actual, guardar resultado individual y repetir niveles 2/3; especialmente la mayor parte de Bosque, Montaña, inglés y fiestas | Alta |
| Navegación real | `camino.js`, recorrido manual inicial y nuevos eventos reales en casos concretos | Recorridos largos sin saltos `__cl.go`, todos los accesos y salidas alternativas, cambios de edad/modo durante una actividad | Alta |
| Recompensas y economía | B8–B19 y controles concretos de monedas, cofres, premios y canjes | Interrumpir **cada** entrega por recarga, salida, dormir y pérdida de foco; pagos simultáneos; cambios de precio/texto durante confirmación | Alta |
| Guardado y recuperación | Copias válidas/dañadas, tipado y dos pestañas probados | Cierre abrupto antes del checkpoint, varias pestañas con compras simultáneas, conflictos de inventario/canjes, escritura fallida y aviso comprensible a la familia | Alta |
| Límite de sesión | Existen pruebas de superar el umbral; nuevo reloj a 10 FPS | Recargas repetidas antes del guardado de 15 s, suspensión/reanudación del dispositivo y cambios de reloj; comprobar el límite tras corregir B17 | Alta |
| Audio real | Selección/manifest de voces; existen `audio.js` y `audio-espera.js`, con TTS simulada en parte | MP3 y TTS reales, cambio de voz a mitad de frase, inglés, latencia, primer toque, ocultar/reanudar y escucha de pronunciación/cortes | Alta |
| Safari / iPhone / iPad | No validados en esta campaña | WebKit y dispositivo físico, desbloqueo de audio, instalación y retorno desde segundo plano | Alta |
| PWA y red | Nuevo arranque offline con caché caliente | Primera instalación completa, caché fría, audios no descargados, actualización de una versión a otra con pestaña antigua abierta, fallo parcial de descarga | Alta |
| Móvil e input | Hay pruebas genéricas de tamaño/giro y casos de ratón | Touch real, dos dedos, `pointercancel`, arrastre fuera del lienzo, lápiz, teclado completo, zoom y distintas densidades de píxel | Media-alta |
| Repaso adaptativo | Salida normal/alternativa y premio cubiertos parcialmente | Selección exacta según fallos y antigüedad, cambios de día, lista vacía, todos terminados, mezcla de temas y datos viejos válidos | Media-alta |
| Calendario y cumpleaños | Cumpleaños actual, velas, recompensa y activación del 29/02 comprobados | Cruzar medianoche dentro de la misma asamblea, zonas horarias, cambio de hemisferio, cambio de mes/año y cumpleaños en año no bisiesto según la regla de producto | Media |
| Memoria y estabilidad | Se recorre entre escenas en varias baterías | Sesiones largas, crecimiento sostenido de memoria/GPU, restauración del contexto WebGL y rendimiento en una tableta lenta | Media |
| Accesibilidad | El panel HTML permite algunas interacciones automatizadas | Navegación y etiquetas con lector de pantalla, contraste, foco, tamaño de controles y equivalentes al lienzo usando teclado | Media |

## Por qué un resultado verde puede dar falsa confianza

- `juegos.js` y parte de `limites.js` llaman directamente a escenas o siguen la ayuda. Esto sirve para lógica, pero evita parte de los eventos reales del lienzo y de las rutas del mapa.
- `__fast` omite el audio: una actividad completada así no demuestra que la consigna se oiga entera.
- La matriz anterior de 36 ajustes comprueba controles y persistencia final; no son 36 partidas completas ni 36 pruebas acústicas.
- La prueba antigua `fecha-*` de `limites.js` prepara `bday: fecha.slice(5)`, una cadena. El juego espera `{m,d}`. Esa preparación no activa el cumpleaños; los nuevos controles utilizan el formato correcto.
- Un arrastre que se suelta en el mismo paso no sirve para regar. El control nuevo mantiene el gesto hasta que crece cada flor. Los avisos de tiempo del barrido no se publican automáticamente como bugs.
- Las entradas aleatorias y los límites de tiempo dependen del rendimiento. Deben repetirse de forma aislada antes de concluir que existe un bloqueo.

## Ajuste del entorno de pruebas

Al iniciar la prueba PWA se detectó un fallo **del servidor de pruebas en Windows**, no del juego: `lib.js` comprobaba `/` después de que `path.join` hubiera convertido la ruta a barras de Windows. La petición `/` devolvía 404 y el precache del worker no podía instalarse. Se corrigió la normalización en el servidor y se añadió un tiempo máximo de espera del worker. Después pasó el arranque sin conexión. Las únicas modificaciones son pruebas y documentación.

## Ejecutar

Con Playwright disponible, desde la raíz del repo:

```sh
node tests/regresion/lanzar.js cobertura.js .
node tests/regresion/lanzar.js cobertura.js . dos-pestanas
node tests/regresion/lanzar.js cobertura.js . pwa,vale,cumple
```

Para Chrome instalado, definir `PLAYWRIGHT_CHANNEL=chrome`; para Edge, `msedge`. Ver [instrucciones de instalación](../tests/regresion/AMPLIADA.md). Los resultados quedan en `tests/regresion/salida/cobertura*.json`, con capturas de los fallos. Salidas: 0 pasa todo, 1 hay fallos reproducidos, 2 hay un caso que no pudo ejecutarse.

La preparación utiliza partidas sintéticas en contextos aislados y no representa todo el avance previo como jugado. Los cambios de preferencias emplean sus controles DOM; los juegos, velas y compras indicados envían eventos reales al lienzo. No se utiliza la partida personal del navegador.

