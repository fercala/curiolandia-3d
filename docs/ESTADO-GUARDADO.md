# El estado guardado `S`

`S` es el objeto global con todo lo que el juego recuerda: edad, nombre, progreso, monedas, ropa de Tito, ajustes de la familia... Está definido en `src/core.js` y se guarda en el `localStorage` del navegador.

> **Importante:** hay niños jugando con partidas guardadas en sus móviles. Si cambias el formato de `S` de forma incompatible, esas partidas se rompen o se pierden. Lee la sección 3 antes de tocar nada.

## 1. Cómo se guarda y se carga

- **Clave** en `localStorage`: `'curiolandia.v1'` (constante `KEY` en core.js). No se cambia nunca.
- **Guardar**: `save()` escribe todo `S` como JSON. **No hay guardado automático**: llama a `save()` justo después de cambiar algo que deba recordarse.
- **Cargar**: `load()` se ejecuta una vez al arrancar. Hace `S = Object.assign(copia de DEF, lo guardado)`. Es decir: parte de los valores por defecto `DEF` y encima pone lo guardado. Solo mezcla el **primer nivel** (los objetos de dentro, como `S.tito`, se toman tal cual de lo guardado).
- Los campos de `tienda.js` (`DEF2`) se rellenan después: `for (k in DEF2) if (S[k] === undefined) S[k] = copia de DEF2[k]`. `repaso.js` hace lo mismo con los suyos.
- Si no hay partida pero sí una de **Letrilandia** (otro juego de la familia, clave `letrilandia.v1`), se copian de ahí el nombre, la edad, el acento y el volumen.
- **Copia de seguridad** (zona de adultos): `bkEncode()` genera un texto `CURIO1.` + JSON comprimido en base64; "Recuperar" lo vuelve a escribir en `localStorage` y recarga la página.

## 2. Los campos

### En `DEF` (core.js)

| Campo | Formato | Para qué |
|---|---|---|
| `age` | `0` (sin elegir), `3`, `4` o `5` | Edad del niño. Usa `AGE()`, que devuelve 3 si aún es 0. |
| `name` | texto (máx. 20) | Nombre del niño (`''` si no hay). |
| `variant` | `''`, `'ar'` o `'es'` | Variante del español: `'es'` = España (la de las voces grabadas). |
| `hemi` | `'N'` o `'S'` | Hemisferio, para las estaciones del año. |
| `vol` | `{voz, mus, fx}` de 0 a 1 | Volúmenes. |
| `limit` | minutos: `0`, `10`, `15`, `20` | Límite de tiempo de juego al día (0 = sin límite). |
| `temas` | `{idTema: {g: {índiceJuego: veces}, done: 0/1}}` | **El progreso.** Cuántas veces se ha terminado cada juego de cada tema y si el tema está terminado. |
| `stats` | `{habilidad: {ok, err}}` | Aciertos y fallos por habilidad (`rec()`), para la tabla de adultos y el repaso. |
| `days` | `{'AAAA-MM-DD': minutos}` | Minutos jugados por día (últimos 30). |
| `asam` | `{'AAAA-MM-DD': {done, age, dia, tiempo, emo}}` | Asambleas hechas (máx. 120 días). |
| `stk` | `{claveDibujo: cantidad}` | Pegatinas del álbum. |
| `album` | `[]` | No se usa. |
| `intro` | `true/false` | Si ya vio el cuento de bienvenida. |
| `first` | `{askedName, fromLetri, jardin, bosque..., wk}` | Cosas que solo pasan una vez (saludos largos, si ya se preguntó el nombre...). |
| `seenFl` | número | Flores ya celebradas en el mapa. |

### En `DEF2` (tienda.js)

