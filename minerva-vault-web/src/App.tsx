import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './shared/contexts/AuthContext';
import AppRoutes from './routes';
import theme from './theme/theme';
import { NotificationProvider } from './shared/contexts/NotificationContext';


function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;