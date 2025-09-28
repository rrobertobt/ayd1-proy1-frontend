import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../http/api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  two_factor_enabled: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_info: UserInfo;
  two_factor_required: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userInfoKey = 'user_info';
  private readonly tokenTypeKey = 'token_type';
  private readonly expiresAtKey = 'expires_at';
  private readonly storage: Storage | null = typeof window !== 'undefined' ? window.sessionStorage : null;

  constructor(private api: ApiService, private router: Router) {}

  login(credentials: LoginRequest): Observable<UserInfo> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.user_info)
    );
  }

  logout(): void {
    this.api.clearTokens();
    this.storage?.removeItem(this.userInfoKey);
    this.storage?.removeItem(this.tokenTypeKey);
    this.storage?.removeItem(this.expiresAtKey);
    this.router.navigate(['/login']);
  }

  getUserInfo(): UserInfo | null {
    const raw = this.storage?.getItem(this.userInfoKey);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  }

  getTokenType(): string | null {
    return this.storage?.getItem(this.tokenTypeKey) ?? null;
  }

  getExpiresAt(): number | null {
    const raw = this.storage?.getItem(this.expiresAtKey);
    return raw ? Number(raw) : null;
  }

  private persistSession(response: LoginResponse): void {
    this.api.setAccessToken(response.access_token);
    this.api.setRefreshToken(response.refresh_token);

    if (!this.storage) return;

    this.storage.setItem(this.userInfoKey, JSON.stringify(response.user_info));
    this.storage.setItem(this.tokenTypeKey, response.token_type);
    const expiresAt = Date.now() + response.expires_in * 1000;
    this.storage.setItem(this.expiresAtKey, `${expiresAt}`);
  }
}
