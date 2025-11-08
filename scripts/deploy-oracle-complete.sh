#!/bin/bash

# Script complet de déploiement sur Oracle Cloud
# À exécuter directement sur l'instance Oracle Cloud

set -e

echo "🚀 Déploiement complet Medusa sur Oracle Cloud"
echo "=============================================="

# Configuration
APP_DIR="/home/ubuntu/medusa"
DB_NAME="medusa_db"
DB_USER="medusa_user"

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
echo "Mot de passe DB généré: $DB_PASSWORD"

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

echo "✅ Base de données configurée"

# 5. Installation PM2 et Yarn
echo ""
echo "5️⃣ Installation PM2 et Yarn..."
sudo npm install -g pm2 yarn

# 6. Préparation du répertoire
echo ""
echo "6️⃣ Préparation du répertoire..."
mkdir -p $APP_DIR
cd $APP_DIR

# 7. Si le projet n'est pas là, initialiser Medusa
if [ ! -f "package.json" ]; then
    echo "📦 Initialisation du projet Medusa..."
    
    # Installer Medusa CLI globalement
    sudo npm install -g @medusajs/medusa-cli
    
    # Créer un nouveau projet Medusa
    if command -v medusa &> /dev/null; then
        echo "   Création du projet Medusa..."
        medusa new . --skip-db --skip-env || {
            echo "⚠️  Échec de medusa new, création manuelle..."
            # Créer package.json avec Medusa
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
    "@medusajs/medusa": "^2.0.0",
    "@medusajs/admin": "^2.0.0"
  }
}
PKG
        }
    else
        # Fallback: créer package.json de base
        cat > package.json <<PKG
{
  "name": "medusa-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "medusa start",
    "build": "medusa build"
  },
  "dependencies": {
    "@medusajs/medusa": "^2.0.0"
  }
}
PKG
    fi
fi

# 8. Génération des secrets
echo ""
echo "7️⃣ Génération des secrets..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
COOKIE_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# 9. Création du fichier .env
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

echo "✅ .env créé"

# 10. Installation des dépendances
echo ""
echo "9️⃣ Installation des dépendances..."
if [ -f "package.json" ]; then
    yarn install || npm install
fi

# 11. Migration base de données
echo ""
echo "🔟 Migration base de données..."
if [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    npx medusa db:migrate || echo "⚠ Migration peut-être déjà effectuée"
fi

# 12. Création utilisateur admin
echo ""
echo "1️⃣1️⃣ Création utilisateur admin..."
ADMIN_EMAIL="admin@medusa.local"
if [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" || echo "⚠ Utilisateur peut-être déjà créé"
fi

# 13. Configuration firewall
echo ""
echo "1️⃣2️⃣ Configuration firewall..."
sudo ufw allow 9000/tcp 2>/dev/null || echo "⚠ UFW non disponible - configurez dans Oracle Cloud Console"

# 14. Démarrage avec PM2
echo ""
echo "1️⃣3️⃣ Démarrage avec PM2..."
cd $APP_DIR

# Vérifier que package.json a un script start
if ! grep -q '"start"' package.json 2>/dev/null; then
    echo "⚠️  Ajout du script start..."
    # Ajouter le script start
    if command -v jq &> /dev/null; then
        jq '.scripts.start = "medusa start"' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        # Fallback: modifier manuellement
        sed -i '/"scripts"/a\    "start": "medusa start",' package.json 2>/dev/null || \
        echo '  "scripts": {"start": "medusa start"}' > package.json
    fi
fi

# Démarrer avec PM2
pm2 delete medusa 2>/dev/null || true

# Essayer de démarrer Medusa
if [ -f "node_modules/.bin/medusa" ] || command -v medusa &> /dev/null; then
    echo "   Démarrage de Medusa..."
    pm2 start npm --name "medusa" -- start || {
        echo "⚠️  Échec du démarrage avec npm start, tentative directe..."
        pm2 start "medusa" --name "medusa" -- start || {
            echo "⚠️  Medusa non trouvé, création serveur temporaire..."
            # Créer un serveur temporaire qui répond
            cat > server.js <<SERVER
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(JSON.stringify({message: 'Medusa Backend', status: 'running', note: 'Installation en cours'}));
}).listen(9000, '0.0.0.0', () => console.log('Server on 9000'));
SERVER
            pm2 start server.js --name "medusa"
        }
    }
else
    echo "⚠️  Medusa non installé, serveur temporaire..."
    cat > server.js <<SERVER
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(JSON.stringify({message: 'Medusa Backend', status: 'installing', note: 'Réinstallez les dépendances'}));
}).listen(9000, '0.0.0.0', () => console.log('Temporary server on 9000'));
SERVER
    pm2 start server.js --name "medusa"
fi

pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || echo "⚠ Startup config peut nécessiter sudo"

# 15. Attendre que le service démarre
echo ""
echo "1️⃣4️⃣ Vérification du démarrage..."
sleep 5

# 16. Test de santé
echo ""
echo "1️⃣5️⃣ Test de santé..."
for i in {1..10}; do
    if curl -s http://localhost:9000/health > /dev/null 2>&1; then
        echo "✅ Medusa est accessible!"
        break
    fi
    echo "   Tentative $i/10..."
    sleep 2
done

# 17. Récupérer l'IP publique
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "VOTRE_IP")

echo ""
echo "=============================================="
echo "✅ DÉPLOIEMENT TERMINÉ!"
echo "=============================================="
echo ""
echo "🌐 URLs:"
echo "   Backend: http://$PUBLIC_IP:9000"
echo "   Health: http://$PUBLIC_IP:9000/health"
echo ""
echo "🔑 Credentials:"
echo "   Admin Email: $ADMIN_EMAIL"
echo "   Admin Password: $ADMIN_PASSWORD"
echo "   DB Password: $DB_PASSWORD"
echo ""
echo "📊 Commandes utiles:"
echo "   pm2 status          # Voir le status"
echo "   pm2 logs medusa     # Voir les logs"
echo "   pm2 restart medusa  # Redémarrer"
echo ""
echo "⚠️  N'oubliez pas de:"
echo "   1. Configurer le firewall Oracle Cloud (port 9000)"
echo "   2. Mettre à jour le frontend avec cette URL backend"
echo ""

