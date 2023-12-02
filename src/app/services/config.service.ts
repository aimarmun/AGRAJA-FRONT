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

  private async loadConfig(): Promise<void> {
    if(this.loaded) return;
  //  console.log('Leyendo configuración');   
    this.config = await lastValueFrom(this.http.get<Config>('assets/config.json', { responseType: 'json' }));
    this.loaded = true;
  }

  async baseUrl(withEndPoin: string = ""): Promise<string> {
    await this.loadConfig();
    return this.config.apiHost + withEndPoin;
  }
}
