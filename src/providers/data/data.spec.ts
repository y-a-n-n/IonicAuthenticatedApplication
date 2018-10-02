import {DatePipe} from '@angular/common';
import {Entry, File} from '@ionic-native/file';
import {Platform} from 'ionic-angular';
import {EventsMock, PlatformMock, StorageMock} from 'ionic-mocks';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import {IUserData} from '../../model/user-data';
import {DataProvider} from './data';
import {LogProvider, LogProviderConfig} from 'ionic-log-file-appender';

describe('Persistent data provider', () => {
  let file: File;
  let storage: Storage;
  let platform: Platform;
  let events: Events;
  let datePipe: DatePipe;
  let log: LogProvider;
  let data: DataProvider;
  const config = new LogProviderConfig({});

  beforeEach(() => {
    storage = StorageMock.instance();
    platform = PlatformMock.instance();
    events = EventsMock.instance();
    datePipe = new DatePipe('en-US');
    log = new LogProvider(file, platform, datePipe, config);
    data = new DataProvider(storage, events, log);
  });

  it('should verify data provider is instantiated', () => {
    expect(data).toBeDefined();
  });

  it('should check the data initialises correctly', (done) => {
    data.load()
      .then((result) => {
        done();
      });
  });


  it('should persist global data in memory', (done) => {
    const userData: IUserData = {id: '1', token: '33', username: 'test', loginTime: new Date().getTime()};
    data.setGlobalValue(DataProvider.USER_KEY, userData);
    expect(data.getValue(DataProvider.USER_KEY)).toEqual(userData);
    done();
  });

  it('should persist user-specific data in memory', (done) => {
    const userOneData: IUserData = {id: '1', token: '33', username: 'test1', loginTime: new Date().getTime()};
    const userTwoData: IUserData = {id: '2', token: '44', username: 'test2', loginTime: new Date().getTime()};

    // First user logged in:
    data.setGlobalValue(DataProvider.USER_KEY, userOneData);
    let value = {value: '1234'};
    data.setUserOnlyValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY, value);
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toEqual(value);

    // Second user logged in:
    data.setGlobalValue(DataProvider.USER_KEY, userTwoData);
    // Data from first user has been cleared
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toBeUndefined();

    value = {value: '4321'};
    data.setUserOnlyValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY, value);
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toEqual(value);

    // User logged out
    data.setGlobalValue(DataProvider.USER_KEY, null);
    // Data from first user has been cleared
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toBeNull();

    done();
  });

  it('should merge a given value with existing value', (done) => {
    const userData: IUserData = {id: '1', token: '33', username: 'test', loginTime: new Date().getTime()};
    data.setGlobalValue(DataProvider.USER_KEY, userData);

    // Set and check value
    let value = {valueOne: '1234', valueTwo: '4321'};
    data.setUserOnlyValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY, value);
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toEqual({valueOne: '1234', valueTwo: '4321'});

    // Update value
    let updatedValue = {valueTwo: '7777', valueThree: 'foobar'};
    data.mergeUserOnlyValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY, updatedValue);

    // Check values have been merged
    expect(data.getValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY)).toEqual({valueOne: '1234', valueTwo: '7777', valueThree: 'foobar'});
    done();
  });
});
