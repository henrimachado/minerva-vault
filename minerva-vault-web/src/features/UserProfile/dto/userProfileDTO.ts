export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    inactivated_at: string | null;
    avatar_url: string | null;
    roles: Array<UserRole>;
    password_status?: {
        needs_change: boolean;
        days_until_expiration: number;
        last_change: string;
        urgency: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK';
    };
}

export interface UserRole {
    id: string;
    name: string;
}

export interface CreateUser {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    role_id: string;
    avatar?: File | null;
}

export interface UpdateUserProfileDTO {
    first_name?: string;
    last_name?: string;
    avatar?: File | null;
}

export interface ChangePasswordData {
    current_password: string;
    new_password: string;
    password_confirmation: string;
}