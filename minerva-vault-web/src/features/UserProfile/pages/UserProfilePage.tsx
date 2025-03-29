import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../../../shared/contexts/AuthContext';

function UserProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Perfil do Usuário
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Nome</Typography>
                    <Typography variant="body1">
                        {user.first_name} {user.last_name}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Username</Typography>
                    <Typography variant="body1">{user.username}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Email</Typography>
                    <Typography variant="body1">{user.email}</Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle1">Funções</Typography>
                    <Typography variant="body1">
                        {user.roles.map(role => role.name).join(', ')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default UserProfilePage;