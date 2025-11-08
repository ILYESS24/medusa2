/**
 * Client d'authentification personnalisé
 * Utilise le Worker d'authentification Cloudflare
 */

// URL de l'API d'authentification
const AUTH_API_URL = (() => {
  // Vérifier d'abord la variable d'environnement
  if (import.meta.env.VITE_AUTH_API_URL) {
    return import.meta.env.VITE_AUTH_API_URL
  }
  // Fallback vers l'URL par défaut
  return "https://medusa-auth.gfiyfougiug.workers.dev"
})()

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface AuthError {
  error: string
}

// Stocker le token dans localStorage
export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") {
      return null
    }
    return localStorage.getItem("auth_token")
  },
  setToken: (token: string): void => {
    if (typeof window === "undefined") {
      return
    }
    localStorage.setItem("auth_token", token)
  },
  removeToken: (): void => {
    if (typeof window === "undefined") {
      return
    }
    localStorage.removeItem("auth_token")
  },
}

// Fonction pour faire des requêtes authentifiées
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = authStorage.getToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  headers.set("Content-Type", "application/json")

  return fetch(url, {
    ...options,
    headers,
  })
}

// Inscription
export const register = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de l'inscription")
  }

  if (data.success && data.token) {
    authStorage.setToken(data.token)
  }

  return data
}

// Connexion
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de la connexion")
  }

  if (data.success && data.token) {
    authStorage.setToken(data.token)
  }

  return data
}

// Déconnexion
export const logout = async (): Promise<void> => {
  const token = authStorage.getToken()

  if (token) {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  authStorage.removeToken()
}

// Vérifier la session actuelle
export const getCurrentUser = async (): Promise<User | null> => {
  const token = authStorage.getToken()

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      authStorage.removeToken()
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error)
    authStorage.removeToken()
    return null
  }
}
