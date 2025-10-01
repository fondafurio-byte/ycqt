import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Rileva automaticamente la preferenza di sistema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Ascolta i cambiamenti del tema di sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      console.log('🎨 Sistema tema cambiato:', e.matches ? 'Scuro' : 'Chiaro');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Log iniziale
    console.log('🎨 Tema sistema rilevato:', isDarkMode ? 'Scuro' : 'Chiaro');

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Tema personalizzato per YouthCourt IQ
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#d32f2f', // Rosso principale
      },
      secondary: {
        main: '#2e7d32', // Verde secondario
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    components: {
      // Override per il Container principale con background gradient
      MuiContainer: {
        styleOverrides: {
          root: {
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            transition: 'background 0.3s ease',
          },
        },
      },
      // Paper con backdrop blur ottimizzato
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode 
              ? 'rgba(30, 30, 30, 0.9)' 
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
      },
      // Button ottimizzato per entrambi i temi
      MuiButton: {
        styleOverrides: {
          contained: {
            color: '#ffffff',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            },
            transition: 'all 0.3s ease',
          },
          outlined: {
            borderColor: isDarkMode ? '#ffffff' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#ffffff',
            '&:hover': {
              borderColor: isDarkMode ? '#ffffff' : '#ffffff',
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};