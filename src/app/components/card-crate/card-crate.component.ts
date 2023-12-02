import { Component, Input } from '@angular/core';
import { Crate, CrateSaleRequest } from 'src/app/interfaces/crate.interface';
import { PayOption } from 'src/app/interfaces/pay-option.interface';

@Component({
  selector: 'app-card-crate',
  templateUrl: './card-crate.component.html',
  styleUrls: ['./card-crate.component.css']
})
export class CardCrateComponent {
  @Input() crate!: Crate;
  @Input() payOptions: PayOption[];
  public imgLoaded: boolean;
  public imgSrc: string;
  public imgAlt: string;
  public unitsInCart: number;

  constructor(){
    this.imgSrc = "";
    this.imgAlt = "";
    this.payOptions = []
    this.imgLoaded = false;
    this.imgSrc = '/assets/images/caja/caja-general.jpg'
    this.imgAlt = 'Imagen de una agricultora sugentan una caja con productos'
    this.unitsInCart = 0;
  }

  addUnitToCart(): void{
    if(this.unitsInCart + 1 > this.crate?.stock) return;
    this.unitsInCart++;
  }
  
  restUnitToCart(): void{
    if(this.unitsInCart - 1 < 0) return;
    this.unitsInCart--;
  }

  imgCardLoaded(): void {
    this.imgLoaded = true;
  }

  onNewSale(crateSale: CrateSaleRequest): void {
    this.unitsInCart = 0;
    this.crate.stock -= crateSale.amount;
  }
}
