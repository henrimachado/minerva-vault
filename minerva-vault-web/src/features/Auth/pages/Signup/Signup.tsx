import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    Paper,
    Avatar,
    Alert,
    CircularProgress,
    FormControl,
    Select,
    MenuItem,
    FormHelperText,
    IconButton,
    InputAdornment,
    Divider,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import { CreateUser, UserRole } from '../../../UserProfile/dto/userProfileDTO';
import UserController from '../../../UserProfile/controller/UserProfileController';
import { tokens } from '../../../../theme/theme';
import { userRoleEnum } from '../../../UserProfile/utils/userRoleEnum';

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    first_name?: string;
    last_name?: string;
    role_id?: string;
    avatar?: string;
    general?: string;
}

function SignUp() {
    const navigate = useNavigate();
    const { getUserRoles, createUser } = UserController();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showEditIcon, setShowEditIcon] = useState(false);

    const [formData, setFormData] = useState<CreateUser>({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        first_name: '',
        last_name: '',
        role_id: '',
        avatar: null,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const fetchRoles = async () => {
        setRolesLoading(true);
        const userRoles = await getUserRoles();
        if (userRoles) {
            setRoles(userRoles);
        }
        setRolesLoading(false);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as { name: string; value: unknown };
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name as keyof FormErrors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            });
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

            setFormData({ ...formData, avatar: file });
            setAvatarPreview(URL.createObjectURL(file));
            setErrors({ ...errors, avatar: undefined });
        }
    };

    const clearAvatar = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAvatarPreview(null);
        setFormData({ ...formData, avatar: null });

        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username) {
            newErrors.username = 'Nome de usuário é obrigatório.';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres.';
        }

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Email inválido.';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Senha deve ter pelo menos 8 caracteres.';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Confirmação de senha é obrigatória.';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'As senhas não coincidem.';
        }

        if (!formData.role_id) {
            newErrors.role_id = 'Função é obrigatória.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const isSuccessful = await createUser(formData);
            if (isSuccessful) {
                navigate('/signin');
            }
            else throw new Error('Falha ao criar usuário');
        } catch (error: any) {
            console.error(error);
            setErrors({ general: 'Erro ao processar seu cadastro. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('avatar-upload')?.click();
    };

    return (
        <Container
            component="main"
            maxWidth="sm"
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
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography component="h1" variant="h5" align="center" sx={{ mb: 1.5 }}>
                    Cadastre-se
                </Typography>

                <Divider
                    sx={{
                        backgroundColor: tokens.colors.text.primary,
                        opacity: 0.2,
                        mt: 1,
                        mb: 2,
                        height: '2px',
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                        }}
                    >
                        <Avatar
                            src={avatarPreview || undefined}
                            sx={{
                                width: 80,
                                height: 80,
                                cursor: 'pointer',
                                bgcolor: tokens.colors.bg.secondary,
                                border: `2px solid ${tokens.colors.border.default}`,
                                '&:hover': { opacity: 0.8 }
                            }}
                            onClick={triggerFileInput}
                        >
                            {!avatarPreview && <CameraAltIcon sx={{ fontSize: 40 }} />}
                        </Avatar>

                        {!avatarPreview && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '50%',
                                    opacity: showEditIcon ? 1 : 0,
                                    transition: 'opacity 0.3s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={() => setShowEditIcon(true)}
                                onMouseLeave={() => setShowEditIcon(false)}
                                onClick={triggerFileInput}
                            >
                                <EditIcon sx={{ color: tokens.colors.text.primary, fontSize: 24 }} />
                            </Box>
                        )}

                        {avatarPreview && (
                            <IconButton
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    width: 22,
                                    height: 22,
                                    backgroundColor: tokens.colors.bg.secondary,
                                    border: `1px solid ${tokens.colors.border.default}`,
                                    color: tokens.colors.text.secondary,
                                    '&:hover': {
                                        backgroundColor: tokens.colors.bg.elevated,
                                        color: tokens.colors.text.primary,
                                    }
                                }}
                                onClick={clearAvatar}
                                aria-label="limpar avatar"
                            >
                                <ClearIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}

                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarChange}
                            disabled={loading}
                        />
                    </Box>
                </Box>

                {errors.avatar && (
                    <Typography
                        variant="caption"
                        align="center"
                        color={tokens.colors.feedback.error}
                        sx={{ display: 'block', mb: 1 }}
                    >
                        {errors.avatar}
                    </Typography>
                )}

                {errors.general && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 1.5,
                            py: 0,
                            '& .MuiAlert-message': { py: 0.5 }
                        }}
                    >
                        {errors.general}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={1.5}>
                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Nome*
                            </Typography>
                            <TextField
                                fullWidth
                                id="first_name"
                                name="first_name"
                                variant="outlined"
                                size="small"
                                value={formData.first_name}
                                onChange={handleChange}
                                error={!!errors.first_name}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Sobrenome*
                            </Typography>
                            <TextField
                                fullWidth
                                id="last_name"
                                name="last_name"
                                variant="outlined"
                                size="small"
                                value={formData.last_name}
                                onChange={handleChange}
                                error={!!errors.last_name}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Nome de usuário*
                            </Typography>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                name="username"
                                variant="outlined"
                                size="small"
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                slotProps={{
                                    formHelperText: { sx: { color: tokens.colors.feedback.error, mt: 0.25, fontSize: '0.7rem' } }
                                }}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                E-mail*
                            </Typography>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                name="email"
                                type="email"
                                variant="outlined"
                                size="small"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                slotProps={{
                                    formHelperText: { sx: { color: tokens.colors.feedback.error, mt: 0.25, fontSize: '0.7rem' } }
                                }}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Senha*
                            </Typography>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                variant="outlined"
                                size="small"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                slotProps={{
                                    formHelperText: { sx: { color: tokens.colors.feedback.error, mt: 0.25, fontSize: '0.7rem' } },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: tokens.colors.text.disabled }}
                                                >
                                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Confirme a senha*
                            </Typography>
                            <TextField
                                required
                                fullWidth
                                name="password_confirmation"
                                type={showConfirmPassword ? "text" : "password"}
                                id="password_confirmation"
                                variant="outlined"
                                size="small"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                                slotProps={{
                                    formHelperText: { sx: { color: tokens.colors.feedback.error, mt: 0.25, fontSize: '0.7rem' } },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirm password visibility"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: tokens.colors.text.disabled }}
                                                >
                                                    {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mt: 0.25 }}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="caption" sx={{ mb: 0.25 }}>
                                Você é...
                            </Typography>
                            <FormControl
                                fullWidth
                                error={!!errors.role_id}
                                disabled={loading || rolesLoading}
                                sx={{
                                    mt: 0.25,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: tokens.colors.bg.secondary,
                                        color: tokens.colors.text.primary,
                                        '& fieldset': { borderColor: tokens.colors.border.default },
                                    },
                                }}
                            >
                                <Select
                                    id="role_id"
                                    name="role_id"
                                    value={formData.role_id}
                                    onChange={handleChange as any}
                                    displayEmpty
                                    size="small"
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return 'Escolha sua categoria...';
                                        }
                                        const selectedRole = roles.find(role => role.id === selected);
                                        return selectedRole?.name && selectedRole.name in userRoleEnum
                                            ? userRoleEnum[selectedRole.name]
                                            : selectedRole?.name || "";
                                    }}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.name && role.name in userRoleEnum
                                                ? userRoleEnum[role.name]
                                                : role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.role_id && (
                                    <FormHelperText sx={{ color: tokens.colors.feedback.error, fontSize: '0.7rem' }}>
                                        {errors.role_id}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 2,
                            mb: 1,
                            py: 0.6,
                            backgroundColor: tokens.colors.action.primary,
                            '&:hover': {
                                backgroundColor: tokens.colors.action.hover,
                                boxShadow: 'none',
                            },
                            textTransform: 'none',
                            boxShadow: 'none',
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "Cadastrar"}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color={tokens.colors.text.secondary}>
                            Já tem uma conta? <RouterLink to="/signin" style={{ color: tokens.colors.action.primary, textDecoration: 'none' }}>Login</RouterLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default SignUp;