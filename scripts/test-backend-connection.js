#!/usr/bin/env node

/**
 * Script pour tester la connexion au backend Medusa
 */

const BACKEND_URL = process.env.VITE_MEDUSA_ADMIN_BACKEND_URL || 
                   process.env.VITE_MEDUSA_BACKEND_URL || 
                   "http://localhost:9000"

console.log(`🔍 Test de connexion au backend: ${BACKEND_URL}\n`)

async function testConnection() {
  const endpoints = [
    '/health',
    '/admin/auth',
    '/admin/store',
  ]
  
  for (const endpoint of endpoints) {
    try {
      const url = `${BACKEND_URL}${endpoint}`
      console.log(`Testing: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const status = response.status
      const data = await response.json().catch(() => ({ message: 'No JSON response' }))
      
      if (status >= 200 && status < 300) {
        console.log(`  ✅ ${endpoint} - Status: ${status}`)
      } else {
        console.log(`  ⚠️  ${endpoint} - Status: ${status}`)
        console.log(`     Response:`, JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint} - Error: ${error.message}`)
    }
    console.log('')
  }
}

testConnection().catch(console.error)

