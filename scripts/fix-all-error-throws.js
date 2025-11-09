#!/usr/bin/env node

/**
 * Script pour trouver et corriger tous les composants qui lancent des erreurs
 * au lieu de les afficher
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Recherche des composants avec "throw error"...\n')

// Trouver tous les fichiers qui contiennent "throw error" ou "if (isError)"
const routesDir = path.join(__dirname, '../packages/admin/dashboard/src/routes')
const files = []

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      findFiles(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        if (content.includes('if (isError)') && content.includes('throw error')) {
          files.push(fullPath)
        }
      } catch (err) {
        // Ignorer les erreurs de lecture
      }
    }
  }
}

findFiles(routesDir)

console.log(`✅ Trouvé ${files.length} fichiers à corriger:\n`)
files.forEach(file => {
  const relativePath = path.relative(process.cwd(), file)
  console.log(`  - ${relativePath}`)
})

if (files.length === 0) {
  console.log('\n✅ Tous les fichiers ont déjà été corrigés!')
} else {
  console.log(`\n⚠️  ${files.length} fichiers nécessitent encore une correction.`)
  console.log('Ces fichiers doivent être corrigés manuellement.')
}

