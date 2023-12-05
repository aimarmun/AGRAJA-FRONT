import { Component, Input } from '@angular/core';
import { Crate, CrateSaleRequest } from 'src/app/interfaces/crate.interface';
import { PayOption } from 'src/app/interfaces/pay-option.interface';
import { ImageService } from 'src/app/services/image.service';

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
  private readonly IMG_SRC = '/assets/images/caja/caja-general.jpg';

  constructor(private imgService: ImageService){
    this.imgSrc = "";
    this.imgAlt = "";
    this.payOptions = []
    this.imgLoaded = false;
    this.imgSrc = this.IMG_SRC;
    this.imgAlt = 'Imagen de una agricultora sugentan una caja con productos'
    this.unitsInCart = 0;
  }

  async ngOnInit(): Promise<void> {
    this.imgSrc = await this.imgService.getImage(this.IMG_SRC);
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
