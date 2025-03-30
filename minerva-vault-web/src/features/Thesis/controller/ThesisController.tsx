import ThesisManager from '../manager/ThesisManager';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';
import { useNotificationService } from '../../../shared/hooks/useNotificationService';

export default function ThesisController() {
    const notification = useNotificationService();

    async function listTheses(filters: ThesisFilters): Promise<ThesisListResponse> {
        try {
            const result = await ThesisManager.listTheses(filters);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar teses';
            notification.error(errorMessage);
            throw error;
        }
    }

    async function getThesisById(id: string): Promise<ThesisDetail> {
        try {
            const thesis = await ThesisManager.getThesisById(id);
            return thesis;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar detalhes da tese';
            notification.error(errorMessage);
            throw error;
        }
    }

    async function getUserThesis(filters: ThesisFilters): Promise<ThesisListResponse> {
        try {
            const result = await ThesisManager.getUserThesis(filters);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar teses do usuário';
            notification.error(errorMessage);
            throw error;
        }
    }
    return {
        listTheses,
        getThesisById,
        getUserThesis,
    };
}