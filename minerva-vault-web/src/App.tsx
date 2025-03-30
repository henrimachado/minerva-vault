import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './shared/contexts/AuthContext';
import AppRoutes from './routes';
import theme from './theme/theme';
import { NotificationProvider } from './shared/contexts/NotificationContext';
import Navbar from './shared/components/Navbar/Navbar';


function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
              <Navbar /> {/* Adicione o componente Navbar aqui */}
              <AppRoutes />
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;