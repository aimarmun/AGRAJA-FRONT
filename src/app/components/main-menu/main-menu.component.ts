import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  private readonly AGRO_IMG_SRC = "../../../assets/images/agraja_agro.jpg";
  private readonly CAJA_IMG_SRC = "../../../assets/images/agraja_caja.jpg";
  
  public agroImgSrc: string;
  public cajaImgSrc: string;

  constructor(private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private imageService: ImageService){
      this.agroImgSrc = imageService.DUMMY_IMAGE;
      this.cajaImgSrc = imageService.DUMMY_IMAGE;
    }

  async ngOnInit(): Promise<void>{
    this.breadcrumbService.setActiveRoute(this.route);
    // * Cacheando imágenes
    [this.cajaImgSrc, this. agroImgSrc] = await Promise.all(
      [
        this.imageService.getImage(this.CAJA_IMG_SRC), 
        this.imageService.getImage(this.AGRO_IMG_SRC)
      ]
    );
  }
}
