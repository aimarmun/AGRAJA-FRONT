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

  constructor(
    private config: ConfigService, 
    private http: HttpClient) { 
    this.END_POINT = "/api/CropType";
  }

  async getAllAsync(): Promise<CropType[]>{
    const url = await this.config.baseUrl(this.END_POINT);
    console.log('Dirección GetAllCropTypes: ', url);
    return lastValueFrom(this.http.get<CropType[]>(url));
  }
}
