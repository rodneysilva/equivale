# Restart eqüivale — sobe backend, frontend e tunnel Cloudflare
# Execute: .\start.ps1

$root = "C:\Users\rodne\projetos\equivale"

Write-Host "=== eqüivale — iniciando servicos ==="

# Mata processos antigos
Get-Process equivale.Api -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Backend
Write-Host "[1/3] Backend API..."
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root\backend\src\equivale.Api'; dotnet run --urls http://localhost:5053" -WindowStyle Minimized

# Aguarda backend iniciar
Start-Sleep 5

# Frontend
Write-Host "[2/3] Frontend Vite..."
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root\frontend'; npm run dev" -WindowStyle Minimized

# Aguarda Vite iniciar
Start-Sleep 5

# Tunnel Cloudflare
Write-Host "[3/3] Tunnel Cloudflare..."
$token = Get-Content "$root\.env.cloudflare" | Select-String "CLOUDFLARE_TUNNEL_TOKEN=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value }
if (-not $token) { $token = "REDACTED_CLOUDFLARE_TOKEN" }
Start-Process powershell -ArgumentList "-NoExit -Command C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe tunnel run --token $token" -WindowStyle Minimized

Write-Host ""
Write-Host "=== Servicos iniciados ==="
Write-Host "Backend:  http://localhost:5053"
Write-Host "Frontend: http://localhost:3000"
Write-Host "PWA:      https://app.rodney.website"
