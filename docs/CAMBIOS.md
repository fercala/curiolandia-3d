# Registro de cambios

Cada versión publicada añade una entrada arriba del todo (ver [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md), apartado 1.3). Las versiones anteriores a la v1.579 están en el historial de git (`git log`).

## v1.589 (2026-10-23)
- Para la familia: en la zona de adultos (Idioma y voz) se puede elegir la voz del navegador entre las voces en español del aparato, con un botón «▶ Probar». Las más naturales llevan ★. Hay una guía, «Cómo conseguir voces más naturales», con los pasos para iPhone/iPad, Mac, Android y Windows; el aparato en el que se juega sale primero.
- Para el niño: sin elegir nada, Tito usa la voz más natural que haya en el aparato (antes, la primera del país).
- Por dentro: `core.js`, `vozCalidad`, `vocesES`, `vozProbar` y `pickVoice` con `S.vozNav`; `adult.js`, `vozGuiaHTML`, la lista `#a-vnav` y `doReset` conserva `vozNav`. Campo nuevo `S.vozNav` (opcional, compatible). Sin frases nuevas («Probar» usa un saludo que ya existe).

## v1.588 (2026-10-23)
- Para el niño: en Memoria, cada pareja encontrada da una moneda, como en los demás juegos (máximo 5 por juego).
- Por dentro: `comps.js`, `Memoria` llama a `onRight(true)` en cada pareja (moneda de `tienda.js` y racha de dificultad). Quitado `Memoria` de la fila de `onRight` en PROBLEMAS-CONOCIDOS. Sin frases nuevas.

## v1.587 (2026-10-23)
Arreglos del informe de pruebas jugadas a mano (B1-B6 en [HALLAZGOS-PRUEBAS.md](HALLAZGOS-PRUEBAS.md)).
- Para el niño:
  - «Conocer» se puede repetir sin recargar la página (antes las tarjetas salían ya vistas y no se podía terminar).
  - En el cofre, Tito se pone el gorro (o la ropa que toque) al momento.
  - El centro del botón para saltar el cuento del principio funciona (antes lo tapaba la zona del candado).
  - En «El día y la noche» el cartel DÍA/NOCHE ya no queda debajo de las estrellas.
- Para la familia:
  - Memoria apunta como fallo una pareja errada cuando ya se había visto dónde estaba la pareja: «Cómo le va» y el repaso ya no dan siempre 100 %.
  - Al cambiar a «Libre» o la edad en la zona de adultos, el mapa (o el camino o la casita) se rehace al volver: candados y colores cuadran con lo que se puede jugar.
- Por dentro:
  - `comps.js`: `Conocer` copia las tarjetas con `seen: 0`; `Memoria` marca `c.seen` y llama a `rec('memoria', false)` en el fallo «sabiendo».
  - `adult.js`: `adultWas` en `openAdult()`, `closeAdult()` vuelve a abrir la escena 3D si cambiaron edad o libre (no el cofre); el candado responde a 50 px de su dibujo (antes `x>1490 && y>800`).
  - `zonas.js`: `grantGift()` llama a `__w3.retito()` si el regalo es ropa y la escena es 3D.
  - `comps2.js`: el cartel de `Gira` baja a y = 214.
  - Prueba nueva `tests/regresion/informe-b.js` (B1-B7). Quitado de PROBLEMAS-CONOCIDOS el fallo de `Conocer`. Sin frases nuevas.

## v1.586 (2026-10-23)
Arreglos de lo encontrado en las pruebas de regresión ([HALLAZGOS-PRUEBAS.md](HALLAZGOS-PRUEBAS.md)).
- Para el niño:
  - La ayuda automática ya no corta a Tito: espera a que acabe de hablar para repetir la consigna. Las páginas largas de los cuentos se oyen enteras y, tras fallar dos veces, se oye entera la explicación del fallo.
  - Las frases que el juego dice solo (la pregunta de cada ronda, la felicitación al acabar un juego) esperan a que Tito acabe la que está diciendo, y la pregunta no se dice si el niño ya respondió antes de oírla. En las pruebas, ninguna frase se corta ya sin que el niño toque (antes, hasta una de cada cinco con la voz de Fer o el acento rioplatense).
  - En iPhone y iPad las voces grabadas deberían sonar: el reproductor se desbloquea en el primer toque.
  - En una partida nueva, Tito habla con acento de España, el de las grabaciones. Las partidas que ya tienen acento elegido no cambian.
- Para la familia:
  - El candado de la zona de adultos cuenta 3 s reales, también en aparatos lentos.
  - Recargar la página ya no se salta el límite de tiempo: la sesión sigue si se recarga antes de 30 min.
  - Una partida guardada o una copia de seguridad rota (campos vacíos o de otro tipo) ya no rompe el juego: esos campos vuelven a su valor por defecto. Una copia con `"temas": null` se rechaza.
- Por dentro:
  - `adult.js`, `frame()`: `idle` no avanza mientras `talking`; `core.js`, `say()` pone `idle=0`; `drawHelp()` no llama a `prompt()` mientras Tito habla.
  - `core.js`: `whenQuiet()` y `sayQ()` nuevas; las frases programadas con `later(…, ()=>say(…))` pasan a `sayQ` (comps.js, comps2.js, ingles.js, repaso.js, scenes.js, tienda.js, zonas.js); `ChoiceGame.round`, `Arrastra.load` y la asamblea (`ask()`) no preguntan si ya se respondió; `finishGame()` usa `sayQ`.
  - `core.js`, `initAudio()`: crea `VOZ_EL` y lo hace sonar con un silencio dentro del toque.
  - `core.js`, `sanoS()` nueva, usada en `load()` y en tienda.js; `adult.js`, `bkDecode()` más estricta.
  - `core.js` y `adult.js`: `lockPrev` y el candado en tiempo real; `S.ses` nuevo (campo suelto, compatible) para el tiempo de la sesión.
  - `core.js`: `S.variant` vacío pasa a `'es'` (antes `'ar'`).
  - `adult.js`: `window.__cl.go` llama al `go()` actual (el envuelto por world3d.js).
  - `herramientas/git-hooks/frases_diff.py`: también vigila las frases de `sayQ()`, y las llamadas sin texto fijo se comparan por su expresión, no por la línea entera. Pruebas de audio: un corte o un toque en el mismo milisegundo en que empieza una frase ya no se atribuye a esa frase.
  - Documentado en ARQUITECTURA, COMO-AGREGAR, ESTADO-GUARDADO, VOCES y HALLAZGOS-PRUEBAS. Sin frases nuevas.

## Sin versión (2026-10-23): pruebas de regresión
- Para el niño: nada cambia (no se publica una versión nueva del juego).
- Pruebas nuevas en `tests/regresion/` (ver su `LEEME.md`): partida de punta a punta por edad, todos los juegos hasta el final, casos límite y caminos alternativos, y medición del audio (frases cortadas, mezcla de voces). Los resultados van a `tests/regresion/salida/`, que no se sube. Lo que encuentren se apuntará en `docs/HALLAZGOS-PRUEBAS.md`.

## v1.585 (2026-10-23)
- Para la familia: en la zona de adultos, «Voz de Tito» tiene una tercera opción, «Solo voz del navegador»: Tito lo dice todo con la voz del navegador, sin ninguna grabación.
- Por dentro: `S.voz = 'nav'` (`core.js`, `vozLoad` no carga ningún manifiesto y `VOZ` queda en null; `adult.js`, opción nueva). Las partidas guardadas no cambian. Documentado en ESTADO-GUARDADO y VOCES.

## v1.584 (2026-10-23)
- Para el niño: nada cambia en los juegos de ahora.
- Por dentro (`comps2.js`, `Llena`): si un juego se configura con `min` igual a `max`, ya no se queda colgado buscando un número distinto del anterior: repite ese número.

