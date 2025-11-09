#!/usr/bin/env node

/**
 * Script de validation de la configuration Medusa
 * Vérifie que medusa-config.js est valide et que tous les modules sont correctement configurés
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Validation de la configuration Medusa...\n')

// Vérifier que medusa-config.js existe
const configPath = path.join(process.cwd(), 'medusa-config.js')
if (!fs.existsSync(configPath)) {
  console.error('❌ ERREUR: medusa-config.js n\'existe pas à la racine!')
  process.exit(1)
}

console.log('✅ medusa-config.js trouvé')

// Essayer de charger la configuration
try {
  const config = require(configPath)
  
  // Vérifier la structure de base
  if (!config.projectConfig) {
    console.error('❌ ERREUR: projectConfig manquant dans medusa-config.js')
    process.exit(1)
  }
  
  if (!config.modules) {
    console.error('❌ ERREUR: modules manquant dans medusa-config.js')
    process.exit(1)
  }
  
  console.log('✅ Structure de base valide')
  console.log(`✅ ${Object.keys(config.modules).length} modules configurés`)
  
  // Vérifier les modules essentiels
  const { Modules } = require('@medusajs/utils')
  const essentialModules = [
    Modules.AUTH,
    Modules.USER,
    Modules.PRODUCT,
    Modules.ORDER,
    Modules.CART,
    Modules.CUSTOMER,
  ]
  
  const missingModules = essentialModules.filter(
    mod => !config.modules[mod]
  )
  
  if (missingModules.length > 0) {
    console.warn(`⚠️  Modules manquants: ${missingModules.join(', ')}`)
  } else {
    console.log('✅ Tous les modules essentiels sont configurés')
  }
  
  console.log('\n✅ Configuration valide!')
  
} catch (error) {
  console.error('❌ ERREUR lors du chargement de medusa-config.js:')
  console.error(error.message)
  process.exit(1)
}

