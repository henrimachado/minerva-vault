import api from "../../../config/api";
import {
    BaseUserWithRole,
    ChangePasswordData,
    CreateUser,
    UserProfileResponse,
    UserRole,
} from "../dto/userProfileDTO";

export default class UserProfileService {
    private static readonly USER_URI = "/user";

    public static async getLoggedUser(): Promise<UserProfileResponse> {
        try {
            const { data } = await api.get(`${this.USER_URI}/me/`);
            return data;
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(
                "Falha ao recuperar informações do usuário. Tente novamente mais tarde."
            );
        }
    }

    public static async getUserRoles(): Promise<Array<UserRole>> {
        try {
            const { data } = await api.get(`${this.USER_URI}/roles/`);
            return data;
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(
                "Falha ao recuperar informações de papéis de usuário. Tente novamente mais tarde."
            );
        }
    }

    public static async createUser(userFormData: FormData): Promise<void> {
        try {
            await api.post(`${this.USER_URI}/`, userFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error("Falha ao criar usuário. Tente novamente mais tarde");
        }
    }

    public static async updateUser(
        userFormData: FormData,
        user_id: string
    ): Promise<void> {
        try {
            await api.patch(`${this.USER_URI}/${user_id}/`, userFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(
                "Falha ao atualizar usuário. Tente novamente mais tarde."
            );
        }
    }

    public static async changePassword(
        passwordData: ChangePasswordData
    ): Promise<void> {
        try {
            await api.patch(`${this.USER_URI}/change_password/`, passwordData, {});
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }

            throw new Error(
                "Falha ao alterar senha. Verifique suas credenciais e tente novamente."
            );
        }
    }

    public static async getUsersByRoleId(
        role_id: string
    ): Promise<Array<BaseUserWithRole>> {
        try {
            const { data } = await api.get(`${this.USER_URI}/?role_id=${role_id}`);
            return data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(
                "Falha ao recuperar usuários por papel. Tente novamente mais tarde."
            );
        }
    }
}
