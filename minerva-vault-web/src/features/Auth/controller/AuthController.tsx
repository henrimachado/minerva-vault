import AuthManager from '../manager/AuthManager';
import { LoginDTO, AuthTokensResponse } from '../dto/authDTO';
import NotificationService from '../../../shared/services/NotificationService';

export default function AuthController() {

    async function login(credentials: LoginDTO): Promise<AuthTokensResponse | undefined> {
        try {
            const tokenResponse = await AuthManager.login(credentials);

            if (tokenResponse) {
                NotificationService.success('Login realizado com sucesso!');
                return tokenResponse;
            }
            else {
                NotificationService.error('Falha ao realizar login');
                throw new Error('Falha ao realizar login');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro durante o login';
            NotificationService.error(errorMessage);
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