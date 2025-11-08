#!/bin/bash

# Script de déploiement automatique sur Oracle Cloud
# À exécuter sur l'instance Oracle Cloud

set -e

echo "🚀 Déploiement Medusa sur Oracle Cloud"
echo "========================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Mise à jour système
echo -e "${YELLOW}1. Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js
echo -e "${YELLOW}2. Installation Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}Node.js version: $(node --version)${NC}"

# 3. Installation PostgreSQL
echo -e "${YELLOW}3. Installation PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi
echo -e "${GREEN}PostgreSQL installé${NC}"

# 4. Configuration PostgreSQL
echo -e "${YELLOW}4. Configuration PostgreSQL...${NC}"
read -sp "Mot de passe PostgreSQL pour medusa_user: " DB_PASSWORD
echo

sudo -u postgres psql <<EOF
CREATE DATABASE medusa_db;
CREATE USER medusa_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_user;
\q
EOF

# 5. Installation PM2
echo -e "${YELLOW}5. Installation PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 6. Installation des dépendances
echo -e "${YELLOW}6. Installation des dépendances...${NC}"
if [ ! -d "node_modules" ]; then
    npm install -g yarn
    yarn install
fi

# 7. Configuration .env
echo -e "${YELLOW}7. Configuration .env...${NC}"
if [ ! -f ".env" ]; then
    read -sp "JWT Secret: " JWT_SECRET
    echo
    read -sp "Cookie Secret: " COOKIE_SECRET
    echo
    
    cat > .env <<EOF
DATABASE_URL=postgres://medusa_user:$DB_PASSWORD@localhost:5432/medusa_db
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=.
NODE_ENV=production
EOF
    echo -e "${GREEN}.env créé${NC}"
fi

# 8. Migration base de données
echo -e "${YELLOW}8. Migration base de données...${NC}"
npx medusa db:migrate || echo "Migration déjà effectuée"

# 9. Création utilisateur admin
echo -e "${YELLOW}9. Création utilisateur admin...${NC}"
read -p "Email admin: " ADMIN_EMAIL
read -sp "Mot de passe admin: " ADMIN_PASSWORD
echo

npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" || echo "Utilisateur peut-être déjà créé"

# 10. Démarrage avec PM2
echo -e "${YELLOW}10. Démarrage avec PM2...${NC}"
pm2 delete medusa 2>/dev/null || true
pm2 start npm --name "medusa" -- start
pm2 save
pm2 startup

# 11. Configuration firewall
echo -e "${YELLOW}11. Configuration firewall...${NC}"
sudo ufw allow 9000/tcp || echo "UFW non configuré, configurez manuellement dans Oracle Cloud Console"

echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "Medusa devrait être accessible sur: http://VOTRE_IP:9000"
echo "Vérifiez avec: pm2 logs medusa"
echo "Status: pm2 status"

