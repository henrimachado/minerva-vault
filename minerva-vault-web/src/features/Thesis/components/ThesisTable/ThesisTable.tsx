import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Pagination, Box, Chip, TableSortLabel, CircularProgress
} from '@mui/material';
import { Thesis, OrderByOption } from '../../dto/thesisDTO';
import { tokens } from '../../../../theme/theme';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br'; 

interface ThesisTableProps {
    theses: Thesis[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onRowClick: (thesis: Thesis) => void;
    onSortChange: (orderBy: OrderByOption) => void;
    currentOrderBy?: OrderByOption;
    loading: boolean;
}

const ThesisTable: React.FC<ThesisTableProps> = ({
    theses,
    totalPages,
    currentPage,
    onPageChange,
    onRowClick,
    onSortChange,
    currentOrderBy,
    loading
}) => {
    const colors = tokens.colors;

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        onPageChange(value);
    };

    const getOrderDirection = (field: string): 'asc' | 'desc' | undefined => {
        if (!currentOrderBy) return undefined;

        if (currentOrderBy.includes(field.toUpperCase())) {
            return currentOrderBy.includes('ASC') ? 'asc' : 'desc';
        }

        return undefined;
    };

    const handleSortClick = (field: string) => {
        const direction = getOrderDirection(field);
        let newOrderBy: OrderByOption;

        switch (field) {
            case 'title':
                newOrderBy = direction === 'asc' ? 'BYTITLEDESC' : 'BYTITLEASC';
                break;
            case 'author':
                newOrderBy = direction === 'asc' ? 'BYAUTHORDESC' : 'BYAUTHORASC';
                break;
            case 'advisor':
                newOrderBy = direction === 'asc' ? 'BYADVISERDESC' : 'BYADVISERASC';
                break;
            case 'defense_date':
                newOrderBy = direction === 'asc' ? 'BYDEFENSEDATEDESC' : 'BYDEFENSEDATEASC';
                break;
            default:
                newOrderBy = 'BYTITLEASC';
        }

        onSortChange(newOrderBy);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = dayjs(dateString);
            return dayjs(date).format('DD/MM/YYYY')
        } catch (error) {
            return dateString;
        }
    };

    const formatName = (user: any) => {
        if (!user) return '-';
        return user.name;
    };

    if (theses.length === 0 && !loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Nenhuma tese encontrada com os filtros atuais.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 350px)',
            position: 'relative'
        }}>
            {/* Overlay de carregamento */}
            {loading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    zIndex={2}
                    borderRadius={1}
                    sx={{ backdropFilter: 'blur(2px)' }}
                >
                    <CircularProgress sx={{ color: colors.action.primary }} />
                </Box>
            )}

            {/* Container da tabela - usa flexGrow para ocupar espaço disponível */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 1,
                        height: 'auto', // Altura automática
                        maxHeight: '100%', // Máximo é 100% do container pai
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5
                                    }}
                                >
                                    <TableSortLabel
                                        active={getOrderDirection('title') !== undefined}
                                        direction={getOrderDirection('title') || 'asc'}
                                        onClick={() => handleSortClick('title')}
                                    >
                                        Título
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5
                                    }}
                                >
                                    Palavras-chave
                                </TableCell>
                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5
                                    }}
                                >
                                    <TableSortLabel
                                        active={getOrderDirection('author') !== undefined}
                                        direction={getOrderDirection('author') || 'asc'}
                                        onClick={() => handleSortClick('author')}
                                    >
                                        Autor
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5
                                    }}
                                >
                                    <TableSortLabel
                                        active={getOrderDirection('advisor') !== undefined}
                                        direction={getOrderDirection('advisor') || 'asc'}
                                        onClick={() => handleSortClick('advisor')}
                                    >
                                        Orientador
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5
                                    }}
                                >
                                    <TableSortLabel
                                        active={getOrderDirection('defense_date') !== undefined}
                                        direction={getOrderDirection('defense_date') || 'asc'}
                                        onClick={() => handleSortClick('defense_date')}
                                    >
                                        Data de Defesa
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {theses.map((thesis) => (
                                <TableRow
                                    key={thesis.id}
                                    hover
                                    onClick={() => onRowClick(thesis)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: `${colors.bg.elevated} !important`,
                                        }
                                    }}
                                >
                                    <TableCell sx={{ color: colors.text.primary, py: 1 }}>{thesis.title}</TableCell>
                                    <TableCell sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {thesis.keywords.split(',').slice(0, 3).map((keyword, index) => (
                                                <Chip
                                                    key={index}
                                                    label={keyword.trim()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: colors.bg.elevated,
                                                        color: colors.text.secondary,
                                                        fontSize: '0.75rem',
                                                        height: '20px'
                                                    }}
                                                />
                                            ))}
                                            {thesis.keywords.split(',').length > 3 && (
                                                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                                                    +{thesis.keywords.split(',').length - 3}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text.primary, py: 1 }}>{formatName(thesis.author)}</TableCell>
                                    <TableCell sx={{ color: colors.text.primary, py: 1 }}>{formatName(thesis.advisor)}</TableCell>
                                    <TableCell sx={{ color: colors.text.primary, py: 1 }}>{formatDate(thesis.defense_date)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Paginação - Agora com altura fixa e não flexível */}
            {totalPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '32px', // Altura fixa para a paginação
                }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                        sx={{
                            pb: 1,
                            '& .MuiPaginationItem-root': {
                                color: colors.text.secondary,
                                padding: '0 4px', // Reduzido padding dos itens
                                minWidth: '24px', // Reduzido tamanho mínimo
                                height: '24px', // Reduzido altura
                            },
                            '& .Mui-selected': {
                                backgroundColor: `${colors.action.primary} !important`,
                                color: colors.text.primary,
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default ThesisTable;