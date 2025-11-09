import { ExclamationCircle } from "@medusajs/icons"
import { Alert, Button, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Navigate, useLocation, useRouteError } from "react-router-dom"

import { isFetchError } from "../../../lib/is-fetch-error"

export const ErrorBoundary = () => {
  const error = useRouteError()
  const location = useLocation()
  const { t } = useTranslation()

  let code: number | null = null
  let isNetworkError = false

  if (isFetchError(error)) {
    if (error.status === 401) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    code = error.status ?? null
  }

  // Détecter les erreurs réseau
  const errorMessage = error instanceof Error ? error.message : String(error)
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    code === null
  ) {
    isNetworkError = true
  }

  /**
   * Log error in all modes for debugging.
   *
   * react-router-dom will sometimes swallow the error,
   * so this ensures that we always log it.
   */
  console.error("ErrorBoundary error:", error)
  if (error instanceof Error) {
    console.error("Error stack:", error.stack)
  }

  let title: string
  let message: string

  if (isNetworkError) {
    title = "Erreur de connexion"
    message =
      "Impossible de se connecter au backend Medusa. Vérifiez que le backend est démarré et accessible."
  } else {
    // Utiliser des messages par défaut si les traductions échouent
    try {
      switch (code) {
        case 400:
          title = t("errorBoundary.badRequestTitle") || "Requête invalide"
          message = t("errorBoundary.badRequestMessage") || "La requête est invalide."
          break
        case 404:
          title = t("errorBoundary.notFoundTitle") || "Page non trouvée"
          message = t("errorBoundary.notFoundMessage") || "La page demandée n'existe pas."
          break
        case 500:
          title = t("errorBoundary.internalServerErrorTitle") || "Erreur serveur"
          message = t("errorBoundary.internalServerErrorMessage") || "Une erreur est survenue sur le serveur."
          break
        default:
          title = t("errorBoundary.defaultTitle") || "Une erreur est survenue"
          message = t("errorBoundary.defaultMessage") || "Une erreur inattendue s'est produite."
          break
      }
    } catch (translationError) {
      // Fallback si les traductions ne fonctionnent pas
      console.error("Translation error:", translationError)
      title = "Une erreur est survenue"
      message = error instanceof Error ? error.message : String(error)
    }
  }

  return (
    <div className="flex size-full min-h-[calc(100vh-57px-24px)] items-center justify-center p-4">
      <div className="flex max-w-md flex-col gap-y-6">
        <div className="text-ui-fg-subtle flex flex-col items-center gap-y-3">
          <ExclamationCircle />
          <div className="flex flex-col items-center justify-center gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              {title}
            </Text>
            <Text
              size="small"
              className="text-ui-fg-muted text-balance text-center"
            >
              {message}
            </Text>
            {isNetworkError && (
              <Alert variant="warning" className="mt-4">
                <Text size="small" className="text-center">
                  Le backend Medusa doit être démarré et accessible pour que
                  l&apos;interface fonctionne. Vérifiez la configuration et
                  l&apos;URL du backend.
                </Text>
              </Alert>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-x-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Recharger
          </Button>
          {!location.pathname.includes("/login") && (
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/login"
              }}
            >
              Retour à la connexion
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
