import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client, ClientFarmerHirings } from '../interfaces/client.interface';
import { Subject, Subscription, lastValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private readonly END_POINT: string;
  private unsubscribe$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(private config: ConfigService, 
    private http: HttpClient) {
      this.END_POINT = '/api/Client'
    }

     async getByPartialDniOrNameAsync(dni: string, onlyActive: boolean = true): Promise<Client[]>{
      this.cancelHttpPetitions();
      const url = this.config.getBaseUrl(this.END_POINT) + `/byPartialDniOrName/${dni}/${onlyActive}`;
      //console.log(url)
      const observable = this.http.get<Client[]>(url);
      const subscription =  observable.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe();

      this.subscriptions.push(subscription);
      return await lastValueFrom(observable); 
    }

    async getAllAsync(): Promise<Client[]> {
      this.cancelHttpPetitions();
      const url = this.config.getBaseUrl(this.END_POINT);
      const observable = this.http.get<Client[]>(url);
      const subscription =  observable.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe();
      this.subscriptions.push(subscription);
      return await lastValueFrom(observable); 
     // return await lastValueFrom(this.http.get<Client[]>(url));
    }
    
    cancelHttpPetitions(): void {
      this.subscriptions.forEach((subscription, index, array) => {
        subscription.unsubscribe();
        array.splice(index, 1);
      });
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }

    async getClientsByFarmerHirings(farmerId: number): Promise<ClientFarmerHirings[]>{
      const url = this.config.getBaseUrl(this.END_POINT) + `/byFarmerHiring/${farmerId}`;
      return await lastValueFrom(this.http.get<ClientFarmerHirings[]>(url));
    }

    

    async getByIdAsync(clientId: number): Promise<Client> {
      const url = this.config.getBaseUrl(this.END_POINT) + `/${clientId}`;
      return await lastValueFrom(this.http.get<Client>(url)); 
    }
    
    async updateAsync(clientId: number, client: Client): Promise<Client> {
      const url = this.config.getBaseUrl(this.END_POINT) + `/${clientId}`;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=UTF-8',
        })
      }
      return await lastValueFrom(this.http.put<Client>(url, client, httpOptions));
    }

    async addAsync(client: Client): Promise<Client> {
      const url = this.config.getBaseUrl(this.END_POINT);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=UTF-8',
        })
      }
      return await lastValueFrom(this.http.post<Client>(url, client, httpOptions));
    }
}
  


