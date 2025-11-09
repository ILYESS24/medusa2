# 🚀 Déploiement en Production - Medusa

## 📋 Configuration Actuelle

Le `render.yaml` est maintenant configuré pour la **production** avec :

### ✅ Backend Medusa
- Base de données PostgreSQL configurée
- Migrations automatiques lors du build
- Variables d'environnement sécurisées
- CORS configuré pour le frontend
- Health check sur `/health`

### ✅ Frontend Admin
- Connecté au vrai backend Medusa
- Authentification personnalisée disponible
- Build optimisé pour la production

## 🔧 Étapes de Déploiement

### 1. Déployer sur Render

**Option A : Via Blueprint (Recommandé)**
1. Allez sur https://dashboard.render.com
2. Cliquez sur "New" > "Blueprint"
3. Connectez votre repository GitHub
4. Render détectera automatiquement `render.yaml`
5. Cliquez sur "Apply"

**Option B : Manuellement**
1. Créez la base de données PostgreSQL
2. Créez le service `medusa-backend`
3. Créez le service `medusa-admin`
4. Configurez les variables d'environnement

### 2. Attendre le Déploiement

Le backend Medusa peut prendre **5-10 minutes** à démarrer car il doit :
- Installer les dépendances
- Exécuter les migrations de base de données
- Démarrer le serveur

### 3. Vérifier le Backend

Une fois déployé, testez :
```
https://votre-backend.onrender.com/health
```

Vous devriez voir `OK` ou une réponse JSON.

### 4. Créer un Utilisateur Admin

**Via Render Shell :**
1. Allez dans le service `medusa-backend`
2. Cliquez sur "Shell"
3. Exécutez :
   ```bash
   npx medusa user -e admin@votre-domaine.com -p VotreMotDePasse123!
   ```

**Via Render Dashboard :**
1. Allez dans le service `medusa-backend`
2. Cliquez sur "Manual Deploy" > "Run Command"
3. Exécutez :
   ```bash
   npx medusa user -e admin@votre-domaine.com -p VotreMotDePasse123!
   ```

### 5. Accéder à l'Interface Admin

L'interface admin est disponible à :
```
https://votre-frontend.onrender.com
```

## 🔐 Variables d'Environnement Importantes

### Backend
- `DATABASE_URL` : Automatiquement configuré depuis la DB
- `JWT_SECRET` : Généré automatiquement (sécurisé)
- `COOKIE_SECRET` : Généré automatiquement (sécurisé)
- `ADMIN_CORS` : URL du frontend (automatique)
- `AUTH_CORS` : URL du frontend (automatique)

### Frontend
- `VITE_MEDUSA_ADMIN_BACKEND_URL` : URL du backend (automatique)
- `VITE_AUTH_API_URL` : URL de l'API d'authentification

## ⚠️ Notes Importantes

1. **Premier déploiement** : Les migrations s'exécutent automatiquement lors du build
2. **Création d'admin** : Nécessaire après le premier déploiement
3. **Temps de démarrage** : Le backend peut prendre 5-10 minutes au premier démarrage
4. **Health check** : Render vérifie `/health` pour savoir si le service est prêt

## 🐛 Dépannage

### Le backend ne démarre pas
1. Vérifiez les logs dans Render
2. Vérifiez que la base de données est accessible
3. Vérifiez que les migrations ont réussi

### Erreur de connexion au backend
1. Vérifiez que `VITE_MEDUSA_ADMIN_BACKEND_URL` pointe vers le bon service
2. Vérifiez que le backend répond sur `/health`
3. Vérifiez les logs du frontend

### Erreur CORS
1. Vérifiez que `ADMIN_CORS` contient l'URL du frontend
2. Vérifiez que `AUTH_CORS` contient l'URL du frontend

## 📊 Monitoring

- **Logs** : Disponibles dans Render Dashboard
- **Health Check** : `/health` endpoint
- **Métriques** : Disponibles dans Render Dashboard (plan payant)

## 🔄 Mises à Jour

Pour mettre à jour :
1. Poussez vos changements sur GitHub
2. Render redéploiera automatiquement
3. Les migrations s'exécuteront automatiquement

## ✅ Checklist de Production

- [ ] Backend déployé et répond sur `/health`
- [ ] Base de données accessible
- [ ] Migrations exécutées
- [ ] Utilisateur admin créé
- [ ] Frontend connecté au backend
- [ ] CORS configuré
- [ ] Variables d'environnement sécurisées
- [ ] Interface admin accessible

