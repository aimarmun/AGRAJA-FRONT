import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../interfaces/breadcrumb.interface';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  public breadcrumbsEmitter = new EventEmitter<Breadcrumb[]>();

  private suscribers: ((breadcrumbs: Breadcrumb[])=> void)[];

  constructor() { 
    this.suscribers = [];
  }

  setActiveRoute(route: ActivatedRoute, withParams: boolean = false){
    const breadc: Breadcrumb[] = [];
    const segments: string[] = [];
    route.snapshot.url.forEach((segment, index) => {
      if(withParams && (index + 1 == route.snapshot.url.length))
        return;
      segments.push(segment.path);
      breadc.push({
        label: segment.path,
        url: segments.join('/'),
      });
    });
    this.updateSuscribers(breadc);
  }

  suscribe(f:(breadcrumbs: Breadcrumb[])=> void) {
    this.suscribers.push(f);
  } 

  private updateSuscribers(breadcrumbs: Breadcrumb[]){  
    this.suscribers.forEach(suscriber =>{
      setTimeout(() => {
        suscriber(breadcrumbs);
      }, 0);
    })    
  }
}
 