/*
  * Servició para cachear imágenes.
  ! En pruebas, sin terminar
  Pensado para cachear imágenes que ocupen poco, ya que cachean en memoria.
  No utilizar en aplicaciones que se utilice un gran número de imágenes diferentes.
  O utilizar este servicio solo para las imágenes comunes de la aplicación.
*/
// * VERSION 1
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

interface CachedImage {
  urlImg: string;
  blob: Blob | null;
  waitForCached?: Promise<void>;
}

@Injectable({
  providedIn: 'root'
})

export class ImageService {
  private _cachedImages: CachedImage[];
  public readonly DUMMY_IMAGE: string;

  constructor(private http: HttpClient) { 
    this._cachedImages = [];
    this.DUMMY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY1i+exYABAkB/UBPW00AAAAASUVORK5CYII=';
  }

  async getImage(urlImg: string): Promise<string> {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    
    if (index > -1) {
      //console.log('la imagen está en la caché', urlImg)
      const image = this._cachedImages[index];
      
      await image.waitForCached!;

      return URL.createObjectURL(image.blob!);
    }

    //console.log('imagen no cacheada', urlImg)
    const observable = this.http.get(urlImg, { responseType: 'blob'});
    
    observable.pipe(
      tap(blob => {
        this.checkAndCaheImage(urlImg, blob);
      })
      ).subscribe();
    const imgCached = this.newImageCached(urlImg);
    await imgCached.waitForCached!;
    return URL.createObjectURL(imgCached.blob!);
  }
   
  private newImageCached(urlImg: string): CachedImage {
    const imgCached: CachedImage = { urlImg, blob: null };
    imgCached.waitForCached = this.waitForImageCacheEnds(imgCached);
    this._cachedImages.push(imgCached);
    return imgCached;
  }

  private checkAndCaheImage(urlImg: string, blob: Blob): void {
    const index = this._cachedImages.findIndex(image => image.urlImg === urlImg);
    if (index > -1) {
      const img = this._cachedImages[index];
      img.blob = blob;
    }
  }

  private async waitForImageCacheEnds(image: CachedImage): Promise<void> {
    while (image.blob === null) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  public getDummyImage(): string {
    return this.DUMMY_IMAGE;
  }

}

// * VERSION 2
/* import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';

interface CachedImage {
  urlImg: string;
  cachedImageSub$: BehaviorSubject<Blob | null>;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private _cachedImages: CachedImage[] = [];

  constructor(private http: HttpClient) {}

  async getImage(urlImg: string): Promise<string> {
    const index = this._cachedImages.findIndex((image) => image.urlImg === urlImg);

    if (index > -1) {
      const image = this._cachedImages[index];
      console.log('esperando a cache..')
      const blob = (await lastValueFrom(image.cachedImageSub$));
      console.log('caché obtenido');
      return URL.createObjectURL(blob!);
    }

    const imgCached: CachedImage = {
      urlImg,
      cachedImageSub$: new BehaviorSubject<Blob | null>(null),
    };
    this._cachedImages.push(imgCached);

    const observable = this.http.get(urlImg, { responseType: 'blob' });

    observable.pipe(
      tap((blob) => {
        imgCached.cachedImageSub$.next(blob);
      })
    ).subscribe();

    return URL.createObjectURL(await lastValueFrom(observable));
  }
}
 */