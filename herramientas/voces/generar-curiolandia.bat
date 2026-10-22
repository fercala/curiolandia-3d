@echo off
rem Curiolandia 3D con el modelo 0.6B. Si lo cierras, al abrirlo otra vez sigue donde lo dejo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generar-voces.ps1" -Tamano 0.6B -Archivo frases-curiolandia.txt %*
