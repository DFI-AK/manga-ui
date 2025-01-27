import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { LOCAL_STORAGE } from '../constants/localstorage_contant';
import { IToken } from '../models/model';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authorizeInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const tokenStore = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);

  if (userService.isTokenExpired()) {
    return next(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          router.navigate(['/signin'], { queryParams: { ReturnURL: window.location.pathname } });
        }
        return throwError(() => err);
      })
    );
  }

  if (!tokenStore) return next(req).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse) {
        router.navigate(['/signin'], { queryParams: { ReturnURL: window.location.pathname } });
      }
      return throwError(() => err);
    })
  );

  const token = JSON.parse(tokenStore) as IToken;

  return next(req.clone({
    setHeaders: {
      "Authorization": `Bearer ${token.accessToken}`
    }
  })).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse) {
        router.navigate(['/signin'], { queryParams: { ReturnURL: window.location.pathname } });
      }
      return throwError(() => err);
    })
  );
};
