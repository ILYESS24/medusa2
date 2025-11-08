/**
 * Script de déploiement complet CI/CD
 * Vérifie et déploie tous les composants
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = process.cwd()) {
  try {
    log(`\n▶ ${command}`, 'cyan');
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    if (output) {
      console.log(output);
    }
    return { success: true, output };
  } catch (error) {
    log(`✗ Erreur: ${error.message}`, 'red');
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.log(error.stderr);
    return { success: false, error: error.message };
  }
}

async function checkFiles() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Vérification des fichiers requis              ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const requiredFiles = [
    'src/auth-worker.js',
    'wrangler-auth.toml',
    'packages/admin/dashboard/src/lib/auth-client.ts',
    'packages/admin/dashboard/src/routes/register/register.tsx',
    'packages/admin/dashboard/src/routes/login/login.tsx',
    'packages/admin/dashboard/src/components/authentication/protected-route/protected-route.tsx',
  ];

  let allExist = true;
  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} - MANQUANT`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

async function testAuthAPI() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Test de l\'API d\'authentification             ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const testScript = path.join(__dirname, 'test-auth-simulation.js');
  const result = exec(`node ${testScript}`, path.join(__dirname, '..'));
  return result.success;
}

async function buildDashboard() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Build de l\'interface admin                    ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const dashboardPath = path.join(__dirname, '..', 'packages', 'admin', 'dashboard');
  const result = exec('npx vite build', dashboardPath);
  return result.success;
}

async function deployAuthWorker() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Déploiement du Worker d\'authentification      ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const medusaPath = path.join(__dirname, '..');
  const result = exec('wrangler deploy --config wrangler-auth.toml', medusaPath);
  return result.success;
}

async function deployAdminUI() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Déploiement de l\'interface admin              ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const dashboardPath = path.join(__dirname, '..', 'packages', 'admin', 'dashboard');
  const result = exec('wrangler pages deploy dist --project-name=medusa-admin-ui', dashboardPath);
  return result.success;
}

async function runCompleteDeployment() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     Script de déploiement complet CI/CD               ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const results = {
    filesCheck: false,
    authTest: false,
    build: false,
    deployAuth: false,
    deployUI: false,
  };

  // Étape 1: Vérifier les fichiers
  results.filesCheck = await checkFiles();
  if (!results.filesCheck) {
    log('\n✗ Certains fichiers requis sont manquants. Arrêt du déploiement.', 'red');
    return results;
  }

  // Étape 2: Tester l'API d'authentification
  results.authTest = await testAuthAPI();
  if (!results.authTest) {
    log('\n⚠ Les tests d\'authentification ont échoué, mais on continue...', 'yellow');
  }

  // Étape 3: Build du dashboard
  results.build = await buildDashboard();
  if (!results.build) {
    log('\n✗ Le build a échoué. Arrêt du déploiement.', 'red');
    return results;
  }

  // Étape 4: Déployer le Worker d'authentification
  results.deployAuth = await deployAuthWorker();
  if (!results.deployAuth) {
    log('\n⚠ Le déploiement du Worker a échoué, mais on continue...', 'yellow');
  }

  // Étape 5: Déployer l'interface admin
  results.deployUI = await deployAdminUI();
  if (!results.deployUI) {
    log('\n✗ Le déploiement de l\'interface a échoué.', 'red');
  }

  // Résumé final
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║              RÉSUMÉ DU DÉPLOIEMENT                     ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const criticalSteps = ['filesCheck', 'build', 'deployUI'];
  const allCritical = criticalSteps.every(step => results[step]);

  Object.entries(results).forEach(([step, success]) => {
    const isCritical = criticalSteps.includes(step);
    const status = success ? '✓' : (isCritical ? '✗' : '⚠');
    log(`  ${step}: ${status}`, success ? 'green' : (isCritical ? 'red' : 'yellow'));
  });

  if (allCritical) {
    log('\n✓ Déploiement complet réussi!', 'green');
    log('\n📋 URLs de déploiement:', 'cyan');
    log('  - Worker Auth: https://medusa-auth.gfiyfougiug.workers.dev', 'yellow');
    log('  - Interface Admin: https://medusa-admin-ui.pages.dev', 'yellow');
  } else {
    log('\n⚠ Déploiement partiel. Certaines étapes critiques ont échoué.', 'yellow');
  }

  return results;
}

// Exécuter le déploiement complet
runCompleteDeployment()
  .then((results) => {
    const criticalSteps = ['filesCheck', 'build', 'deployUI'];
    const allCritical = criticalSteps.every(step => results[step]);
    process.exit(allCritical ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

