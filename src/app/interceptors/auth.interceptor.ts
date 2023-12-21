import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('api-token');

  if (token) {
      req = req.clone({
          setHeaders: {
              //'api-token': token
              'Authorization': `Bearer ${token}`
          }
      } );
  }
  
  return next(req);
};
