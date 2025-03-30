import AuthService from "../service/AuthService";
import { LoginDTO, AuthTokensResponse } from "../dto/authDTO";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_PROFILE_KEY } from "../../../config/constants";

export default class AuthManager {
    public static async login(credentials: LoginDTO): Promise<AuthTokensResponse> {
        const response = await AuthService.login(credentials);

        if (response.access && response.refresh) {
            localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh);
        }

        return response;
    }

    public static async refreshToken(refresh: string): Promise<{ access: string }> {
        const response = await AuthService.refreshToken(refresh);

        localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
        return response;
    }

    public static logout(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
    }

    public static isAuthenticated(): boolean {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    }


}