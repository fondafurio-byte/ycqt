import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Alert,
  Paper
} from '@mui/material';
import logo from '../../icon.png';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestButton, setShowTestButton] = useState(false);
  const navigate = useNavigate();

  // Listener per la scorciatoia da tastiera
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Scorciatoia: Ctrl+Shift+T (o Cmd+Shift+T su Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        setShowTestButton(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)', // Aumentata la trasparenza
            backdropFilter: 'blur(8px)', // Effetto blur più leggero
          }}
        >
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: 100, 
              height: 100, 
              objectFit: 'contain',
              marginBottom: 16 
            }} 
          />
          
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            App Gestione
            {showTestButton && (
              <Typography variant="caption" sx={{ display: 'block', color: 'orange', mt: 1 }}>
                Modalità Test Attiva (Ctrl/Cmd+Shift+T)
              </Typography>
            )}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  // Prima verifichiamo se c'è già una sessione attiva
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                  if (sessionError) {
                    console.error('Errore nel controllo della sessione:', sessionError);
                    setError('Errore nel controllo della sessione: ' + sessionError.message);
                    return;
                  }
                  
                  if (session) {
                    console.log('Sessione esistente trovata:', session);
                  }

                  // Proviamo il login
                  // Prima creiamo una nuova sessione anonima
                  await supabase.auth.signOut(); // Chiudiamo eventuali sessioni esistenti
                  
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: 'guest@appgestione.com',
                    password: 'guest123'
                  });

                  if (signInError) {
                    console.error('Dettagli errore login:', signInError);
                    setError('Errore di login: ' + signInError.message);
                    
                    // Log per debugging
                    const { data: userCheck } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('email', 'guest@appgestione.com')
                      .single();
                    
                    console.log('Profilo guest trovato:', userCheck);

                    throw signInError;
                  }

                  console.log('Login riuscito:', signInData);

                  // Se siamo arrivati qui, l'accesso è riuscito
                  navigate('/register');
                } catch (err: any) {
                  console.error('Errore dettagliato:', err);
                  // Proviamo a ottenere più informazioni sullo stato dell'utente
                  const { data: authData } = await supabase.auth.getUser();
                  console.log('Stato utente corrente:', authData);
                  
                  // Verifichiamo se l'utente esiste nel sistema
                  const { data: userList } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'guest');
                  console.log('Lista utenti guest:', userList);
                  
                  setError('Errore nell\'accesso come guest. ' + (err.message || 'Riprova più tardi.'));
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi come Guest'}
            </Button>
            
            {showTestButton && (
              <Button
                component={Link}
                to="/email-confirmed"
                fullWidth
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                Test: Vai a Email Confirmed
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
