#!/usr/bin/env node

/**
 * Script de test complet de connexion backend
 * Vérifie la configuration et teste la connexion
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

console.log('🔍 VÉRIFICATION COMPLÈTE DE LA CONNEXION BACKEND\n')
console.log('='.repeat(60))

// 1. Lire render.yaml pour trouver l'URL configurée
console.log('\n📋 1. Lecture de render.yaml...')
let backendUrlFromConfig = null
try {
  const renderYaml = fs.readFileSync('render.yaml', 'utf8')
  const urlMatch = renderYaml.match(/VITE_MEDUSA_ADMIN_BACKEND_URL[\s\S]*?value:\s*(https?:\/\/[^\s\n]+)/)
  if (urlMatch) {
    backendUrlFromConfig = urlMatch[1]
    console.log(`   ✅ URL trouvée dans render.yaml: ${backendUrlFromConfig}`)
  } else {
    console.log('   ⚠️  URL non trouvée dans render.yaml (valeur générique peut-être)')
  }
} catch (err) {
  console.log(`   ❌ Erreur lecture render.yaml: ${err.message}`)
}

// 2. Lire vite.config.mts pour voir la configuration
console.log('\n📋 2. Lecture de vite.config.mts...')
try {
  const viteConfig = fs.readFileSync('packages/admin/dashboard/vite.config.mts', 'utf8')
  if (viteConfig.includes('VITE_MEDUSA_ADMIN_BACKEND_URL')) {
    console.log('   ✅ vite.config.mts utilise VITE_MEDUSA_ADMIN_BACKEND_URL')
  }
  if (viteConfig.includes('http://localhost:9000')) {
    console.log('   ⚠️  Fallback localhost configuré (normal si URL non définie)')
  }
} catch (err) {
  console.log(`   ❌ Erreur lecture vite.config.mts: ${err.message}`)
}

// 3. URLs possibles à tester
const urlsToTest = []

// URL depuis render.yaml
if (backendUrlFromConfig) {
  urlsToTest.push(backendUrlFromConfig)
}

// URLs génériques Render possibles
urlsToTest.push('https://medusa-backend.onrender.com')
urlsToTest.push('https://medusa-backend-1.onrender.com')
urlsToTest.push('https://medusa-backend-2.onrender.com')

// URLs communes
urlsToTest.push('http://localhost:9000')

// Fonction pour tester une URL
function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const client = urlObj.protocol === 'https:' ? https : http
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + '/health',
        method: 'GET',
        timeout: 5000,
      }

      const req = client.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve({
              url,
              status: res.statusCode,
              data: json,
              success: res.statusCode === 200,
              accessible: true
            })
          } catch (e) {
            resolve({
              url,
              status: res.statusCode,
              data: data,
              success: res.statusCode === 200,
              accessible: true
            })
          }
        })
      })

      req.on('error', (error) => {
        resolve({
          url,
          accessible: false,
          error: error.message
        })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({
          url,
          accessible: false,
          error: 'Timeout'
        })
      })

      req.end()
    } catch (err) {
      resolve({
        url,
        accessible: false,
        error: err.message
      })
    }
  })
}

// 4. Tester toutes les URLs
console.log('\n📋 3. Test de connexion aux backends possibles...\n')

const uniqueUrls = [...new Set(urlsToTest)]
const results = []

async function testAllUrls() {
  for (const url of uniqueUrls) {
    process.stdout.write(`   Test: ${url}... `)
    const result = await testUrl(url)
    results.push(result)
    
    if (result.accessible && result.success) {
      console.log(`✅ ACCESSIBLE - Status: ${result.status}`)
      if (result.data && result.data.status) {
        console.log(`      Réponse: ${JSON.stringify(result.data)}`)
      }
    } else if (result.accessible) {
      console.log(`⚠️  Répond mais status: ${result.status}`)
    } else {
      console.log(`❌ Non accessible - ${result.error || 'Erreur inconnue'}`)
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 RÉSUMÉ\n')
  
  const accessibleBackends = results.filter(r => r.accessible && r.success)
  
  if (accessibleBackends.length > 0) {
    console.log('✅ BACKENDS ACCESSIBLES TROUVÉS:')
    accessibleBackends.forEach(r => {
      console.log(`   ✅ ${r.url}`)
      console.log(`      Status: ${r.status}`)
      if (r.data) {
        console.log(`      Réponse: ${JSON.stringify(r.data)}`)
      }
    })
    
    console.log('\n🔧 ACTION REQUISE:')
    console.log(`   1. Utilisez cette URL: ${accessibleBackends[0].url}`)
    console.log('   2. Configurez VITE_MEDUSA_ADMIN_BACKEND_URL dans Render')
    console.log('   3. Redéployez le frontend')
  } else {
    console.log('❌ AUCUN BACKEND ACCESSIBLE TROUVÉ\n')
    console.log('🔧 ACTIONS REQUISES:')
    console.log('   1. Le backend n\'est probablement pas encore déployé sur Render')
    console.log('   2. Déployez via Blueprint sur Render Dashboard')
    console.log('   3. Attendez 15-20 minutes pour le build')
    console.log('   4. Relancez ce script pour vérifier')
  }
  
  // Vérifier la configuration
  console.log('\n📋 CONFIGURATION ACTUELLE:')
  if (backendUrlFromConfig) {
    console.log(`   URL dans render.yaml: ${backendUrlFromConfig}`)
    const configResult = results.find(r => r.url === backendUrlFromConfig)
    if (configResult && configResult.accessible) {
      console.log('   ✅ Cette URL est accessible!')
    } else {
      console.log('   ⚠️  Cette URL n\'est pas accessible (backend peut-être pas déployé)')
    }
  } else {
    console.log('   ⚠️  URL générique dans render.yaml (à remplacer après déploiement)')
  }
}

testAllUrls().catch(console.error)

