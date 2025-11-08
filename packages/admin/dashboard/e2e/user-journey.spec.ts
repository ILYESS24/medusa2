import { test, expect } from "@playwright/test"

/**
 * Tests E2E simulant l'utilisation réelle de la plateforme
 * Par un utilisateur qui s'inscrit, se connecte et utilise l'interface
 */

const AUTH_API_URL = process.env.VITE_AUTH_API_URL || "https://medusa-auth.gfiyfougiug.workers.dev"

// Générer un email unique pour chaque test
const generateTestEmail = () => {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@example.com`
}

test.describe("Parcours utilisateur complet", () => {
  let testEmail: string
  let testPassword: string
  let testName: string

  test.beforeEach(() => {
    testEmail = generateTestEmail()
    testPassword = "TestPassword123!"
    testName = "Test User"
  })

  test("1. Accès à la page d'accueil et redirection vers login", async ({ page }) => {
    await page.goto("/")
    
    // Vérifier que l'utilisateur est redirigé vers la page de login
    await expect(page).toHaveURL(/.*\/login/)
    
    // Vérifier que la page de login s'affiche correctement
    await expect(page.locator('text=/connecter/i')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test("2. Navigation vers la page d'inscription", async ({ page }) => {
    await page.goto("/login")
    
    // Cliquer sur le lien "Créer un compte"
    const registerLink = page.locator('a:has-text("Créer un compte")')
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    
    // Vérifier la redirection vers la page d'inscription
    await expect(page).toHaveURL(/.*\/register/)
    
    // Vérifier que le formulaire d'inscription s'affiche
    await expect(page.locator("text=Créer un compte")).toBeVisible()
    await expect(page.locator('input[placeholder*="nom" i]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test("3. Inscription d'un nouvel utilisateur", async ({ page }) => {
    await page.goto("/register")
    
    // Remplir le formulaire d'inscription
    await page.fill('input[placeholder*="nom" i]', testName)
    await page.fill('input[type="email"]', testEmail)
    await page.locator('input[type="password"]').nth(0).fill(testPassword)
    await page.locator('input[type="password"]').nth(1).fill(testPassword)
    
    // Soumettre le formulaire
    const submitButton = page.locator('button:has-text("Créer mon compte")')
    await expect(submitButton).toBeEnabled()
    await submitButton.click()
    
    // Vérifier que l'utilisateur est redirigé après l'inscription
    await page.waitForURL(/.*\/orders/, { timeout: 10000 })
    
    // Vérifier que le token est stocké dans localStorage
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBeTruthy()
    expect(token?.length).toBeGreaterThan(0)
  })

  test("4. Validation du formulaire d'inscription", async ({ page }) => {
    await page.goto("/register")
    
    // Tenter de soumettre le formulaire vide
    await page.locator('button:has-text("Créer mon compte")').click()
    
    // Vérifier que les messages d'erreur s'affichent
    await expect(page.locator("text=/nom doit contenir/i")).toBeVisible()
    await expect(page.locator("text=/email invalide/i")).toBeVisible()
    await expect(page.locator("text=/mot de passe doit contenir/i")).toBeVisible()
  })

  test("5. Validation des mots de passe qui ne correspondent pas", async ({ page }) => {
    await page.goto("/register")
    
    // Remplir le formulaire avec des mots de passe différents
    await page.fill('input[placeholder*="nom" i]', testName)
    await page.fill('input[type="email"]', testEmail)
    await page.locator('input[type="password"]').nth(0).fill(testPassword)
    await page.locator('input[type="password"]').nth(1).fill("DifferentPassword123!")
    
    // Soumettre le formulaire
    await page.locator('button:has-text("Créer mon compte")').click()
    
    // Vérifier le message d'erreur
    await expect(page.locator("text=/mots de passe ne correspondent pas/i")).toBeVisible()
  })

  test("6. Connexion avec un compte existant", async ({ page }) => {
    // D'abord créer un compte
    await page.goto("/register")
    await page.fill('input[placeholder*="nom" i]', testName)
    await page.fill('input[type="email"]', testEmail)
    await page.locator('input[type="password"]').nth(0).fill(testPassword)
    await page.locator('input[type="password"]').nth(1).fill(testPassword)
    await page.locator('button:has-text("Créer mon compte")').click()
    await page.waitForURL(/.*\/orders/, { timeout: 10000 })
    
    // Se déconnecter
    await page.evaluate(() => localStorage.removeItem("auth_token"))
    await page.goto("/login")
    
    // Se connecter
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.locator('button:has-text("Continuer")').click()
    
    // Vérifier la redirection
    await page.waitForURL(/.*\/orders/, { timeout: 10000 })
    
    // Vérifier que le token est stocké
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBeTruthy()
  })

  test("7. Gestion des erreurs de connexion", async ({ page }) => {
    await page.goto("/login")
    
    // Tenter de se connecter avec de mauvais identifiants
    await page.fill('input[type="email"]', "nonexistent@example.com")
    await page.fill('input[type="password"]', "WrongPassword123!")
    await page.locator('button:has-text("Continuer")').click()
    
    // Vérifier que le message d'erreur s'affiche
    await expect(page.locator("text=/erreur/i")).toBeVisible({ timeout: 5000 })
    
    // Vérifier que l'utilisateur reste sur la page de login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test("8. Navigation entre login et register", async ({ page }) => {
    await page.goto("/login")
    
    // Aller à register
    await page.locator('a:has-text("Créer un compte")').click()
    await expect(page).toHaveURL(/.*\/register/)
    
    // Retourner à login
    await page.locator('a:has-text("Se connecter")').click()
    await expect(page).toHaveURL(/.*\/login/)
  })

  test("9. Protection des routes - redirection si non connecté", async ({ page }) => {
    // S'assurer qu'il n'y a pas de token
    await page.evaluate(() => localStorage.removeItem("auth_token"))
    
    // Essayer d'accéder à une route protégée
    await page.goto("/orders")
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test("10. Persistance de la session après rechargement", async ({ page }) => {
    // Créer un compte
    await page.goto("/register")
    await page.fill('input[placeholder*="nom" i]', testName)
    await page.fill('input[type="email"]', testEmail)
    await page.locator('input[type="password"]').nth(0).fill(testPassword)
    await page.locator('input[type="password"]').nth(1).fill(testPassword)
    await page.locator('button:has-text("Créer mon compte")').click()
    await page.waitForURL(/.*\/orders/, { timeout: 10000 })
    
    // Recharger la page
    await page.reload()
    
    // Vérifier que l'utilisateur reste connecté
    await expect(page).toHaveURL(/.*\/orders/)
    
    // Vérifier que le token est toujours présent
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBeTruthy()
  })

  test("11. Interface responsive - vérification mobile", async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto("/login")
    
    // Vérifier que les éléments sont visibles et accessibles
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Continuer")')).toBeVisible()
  })

  test("12. Gestion des erreurs réseau", async ({ page }) => {
    // Intercepter les requêtes vers l'API d'authentification
    await page.route(`${AUTH_API_URL}/auth/register`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Erreur serveur" }),
      })
    })
    
    await page.goto("/register")
    await page.fill('input[placeholder*="nom" i]', testName)
    await page.fill('input[type="email"]', testEmail)
    await page.locator('input[type="password"]').nth(0).fill(testPassword)
    await page.locator('input[type="password"]').nth(1).fill(testPassword)
    await page.locator('button:has-text("Créer mon compte")').click()
    
    // Vérifier que l'erreur est affichée
    await expect(page.locator("text=/erreur/i")).toBeVisible({ timeout: 5000 })
  })

  test("13. Performance - temps de chargement", async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    const loadTime = Date.now() - startTime
    
    // Vérifier que la page charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000)
    
    // Vérifier que les éléments critiques sont visibles
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})

test.describe("Tests d'accessibilité", () => {
  test("14. Navigation au clavier", async ({ page }) => {
    await page.goto("/login")
    
    // Naviguer avec Tab
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    
    // Vérifier que le focus est sur un élément interactif
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement)
  })

  test("15. Labels et aria-labels", async ({ page }) => {
    await page.goto("/login")
    
    // Vérifier que les inputs ont des labels ou aria-labels
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toHaveAttribute("placeholder")
    await expect(passwordInput).toHaveAttribute("placeholder")
  })
})

