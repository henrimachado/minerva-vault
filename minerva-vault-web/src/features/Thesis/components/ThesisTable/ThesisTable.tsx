import React from 'react';
import {
Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
Paper, Typography, Pagination, Box, Chip, TableSortLabel, useTheme, CircularProgress
} from '@mui/material';
import { Thesis, OrderByOption } from '../../dto/thesisDTO';
import { tokens } from '../../../../theme/theme';
import { parseISO, format } from 'date-fns';

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
const theme = useTheme();
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
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy');
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
        {/* Table Container with its own position relative for the loading overlay */}
        <Box position="relative" sx={{ flexGrow: 1 }}>
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
            
            <TableContainer
                component={Paper}
                sx={{
                    backgroundColor: colors.bg.secondary,
                    borderRadius: 1,
                    mb: 2,
                    height: '100%',
                    overflow: 'auto',
                    maxHeight: 'calc(100vh - 280px)'
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: colors.bg.secondary,
                                    color: colors.text.secondary,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1
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
                                    zIndex: 1
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
                                    zIndex: 1
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
                                    zIndex: 1
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
                                    zIndex: 1
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
                                <TableCell sx={{ color: colors.text.primary }}>{thesis.title}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {thesis.keywords.split(',').map((keyword, index) => (
                                            <Chip
                                                key={index}
                                                label={keyword.trim()}
                                                size="small"
                                                sx={{
                                                    backgroundColor: colors.bg.elevated,
                                                    color: colors.text.secondary,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: colors.text.primary }}>{formatName(thesis.author)}</TableCell>
                                <TableCell sx={{ color: colors.text.primary }}>{formatName(thesis.advisor)}</TableCell>
                                <TableCell sx={{ color: colors.text.primary }}>{formatDate(thesis.defense_date)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>

        {/* Pagination - outside of the loading overlay scope */}
        {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: colors.text.secondary,
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