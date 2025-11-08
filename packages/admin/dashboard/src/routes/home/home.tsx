import { CheckCircle, InformationCircle } from "@medusajs/icons"
import { Alert, Heading, Text } from "@medusajs/ui"
import React from "react"
import { getCurrentUser } from "../../lib/auth-client"

export const Home = () => {
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-ui-fg-subtle">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Heading level="h1">Bienvenue dans l&apos;administration</Heading>
          <Text className="text-ui-fg-subtle">
            Vous êtes connecté avec succès à votre compte personnalisé.
          </Text>
        </div>

        {user && (
          <Alert>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-ui-fg-success mt-0.5" />
              <div className="flex flex-col gap-1">
                <Text size="small" weight="plus">
                  Authentification réussie
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Connecté en tant que: {user.email}
                  {user.name && ` (${user.name})`}
                </Text>
              </div>
            </div>
          </Alert>
        )}

        <Alert variant="info">
          <div className="flex items-start gap-3">
            <InformationCircle className="text-ui-fg-interactive mt-0.5" />
            <div className="flex flex-col gap-2">
              <Text size="small" weight="plus">
                Configuration requise
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Pour utiliser toutes les fonctionnalités de l&apos;interface
                d&apos;administration (commandes, produits, etc.), vous devez
                configurer un backend Medusa.
              </Text>
              <Text size="small" className="text-ui-fg-subtle mt-2">
                <strong>Fonctionnalités disponibles:</strong>
              </Text>
              <ul className="text-ui-fg-subtle ml-4 mt-1 list-disc space-y-1 text-sm">
                <li>Authentification personnalisée (fonctionne)</li>
                <li>Gestion des comptes utilisateurs</li>
                <li>Interface d&apos;administration de base</li>
              </ul>
              <Text size="small" className="text-ui-fg-subtle mt-2">
                <strong>Fonctionnalités nécessitant Medusa:</strong>
              </Text>
              <ul className="text-ui-fg-subtle ml-4 mt-1 list-disc space-y-1 text-sm">
                <li>Gestion des commandes</li>
                <li>Gestion des produits</li>
                <li>Gestion des clients</li>
                <li>Autres fonctionnalités e-commerce</li>
              </ul>
            </div>
          </div>
        </Alert>

        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-6">
          <Heading level="h2" className="mb-4">
            Prochaines étapes
          </Heading>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="text-ui-fg-interactive flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-bg-interactive text-xs font-semibold">
                1
              </div>
              <div>
                <Text size="small" weight="plus">
                  Configurer le backend Medusa
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Déployez ou configurez votre instance Medusa pour accéder à
                  toutes les fonctionnalités.
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-ui-fg-interactive flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-bg-interactive text-xs font-semibold">
                2
              </div>
              <div>
                <Text size="small" weight="plus">
                  Configurer l&apos;URL du backend
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Définissez la variable d&apos;environnement{" "}
                  <code className="rounded bg-ui-bg-subtle px-1 py-0.5 text-xs">
                    VITE_MEDUSA_ADMIN_BACKEND_URL
                  </code>{" "}
                  pour connecter l&apos;interface au backend.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
