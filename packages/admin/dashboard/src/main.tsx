import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app.js"

// ErrorBoundary global pour capturer toutes les erreurs
class GlobalErrorBoundary extends React.Component<
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
    console.error("Global ErrorBoundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Une erreur est survenue
          </h1>
          <p style={{ marginBottom: "16px", color: "#666" }}>
            {this.state.error?.message || "Une erreur inattendue s'est produite"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
              window.location.reload()
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Recharger la page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
)
