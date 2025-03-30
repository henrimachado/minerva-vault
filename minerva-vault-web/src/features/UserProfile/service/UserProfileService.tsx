import api from "../../../config/api";
import { ChangePasswordData, CreateUser, UserProfileResponse, UserRole } from "../dto/userProfileDTO";

export default class UserProfileService {
    private static readonly USER_URI = "/user/";

    public static async getLoggedUser(): Promise<UserProfileResponse> {
        try {
            const { data } = await api.get(`${this.USER_URI}me/`);
            return data;
        } catch (error) {
            throw new Error("Falha ao obter dados do usuário");
        }
    }

    public static async getUserRoles(): Promise<Array<UserRole>> {
        try {
            const { data } = await api.get(`${this.USER_URI}roles/`);
            return data;
        } catch (error) {
            throw new Error("Falha ao obter papéis do usuário");
        }
    }

    public static async createUser(userFormData: FormData): Promise<void> {
        try {

            await api.post(this.USER_URI, userFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

        } catch (error: any) {
            throw new Error("Falha ao criar usuário");
        }
    }

    public static async updateUser(userFormData: FormData, user_id: string): Promise<void> {
        try {
            await api.patch(`${this.USER_URI}${user_id}/`, userFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error: any) {
            throw new Error("Falha ao atualizar usuário");
        }
    }

    public static async changePassword(passwordData: ChangePasswordData): Promise<void> {
        try {
            await api.patch(`${this.USER_URI}change_password/`, passwordData, {
            });
        } catch (error: any) {
            throw new Error("Falha ao atualizar senha");
        }
    }
}