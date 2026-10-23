# Hallazgos de las pruebas de regresión

Resultado de la campaña de pruebas de octubre de 2026 sobre la v1.585 (web publicada). Los arreglos están en la **v1.586** (ver el estado de cada hallazgo y [CAMBIOS.md](CAMBIOS.md)). Las pruebas están en `tests/regresion/` (ver su `LEEME.md`) y se pueden repetir. Cada hallazgo dice qué pasa, cómo se reproduce, qué prueba lo vio y la causa probable en el código. Cuando un hallazgo se arregle, se marca aquí como **arreglado (v1.N)** y se quita de `PROBLEMAS-CONOCIDOS.md` si estaba.

Gravedad: **alta** = el niño lo nota a menudo o el juego se rompe; **media** = se nota a veces o solo en un caso raro; **baja** = casi nunca se nota.

## Resumen

| # | Hallazgo | Gravedad | Estado |
|---|---|---|---|
| A1 | La ayuda automática corta las páginas largas de los cuentos | alta | **arreglado (v1.586)** |
| A2 | Tras el segundo fallo, la consigna corta la explicación del error | alta | **arreglado (v1.586)** |
| A3 | Frases que se cortan solas, sin que el niño toque | alta | **arreglado (v1.586)** |
| A4 | Dos voces en la misma frase (grabada y del navegador) | media | se va al grabar las frases pendientes; mientras, «Solo voz del navegador» (v1.585) |
| A5 | Con el acento rioplatense, más de la mitad de las frases van con la voz del navegador | media | **arreglado (v1.586)**: España por defecto en partidas nuevas |
| A6 | En iPhone y iPad las voces grabadas podrían no sonar nunca | alta (sin comprobar) | **arreglado (v1.586)**, falta oírlo en un iPhone |
| A7 | Alguna reproducción de MP3 rechazada por el navegador | baja | la frase la dice la voz del navegador; con A6 debería pasar menos |
| G1 | Una copia de seguridad con campos vacíos (`null`) se acepta y rompe el juego | alta | **arreglado (v1.586)** |
| G2 | Una partida guardada con tipos raros rompe el juego | media | **arreglado (v1.586)** |
| C1 | El candado de adultos cuenta tiempo de juego, no tiempo real | baja | **arreglado (v1.586)** |
| C2 | Recargar la página se salta el aviso de «a dormir» del límite de tiempo | baja (informativo) | **arreglado (v1.586)** |
| P1 | `__cl.go` (puerta de pruebas) no pasa por el envoltorio de `world3d.js` | baja (solo pruebas) | **arreglado (v1.586)** |
| B1 | Repetir «Conocer» sin recargar no se puede terminar | alta | **arreglado (v1.587)** |
| B2 | Memoria no apunta las parejas falladas (100 % siempre) | media | **arreglado (v1.587)** |
| B3 | Cambiar a libre o de edad no refresca el mapa 3D abierto | media | **arreglado (v1.587)** |
| B4 | El gorro del cofre no se ve en Tito 3D hasta cambiar de pantalla | baja | **arreglado (v1.587)** |
| B5 | El centro del botón de saltar el cuento activa el candado | media | **arreglado (v1.587)** |
| B6 | Las estrellas de rondas tapan el cartel DÍA/NOCHE | media | **arreglado (v1.587)** |
| B7 | La copia `{"temas":null}` se acepta | alta | ya **arreglado (v1.586)**; es G1 |

## Audio

Las pruebas de audio (`audio.js`, `audio-espera.js`) usan los MP3 de verdad de `voz/` y una voz del navegador simulada que tarda lo que tardaría (70 ms por letra), y apuntan cuándo empieza, acaba o se corta cada frase. «Cortada» quiere decir que la siguiente frase empezó antes de que acabara la anterior; las cortadas justo después de un toque del niño se cuentan aparte, porque ahí cortar es lo correcto.

