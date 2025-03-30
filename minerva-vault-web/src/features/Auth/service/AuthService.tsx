import api from "../../../config/api";
import { LoginDTO, AuthTokensResponse } from "../dto/authDTO";

export default class AuthService {
    private static readonly AUTH_URI = "/auth";

    public static async login(
        credentials: LoginDTO
    ): Promise<AuthTokensResponse> {
        try {
            const { data } = await api.post<AuthTokensResponse>(
                `${this.AUTH_URI}/login/`,
                credentials
            );
            return data;
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }

                throw new Error(JSON.stringify(errorData));
            }
            throw new Error("Falha ao realizar login. Tente novamente mais tarde.");
        }
    }

    public static async refreshToken(
        refresh: string
    ): Promise<{ access: string }> {
        try {
            const { data } = await api.post<{ access: string }>(
                `${this.AUTH_URI}/refresh/`,
                { refresh }
            );
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
                "Falha ao atualizar o token. Tente novamente mais tarde."
            );
        }
    }
}
