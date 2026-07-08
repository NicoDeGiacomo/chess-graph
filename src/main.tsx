import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Error monitoring. Stays fully dormant (no network calls) unless a DSN is
// provided via VITE_SENTRY_DSN, so local dev is unaffected. Errors only: no
// session replay and no PII, to keep the privacy promise intact.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div className="h-screen bg-page text-primary flex items-center justify-center p-6 text-center">
          <div>
            <p className="text-lg font-semibold">Something went wrong.</p>
            <p className="text-muted mt-2 text-sm">
              Try reloading the page. Your saved graphs are safe in your browser.
            </p>
          </div>
        </div>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
