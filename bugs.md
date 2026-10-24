# Bugs de Curiolandia 3D — pendientes

Fecha: 23 de octubre de 2026. Web: https://fercala.github.io/curiolandia-3d/

Versión probada: v1.585. Código consultado en `80d2a5efcf7fc830172a6cd40c8870f80524060b`.

Pruebas con clics y arrastres sobre la web publicada en el navegador integrado de Codex, Chromium en Windows. Perfil nuevo llamado «Prueba». Durante las pruebas no se modificó el código del juego.

## Estado del registro

**Ampliación 24-10-2026:** siete fallos nuevos **B8–B14 PENDIENTES**, reproducidos automáticamente sobre v1.591. Véanse la ampliación al final, las [instrucciones de Playwright](tests/regresion/AMPLIADA.md) y el [informe de resultados](docs/QA-AUTOMATIZADA-2026-10-24.md). Los estados históricos de B1–B7 se mantienen.

**Actualización (23-10-2026): B1-B6 resueltos en v1.587 y B7 verificado en v1.586; detalles en cada apartado y en docs/HALLAZGOS-PRUEBAS.md.** Texto original: todos los hallazgos quedan **PENDIENTES** de resolución o de verificación. La evidencia corresponde a **v1.585**, no a una nueva prueba de la versión actual. Al guardar este registro, `main` ya contiene **v1.586** (referencia consultada: `dc71633a94120dda3326f0d44dc98279745b2b83`). Esa versión declara corregido B7 y varios problemas de audio del informe anterior. B7 queda **PENDIENTE DE VERIFICAR EN v1.586**, no se presenta como fallo confirmado de esa versión.

Las capturas originales y la copia de la partida de prueba se conservan fuera del repositorio; no se incluyen enlaces a archivos locales que no puedan abrirse desde GitHub.

Para cerrar un hallazgo: aplicar o identificar el arreglo, ejecutar sus pasos de reproducción y regresión, anotar la versión y el commit, y cambiar el estado a **RESUELTO** únicamente tras comprobar el resultado.

## Qué significa cada resultado

- **Reproducido jugando:** observado con la interfaz real y contrastado con el código.
- **Validación reproducida:** la interfaz acepta una entrada incorrecta; no implica que se haya confirmado la importación destructiva.
- **Referencia previa:** procede del informe ya existente en el repositorio; no es una reproducción independiente de esta sesión.

La herramienta permite observar imágenes, estados de controles y errores de consola, pero no escuchar directamente el sonido. Las pruebas de voces verifican selección, cambios y avance de las actividades; no certifican timbre, pronunciación, volumen audible ni cortes sonoros. No se ha utilizado `__fast`, ni se han inyectado estados para marcar juegos como terminados.

## Resumen

| ID | Estado | Hallazgo | Gravedad | Evidencia de esta sesión |
|---|---|---|---|---|
| B1 | RESUELTO (v1.587) | «Conocer» no se puede terminar al repetir sin recargar | Alta | Reproducido jugando |
| B2 | RESUELTO (v1.587) | Memoria omite las parejas incorrectas en las estadísticas | Media | Dos fallos reales y resultado de 100 % |
| B3 | RESUELTO (v1.587) | Libre/edad no actualizan el mapa 3D que ya estaba abierto | Media | Mapa gris pero acceso permitido |
| B4 | RESUELTO (v1.587) | El gorro del cofre no aparece inmediatamente en Tito 3D | Baja | Comparación antes/después de cambiar escena |
| B5 | RESUELTO (v1.587) | El centro de «saltar introducción» activa la región del candado | Media | Centro no funciona; borde izquierdo sí |
| B6 | RESUELTO (v1.587) | Las estrellas tapan el texto DÍA/NOCHE del juego de giro | Media | Reproducido en estados día y noche |
| B7 | RESUELTO (v1.586) | La validación acepta una copia con `temas:null` | Alta potencial al importarla | Aceptación reproducida; importación incorrecta no confirmada |

Prioridad propuesta: B1 primero; verificar la corrección de B7 en v1.586 por su posible efecto sobre partidas; después B3/B2 por acceso y seguimiento del aprendizaje. B4 es visual y puede esperar.

## B1. Repetir «Conocer» sin recargar deja el juego sin posibilidad de terminar

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: `Conocer` hace copias propias de las tarjetas con `seen: 0` (comps.js). Comprobado: terminar «Conocer» tres veces seguidas sin recargar.

**Gravedad: alta. Estado: reproducido jugando.** Ya estaba advertido como deducción en `docs/PROBLEMAS-CONOCIDOS.md`; aquí se ha reproducido.

### Reproducción

1. Elegir 3 años y modo Camino.
2. Entrar en «Mi cole», primera estación («Conocer»).
3. Abrir las nueve tarjetas y cerrar la última. Se completa, da la estrella y tres monedas.
4. Volver a entrar en la primera estación **sin recargar la página**.
5. Las nueve tarjetas aparecen con su estrella de vistas, mientras el marcador superior está a cero y se muestra «Nivel 2».
6. Volver a tocar una tarjeta: se abre y habla, pero el contador no aumenta.

**Esperado:** una repetición nueva que permita ver todas las tarjetas y finalizar.

**Causa:** `Conocer` (`src/comps.js:282`) usa `cfg.items.map(o => typeof o === 'string' ? {k:o} : o)`. Conserva las referencias de los objetos de `t.words` y escribe `seen` en ellos. El siguiente componente reinicia `done=0`, pero conserva todos los `seen`; `show()` solo incrementa si `!it.seen`.

**Solución propuesta:** crear objetos propios de cada partida y reiniciar `seen` explícitamente. Por ejemplo, convertir cada entrada en una copia y establecer `seen: 0` antes de asignar posiciones. No modificar los datos originales del tema. Una copia que conserve un `seen` anterior no basta.

