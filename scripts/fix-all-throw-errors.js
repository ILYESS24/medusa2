#!/usr/bin/env node

/**
 * Script automatique pour corriger TOUS les fichiers qui lancent des erreurs
 * Remplace "if (isError) { throw error }" par l'affichage d'un Alert
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Correction automatique de tous les fichiers...\n')

const routesDir = path.join(__dirname, '../packages/admin/dashboard/src/routes')
const filesFixed = []
const filesSkipped = []

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
        
        // Pattern 1: if (isError) { throw error }
        if (content.includes('if (isError)') && content.includes('throw error')) {
          // Vérifier si Alert est déjà importé
          const hasAlertImport = content.includes("import") && content.includes("Alert")
          
          // Extraire le nom de la ressource depuis le chemin
          const resourceName = extractResourceName(fullPath)
          
          // Remplacer le throw error par l'affichage d'Alert
          const throwPattern = /if\s*\(\s*isError\s*\)\s*\{[\s\n]*throw\s+error[\s\n]*\}/g
          
          if (throwPattern.test(content)) {
            // Ajouter l'import Alert si nécessaire
            if (!hasAlertImport) {
              // Trouver la ligne d'import de @medusajs/ui
              const uiImportRegex = /import\s+{([^}]+)}\s+from\s+["']@medusajs\/ui["']/
              const uiImportMatch = content.match(uiImportRegex)
              
              if (uiImportMatch) {
                const imports = uiImportMatch[1].split(',').map(i => i.trim())
                if (!imports.includes('Alert')) {
                  imports.push('Alert')
                  content = content.replace(
                    uiImportRegex,
                    `import { ${imports.join(', ')} } from "@medusajs/ui"`
                  )
                }
              } else {
                // Ajouter un nouvel import
                const firstImportIndex = content.indexOf('import')
                if (firstImportIndex !== -1) {
                  const lineEnd = content.indexOf('\n', firstImportIndex)
                  content = content.slice(0, lineEnd + 1) + 
                           `import { Alert } from "@medusajs/ui"\n` + 
                           content.slice(lineEnd + 1)
                }
              }
            }
            
            // Remplacer le throw error
            content = content.replace(
              throwPattern,
              `// Ne pas lancer l'erreur, afficher un message à la place
  // if (isError) {
  //   throw error
  // }`
            )
            
            // Trouver le return statement et ajouter l'Alert avant
            const returnMatch = content.match(/(\s*)return\s*\(/m)
            if (returnMatch) {
              const indent = returnMatch[1]
              const returnIndex = content.indexOf(returnMatch[0])
              
              // Trouver le Container ou le premier élément du return
              const containerMatch = content.substring(returnIndex).match(/<Container[^>]*>/)
              if (containerMatch) {
                const containerIndex = returnIndex + content.substring(returnIndex).indexOf(containerMatch[0])
                const afterContainer = content.substring(containerIndex).indexOf('>') + 1
                const insertIndex = containerIndex + afterContainer
                
                // Trouver la fin de la div header
                const headerEnd = content.substring(insertIndex).indexOf('</div>')
                if (headerEnd !== -1) {
                  const alertCode = `${indent}      {isError && (
${indent}        <div className="px-6 py-4">
${indent}          <Alert variant="warning">
${indent}            <div className="flex flex-col gap-2">
${indent}              <p className="font-semibold">Backend Medusa non disponible</p>
${indent}              <p className="text-sm">
${indent}                Impossible de charger les ${resourceName}. Le backend Medusa n&apos;est
${indent}                pas configuré ou accessible.
${indent}              </p>
${indent}            </div>
${indent}          </Alert>
${indent}        </div>
${indent}      )}
`
                  content = content.slice(0, insertIndex + headerEnd + 6) + 
                           '\n' + alertCode + 
                           content.slice(insertIndex + headerEnd + 6)
                  modified = true
                }
              }
            }
            
            if (modified) {
              fs.writeFileSync(fullPath, content, 'utf8')
              filesFixed.push(fullPath)
            }
          }
        }
      } catch (err) {
        console.error(`Erreur lors du traitement de ${fullPath}:`, err.message)
        filesSkipped.push(fullPath)
      }
    }
  }
}

function extractResourceName(filePath) {
  // Extraire le nom de la ressource depuis le chemin
  const match = filePath.match(/routes\/([^\/]+)/)
  if (match) {
    const resource = match[1]
    // Convertir en nom lisible
    return resource.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  return "données"
}

findAndFixFiles(routesDir)

console.log(`\n✅ ${filesFixed.length} fichiers corrigés`)
console.log(`⚠️  ${filesSkipped.length} fichiers ignorés (erreurs)\n`)

if (filesFixed.length > 0) {
  console.log('Fichiers corrigés:')
  filesFixed.slice(0, 20).forEach(file => {
    const relativePath = path.relative(process.cwd(), file)
    console.log(`  ✅ ${relativePath}`)
  })
  if (filesFixed.length > 20) {
    console.log(`  ... et ${filesFixed.length - 20} autres fichiers`)
  }
}

if (filesSkipped.length > 0) {
  console.log('\nFichiers ignorés:')
  filesSkipped.forEach(file => {
    const relativePath = path.relative(process.cwd(), file)
    console.log(`  ⚠️  ${relativePath}`)
  })
}

console.log('\n✅ Correction terminée!')

