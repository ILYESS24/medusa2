# ⚡ DÉPLOYER LE FRONTEND SUR CLOUDFLARE - MAINTENANT

## 🎯 COMMANDES RAPIDES

### Option 1: Script Automatique (Recommandé)

**Windows (PowerShell):**
```powershell
.\scripts\deploy-frontend-cloudflare.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-frontend-cloudflare.sh
./scripts/deploy-frontend-cloudflare.sh
```

Le script va:
- ✅ Vérifier Wrangler
- ✅ Vous demander l'URL du backend
- ✅ Builder tout automatiquement
- ✅ Déployer sur Cloudflare Pages

---

### Option 2: Commandes Manuelles

#### 1. Installer Wrangler (Si pas déjà fait)
```bash
npm install -g wrangler
```

#### 2. Se Connecter à Cloudflare
```bash
wrangler login
```

#### 3. Obtenir l'URL du Backend
1. Render Dashboard > Service `medusa-backend`
2. **Copiez l'URL** (ex: `https://medusa-backend-abc123.onrender.com`)

#### 4. Builder le Frontend
```bash
# Depuis la racine du monorepo
yarn install
yarn workspace @medusajs/deps build
yarn workspace @medusajs/types build
yarn workspace @medusajs/icons build
yarn workspace @medusajs/ui-preset build
yarn workspace @medusajs/ui build
yarn workspace @medusajs/js-sdk build
yarn workspace @medusajs/admin-shared build
yarn workspace @medusajs/admin-vite-plugin build
yarn workspace @medusajs/dashboard build:preview
```

#### 5. Déployer
```bash
cd packages/admin/dashboard

# Avec variable d'environnement
$env:VITE_MEDUSA_ADMIN_BACKEND_URL="https://medusa-backend-abc123.onrender.com"
$env:VITE_AUTH_API_URL="https://medusa-auth.gfiyfougiug.workers.dev"
$env:NODE_ENV="production"

wrangler pages deploy dist --project-name=medusa-admin
```

**OU (Linux/Mac):**
```bash
cd packages/admin/dashboard

VITE_MEDUSA_ADMIN_BACKEND_URL="https://medusa-backend-abc123.onrender.com" \
VITE_AUTH_API_URL="https://medusa-auth.gfiyfougiug.workers.dev" \
NODE_ENV="production" \
wrangler pages deploy dist --project-name=medusa-admin
```

---

## ✅ VÉRIFICATION

Après le déploiement, Wrangler affichera:
```
✨ Deployment complete! Take a sneak peek at your worker: https://medusa-admin.pages.dev
```

**Ouvrez cette URL dans votre navigateur!**

---

## 🔧 CONFIGURER LES VARIABLES (Si besoin)

Si vous voulez configurer les variables pour les prochains déploiements:

```bash
wrangler pages secret put VITE_MEDUSA_ADMIN_BACKEND_URL --project-name=medusa-admin
# Entrez: https://medusa-backend-abc123.onrender.com

wrangler pages secret put VITE_AUTH_API_URL --project-name=medusa-admin
# Entrez: https://medusa-auth.gfiyfougiug.workers.dev
```

**⚠️ IMPORTANT:** Les variables `VITE_*` doivent être disponibles **au moment du build**. Si vous les configurez après, il faut rebuilder et redéployer.

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

```bash
# 1. Installer et connecter
npm install -g wrangler
wrangler login

# 2. Utiliser le script automatique
.\scripts\deploy-frontend-cloudflare.ps1

# OU faire manuellement:
# - Builder (voir ci-dessus)
# - wrangler pages deploy dist --project-name=medusa-admin
```

**C'est tout!**

