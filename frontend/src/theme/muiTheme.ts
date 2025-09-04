import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#dc2626', // red-600
      light: '#ef4444', // red-500
      dark: '#b91c1c', // red-700
    },
    secondary: {
      main: '#f97316', // orange-500
      light: '#fb923c', // orange-400
      dark: '#ea580c', // orange-600
    },
    background: {
      default: '#000000', // black
      paper: '#18181b', // zinc-900
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Ungai", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Storm Gust", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: '"Storm Gust", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h3: {
      fontFamily: '"Storm Gust", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h4: {
      fontFamily: '"Storm Gust", sans-serif',
    },
    h5: {
      fontFamily: '"Storm Gust", sans-serif',
    },
    h6: {
      fontFamily: '"Storm Gust", sans-serif',
    },
    button: {
      fontFamily: '"Storm Gust", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #dc2626 30%, #ef4444 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #b91c1c 30%, #dc2626 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(24, 24, 27, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#000000',
            borderRadius: '0.75rem',
            '& fieldset': {
              borderColor: '#dc2626',
            },
            '&:hover fieldset': {
              borderColor: '#ef4444',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#dc2626',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#dc2626',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#dc2626',
          },
        },
      },
    },
  },
});