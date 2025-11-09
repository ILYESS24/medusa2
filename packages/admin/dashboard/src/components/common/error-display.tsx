import { Alert } from "@medusajs/ui"
import React from "react"

interface ErrorDisplayProps {
  error?: Error | unknown
  message?: string
  resourceName?: string
}

/**
 * Composant réutilisable pour afficher les erreurs de manière gracieuse
 * au lieu de lancer des erreurs qui cassent l'interface
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  message,
  resourceName = "données",
}) => {
  // Détecter si c'est une erreur réseau
  const errorMessage = error instanceof Error ? error.message : String(error || "")
  const isNetworkError =
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    !error

  const displayMessage =
    message ||
    (isNetworkError
      ? `Impossible de charger les ${resourceName}. Le backend Medusa n'est peut-être pas configuré ou accessible.`
      : `Une erreur est survenue lors du chargement des ${resourceName}.`)

  return (
    <div className="px-6 py-4">
      <Alert variant="warning">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Backend Medusa non disponible</p>
          <p className="text-sm">{displayMessage}</p>
        </div>
      </Alert>
    </div>
  )
}

