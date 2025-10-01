import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import logo from '../assets/icon.png';
import { Link } from 'react-router-dom';

export default function EmailConfirmed() {
  const token = localStorage.getItem('societa_token');
  return (
    <Container 
      component="main" 
      maxWidth="sm" 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: 120,
              marginBottom: 24
            }} 
          />
          
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: '#4caf50'
            }} 
          />

          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            Email Verificata con Successo!
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 400,
              textAlign: 'center',
              mb: 3
            }}
          >
            Il tuo account è stato attivato correttamente. 
            {token && (
              <>
                <br />
                <br />
                Il token della tua società è: <strong>{token}</strong>
                <br />
                Conservalo con cura, servirà agli altri utenti per unirsi alla tua società.
              </>
            )}
          </Typography>

          <Button
            component={Link}
            to="/register"
            variant="outlined"
            sx={{ 
              height: 48,
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Torna alla Registrazione
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
