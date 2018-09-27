import { Component } from '@angular/core';
import {
  AlertController, Events, IonicPage, LoadingController, ModalController, NavController, NavParams, Platform,
  ToastController
} from 'ionic-angular';
import {ExampleProvider} from '../../providers/example/example';
import {AuthenticatedPage} from '../authenticated/authenticated';
import {LogProvider} from 'ionic-log-file-appender';

/**
 * Example page showing lifecycle basics and provider subscriptions
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage extends AuthenticatedPage {

  constructor(navCtrl: NavController,
              navParams: NavParams,
              log: LogProvider,
              events: Events,
              modalCtrl: ModalController,
              loadingCtrl: LoadingController,
              alertCtrl: AlertController,
              toastCtrl: ToastController,
              platform: Platform,
              private exampleProvider: ExampleProvider) {
    super(navCtrl, navParams, log, events, modalCtrl, loadingCtrl, alertCtrl, toastCtrl, platform);
    // These subscriptions will be added and removed when page is resumed and paused, respectively
    this.subscriptions = [{tag: ExampleProvider.EVENT_TAG + ExampleProvider.EVENT_EXAMPLE_DATA, action: this.exampleDataReceived}];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  private exampleDataReceived = exampleData => {
    this.log.log('Example data received: ' + JSON.stringify(exampleData));
  };

  protected onResume() {
    // Make sure the latest data is displayed when the page is resumed
    this.exampleDataReceived(this.exampleProvider.exampleData);
  }

}
