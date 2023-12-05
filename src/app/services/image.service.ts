/*
  * Servició para cachear imágenes.
  ! En pruebas, sin terminar
  Pensado para cachear imágenes que ocupen poco, ya que cachean en memoria.
  No utilizar en aplicaciones que se utilice un gran número de imágenes diferentes.
  O utilizar este servicio solo para las imágenes comunes de la aplicación.
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, tap, Observable, firstValueFrom, Subscription, Subject, takeUntil } from 'rxjs';

interface CachedImage {
  urlImg: string;
  blob: Blob | null;
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
      console.log('la imagen está en la caché', urlImg)
      const image = this._cachedImages[index];
      
      await this.waitForCacheEnds(image);

      return URL.createObjectURL(image.blob!);
    }

    //console.log('imagen no cacheada', urlImg)
    const observable = this.http.get(urlImg, { responseType: 'blob'});
    
    observable.pipe(
      tap(blob => {
        this.checkAndCaheImage(urlImg, blob);
      })
      ).subscribe();
    this.newImageCached(urlImg);
    return URL.createObjectURL(await lastValueFrom(observable));
  }

  private async waitForCacheEnds(image: CachedImage) {
    while (image.blob === null) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private newImageCached(urlImg: string) {
    const imgCached: CachedImage = { urlImg, blob: null };
    this._cachedImages.push(imgCached);
  }

  private checkAndCaheImage(urlImg: string, blob: Blob): void {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    if (index > -1) {
      const img = this._cachedImages[index];
      img.blob = blob;
    }
  }
}
