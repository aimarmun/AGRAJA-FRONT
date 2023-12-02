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
  selector: 'app-crate-add',
  templateUrl: './crate-add.component.html',
  styleUrls: ['./crate-add.component.css']
})
export class CrateAddComponent {
  public errorNotFound: boolean;
  public errorMsgLoadingCrate: string;
  public form: FormGroup;
  public cons: Constants;
  public crate: Crate;
  public loadingCrateData: boolean;
  public errorUpdatingMsg: string | null;
  public buttonsEnabled: boolean;
  public showAddOk: boolean;
  public addingCrate: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private breadCrumService: BreadcrumbService,
    private cratesService: CratesService,
    private location: Location) {
    this.errorNotFound = false;
    this.errorMsgLoadingCrate = '';
    this.cons = new Constants();
    this.loadingCrateData = true;
    this.errorUpdatingMsg = null;
    this.buttonsEnabled = true;
    this.showAddOk = false;
    this.addingCrate = false;

    this.crate = {
      id: 0,
      isActive: true,
      name: '',
      description: '',
      kilograms: 0,
      stock: 0,
      price: 0
    };

    this.form = this.getFormGroup();
  }

  getFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [
        Validators.minLength(this.cons.Crate.MIN_LENGTH_NAME),
        Validators.maxLength(this.cons.Crate.MAX_LENGTH_NAME),
        Validators.required
      ]),
      description: new FormControl('',
        [Validators.maxLength(this.cons.Crate.MAX_LENGTH_DESCRIPTION)]),
      kilograms: new FormControl(0, [Validators.min(0.1)]),
      price: new FormControl(0, [Validators.min(0.01)]),
      stock: new FormControl(0, [])
    }, []);
  }
  

  async ngOnInit(): Promise<void> {
    this.breadCrumService.setActiveRoute(this.activatedRoute, true);
  }

  sameDataValidator(form: AbstractControl, crate: Crate): any {
    if (!crate) return null;

    const isNotMofied: Boolean = Object.keys(crate)
      .some(key => form.get(key) && form.get(key)?.value != crate?.[key]);

    return isNotMofied ? null : { 'samedatavalidator': 'Los datos son los mismos' };
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
    this.addingCrate = true;
    this.errorUpdatingMsg = null;
    this.form.disable();
    const updateData: Crate = { name: '', isActive: true, description: '', stock: 0, price: 0, kilograms: 0, id: 0 };

    Object.keys(this.form.controls).forEach(key => {
      updateData[key] = this.form?.controls?.[key]?.value;
    });

    try {
      this.crate = await this.cratesService.addAsync(updateData);
      console.log(this.crate);
      this.setFormValues();
      this.showAddOk = true;
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
    } finally {
      this.addingCrate = false;
    }
  }
  reset(){
    this.form.reset();
    this.form = this.getFormGroup();
    this.showAddOk = false;
  }

  back(){
    this.location.back();
  }
}
