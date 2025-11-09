# 🔍 VÉRIFIER LE BACKEND DANS RENDER - GUIDE RAPIDE

## ⚠️ PROBLÈME IDENTIFIÉ

L'URL `https://medusa2-4zm0.onrender.com` retourne du **HTML (frontend)**, pas le backend Medusa.

**Cela signifie que:**
- Soit le backend n'est pas encore déployé
- Soit le backend est déployé sur une **URL différente**

---

## ✅ SOLUTION: Vérifier dans Render Dashboard

### Étape 1: Ouvrir Render Dashboard

1. Allez sur: https://dashboard.render.com
2. Connectez-vous

### Étape 2: Chercher le Service Backend

Dans la liste des services, cherchez:
- **`medusa-backend`** ← C'est le backend Medusa
- **`medusa2-4zm0`** ou similaire ← C'est probablement le frontend

### Étape 3: Vérifier l'URL du Backend

**Si vous voyez `medusa-backend`:**
1. Cliquez sur le service `medusa-backend`
2. En haut de la page, vous verrez l'URL (ex: `https://medusa-backend-abc123.onrender.com`)
3. **Copiez cette URL** ← C'est la vraie URL du backend!

**Si vous NE voyez PAS `medusa-backend`:**
- Le backend n'est pas encore déployé
- Il faut le déployer (voir ci-dessous)

---

## 🚀 DÉPLOYER LE BACKEND (Si pas encore fait)

### Option A: Blueprint Automatique (Recommandé)

1. Render Dashboard > **New** > **Blueprint**
2. Connectez votre repo GitHub: `ILYESS24/medusa2`
3. Branche: `develop`
4. Render détectera automatiquement `render.yaml`
5. Render créera:
   - ✅ Service `medusa-backend`
   - ✅ Base de données `medusa-db`
6. Attendez 15-20 minutes
7. Copiez l'URL du service `medusa-backend`

### Option B: Service Manuel

1. Render Dashboard > **New** > **Web Service**
2. Connectez votre repo: `ILYESS24/medusa2`
3. Configurez:
   - **Name:** `medusa-backend`
   - **Root Directory:** (vide)
   - **Environment:** `Node`
   - **Build Command:**
     ```
     yarn install && yarn workspace @medusajs/cli build && yarn workspace @medusajs/medusa build && yarn build && node packages/cli/medusa-cli/cli.js db:migrate || true
     ```
   - **Start Command:**
     ```
     node packages/cli/medusa-cli/cli.js start --port $PORT
     ```
4. Ajoutez les variables d'environnement (voir `render.yaml`)
5. Créez une base de données PostgreSQL
6. Déployez

---

## 📋 APRÈS AVOIR TROUVÉ L'URL DU BACKEND

### 1. Tester le Backend

Ouvrez dans votre navigateur:
```
https://medusa-backend-ABC123.onrender.com/health
```

**Résultat attendu:**
```json
{"status": "ok"}
```

**Si vous voyez du HTML:**
- ❌ Ce n'est pas le bon service
- Cherchez un autre service

### 2. Rebuild le Frontend avec la Bonne URL

Une fois que vous avez la vraie URL du backend:

```powershell
cd packages/admin/dashboard
$env:VITE_MEDUSA_ADMIN_BACKEND_URL = "https://medusa-backend-ABC123.onrender.com"
$env:VITE_AUTH_API_URL = "https://medusa-auth.gfiyfougiug.workers.dev"
$env:NODE_ENV = "production"
yarn build:preview
wrangler pages deploy dist --project-name=medusa-admin
```

### 3. Vérifier CORS

Dans Render Dashboard > Service `medusa-backend` > **Environment**:
- Vérifiez que `ADMIN_CORS` = `*`
- Si nécessaire, modifiez et redéployez

---

## 🎯 RÉSUMÉ

1. **Render Dashboard** → Cherchez `medusa-backend`
2. **Si existe:** Copiez l'URL du backend
3. **Si n'existe pas:** Déployez avec Blueprint
4. **Testez:** `https://medusa-backend-XXX.onrender.com/health`
5. **Rebuild frontend** avec la bonne URL
6. **Redéployez** sur Cloudflare Pages

**C'est tout!**