**Regresión necesaria:** terminar y repetir dos veces; salir después de ver solo dos tarjetas y volver a entrar; probar temas con tarjetas representadas por objetos y por cadenas. No cambiar los identificadores ni el formato guardado.

**Solución temporal:** recargar la página antes de repetir. El progreso ya guardado se conserva; las marcas temporales de los objetos se recrean.


## B2. Memoria muestra 100 % aunque se hayan hecho parejas incorrectas

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: una pareja errada cuenta como fallo (`rec('memoria', false)`) cuando una de las dos cartas ya se había visto, es decir, cuando se podía saber dónde estaba su pareja; destapar cartas nuevas es explorar y no cuenta. Sigue sin dar monedas por pareja (decisión pendiente, en PROBLEMAS-CONOCIDOS).

**Gravedad: media. Estado: reproducido jugando.** Afecta a la información familiar y potencialmente al repaso.

### Reproducción

1. Entrar en «Mi cole», estación de Memoria, con 3 años.
2. Destapar cartas distintas y esperar a que vuelvan a darse la vuelta.
3. En esta prueba se hicieron dos parejas incorrectas: tobogán+silla y silla+pelota.
4. Completar después las tres parejas correctas.
5. Abrir Zona de adultos → «Cómo le va».

**Resultado:** «Memoria — 100 % — 3 intentos». Los dos intentos incorrectos no aparecen. El juego sí termina y entrega las tres monedas de finalización.

**Causa:** `Memoria` en `src/comps.js` llama a `rec('memoria', true)` al acertar una pareja; la rama de parejas diferentes no llama a `rec(..., false)`. El repaso utiliza estas estadísticas y las del juego para detectar dificultades, por lo que esos fallos no pueden influir en la selección.

**Solución propuesta:** definir una métrica adecuada para Memoria. Si la columna sigue llamándose «Intentos», registrar tanto las parejas correctas como las incorrectas. Si no se desea tratar la exploración de cartas desconocidas como error, presentar otra métrica explícita —por ejemplo, turnos por pareja— y adaptar el repaso. Evitar mostrar 100 % como resultado general cuando solo se están contabilizando aciertos.

**Nota relacionada:** tampoco llama a `onRight`, por lo que no concede monedas por pareja acertada. Esa omisión ya está documentada en el repositorio; conviene decidir si es una excepción de diseño o debe seguir la regla general de monedas por acierto.


## B3. Activar Libre o cambiar la edad no refresca el aspecto del mapa 3D abierto

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: si al cerrar la zona de adultos cambiaron la edad o el modo libre, se vuelve a abrir el mapa, el camino o la casita 3D actuales, sin saludo; el cofre no se reabre. Si no cambió nada, no se rehace.

**Gravedad: media. Estado: reproducido jugando.** La navegación funciona, pero los candados y el aspecto cerrado contradicen los permisos actuales.

### Reproducción

1. Estar en el mapa con perfil de 3 años, Camino y solo un tema completado.
2. Abrir Zona de adultos.
3. Activar Libre y cambiar a 4 años.
4. Pulsar «Volver al juego».
5. Observar que Bosque y Montaña siguen grises y los extras conservan sus requisitos/candados.
6. Tocar el Bosque: se puede entrar y dentro todas las casitas están abiertas.
7. Salir y volver al mapa: al reconstruirse, aparece actualizado.

**Causa:** los controles cambian `S.unlockAll`/`S.age`, pero `closeAdult()` solo oculta el panel y reinicia el reloj de sesión. `buildMap()` creó los modelos, candados y colores con los valores anteriores; no hay una actualización equivalente al cambio de permisos.

**Solución propuesta:** invalidar o actualizar el mundo visual al cambiar modo/edad. En mapa, zonas y casitas se pueden reconstruir las representaciones de bloqueo al cerrar el panel. No reejecutar indiscriminadamente `enter()` de cualquier escena: por ejemplo, el cofre tiene efectos persistentes y no debería contarse ni recompensarse de nuevo.

**Regresión necesaria:** Camino→Libre, Libre→Camino, 3→4→5 años y el sentido inverso, desde mapa y desde casitas; comprobar tanto aspecto como acceso.


## B4. El gorro del cofre se guarda pero Tito 3D no lo muestra en esa pantalla

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: `grantGift()` llama a `__w3.retito()` cuando el regalo es ropa y la escena es 3D: Tito se pone el gorro junto al cofre.

**Gravedad: baja. Estado: reproducido jugando.** Es un fallo visual de actualización, no pérdida de la recompensa.

### Reproducción

1. Completar «Mi cole» por primera vez.
2. Tocar tres veces el cofre.
3. Recibir «El gorrito de fiesta» y diez monedas.
4. Observar a Tito junto al cofre: sigue sin gorro.
5. Continuar y volver al mapa: ahora sí lleva el gorro.

**Causa:** `grantGift()` llama a `wear()`, que actualiza `S.tito` y guarda, pero el modelo del cofre ya se había construido. `makeTito()` añade el sombrero al crear el personaje, no en su actualización por cuadro. No se llama a `retito()` tras equipar el premio.

**Solución propuesta:** notificar a la capa 3D cuando cambie la ropa/equipamiento y reconstruir las piezas del personaje dentro del grupo actual, reutilizando el mecanismo `retito()` ya disponible. Mantener su posición, paseo, animación y cámara.


## B5. El centro de la flecha para saltar la introducción no responde

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: el candado solo responde a 50 px de su dibujo (1546, 852); el centro del botón (1500, 820) salta el cuento. Comprobado con el ratón de verdad, y el candado sigue abriendo la zona de adultos.

**Gravedad: media. Estado: reproducido jugando dos veces**, al inicio con el caracol y al volver a la introducción con Tito conejo.

### Reproducción

