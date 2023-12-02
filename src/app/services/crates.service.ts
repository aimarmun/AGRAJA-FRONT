import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Crate, CrateSale, CrateSaleRequest, CrateUpdate } from '../interfaces/crate.interface';

@Injectable({
  providedIn: 'root'
})
export class CratesService {
  private END_POINT: string;
  
  constructor(private config: ConfigService,
    private http: HttpClient) {
    this.END_POINT = '/api/Crate/'
  }

  async getAllAsync(): Promise<Crate[]> {
    const url = await this.config.baseUrl(this.END_POINT);
    return await lastValueFrom(this.http.get<Crate[]>(url))
  }

  async addSaleAsync(crateSale: CrateSale): Promise<CrateSaleRequest> {
    const url = await this.config.baseUrl(this.END_POINT) + 'CrateSale';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.post<CrateSaleRequest>(url, crateSale, httpOptions));
  }

  async getByIdAsync(crateId: number): Promise<Crate> {
    const url = await this.config.baseUrl(this.END_POINT) + crateId;
    return await lastValueFrom(this.http.get<Crate>(url));
  }

  async updateAsync(crateId: number, updateData: CrateUpdate): Promise<Crate> {
    const url = await this.config.baseUrl(this.END_POINT) + crateId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.put<Crate>(url, updateData, httpOptions));
  }

  async addAsync(crate: Crate): Promise<Crate> {
    const url = await this.config.baseUrl(this.END_POINT);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.post<Crate>(url, crate, httpOptions));
  }
  
  async getAllSalesByCrateId(crateId: number): Promise<CrateSaleRequest[]> {
    const url = await this.config.baseUrl(this.END_POINT) +`GetAllSales/${crateId}`;
    return await lastValueFrom(this.http.get<CrateSaleRequest[]>(url));
  }
  
  async getAllSalesByClientId(clientId: number): Promise<CrateSaleRequest[]> {
    const url = await this.config.baseUrl(this.END_POINT) +`GetAllClientSales/${clientId}`;
    return await lastValueFrom(this.http.get<CrateSaleRequest[]>(url));
  }
}
