import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { City } from '../interfaces/city.interface';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CitiesService {
  private readonly END_POINT: string;

  constructor(
    private config: ConfigService, 
    private http: HttpClient) 
  {
    this.END_POINT = "/api/City";
  }

  async getAllAsync(): Promise<City[]>{
    const url = await this.config.baseUrl(this.END_POINT);
    return lastValueFrom(this.http.get<City[]>(url))
  }
}
