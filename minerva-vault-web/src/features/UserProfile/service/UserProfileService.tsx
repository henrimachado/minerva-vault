import api from "../../../config/api";
import { UserProfileResponse, UserRole } from "../dto/userProfileDTO";

export default class UserProfileService {
    private static readonly USER_URI = "/user";

    public static async getLoggedUser(): Promise<UserProfileResponse> {
        try {
            const { data } = await api.get(`${this.USER_URI}/me/`);
            return data;
        } catch (error) {
            throw new Error("Falha ao obter dados do usuário");
        }
    }

    public static async getUserRoles(): Promise<Array<UserRole>> {
        try {
            const { data } = await api.get(`${this.USER_URI}/roles/`);
            return data;
        } catch (error) {
            throw new Error("Falha ao obter papéis do usuário");	
        }
    }
}