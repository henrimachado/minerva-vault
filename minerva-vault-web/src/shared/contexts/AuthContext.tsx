import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserProfileResponse } from '../../features/UserProfile/dto/userProfileDTO'; 
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../config/constants';
import UserProfileService from '../../features/UserProfile/service/UserProfileService'; 

interface AuthContextType {
    user: UserProfileResponse | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: UserProfileResponse) => void;
    clearUser: () => void;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Define o usuário no contexto
    function setUser(userProfile: UserProfileResponse): void {
        setUserState(userProfile);
    }

    // Limpa o usuário do contexto
    function clearUser(): void {
        setUserState(null);
    }

    // Efeito para carregar o usuário ao inicializar, se houver token
    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (token) {
                try {
                    // Se tem token, busca o perfil da API
                    const userProfile = await UserProfileService.getLoggedUser();
                    setUserState(userProfile);
                } catch (error) {
                    // Se falhar, limpa o token
                    localStorage.removeItem(ACCESS_TOKEN_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    setUserState(null);
                }
            }

            setLoading(false);
        }

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            setUser,
            clearUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para uso do contexto
export function useAuth() {
    return useContext(AuthContext);
}