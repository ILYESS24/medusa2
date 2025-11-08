/**
 * Script de simulation et test du système d'authentification
 * Teste toutes les fonctionnalités : register, login, logout, getCurrentUser
 */

const AUTH_API_URL = 'https://medusa-auth.gfiyfougiug.workers.dev';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRegister() {
  log('\n=== Test d\'inscription ===', 'blue');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  try {
    const response = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✓ Inscription réussie pour ${testEmail}`, 'green');
      log(`  Token reçu: ${data.token.substring(0, 20)}...`, 'yellow');
      return { success: true, token: data.token, email: testEmail, password: testPassword };
    } else {
      log(`✗ Échec de l'inscription: ${data.error}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`✗ Erreur lors de l'inscription: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  log('\n=== Test de connexion ===', 'blue');
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✓ Connexion réussie pour ${email}`, 'green');
      log(`  Token reçu: ${data.token.substring(0, 20)}...`, 'yellow');
      return { success: true, token: data.token };
    } else {
      log(`✗ Échec de la connexion: ${data.error}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`✗ Erreur lors de la connexion: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testGetMe(token) {
  log('\n=== Test de vérification de session ===', 'blue');
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✓ Session valide pour ${data.user.email}`, 'green');
      log(`  User ID: ${data.user.id}`, 'yellow');
      log(`  Name: ${data.user.name}`, 'yellow');
      return { success: true, user: data.user };
    } else {
      log(`✗ Session invalide: ${data.error}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`✗ Erreur lors de la vérification: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLogout(token) {
  log('\n=== Test de déconnexion ===', 'blue');
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✓ Déconnexion réussie`, 'green');
      return { success: true };
    } else {
      log(`✗ Échec de la déconnexion: ${data.error}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`✗ Erreur lors de la déconnexion: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testInvalidToken() {
  log('\n=== Test avec token invalide ===', 'blue');
  const invalidToken = 'invalid_token_12345';
  const result = await testGetMe(invalidToken);
  if (!result.success) {
    log(`✓ Token invalide correctement rejeté`, 'green');
  } else {
    log(`✗ ERREUR: Token invalide accepté!`, 'red');
  }
  return result;
}

async function testDuplicateEmail() {
  log('\n=== Test d\'inscription avec email existant ===', 'blue');
  const testEmail = `duplicate_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // Première inscription
  const first = await testRegister();
  if (!first.success) {
    return first;
  }

  // Tentative de deuxième inscription avec le même email
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: first.email,
        password: testPassword,
        name: 'Duplicate User',
      }),
    });

    const data = await response.json();

    if (!response.ok && data.error && data.error.includes('déjà utilisé')) {
      log(`✓ Email dupliqué correctement rejeté`, 'green');
      return { success: true };
    } else {
      log(`✗ ERREUR: Email dupliqué accepté!`, 'red');
      return { success: false, error: 'Email dupliqué accepté' };
    }
  } catch (error) {
    log(`✗ Erreur: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║  Tests de simulation du système d\'authentification   ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const results = {
    register: false,
    login: false,
    getMe: false,
    logout: false,
    invalidToken: false,
    duplicateEmail: false,
  };

  // Test 1: Inscription
  const registerResult = await testRegister();
  results.register = registerResult.success;

  if (!registerResult.success) {
    log('\n✗ Les tests s\'arrêtent ici car l\'inscription a échoué', 'red');
    return results;
  }

  // Test 2: Connexion
  const loginResult = await testLogin(registerResult.email, registerResult.password);
  results.login = loginResult.success;

  if (!loginResult.success) {
    log('\n⚠ Connexion échouée, mais on continue les tests...', 'yellow');
  }

  // Test 3: Vérification de session
  if (loginResult.token) {
    const meResult = await testGetMe(loginResult.token);
    results.getMe = meResult.success;
  }

  // Test 4: Token invalide
  const invalidResult = await testInvalidToken();
  results.invalidToken = !invalidResult.success; // On veut que ça échoue

  // Test 5: Email dupliqué
  const duplicateResult = await testDuplicateEmail();
  results.duplicateEmail = duplicateResult.success;

  // Test 6: Déconnexion
  if (loginResult.token) {
    const logoutResult = await testLogout(loginResult.token);
    results.logout = logoutResult.success;
  }

  // Résumé
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║                    RÉSUMÉ DES TESTS                    ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;

  log(`\nTests réussis: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`  ${test}: ${passed ? '✓' : '✗'}`, passed ? 'green' : 'red');
  });

  if (passedTests === totalTests) {
    log('\n✓ Tous les tests sont passés avec succès!', 'green');
  } else {
    log('\n⚠ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow');
  }

  return results;
}

// Exécuter les tests
runAllTests()
  .then((results) => {
    const exitCode = Object.values(results).every(r => r) ? 0 : 1;
    process.exit(exitCode);
  })
  .catch((error) => {
    log(`\n✗ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

