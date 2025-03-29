import React from 'react';
import { Container, Typography } from '@mui/material';
import { useAuth } from '../../../shared/contexts/AuthContext';

function ThesisListPage() {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Lista de Teses
            </Typography>
            <Typography variant="body1">
                Bem-vindo, {user?.first_name || user?.username}!
                Aqui você pode visualizar as teses disponíveis.
            </Typography>
        </Container>
    );
}

export default ThesisListPage;