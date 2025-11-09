# 🔗 CONNECTER LE BACKEND MAINTENANT - Guide Immédiat

## 🎯 VOTRE SITUATION ACTUELLE

✅ Frontend déployé et fonctionnel  
✅ Authentification personnalisée fonctionne  
❌ Backend Medusa non connecté (message "Configuration requise")

## ⚡ ACTION IMMÉDIATE - 5 MINUTES

### Étape 1: Vérifier si le Backend Existe (1 minute)

1. **Ouvrez Render Dashboard:**
   - https://dashboard.render.com
   - Connectez-vous

2. **Cherchez le service `medusa-backend`:**
   - Dans la liste des services
   - Vérifiez le statut

**Si le service existe:**
- ✅ **Live** (vert) → Passez à l'Étape 2
- ❌ **Build failed** ou **Deploy failed** → Voir "Problème: Backend ne démarre pas"
- ❌ **N'existe pas** → Passez à "Déployer le Backend"

**Si le service n'existe pas:**
- Passez directement à "Déployer le Backend" ci-dessous

### Étape 2: Copier l'URL du Backend (30 secondes)

1. **Dans Render Dashboard:**
   - Service `medusa-backend`
   - **Copiez l'URL complète** (ex: `https://medusa-backend-abc123.onrender.com`)

2. **Testez l'URL:**
   - Ouvrez dans le navigateur: `https://medusa-backend-abc123.onrender.com/health`
   - Vous devriez voir: `{"status": "ok"}`

### Étape 3: Configurer l'URL dans le Frontend (2 minutes)

1. **Dans Render Dashboard:**
   - Service `medusa-admin` > **Environment**

2. **Cherchez `VITE_MEDUSA_ADMIN_BACKEND_URL`:**
   - Si elle existe → Cliquez sur **Edit**
   - Si elle n'existe pas → Cliquez sur **Add Environment Variable**

3. **Configurez la variable:**
   - **Key:** `VITE_MEDUSA_ADMIN_BACKEND_URL`
   - **Value:** `https://medusa-backend-abc123.onrender.com` (votre URL réelle)
   - ⚠️ **IMPORTANT:** L'URL doit commencer par `https://`

4. **Sauvegardez:**
   - Cliquez sur **Save Changes**

### Étape 4: Redéployer le Frontend (2 minutes)

**⚠️ OBLIGATOIRE:** Les variables `VITE_*` sont injectées au BUILD. Il faut redéployer!

1. **Dans Render Dashboard:**
   - Service `medusa-admin` > **Manual Deploy** > **Deploy latest commit**

2. **Attendez le redéploiement:**
   - ~5-10 minutes
   - Vérifiez les logs pour voir la progression

3. **Testez:**
   - Ouvrez l'interface admin
   - Rafraîchissez la page
   - Le message "Configuration requise" devrait disparaître

## 🚀 DÉPLOYER LE BACKEND (Si pas encore fait)

### Option A: Via Blueprint (Recommandé - Automatique)

1. **Render Dashboard:**
   - **New** > **Blueprint**

2. **Connectez votre repo:**
   - Repository: `ILYESS24/medusa2`
   - Branch: `develop`
   - Render détectera `render.yaml` automatiquement

3. **Appliquer le Blueprint:**
   - Render créera automatiquement:
     - ✅ Service `medusa-backend`
     - ✅ Service `medusa-admin`
     - ✅ Base de données `medusa-db`

4. **Attendez le déploiement:**
   - Backend: 15-20 minutes
   - Frontend: 10-15 minutes

### Option B: Créer Manuellement

1. **Créer la base de données:**
   - **New** > **PostgreSQL**
   - Nom: `medusa-db`
   - Plan: Starter