### A1. La ayuda automática corta las páginas largas de los cuentos (alta)
- **Qué pasa:** en los cuentos, si una página dura más de unos 11 s, Tito la empieza otra vez a mitad de lectura; y alrededor de un segundo después pasa a la página siguiente, que corta esa relectura. Esa página no se oye entera nunca.
- **Cómo se reproduce:** entrar en un juego de cuento (por ejemplo, el cuento de cualquier tema de 3 años) y no tocar nada.
- **Visto en:** `audio-espera.js`, en 17 páginas de cuentos de 21 juegos en el tercio de los juegos revisado en la primera pasada.
- **Causa probable:** `idle` sube cada cuadro aunque Tito esté hablando (`adult.js`, `frame()`, `idle+=dt`). A los 11 s, `drawHelp()` (`core.js`) llama a `scene.prompt()`, que en `Story` (`comps2.js`) vuelve a leer la página. Esa nueva frase corta la anterior, cuyo `fin` ejecuta su callback (`later(900, turn)`), y el paso de página corta la relectura.
- **Arreglo (v1.586):** `idle` no cuenta mientras `talking` y vuelve a 0 con cada `say()`; `drawHelp()` no llama a `prompt()` mientras Tito habla.
- **Después (v1.586, `audio-espera.js` en los 253 juegos):** ninguna página de cuento ni explicación de un fallo cortada. Las 29 frases que la prueba aún marca son todas la ayuda de «Conocer» («Toca un dibujo que todavía no tenga estrella.») cortada por el toque de la propia prueba al fallar a propósito: es un toque, así que está bien que corte.

### A2. Tras el segundo fallo, la consigna corta la explicación del error (alta)
- **Qué pasa:** al fallar dos veces seguidas, Tito empieza a explicar el error y la consigna repetida le corta casi enseguida.
- **Ejemplo:** 3A-T1#1: «Esa es la mochila. ¿Dónde está el cuento?» cortada por «¿Dónde está el cuento?».
- **Cómo se reproduce:** en un juego de elegir (casitas de 3 años), tocar dos veces una respuesta equivocada.
- **Causa probable:** varios componentes ponen `idle=12` tras el segundo fallo para que salga la ayuda: `comps.js` (líneas ~369 y ~468), `comps2.js` (~133 y ~235); con `idle=7` en `comps.js` (~825) y `scenes.js` (~613). Con `idle>11`, `drawHelp()` llama a `prompt()` en el cuadro siguiente, mientras Tito aún dice la explicación.
- **Arreglo (v1.586):** el de A1. Con `idle=12` la manita sale enseguida, pero la consigna espera a que Tito acabe la explicación.

