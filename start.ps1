# Restart eqüivale — sobe backend + frontend (e opcionalmente o túnel Cloudflare).
# Env-driven: portas vindas de variáveis de ambiente, com defaults de DEV.
#
# Uso:
#   .\start.ps1                       # DEV: backend :5053, frontend :3000, sem túnel
#   $env:BACKEND_PORT=5054; $env:VITE_PORT=3001; .\start.ps1   # HOM: portas separadas
#   .\start.ps1 -Tunnel              # também sobe o túnel Cloudflare (HOM)
param([switch]$Tunnel)

$root = $PSScriptRoot
$backendPort  = if ($env:BACKEND_PORT) { $env:BACKEND_PORT } else { '5053' }
$frontendPort = if ($env:VITE_PORT)    { $env:VITE_PORT }    else { '3000' }
# O proxy do Vite aponta para o backend do MESMO ambiente.
$apiTarget = "http://localhost:$backendPort"

Write-Host "=== eqüivale — iniciando serviços (pasta: $root) ==="
Write-Host "Backend :$backendPort | Frontend :$frontendPort | API target $apiTarget"

# Mata instâncias antigas destas portas (libera lock de DLL).
Get-Process equivale.Api -ErrorAction SilentlyContinue | Stop-Process -Force
if ($Tunnel) { Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force }

# [1/2] Backend
Write-Host "[1/2] Backend API..."
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root\backend\src\equivale.Api'; dotnet run --urls http://localhost:$backendPort" -WindowStyle Minimized
Start-Sleep 5

# [2/2] Frontend (Vite) — repassa VITE_PORT e VITE_API_TARGET para o processo.
Write-Host "[2/2] Frontend Vite..."
$feCmd = "cd '$root\frontend'; `$env:VITE_PORT='$frontendPort'; `$env:VITE_API_TARGET='$apiTarget'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit -Command $feCmd" -WindowStyle Minimized
Start-Sleep 5

# [3] Túnel Cloudflare (opcional — usado pela HOM para expor via app.rodney.silva)
if ($Tunnel) {
  Write-Host "[3] Túnel Cloudflare..."
  $envFile = "$root\.env.cloudflare"
  if (-not (Test-Path $envFile)) {
    Write-Host "ERRO: .env.cloudflare não encontrado em $root (CLOUDFLARE_TUNNEL_TOKEN). Túnel não subiu." -ForegroundColor Red
  } else {
    $token = Get-Content $envFile | Select-String "CLOUDFLARE_TUNNEL_TOKEN=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value }
    if (-not $token) { Write-Host "ERRO: CLOUDFLARE_TUNNEL_TOKEN ausente no .env.cloudflare." -ForegroundColor Red }
    else {
      $cf = "C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe"
      Start-Process powershell -ArgumentList "-NoExit -Command $cf tunnel run --token $token" -WindowStyle Minimized
    }
  }
}

Write-Host ""
Write-Host "=== Serviços iniciados ==="
Write-Host "Backend :  http://localhost:$backendPort"
Write-Host "Frontend:  http://localhost:$frontendPort"
if ($Tunnel) { Write-Host "Túnel:     https://app.rodney.silva" }
