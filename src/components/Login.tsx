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
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const navigate = useNavigate();

  // Listener per la scorciatoia da tastiera con sequenza
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Scorciatoia: Cmd+K, poi K (sequenza)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setKeySequence(['cmd+k']);
        // Reset dopo 2 secondi se non completa la sequenza
        setTimeout(() => setKeySequence([]), 2000);
      } else if (keySequence.includes('cmd+k') && event.key === 'k') {
        event.preventDefault();
        setShowTestButton(prev => !prev);
        setKeySequence([]);
      } else if (event.key !== 'k') {
        // Reset se premi un altro tasto
        setKeySequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);

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
                Modalità Test Attiva (Cmd+K, poi K)
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
                    email: 'guest@youtcourt.com',
                    password: 'guest123'
                  });

                  if (signInError) {
                    console.error('Dettagli errore login:', signInError);
                    setError('Errore di login: ' + signInError.message);
                    
                    // Log per debugging
                    const { data: userCheck } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('email', 'guest@youtcourt.com')
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
