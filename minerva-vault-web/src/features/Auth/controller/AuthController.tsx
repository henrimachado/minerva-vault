import AuthManager from '../manager/AuthManager';
import { LoginDTO, AuthTokensResponse } from '../dto/authDTO';
import { useNotificationService } from '../../../shared/hooks/useNotificationService';

export default function AuthController() {
    const notification = useNotificationService();
    async function login(credentials: LoginDTO): Promise<AuthTokensResponse > {
        try {
            const tokenResponse = await AuthManager.login(credentials);

            if (tokenResponse) {
                notification.success('Login realizado com sucesso!');
                return tokenResponse;
            }
            else {
                notification.error('Falha ao realizar login');
                throw new Error('Falha ao realizar login');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro durante o login';
            notification.error(errorMessage);
            throw error;
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