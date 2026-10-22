# Voces: cómo habla Tito

Tito habla con **frases grabadas en MP3**. Si una frase no tiene grabación, la dice la **voz del navegador** (que suena mucho peor). Por eso las frases son delicadas: cambiar una sola letra de un texto hace que deje de encontrar su MP3.

## 1. Cómo funciona `say()`

`say(texto, alAcabar, opciones)` está en `src/core.js`:

1. Pasa el texto por `tx()` (convierte del español rioplatense al de España si la variante es España; ver abajo). Con `{en: 1}` (Rincón del inglés) no lo convierte y usa una voz inglesa.
2. Corta la frase que estuviera sonando.
3. Busca el MP3 con `vozFile(texto)` en el manifiesto de la voz elegida:
   - `voz/manifest.json` (voz principal) o `voz-fer/manifest.json` si en la zona de adultos se eligió la "Voz de Fer" (`S.voz = 'fer'`).
   - El manifiesto es `{"v":1, "f": {"texto exacto": "archivo.mp3", ...}}`.
   - La búsqueda ignora mayúsculas y el punto final, y quita el nombre del niño si va detrás de una coma ("¡Muy bien, Lucía!" → busca "¡Muy bien!").
   - Si no está la frase entera, prueba **oración por oración**.
4. Si hay MP3, lo reproduce (`vozPlay`); si no, usa `speechSynthesis` del navegador.
5. Al terminar llama a `alAcabar`, **solo si el niño sigue en la misma escena**.

Mientras habla, Tito mueve la boca y la música baja de volumen.

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

1. **No cambies el texto de ninguna frase que ya dice `say()`** (ni una coma, ni un acento). Perdería su MP3. Tampoco cambies pares de la tabla `TU`: cambiarían muchas frases a la vez.
2. **Las frases nuevas se escriben directamente en castellano de España** ("Toca", no "Tocá"), tal como deben sonar.
3. **Reutilizar una frase que ya está grabada es lo mejor**: no hay que grabar nada. Para ver si una frase existe, búscala en `voz/manifest.json`:
   ```sh
   grep -o '"La regadera[^"]*"' voz/manifest.json
   ```
4. Cada frase nueva **se apunta para grabarla** (ver abajo). Mientras no se grabe, la dirá la voz del navegador: el juego funciona, pero suena peor.
5. Evita frases con partes variables (números, nombres de artículos) dentro de la misma oración: nunca tendrán un MP3 exacto. Mejor partirlas en oraciones fijas o reutilizar frases cortas grabadas ("Uno", "Dos"...).

## 4. Cómo se graba una frase nueva

Las voces se generan en el ordenador de Fernando con **Voicebox** (un programa de síntesis de voz que funciona en local) y los scripts de [`herramientas/voces/`](../herramientas/voces/):

1. **Apunta cada frase nueva** al final de `herramientas/voces/frases-curiolandia-nuevas.txt`: una por línea, sin repetir, con el texto exacto que dirá Tito en castellano de España (ya pasado por `tx()`; puedes copiarlo de `window.__said`). Antes comprueba que no esté ya grabada (`grep` en `voz/manifest.json`). Esa lista es la que se le pasa a Fernando para grabar. Las frases que ya están en ella siguen pendientes.
2. En Windows, con Voicebox abierto, se ejecuta `generar-curiolandia-nuevas.bat` (lee la lista de frases nuevas). Llama a `generar-voces.ps1`, que crea un `.wav` por frase con el nombre `md5(frase)[:12].wav`. Si se cierra, al volver a abrirlo sigue donde lo dejó. `generar-curiolandia.bat` hace lo mismo con la lista completa.
3. Se convierten los WAV en MP3 y se regenera el manifiesto con `preparar_voz.py`:
   ```sh
   python3 herramientas/voces/preparar_voz.py <lista de frases.txt> <carpetas con los .wav, separadas por comas> voz/ [excluir.txt]
   ```
   Recorta los silencios, los pasa a MP3 mono de 48 kbps (necesita `ffmpeg`) y escribe `voz/manifest.json`. **Ojo:** el manifiesto se genera solo con las frases de la lista que le pases, así que hay que usar la lista **completa** (todas las frases ya grabadas más las nuevas), no solo las nuevas. La lista completa se puede sacar del propio manifiesto: `python3 -c "import json;print('\n'.join(json.load(open('voz/manifest.json'))['f']))"`.
4. Se escuchan las nuevas en el juego. Si alguna sale cortada o rara, va al archivo de excluir: la dirá el navegador hasta que se regrabe.
5. La "Voz de Fer" (`voz-fer/`) usa los mismos nombres de archivo.
6. Se publican los MP3 y el manifiesto (carpeta `voz/` de la raíz del repo), se vacía `frases-curiolandia-nuevas.txt` y se **sube `VER`** en `src/build_web.py`.
