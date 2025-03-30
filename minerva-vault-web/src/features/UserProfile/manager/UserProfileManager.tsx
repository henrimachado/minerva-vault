import UserProfileService from "../service/UserProfileService";
import { BaseUserWithRole, ChangePasswordData, CreateUser, UpdateUserProfileDTO, UserProfileResponse, UserRole } from "../dto/userProfileDTO";

export default class UserProfileManager {
    public static async getLoggedUser(): Promise<UserProfileResponse> {
        return await UserProfileService.getLoggedUser();
    }

    public static async getUserRoles(): Promise<Array<UserRole>> {
        return await UserProfileService.getUserRoles();
    }

    public static async createUser(user: CreateUser): Promise<void> {
        const userFormData = new FormData();

        userFormData.append('username', user.username);
        userFormData.append('email', user.email);
        userFormData.append('password', user.password);
        userFormData.append('password_confirmation', user.password_confirmation);
        userFormData.append('role_id', user.role_id);

        if (user.first_name) {
            userFormData.append('first_name', user.first_name);
        }

        if (user.last_name) {
            userFormData.append('last_name', user.last_name);
        }

        if (user.avatar) {
            userFormData.append('avatar', user.avatar);
        }

        await UserProfileService.createUser(userFormData);
    }

    public static async updateUser(user: UpdateUserProfileDTO, user_id: string): Promise<void> {
        const userFormData = new FormData();

        if (user.first_name !== undefined) {
            userFormData.append('first_name', `${user.first_name}`);
        }

        if (user.last_name !== undefined) {
            userFormData.append('last_name', `${user.last_name}`);
        }

        if (user.avatar === null) {
            userFormData.append('avatar', 'null');
        } else if (user.avatar instanceof File) {
            userFormData.append('avatar', user.avatar);
        }

        await UserProfileService.updateUser(userFormData, user_id);
    }

    public static async changePassword(passwordData: ChangePasswordData): Promise<void> {
        await UserProfileService.changePassword(passwordData);
    }

    public static async getUsersByRoleId(role_id: string): Promise<Array<BaseUserWithRole>> {
        return await UserProfileService.getUsersByRoleId(role_id);
    }
}