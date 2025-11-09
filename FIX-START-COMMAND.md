# 🔧 FIX: Commande de Start Incorrecte

## 🚨 PROBLÈME IDENTIFIÉ

Dans les logs Render, je vois:
```
==> Running 'yarn workspace @medusajs/dashboard preview --host 0.0.0.0 --port $PORT'
```

**Mais dans `render.yaml`, la commande devrait être:**
```yaml
startCommand: cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT
```

## ⚠️ CAUSE

Render utilise peut-être une ancienne configuration ou la commande n'est pas correctement appliquée.

## ✅ SOLUTION

### Option 1: Vérifier dans Render Dashboard (Recommandé)

1. **Render Dashboard** > Service `medusa-admin` > **Settings**
2. **Start Command:**
   - Vérifiez la commande actuelle
   - Si c'est `yarn workspace @medusajs/dashboard preview...`
   - Remplacez par: `cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT`
3. **Save Changes**
4. **Manual Deploy** > **Deploy latest commit**

### Option 2: Vérifier render.yaml

Le `render.yaml` est correct, mais Render peut ne pas l'avoir appliqué.

**Vérifiez que render.yaml contient bien:**
```yaml
startCommand: cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT
```

Si ce n'est pas le cas, modifiez et poussez sur GitHub.

## 📋 VÉRIFICATION

Après correction, les logs devraient montrer:
```
==> Running 'cd packages/admin/dashboard && npx vite preview --host 0.0.0.0 --port $PORT'
```

Au lieu de:
```
==> Running 'yarn workspace @medusajs/dashboard preview...'
```

## 🎯 IMPORTANT

Même si la commande actuelle fonctionne (le service est live), la commande correcte est celle dans `render.yaml` pour garantir la cohérence.