| Campo | Formato | Para qué |
|---|---|---|
| `coins`, `coinsTot` | números | Monedas actuales y ganadas en total. |
| `gift` | fecha `'AAAA-MM-DD'` | Último regalo diario de monedas. |
| `woke` | `{bosque: 1, montana: 1}` | Zonas ya "despertadas" (anunciadas). |
| `home` | `{idArtículo: {x, y}}` | Dónde está cada objeto en la casa de Tito. |
| `tito` | `{shell, scarf, hat, glasses, bow, kind}` | Colores y ropa de Tito; `kind` = `'caracol'`, `'erizo'`, `'tortuga'` o `'conejo'`. |
| `owned` | `{idArtículo: 1}` | Artículos que tiene. |
| `vales`, `valesLog` | listas | Vales que ofrece la familia y vales comprados (`{id, txt, d, given}`). |
| `bday`, `bdayDone` | `{d, m}` (mes de 0 a 11) o `null`; fecha | Cumpleaños y última vez que se celebró. |
| `unlockAll` | `true/false` | Modo libre (todo abierto). |
| `seenOpen` | `{clave: [ids]}` | Qué estaba abierto la última vez, para animar lo que se abre nuevo. |
| `houseSeen`, `petSeen` | números | Último nivel de la casa / etapa de Pipo celebrados. |
| `cofres` | número | Cofres abiertos. |

### En `repaso.js`

| Campo | Formato | Para qué |
|---|---|---|
| `kg` | `{habilidad: [ids de juego]}` | En qué juegos sale cada habilidad (últimos 6). |
| `gs` | `{'idTema#índice': {ok, err, d}}` | Aciertos, fallos y fecha de cada juego. |
| `rep` | `{d, list, done, weak, paid, seen}` | El repaso del día. |

### Sueltos (sin valor en `DEF`; se leen con `S.x || valor`)

| Campo | Formato | Para qué |
|---|---|---|
| `voz` | `''` o `'fer'` | Voz grabada elegida (`voz/` o `voz-fer/`). |
| `quiet3` | `0` o `1` | Si Tito se calla al tocar el paisaje 3D. |
| `last` | id de tema | Último tema visitado. |

## 3. Reglas para no romper partidas guardadas

1. **No renombres** ningún campo ni cambies su tipo o su significado. Si `temas` es un objeto, seguirá siendo un objeto con el mismo formato.
2. **No cambies los `id`** de temas (`'3A-T1'`), de artículos de la tienda ni de dibujos que estén guardados en `S.temas`, `S.owned`, `S.home`, `S.stk`...
3. **Los juegos de un tema se guardan por posición** (`S.temas[id].g[índice]`): añade juegos nuevos **al final** de `games`. Si insertas uno en medio, las estrellas guardadas pasan a apuntar a otro juego.
4. **Campo nuevo = valor por defecto obligatorio.** Tres formas válidas:
   - añadirlo a `DEF2` en tienda.js (se rellena solo en las partidas viejas);
   - añadirlo a `DEF` en core.js (también se rellena al cargar);
   - o leerlo siempre con un valor de respaldo: `S.miCampo || 0`.
5. **Subcampos nuevos dentro de un objeto** (por ejemplo `S.tito.zapatos`): `load()` no los rellena en partidas viejas. Léelos siempre con respaldo: `(S.tito.zapatos || '')`.
6. Llama a `save()` después de cambiar algo.
7. Si el campo debe sobrevivir a "Borrar todo el progreso" (zona de adultos), añádelo a la lista `keep` de `doReset()` en adult.js.

## 4. Cómo probar con una partida concreta

Desde la consola del navegador (F12):

```js
__cl.S                    // ver el estado
__cl.S.age = 5; __cl.S.unlockAll = true; __cl.go('map')   // cambiar algo y volver al mapa
localStorage.removeItem('curiolandia.v1'); location.reload()  // empezar de cero (¡borra la partida de ese navegador!)
```

Para probar que una partida antigua sigue funcionando, guarda una copia de seguridad antes de tu cambio, monta tu versión y recupera esa copia en la zona de adultos.
