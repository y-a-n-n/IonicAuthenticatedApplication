import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {LogProvider} from 'ionic-log-file-appender';
import {AuthProvider} from '../../providers/auth/auth';
import {HomePage} from '../home/home';
import {LoginPage} from '../login/login';

/**
 * Splash page
 */
@IonicPage()
@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage {

  constructor(private navCtrl: NavController,
              private auth: AuthProvider,
              private log: LogProvider) {
  }

  ionViewDidLoad() {
    this.log.log('SplashPage');
    this.auth.load().then(() => {
      if (this.auth.isLoggedIn()) {
        this.log.log('User logged in, going to home page: ' +  JSON.stringify(this.auth.user));
        this.navCtrl.setRoot(HomePage, {}, {
          animate: true,
          direction: 'forward'
        });
      } else {
        this.log.log('User not in, going to login page');
        this.navCtrl.setRoot(LoginPage, {}, {
          animate: true,
          direction: 'forward'
        });
      }
    }, err => {
      this.log.log('Error finding user, going to login page: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
      this.navCtrl.setRoot(LoginPage, {}, {
        animate: true,
        direction: 'forward'
      });
    });
  }
}
