# Arquitectura de Curiolandia 3D

Esta guía explica cómo está hecho el juego por dentro. Está pensada para alguien que empieza: léela de arriba abajo una vez antes de tocar código. Para los pasos concretos de "cómo añado X", ve a [COMO-AGREGAR.md](COMO-AGREGAR.md).

Otras guías:
- [COMO-AGREGAR.md](COMO-AGREGAR.md): el proceso de trabajo y recetas paso a paso.
- [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md): el estado `S` que se guarda en el móvil y cómo no romperlo.
- [VOCES.md](VOCES.md): cómo habla Tito y cómo se graban frases nuevas.
- [PROBLEMAS-CONOCIDOS.md](PROBLEMAS-CONOCIDOS.md): fallos y rarezas que se han visto en el código y siguen sin arreglar.

---

## 1. Qué es

Curiolandia 3D es un juego web para niños de Educación Infantil (3, 4 y 5 años). Tito (un caracol; también puede ser erizo, tortuga o conejo) guía al niño por una isla con zonas por edad. Cada zona tiene un camino de **casitas**, cada casita es un **tema** (la familia, los animales, el otoño...) y dentro de cada tema hay varios **juegos** cortos. Al terminar un tema se abre un **cofre** con un regalo para Tito. Las monedas que se ganan se gastan en una **tienda**.

Características técnicas:
- **HTML + JavaScript puro**, sin frameworks, sin npm y sin paso de compilación aparte de concatenar archivos.
- **Three.js r128** para la capa 3D (el archivo `three.min.js` va incluido).
- **Funciona sin conexión** (es una PWA con service worker) y se puede instalar en el móvil.
- **Voces grabadas** en MP3 para cada frase que dice Tito, con la voz del navegador como respaldo.
- Se publica en GitHub Pages: https://fercala.github.io/curiolandia-3d/

## 2. Mapa del repositorio

```
/                       la web publicada (lo que sirve GitHub Pages)
├── index.html          el juego montado (¡no se edita a mano! se genera desde src/)
├── sw.js               service worker (generado por src/build_web.py)
├── manifest.webmanifest  datos de la PWA (generado)
├── three.min.js        Three.js r128
├── fonts/, icon-*.png  fuentes e iconos
├── voz/                MP3 de la voz principal + voz/manifest.json (texto -> archivo)
├── voz-fer/            MP3 de la "Voz de Fer" (mismos nombres) + manifest.json
├── src/                EL CÓDIGO FUENTE (aquí es donde se trabaja)
├── docs/               esta documentación
├── tests/humo.js       prueba automática: recorre las escenas y busca errores
├── herramientas/voces/ scripts para generar y preparar las voces grabadas
├── CLAUDE.md           reglas cortas para trabajar con Claude Code
└── README.md           presentación del proyecto
```

### Archivos de `src/`

Todos los `.js` se pegan, en un orden fijo, dentro de un único `<script>` (lo hace `src/build.sh`). **El orden importa**: un archivo puede usar y modificar lo que definen los anteriores.

