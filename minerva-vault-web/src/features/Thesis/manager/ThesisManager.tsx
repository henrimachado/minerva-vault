import ThesisService from '../service/ThesisService';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';
import { CreateThesisFormData, UpdateThesisFormData } from '../dto/createThesisDTO';

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

    static buildThesisFormData(updatedThesis: Partial<UpdateThesisFormData>): FormData {
        const thesisFormData = new FormData();

        const stringFields: (keyof UpdateThesisFormData)[] = ['title', 'abstract', 'keywords', 'defense_date', 'status'];
        stringFields.forEach(field => {
            const value = updatedThesis[field];
            if (value !== undefined && typeof value === 'string') {
                thesisFormData.append(field, value);
            }
        });

        if (updatedThesis.author_id !== undefined && typeof updatedThesis.author_id === 'string') {
            thesisFormData.append('author_id', updatedThesis.author_id);
        }

        if (updatedThesis.advisor_id !== undefined && typeof updatedThesis.advisor_id === 'string') {
            thesisFormData.append('advisor_id', updatedThesis.advisor_id);
        }


        if ('co_advisor_id' in updatedThesis && updatedThesis.co_advisor_id !== undefined) {
            thesisFormData.append('co_advisor_id',
                updatedThesis.co_advisor_id === null ? 'null' : String(updatedThesis.co_advisor_id)
            );
        }
        if (updatedThesis.pdf_file instanceof File) {
            thesisFormData.append('pdf_file', updatedThesis.pdf_file);
        }

        return thesisFormData;
    };


    public static async updateThesis(thesis_id: string, updatedThesis: UpdateThesisFormData): Promise<void> {
        const formData = this.buildThesisFormData(updatedThesis);

        await ThesisService.updateThesis(thesis_id, formData);
    }

    public static async deleteThesis(id: string): Promise<void> {
        await ThesisService.deleteThesis(id);
    }
}