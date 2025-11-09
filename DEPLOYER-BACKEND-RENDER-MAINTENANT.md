# 🚀 DÉPLOYER LE BACKEND SUR RENDER - MAINTENANT

## 🎯 OBJECTIF
Déployer uniquement le backend Medusa sur Render.

---

## 📋 ÉTAPE 1: OUVRIR RENDER DASHBOARD (1 min)

1. **Allez sur:** https://dashboard.render.com
2. **Connectez-vous** avec votre compte

---

## 📋 ÉTAPE 2: CRÉER LE BLUEPRINT (2 min)

### 2.1 Créer un Nouveau Blueprint
1. Cliquez sur le bouton **New** (en haut à droite, bouton bleu)
2. Dans le menu déroulant, cliquez sur **Blueprint**

### 2.2 Connecter le Repository GitHub
1. Si pas encore connecté à GitHub:
   - Cliquez sur **Connect GitHub account**
   - Autorisez Render à accéder à vos repositories
   - Sélectionnez le repository: **`ILYESS24/medusa2`**
2. Si déjà connecté:
   - Sélectionnez le repository: **`ILYESS24/medusa2`**
   - Sélectionnez la branch: **`develop`**
3. Cliquez sur **Connect** ou **Continue**

---

## 📋 ÉTAPE 3: APPLIQUER LE BLUEPRINT (1 min)

### 3.1 Vérifier l'Aperçu
Render va détecter automatiquement le fichier `render.yaml` et vous montrer un aperçu des services à créer:

**Services qui seront créés:**
- ✅ `medusa-backend` (Web Service)
- ✅ `medusa-db` (PostgreSQL Database)

**⚠️ NOTE:** Le service `medusa-admin` sera aussi créé (frontend), mais vous pouvez l'ignorer ou le supprimer plus tard si vous voulez utiliser Cloudflare Pages.

### 3.2 Appliquer
1. Vérifiez que tout est correct
2. Cliquez sur **Apply** (bouton en bas)

---

## 📋 ÉTAPE 4: ATTENDRE LE DÉPLOIEMENT (15-20 min)

### 4.1 Surveiller la Progression
1. Render va commencer à créer les services
2. Cliquez sur le service `medusa-backend` pour voir les logs
3. Le build va:
   - Installer les dépendances (`yarn install`)
   - Builder le CLI (`yarn workspace @medusajs/cli build`)
   - Builder Medusa (`yarn workspace @medusajs/medusa build`)
   - Builder tous les packages (`yarn build`)
   - Exécuter les migrations (`db:migrate`)

### 4.2 Temps d'Attente
- ⏱️ **Temps estimé:** 15-20 minutes
- Le build du monorepo prend du temps
- Ne fermez pas la page, surveillez les logs

### 4.3 Erreurs Possibles
Si vous voyez des erreurs dans les logs:
- **"Failed to resolve"** → Normal, certaines dépendances peuvent être ignorées
- **"Migration already exists"** → Normal, c'est géré par `|| true`
- **Timeout** → Le build prend du temps, attendez

---

## 📋 ÉTAPE 5: VÉRIFIER QUE LE BACKEND EST LIVE (2 min)

### 5.1 Vérifier le Statut
1. Dans Render Dashboard, cherchez le service **`medusa-backend`**
2. Le statut doit être **Live** (vert) ✅
3. Si c'est **Build failed** ou **Deploy failed**:
   - Cliquez sur le service
   - Allez dans l'onglet **Logs**
   - **COPIEZ LES ERREURS** et partagez-les pour diagnostic

### 5.2 Copier l'URL
1. Cliquez sur le service `medusa-backend`
2. En haut de la page, vous verrez l'URL (ex: `https://medusa-backend-abc123.onrender.com`)
3. **COPIEZ CETTE URL** - vous en aurez besoin!

### 5.3 Tester le Backend
1. Ouvrez l'URL dans votre navigateur
2. Ajoutez `/health` à la fin: `https://medusa-backend-abc123.onrender.com/health`
3. Vous devriez voir: `{"status": "ok"}` ✅

---

## 📋 ÉTAPE 6: VÉRIFIER LES LOGS (Optionnel)

### 6.1 Vérifier que le Serveur Démarre
1. Service `medusa-backend` > **Logs**
2. Cherchez dans les logs:
   - `"Server is ready on port: 9000"` ✅
   - `"Medusa is ready"` ✅
   - Pas d'erreurs de connexion à la base de données ✅

### 6.2 Vérifier la Base de Données
1. Service `medusa-db` > **Info**
2. Vérifiez que la base de données est **Active**

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Service `medusa-backend` créé sur Render
- [ ] Statut = **Live** (vert)
- [ ] URL du backend copiée (ex: `https://medusa-backend-xxx.onrender.com`)
- [ ] `/health` répond avec `{"status": "ok"}`
- [ ] Logs montrent "Server is ready"
- [ ] Base de données `medusa-db` créée et active

---

## 🚨 SI LE BACKEND NE DÉMARRE PAS

### Problème 1: Build Failed

**Symptômes:**
- Statut "Build failed"
- Erreurs dans les logs

**Solutions:**
1. Vérifiez les logs complets
2. Erreurs courantes:
   - **Mémoire insuffisante:** Normal pour monorepo, attendez
   - **Timeout:** Le build prend du temps, relancez
   - **Dépendances manquantes:** Vérifiez `package.json`

### Problème 2: Deploy Failed

**Symptômes:**
- Statut "Deploy failed"
- Le build réussit mais le start échoue

**Solutions:**
1. Vérifiez les logs de start
2. Erreurs courantes:
   - **Base de données non accessible:** Vérifiez `DATABASE_URL`
   - **Port incorrect:** Vérifiez que `PORT` est configuré
   - **Module manquant:** Vérifiez `medusa-config.js`

### Problème 3: Backend Démarre mais `/health` ne Répond Pas

**Symptômes:**
- Statut "Live" mais `/health` retourne 404

**Solutions:**
1. Vérifiez que `healthCheckPath: /health` est dans `render.yaml`
2. Attendez 2-3 minutes après le démarrage
3. Vérifiez les logs pour voir si le serveur écoute sur le bon port

---

## 📝 NOTES IMPORTANTES

1. **Premier déploiement:** Peut prendre 20-30 minutes (build du monorepo)
2. **Migrations:** S'exécutent automatiquement au build
3. **Secrets:** `JWT_SECRET` et `COOKIE_SECRET` sont générés automatiquement
4. **CORS:** Configuré pour accepter toutes les origines (`*`) par défaut
5. **Base de données:** Créée automatiquement avec le Blueprint

---

## 🎯 PROCHAINES ÉTAPES (Après Backend Live)

Une fois le backend déployé et Live:

1. **Notez l'URL du backend** (ex: `https://medusa-backend-abc123.onrender.com`)
2. **Déployez le frontend** sur Cloudflare Pages (voir `DEPLOIEMENT-ETAPE-PAR-ETAPE.md`)
3. **Configurez `VITE_MEDUSA_ADMIN_BACKEND_URL`** dans Cloudflare Pages avec l'URL du backend
4. **Configurez CORS** dans le backend Render pour autoriser Cloudflare Pages

---

## 🚀 RÉSUMÉ ULTRA-RAPIDE

1. **Render Dashboard** > New > Blueprint
2. **Connect repo:** `ILYESS24/medusa2` > `develop`
3. **Apply**
4. **Attendre 15-20 minutes**
5. **Vérifier statut = Live**
6. **Copier URL backend**
7. **Tester `/health`**

**C'est tout pour le backend!**