2. **Créer le service backend:**
   - **New** > **Web Service**
   - Connectez votre repo GitHub
   - Configuration:
     - **Name:** `medusa-backend`
     - **Build Command:** `yarn install && yarn workspace @medusajs/cli build && yarn workspace @medusajs/medusa build && yarn build && node packages/cli/medusa-cli/cli.js db:migrate || true`
     - **Start Command:** `node packages/cli/medusa-cli/cli.js start --port $PORT`
     - **Environment Variables:**
       - `DATABASE_URL` → Depuis `medusa-db`
       - `JWT_SECRET` → Generate
       - `COOKIE_SECRET` → Generate
       - `ADMIN_CORS` → URL du frontend
       - `AUTH_CORS` → URL du frontend

## 🔍 VÉRIFICATION RAPIDE

### Dans la Console du Navigateur (F12):

```javascript
// 1. Vérifier l'URL configurée
console.log('Backend URL:', window.__BACKEND_URL__)

// Si affiche "http://localhost:9000" → URL non configurée
// Si affiche l'URL Render → URL configurée ✅
```

```javascript
// 2. Tester la connexion
fetch(window.__BACKEND_URL__ + '/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend accessible:', data)
    // Devrait afficher: {status: "ok"}
  })
  .catch(err => {
    console.error('❌ Erreur:', err)
    // Backend non accessible ou URL incorrecte
  })
```

## 🚨 PROBLÈMES COURANTS

### Problème 1: Backend ne démarre pas

**Symptômes:**
- Statut "Build failed" ou "Deploy failed"
- Logs montrent des erreurs

**Solutions:**
1. Vérifiez les logs dans Render Dashboard
2. Erreurs courantes:
   - Base de données non accessible → Vérifiez `DATABASE_URL`
   - Migrations échouées → Normal si déjà faites (commande avec `|| true`)
   - Build timeout → Normal pour monorepo (peut prendre 20+ minutes)

### Problème 2: URL Incorrecte

**Symptômes:**
- Console montre `http://localhost:9000`
- Erreur "Failed to fetch"

**Solutions:**
1. Vérifiez `VITE_MEDUSA_ADMIN_BACKEND_URL` dans Render
2. Assurez-vous qu'elle commence par `https://`
3. **Redéployez** le frontend après modification

### Problème 3: Frontend Non Redéployé

**Symptômes:**
- Variable modifiée mais ancienne valeur toujours utilisée
- Console montre toujours `localhost:9000`

**Solutions:**
1. **Redéployez** le frontend (obligatoire!)
2. Render Dashboard > Service `medusa-admin` > **Manual Deploy**

## ✅ CHECKLIST FINALE

- [ ] Backend `medusa-backend` existe sur Render
- [ ] Backend est **Live** (statut vert)
- [ ] Backend répond à `/health` (testé dans navigateur)
- [ ] Variable `VITE_MEDUSA_ADMIN_BACKEND_URL` existe dans `medusa-admin`
- [ ] Variable contient l'URL **complète** avec `https://`
- [ ] Frontend **redéployé** après modification de la variable
- [ ] Console navigateur montre la bonne URL
- [ ] Test `/health` réussit dans la console
- [ ] Message "Configuration requise" a disparu

## 📞 BESOIN D'AIDE?

Si après ces étapes le problème persiste:

1. **Partagez:**
   - L'URL du backend (ex: `https://medusa-backend-xxxx.onrender.com`)
   - Le résultat de `console.log(window.__BACKEND_URL__)` dans la console
   - Les erreurs dans la console du navigateur (F12)

2. **Vérifiez:**
   - Les logs du backend dans Render
   - Les logs du frontend dans Render
   - Les erreurs réseau dans l'onglet Network (F12)

## 🎯 RÉSUMÉ ULTRA-RAPIDE

1. ✅ Backend Live? → Copier URL
2. ✅ Configurer `VITE_MEDUSA_ADMIN_BACKEND_URL` dans Render
3. ✅ **Redéployer** le frontend
4. ✅ Tester dans la console

**C'est tout!** 🚀

