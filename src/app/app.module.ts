import {DatePipe} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {Events, IonicApp, IonicErrorHandler, IonicModule, Platform} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import {LoginPage} from '../pages/login/login';
import {SplashPage} from '../pages/splash/splash';
import {Interceptor} from '../providers/api/interceptor';
import {AuthProvider} from '../providers/auth/auth';
import {File} from '@ionic-native/file';
import { IonicStorageModule, Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ApiProvider } from '../providers/api/api';
import { DataProvider } from '../providers/data/data';
import {LogProvider, LogProviderConfig} from 'ionic-log-file-appender';
import { ExampleProvider } from '../providers/example/example';

export function provideLogger(file: File, platform: Platform, datePipe: DatePipe) {
  /**
   * Provider for persistent file logging services
   */
  return new LogProvider(file, platform, datePipe, new LogProviderConfig({logToConsole: true}));
}

export function provideData(storage: Storage, events: Events, log: LogProvider) {
  /**
   * Provider for persistent data
   */
  return new DataProvider(storage, events, log);
}


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SplashPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SplashPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    AuthProvider,
    DataProvider,
    DatePipe,
    File,
    { provide: LogProvider, useFactory: provideLogger, deps: [File, Platform, DatePipe] },
    { provide: DataProvider, useFactory: provideData, deps: [Storage, Events, LogProvider] },
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi:true },
    ExampleProvider
  ]
})
export class AppModule {}
