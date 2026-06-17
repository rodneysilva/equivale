# restructure.ps1 — move o workspace de equivale -> equivale\dev e cria equivale\hom (worktree).
#
# POR QUE UM SCRIPT: o processo do Kilo mantém a pasta do workspace aberta (CWD),
# impedindo renomeá-la enquanto ele roda. Rode este script COM O KILO FECHADO.
#
# USO (no PowerShell, com o Kilo fechado):
#   powershell -ExecutionPolicy Bypass -File C:\Users\rodne\projetos\equivale\restructure.ps1
#
# Resultado:
#   C:\Users\rodne\projetos\equivale\
#     dev\   <- working copy, branch dev (abra o Kilo aqui para desenvolver)
#     hom\   <- worktree, branch hom (destino dos merges)
$ErrorActionPreference = 'Stop'

$root   = 'C:\Users\rodne\projetos\equivale'
$parent = Split-Path $root -Parent
$dev    = Join-Path $root 'dev'
$hom    = Join-Path $root 'hom'

if (Test-Path $dev) {
    Write-Host "A pasta 'dev' já existe em $root — a reestruturação já foi feita? Abortando." -ForegroundColor Yellow
    exit 1
}

# Garante branch dev (deve estar limpo e sincronizado).
Set-Location $root
$branch = git rev-parse --abbrev-ref HEAD
if ($LASTEXITCODE -ne 0) { Write-Host "$root não é um repositório git válido." -ForegroundColor Red; exit 1 }
if ($branch -ne 'dev') {
    Write-Host "Trocando para branch 'dev'..."
    git checkout dev
    if ($LASTEXITCODE -ne 0) { Write-Host "Falha ao trocar para 'dev'. Commite/descarte mudanças primeiro." -ForegroundColor Red; exit 1 }
}

# Move root -> dev (via nome temporário, pois não dá pra mover uma pasta para dentro de si).
$tmp = Join-Path $parent 'equivale_tmp'
Write-Host "Movendo $root -> $dev ..."
Rename-Item -LiteralPath $root -NewName 'equivale_tmp'
New-Item -ItemType Directory -Path $root | Out-Null
Move-Item -LiteralPath $tmp -Destination $dev

# Cria worktree hom (branch hom já existe no remote; checka-out como worktree irmã).
Set-Location $dev
Write-Host "Criando worktree 'hom' em $hom ..."
git worktree add $hom hom
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao criar worktree hom (a branch 'hom' existe no remote?). Recrie com: git -C $dev worktree add $hom hom" -ForegroundColor Red
} else {
    Write-Host "Worktree hom criada." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Estrutura final ===" -ForegroundColor Cyan
Get-ChildItem $root -Directory | Select-Object -ExpandProperty Name
Write-Host ""
Write-Host "Dev (desenvolver aqui): $dev  [branch dev]" -ForegroundColor Green
Write-Host "Hom (merge sob pedido):  $hom  [branch hom]" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo passo: abra o Kilo na pasta 'dev' para continuar desenvolvendo." -ForegroundColor Cyan
