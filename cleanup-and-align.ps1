[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSCommandPath
if (-not $repoRoot) {
    $repoRoot = (Get-Location).Path
}

Write-Host "[CleanUp] Executando faxina em $repoRoot" -ForegroundColor Cyan

function Remove-PathIfExists {
    param (
        [Parameter(Mandatory = $true)][string]$Path,
        [switch]$Recurse
    )
    if (Test-Path -LiteralPath $Path) {
        if ($Recurse) {
            Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
        } else {
            Remove-Item -LiteralPath $Path -Force -ErrorAction Stop
        }
        Write-Host "  - Removido: $Path" -ForegroundColor DarkGray
    }
}

# 1) Move docker-compose para a raiz, caso ainda esteja em infra/
$infraCompose = Join-Path $repoRoot 'infra/docker-compose.yml'
$rootCompose = Join-Path $repoRoot 'docker-compose.yml'
if (Test-Path -LiteralPath $infraCompose) {
    if (Test-Path -LiteralPath $rootCompose) {
        $backup = "$rootCompose.bak"
        Move-Item -LiteralPath $rootCompose -Destination $backup -Force
        Write-Host "  - docker-compose existente salvo em $backup" -ForegroundColor Yellow
    }
    Move-Item -LiteralPath $infraCompose -Destination $rootCompose -Force
    Write-Host "docker-compose.yml movido para a raiz" -ForegroundColor Green
}

# 2) Remover pasta infra inteira
$infraDir = Join-Path $repoRoot 'infra'
Remove-PathIfExists -Path $infraDir -Recurse

# 3) Limpar dist/ e node_modules obsoletos
$buildArtifacts = @(
    'dist',
    'backend/dist',
    'frontend/dist'
)
foreach ($relPath in $buildArtifacts) {
    Remove-PathIfExists -Path (Join-Path $repoRoot $relPath) -Recurse
}

$nodeModules = @(
    'node_modules',
    'backend/node_modules',
    'frontend/node_modules'
)
foreach ($relPath in $nodeModules) {
    Remove-PathIfExists -Path (Join-Path $repoRoot $relPath) -Recurse
}

# 4) Remover configs antigas que não existem no projeto referência
$obsoleteFiles = @(
    'backend.env'
)
foreach ($relPath in $obsoleteFiles) {
    Remove-PathIfExists -Path (Join-Path $repoRoot $relPath)
}

Write-Host "Limpeza concluida. Execute 'docker-compose up --build' na raiz." -ForegroundColor Cyan
