# Liste vos ressources OCI pour faciliter le déploiement

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         LISTE DES RESSOURCES ORACLE CLOUD            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier OCI CLI
if (-not (Get-Command oci -ErrorAction SilentlyContinue)) {
    Write-Host "❌ OCI CLI non installé" -ForegroundColor Red
    Write-Host "   Installez avec: pip install oci-cli" -ForegroundColor Yellow
    exit 1
}

# Liste des compartiments
Write-Host "📦 COMPARTIMENTS DISPONIBLES:" -ForegroundColor Yellow
try {
    $compartments = oci iam compartment list --all --query 'data[*].{Name:name,OCID:id}' --output table 2>&1
    Write-Host $compartments
} catch {
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# Liste des instances existantes
Write-Host "🖥️  INSTANCES EXISTANTES:" -ForegroundColor Yellow
try {
    $tenancyOCID = oci iam tenancy get --query 'data.id' --raw-output 2>&1
    $instances = oci compute instance list --compartment-id $tenancyOCID --all --query 'data[*].{Name:"display-name",OCID:id,State:"lifecycle-state",IP:"public-ip"}' --output table 2>&1
    Write-Host $instances
} catch {
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# Liste des VCNs
Write-Host "🌐 RÉSEAUX VCN:" -ForegroundColor Yellow
try {
    $tenancyOCID = oci iam tenancy get --query 'data.id' --raw-output 2>&1
    $vcns = oci network vcn list --compartment-id $tenancyOCID --all --query 'data[*].{Name:"display-name",OCID:id}' --output table 2>&1
    Write-Host $vcns
} catch {
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# Liste des sous-réseaux
Write-Host "🔗 SOUS-RÉSEAUX:" -ForegroundColor Yellow
try {
    $tenancyOCID = oci iam tenancy get --query 'data.id' --raw-output 2>&1
    $subnets = oci network subnet list --compartment-id $tenancyOCID --all --query 'data[*].{Name:"display-name",OCID:id,VCN:"vcn-id"}' --output table 2>&1
    Write-Host $subnets
} catch {
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Utilisez ces informations avec:" -ForegroundColor Cyan
Write-Host "   .\DEPLOY-ORACLE-COMPLET.ps1 -CompartmentOCID `"OCID`" -SubnetOCID `"OCID`"" -ForegroundColor White
Write-Host ""

