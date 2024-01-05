import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { JwtToken } from '../interfaces/jwt-token.interface';

// * Meter esto en providers en app.moudles.ts para que funcione el interceptor funcional
/* provideHttpClient(
  withInterceptors(
    [
       authInterceptor
    ]
  )
) */

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /*   let refreshTokenInProgress: boolean = false;
    const refreshToken$ = new BehaviorSubject<JwtToken | null>(null); */
    const authService = inject(AuthService);
    //const route = inject(Router);
    let token = authService.getToken().token;

    if (token) {
        //console.log('Injectando token')
        req = req.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                if (!authService.isRefreshingToken) {
                    authService.refreshToken$.next(null);
                    authService.isRefreshingToken = true;
                    return authService.refreshTokenOb().pipe(
                        switchMap((token: JwtToken) => {
                            if(token) {
                                authService.refreshToken$.next(token);

                                console.log('Token actualizado desde interceptor', token);
                                req = req.clone({
                                    setHeaders: {
                                        'Authorization': `Bearer ${authService.getToken().token}`
                                    }
                                });
                                return next(req);
                            }
                            return throwError(()=> new Error('Error al actualizar el token'));
                        }),
                        finalize(()=> authService.isRefreshingToken = false)
                    );
                } else {
                    return authService.refreshToken$.pipe(
                        filter((result) => result !== null),
                        take(1),
                        switchMap((token: JwtToken | null)=> {
                            
                            console.log('desde refreshToken$:', token);
                            console.log('|_El que me dá el servicio:', authService.getToken());
                             return next(req.clone({
                                setHeaders: {
                                    'Authorization': `Bearer ${authService.getToken().token}`
                                }
                            }));
                            })
                      );
                }
            }
            return throwError(() => error);
        })
    );
};