| Orden | Archivo | Qué contiene |
|---|---|---|
| — | `head.html` | Cabecera HTML: estilos, los dos lienzos (`#gl` para el 3D y `#cv` para el 2D, encima), la carga de Three.js y los paneles HTML (nombre, reinicio, zona de adultos). |
| 1 | `pics-base.js`, `pics-new.js`, `pics-a.js` ... `pics-e.js`, `pics-mine.js` | **Dibujos**. Cada dibujo es un SVG con un nombre (`'perro'`, `'manzana'`...) dentro del objeto `PICS`. |
| 2 | `core.js` | **El núcleo**: utilidades, el estado guardado `S`, idioma (`tx`), dibujo 2D básico, Tito en 2D, sonido (`tone`, `noise`), música, voz (`say`), el sistema de escenas (`SCENES`, `go`, `later`), partículas (`parts`), ayuda automática, dificultad adaptativa, pegatinas. |
| 3 | `lex.js` | Vocabulario: nombres de las cosas (`LEX`, `LEX2`), sonidos de animales y la tabla de cambios del español rioplatense al de España. |
| 4 | `comps.js`, `comps2.js` | **Componentes de juego**: el "motor" de cada tipo de juego (`Busca`, `Arrastra`, `Memoria`, `Cuenta`, `Secuencia`, `Tracer`, `Song`, `Story`...). |
| 5 | `temas.js`, `temas4.js`, `temas5.js` | **Contenido**: los temas de 3, 4 y 5 años (`T3`, `T4`, `T5`) con sus juegos. `temas.js` también tiene `makeGame`. |
| 6 | `cuentos.js` | Los cuentos ilustrados de cada tema (`CUENTOS`). |
| 7 | `extras.js` | Canciones (`CAN`), rutinas (`RUT`), trazos (`TRZ`) y días especiales (`FIESTAS`). |
| 8 | `ingles.js` | El Rincón del inglés (`EN`, `ING`, juegos `EnConocer`, `EnEscucha`...). |
| 9 | `scenes.js` | **Escenas 2D** originales: portada, edad, intro, asamblea, casita, juego, álbum, dormir. Lista total de temas `TEMAS` y `finishGame`. |
| 10 | `zonas.js` | Mapa, zonas y **reglas de apertura** (qué tema o zona está abierto). Reescribe parte de las escenas de `scenes.js`. Cofre y regalos (`GIFTS`). |
| 11 | `tienda.js` | Monedas, tienda, ropa y colores de Tito, casa de Tito, vales. |
| 12 | `repaso.js` | Estadísticas por habilidad y repaso diario. |
| 13 | `adult.js` | Zona de adultos, copia de seguridad, **entrada (ratón/dedo/teclado) y el bucle de dibujo `frame()`**. |
| 14 | `world3d.js` | **Toda la capa 3D**: portada, mapa (isla), zonas, casitas, cofre, Tito y Pipo en 3D, objetos que se tocan. |
| 15 | `boot.js` | Arranque: espera a las fuentes, va a la portada y empieza el bucle. |
| — | `build.sh` | Concatena todo en `src/artifact.html` y `src/index.html`. |
| — | `build_web.py` | Genera la web instalable en `src/web/` (index, `sw.js`, manifest) y el zip. Tiene la versión `VER`. |
| — | `icons.js` | Script aparte (Node + Playwright) para regenerar los iconos PNG. No forma parte del juego. |

Como todo va en el mismo `<script>`, **todas las variables globales se comparten**. Por ejemplo, `S` (definido en `core.js`) se usa en todos los archivos.

## 3. La pantalla lógica de 1600x900

Todo el juego trabaja en una pantalla imaginaria de **1600 x 900 píxeles**. `core.js` escala el lienzo al tamaño real de la ventana y `adult.js` convierte cada toque a esas coordenadas (`toLogical`). Así nunca tienes que pensar en el tamaño del móvil: si dibujas algo en `x=800, y=450`, siempre sale en el centro.

## 4. El bucle principal (`frame` en `adult.js`)

Cada cuadro (unas 60 veces por segundo) `frame()` hace, en este orden:

1. Calcula `dt` (segundos desde el cuadro anterior, máximo 0,05) y avanza el reloj global `T`.
2. Ejecuta los temporizadores de `later()` que tocan (solo los de la escena actual).
3. Comprueba el candado de adultos (mantener pulsado 3 s abajo a la derecha) y el límite de tiempo de juego (`S.limit`, que lleva a la escena `dormir`).
4. Música (`musicTick`) y `scene.update(dt)`.
5. **Si la escena es 3D** (`scene.three`), llama a `R3frame(dt)` de `world3d.js`, que anima y pinta el 3D en `#gl`.
6. `scene.draw()` pinta lo 2D en `#cv` (encima del 3D), y luego la ayuda (`drawHelp`), las partículas (`drawParts`), avisos y monedas.

Los toques llegan por eventos del navegador: `pointerdown` → `scene.down(x,y)`, `pointermove` → `scene.move`, `pointerup` → `scene.up`. La tecla Escape equivale a tocar el botón de la casa.

