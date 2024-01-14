import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/constants';
import { Client } from 'src/app/interfaces/client.interface';
import { CrateSaleRequest } from 'src/app/interfaces/crate.interface';
import { HiringAddRequestDto } from 'src/app/interfaces/farmer-hiring.interface';
import { AuthService } from 'src/app/services/auth.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ClientsService } from 'src/app/services/clients.service';
import { CratesService } from 'src/app/services/crates.service';
import { FarmersService } from 'src/app/services/farmers.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})

export class ClientDetailsComponent {
  public clientId: number;
  public errorNotFound: boolean;
  public errorMsgLoadingClient: string | null;
  public form: FormGroup;
  public cons: Constants;
  public client!: Client;
  public errorUpdatingMsg: string | null;
  public loadingClientData: boolean;
  public disabledControls: boolean;
  public showUpdateOk: boolean;
  public updatingClient: boolean;
  public buttonsEnabled: boolean;
  public errorMsgLoadSales: string | null;
  public errorMsgLoadHirings: string | null;
  public isLoadingSales: boolean;
  public isLoadingHirings: boolean;
  public sales: CrateSaleRequest[];
  public hirings: HiringAddRequestDto[] | null;
  public showSales: boolean;
  public showHirings: boolean;

  constructor(private activeRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private clientService: ClientsService,
    private crateService: CratesService,
    private farmersService: FarmersService,
    private location: Location,
    private authService: AuthService) {
    this.clientId = 0;
    this.errorNotFound = false;
    this.errorMsgLoadingClient = null;
    this.cons = new Constants();
    this.form = this.getFormGroupConfig();
    this.errorUpdatingMsg = null;
    this.loadingClientData = true;
    this.disabledControls = true;
    this.showUpdateOk = false;
    this.updatingClient = false;
    this.buttonsEnabled = true;
    this.errorMsgLoadSales = null;
    this.isLoadingSales = true;
    this.sales = [];
    this.showHirings = false;
    this.showSales = true;
    this.isLoadingHirings = true;
    this.hirings = null;
    this.errorMsgLoadHirings = null;
  }

  ngOnInit(): void {
    this.breadcrumbService.setActiveRoute(this.activeRoute, true);
    this.activeRoute.params.subscribe(async (params: any) => {
     // console.log('Farmer id:', params.id);
      this.clientId = Number(params.id);
      if (this.clientId === 0 || Number.isNaN(this.clientId)) {
        this.errorNotFound = true;
        this.errorMsgLoadingClient = ` "${params.id}" no es valor válido para un identificador de agricultor`;
        return;
      }
      this.setInputsDisabled(true);
      await this.loadData();
    })
  }

  async loadData(): Promise<void> {
    await this.loadClientData();
    await this.loadSalesData();
  }

  private async loadClientHiringsData() {
    if (this.hirings !== null) return;
    this.errorMsgLoadHirings = null;
    this.isLoadingHirings = true;
    try {
      this.hirings = await this.farmersService.getHiringsByClientIdAsync(this.clientId);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object) {
          this.errorMsgLoadHirings = 'Ups! hubo un error: ' + error.message;
        } else {
          this.errorMsgLoadHirings = error.error;
        }
      } else {
        this.errorMsgLoadHirings = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.isLoadingHirings = false;
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  private async loadClientData(): Promise<void> {
    this.loadingClientData = true;
    try {
      this.client = await this.clientService.getByIdAsync(this.clientId);
      this.errorNotFound = false;
      this.setFormValues();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {

        if (error.error instanceof Object) {
          this.errorMsgLoadingClient = 'Ups! hubo un error: ' + error.message;
        }
        else {
          this.errorNotFound = error.status === 404;
          this.errorMsgLoadingClient = error.error;
        }
      } else {
        this.errorMsgLoadingClient = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.loadingClientData = false;
    }
  }

  async loadSalesData(): Promise<void> {
    this.isLoadingSales = true;
    try {
      this.sales = [...await this.crateService.getAllSalesByClientId(this.clientId)];
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object) {
          this.errorMsgLoadSales = 'Ups! hubo un error: ' + error.message;
        } else {
          this.errorMsgLoadSales = error.error;
        }
      } else {
        this.errorMsgLoadSales = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.isLoadingSales = false;
    }
  }

  async toggleTable(): Promise<void> {
    this.showSales = !this.showSales;
    this.showHirings = !this.showHirings;
    await this.loadClientHiringsData();
  }

  async onSubmit(): Promise<void> {
    this.updatingClient = true;
    this.errorUpdatingMsg = null;
    const updateData: Client = { 
      name: '', 
      isActive: true, 
      description: '', 
      address: '', 
      dni: '', 
      email: '', 
      surnames: '', 
      id: 0, 
      telephone: '' 
    };

    Object.keys(this.form.controls).forEach(key => {
      updateData[key] = this.form?.controls?.[key]?.value;
    });

    this.setInputsDisabled(true);

    try {
      this.client = await this.clientService.updateAsync(this.clientId, updateData);
      this.setFormValues();
      this.showUpdateOk = true;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object)
          this.errorUpdatingMsg = 'Ups! hubo un error: ' + error.message;
        else
          this.errorUpdatingMsg = error.error;
        console.dir(error);
      } else {
        this.errorMsgLoadingClient = 'Ups! hubo un error desconocido: ' + error
      }
      this.setInputsDisabled(false);
    } finally {
      this.updatingClient = false;
    }
  }

  checkError(control: string, error: string) {
    if (this.form.get(control)?.hasError(error) && this.form.get(control)?.touched) {
      return true
    } else {
      return false
    }
  }

  private getFormGroupConfig(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_NAME),
        Validators.required
      ])),
      surnames: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_SURNAMES)
      ])),
      dni: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_DNI),
        Utils.dniValidator])),
      telephone: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_TELEPHONE),
        Utils.telephoneValidator])),
      email: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_EMAIL),
        Validators.email
      ])),
      address: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_ADDRESS)
      ])),
      isActive: new FormControl(true, [])
    }, [(e) => this.sameDataValidator(e, this.client)]);
  }

  sameDataValidator(form: AbstractControl, client: Client): any {
    if (!client) return null;

    const isNotMofied: Boolean = Object.keys(client)
      .some(key => form.get(key) && form.get(key)?.value != client?.[key]);

    return isNotMofied ? null : { 'samedatavalidator': 'Los datos son los mismos' };
  }

  closeError(): void {
    this.errorUpdatingMsg = null;
  }

  toggleEditMode(): void {
    this.setInputsDisabled(!this.disabledControls);
    if (this.disabledControls)
      this.setFormValues();
  }

  private setFormValues(): void {
    this.form.reset();
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => controls[key].setValue(this.client?.[key]));
  }

  getSalesTotalPrice(): number{
    return this.sales.reduce((acumulator, current) => acumulator + current.totalPrice, 0)
  }

  setInputsDisabled(enable: boolean): void {
    this.disabledControls = enable;
    const controls = this.form.controls;
    if (this.disabledControls) {
      Object.keys(controls).forEach(key => controls[key].disable());
    } else {
      this.showUpdateOk = false;
      Object.keys(controls).forEach(key => controls[key].enable());
    }
  }
  
  back(){
    this.location.back();
  }
}
