import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserLogin, UserNewPassword } from '../interfaces/user.interface';
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
  private intervalId: any;
  private saveInLocal: boolean;

  constructor(
    private config: ConfigService,
    private http: HttpClient) 
  { 
    this.END_POINT = '/api/Login';
    const token: any = localStorage.getItem('api-token');
    this.saveInLocal = token ? true : false;

    console.log("Api en localstorage?", this.saveInLocal);
    
    try{
      if(this.saveInLocal)
        this.jwtToken = JSON.parse(token || '');
      else
        this.jwtToken = JSON.parse(sessionStorage.getItem('api-token') || '')
    } catch {
      this.jwtToken = { token: '', refreshToken: '' };
    }

    console.log('Token guardado', this.jwtToken);
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

    this.saveInLocal = saveToken;
    if(saveToken) 
      localStorage.setItem('api-token', JSON.stringify(this.jwtToken));
    else
      sessionStorage.setItem('api-token', JSON.stringify(this.jwtToken));

    this.setToken();
    console.log(this.user)
    return this.user!;
  }
  
  async changePasswor(newCred: UserNewPassword): Promise<User> {
    const url = await this.config.baseUrl(this.END_POINT);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
   
    this.jwtToken = await  lastValueFrom(this.http.put<JwtToken>(url, newCred, httpOptions))

    this.saveTokenToStorage();

    this.setToken();

    return this.user!;
  }

  private saveTokenToStorage(forceToLocalStorage: boolean = false) {
    if (forceToLocalStorage || this.isTokenInLocalStorage())
      localStorage.setItem('api-token', JSON.stringify(this.jwtToken));
    else
      sessionStorage.setItem('api-token', JSON.stringify(this.jwtToken));
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
    this.user = { name, rol, exp };
    this.timeExpWatchDog();
  }

  private timeExpWatchDog(): void {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(async ()=> {
      // * le quitamos 5 segundos para no darle tiempo a que caduque el token
      const fiveSeconds = 5;
      if(Math.floor(((new Date).getTime() / 1000)- fiveSeconds) >= this.user?.exp! || 0){
        clearInterval(this.intervalId);
        try {
          await this.refreshToken();
        } catch (error) {
          console.log('Error al refrescar token', error)
          this.emitTimeExp();
          localStorage.removeItem('api-token');
          this.user = null;
        }
      }
    }, 1000);
  }

  public async refreshToken(): Promise<void> {
    const url = await this.config.baseUrl(this.END_POINT) + '/Refresh';
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
   
    this.jwtToken = await  lastValueFrom(this.http.post<JwtToken>(url, this.jwtToken, httpOptions))

    if(this.saveInLocal) 
      localStorage.setItem('api-token', JSON.stringify(this.jwtToken));
    else
      sessionStorage.setItem('api-token', JSON.stringify(this.jwtToken));

    this.setToken();

    console.log('Token actualizado usuario:', this.user)
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
    this.jwtToken = { token: '', refreshToken: '' };
    localStorage.removeItem('api-token');
  }

  private isTokenInLocalStorage(): boolean {
    return localStorage.getItem('api-token') !== null && localStorage.getItem('api-token') !== null;
  }
}
