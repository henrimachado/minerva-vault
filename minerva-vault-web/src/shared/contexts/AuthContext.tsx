import React, { createContext, useState, useEffect, useContext } from "react";
import { UserProfileResponse } from "../../features/UserProfile/dto/userProfileDTO";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../config/constants";
import UserProfileService from "../../features/UserProfile/service/UserProfileService";

interface AuthContextType {
    user: UserProfileResponse | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: UserProfileResponse) => void;
    clearUser: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    function setUser(userProfile: UserProfileResponse): void {
        setUserState(userProfile);
    }

    function clearUser(): void {
        setUserState(null);
    }

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (token) {
                try {
                    const userProfile = await UserProfileService.getLoggedUser();
                    setUserState(userProfile);
                } catch (error) {
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
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                setUser,
                clearUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
