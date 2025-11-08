/**
 * Worker backend simplifié pour Medusa
 * Implémente les endpoints de base sans base de données
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // Gestion CORS
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    // Health check
    if (path === "/health" || path === "/") {
      return jsonResponse({
        status: "ok",
        message: "Medusa Backend Worker is running",
        timestamp: new Date().toISOString(),
      })
    }

    // Endpoint admin/auth (pour compatibilité Medusa SDK)
    // Le SDK Medusa appelle /admin/auth au démarrage
    if (path === "/admin/auth" || path === "/admin/auth/session" || path.startsWith("/admin/auth/")) {
      // Pour GET, retourner 401 si pas d'auth (normal pour forcer login)
      if (method === "GET") {
        const authHeader = request.headers.get("Authorization") || 
                          request.headers.get("Cookie")
        
        if (!authHeader) {
          return jsonResponse({ 
            message: "Unauthorized",
            type: "unauthorized"
          }, 401)
        }
        
        // Si auth présent, retourner utilisateur
        return jsonResponse({
          user: {
            id: "admin-user",
            email: "admin@medusa.test",
            role: "admin",
            first_name: "Admin",
            last_name: "User",
          },
        }, 200)
      }
      
      // Pour POST (login), accepter et retourner succès
      if (method === "POST") {
        return jsonResponse({
          user: {
            id: "admin-user",
            email: "admin@medusa.test",
            role: "admin",
            first_name: "Admin",
            last_name: "User",
          },
        }, 200)
      }
    }

    // Endpoint admin/users/me
    if (path === "/admin/users/me") {
      const authHeader = request.headers.get("Authorization") || 
                        request.headers.get("Cookie")
      
      // Accepter même sans auth pour éviter les erreurs
      return jsonResponse({
        user: {
          id: "user-1",
          email: "user@example.com",
          role: "admin",
          first_name: "Admin",
          last_name: "User",
        },
      }, 200)
    }

    // Endpoint admin/orders (liste vide pour l'instant)
    if (path.startsWith("/admin/orders") && method === "GET") {
      return jsonResponse({
        orders: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint admin/products (liste vide)
    if (path.startsWith("/admin/products") && method === "GET") {
      return jsonResponse({
        products: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint admin/customers (liste vide)
    if (path.startsWith("/admin/customers") && method === "GET") {
      return jsonResponse({
        customers: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint admin/regions
    if (path.startsWith("/admin/regions") && method === "GET") {
      return jsonResponse({
        regions: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint admin/collections
    if (path.startsWith("/admin/collections") && method === "GET") {
      return jsonResponse({
        collections: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint admin/sales-channels
    if (path.startsWith("/admin/sales-channels") && method === "GET") {
      return jsonResponse({
        sales_channels: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint store/products (pour le storefront)
    if (path.startsWith("/store/products") && method === "GET") {
      return jsonResponse({
        products: [],
        count: 0,
        offset: 0,
        limit: 20,
      })
    }

    // Endpoint store/regions
    if (path === "/store/regions" && method === "GET") {
      return jsonResponse({
        regions: [],
      })
    }

    // Endpoint store/carts
    if (path.startsWith("/store/carts") && method === "POST") {
      return jsonResponse(
        {
          cart: {
            id: `cart_${Date.now()}`,
            items: [],
            region: null,
            total: 0,
          },
        },
        201
      )
    }

    // Endpoint par défaut - proxy vers MEDUSA_URL si configuré
    if (env.MEDUSA_URL) {
      try {
        const targetUrl = new URL(path + url.search, env.MEDUSA_URL)
        const headers = new Headers(request.headers)
        headers.delete("host")

        const response = await fetch(targetUrl, {
          method,
          headers,
          body: method !== "GET" && method !== "HEAD" ? request.body : null,
        })

        const responseHeaders = new Headers(response.headers)
        responseHeaders.set("Access-Control-Allow-Origin", "*")

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        })
      } catch (error) {
        return jsonResponse(
          {
            error: "Proxy error",
            message: error.message,
          },
          502
        )
      }
    }

    // Pour tous les autres endpoints admin, retourner une structure vide
    if (path.startsWith("/admin/")) {
      // Si c'est une requête GET pour une liste, retourner un tableau vide
      if (method === "GET" && !path.includes("/")) {
        const resourceName = path.split("/").pop()
        return jsonResponse({
          [resourceName]: [],
          count: 0,
          offset: 0,
          limit: 20,
        })
      }
      
      // Sinon, retourner un objet vide ou 404 selon le contexte
      return jsonResponse({}, 200)
    }

    // Réponse par défaut - ne pas retourner 404 pour éviter les erreurs
    // Retourner plutôt une réponse vide pour permettre à l'interface de continuer
    return jsonResponse({
      message: "Endpoint not fully implemented",
      endpoint: `${method} ${path}`,
      note: "This is a simplified backend. Full Medusa backend required for complete functionality.",
    }, 200)
  },
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

