import AuthManager from '../manager/AuthManager';
import { LoginDTO, AuthTokensResponse } from '../dto/authDTO';

export default function AuthController() {

    async function login(credentials: LoginDTO): Promise<AuthTokensResponse | undefined> {
        try {
            const tokenResponse = await AuthManager.login(credentials);

            if (tokenResponse) {
                return tokenResponse;
            }

            else {
                throw new Error('Falha ao realizar login');
            }
        }
        catch (error) {
            console.log('Erro durante o login', error);
            return undefined;
        }
    }

    function logout(): void {
        AuthManager.logout();
    }

    function isAuthenticated(): boolean {
        return AuthManager.isAuthenticated();
    }

    return {
        login,
        logout,
        isAuthenticated
    };

}