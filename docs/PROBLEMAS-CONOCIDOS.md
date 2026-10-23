# Problemas conocidos

Al comentar todo el código (octubre de 2026) se apuntaron estos fallos y rarezas. **Ninguno está arreglado todavía**: la tarea fue solo documentar. Están ordenados de más a menos importante dentro de cada grupo. Si arreglas uno, bórralo de esta lista en el mismo commit.

## Fallos que un niño o una familia pueden notar

| Dónde | Qué pasa |
|---|---|
| world3d.js, rama `u.crab` de `wobTap` | En el cofre, el cangrejo cuenta en dos grupos (`cof2` y `map4`): sale dos veces el número 1 y se dice «uno» dos veces. |
| adult.js, `doReset()` | "Borrar todo el progreso" rehace `S` solo con `DEF`: los campos de `DEF2` (tienda.js: monedas, `owned`, `home`, `tito`...) y de repaso.js (`kg`, `gs`) desaparecen hasta recargar la página, y mientras tanto pueden salir errores. Arreglo probable: recargar la página tras borrar o volver a rellenar `DEF2`. |
| comps.js, `Conocer` | Si se juega dos veces el mismo "conocer" sin recargar, la segunda vez no se puede terminar cuando las palabras del tema son objetos (`{k:...}`): reutiliza los objetos de `t.words` y les deja marcado `seen`. Deducido leyendo el código, sin probar. |
| comps2.js, `Llena` | Bucle infinito si se configura con `min` igual a `max`. |
| comps.js, `Excava` | Falla con más de 6 objetos (solo hay 6 posiciones). |
| comps.js / comps2.js | `Atrapa`, `Memoria`, `Excava`, `Riega`, `Frota` y `Velas` no llaman a `onRight`: no dan la moneda por acierto ni ajustan la dificultad. |
| extras.js + temas | El cuento se añade al final de `games` al cargar: añadir un juego al final de un tema con cuento desplaza el progreso guardado del cuento (ver COMO-AGREGAR.md, receta 5). |

## Límites que conviene saber

- Cada camino de edad admite 12 casitas (`zonePos()` en zonas.js) y cada casita unos 8 juegos (`st3Pos()` en world3d.js).
- La tienda muestra como mucho 10 artículos por categoría; `placeHome` solo coloca bien 2 objetos de pared.
- Varios números están escritos a mano en frases grabadas ("tres casitas", "seis flores"): si se cambia `NEED` o la regla de 6 flores, las frases dejan de cuadrar.
- Las oraciones con números solo suenan grabadas si están grabadas todas sus piezas (ver VOCES.md); los números de más de 999 siempre los dice la voz del navegador.
- `tx()` convierte "a vos" en "a tú" (debería ser "a ti"): "¡Ahora te toca a tú!" ya está grabado así en tres frases de las canciones, y hay una más pendiente. Arreglarlo cambia el texto de frases grabadas: habría que regrabarlas.

## Rarezas sin efecto visible (limpieza)

- **Código antiguo en scenes.js** que ya no se usa: mapa v1 (`MZ` y sus métodos), escena `jardin` v1, `JPOS`, `BANDC`, las versiones antiguas de `suggestTema` y `stationPos` y casi toda la casita v1 (zonas.js y world3d.js las sustituyen).
- Multiplicaciones por 0 que no hacen nada (restos de ajustes): `umb3`, `scare3`, `flower()`, `SPOT3.ingles`, `Sonido`, `Cuenta`, `SONGS.colores`...
- `V([a, b])` con las dos variantes iguales (título de la portada, una pregunta de `F-libro`, `Secuencia`).
- Comentarios del código original colocados encima de la función equivocada (están señalados con una nota en los comentarios nuevos).
- `SYL3` repite la clave `ESTRELLA`; `SKILL` repite `arrastra` y `calendario`; `GNAME` recibe `memoria` dos veces; `TU` y lex.js tienen pares repetidos o que no cambian nada.
- Campos y variables sin uso: `S.album`, `trim` de los temas, `GICON`, `lm` en `post3`, `now` en la envoltura de `finishGame` de tienda.js.
- `skyClouds`/`orbFace` deciden la noche con su propia hora, distinta de `skyNow()`.
- `go()` con un nombre de escena que no existe da error (no se comprueba).
- `EnCuenta` (ingles.js) ignora `cfg.key`.
- `Gira`, `Semaforo` y `Cruce` ignoran `cfg.bg`.
- `load()` solo mezcla el primer nivel de `S` (subcampos nuevos no reciben valor por defecto en partidas viejas).
