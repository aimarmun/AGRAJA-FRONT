import { Component } from '@angular/core';
import { City } from 'src/app/interfaces/city.interface';
import { CropType } from 'src/app/interfaces/crop-type.interface';
import { Farmer } from 'src/app/interfaces/farmer.interface';
import { FarmersService } from 'src/app/services/farmers.service';
import { CitiesService } from 'src/app/services/cities.service';
import { CropTypesService } from 'src/app/services/crop-types.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { SettingKey, UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-agro-list',
  templateUrl: './agro-list.component.html',
  styleUrls: ['./agro-list.component.css']
})


export class AgroListComponent {
  public lastError: string;
  public farmers: Farmer[];
  public cities: City[];
  public cropTypes: CropType[];
  public loading: boolean;
  public placeHoldersItems: any;
  public showButtonAnim: boolean;
  public form: FormGroup;
  public selectedCropType: number;
  public showHidden: boolean;

  constructor(
    private farmersService: FarmersService,
    private citiesService: CitiesService,
    private cropTypesService: CropTypesService,
    private route: ActivatedRoute,
    private breadCrumService: BreadcrumbService,
    private routing: Router,
    private userSettings: UserSettingsService) {
    this.showButtonAnim = false;
    this.lastError = "";
    this.farmers = [];
    this.cities = [];
    this.cropTypes = [];
    this.loading = true;
    this.placeHoldersItems = new Array(8).fill(null);
    this.showHidden = userSettings.getUserSetting<boolean>(SettingKey.SHOW_HIDDEN_FARMERS);
    this.selectedCropType = userSettings.getUserSetting<number>(SettingKey.CROP_TYPE_SELECTED);
    this.form = new FormGroup({
     cropType: new FormControl(this.selectedCropType, []),
     showHidden: new FormControl(this.showHidden, []) 
    })
  }

  goAddFarmer(){
    this.routing.navigate(['/home/agro/nuevo']);
  }

  async ngOnInit(): Promise<void> {
    this.breadCrumService.setActiveRoute(this.route);
    this.loading = true;
    await this.loadData();
  }

  async loadData(): Promise<void>{
    this.form.get('cropType')?.disable();
    try {
      [this.farmers, this.cities, this.cropTypes] = await Promise.all([
         this.farmersService.getByCropIdAsync(this.selectedCropType),
         this.citiesService.getAllAsync(),
         this.cropTypesService.getAllAsync()
       ]);

       if(!this.showHidden){
         this.farmers = [...this.farmers.filter(f => f.isActive)]; 
       }
       
     } catch (error: any) {
       if(error instanceof HttpErrorResponse){
         if(error.error instanceof Object)
           this.lastError = 'Ups! hubo un error: ' + error.message;
         else
           this.lastError = error.error;     
       }else{
         this.lastError = 'Ups! hubo un error desconocido';
       }
     } finally {
       this.loading = false;
       this.form.get('cropType')?.enable();
     }
  }

  async loadFarmers(){
    this.form.get('cropType')?.disable();
    this.loading = true;
    try{
      const farmers = await this.farmersService.getByCropIdAsync(this.selectedCropType);
      if(this.showHidden) {
        this.farmers = [...farmers];
      } else {
        this.farmers = [...farmers.filter(f => f.isActive)];
      }
    } catch (error: any) {
      if(error instanceof HttpErrorResponse){
        if(error.error instanceof Object)
          this.lastError = 'Ups! hubo un error: ' + error.message;
        else
          this.lastError = error.error;     
      }else{
        this.lastError = 'Ups! hubo un error desconocido';
      }
    } finally {
      this.loading = false;
      this.form.get('cropType')?.enable();
    }
  }

  async onSelect(){
    this.selectedCropType = this.form.get('cropType')?.value || 0;
    this.showHidden = this.form.get('showHidden')?.value === true || false;
    this.userSettings.setUserSetting(SettingKey.CROP_TYPE_SELECTED, this.selectedCropType);
    this.userSettings.setUserSetting(SettingKey.SHOW_HIDDEN_FARMERS, this.showHidden)
    await this.loadFarmers();
  }
}
