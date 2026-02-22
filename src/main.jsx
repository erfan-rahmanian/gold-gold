import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// Register service worker for PWA (optional, graceful if unsupported)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').then(reg => {
			console.log('ServiceWorker registered:', reg.scope)
		}).catch(err => {
			console.warn('ServiceWorker registration failed:', err)
		})
	})
}
