import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import CloseIcon from '@mui/icons-material/Close';
import { ThesisFilters, OrderByOption } from '../../dto/thesisDTO';
import { tokens } from '../../../../theme/theme';

interface FilterModalProps {
    open: boolean;
    onClose: () => void;
    currentFilters: ThesisFilters;
    onApplyFilters: (filters: ThesisFilters) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
    open,
    onClose,
    currentFilters,
    onApplyFilters,
}) => {
    const colors = tokens.colors;
    const [filters, setFilters] = useState<ThesisFilters>({ ...currentFilters });

    useEffect(() => {
        if (open) {
            setFilters({ ...currentFilters });
        }
    }, [open, currentFilters]);

    const handleInputChange = (field: keyof ThesisFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };


    const handleDateChange = (date: any) => {
        if (date) {

            const formattedDate = date.format('YYYY-MM-DD');
            setFilters((prev) => ({ ...prev, defense_date: formattedDate }));
        } else {
            setFilters((prev) => {
                const newFilters = { ...prev };
                delete newFilters.defense_date;
                return newFilters;
            });
        }
    };

    const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as OrderByOption | '';
        if (value === '') {
            const newFilters = { ...filters };
            delete newFilters.order_by;
            setFilters(newFilters);
        } else {
            setFilters((prev) => ({ ...prev, order_by: value as OrderByOption }));
        }
    };

    const handleApplyFilters = () => {
        const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== '') {
                acc[key as keyof ThesisFilters] = value;
            }
            return acc;
        }, {} as ThesisFilters);

        cleanedFilters.page = 1;

        onApplyFilters(cleanedFilters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = { page: 1 };
        setFilters(clearedFilters);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 2,
                    },
                }
            }}
        >
            <DialogTitle sx={{ color: colors.text.primary, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Filtros Avançados</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon sx={{ color: colors.text.secondary }} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider sx={{ borderColor: colors.border.default }} />

            <DialogContent sx={{ bgcolor: colors.bg.secondary, py: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Título"
                            value={filters.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': { borderColor: colors.border.default },
                                    '&:hover fieldset': { borderColor: colors.border.focus },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text.secondary,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Nome do Autor"
                            value={filters.author_name || ''}
                            onChange={(e) => handleInputChange('author_name', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': { borderColor: colors.border.default },
                                    '&:hover fieldset': { borderColor: colors.border.focus },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text.secondary,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Nome do Orientador"
                            value={filters.advisor_name || ''}
                            onChange={(e) => handleInputChange('advisor_name', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': { borderColor: colors.border.default },
                                    '&:hover fieldset': { borderColor: colors.border.focus },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text.secondary,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Nome do Co-orientador"
                            value={filters.co_advisor_name || ''}
                            onChange={(e) => handleInputChange('co_advisor_name', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': { borderColor: colors.border.default },
                                    '&:hover fieldset': { borderColor: colors.border.focus },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text.secondary,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                            <DatePicker
                                label="Data de Defesa"
                                value={filters.defense_date ? dayjs(filters.defense_date) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: colors.bg.elevated,
                                                '& fieldset': { borderColor: colors.border.default },
                                                '&:hover fieldset': { borderColor: colors.border.focus },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: colors.text.secondary,
                                            },
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={12}>
                        <FormControl
                            fullWidth
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.bg.elevated,
                                    '& fieldset': { borderColor: colors.border.default },
                                    '&:hover fieldset': { borderColor: colors.border.focus },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text.secondary,
                                },
                            }}
                        >
                            <InputLabel id="order-by-label">Ordenar por</InputLabel>
                            <Select
                                labelId="order-by-label"
                                value={filters.order_by || ''}
                                onChange={(e) => handleInputChange('order_by', e.target.value)}
                                label="Ordenar por"
                            >
                                <MenuItem value="">Nenhum</MenuItem>
                                <MenuItem value="BYTITLEASC">Título (A-Z)</MenuItem>
                                <MenuItem value="BYTITLEDESC">Título (Z-A)</MenuItem>
                                <MenuItem value="BYAUTHORASC">Autor (A-Z)</MenuItem>
                                <MenuItem value="BYAUTHORDESC">Autor (Z-A)</MenuItem>
                                <MenuItem value="BYADVISERASC">Orientador (A-Z)</MenuItem>
                                <MenuItem value="BYADVISERDESC">Orientador (Z-A)</MenuItem>
                                <MenuItem value="BYDEFENSEDATEASC">Data de defesa (mais antiga)</MenuItem>
                                <MenuItem value="BYDEFENSEDATEDESC">Data de defesa (mais recente)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider sx={{ borderColor: colors.border.default }} />

            <DialogActions sx={{ bgcolor: colors.bg.secondary, p: 2 }}>
                <Button
                    onClick={handleClearFilters}
                    sx={{
                        color: colors.text.secondary,
                        '&:hover': {
                            backgroundColor: colors.bg.elevated,
                        }
                    }}
                >
                    Limpar Filtros
                </Button>
                <Button
                    onClick={handleApplyFilters}
                    variant="contained"
                    sx={{
                        backgroundColor: colors.action.primary,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                            backgroundColor: colors.action.hover,
                        }
                    }}
                >
                    Aplicar Filtros
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterModal;