import React from 'react';
import { Box, Chip } from '@mui/material';
import { ThesisFilters } from '../../dto/thesisDTO';
import { tokens } from '../../../../theme/theme';

interface AppliedFiltersProps {
    filters: ThesisFilters;
    onRemoveFilter: (key: keyof ThesisFilters) => void;
    hiddenFilters?: Array<keyof ThesisFilters>; // Nova prop opcional
}

const AppliedFilters: React.FC<AppliedFiltersProps> = ({
    filters,
    onRemoveFilter,
    hiddenFilters = [] // Valor padrão é um array vazio
}) => {
    const colors = tokens.colors;

    const getFilterLabel = (key: string, value: any): string => {
        switch (key) {
            case 'title':
                return `Título: ${value}`;
            case 'author_name':
                return `Autor: ${value}`;
            case 'advisor_name':
                return `Orientador: ${value}`;
            case 'co_advisor_name':
                return `Co-orientador: ${value}`;
            case 'defense_date':
                return `Data de defesa: ${value}`;
            case 'context':
                return `Contexto: ${value}`;
            case 'order_by':
                return `Ordenação: ${getOrderByLabel(value)}`;
            case 'orientation':
                return `Orientação: ${value === 'ADVISOR' ? 'Orientador' : 'Co-orientador'}`;
            default:
                return `${key}: ${value}`;
        }
    };

    const getOrderByLabel = (orderBy: string): string => {
        switch (orderBy) {
            case 'BYAUTHORASC':
                return 'Autor (A-Z)';
            case 'BYAUTHORDESC':
                return 'Autor (Z-A)';
            case 'BYADVISERDESC':
                return 'Orientador (Z-A)';
            case 'BYADVISERASC':
                return 'Orientador (A-Z)';
            case 'BYDEFENSEDATEDESC':
                return 'Data de defesa (mais recente)';
            case 'BYDEFENSEDATEASC':
                return 'Data de defesa (mais antiga)';
            case 'BYTITLEASC':
                return 'Título (A-Z)';
            case 'BYTITLEDESC':
                return 'Título (Z-A)';
            default:
                return orderBy;
        }
    };

    // Filtrar entradas com base em hiddenFilters
    const filterEntries = Object.entries(filters).filter(([key, value]) => {
        // Verificar se o filtro deve ser exibido
        const shouldShow =
            // Tem valor definido
            value !== undefined &&
            value !== '' &&
            // Não é a página
            key !== 'page' &&
            // Não está na lista de filtros ocultos
            !hiddenFilters.includes(key as keyof ThesisFilters);

        return shouldShow;
    });

    if (filterEntries.length === 0) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {filterEntries.map(([key, value]) => (
                <Chip
                    key={key}
                    label={getFilterLabel(key, value)}
                    onDelete={() => onRemoveFilter(key as keyof ThesisFilters)}
                    sx={{
                        backgroundColor: colors.bg.elevated,
                        color: colors.text.primary,
                        '& .MuiChip-deleteIcon': {
                            color: colors.text.secondary,
                            '&:hover': {
                                color: colors.text.primary,
                            }
                        }
                    }}
                />
            ))}
        </Box>
    );
};

export default AppliedFilters;