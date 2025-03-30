import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Divider,
    Paper,
    Typography,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { parseISO, format } from 'date-fns';
import { tokens } from '../../../../theme/theme';
import ThesisController from '../../controller/ThesisController';
import { ThesisDetail, User } from '../../dto/thesisDTO'; 

interface ThesisDetailModalProps {
    open: boolean;
    onClose: () => void;
    thesisId: string | null;
}

const ThesisDetailModal: React.FC<ThesisDetailModalProps> = ({
    open,
    onClose,
    thesisId
}) => {
    const colors = tokens.colors;
    const { getThesisById } = ThesisController();

    const [thesis, setThesis] = useState<ThesisDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (open && thesisId) {
            fetchThesisDetails(thesisId);
        } else {
            // Reset data when modal closes
            setThesis(null);
        }
    }, [open, thesisId]);

    const fetchThesisDetails = async (id: string) => {
        setLoading(true);
        try {
            const result = await getThesisById(id);
            setThesis(result);
        } catch (error) {
            console.error('Error fetching thesis details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    const formatName = (user: User | null | undefined) => {
        if (!user) return '-';
        return user.name;
    };

    const formatBytes = (bytes: number | undefined) => {
        if (!bytes) return '0 bytes';
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleDownloadPdf = async () => {
        if (thesis?.pdf_file) {
            try {
                setDownloading(true);

                const response = await fetch(thesis.pdf_file);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                // Criar nome do arquivo baseado no autor e data de defesa
                let authorName = thesis.author?.name || "Autor";
                // Substituir espaços por underscores
                authorName = authorName.replace(/\s+/g, '_').toUpperCase();

                // Formatar data como DDMMAAAA
                let dateFormatted = '';
                try {
                    const date = parseISO(thesis.defense_date);
                    dateFormatted = format(date, 'ddMMyyyy');
                } catch (error) {
                    console.error("Erro ao formatar data:", error);
                    dateFormatted = "00000000";
                }

                // Nome do arquivo final
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
        if (thesis?.pdf_file) {
            window.open(thesis.pdf_file, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="lg"
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
                        {loading ? 'Carregando detalhes da tese...' : 'Detalhes da Tese'}
                    </Typography>
                    {!loading && (
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon sx={{ color: colors.text.secondary }} />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>

            <Divider sx={{ borderColor: colors.border.default }} />

            <DialogContent sx={{ bgcolor: colors.bg.secondary, py: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                        <CircularProgress size={40} sx={{ color: colors.action.primary }} />
                    </Box>
                ) : thesis && (
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ color: colors.text.primary }}>
                            {thesis.title}
                        </Typography>

                        <Grid container spacing={4} mb={4}>
                            <Grid size={12} container>
                                <Box mb={3} display="flex" alignItems="flex-start">
                                    <PersonIcon sx={{ color: colors.text.secondary, mr: 1.5, mt: 0.5 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                                            Autoria
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                            {formatName(thesis.author)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box mb={3} display="flex" alignItems="flex-start">
                                    <SchoolIcon sx={{ color: colors.text.secondary, mr: 1.5, mt: 0.5 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                                            Orientação
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                            {formatName(thesis.advisor)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {thesis.co_advisor && (
                                    <Box mb={3} display="flex" alignItems="flex-start">
                                        <SchoolIcon sx={{ color: colors.text.secondary, mr: 1.5, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                                                Co-orientação
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                                {formatName(thesis.co_advisor)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Box mb={3} display="flex" alignItems="flex-start">
                                    <CalendarTodayIcon sx={{ color: colors.text.secondary, mr: 1.5, mt: 0.5 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                                            Data de Defesa
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                            {formatDate(thesis.defense_date)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>


                            <Grid size={12} container>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: colors.bg.elevated,
                                        borderRadius: 2,
                                        width: '100%'
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        flexWrap="wrap"
                                        gap={2}
                                    >
                                        {/* Título com ícone - autor em maiúsculas + data */}
                                        <Box display="flex" alignItems="center">
                                            <PictureAsPdfIcon
                                                sx={{
                                                    color: colors.action.primary,
                                                    fontSize: 28,
                                                    mr: 1.5
                                                }}
                                            />
                                            <Typography variant="subtitle1" sx={{ color: colors.text.primary }}>
                                                {thesis.author.name.replace(/\s+/g, '_').toUpperCase()}_{formatDate(thesis.defense_date).replace(/\//g, '')}
                                            </Typography>
                                        </Box>

                                        {/* Metadados - valores na frente */}
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={4}
                                            sx={{ flexGrow: 1, ml: 2 }}
                                        >
                                            {/* Coluna Páginas */}
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mr: 1 }}>
                                                    Páginas:
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                                    {thesis.pdf_pages || 0}
                                                </Typography>
                                            </Box>

                                            {/* Coluna Tamanho */}
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="subtitle2" sx={{ color: colors.text.secondary, mr: 1 }}>
                                                    Tamanho:
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: colors.text.primary }}>
                                                    {formatBytes(thesis.pdf_size)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Botões */}
                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<VisibilityIcon />}
                                                onClick={handleViewPdf}
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
                                                disabled={downloading}
                                                sx={{
                                                    backgroundColor: colors.action.primary,
                                                    '&:hover': {
                                                        backgroundColor: colors.action.hover,
                                                    },
                                                }}
                                            >
                                                Download
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                        </Grid>

                        <Divider sx={{ borderColor: colors.border.default, my: 3 }} />

                        <Box mb={4}>
                            <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary }}>
                                Resumo
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ color: colors.text.secondary }}>
                                {thesis.abstract}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary }}>
                                Palavras-chave
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {thesis.keywords.split(',').map((keyword: string, index: number) => (
                                    <Chip
                                        key={index}
                                        label={keyword.trim()}
                                        sx={{
                                            backgroundColor: colors.bg.elevated,
                                            color: colors.text.secondary,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ThesisDetailModal;