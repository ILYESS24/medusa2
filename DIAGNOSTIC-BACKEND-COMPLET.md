# 🔍 DIAGNOSTIC COMPLET - BACKEND REQUIS

## ⚠️ RÉALITÉ

**Le backend Medusa est REQUIS. L'interface ne fonctionne PAS sans backend.**

## 🔧 VÉRIFICATIONS OBLIGATOIRES

### 1. Backend doit démarrer sur Render

**Service**: `medusa-backend`

**Vérifications**:
- ✅ Service doit être en état "Live" (vert)
- ✅ Logs doivent montrer: "Server is ready on port: 9000"
- ✅ Pas d'erreurs de connexion à la base de données
- ✅ Health check `/health` doit retourner "OK"

**Test**:
```bash
# Dans Render Dashboard, ouvrez les logs du service medusa-backend
# Vous devriez voir:
# - "Server is ready on port: 9000"
# - Pas d'erreurs
```

### 2. URL du backend doit être accessible

**Dans Render**:
- Service `medusa-backend` → Notez l'URL (ex: `medusa-backend-XXXX.onrender.com`)
- Testez dans le navigateur: `https://medusa-backend-XXXX.onrender.com/health`
- Doit retourner: `OK` ou `{"status": "ok"}`

### 3. Frontend doit pointer vers le backend

**Dans Render**:
- Service `medusa-admin` → Variables d'environnement
- `VITE_MEDUSA_ADMIN_BACKEND_URL` doit être: `https://medusa-backend-XXXX.onrender.com`
- Vérifiez que c'est bien l'URL du service backend

### 4. CORS doivent être configurés

**Dans Render**:
- Service `medusa-backend` → Variables d'environnement
- `ADMIN_CORS` doit pointer vers l'URL du frontend
- `AUTH_CORS` doit pointer vers l'URL du frontend

## 🚨 PROBLÈMES COURANTS

### Backend ne démarre pas

**Causes possibles**:
1. Base de données non accessible
2. Migrations non passées
3. Configuration incorrecte
4. Erreurs dans `medusa-config.js`

**Solution**:
1. Vérifiez les logs dans Render
2. Vérifiez que `DATABASE_URL` est correct
3. Vérifiez que les migrations sont passées (`db:migrate`)

### Backend démarre mais ne répond pas

**Causes possibles**:
1. Port incorrect
2. Health check non configuré
3. Erreurs dans le code

**Solution**:
1. Vérifiez que `PORT=9000` est défini
2. Testez `/health` directement
3. Vérifiez les logs pour les erreurs

### Frontend ne peut pas se connecter

**Causes possibles**:
1. URL incorrecte dans `VITE_MEDUSA_ADMIN_BACKEND_URL`
2. CORS non configurés
3. Backend non accessible

**Solution**:
1. Vérifiez `VITE_MEDUSA_ADMIN_BACKEND_URL` dans Render
2. Vérifiez `ADMIN_CORS` et `AUTH_CORS` dans le backend
3. Testez l'URL du backend directement

## ✅ CHECKLIST COMPLÈTE

- [ ] Backend déployé sur Render
- [ ] Backend en état "Live"
- [ ] Health check `/health` fonctionne
- [ ] URL du backend notée
- [ ] `VITE_MEDUSA_ADMIN_BACKEND_URL` configuré dans le frontend
- [ ] `ADMIN_CORS` configuré dans le backend
- [ ] `AUTH_CORS` configuré dans le backend
- [ ] Base de données accessible
- [ ] Migrations passées
- [ ] Logs du backend sans erreurs

## 🎯 RÉSULTAT ATTENDU

Quand tout est correct:
- ✅ Backend répond sur `/health`
- ✅ Frontend peut se connecter au backend
- ✅ Interface charge les données
- ✅ Pas d'erreurs de connexion

## 📝 COMMANDES UTILES

```bash
# Tester la connexion au backend
curl https://medusa-backend-XXXX.onrender.com/health

# Vérifier les variables d'environnement dans Render
# Dashboard → Service → Environment

# Voir les logs en temps réel
# Dashboard → Service → Logs
```

