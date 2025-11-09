# Script PowerShell pour déployer le frontend sur Cloudflare Pages via Wrangler

Write-Host "🚀 DÉPLOIEMENT FRONTEND SUR CLOUDFLARE PAGES" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Wrangler est installé
try {
    $wranglerVersion = wrangler --version 2>&1
    Write-Host "✅ Wrangler CLI trouvé: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Vérifier la connexion Cloudflare
Write-Host ""
Write-Host "🔐 Vérification de la connexion Cloudflare..." -ForegroundColor Yellow
try {
    $whoami = wrangler whoami 2>&1
    Write-Host "✅ Connecté à Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Non connecté à Cloudflare" -ForegroundColor Yellow
    Write-Host "Exécution de: wrangler login" -ForegroundColor Yellow
    wrangler login
}

# Demander l'URL du backend
Write-Host ""
Write-Host "📋 Configuration de l'URL du backend" -ForegroundColor Yellow
$BACKEND_URL = Read-Host "Entrez l'URL du backend Render (ex: https://medusa-backend-xxx.onrender.com)"

if ([string]::IsNullOrWhiteSpace($BACKEND_URL)) {
    Write-Host "❌ URL du backend requise" -ForegroundColor Red
    exit 1
}

# Vérifier que l'URL commence par https://
if (-not $BACKEND_URL.StartsWith("https://")) {
    Write-Host "⚠️  L'URL devrait commencer par https://" -ForegroundColor Yellow
    $CONTINUE = Read-Host "Continuer quand même? (y/n)"
    if ($CONTINUE -ne "y") {
        exit 1
    }
}

Write-Host "✅ URL backend: $BACKEND_URL" -ForegroundColor Green

# Aller à la racine du monorepo
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$ROOT_DIR = Split-Path -Parent $ROOT_DIR
Set-Location $ROOT_DIR

Write-Host ""
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
yarn install

Write-Host ""
Write-Host "🔨 Build des dépendances nécessaires..." -ForegroundColor Yellow
yarn workspace @medusajs/deps build
yarn workspace @medusajs/types build
yarn workspace @medusajs/icons build
yarn workspace @medusajs/ui-preset build
yarn workspace @medusajs/ui build
yarn workspace @medusajs/js-sdk build
yarn workspace @medusajs/admin-shared build
yarn workspace @medusajs/admin-vite-plugin build

Write-Host ""
Write-Host "🏗️  Build du dashboard..." -ForegroundColor Yellow
yarn workspace @medusajs/dashboard build:preview

# Vérifier que dist/ existe
$DIST_DIR = Join-Path $ROOT_DIR "packages\admin\dashboard\dist"
if (-not (Test-Path $DIST_DIR)) {
    Write-Host "❌ Le dossier dist/ n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green

# Aller dans le répertoire dashboard
Set-Location "packages\admin\dashboard"

Write-Host ""
Write-Host "☁️  Déploiement sur Cloudflare Pages..." -ForegroundColor Yellow
Write-Host ""

# Déployer avec les variables d'environnement
$env:VITE_MEDUSA_ADMIN_BACKEND_URL = $BACKEND_URL
$env:VITE_AUTH_API_URL = "https://medusa-auth.gfiyfougiug.workers.dev"
$env:NODE_ENV = "production"

wrangler pages deploy dist --project-name=medusa-admin

Write-Host ""
Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host "1. Notez l'URL Cloudflare Pages affichée ci-dessus" -ForegroundColor White
Write-Host "2. Configurez CORS dans le backend Render pour autoriser cette URL" -ForegroundColor White
Write-Host "3. Testez le site dans votre navigateur" -ForegroundColor White
Write-Host ""

