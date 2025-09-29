import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from '../http/api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUserInfo {
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
  user_info: LoginResponseUserInfo;
  two_factor_required: boolean;
}

export interface MeResponse {
  user_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  role: string;
  two_factor_enabled: boolean;
  last_login?: string;
  created_at?: string;
}

export interface SessionUser {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  two_factor_enabled: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  last_login?: string;
  created_at?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface EnableTwoFactorPayload {
  password: string;
}

export interface RequestDisableTwoFactorPayload {
  password: string;
}

export interface RequestDisableTwoFactorResponse {
  code_sent: boolean;
  message: string;
}

export interface ConfirmDisableTwoFactorPayload {
  verification_code: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userInfoKey = 'user_info';
  private readonly tokenTypeKey = 'token_type';
  private readonly expiresAtKey = 'expires_at';
  private readonly storage: Storage | null = typeof window !== 'undefined' ? window.sessionStorage : null;
  private readonly roleRedirectMap: Record<string, string> = {
    "administrador": '/admin',
    "coordinador": '/ops',
    "operaciones": '/ops',
    "operador": '/ops',
    "admin": '/admin',
    "ops": '/ops',
    "repartidor": '/',
    "comercio": '/',
    "default": '/',
  };

  private readonly currentUser = signal<SessionUser | null>(this.getStoredUser());
  readonly user = this.currentUser.asReadonly();

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  login(credentials: LoginRequest): Observable<SessionUser> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => this.persistSession(response)),
      map(() => this.currentUser() as SessionUser)
    );
  }

  restoreSession(): void {
    const storedUser = this.getStoredUser();
    this.currentUser.set(storedUser);

    if (!this.api.getAccessToken()) {
      this.clearSessionStorage();
      return;
    }

    this.api
      .get<MeResponse>('/auth/me')
      .pipe(
        map((response) => this.normalizeMeResponse(response)),
        tap((user) => this.setUser(user)),
        catchError(() => {
          this.clearSessionStorage();
          return of(null);
        })
      )
      .subscribe();
  }

  logout(): void {
    this.api.post('/auth/logout').subscribe();
    this.clearSessionStorage();
    this.router.navigate(['/login']);
  }

  getUserInfo(): SessionUser | null {
    return this.currentUser();
  }

  getTokenType(): string | null {
    return this.storage?.getItem(this.tokenTypeKey) ?? null;
  }

  getExpiresAt(): number | null {
    const raw = this.storage?.getItem(this.expiresAtKey);
    return raw ? Number(raw) : null;
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.api.post<void>('/auth/change-password', payload);
  }

  enableTwoFactor(payload: EnableTwoFactorPayload): Observable<void> {
    return this.api.post<void>('/auth/enable-2fa', payload).pipe(
      tap(() => {
        // Refresh user info so UI reflects the latest 2FA status
        this.restoreSession();
      })
    );
  }

  requestDisableTwoFactor(
    payload: RequestDisableTwoFactorPayload
  ): Observable<RequestDisableTwoFactorResponse> {
    return this.api.post<RequestDisableTwoFactorResponse>('/auth/request-disable-2fa', payload);
  }

  confirmDisableTwoFactor(payload: ConfirmDisableTwoFactorPayload): Observable<void> {
    return this.api.post<void>('/auth/confirm-disable-2fa', payload).pipe(
      tap(() => this.restoreSession())
    );
  }

  getHomeRouteForRole(role?: string | null): string {
    if (!role) return this.roleRedirectMap['default'];
    const trimmed = role.trim();
    const normalized = trimmed.toLowerCase();
    const mappedRoute = this.roleRedirectMap[normalized];
    if (mappedRoute) return mappedRoute;
    return trimmed ? `/${trimmed}` : this.roleRedirectMap['default'];
  }

  private persistSession(response: LoginResponse): void {
    this.api.setAccessToken(response.access_token);
    this.api.setRefreshToken(response.refresh_token);

    const normalizedUser = this.normalizeLoginUser(response.user_info);
    this.setUser(normalizedUser);

    if (!this.storage) return;

    this.storage.setItem(this.tokenTypeKey, response.token_type);
    const expiresAt = Date.now() + response.expires_in * 1000;
    this.storage.setItem(this.expiresAtKey, `${expiresAt}`);
  }

  private setUser(user: SessionUser): void {
    if (this.storage) {
      this.storage.setItem(this.userInfoKey, JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  private getStoredUser(): SessionUser | null {
    const raw = this.storage?.getItem(this.userInfoKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }

  private normalizeLoginUser(user: LoginResponseUserInfo): SessionUser {
    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      two_factor_enabled: user.two_factor_enabled,
    };
  }

  private normalizeMeResponse(response: MeResponse): SessionUser {
    const nameFromParts = [response.first_name, response.last_name]
      .filter((value) => !!value && value.trim().length > 0)
      .join(' ')
      .trim();

    const fullName = response.full_name && response.full_name.trim().length > 0
      ? response.full_name
      : nameFromParts || response.email;

    return {
      user_id: response.user_id,
      email: response.email,
      full_name: fullName,
      role: response.role,
      two_factor_enabled: response.two_factor_enabled,
      first_name: response.first_name,
      last_name: response.last_name,
      phone: response.phone,
      last_login: response.last_login,
      created_at: response.created_at,
    };
  }

  private clearSessionStorage(): void {
    this.api.clearTokens();
    this.currentUser.set(null);
    this.storage?.removeItem(this.userInfoKey);
    this.storage?.removeItem(this.tokenTypeKey);
    this.storage?.removeItem(this.expiresAtKey);
  }
}
