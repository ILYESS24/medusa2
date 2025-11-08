# Déploiement COMPLET automatique Oracle Cloud avec votre configuration OCI
# Utilise votre configuration OCI pour créer l'instance ET déployer Medusa

param(
    [string]$CompartmentOCID = "",
    [string]$SubnetOCID = "",
    [string]$AvailabilityDomain = ""
)

$ErrorActionPreference = "Stop"

# Votre configuration OCI
$OCI_CONFIG = @{
    UserOCID = "ocid1.user.oc1..aaaaaaaapiztjujxpbcah2asmdpcngxc76waqoopnsmjsqezgmh3yfmopq6q"
    Fingerprint = "4e:6b:39:58:45:f7:5f:6e:72:58:0f:d5:f6:cc:22:c0"
    TenancyOCID = "ocid1.tenancy.oc1..aaaaaaaaaxkb35jjusdl2ac6isyg7mqyo54hybqqap7ng6c6eqadfksdvvla"
    Region = "eu-paris-1"
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DÉPLOIEMENT AUTOMATIQUE ORACLE CLOUD - TOUT SEUL    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Configuration OCI:" -ForegroundColor Yellow
Write-Host "   Region: $($OCI_CONFIG.Region)" -ForegroundColor White
Write-Host "   User: $($OCI_CONFIG.UserOCID.Substring(0,50))..." -ForegroundColor White
Write-Host ""

# Vérifier OCI CLI
Write-Host "1️⃣ Vérification OCI CLI..." -ForegroundColor Yellow
if (-not (Get-Command oci -ErrorAction SilentlyContinue)) {
    Write-Host "❌ OCI CLI non installé" -ForegroundColor Red
    Write-Host "📦 Installation OCI CLI..." -ForegroundColor Yellow
    
    if (Get-Command pip3 -ErrorAction SilentlyContinue) {
        pip3 install oci-cli
    } elseif (Get-Command pip -ErrorAction SilentlyContinue) {
        pip install oci-cli
    } else {
        Write-Host "❌ pip non trouvé. Installez Python d'abord" -ForegroundColor Red
        exit 1
    }
}

# Vérifier configuration OCI
Write-Host "2️⃣ Vérification configuration OCI..." -ForegroundColor Yellow
try {
    $test = oci iam region list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Non configuré"
    }
    Write-Host "✅ OCI CLI configuré" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Configuration OCI requise" -ForegroundColor Yellow
    Write-Host "   Créez ~/.oci/config avec votre configuration" -ForegroundColor White
}

# Si Compartment et Subnet fournis, créer l'instance
if ($CompartmentOCID -and $SubnetOCID) {
    Write-Host "`n🖥️  Création d'une nouvelle instance..." -ForegroundColor Yellow
    
    # Générer clé SSH
    $sshKeyName = "medusa-key-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $sshKeyPath = "$env:USERPROFILE\.ssh\$sshKeyName"
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""' -q
    $publicKey = Get-Content "$sshKeyPath.pub"
    
    Write-Host "✅ Clé SSH générée: $sshKeyPath" -ForegroundColor Green
    
    # Récupérer l'image Ubuntu
    Write-Host "`n📦 Recherche image Ubuntu 22.04..." -ForegroundColor Yellow
    $imageOCID = oci compute image list `
        --compartment-id $CompartmentOCID `
        --operating-system "Canonical Ubuntu" `
        --operating-system-version "22.04" `
        --shape "VM.Standard.A1.Flex" `
        --query 'data[0].id' `
        --raw-output 2>&1
    
    if (-not $imageOCID -or $imageOCID -match "error") {
        Write-Host "⚠️  Image non trouvée, utilisation d'une image par défaut" -ForegroundColor Yellow
        # Utiliser une image Ubuntu standard pour eu-paris-1
        $imageOCID = Read-Host "Image OCID (Ubuntu 22.04)"
    }
    
    # Créer l'instance
    Write-Host "`n🖥️  Création de l'instance..." -ForegroundColor Yellow
    $instanceName = "medusa-backend-$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    $instanceConfig = @{
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
    }
    
    if ($AvailabilityDomain) {
        $instanceConfig.availabilityDomain = $AvailabilityDomain
    }
    
    $instanceConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "$env:TEMP\instance-config.json" -Encoding UTF8
    
    $instanceOCID = oci compute instance launch `
        --from-json "file://$env:TEMP\instance-config.json" `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur création instance: $instanceOCID" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Instance créée: $instanceOCID" -ForegroundColor Green
    
    # Attendre démarrage
    Write-Host "`n⏳ Attente démarrage (60 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    for ($i = 1; $i -le 12; $i++) {
        $state = oci compute instance get --instance-id $instanceOCID --query 'data."lifecycle-state"' --raw-output 2>&1
        if ($state -eq "RUNNING") {
            Write-Host "✅ Instance en cours d'exécution" -ForegroundColor Green
            break
        }
        Write-Host "   État: $state" -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
    
    # Récupérer IP
    Write-Host "`n🌐 Récupération IP publique..." -ForegroundColor Yellow
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
    & "$PSScriptRoot\..\DEPLOY-TOUT-AUTO.ps1" -OracleIP $publicIP -SSHKey $sshKeyPath
    
    Write-Host "`n✅ TOUT EST TERMINÉ!" -ForegroundColor Green
    Write-Host "`n🌐 Backend Medusa: http://$publicIP:9000" -ForegroundColor Cyan
    Write-Host "🔑 Clé SSH: $sshKeyPath" -ForegroundColor Cyan
    
} else {
    Write-Host "`n📋 Pour créer une nouvelle instance, fournissez:" -ForegroundColor Yellow
    Write-Host "   .\deploy-oracle-full-auto.ps1 -CompartmentOCID `"VOTRE_COMPARTMENT`" -SubnetOCID `"VOTRE_SUBNET`"`n" -ForegroundColor White
    Write-Host "OU si vous avez déjà une instance:" -ForegroundColor Yellow
    Write-Host "   .\DEPLOY-TOUT-AUTO.ps1 -OracleIP `"VOTRE_IP`" -SSHKey `"key.pem`"`n" -ForegroundColor White
}

