# Script de déploiement automatique complet sur Oracle Cloud
# Usage: .\auto-deploy-oracle.ps1 -OracleIP "VOTRE_IP" -SSHKey "chemin/key.pem"

param(
    [Parameter(Mandatory=$true)]
    [string]$OracleIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHKey,
    
    [string]$SSHUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DÉPLOIEMENT AUTOMATIQUE SUR ORACLE CLOUD" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifications
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ Clé SSH introuvable: $SSHKey" -ForegroundColor Red
    exit 1
}

# Vérifier que ssh est disponible
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH non disponible. Installez OpenSSH." -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   IP Oracle Cloud: $OracleIP" -ForegroundColor White
Write-Host "   Utilisateur: $SSHUser" -ForegroundColor White
Write-Host "   Clé SSH: $SSHKey" -ForegroundColor White

# Test de connexion
Write-Host "`n🔌 Test de connexion..." -ForegroundColor Yellow
try {
    $testConnection = ssh -i $SSHKey -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "echo 'Connection OK'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Échec de connexion"
    }
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible de se connecter à $OracleIP" -ForegroundColor Red
    Write-Host "   Vérifiez:" -ForegroundColor Yellow
    Write-Host "   - L'IP est correcte" -ForegroundColor White
    Write-Host "   - Le firewall Oracle Cloud autorise SSH (port 22)" -ForegroundColor White
    Write-Host "   - La clé SSH est correcte" -ForegroundColor White
    exit 1
}

# Transférer le script de déploiement
Write-Host "`n📤 Transfert du script de déploiement..." -ForegroundColor Yellow
$deployScriptPath = Join-Path $PSScriptRoot "deploy-oracle-complete.sh"

if (-not (Test-Path $deployScriptPath)) {
    Write-Host "❌ Script de déploiement introuvable: $deployScriptPath" -ForegroundColor Red
    exit 1
}

try {
    scp -i $SSHKey -o StrictHostKeyChecking=no $deployScriptPath "${SSHUser}@${OracleIP}:/home/ubuntu/" 2>&1 | Out-Null
    Write-Host "✅ Script transféré" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec du transfert: $_" -ForegroundColor Red
    exit 1
}

# Transférer les fichiers essentiels du projet Medusa
Write-Host "`n📦 Transfert des fichiers Medusa..." -ForegroundColor Yellow
$medusaRoot = Split-Path (Split-Path $PSScriptRoot)
$essentialFiles = @(
    "package.json",
    "yarn.lock",
    ".medusa"
)

$transferred = $false
foreach ($file in $essentialFiles) {
    $filePath = Join-Path $medusaRoot $file
    if (Test-Path $filePath) {
        try {
            if (Test-Path $filePath -PathType Container) {
                scp -i $SSHKey -r -o StrictHostKeyChecking=no $filePath "${SSHUser}@${OracleIP}:/home/ubuntu/medusa/" 2>&1 | Out-Null
            } else {
                ssh -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "mkdir -p /home/ubuntu/medusa" | Out-Null
                scp -i $SSHKey -o StrictHostKeyChecking=no $filePath "${SSHUser}@${OracleIP}:/home/ubuntu/medusa/" 2>&1 | Out-Null
            }
            $transferred = $true
        } catch {
            Write-Host "⚠️  Impossible de transférer $file" -ForegroundColor Yellow
        }
    }
}

if (-not $transferred) {
    Write-Host "⚠️  Aucun fichier Medusa transféré. Le script créera une structure de base." -ForegroundColor Yellow
}

# Exécuter le script de déploiement
Write-Host "`n🚀 Exécution du déploiement sur Oracle Cloud..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre 5-10 minutes)" -ForegroundColor Gray

try {
    ssh -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${OracleIP}" "chmod +x /home/ubuntu/deploy-oracle-complete.sh && /home/ubuntu/deploy-oracle-complete.sh" 2>&1 | ForEach-Object {
        Write-Host $_ -ForegroundColor White
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ DÉPLOIEMENT RÉUSSI!" -ForegroundColor Green
        Write-Host "`n🌐 Votre Medusa est accessible sur:" -ForegroundColor Cyan
        Write-Host "   http://$OracleIP:9000" -ForegroundColor White
        Write-Host "`n📋 N'oubliez pas de:" -ForegroundColor Yellow
        Write-Host "   1. Configurer le firewall Oracle Cloud (port 9000)" -ForegroundColor White
        Write-Host "   2. Mettre à jour le frontend avec cette URL backend" -ForegroundColor White
    } else {
        Write-Host "`n⚠️  Le déploiement s'est terminé avec des erreurs" -ForegroundColor Yellow
        Write-Host "   Vérifiez les logs ci-dessus" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    exit 1
}

