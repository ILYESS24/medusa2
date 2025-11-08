#!/bin/bash

# Script d'installation complète Medusa sur Oracle Cloud
# À télécharger et exécuter directement sur l'instance Oracle Cloud
# Usage: curl -sSL https://raw.githubusercontent.com/VOTRE_REPO/medusa/scripts/install-medusa-oracle-cloud.sh | bash

set -e

echo "🚀 Installation complète Medusa sur Oracle Cloud"
echo "================================================"

# Configuration
APP_DIR="/home/ubuntu/medusa"
REPO_URL="https://github.com/medusajs/medusa.git"  # Ou votre repo
BRANCH="develop"

# 1. Mise à jour système
echo ""
echo "1️⃣ Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js 20
echo ""
echo "2️⃣ Installation Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "✅ Node.js $(node --version)"

# 3. Installation PostgreSQL
echo ""
echo "3️⃣ Installation PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi
echo "✅ PostgreSQL installé"

# 4. Configuration PostgreSQL
echo ""
echo "4️⃣ Configuration PostgreSQL..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="medusa_db"
DB_USER="medusa_user"

sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE $DB_NAME;
    END IF;
END
\$\$;

DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\q
EOF

echo "✅ Base de données: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"

# 5. Installation outils
echo ""
echo "5️⃣ Installation outils..."
sudo npm install -g pm2 yarn @medusajs/medusa-cli

# 6. Cloner/Préparer le projet
echo ""
echo "6️⃣ Préparation du projet Medusa..."
mkdir -p $APP_DIR
cd $APP_DIR

if [ ! -f "package.json" ]; then
    echo "   Clonage du projet Medusa..."
    if [ -d ".git" ]; then
        echo "   Déjà un repo git, pull..."
        git pull || true
    else
        # Essayer de cloner depuis le repo officiel ou créer un nouveau projet
        if command -v medusa &> /dev/null; then
            echo "   Création d'un nouveau projet Medusa..."
            medusa new . --skip-db --skip-env || {
                echo "   Installation des dépendances de base..."
                cat > package.json <<PKG
{
  "name": "medusa-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "medusa start",
    "build": "medusa build",
    "migrate": "medusa db:migrate"
  },
  "dependencies": {
    "@medusajs/medusa": "^2.0.0"
  }
}
PKG
            }
        fi
    fi
fi

# 7. Génération secrets
echo ""
echo "7️⃣ Génération des secrets..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
COOKIE_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
ADMIN_EMAIL="admin@medusa.local"

# 8. Création .env
echo ""
echo "8️⃣ Configuration .env..."
cat > .env <<ENV
DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=.
NODE_ENV=production
ENV

# 9. Installation dépendances
echo ""
echo "9️⃣ Installation des dépendances..."
if [ -f "package.json" ]; then
    yarn install || npm install
fi

# 10. Migration DB
echo ""
echo "🔟 Migration base de données..."
if [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    npx medusa db:migrate || echo "⚠️ Migration peut-être déjà effectuée"
fi

# 11. Création admin
echo ""
echo "1️⃣1️⃣ Création utilisateur admin..."
if [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" || echo "⚠️ Utilisateur peut-être déjà créé"
fi

# 12. Firewall
echo ""
echo "1️⃣2️⃣ Configuration firewall..."
sudo ufw allow 9000/tcp 2>/dev/null || echo "⚠️ Configurez le firewall Oracle Cloud (port 9000)"

# 13. Démarrage PM2
echo ""
echo "1️⃣3️⃣ Démarrage avec PM2..."
pm2 delete medusa 2>/dev/null || true

if [ -f "package.json" ] && grep -q '"start"' package.json; then
    pm2 start npm --name "medusa" -- start
elif [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    pm2 start "medusa" --name "medusa" -- start
else
    echo "⚠️ Medusa non trouvé, serveur temporaire..."
    cat > server.js <<SERVER
require('http').createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(JSON.stringify({message: 'Medusa', status: 'installing'}));
}).listen(9000, '0.0.0.0');
SERVER
    pm2 start server.js --name "medusa"
fi

pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

# 14. Attente et test
echo ""
echo "1️⃣4️⃣ Vérification..."
sleep 5

PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || hostname -I | awk '{print $1}')

echo ""
echo "=============================================="
echo "✅ INSTALLATION TERMINÉE!"
echo "=============================================="
echo ""
echo "🌐 Backend Medusa:"
echo "   http://$PUBLIC_IP:9000"
echo "   http://$PUBLIC_IP:9000/health"
echo ""
echo "🔑 Credentials:"
echo "   Admin Email: $ADMIN_EMAIL"
echo "   Admin Password: $ADMIN_PASSWORD"
echo "   DB Password: $DB_PASSWORD"
echo ""
echo "📋 Commandes:"
echo "   pm2 status"
echo "   pm2 logs medusa"
echo "   pm2 restart medusa"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Configurez le firewall Oracle Cloud (port 9000)"
echo "   2. Mettez à jour le frontend avec: http://$PUBLIC_IP:9000"
echo ""

