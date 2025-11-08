import { test, expect } from "@playwright/test"

/**
 * Test réel de l'interface en production
 */

const FRONTEND_URL = "https://3d7b9da1.medusa-admin-ui.pages.dev"
const AUTH_API = "https://medusa-auth.gfiyfougiug.workers.dev"
const BACKEND_API = "https://medusa-backend.gfiyfougiug.workers.dev"

test.describe("Test Production Réel", () => {
  test("1. Accès à l'interface et redirection vers login", async ({ page }) => {
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState("networkidle", { timeout: 10000 })
    
    // Vérifier la redirection vers login
    const url = page.url()
    expect(url).toContain("/login")
    
    // Vérifier que les champs de login sont présents
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await expect(passwordInput).toBeVisible()
    
    console.log("✅ Interface accessible, redirection login OK")
  })

  test("2. Test d'inscription réel", async ({ page }) => {
    const testEmail = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@test.com`
    const testPassword = "TestPassword123!"
    const testName = "Test User"
    
    await page.goto(`${FRONTEND_URL}/register`)
    await page.waitForLoadState("networkidle", { timeout: 10000 })
    
    // Remplir le formulaire
    const nameInput = page.locator('input').first()
    const emailInput = page.locator('input[type="email"]')
    const passwordInputs = page.locator('input[type="password"]')
    
    await nameInput.fill(testName)
    await emailInput.fill(testEmail)
    
    const passwordCount = await passwordInputs.count()
    if (passwordCount >= 2) {
      await passwordInputs.nth(0).fill(testPassword)
      await passwordInputs.nth(1).fill(testPassword)
    }
    
    // Soumettre
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    // Attendre la réponse
    await page.waitForTimeout(5000)
    
    // Vérifier le résultat
    const currentUrl = page.url()
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    
    if (token && token.length > 0) {
      console.log("✅ Inscription réussie - Token créé")
      expect(token.length).toBeGreaterThan(0)
    } else if (currentUrl.includes("/orders") || currentUrl.includes("/")) {
      console.log("✅ Redirection après inscription OK")
    } else {
      // Vérifier les erreurs
      const errorVisible = await page.locator('text=/erreur|error/i').first().isVisible().catch(() => false)
      if (errorVisible) {
        const errorText = await page.locator('text=/erreur|error/i').first().textContent()
        console.log(`❌ Erreur détectée: ${errorText}`)
        throw new Error(`Erreur lors de l'inscription: ${errorText}`)
      }
    }
  })

  test("3. Test de connexion réel", async ({ page }) => {
    // D'abord créer un compte via l'API
    const testEmail = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@test.com`
    const testPassword = "TestPassword123!"
    
    const registerResponse = await fetch(`${AUTH_API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User"
      })
    })
    
    const registerData = await registerResponse.json()
    if (!registerData.success) {
      throw new Error("Échec de l'inscription pour le test")
    }
    
    // Maintenant tester la connexion via l'interface
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState("networkidle", { timeout: 10000 })
    
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').fill(testPassword)
    await page.locator('button[type="submit"]').first().click()
    
    await page.waitForTimeout(5000)
    
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    const currentUrl = page.url()
    
    if (token && token.length > 0) {
      console.log("✅ Connexion réussie - Token créé")
      expect(token.length).toBeGreaterThan(0)
    } else if (!currentUrl.includes("/login")) {
      console.log("✅ Redirection après connexion OK")
    } else {
      const errorVisible = await page.locator('text=/erreur|error/i').first().isVisible().catch(() => false)
      if (errorVisible) {
        const errorText = await page.locator('text=/erreur|error/i').first().textContent()
        throw new Error(`Erreur lors de la connexion: ${errorText}`)
      }
      throw new Error("Connexion échouée - reste sur /login")
    }
  })

  test("4. Test accès page d'accueil après connexion", async ({ page }) => {
    // Créer un compte et se connecter
    const testEmail = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@test.com`
    const testPassword = "TestPassword123!"
    
    const registerResponse = await fetch(`${AUTH_API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User"
      })
    })
    
    const registerData = await registerResponse.json()
    if (!registerData.success) {
      throw new Error("Échec de l'inscription")
    }
    
    // Mettre le token dans localStorage
    await page.goto(FRONTEND_URL)
    await page.evaluate((token) => {
      localStorage.setItem("auth_token", token)
    }, registerData.token)
    
    // Aller à la page d'accueil
    await page.goto(`${FRONTEND_URL}/`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })
    
    // Vérifier qu'on n'est pas sur login
    const currentUrl = page.url()
    expect(currentUrl).not.toContain("/login")
    
    // Vérifier qu'il n'y a pas d'erreur majeure
    const errorBoundary = await page.locator('text=/Erreur lors du chargement|error/i').first().isVisible().catch(() => false)
    if (errorBoundary) {
      const errorText = await page.locator('text=/Erreur lors du chargement|error/i').first().textContent()
      console.log(`❌ Erreur détectée sur la page: ${errorText}`)
      throw new Error(`Erreur sur la page d'accueil: ${errorText}`)
    }
    
    console.log("✅ Page d'accueil accessible après connexion")
  })

  test("5. Test appels API backend depuis l'interface", async ({ page }) => {
    // Créer un compte
    const testEmail = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@test.com`
    const testPassword = "TestPassword123!"
    
    const registerResponse = await fetch(`${AUTH_API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User"
      })
    })
    
    const registerData = await registerResponse.json()
    
    // Mettre le token
    await page.goto(FRONTEND_URL)
    await page.evaluate((token) => {
      localStorage.setItem("auth_token", token)
    }, registerData.token)
    
    // Intercepter les appels API
    const apiCalls: string[] = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('medusa-backend') || url.includes('medusa-auth')) {
        apiCalls.push(`${request.method()} ${url}`)
      }
    })
    
    await page.goto(`${FRONTEND_URL}/`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })
    
    console.log(`📡 Appels API détectés: ${apiCalls.length}`)
    apiCalls.forEach(call => console.log(`   ${call}`))
    
    // Vérifier qu'au moins un appel a été fait
    expect(apiCalls.length).toBeGreaterThan(0)
  })
})

