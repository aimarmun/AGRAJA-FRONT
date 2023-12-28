import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log(route);
  if(!authService.isLogged()){
    console.log('navegar a login')
    return router.createUrlTree(['home/login'])
  }
  console.log('guard data', route.data)
  if(route.data){
    const roleData: RoleData = route.data as RoleData;
    if(roleData.adminRol)
    { 
      console.log('El usuario no es administrador')
      const params = { errorMsg: 'No tienes permisos suficientes. Prueba a cambiar de usuario.' }
      return router.createUrlTree(['home/login'], { queryParams:  params });
    }
  }
  return true;
};

interface RoleData {
  adminRol: boolean
}