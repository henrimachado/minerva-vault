import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Divider,
    Paper,
    Typography,
    Button,
    TextField,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog as ConfirmationDialog,
    DialogTitle as ConfirmationDialogTitle,
    DialogContent as ConfirmationDialogContent,
    DialogActions as ConfirmationDialogActions,
    Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { tokens } from '../../../../theme/theme';
import ThesisController from '../../controller/ThesisController';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { ThesisDetail, User } from '../../dto/thesisDTO';
import UserProfileController from '../../../UserProfile/controller/UserProfileController';
import { UserRole } from '../../../UserProfile/dto/userProfileDTO';
import { UpdateThesisFormData } from '../../dto/createThesisDTO';

interface UserOption {
    id: string;
    name: string;
    role: UserRole;
}

interface ThesisEditModalProps {
    open: boolean;
    onClose: (clodeModal: boolean) => void;
    thesisId: string | null;
    onSuccess: () => void;
}

const ThesisEditModal: React.FC<ThesisEditModalProps> = ({
    open,
    onClose,
    thesisId,
    onSuccess
}) => {
    const colors = tokens.colors;
    const { user } = useAuth();
    const { getThesisById, updateThesis, deleteThesis } = ThesisController();
    const { getUsersByRoleId, getUserRoles } = UserProfileController();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [originalThesis, setOriginalThesis] = useState<ThesisDetail | null>(null);
    const [editableThesis, setEditableThesis] = useState<ThesisDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [students, setStudents] = useState<UserOption[]>([]);
    const [professors, setProfessors] = useState<UserOption[]>([]);

    const isStudent = user?.roles?.some(role => role.name === 'STUDENT');
    const isProfessor = user?.roles?.some(role => role.name === 'PROFESSOR');
    const isAdvisor = isProfessor && originalThesis?.advisor?.id === user?.id;
    const isPending = originalThesis?.status === 'PENDING';

    const canEdit = (isStudent && isPending) || isAdvisor;
    const canDelete = (isStudent && isPending) || isAdvisor;
    const canChangeStatus = isAdvisor;


    const canEditAuthor = isProfessor && isAdvisor && isEditing;

    const canEditAdvisor = isEditing && ((isStudent && isPending) || isAdvisor);
    const canEditCoAdvisor = isEditing && ((isStudent && isPending) || isAdvisor);

    const availableAdvisors = professors.filter(
        professor => !editableThesis?.co_advisor?.id || professor.id !== editableThesis.co_advisor.id
    );

    const availableCoAdvisors = professors.filter(
        professor => !editableThesis?.advisor?.id || professor.id !== editableThesis.advisor.id
    );

    useEffect(() => {
        if (open && thesisId) {
            fetchThesisDetails(thesisId);
            loadUsersData();
        } else {
            setOriginalThesis(null);
            setEditableThesis(null);
            setIsEditing(false);
            setHasChanges(false);
            setErrors({});
            setNewPdfFile(null);
        }
    }, [open, thesisId]);


    const loadUsersData = async () => {
        try {
            const userRoles = await getUserRoles();

            if (userRoles) {
                const professorRoleId = userRoles.find(role => role.name === 'PROFESSOR')?.id;
                const studentRoleId = userRoles.find(role => role.name === 'STUDENT')?.id;

                if (professorRoleId && studentRoleId) {
                    const [studentsList, professorsList] = await Promise.all([
                        getUsersByRoleId(studentRoleId),
                        getUsersByRoleId(professorRoleId)
                    ]);

                    setStudents(studentsList);
                    setProfessors(professorsList);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    };


    useEffect(() => {
        if (originalThesis && editableThesis) {
            const hasTextChanges =
                originalThesis.title !== editableThesis.title ||
                originalThesis.abstract !== editableThesis.abstract ||
                originalThesis.keywords !== editableThesis.keywords ||
                originalThesis.defense_date !== editableThesis.defense_date ||
                originalThesis.status !== editableThesis.status;

            const hasRelationChanges =
                originalThesis.author?.id !== editableThesis.author?.id ||
                originalThesis.advisor?.id !== editableThesis.advisor?.id ||
                (originalThesis.co_advisor?.id !== editableThesis.co_advisor?.id);

            setHasChanges(hasTextChanges || hasRelationChanges || newPdfFile !== null);
        } else {
            setHasChanges(false);
        }
    }, [originalThesis, editableThesis, newPdfFile]);

    const fetchThesisDetails = async (id: string) => {
        setLoading(true);
        try {
            const result = await getThesisById(id);
            setOriginalThesis(result);
            setEditableThesis(JSON.parse(JSON.stringify(result)));
        } catch (error) {
            console.error('Error fetching thesis details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = dayjs(dateString);
            return date.format('DD/MM/YYYY');
        } catch (error) {
            return dateString;
        }
    };

    const formatBytes = (bytes: number | undefined) => {
        if (!bytes) return '0 bytes';
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'APPROVED': return 'Aprovado';
            case 'REJECTED': return 'Rejeitado';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (editableThesis) {
            setEditableThesis({
                ...editableThesis,
                [name]: value
            });
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleStatusChange = (e: any) => {
        if (editableThesis) {
            setEditableThesis({
                ...editableThesis,
                status: e.target.value
            });
        }
    };

    const handleDateChange = (date: any) => {
        if (date && editableThesis) {
            const formattedDate = date.format('YYYY-MM-DD');
            setEditableThesis({
                ...editableThesis,
                defense_date: formattedDate
            });

            if (errors.defense_date) {
                setErrors(prev => ({ ...prev, defense_date: '' }));
            }
        }
    };

    const handleAuthorChange = (_: any, newValue: UserOption | null) => {
        if (editableThesis && newValue) {
            setEditableThesis({
                ...editableThesis,
                author: {
                    ...editableThesis.author,
                    id: newValue.id,
                    name: newValue.name
                }
            });
        }

        if (errors.author_id) {
            setErrors(prev => ({ ...prev, author_id: '' }));
        }
    };

    const handleAdvisorChange = (_: any, newValue: UserOption | null) => {
        if (editableThesis && newValue) {
            setEditableThesis({
                ...editableThesis,
                advisor: {
                    ...editableThesis.advisor,
                    id: newValue.id,
                    name: newValue.name
                }
            });
        }

        if (errors.advisor_id) {
            setErrors(prev => ({ ...prev, advisor_id: '' }));
        }
    };

    const handleCoAdvisorChange = (_: any, newValue: UserOption | null) => {
        if (editableThesis) {
            setEditableThesis({
                ...editableThesis,
                co_advisor: newValue ? {
                    id: newValue.id,
                    name: newValue.name
                } : null
            });
        }

        if (errors.co_advisor_id) {
            setErrors(prev => ({ ...prev, co_advisor_id: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            if (!file.name.endsWith('.pdf')) {
                setErrors(prev => ({ ...prev, pdf_file: 'O arquivo deve ser um PDF' }));
                return;
            }

            setNewPdfFile(file);

            if (errors.pdf_file) {
                setErrors(prev => ({ ...prev, pdf_file: '' }));
            }
        }
    };

    const handleToggleEditMode = () => {
        if (isEditing) {
            if (originalThesis) {
                setEditableThesis(JSON.parse(JSON.stringify(originalThesis)));
                setNewPdfFile(null);
            }
            setIsEditing(false);
            setErrors({});
        } else {
            setIsEditing(true);
        }
    };

    const handleDiscard = () => {
        if (originalThesis) {
            setEditableThesis(JSON.parse(JSON.stringify(originalThesis)));
            setNewPdfFile(null);
        }
        setErrors({});
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!editableThesis?.title.trim()) {
            newErrors.title = 'O título é obrigatório';
        }

        if (!editableThesis?.abstract.trim()) {
            newErrors.abstract = 'O resumo é obrigatório';
        }

        if (!editableThesis?.keywords.trim()) {
            newErrors.keywords = 'As palavras-chave são obrigatórias';
        }

        if (!editableThesis?.defense_date) {
            newErrors.defense_date = 'A data de defesa é obrigatória';
        }

        if (!editableThesis?.author?.id) {
            newErrors.author_id = 'O autor é obrigatório';
        }

        if (!editableThesis?.advisor?.id) {
            newErrors.advisor_id = 'O orientador é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!editableThesis || !originalThesis || !validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const changedFields: UpdateThesisFormData = {};

            if (editableThesis.title !== originalThesis.title) {
                changedFields.title = editableThesis.title;
            }

            if (editableThesis.abstract !== originalThesis.abstract) {
                changedFields.abstract = editableThesis.abstract;
            }

            if (editableThesis.keywords !== originalThesis.keywords) {
                changedFields.keywords = editableThesis.keywords;
            }

            if (editableThesis.defense_date !== originalThesis.defense_date) {
                changedFields.defense_date = editableThesis.defense_date;
            }

            if (editableThesis.status !== originalThesis.status && editableThesis.status !== undefined && editableThesis.status !== 'PENDING') {
                changedFields.status = editableThesis.status;
            }

            if (editableThesis.author.id !== originalThesis.author.id) {
                changedFields.author_id = editableThesis.author.id;
            }

            if (editableThesis.advisor.id !== originalThesis.advisor.id) {
                changedFields.advisor_id = editableThesis.advisor.id;
            }

            const originalCoAdvisorId = originalThesis.co_advisor?.id;
            const editableCoAdvisorId = editableThesis.co_advisor?.id;

            if (originalCoAdvisorId !== editableCoAdvisorId) {
                changedFields.co_advisor_id = editableCoAdvisorId;
            }

            if (newPdfFile) {
                changedFields.pdf_file = newPdfFile;
            }


            if (Object.keys(changedFields).length > 0) {
                await updateThesis(originalThesis.id, changedFields);


                await fetchThesisDetails(editableThesis.id);
                await onSuccess();

                setIsEditing(false);
                setNewPdfFile(null);
            } else {

                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating thesis:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!originalThesis) return;

        setSaving(true);
        try {
            await deleteThesis(originalThesis.id);
            await onSuccess();
            onClose(false);
        } catch (error) {
            console.error('Error deleting thesis:', error);
        } finally {
            setSaving(false);
            setConfirmDelete(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (originalThesis?.pdf_file) {
            try {
                setDownloading(true);

                const response = await fetch(originalThesis.pdf_file);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                let authorName = originalThesis.author?.name || "Autor";
                authorName = authorName.replace(/\s+/g, '_').toUpperCase();

                let dateFormatted = '';
                try {
                    const date = dayjs(originalThesis.defense_date);
                    dateFormatted = date.format('DDMMYYYY');
                } catch (error) {
                    dateFormatted = "00000000";
                }

                const fileName = `${authorName}_${dateFormatted}.pdf`;

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Erro ao baixar o PDF:", error);
            } finally {
                setDownloading(false);
            }
        }
    };

    const handleViewPdf = () => {
        if (originalThesis?.pdf_file) {
            window.open(originalThesis.pdf_file, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(e, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                if (loading || saving) {
                    return undefined;
                }
                onClose(false);
            }}
            fullWidth
            maxWidth="lg"
            disableEscapeKeyDown
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '90vh'
                    }
                }
            }}
        >
            <DialogTitle sx={{ color: colors.text.primary, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {loading ? 'Carregando detalhes da monografia...' : 'Detalhes da monografia'}
                    </Typography>
                    {!loading && !saving && (
                        <IconButton onClick={() => onClose(false)} size="small">
                            <CloseIcon sx={{ color: colors.text.secondary }} />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>

            <Divider sx={{ borderColor: colors.border.default }} />

            {
                !loading && originalThesis && (
                    <Box px={3} pt={2} pb={1} sx={{ bgcolor: colors.bg.secondary }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center">
                                <Typography variant="body1" sx={{ mr: 2, color: colors.text.secondary }}>
                                    Status:
                                </Typography>
                                <Chip
                                    label={getStatusLabel(originalThesis.status)}
                                    color={getStatusColor(originalThesis.status) as any}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>

                            {canEdit && (
                                <Button
                                    variant={isEditing ? "outlined" : "contained"}
                                    color={isEditing ? "inherit" : "primary"}
                                    startIcon={isEditing ? <CloseIcon /> : <EditIcon />}
                                    onClick={handleToggleEditMode}
                                    disabled={saving}
                                    sx={isEditing ? {
                                        color: colors.text.primary,
                                        borderColor: colors.border.focus,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderColor: colors.border.active,
                                        }
                                    } : {
                                        backgroundColor: colors.action.primary,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            boxShadow: 'none',
                                            backgroundColor: colors.action.hover,
                                        }
                                    }}
                                >
                                    {isEditing ? 'Cancelar Edição' : 'Editar monografia'}
                                </Button>
                            )}
                        </Box>

                        {isStudent && !isPending && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Você não pode editar monografias que já foram aprovadas ou rejeitadas.
                                Entre em contato com o seu orientador para realizar modificações.
                            </Alert>
                        )}
                    </Box>
                )
            }

            <DialogContent sx={{
                bgcolor: colors.bg.secondary,
                py: 2,
                overflowY: 'auto',
                flexGrow: 1
            }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                        <CircularProgress size={40} sx={{ color: colors.action.primary }} />
                    </Box>
                ) : editableThesis && originalThesis ? (
                    <Box>

                        <TextField
                            name="title"
                            label="Título da Monografia"
                            value={editableThesis.title}
                            onChange={handleInputChange}
                            disabled={!isEditing || saving}
                            fullWidth
                            variant="outlined"
                            error={!!errors.title}
                            helperText={errors.title}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: colors.border.default,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isEditing ? colors.border.focus : colors.border.default,
                                    },
                                }
                            }}
                        />

                        <Grid container spacing={3} mb={3}>
                            <Grid size={6}>
                                {canEditAuthor ? (
                                    <Autocomplete
                                        options={students}
                                        getOptionLabel={(option) => option.name}
                                        value={students.find(s => s.id === editableThesis.author?.id) || null}
                                        onChange={handleAuthorChange}
                                        disabled={!isEditing || saving}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Autoria"
                                                required
                                                error={!!errors.author_id}
                                                helperText={errors.author_id}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: colors.bg.elevated,
                                                        '& fieldset': {
                                                            borderColor: colors.border.default,
                                                        },
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <TextField
                                        label="Autor"
                                        value={editableThesis.author?.name || ''}
                                        fullWidth
                                        disabled={true}
                                        slotProps={{
                                            input: { readOnly: true, }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: colors.bg.elevated,
                                                '& fieldset': {
                                                    borderColor: colors.border.default,
                                                },
                                            }
                                        }}
                                    />
                                )}
                            </Grid>

                            <Grid size={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                    <DatePicker
                                        label="Data de Defesa"
                                        value={editableThesis.defense_date ? dayjs(editableThesis.defense_date) : null}
                                        onChange={handleDateChange}
                                        disabled={!isEditing || saving}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.defense_date,
                                                helperText: errors.defense_date,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: colors.bg.elevated,
                                                        '& fieldset': {
                                                            borderColor: colors.border.default,
                                                        },
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>


                            <Grid size={6}>
                                <Autocomplete
                                    options={availableAdvisors}
                                    getOptionLabel={(option) => option.name}
                                    value={professors.find(p => p.id === editableThesis.advisor?.id) || null}
                                    onChange={handleAdvisorChange}
                                    disabled={!canEditAdvisor || saving}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Orientação"
                                            required
                                            error={!!errors.advisor_id}
                                            helperText={errors.advisor_id}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: colors.bg.elevated,
                                                    '& fieldset': {
                                                        borderColor: colors.border.default,
                                                    },
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={6}>
                                <Autocomplete
                                    options={availableCoAdvisors}
                                    getOptionLabel={(option) => option.name}
                                    value={professors.find(p => p.id === editableThesis.co_advisor?.id) || null}
                                    onChange={handleCoAdvisorChange}
                                    disabled={!canEditCoAdvisor || saving}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Co-orientação (opcional)"
                                            error={!!errors.co_advisor_id}
                                            helperText={errors.co_advisor_id}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: colors.bg.elevated,
                                                    '& fieldset': {
                                                        borderColor: colors.border.default,
                                                    },
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {canChangeStatus && (
                                <Grid size={12}>
                                    <FormControl
                                        fullWidth
                                        disabled={!isEditing || saving}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: colors.bg.elevated,
                                                '& fieldset': {
                                                    borderColor: colors.border.default,
                                                },
                                            }
                                        }}
                                    >
                                        <InputLabel>Status da Monografia</InputLabel>
                                        <Select
                                            name="status"
                                            value={editableThesis.status}
                                            onChange={handleStatusChange}
                                            label="Status da Monografia"
                                        >
                                            <MenuItem value="APPROVED">Aprovado</MenuItem>
                                            <MenuItem value="REJECTED">Rejeitado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>

                        <TextField
                            name="keywords"
                            label="Palavras-chave (separadas por vírgula)"
                            value={editableThesis.keywords}
                            onChange={handleInputChange}
                            disabled={!isEditing || saving}
                            fullWidth
                            variant="outlined"
                            error={!!errors.keywords}
                            helperText={errors.keywords}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: colors.border.default,
                                    },
                                }
                            }}
                        />

                        <TextField
                            name="abstract"
                            label="Resumo"
                            value={editableThesis.abstract}
                            onChange={handleInputChange}
                            disabled={!isEditing || saving}
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            error={!!errors.abstract}
                            helperText={errors.abstract}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': {
                                        borderColor: colors.border.default,
                                    },
                                }
                            }}
                        />

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: colors.bg.elevated,
                                borderRadius: 2,
                                width: '100%',
                                mb: 1
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                                gap={2}
                            >
                                <Box display="flex" alignItems="center">
                                    <PictureAsPdfIcon
                                        sx={{
                                            color: colors.action.primary,
                                            fontSize: 28,
                                            mr: 1.5
                                        }}
                                    />
                                    <Typography variant="subtitle1" sx={{ color: colors.text.primary }}>
                                        {newPdfFile ? newPdfFile.name :
                                            `${editableThesis.author?.name?.replace(/\s+/g, '_').toUpperCase() || 'AUTOR'}_${formatDate(editableThesis.defense_date).replace(/\//g, '')}.pdf`}
                                    </Typography>
                                </Box>

                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={4}
                                    sx={{ flexGrow: 1, ml: 2 }}
                                >

                                    <Box display="flex" alignItems="center">
                                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mr: 1 }}>
                                            Tamanho:
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                            {newPdfFile ? formatBytes(newPdfFile.size) : formatBytes(editableThesis.pdf_size)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" gap={1}>

                                    {isEditing && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<CloudUploadIcon />}
                                            component="label"
                                            disabled={saving}
                                            sx={{
                                                color: colors.text.primary,
                                                borderColor: colors.border.focus,
                                                '&:hover': {
                                                    borderColor: colors.border.focus,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                },
                                            }}
                                        >
                                            {newPdfFile ? 'Trocar PDF' : 'Upload PDF'}
                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                    )}

                                    <Button
                                        variant="outlined"
                                        startIcon={<VisibilityIcon />}
                                        onClick={handleViewPdf}
                                        disabled={saving}
                                        sx={{
                                            color: colors.text.primary,
                                            borderColor: colors.border.focus,
                                            '&:hover': {
                                                borderColor: colors.border.focus,
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            },
                                        }}
                                    >
                                        Visualizar
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={
                                            downloading
                                                ? <CircularProgress size={20} sx={{ color: 'white' }} />
                                                : <DownloadIcon />
                                        }
                                        onClick={handleDownloadPdf}
                                        disabled={downloading || saving}
                                        sx={{
                                            backgroundColor: colors.action.primary,
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: colors.action.hover,
                                                boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            </Box>

                            {errors.pdf_file && (
                                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                                    {errors.pdf_file}
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                ) : null}
            </DialogContent>

            {
                !loading && editableThesis && (
                    <DialogActions sx={{
                        bgcolor: colors.bg.secondary,
                        p: 2,
                        borderTop: `1px solid ${colors.border.default}`,
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            {canDelete && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setConfirmDelete(true)}
                                    disabled={saving}
                                    sx={{
                                        borderColor: colors.feedback.error,
                                        color: colors.feedback.error,
                                        '&:hover': {
                                            borderColor: colors.feedback.error,
                                            backgroundColor: `${colors.feedback.error}10`,
                                        }
                                    }}
                                >
                                    Excluir Monografia
                                </Button>
                            )}
                        </div>

                        {isEditing && (
                            <div>
                                <Button
                                    onClick={handleDiscard}
                                    disabled={saving || !hasChanges}
                                    startIcon={<UndoIcon />}
                                    sx={{
                                        color: colors.text.secondary,
                                        mr: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        },
                                        '&.Mui-disabled': {
                                            color: 'rgba(255, 255, 255, 0.3)',
                                        }
                                    }}
                                >
                                    Descartar Alterações
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                    sx={{
                                        backgroundColor: colors.action.primary,
                                        '&:hover': {
                                            backgroundColor: colors.action.hover,
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                                        }
                                    }}
                                >
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        )}
                    </DialogActions>
                )
            }

            <ConfirmationDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: colors.bg.secondary,
                            borderRadius: 2,
                        }
                    }
                }}
            >
                <ConfirmationDialogTitle id="alert-dialog-title">
                    Confirmar exclusão
                </ConfirmationDialogTitle>
                <ConfirmationDialogContent>
                    <Typography>
                        Tem certeza de que deseja excluir esta monografia? Esta ação não pode ser desfeita.
                    </Typography>
                </ConfirmationDialogContent>
                <ConfirmationDialogActions>
                    <Button
                        onClick={() => setConfirmDelete(false)}
                        disabled={saving}
                        sx={{
                            color: colors.text.secondary,
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : null}
                        autoFocus
                        sx={{
                            backgroundColor: colors.feedback.error,
                            '&:hover': {
                                backgroundColor: colors.feedback.errorDark,
                            }
                        }}
                    >
                        {saving ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </ConfirmationDialogActions>
            </ConfirmationDialog>
        </Dialog >
    );
};

export default ThesisEditModal;