import UserProfileManager from "../manager/UserProfileManager";
import {
    BaseUserWithRole,
    ChangePasswordData,
    CreateUser,
    UpdateUserProfileDTO,
    UserProfileResponse,
    UserRole,
} from "../dto/userProfileDTO";
import { useNotificationService } from "../../../shared/hooks/useNotificationService";

export default function UserProfileController() {
    const notification = useNotificationService();
    async function getCurrentUserProfile(): Promise<
        UserProfileResponse | undefined
    > {
        try {
            const user = await UserProfileManager.getLoggedUser();
            return user;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Falha ao recuperar informações do usuário";
            notification.error(errorMessage);
            return undefined;
        }
    }

    async function getUserRoles(): Promise<Array<UserRole>> {
        try {
            const roles = await UserProfileManager.getUserRoles();
            return roles;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Falha ao recuperar informações de papéis de usuário";
            notification.error(errorMessage);
            return [];
        }
    }

    async function getUsersByRoleId(
        role_id: string
    ): Promise<Array<BaseUserWithRole>> {
        try {
            const users = await UserProfileManager.getUsersByRoleId(role_id);
            return users;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Falha ao recuperar usuários por papel";
            notification.error(errorMessage);
            return [];
        }
    }

    async function createUser(user: CreateUser): Promise<boolean> {
        try {
            await UserProfileManager.createUser(user);
            notification.success("Usuário criado com sucesso!");
            return true;
        } catch (error: any) {
            const errorMessage =
                error instanceof Error ? error.message : "Falha ao criar usuário";
            notification.error(errorMessage);
            return false;
        }
    }

    async function updateUser(
        user: UpdateUserProfileDTO,
        user_id: string
    ): Promise<boolean> {
        try {
            await UserProfileManager.updateUser(user, user_id);
            notification.success("Usuário atualizado com sucesso!");
            return true;
        } catch (error: any) {
            const errorMessage =
                error instanceof Error ? error.message : "Falha ao atualizar usuário";
            notification.error(errorMessage);
            return false;
        }
    }

    async function changePassword(
        passwordData: ChangePasswordData
    ): Promise<boolean> {
        try {
            await UserProfileManager.changePassword(passwordData);
            notification.success("Senha alterada com sucesso!");
            return true;
        } catch (error: any) {
            const errorMessage =
                error instanceof Error ? error.message : "Falha ao alterar senha";
            notification.error(errorMessage);
            return false;
        }
    }

    return {
        getCurrentUserProfile,
        getUserRoles,
        createUser,
        updateUser,
        changePassword,
        getUsersByRoleId,
    };
}
