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
      this.printWelcome();
      this.breadcrumbService.suscribe(b => {
         this.breadcrumbs = [...b];
         this.actualMenu = this.breadcrumbs.at(1)?.label || '';
      })

      this.authService.suscribeExp(()=>{
       // console.log('Sesión caducada');
        this.route.navigateByUrl('/home/login');
      });
      this.startToasts = [...this.config.getStartMsgs()];
    }
  printWelcome() {
    console.log('%cBienvenid@ a Agraja!','font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');
    console.log('%cCreada con ❤️ por Aimarmun', 'color: green; font-family:monospace;');
    console.log(`Gracias por probar Agraja!
      Agraja es mi proyecto final de Bootcamp realizado para Codehouse Academy (https://codehouse.academy/).
      Se trata de una aplicación que tiene dos apartados bien difenciados:
        -Agro: para la contratación de agricultores.
        -Caja: para la venta de cajas de productos.
      Las cajas pueden ser de frutas, cereales, leguminosas u hortalizas.
      Los agricultores pueden tratar 4 tipos de cultivos: hortalizas, leguminosas, frutales y cereales.
      Agraja contiene una lista de clientes. Estos clientes pueden contratar los servicios de un agricultor o pueden realizar compras de cajas.
      
      Agraja tiene disponible 2 usuarios diferentes, el usuario Administrador y el usuario Vendedor.
      El usuario Administrador permite hacer contrataciones de agricultores y ventas de cajas, pero además permite modificar y añadir tanto cajas como agricultores.
      
      El usuario Vendedor permite realizar contrataciones y vender cajas, pero no permite la modificación de estos.
      
      ⚠️ Ten en cuenta que la base de datos se reinicia cada hora y si coincides con este proceso, es posible que te saque de la sesión.
            
      Para la autenticación se ha utilizado Jwt Bearer tokens y las contraseñas se cifran mediante AES256 en la base de datos.
      Solo se permite el inicio de sesión de un mismo usuario a la vez, por lo que es posible que si alguien está utilizando el mismo usuario desde otro navegador te tire de la sesión.
      
      Muy pronto publicaré el codigo fuente en Github.`);
  }

    isLogged(): boolean{
      return this.authService.isLogged();
    }

    getUserName(): string | null {
      return this.authService.getUser()?.name!;
    }
}
