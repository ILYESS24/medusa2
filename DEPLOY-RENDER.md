# Déploiement sur Render

## Prérequis

1. Compte Render (https://render.com)
2. Repository Git (GitHub, GitLab, Bitbucket)

## Méthode 1 : Déploiement automatique avec Blueprint (Recommandé)

### Étapes

1. **Poussez votre code sur Git** :
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

2. **Allez sur https://dashboard.render.com**

3. **Créez un Blueprint** :
   - Cliquez sur **New +** > **Blueprint**
   - Connectez votre repository Git
   - Render détectera automatiquement `render.yaml`
   - Cliquez sur **Apply**

4. **Render créera automatiquement** :
   - Base de données PostgreSQL
   - Service backend Medusa
   - Service admin dashboard

5. **Attendez le déploiement** (5-10 minutes)

6. **Exécutez les migrations** :
   - Allez sur le service `medusa-backend`
   - Cliquez sur **Shell**
   - Exécutez : `npx medusa db:migrate`

7. **Créez un utilisateur admin** :
   - Dans le même Shell :
   ```bash
   npx medusa user -e admin@example.com -p votre-mot-de-passe
   ```

## Méthode 2 : Déploiement manuel

### 1. Créer la base de données PostgreSQL

1. Allez sur https://dashboard.render.com
2. Cliquez sur **New +** > **PostgreSQL**
3. Configurez :
   - **Name**: `medusa-db`
   - **Database**: `medusa_db`
   - **User**: `medusa_user`
   - **Plan**: Starter (gratuit)
4. Notez la **Internal Database URL**

### 2. Déployer le backend Medusa

1. Cliquez sur **New +** > **Web Service**
2. Connectez votre repository Git
3. Configurez :
   - **Name**: `medusa-backend`
   - **Runtime**: Node
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `npx medusa start`
   - **Plan**: Starter (gratuit)

4. Variables d'environnement :
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (URL de la base de données)
   - `JWT_SECRET` = (générez-en un : `openssl rand -base64 32`)
   - `COOKIE_SECRET` = (générez-en un : `openssl rand -base64 32`)
   - `MEDUSA_ADMIN_ONBOARDING_TYPE` = `default`

5. Cliquez sur **Create Web Service**

### 3. Déployer l'admin dashboard

1. Cliquez sur **New +** > **Web Service**
2. Connectez le même repository Git
3. Configurez :
   - **Name**: `medusa-admin`
   - **Root Directory**: `packages/admin/dashboard`
   - **Runtime**: Node
   - **Build Command**: `yarn install && yarn build:preview`
   - **Start Command**: `yarn preview --host 0.0.0.0 --port $PORT`
   - **Plan**: Starter (gratuit)

4. Variables d'environnement :
   - `NODE_ENV` = `production`
   - `VITE_MEDUSA_ADMIN_BACKEND_URL` = (URL du backend, ex: `https://medusa-backend.onrender.com`)
   - `VITE_AUTH_API_URL` = `https://medusa-auth.gfiyfougiug.workers.dev`

5. Cliquez sur **Create Web Service**

### 4. Migration de la base de données

Une fois le backend déployé :

1. Allez sur le service `medusa-backend`
2. Cliquez sur **Shell**
3. Exécutez :
   ```bash
   npx medusa db:migrate
   ```

### 5. Créer un utilisateur admin

Dans le même Shell :

```bash
npx medusa user -e admin@example.com -p votre-mot-de-passe
```

## URLs après déploiement

- **Backend**: `https://medusa-backend.onrender.com`
- **Admin Dashboard**: `https://medusa-admin.onrender.com`
- **Health Check**: `https://medusa-backend.onrender.com/health`

## Notes importantes

- ⚠️ Le plan Starter est gratuit mais met le service en veille après 15 minutes d'inactivité
- Le premier démarrage peut prendre 5-10 minutes
- Les variables d'environnement sont automatiquement synchronisées entre services si configurées dans `render.yaml`
- Pour un environnement de production, utilisez un plan payant pour éviter la mise en veille

## Dépannage

### Le service ne démarre pas

1. Vérifiez les logs dans le dashboard Render
2. Vérifiez que `DATABASE_URL` est correctement configuré
3. Vérifiez que les migrations ont été exécutées

### Erreur de connexion à la base de données

1. Vérifiez que la base de données est créée
2. Vérifiez que `DATABASE_URL` utilise l'URL interne (pas externe)
3. Attendez quelques minutes après la création de la base de données

### L'admin dashboard ne se connecte pas au backend

1. Vérifiez que `VITE_MEDUSA_ADMIN_BACKEND_URL` pointe vers le bon service
2. Vérifiez que le backend est démarré et accessible
3. Vérifiez les logs du service admin