## v1.583 (2026-10-23)
- Para el niño: nada cambia si todo va bien; si alguna parte del juego pide una escena que no existe, el juego se queda donde está en vez de romperse.
- Por dentro (`core.js`): `go()` comprueba que `SCENES[nombre]` exista; si no, avisa en la consola y no hace nada.
- Documentación: quitado de PROBLEMAS-CONOCIDOS el fallo de `doReset()`, que no era tal: tienda.js y repaso.js ya añaden sus campos a `DEF` (`Object.assign(DEF, ...)`). Comprobado: tras borrar el progreso, `S` tiene los mismos campos y se puede jugar sin errores.

## v1.582 (2026-10-23)
- Para el niño: en el cofre, al tocar el cangrejo Tito dice «uno» una sola vez; antes contaba dos veces seguidas. Sin frases nuevas.
- Por dentro (`world3d.js`, rama `u.crab` de `wobTap`): el grupo del mapa (`map4`) solo cuenta en el mapa; en el cofre cuenta solo `cof2`.

## v1.581 (2026-10-23)
- Para el niño: al tocar una abeja, Tito dice «La abeja. Hace miel con las flores.» y escribe ABEJA; antes decía «La mariposa.». Frase ya grabada, sin frases nuevas.
- Por dentro (`world3d.js`): en `NAMES3` la fila `bee` va antes que `bfly` (las abejas llevan las dos marcas y gana la primera); `allTap` con `'bfly'` ya no cuenta las abejas como mariposas.
- Gancho de git: ya no para el commit por tocar una línea que habla si la frase no cambia; ahora compara los textos de `say()` antes y después (`herramientas/git-hooks/frases_diff.py`).

### Publicado junto con la v1.581
- Carpeta `dialogos/`: `pendientes.txt` (diálogos por grabar, 1.130: los 1.097 nuevos más 33 por regrabar) y `todos.csv` (catálogo de los 3.281 diálogos, grabados y pendientes, para grabar y para traducir algún día), con `herramientas/voces/dialogos.py` para rehacerlo. Cada diálogo nuevo o cambiado se apunta ahí; el gancho de git lo comprueba. El juego no cambia.
- `dialogos/informe-sin-voz.md`: el informe de la revisión de frases sin voz, que antes solo estaba en la carpeta del proyecto.

## v1.580 (2026-10-22)
- Para el niño: si la familia ha puesto su nombre, Tito lo dice (con la voz del navegador) antes de la frase grabada; antes, con voz grabada, el nombre se perdía. Las frases que solo están grabadas en parte ya no pasan enteras a la voz del navegador: lo grabado suena con la voz grabada y solo lo que falta con la del navegador. Las fechas, monedas y estrellas se arman con piezas grabadas (cuando se graben).
- Por dentro (`core.js`): `vozFile` devuelve un plan de trozos (mp3 o `{t}` para la voz del navegador), busca el trozo grabado más largo de izquierda a derecha y usa `vozPieces`/`vozNum` para las oraciones con números; `vozSeq` reproduce el plan; `sayTTS` dice el nombre y los trozos sin grabar; `vozGet` descarga un mp3 una sola vez.
- Herramienta nueva `herramientas/voces/auditoria/` (busca todas las frases sin voz) y lista de 1.097 frases y piezas pendientes de grabar (ahora en `dialogos/pendientes.txt`).
- Política de documentación obligatoria ([POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md)), comprobación automática de comentarios (`tests/comentarios.py`), gancho de git que la ejecuta en cada commit (`herramientas/git-hooks/pre-commit`) y plantilla de pull request con la lista de documentación.

## v1.579 (2026-10-22)
- Para el niño: nada cambia.
- Por dentro: todo el código de `src/` comentado (cabecera de cada archivo y de cada función, y comentarios dentro de la lógica complicada). Documentación nueva en `docs/`, README, prueba de escenas `tests/humo.js` y scripts de voces en `herramientas/voces/`.
