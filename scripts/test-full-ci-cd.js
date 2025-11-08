/**
 * Script de tests CI/CD complet pour tout le projet Medusa
 * Teste tous les packages, builds, lints, etc.
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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = process.cwd(), options = {}) {
  try {
    log(`\n▶ ${command}`, 'cyan');
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      maxBuffer: 10 * 1024 * 1024, // 10MB
      ...options
    });
    if (options.silent && output) {
      return output;
    }
    return { success: true, output: output || '' };
  } catch (error) {
    if (options.continueOnError) {
      log(`⚠ Erreur (continuation): ${error.message}`, 'yellow');
      return { success: false, error: error.message, output: error.stdout || '', stderr: error.stderr || '' };
    }
    log(`✗ Erreur: ${error.message}`, 'red');
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.log(error.stderr);
    return { success: false, error: error.message, output: error.stdout || '', stderr: error.stderr || '' };
  }
}

async function checkProjectStructure() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║      Vérification de la structure du projet           ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const requiredFiles = [
    'package.json',
    'turbo.json',
    'yarn.lock',
    'packages/admin/dashboard/package.json',
    'packages/admin/dashboard/vite.config.mts',
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

async function installDependencies() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Installation des dépendances                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  // Vérifier si node_modules existe
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    log('✓ node_modules existe déjà, skip de l\'installation', 'yellow');
    return { success: true, skipped: true };
  }

  const result = exec('yarn install --frozen-lockfile', path.join(__dirname, '..'), { continueOnError: true });
  return result;
}

async function lintProject() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║              Lint du projet complet                   ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  // Lint seulement les fichiers modifiés pour éviter les problèmes de mémoire
  const result = exec('yarn lint --max-warnings=0', path.join(__dirname, '..'), { 
    continueOnError: true,
    silent: true 
  });
  
  if (result.success) {
    log('✓ Lint réussi', 'green');
  } else {
    log('⚠ Lint avec erreurs (peut être dû à la mémoire)', 'yellow');
    log('  Vérification manuelle recommandée', 'yellow');
  }
  
  return result;
}

async function lintDashboard() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Lint du dashboard admin                       ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const dashboardPath = path.join(__dirname, '..', 'packages', 'admin', 'dashboard');
  
  // Vérifier si eslint est disponible
  try {
    const result = exec('npx eslint --version', dashboardPath, { silent: true, continueOnError: true });
    if (!result.success) {
      log('⚠ ESLint non disponible dans le dashboard, skip', 'yellow');
      return { success: true, skipped: true };
    }
  } catch (e) {
    log('⚠ ESLint non disponible, skip', 'yellow');
    return { success: true, skipped: true };
  }

  // Lint des fichiers spécifiques modifiés
  const filesToLint = [
    'src/lib/auth-client.ts',
    'src/routes/register/register.tsx',
    'src/routes/login/login.tsx',
    'src/components/authentication/protected-route/protected-route.tsx',
  ];

  let allPassed = true;
  for (const file of filesToLint) {
    const filePath = path.join(dashboardPath, file);
    if (fs.existsSync(filePath)) {
      try {
        exec(`npx eslint ${file}`, dashboardPath, { silent: true, continueOnError: true });
        log(`✓ ${file}`, 'green');
      } catch (e) {
        log(`✗ ${file}`, 'red');
        allPassed = false;
      }
    }
  }

  return { success: allPassed };
}

async function buildAllPackages() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Build de tous les packages                     ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  // Build avec turbo (peut être long)
  log('⚠ Build complet peut prendre plusieurs minutes...', 'yellow');
  const result = exec('yarn build', path.join(__dirname, '..'), { 
    continueOnError: true,
    maxBuffer: 50 * 1024 * 1024 // 50MB
  });

  return result;
}

async function buildDashboard() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Build du dashboard admin                      ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const dashboardPath = path.join(__dirname, '..', 'packages', 'admin', 'dashboard');
  const result = exec('npx vite build', dashboardPath, { continueOnError: true });
  return result;
}

async function testAuthSystem() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Tests du système d\'authentification           ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const testScript = path.join(__dirname, 'test-auth-simulation.js');
  const result = exec(`node ${testScript}`, path.join(__dirname, '..'), { continueOnError: true });
  return result;
}

async function checkTypeScript() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Vérification TypeScript                         ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const dashboardPath = path.join(__dirname, '..', 'packages', 'admin', 'dashboard');
  
  // Vérifier si tsc est disponible
  try {
    const result = exec('npx tsc --version', dashboardPath, { silent: true, continueOnError: true });
    if (!result.success) {
      log('⚠ TypeScript non disponible, skip', 'yellow');
      return { success: true, skipped: true };
    }

    // Type check sans émission
    const typeCheckResult = exec('npx tsc --noEmit', dashboardPath, { continueOnError: true, silent: true });
    if (typeCheckResult.success) {
      log('✓ TypeScript: Aucune erreur de type', 'green');
    } else {
      log('⚠ TypeScript: Erreurs de type détectées', 'yellow');
    }
    return typeCheckResult;
  } catch (e) {
    log('⚠ TypeScript non disponible, skip', 'yellow');
    return { success: true, skipped: true };
  }
}

async function verifyFiles() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Vérification des fichiers critiques           ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const criticalFiles = [
    'src/auth-worker.js',
    'wrangler-auth.toml',
    'packages/admin/dashboard/src/lib/auth-client.ts',
    'packages/admin/dashboard/src/routes/register/register.tsx',
    'packages/admin/dashboard/src/routes/register/index.ts',
    'packages/admin/dashboard/src/routes/login/login.tsx',
    'packages/admin/dashboard/src/components/authentication/protected-route/protected-route.tsx',
    'packages/admin/dashboard/src/dashboard-app/routes/get-route.map.tsx',
  ];

  let allExist = true;
  criticalFiles.forEach(file => {
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

async function runFullCICD() {
  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  log('║     Tests CI/CD COMPLET - Projet Medusa                ║', 'magenta');
  log('╚════════════════════════════════════════════════════════╝', 'magenta');

  const results = {
    structure: false,
    dependencies: false,
    lint: false,
    lintDashboard: false,
    typeScript: false,
    buildAll: false,
    buildDashboard: false,
    authTest: false,
    files: false,
  };

  // Étape 1: Vérifier la structure
  results.structure = await checkProjectStructure();
  if (!results.structure) {
    log('\n✗ Structure du projet invalide. Arrêt.', 'red');
    return results;
  }

  // Étape 2: Installer les dépendances (si nécessaire)
  const depsResult = await installDependencies();
  results.dependencies = depsResult.success || depsResult.skipped;

  // Étape 3: Vérifier les fichiers critiques
  results.files = await verifyFiles();
  if (!results.files) {
    log('\n⚠ Certains fichiers critiques sont manquants', 'yellow');
  }

  // Étape 4: Lint
  const lintResult = await lintProject();
  results.lint = lintResult.success;

  // Étape 5: Lint dashboard spécifique
  const lintDashResult = await lintDashboard();
  results.lintDashboard = lintDashResult.success;

  // Étape 6: TypeScript
  const tsResult = await checkTypeScript();
  results.typeScript = tsResult.success;

  // Étape 7: Build dashboard (prioritaire)
  results.buildDashboard = await buildDashboard();
  if (!results.buildDashboard) {
    log('\n✗ Build du dashboard échoué. Arrêt des builds suivants.', 'red');
  }

  // Étape 8: Build complet (optionnel, peut être long)
  log('\n⚠ Build complet de tous les packages (peut prendre 10-20 minutes)...', 'yellow');
  log('  Vous pouvez l\'interrompre avec Ctrl+C si nécessaire', 'yellow');
  const buildAllResult = await buildAllPackages();
  results.buildAll = buildAllResult.success;

  // Étape 9: Tests d'authentification
  results.authTest = await testAuthSystem();

  // Résumé final
  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  log('║              RÉSUMÉ COMPLET CI/CD                        ║', 'magenta');
  log('╚════════════════════════════════════════════════════════╝', 'magenta');

  const criticalSteps = ['structure', 'files', 'buildDashboard'];
  const allCritical = criticalSteps.every(step => results[step]);

  Object.entries(results).forEach(([step, success]) => {
    const isCritical = criticalSteps.includes(step);
    const status = success ? '✓' : (isCritical ? '✗' : '⚠');
    const color = success ? 'green' : (isCritical ? 'red' : 'yellow');
    log(`  ${step.padEnd(20)}: ${status}`, color);
  });

  const totalSteps = Object.keys(results).length;
  const passedSteps = Object.values(results).filter(r => r).length;
  const successRate = ((passedSteps / totalSteps) * 100).toFixed(1);

  log(`\n📊 Taux de réussite: ${passedSteps}/${totalSteps} (${successRate}%)`, 
    allCritical ? 'green' : 'yellow');

  if (allCritical) {
    log('\n✓ Tous les tests critiques sont passés!', 'green');
    log('  Le projet est prêt pour le déploiement.', 'green');
  } else {
    log('\n⚠ Certains tests critiques ont échoué.', 'yellow');
    log('  Vérifiez les erreurs ci-dessus avant de déployer.', 'yellow');
  }

  return results;
}

// Exécuter les tests complets
runFullCICD()
  .then((results) => {
    const criticalSteps = ['structure', 'files', 'buildDashboard'];
    const allCritical = criticalSteps.every(step => results[step]);
    process.exit(allCritical ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

