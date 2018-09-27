import { Component } from '@angular/core';
import {AlertController, IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';
import {IAccountInfo} from '../../model/account-info';
import {LogProvider} from 'ionic-log-file-appender';
import {ILoginResult} from '../../model/login-result';
import {AuthProvider} from '../../providers/auth/auth';
import {HomePage} from '../home/home';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private account: IAccountInfo = {username: '', password: ''};
  private loading: Loading;

  constructor(private navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private log: LogProvider,
              private auth: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  doLogin() {
    this.loading = this.loadingCtrl.create({content: 'Signing you in...'});
    this.loading.present();
    this.auth.login(this.account)
      .then((res: ILoginResult) => {
        this.dismissLoading();
        if (res.success) {
          this.loginSuccess();
        } else {
          this.neutralAlert('Login Error', res.errorMessage)
        }
      })
      .catch(err => {
        this.dismissLoading();
        this.neutralAlert('Login Error', 'There was an error logging you in. Please check your internet connection')
      });
  }

    dismissLoading() {
      if (this.loading) {
        this.loading.dismiss();
        this.loading = null;
      }
    }

  protected neutralAlert(title: string, message: string, handler?: any) {
    const prompt = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: handler
        }
      ]
    });
    prompt.present();
  }

  loginSuccess() {
    this.navCtrl.setRoot(HomePage, {}, {
      animate: true,
      direction: 'forward'
    });
  }
}
