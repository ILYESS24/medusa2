# 🔧 CORRECTION URGENTE : Start Command dans Render

## ❌ Problème
Les logs montrent que Render utilise encore l'ancienne commande :
```
yarn workspace @medusajs/dashboard preview --host 0.0.0.0 --port $PORT
```

## ✅ Solution : Mettre à jour manuellement dans Render

### Étapes à suivre :

1. **Allez sur https://dashboard.render.com**
2. **Sélectionnez le service `medusa-admin`**
3. **Cliquez sur "Settings"** (dans le menu de gauche)
4. **Trouvez la section "Start Command"**
5. **Remplacez TOUTE la commande actuelle par :**
   ```bash
   cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT
   ```
6. **Cliquez sur "Save Changes"**
7. **Allez dans "Manual Deploy" > "Deploy latest commit"**

## 🔍 Vérification

Après le redéploiement, vérifiez les logs. Vous devriez voir :
```
==> Running 'cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT'
```

Au lieu de :
```
==> Running 'yarn workspace @medusajs/dashboard preview --host 0.0.0.0 --port $PORT'
```

## ⚠️ Note importante

Le fichier `render.yaml` contient déjà la bonne commande, mais Render ne l'a pas encore appliquée. C'est pourquoi une mise à jour manuelle est nécessaire.