### A3. Frases que se cortan solas (alta)
- **Qué pasa:** en una partida normal (el niño espera a que Tito calle antes de tocar), alrededor de una de cada cinco frases se corta porque el juego empieza la siguiente antes de que acabe.
- **Números (`audio.js`, 6 min de juego, voz grabada de España):** 52 de 247 frases cortadas sin toque, 33 de ellas en el primer segundo. Con la voz de Fer: 76 de 239. Con el acento rioplatense: 81 de 221.
- **Ejemplos:** «¡Toca tu foto!» que se corta a sí misma en la asamblea; «¡Qué bien! La pelota.» cortada por «¡Muy bien, Lucía! ¡Una estrella más!»; «¡Muy bien! Del más pequeñito al más grande.» cortada por «¡Bravo! ¡Terminaste el juego!»; «Esta es una máquina de rayos X…» (5A-T2#1) cortada a los 5,5 s por «Busca el hueso.».
- **Causa probable:** una mezcla de A1/A2 (la ayuda) y de juegos que encadenan una frase con un `later()` de tiempo fijo en vez de esperar al final de la anterior (el callback de `say`).
- **Corrección de las cifras:** la primera medida contaba de más: un corte que ocurre en el mismo milisegundo en que empieza una frase es de la frase anterior, y el toque que provoca una frase suele ir en ese mismo milisegundo. Con la medida corregida, la v1.585 cortaba sin toque 7 de 247 frases con la voz de España (3 %), 49 de 239 con la de Fer (20 %) y 46 de 221 con el acento rioplatense (21 %).
- **Causa:** las frases que el juego dice solo, programadas con `later()` (la consigna de cada ronda, la felicitación final del juego), no esperaban a que Tito acabara. Lo más frecuente: el niño acierta antes de oír la pregunta, Tito dice «¡Muy bien! La silla.» y la pregunta pendiente («¿Dónde está la silla?») la corta; luego la ronda siguiente corta esa pregunta.
- **Arreglo (v1.586):** `whenQuiet()` y `sayQ()` (core.js): las frases programadas esperan a que Tito calle. La pregunta de cada ronda (`ChoiceGame`, `Arrastra`, asamblea) no se dice si el niño ya respondió. `finishGame()` espera a que acabe la última felicitación.
- **Después (v1.586, `audio.js`, 6 min):** 0 frases cortadas sin toque con la voz de España (132 frases), con la de Fer (135) y con el acento rioplatense (129).

### A4. Dos voces en la misma frase (media)
- **Qué pasa:** cuando solo una parte de la frase tiene MP3, Tito alterna dentro de la misma frase la voz del navegador y la grabada. Ejemplo: «Esa es la mochila.» con la voz del navegador y «¿Dónde está el cuento?» grabada. El nombre del niño siempre va primero con la voz del navegador.
- **Números:** 18 de 247 frases (7 %) con la voz de España; 19 de 239 con la de Fer.
- **Causa:** el plan de `vozFile` en `core.js` trocea la frase y cada trozo va con lo que haya. Es a propósito (v1.580): sin la mezcla, toda la frase iría con la voz del navegador.
- **Solución:** grabar las frases que faltan (`dialogos/pendientes.txt` y el catálogo `dialogos/todos.csv`); el nombre del niño seguirá yendo con la voz del navegador, porque no se puede grabar de antemano. Mientras, quien prefiera una sola voz puede elegir «Solo voz del navegador» (v1.585).

### A5. Con el acento rioplatense, la mayoría de las frases van con la voz del navegador (media)
- **Qué pasa:** con `S.variant='ar'`, solo 88 de 221 frases (40 %) sonaron con MP3; 117 con la voz del navegador y 16 mezcladas. Las grabaciones son de España, así que en rioplatense se mezclan dos acentos.
- **Arreglo (v1.586):** una partida nueva empieza con el acento de España, el de las grabaciones. Las partidas que ya tienen acento no cambian; en la zona de adultos se puede elegir rioplatense.

### A6. En iPhone y iPad las voces grabadas podrían no sonar nunca (alta, sin comprobar)
- **Qué pasa (deducido del código, no probado: aquí solo hay Chromium):** Safari solo deja reproducir audio en un elemento que se haya «desbloqueado» con un toque. `VOZ_EL` (`core.js`) se crea tarde, dentro de una promesa, nunca dentro de un toque; Safari podría rechazar todos los `play()` y Tito usaría siempre la voz del navegador.
- **Cómo comprobarlo:** abrir la web en un iPhone con «Voz grabada» y escuchar si suena la grabación.
- **Arreglo (v1.586):** `initAudio()` crea `VOZ_EL` en el primer toque y le hace sonar un instante de silencio. **Falta oírlo en un iPhone o iPad de verdad.**

### A7. Reproducciones de MP3 rechazadas (baja)
- **Qué pasa:** 1 o 2 `play()` rechazados por partida de 6 min. El juego pasa a la voz del navegador, así que la frase se oye igual.

## Partidas guardadas y copias de seguridad

### G1. Una copia de seguridad con campos `null` se acepta y rompe el juego (alta)
- **Qué pasa:** `bkDecode('{"temas":null}')` responde «ok». Al recuperarla, el juego falla con «Cannot convert undefined or null to object» / «Cannot read properties of null».
- **Cómo se reproduce:** zona de adultos > Copia de seguridad > Recuperar, pegar `{"temas":null}`.
- **Visto en:** `limites.js`, casos `copia-ida-vuelta` y `guardado-nulos`.
- **Causa:** `bkDecode` (`adult.js`) comprueba `typeof d.temas === 'object'`, que es cierto para `null`; y `load()` (`core.js`) copia los `null` con `Object.assign` encima de los valores por defecto.
- **Arreglo (v1.586):** `sanoS()` (core.js) en `load()` y en tienda.js deja con su valor por defecto los campos `null` o de tipo imposible; `bkDecode()` rechaza una copia sin `temas` de tipo objeto.

### G2. Una partida guardada con tipos raros rompe el juego (media)
- **Qué pasa:** si el nombre guardado no es texto (por ejemplo, un número), el juego falla al dibujar: `(S.name||"¡Yo!").toUpperCase is not a function`.
- **Visto en:** `limites.js`, caso `guardado-tipos`.
- **Causa y arreglo:** los de G1 (un nombre numérico pasa a texto).

## Otros

### C1. El candado de adultos cuenta tiempo de juego (baja)
- **Qué pasa:** el candado pide mantenerlo 3 s, pero cuenta con el reloj del juego, que avanza como mucho 0,05 s por cuadro. En un aparato muy lento (en la prueba, unos 2 cuadros por segundo) hay que mantenerlo mucho más; en la prueba ni con 10 s se abrió.
- **Causa:** `dt` limitado a 0,05 s en `frame()` (`adult.js`). Lo mismo afecta a los `later()`, pero ahí no importa.
- **Arreglo (v1.586):** el candado suma el tiempo real entre cuadros (`lockPrev`).

### C2. Recargar se salta el «a dormir» (baja, informativo)
- **Qué pasa:** cuando se acaba el tiempo de juego, recargar la página vuelve a dejar jugar. Para niños de 3 a 5 años no es probable.
- **Arreglo (v1.586):** el tiempo de la sesión se guarda en `S.ses` cada 15 s; si se recarga antes de 30 min, la sesión sigue.

### P1. La puerta de pruebas `__cl.go` se salta el envoltorio de `world3d.js` (solo pruebas)
- **Qué pasa:** `window.__cl` (`adult.js`) guarda `go` antes de que `world3d.js` lo envuelva. Si una prueba salta con `__cl.go` de una escena 3D a un juego 2D, no se restaura el rectángulo de Tito (`TITO`) y los toques donde estaba Tito en 3D se toman por toques a Tito (que repite la consigna). Hizo que 73 juegos parecieran «no terminar». El juego de verdad no pasa por ahí.
- **Arreglo (v1.586):** `window.__cl.go` es `(n,o)=>go(n,o)` en `adult.js`. `tests/regresion/lib.js` lo hace también, para probar versiones anteriores.

## Informe de pruebas jugadas a mano (B1-B7)

Informe externo del 23-10-2026 (pruebas con clics y arrastres en la web publicada, Chromium en Windows, sobre la v1.585). Cada fallo se ha reproducido con `tests/regresion/informe-b.js` sobre la v1.586 publicada (B1-B6 fallan, B7 ya estaba arreglado) y la misma prueba pasa entera con la v1.587.

### B1. Repetir «Conocer» sin recargar no se puede terminar (alta)
- **Qué pasa:** al volver a entrar en «Conocer» las tarjetas salen ya con estrella, el marcador está a 0 y tocarlas no suma: no se puede acabar.
- **Causa:** `Conocer` (`comps.js`) usaba los mismos objetos de `t.words` y les dejaba la marca `seen`.
- **Arreglo (v1.587):** cada partida hace sus propias copias de las tarjetas con `seen: 0`. Prueba: terminar «Conocer» tres veces seguidas sin recargar.

### B2. Memoria no apunta las parejas falladas (media)
- **Qué pasa:** «Cómo le va» mostraba siempre 100 % en Memoria y el repaso no podía ver que costaba.
- **Arreglo (v1.587):** una pareja errada cuenta como fallo (`rec('memoria', false)`) solo cuando se podía saber dónde estaba la pareja: una de las dos cartas ya se había destapado antes. Destapar cartas nuevas es explorar, no fallar. Desde la v1.588 cada pareja da una moneda (`onRight(true)`), como pidió Fernando.

### B3. Cambiar a libre o de edad no refresca el mapa 3D (media)
- **Qué pasa:** tras activar «Libre» o cambiar la edad, el mapa seguía con zonas grises y candados, aunque se podía entrar.
- **Arreglo (v1.587):** `openAdult()` apunta la edad y el modo libre (`adultWas`); si al cerrar cambiaron, `closeAdult()` vuelve a abrir la escena 3D actual (mapa, camino o casita) sin saludo. El cofre no se vuelve a abrir (cuenta y premia al entrar). Si no cambió nada, no se rehace.

### B4. El gorro del cofre no se ve en Tito 3D al momento (baja)
- **Arreglo (v1.587):** `grantGift()` (`zonas.js`) llama a `__w3.retito()` cuando el regalo es ropa y la escena es 3D.

### B5. El centro del botón de saltar el cuento activa el candado (media)
- **Causa:** la zona del candado (`x>1490, y>800`, en `adult.js`) era mucho más grande que el candado dibujado y tapaba el centro del botón (1500, 820).
- **Arreglo (v1.587):** el candado solo responde a 50 px de su dibujo (1546, 852). El centro del botón salta el cuento y el candado sigue abriendo la zona de adultos.

### B6. Las estrellas de rondas tapan el cartel DÍA/NOCHE (media)
- **Arreglo (v1.587):** el cartel de `Gira` (`comps2.js`) baja a y = 214, debajo de las estrellas y del cartel «Nivel».

### B7. La copia `{"temas":null}` se acepta (alta)
- Ya arreglado en la v1.586 (G1): `bkDecode()` la rechaza, y también `{"temas":[]}`, `[]` y `null`.

## Lo que funciona

- **Los 253 juegos de todos los temas se terminan** siguiendo la ayuda (`juegos.js`), en la v1.585 y otra vez en la v1.586, sin errores de JavaScript. El de regar pide mantener la regadera sobre la maceta unos segundos; la prueba la suelta enseguida, pero sujetándola se termina.
- **Partida nueva de punta a punta** con el ratón de verdad a los 3, 4 y 5 años (`camino.js`): portada, edad, nombre, cuento, mapa, asamblea, casitas, juegos, cofre; temas terminados, monedas, cofres, sin errores, y el progreso se conserva al recargar.
- **Casos límite (`limites.js`):** partida guardada corrupta o vieja; temas o animal de Tito desconocidos; importar de Letrilandia; almacenamiento bloqueado o lleno; copia de seguridad ida y vuelta y mínima; nombres raros (largos, emojis, HTML); toques muy rápidos; salir a mitad de un juego; borrar todo el progreso; modo libre (todas las casitas y su primer juego); cambiar de edad; pantallas en vertical, diminutas, enormes y giradas; sin WebGL (sigue en 2D); sin voz del navegador; volumen de voz a 0; MP3 sin conexión; fechas especiales (noche, 3 de la mañana, Navidad, Año Nuevo, 29 de febrero, cambio de hora, domingo); pasar la medianoche; hemisferio sur; tienda sin monedas y con muchísimas; partida con todo terminado; opción «Solo voz del navegador».

## Cómo repetir

Ver `tests/regresion/LEEME.md`. En resumen, desde la raíz del repo:

```sh
node tests/regresion/camino.js . 3,4,5 8
node tests/regresion/juegos.js . 0 1 120
node tests/regresion/limites.js .
node tests/regresion/audio.js . es '' 6
node tests/regresion/audio-espera.js . 0 1
node tests/regresion/informe-b.js .
```

Si un juego no termina, repítelo solo con más tiempo (`juegos.js . 0 1 180 3A-T7#3`) antes de darlo por fallido: con varias pruebas a la vez el juego va a pocos cuadros por segundo.
