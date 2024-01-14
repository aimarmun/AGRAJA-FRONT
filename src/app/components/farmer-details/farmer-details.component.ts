import { DatePipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/constants';
import { City } from 'src/app/interfaces/city.interface';
import { Client, ClientFarmerHirings } from 'src/app/interfaces/client.interface';
import { CropType } from 'src/app/interfaces/crop-type.interface';
import { Farmer, FarmerUpdate } from 'src/app/interfaces/farmer.interface';
import { AuthService } from 'src/app/services/auth.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { CitiesService } from 'src/app/services/cities.service';
import { ClientsService } from 'src/app/services/clients.service';
import { CropTypesService } from 'src/app/services/crop-types.service';
import { FarmersService } from 'src/app/services/farmers.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-farmer-details',
  templateUrl: './farmer-details.component.html',
  styleUrls: ['./farmer-details.component.css']
})
export class FarmerDetailsComponent {
  public city: string;
  public cropTypeName: string;
  public loadingFamerData: boolean;
  public farmerId: number;
  public farmer!: Farmer;
  public errorNotFound: boolean;
  public errorMsgLoadingFarmer: string;
  public errorMsgLoadingClients: string | null;
  public cities!: City[];
  public cropTypes!: CropType[];
  public disabledControls: boolean;
  public form!: FormGroup;
  public const: Constants;
  public updatingFarmer: boolean;
  public errorUpdatingMsg: string | null;
  public showUpdateOk: boolean;
  public clients: ClientFarmerHirings[];
  public isLoadingClients: boolean;
  public confirmToRemoveClientId: number;
  public buttonsEnabled: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private farmerService: FarmersService,
    private cityService: CitiesService,
    private cropTypeService: CropTypesService,
    private breadCrumService: BreadcrumbService,
    private clientsService: ClientsService,
    private location: Location,
    private authService: AuthService) {
    this.showUpdateOk = false;
    this.errorUpdatingMsg = null;
    this.farmerId = 0;
    this.city = "";
    this.cropTypeName = "";
    this.loadingFamerData = true;
    this.errorNotFound = false;
    this.errorMsgLoadingFarmer = "";
    this.disabledControls = true;
    this.updatingFarmer = false;
    this.const = new Constants();
    this.clients = [];
    this.isLoadingClients = true;
    this.errorMsgLoadingClients = null;
    this.confirmToRemoveClientId = 0;
    this.buttonsEnabled = true;

    this.form = new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.maxLength(this.const.PersonData.MAX_LENGTH_NAME),
        Validators.required
      ])),
      surnames: new FormControl('', Validators.compose([
        Validators.maxLength(this.const.PersonData.MAX_LENGTH_SURNAMES)
      ])),
      dni: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(this.const.PersonData.MAX_LENGHT_DNI),
        Utils.dniValidator])),
      telephone: new FormControl('', Validators.compose([
        Validators.maxLength(this.const.PersonData.MAX_LENGHT_TELEPHONE),
        Utils.telephoneValidator])),
      email: new FormControl('', Validators.compose([
        Validators.maxLength(this.const.PersonData.MAX_LENGHT_EMAIL),
        Validators.email
      ])),
      address: new FormControl('', Validators.compose([
        Validators.maxLength(this.const.PersonData.MAX_LENGTH_ADDRESS)
      ])),
      isActive: new FormControl(false, [])
    }, [((f) => this.sameDataValidator(f, this.farmer))]);
  }

  ngOnInit(): void {
    this.breadCrumService.setActiveRoute(this.activatedRoute, true);

    this.activatedRoute.params.subscribe(async (params: any) => {
      // console.log('Farmer id:', params.id);
      this.farmerId = Number(params.id);
      if (this.farmerId === 0 || Number.isNaN(this.farmerId)) {
        this.errorNotFound = true;
        this.errorMsgLoadingFarmer = ` "${params.id}" no es valor válido para un identificador de agricultor`;
        return;
      }
      this.setInputsDisabled(true);
      await this.loadData();
    })
  }

  back(){
    this.location.back();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleConfirmToRemoveClient(client: Client): void {
    if (this.confirmToRemoveClientId === client.id) {
      this.confirmToRemoveClientId = 0;
    } else {
      this.confirmToRemoveClientId = client.id;
    }
  }

  async removeClient(client: ClientFarmerHirings): Promise<void> {
    this.buttonsEnabled = false;
    try {
      //todo elminar hiring por su Id no por su cliente o farmer
      await this.farmerService.removeHiringByIdAsync(client.hiringId);
      //await this.farmerService.removeHiringAsync(this.farmer, client);
      await this.loadAsociatedClients();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object)
          this.errorMsgLoadingClients = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsgLoadingClients = error.error;
      } else {
        this.errorMsgLoadingClients = 'Ups! hubo un error desconocido';
      }
    }finally{
      this.buttonsEnabled = true;
    }
  }


  private async loadData(): Promise<void> {
    await this.loadFarmerInfo();
    await this.loadAsociatedClients();
  }

  async loadFarmerInfo(): Promise<void> {
    try {
      [this.farmer, this.cities, this.cropTypes] = await Promise.all(
        [
          this.farmerService.getByIdAsync(this.farmerId),
          this.cityService.getAllAsync(),
          this.cropTypeService.getAllAsync()
        ]
      );

      this.city = this.cities.find(c => c.id === this.farmer.cityId)?.name || "desconocida";
      this.cropTypeName = this.cropTypes.find(c => c.id === this.farmer.cropTypeId)?.name || "desconocido";
      this.errorNotFound = false;
      this.setFormValues();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.errorNotFound = true;

        if (error.error instanceof Object)
          this.errorMsgLoadingFarmer = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsgLoadingFarmer = error.error;
      } else {
        this.errorMsgLoadingFarmer = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.loadingFamerData = false;
    }
  }

  async loadAsociatedClients(): Promise<void> {
    this.isLoadingClients = true;
    this.errorMsgLoadingClients = null;
    try {
      this.clients = await this.clientsService.getClientsByFarmerHirings(this.farmerId);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object)
          this.errorMsgLoadingClients = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsgLoadingClients = error.error;
      } else {
        this.errorMsgLoadingClients = 'Ups! hubo un error desconocido';
      }
    }
    this.isLoadingClients = false;
  }

  private setFormValues(): void {
    this.form.reset();
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => controls[key].setValue(this.farmer?.[key]));
  }

  sameDataValidator(form: AbstractControl, farmer: Farmer): any {
    if (!farmer) return null;

    const isNotMofied: Boolean = Object.keys(farmer)
      .some(key => form.get(key) && form.get(key)?.value != farmer?.[key]);

    return isNotMofied ? null : { 'samedatavalidator': 'Los datos son los mismos' };
  }

  checkError(control: string, error: string) {
    if (this.form.get(control)?.hasError(error) && this.form.get(control)?.touched) {
      return true
    } else {
      return false
    }
  }

  toggleEditMode(): void {
    this.setInputsDisabled(!this.disabledControls);
    if (this.disabledControls)
      this.setFormValues();
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

  async onSubmit(): Promise<void> {
    this.updatingFarmer = true;
    this.errorUpdatingMsg = null;
    const updateData: FarmerUpdate = { 
      name: '', 
      isActive: true, 
      surnames: '', 
      address: '', 
      dni: '', 
      email: '', 
      telephone: '' 
    };

    Object.keys(this.form.controls).forEach(key => {
      updateData[key] = this.form?.controls?.[key]?.value;
    });

    this.setInputsDisabled(true);

    try {
      this.farmer = await this.farmerService.updateAsync(this.farmerId, updateData);
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
        this.errorMsgLoadingFarmer = 'Ups! hubo un error desconocido: ' + error
      }
      this.setInputsDisabled(false);
    } finally {
      this.updatingFarmer = false;
    }
  }

  closeError(): void {
    this.errorUpdatingMsg = null;
  }
}
