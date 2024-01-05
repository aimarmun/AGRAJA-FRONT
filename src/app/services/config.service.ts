import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../interfaces/config.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: Config;
  private loaded: boolean;

  constructor(private http: HttpClient) 
  {   
      this.config = {
         "apiHost" : ""
      }
      this.loaded = false;
  }

  /**
   * Método para leer la configuración. EJECUTARLO EN EL NGONINIT DE APP.COMPONENT.TS.
   * @returns 
   */
  async loadConfig(): Promise<void> {
    if(this.loaded) return;
    this.config = await lastValueFrom(this.http.get<Config>('assets/config.json', { responseType: 'json' }));
    console.log('Configuración leída.');
    this.loaded = true;
  }

  /**
   * Este método está deprecado y será eliminado
   * @deprecated
   */
  async baseUrl(withEndPoin: string = ''): Promise<string> {
    await this.loadConfig();
    return this.config.apiHost + withEndPoin;
  }

  getBaseUrl(withEndPoint: string = ''): string {
    return this.config.apiHost + withEndPoint;
  }
}
