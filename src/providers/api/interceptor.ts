import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse
} from '@angular/common/http';
import {LogProvider} from 'ionic-log-file-appender';
import { Observable } from 'rxjs/Observable';
import {AuthProvider} from '../auth/auth';
import {ApiProvider} from './api';
import 'rxjs/add/operator/map';
@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private auth: AuthProvider,
              private log: LogProvider) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.log.logDev('REQUEST: ' + request.url + "?" + request.params);
    // Exclude login request from interceptor
    if (!this.externalRequest(request.url) && request.url.search(ApiProvider.ENDPOINTS.login) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.user.token}`
        }
      });
    }
    return next.handle(request).map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // If we get UNAUTHORIZED response, force user to login again
        if (!this.externalRequest(request.url) && request.url.search(ApiProvider.ENDPOINTS.logout) === -1 && event.status === 401) {
          this.auth.logout(true);
        }
        return event;
      }
    });
  }

  /**
   * Returns true if the request is to somewhere other than our servers, false otherwise
   * @param {string} url
   * @returns {boolean}
   */
  private externalRequest(url: string) {
    return !url.startsWith(ApiProvider.SERVER);
  }
}
