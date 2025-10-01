import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Alert,
  Paper,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import logo from '../assets/icon.png';

interface AdminData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  societa_nome_completo: string;
  societa_nome_breve: string;
  token: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
    password: '',
    username: '',
    fullName: '',
    societa_nome_completo: '',
    societa_nome_breve: '',
    token: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleGenerateToken = () => {
    setAdminData(prev => ({
      ...prev,
      token: generateToken()
    }));
  };

  const handleChange = (field: keyof AdminData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdminData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Genera il token prima della registrazione
      const companyToken = adminData.token || generateToken();

      // 1. Registra l'utente con metadati che includono il token società
      const { data, error } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            full_name: adminData.fullName,
            username: adminData.username,
            role: 'admin',
            company_token: companyToken,
            company_name: adminData.societa_nome_completo
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Errore nella creazione dell'utente");

      // Crea la società
      const { data: societaData, error: societaError } = await supabase
        .from("societa_sportive")
        .insert([
          {
            nome_completo: adminData.societa_nome_completo,
            nome_breve: adminData.societa_nome_breve,
            token: companyToken
          }
        ])
        .select()
        .single();

      if (societaError) throw societaError;

      // Crea il profilo admin
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            email: adminData.email,
            username: adminData.username,
            full_name: adminData.fullName,
            role: "admin",
            societa_id: societaData.id,
            categories: "[]"
          }
        ]);

      if (profileError) throw profileError;

      // Salva il token in localStorage per mostrarlo dopo la verifica
      localStorage.setItem('societa_token', societaData.token);
      
      setSuccess(
        "Registrazione completata! Controlla la tua email per verificare l'account. " +
        `Il token della tua società è: ${societaData.token}`
      );

      // Ascolta l'evento di autenticazione
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          navigate('/email-confirmed');
        }
      });

    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img src={logo} alt="Logo" style={{ height: '100px' }} />
          </Box>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Registrazione Admin
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={adminData.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={adminData.password}
              onChange={handleChange('password')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              label="Username"
              value={adminData.username}
              onChange={handleChange('username')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="fullName"
              label="Nome Completo"
              value={adminData.fullName}
              onChange={handleChange('fullName')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="societa_nome_completo"
              label="Nome Completo Società"
              value={adminData.societa_nome_completo}
              onChange={handleChange('societa_nome_completo')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="societa_nome_breve"
              label="Nome Breve Società"
              value={adminData.societa_nome_breve}
              onChange={handleChange('societa_nome_breve')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="token"
              label="Token Società"
              value={adminData.token}
              onChange={handleChange('token')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleGenerateToken}>
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
