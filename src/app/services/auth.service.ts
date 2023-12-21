import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserLogin } from '../interfaces/user.interface';
import { lastValueFrom } from 'rxjs';
import { JwtToken } from '../interfaces/jwt-token.interface';

class PayLoad {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  'exp': number;
  'aud': string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly END_POINT: string;
  private jwtToken: JwtToken;
  private user: User;

  constructor(
    private config: ConfigService,
    private http: HttpClient) 
  { 
    this.END_POINT = '/api/Login';
    this.jwtToken = { token: '' };
    this.user = { name: '', rol: '', exp: 0 };
  }

  async login(user: UserLogin): Promise<User> {
    const url = await this.config.baseUrl(this.END_POINT);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
   
    this.jwtToken = await  lastValueFrom(this.http.post<JwtToken>(url, user, httpOptions))
    
    this.setToken()
    return this.user;
  }
  
  private setToken(): void {
    localStorage.setItem('api-token', this.jwtToken.token);
    this.user.name = jwtDecode<PayLoad>(this.jwtToken.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    this.user.rol = jwtDecode<PayLoad>(this.jwtToken.token)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.user.exp = jwtDecode(this.jwtToken.token).exp ?? 0;
  }

  public isAdmin(): boolean {
    return this.user.rol === 'Admin';
  }

  public getToken(): JwtToken {
    return this.jwtToken;
  }
}
