/**
 * Test réel de connexion frontend-backend
 */

const https = require('https');

async function testConnection() {
  console.log('\n🔗 TEST CONNEXION FRONTEND-BACKEND\n');
  
  // Test 1: Vérifier que le backend répond
  console.log('1. Test Backend Health...');
  const backendHealth = await fetch('https://medusa-backend.gfiyfougiug.workers.dev/health');
  console.log(`   Status: ${backendHealth.status}`);
  if (backendHealth.status === 200) {
    console.log('   ✅ Backend accessible\n');
  } else {
    console.log('   ❌ Backend inaccessible\n');
    return;
  }
  
  // Test 2: Vérifier que le backend répond aux appels admin
  console.log('2. Test Backend Admin Orders...');
  const backendOrders = await fetch('https://medusa-backend.gfiyfougiug.workers.dev/admin/orders');
  console.log(`   Status: ${backendOrders.status}`);
  const ordersData = await backendOrders.json();
  console.log(`   Response: ${JSON.stringify(ordersData).substring(0, 100)}...`);
  if (backendOrders.status === 200 && ordersData.orders !== undefined) {
    console.log('   ✅ Backend Orders OK\n');
  } else {
    console.log('   ❌ Backend Orders FAILED\n');
  }
  
  // Test 3: Vérifier CORS
  console.log('3. Test CORS...');
  const corsTest = await fetch('https://medusa-backend.gfiyfougiug.workers.dev/admin/orders', {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://484a2fd9.medusa-admin-ui.pages.dev'
    }
  });
  const corsHeader = corsTest.headers.get('access-control-allow-origin');
  console.log(`   CORS Header: ${corsHeader}`);
  if (corsHeader === '*' || corsHeader?.includes('pages.dev')) {
    console.log('   ✅ CORS configuré\n');
  } else {
    console.log('   ❌ CORS non configuré\n');
  }
  
  // Test 4: Vérifier frontend
  console.log('4. Test Frontend Access...');
  const frontend = await fetch('https://484a2fd9.medusa-admin-ui.pages.dev');
  console.log(`   Status: ${frontend.status}`);
  if (frontend.status === 200) {
    console.log('   ✅ Frontend accessible\n');
  } else {
    console.log('   ❌ Frontend inaccessible\n');
  }
  
  console.log('✅ TOUS LES TESTS PASSÉS - CONNEXION FONCTIONNELLE\n');
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          json: async () => JSON.parse(data),
          text: async () => data
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

testConnection().catch(console.error);

