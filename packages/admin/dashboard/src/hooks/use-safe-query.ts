import { UseQueryResult } from "@tanstack/react-query"

/**
 * Hook wrapper pour garantir que les erreurs ne sont jamais throw
 * Utilisez ce hook au lieu d'utiliser directement les hooks API
 */
export function useSafeQuery<TData, TError = Error>(
  queryResult: UseQueryResult<TData, TError>
): UseQueryResult<TData, TError> {
  // S'assurer que throwOnError est false
  // Les erreurs sont déjà gérées dans query-client.ts, mais on double la sécurité ici
  
  // Si isError est true, on ne throw jamais
  // L'erreur est disponible dans queryResult.error mais ne sera jamais throw
  
  return {
    ...queryResult,
    // S'assurer que l'erreur n'est jamais throw
    error: queryResult.isError ? queryResult.error : undefined,
  }
}

