import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

const TOKEN_KEY = 'gbk_token';
const USER_KEY = 'gbk_user';

@Injectable({ providedIn: 'root' })

export class TokenStorageService {
    setSession(token: string, user: User): void {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    getUser(): User | null {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }
}