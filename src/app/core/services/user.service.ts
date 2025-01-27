import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IToken } from '../models/model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { LOCAL_STORAGE } from '../constants/localstorage_contant';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private router = inject(Router);

  public login = (email: string, password: string) => this.http
    .post<IToken>(environment.apiEndpoint + '/api/Users/login', { email, password })
    .pipe(
      tap(response => {
        localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, JSON.stringify(response));
        const expiry = Date.now() + response.expiresIn * 1000;
        localStorage.setItem(LOCAL_STORAGE.EXPIRES_IN, expiry.toString());
        this.router.navigate(['']);
      }),
      catchError(err => throwError(() => err))
    );

  public isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem(LOCAL_STORAGE.EXPIRES_IN);
    if (!expiry) return true;
    return Date.now() >= parseInt(expiry, 10);
  };
}
