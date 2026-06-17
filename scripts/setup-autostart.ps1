# setup-autostart.ps1 — instala o auto-start do eqüivale (dev + hom) no logon,
# SEM precisar de admin, usando a pasta Startup + um .vbs oculto. Idempotente.
# Rode: powershell -ExecutionPolicy Bypass -File setup-autostart.ps1

$ErrorActionPreference = 'Stop'
$autostart = 'C:\Users\rodne\projetos\equivale\dev\scripts\autostart.ps1'
$startup = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$vbs = Join-Path $startup 'equivale-autostart.vbs'

if (-not (Test-Path $autostart)) { Write-Host "autostart.ps1 não encontrado em $autostart" -ForegroundColor Red; exit 1 }

# .vbs que executa o autostart.ps1 sem nenhuma janela (0 = hidden, False = não espera).
$vbsContent = @"
' Auto-start do eqüivale (dev + hom) — criado por setup-autostart.ps1
CreateObject("Wscript.Shell").Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""$autostart""", 0, False
"@
Set-Content -Path $vbs -Value $vbsContent -Encoding ASCII

Write-Host "Auto-start instalado em: $vbs" -ForegroundColor Green
Write-Host "No próximo logon, dev (3000/5053) e hom (3001/5054 + túnel) sobem ocultos." -ForegroundColor Green
Write-Host "Para remover: apague $vbs" -ForegroundColor Yellow
