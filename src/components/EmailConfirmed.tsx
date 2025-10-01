import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Computer as ComputerIcon,
  Apple as AppleIcon,
  Android as AndroidIcon
} from '@mui/icons-material';
import logo from '../assets/icon.png';
import { useEffect, useState } from 'react';

export default function EmailConfirmed() {
  const token = localStorage.getItem('societa_token');
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    isMac: false,
    isWindows: false
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setDeviceInfo({
      isMobile,
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isDesktop: !isMobile,
      isMac: /macintosh|mac os x/i.test(userAgent),
      isWindows: /windows/i.test(userAgent)
    });
  }, []);

  // Funzione per monitorare se l'app si è aperta
  const tryOpenApp = (schemes: string[], fallbackMessage: string) => {
    let appOpened = false;
    const startTime = Date.now();
    
    // Monitora se l'app si apre controllando se la pagina perde il focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };
    
    const handleBlur = () => {
      appOpened = true;
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    // Prova i vari schemi
    schemes.forEach((scheme, index) => {
      setTimeout(() => {
        if (!appOpened) {
          window.location.href = scheme;
        }
      }, index * 1000);
    });
    
    // Controlla dopo un po' se l'app si è aperta
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      
      const timeSpent = Date.now() - startTime;
      // Se l'utente è rimasto sulla pagina per tutto il tempo, probabilmente l'app non si è aperta
      if (!appOpened && timeSpent > 3500) {
        alert(fallbackMessage);
      }
    }, 4000);
  };

  const handleOpenApp = () => {
    if (deviceInfo.isDesktop) {
      // Desktop: strategia semplice per l'app Python
      const schemes = ['youthcourt://email-confirmed'];
      const fallbackMessage = `Se l'app YouthCourt IQ per ${deviceInfo.isMac ? 'macOS' : deviceInfo.isWindows ? 'Windows' : 'Desktop'} non si è aperta, aprila manualmente e fai login con le tue credenziali.`;
      
      tryOpenApp(schemes, fallbackMessage);
    } else if (deviceInfo.isIOS) {
      // iOS: prova multiple strategie
      const schemes = [
        'youthcourtiq://email-confirmed',
        'youthcourt://email-confirmed',
        'com.youthcourt.iq://email-confirmed'
      ];
      const fallbackMessage = 'App non trovata. Assicurati di aver installato YouthCourt IQ sul tuo dispositivo iOS, poi riprova.';
      
      tryOpenApp(schemes, fallbackMessage);
    } else if (deviceInfo.isAndroid) {
      // Android: prova multiple strategie
      const schemes = [
        'intent://email-confirmed#Intent;scheme=youthcourtiq;package=com.youthcourt.iq;end',
        'youthcourtiq://email-confirmed',
        'youthcourt://email-confirmed'
      ];
      const fallbackMessage = 'App non trovata. Assicurati di aver installato YouthCourt IQ sul tuo dispositivo Android, poi riprova.';
      
      tryOpenApp(schemes, fallbackMessage);
    }
  };

  const getButtonText = () => {
    if (deviceInfo.isMobile) {
      return deviceInfo.isIOS ? 'Apri App iOS' : 'Apri App Android';
    }
    return 'Apri App Desktop';
  };

  const getButtonIcon = () => {
    if (deviceInfo.isIOS) return <AppleIcon sx={{ mr: 1 }} />;
    if (deviceInfo.isAndroid) return <AndroidIcon sx={{ mr: 1 }} />;
    return <ComputerIcon sx={{ mr: 1 }} />;
  };

  const getInstructions = () => {
    if (deviceInfo.isMobile) {
      return deviceInfo.isIOS 
        ? "Clicca per aprire direttamente l'app iOS di YouthCourt IQ sul tuo dispositivo."
        : "Clicca per aprire direttamente l'app Android di YouthCourt IQ sul tuo dispositivo.";
    }
    return "Clicca per aprire direttamente l'applicazione desktop di YouthCourt IQ sul tuo computer.";
  };

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
              mb: 1
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

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: 450,
              textAlign: 'center',
              mb: 3,
              fontStyle: 'italic'
            }}
          >
            {getInstructions()}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={getButtonIcon()}
              sx={{ 
                height: 48,
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
                minWidth: 180
              }}
              onClick={handleOpenApp}
            >
              {getButtonText()}
            </Button>
          </Box>

          {/* Informazioni aggiuntive per il dispositivo rilevato */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Dispositivo rilevato: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'} 
              {deviceInfo.isIOS && ' (iOS)'}
              {deviceInfo.isAndroid && ' (Android)'}
              {deviceInfo.isMac && ' (macOS)'}
              {deviceInfo.isWindows && ' (Windows)'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
