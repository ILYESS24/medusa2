#!/bin/bash
# Script pour initialiser un projet Medusa déployable sur Render

set -e

echo "=========================================="
echo "INITIALISATION PROJET MEDUSA POUR RENDER"
echo "=========================================="
echo ""

# Vérifier si on est dans un projet Medusa
if [ ! -f "medusa-config.ts" ] && [ ! -f "medusa-config.js" ]; then
    echo "⚠️  Ce n'est pas un projet Medusa standard."
    echo "Création d'un nouveau projet Medusa..."
    echo ""
    
    # Créer un nouveau projet Medusa
    npx create-medusa-app@latest medusa-app --skip-db --skip-env || {
        echo "❌ Erreur lors de la création du projet Medusa"
        exit 1
    }
    
    cd medusa-app
    echo "✅ Projet Medusa créé dans ./medusa-app"
fi

echo ""
echo "✅ Configuration Render prête!"
echo ""
echo "Prochaines étapes:"
echo "1. Poussez votre code sur Git (GitHub, GitLab, Bitbucket)"
echo "2. Allez sur https://dashboard.render.com"
echo "3. Créez un nouveau Blueprint et connectez votre repository"
echo "4. Render utilisera automatiquement render.yaml"
echo ""
echo "Ou suivez le guide dans DEPLOY-RENDER.md"

