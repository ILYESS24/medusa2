import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Button, Heading, Hint, Input, Text } from "@medusajs/ui"
import React from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import * as z from "zod"

import { Form } from "../../components/common/form"
import AvatarBox from "../../components/common/logo-box/avatar-box"
import { register } from "../../lib/auth-client"

// Error Boundary pour capturer les erreurs
class RegisterErrorBoundary extends React.Component<
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
    console.error("Register page error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
          <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
            <Alert variant="error">
              Une erreur est survenue. Veuillez rafraîchir la page.
            </Alert>
            <Link to="/login" className="text-ui-fg-interactive mt-4">
              Retour à la connexion
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export const Register = () => {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = form.handleSubmit(async ({ email, password, name }) => {
    setIsPending(true)
    try {
      const result = await register(email, password, name)
      if (result && result.success) {
        navigate("/", { replace: true })
      }
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      form.setError("root.serverError", {
        type: "manual",
        message: errorMessage,
      })
    } finally {
      setIsPending(false)
    }
  })

  const serverError = form.formState.errors?.root?.serverError?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.name?.message ||
    form.formState.errors.confirmPassword?.message

  return (
    <RegisterErrorBoundary>
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
        <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
          <AvatarBox />
          <div className="mb-4 flex flex-col items-center">
            <Heading>Créer un compte</Heading>
            <Text size="small" className="text-ui-fg-subtle text-center">
              Inscrivez-vous pour accéder à l&apos;administration
            </Text>
          </div>
          <div className="flex w-full flex-col gap-y-3">
            <Form {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-y-6"
              >
                <div className="flex flex-col gap-y-1">
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => {
                      return (
                        <Form.Item>
                          <Form.Label>Nom</Form.Label>
                          <Form.Control>
                            <Input
                              autoComplete="name"
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="Votre nom"
                            />
                          </Form.Control>
                        </Form.Item>
                      )
                    }}
                  />
                  <Form.Field
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      return (
                        <Form.Item>
                          <Form.Label>Email</Form.Label>
                          <Form.Control>
                            <Input
                              autoComplete="email"
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="votre@email.com"
                            />
                          </Form.Control>
                        </Form.Item>
                      )
                    }}
                  />
                  <Form.Field
                    control={form.control}
                    name="password"
                    render={({ field }) => {
                      return (
                        <Form.Item>
                          <Form.Label>Mot de passe</Form.Label>
                          <Form.Control>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="••••••••"
                            />
                          </Form.Control>
                        </Form.Item>
                      )
                    }}
                  />
                  <Form.Field
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => {
                      return (
                        <Form.Item>
                          <Form.Label>Confirmer le mot de passe</Form.Label>
                          <Form.Control>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="••••••••"
                            />
                          </Form.Control>
                        </Form.Item>
                      )
                    }}
                  />
                </div>
                {validationError && (
                  <div className="text-center">
                    <Hint className="inline-flex" variant={"error"}>
                      {validationError}
                    </Hint>
                  </div>
                )}
                {serverError && (
                  <Alert
                    className="bg-ui-bg-base items-center p-2"
                    dismissible
                    variant="error"
                  >
                    {serverError}
                  </Alert>
                )}
                <Button className="w-full" type="submit" isLoading={isPending}>
                  Créer mon compte
                </Button>
              </form>
            </Form>
          </div>
          <span className="text-ui-fg-muted txt-small my-6">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
            >
              Se connecter
            </Link>
          </span>
        </div>
      </div>
    </RegisterErrorBoundary>
  )
}
