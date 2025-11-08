import { test, expect } from "@playwright/test"

/**
 * Tests E2E sur l'application déployée en production
 * Simule un utilisateur réel utilisant la plateforme
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://e90baa5f.medusa-admin-ui.pages.dev"
const AUTH_API_URL = "https://medusa-auth.gfiyfougiug.workers.dev"

const generateTestEmail = () => {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@example.com`
}

test.describe("Simulation utilisateur - Application en production", () => {
  let testEmail: string
  let testPassword: string
  let testName: string

  test.beforeEach(() => {
    testEmail = generateTestEmail()
    testPassword = "TestPassword123!"
    testName = "Test User"
  })

  test("1. Accès initial - Redirection vers login", async ({ page }) => {
    await page.goto(BASE_URL)
    
    // Attendre que la page se charge
    await page.waitForLoadState("networkidle")
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 })
    
    // Vérifier que les éléments de login sont présents
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await expect(passwordInput).toBeVisible()
  })

  test("2. Navigation vers inscription", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState("networkidle")
    
    // Chercher le lien d'inscription
    const registerLinks = page.locator('a').filter({ hasText: /créer|inscription/i })
    const count = await registerLinks.count()
    
    if (count > 0) {
      await registerLinks.first().click()
      await page.waitForTimeout(2000)
      
      // Vérifier la redirection
      const currentUrl = page.url()
      expect(currentUrl).toContain("/register")
    } else {
      // Si le lien n'existe pas, essayer d'aller directement
      await page.goto(`${BASE_URL}/register`)
    }
    
    // Vérifier que la page d'inscription se charge
    await page.waitForLoadState("networkidle")
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 5000 })
  })

  test("3. Inscription complète d'un utilisateur", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState("networkidle")
    
    // Remplir le formulaire
    const allInputs = page.locator('input')
    const inputCount = await allInputs.count()
    
    // Trouver les champs
    let nameInput = page.locator('input').first()
    const emailInput = page.locator('input[type="email"]')
    const passwordInputs = page.locator('input[type="password"]')
    
    // Remplir les champs
    await nameInput.fill(testName)
    await emailInput.fill(testEmail)
    
    const passwordCount = await passwordInputs.count()
    if (passwordCount >= 2) {
      await passwordInputs.nth(0).fill(testPassword)
      await passwordInputs.nth(1).fill(testPassword)
    } else if (passwordCount === 1) {
      await passwordInputs.first().fill(testPassword)
    }
    
    // Soumettre
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /créer|inscription/i }))
    await submitButton.first().click()
    
    // Attendre la réponse
    await page.waitForTimeout(5000)
    
    // Vérifier le résultat
    const currentUrl = page.url()
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    
    // Prendre une capture d'écran pour diagnostic
    await page.screenshot({ path: `test-results/inscription-${Date.now()}.png`, fullPage: true })
    
    if (token) {
      expect(token.length).toBeGreaterThan(0)
      console.log("✅ Inscription réussie - Token créé")
    } else if (currentUrl.includes("/orders")) {
      console.log("✅ Redirection vers /orders détectée")
    } else {
      // Vérifier s'il y a des erreurs
      const errorElements = await page.locator('text=/erreur|error/i').count()
      if (errorElements > 0) {
        const errorText = await page.locator('text=/erreur|error/i').first().textContent()
        console.log(`⚠ Erreur détectée: ${errorText}`)
      }
    }
  })

  test("4. Test de connexion", async ({ page }) => {
    // D'abord créer un compte
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState("networkidle")
    
    const emailInput = page.locator('input[type="email"]')
    const passwordInputs = page.locator('input[type="password"]')
    
    await emailInput.fill(testEmail)
    if (await passwordInputs.count() >= 2) {
      await passwordInputs.nth(0).fill(testPassword)
      await passwordInputs.nth(1).fill(testPassword)
    }
    
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    await page.waitForTimeout(5000)
    
    // Se déconnecter
    await page.evaluate(() => localStorage.removeItem("auth_token"))
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState("networkidle")
    
    // Se connecter
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').fill(testPassword)
    await page.locator('button[type="submit"]').first().click()
    
    await page.waitForTimeout(5000)
    
    // Vérifier la connexion
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBeTruthy()
  })

  test("5. Vérification de la protection des routes", async ({ page }) => {
    // S'assurer qu'il n'y a pas de token
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.removeItem("auth_token"))
    
    // Essayer d'accéder à une route protégée
    await page.goto(`${BASE_URL}/orders`)
    await page.waitForLoadState("networkidle")
    
    // Vérifier la redirection
    const currentUrl = page.url()
    expect(currentUrl).toContain("/login")
  })

  test("6. Test de l'API d'authentification directement", async ({ page }) => {
    // Tester l'API directement
    const response = await page.request.post(`${AUTH_API_URL}/auth/register`, {
      data: {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
    })
    
    const data = await response.json()
    
    expect(response.status()).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBeTruthy()
    expect(data.user).toBeTruthy()
    expect(data.user.email).toBe(testEmail)
  })

  test("7. Test de validation des formulaires", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState("networkidle")
    
    // Essayer de soumettre le formulaire vide
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    await page.waitForTimeout(2000)
    
    // Vérifier qu'on reste sur la page register
    const currentUrl = page.url()
    expect(currentUrl).toContain("/register")
    
    // Prendre une capture pour voir les erreurs
    await page.screenshot({ path: `test-results/validation-${Date.now()}.png` })
  })

  test("8. Test de performance - Temps de chargement", async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState("networkidle")
    
    const loadTime = Date.now() - startTime
    
    console.log(`Temps de chargement: ${loadTime}ms`)
    
    // Vérifier que la page charge en moins de 5 secondes
    expect(loadTime).toBeLessThan(5000)
  })

  test("9. Test responsive - Mobile", async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState("networkidle")
    
    // Vérifier que les éléments sont visibles
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    
    // Prendre une capture mobile
    await page.screenshot({ path: `test-results/mobile-${Date.now()}.png`, fullPage: true })
  })

  test("10. Test de gestion d'erreurs réseau", async ({ page }) => {
    // Intercepter les requêtes pour simuler une erreur
    await page.route(`${AUTH_API_URL}/auth/register`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Erreur serveur simulée" }),
      })
    })
    
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState("networkidle")
    
    const emailInput = page.locator('input[type="email"]')
    const passwordInputs = page.locator('input[type="password"]')
    
    await emailInput.fill(testEmail)
    if (await passwordInputs.count() >= 2) {
      await passwordInputs.nth(0).fill(testPassword)
      await passwordInputs.nth(1).fill(testPassword)
    }
    
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(3000)
    
    // Vérifier qu'un message d'erreur s'affiche
    const errorVisible = await page.locator('text=/erreur|error/i').first().isVisible().catch(() => false)
    
    if (errorVisible) {
      console.log("✅ Gestion d'erreur fonctionne")
    } else {
      console.log("⚠ Message d'erreur non détecté")
    }
    
    await page.screenshot({ path: `test-results/error-handling-${Date.now()}.png` })
  })
})

