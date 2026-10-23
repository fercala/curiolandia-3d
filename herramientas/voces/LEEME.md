# Herramientas de voz

Scripts para generar las voces grabadas de Tito. El proceso completo está en [docs/VOCES.md](../../docs/VOCES.md).

- `dialogos.py`: rehace el catálogo de todos los diálogos `dialogos/todos.csv` (ver [dialogos/LEEME.md](../../dialogos/LEEME.md)).
- `generar-curiolandia-nuevas.bat`: genera con Voicebox (Windows) los WAV de los diálogos pendientes, `dialogos/pendientes.txt`.
- `generar-curiolandia.bat`: lo mismo con la lista completa `frases-curiolandia.txt` (se saca de `voz/manifest.json`).
- `generar-voces.ps1`: el script de PowerShell que usan los dos `.bat` (habla con la API local de Voicebox). Los modelos de voz leen mal las cifras, así que a la voz le manda los números en letras (`Get-Lectura`: «Cuesta 8 monedas.» se lee «Cuesta ocho monedas.»; «1» concuerda: «una moneda», «un año»). El WAV se sigue llamando como el texto con cifras, que es el que busca el juego. Junto a cada WAV de una frase con cifras deja una marca `.letras`; los WAV con cifras que no la tienen (grabados antes, con las cifras mal leídas) se vuelven a hacer solos.
- `preparar_voz.py`: convierte los WAV en MP3 y escribe `voz/manifest.json`.
- `auditoria/`: busca todas las frases que dice Tito sin voz grabada y prepara la lista para grabar (ver su `LEEME.md`).
