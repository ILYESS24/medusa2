# ☁️ Configuration Cloudflare Pages pour le Frontend

## 📋 Configuration Requise

### 1. Build Command
```bash
yarn install && yarn workspace @medusajs/deps build && yarn workspace @medusajs/types build && yarn workspace @medusajs/icons build && yarn workspace @medusajs/ui-preset build && yarn workspace @medusajs/ui build && yarn workspace @medusajs/js-sdk build && yarn workspace @medusajs/admin-shared build && yarn workspace @medusajs/admin-vite-plugin build && yarn workspace @medusajs/dashboard build:preview
```

### 2. Build Output Directory
```
packages/admin/dashboard/dist
```

### 3. Root Directory
```
packages/admin/dashboard
```

### 4. Environment Variables

**Variables à configurer dans Cloudflare Pages:**

- `VITE_MEDUSA_ADMIN_BACKEND_URL` = URL du backend Render (ex: `https://medusa-backend-xxx.onrender.com`)
- `VITE_AUTH_API_URL` = `https://medusa-auth.gfiyfougiug.workers.dev`
- `NODE_ENV` = `production`

## 🚀 Déploiement

1. **Cloudflare Dashboard** > **Pages** > **Create a project**
2. **Connect to Git** > Connectez votre repo GitHub
3. **Project name:** `medusa-admin`
4. **Production branch:** `develop`
5. **Build settings:**
   - **Framework preset:** Vite
   - **Build command:** (voir ci-dessus)
   - **Build output directory:** `dist`
   - **Root directory:** `packages/admin/dashboard`
6. **Environment variables:** Ajoutez les variables ci-dessus
7. **Save and Deploy**