1. Abrir el cuento inicial, desde una partida nueva o desde Zona de adultos → «Ver el cuento del inicio».
2. Tocar el centro de la flecha blanca de abajo a la derecha: la introducción continúa.
3. Tocar el borde izquierdo del mismo botón: se salta correctamente al mapa.

En la pantalla lógica de 1600×900, el centro está en `(1500,820)`. La región global del candado de adultos comienza en `x>1490, y>800`: el manejador de `pointerdown` (`src/adult.js:195`) captura ese toque y retorna antes de llamar al `down` de la introducción. El candado y el botón de saltar se solapan.

**Solución propuesta:** separar las regiones interactivas. Mover uno de los controles o desactivar la región global del candado en `intro` si esa pantalla no debe tener candado; hacer coincidir el área de toque del candado con el icono visible. Comprobar centro, bordes y pulsación prolongada del botón.


## B6. Las estrellas tapan el cartel «DÍA / NOCHE» al girar la Tierra

**Estado de resolución: **RESUELTO en v1.587** (commit `3a86083`, publicado en `1fe4d78`). Reproducido antes en la v1.586 y comprobado en la v1.587 con `tests/regresion/informe-b.js`; además, los 253 juegos y los 45 casos límite pasan con la v1.587.** Arreglo: el cartel de `Gira` baja a y = 214, debajo de las estrellas de rondas y del cartel «Nivel».

**Gravedad: media. Estado: reproducido jugando.** El giro y las rondas avanzan, pero se oculta información de la actividad.

### Reproducción

1. Activar Libre y elegir 5 años.
2. Entrar en «El universo», segunda actividad («El día y la noche»).
3. Girar la Tierra para colocar a Leo en la parte oscura y luego en la iluminada.
4. Mirar la esquina superior derecha: las cuatro estrellas están encima del cartel del estado. Solo asoma parte del icono inferior; las palabras quedan tapadas.

**Causa:** `Gira.draw()` (`src/comps2.js`) dibuja su cartel en `(1260,60,300,96)`. Después, `SCENES.juego.draw()` dibuja `drawRounds()` por encima. Con cuatro rondas, el marcador ocupa `(1266,36,294,88)`, justo sobre el texto del cartel.

**Solución propuesta:** reservar un espacio distinto para el estado, por ejemplo debajo del marcador de rondas, o permitir que la actividad indique una posición alternativa del marcador. Revisar también la etiqueta «Nivel» en las repeticiones para evitar otro solapamiento.

**Regresión necesaria:** estados día, noche y transición; primera partida y repeticiones; comprobarlo tanto en ventana estrecha como horizontal. El solapamiento existe en coordenadas lógicas, por lo que no depende solo del tamaño de esta ventana.


## B7. La validación de copias acepta `temas:null`

**Estado de resolución: RESUELTO en v1.586** (commit `dc71633`), verificado: con la v1.586 `bkDecode()` rechaza `{"temas":null}`, `{"temas":[]}`, `[]` y `null`, y acepta `{"temas":{}}` (`tests/regresion/informe-b.js`). Además, al cargar, `sanoS()` deja con su valor por defecto los campos `null` o de tipo imposible, respetando los que pueden ser `null` (cumpleaños, repaso, vales...).

