import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {IAccountInfo} from '../../model/account-info';
import {ILoginResult} from '../../model/login-result';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import {IUserData} from '../../model/user-data';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

  //TODO: make this an app constant
  private timeout = 15000;

  static SERVER = 'https://example.com';

  static ENDPOINTS = {
    login: '/login',
    logout: '/logout'
  };


  constructor(private http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }

  /**
   * Attempts to login and returns the result
   * @param {IAccountInfo} accountInfo
   * @returns {Promise<ILoginResult>}
   */
  login(accountInfo: IAccountInfo): Promise<ILoginResult> {
    return this.post(ApiProvider.SERVER + ApiProvider.ENDPOINTS.login, accountInfo)
      .then(res => {
        return {success: true, errorMessage: null, token: res.token, userId: res.userId};
      })
      .catch(err => {
        return {success: false, errorMessage: this.getErrorMessage(err.status), token: null, userId: null};
      });
  }

  logout(user: IUserData): Promise<any> {
    return this.post(ApiProvider.SERVER + ApiProvider.ENDPOINTS.logout, user);
  }

  private getErrorMessage(status: number): string {
    //Can do some status-code specific error description here if desired
    return 'There was an error'
  }

  get(endpoint: string, params?: any, reqOpts?: any, timeout?: number): Promise<any> {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(endpoint, reqOpts).timeout(timeout ? timeout : this.timeout).toPromise();

  }

  post(url: string, body: any, reqOpts?: any): Promise<any> {
    return this.http.post(url, body, reqOpts).timeout(this.timeout).toPromise();
  }

}
