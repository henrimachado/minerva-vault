import UserProfileManager from '../manager/UserProfileManager';
import { UserProfileResponse, UserRole } from '../dto/userProfileDTO';

export default function UserProfileController() {
    async function getCurrentUserProfile(): Promise<UserProfileResponse | undefined> {
        try {
            const user = await UserProfileManager.getLoggedUser();
            return user;
        } catch (error) {
            console.error('Falha ao recuperar informações do usuário', error);
            return undefined;
        }
    }

    async function getUserRoles(): Promise<Array<UserRole> | undefined> {
        try {
            const roles = await UserProfileManager.getUserRoles();
            return roles;
        } catch (error) {
            console.error('Falha ao recuperar papéis do usuário', error);
            return undefined;
        }
    }

    return {
        getCurrentUserProfile,
        getUserRoles,
    };
}