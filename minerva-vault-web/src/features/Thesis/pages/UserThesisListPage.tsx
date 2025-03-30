import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ThesisFilters, ThesisListResponse, Thesis, OrderByOption } from '../dto/thesisDTO';
import ThesisController from '../controller/ThesisController';
import EmptyState from '../components/EmptyState/EmptyState';
import FilterModal from '../components/FilterModal/FilterModal';
import AppliedFilters from '../components/AppliedFilters/AppliedFilters';
import ThesisDetailModal from '../components/ThesisDetailModal/ThesisDetailModal';
import { tokens } from '../../../theme/theme';
import { useAuth } from '../../../shared/contexts/AuthContext';
import UserThesisTable from '../components/UserThesisTable/UserThesisTable';
import CreateThesisModal from '../components/CreateThesisModal/CreateThesisModal';


// Interface para as abas
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`thesis-tabpanel-${index}`}
            aria-labelledby={`thesis-tab-${index}`}
            style={{ height: '100%', overflow: 'hidden' }}
            {...other}
        >
            {value === index && (
                <Box sx={{ height: '100%', overflow: 'hidden' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function UserThesisListPage() {
    const { user } = useAuth();
    const colors = tokens.colors;
    const { getUserThesis } = ThesisController();

    // Verificar se o usuário é professor
    const isProfessor = user?.roles?.some(role => role.name === 'PROFESSOR');

    // Estados
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ThesisFilters>({
        page: 1,
        ...(isProfessor && { orientation: 'ADVISOR' }),
    });
    const [thesisData, setThesisData] = useState<ThesisListResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [createThesisModalOpen, setCreateThesisModalOpen] = useState(false);

    useEffect(() => {
        fetchTheses();
    }, []);


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);

        const newOrientation: 'ADVISOR' | 'COADVISOR' = newValue === 0 ? 'ADVISOR' : 'COADVISOR';
        const newFilters: ThesisFilters = {
            ...filters,
            ...(isProfessor ? { orientation: newOrientation } : {}),
            page: 1
        };

        setFilters(newFilters);
        fetchTheses(newFilters);
    };


    const fetchTheses = async (newFilters?: ThesisFilters) => {
        setLoading(true);

        try {
            const filtersToUse = newFilters || filters;
            const result = await getUserThesis(filtersToUse);
            setThesisData(result);

            if (newFilters) {
                setFilters(newFilters);
            }
        } catch (error) {
            console.error('Erro ao buscar teses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const newFilters = { ...filters, context: searchQuery, page: 1 };
        fetchTheses(newFilters);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page: number) => {
        const newFilters = { ...filters, page };
        fetchTheses(newFilters);
    };

    const handleSortChange = (orderBy: string) => {
        const validOptions = [
            'BYAUTHORDESC', 'BYAUTHORASC',
            'BYADVISERDESC', 'BYADVISERASC',
            'BYDEFENSEDATEDESC', 'BYDEFENSEDATEASC',
            'BYTITLEASC', 'BYTITLEDESC'
        ];

        const validOrderBy = validOptions.includes(orderBy) ? orderBy as OrderByOption : undefined;
        const newFilters = { ...filters, order_by: validOrderBy, page: 1 };
        fetchTheses(newFilters);
    };

    const handleRemoveFilter = (key: keyof ThesisFilters) => {
        if (key === 'orientation' && isProfessor) {
            return;
        }

        const newFilters = { ...filters };
        delete newFilters[key];

        if (key === 'context') {
            setSearchQuery('');
        }

        fetchTheses(newFilters);
    };

    const handleRowClick = (thesis: Thesis) => {
        setSelectedThesisId(thesis.id);
        setDetailModalOpen(true);
    };


    const handleCloseCreateThesisModal = () => {
        setCreateThesisModalOpen(false);
    };

    const handleThesisCreated = () => {
        fetchTheses();

    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                height: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                pt: 2,
                pb: 2,
                overflow: 'hidden'
            }}
        >

            <Box
                mb={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography variant="h4" component="h1">
                    Minhas Monografias
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateThesisModalOpen(true)}
                    sx={{
                        backgroundColor: colors.action.primary,
                        '&:hover': {
                            backgroundColor: colors.action.hover,
                        }
                    }}
                >
                    Cadastrar Monografia
                </Button>
            </Box>

            {isProfessor && (
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 1,
                        mb: 2
                    }}
                >
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="inherit"
                        sx={{
                            '& .MuiTab-root': {
                                color: colors.text.secondary,
                                '&.Mui-selected': {
                                    color: colors.action.primary,
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: colors.action.primary,
                            }
                        }}
                    >
                        <Tab label="Monografias que orientei" />
                        <Tab label="Monografias que co-orientei" />
                    </Tabs>
                </Paper>
            )}

            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    mb: 2,
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
                    onClick={() => setFilterModalOpen(true)}
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

   
            <Box mb={1}>
                <AppliedFilters
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    hiddenFilters={['orientation']}
                />
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {isProfessor ? (
                    <React.Fragment>
                        <TabPanel value={tabValue} index={0}>
    
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : thesisData && thesisData.items.length > 0 ? (
                                <UserThesisTable
                                    theses={thesisData.items}
                                    totalPages={thesisData.pages}
                                    currentPage={thesisData.current_page}
                                    onPageChange={handlePageChange}
                                    onRowClick={handleRowClick}
                                    onSortChange={handleSortChange}
                                    currentOrderBy={filters.order_by}
                                    loading={loading}
                                    orientation={filters.orientation}
                                />
                            ) : (
                                <EmptyState />
                            )}
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : thesisData && thesisData.items.length > 0 ? (
                                <UserThesisTable
                                    theses={thesisData.items}
                                    totalPages={thesisData.pages}
                                    currentPage={thesisData.current_page}
                                    onPageChange={handlePageChange}
                                    onRowClick={handleRowClick}
                                    onSortChange={handleSortChange}
                                    currentOrderBy={filters.order_by}
                                    loading={loading}
                                    orientation={filters.orientation}
                                />
                            ) : (
                                <EmptyState />
                            )}
                        </TabPanel>
                    </React.Fragment>
                ) : (
                    <TabPanel value={tabValue} index={0}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : thesisData && thesisData.items.length > 0 ? (
                            <UserThesisTable
                                theses={thesisData.items}
                                totalPages={thesisData.pages}
                                currentPage={thesisData.current_page}
                                onPageChange={handlePageChange}
                                onRowClick={handleRowClick}
                                onSortChange={handleSortChange}
                                currentOrderBy={filters.order_by}
                                loading={loading}
                                orientation={filters.orientation}
                            />
                        ) : (
                            <EmptyState />
                        )}
                    </TabPanel>
                )}
            </Box>

            <FilterModal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                currentFilters={filters}
                onApplyFilters={(newFilters) => {
                    if (isProfessor) {
                        newFilters.orientation = filters.orientation;
                    }
                    fetchTheses(newFilters);
                }}
            />

            <ThesisDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                thesisId={selectedThesisId}
            />

            <CreateThesisModal
                open={createThesisModalOpen}
                onClose={handleCloseCreateThesisModal}
                onSuccess={handleThesisCreated}
            />
        </Container>
    );
}

export default UserThesisListPage;