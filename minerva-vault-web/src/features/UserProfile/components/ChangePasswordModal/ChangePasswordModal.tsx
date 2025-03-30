import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { tokens } from '../../../../theme/theme';
import { ChangePasswordData } from '../../dto/userProfileDTO';
import UserProfileController from '../../controller/UserProfileController';
import { useAuth } from '../../../../shared/contexts/AuthContext';

interface ChangePasswordModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}


interface FormErrors {
    current_password?: string;
    new_password?: string;
    password_confirmation?: string;
    general?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ openModal, setOpenModal }) => {
    const { setUser } = useAuth();
    const { changePassword, getCurrentUserProfile } = UserProfileController();
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
                }

                handleClose();
            }
            
        } catch (error: any) {
            setErrors({
                general: error.message || 'Erro ao alterar senha. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }


    };

    const handleClose = () => {
        setFormData({
            current_password: '',
            new_password: '',
            password_confirmation: ''
        });
        setErrors({});
        setOpenModal(false);
    };

    const isFormFilled = formData.current_password && formData.new_password && formData.password_confirmation;

    return (
        <Dialog
            open={openModal}
            onClose={(e, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: tokens.colors.bg.secondary,
                        color: tokens.colors.text.primary,
                        borderRadius: 2,
                    }
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Alterar Senha</Typography>
                {!loading && (
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            color: tokens.colors.text.secondary,
                            '&:hover': {
                                color: tokens.colors.text.primary,
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent dividers sx={{ backgroundColor: tokens.colors.bg.secondary, pt: 2 }}>
                {errors.general && (
                    <Box sx={{ mb: 2 }}>
                        <Typography color={tokens.colors.feedback.error} variant="body2">
                            {errors.general}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color={tokens.colors.text.secondary} sx={{ mb: 0.5 }}>
                        Senha Atual
                    </Typography>
                    <TextField
                        fullWidth
                        name="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.current_password}
                        onChange={handleChange}
                        disabled={loading}
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
                                            disabled={loading}
                                            sx={{ color: tokens.colors.text.disabled }}
                                        >
                                            {showCurrentPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                            formHelperText: {
                                sx: {
                                    color: tokens.colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: tokens.colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: tokens.colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: tokens.colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color={tokens.colors.text.secondary} sx={{ mb: 0.5 }}>
                        Nova Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.new_password}
                        onChange={handleChange}
                        disabled={loading}
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
                                            disabled={loading}
                                            sx={{ color: tokens.colors.text.disabled }}
                                        >
                                            {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                            formHelperText: {
                                sx: {
                                    color: tokens.colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: tokens.colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: tokens.colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: tokens.colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color={tokens.colors.text.secondary} sx={{ mb: 0.5 }}>
                        Confirme a Nova Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        disabled={loading}
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
                                            disabled={loading}
                                            sx={{ color: tokens.colors.text.disabled }}
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                            formHelperText: {
                                sx: {
                                    color: tokens.colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: tokens.colors.bg.elevated,
                                '& fieldset': {
                                    borderColor: tokens.colors.border.default,
                                },
                                '&:hover fieldset': {
                                    borderColor: tokens.colors.border.focus,
                                },
                            }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, backgroundColor: tokens.colors.bg.secondary }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        borderColor: tokens.colors.border.active,
                        color: tokens.colors.text.primary,
                        '&:hover': {
                            borderColor: tokens.colors.border.focus,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isFormFilled || loading}
                    sx={{
                        backgroundColor: tokens.colors.action.primary,
                        '&:hover': {
                            backgroundColor: tokens.colors.action.hover,
                        },
                        minWidth: '100px',
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePasswordModal;