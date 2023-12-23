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
  private user: User | null;
  private suscribers: (()=> void)[];

  constructor(
    private config: ConfigService,
    private http: HttpClient) 
  { 
    this.END_POINT = '/api/Login';
    this.jwtToken = { token: localStorage.getItem('api-token') || '' };
    this.user = null;
    if(this.jwtToken.token !== '') this.setToken();
    this.suscribers = [];
  }

  async login(user: UserLogin, saveToken: boolean): Promise<User> {
    const url = await this.config.baseUrl(this.END_POINT);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
   
    this.jwtToken = await  lastValueFrom(this.http.post<JwtToken>(url, user, httpOptions))

    if(saveToken) localStorage.setItem('api-token', this.jwtToken.token);

    this.setToken();
    console.log(this.user)
    return this.user!;
  }
  
  suscribeExp(f:()=> void) {
    this.suscribers.push(f);
  }

  unsuscribeExp(f:()=> void){
    const index = this.suscribers.indexOf(f);
    if(index > -1){
      this.suscribers.splice(index, 1);
    }
  }

  private emitTimeExp(){
    this.suscribers.forEach(s => s());
  }

  private setToken(): void {
    
    const name = jwtDecode<PayLoad>(this.jwtToken.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const rol = jwtDecode<PayLoad>(this.jwtToken.token)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const exp = jwtDecode(this.jwtToken.token).exp ?? 0;
    this.user = {name, rol, exp};
    this.timeExpWatchDog();
  }

  private timeExpWatchDog(): void {
    const interval = setInterval(()=> {
      if(Math.floor((new Date).getTime() / 1000) >= this.user?.exp! || 0){
        this.emitTimeExp();
        localStorage.removeItem('api-token');
        this.user = null;
        clearInterval(interval);
      }
    }, 1000);
  }

  public isAdmin(): boolean {
    return this.user?.rol === 'Admin';
  }

  public getToken(): JwtToken {
    return this.jwtToken;
  }

  public isLogged(): boolean {
    return this.user !== null && this.jwtToken.token !== '';
  }
  public getUser(): User | null {
    return this.user;
  }

  public logoOff(): void {
    this.user = null;
    this.jwtToken = {token: ''};
    localStorage.removeItem('api-token');
  }
}
