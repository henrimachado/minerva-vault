export interface LoginDTO {
    username: string;
    password: string;
}

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface AuthTokensResponse {
    access: string;
    refresh: string;
}   