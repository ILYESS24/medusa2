import inject from "@medusajs/admin-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import inspect from "vite-plugin-inspect"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const BASE = env.VITE_MEDUSA_BASE || "/"
  const BACKEND_URL = env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const STOREFRONT_URL =
    env.VITE_MEDUSA_STOREFRONT_URL || "http://localhost:8000"

  /**
   * Add this to your .env file to specify the project to load admin extensions from.
   */
  const MEDUSA_PROJECT = env.VITE_MEDUSA_PROJECT || null
  const sources = MEDUSA_PROJECT ? [MEDUSA_PROJECT] : []

  return {
    plugins: [
      inspect(),
      react(),
      inject({
        sources,
      }),
    ],
    define: {
      __BASE__: JSON.stringify(BASE),
      __BACKEND_URL__: JSON.stringify(BACKEND_URL),
      __STOREFRONT_URL__: JSON.stringify(STOREFRONT_URL),
    },
    server: {
      open: true,
    },
    preview: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 4173,
      // En production (NODE_ENV=production), ne pas définir allowedHosts = autorise tous les hôtes
      // En développement, restreindre à localhost pour la sécurité
      // Vérifier NODE_ENV car vite preview peut ne pas avoir mode="production"
      ...(process.env.NODE_ENV !== "production" && {
        allowedHosts: [
          "localhost",
          "127.0.0.1",
        ],
      }),
    },
  }
})
