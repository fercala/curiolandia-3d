# Voces: cómo habla Tito

Tito habla con **frases grabadas en MP3**. Si una frase no tiene grabación, la dice la **voz del navegador** (que suena mucho peor). Por eso las frases son delicadas: cambiar una sola letra de un texto hace que deje de encontrar su MP3.

## 1. Cómo funciona `say()`

`say(texto, alAcabar, opciones)` está en `src/core.js`:

1. Pasa el texto por `tx()` (convierte del español rioplatense al de España si la variante es España; ver abajo). Con `{en: 1}` (Rincón del inglés) no lo convierte y usa una voz inglesa.
2. Corta la frase que estuviera sonando.
3. Prepara un **plan** con `vozFile(texto)` en el manifiesto de la voz elegida:
   - `voz/manifest.json` (voz principal) o `voz-fer/manifest.json` si en la zona de adultos se eligió la "Voz de Fer" (`S.voz = 'fer'`). Con "Solo voz del navegador" (`S.voz = 'nav'`) no se carga ningún manifiesto y todas las frases las dice la voz del navegador.
   - El manifiesto es `{"v":1, "f": {"texto exacto": "archivo.mp3", ...}}`.
   - La búsqueda ignora mayúsculas y el punto final, y quita el nombre del niño si va detrás de una coma ("¡Muy bien, Lucía!" → busca "¡Muy bien!").
   - Si no está la frase entera, la parte en oraciones y va de izquierda a derecha cogiendo cada vez el **trozo grabado más largo**: "¡Súper! ¡Sus plumas! Lo tienen calentito." = "¡Súper!" + "¡Sus plumas! Lo tienen calentito.". Por eso basta con grabar lo que va detrás de una felicitación de `PRAISE`.
   - Una oración con números que no esté grabada entera se arma con **piezas** (`vozPieces`): quita los signos y junta palabras grabadas sueltas, y los números con `vozNum` ("0" a "100" grabados tal cual y, de 101 a 999, la centena más el resto: "cuatrocientos" + "53"). Ejemplo: "Hoy es jueves 22 de octubre." = "hoy es jueves" + "22" + "de octubre".
   - Lo que siga sin grabar queda como trozo `{t: texto}` para la voz del navegador. Si no hay nada grabado, `vozFile` devuelve `null`.
4. Si hay plan, lo dice `vozSeq`: los MP3 seguidos con `vozPlay` y los trozos `{t}` con `sayTTS` (voz del navegador). Si la frase llevaba el nombre del niño, `say()` pone el nombre delante, con la voz del navegador ("Lucía. ¡Muy bien! ¡Una estrella más!"), porque los nombres no se pueden grabar de antemano. Si no hay plan, dice la frase entera con `speechSynthesis`.
5. Al terminar llama a `alAcabar`, **solo si el niño sigue en la misma escena**.

Mientras habla, Tito mueve la boca y la música baja de volumen. Mientras habla, la ayuda automática no cuenta el tiempo ni repite la consigna (ver ARQUITECTURA, paso 6), así no le corta.

**Qué voz del navegador se usa** (`pickVoice` en `core.js`): la que se eligió en la zona de adultos (Idioma y voz → «Voz del navegador», guardada en `S.vozNav`) si existe en ese aparato; si no, la automática: la del país (España, o Argentina/Uruguay en rioplatense) de más calidad según `vozCalidad` (Natural/Online 4, Premium/Enhanced/Mejorada 3, Google/Siri 2). El botón «Probar» (`vozProbar`) dice un saludo con esa voz. Una web no puede instalar voces: son las del sistema. La zona de adultos explica dónde descargarlas en cada aparato (`vozGuiaHTML` en `adult.js`).

El reproductor de los MP3 (`VOZ_EL`) se crea en el primer toque (`initAudio()`) y suena un instante de silencio: Safari (iPhone, iPad) solo deja reproducir después, cuando el MP3 ya se ha descargado, un `<audio>` que ya sonó dentro de un toque. Si aun así un MP3 no suena, la frase la dice la voz del navegador.

El acento por defecto de una partida nueva es el de España (`S.variant = 'es'`, desde v1.586), el de las grabaciones.

Variantes que verás en el código:
- `say3(texto, cb)` y `sayMix3(...)` (world3d.js): lo que Tito comenta del paisaje 3D. Se callan si la familia activa "Paisaje: callado" (`S.quiet3`).
- `sayMix(['Toca el', '@red'], cb)` (ingles.js): encadena trozos; los que empiezan por `@` se dicen en inglés.
- `sayNum(n)` (world3d.js): dice un número (en inglés dentro del Rincón del inglés).

## 2. Español rioplatense y de España: `tx()` y `V()`

El juego nació en español rioplatense ("Tocá", "Buscá", "¿Cómo te llamás?") y luego se adaptó a España. Por eso:

