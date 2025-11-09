# 🔍 VÉRIFICATION BACKEND - CONNEXION REQUISE

## ⚠️ IMPORTANT

**Le backend Medusa est REQUIS pour que l'interface fonctionne.**

L'interface ne fonctionne PAS sans backend. Elle DOIT être connectée au backend.

## 🔧 VÉRIFICATIONS À FAIRE

### 1. Vérifier que le backend démarre

```bash
# Dans Render, vérifiez les logs du service medusa-backend
# Le backend doit afficher:
# - "Server listening on port 9000"
# - Pas d'erreurs de connexion à la base de données
```

### 2. Vérifier l'URL du backend

Dans Render, service `medusa-admin`, vérifiez:
- `VITE_MEDUSA_ADMIN_BACKEND_URL` doit pointer vers `medusa-backend-XXXX.onrender.com`
- L'URL doit être accessible (testez dans le navigateur)

### 3. Tester la connexion

```bash
# Testez l'endpoint de santé
curl https://medusa-backend-XXXX.onrender.com/health

# Devrait retourner: {"status": "ok"}
```

### 4. Vérifier les CORS

Le backend doit autoriser les requêtes depuis le frontend:
- `ADMIN_CORS` doit pointer vers l'URL du frontend
- `AUTH_CORS` doit pointer vers l'URL du frontend

## 🚨 PROBLÈMES COURANTS

### Backend ne démarre pas
- Vérifiez les logs dans Render
- Vérifiez que la base de données est accessible
- Vérifiez que les migrations sont passées

### Backend démarre mais ne répond pas
- Vérifiez que le port est correct (9000)
- Vérifiez que le health check fonctionne
- Vérifiez les logs pour les erreurs

### Frontend ne peut pas se connecter
- Vérifiez `VITE_MEDUSA_ADMIN_BACKEND_URL`
- Vérifiez les CORS dans le backend
- Testez l'URL du backend directement

## ✅ SOLUTION

**Le backend DOIT être déployé et accessible pour que l'interface fonctionne.**

Les corrections appliquées permettent à l'interface d'afficher des messages d'erreur clairs au lieu de crasher, mais **le backend est toujours requis**.

