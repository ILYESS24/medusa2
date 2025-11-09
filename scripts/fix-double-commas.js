#!/usr/bin/env node

/**
 * Script pour corriger toutes les virgules en double dans les imports
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Correction des virgules en double dans les imports...\n')

const routesDir = path.join(__dirname, '../packages/admin/dashboard/src/routes')
const filesFixed = []

function findAndFixFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      findAndFixFiles(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8')
        let modified = false
        
        // Pattern: virgule en double dans les imports
        const doubleCommaPattern = /(,)\s*,\s*([A-Za-z])/g
        
        if (doubleCommaPattern.test(content)) {
          // Remplacer toutes les virgules en double
          content = content.replace(doubleCommaPattern, (match, comma, letter) => {
            modified = true
            return `, ${letter}`
          })
          
          if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8')
            filesFixed.push(fullPath)
          }
        }
      } catch (err) {
        console.error(`Erreur: ${fullPath}`, err.message)
      }
    }
  }
}

findAndFixFiles(routesDir)

console.log(`✅ ${filesFixed.length} fichiers corrigés\n`)

if (filesFixed.length > 0) {
  filesFixed.forEach(file => {
    const relativePath = path.relative(process.cwd(), file)
    console.log(`  ✅ ${relativePath}`)
  })
}

console.log('\n✅ Correction terminée!')

