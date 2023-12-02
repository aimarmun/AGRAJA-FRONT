import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/constants';
import { Crate, CrateSaleRequest, CrateUpdate } from 'src/app/interfaces/crate.interface';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { CratesService } from 'src/app/services/crates.service';

@Component({
  selector: 'app-crate-details',
  templateUrl: './crate-details.component.html',
  styleUrls: ['./crate-details.component.css']
})
export class CrateDetailsComponent {
  public crateId: number;
  public errorNotFound: boolean;
  public errorMsgLoadingCrate: string;
  public form: FormGroup;
  public const: Constants;
  public crate: Crate;
  public loadingCrateData: boolean;
  public errorUpdatingMsg: string | null;
  public sales: CrateSaleRequest[];
  public isLoadingSales: boolean;
  public buttonsEnabled: boolean;
  public errorMsgLoadingSales: string | null;
  public showUpdateOk: boolean;
  public updatingCrate: boolean;
  public disabledControls: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private breadCrumService: BreadcrumbService,
    private cratesService: CratesService,
    private location: Location){
      this.crateId = 0;
      this.errorNotFound = false;
      this.errorMsgLoadingCrate = '';
      this.const = new Constants();
      this.loadingCrateData = true;
      this.errorUpdatingMsg = null;
      this.isLoadingSales = true;
      this.sales = [];
      this.buttonsEnabled = true;
      this.errorMsgLoadingSales = null;
      this.showUpdateOk = false;
      this.updatingCrate = false;
      this.disabledControls = true;

      this.crate = {
        id: 0,
        isActive: true,
        name: '',
        description: '',
        kilograms: 0,
        stock: 0,
        price: 0
      };

      this.form = new FormGroup({
        name: new FormControl('', [
          Validators.minLength(this.const.Crate.MIN_LENGTH_NAME),
          Validators.maxLength(this.const.Crate.MAX_LENGTH_NAME),
          Validators.required
        ]),
        description: new FormControl('', 
          [Validators.maxLength(this.const.Crate.MAX_LENGTH_DESCRIPTION)]),
        kilograms: new FormControl(1, [Validators.min(0.1)]),
        price: new FormControl(1, [Validators.min(0.01)]),
        stock: new FormControl(1, []),
        isActive: new FormControl(true, [])
      }, [(f => this.sameDataValidator(f, this.crate))]);
  }

  back(): void {
    this.location.back();
  }

  async ngOnInit(): Promise<void> {
    this.breadCrumService.setActiveRoute(this.activatedRoute, true);

    this.activatedRoute.params.subscribe(async (params: any) => {
      console.log('Farmer id:', params.id);
      this.crateId = Number(params.id);
      if (this.crateId === 0 || Number.isNaN(this.crateId)) {
        this.errorNotFound = true;
        this.errorMsgLoadingCrate = ` "${params.id}" no es valor válido para un identificador de caja`;
        return;
      }
    })
    this.setInputsDisabled(true);
    await this.loadData();  
  }

  async loadData(): Promise<void> {
    await this.loadCrateData();
    await this.loadSalesData();
  }

  async loadCrateData(): Promise<void> {
    try{
      this.loadingCrateData = true;
      this.crate = await this.cratesService.getByIdAsync(this.crateId);
      this.setFormValues();
    }catch(error){
      if (error instanceof HttpErrorResponse) {
        this.errorNotFound = true;

        if (error.error instanceof Object)
          this.errorMsgLoadingCrate = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsgLoadingCrate = error.error;
      } else {
        this.errorMsgLoadingCrate = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.loadingCrateData = false;
    }
  }

  async loadSalesData(): Promise<void> {
    try{
      this.sales = [...await this.cratesService.getAllSalesByCrateId(this.crateId)];
      console.log('ventas caja:', this.sales);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
       // console.log('status error', error.status)
        if (error.error instanceof Object)
          this.errorMsgLoadingSales = 'Ups! hubo un error: ' + error.message;
        else if(error.status !== 404)
          this.errorMsgLoadingSales = error.error;
      } else {
        this.errorMsgLoadingSales = 'Ups! hubo un error desconocido';
      }
    }
    this.isLoadingSales = false;
  }

  getSalesTotalAmount(): number{
    return this.sales.reduce((acumulator, current) => acumulator + current.amount, 0)
  }

  getSalesTotalPrice(): number{
    return this.sales.reduce((acumulator, current) => acumulator + current.totalPrice, 0)
  }

  sameDataValidator(form: AbstractControl, crate: Crate): any {
    if (!crate) return null;

    const isNotMofied: Boolean = Object.keys(crate)
      .some(key => form.get(key) && form.get(key)?.value != crate?.[key]);

    return isNotMofied ? null : { 'samedatavalidator': 'Los datos son los mismos' };
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

  private setFormValues(): void {
    this.form.reset();
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => controls[key].setValue(this.crate?.[key]));
  }

  closeError(): void {
    this.errorUpdatingMsg = null;
  }

  async onSubmit(): Promise<void> {
    this.updatingCrate = true;
    this.errorUpdatingMsg = null;
    const updateData: CrateUpdate = { name: '', isActive: true, description: '', stock: 0 };

    Object.keys(this.form.controls).forEach(key => {
      updateData[key] = this.form?.controls?.[key]?.value;
    });

    this.setInputsDisabled(true);

    try {
      this.crate = await this.cratesService.updateAsync(this.crateId, updateData);
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
        this.errorMsgLoadingCrate = 'Ups! hubo un error desconocido: ' + error
      }
      this.setInputsDisabled(false);
    } finally {
      this.updatingCrate = false;
    }
  }
}
