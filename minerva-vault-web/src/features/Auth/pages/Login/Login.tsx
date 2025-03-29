import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, TextField, Button, Typography,
    Paper, Avatar, Alert, CircularProgress, Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthController from '../../controller/AuthController';
import UserProfileController from '../../../UserProfile/controller/UserProfileController';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { tokens } from '../../../../theme/theme';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { setUser } = useAuth();

    const authController = AuthController();
    const userProfileController = UserProfileController();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const authenticated = await authController.login({ username, password });

            if (authenticated) {
                const userProfile = await userProfileController.getCurrentUserProfile();

                if (userProfile) {
                    setUser(userProfile);
                }
            }

            navigate('/thesis');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.join(', ') ||
                'Falha ao realizar login';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: 'auto',
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: '100%',
                    backgroundColor: tokens.colors.bg.primary,
                    color: tokens.colors.text.primary,
                    p: 2.5,
                    borderRadius: 2,
                }}
            >

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5
                    }}
                >
                    <Avatar
                        sx={{
                            width: 52,
                            height: 52,
                            bgcolor: tokens.colors.action.primary,
                        }}
                    >
                        <LockOutlinedIcon sx={{ fontSize: 20, color: tokens.colors.text.primary }} />
                    </Avatar>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 1.5,
                            py: 0,
                            '& .MuiAlert-message': { py: 0.5 }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Typography variant="caption" sx={{ mb: 0.25 }}>
                        Nome de usuário
                    </Typography>
                    <TextField
                        required
                        fullWidth
                        id="username"
                        name="username"
                        variant="outlined"
                        size="small"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoComplete="username"
                        autoFocus
                        sx={{ mt: 0.25, mb: 1.5 }}
                    />

                    <Typography variant="caption" sx={{ mb: 0.25 }}>
                        Senha
                    </Typography>
                    <TextField
                        required
                        fullWidth
                        name="password"
                        type="password"
                        id="password"
                        variant="outlined"
                        size="small"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                        sx={{ mt: 0.25 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 2,
                            mb: 1,
                            py: 0.6,
                            height: '36px',
                            backgroundColor: tokens.colors.action.primary,
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: tokens.colors.action.hover,
                                boxShadow: 'none',
                            },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        disabled={loading || !username || !password}
                    >
                        {loading ? <CircularProgress size={20} /> : "Entrar"}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Typography variant="caption" color={tokens.colors.text.secondary}>
                            Não tem uma conta? <RouterLink to="/signup" style={{ color: tokens.colors.action.primary, textDecoration: 'none' }}>Cadastre-se</RouterLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;