## 5. Escenas

Una **escena** es una pantalla del juego. Todas viven en el objeto global `SCENES`:

```js
SCENES.miEscena = {
  music: 'jardin',          // música de fondo (o null)
  enter(o) { ... },         // se llama al entrar; o = datos del viaje ({t: idTema, g: nJuego, hello: true...})
  update(dt) { ... },       // opcional: animación por tiempo
  draw() { ... },           // obligatorio: pinta la pantalla
  down(x, y) { ... },       // toque (también move/up para arrastrar)
  hint() { return {x, y, r} }, // dónde brilla la ayuda si el niño no toca nada
  prompt() { say('...') },  // repite la consigna (se llama al tocar a Tito)
  dwell(id) { ... },        // el ratón se queda quieto sobre algo: decir su nombre
  three: true,              // solo las escenas 3D (lo pone world3d.js)
};
```

Para cambiar de escena se llama a `go('nombre', {datos})`. `go` cancela los temporizadores (`later`), las partículas y la voz de la escena anterior, y llama a `enter`. **Usa siempre `later(ms, fn)` en vez de `setTimeout`**: así, si el niño se va de la escena, lo programado no se ejecuta en la siguiente.

### Las escenas que hay

| Escena | Archivo | Qué es |
|---|---|---|
| `title` | scenes.js (+3D) | Portada |
| `edad`, `quien`, `intro` | scenes.js | Elegir edad, nombre y cuento de bienvenida (solo la primera vez) |
| `map` | zonas.js (+3D) | La isla con todos los lugares |
| `jardin`, `bosque`, `montana`, `fiestas`, `ingles` | zonas.js (+3D) | Zonas con su camino de casitas (se crean con `zoneScene(z)`) |
| `casita` | zonas.js (+3D) | Dentro de un tema: las estaciones de juego |
| `juego` | scenes.js | Ejecuta un juego (un componente de comps*.js) |
| `cofre` | zonas.js (+3D) | Recompensa al terminar un tema |
| `asamblea` | scenes.js + zonas.js | La rutina diaria (día, tiempo, emociones, cumpleaños) |
| `tienda`, `casaTito` | tienda.js | Tienda y casa de Tito (2D) |
| `album` | scenes.js | Álbum de pegatinas |
| `repaso` | repaso.js | Repaso diario |
| `dormir` | scenes.js | Fin del tiempo de juego |

### Capas: cómo se "reescriben" las escenas

El juego empezó en 2D y creció por capas. Cada archivo posterior **envuelve** métodos de escenas anteriores en lugar de reescribirlas desde cero:

```js
// Patrón para envolver un método sin perder el original
{ const A = SCENES.asamblea, enter0 = A.enter;
  A.enter = function (o) { enter0.call(this, o); /* lo nuevo */ }; }
```

- `zonas.js` reescribe el mapa y la casita de `scenes.js` (la versión de `scenes.js` del mapa, del jardín y de la casita **ya no se usa**: es código antiguo).
- `tienda.js` envuelve `SCENES.juego` y `finishGame` (monedas); `repaso.js` envuelve `rec`, `finishGame`, la casita y el mapa.
- `world3d.js` envuelve `map`, las zonas, `casita`, `cofre` y `title` para pintarlos en 3D.

**Consecuencia práctica**: antes de cambiar una escena, busca en todos los archivos quién la envuelve (`grep -n "SCENES.casita" src/*.js`). El comportamiento final es el de la última capa.

## 6. El flujo del niño

1. **Portada** → la primera vez: **edad** → **¿quién juega?** (nombre) → **intro**. Después, directamente al **mapa**.
2. **Mapa**: si no ha hecho la asamblea hoy, el botón verde "seguir" lleva a la **asamblea**; si ya la hizo, lleva a la casita del siguiente tema (`nextTema()`). También puede tocar una zona, la tienda, la casa de Tito o el álbum.
3. **Zona**: camino de casitas. Solo se abre la siguiente cuando se termina la anterior.
4. **Casita** (tema): estaciones de juego; también se abren en orden.
5. **Juego**: `SCENES.juego` crea el componente con `makeGame(...)`. Al terminar, `finishGame` suma la estrella, da monedas y vuelve a la casita.
6. Cuando se terminan todos los juegos del tema → **cofre** (regalo de `GIFTS`, pegatina y monedas) → vuelta a la zona con la siguiente casita abierta.

