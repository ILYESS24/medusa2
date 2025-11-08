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
   * Log error in development mode.
   *
   * react-router-dom will sometimes swallow the error,
   * so this ensures that we always log it.
   */
  if (process.env.NODE_ENV === "development") {
    console.error("ErrorBoundary error:", error)
  }

  let title: string
  let message: string

  if (isNetworkError) {
    title = "Erreur de connexion"
    message =
      "Impossible de se connecter au serveur. Le backend Medusa n'est peut-être pas configuré ou accessible."
  } else {
    switch (code) {
      case 400:
        title = t("errorBoundary.badRequestTitle")
        message = t("errorBoundary.badRequestMessage")
        break
      case 404:
        title = t("errorBoundary.notFoundTitle")
        message = t("errorBoundary.notFoundMessage")
        break
      case 500:
        title = t("errorBoundary.internalServerErrorTitle")
        message = t("errorBoundary.internalServerErrorMessage")
        break
      default:
        title = t("errorBoundary.defaultTitle")
        message = t("errorBoundary.defaultMessage")
        break
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
                  L&apos;interface d&apos;administration nécessite un backend
                  Medusa configuré pour fonctionner complètement. Vous pouvez
                  toujours utiliser l&apos;authentification personnalisée.
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
