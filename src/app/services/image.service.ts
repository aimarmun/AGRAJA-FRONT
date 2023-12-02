/*
  * Servició para cachear imágenes.
  ! En pruebas, sin terminar
  Pensado para cachear imágenes que ocupen poco, ya que cachean en memoria.
  No utilizar en aplicaciones que se utilice un gran número de imágenes diferentes.
  O utilizar este servicio solo para las imágenes comunes de la aplicación.
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, tap, Subject } from 'rxjs';

interface CachedImage {
  urlImg: string;
  blob?: Blob | undefined;
  cachedObserver$: Subject<CachedImage[]>;
}

@Injectable({
  providedIn: 'root'
})

export class ImageService {
  private _cachedImages: CachedImage[] ;

  constructor(private http: HttpClient) { 
    this._cachedImages = [];
  }

  async getImage(urlImg: string): Promise<string> {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    if (index > -1) {
      console.log('la imagen está en la caché', urlImg)
      const image = this._cachedImages[index];

      const observable = image.cachedObserver$.asObservable();
      observable.pipe(tap(blob => console.log('imagen cargada', blob))).subscribe();
      
      console.log('Esperando a la suscripción')
      await lastValueFrom(observable)
      console.log('Suscripción lanzada**');
      
      return URL.createObjectURL(image.blob!);
    }

    console.log('imagen no cacheada', urlImg)
    const observable = this.http.get(urlImg, { responseType: 'blob'});
    this.newImageCached(urlImg);

    observable.pipe(
      tap(blob => {
        console.log('cacheando imagen', urlImg);
        this.checkAndCaheImage(urlImg, blob);
      })
      ).subscribe();
    

    return URL.createObjectURL(await lastValueFrom(observable));
  }
    
  private newImageCached(urlImg: string) {
    const imgCached: CachedImage = { urlImg, cachedObserver$: new Subject<CachedImage[]> };
    this._cachedImages.push(imgCached);
  }

  private checkAndCaheImage(urlImg: string, blob: Blob): void {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    if (index > -1) {
    //  console.log('next del Subject')
      this._cachedImages[index].blob = blob;
      this._cachedImages[index].cachedObserver$.next(this._cachedImages);
    }
  }

}