**Gravedad: alta potencial al importarla. Estado: validación reproducida.** El fallo ya estaba descrito como G1 en el informe previo del repositorio. **Actualización al registrar:** [CAMBIOS.md de v1.586](https://github.com/fercala/curiolandia-3d/blob/dc71633a94120dda3326f0d44dc98279745b2b83/docs/CAMBIOS.md) declara que `temas:null` ya se rechaza. Falta repetir esta comprobación sobre esa versión; la reproducción y la causa siguientes describen v1.585.

### Reproducción

1. En una partida de prueba, abrir Zona de adultos → Copia de seguridad.
2. Pegar `{"temas":null}` en el campo del código.
3. Pulsar «Recuperar con este código».
4. La interfaz muestra «Copia encontrada: 0 temas terminados, 0 juegos jugados y 0 monedas» y ofrece «Sí, recuperar esta copia».

**Esperado:** rechazar el contenido por estructura inválida antes de ofrecer su importación.

**Límite de esta reproducción:** no se confirmó la importación de ese contenido incorrecto. Por tanto, en esta sesión se ha comprobado la aceptación indebida, no el posterior bloqueo del juego. El bloqueo tras importar ya está descrito por las pruebas anteriores del repositorio y concuerda con el código que después utiliza `S.temas` como objeto.

**Causa:** `bkDecode()` (`src/adult.js:281`) comprueba `typeof d.temas === 'object'`; en JavaScript, eso también es cierto para `null`. `load()` copia después los datos sobre los valores iniciales sin una validación completa de tipos.

**Solución propuesta:** validar el esquema antes de importar y también al cargar partidas. `temas`, `stats`, `days` y otros mapas deben ser objetos no nulos y no arrays; validar sus estructuras internas. Tratar por separado los campos cuyo valor nulo sí es válido, como cumpleaños o repaso sin preparar. No eliminar indiscriminadamente todos los `null`.

**Control positivo:** también se generó una copia válida `CURIO1`, se leyó como «1 tema, 7 juegos y 56 monedas», se restauró esa misma copia y se verificaron después las 7 estrellas, 56 monedas, el cofre, Libre, edad 5, conejo y voz del navegador. La copia válida quedó guardada fuera del repositorio.


## Cobertura real de esta sesión

- Alta con nombre «Prueba», 3 años, Camino, asamblea completa con una respuesta incorrecta.
- «Mi cole» completado: Conocer, búsqueda, dentro/fuera con arrastres, Memoria y cuento de cuatro páginas con dos preguntas.
- Repetición de Conocer, fallos deliberados, ayudas automáticas, apertura sucesiva de estaciones y cofre.
- Recompensas verificadas: 5 juegos terminados, 1 tema completo, 1 cofre, gorro y saldo de 41 monedas al terminar el tema.
- Voz principal, Voz de Fer y Solo voz del navegador seleccionadas en distintas partes del recorrido, sin recargar ni perder el avance.
- Cambio de España a rioplatense y de Camino a Libre; acceso al Bosque a los 4 años y a la segunda actividad de Emociones sin pasar por la primera.
- «¿Cómo se siente?» de Las emociones terminado: cinco rondas con el perfil de 4 años, rioplatense y Voz de Fer seleccionada. La dificultad pasó de tres a cuatro opciones después de varios aciertos.
- «El día y la noche» de El universo terminado: cuatro rondas con arrastres, perfil de 5 años, España, Solo voz del navegador y Tito conejo.
- Introducción revisitada y comparación de dos zonas del botón de saltar.
- Copia válida generada, guardada y restaurada; progreso y ajustes verificados después de la recarga.
- Copia incorrecta con `temas:null` aceptada en la fase de validación, sin llegar a importarla.
- Las consultas de consola realizadas durante el recorrido no devolvieron errores ni avisos. Esto no garantiza ausencia de errores en las actividades no recorridas.

**Resultado final:** siete juegos distintos terminados, un tema completo y un cofre; además, una repetición de Conocer bloqueada. Se conservaron 56 monedas y siete estrellas tras restaurar la copia.

**No se ha completado todo el juego:** el repositorio contiene 253 actividades según su informe previo. Esta fue una prueba manual de recorridos y casos concretos, no una ejecución exhaustiva de las 253 actividades en todas las combinaciones de edad, modo y voz. Tampoco se probó en un móvil físico, Safari/iOS, sin conexión ni con un límite de tiempo completo.

## Audio y pruebas anteriores: qué queda por confirmar

El repositorio ya contiene [HALLAZGOS-PRUEBAS.md](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/docs/HALLAZGOS-PRUEBAS.md), con pruebas automáticas previas. Sus afirmaciones de que se completaron las 253 actividades no proceden de esta sesión.

En el corte de v1.585, ese informe señala interrupciones de voz por la ayuda automática, explicaciones cortadas después de fallar y un posible problema de reproducción en Safari. Los dos primeros concuerdan con que `drawHelp()` puede llamar a `prompt()` mientras `talking` sigue activo, y con el encadenamiento de callbacks de frases canceladas. Sin embargo, **no se declaran aquí como cortes de sonido escuchados o medidos independientemente**. La voz del navegador estaba simulada en parte de aquellas pruebas, y el propio informe indica que algunas mediciones debían repetirse.

**Actualización:** v1.586 declara correcciones de los cortes de audio y un desbloqueo del reproductor en el primer toque. No se han repetido aquí esas pruebas ni la escucha directa. Estos puntos quedan pendientes de verificación, no como errores nuevos confirmados de v1.586.

Para una siguiente campaña de audio: escuchar y medir MP3/TTS reales; comparar las tres voces; permanecer quieto en páginas largas de cuentos; provocar dos errores seguidos en un arrastre; repetir en Safari de iPhone/iPad y con el primer toque de la sesión.

## Referencias de código consultadas

- [Conocer y Memoria](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/comps.js).
- [Ayudas, voz y marcador de rondas](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/core.js).
- [Ajustes, entrada y validación de copias](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/adult.js).
- [Construcción de mundos y Tito 3D](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/world3d.js).
- [Equipamiento](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/tienda.js).
- [Actividad Gira](https://github.com/fercala/curiolandia-3d/blob/80d2a5efcf7fc830172a6cd40c8870f80524060b/src/comps2.js).

Este archivo registra hallazgos y propuestas. Su incorporación no modifica el código del juego. Las correcciones previas declaradas por v1.586 deben verificarse como se indica arriba.


## Ampliación automatizada — 24-10-2026 (v1.591)

Referencia probada: `e1a8af377ce85cd41f8fe97adcb8d27a005aed6d`. Playwright con Chrome sin ventana en Windows, sirviendo una copia local exacta del repositorio. Se usan partidas sintéticas para preparar casos concretos y eventos reales de ratón donde se indica. No se modificó el código del juego. `__fast` omite la espera de audio: estos resultados no certifican el sonido audible. Esta ampliación es independiente del recorrido manual original.

| ID | Estado | Hallazgo | Gravedad |
|---|---|---|---|
| B8 | PENDIENTE | El armario pierde acceso a ropa cuando aumenta la colección | Media |
| B9 | PENDIENTE | Recargar antes de abrir el cofre pierde su recompensa | Alta |
| B10 | PENDIENTE | Salir de la celebración del repaso pierde cinco monedas | Media |
| B11 | PENDIENTE | Los muebles grandes quedan recortados tras arrastrarlos al borde | Baja |
| B12 | PENDIENTE | Un objeto en la región de Tito queda imposible de mover | Media |
| B13 | PENDIENTE | La vista previa de una copia interpreta HTML del saldo | Alta, seguridad |
| B14 | PENDIENTE | Estructuras internas inválidas en copias rompen pantallas | Media |

### B8. El armario deja prendas fuera de la pantalla

**Estado: PENDIENTE. Gravedad: media. Reproducido en v1.591**, además de observado manualmente en v1.586 con una copia de prueba.

1. Reunir ropa y colores suficientes (la prueba prepara las 19 prendas existentes en `SHOP` como propias; no afirma haberlas comprado jugando).
2. Entrar en Casa de Tito.
3. Observar la fila inferior: el caparazón rosa aparece parcialmente cortado y las prendas posteriores no son visibles ni tienen un control para alcanzarlas.
4. Con la colección completa, quedan fuera los caparazones verde, violeta y dorado y las cuatro bufandas.

**Resultado medido:** los centros de las siete prendas inaccesibles están entre x=1670 y x=2270, fuera del lienzo lógico de 1600 px. La ventana más ancha no lo soluciona: las coordenadas del juego son fijas.

**Causa:** `SCENES.casaTito.wardrobe()` en [src/tienda.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/tienda.js) coloca todas las prendas en `x:470+i*100`, sin paginación ni desplazamiento. Solo limita el fondo del armario, no la lista de prendas.

**Posible arreglo:** paginar el armario o abrir un selector por categorías, garantizando que cada prenda propia tenga un control visible. Mantener los identificadores y la partida guardada.

**Solución temporal:** equipar las prendas desde las categorías de la tienda.

**Prueba automatizada:** caso `armario` de `tests/regresion/ampliada.js`; comprueba los límites de todas las prendas.

### B9. El premio del cofre se pierde si se recarga antes de abrirlo

**Estado: PENDIENTE. Gravedad: alta. Reproducido en v1.591.**

1. Completar el último juego pendiente de un tema que todavía no se había terminado.
2. Esperar hasta que aparezca el cofre cerrado.
3. Recargar la página o cerrar y volver a abrir el juego **antes de tocar tres veces el cofre**.
4. Volver al tema.

**Esperado:** recuperar el cofre pendiente o recibir la recompensa una sola vez.

**Resultado:** el tema está terminado, todos sus juegos están hechos y el contador de cofres ha subido, pero el regalo y las diez monedas no se han entregado. Volver al tema no ofrece un cofre pendiente; repetir un juego no vuelve a activar la primera finalización.

**Evidencia automatizada:** se prepara «Mi cole» con todos sus juegos hechos salvo «Conocer», y se completa ese juego con eventos reales de ratón siguiendo sus ayudas. Al llegar al cofre: `done=1`, `cofres=1`, regalo previsto `gorroFiesta`, `coins=3`, sin ropa propia. Tras recargar y abrir la casita: `done=1`, `cofres=1`, `coins=3`, sin gorro, `nextGameOf=-1`. Los tres créditos son los de finalizar el juego; faltan los diez del cofre. Es una preparación sintética del progreso anterior, seguida de la finalización real de una actividad, no una partida completa desde cero.

**Causa:** `finishGame()` en [src/scenes.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/scenes.js) guarda `st.done=1` antes de ir al cofre. En [src/zonas.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/zonas.js), `cofre.enter()` guarda el contador, pero el regalo seleccionado y `rewarded` solo existen en memoria. No hay una recompensa pendiente persistente que se recupere al arrancar. La protección al salir con el botón de casa no cubre una recarga.

**Posible arreglo:** guardar una transacción de recompensa pendiente por tema y recuperarla al arrancar; entregar y marcar como cobrada de forma idempotente. Conservar el regalo elegido. Cubrir también salir durante la felicitación anterior al cofre y el cambio de escena por límite de sesión, sin duplicar regalos ni monedas.

**Regresión:** recargar con cero, uno y dos toques; recargar durante la felicitación; salir normalmente; completar y repetir el tema; comprobar que cada premio se entrega exactamente una vez.

**Prueba automatizada:** caso `cofre-recarga` de `tests/regresion/ampliada.js`.


### B10. Salir de la celebración del repaso pierde las cinco monedas

**Estado: PENDIENTE. Gravedad: media. Reproducido en v1.591.**

1. Terminar el último juego del repaso diario.
2. Al regresar a la pantalla del repaso, tocar la casa antes de que termine la celebración.
3. Volver a entrar en el repaso.

**Resultado:** el repaso figura como pagado (`S.rep.paid=1`) y completo, pero no se suman las cinco monedas, ni se vuelven a entregar al regresar. El control que permanece en la pantalla sí recibe cinco monedas.

**Preparación automatizada:** un repaso sintético con una actividad ya hecha y `paid=0`; se entra en la pantalla de entrega y se pulsa el botón de casa con un evento real de ratón, tras permitir la entrada de eventos durante la transición y antes del temporizador de celebración. La vuelta comprueba `paid=1, coins=0`. No se simula una escucha real.

**Causa:** [src/repaso.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/repaso.js), `SCENES.repaso.enter()`, guarda `R.paid=1` antes de ejecutar `later(500,...)` y de la callback de voz que llama a `giveCoins(5,...)`. Al cambiar de escena se anula ese temporizador/callback, pero la marca de cobrado permanece.

**Posible arreglo:** contabilizar la recompensa una sola vez antes de iniciar los efectos y la voz; o guardar una entrega pendiente y marcarla pagada únicamente al acreditar las monedas. La animación debe poder cancelarse sin cancelar la entrega.

**Regresión:** salida inmediata, salida durante la voz, recarga, límite de sesión y permanencia normal. Una sola entrega de cinco monedas.

**Pruebas:** `repaso-salida` reproduce el fallo; `repaso-espera` es el control positivo.

### B11. Arrastrar muebles grandes al borde derecho los deja recortados

**Estado: PENDIENTE. Gravedad: baja. Reproducido con ratón real en v1.591.**

1. Tener abierto el dormitorio y colocar una cama.
2. Arrastrarla hacia el borde derecho y soltarla.
3. Parte de la cama queda fuera de la pantalla.

**Evidencia:** cama de tamaño 300, centro guardado en x=1500, extremo derecho x=1650, lienzo de ancho 1600. El caso parte de una cama propia en una habitación abierta mediante una partida de prueba; el arrastre pasa por los eventos reales del lienzo.

**Causa:** [src/tienda.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/tienda.js), `SCENES.casaTito.up()` limita todos los centros a `x<=1500` sin considerar `HSIZE[id]`. `homeSpot()` sí utiliza el tamaño al colocar objetos nuevos; ese límite se pierde al moverlos.

**Posible arreglo:** limitar según la caja visual de cada objeto, reutilizando la regla de colocación inicial, con margen a ambos lados. Revisar también los objetos muy altos y los de pared.

**Prueba:** `arrastre-borde`. El control `arrastre-normal` confirma que un movimiento normal se guarda y sobrevive a recargar.

### B12. Un objeto puede quedar imposible de mover si se coloca en la zona de Tito

**Estado: PENDIENTE. Gravedad: media. Reproducido con dos arrastres reales en v1.591.**

1. Tener el robot en el salón.
2. Arrastrarlo desde el suelo hasta que su posición quede aproximadamente en `(440,600)` (centro inferior del objeto).
3. Intentar arrastrarlo de nuevo desde su parte visible.

**Resultado:** responde Tito; el robot no se selecciona y permanece en su sitio. Para el robot, toda su región de selección queda dentro de la región que intercepta Tito. No basta con tocar otro punto del robot.

**Evidencia:** después del primer arrastre, posición `{x:440,y:600,r:'salon'}`. El segundo arrastre, desde `(440,530)` hasta otra zona del suelo, no modifica la posición. `itemAt(440,530)` encuentra el robot, pero el manejador anterior de Tito consume el toque. La región del robot (x≈363,5–516,5; y≈455,5–610) está dentro de la región de Tito (x=250–630; y=335–665).

**Causa:** [src/tienda.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/tienda.js), `SCENES.casaTito.down()`, procesa primero `inR(x,y,440,500,380,330)` y retorna antes de consultar `itemAt()`. El arrastre permite soltar objetos dentro de esa región.

**Posible arreglo:** dar prioridad al objeto visible bajo el puntero, reducir la región de Tito a su dibujo o impedir soltar objetos en zonas que después no permiten seleccionarlos. Añadir una opción de recolocar objetos si se necesitan zonas reservadas.

**Regresión:** robot y otros objetos pequeños junto a Tito, mascota y armario; volver a moverlos, cambiar de habitación y recargar. Los controles de Tito deben seguir respondiendo donde se ven.

**Prueba:** `arrastre-tito`; `arrastre-normal` verifica el arrastre fuera de la zona conflictiva.


### B13. La vista previa de una copia interpreta HTML incluido en el saldo

**Estado: PENDIENTE. Gravedad: alta (seguridad). Reproducido en v1.591 en un origen local aislado.**

1. Abrir Zona de adultos → Copia de seguridad.
2. Pegar una copia JSON con `temas:{}` y un campo `coins` de tipo texto que contenga HTML.
3. Pulsar «Recuperar con este código», **sin confirmar la importación**.

**Resultado:** el resumen inserta ese texto como HTML y ejecuta manejadores de eventos. La prueba usa únicamente una imagen inválida cuyo evento establece una variable local (`window.__qaXss=1`); no extrae información, no modifica la partida y no envía datos a terceros. Se comprueba `executed=true` y que la interfaz ofrece confirmar la copia.

**Alcance:** exige introducir una copia manipulada. No es una ejecución espontánea al abrir el juego; ocurre al previsualizar contenido no fiable. En la web publicada, el código inyectado tendría el origen de esa web.

**Causa:** en [src/adult.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/adult.js), `bkDecode()` valida la raíz y `temas`, pero permite un saldo de texto. `bkWire().ask()` incluye `${d.coins||0}` en el HTML del mensaje sin escaparlo. El nombre sí pasa por `esc()`; el saldo no.

**Posible arreglo:** exigir que el saldo sea un número finito válido antes de presentar la copia, y construir los datos variables del resumen con `textContent` o escaparlos todos. Validar no sustituye el uso seguro del DOM.

**Regresión:** saldo numérico válido, texto normal, texto con etiquetas, nombres con HTML y copias CURIO0/CURIO1/JSON. La previsualización nunca debe ejecutar contenido de la copia ni reemplazar la partida antes de la confirmación.

**Prueba:** `copia-html-monedas`; demostración inocua y limitada a una variable de la página.

### B14. Las copias con estructuras internas inválidas pasan el filtro y rompen pantallas

**Estado: PENDIENTE. Gravedad: media. Cuatro variantes reproducidas en v1.591; se agrupan por la misma validación incompleta.**

**Reproducción:** en una partida de prueba, recuperar una copia con raíz y `temas` válidos pero con una de estas estructuras internas. Confirmar la recuperación y abrir la pantalla indicada. Las pruebas automatizadas escriben la misma estructura en el almacenamiento antes del arranque, comprueban además que `bkDecode()` la acepta y abren la pantalla; no recorren el diálogo de confirmación para cada variante.

| Campo de la copia | Pantalla afectada | Resultado observado |
|---|---|---|
| `stats: {busca:null}` | Zona de adultos | Excepción al leer `ok`; no puede construirse el panel |
| `home: {robot:null}`, `owned: {robot:1}` | Casa de Tito | Excepción al leer `x` |
| `vales: [null]` | Tienda | Errores repetidos al leer `on`; falla el dibujo |
| `temas: {'3A-T1':{g:null,done:0}}` | Casita de Mi cole | Excepción al consultar el siguiente juego (`g[0]`) |

Se mantiene el resto de una partida normal en cada fixture. No se afirma que estas estructuras aparezcan en una partida guardada correctamente por el juego. Es un fallo de recuperación y validación frente a copias dañadas o editadas.

**Control:** una entrada nula en `gs` no provocó un fallo en el recorrido concreto probado; no se incluye como quinta reproducción confirmada.

**Causa:** [src/core.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/core.js), `sanoS()`, comprueba los tipos del primer nivel. Dentro de `temas` solo elimina entradas que no sean objetos; no repara `g:null`. Los consumidores de estadísticas, muebles y vales presuponen entradas internas correctas. La corrección B7 de la raíz `temas:null` sigue siendo válida; estos casos son más profundos.

**Posible arreglo:** un esquema compartido para validar la copia antes de confirmarla y sanear el almacenamiento al arrancar. Validar cada entrada de `temas/g`, `stats`, `home`, `vales` y mapas similares; rechazar copias incompatibles o recuperar las partes válidas con un mensaje claro. Respetar los campos donde `null` sí es legítimo.

**Regresión:** las cuatro variantes de arriba, una copia mínima válida, una partida antigua válida, exportar/recuperar una partida normal y conservar ajustes/progreso. El usuario debe poder acceder siempre a una vía de recuperación.

**Pruebas:** `copia-anidada-stats`, `copia-anidada-home`, `copia-anidada-vales` y `copia-anidada-tema-g`.


### Resultado final de la ampliación automática

Batería nueva: **17 casos ejecutados**, con **7 controles que pasan** y **10 verificaciones que reproducen los siete bugs B8–B14** (B14 agrupa cuatro variantes). **Cero errores pendientes del guion** en el resultado consolidado; el historial de ajustes del control de regar se conserva en el JSON. Matriz de **36 combinaciones de ajustes** correcta, más **3 pruebas existentes de selección de voces** correctas. No son 36 partidas completas ni una certificación acústica.

El recorrido general fue parcial: 78 actividades terminaron y tres dieron avisos de tiempo; esos avisos no se publicaron como bugs. Regar se comprobó después con un arrastre sostenido correcto y terminó. No se afirma haber completado las 253 actividades en esta campaña.

- [Prueba nueva](tests/regresion/ampliada.js), [lanzador para Chrome/Edge/Chromium](tests/regresion/lanzar.js) e [instrucciones](tests/regresion/AMPLIADA.md).
- [Informe de la campaña](docs/QA-AUTOMATIZADA-2026-10-24.md) y [resultados detallados JSON](docs/QA-AUTOMATIZADA-2026-10-24.json).

Solo se han añadido pruebas y documentación; no se han aplicado las soluciones propuestas al juego.


## Nuevos huecos de cobertura — 24-10-2026 (v1.591)

Campaña sobre el mismo código del juego `e1a8af377ce85cd41f8fe97adcb8d27a005aed6d`; el estado remoto al comenzar era `d63f28e15032ce665f8f10f629716943027e3017`, que solo añade pruebas y documentación. Playwright y Chrome en Windows. Preparaciones sintéticas, eventos de interfaz y controles positivos identificados por caso.

### B15. Una segunda pestaña puede borrar progreso y monedas guardados por la primera

**Estado: PENDIENTE. Gravedad: alta. Reproducido con dos pestañas del mismo contexto/origen.**

1. Abrir el juego en dos pestañas con la misma partida.
2. En la primera, terminar una actividad.
3. En la segunda, que seguía abierta desde antes, abrir Zona de adultos y cambiar el volumen de música.
4. Recargar la primera pestaña.

**Resultado:** desaparecen la actividad terminada, sus estadísticas y las monedas obtenidas. El ajuste de volumen de la segunda pestaña sí se conserva.

**Evidencia:** se completa la búsqueda de «Mi cole» mediante ratón real. Primera pestaña: `g[1]=1`, saldo 108 y cinco aciertos. Tras cambiar el volumen en la segunda y recargar: `g[1]=0`, saldo 100, volumen 0,2. El caso de control, haciendo exactamente ese cambio en una única pestaña, conserva la actividad y las 108 monedas.

**Causa:** [src/core.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/core.js), `load()` mantiene una copia de `S` en memoria por pestaña y `save()` reemplaza el documento completo de `localStorage`. No se detectan versiones desactualizadas ni se coordinan escrituras entre pestañas. Un guardado inocuo de ajustes sobrescribe progreso más reciente.

**Posible arreglo:** detectar escrituras de otro contexto con versión y eventos de almacenamiento; impedir guardar desde una copia obsoleta hasta reconciliarla. Una alternativa es permitir una sola sesión de escritura y ofrecer recargar las otras. Si se permite concurrencia, diseñar operaciones de progreso y monedas que no pierdan ni dupliquen cambios; una mezcla superficial de objetos no basta.

**Regresión:** dos pestañas, ventana normal y app instalada en el mismo origen, cambios de ajustes y progreso en distinto orden, y recarga. Verificar juegos, monedas, estadísticas, inventario y canjes; no basta con conservar el nombre.

**Pruebas:** `dos-pestanas` y `una-pestana-control` en `tests/regresion/cobertura.js`.


### B16. Salir del repaso por un atajo deja una redirección pendiente al repaso

**Estado: PENDIENTE. Gravedad: media. Reproducido en v1.591.**

1. Entrar en Repaso con Tito y abrir una de sus actividades.
2. Abrir Zona de adultos y usar el atajo «Mapa».
3. Elegir otra casita. La reproducción usa de nuevo el panel: seleccionar «Mi cuerpo» (`3A-T2`) y «Ir al tema».

**Resultado:** se abre el repaso en lugar de la casita elegida. Tras esa redirección el contexto se limpia, por lo que un segundo intento puede funcionar.

**Control:** salir del juego de repaso con su botón normal de casa sí vuelve al repaso y limpia el estado correctamente.

**Causa:** [src/repaso.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/repaso.js) pone `REP_ON=true` al abrir una actividad del repaso. Solo lo restablece al entrar en repaso o al pasar por el envoltorio de `SCENES.casita.enter()`. El atajo al mapa evita ambos. La siguiente casita consume esa bandera global y redirige al repaso aunque no sea la casita del ejercicio anterior.

**Posible arreglo:** representar explícitamente el contexto de navegación del ejercicio y descartarlo cuando se abandona por una ruta ajena al repaso. No borrar indiscriminadamente la bandera en todos los cambios de escena: el regreso normal del juego al repaso debe seguir funcionando.

**Regresión:** botón casa, atajos de adultos, límite de sesión, volver desde tienda y elegir un tema distinto. Verificar la pantalla solicitada y la vuelta normal al repaso.

**Pruebas:** `repaso-atajo` y `repaso-casa-control` en `tests/regresion/cobertura.js`.

### B17. El tiempo jugado y el límite se ralentizan en dispositivos con pocos FPS

**Estado: PENDIENTE. Gravedad: media. Reproducido con una pantalla visible a 10 FPS simulados.**

1. Jugar en un dispositivo que renderice aproximadamente diez fotogramas por segundo.
2. Comparar el tiempo real transcurrido con el reloj de la sesión y los minutos registrados en Zona de adultos.

**Resultado medido:** en 3,015 segundos reales se contabilizaron 1,45 segundos de sesión (29 cuadros, aproximadamente el 48 %). Sin ralentización artificial, el control registró 3,0664 segundos frente a 3,0147 reales, dentro de la tolerancia del muestreo.

**Consecuencia:** el límite de diez minutos puede tardar aproximadamente veinte minutos reales a diez FPS sostenidos; es una extrapolación del contador medido, no una espera manual de veinte minutos. También se infravaloran los minutos del historial.

**Causa:** [src/adult.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/adult.js), `frame()`, limita `dt` a 0,05 s para la animación y utiliza ese mismo valor para `sessionT` y `minuteAcc`. Cada cuadro que tarda más de 50 ms descarta tiempo real. La persistencia de sesión de v1.586 no corrige esta diferencia.

**Posible arreglo:** separar el paso limitado de animación del reloj de juego basado en tiempo real. Definir y conservar las pausas actuales (adultos, portada y dormir), y tratar explícitamente la pestaña oculta y la reanudación para no sumar tiempo de inactividad.

**Regresión:** 60/30/20/10 FPS, caída temporal de rendimiento, pestaña oculta y reanudada, panel de adultos, límite alcanzado y recarga.

**Pruebas:** `reloj-10fps` y `reloj-normal-control`; se modifica únicamente la cadencia de animación del navegador de prueba, no la fórmula del reloj del juego.

### B18. Los regalos diario y de cumpleaños pueden marcarse cobrados sin entregarse

**Estado: PENDIENTE. Gravedad: media. Reproducido en v1.591.**

1. Entrar en el mapa un día cuyo regalo todavía no se haya cobrado, sin otros anuncios prioritarios pendientes.
2. Salir con el botón de casa antes de la entrega de las tres monedas.
3. Volver al mapa.

**Resultado:** el día ya figura como cobrado (`S.gift=hoy`), pero el saldo sigue a cero. Al regresar no se vuelve a ofrecer la entrega. El control que permanece en el mapa recibe exactamente tres monedas y no las duplica al volver.

**Causa:** [src/zonas.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/zonas.js), `SCENES.map.enter()`, guarda `S.gift=today()` antes de un `later(1400,...giveCoins(3))`. Salir del mapa anula el temporizador y conserva la marca. Comparte el patrón de B10, pero afecta a otra recompensa y otro punto de entrega.

**Posible arreglo:** acreditar el premio de forma idempotente antes de la celebración o persistir una entrega pendiente. Cancelar una animación o una frase no debe cancelar las monedas.

**Regresión:** salida inmediata, recarga, permanencia normal y reentrada repetida durante el mismo día. Una sola entrega de tres monedas.

**Pruebas:** `diario-salida` y `diario-espera-control`; el fixture prepara el mapa sin avisos prioritarios para alcanzar explícitamente la rama del regalo.


**Ampliación de B18 — cumpleaños, también reproducida:** al apagar la última vela en la Asamblea, `S.bdayDone=today()` se guarda antes de la celebración y de las diez monedas. Salir con la casa antes de esa entrega deja el día marcado, sin monedas ni pegatina de tarta; al volver a la Asamblea ya no aparece el paso del cumpleaños. El control que espera sí recibe diez monedas y la pegatina. Casos `cumple-salida` y `cumple-espera-control`. Ambos se agrupan con el regalo diario como un problema de entrega de estos premios en `src/zonas.js`, sin crear otro ID por el mismo patrón.

### B19. Un vale desactivado por el adulto todavía se puede comprar si había una confirmación abierta

**Estado: PENDIENTE. Gravedad: media. Reproducido en v1.591.**

1. En la tienda, tocar un vale activo para abrir la confirmación de compra.
2. Sin confirmar, abrir Zona de adultos.
3. Desactivar ese mismo vale y volver al juego.
4. Pulsar el botón verde de la confirmación que seguía abierta.

**Resultado:** se descuentan las monedas y se registra un vale que ya está desactivado. La prueba del vale v1 observa `on=0`, saldo de 100 a 70 y un canje pendiente nuevo.

**Control:** comprar el vale activo, marcarlo «Entregado» y recargar conserva un único registro entregado y el saldo 70.

**Causa:** [src/tienda.js](https://github.com/fercala/curiolandia-3d/blob/e1a8af377ce85cd41f8fe97adcb8d27a005aed6d/src/tienda.js), `SCENES.tienda.conf`, conserva la compra mientras el panel cambia `S.vales`; `buy()` no vuelve a validar que el vale siga activo. Al cerrar el panel no se invalida la confirmación.

**Posible arreglo:** al confirmar, resolver el vale por su identificador en la configuración actual y comprobar que sigue permitido. Si cambió su disponibilidad, texto o precio, cancelar o pedir una confirmación actualizada; no comprar silenciosamente con una autorización obsoleta.

**Regresión:** desactivar un vale con confirmación abierta, modificar precio/texto, compra normal, canje y recarga. No debe producirse descuento ni registro si el vale fue desactivado.

**Pruebas:** `vale-desactivado` y `vale-canje-control` en `tests/regresion/cobertura.js`.
