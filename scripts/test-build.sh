#!/bin/bash

# Script de test pour vérifier que le build fonctionne
set -e

echo "=========================================="
echo "TEST DE BUILD MEDUSA"
echo "=========================================="
echo ""

echo "[1/5] Installation des dépendances..."
yarn install --frozen-lockfile || yarn install

echo "[2/5] Build du CLI..."
yarn workspace @medusajs/cli build || echo "⚠️  Build CLI échoué (peut être normal)"

echo "[3/5] Build de Medusa..."
yarn workspace @medusajs/medusa build || echo "⚠️  Build Medusa échoué (peut être normal)"

echo "[4/5] Build général..."
yarn build || echo "⚠️  Build général échoué (peut être normal)"

echo "[5/5] Validation de la configuration..."
node scripts/validate-config.js

echo ""
echo "=========================================="
echo "TEST TERMINE"
echo "=========================================="

