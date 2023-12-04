/*
  * Servició para cachear imágenes.
  ! En pruebas, sin terminar
  Pensado para cachear imágenes que ocupen poco, ya que cachean en memoria.
  No utilizar en aplicaciones que se utilice un gran número de imágenes diferentes.
  O utilizar este servicio solo para las imágenes comunes de la aplicación.
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, tap, Observable, firstValueFrom } from 'rxjs';

interface CachedImage {
  urlImg: string;
  blob: Blob | null;
  observer: Observable<Blob>
}

@Injectable({
  providedIn: 'root'
})

export class ImageService {
  private _cachedImages: CachedImage[];

  constructor(private http: HttpClient) { 
    this._cachedImages = [];
  }

  async getImage(urlImg: string): Promise<string> {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    
    if (index > -1) {
     // console.log('la imagen está en la caché', urlImg)
      const image = this._cachedImages[index];
      
      if(image.blob){
       // console.log('cache de imangen completo', urlImg);
        return URL.createObjectURL(image.blob);
      }
      
      console.log('Esperando a la caché de la imange', urlImg);
     // const start = new Date();
      const blob = await firstValueFrom(image.observer)
    //  const end = new Date();
    //  console.log(urlImg, (new Date(end.getTime() - start.getTime()).getMilliseconds()));

      return URL.createObjectURL(blob);
    }

    //console.log('imagen no cacheada', urlImg)
    const observable = this.http.get(urlImg, { responseType: 'blob'});
    this.newImageCached(urlImg, observable);

    observable.pipe(
      tap(blob => {
       // console.log('cacheando imagen', urlImg);
        this.checkAndCaheImage(urlImg, blob);
      })
      ).subscribe();

    return URL.createObjectURL(await lastValueFrom(observable));
  }
    
  private newImageCached(urlImg: string, observable: Observable<Blob>) {
    const imgCached: CachedImage = { urlImg, blob: null, observer: observable };
    this._cachedImages.push(imgCached);
  }

  private checkAndCaheImage(urlImg: string, blob: Blob): void {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    if (index > -1) {
    //  console.log('Imagen cacheada', urlImg)
      this._cachedImages[index].blob = blob;
    }
  }

}
