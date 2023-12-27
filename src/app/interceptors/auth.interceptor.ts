import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const route = inject(Router);
    const token = authService.getToken().token;

    if (token) {
        req = req.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.log('interceptor error', error)
            if(error.status === 401 || error.status === 420 || error.status === 0) {
                console.log('redirigiendo a login desde interceptor');
                authService.logoOff();
                route.navigate(['home/login']);
            }
            return throwError(() => error);
           })
    );
};
