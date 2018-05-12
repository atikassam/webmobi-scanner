import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ConnectionStates, ScannerConnectionProvider } from "../../providers/state/state";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import 'rxjs'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit, OnDestroy {
  public isScanDisable = false;
  public main: any = {
    type: 'primary'
    , view_logo: 'ios-qr-scanner-outline'
    , view_title: 'QR CODE'
    , view_subtitle: 'Scan the QR code to connect as a scanner'
    /*
    , view_buttons: [

      {
        title: 'SCAN'
        , click: () => {
          console.log('clicked')
        }
      }
      , {
        title: 'DISCONNECT'
        , click: () => {
          console.log('Disconnect clicked')
        }
      }
    ]
*/
  };
  public currentState;
  public subscription;

/*
  public code = {
    scan: () => Promise.resolve({ text: '973c820a-714c-48ee-9efe-9827fe9dc456' })
  }

  */
  constructor(private scanner: ScannerConnectionProvider, private code: BarcodeScanner) {}

  ngAfterViewInit() {
    this.subscription = this.scanner.onStateChange.subscribe((state) => {
      this.currentState = state;
      switch (state) {
        case ConnectionStates.READY:
        case ConnectionStates.CONNECTION_DESTROYED:
          this.setView(
            'primary'
            , 'ios-qr-scanner-outline'
            , 'QR CODE'
            , 'Scan the QR code to connect as a scanner'
          );
          this.isScanDisable = true;
          break;

        case ConnectionStates.AUTHENTICATING:
          this.setView(
            'secondary'
            , 'ios-egg-outline'
            , 'AUTHENTICATING'
            , ''
          );
          this.isScanDisable = true;
          break;

        case ConnectionStates.AUTHENTICATION_SUCCESSFUL:
          this.setView(
            'primary'
            , 'md-checkmark'
            , 'SUCCESSFUL'
            , ''
          );
          this.isScanDisable = false;
          break;

        case ConnectionStates.AUTHENTICATION_FAIL:
          this.setView(
            'error'
            , 'ios-warning-outline'
            , 'FAIL'
            , 'You check you may scanned a wrong or expired QR code'
          );
          this.isScanDisable = false;
          break;

        case ConnectionStates.CONNECTING:
          this.setView(
            'secondary'
            , 'ios-pulse-outline'
            , 'CONNECTING'
            , 'Wait for a while, we are connecting your phone'
          );
          this.isScanDisable = true;
          break;

        case ConnectionStates.WEBAPP_ONLINE:
        case ConnectionStates.ONLINE:
          this.setView(
            'primary'
            , 'ios-barcode-outline'
            , 'SCANNER CONNECTED'
            , 'Now you can scan any barcode or QR code'
          );
          this.isScanDisable = false;
          break;

        case ConnectionStates.OFFLINE:
          this.setView(
            'error'
            , 'ios-close-circle-outline'
            , 'OFFLINE'
            , 'You\'r offline Please check your network connection'
          );
          this.isScanDisable = true;
          break;

        case ConnectionStates.WEBAPP_OFFLINE:
          this.setView(
            'error'
            , 'ios-laptop-outline'
            , 'WEBAPP OFFLINE'
            , 'Please check internet connection of your PC'
          );
          this.isScanDisable = true;
          break;

        case ConnectionStates.NETWORK_ERROR:
          this.setView(
            'error'
            , 'ios-close-circle-outline'
            , 'OFFLINE'
            , 'Please check your internet connection'
          );
          this.isScanDisable = false;
          break;
        case ConnectionStates.ERROR:
          this.setView(
            'error'
            , 'ios-close-circle-outline'
            , 'ERROR'
            , 'Internal error'
          );
          this.isScanDisable = false;
          break;
      }
      this.main.state = state;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.scanner.disconnect();
  }

  scan() {
    this.code.scan()
      .then((code)=>{
        if(this.scanner.isAuthenticated){
          this.isScanDisable = true;
          this.setView(
            'primary'
            , 'ios-bicycle-outline'
            , 'UPLOADING'
            , 'Sending data to web view'
          );

          this.scanner.scan({ code }, () => {
            this.isScanDisable = false;
            this.setView(
              'primary'
              , 'md-checkmark'
              , 'SCANNED'
              , 'Successfully Scanned'
            );
          })
        } else {
          this.scanner.auth(code.text);
        }
      })
  }

  setView(type, view_logo, view_title, view_subtitle) {
    this.main = { type, view_logo, view_title, view_subtitle };
    if (this.scanner.isAuthenticated) {
      let disabled, viewButton;
      switch (this.currentState) {
        case ConnectionStates.CONNECTING:
        case ConnectionStates.AUTHENTICATING:
        case ConnectionStates.AUTHENTICATION_FAIL:
        case ConnectionStates.OFFLINE:
        case ConnectionStates.WEBAPP_OFFLINE:
        // case ConnectionStates.NETWORK_ERROR:
        // case ConnectionStates.ERROR:
          disabled = true;
          break;
      }

      if (this.scanner.isAuthenticated) {
        this.main.view_buttons = [
          {
            title: 'DISCONNECT'
            , click: () => {
              this.scanner.disconnect();
            }
          }
          , {
            title: 'SCAN'
            , disabled
            , click: () => {
              this.scan();
            }
          }
        ];
      }
    }

  }
}
