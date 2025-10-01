// Version 1.0.2 - Add Auth Context
import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
const { useState, useEffect } = React;
import Register from './components/Register';
import EmailConfirmed from './components/EmailConfirmed';
import Login from './components/Login';
import { Container, Typography, CircularProgress } from '@mui/material';
import { supabase } from './lib/supabaseClient';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App component mounted');
    try {
      // Log all safe environment variables for debugging
      console.log('Environment variables and build info:', {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
        NODE_ENV: import.meta.env.MODE,
        BASE_URL: import.meta.env.BASE_URL,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        BROWSER: typeof window !== 'undefined',
        URL: window.location.href,
        PATH: window.location.pathname
      });
      
      // Check if required env variables are set
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('VITE_SUPABASE_URL is not set');
      }
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error in App:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  }, []);

  console.log('Rendering App component. Loading:', isLoading, 'Error:', error);

  if (error) {
    return (
      <Container>
        <Typography variant="h4" color="error" gutterBottom>
          Error Loading App
        </Typography>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  // Aggiungi stato per l'autenticazione
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Controlla lo stato dell'autenticazione
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Ascolta i cambiamenti dell'autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Container style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={
              session ? <Register /> : <Navigate to="/login" replace />
            } />
            <Route path="/email-confirmed" element={<EmailConfirmed />} />
            <Route path="*" element={
              <Typography variant="h6" color="white" sx={{ p: 2 }}>
                404 - Page not found<br />
                Current path: {window.location.pathname}
              </Typography>
            } />
          </Routes>
        </BrowserRouter>
      )}
    </Container>
  );
}

export default App
