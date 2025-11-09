# Fix pour le Build Render - Admin Dashboard

## Problème

Le build échoue avec l'erreur :
```
Failed to resolve entry for package "@medusajs/admin-vite-plugin"
```

## Cause

Le package `@medusajs/admin-vite-plugin` doit être construit AVANT que le dashboard puisse l'utiliser. C'est un package workspace qui n'est pas pré-construit.

## Solution 1 : Mettre à jour manuellement dans Render (Recommandé)

1. Allez sur https://dashboard.render.com
2. Sélectionnez le service `medusa-admin`
3. Allez dans **Settings**
4. Trouvez **Build Command**
5. Remplacez par :
   ```bash
   yarn install && yarn workspace @medusajs/admin-shared build && yarn workspace @medusajs/admin-vite-plugin build && yarn workspace @medusajs/dashboard build:preview
   ```
6. Cliquez sur **Save Changes**
7. Redémarrez le déploiement

## Solution 2 : Utiliser render.yaml (si vous utilisez Blueprint)

Si vous utilisez un Blueprint, le `render.yaml` devrait être correct. Vérifiez que le service utilise bien le Blueprint et non une configuration manuelle.

## Solution 3 : Alternative - Build complet du monorepo

Si les solutions ci-dessus ne fonctionnent pas, essayez de construire tous les packages admin :

```bash
yarn install && yarn workspace @medusajs/admin-shared build && yarn workspace @medusajs/admin-vite-plugin build && yarn workspace @medusajs/admin-bundler build && yarn workspace @medusajs/dashboard build:preview
```

## Vérification

Après le build, vérifiez que le fichier existe :
```bash
ls packages/admin/admin-vite-plugin/dist/index.js
```

Si le fichier n'existe pas, le build du package a échoué.