- Muchos textos del código están en rioplatense. **`tx(texto)`** los convierte al castellano de España palabra por palabra con la tabla `TU` (core.js) y `_tuRe` (lex.js) cuando `S.variant === 'es'`.
- Cuando el cambio es demasiado grande, el código usa **`V(['versión rioplatense', 'versión España'])`**, que elige una de las dos.
- Las grabaciones son **de España**. El manifiesto tiene el texto **ya convertido** por `tx()`.

## 3. Reglas

1. **Evita cambiar el texto de una frase que ya dice `say()`** (ni una coma, ni un acento): perdería su MP3 y la diría la voz del navegador hasta que se regrabe. Si hay que cambiarla, apunta el texto nuevo en `dialogos/pendientes.txt`, como una frase nueva. Tampoco cambies pares de la tabla `TU`: cambiarían muchas frases a la vez.
2. **Las frases nuevas se escriben directamente en castellano de España** ("Toca", no "Tocá"), tal como deben sonar.
3. **Reutilizar una frase que ya está grabada es lo mejor**: no hay que grabar nada. Para ver si una frase existe, búscala en `voz/manifest.json`:
   ```sh
   grep -o '"La regadera[^"]*"' voz/manifest.json
   ```
4. Cada frase nueva o cambiada **se apunta para grabarla** en `dialogos/pendientes.txt` y queda en el catálogo `dialogos/todos.csv` ([dialogos/LEEME.md](../dialogos/LEEME.md)). Mientras no se grabe, la dirá la voz del navegador: el juego funciona, pero suena peor.
5. Si una frase lleva datos que cambian (números, fechas), pon el dato en una oración aparte con palabras fijas alrededor ("Tienes 12 monedas."): así se arma con piezas grabadas. Apunta para grabar las piezas nuevas (las palabras de alrededor, en minúsculas y sin signos). Los nombres de artículos son finitos: graba la oración entera para cada uno.

## 4. Buscar todas las frases sin voz

[`herramientas/voces/auditoria/`](../herramientas/voces/auditoria/LEEME.md) juega todos los juegos y recorre todas las escenas con un robot, apunta cada frase que dice Tito y prepara la lista de lo que falta por grabar (frases, piezas y números), sin el nombre del niño. Úsalo después de cambios grandes o antes de una tanda de grabación.

## 5. Cómo se graba una frase nueva

Las voces se generan en el ordenador de Fernando con **Voicebox** (un programa de síntesis de voz que funciona en local) y los scripts de [`herramientas/voces/`](../herramientas/voces/):

1. **Apunta cada frase nueva o cambiada** al final de `dialogos/pendientes.txt` (ver [dialogos/LEEME.md](../dialogos/LEEME.md)) y rehaz el catálogo con `python3 herramientas/voces/dialogos.py`: una por línea, sin repetir, con el texto exacto que dirá Tito en castellano de España (ya pasado por `tx()`; puedes copiarlo de `window.__said`). Antes comprueba que no esté ya grabada (`grep` en `voz/manifest.json`). Esa lista es la que se le pasa a Fernando para grabar. Las frases que ya están en ella siguen pendientes. Las **piezas** para oraciones con números ("hoy es jueves", "monedas") van en minúsculas y sin signos, y los números con cifras ("22"): el texto de la línea es la clave del manifiesto, así que se graban tal cual.
2. En Windows, con Voicebox abierto, se ejecuta `generar-curiolandia-nuevas.bat` (lee `dialogos/pendientes.txt`). Llama a `generar-voces.ps1`, que crea un `.wav` por frase con el nombre `md5(frase)[:12].wav`. Si se cierra, al volver a abrirlo sigue donde lo dejó. `generar-curiolandia.bat` hace lo mismo con la lista completa.
3. Se convierten los WAV en MP3 y se regenera el manifiesto con `preparar_voz.py`:
   ```sh
   python3 herramientas/voces/preparar_voz.py <lista de frases.txt> <carpetas con los .wav, separadas por comas> voz/ [excluir.txt]
   ```
   Recorta los silencios, los pasa a MP3 mono de 48 kbps (necesita `ffmpeg`) y escribe `voz/manifest.json`. **Ojo:** el manifiesto se genera solo con las frases de la lista que le pases, así que hay que usar la lista **completa** (todas las frases ya grabadas más las nuevas), no solo las nuevas. La lista completa se puede sacar del propio manifiesto: `python3 -c "import json;print('\n'.join(json.load(open('voz/manifest.json'))['f']))"`.
4. Se escuchan las nuevas en el juego. Si alguna sale cortada o rara, va al archivo de excluir: la dirá el navegador hasta que se regrabe.
5. La "Voz de Fer" (`voz-fer/`) usa los mismos nombres de archivo.
6. Se publican los MP3 y el manifiesto (carpeta `voz/` de la raíz del repo), se quitan de `dialogos/pendientes.txt` las frases ya grabadas, se ejecuta `dialogos.py` (pasan a `grabada` en `todos.csv`) y se **sube `VER`** en `src/build_web.py`.
