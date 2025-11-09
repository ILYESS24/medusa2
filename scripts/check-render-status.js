#!/usr/bin/env node

/**
 * Script pour vérifier l'état actuel et donner des instructions précises
 */

console.log('🔍 VÉRIFICATION DE L\'ÉTAT ACTUEL\n')
console.log('='.repeat(60))

console.log('\n📋 INSTRUCTIONS PRÉCISES:\n')

console.log('1️⃣  OUVREZ RENDER DASHBOARD:')
console.log('   → https://dashboard.render.com\n')

console.log('2️⃣  CHERCHEZ LE SERVICE "medusa-backend":')
console.log('   → Utilisez la barre de recherche en haut\n')

console.log('3️⃣  VÉRIFIEZ LE STATUT:\n')

console.log('   ✅ SI "Live" (vert):')
console.log('      → Cliquez sur le service')
console.log('      → COPIEZ L\'URL (ex: https://medusa-backend-xxx.onrender.com)')
console.log('      → Testez dans navigateur: [URL]/health')
console.log('      → Devrait afficher: {"status": "ok"}')
console.log('      → SUIVEZ LES INSTRUCTIONS CI-DESSOUS\n')

console.log('   ❌ SI "Build failed" ou "Deploy failed":')
console.log('      → Cliquez sur le service > Logs')
console.log('      → COPIEZ LES ERREURS')
console.log('      → Partagez-les pour diagnostic\n')

console.log('   ❌ SI LE SERVICE N\'EXISTE PAS:')
console.log('      → New > Blueprint')
console.log('      → Connectez repo: ILYESS24/medusa2')
console.log('      → Branch: develop')
console.log('      → Apply')
console.log('      → ATTENDEZ 15-20 minutes\n')

console.log('4️⃣  CONFIGURER L\'URL (Si backend est Live):\n')

console.log('   a) Service "medusa-admin" > Environment')
console.log('   b) Cherchez "VITE_MEDUSA_ADMIN_BACKEND_URL"')
console.log('   c) Si existe: Edit > Remplacez par votre URL')
console.log('      Si n\'existe pas: Add > Key: VITE_MEDUSA_ADMIN_BACKEND_URL')
console.log('   d) Value: https://medusa-backend-XXX.onrender.com (VOTRE URL)')
console.log('   e) ⚠️  IMPORTANT: Commence par https://')
console.log('   f) ⚠️  IMPORTANT: Pas de slash à la fin')
console.log('   g) Save Changes')
console.log('   h) Manual Deploy > Deploy latest commit')
console.log('   i) ATTENDEZ 5-10 minutes\n')

console.log('5️⃣  VÉRIFIER:\n')

console.log('   → Ouvrez: https://medusa2-4zm0.onrender.com')
console.log('   → F12 > Console')
console.log('   → Tapez: console.log(window.__BACKEND_URL__)')
console.log('   → Devrait afficher votre URL Render')
console.log('   → Le message "Configuration requise" devrait disparaître\n')

console.log('='.repeat(60))
console.log('\n✅ SUIVEZ CES ÉTAPES EXACTEMENT ET ÇA MARCHERA!\n')

