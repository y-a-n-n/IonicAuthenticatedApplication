import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {Events} from 'ionic-angular';
import {LogProvider} from 'ionic-log-file-appender';
import * as _ from 'lodash';
import {IUserData} from '../../model/user-data';

/**
 * Persistence store
 * Stores two classes of data:
 *  - global data, visible to any user of the app (such as who is currently logged in)
 *  - user-specific data, which can only be seen by the logged in user. The keys for these entries are prefixed with
 *      the user's id.
 */
@Injectable()
export class DataProvider {
  private DATA_KEY: string = '_data';
  private USER_DATA_KEY: string = '_userdata';
  public static USER_KEY = 'user';
  public static SOMETHING_USER_SPECIFIC_KEY = 'userSpecificInfo';

  public static EVENT_TAG = 'data:';

  data: any = {};
  userOnlyData: any = {};

  isloaded = false;

  constructor(public storage: Storage,
              private events: Events,
              private log: LogProvider) {
  }

  load() {
    if (this.isloaded) {
      return Promise.resolve(this.allData);
    }
    return this.storage.get(this.DATA_KEY)
      .then((value) => {
        if (value) {
          this.data = value;
        } else {
          this.data = {};
        }
        return this.storage.get(this.USER_DATA_KEY);
      })
      .then((value) => {
        if (value) {
          this.userOnlyData = value;
        } else {
          this.userOnlyData = {};
        }
        this.isloaded = true;
        this.log.logDev('All data: ' + JSON.stringify(this.allData));
        return this.allData;
      });
  }

  /**
   * Sets a global value, visible to all users
   * @param {string} key
   * @param value
   * @returns {Promise<any>}
   */
  setGlobalValue(key: string, value: any) {
    this.log.log("Setting data: " + "key: " + key + ", value: " + JSON.stringify(value));
    this.data[key] = value;
    let obs =  this.storage.set(this.DATA_KEY, this.data);
    obs.then(()=> {
      this.events.publish(DataProvider.EVENT_TAG + key, value);
    });
    return obs;
  }

  /**
   * Sets a value specific to the current user
   * @param {string} key
   * @param value
   * @returns {Promise<any>}
   */
  setUserOnlyValue(key: string, value: any): Promise<any> {
    const compositeKey = this.getCompositeKey(key);
    if (!compositeKey) {
      this.log.log('Could not set user-only value for key ' + key + ' as there is no current user');
      return Promise.reject('Invalid composite key');
    }
    this.log.log("Setting user-specific data: " + "key: " + compositeKey + ", value: " + JSON.stringify(value));
    this.userOnlyData[compositeKey] = value;
    return this.storage.set(this.USER_DATA_KEY, this.userOnlyData)
      .then(()=> {
        this.log.logDev('Updated data: ' + JSON.stringify(this.allData));
        this.events.publish(DataProvider.EVENT_TAG + key, value);
      });
  }

  private get userKey(): string {
    if (this.data && this.data[DataProvider.USER_KEY]) {
      const userData: IUserData = this.data[DataProvider.USER_KEY];
      return userData.id + '_';
    }
  }

  private getCompositeKey(key: string) {
    const prefix = this.userKey;
    if (prefix && prefix.length > 0) {
      return prefix + key;
    }
    return null;
  }

  setAll(value: any) {
    let obs = this.storage.set(this.DATA_KEY, value);
    obs.then(()=> {
      this.events.publish(DataProvider.EVENT_TAG + '*', value);
    });
    return obs;
  }

  getValue(key: string) {
    this.log.log("Fetching data: " + "key: " + key);
    if (this.data && this.data[key]) {
      return this.data[key];
    } else if (this.userOnlyData) {
      const compositeKey = this.getCompositeKey(key);
      if (compositeKey) {
        return this.userOnlyData[compositeKey];
      }
    }
    return null;
  }

  mergeUserOnlyValue(key: string, newValues: any): Promise<any> {
    const compositeKey = this.getCompositeKey(key);
    if (!compositeKey) {
      this.log.log('Could not merge user-only value for key ' + key + ' as there is no current user');
      return Promise.reject('Invalid composite key');
    }
    let current = this.userOnlyData[compositeKey];
    this.log.log('Merging new value: ' + JSON.stringify(newValues) + ' with old value: ' + JSON.stringify(current));
    if (current) {
      for (let k in newValues) {
        current[k] = newValues[k];
      }
    } else {
      current = newValues;
    }
    this.log.log('Merged value: ' + JSON.stringify(current));
    return this.setUserOnlyValue(key, current);
  }

  save() {
    return this.setAll(this.data);
  }

  get allData() {
    let merged = {};
    for (let k in this.data) {
      merged[k] = this.data[k];
    }
    const prefix = this.userKey;
    for (let k in this.userOnlyData) {
      if (k.startsWith(prefix)) {
        // Don't expose user prefix
        const key = k.replace(prefix, '');
        merged[key] = this.userOnlyData[k];
      }
    }
    return merged;
  }

  /**
   * Forces the provider to publish all data for the current user to the event bus
   */
  publishAllUserSpecificData() {
    // Create a list of all the user-specific data
    let list = [
      DataProvider.SOMETHING_USER_SPECIFIC_KEY
    ];
    const prefix = this.userKey;
    this.log.log('New user! Publish data with prefix ' + prefix);
    for (let k in this.userOnlyData) {
      if (k.startsWith(prefix)) {
        const value = this.userOnlyData[k];
        // Don't expose user prefix
        k = k.replace(prefix, '');
        this.events.publish(DataProvider.EVENT_TAG + k, value);
        // If the value is found, remove it from the overall list
        list = _.remove(list, value => {return value === k});
      }
    }
    // Anything that was not found is uninitialised
    for (let key of list) {
      this.log.logDev('Publishing as null: ' + key);
      this.events.publish(DataProvider.EVENT_TAG + key, null);
    }
  }
}
