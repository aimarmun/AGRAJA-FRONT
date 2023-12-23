import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken(); //localStorage.getItem('api-token');

    if (token) {
        req = req.clone({
            setHeaders: {
                //'api-token': token
                'Authorization': `Bearer ${token}`
            }
        });
    }

    return next(req);
};
