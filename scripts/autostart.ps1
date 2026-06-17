# autostart.ps1 — sobe dev e hom (executado oculto pelo .vbs na pasta Startup, no logon).
$dev = 'C:\Users\rodne\projetos\equivale\dev'
$hom = 'C:\Users\rodne\projetos\equivale\hom'

# DEV (3000/5053)
& "$dev\start.ps1"

# HOM (3001/5054 + túnel)
$env:BACKEND_PORT = '5054'
$env:VITE_PORT = '3001'
& "$hom\start.ps1" -Tunnel
