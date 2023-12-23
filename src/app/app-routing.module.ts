import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { AgroListComponent } from './components/agro-list/agro-list.component';
import { CajaListComponent } from './components/caja-list/caja-list.component';
import { FarmerDetailsComponent } from './components/farmer-details/farmer-details.component';
import { FarmerAddComponent } from './components/farmer-add/farmer-add.component';
import { CrateDetailsComponent } from './components/crate-details/crate-details.component';
import { CrateAddComponent } from './components/crate-add/crate-add.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientDetailsComponent } from './components/client-details/client-details.component';
import { ClientAddComponent } from './components/client-add/client-add.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: MainMenuComponent, children: [] },
  { path: 'home/agro', pathMatch: 'full', component: AgroListComponent },
  { path: 'home/caja', component: CajaListComponent },
  { path: 'home/caja/detalles/:id', component: CrateDetailsComponent }, 
  { path: 'home/caja/nueva', canActivate: [authGuard], component: CrateAddComponent },
  { path: 'home/agro/agricultor/:id', component: FarmerDetailsComponent },
  { path: 'home/agro/nuevo', pathMatch: 'full', component: FarmerAddComponent },
  { path: 'home/clientes', pathMatch: 'full', component: ClientListComponent },
  { path: 'home/clientes/detalles/:id', component: ClientDetailsComponent },
  { path: 'home/clientes/nuevo', pathMatch: 'full', component: ClientAddComponent },
  { path: 'home/login', pathMatch: 'full', component: LoginComponent },
  { path: "**", redirectTo: "/home" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
