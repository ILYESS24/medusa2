# 🔍 POURQUOI LE BACKEND N'EST PAS CONNECTÉ AU FRONTEND

## 🎯 LE PROBLÈME

Le backend est **configuré** mais **pas encore déployé** ou **pas connecté** au frontend.

## 📋 CHECKLIST DE CONNEXION

### ❌ Étape 1: Le Backend est-il Déployé?

**Vérifiez dans Render Dashboard:**
1. Allez sur https://dashboard.render.com
2. Cherchez le service **`medusa-backend`**
3. **Statut:**
   - ✅ **Live** (vert) = Backend déployé et démarré
   - ❌ **Build failed** = Erreur de build
   - ❌ **Deploy failed** = Erreur de déploiement
   - ❌ **N'existe pas** = Pas encore créé

**Si le backend n'existe pas ou n'est pas Live:**
- Le backend n'a pas encore été déployé
- Il faut le déployer d'abord

### ❌ Étape 2: L'URL du Backend est-elle Configurée?

**Dans Render Dashboard, service `medusa-admin`:**

1. Allez dans **Environment**
2. Cherchez `VITE_MEDUSA_ADMIN_BACKEND_URL`
3. **Vérifiez:**
   - ✅ Existe et contient l'URL complète: `https://medusa-backend-xxxx.onrender.com`
   - ❌ N'existe pas = Pas configurée
   - ❌ Contient `http://localhost:9000` = Mauvaise valeur
   - ❌ Contient seulement le hostname sans `https://` = Incomplet

**Problème courant:**
- `render.yaml` utilise `value: https://medusa-backend.onrender.com`
- Mais Render génère une URL unique: `https://medusa-backend-abc123.onrender.com`
- Il faut mettre l'URL **réelle** du backend

### ❌ Étape 3: Le Frontend a-t-il été Redéployé?

**IMPORTANT:** Les variables `VITE_*` sont injectées **au BUILD**.

**Si vous modifiez `VITE_MEDUSA_ADMIN_BACKEND_URL`:**
- ❌ Le frontend utilise toujours l'ancienne valeur (compilée dans le bundle)
- ✅ Il faut **REDÉPLOYER** le frontend pour que la nouvelle valeur soit utilisée

**Comment redéployer:**
1. Render Dashboard > Service `medusa-admin`
2. **Manual Deploy** > **Deploy latest commit**
3. Attendre 5-10 minutes

## 🔧 SOLUTIONS PAR PROBLÈME

### Problème 1: Backend Non Déployé

**Solution:**
1. Render Dashboard > **New** > **Blueprint**
2. Connectez votre repo GitHub
3. Render détectera `render.yaml`
4. Créera automatiquement:
   - Service `medusa-backend`
   - Service `medusa-admin`
   - Base de données `medusa-db`
5. Attendez le déploiement (15-20 minutes)

### Problème 2: URL Incorrecte

**Solution A: Configuration Manuelle (Recommandé)**

1. **Déployez d'abord le backend**
2. **Copiez l'URL réelle** du backend (ex: `https://medusa-backend-abc123.onrender.com`)
3. **Dans Render Dashboard:**
   - Service `medusa-admin` > **Environment**
   - Ajoutez/modifiez `VITE_MEDUSA_ADMIN_BACKEND_URL`
   - Valeur: `https://medusa-backend-abc123.onrender.com` (votre URL réelle)
4. **Redéployez le frontend** (obligatoire!)

**Solution B: Modifier render.yaml**

1. Déployez le backend
2. Copiez l'URL réelle
3. Modifiez `render.yaml`:
   ```yaml
   - key: VITE_MEDUSA_ADMIN_BACKEND_URL
     value: https://medusa-backend-abc123.onrender.com  # Votre URL réelle
   ```
4. Poussez sur GitHub
5. Render redéploiera automatiquement

### Problème 3: Frontend Non Redéployé

**Solution:**
1. Après avoir modifié `VITE_MEDUSA_ADMIN_BACKEND_URL`
2. **Obligatoire:** Redéployer le frontend
3. Render Dashboard > Service `medusa-admin` > **Manual Deploy**

## 🔍 DIAGNOSTIC RAPIDE

### Dans le Navigateur (F12 > Console):

```javascript
// 1. Vérifier l'URL configurée
console.log('Backend URL:', window.__BACKEND_URL__)

// Si affiche "http://localhost:9000" → URL non configurée
// Si affiche "https://medusa-backend-xxxx.onrender.com" → URL configurée
```

```javascript
// 2. Tester la connexion
fetch(window.__BACKEND_URL__ + '/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Erreur:', err))

// Si erreur → Backend non accessible ou URL incorrecte
```

### Dans Render Dashboard:

1. **Service `medusa-backend`:**
   - Statut = Live?
   - Logs montrent "Server is ready"?
   - `/health` répond?

2. **Service `medusa-admin`:**
   - Variable `VITE_MEDUSA_ADMIN_BACKEND_URL` existe?
   - Contient l'URL complète avec `https://`?
   - Dernier déploiement après modification de la variable?

## ✅ CHECKLIST COMPLÈTE

- [ ] Backend `medusa-backend` est **Live** sur Render
- [ ] Backend répond à `/health` (tester dans le navigateur)
- [ ] Variable `VITE_MEDUSA_ADMIN_BACKEND_URL` existe dans `medusa-admin`
- [ ] Variable contient l'URL **complète** avec `https://`
- [ ] Frontend **redéployé** après modification de la variable
- [ ] Console navigateur montre la bonne URL
- [ ] Requêtes réseau pointent vers le bon backend
- [ ] Pas d'erreurs CORS dans la console

## 🚨 PROBLÈME LE PLUS PROBABLE

**Le backend n'a pas encore été déployé sur Render, OU l'URL n'est pas correctement configurée dans le frontend.**

**Action immédiate:**
1. Vérifiez si `medusa-backend` existe sur Render
2. Si oui, copiez son URL
3. Configurez `VITE_MEDUSA_ADMIN_BACKEND_URL` dans `medusa-admin`
4. **Redéployez** le frontend

