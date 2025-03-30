import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Avatar,
    TextField,
    Button,
    Grid,
    Divider,
    Alert,
    IconButton,
    CircularProgress,
    AlertColor
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { UpdateUserProfileDTO } from '../dto/userProfileDTO';
import UserController from '../controller/UserProfileController';
import { tokens } from '../../../theme/theme';
import { userRoleEnum } from '../utils/userRoleEnum';
import ChangePasswordModal from '../components/ChangePasswordModal/ChangePasswordModal';

interface FormErrors {
    first_name?: string;
    last_name?: string;
    avatar?: string;
    general?: string;
}

function UserProfilePage() {
    const { user, setUser } = useAuth();
    const { updateUser, getCurrentUserProfile } = UserController();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarDeleted, setAvatarDeleted] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [changePasswordModal, setChangePasswordModal] = useState(false);


    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setAvatarPreview(user.avatar_url);
            setAvatarDeleted(false);
            setIsPageLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const firstNameChanged = firstName !== user.first_name;
            const lastNameChanged = lastName !== user.last_name;
            const avatarChanged = avatarFile !== null || avatarDeleted;

            setHasChanges(firstNameChanged || lastNameChanged || avatarChanged);
        }
    }, [firstName, lastName, avatarFile, avatarDeleted, user]);

    if (isPageLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100%'
                }}
            >
                <CircularProgress size={60} sx={{ color: tokens.colors.action.primary }} />
            </Box>
        );
    }

    if (!user) return null;

    const toggleEditMode = () => {
        if (isEditing) {
            resetForm();
        }
        setIsEditing(!isEditing);
        setErrors({});
    };

    const resetForm = () => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setAvatarPreview(user.avatar_url);
            setAvatarFile(null);
            setAvatarDeleted(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
                setErrors({ ...errors, avatar: 'Formato de imagem inválido. Use JPG, PNG ou GIF.' });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, avatar: 'A imagem deve ter no máximo 5MB.' });
                return;
            }

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarDeleted(false);
            setErrors({ ...errors, avatar: undefined });
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarFile(null);
        setAvatarDeleted(true);
        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (firstName === '') {
            newErrors.first_name = 'Nome não pode estar vazio.';
        }

        if (lastName === '') {
            newErrors.last_name = 'Sobrenome não pode estar vazio.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSaveChanges = async () => {
        if (!user) return;

        if (!validateForm()) {
            return;
        }
        const updatedData: UpdateUserProfileDTO = {};

        if (firstName !== user.first_name) {
            updatedData.first_name = firstName;
        }

        if (lastName !== user.last_name) {
            updatedData.last_name = lastName;
        }

        if (avatarFile || avatarDeleted) {
            updatedData.avatar = avatarDeleted ? null : avatarFile;
        }

        if (Object.keys(updatedData).length === 0) {
            return;
        }

        setIsSaving(true);

        try {
            await updateUser(updatedData, user.id);


            setIsPageLoading(true);

            const updatedUser = await getCurrentUserProfile();

            if (updatedUser) {
                setUser(updatedUser);
            }

            setIsEditing(false);
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            setErrors({
                general: error.message || 'Erro ao atualizar perfil. Tente novamente.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getPasswordAlertSeverity = (): AlertColor => {
        if (!user.password_status) return 'info';

        switch (user.password_status.urgency) {
            case 'EXPIRED':
            case 'CRITICAL':
                return 'error';
            case 'WARNING':
                return 'warning';
            case 'OK':
                return 'success';
            default:
                return 'info';
        }
    };

    const getPasswordAlertMessage = (): string => {
        if (!user.password_status) return '';

        if (user.password_status.urgency === 'EXPIRED') {
            return 'Sua senha expirou. Por favor, altere-a imediatamente.';
        } else if (user.password_status.urgency === 'CRITICAL') {
            return `Sua senha expira em ${user.password_status.days_until_expiration} dias. Altere-a em breve.`;
        } else if (user.password_status.urgency === 'WARNING') {
            return `Sua senha expira em ${user.password_status.days_until_expiration} dias.`;
        } else if (user.password_status.urgency === 'OK') {
            return `Sua senha está válida por mais ${user.password_status.days_until_expiration} dias.`;
        }

        return '';
    };

    const renderPasswordAlert = () => {
        if (!user.password_status) return null;

        return (
            <Alert
                severity={getPasswordAlertSeverity()}
                sx={{ mb: 2 }}
            >
                {getPasswordAlertMessage()}
            </Alert>
        );
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Perfil do Usuário
                </Typography>

                {!isEditing ? (
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={toggleEditMode}
                        sx={{
                            borderColor: tokens.colors.border.active,
                            color: tokens.colors.text.primary,
                            '&:hover': {
                                borderColor: tokens.colors.action.primary,
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                        }}
                    >
                        Editar Perfil
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={toggleEditMode}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={isSaving ? null : <SaveIcon />}
                            onClick={handleSaveChanges}
                            disabled={!hasChanges || isSaving}
                            sx={{ minWidth: '120px' }}
                        >
                            {isSaving ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
                        </Button>
                    </Box>
                )}
            </Box>

            {errors.general && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        py: 0.5,
                        '& .MuiAlert-message': { py: 0.5 }
                    }}
                >
                    {errors.general}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3, backgroundColor: tokens.colors.bg.secondary }}>
                <Grid container spacing={3}>
                    <Grid size={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={avatarPreview || undefined}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: `3px solid ${tokens.colors.border.default}`,
                                    backgroundColor: tokens.colors.bg.elevated,
                                    cursor: isEditing && !isSaving ? 'pointer' : 'default',
                                }}
                                onClick={isEditing && !isSaving ? () => fileInputRef.current?.click() : undefined}
                            >
                                {!avatarPreview && (
                                    user.first_name && user.last_name
                                        ? `${user.first_name[0]}${user.last_name[0]}`
                                        : user.username[0].toUpperCase()
                                )}
                            </Avatar>

                            <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={!isEditing || isSaving}
                                />

                                {isEditing && (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                backgroundColor: tokens.colors.action.primary,
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: tokens.colors.action.hover,
                                                },
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                        >
                                            <CameraAltIcon fontSize="small" />
                                        </IconButton>

                                        {(avatarPreview || avatarFile) && (
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    backgroundColor: tokens.colors.feedback.error,
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#d32f2f',
                                                    },
                                                }}
                                                onClick={handleRemoveAvatar}
                                                disabled={isSaving}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {errors.avatar && (
                            <Typography
                                variant="caption"
                                align="center"
                                color={tokens.colors.feedback.error}
                                sx={{ display: 'block', mt: 1 }}
                            >
                                {errors.avatar}
                            </Typography>
                        )}
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="subtitle2" color={tokens.colors.text.secondary}>
                            Nome de Usuário
                        </Typography>
                        <TextField
                            fullWidth
                            value={user.username}
                            variant="outlined"
                            size="small"
                            margin="dense"
                            disabled={true}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: tokens.colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: tokens.colors.border.default,
                                    },
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: tokens.colors.text.primary,
                                    opacity: 0.8,
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="subtitle2" color={tokens.colors.text.secondary}>
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            value={user.email}
                            variant="outlined"
                            size="small"
                            margin="dense"
                            disabled={true}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: tokens.colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: tokens.colors.border.default,
                                    },
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: tokens.colors.text.primary,
                                    opacity: 0.8,
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 1, backgroundColor: tokens.colors.border.default }} />
                    </Grid>


                    <Grid size={6}>
                        <Typography variant="subtitle2" color={tokens.colors.text.secondary}>
                            Nome
                        </Typography>
                        <TextField
                            fullWidth
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            variant="outlined"
                            size="small"
                            margin="dense"
                            disabled={!isEditing || isSaving}
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: tokens.colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: tokens.colors.border.default,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isEditing ? tokens.colors.border.focus : tokens.colors.border.default,
                                    },
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: tokens.colors.text.primary,
                                    opacity: 0.8,
                                },
                                '& .MuiFormHelperText-root': {
                                    color: tokens.colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="subtitle2" color={tokens.colors.text.secondary}>
                            Sobrenome
                        </Typography>
                        <TextField
                            fullWidth
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            variant="outlined"
                            size="small"
                            margin="dense"
                            disabled={!isEditing || isSaving}
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: tokens.colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: tokens.colors.border.default,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isEditing ? tokens.colors.border.focus : tokens.colors.border.default,
                                    },
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: tokens.colors.text.primary,
                                    opacity: 0.8,
                                },
                                '& .MuiFormHelperText-root': {
                                    color: tokens.colors.feedback.error,
                                    marginTop: 0.25,
                                    fontSize: '0.7rem'
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 1, backgroundColor: tokens.colors.border.default }} />
                    </Grid>

                    <Grid size={12}>
                        <Typography variant="subtitle2" color={tokens.colors.text.secondary}>
                            Funções
                        </Typography>
                        <Typography variant="body1">
                            {user.roles.map(role => userRoleEnum[role.name] || role.name).join(', ')}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>


            <Paper sx={{ p: 3, backgroundColor: tokens.colors.bg.secondary }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Segurança
                </Typography>

                {renderPasswordAlert()}

                <Button
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={() => setChangePasswordModal(true)}
                    sx={{
                        backgroundColor: tokens.colors.action.primary,
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: tokens.colors.action.hover,
                            boxShadow: 'none',
                        },
                    }}
                >
                    Alterar Senha
                </Button>

                <ChangePasswordModal
                    openModal={changePasswordModal}
                    setOpenModal={setChangePasswordModal}
                />
            </Paper>
        </Container>
    );
}

export default UserProfilePage;