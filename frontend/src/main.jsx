import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import { SnackbarProvider } from './SnackbarContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <SnackbarProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </SnackbarProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
