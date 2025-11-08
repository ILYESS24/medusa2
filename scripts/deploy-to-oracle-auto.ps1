# Script de déploiement automatique sur Oracle Cloud
# Usage: .\deploy-to-oracle-auto.ps1 -OracleIP "VOTRE_IP" -SSHKey "chemin/vers/key.pem"

param(
    [Parameter(Mandatory=$true)]
    [string]$OracleIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHKey,
    
    [string]$SSHUser = "ubuntu",
    [string]$DBPassword = "",
    [string]$JWTSecret = "",
    [string]$CookieSecret = "",
    [string]$AdminEmail = "admin@medusa.com",
    [string]$AdminPassword = ""
)

Write-Host "`n🚀 Déploiement automatique sur Oracle Cloud" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifier que la clé SSH existe
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ Clé SSH introuvable: $SSHKey" -ForegroundColor Red
    exit 1
}

# Générer des secrets si non fournis
if ([string]::IsNullOrEmpty($DBPassword)) {
    $DBPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "🔑 Mot de passe DB généré automatiquement" -ForegroundColor Yellow
}

if ([string]::IsNullOrEmpty($JWTSecret)) {
    $JWTSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
}

if ([string]::IsNullOrEmpty($CookieSecret)) {
    $CookieSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
}

if ([string]::IsNullOrEmpty($AdminPassword)) {
    $AdminPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    Write-Host "🔑 Mot de passe admin généré: $AdminPassword" -ForegroundColor Yellow
}

# Créer le script de déploiement à envoyer
$deployScript = @"
#!/bin/bash
set -e

echo "🚀 Déploiement Medusa sur Oracle Cloud"
echo "========================================"

# Variables
DB_PASSWORD='$DBPassword'
JWT_SECRET='$JWTSecret'
COOKIE_SECRET='$CookieSecret'
ADMIN_EMAIL='$AdminEmail'
ADMIN_PASSWORD='$AdminPassword'

# 1. Mise à jour
echo "1. Mise à jour système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js
echo "2. Installation Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Installation PostgreSQL
echo "3. Installation PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# 4. Configuration PostgreSQL
echo "4. Configuration PostgreSQL..."
sudo -u postgres psql <<PSQL
CREATE DATABASE medusa_db;
CREATE USER medusa_user WITH PASSWORD '\$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_user;
ALTER DATABASE medusa_db OWNER TO medusa_user;
\q
PSQL

# 5. Installation PM2
echo "5. Installation PM2..."
sudo npm install -g pm2 yarn

# 6. Créer le répertoire de l'application
echo "6. Préparation du répertoire..."
APP_DIR="/home/ubuntu/medusa"
mkdir -p \$APP_DIR
cd \$APP_DIR

# 7. Créer le fichier .env
echo "7. Configuration .env..."
cat > .env <<ENV
DATABASE_URL=postgres://medusa_user:\$DB_PASSWORD@localhost:5432/medusa_db
JWT_SECRET=\$JWT_SECRET
COOKIE_SECRET=\$COOKIE_SECRET
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=.
NODE_ENV=production
ENV

# 8. Installation des dépendances (si package.json existe)
if [ -f "package.json" ]; then
    echo "8. Installation des dépendances..."
    yarn install
fi

# 9. Migration base de données
echo "9. Migration base de données..."
if command -v medusa &> /dev/null || [ -f "node_modules/.bin/medusa" ]; then
    npx medusa db:migrate || echo "Migration peut-être déjà effectuée"
fi

# 10. Création utilisateur admin
echo "10. Création utilisateur admin..."
if command -v medusa &> /dev/null || [ -f "node_modules/.bin/medusa" ]; then
    npx medusa user -e "\$ADMIN_EMAIL" -p "\$ADMIN_PASSWORD" || echo "Utilisateur peut-être déjà créé"
fi

# 11. Configuration firewall
echo "11. Configuration firewall..."
sudo ufw allow 9000/tcp 2>/dev/null || echo "UFW non disponible"

# 12. Démarrer avec PM2
echo "12. Démarrage avec PM2..."
cd \$APP_DIR
if [ -f "package.json" ]; then
    pm2 delete medusa 2>/dev/null || true
    pm2 start npm --name "medusa" -- start
    pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
fi

echo ""
echo "✅ Déploiement terminé!"
echo "Medusa accessible sur: http://$OracleIP:9000"
echo "Admin email: \$ADMIN_EMAIL"
echo "Admin password: \$ADMIN_PASSWORD"
"@

# Sauvegarder le script temporairement
$tempScript = "deploy-remote.sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "`n📤 Envoi des fichiers sur Oracle Cloud..." -ForegroundColor Yellow

# Créer un script qui envoie les fichiers et exécute le déploiement
$transferScript = @"
# Transférer les fichiers essentiels
echo "📦 Transfert des fichiers..."
"@

# Utiliser SCP pour transférer les fichiers nécessaires
Write-Host "📦 Préparation du transfert..." -ForegroundColor Yellow

# Créer un script qui fait tout
$fullDeployScript = @"
# Transférer le script de déploiement
scp -i "$SSHKey" "$tempScript" ${SSHUser}@${OracleIP}:/home/ubuntu/

# Exécuter le script sur le serveur
ssh -i "$SSHKey" ${SSHUser}@${OracleIP} "chmod +x /home/ubuntu/$tempScript && /home/ubuntu/$tempScript"
"@

$fullDeployScript | Out-File -FilePath "execute-deploy.sh" -Encoding UTF8

Write-Host "`n✅ Scripts créés!" -ForegroundColor Green
Write-Host "`n📋 Pour déployer, exécutez:" -ForegroundColor Cyan
Write-Host "   bash execute-deploy.sh" -ForegroundColor White
Write-Host "`nOU manuellement:" -ForegroundColor Cyan
Write-Host "   1. scp -i `"$SSHKey`" $tempScript ${SSHUser}@${OracleIP}:/home/ubuntu/" -ForegroundColor White
Write-Host "   2. ssh -i `"$SSHKey`" ${SSHUser}@${OracleIP}" -ForegroundColor White
Write-Host "   3. chmod +x $tempScript && ./$tempScript" -ForegroundColor White

Write-Host "`n🔑 Informations générées:" -ForegroundColor Yellow
Write-Host "   DB Password: $DBPassword" -ForegroundColor White
Write-Host "   Admin Email: $AdminEmail" -ForegroundColor White
Write-Host "   Admin Password: $AdminPassword" -ForegroundColor White

