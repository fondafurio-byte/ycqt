import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider'

try {
  console.log('Starting app initialization...')
  
  // Log environment variables (without sensitive data)
  console.log('Environment:', {
    NODE_ENV: import.meta.env.MODE,
    BASE_URL: import.meta.env.BASE_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  })

  const rootElement = document.getElementById('root')
  console.log('Root element found:', rootElement)

  if (!rootElement) {
    throw new Error('Root element not found! Check index.html')
  }

  // Add visual feedback
  rootElement.innerHTML = '<div style="color:white;padding:20px;">Loading app...</div>'

  const root = createRoot(rootElement)
  console.log('Root created, rendering app...')

  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  )

  console.log('Initial render complete')
} catch (error) {
  console.error('Fatal error during app initialization:', error)
  document.body.innerHTML = `
    <div style="color:white;padding:20px;background:rgba(0,0,0,0.8);">
      <h1>Error Starting App</h1>
      <pre style="color:red">${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `
}
