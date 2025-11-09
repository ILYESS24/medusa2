const { Modules } = require("@medusajs/utils")

// Configuration de la base de données depuis les variables d'environnement
const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa"

// Provider de paiement système
const systemPaymentProvider = {
  resolve: "@medusajs/payment/dist/providers/system",
  id: "system",
}

// Provider de fulfillment manuel
const manualFulfillmentProvider = {
  resolve: "@medusajs/fulfillment-manual",
  id: "manual",
}

module.exports = {
  admin: {
    disable: false, // Admin activé
  },
  plugins: [],
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseType: "postgres",
    http: {
      jwtSecret: process.env.JWT_SECRET || "change-me",
      cookieSecret: process.env.COOKIE_SECRET || "change-me",
      storeCors: process.env.STORE_CORS || "*",
      adminCors: process.env.ADMIN_CORS || "*",
      authCors: process.env.AUTH_CORS || "*",
    },
  },
  featureFlags: {
    medusa_v2: true, // Utiliser Medusa v2
    index_engine: true, // Activer le moteur d'indexation
  },
  modules: {
    // ============================================
    // MODULES D'INFRASTRUCTURE
    // ============================================
    
    // Authentification
    [Modules.AUTH]: {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            id: "emailpass",
            resolve: "@medusajs/auth-emailpass",
          },
        ],
      },
    },
    
    // Utilisateurs
    [Modules.USER]: {
      scope: "internal",
      resolve: "@medusajs/user",
      options: {
        jwt_secret: process.env.JWT_SECRET || "change-me",
      },
    },
    
    // Cache
    [Modules.CACHE]: {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: 0 },
    },
    
    // Caching (module de cache avancé)
    [Modules.CACHING]: {
      resolve: "@medusajs/caching",
      options: {},
    },
    
    // Verrouillage (locking)
    [Modules.LOCKING]: {
      resolve: "@medusajs/locking-postgres",
    },
    
    // Moteur de workflow
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/workflow-engine-inmemory",
    },
    
    // Event Bus (bus d'événements)
    [Modules.EVENT_BUS]: {
      resolve: "@medusajs/event-bus-local",
    },
    
    // Analytics (analyses)
    [Modules.ANALYTICS]: {
      resolve: "@medusajs/analytics",
      options: {
        providers: [
          {
            resolve: "@medusajs/analytics-local",
            id: "local",
          },
        ],
      },
    },
    
    // Index (moteur d'indexation)
    [Modules.INDEX]: {
      resolve: "@medusajs/index",
    },
    
    // Settings (paramètres utilisateur)
    [Modules.SETTINGS]: {
      resolve: "@medusajs/settings",
    },
    
    // Link Modules (liaison entre modules)
    [Modules.LINK]: {
      resolve: "@medusajs/link-modules",
    },
    
    // ============================================
    // MODULES E-COMMERCE
    // ============================================
    
    // Produits
    [Modules.PRODUCT]: true,
    
    // Tarification
    [Modules.PRICING]: true,
    
    // Promotions
    [Modules.PROMOTION]: true,
    
    // Régions
    [Modules.REGION]: true,
    
    // Clients
    [Modules.CUSTOMER]: true,
    
    // Canaux de vente
    [Modules.SALES_CHANNEL]: true,
    
    // Panier
    [Modules.CART]: true,
    
    // Commandes
    [Modules.ORDER]: true,
    
    // Boutique
    [Modules.STORE]: true,
    
    // Taxes
    [Modules.TAX]: true,
    
    // Devises
    [Modules.CURRENCY]: true,
    
    // Clés API
    [Modules.API_KEY]: true,
    
    // ============================================
    // MODULES D'INVENTAIRE
    // ============================================
    
    // Emplacements de stock
    [Modules.STOCK_LOCATION]: {
      resolve: "@medusajs/stock-location",
      options: {},
    },
    
    // Inventaire
    [Modules.INVENTORY]: {
      resolve: "@medusajs/inventory",
      options: {},
    },
    
    // ============================================
    // MODULES DE PAIEMENT
    // ============================================
    
    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [systemPaymentProvider],
      },
    },
    
    // ============================================
    // MODULES DE FULFILLMENT
    // ============================================
    
    [Modules.FULFILLMENT]: {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [manualFulfillmentProvider],
      },
    },
    
    // ============================================
    // MODULES DE FICHIERS
    // ============================================
    
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "uploads",
            },
          },
        ],
      },
    },
    
    // ============================================
    // MODULES DE NOTIFICATION
    // ============================================
    
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["log", "email"],
            },
          },
        ],
      },
    },
  },
}
