// Import StrictMode from React
// It is a development tool used to help detect potential problems
import { StrictMode } from 'react'

// Import createRoot from react-dom/client
// It is used to mount the React application to the HTML page
import { createRoot } from 'react-dom/client'

// Import global CSS styles
import './index.css'

// Import the main App component
import App from './App.tsx'

// Find the HTML element with id="root"
// The "!" means we are sure this element exists (TypeScript syntax)
createRoot(document.getElementById('root')!).render(

  // StrictMode helps detect potential issues during development
  // It does not affect the production version
  <StrictMode>

    <App />

  </StrictMode>,
)