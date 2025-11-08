/**
 * Script pour exécuter les tests Playwright sur l'application déployée
 */

const { execSync } = require("child_process");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log("\n╔════════════════════════════════════════════════════════╗", "magenta");
  log("║   Tests Playwright - Simulation Utilisateur Réel      ║", "magenta");
  log("╚════════════════════════════════════════════════════════╝", "magenta");

  const dashboardPath = path.join(__dirname, "..", "packages", "admin", "dashboard");

  log("\n📋 Configuration:", "cyan");
  log(`   URL de test: https://e90baa5f.medusa-admin-ui.pages.dev`, "yellow");
  log(`   API Auth: https://medusa-auth.gfiyfougiug.workers.dev`, "yellow");

  // Vérifier que Playwright est installé
  try {
    execSync("npx playwright --version", { cwd: dashboardPath, stdio: "pipe" });
  } catch (e) {
    log("\n📦 Installation de Playwright...", "cyan");
    execSync("yarn install", { cwd: dashboardPath, stdio: "inherit" });
    log("\n🌐 Installation de Chromium...", "cyan");
    execSync("npx playwright install chromium", { cwd: dashboardPath, stdio: "inherit" });
  }

  log("\n🧪 Exécution des tests sur l'application déployée...", "cyan");
  log("   (Simulation d'un utilisateur réel)", "yellow");

  try {
    execSync("npx playwright test e2e/production-test.spec.ts --reporter=list,html", {
      cwd: dashboardPath,
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: "https://e90baa5f.medusa-admin-ui.pages.dev",
      },
    });

    log("\n✅ Tests terminés!", "green");
    log("\n📊 Pour voir le rapport HTML:", "cyan");
    log("   cd packages/admin/dashboard", "yellow");
    log("   npx playwright show-report", "yellow");
  } catch (error) {
    log("\n⚠ Des erreurs ont été détectées lors des tests", "yellow");
    log("\n📋 Pour analyser les erreurs:", "cyan");
    log("   1. cd packages/admin/dashboard", "yellow");
    log("   2. npx playwright show-report", "yellow");
    log("   3. Vérifiez les screenshots dans test-results/", "yellow");
    return false;
  }

  return true;
}

main()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Erreur: ${error.message}`, "red");
    process.exit(1);
  });

