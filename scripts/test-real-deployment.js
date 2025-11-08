/**
 * Test réel du déploiement - Simule un utilisateur réel
 */

const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testDeployment() {
  console.log('\n🧪 TEST RÉEL DU DÉPLOIEMENT\n');
  console.log('='.repeat(60));
  
  const errors = [];
  const successes = [];
  
  // Test 1: Backend Health
  console.log('\n1️⃣ Test Backend Health...');
  try {
    const result = await makeRequest('https://medusa-backend.gfiyfougiug.workers.dev/health');
    if (result.status === 200) {
      console.log('✅ Backend Health: OK');
      successes.push('Backend Health');
    } else {
      console.log(`❌ Backend Health: Status ${result.status}`);
      errors.push(`Backend Health: Status ${result.status}`);
    }
  } catch (e) {
    console.log(`❌ Backend Health: ${e.message}`);
    errors.push(`Backend Health: ${e.message}`);
  }
  
  // Test 2: Auth Register
  console.log('\n2️⃣ Test Auth Register...');
  try {
    const testEmail = `test_${Date.now()}@test.com`;
    const result = await makeRequest('https://medusa-auth.gfiyfougiug.workers.dev/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'Test123!',
        name: 'Test User'
      }
    });
    if (result.status === 201 && result.data.success && result.data.token) {
      console.log('✅ Auth Register: OK');
      console.log(`   Token reçu: ${result.data.token.substring(0, 20)}...`);
      successes.push('Auth Register');
      
      // Test avec le token
      console.log('\n3️⃣ Test Auth Me avec token...');
      const meResult = await makeRequest('https://medusa-auth.gfiyfougiug.workers.dev/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.data.token}`
        }
      });
      if (meResult.status === 200 && meResult.data.user) {
        console.log('✅ Auth Me: OK');
        console.log(`   User: ${meResult.data.user.email}`);
        successes.push('Auth Me');
      } else {
        console.log(`❌ Auth Me: Status ${meResult.status}`);
        errors.push(`Auth Me: Status ${meResult.status}`);
      }
    } else {
      console.log(`❌ Auth Register: Status ${result.status}`);
      console.log(`   Response:`, JSON.stringify(result.data, null, 2));
      errors.push(`Auth Register: Status ${result.status}`);
    }
  } catch (e) {
    console.log(`❌ Auth Register: ${e.message}`);
    errors.push(`Auth Register: ${e.message}`);
  }
  
  // Test 3: Backend Orders
  console.log('\n4️⃣ Test Backend Orders...');
  try {
    const result = await makeRequest('https://medusa-backend.gfiyfougiug.workers.dev/admin/orders');
    if (result.status === 200 && result.data.orders !== undefined) {
      console.log('✅ Backend Orders: OK');
      console.log(`   Orders count: ${result.data.count}`);
      successes.push('Backend Orders');
    } else {
      console.log(`❌ Backend Orders: Status ${result.status}`);
      console.log(`   Response:`, JSON.stringify(result.data, null, 2));
      errors.push(`Backend Orders: Status ${result.status}`);
    }
  } catch (e) {
    console.log(`❌ Backend Orders: ${e.message}`);
    errors.push(`Backend Orders: ${e.message}`);
  }
  
  // Test 4: Backend Products
  console.log('\n5️⃣ Test Backend Products...');
  try {
    const result = await makeRequest('https://medusa-backend.gfiyfougiug.workers.dev/admin/products');
    if (result.status === 200 && result.data.products !== undefined) {
      console.log('✅ Backend Products: OK');
      console.log(`   Products count: ${result.data.count}`);
      successes.push('Backend Products');
    } else {
      console.log(`❌ Backend Products: Status ${result.status}`);
      errors.push(`Backend Products: Status ${result.status}`);
    }
  } catch (e) {
    console.log(`❌ Backend Products: ${e.message}`);
    errors.push(`Backend Products: ${e.message}`);
  }
  
  // Test 5: Frontend Access
  console.log('\n6️⃣ Test Frontend Access...');
  try {
    const result = await makeRequest('https://3d7b9da1.medusa-admin-ui.pages.dev');
    if (result.status === 200) {
      console.log('✅ Frontend Access: OK');
      successes.push('Frontend Access');
    } else {
      console.log(`❌ Frontend Access: Status ${result.status}`);
      errors.push(`Frontend Access: Status ${result.status}`);
    }
  } catch (e) {
    console.log(`❌ Frontend Access: ${e.message}`);
    errors.push(`Frontend Access: ${e.message}`);
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RÉSUMÉ DES TESTS\n');
  console.log(`✅ Succès: ${successes.length}`);
  console.log(`❌ Erreurs: ${errors.length}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERREURS DÉTECTÉES:');
    errors.forEach(err => console.log(`   - ${err}`));
    console.log('\n');
    process.exit(1);
  } else {
    console.log('✅ TOUS LES TESTS SONT PASSÉS!\n');
    process.exit(0);
  }
}

testDeployment().catch(e => {
  console.error('❌ Erreur fatale:', e);
  process.exit(1);
});

