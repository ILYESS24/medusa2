# 🔧 Configuration du Monorepo pour la Production

## ✅ Ce qui a été fait

1. **Créé `medusa-config.js`** à la racine
   - Configuration complète avec tous les modules Medusa
   - Utilise les variables d'environnement de Render
   - Modules e-commerce complets (Products, Orders, Cart, etc.)

2. **Mis à jour `render.yaml`**
   - Build command : Build le CLI et Medusa avant de démarrer
   - Start command : Utilise le CLI du monorepo (`yarn workspace @medusajs/cli exec medusa start`)
   - Migrations automatiques lors du build

## 📋 Structure de Configuration

Le fichier `medusa-config.js` configure :
- ✅ **Base de données** : PostgreSQL (depuis `DATABASE_URL`)
- ✅ **Modules e-commerce** : Product, Order, Cart, Customer, etc.
- ✅ **Modules de paiement** : Payment avec provider système
- ✅ **Modules de fulfillment** : Fulfillment manuel
- ✅ **Modules d'inventaire** : Stock Location, Inventory
- ✅ **Modules de fichiers** : File avec provider local
- ✅ **Modules de notification** : Notification locale
- ✅ **CORS** : Configuré depuis les variables d'environnement

## 🚀 Déploiement

### Sur Render

1. **Déployez via Blueprint**
   - Render détectera automatiquement `render.yaml`
   - Créera la base de données PostgreSQL
   - Buildera et démarrera le backend

2. **Le build va :**
   - Installer les dépendances
   - Builder le CLI Medusa
   - Builder tous les packages
   - Builder le package Medusa
   - Exécuter les migrations

3. **Le start va :**
   - Utiliser le CLI du monorepo
   - Charger `medusa-config.js`
   - Démarrer le serveur sur le port 9000

## ⚠️ Points d'Attention

1. **Temps de build** : Peut prendre 15-20 minutes (build de tout le monorepo)
2. **Mémoire** : Le build nécessite beaucoup de RAM
3. **Premier démarrage** : Peut prendre 5-10 minutes (initialisation des modules)

## 🔍 Vérification

Après le déploiement, vérifiez :
- `/health` répond `OK`
- Les logs montrent "Server is ready on port: 9000"
- Pas d'erreurs de modules manquants

## 🐛 Dépannage

### Erreur "Cannot find module"
- Vérifiez que tous les packages sont bien buildés
- Vérifiez que `yarn build` a réussi

### Erreur "medusa-config not found"
- Vérifiez que `medusa-config.js` est à la racine
- Vérifiez les permissions du fichier

### Erreur de migration
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que la base de données est accessible

## 📝 Variables d'Environnement Requises

- `DATABASE_URL` : URL PostgreSQL (automatique depuis Render)
- `JWT_SECRET` : Secret JWT (généré automatiquement)
- `COOKIE_SECRET` : Secret cookie (généré automatiquement)
- `ADMIN_CORS` : URL du frontend (automatique)
- `STORE_CORS` : URL du storefront (par défaut "*")
- `AUTH_CORS` : URL pour l'auth (automatique)

## ✅ Résultat Attendu

Après le déploiement réussi :
- ✅ Backend Medusa fonctionnel
- ✅ Toutes les fonctionnalités e-commerce disponibles
- ✅ Base de données initialisée
- ✅ Prêt pour créer des produits, commandes, etc.

