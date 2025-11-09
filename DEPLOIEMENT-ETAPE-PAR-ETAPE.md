# 🚀 DÉPLOIEMENT ÉTAPE PAR ÉTAPE - Backend Render + Frontend Cloudflare

## 📋 RÉSUMÉ
- **Backend:** Render (https://dashboard.render.com)
- **Frontend:** Cloudflare Pages (https://dash.cloudflare.com)
- **Temps total:** ~30-40 minutes

---

## 🔵 ÉTAPE 1: BACKEND SUR RENDER (20 min)

### 1.1 Créer le Blueprint
```
1. https://dashboard.render.com
2. New > Blueprint
3. Connect GitHub > ILYESS24/medusa2 > develop
4. Apply
```

### 1.2 Attendre
- ⏱️ 15-20 minutes
- Surveillez les logs

### 1.3 Vérifier
```
1. Service medusa-backend > Statut = Live ✅
2. Copier l'URL: https://medusa-backend-XXX.onrender.com
3. Tester: [URL]/health → {"status": "ok"}
```

**✅ URL Backend:** `https://medusa-backend-XXX.onrender.com` (notez cette URL!)

---

## 🟡 ÉTAPE 2: FRONTEND SUR CLOUDFLARE PAGES (15 min)

### 2.1 Créer le Projet
```
1. https://dash.cloudflare.com
2. Pages > Create a project
3. Connect to Git > ILYESS24/medusa2
4. Begin setup
```

### 2.2 Configuration Build
```
Project name: medusa-admin
Framework preset: Vite (ou None)
Build command:
  yarn install && yarn workspace @medusajs/deps build && yarn workspace @medusajs/types build && yarn workspace @medusajs/icons build && yarn workspace @medusajs/ui-preset build && yarn workspace @medusajs/ui build && yarn workspace @medusajs/js-sdk build && yarn workspace @medusajs/admin-shared build && yarn workspace @medusajs/admin-vite-plugin build && yarn workspace @medusajs/dashboard build:preview

Build output directory: packages/admin/dashboard/dist
Root directory: packages/admin/dashboard
Production branch: develop
```

### 2.3 Variables d'Environnement
**AVANT de cliquer "Save and Deploy", ajoutez:**

```
VITE_MEDUSA_ADMIN_BACKEND_URL = https://medusa-backend-XXX.onrender.com
(Votre URL Render réelle)

VITE_AUTH_API_URL = https://medusa-auth.gfiyfougiug.workers.dev

NODE_ENV = production
```

### 2.4 Déployer
```
1. Save and Deploy
2. ⏱️ Attendre 10-15 minutes
3. Copier l'URL: https://medusa-admin.pages.dev
```

**✅ URL Frontend:** `https://medusa-admin.pages.dev` (notez cette URL!)

---

## 🔴 ÉTAPE 3: CONFIGURER CORS (2 min)

### 3.1 Dans Render Dashboard
```
1. Service medusa-backend > Environment
2. ADMIN_CORS: https://medusa-admin.pages.dev (ou *)
3. AUTH_CORS: https://medusa-admin.pages.dev (ou *)
4. Save Changes
```

### 3.2 Redéployer
```
1. Service medusa-backend > Manual Deploy
2. ⏱️ Attendre 2-3 minutes
```

---

## ✅ ÉTAPE 4: VÉRIFIER (1 min)

### 4.1 Ouvrir le Site
```
https://medusa-admin.pages.dev
```

### 4.2 Console (F12)
```javascript
console.log(window.__BACKEND_URL__)
// Devrait afficher: https://medusa-backend-XXX.onrender.com

fetch(window.__BACKEND_URL__ + '/health')
  .then(r => r.json())
  .then(console.log)
// Devrait afficher: {status: "ok"}
```

### 4.3 Interface
- ✅ Plus de "Configuration requise"
- ✅ Orders charge
- ✅ Products charge

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

1. **Render:** Blueprint → Attendre → Copier URL backend
2. **Cloudflare:** Create project → Config build → Variables → Deploy → Copier URL frontend
3. **CORS:** Render > Backend > Environment > ADMIN_CORS et AUTH_CORS → Redéployer
4. **Vérifier:** Ouvrir site > F12 > Tester

**C'est tout!**

