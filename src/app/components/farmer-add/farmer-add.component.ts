import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component,} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/constants';
import { City } from 'src/app/interfaces/city.interface';
import { CropType } from 'src/app/interfaces/crop-type.interface';
import { Farmer, FarmerAdd } from 'src/app/interfaces/farmer.interface';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { CitiesService } from 'src/app/services/cities.service';
import { CropTypesService } from 'src/app/services/crop-types.service';
import { FarmersService } from 'src/app/services/farmers.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-farmer-add',
  templateUrl: './farmer-add.component.html',
  styleUrls: ['./farmer-add.component.css']
})
export class FarmerAddComponent {
  public city: string;
  public cropTypeName: string;
  public loading: boolean;
  public farmer!: FarmerAdd;
  public errorMsg!: string | null;
  public cities!: City[];
  public cropTypes!: CropType[];
  public disabledControls: boolean;
  public form!: FormGroup;
  public const: Constants;
  public updatingFarmer: boolean;
  public errorUpdatingMsg: string | null;
  public showUpdateOk: boolean;

  constructor(
    private farmerService: FarmersService,
    private cityService: CitiesService,
    private cropTypeService: CropTypesService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private location: Location){
      this.showUpdateOk = false;
      this.errorUpdatingMsg = null;
      this.city = "";
      this.cropTypeName = "";
      this.loading = true;
      this.disabledControls = true;
      this.updatingFarmer = false;
      this.const = new Constants();

      this.form = this.getFormGroupConfig();
  }

  private getFormGroupConfig(): FormGroup{
    return new FormGroup({
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
      cityId: new FormControl(0, [Validators.required, Validators.min(1)]),
      cropTypeId: new FormControl(0, [Validators.required, Validators.min(1)])
      
    }, []);
  }
  
  async ngOnInit(): Promise<void>{
    this.breadcrumbService.setActiveRoute(this.route);
    
    this.setInputsDisabled(true)
    this.errorMsg = null;
    try{
      [this.cities, this.cropTypes] = await Promise.all([
        this.cityService.getAllAsync(),
        this.cropTypeService.getAllAsync()
      ]);
    }catch(error){
      if(error instanceof HttpErrorResponse){
        
        if(error.error instanceof Object)
          this.errorMsg = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsg = error.error;     
      }else{
        this.errorMsg = 'Ups! hubo un error desconocido';
      }
    }finally{
      this.setInputsDisabled(false);
    }

  }

  back(){
    this.location.back();
  }

  private setFormValues(): void{
    this.form.reset();
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => controls[key].setValue(this.farmer?.[key]));
  }

  checkError(control: string, error: string) {
    if (this.form.get(control)?.hasError(error) && this.form.get(control)?.touched) {
      return true
    } else {
      return false
    }
  }

  setInputsDisabled(enable: boolean): void{
    this.disabledControls = enable;
    const controls = this.form.controls;
    if(this.disabledControls){
      Object.keys(controls).forEach(key => controls[key].disable());
    }else{
      this.showUpdateOk = false;
      Object.keys(controls).forEach(key => controls[key].enable());
    }
  }

  async onSubmit(): Promise<void> {
    this.setInputsDisabled(true);

    this.updatingFarmer = true;
    this.errorUpdatingMsg = null;
    this.farmer = {name: '', surnames: '', address: '', dni: '', email: '', telephone: '', cropTypeId: 0, cityId: 0};
    
    Object.keys(this.form.controls).forEach(key => {
      this.farmer[key] = this.form?.controls?.[key]?.value;
    });
    
    console.log('nuevo farmer', this.farmer);

    try{
      const newFarmer: Farmer = await this.farmerService.AddAsync(this.farmer);
      this.farmer = newFarmer;
      this.setFormValues();
      this.showUpdateOk = true;
    }catch(error){
      if(error instanceof HttpErrorResponse){
        if(error.error instanceof Object)
          this.errorUpdatingMsg = 'Ups! hubo un error: ' + error.message;
        else
          this.errorUpdatingMsg = error.error;
        console.dir(error);
      }else{
        this.errorMsg = 'Ups! hubo un error desconocido: ' + error
      }
      this.setInputsDisabled(false);
    }finally{
      this.updatingFarmer = false;
    }
  }

  closeError(): void{
    this.errorUpdatingMsg = null;
  }
  
  reset(){
    this.showUpdateOk = false;
    this.form.reset();
    this.form = this.getFormGroupConfig();
  }
}
