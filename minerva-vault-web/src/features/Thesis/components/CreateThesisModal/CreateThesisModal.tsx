import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Autocomplete,
    Chip,
    InputAdornment,
    Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br'; // Importação para localização em português
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { tokens } from '../../../../theme/theme';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { UserOption, CreateThesisFormData } from '../../dto/createThesisDTO';

// Mock de usuários para teste
const MOCK_USERS: UserOption[] = [
    { id: '1', name: 'João Silva', role: 'STUDENT' },
    { id: '2', name: 'Maria Santos', role: 'STUDENT' },
    { id: '3', name: 'Pedro Oliveira', role: 'STUDENT' },
    { id: '4', name: 'Ana Costa', role: 'STUDENT' },
    { id: '5', name: 'Carlos Pereira', role: 'PROFESSOR' },
    { id: '6', name: 'Fernanda Lima', role: 'PROFESSOR' },
    { id: '7', name: 'Roberto Almeida', role: 'PROFESSOR' },
    { id: '8', name: 'Luciana Martins', role: 'PROFESSOR' }
];

interface CreateThesisModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateThesisModal: React.FC<CreateThesisModalProps> = ({
    open,
    onClose,
    onSuccess
}) => {
    const colors = tokens.colors;
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verificar se o usuário é professor
    const isProfessor = user?.roles?.some(role => role.name === 'PROFESSOR');

    // Estados
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<UserOption[]>([]);
    const [professors, setProfessors] = useState<UserOption[]>([]);
    const [formData, setFormData] = useState<CreateThesisFormData>({
        title: '',
        author_id: '',
        advisor_id: '',
        co_advisor_id: null,
        abstract: '',
        keywords: '',
        defense_date: '',
        pdf_file: null
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Efeito para carregar usuários
    useEffect(() => {
        // Simulação de carregamento de usuários
        // Em produção, substituir por chamada à API
        const loadUsers = async () => {
            try {
                // Simular delay de rede
                await new Promise(resolve => setTimeout(resolve, 500));

                // Filtrar usuários por papel
                const mockStudents = MOCK_USERS.filter(u => u.role === 'STUDENT');
                const mockProfessors = MOCK_USERS.filter(u => u.role === 'PROFESSOR');

                setStudents(mockStudents);
                setProfessors(mockProfessors);

                // Se for estudante, preencher automaticamente o campo de autor
                if (!isProfessor && user) {
                    setFormData(prev => ({
                        ...prev,
                        author_id: user.id
                    }));
                }
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        };

        if (open) {
            loadUsers();
        }
    }, [open, isProfessor, user]);

    // Manipuladores de eventos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpar erro do campo quando o usuário digita
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name: string, value: string | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpar erro do campo quando o usuário seleciona
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date: any) => {
        if (date) {
            // Usando dayjs para formatar a data
            const formattedDate = date.format('YYYY-MM-DD');
            setFormData(prev => ({ ...prev, defense_date: formattedDate }));

            // Limpar erro do campo quando o usuário seleciona uma data
            if (errors.defense_date) {
                setErrors(prev => ({ ...prev, defense_date: '' }));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            // Verificar se é um PDF
            if (!file.name.endsWith('.pdf')) {
                setErrors(prev => ({ ...prev, pdf_file: 'O arquivo deve ser um PDF' }));
                return;
            }

            setFormData(prev => ({ ...prev, pdf_file: file }));

            // Limpar erro do campo quando o usuário seleciona um arquivo
            if (errors.pdf_file) {
                setErrors(prev => ({ ...prev, pdf_file: '' }));
            }
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => ({ ...prev, pdf_file: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar formulário
        const validationErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            validationErrors.title = 'O título é obrigatório';
        } else if (formData.title.length > 255) {
            validationErrors.title = 'O título deve ter no máximo 255 caracteres';
        }

        if (!formData.author_id) {
            validationErrors.author_id = 'O autor é obrigatório';
        }

        if (!formData.advisor_id) {
            validationErrors.advisor_id = 'O orientador é obrigatório';
        }

        if (!formData.abstract.trim()) {
            validationErrors.abstract = 'O resumo é obrigatório';
        }

        if (!formData.keywords.trim()) {
            validationErrors.keywords = 'As palavras-chave são obrigatórias';
        } else if (formData.keywords.length > 255) {
            validationErrors.keywords = 'As palavras-chave devem ter no máximo 255 caracteres';
        }

        if (!formData.defense_date) {
            validationErrors.defense_date = 'A data de defesa é obrigatória';
        }

        if (!formData.pdf_file) {
            validationErrors.pdf_file = 'O arquivo PDF é obrigatório';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Enviar formulário
        setLoading(true);

        try {
            // Simulação de envio para API
            // Em produção, substituir por chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Dados enviados:', formData);

            // Criar FormData para envio do arquivo
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'pdf_file' && value) {
                    formDataToSend.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formDataToSend.append(key, String(value));
                }
            });

            // Aqui seria a chamada à API
            // const response = await api.post('/thesis', formDataToSend);

            // Fechar modal e notificar sucesso
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Erro ao criar monografia:', error);
            // Tratar erros da API
        } finally {
            setLoading(false);
        }
    };

    // Formatação de bytes para exibição do tamanho do arquivo
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 2,
                    }
                }
            }}
        >
            <DialogTitle sx={{ color: colors.text.primary, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        Cadastrar Nova Monografia
                    </Typography>
                    {!loading && (
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon sx={{ color: colors.text.secondary }} />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ bgcolor: colors.bg.secondary, py: 3 }}>
                    <Grid container spacing={2}>
                        {/* Título - full width */}
                        <Grid size={12}>
                            <TextField
                                name="title"
                                label="Título da Monografia"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.title}
                                helperText={errors.title}
                                disabled={loading}
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
                        </Grid>

                        {/* Autor e Data na mesma linha */}
                        <Grid size={6}>
                            <Autocomplete
                                id="author-select"
                                options={students}
                                getOptionLabel={(option) => option.name}
                                value={students.find(s => s.id === formData.author_id) || null}
                                onChange={(_, newValue) => handleSelectChange('author_id', newValue?.id || '')}
                                disabled={loading || !isProfessor}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Autor"
                                        required
                                        error={!!errors.author_id}
                                        helperText={errors.author_id}
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
                                )}
                            />
                        </Grid>
                        <Grid size={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                <DatePicker
                                    label="Data de Defesa"
                                    value={formData.defense_date ? dayjs(formData.defense_date) : null}
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error: !!errors.defense_date,
                                            helperText: errors.defense_date,
                                            disabled: loading,
                                            sx: {
                                                width: '100%',
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: colors.bg.elevated,
                                                    '& fieldset': {
                                                        borderColor: colors.border.default,
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: colors.border.focus,
                                                    },
                                                }
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Orientador e Coorientador na mesma linha */}
                        <Grid size={6}>
                            <Autocomplete
                                id="advisor-select"
                                options={professors}
                                getOptionLabel={(option) => option.name}
                                value={professors.find(p => p.id === formData.advisor_id) || null}
                                onChange={(_, newValue) => handleSelectChange('advisor_id', newValue?.id || '')}
                                disabled={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Orientador"
                                        required
                                        error={!!errors.advisor_id}
                                        helperText={errors.advisor_id}
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
                                )}
                            />
                        </Grid>
                        <Grid size={6}>
                            <Autocomplete
                                id="co-advisor-select"
                                options={professors}
                                getOptionLabel={(option) => option.name}
                                value={professors.find(p => p.id === formData.co_advisor_id) || null}
                                onChange={(_, newValue) => handleSelectChange('co_advisor_id', newValue?.id || null)}
                                disabled={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Co-orientador (opcional)"
                                        error={!!errors.co_advisor_id}
                                        helperText={errors.co_advisor_id}
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
                                )}
                            />
                        </Grid>

                        {/* Palavras-chave - full width */}
                        <Grid size={12}>
                            <TextField
                                name="keywords"
                                label="Palavras-chave (separadas por vírgula)"
                                value={formData.keywords}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.keywords}
                                helperText={errors.keywords || "Ex: Inteligência Artificial, Machine Learning, Redes Neurais"}
                                disabled={loading}
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
                        </Grid>

                        {/* Resumo - full width */}
                        <Grid size={12}>
                            <TextField
                                name="abstract"
                                label="Resumo"
                                value={formData.abstract}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={4}
                                error={!!errors.abstract}
                                helperText={errors.abstract}
                                disabled={loading}
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
                        </Grid>

                        {/* Upload de PDF - full width */}
                        <Grid size={12}>
                            <Box
                                sx={{
                                    border: `1px dashed ${errors.pdf_file ? colors.feedback.error : colors.border.default}`,
                                    borderRadius: 1,
                                    p: 3,
                                    backgroundColor: colors.bg.elevated,
                                    textAlign: 'center',
                                    cursor: formData.pdf_file ? 'default' : 'pointer',
                                    '&:hover': {
                                        borderColor: formData.pdf_file ? colors.border.default : colors.border.focus,
                                    }
                                }}
                                onClick={() => !formData.pdf_file && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />

                                {formData.pdf_file ? (
                                    <Box>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <PictureAsPdfIcon sx={{ color: colors.action.primary, fontSize: 40, mr: 1 }} />
                                            <Box textAlign="left">
                                                <Typography variant="subtitle1" sx={{ color: colors.text.primary }}>
                                                    {formData.pdf_file.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                                                    {formatBytes(formData.pdf_file.size)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            startIcon={<DeleteIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile();
                                            }}
                                            disabled={loading}
                                            sx={{
                                                color: colors.feedback.error,
                                                '&:hover': {
                                                    backgroundColor: `${colors.feedback.error}10`,
                                                }
                                            }}
                                        >
                                            Remover arquivo
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <CloudUploadIcon sx={{ fontSize: 48, color: colors.text.secondary, mb: 1 }} />
                                        <Typography variant="subtitle1" sx={{ color: colors.text.primary, mb: 0.5 }}>
                                            Clique para fazer upload do PDF
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                                            Arraste e solte ou clique para selecionar
                                        </Typography>
                                        {errors.pdf_file && (
                                            <Typography variant="body2" sx={{ color: colors.feedback.error, mt: 1 }}>
                                                {errors.pdf_file}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ bgcolor: colors.bg.secondary, p: 2 }}>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            color: colors.text.secondary,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: colors.action.primary,
                            '&:hover': {
                                backgroundColor: colors.action.hover,
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Cadastrar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateThesisModal;