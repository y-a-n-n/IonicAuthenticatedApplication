import { Injectable } from '@angular/core';
import {Events} from 'ionic-angular';
import {IAccountInfo} from '../../model/account-info';
import {ILoginResult} from '../../model/login-result';
import {IUserData} from '../../model/user-data';
import {ApiProvider} from '../api/api';
import {LogProvider} from 'ionic-log-file-appender';
import {DataProvider} from '../data/data';

/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  public static EVENT_LOGIN = 'login';
  private userData: IUserData = null;

  constructor(private api: ApiProvider,
              private log: LogProvider,
              private data: DataProvider,
              private events: Events) {
    this.log.log('Hello AuthProvider Provider');
  }

  isLoggedIn() {
    return this.userData && this.userData.token;
  }

  get user() {
    return this.userData;
  }

  /**
   * Performs a login attempt
   * @param {IAccountInfo} accountInfo
   * @returns {Promise<ILoginResult>}
   */
  login(accountInfo: IAccountInfo): Promise<ILoginResult> {
    return this.api.login(accountInfo)
      .then((res: ILoginResult) => {
        if (this.validResult(res)) {
          this.loginSuccess({username: accountInfo.username, token: res.token, loginTime: new Date().getTime(), id: res.userId});
          return res;
        } else {
          this.userData = null;
        }
        return res;
      })
      .catch(err => {
        this.log.log('Error logging in: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
        return {success: false, errorMessage: 'Unknown error', token: null, userId: null};
      });
  }

  private validResult(res: ILoginResult): boolean {
    return res && res.success && res.token && res.token.length > 0 && res.userId && res.userId.length > 0
  }

  private loginSuccess(userData: IUserData) {
    this.log.log('Successfully logged in!');
    this.userData = userData;
    this.data.setGlobalValue(DataProvider.USER_KEY, userData)
      .then(() => {
        this.data.publishAllUserSpecificData();
        this.events.publish(AuthProvider.EVENT_LOGIN, this.userData);
      })
      .catch(err => {
        this.log.log('Error: unable to save user data. ' + JSON.stringify(err, Object.getOwnPropertyNames(err)))
      });
  }

  /**
   * Log the user out, which forgets the session
   */
  logout(publish?: boolean): Promise<any> {
    if (this.userData) {
      return this.api.logout(this.userData)
        .then(() => {
          return this.clearUserData(publish);
        })
        .catch(err => {
          this.log.log('Failed to communicate with server on logout: ' + JSON.stringify(err));
          return this.clearUserData(publish);
        });
    } else {
      return this.clearUserData(publish);
    }
  }

  /**
   * Clear the user data in preparation for next login
   * @param {boolean} publish
   * @returns {Promise<any>}
   */
  private clearUserData(publish?: boolean): Promise<any> {
    this.log.log('Clearing all user data and ' + (publish ? 'publishing result' : 'not publishing result'));
    this.userData = null;
    return this.data.setGlobalValue(DataProvider.USER_KEY, null)
      .then(() => {
        this.log.log('Cleared all user data.');
        if (publish) {
          this.events.publish(AuthProvider.EVENT_LOGIN, this.userData);
        }
      })
      .catch(err => {
        this.log.log('Error clearing user data: ' + JSON.stringify(err));
      });
  }

  /**
   * Attempt to load persisted user data
   * @returns {Promise<IUserData>}
   */
  load() {
    return this.data.load()
      .then(data => {
        const userData: IUserData = this.data.allData[DataProvider.USER_KEY];
        if (userData) {
          this.userData = userData;
          this.events.publish(AuthProvider.EVENT_LOGIN, this.userData);
        }
        return this.userData;
      });
  }
}
