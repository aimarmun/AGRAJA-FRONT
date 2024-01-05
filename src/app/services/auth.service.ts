import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserLogin, UserNewPassword } from '../interfaces/user.interface';
import { BehaviorSubject, Observable, catchError, lastValueFrom, of, tap } from 'rxjs';
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
 // private intervalId: any;
  private saveInLocal: boolean;
  public isRefreshingToken: boolean;
  public refreshToken$ = new BehaviorSubject<JwtToken | null>(null);

  constructor(
    private config: ConfigService,
    private http: HttpClient) 
  { 
    this.END_POINT = '/api/Login';
    const token: any = localStorage.getItem('api-token');
    this.saveInLocal = token ? true : false;
    this.isRefreshingToken = false;

    console.log("Api en localstorage?", this.saveInLocal);
    
    try {
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
    console.log('Arrancando con usuario', this.user);
  }

  async login(user: UserLogin, saveToken: boolean): Promise<User> {
    const url = this.config.getBaseUrl(this.END_POINT);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
   
    this.jwtToken = await  lastValueFrom(this.http.post<JwtToken>(url, user, httpOptions))

    this.saveInLocal = saveToken;
    
    this.saveToken();

    this.setToken();
    console.log(this.user)
    return this.user!;
  }

  async revoke(): Promise<void>{
   // clearInterval(this.intervalId);
    const url = this.config.getBaseUrl(this.END_POINT) + '/Revoke';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
    await lastValueFrom(this.http.post(url, httpOptions));
  }
  
  async changePasswor(newCred: UserNewPassword): Promise<User> {
    const url = this.config.getBaseUrl(this.END_POINT);
    
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
  }

  /**
   * Comprueba si Bearer token ha expirado
   * @returns retorna verdadero si Bearer token ha expirado
   */
  private isExpired(): boolean {
    return (Math.floor((new Date).getTime() / 1000) >= (this.user?.exp! || 0));
  }

  refreshTokenOb(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8'
      })
    }
    return this.http
      .post<JwtToken>(this.config.getBaseUrl(`${this.END_POINT}/Refresh`), this.jwtToken, httpOptions)
      .pipe(
        tap((tokens: JwtToken) => {
          this.jwtToken = tokens;
          this.saveToken();
        }),
        catchError((error) => {
          console.log('error on refresh tokens:', error);
          this.logoOff();
          return of(false);
        })
      );
  }

  private saveToken() {
    if (this.saveInLocal)
      localStorage.setItem('api-token', JSON.stringify(this.jwtToken));
    else
      sessionStorage.setItem('api-token', JSON.stringify(this.jwtToken));
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
    sessionStorage.removeItem('api-token');
  }

  private isTokenInLocalStorage(): boolean {
    return localStorage.getItem('api-token') !== null && localStorage.getItem('api-token') !== null;
  }
}
