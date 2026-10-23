# Pruebas de regresión

Pruebas automáticas con Playwright (Chromium sin ventana) que juegan Curiolandia 3D como un niño al que se le señala dónde tocar: siguen la ayuda de cada pantalla (`scene.hint()`). Lo que encuentran se apunta en `docs/HALLAZGOS-PRUEBAS.md`.

Todas reciben como primer argumento la carpeta de la web montada (la raíz del repo, o `src/web` después de montar). Cada prueba escribe su resultado en `tests/regresion/salida/<prueba>.json` (y capturas `.png` de lo que falla). Esa carpeta no se sube al repositorio.

| Prueba | Qué hace | Cuánto tarda |
|---|---|---|
| `camino.js <web> [3,4,5] [min]` | Partida nueva de punta a punta para cada edad con el ratón de verdad: portada, edad, nombre (a los 5 años se salta), cuento (a los 3 se escucha, a los 4 y 5 se salta), mapa, asamblea, casitas, juegos y cofre. Comprueba que se terminan temas, que hay monedas y cofres, que nada se atasca 90 s y que al recargar el progreso sigue. | unos minutos por edad |
| `juegos.js <web> [trabajador] [nº] [seg] [filtro]` | Juega todos los juegos de todos los temas hasta que terminan. Se puede repartir: `juegos.js . 0 2` y `juegos.js . 1 2` en paralelo. | 20-40 min |
| `limites.js <web> [filtro]` | Casos límite y caminos alternativos: partidas guardadas rotas o viejas, almacenamiento bloqueado o lleno, copias de seguridad raras, nombres raros, toques muy rápidos, salir a mitad, zona de adultos, borrar todo, modo libre, cambiar de edad, pantallas raras, sin WebGL, sin voz, sin MP3, límite de tiempo, fechas especiales, medianoche, hemisferio sur, tienda, partida terminada. | 15-30 min |
| `audio.js <web> [es\|ar] [''\|fer\|nav] [min]` | Juega con el sistema de voz de verdad (MP3 de `voz/` y una voz del navegador simulada que tarda lo que tardaría) y mide cada frase: con qué sonó (MP3, mezcla o voz del navegador), si se cortó sola, si no sonó nada, si sonaron dos voces a la vez. | los minutos que se le digan |
| `informe-b.js <web>` | Los fallos B1-B7 del informe de pruebas jugadas a mano (ver HALLAZGOS-PRUEBAS): repetir «Conocer», fallos de Memoria, mapa tras cambiar libre/edad, gorro del cofre, botón de saltar el cuento, cartel DÍA/NOCHE, copia con `temas: null`. | 2 min |
| `voces.js <web>` | Elección de la voz del navegador (v1.589) con voces de mentira: la automática es la más natural del país, la lista de la zona de adultos (orden y ★), la guía de voces, y que la elegida se guarde, siga tras recargar y vuelva la automática si desaparece. | 20 s |
| `audio-espera.js <web> [trabajador] [nº] [filtro]` | Entra en cada juego y no toca nada 14 s, luego falla dos veces: busca frases que se cortan solas (por ejemplo, la ayuda automática que repite la consigna mientras Tito aún habla). | 20 s por juego |

`lib.js` tiene lo común (servidor, abrir el juego con una fecha y hora fijas, tocar siguiendo la ayuda, registro de hallazgos) y `espia.js` el espía del audio.

Ejemplo, después de montar la web:

```sh
node tests/regresion/camino.js . 3,4,5 8
node tests/regresion/juegos.js . 0 1 90
node tests/regresion/limites.js .
node tests/regresion/audio.js . es '' 6
node tests/regresion/audio-espera.js . 0 1
```

Necesitan Playwright con Chromium (`npm install -g playwright && npx playwright install chromium`). En un ordenador lento o con varias pruebas a la vez, el juego va a pocos fotogramas por segundo y algunos juegos pueden no terminar en el tiempo dado: repite esos con más segundos y un solo trabajador antes de darlos por fallidos.
