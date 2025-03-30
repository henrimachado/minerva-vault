import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import { tokens } from '../../../theme/theme';
import { useAuth } from '../../contexts/AuthContext';

const PasswordChangeNotificationModal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const colors = tokens.colors;

    const showModal = user &&
        user.password_status &&
        user.password_status.needs_change === true;

    const handleUpdatePassword = () => {
        navigate('/atualizar-senha');
    };

    if (!showModal) {
        return null;
    }

    const urgencyLevels: Record<string, { color: string, message: string }> = {
        EXPIRED: {
            color: colors.feedback.error,
            message: 'Sua senha expirou e precisa ser alterada imediatamente para continuar usando o sistema.'
        },
        CRITICAL: {
            color: colors.feedback.error,
            message: 'Sua senha expirará muito em breve e precisa ser alterada.'
        },
        WARNING: {
            color: colors.feedback.warning,
            message: 'Sua senha expirará em breve. Recomendamos alterá-la.'
        },
        OK: {
            color: colors.feedback.info,
            message: 'É necessário alterar sua senha.'
        }
    };

    const urgency = user.password_status.urgency || 'OK';
    const urgencyData = urgencyLevels[urgency];

    return (
        <Dialog
            open={true}
            disableEscapeKeyDown
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.bg.secondary,
                        color: colors.text.primary,
                        borderRadius: 2,
                    }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: urgencyData.color }} />
                <Typography variant="h6">Ação necessária</Typography>
            </DialogTitle>

            <DialogContent>
                <Alert severity={urgency === 'EXPIRED' || urgency === 'CRITICAL' ? 'error' : urgency === 'WARNING' ? 'warning' : 'info'} sx={{ mb: 2 }}>
                    {urgencyData.message}
                </Alert>


                {user.password_status.days_until_expiration !== undefined && (
                    <Box sx={{ mb: 2 }}>
                        {user.password_status.days_until_expiration < 0 ? (
                            <Typography variant="body2" color={colors.feedback.error} fontWeight={500}>
                                Sua senha expirou há {Math.abs(user.password_status.days_until_expiration)} dias.
                            </Typography>
                        ) : (
                            <Typography variant="body2" color={colors.feedback.warning} fontWeight={500}>
                                Sua senha expirará em {user.password_status.days_until_expiration} dias.
                            </Typography>
                        )}
                    </Box>
                )}

                <Typography variant="body2" color={colors.text.secondary}>
                    Você não poderá acessar todas as funcionalidades do sistema até que sua senha seja atualizada.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={handleUpdatePassword}
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: colors.action.primary,
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: colors.action.hover,
                            boxShadow: 'none',
                        },
                        py: 1,
                    }}
                >
                    Atualizar senha agora
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasswordChangeNotificationModal;