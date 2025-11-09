# 🚀 ACTION IMMÉDIATE - Connecter le Backend

## 📍 Situation Actuelle

✅ **Frontend déployé et fonctionnel** (authentification OK)  
❌ **Backend non connecté** (message "Configuration requise")

## ⚡ Actions à Faire MAINTENANT

### 1. Vérifier le Backend sur Render (2 minutes)

1. Allez sur https://dashboard.render.com
2. Cherchez le service **`medusa-backend`**
3. Vérifiez le statut :
   - ✅ **Live** (vert) = Backend démarré
   - ❌ **Build failed** = Problème de build
   - ❌ **Deploy failed** = Problème de déploiement

### 2. Si le Backend n'est PAS Live

**Option A: Le backend n'existe pas encore**
- Créez un nouveau service web depuis `render.yaml`
- Render devrait détecter automatiquement le fichier `render.yaml`
- Cliquez sur "New" > "Blueprint" et connectez votre repo GitHub

**Option B: Le backend existe mais ne démarre pas**
- Regardez les **logs** du service `medusa-backend`
- Cherchez les erreurs (rouge)
- Problèmes courants :
  - Base de données non accessible
  - Migrations échouées
  - Port incorrect

### 3. Si le Backend EST Live

**Tester l'URL du backend :**

1. Dans Render, service `medusa-backend`, copiez l'URL (ex: `https://medusa-backend-xxxx.onrender.com`)
2. Ouvrez cette URL dans votre navigateur : `https://medusa-backend-xxxx.onrender.com/health`
3. Vous devriez voir : `{"status": "ok"}`

### 4. Configurer l'URL dans le Frontend

1. Allez sur le service **`medusa-admin`** dans Render
2. Cliquez sur **Environment**
3. Cherchez `VITE_MEDUSA_ADMIN_BACKEND_URL`
4. **Si elle existe** : Modifiez-la pour mettre l'URL complète du backend :
   ```
   https://medusa-backend-xxxx.onrender.com
   ```
5. **Si elle n'existe pas** : Ajoutez-la :
   - **Key**: `VITE_MEDUSA_ADMIN_BACKEND_URL`
   - **Value**: `https://medusa-backend-xxxx.onrender.com` (votre URL réelle)
6. Cliquez sur **Save Changes**
7. **IMPORTANT** : Allez dans **Manual Deploy** > **Deploy latest commit**

### 5. Attendre le Redéploiement

- Le frontend va se redéployer avec la nouvelle URL
- Attendez 2-3 minutes
- Rafraîchissez l'interface admin

### 6. Vérifier la Connexion

1. Ouvrez l'interface admin
2. Connectez-vous
3. Allez sur **Orders** ou **Products**
4. Si vous voyez encore "Backend non disponible" :
   - Ouvrez la console du navigateur (F12)
   - Regardez les erreurs dans l'onglet **Console** ou **Network**
   - Partagez les erreurs pour diagnostic

## 🔍 Diagnostic Rapide

Dans la console du navigateur (F12), tapez :
```javascript
// Vérifier l'URL configurée
console.log('Backend URL:', window.__BACKEND_URL__ || 'Non défini')

// Tester la connexion
fetch(window.__BACKEND_URL__ + '/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Erreur:', err))
```

## ⚠️ Problèmes Fréquents

| Problème | Solution |
|----------|----------|
| Backend non démarré | Vérifiez les logs, corrigez les erreurs |
| URL incorrecte | Vérifiez `VITE_MEDUSA_ADMIN_BACKEND_URL` |
| CORS errors | Vérifiez `ADMIN_CORS` dans le backend |
| Variables non rechargées | Redéployez après modification |

## 📞 Besoin d'Aide?

Si après ces étapes le problème persiste :
1. Partagez les logs du backend (Render Dashboard)
2. Partagez les erreurs de la console du navigateur
3. Partagez l'URL exacte de votre backend

