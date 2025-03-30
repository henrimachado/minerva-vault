import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ThesisFilters, ThesisListResponse, Thesis, OrderByOption } from '../dto/thesisDTO';
import ThesisController from '../controller/ThesisController';
import ThesisTable from '../components/ThesisTable/ThesisTable';
import EmptyState from '../components/EmptyState/EmptyState';
import FilterModal from '../components/FilterModal/FilterModal';
import AppliedFilters from '../components/AppliedFilters/AppliedFilters';
import ThesisDetailModal from '../components/ThesisDetailModal/ThesisDetailModal'; // Importe o modal
import { tokens } from '../../../theme/theme';

function ThesisListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { listTheses } = ThesisController();
    const colors = tokens.colors;

    // Estados
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ThesisFilters>({
        page: 1
    });
    const [thesisData, setThesisData] = useState<ThesisListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Estados para o modal de detalhes
    const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Efeito para carregar parâmetros da URL ou todas as teses
    useEffect(() => {
        const context = searchParams.get('context');
        if (context) {
            setSearchQuery(context);
            setFilters(prev => ({ ...prev, context }));
            fetchTheses({ context });
        } else {
            // Se não houver contexto, carrega todas as teses
            fetchTheses({ page: 1 });
        }
    }, []);

    const handleOpenFilterModal = () => {
        setFilterModalOpen(true);
    };

    const handleCloseFilterModal = () => {
        setFilterModalOpen(false);
    };

    // Manipuladores do modal de detalhes
    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
    };

    const handleApplyFilters = (newFilters: ThesisFilters) => {
        // Make sure we preserve context if it was already set
        const filtersToApply = {
            ...newFilters,
            context: newFilters.context || filters.context,
            page: 1
        };

        setFilters(filtersToApply);
        fetchTheses(filtersToApply);
    };

    // Função para buscar teses
    const fetchTheses = async (newFilters?: ThesisFilters) => {
        setLoading(true);
        setHasSearched(true);

        try {
            const filtersToUse = newFilters || filters;
            const result = await listTheses(filtersToUse);
            setThesisData(result);

            // Atualizar URL com os filtros
            const params = new URLSearchParams();
            Object.entries(filtersToUse).forEach(([key, value]) => {
                if (value !== undefined && value !== '' && key !== 'page') {
                    params.set(key, String(value));
                }
            });
            setSearchParams(params);

        } catch (error) {
            console.error('Erro ao buscar teses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Manipuladores de eventos
    const handleSearch = () => {
        const newFilters = { ...filters, context: searchQuery, page: 1 };
        setFilters(newFilters);
        fetchTheses(newFilters);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page: number) => {
        const newFilters = { ...filters, page };
        setFilters(newFilters);
        fetchTheses(newFilters);
    };

    const handleSortChange = (orderBy: string) => {
        // Verificar se o valor é uma OrderByOption válida
        const validOrderBy = isValidOrderByOption(orderBy) ? orderBy as OrderByOption : undefined;

        const newFilters = {
            ...filters,
            order_by: validOrderBy,
            page: 1
        };

        setFilters(newFilters);
        fetchTheses(newFilters);
    };

    const isValidOrderByOption = (value: string): boolean => {
        const validOptions = [
            'BYAUTHORDESC', 'BYAUTHORASC',
            'BYADVISERDESC', 'BYADVISERASC',
            'BYDEFENSEDATEDESC', 'BYDEFENSEDATEASC',
            'BYTITLEASC', 'BYTITLEDESC'
        ];
        return validOptions.includes(value);
    };

    const handleRemoveFilter = (key: keyof ThesisFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters(newFilters);

        if (key === 'context') {
            setSearchQuery('');
        }

        fetchTheses(newFilters);
    };

    const handleRowClick = (thesis: Thesis) => {
        setSelectedThesisId(thesis.id); // Armazena o ID da tese selecionada
        setDetailModalOpen(true); // Abre o modal
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 1, height: 'cal(100vh - 140px)'}}>
            <Box mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Trabalhos acadêmicos
                </Typography>
                <Typography variant="body1" color={colors.text.secondary}>
                    Use a barra de pesquisa abaixo para encontrar trabalhos acadêmicos por título, autor, orientador ou palavras-chave.
                </Typography>
            </Box>

            {/* Barra de pesquisa */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: colors.bg.secondary,
                    borderRadius: 1,
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Pesquisar por título, resumo ou palavras-chave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    variant="outlined"
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: colors.text.secondary }} />
                                </InputAdornment>
                            ),
                        }
                    }}
                    sx={{
                        mr: 2,
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

                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{
                        backgroundColor: colors.action.primary,
                        '&:hover': {
                            backgroundColor: colors.action.hover,
                        },
                        minWidth: 100,
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Buscar"}
                </Button>

                <IconButton
                    onClick={handleOpenFilterModal}
                    sx={{
                        ml: 1,
                        color: colors.text.secondary,
                        '&:hover': {
                            backgroundColor: colors.bg.elevated,
                        }
                    }}
                    aria-label="filtros"
                >
                    <FilterListIcon />
                </IconButton>
            </Paper>

            {/* Filtros aplicados */}
            <AppliedFilters filters={filters} onRemoveFilter={handleRemoveFilter} />

            {/* Conteúdo principal */}
            {loading && !thesisData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : thesisData && thesisData.items.length > 0 ? (
                <ThesisTable
                    theses={thesisData.items}
                    totalPages={thesisData.pages}
                    currentPage={thesisData.current_page}
                    onPageChange={handlePageChange}
                    onRowClick={handleRowClick}
                    onSortChange={handleSortChange}
                    currentOrderBy={filters.order_by}
                    loading={loading}
                />
            ) : (
                <EmptyState />
            )}

            {/* Modal de Filtros */}
            <FilterModal
                open={filterModalOpen}
                onClose={handleCloseFilterModal}
                currentFilters={filters}
                onApplyFilters={handleApplyFilters}
            />

            {/* Modal de Detalhes da Tese */}
            <ThesisDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetailModal}
                thesisId={selectedThesisId}
            />
        </Container>
    );
}

export default ThesisListPage;