import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { PayOption } from '../interfaces/pay-option.interface';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PayOptionsService {
  private END_POINT: string;
  constructor(private configService: ConfigService,
    private http: HttpClient) { 
    this.END_POINT = '/api/PayOption'
  }

  async getAll(): Promise<PayOption[]> {
    const url = await this.configService.baseUrl(this.END_POINT);
    return  lastValueFrom(this.http.get<PayOption[]>(url));
  }
}
