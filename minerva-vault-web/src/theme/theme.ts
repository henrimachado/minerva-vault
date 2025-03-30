import { createTheme } from '@mui/material/styles';

export const tokens = {
colors: {
  bg: {
    primary: '#1e2434',
    secondary: '#2a3042',
    elevated: '#303650',
  },
  border: {
    default: '#3a4257',
    focus: '#4a5266',
    active: '#5d6785',
  },
  text: {
    primary: '#ffffff',
    secondary: '#aabbcc',
    disabled: '#6f7a97',
  },
  action: {
    primary: '#1976d2',
    hover: '#1565c0',
    active: '#0d47a1',
  },
  feedback: {
    error: '#FF0051',
    errorDark: '#E00047',
    success: '#00D8B1',
    successDark: '##0DB99A',
    warning: '#F49200',
    warningDark: '##E77B00',
    info: '#2196f3'
  },
  status: {
    pending: '#F49200',
    approved: '#00D8B1',
    rejected: '#FF0051',
  }
},
typography: {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
}
};

const theme = createTheme({
palette: {
  mode: 'dark',
  background: {
    default: tokens.colors.bg.primary,
    paper: tokens.colors.bg.primary,
  },
  primary: {
    main: tokens.colors.action.primary,
    dark: tokens.colors.action.hover,
  },
  text: {
    primary: tokens.colors.text.primary,
    secondary: tokens.colors.text.secondary,
  },
  error: {
    main: tokens.colors.feedback.error
  },
},
typography: {
  fontFamily: tokens.typography.fontFamily,
  fontWeightLight: tokens.typography.fontWeightLight,
  fontWeightRegular: tokens.typography.fontWeightRegular,
  fontWeightMedium: tokens.typography.fontWeightMedium,
  fontWeightBold: tokens.typography.fontWeightBold,
  

  h1: {
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontWeight: 600,
    letterSpacing: '-0.0125em',
  },
  h4: {
    fontWeight: 600,
    letterSpacing: '-0.0125em',
  },
  h5: {
    fontWeight: 600,
  },
  h6: {
    fontWeight: 600,
  },
  subtitle1: {
    fontWeight: 500,
  },
  subtitle2: {
    fontWeight: 500,
  },
  body1: {
    fontWeight: 400,
  },
  body2: {
    fontWeight: 400,
  },
  button: {
    fontWeight: 500,
    textTransform: 'none', 
  },
  caption: {
    fontWeight: 400,
  },
  overline: {
    fontWeight: 400,
    textTransform: 'none',
  },
},
components: {
  MuiCssBaseline: {
    styleOverrides: {
    
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        boxSizing: 'border-box',
      },
      '*, *::before, *::after': {
        boxSizing: 'inherit',
      },
      body: {
        fontFamily: tokens.typography.fontFamily,
        fontWeight: tokens.typography.fontWeightRegular,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: tokens.colors.bg.secondary,
          '& fieldset': {
            borderColor: tokens.colors.border.default,
          },
          '&:hover fieldset': {
            borderColor: tokens.colors.border.focus,
          }
        },
        '& .MuiInputBase-input': {
          color: tokens.colors.text.primary,
        }
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      containedPrimary: {
        backgroundColor: tokens.colors.action.primary,
        '&:hover': {
          backgroundColor: tokens.colors.action.hover,
        }
      }
    }
  },
}
});

export default theme;
