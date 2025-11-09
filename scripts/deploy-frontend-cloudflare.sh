#!/bin/bash

# Script de déploiement automatique du frontend sur Cloudflare Pages via Wrangler

set -e

echo "🚀 DÉPLOIEMENT FRONTEND SUR CLOUDFLARE PAGES"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que Wrangler est installé
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI n'est pas installé${NC}"
    echo "Installez-le avec: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI trouvé${NC}"

# Vérifier la connexion Cloudflare
echo ""
echo "🔐 Vérification de la connexion Cloudflare..."
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Non connecté à Cloudflare${NC}"
    echo "Exécution de: wrangler login"
    wrangler login
fi

echo -e "${GREEN}✅ Connecté à Cloudflare${NC}"

# Demander l'URL du backend
echo ""
echo "📋 Configuration de l'URL du backend"
read -p "Entrez l'URL du backend Render (ex: https://medusa-backend-xxx.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ URL du backend requise${NC}"
    exit 1
fi

# Vérifier que l'URL commence par https://
if [[ ! "$BACKEND_URL" =~ ^https:// ]]; then
    echo -e "${YELLOW}⚠️  L'URL devrait commencer par https://${NC}"
    read -p "Continuer quand même? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ URL backend: $BACKEND_URL${NC}"

# Aller à la racine du monorepo
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT_DIR"

echo ""
echo "📦 Installation des dépendances..."
yarn install

echo ""
echo "🔨 Build des dépendances nécessaires..."
yarn workspace @medusajs/deps build
yarn workspace @medusajs/types build
yarn workspace @medusajs/icons build
yarn workspace @medusajs/ui-preset build
yarn workspace @medusajs/ui build
yarn workspace @medusajs/js-sdk build
yarn workspace @medusajs/admin-shared build
yarn workspace @medusajs/admin-vite-plugin build

echo ""
echo "🏗️  Build du dashboard..."
yarn workspace @medusajs/dashboard build:preview

# Vérifier que dist/ existe
DIST_DIR="packages/admin/dashboard/dist"
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ Le dossier dist/ n'existe pas${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build réussi${NC}"

# Aller dans le répertoire dashboard
cd packages/admin/dashboard

echo ""
echo "☁️  Déploiement sur Cloudflare Pages..."
echo ""

# Déployer avec les variables d'environnement
VITE_MEDUSA_ADMIN_BACKEND_URL="$BACKEND_URL" \
VITE_AUTH_API_URL="https://medusa-auth.gfiyfougiug.workers.dev" \
NODE_ENV="production" \
wrangler pages deploy dist --project-name=medusa-admin

echo ""
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Notez l'URL Cloudflare Pages affichée ci-dessus"
echo "2. Configurez CORS dans le backend Render pour autoriser cette URL"
echo "3. Testez le site dans votre navigateur"
echo ""

