# Commandes Build et Start pour Render

## Backend Medusa

### Build Command
```bash
yarn install && yarn build
```

### Start Command
```bash
npx medusa start
```

**Variables d'environnement requises:**
- `NODE_ENV=production`
- `DATABASE_URL` (URL de la base de données PostgreSQL)
- `JWT_SECRET` (généré automatiquement ou créez-en un)
- `COOKIE_SECRET` (généré automatiquement ou créez-en un)
- `MEDUSA_ADMIN_ONBOARDING_TYPE=default`

**Health Check Path:** `/health`

---

## Admin Dashboard (Frontend)

### Root Directory
```
packages/admin/dashboard
```

### Build Command
```bash
yarn install && yarn build:preview
```

### Start Command
```bash
yarn preview --host 0.0.0.0 --port $PORT
```

**Variables d'environnement requises:**
- `NODE_ENV=production`
- `VITE_MEDUSA_ADMIN_BACKEND_URL` (URL du backend, ex: `https://medusa-backend.onrender.com`)
- `VITE_AUTH_API_URL` (URL de l'API d'authentification, ex: `https://medusa-auth.gfiyfougiug.workers.dev`)

---

## Alternative: Pour un projet Medusa standard (créé avec create-medusa-app)

Si vous avez un projet Medusa standard (pas le repository source), utilisez ces commandes:

### Backend Medusa Standard

**Build Command:**
```bash
yarn install && npx medusa build
```

**Start Command:**
```bash
cd .medusa/server && yarn install && node index.js
```

OU plus simple:
```bash
npx medusa start
```

### Admin Dashboard Standard

**Build Command:**
```bash
yarn install && yarn build
```

**Start Command:**
```bash
yarn start
```

---

## Notes importantes

1. **Premier déploiement:** Après le build, exécutez les migrations:
   ```bash
   npx medusa db:migrate
   ```

2. **Créer un utilisateur admin:**
   ```bash
   npx medusa user -e admin@example.com -p votre-mot-de-passe
   ```

3. **Port:** Render définit automatiquement `$PORT`, utilisez-le dans la commande start pour le frontend.

4. **Base de données:** Assurez-vous que la base de données PostgreSQL est créée avant de déployer le backend.

