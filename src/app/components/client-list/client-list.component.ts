import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { Client } from 'src/app/interfaces/client.interface';
import { AuthService } from 'src/app/services/auth.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ClientsService } from 'src/app/services/clients.service';
import { SettingKey, UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent {
  public clients: Client[];
  public errorMsg: string | null;
  public isLoadingClients: boolean;
  public showButtonAnim: boolean;
  public placeHoldersItems: any[];
  public form: FormGroup;
  public loadingCounter: number;
  public currentUrl: string;
  public showHidden: boolean;
  public dniOrNameFilter: string;
  public isAdmin: boolean;

  constructor(private breadcrumbService: BreadcrumbService,
    private activeRoute: ActivatedRoute,
    private clientsService: ClientsService,
    private routing: Router,
    private location: Location,
    private userSettings: UserSettingsService,
    private authService: AuthService){
    this.clients = []
    this.errorMsg = null;
    this.isLoadingClients = true;
    this.showButtonAnim = false;
    this.showHidden = userSettings.getUserSetting<boolean>(SettingKey.SHOW_HIDDEN_CLIENTS);
    this.dniOrNameFilter = userSettings.getUserSetting<string>(SettingKey.CLIENTS_FILTER);
    this.placeHoldersItems = new Array(3).fill(null);
    this.form = new FormGroup(
      { 
        dniOrName: new FormControl(this.dniOrNameFilter, []),
        isActive: new FormControl(this.showHidden, [])
      }
    );
    this.loadingCounter = 0;
    this.currentUrl = '';
    this.isAdmin = false;
  }

  async ngOnInit(): Promise <void> {
    this.currentUrl = this.routing.url;
    this.breadcrumbService.setActiveRoute(this.activeRoute); 
    
    if(this.dniOrNameFilter === '')  
      await this.loadClientsAsync();  
    else
      await this.loadClientsByDniOrName();
    
    this.isAdmin = this.authService.isAdmin();
  }

  async onShowHiddenChange(): Promise<void> {
    this.showHidden = this.form.get('isActive')?.value === true || false;
    this.userSettings.setUserSetting(SettingKey.SHOW_HIDDEN_CLIENTS, this.showHidden);
   //  console.log('buscar', this.dniOrNameFilter)
    if(this.dniOrNameFilter !== null && this.dniOrNameFilter !== '')
      await this.loadClientsByDniOrName();
    else
      await this.loadClientsAsync();
  }

  back(): void {
    this.location.back();
  }

  private async loadClientsAsync(): Promise<void> {
    this.isLoadingClients = true;
    this.errorMsg = null;
    try {
      const clients = await this.clientsService.getAllAsync();
      if(this.showHidden)
        this.clients = [...clients];
      else 
        this.clients = [...clients.filter(c => c.isActive)];
    } catch(error) {
      this.catchError(error);
    } finally {
      this.isLoadingClients = false;
    }
  }

  private catchError(error: any): void{
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof Object)
        this.errorMsg = 'Ups! hubo un error: ' + error.message;
      else if(error.status !== 404)
        this.errorMsg = error.error;
    } else {
      this.errorMsg = 'Ups! hubo un error desconocido';
    }
  }

  goAddClient(){
    this.routing.navigate(['/home/clientes/nuevo']);
  }

  async onKeyDown(): Promise<void> {
    const filter =  this.form.get('dniOrName')?.value;
    if(filter === this.dniOrNameFilter) return;
    
    this.dniOrNameFilter = filter;
    this.userSettings.setUserSetting(SettingKey.CLIENTS_FILTER, this.dniOrNameFilter);
    
    this.loadingCounter++;
    this.errorMsg = null;
    //console.log('buscar ', this.loadingCounter, this.dniOrNameFilter)
    if (this.dniOrNameFilter === '') {
      await this.loadClientsAsync();
    }else{
      await this.loadClientsByDniOrName();
    }

    this.loadingCounter--;
  }

  private async loadClientsByDniOrName() {
    if(this.dniOrNameFilter === null) return;
    this.isLoadingClients = true;
    try {
      const clients = await this.clientsService.getByPartialDniOrNameAsync(this.dniOrNameFilter, false);
      if (this.showHidden) {
        this.clients = [...clients];
      } else {
        this.clients = [...clients.filter(c => c.isActive)];
      }
    } catch (error) {
      this.catchError(error);
    } finally {
      this.isLoadingClients = false;
    }
  }
}
