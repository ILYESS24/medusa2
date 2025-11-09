const { Modules } = require("@medusajs/utils")

// Configuration de la base de données depuis les variables d'environnement
const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa"

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
  },
  modules: {
    // Modules de base
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
    [Modules.USER]: {
      scope: "internal",
      resolve: "@medusajs/user",
      options: {
        jwt_secret: process.env.JWT_SECRET || "change-me",
      },
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: 0 },
    },
    [Modules.LOCKING]: {
      resolve: "@medusajs/locking-postgres",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/workflow-engine-inmemory",
    },
    
    // Modules e-commerce
    [Modules.PRODUCT]: true,
    [Modules.PRICING]: true,
    [Modules.PROMOTION]: true,
    [Modules.REGION]: true,
    [Modules.CUSTOMER]: true,
    [Modules.SALES_CHANNEL]: true,
    [Modules.CART]: true,
    [Modules.ORDER]: true,
    [Modules.STORE]: true,
    [Modules.TAX]: true,
    [Modules.CURRENCY]: true,
    [Modules.API_KEY]: true,
    
    // Modules d'inventaire
    [Modules.STOCK_LOCATION]: {
      resolve: "@medusajs/stock-location",
      options: {},
    },
    [Modules.INVENTORY]: {
      resolve: "@medusajs/inventory",
      options: {},
    },
    
    // Modules de paiement
    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment/dist/providers/system",
            id: "system",
          },
        ],
      },
    },
    
    // Modules de fulfillment
    [Modules.FULFILLMENT]: {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
        ],
      },
    },
    
    // Modules de fichiers
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
    
    // Modules de notification
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

