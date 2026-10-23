# Herramientas de voz

Scripts para generar las voces grabadas de Tito. El proceso completo está en [docs/VOCES.md](../../docs/VOCES.md).

- `dialogos.py`: rehace el catálogo de todos los diálogos `dialogos/todos.csv` (ver [dialogos/LEEME.md](../../dialogos/LEEME.md)).
- `generar-curiolandia-nuevas.bat`: genera con Voicebox (Windows) los WAV de los diálogos pendientes, `dialogos/pendientes.txt`.
- `generar-curiolandia.bat`: lo mismo con la lista completa `frases-curiolandia.txt` (se saca de `voz/manifest.json`).
- `generar-voces.ps1`: el script de PowerShell que usan los dos `.bat` (habla con la API local de Voicebox).
- `preparar_voz.py`: convierte los WAV en MP3 y escribe `voz/manifest.json`.
- `auditoria/`: busca todas las frases que dice Tito sin voz grabada y prepara la lista para grabar (ver su `LEEME.md`).
