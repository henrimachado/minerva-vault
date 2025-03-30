import ThesisService from '../service/ThesisService';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';
import { CreateThesisFormData } from '../dto/createThesisDTO';

export default class ThesisManager {
    public static async listTheses(filters: ThesisFilters): Promise<ThesisListResponse> {
        return await ThesisService.listTheses(filters);
    }

    public static async getThesisById(id: string): Promise<ThesisDetail> {
        return await ThesisService.getThesisById(id);
    }

    public static async getUserThesis(filters: ThesisFilters): Promise<ThesisListResponse> {
        return await ThesisService.getUserThesis(filters);
    }

    public static async createThesis(thesis: CreateThesisFormData): Promise<void> {
        const thesisFormData = new FormData();

        thesisFormData.append('title', thesis.title);
        thesisFormData.append('author_id', thesis.author_id);
        thesisFormData.append('advisor_id', thesis.advisor_id);
        if (thesis.co_advisor_id) {
            thesisFormData.append('co_advisor_id', thesis.co_advisor_id);
        }
        thesisFormData.append('abstract', thesis.abstract);
        thesisFormData.append('keywords', thesis.keywords);
        thesisFormData.append('defense_date', thesis.defense_date);

        if (thesis.pdf_file) {
            thesisFormData.append('pdf_file', thesis.pdf_file);
        }

        await ThesisService.createThesis(thesisFormData);
    }
}