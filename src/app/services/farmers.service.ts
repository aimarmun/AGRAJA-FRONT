import { Injectable } from '@angular/core';
import { Farmer, FarmerAdd, FarmerUpdate } from '../interfaces/farmer.interface';
import { ConfigService } from './config.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../interfaces/client.interface';
import { FarmerHiring, FarmerHiringRequest, HiringAddRequestDto } from '../interfaces/farmer-hiring.interface';

@Injectable({
  providedIn: 'root'
})
export class FarmersService {
  
  private END_POINT: string;

  constructor(
    private config: ConfigService, 
    private http: HttpClient) 
  {
    this.END_POINT = "/api/Farmer/";
  }

  async getAllAsync(): Promise<Farmer[]> {
    const url = this.config.getBaseUrl(this.END_POINT) + "CropType/0";
    return await lastValueFrom(this.http.get<Farmer[]>(url));
  }

  async getByCropIdAsync(cropId: number): Promise<Farmer[]> {
    const url = this.config.getBaseUrl(this.END_POINT) + `CropType/${cropId}`;
    return await lastValueFrom(this.http.get<Farmer[]>(url));
  }

  async getByIdAsync(id: number): Promise<Farmer> {
    const url = this.config.getBaseUrl(this.END_POINT) + id;
    return await lastValueFrom(this.http.get<Farmer>(url));
  }

  async updateAsync(id:number, updateData: FarmerUpdate): Promise<Farmer>{
    //console.log(updateData);
    const url = this.config.getBaseUrl(this.END_POINT) + id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.put<Farmer>(url, updateData, httpOptions));
  }

  async getFarmerHiringsByIdAsync(farmerId: number): Promise<FarmerHiring[]> {
    const url = this.config.getBaseUrl(this.END_POINT) + `Hiring/${farmerId}`;
    return await lastValueFrom(this.http.get<FarmerHiring[]>(url))
  }

  async addHiringAsync(newHiring: FarmerHiringRequest): Promise<HiringAddRequestDto>{
    const url = this.config.getBaseUrl(this.END_POINT) + 'Hiring'
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.post<HiringAddRequestDto>(url, newHiring, httpOptions));
  }

  async AddAsync(newFarmer: FarmerAdd): Promise<Farmer>{
    const url = this.config.getBaseUrl(this.END_POINT)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=UTF-8',
      })
    }
    return await lastValueFrom(this.http.post<Farmer>(url, newFarmer, httpOptions));
  }

  async removeHiringAsync(farmer: Farmer, client: Client): Promise<void> {
    const url = this.config.getBaseUrl(this.END_POINT) + `Hiring/${farmer.id}/${client.id}`;
    await lastValueFrom(this.http.delete(url));
  }

  async removeHiringByIdAsync(hiringId: number): Promise<void> {
    const url = this.config.getBaseUrl(this.END_POINT) + `Hiring/${hiringId}`;
    await lastValueFrom(this.http.delete(url));
  }

  async getHiringsByClientIdAsync(clientId: number): Promise<HiringAddRequestDto[]> {
    const url = this.config.getBaseUrl(this.END_POINT) + `Hiring/ByClient/${clientId}`;
    return await lastValueFrom(this.http.get<HiringAddRequestDto[]>(url));
  }
}