Las reglas de apertura están en `zonas.js` (`zoneOpen`, `temaOpen`, `gameOpen`, `NEED`). En la zona de adultos se puede poner el **modo libre** (`S.unlockAll`), que lo abre todo.

## 7. Temas y juegos

Un **tema** es un objeto en `T3`, `T4`, `T5` (o `CAN`, `RUT`, `TRZ`, `FIESTAS`, `ING`):

```js
{ id: '3A-T1',            // identificador ÚNICO; el progreso se guarda con él (¡no cambiarlo nunca!)
  n: 'Mi escuela',        // nombre que se ve
  icon: 'escuela',        // dibujo de la casita (clave de PICS)
  c: '#5CC16A',           // color
  bg: BG.aula,            // fondo de los juegos
  words: [...],           // palabras/dibujos del tema (para los juegos genéricos)
  games: [                // juegos, en orden (el progreso se guarda por posición)
    { t: 'conocer' },                         // juego genérico con las palabras del tema
    { t: 'busca' },
    { t: 'orden', icon: 'mochila', name: 'Ordena la clase',
      make: (d, t) => Arrastra({ ... , bg: t.bg }, d) },  // juego con configuración propia
  ] }
```

`makeGame(juego, tema, alAcabar)` (temas.js, ampliado por extras.js e ingles.js) convierte cada entrada de `games` en un componente de juego.

