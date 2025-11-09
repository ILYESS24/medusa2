# Diagnostic Backend Medusa

## Problème
L'interface affiche : "Erreur lors du chargement - Le backend Medusa n'est peut-être pas configuré ou accessible."

## Vérifications à faire

### 1. Vérifier que le backend est déployé sur Render

1. Allez sur https://dashboard.render.com
2. Vérifiez que le service `medusa-backend` existe et est en état "Live"
3. Notez l'URL du service (ex: `medusa-backend-xxxx.onrender.com`)

### 2. Vérifier que le backend répond

Testez l'endpoint de santé :
```bash
curl https://VOTRE-URL-BACKEND.onrender.com/health
```

Ou ouvrez dans votre navigateur :
```
https://VOTRE-URL-BACKEND.onrender.com/health
```

### 3. Vérifier la configuration dans Render

Dans le service `medusa-admin` (frontend), vérifiez que :
- `VITE_MEDUSA_ADMIN_BACKEND_URL` est bien défini
- Il pointe vers l'URL du service `medusa-backend`

### 4. Vérifier les logs du backend

Dans Render, allez dans les logs du service `medusa-backend` et vérifiez :
- Pas d'erreurs de démarrage
- Le serveur écoute sur le port correct
- Pas d'erreurs de connexion à la base de données

### 5. Solution temporaire : Utiliser le backend Worker simplifié

Si le backend Medusa complet ne fonctionne pas, on peut utiliser le Worker Cloudflare simplifié :

1. Dans Render, service `medusa-admin`, modifiez la variable d'environnement :
   - `VITE_MEDUSA_ADMIN_BACKEND_URL` = `https://medusa-backend.gfiyfougiug.workers.dev`

2. Redéployez le service `medusa-admin`

## Correction appliquée

✅ Le code a été corrigé pour lire `VITE_MEDUSA_ADMIN_BACKEND_URL` depuis Render
✅ Le code a été poussé sur GitHub

## Prochaines étapes

1. Attendre le redéploiement automatique de Render
2. Vérifier que le backend répond
3. Si le backend ne répond pas, utiliser le Worker simplifié en attendant

