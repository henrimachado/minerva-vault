import UserProfileManager from '../manager/UserProfileManager';
import { CreateUser, UpdateUserProfileDTO, UserProfileResponse, UserRole } from '../dto/userProfileDTO';
import NotificationService from '../../../shared/services/NotificationService';

export default function UserProfileController() {
    async function getCurrentUserProfile(): Promise<UserProfileResponse | undefined> {
        try {
            const user = await UserProfileManager.getLoggedUser();
            return user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao recuperar informações do usuário';
            NotificationService.error(errorMessage);
            return undefined;
        }
    }

    async function getUserRoles(): Promise<Array<UserRole> | undefined> {
        try {
            const roles = await UserProfileManager.getUserRoles();
            return roles;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao recuperar informações de papéis de usuário';
            NotificationService.error(errorMessage);
            return undefined;
        }
    }

    async function createUser(user: CreateUser): Promise<boolean> {
        try {
            await UserProfileManager.createUser(user);
            NotificationService.success('Usuário criado com sucesso!');
            return true;
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao criar usuário';
            NotificationService.error(errorMessage);
            return false;
        }
    }

    async function updateUser(user: UpdateUserProfileDTO, user_id: string): Promise<boolean> {
        try {
            await UserProfileManager.updateUser(user, user_id);
            NotificationService.success('Usuário atualizado com sucesso!');
            return true;
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar usuário';
            NotificationService.error(errorMessage);
            return false;
        }
    }

    return {
        getCurrentUserProfile,
        getUserRoles,
        createUser,
        updateUser,
    };
}