import { QueryClient } from "@tanstack/react-query"

export const MEDUSA_BACKEND_URL = __BACKEND_URL__ ?? "/"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 90000,
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 401/403/404
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false
        }
        // Ne pas retry sur les erreurs réseau (backend non disponible)
        if (
          error?.message?.includes("fetch") ||
          error?.message?.includes("network") ||
          error?.message?.includes("Failed to fetch") ||
          error?.message?.includes("NetworkError")
        ) {
          return false
        }
        // Retry une fois pour les autres erreurs
        return failureCount < 1
      },
      // CRITIQUE: Ne JAMAIS throw les erreurs, toujours les retourner dans le query state
      // Cela permet à l'interface de continuer à fonctionner même si le backend n'est pas disponible
      throwOnError: false,
      // Retourner des données vides par défaut en cas d'erreur
      placeholderData: (previousData) => previousData ?? [],
      // Gérer les erreurs silencieusement
      onError: (error) => {
        // Logger l'erreur mais ne pas la throw
        console.warn("Query error (handled gracefully):", error)
      },
    },
    mutations: {
      // Ne pas throw les erreurs de mutation non plus
      throwOnError: false,
      onError: (error) => {
        console.warn("Mutation error (handled gracefully):", error)
      },
    },
  },
})