Un **componente de juego** (comps.js, comps2.js) es una función que recibe una configuración y devuelve un objeto con `enter`, `draw`, `down/move/up`, `hint`, `prompt`, `total` y `done`. Cuando el niño termina, llama a `onDone()`. La lista completa de componentes y su configuración está en la cabecera de `comps.js` y en [COMO-AGREGAR.md](COMO-AGREGAR.md#5-un-juego-nuevo-dentro-de-un-tema).

Los **dibujos** se buscan por nombre en `PICS` y se pintan con `pic(nombre, x, y, tamaño)`. Su nombre hablado sale de `LEX`/`LEX2` (`lex.js`).

## 8. La capa 3D (`world3d.js`)

Es el archivo más grande y el más delicado. La idea clave:

> **La lógica del juego sigue siendo 2D.** El 3D solo dibuja y, en cada cuadro, "le cuenta" a la lógica 2D dónde ha quedado cada cosa en la pantalla.

### Cómo engancha con lo 2D

1. `world3d.js` envuelve las escenas `title`, `map`, las 5 zonas, `casita` y `cofre` con `Object.assign(SCENES.x, {three: true, enter, sync, draw, down})`, guardando sus métodos originales (`enter0`, `down0`).
2. **`enter`** llama al `enter` original y construye el mundo 3D (`buildMap`, `buildZone`, `buildCasita`, `buildCofre`, `buildTitle`), y lo activa con `setWorld(w)`.
3. **Cada cuadro**, `sync()` **proyecta** las posiciones 3D a la pantalla lógica de 1600x900 (`proj`, `projR`, `projO`) y las escribe en las variables que usa la lógica 2D: `MZ2` (lugares del mapa), `ZPOS[zona][tema]` (casitas), `stationPos` (estaciones de la casita), `TITO` y `HOUSE_AT`. Así los `down`, `hint` y bocadillos originales siguen funcionando sin saber que hay 3D.
4. **Al tocar** (`down`): `pickAt(x,y)` lanza un rayo desde la cámara (raycast) y mira qué objeto 3D hay debajo. Si es un lugar o una casita, Tito camina hasta allí (`walkTo`) y al llegar se llama al `down` 2D original (`call0`). Si no es nada importante, se prueba con los objetos decorativos (`flyTap`, `wobTap`), el cielo (`skyTap`), el mar (`seaTap`) y, si no, Tito pasea hasta ese punto (`walkGround`).
5. `R3frame(dt)` (llamado desde `frame()` de adult.js) ejecuta las animaciones del mundo (`w.upd`), mueve la cámara y pinta con el renderer `R`.

Si el navegador no tiene WebGL, el juego funciona igual en 2D.

### El mundo `w`

`newWorld()` crea un objeto mundo; el activo se guarda en `W3` (en el código suele llamarse `w`):

| Campo | Qué es |
|---|---|
| `w.sc`, `w.cam` | la escena y la cámara de Three.js |
| `w.kind` | `'title'`, `'map'`, `'zone'`, `'casita'` o `'cofre'` |
| `w.upd` | lista de funciones `(dt) => {}` que se llaman cada cuadro (animaciones) |
| `w.pick` | objetos que `pickAt` puede devolver (lugares, casitas, estaciones; con `userData.id`) |
| `w.trees` | objetos decorativos que reaccionan al tocarlos (los rellena `wobInit`) |
| `w.tito` | Tito en 3D |
| `w.walk` | el paseo de Tito en curso |
| `w.spots`, `w.cas`, `w.st`, `w.chest` | lugares del mapa, casitas de la zona, estaciones de la casita, cofre |

### Objetos 3D que se tocan

Todos siguen el mismo patrón (funciones `xxx3(w, x, z, escala)`: `frog3`, `kite3`, `can3`...):

1. Se crea un grupo con `grp(...)` y piezas con `mk(geometría, color, opciones)`.
2. Se marca con `g.userData.<tipo> = 1` y, si hace falta, `g.userData.dur` (duración de la animación).
3. Su animación se añade a `w.upd`: mira `g.userData.wob` (el instante en que se tocó) y anima durante `dur` segundos.
4. La marca se añade a `WOBK` para que `wobInit` lo meta en `w.trees` y se pueda tocar.
5. En `wobTap` hay una rama `else if (u.<tipo>) {...}` con su sonido, partículas y frase.
6. Si Tito debe decir su nombre, va en `NAMES3` (frase grabada, palabra escrita) y sus sílabas en `SYL3`.

La receta completa está en [COMO-AGREGAR.md](COMO-AGREGAR.md#3-un-objeto-3d-nuevo-que-se-pueda-tocar).

### Ayudantes de geometría y rendimiento

- `M(color)` material "toon" (sombreado de dibujos animados); `mk` añade un **contorno** marrón con la técnica del casco invertido (`OLm`, `olGeo`).
- `gcache(clave, f)` guarda geometrías repetidas para no recrearlas; `mg` fusiona piezas de un mismo color en una sola geometría (menos llamadas de dibujo).
- `canvasTex` crea texturas dibujando con las funciones 2D (`card`, `text`...).
- `PRK` y `fpsTick` bajan la resolución si el móvil va lento; las piezas pequeñas no proyectan sombra.
- `disposeWorld` libera geometrías y texturas al cambiar de escena (evita que la memoria crezca).

### Día, noche y estaciones

`skyNow()` decide el cielo por la hora del dispositivo: noche de 20 h a 7 h, atardecer de 18 h a 20 h, amanecer hasta las 9 h. De noche salen la luna, estrellas, Júpiter, Saturno, búho, luciérnagas, y los animales duermen. Hay decoración por época: `summerNow()` (sombrilla y castillo de arena), `hallowNow()` (calabazas), Navidad, etc.

## 9. Estado guardado `S`

`S` es un objeto con todo el progreso. Se guarda en `localStorage` con `save()` (no hay guardado automático: hay que llamar a `save()` después de cambiarlo). **Hay partidas guardadas en móviles reales**, así que nunca se puede cambiar el formato de un campo existente. Todos los campos y las reglas están en [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md).

## 10. Voz e idioma

- `say(texto, alAcabar)` hace hablar a Tito. Busca un **MP3 grabado** para ese texto exacto en `voz/manifest.json` (o `voz-fer/` si se eligió la Voz de Fer). Si no lo encuentra, usa la voz del navegador.
- Muchos textos del código están escritos en **español rioplatense** ("Tocá", "Buscá") porque el juego nació así; `tx()` los convierte al **castellano de España** cuando la variante es España (`S.variant='es'`). `V(['rioplatense', 'España'])` elige entre dos versiones cuando el cambio es grande.
- **Regla de oro: no cambies el texto de ninguna frase que ya dice `say()`**, porque perdería su MP3. Las frases nuevas se escriben en castellano de España y se apuntan para grabarlas.

Todo el detalle en [VOCES.md](VOCES.md).

## 11. Sonido, música y partículas

- `tone(frecuencia, duración, tipo, volumen, deslizamiento, retraso)` y `noise(...)` generan efectos con Web Audio (no hay archivos de sonido, salvo la voz). `SFX.good()`, `SFX.bad()`, `SFX.tap()` son los habituales. Los sonidos de animales están en `SOUNDS`.
- La música es generativa: `MUSIC[clave]` define una escala y un tempo; cada escena elige la suya con `music`.
- Partículas 2D: `parts.push({x, y, vx, vy, life, c, r, k, ...})`; `k` es el tipo (`'s'` estrella, `'c'` confeti, `'d'` punto, `'h'` corazón, `'o'` onda, `'n'` nota, `'t'` texto, `'z'` zeta de dormir). Atajos: `burst(x,y,n)`, `sparkles(x,y)`.

## 12. Recompensas

- **Estrellas**: una por juego terminado (`S.temas[id].g`). Se ven en las casitas.
- **Flores**: una por tema terminado. Abren zonas (6 flores en una zona despiertan la siguiente) y hacen crecer la casa de Tito (`HOUSE_NEXT`).
- **Monedas** (`S.coins`): 1 por acierto a la primera (máx. 5 por juego), 3 al terminar un juego (2 si se repite), regalos diarios y del cofre. Se gastan en la tienda.
- **Cofre**: al terminar un tema, el siguiente regalo de `GIFTS` (lista fija en zonas.js).
- **Pipo**: la mascota crece con las estrellas (`PET_NEXT`).
- **Vales**: premios reales que configura la familia en la zona de adultos.
- Diseño: nada de cajas sorpresa aleatorias ni rachas que se pierden; el tiempo de juego lo limita la familia.

## 13. Zona de adultos

Se abre manteniendo pulsado 3 segundos el candado de abajo a la derecha (`openAdult` en adult.js). Es un panel HTML (no canvas) con: modo de juego (camino o libre), edad, nombre, cumpleaños, idioma y voz, volumen, límite de tiempo, animal de Tito, paisaje (que Tito comente o no), vales, estadísticas, copia de seguridad y borrar progreso.

## 14. Montar y publicar

```
src/*.js + head.html ──build.sh──> src/artifact.html, src/index.html
src/index.html ──build_web.py──> src/web/index.html, sw.js, manifest.webmanifest, zip
src/web/{index.html, sw.js, manifest.webmanifest} ──copiar──> raíz del repo ──git push──> GitHub Pages
```

`VER` en `build_web.py` es el nombre de la caché del service worker: **hay que subirlo en cada publicación** o los móviles seguirán con la versión anterior. Los pasos exactos están en [COMO-AGREGAR.md](COMO-AGREGAR.md#1-el-proceso-de-trabajo).

## 15. Pruebas

No hay tests unitarios. Se prueba de dos maneras:
- **A mano**: abrir el juego con un servidor local (`python3 -m http.server`) y jugar.
- **Automática**: `node tests/humo.js` abre el juego en un navegador sin ventana, recorre las escenas de día y de noche, guarda capturas en `tests/capturas/` y falla si hay errores de JavaScript.

Para pruebas desde la consola del navegador, el juego expone `window.__cl` (escenas, `go`, `S`...) y `window.__w3` (mundo 3D, `pickAt`, `proj`). Con `window.__fast = 1` la voz no espera al audio, y `window.__said` guarda lo que va diciendo Tito.
