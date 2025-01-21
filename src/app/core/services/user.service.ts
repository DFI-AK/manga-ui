import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IToken } from '../models/model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);

  public login = (email: string, password: string) => this.http
    .post<IToken>(environment.apiEndpoint + '/api/Users/login', { email, password })
    .pipe(
      tap(response => {
        localStorage.setItem('access-token', response.accessToken);
      }),
      catchError(err => throwError(() => err))
    );
}
