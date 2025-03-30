import React from 'react';
import { Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../../../../theme/theme';

interface EmptyStateProps {

}

const EmptyState: React.FC<EmptyStateProps> = () => {
const colors = tokens.colors;

return (
    <Paper
        sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg.secondary,
            borderRadius: 2,
            minHeight: 300,
        }}
    >
        <SearchIcon sx={{ fontSize: 60, color: colors.text.disabled, mb: 2 }} />

        <Typography variant="h5" color={colors.text.primary} gutterBottom>
            Nenhuma tese encontrada
        </Typography>

        <Typography variant="body1" color={colors.text.secondary} align="center" sx={{ maxWidth: 500 }}>
            Não encontramos nenhuma tese com os critérios de busca informados. 
            Tente ajustar os filtros ou fazer uma nova busca.
        </Typography>
    </Paper>
);
};

export default EmptyState;