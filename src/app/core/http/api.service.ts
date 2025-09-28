// src/app/core/http/api.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './enviroment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private readonly tokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly storage: Storage | null = typeof window !== 'undefined' ? window.sessionStorage : null;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${path}`, this.createOptions({ params }))
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body, this.createOptions({ params }))
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any, params?: Record<string, any>): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, body, this.createOptions({ params }))
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${path}`, body, this.createOptions({ params }))
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string, params?: Record<string, any>): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${path}`, this.createOptions({ params }))
      .pipe(catchError(this.handleError));
  }

  setAccessToken(token: string): void {
    this.storage?.setItem(this.tokenKey, token);
  }

  getAccessToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  clearAccessToken(): void {
    this.storage?.removeItem(this.tokenKey);
  }

  setRefreshToken(token: string): void {
    this.storage?.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.storage?.getItem(this.refreshTokenKey) ?? null;
  }

  clearRefreshToken(): void {
    this.storage?.removeItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }

  private handleError(error: any) {
    const msg = error?.error?.message || 'Request failed';
    return throwError(() => ({ ...error, message: msg }));
  }

  private createOptions(options?: { params?: Record<string, any> }) {
    const token = this.getAccessToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return headers ? { ...options, headers } : { ...options };
  }
}
