import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    InputAdornment,
    IconButton,
    Paper,
    Container,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { tokens } from '../../../../theme/theme';
import { ChangePasswordData } from '../../../UserProfile/dto/userProfileDTO';
import UserProfileController from '../../../UserProfile/controller/UserProfileController';
import { useAuth } from '../../../../shared/contexts/AuthContext';

interface FormErrors {
    current_password?: string;
    new_password?: string;
    password_confirmation?: string;
    general?: string;
}

const UpdatePasswordPage: React.FC = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const { changePassword, getCurrentUserProfile } = UserProfileController();
    const colors = tokens.colors;

    const [formData, setFormData] = useState<ChangePasswordData>({
        current_password: '',
        new_password: '',
        password_confirmation: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);


    useEffect(() => {
        if (user && !user.password_status.needs_change) {
            navigate('/perfil', { replace: true });
        }
    }, [user, navigate]);


    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (success && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (success && countdown === 0) {
            navigate('/perfil', { replace: true });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [success, countdown, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.current_password) {
            newErrors.current_password = 'A senha atual é obrigatória';
        }

        if (!formData.new_password) {
            newErrors.new_password = 'A nova senha é obrigatória';
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = 'A senha deve ter pelo menos 8 caracteres';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'A confirmação da senha é obrigatória';
        } else if (formData.new_password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const changedPassword = await changePassword(formData);
            if (changedPassword) {

                const updatedUser = await getCurrentUserProfile();

                if (updatedUser) {
                    setUser(updatedUser);
                    setSuccess(true);
                }
            }
        } catch (error: any) {
            setErrors({
                general: error.message || 'Erro ao alterar senha. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    const isFormFilled = formData.current_password && formData.new_password && formData.password_confirmation;

    return (
        <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    backgroundColor: colors.bg.secondary,
                    color: colors.text.primary,
                    borderRadius: 2,
                    p: 4
                }}
            >
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Alteração de Senha
                </Typography>

                <Typography variant="body2" color={colors.text.secondary} sx={{ mb: 3 }} align="center">
                    Por razões de segurança, você precisa alterar sua senha.
                    {user?.password_status?.days_until_expiration !== undefined && (
                        <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            {user.password_status.days_until_expiration < 0 ? (
                                <span style={{ color: colors.feedback.error }}>
                                    Sua senha expirou há {Math.abs(user.password_status.days_until_expiration)} dias.
                                </span>
                            ) : (
                                <span style={{ color: colors.feedback.warning }}>
                                    Sua senha expirará em {user.password_status.days_until_expiration} dias.
                                </span>
                            )}
                        </Box>
                    )}
                </Typography>

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Senha alterada com sucesso! Você será redirecionado em {countdown} segundos...
                    </Alert>
                )}

                {errors.general && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errors.general}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color={colors.text.secondary} sx={{ mb: 0.5 }}>
                        Senha Atual
                    </Typography>
                    <TextField
                        fullWidth
                        name="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.current_password}
                        onChange={handleChange}
                        disabled={loading || success}
                        error={!!errors.current_password}
                        helperText={errors.current_password}
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            edge="end"
                                            size="small"
                                            disabled={loading || success}
                                            sx={{ color: colors.text.disabled }}
                                        >
                                            {showCurrentPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            },
                            formHelperText: {
                                sx: {
                                    color: colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color={colors.text.secondary} sx={{ mb: 0.5 }}>
                        Nova Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.new_password}
                        onChange={handleChange}
                        disabled={loading || success}
                        error={!!errors.new_password}
                        helperText={errors.new_password}
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                            size="small"
                                            disabled={loading || success}
                                            sx={{ color: colors.text.disabled }}
                                        >
                                            {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            },
                            formHelperText: {
                                sx: {
                                    color: colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" color={colors.text.secondary} sx={{ mb: 0.5 }}>
                        Confirme a Nova Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        disabled={loading || success}
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation}
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                            size="small"
                                            disabled={loading || success}
                                            sx={{ color: colors.text.disabled }}
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            },
                            formHelperText: {
                                sx: {
                                    color: colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!isFormFilled || loading || success}
                    sx={{
                        backgroundColor: colors.action.primary,
                        '&:hover': {
                            backgroundColor: colors.action.hover,
                        },
                        py: 1.5,
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Alterar Senha"}
                </Button>
            </Paper>
        </Container>
    );
};

export default UpdatePasswordPage;