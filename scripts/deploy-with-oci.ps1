# Déploiement automatique avec OCI CLI utilisant votre User OCID
# Usage: .\deploy-with-oci.ps1

param(
    [string]$UserOCID = "ocid1.user.oc1..aaaaaaaapiztjujxpbcah2asmdpcngxc76waqoopnsmjsqezgmh3yfmopq6q",
    [string]$CompartmentOCID = "",
    [string]$SubnetOCID = "",
    [string]$OracleIP = ""
)

Write-Host "`n🚀 Déploiement Medusa avec Oracle Cloud Infrastructure" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifier OCI CLI
Write-Host "`n1️⃣ Vérification OCI CLI..." -ForegroundColor Yellow
if (-not (Get-Command oci -ErrorAction SilentlyContinue)) {
    Write-Host "❌ OCI CLI non installé" -ForegroundColor Red
    Write-Host "`n📦 Installation OCI CLI..." -ForegroundColor Yellow
    
    # Essayer d'installer via pip
    if (Get-Command pip3 -ErrorAction SilentlyContinue) {
        pip3 install oci-cli
    } elseif (Get-Command pip -ErrorAction SilentlyContinue) {
        pip install oci-cli
    } else {
        Write-Host "❌ pip non trouvé. Installez Python et pip d'abord" -ForegroundColor Red
        Write-Host "   Ou installez OCI CLI manuellement:" -ForegroundColor Yellow
        Write-Host "   https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm" -ForegroundColor White
        exit 1
    }
}

# Vérifier configuration OCI
Write-Host "`n2️⃣ Vérification configuration OCI..." -ForegroundColor Yellow
try {
    $regions = oci iam region list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "OCI non configuré"
    }
    Write-Host "✅ OCI CLI configuré" -ForegroundColor Green
} catch {
    Write-Host "❌ OCI CLI non configuré" -ForegroundColor Red
    Write-Host "`n📋 Configuration requise:" -ForegroundColor Yellow
    Write-Host "   Exécutez: oci setup config" -ForegroundColor White
    Write-Host "   Vous aurez besoin de:" -ForegroundColor White
    Write-Host "   - Tenancy OCID" -ForegroundColor Gray
    Write-Host "   - User OCID: $UserOCID" -ForegroundColor Gray
    Write-Host "   - Region" -ForegroundColor Gray
    Write-Host "   - Fingerprint de votre clé API" -ForegroundColor Gray
    Write-Host "   - Chemin vers votre clé privée API" -ForegroundColor Gray
    exit 1
}

# Si IP fournie, déployer directement
if ($OracleIP) {
    Write-Host "`n🚀 Déploiement sur instance existante: $OracleIP" -ForegroundColor Yellow
    
    # Demander la clé SSH
    $sshKey = Read-Host "Chemin vers votre clé SSH"
    if (-not (Test-Path $sshKey)) {
        Write-Host "❌ Clé SSH introuvable" -ForegroundColor Red
        exit 1
    }
    
    # Exécuter le script de déploiement
    & "$PSScriptRoot\auto-deploy-oracle-full.ps1" -OracleIP $OracleIP -SSHKey $sshKey
    exit 0
}

# Sinon, créer une nouvelle instance
Write-Host "`n🖥️  Création d'une nouvelle instance..." -ForegroundColor Yellow

# Demander les informations nécessaires
if (-not $CompartmentOCID) {
    Write-Host "`n📋 Informations requises:" -ForegroundColor Yellow
    $CompartmentOCID = Read-Host "Compartment OCID"
    $SubnetOCID = Read-Host "Subnet OCID"
    $AvailabilityDomain = Read-Host "Availability Domain (optionnel, laissez vide pour auto)"
}

# Générer clé SSH
Write-Host "`n🔑 Génération clé SSH..." -ForegroundColor Yellow
$sshKeyName = "medusa-key-$(Get-Date -Format 'yyyyMMddHHmmss')"
$sshKeyPath = "$env:USERPROFILE\.ssh\$sshKeyName"
ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""' -q
$publicKey = Get-Content "$sshKeyPath.pub"

Write-Host "✅ Clé générée: $sshKeyPath" -ForegroundColor Green

# Créer l'instance via OCI CLI
Write-Host "`n🖥️  Création de l'instance Compute..." -ForegroundColor Yellow

# Récupérer l'image Ubuntu 22.04
Write-Host "   Recherche de l'image Ubuntu..." -ForegroundColor Gray
$imageOCID = oci compute image list `
    --compartment-id $CompartmentOCID `
    --operating-system "Canonical Ubuntu" `
    --operating-system-version "22.04" `
    --shape "VM.Standard.A1.Flex" `
    --query 'data[0].id' `
    --raw-output 2>&1

if (-not $imageOCID -or $imageOCID -match "error") {
    Write-Host "⚠️  Image non trouvée automatiquement" -ForegroundColor Yellow
    $imageOCID = Read-Host "Image OCID (Ubuntu 22.04)"
}

# Créer l'instance
$instanceName = "medusa-backend-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "   Création de l'instance: $instanceName..." -ForegroundColor Gray

$instanceJson = @{
    compartmentId = $CompartmentOCID
    displayName = $instanceName
    shape = "VM.Standard.A1.Flex"
    shapeConfig = @{
        ocpus = 1
        memoryInGBs = 6
    }
    sourceDetails = @{
        sourceType = "image"
        imageId = $imageOCID
    }
    createVnicDetails = @{
        subnetId = $SubnetOCID
        assignPublicIp = $true
    }
    metadata = @{
        ssh_authorized_keys = $publicKey
    }
} | ConvertTo-Json -Depth 10

$instanceJson | Out-File -FilePath "$env:TEMP\instance-config.json" -Encoding UTF8

$instanceOCID = oci compute instance launch `
    --from-json "file://$env:TEMP\instance-config.json" `
    --query 'data.id' `
    --raw-output 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la création: $instanceOCID" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Instance créée: $instanceOCID" -ForegroundColor Green

# Attendre que l'instance démarre
Write-Host "`n⏳ Attente du démarrage (30-60 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

for ($i = 1; $i -le 12; $i++) {
    $state = oci compute instance get --instance-id $instanceOCID --query 'data."lifecycle-state"' --raw-output 2>&1
    if ($state -eq "RUNNING") {
        Write-Host "✅ Instance en cours d'exécution" -ForegroundColor Green
        break
    }
    Write-Host "   État: $state (attente...)" -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

# Récupérer l'IP publique
Write-Host "`n🌐 Récupération de l'IP publique..." -ForegroundColor Yellow
$publicIP = oci compute instance list-vnics `
    --instance-id $instanceOCID `
    --query 'data[0]."public-ip"' `
    --raw-output 2>&1

if (-not $publicIP -or $publicIP -match "error") {
    Write-Host "❌ Impossible de récupérer l'IP" -ForegroundColor Red
    exit 1
}

Write-Host "✅ IP publique: $publicIP" -ForegroundColor Green

# Attendre SSH
Write-Host "`n⏳ Attente SSH (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Déployer Medusa
Write-Host "`n🚀 Déploiement de Medusa..." -ForegroundColor Yellow
& "$PSScriptRoot\auto-deploy-oracle-full.ps1" -OracleIP $publicIP -SSHKey "$sshKeyPath"

Write-Host "`n✅ TOUT EST TERMINÉ!" -ForegroundColor Green
Write-Host "`n🌐 Backend Medusa: http://$publicIP:9000" -ForegroundColor Cyan
Write-Host "🔑 Clé SSH: $sshKeyPath" -ForegroundColor Cyan
Write-Host "`n⚠️  Configurez le firewall Oracle Cloud (port 9000)" -ForegroundColor Yellow

