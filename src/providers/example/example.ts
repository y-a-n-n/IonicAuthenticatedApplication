import { Injectable } from '@angular/core';
import {Events} from 'ionic-angular';
import {LogProvider} from 'ionic-log-file-appender';
import {DataProvider} from '../data/data';

/**
 * Stores some user-specific data in memory for application use, and persists it across restarts
 * Publishes event to event bus when data is changed
 */
@Injectable()
export class ExampleProvider {

  public static EVENT_TAG = 'example:';
  public static EVENT_EXAMPLE_DATA = 'exampleData';

  private someUserSpecificData;

  constructor(private log: LogProvider,
              private data: DataProvider,
              private events: Events) {
    this.log.log('Hello ExampleProvider Provider');
    this.data.load().then(allData => {
      this.someUserSpecificData = allData[DataProvider.SOMETHING_USER_SPECIFIC_KEY];
    })
  }

  get exampleData() {
    return this.someUserSpecificData;
  }

  set exampleData(example) {
    this.someUserSpecificData = example;
    this.data.setUserOnlyValue(DataProvider.SOMETHING_USER_SPECIFIC_KEY, example);
    this.events.publish(ExampleProvider.EVENT_TAG + ExampleProvider.EVENT_EXAMPLE_DATA, example);
  }

}
