# 🚀 DÉPLOYER LE FRONTEND SUR CLOUDFLARE PAGES VIA WRANGLER CLI

## 🎯 OBJECTIF
Déployer le frontend Medusa Admin sur Cloudflare Pages en utilisant Wrangler CLI.

---

## 📋 PRÉREQUIS

### 1. Installer Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Se Connecter à Cloudflare
```bash
wrangler login
```
- Cela ouvrira votre navigateur
- Connectez-vous à votre compte Cloudflare
- Autorisez Wrangler

### 3. Vérifier la Connexion
```bash
wrangler whoami
```
- Devrait afficher votre email Cloudflare

---

## 📋 ÉTAPE 1: CONFIGURER L'URL DU BACKEND

### 1.1 Obtenir l'URL du Backend
1. **Render Dashboard:** https://dashboard.render.com
2. Service `medusa-backend` > **Copiez l'URL** (ex: `https://medusa-backend-abc123.onrender.com`)

### 1.2 Configurer dans Wrangler
**Option A: Modifier wrangler.toml**

Éditez `packages/admin/dashboard/wrangler.toml`:
```toml
[env.production]
VITE_MEDUSA_ADMIN_BACKEND_URL = "https://medusa-backend-abc123.onrender.com"  # Votre URL réelle
```

**Option B: Variable d'environnement**

```bash
export VITE_MEDUSA_ADMIN_BACKEND_URL="https://medusa-backend-abc123.onrender.com"
```

---

## 📋 ÉTAPE 2: BUILDER LE FRONTEND

### 2.1 Aller dans le Répertoire
```bash
cd packages/admin/dashboard
```

### 2.2 Installer les Dépendances (Si pas déjà fait)
```bash
# Depuis la racine du monorepo
yarn install
```

### 2.3 Builder les Dépendances Nécessaires
```bash
# Depuis la racine du monorepo
yarn workspace @medusajs/deps build
yarn workspace @medusajs/types build
yarn workspace @medusajs/icons build
yarn workspace @medusajs/ui-preset build
yarn workspace @medusajs/ui build
yarn workspace @medusajs/js-sdk build
yarn workspace @medusajs/admin-shared build
yarn workspace @medusajs/admin-vite-plugin build
```

### 2.4 Builder le Dashboard
```bash
# Depuis packages/admin/dashboard
cd packages/admin/dashboard
yarn build:preview
```

**OU depuis la racine:**
```bash
yarn workspace @medusajs/dashboard build:preview
```

### 2.5 Vérifier le Build
```bash
# Le dossier dist/ doit être créé
ls -la packages/admin/dashboard/dist
```

---

## 📋 ÉTAPE 3: DÉPLOYER AVEC WRANGLER

### 3.1 Aller dans le Répertoire Dashboard
```bash
cd packages/admin/dashboard
```

### 3.2 Déployer sur Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=medusa-admin
```

**OU avec variables d'environnement:**
```bash
VITE_MEDUSA_ADMIN_BACKEND_URL="https://medusa-backend-abc123.onrender.com" \
VITE_AUTH_API_URL="https://medusa-auth.gfiyfougiug.workers.dev" \
NODE_ENV="production" \
wrangler pages deploy dist --project-name=medusa-admin
```

### 3.3 Première Déploiement (Créer le Projet)
Si c'est le premier déploiement, Wrangler va demander:
- **Project name:** `medusa-admin`
- **Production branch:** `main` ou `develop` (selon votre choix)

### 3.4 Attendre le Déploiement
- ⏱️ **Temps:** 2-5 minutes
- Wrangler va uploader les fichiers
- Cloudflare va générer une URL (ex: `medusa-admin.pages.dev`)

---

## 📋 ÉTAPE 4: CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### 4.1 Via Wrangler CLI
```bash
wrangler pages secret put VITE_MEDUSA_ADMIN_BACKEND_URL --project-name=medusa-admin
# Entrez la valeur: https://medusa-backend-abc123.onrender.com
```

```bash
wrangler pages secret put VITE_AUTH_API_URL --project-name=medusa-admin
# Entrez la valeur: https://medusa-auth.gfiyfougiug.workers.dev
```

### 4.2 Via Cloudflare Dashboard (Alternative)
1. **Cloudflare Dashboard:** https://dash.cloudflare.com
2. **Pages** > Projet `medusa-admin` > **Settings** > **Environment variables**
3. Ajoutez:
   - `VITE_MEDUSA_ADMIN_BACKEND_URL` = `https://medusa-backend-abc123.onrender.com`
   - `VITE_AUTH_API_URL` = `https://medusa-auth.gfiyfougiug.workers.dev`
   - `NODE_ENV` = `production`

