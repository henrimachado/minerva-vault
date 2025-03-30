import ThesisManager from '../manager/ThesisManager';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';
import { useNotificationService } from '../../../shared/hooks/useNotificationService';
import { CreateThesisFormData, UpdateThesisFormData } from '../dto/createThesisDTO';

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

    async function createThesis(thesis: CreateThesisFormData): Promise<void> {
        try {
            await ThesisManager.createThesis(thesis);
            notification.success('Tese criada com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao criar tese';
            notification.error(errorMessage);
            throw error;
        }
    }

    async function updateThesis(thesis_id: string, updatedThesis: UpdateThesisFormData): Promise<void> {
        try {
            await ThesisManager.updateThesis(thesis_id, updatedThesis);
            notification.success('Tese atualizada com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar tese';
            notification.error(errorMessage);
            throw error;
        }
    }

    async function deleteThesis(id: string): Promise<void> {
        try {
            await ThesisManager.deleteThesis(id);
            notification.success('Tese excluída com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir tese';
            notification.error(errorMessage);
            throw error;
        }
    }

    return {
        listTheses,
        getThesisById,
        getUserThesis,
        createThesis, 
        updateThesis,
        deleteThesis,
    };
}