import { User } from './user.model';

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

// TODO: Add email verification request model