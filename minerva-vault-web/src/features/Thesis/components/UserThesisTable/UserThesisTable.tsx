import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Pagination, Box, Chip, TableSortLabel, CircularProgress
} from '@mui/material';
import { Thesis, OrderByOption } from '../../dto/thesisDTO';
import { tokens } from '../../../../theme/theme';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

interface UserThesisTableProps {
    theses: Thesis[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onRowClick: (thesis: Thesis) => void;
    onSortChange: (orderBy: OrderByOption) => void;
    currentOrderBy?: OrderByOption;
    loading: boolean;
    orientation?: 'ADVISOR' | 'COADVISOR';
}

const UserThesisTable: React.FC<UserThesisTableProps> = ({
    theses,
    totalPages,
    currentPage,
    onPageChange,
    onRowClick,
    onSortChange,
    currentOrderBy,
    loading,
    orientation
}) => {
    const colors = tokens.colors;
    const { user } = useAuth();


    const isProfessor = user?.roles?.some(role => role.name === 'PROFESSOR');


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
            return dayjs(date).format('DD/MM/YYYY');
        } catch (error) {
            return dateString;
        }
    };

    const formatName = (user: any) => {
        if (!user) return '-';
        return user.name;
    };


    const truncateTitle = (title: string, maxLength: number = 60) => {
        if (title.length <= maxLength) return title;
        return `${title.substring(0, maxLength)}...`;
    };

    const getStatusChip = (status: string) => {
        let label, color;

        switch (status) {
            case 'APPROVED':
                label = 'Aprovado';
                color = '#4caf50';
                break;
            case 'REJECTED':
                label = 'Rejeitado';
                color = '#f44336';
                break;
            case 'PENDING':
            default:
                label = 'Pendente';
                color = '#ff9800';
                break;
        }

        return (
            <Chip
                label={label}
                size="small"
                sx={{
                    backgroundColor: `${color}20`,
                    color: color,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: '22px'
                }}
            />
        );
    };

    if (theses.length === 0 && !loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Nenhuma monografia encontrada.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 390px)',
            position: 'relative'
        }}>

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


            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: colors.bg.secondary,
                        borderRadius: 1,
                        height: 'auto',
                        maxHeight: '100%',
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
                                        py: 1.5,
                                        width: '30%'
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


                                {isProfessor && (
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
                                )}


                                {!(isProfessor && orientation === 'ADVISOR') && (
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
                                )}


                                {!(isProfessor && orientation === 'COADVISOR') && (
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
                                        Co-orientador
                                    </TableCell>
                                )}

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


                                <TableCell
                                    sx={{
                                        backgroundColor: colors.bg.secondary,
                                        color: colors.text.secondary,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        py: 1.5,
                                        width: '100px'
                                    }}
                                >
                                    Situação
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
                                    <TableCell
                                        sx={{
                                            color: colors.text.primary,
                                            py: 1,
                                            maxWidth: '300px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={thesis.title}
                                    >
                                        {truncateTitle(thesis.title)}
                                    </TableCell>


                                    {isProfessor && (
                                        <TableCell sx={{ color: colors.text.primary, py: 1 }}>
                                            {formatName(thesis.author)}
                                        </TableCell>
                                    )}


                                    {!(isProfessor && orientation === 'ADVISOR') && (
                                        <TableCell sx={{ color: colors.text.primary, py: 1 }}>
                                            {formatName(thesis.advisor)}
                                        </TableCell>
                                    )}

                                    {!(isProfessor && orientation === 'COADVISOR') && (
                                        <TableCell sx={{ color: colors.text.primary, py: 1 }}>
                                            {thesis.co_advisor ? formatName(thesis.co_advisor) : '-'}
                                        </TableCell>
                                    )}

                                    <TableCell sx={{ color: colors.text.primary, py: 1 }}>
                                        {formatDate(thesis.defense_date)}
                                    </TableCell>


                                    <TableCell sx={{ py: 1 }}>
                                        {getStatusChip(thesis.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>


            {totalPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '32px',
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
                                padding: '0 4px',
                                minWidth: '24px',
                                height: '24px',
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

export default UserThesisTable;