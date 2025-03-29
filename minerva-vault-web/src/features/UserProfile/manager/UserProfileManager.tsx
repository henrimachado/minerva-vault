import UserProfileService from "../service/UserProfileService";
import { UserProfileResponse, UserRole } from "../dto/userProfileDTO";

export default class UserProfileManager {
    public static async getLoggedUser(): Promise<UserProfileResponse> {
        return await UserProfileService.getLoggedUser();
    }

    public static async getUserRoles(): Promise<Array<UserRole>>{
        return await UserProfileService.getUserRoles();
    }
}