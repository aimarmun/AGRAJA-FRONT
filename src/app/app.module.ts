import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { AgroListComponent } from './components/agro-list/agro-list.component';
import { CajaListComponent } from './components/caja-list/caja-list.component';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CardFarmerComponent } from './components/card-farmer/card-farmer.component';
import { CardFarmerPlaceholderComponent } from './components/card-farmer-placeholder/card-farmer-placeholder.component';
import { FarmerDetailsComponent } from './components/farmer-details/farmer-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FarmerAddComponent } from './components/farmer-add/farmer-add.component';
import { AdClientModalComponent } from './components/add-client-modal/add-client-modal.component';
import { CardCrateComponent } from './components/card-crate/card-crate.component';
import { AddClientSaleModalComponent } from './components/add-client-sale-modal/add-client-sale-modal.component';
import { CrateDetailsComponent } from './components/crate-details/crate-details.component';
import { CrateAddComponent } from './components/crate-add/crate-add.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientDetailsComponent } from './components/client-details/client-details.component';
import { DateTimePipe } from './pipes/date-time.pipe';
import { ClientAddComponent } from './components/client-add/client-add.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ConfigService } from './services/config.service';

/**
 * Sirve para leer la configuración en el servicio de configuración
 * antes de cargar la App.
 * Para su correcto funcionamiento es necesario registrarlo como proveedor de la siguiente manera:
 * {
      provide: APP_INITIALIZER,
      useFactory: appConfigInit,
      multi: true,
      deps: [ConfigService]
    }

    Mas info: https://angular.io/api/core/APP_INITIALIZER
 * @param config Servicio de configuración
 * @returns 
 */
export function appConfigInit(config: ConfigService) {
  return (()=>{
    return config.loadConfig();
  })
}

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    AgroListComponent,
    CajaListComponent,
    CardFarmerComponent,
    CardFarmerPlaceholderComponent,
    FarmerDetailsComponent,
    FarmerAddComponent,
    AdClientModalComponent,
    CardCrateComponent,
    AddClientSaleModalComponent,
    CrateDetailsComponent,
    CrateAddComponent,
    ClientListComponent,
    ClientDetailsComponent,
    DateTimePipe,
    ClientAddComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigInit,
      multi: true,
      deps: [ConfigService]
    },
    provideHttpClient(
      withInterceptors(
        [
           authInterceptor
        ]
      )
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
