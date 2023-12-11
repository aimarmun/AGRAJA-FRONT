import { Component, Input } from '@angular/core';
import { City } from 'src/app/interfaces/city.interface';
import { CropType } from 'src/app/interfaces/crop-type.interface';
import { Farmer } from 'src/app/interfaces/farmer.interface';
import { FarmersService } from 'src/app/services/farmers.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-card-farmer',
  templateUrl: './card-farmer.component.html',
  styleUrls: ['./card-farmer.component.css']
})
export class CardFarmerComponent {
  @Input() farmer!: Farmer;
  @Input() cities!: City[];
  @Input() cropTypes!: CropType[];
  public imgLoaded: boolean;
  public imgSrc: string;
  public imgAlt: string;
  public cropTypeName: string;
  public cityName: string;
  public badgeText: string | null;

  constructor(private farmerService: FarmersService,
    private imageService: ImageService) {
    this.imgSrc = imageService.DUMMY_IMAGE;
    this.cropTypeName = "";
    this.cityName = "";
    this.imgAlt = "";
    this.imgLoaded = false;
    this.badgeText = null;
  }
  
  async ngOnInit(): Promise<void> {
    await Promise.all([this.readHirings(), this.readCropType()])
  /*   await this.readHirings();
    await this.readCropType(); */    

  }

  private async readCropType() {
    if (this.farmer && this.cropTypes && this.cities) {
      const crop = this.cropTypes.find(c => c.id === this.farmer.cropTypeId);
      // console.log('Car all crops', this.cropTypes);
      // console.log('Card crop', crop);
      this.cropTypeName = crop?.name || "😟 desconocido";
      if (crop)
        await this.setCropTypeImageSrc();

      this.cityName = this.cities.find(c => c.id === this.farmer.cityId)?.name || "😟 ciudad no conocida";
    }
  }

  imgCardLoaded(): void {
    this.imgLoaded = true;
  }

  async onNewHiring(): Promise<void> {
    console.log('Nueva contratación realizada');
    await this.readHirings();
  }

  async readHirings(): Promise<void>{
    try{
      var hirinngs = await this.farmerService.getFarmerHiringsByIdAsync(this.farmer.id)
      if(hirinngs && hirinngs.length > 0)
      {
        if(hirinngs.length > 99){
          this.badgeText = '99' + (this.farmer.isActive ? '+' : '!+');
        }else{
          this.badgeText = String(hirinngs.length) + (this.farmer.isActive ? '' : '!');
        }
      }else{
        this.badgeText = null;
      }
    }catch (error){
      console.error('Error al leer contrataciones', error)
    }
  }

  async setCropTypeImageSrc(): Promise<void> {
    let imgSrc = "";
    let imgAlt = "cultivo desconocido"
    if (this.cropTypes) {
      const crop = this.cropTypes.find(c => c.id === this.farmer.cropTypeId);
      const imgUrl = 'assets/images/agro/' + crop?.name.toLowerCase() + '.jpg'
        || imgSrc;
      this.imgAlt = crop?.name || imgAlt;
      //console.log(this.imgSrc)
      this.imgSrc = await this.imageService.getImage(imgUrl);
      return;
    }
    this.imgSrc = imgSrc;
    this.imgAlt = imgAlt;
    //console.log('image src', this.imgSrc)
  }
}
