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
        // Retry une fois pour les autres erreurs
        return failureCount < 1
      },
      // Ne pas throw les erreurs, les retourner dans le query state
      throwOnError: false,
      // Retourner des données vides par défaut en cas d'erreur
      placeholderData: (previousData) => previousData ?? [],
    },
  },
})
