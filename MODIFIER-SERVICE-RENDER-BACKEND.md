# 🔧 MODIFIER LE SERVICE RENDER POUR SERVIR LE BACKEND

## 🎯 OBJECTIF

Transformer le service `medusa2-4zm0` (qui sert actuellement le frontend) pour qu'il serve le **backend Medusa**.

---

## 📋 ÉTAPE 1: MODIFIER LE SERVICE DANS RENDER DASHBOARD

### 1. Ouvrir Render Dashboard

1. Allez sur: https://dashboard.render.com
2. Connectez-vous
3. Trouvez le service **`medusa2-4zm0`** (ou le service qui correspond à cette URL)

### 2. Modifier les Commandes de Build et Start

1. Cliquez sur le service
2. Allez dans **Settings**
3. Modifiez les commandes suivantes:

**Build Command:**
```bash
yarn install && yarn workspace @medusajs/cli build && yarn workspace @medusajs/medusa build && yarn build && node packages/cli/medusa-cli/cli.js db:migrate || true
```

**Start Command:**
```bash
node packages/cli/medusa-cli/cli.js start --port $PORT
```

**Root Directory:** (laissez vide ou mettez `/`)

### 3. Modifier les Variables d'Environnement

Allez dans **Environment** et ajoutez/modifiez:

**Variables REQUISES:**
- `NODE_ENV` = `production`
- `DATABASE_URL` = (URL de votre base de données PostgreSQL - voir ci-dessous)
- `JWT_SECRET` = (généré automatiquement ou créez-en un avec `openssl rand -base64 32`)
- `COOKIE_SECRET` = (généré automatiquement ou créez-en un avec `openssl rand -base64 32`)
- `MEDUSA_ADMIN_ONBOARDING_TYPE` = `default`
- `PORT` = `9000`

**Variables CORS:**
- `ADMIN_CORS` = `*`
- `STORE_CORS` = `*`
- `AUTH_CORS` = `*`

### 4. Créer la Base de Données (Si pas encore fait)

1. Render Dashboard > **New** > **PostgreSQL**
2. **Name:** `medusa-db`
3. **Database:** `medusa_db`
4. **User:** `medusa_user`
5. Créez la base de données
6. **Copiez l'Internal Database URL** (ou l'URL complète)
7. Collez-la dans `DATABASE_URL` du service

### 5. Modifier le Health Check Path

Dans **Settings** > **Health Check Path:**
- Changez pour: `/health`

### 6. Redéployer

1. Allez dans **Manual Deploy** > **Deploy latest commit**
2. OU poussez un commit sur GitHub pour déclencher le déploiement automatique
3. **Attendez 15-20 minutes** pour le build et le déploiement

---

## ✅ ÉTAPE 2: VÉRIFIER QUE LE BACKEND FONCTIONNE

### Test 1: Health Check

Ouvrez dans votre navigateur:
```
https://medusa2-4zm0.onrender.com/health
```

**Résultat attendu:**
```json
{"status": "ok"}
```

**Si vous voyez du HTML:**
- ❌ Le service sert encore le frontend
- Vérifiez que les commandes Build/Start sont correctes
- Redéployez

### Test 2: Endpoint Admin

Ouvrez dans votre navigateur:
```
https://medusa2-4zm0.onrender.com/admin/store
```

**Résultat attendu:**
- `401 Unauthorized` (normal, pas authentifié)
- OU du JSON avec les données du store

**Si vous voyez du HTML:**
- ❌ Le service sert encore le frontend
- Redéployez

---

## 🔧 ÉTAPE 3: REBUILD LE FRONTEND AVEC LA BONNE URL

Une fois que le backend fonctionne sur `https://medusa2-4zm0.onrender.com`:

```powershell
cd packages/admin/dashboard
$env:VITE_MEDUSA_ADMIN_BACKEND_URL = "https://medusa2-4zm0.onrender.com"
$env:VITE_AUTH_API_URL = "https://medusa-auth.gfiyfougiug.workers.dev"
$env:NODE_ENV = "production"
yarn build:preview
wrangler pages deploy dist --project-name=medusa-admin
```

---

## 🚨 SI LE SERVICE NE PEUT PAS ÊTRE MODIFIÉ

Si Render ne permet pas de modifier le service existant:

### Option A: Créer un Nouveau Service Backend

1. Render Dashboard > **New** > **Web Service**
2. Configurez comme indiqué dans `render.yaml`
3. Le nouveau service aura une nouvelle URL (ex: `medusa-backend-abc123.onrender.com`)
4. Utilisez cette nouvelle URL pour le frontend

### Option B: Supprimer et Recréer

1. **Supprimez** le service `medusa2-4zm0`
2. **Créez un nouveau service** avec Blueprint
3. Render créera le backend avec `render.yaml`
4. Utilisez la nouvelle URL

---

## 📋 CHECKLIST FINALE

- [ ] Service modifié dans Render Dashboard
- [ ] Build Command = commande backend Medusa
- [ ] Start Command = `node packages/cli/medusa-cli/cli.js start --port $PORT`
- [ ] Variables d'environnement configurées (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Base de données PostgreSQL créée
- [ ] Health Check Path = `/health`
- [ ] Service redéployé
- [ ] Test `/health` retourne `{"status": "ok"}`
- [ ] Frontend rebuild avec la bonne URL
- [ ] Frontend redéployé sur Cloudflare Pages

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

1. **Render Dashboard** > Service `medusa2-4zm0` > **Settings**
2. **Build Command:** `yarn install && yarn workspace @medusajs/cli build && yarn workspace @medusajs/medusa build && yarn build && node packages/cli/medusa-cli/cli.js db:migrate || true`
3. **Start Command:** `node packages/cli/medusa-cli/cli.js start --port $PORT`
4. **Environment:** Ajoutez toutes les variables (voir ci-dessus)
5. **Health Check:** `/health`
6. **Redéployez**
7. **Testez:** `https://medusa2-4zm0.onrender.com/health`
8. **Rebuild frontend** avec cette URL

**C'EST TOUT!**

