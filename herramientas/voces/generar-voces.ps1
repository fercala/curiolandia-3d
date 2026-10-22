# Genera un audio WAV por cada linea de un archivo de frases usando la API local de Voicebox.
# Uso: generar-voces.ps1 [-Perfil "nombre de la voz" (si no, sale un menu)] [-Motor qwen|chatterbox] [-Tamano 1.7B|0.6B] [-Archivo frases-prueba.txt] [-Salida audios]
param(
  [string]$Perfil = "",
  [string]$Motor = "qwen",
  [string]$Tamano = "1.7B",
  [string]$Idioma = "es",
  [string]$Archivo = "",
  [string]$Salida = "audios",
  [int]$Espera = 300
)
$ErrorActionPreference = "Stop"
$api = "http://127.0.0.1:17493"
# Windows PowerShell 5 lee mal los acentos de la API: leemos los bytes como UTF-8 nosotros
function Get-Json($url) {
  $r = Invoke-WebRequest $url -UseBasicParsing
  $txt = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
  $x = ConvertFrom-Json $txt
  return ,@($x | ForEach-Object { $_ })
}
Set-Location $PSScriptRoot

# Que un clic en la ventana no la deje en pausa (modo "Seleccionar" de Windows)
try {
  Add-Type -Namespace W -Name Con -MemberDefinition '[DllImport("kernel32.dll")] public static extern IntPtr GetStdHandle(int h); [DllImport("kernel32.dll")] public static extern bool GetConsoleMode(IntPtr h, out uint m); [DllImport("kernel32.dll")] public static extern bool SetConsoleMode(IntPtr h, uint m);'
  $hIn = [W.Con]::GetStdHandle(-10); $modo = 0
  if ([W.Con]::GetConsoleMode($hIn, [ref]$modo)) { [W.Con]::SetConsoleMode($hIn, [uint32](($modo -band 0xFFFFFFBF) -bor 0x80)) | Out-Null }
} catch {}

function Test-Voicebox { try { Invoke-WebRequest "$api/health" -UseBasicParsing -TimeoutSec 15 | Out-Null; $true } catch { $false } }
# Ruta de Voicebox, para poder reiniciarlo si se cuelga
$vbExe = (Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like "*oicebox*" -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1).Path
function Restart-Voicebox {
  Write-Host "   Voicebox no responde. Lo reinicio..." -ForegroundColor Yellow
  if ($vbExe) {
    Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like "*oicebox*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep 5
    Start-Process $vbExe
  } else { Write-Host "   No se donde esta Voicebox: cierralo y abrelo tu, yo espero." -ForegroundColor Yellow }
  for ($w = 0; $w -lt 120; $w++) { Start-Sleep 5; if (Test-Voicebox) { Start-Sleep 10; Write-Host "   Voicebox listo otra vez." -ForegroundColor Green; return } }
  Write-Host "   Voicebox sigue sin responder." -ForegroundColor Red
}

try { Invoke-RestMethod "$api/health" | Out-Null }
catch { Write-Host "No encuentro Voicebox. Abre la aplicacion y vuelve a probar." -ForegroundColor Red; Read-Host "Enter para salir"; exit 1 }

$perfiles = Get-Json "$api/profiles"
if ($perfiles.Count -eq 0) { Write-Host "No hay perfiles de voz. Crea uno en Voicebox primero." -ForegroundColor Red; Read-Host "Enter para salir"; exit 1 }
if ($Perfil) {
  $p = $perfiles | Where-Object { $_.name.Trim() -eq $Perfil } | Select-Object -First 1
  if (-not $p) { $p = $perfiles | Where-Object { $_.name -like "*$Perfil*" } | Select-Object -First 1 }
} else {
  # Menu para elegir la voz
  Write-Host ""
  Write-Host "Voces disponibles en Voicebox:" -ForegroundColor Cyan
  for ($n = 0; $n -lt $perfiles.Count; $n++) { Write-Host ("  {0,2}. {1}" -f ($n + 1), $perfiles[$n].name) }
  Write-Host ""
  do {
    $resp = Read-Host "Escribe el numero de la voz y pulsa Enter"
    $num = 0
    $ok = [int]::TryParse($resp, [ref]$num) -and $num -ge 1 -and $num -le $perfiles.Count
    if (-not $ok) { Write-Host "Ese numero no esta en la lista." -ForegroundColor Yellow }
  } until ($ok)
  $p = $perfiles[$num - 1]
}
if (-not $p) { Write-Host "No hay ningun perfil que se llame '$Perfil'. Perfiles: $($perfiles.name -join ', ')" -ForegroundColor Red; Read-Host "Enter para salir"; exit 1 }
Write-Host "Perfil: $($p.name)   Motor: $Motor $Tamano" -ForegroundColor Cyan

