/**
 * Test rapide pour identifier les problèmes
 */

const https = require('https');

function test(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, data: data.substring(0, 200) });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function main() {
  console.log('🔍 Test rapide des endpoints...\n');
  
  const tests = [
    { name: 'Backend Health', url: 'https://medusa-backend.gfiyfougiug.workers.dev/health' },
    { name: 'Backend Orders', url: 'https://medusa-backend.gfiyfougiug.workers.dev/admin/orders' },
    { name: 'Auth API', url: 'https://medusa-auth.gfiyfougiug.workers.dev/auth/register' },
    { name: 'Frontend', url: 'https://3d7b9da1.medusa-admin-ui.pages.dev' },
  ];
  
  for (const t of tests) {
    try {
      const result = await test(t.url);
      if (result.status === 200 || result.status === 201 || result.status === 404) {
        console.log(`✅ ${t.name}: ${result.status}`);
      } else {
        console.log(`❌ ${t.name}: ${result.status}`);
      }
    } catch (e) {
      console.log(`❌ ${t.name}: ${e.message}`);
    }
  }
  
  // Test inscription
  console.log('\n🔍 Test inscription...');
  try {
    const testEmail = `test_${Date.now()}@test.com`;
    const body = JSON.stringify({
      email: testEmail,
      password: 'Test123!',
      name: 'Test'
    });
    
    const req = https.request('https://medusa-auth.gfiyfougiug.workers.dev/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.success && json.token) {
          console.log('✅ Inscription: OK');
          console.log(`   Token: ${json.token.substring(0, 30)}...`);
        } else {
          console.log('❌ Inscription: Échec');
          console.log(`   Response: ${data.substring(0, 200)}`);
        }
      });
    });
    req.on('error', e => console.log(`❌ Inscription: ${e.message}`));
    req.write(body);
    req.end();
    
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log(`❌ Inscription: ${e.message}`);
  }
  
  console.log('\n✅ Tests terminés');
}

main();

