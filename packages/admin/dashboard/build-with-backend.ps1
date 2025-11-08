# Script de build avec configuration backend
$env:VITE_MEDUSA_BACKEND_URL = "https://medusa-backend.gfiyfougiug.workers.dev"
$env:VITE_MEDUSA_ADMIN_BACKEND_URL = "https://medusa-backend.gfiyfougiug.workers.dev"
$env:VITE_AUTH_API_URL = "https://medusa-auth.gfiyfougiug.workers.dev"
$env:VITE_MEDUSA_STOREFRONT_URL = "https://medusa-backend.gfiyfougiug.workers.dev"

Write-Host "Building with backend URL: $env:VITE_MEDUSA_BACKEND_URL" -ForegroundColor Green
Write-Host "Building with auth URL: $env:VITE_AUTH_API_URL" -ForegroundColor Green

npx vite build

Write-Host "Build complete!" -ForegroundColor Green

