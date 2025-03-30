import ThesisService from '../service/ThesisService';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';

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
}