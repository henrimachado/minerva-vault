import api from '../../../config/api';
import { ThesisFilters, ThesisListResponse, ThesisDetail } from '../dto/thesisDTO';

export default class ThesisService {
    private static readonly THESIS_URI = '/thesis';

    public static async listTheses(filters: ThesisFilters): Promise<ThesisListResponse> {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const { data } = await api.get(`${this.THESIS_URI}?${params.toString()}`);
            return data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error('Falha ao buscar teses');
        }
    }

    public static async getUserThesis(filters: ThesisFilters): Promise<ThesisListResponse> {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const { data } = await api.get(`${this.THESIS_URI}/me?${params.toString()}`);
            return data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error('Falha ao buscar teses do usuário');
        }
    }

    public static async getThesisById(id: string): Promise<ThesisDetail> {
        try {
            const { data } = await api.get(`${this.THESIS_URI}/${id}`);
            return data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error('Falha ao buscar detalhes da tese');
        }
    }

    public static async createThesis(thesis: FormData): Promise<void> {
        try {
            await api.post(`${this.THESIS_URI}/`, thesis, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error('Falha ao criar tese');
        }
    }
}