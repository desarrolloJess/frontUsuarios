import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../interfaces/login-request';
import { Observable, map } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { RegisterRequest } from '../interfaces/register-request';
import { UserDetail } from '../interfaces/user-datail';
import { ResetPaswordRequest } from '../interfaces/resert-password-request';
import { ChangePaswordRequest } from '../interfaces/change-password-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl: string = environment.apiUrl;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}Account/login`, data)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          return response;
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}Account/register`, data);
  }

  getDetail = ():Observable<UserDetail> =>
    this.http.get<UserDetail>(`${this.apiUrl}Account/detail`);

  forgotPassword = (email: string):Observable<AuthResponse> =>
    this.http.post<AuthResponse>(`${this.apiUrl}Account/forgot-password`,{email});

  resetPassword = (data: ResetPaswordRequest):Observable<AuthResponse> =>
    this.http.post<AuthResponse>(`${this.apiUrl}Account/reset-password`,data);
  
  changePassword = (data: ChangePaswordRequest):Observable<AuthResponse> =>
    this.http.post<AuthResponse>(`${this.apiUrl}Account/change-password`,data);

  getUserDetail = () => {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken: any = jwtDecode(token);
    const userDetail = {
      id: decodedToken.nameid,
      fullName: decodedToken.name,
      email: decodedToken.email,
      roles: decodedToken.role || [],
    };

    return userDetail;
  };

  isLoggedIn = (): boolean => {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  };

  private isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    const decoded = jwtDecode(token);
    const isTokenExpired = Date.now() >= decoded['exp']! * 1000;
    if (isTokenExpired) this.logout();
    return isTokenExpired;
  }

  logout = (): void => {
    localStorage.removeItem(this.tokenKey);
  };

  getRoles = (): string[] | null =>{
      const token = this.getToken();
      if(!token) return null;

      const decodedToken: any = jwtDecode(token);
      return decodedToken.role || null;
  }

  getAll = (): Observable<UserDetail[]> =>
    this.http.get<UserDetail[]>(`${this.apiUrl}Account`)

  getToken = (): string | null =>
    localStorage.getItem(this.tokenKey) || '';
}
