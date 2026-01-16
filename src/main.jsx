import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './state/AuthContext.jsx'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

console.log('🚀 React app starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red; padding: 20px;">ERROR: Root element not found!</h1>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <App />
              <Toaster position="top-right" />
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render React app:', error);
    // Ensure we always show something, even if React fails
    try {
      rootElement.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 600px; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Application Error</h1>
            <p style="color: #424242; margin-bottom: 10px;"><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
            <pre style="background: #f5f5f5; padding: 15px; overflow: auto; font-size: 12px; border-radius: 4px; max-height: 200px;">${error.stack || 'No stack trace available'}</pre>
            <p style="margin-top: 20px; color: #666;">Check the browser console (F12) for more details.</p>
            <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Reload Page</button>
          </div>
        </div>
      `;
    } catch (innerError) {
      console.error('Failed to render error message:', innerError);
      rootElement.textContent = 'Application Error - Check console for details';
    }
  }
}
