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
  private cities: City[];

  constructor(
    private config: ConfigService, 
    private http: HttpClient) 
  {
    this.END_POINT = "/api/City";
    this.cities = [];
  }

  async getAllAsync(): Promise<City[]>{
    if(this.cities.length > 0)
      return this.cities;
    
    const url = await this.config.baseUrl(this.END_POINT);
    this.cities = [... await lastValueFrom(this.http.get<City[]>(url))];
    return this.cities;
  }
}
