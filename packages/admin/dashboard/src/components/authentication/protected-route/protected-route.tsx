import { Spinner } from "@medusajs/icons"
import { Alert } from "@medusajs/ui"
import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { getCurrentUser } from "../../../lib/auth-client"
import { SearchProvider } from "../../../providers/search-provider"
import { SidebarProvider } from "../../../providers/sidebar-provider"

// Error Boundary pour les routes protégées
class ProtectedRouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ProtectedRoute error:", error, errorInfo)
    // Log l'erreur pour diagnostic
    if (error.message.includes("fetch") || error.message.includes("network")) {
      console.warn(
        "Erreur réseau détectée - Le backend Medusa n'est peut-être pas disponible"
      )
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="flex max-w-md flex-col gap-4">
            <Alert variant="error">
              <div className="flex flex-col gap-2">
                <p className="font-semibold">Erreur lors du chargement</p>
                <p className="text-sm">
                  Une erreur est survenue lors du chargement de
                  l&apos;interface.
                  {this.state.error?.message.includes("fetch") && (
                    <span className="mt-2 block">
                      Le backend Medusa n&apos;est peut-être pas configuré ou
                      accessible.
                    </span>
                  )}
                </p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined })
                    window.location.reload()
                  }}
                  className="bg-ui-button-neutral text-ui-fg-on-color hover:bg-ui-button-neutral-hover mt-2 rounded-md px-4 py-2"
                >
                  Recharger la page
                </button>
              </div>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const ProtectedRoute = () => {
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const location = useLocation()

  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          err
        )
        setError(
          err instanceof Error ? err.message : "Erreur d'authentification"
        )
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <ProtectedRouteErrorBoundary>
      <SidebarProvider>
        <SearchProvider>
          <Outlet />
        </SearchProvider>
      </SidebarProvider>
    </ProtectedRouteErrorBoundary>
  )
}
