/**
 * Script pour exécuter les tests Playwright et identifier les erreurs
 * Simule l'utilisation réelle de la plateforme
 */

const { spawn } = require("child_process");
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

async function runPlaywrightTests() {
  log("\n╔════════════════════════════════════════════════════════╗", "magenta");
  log("║     Tests Playwright - Simulation Utilisateur          ║", "magenta");
  log("╚════════════════════════════════════════════════════════╝", "magenta");

  const dashboardPath = path.join(__dirname, "..", "packages", "admin", "dashboard");

  // Vérifier que Playwright est installé
  try {
    execSync("npx playwright --version", { cwd: dashboardPath, stdio: "pipe" });
  } catch (e) {
    log("\n📦 Installation de Playwright...", "cyan");
    execSync("yarn install", { cwd: dashboardPath, stdio: "inherit" });
    log("\n🌐 Installation des navigateurs...", "cyan");
    execSync("npx playwright install chromium", { cwd: dashboardPath, stdio: "inherit" });
  }

  log("\n🧪 Exécution des tests E2E...", "cyan");
  log("  (Les tests simulent un utilisateur réel)", "yellow");

  try {
    // Exécuter les tests basiques d'abord
    log("\n▶ Test 1: Tests basiques...", "cyan");
    execSync("npx playwright test e2e/basic-flow.spec.ts --reporter=list", {
      cwd: dashboardPath,
      stdio: "inherit",
      env: { ...process.env, PLAYWRIGHT_BASE_URL: "https://e90baa5f.medusa-admin-ui.pages.dev" },
    });

    log("\n✅ Tests basiques terminés", "green");
  } catch (error) {
    log("\n⚠ Certains tests ont échoué", "yellow");
    log("\n📋 Pour voir les détails:", "cyan");
    log("   cd packages/admin/dashboard", "yellow");
    log("   npx playwright show-report", "yellow");
    return false;
  }

  return true;
}

runPlaywrightTests()
  .then((success) => {
    if (success) {
      log("\n✅ Tests terminés avec succès!", "green");
    } else {
      log("\n⚠ Des erreurs ont été détectées", "yellow");
      log("   Consultez le rapport Playwright pour plus de détails", "yellow");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Erreur fatale: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });

