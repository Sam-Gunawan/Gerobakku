import { User } from './user.model';

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

// TODO: Add email verification request model