import {
  AlertController,
  Events, Loading, LoadingController, MenuController, Modal, ModalController, NavController,
  NavParams, Platform, ToastController
} from 'ionic-angular';
import {Subscription} from 'rxjs/Subscription';
import {LogProvider} from 'ionic-log-file-appender';
import {IEventSubscription} from '../../model/event-subscription';
import {AuthProvider} from '../../providers/auth/auth';
import {LoginPage} from '../login/login';

/**
 * Base class for pages which require authentication to view
 * All pages except login/signup should extend this class
 */
export class AuthenticatedPage {

  private eventSubscriptions: IEventSubscription[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              protected log: LogProvider,
              protected events: Events,
              protected modalCtrl: ModalController,
              protected loadingCtrl: LoadingController,
              protected alertCtrl: AlertController,
              protected toastCtrl: ToastController,
              protected platform: Platform,
              private auth: AuthProvider) {
  }

  private logoutLoading: Loading;
  private subscribed = false;
  private pauseSubscription: Subscription;
  private resumeSubscription: Subscription;

  /**
   * Sets the subscriptions to the event bus which are to be added on page resume and removed on page pause
   * @param {IEventSubscription[]} value
   */
  set subscriptions(value: IEventSubscription[]) {
    this.eventSubscriptions = value;
  }

  private doSubscribe() {
    if (!this.subscribed) {
      this.log.logDev('SUBSCRIBING: ' + this.getPageName());
      // this.user.load()
      //   .then(userData => {
      //     if (!this.user.isLoggedIn()) {
      //       this.notLoggedIn();
      //     }
      //   })
      //   .catch(err => {
      //     this.log.log(err);
      //     this.notLoggedIn();
      //   });

      //TODO: subscriptions here
      // this.events.subscribe(User.EVENT_LOGIN, this.loginListener);
      this.eventSubscriptions.forEach(sub => {
        this.events.subscribe(sub.tag, sub.action);
      });
      this.onResume();
      this.subscribed = true;
    } else {
      this.log.logDev('Not subscribing; already subscribed: ' + this.getPageName());
    }
  }

  /**
   * Can be overridden by child pages to hide menu if required
   * @returns {boolean}
   */
  protected shouldEnableMenu(): boolean {
    return true;
  }

  private subscribeToPlatformEvents() {
    // Listen for platform pause and resume events
    this.platform.ready().then(() => {
      this.log.logDev('PLATFORM IS READY: ' + this.getPageName());
      this.pauseSubscription = this.platform.pause.subscribe(() => {
        this.log.logDev('Platform event:  pause: ' + this.getPageName());
        this.doUnsubscribe();
        this.onPlatformPause();
      });
      this.resumeSubscription = this.platform.resume.subscribe(() => {
        this.log.logDev('Platform event:  resume: ' + this.getPageName());
        this.doSubscribe();
        this.onPlatformResume();
      });
    });
  }

  private doUnsubscribe() {
    if (this.subscribed) {
      this.log.logDev('UNSUBSCRIBING: ' + this.getPageName());
      //TODO: Unsubscriptions here
      // this.events.unsubscribe(User.EVENT_LOGIN, this.loginListener);
      this.eventSubscriptions.forEach(sub => {
        this.events.unsubscribe(sub.tag, sub.action);
      });
      this.onPause();
      this.subscribed = false;
    } else {
      this.log.logDev('Not unsubscribing; already unsubscribed: ' + this.getPageName());
    }
  }

  // Overridden by child pages to fill in their own unsubscriptions
  protected onPause(){};

  // Overridden by child pages to fill in their own subscriptions
  protected onResume(){};

  // Called when the the entire app is resumed (i.e. from background)
  protected onPlatformResume() {
    // this.statusProvider.getStatusFromServer();
  };

  // Called when the the entire app is paused
  protected onPlatformPause(){};

  ionViewDidEnter() {
    this.log.logDev('IONVIEWDIDENTER: ' + this.getPageName());
    this.subscribeToPlatformEvents();
    this.doSubscribe();
  }

  private loginListener =(loggedIn) => {
    if (!loggedIn) {
      this.notLoggedIn();
    }
  };

  protected getPageName() {
    return 'AuthenticatedPage';
  }

  ionViewDidLeave() {
    this.log.logDev('IONVIEWDIDLEAVE: ' + this.getPageName());
    this.doUnsubscribe();
    // This page should no longer listen to platform events
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }
    if (this.resumeSubscription) {
      this.resumeSubscription.unsubscribe();
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

  protected toastMessage(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  notLoggedIn(): Promise<any> {
    this.log.log('User is not logged in. Redirect to login page');
    this.logoutLoading = this.loadingCtrl.create({content: 'Logging out...'});
    this.logoutLoading.present();
    return this.auth.logout()
      .then(() => this.showLoginPage())
      .catch(() => {
        this.log.log('Error performing remote log out');
        // Redirect to login page anyway
        this.showLoginPage()
      });
  }

  private showLoginPage() {
    this.logoutLoading.dismiss();
    // Redirect to login
    this.navCtrl.setRoot(LoginPage, {}, {
      animate: true,
      direction: 'forward'
    });
  }
}
