# 🔗 Connexion du Frontend au Backend sur Render

## 📋 Problème Actuel

L'interface d'administration affiche le message "Configuration requise" car elle ne peut pas se connecter au backend Medusa.

## ✅ Solution

### 1. Vérifier que le Backend est Déployé

1. Allez sur https://dashboard.render.com
2. Vérifiez que le service `medusa-backend` est **Live** (vert)
3. Vérifiez les logs du backend pour confirmer qu'il démarre correctement

### 2. Vérifier l'URL du Backend

1. Dans Render Dashboard, sélectionnez le service `medusa-backend`
2. Copiez l'URL complète (ex: `https://medusa-backend-xxxx.onrender.com`)
3. Testez cette URL dans votre navigateur : `https://medusa-backend-xxxx.onrender.com/health`
   - Vous devriez voir une réponse JSON avec `{"status": "ok"}`

### 3. Configurer l'URL dans le Frontend

**Option A: Via Render Dashboard (Recommandé)**

1. Allez sur le service `medusa-admin` dans Render Dashboard
2. Cliquez sur **Environment**
3. Vérifiez que `VITE_MEDUSA_ADMIN_BACKEND_URL` existe
4. Si elle existe, modifiez-la pour utiliser l'URL complète du backend :
   ```
   https://medusa-backend-xxxx.onrender.com
   ```
   (Remplacez `xxxx` par votre identifiant réel)
5. Si elle n'existe pas, ajoutez-la :
   - **Key**: `VITE_MEDUSA_ADMIN_BACKEND_URL`
   - **Value**: `https://medusa-backend-xxxx.onrender.com`
6. Cliquez sur **Save Changes**
7. Allez dans **Manual Deploy** > **Deploy latest commit**

**Option B: Via render.yaml (Automatique)**

Le fichier `render.yaml` utilise `fromService` qui devrait automatiquement configurer l'URL. Si cela ne fonctionne pas :

1. Modifiez `render.yaml` pour utiliser l'URL complète :
   ```yaml
   - key: VITE_MEDUSA_ADMIN_BACKEND_URL
     value: https://medusa-backend-xxxx.onrender.com
   ```
2. Poussez les changements sur GitHub
3. Render redéploiera automatiquement

### 4. Vérifier la Connexion

Après le redéploiement :

1. Ouvrez l'interface admin : `https://medusa-admin-xxxx.onrender.com`
2. Connectez-vous avec votre compte
3. Allez sur la page **Orders** ou **Products**
4. Si vous voyez toujours "Backend Medusa non disponible", vérifiez :
   - Les logs du frontend dans Render
   - La console du navigateur (F12) pour les erreurs CORS ou de connexion

### 5. Vérifier CORS

Si vous voyez des erreurs CORS dans la console :

1. Vérifiez que `ADMIN_CORS` dans le backend pointe vers l'URL du frontend
2. Dans `render.yaml`, `ADMIN_CORS` devrait être configuré avec `fromService` pointant vers `medusa-admin`

## 🔍 Diagnostic

### Tester la Connexion Backend

Dans la console du navigateur (F12), tapez :
```javascript
fetch('https://medusa-backend-xxxx.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

Si cela fonctionne, le backend est accessible.

### Vérifier l'URL Configurée

Dans la console du navigateur, tapez :
```javascript
console.log(window.__BACKEND_URL__ || 'Non défini')
```

Cela devrait afficher l'URL du backend configurée.

## ⚠️ Problèmes Courants

1. **Backend non démarré** : Vérifiez les logs du backend dans Render
2. **URL incorrecte** : Vérifiez que `VITE_MEDUSA_ADMIN_BACKEND_URL` contient l'URL complète avec `https://`
3. **CORS** : Vérifiez que `ADMIN_CORS` dans le backend inclut l'URL du frontend
4. **Variables d'environnement non rechargées** : Redéployez le frontend après avoir modifié les variables d'environnement

## 📝 Notes

- Les variables d'environnement `VITE_*` sont injectées au moment du build
- Si vous modifiez `VITE_MEDUSA_ADMIN_BACKEND_URL`, vous devez **redéployer** le frontend
- Le backend doit être **Live** avant que le frontend puisse s'y connecter

