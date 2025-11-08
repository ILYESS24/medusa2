/**
 * Script pour exécuter les tests Playwright et identifier les erreurs
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = process.cwd()) {
  try {
    log(`\n▶ ${command}`, "cyan");
    const output = execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: "inherit",
      maxBuffer: 10 * 1024 * 1024,
    });
    return { success: true, output: output || "" };
  } catch (error) {
    log(`✗ Erreur: ${error.message}`, "red");
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.log(error.stderr);
    return { success: false, error: error.message };
  }
}

async function installPlaywright() {
  log("\n╔════════════════════════════════════════════════════════╗", "blue");
  log("║         Installation de Playwright                     ║", "blue");
  log("╚════════════════════════════════════════════════════════╝", "blue");

  const dashboardPath = path.join(__dirname, "..", "packages", "admin", "dashboard");

  // Installer les dépendances
  log("\n📦 Installation des dépendances...", "cyan");
  const installResult = exec("yarn install", dashboardPath);
  if (!installResult.success) {
    log("⚠ Erreur lors de l'installation, mais on continue...", "yellow");
  }

  // Installer les navigateurs Playwright
  log("\n🌐 Installation des navigateurs Playwright...", "cyan");
  const browsersResult = exec("npx playwright install", dashboardPath);
  return browsersResult.success;
}

async function runTests() {
  log("\n╔════════════════════════════════════════════════════════╗", "blue");
  log("║         Exécution des tests Playwright                 ║", "blue");
  log("╚════════════════════════════════════════════════════════╝", "blue");

  const dashboardPath = path.join(__dirname, "..", "packages", "admin", "dashboard");

  // Exécuter les tests
  log("\n🧪 Exécution des tests E2E...", "cyan");
  log("  (Cela peut prendre plusieurs minutes)", "yellow");

  const testResult = exec("npx playwright test --reporter=list", dashboardPath);
  return testResult;
}

async function main() {
  log("\n╔════════════════════════════════════════════════════════╗", "magenta");
  log("║     Tests Playwright - Simulation Utilisateur          ║", "magenta");
  log("╚════════════════════════════════════════════════════════╝", "magenta");

  // Installer Playwright si nécessaire
  await installPlaywright();

  // Exécuter les tests
  const result = await runTests();

  // Résumé
  log("\n╔════════════════════════════════════════════════════════╗", "blue");
  log("║              RÉSUMÉ DES TESTS                          ║", "blue");
  log("╚════════════════════════════════════════════════════════╝", "blue");

  if (result.success) {
    log("\n✅ Tous les tests sont passés!", "green");
    log("\n📋 Pour voir le rapport HTML:", "cyan");
    log("   npx playwright show-report", "yellow");
  } else {
    log("\n⚠ Certains tests ont échoué", "yellow");
    log("\n📋 Pour voir le rapport HTML:", "cyan");
    log("   npx playwright show-report", "yellow");
    log("\n🔍 Vérifiez les screenshots et vidéos dans:", "cyan");
    log("   packages/admin/dashboard/test-results/", "yellow");
  }

  return result.success;
}

main()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Erreur fatale: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });

