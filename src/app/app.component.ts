import { Component } from '@angular/core';
import { BreadcrumbService } from './services/breadcrumb.service';
import { Breadcrumb } from './interfaces/breadcrumb.interface';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from './services/config.service';
import { ToastMsg } from './interfaces/config.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AGRAJA-FRONT';
  public breadcrumbs: Breadcrumb[];
  public collapse: boolean;
  public actualMenu: string;
  public startToasts: ToastMsg[];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private config: ConfigService,
    private route: Router){
      this.collapse = true;
      this.breadcrumbs = []
      this.actualMenu = '';
      this.startToasts = [];
    }
    
    async ngOnInit () {
      this.breadcrumbService.suscribe(b => {
         this.breadcrumbs = [...b];
         this.actualMenu = this.breadcrumbs.at(1)?.label || '';
      })

      this.authService.suscribeExp(()=>{
        console.log('Sesión caducada');
        this.route.navigateByUrl('/home/login');
      });
      this.startToasts = [...this.config.getStartMsgs()];
    }

    isLogged(): boolean{
      return this.authService.isLogged();
    }

    getUserName(): string | null {
      return this.authService.getUser()?.name!;
    }
}
