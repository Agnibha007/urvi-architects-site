import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// StrictMode double-invokes effects in dev, which would build every ScrollTrigger
// twice and halve the scroll distances. Every effect here cleans up correctly, so
// it is safe — but the pins are measured on the second pass, which is what we want.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
