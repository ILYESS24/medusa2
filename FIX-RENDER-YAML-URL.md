# 🔧 FIX: URL Backend dans render.yaml

## ⚠️ PROBLÈME IDENTIFIÉ

Dans `render.yaml`, ligne 48-52:

```yaml
- key: VITE_MEDUSA_ADMIN_BACKEND_URL
  fromService:
    name: medusa-backend
    type: web
    property: host
```

**Problème:** `fromService` avec `property: host` donne seulement le hostname (ex: `medusa-backend-xxxx.onrender.com`) **sans le protocole `https://`**.

## ✅ SOLUTION

### Option 1: URL Complète dans render.yaml (Recommandé)

Modifier `render.yaml` pour utiliser l'URL complète:

```yaml
- key: VITE_MEDUSA_ADMIN_BACKEND_URL
  value: https://medusa-backend-xxxx.onrender.com
```

**⚠️ IMPORTANT:** Remplacez `xxxx` par l'identifiant réel de votre service après le premier déploiement.

### Option 2: Configuration Manuelle dans Render (Plus Simple)

1. Déployez d'abord le backend (`medusa-backend`)
2. Copiez l'URL complète du backend (ex: `https://medusa-backend-abc123.onrender.com`)
3. Dans Render Dashboard:
   - Service `medusa-admin` > **Environment**
   - Ajoutez/modifiez `VITE_MEDUSA_ADMIN_BACKEND_URL`
   - Valeur: `https://medusa-backend-abc123.onrender.com` (votre URL réelle)
   - **Redéployez** le service

### Option 3: Utiliser Render Service URL (Avancé)

Si Render supporte les variables d'environnement dynamiques, vous pouvez utiliser:

```yaml
- key: VITE_MEDUSA_ADMIN_BACKEND_URL
  fromService:
    name: medusa-backend
    type: web
    property: url  # Si Render supporte 'url' au lieu de 'host'
```

**Note:** Vérifiez la documentation Render pour voir si `property: url` est supporté.

## 📝 INSTRUCTIONS

1. **Premier déploiement:**
   - Laissez `value: https://medusa-backend.onrender.com` dans `render.yaml`
   - Render créera le service avec une URL unique

2. **Après le premier déploiement:**
   - Vérifiez l'URL réelle du backend dans Render Dashboard
   - Modifiez `render.yaml` avec l'URL réelle
   - OU configurez-la manuellement dans Render Dashboard

3. **Redéployez le frontend:**
   - Les variables `VITE_*` sont injectées au BUILD
   - Un redéploiement est **obligatoire** après modification

## 🔍 VÉRIFICATION

Après redéploiement, dans la console du navigateur (F12):

```javascript
console.log('Backend URL:', window.__BACKEND_URL__)
// Devrait afficher: https://medusa-backend-xxxx.onrender.com
```