$md5 = [Security.Cryptography.MD5]::Create()
function Get-Nombre($txt) { (($md5.ComputeHash([Text.Encoding]::UTF8.GetBytes($txt)) | ForEach-Object { $_.ToString("x2") }) -join "").Substring(0, 12) + ".wav" }
if (-not $Archivo) {
  $listas = @(Get-ChildItem $PSScriptRoot -Filter "frases-*.txt" | Sort-Object Name)
  if ($listas.Count -eq 1) { $Archivo = $listas[0].Name }
  else {
    Write-Host ""
    Write-Host "Listas de frases:" -ForegroundColor Cyan
    for ($n = 0; $n -lt $listas.Count; $n++) { Write-Host ("  {0,2}. {1}" -f ($n + 1), $listas[$n].Name) }
    do { $resp = Read-Host "Escribe el numero de la lista y pulsa Enter"; $num = 0
         $ok = [int]::TryParse($resp, [ref]$num) -and $num -ge 1 -and $num -le $listas.Count
         if (-not $ok) { Write-Host "Ese numero no esta en la lista." -ForegroundColor Yellow } } until ($ok)
    $Archivo = $listas[$num - 1].Name
  }
}
Write-Host "Frases: $Archivo" -ForegroundColor Cyan
$frases = @([IO.File]::ReadAllLines((Join-Path $PSScriptRoot $Archivo), [Text.Encoding]::UTF8) | Where-Object { $_.Trim() } | ForEach-Object { [string]$_.Trim() })
$nombreVoz = ($p.name.Trim() -replace '[\\/:*?"<>|]', "_")
$sufijo = if ($Motor -eq "qwen") { "$Motor-$Tamano" } else { $Motor }
$lista = [IO.Path]::GetFileNameWithoutExtension($Archivo) -replace "^frases-", ""
$dir = Join-Path (Join-Path (Join-Path $Salida $lista) $nombreVoz) $sufijo
New-Item -ItemType Directory -Force $dir | Out-Null
$log = Join-Path $dir "tiempos.csv"
if (-not (Test-Path $log)) { "archivo;segundos;duracion_audio;frase" | Out-File $log -Encoding UTF8 }

$hechas = 0; $total = 0.0; $fallosSeguidos = 0
for ($vuelta = 1; $vuelta -le 3; $vuelta++) {
  $pendientes = @($frases | Where-Object { -not (Test-Path (Join-Path $dir (Get-Nombre $_))) })
  if ($pendientes.Count -eq 0) { break }
  if ($vuelta -gt 1) { Write-Host ("Otra vuelta para las {0} frases que fallaron" -f $pendientes.Count) -ForegroundColor Cyan }
  $i = $frases.Count - $pendientes.Count
  foreach ($f in $pendientes) {
    $i++
    $wav = Join-Path $dir (Get-Nombre $f)   # el nombre sale del texto: el juego lo encuentra igual
    Write-Host ("[{0}/{1}] {2}" -f $i, $frases.Count, $f)
    $body = @{ profile_id = [string]$p.id; text = [string]$f; language = $Idioma; engine = $Motor }
    if ($Motor -eq "qwen") { $body.model_size = $Tamano }
    $json = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Compress))
    $t = [Diagnostics.Stopwatch]::StartNew()
    try {
      # una frase normal tarda menos de un minuto: si pasan 5, Voicebox se ha colgado
      $r = Invoke-WebRequest "$api/generate" -Method Post -Body $json -ContentType "application/json; charset=utf-8" -TimeoutSec $Espera -UseBasicParsing
      $g = ConvertFrom-Json ([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()))
      $tmp = "$wav.part"
      for ($k = 0; $k -lt 60; $k++) {
        try { Invoke-WebRequest "$api/audio/$($g.id)" -OutFile $tmp -UseBasicParsing -TimeoutSec 60; break } catch { Start-Sleep 2 }
      }
      if (-not (Test-Path $tmp) -or (Get-Item $tmp).Length -lt 1000) { throw "no llego el audio" }
      Move-Item $tmp $wav -Force
      $t.Stop()
      "{0};{1:N1};{2};{3}" -f (Split-Path $wav -Leaf), $t.Elapsed.TotalSeconds, $g.duration, $f | Out-File $log -Append -Encoding UTF8
      $hechas++; $total += $t.Elapsed.TotalSeconds; $fallosSeguidos = 0
      $quedan = ($frases.Count - $i) * $total / $hechas / 3600
      Write-Host ("   listo en {0:N1} s   (quedan unas {1:N1} horas)" -f $t.Elapsed.TotalSeconds, $quedan) -ForegroundColor Green
    } catch {
      $fallosSeguidos++
      Write-Host "   error: $($_.Exception.Message) $($_.ErrorDetails.Message)" -ForegroundColor Red
      Remove-Item "$wav.part" -ErrorAction SilentlyContinue
      if (-not (Test-Voicebox) -or $fallosSeguidos -ge 2) { Restart-Voicebox; $fallosSeguidos = 0 }
    }
  }
}
$faltan = @($frases | Where-Object { -not (Test-Path (Join-Path $dir (Get-Nombre $_))) }).Count
if ($faltan -gt 0) { Write-Host "Faltan $faltan frases: vuelve a abrir el programa y las intenta otra vez." -ForegroundColor Yellow }
Write-Host "Terminado. Los audios estan en $dir" -ForegroundColor Cyan
Read-Host "Enter para salir"
