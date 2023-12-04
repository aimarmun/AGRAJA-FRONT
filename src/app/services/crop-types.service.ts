import { Injectable } from '@angular/core';
import { CropType } from '../interfaces/crop-type.interface';
import { ConfigService } from './config.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CropTypesService {
  
  private readonly END_POINT: string;
  private cropTypes: CropType[];

  constructor(
    private config: ConfigService, 
    private http: HttpClient) { 
    this.END_POINT = "/api/CropType";
    this.cropTypes = [];
  }

  async getAllAsync(): Promise<CropType[]>{
    if(this.cropTypes.length > 0)
      return this.cropTypes;

    const url = await this.config.baseUrl(this.END_POINT);
    this.cropTypes = [...await lastValueFrom(this.http.get<CropType[]>(url))];
    return this.cropTypes;
  }
}
