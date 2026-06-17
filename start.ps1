# Restart equivale - sobe backend + frontend (e opcionalmente o tunel Cloudflare).
# ASCII puro (sem acentos) para evitar problemas de encoding no PowerShell 5.1.
#
# Uso:
#   .\start.ps1                                  # DEV: backend 5053, frontend 3000
#   $env:BACKEND_PORT=5054; $env:VITE_PORT=3001; .\start.ps1 -Tunnel   # HOM
param([switch]$Tunnel)

$root = $PSScriptRoot
$backendPort  = if ($env:BACKEND_PORT) { $env:BACKEND_PORT } else { '5053' }
$frontendPort = if ($env:VITE_PORT)    { $env:VITE_PORT }    else { '3000' }
$apiTarget    = "http://localhost:$backendPort"

Write-Host "=== equivale - iniciando servicos ==="
Write-Host "Backend port: $backendPort | Frontend port: $frontendPort | API target: $apiTarget"

# Mata apenas o processo que ouve NA PORTA deste ambiente (nao derruba o outro ambiente).
function Stop-PortOwner($port) {
  $owners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($p in $owners) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
}
Stop-PortOwner $backendPort
Stop-PortOwner $frontendPort
if ($Tunnel) { Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force }
Start-Sleep 1

# [1/2] Backend (dotnet run na pasta do projeto, via -WorkingDirectory).
Write-Host "[1/2] Backend API..."
Start-Process -FilePath "dotnet" -ArgumentList "run --urls http://localhost:$backendPort" -WorkingDirectory "$root\backend\src\equivale.Api" -WindowStyle Minimized
Start-Sleep 6

# [2/2] Frontend (Vite) - VITE_PORT e VITE_API_TARGET repassados como env do processo.
Write-Host "[2/2] Frontend Vite..."
$feCmd = "`$env:VITE_PORT='$frontendPort'; `$env:VITE_API_TARGET='$apiTarget'; npm run dev"
Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-Command", $feCmd) -WorkingDirectory "$root\frontend" -WindowStyle Minimized
Start-Sleep 5

# [3] Tunel Cloudflare (opcional - usado pela HOM).
if ($Tunnel) {
  Write-Host "[3] Tunel Cloudflare..."
  $envFile = Join-Path $root ".env.cloudflare"
  if (-not (Test-Path $envFile)) {
    Write-Host "ERRO: .env.cloudflare nao encontrado em $root. Tunel nao subiu." -ForegroundColor Red
  } else {
    $token = (Get-Content $envFile | Select-String "CLOUDFLARE_TUNNEL_TOKEN=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value })
    if (-not $token) { Write-Host "ERRO: CLOUDFLARE_TUNNEL_TOKEN ausente." -ForegroundColor Red }
    else {
      $cf = "C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe"
      Start-Process -FilePath $cf -ArgumentList "tunnel run --token $token" -WindowStyle Minimized
    }
  }
}

Write-Host ""
Write-Host "=== Servicos iniciados ==="
Write-Host "Backend :  http://localhost:$backendPort"
Write-Host "Frontend:  http://localhost:$frontendPort"
if ($Tunnel) { Write-Host "Publico :  https://app.rodney.website" }
