param(
    [string]$Branch = "main"
)

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $ProjectDir

$env:NODE_ENV = "production"

Write-Host "🚀 Déploiement sur Cloudflare Pages (branch: $Branch)..." -ForegroundColor Cyan
wrangler pages deploy . --project-name top-vacances-bf --branch $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Déploiement réussi !" -ForegroundColor Green
} else {
    Write-Host "❌ Échec du déploiement" -ForegroundColor Red
    exit $LASTEXITCODE
}
