# Herramientas de voz

Scripts para generar las voces grabadas de Tito. El proceso completo está en [docs/VOCES.md](../../docs/VOCES.md).

- `frases-curiolandia-nuevas.txt`: frases nuevas pendientes de grabar (una por línea, en castellano de España, texto exacto).
- `generar-curiolandia-nuevas.bat`: genera los WAV de esas frases con Voicebox (Windows).
- `generar-curiolandia.bat`: lo mismo con la lista completa `frases-curiolandia.txt` (se saca de `voz/manifest.json`).
- `generar-voces.ps1`: el script de PowerShell que usan los dos `.bat` (habla con la API local de Voicebox).
- `preparar_voz.py`: convierte los WAV en MP3 y escribe `voz/manifest.json`.
- `auditoria/`: busca todas las frases que dice Tito sin voz grabada y prepara la lista para grabar (ver su `LEEME.md`).
