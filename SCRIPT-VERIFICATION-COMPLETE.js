#!/usr/bin/env node

/**
 * Script de vérification complète de la configuration
 * Vérifie que tout est prêt pour le déploiement et la connexion
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 VÉRIFICATION COMPLÈTE DE LA CONFIGURATION\n')
console.log('='.repeat(60))

let errors = []
let warnings = []
let success = []

// 1. Vérifier render.yaml
console.log('\n📋 1. Vérification render.yaml...')
try {
  const renderYaml = fs.readFileSync('render.yaml', 'utf8')
  
  // Vérifier backend
  if (renderYaml.includes('name: medusa-backend')) {
    success.push('✅ Service medusa-backend défini')
  } else {
    errors.push('❌ Service medusa-backend manquant')
  }
  
  // Vérifier frontend
  if (renderYaml.includes('name: medusa-admin')) {
    success.push('✅ Service medusa-admin défini')
  } else {
    errors.push('❌ Service medusa-admin manquant')
  }
  
  // Vérifier base de données
  if (renderYaml.includes('name: medusa-db')) {
    success.push('✅ Base de données medusa-db définie')
  } else {
    errors.push('❌ Base de données medusa-db manquante')
  }
  
  // Vérifier VITE_MEDUSA_ADMIN_BACKEND_URL
  if (renderYaml.includes('VITE_MEDUSA_ADMIN_BACKEND_URL')) {
    if (renderYaml.includes('value: https://')) {
      success.push('✅ VITE_MEDUSA_ADMIN_BACKEND_URL configurée avec https://')
    } else {
      warnings.push('⚠️  VITE_MEDUSA_ADMIN_BACKEND_URL existe mais vérifiez l\'URL complète')
    }
  } else {
    errors.push('❌ VITE_MEDUSA_ADMIN_BACKEND_URL manquante')
  }
  
  // Vérifier build command backend
  if (renderYaml.includes('yarn workspace @medusajs/cli build')) {
    success.push('✅ Build command backend correct')
  } else {
    errors.push('❌ Build command backend incorrect')
  }
  
  // Vérifier start command backend
  if (renderYaml.includes('node packages/cli/medusa-cli/cli.js start')) {
    success.push('✅ Start command backend correct')
  } else {
    errors.push('❌ Start command backend incorrect')
  }
  
} catch (err) {
  errors.push(`❌ Erreur lecture render.yaml: ${err.message}`)
}

// 2. Vérifier medusa-config.js
console.log('\n📋 2. Vérification medusa-config.js...')
try {
  const medusaConfig = fs.readFileSync('medusa-config.js', 'utf8')
  
  // Vérifier modules
  const moduleCount = (medusaConfig.match(/\[Modules\./g) || []).length
  if (moduleCount >= 20) {
    success.push(`✅ ${moduleCount} modules configurés dans medusa-config.js`)
  } else {
    warnings.push(`⚠️  Seulement ${moduleCount} modules configurés (attendu: 28+)`)
  }
  
  // Vérifier DATABASE_URL
  if (medusaConfig.includes('process.env.DATABASE_URL')) {
    success.push('✅ DATABASE_URL configuré depuis variables d\'environnement')
  } else {
    errors.push('❌ DATABASE_URL non configuré')
  }
  
  // Vérifier CORS
  if (medusaConfig.includes('adminCors') && medusaConfig.includes('process.env.ADMIN_CORS')) {
    success.push('✅ CORS configuré')
  } else {
    warnings.push('⚠️  CORS peut ne pas être configuré correctement')
  }
  
} catch (err) {
  errors.push(`❌ Erreur lecture medusa-config.js: ${err.message}`)
}

// 3. Vérifier vite.config.mts
console.log('\n📋 3. Vérification vite.config.mts...')
try {
  const viteConfig = fs.readFileSync('packages/admin/dashboard/vite.config.mts', 'utf8')
  
  // Vérifier __BACKEND_URL__
  if (viteConfig.includes('__BACKEND_URL__')) {
    if (viteConfig.includes('VITE_MEDUSA_ADMIN_BACKEND_URL')) {
      success.push('✅ __BACKEND_URL__ utilise VITE_MEDUSA_ADMIN_BACKEND_URL')
    } else {
      warnings.push('⚠️  __BACKEND_URL__ peut ne pas utiliser VITE_MEDUSA_ADMIN_BACKEND_URL')
    }
  } else {
    errors.push('❌ __BACKEND_URL__ non défini dans vite.config.mts')
  }
  
  // Vérifier fallback
  if (viteConfig.includes('http://localhost:9000')) {
    success.push('✅ Fallback localhost configuré')
  }
  
} catch (err) {
  errors.push(`❌ Erreur lecture vite.config.mts: ${err.message}`)
}

// 4. Vérifier client.ts
console.log('\n📋 4. Vérification client.ts...')
try {
  const clientTs = fs.readFileSync('packages/admin/dashboard/src/lib/client/client.ts', 'utf8')
  
  if (clientTs.includes('__BACKEND_URL__')) {
    success.push('✅ client.ts utilise __BACKEND_URL__')
  } else {
    errors.push('❌ client.ts n\'utilise pas __BACKEND_URL__')
  }
  
  if (clientTs.includes('new Medusa')) {
    success.push('✅ SDK Medusa initialisé')
  } else {
    errors.push('❌ SDK Medusa non initialisé')
  }
  
} catch (err) {
  errors.push(`❌ Erreur lecture client.ts: ${err.message}`)
}

// 5. Vérifier package.json
console.log('\n📋 5. Vérification package.json...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  if (packageJson.workspaces) {
    success.push('✅ Workspaces configurés (monorepo)')
  } else {
    errors.push('❌ Workspaces non configurés')
  }
  
} catch (err) {
  errors.push(`❌ Erreur lecture package.json: ${err.message}`)
}

// Résumé
console.log('\n' + '='.repeat(60))
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION\n')

if (success.length > 0) {
  console.log('✅ SUCCÈS:')
  success.forEach(msg => console.log(`   ${msg}`))
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVERTISSEMENTS:')
  warnings.forEach(msg => console.log(`   ${msg}`))
}

if (errors.length > 0) {
  console.log('\n❌ ERREURS:')
  errors.forEach(msg => console.log(`   ${msg}`))
  console.log('\n🔧 ACTIONS REQUISES:')
  console.log('   1. Corrigez les erreurs ci-dessus')
  console.log('   2. Relancez ce script pour vérifier')
  process.exit(1)
} else {
  console.log('\n✅ TOUT EST CONFIGURÉ CORRECTEMENT!')
  console.log('\n📝 PROCHAINES ÉTAPES:')
  console.log('   1. Déployez sur Render via Blueprint')
  console.log('   2. Attendez que le backend soit Live')
  console.log('   3. Copiez l\'URL réelle du backend')
  console.log('   4. Configurez VITE_MEDUSA_ADMIN_BACKEND_URL dans Render')
  console.log('   5. Redéployez le frontend')
  process.exit(0)
}