**⚠️ IMPORTANT:** Les variables `VITE_*` doivent être configurées **AVANT** le build pour être injectées dans le code.

---

## 📋 ÉTAPE 5: REDÉPLOYER (Si Variables Modifiées)

Si vous avez modifié les variables d'environnement après le premier déploiement:

```bash
cd packages/admin/dashboard
yarn build:preview
wrangler pages deploy dist --project-name=medusa-admin
```

---

## 📋 ÉTAPE 6: VÉRIFIER LE DÉPLOIEMENT

### 6.1 Obtenir l'URL
Après le déploiement, Wrangler affichera l'URL:
```
✨ Deployment complete! Take a sneak peek at your worker: https://medusa-admin.pages.dev
```

### 6.2 Ouvrir le Site
- Ouvrez: `https://medusa-admin.pages.dev`
- Connectez-vous avec votre compte

### 6.3 Vérifier dans la Console (F12)
```javascript
console.log('Backend URL:', window.__BACKEND_URL__)
// Devrait afficher: https://medusa-backend-abc123.onrender.com
```

```javascript
fetch(window.__BACKEND_URL__ + '/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Erreur:', err))
```

---

## 🔧 COMMANDES UTILES WRANGLER

### Lister les Projets
```bash
wrangler pages project list
```

### Voir les Déploiements
```bash
wrangler pages deployment list --project-name=medusa-admin
```

### Voir les Variables
```bash
wrangler pages secret list --project-name=medusa-admin
```

### Supprimer une Variable
```bash
wrangler pages secret delete VITE_MEDUSA_ADMIN_BACKEND_URL --project-name=medusa-admin
```

---

## 🚨 PROBLÈMES COURANTS

### Problème 1: Build Échoue

**Symptômes:**
- Erreur lors du build
- Modules manquants

**Solution:**
```bash
# Depuis la racine du monorepo
yarn install
yarn workspace @medusajs/deps build
yarn workspace @medusajs/types build
# ... (tous les workspaces nécessaires)
```

### Problème 2: Variables Non Injectées

**Symptômes:**
- Console montre `http://localhost:9000`
- Variables d'environnement non prises en compte

**Solution:**
1. Les variables `VITE_*` doivent être disponibles **au moment du build**
2. Configurez-les **AVANT** de builder:
   ```bash
   export VITE_MEDUSA_ADMIN_BACKEND_URL="https://medusa-backend-abc123.onrender.com"
   yarn build:preview
   ```
3. OU utilisez `wrangler pages secret` et redéployez

### Problème 3: Erreur CORS

**Symptômes:**
- Erreur CORS dans la console
- Requêtes bloquées

**Solution:**
1. Vérifiez `ADMIN_CORS` dans le backend Render
2. Doit contenir `*` ou l'URL Cloudflare Pages
3. Redéployez le backend après modification

---

## ✅ CHECKLIST FINALE

- [ ] Wrangler CLI installé (`wrangler --version`)
- [ ] Connecté à Cloudflare (`wrangler login`)
- [ ] URL du backend copiée depuis Render
- [ ] Variables d'environnement configurées
- [ ] Build réussi (`dist/` créé)
- [ ] Déployé avec Wrangler (`wrangler pages deploy`)
- [ ] URL Cloudflare Pages obtenue
- [ ] Site accessible
- [ ] Console montre la bonne URL backend
- [ ] Test `/health` réussit
- [ ] Pas d'erreurs CORS

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

```bash
# 1. Installer Wrangler
npm install -g wrangler

# 2. Se connecter
wrangler login

# 3. Aller dans le répertoire
cd packages/admin/dashboard

# 4. Builder (depuis la racine d'abord)
cd ../../..
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

# 5. Déployer
cd packages/admin/dashboard
wrangler pages deploy dist --project-name=medusa-admin

# 6. Configurer variables (si besoin)
wrangler pages secret put VITE_MEDUSA_ADMIN_BACKEND_URL --project-name=medusa-admin
# Entrez: https://medusa-backend-XXX.onrender.com

# 7. Redéployer (si variables modifiées)
yarn build:preview
wrangler pages deploy dist --project-name=medusa-admin
```

**C'est tout!**

