import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Crate } from 'src/app/interfaces/crate.interface';
import { PayOption } from 'src/app/interfaces/pay-option.interface';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { CratesService } from 'src/app/services/crates.service';
import { PayOptionsService } from 'src/app/services/pay-options.service';
import { SettingKey, UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-caja-list',
  templateUrl: './caja-list.component.html',
  styleUrls: ['./caja-list.component.css']
})
export class CajaListComponent {
  public loading: boolean;
  public placeHoldersItems: any;
  public crates: Crate[];
  public lastError: string | null;
  public showButtonAnim: boolean;
  public form: FormGroup;
  public priceOrder: number;
  public showHidden: boolean;
  public payOptions: PayOption[];

  constructor(private breadCrumService: BreadcrumbService,
    private route: ActivatedRoute,
    private routing: Router,
    private cratesService: CratesService,
    private userSettings: UserSettingsService,
    private payOptionsService: PayOptionsService){
      this.loading = true;
      this.placeHoldersItems = new Array(8).fill(null);
      this.crates = [];
      this.payOptions = [];
      this.lastError = null;
      this.showButtonAnim = false;
      this.priceOrder = userSettings.getUserSetting(SettingKey.CRATE_PRICE_ORDER);
      this.showHidden = userSettings.getUserSetting(SettingKey.SHOW_HIDDEN_CRATES);
      this.form = new FormGroup({
        priceOrder: new FormControl(this.priceOrder, []),
        showHidden: new FormControl(this.showHidden, []) 
       })
    }

  async ngOnInit(): Promise<void> {
    this.breadCrumService.setActiveRoute(this.route);
    this.payOptions = await this.payOptionsService.getAll();
    await this.orderByPrice();
  }

  onSelect(): void {
    this.priceOrder = this.form.get('priceOrder')?.value || 0;
    this.userSettings.setUserSetting(SettingKey.CRATE_PRICE_ORDER, this.priceOrder);
    this.orderByPrice();
  }

  private async orderByPrice(): Promise<void> {
    this.loading = true;
    try {
      let crates = await this.cratesService.getAllAsync();
      
      if(!this.showHidden){
        crates = [...crates.filter(c => c.isActive)];
      }
      const ORDER_MAX_TO_MIN = 0;
      if (this.priceOrder == ORDER_MAX_TO_MIN) {
        this.crates = [...crates.sort((a, b) => b.price - a.price)];
      } else {
        this.crates = [...crates.sort((a, b) => a.price - b.price)];
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
    }
    
  }

  onShowHidden(): void{
    this.showHidden = this.form.get('showHidden')?.value === true || false;
    this.userSettings.setUserSetting(SettingKey.SHOW_HIDDEN_CRATES, this.showHidden);
    this.orderByPrice();
  }

  goAddCrate(): void {
    this.routing.navigate(['/home/caja/nueva']);
  }
}
