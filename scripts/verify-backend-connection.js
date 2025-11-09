#!/usr/bin/env node

/**
 * Script pour vérifier la connexion au backend Medusa
 * Utilisez ce script pour diagnostiquer les problèmes de connexion
 */

const https = require('https')
const http = require('http')

const BACKEND_URL = process.env.VITE_MEDUSA_ADMIN_BACKEND_URL || 
                    process.env.MEDUSA_BACKEND_URL || 
                    'http://localhost:9000'

console.log('🔍 Vérification de la connexion au backend Medusa\n')
console.log(`URL du backend: ${BACKEND_URL}\n`)

// Fonction pour tester une URL
function testUrl(url) {
  return new Promise((resolve, reject) => {
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
            status: res.statusCode,
            data: json,
            success: res.statusCode === 200
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            success: res.statusCode === 200
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout'))
    })

    req.end()
  })
}

// Tester la connexion
testUrl(BACKEND_URL)
  .then((result) => {
    if (result.success) {
      console.log('✅ Backend accessible!')
      console.log(`   Status: ${result.status}`)
      console.log(`   Réponse:`, result.data)
      console.log('\n✅ La connexion fonctionne correctement!')
      process.exit(0)
    } else {
      console.log('⚠️  Backend répond mais avec un statut non-200')
      console.log(`   Status: ${result.status}`)
      console.log(`   Réponse:`, result.data)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.log('❌ Impossible de se connecter au backend')
    console.log(`   Erreur: ${error.message}`)
    console.log('\n🔧 Vérifications à faire:')
    console.log('   1. Le backend est-il démarré?')
    console.log('   2. L\'URL est-elle correcte?')
    console.log('   3. Y a-t-il un problème de réseau/firewall?')
    console.log('   4. Le backend écoute-t-il sur le bon port?')
    process.exit(1)
  })

