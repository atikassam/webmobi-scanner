import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ComponentsModule } from "../components/components.module";
import { ScannerConnectionProvider } from '../providers/state/state';


@NgModule({
  declarations: [
    MyApp
    , HomePage
  ]
  , imports: [
    BrowserModule
    , IonicModule.forRoot( MyApp )
    , ComponentsModule
    , HttpClientModule
  ]
  , bootstrap: [ IonicApp ]
  , entryComponents: [
    MyApp
    , HomePage
  ]
  , providers: [
    StatusBar
    , SplashScreen
    , BarcodeScanner
    , {provide: ErrorHandler, useClass: IonicErrorHandler}
    , ScannerConnectionProvider
  ]
})
export class AppModule {}
