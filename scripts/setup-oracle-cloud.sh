#!/bin/bash

# Script de configuration initiale Oracle Cloud
# À exécuter une seule fois après création de l'instance

set -e

echo "🔧 Configuration initiale Oracle Cloud"
echo "======================================"

# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installation outils de base
sudo apt install -y curl wget git build-essential

# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Installation PM2
sudo npm install -g pm2 yarn

# Installation Nginx (optionnel)
sudo apt install -y nginx

echo "✅ Configuration initiale terminée"
echo ""
echo "Prochaines étapes:"
echo "1. Configurez PostgreSQL (voir deploy-oracle-cloud.sh)"
echo "2. Clonez votre projet Medusa"
echo "3. Exécutez deploy-oracle-cloud.sh"

