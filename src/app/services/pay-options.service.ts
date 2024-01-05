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
  private payOptions: PayOption[];

  constructor(private configService: ConfigService,
    private http: HttpClient) { 
    this.END_POINT = '/api/PayOption'
    this.payOptions = [];
  }

  async getAll(): Promise<PayOption[]> {
    if(this.payOptions.length > 0)
      return this.payOptions;

    const url = this.configService.getBaseUrl(this.END_POINT);
    this.payOptions = [...await lastValueFrom(this.http.get<PayOption[]>(url))];
    return  this.payOptions;
  }
}
