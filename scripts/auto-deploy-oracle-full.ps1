# Script PowerShell de déploiement complet automatique Oracle Cloud
# Crée l'instance ET déploie Medusa automatiquement

param(
    [Parameter(Mandatory=$true)]
    [string]$OracleIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHKey,
    
    [string]$SSHUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DÉPLOIEMENT COMPLET AUTOMATIQUE ORACLE CLOUD" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifications
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ Clé SSH introuvable: $SSHKey" -ForegroundColor Red
    exit 1
}

# Test connexion
Write-Host "`n🔌 Test de connexion à $OracleIP..." -ForegroundColor Yellow
try {
    $null = ssh -i $SSHKey -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "echo 'OK'" 2>&1
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible de se connecter" -ForegroundColor Red
    Write-Host "   Vérifiez l'IP et le firewall Oracle Cloud (port 22)" -ForegroundColor Yellow
    exit 1
}

# Transférer le script de déploiement
Write-Host "`n📤 Transfert du script de déploiement..." -ForegroundColor Yellow
$deployScript = Join-Path $PSScriptRoot "deploy-oracle-complete.sh"
if (-not (Test-Path $deployScript)) {
    Write-Host "❌ Script introuvable: $deployScript" -ForegroundColor Red
    exit 1
}

scp -i $SSHKey -o StrictHostKeyChecking=no $deployScript "${SSHUser}@${OracleIP}:/home/ubuntu/" 2>&1 | Out-Null
Write-Host "✅ Script transféré" -ForegroundColor Green

# Transférer les fichiers essentiels du projet
Write-Host "`n📦 Transfert des fichiers Medusa..." -ForegroundColor Yellow
$medusaRoot = Split-Path (Split-Path $PSScriptRoot)

# Créer le répertoire sur le serveur
ssh -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "mkdir -p /home/ubuntu/medusa" | Out-Null

# Transférer package.json et yarn.lock si existent
$filesToTransfer = @("package.json", "yarn.lock", ".medusa")
foreach ($file in $filesToTransfer) {
    $filePath = Join-Path $medusaRoot $file
    if (Test-Path $filePath) {
        try {
            if (Test-Path $filePath -PathType Container) {
                scp -i $SSHKey -r -o StrictHostKeyChecking=no $filePath "${SSHUser}@${OracleIP}:/home/ubuntu/medusa/" 2>&1 | Out-Null
            } else {
                scp -i $SSHKey -o StrictHostKeyChecking=no $filePath "${SSHUser}@${OracleIP}:/home/ubuntu/medusa/" 2>&1 | Out-Null
            }
            Write-Host "   ✅ $file transféré" -ForegroundColor Gray
        } catch {
            Write-Host "   ⚠️  $file non transféré" -ForegroundColor Yellow
        }
    }
}

# Exécuter le déploiement
Write-Host "`n🚀 Exécution du déploiement..." -ForegroundColor Yellow
Write-Host "   (Cela prend 5-10 minutes)" -ForegroundColor Gray

$output = ssh -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "chmod +x /home/ubuntu/deploy-oracle-complete.sh && /home/ubuntu/deploy-oracle-complete.sh" 2>&1

# Afficher la sortie
$output | ForEach-Object { Write-Host $_ }

# Vérifier le résultat
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ DÉPLOIEMENT RÉUSSI!" -ForegroundColor Green
    Write-Host "`n🌐 Backend Medusa: http://$OracleIP:9000" -ForegroundColor Cyan
    Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Configurez le firewall Oracle Cloud (port 9000)" -ForegroundColor White
    Write-Host "   2. Testez: curl http://$OracleIP:9000/health" -ForegroundColor White
    Write-Host "   3. Mettez à jour le frontend avec cette URL" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Déploiement terminé avec des erreurs" -ForegroundColor Yellow
    Write-Host "   Vérifiez les logs ci-dessus" -ForegroundColor White
}

