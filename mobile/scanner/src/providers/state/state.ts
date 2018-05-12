import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from "rxjs";

/*
  Generated class for the ScannerConnectionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export enum _ENDPOINTS_ {
  _CONNECT_ = 'http://192.168.43.67:8080/mobile'
  // , _AUTH_ = ''
}
export enum Events {
  WEBAPP_STATE_CHANGE = 'WEBAPP_STATE_CHANGE'
  , _SCAN_CODE_ = '_SCAN_CODE_'
  , _BATTERY_LOW_ = '_BATTERY_LOW_'
  , _CONNECTION_DESTROYED_ = '_CONNECTION_DESTROYED_'
  , _MOBILE_OFFLINE_ = '_MOBILE_OFFLINE_'
  , _MOBILE_CONNECTED_ = '_MOBILE_CONNECTED_'
  , _MOBILE_ONLINE_ = '_MOBILE_ONLINE_'
  , _MOBILE_DISCONNECTED_ = '_MOBILE_DISCONNECTED_'
}
export enum ConnectionStates {
  READY
  , AUTHENTICATING
  , AUTHENTICATION_SUCCESSFUL
  , AUTHENTICATION_FAIL
  , CONNECTING
  , ONLINE
  , OFFLINE
  , CONNECTION_DESTROYED
  , WEBAPP_OFFLINE
  , WEBAPP_ONLINE
  , ERROR
  , NETWORK_ERROR
}

let _SOCKET_;
@Injectable()
export class ScannerConnectionProvider {
  public onStateChange = new Subject();
  get connected() {
    if (!_SOCKET_) {
      return false
    }

    return _SOCKET_.connected;
  }
  public isAuthenticated;

  constructor(public http: HttpClient) {
    console.log('Hello ScannerConnectionProvider Provider');
    this.onStateChange.next(ConnectionStates.READY);
  }

  /**
   * Authenticate the connection
   * @param token
   */
  auth(token) {
    if(this.connected) return;

    this.connectToSocket({ token });
    /*
    // Authentication client
    this.onStateChange.next(ConnectionStates.AUTHENTICATING);
    this.http.post(_ENDPOINTS_._AUTH_, { code })
      .toPromise()
      .then((res: any) => {
        let { status, token } = res;

        if (status) {
          // Authentication successful
          this.onStateChange.next(ConnectionStates.AUTHENTICATION_SUCCESSFUL);

          this.isAuthenticated = true;
          // Connect with web
          this.connectToSocket({ token });
        } else {
          // Authentication failed
          this.onStateChange.next(ConnectionStates.AUTHENTICATION_FAIL);
        }
      })
      .catch((error)=>{
        this.onStateChange.next(ConnectionStates.NETWORK_ERROR);
      })
    */
  }

  /**
   * Clear the connection and reset it for a new connection
   */
  disconnect() {
    if(_SOCKET_) {
      this.removeListeners();
      _SOCKET_.emit(Events._CONNECTION_DESTROYED_);
      if(_SOCKET_.connected) _SOCKET_.disconnect();

      setTimeout(() => {
        this.isAuthenticated = false;
        _SOCKET_ = null;

        // Connection destroyed
        this.onStateChange.next(ConnectionStates.CONNECTION_DESTROYED);
      }, 0);
    }
  }

  /**
   * Send scanned code to the web
   *
   * @param {any} code
   * @param cb
   */
  scan({ code }, cb) {
    if(!this.connected) return;

    _SOCKET_.emit(Events._SCAN_CODE_, { code }, cb);
  }

  /**
   * Create socket connection
   *
   * @param {any} token
   */
  private connectToSocket({ token }) {
    if (_SOCKET_ || !token || token.trim() === '') { return; }

    // Connection to the server
    this.onStateChange.next(ConnectionStates.CONNECTING);

    //let dev = JSON.parse(token);
    _SOCKET_ = io.connect(_ENDPOINTS_._CONNECT_, {
      query: {
        token
      }
    });
    this.setListeners();
  }

  /**
   * Adding socket listeners
   */
  private setListeners() {
    _SOCKET_.on('connect', () => {
      this.isAuthenticated = true;
      this.onStateChange.next(ConnectionStates.ONLINE);
    });
    _SOCKET_.on('disconnect', () => {
      this.onStateChange.next(ConnectionStates.OFFLINE);
    });
    _SOCKET_.on('error', () => {
      this.onStateChange.next(ConnectionStates.ERROR);
    });
    _SOCKET_.on(Events.WEBAPP_STATE_CHANGE, (online)=>{
      if(!online) {
        this.onStateChange.next(ConnectionStates.WEBAPP_OFFLINE);
      } else {
        this.onStateChange.next(ConnectionStates.WEBAPP_ONLINE);
      }
    });
    _SOCKET_.on(Events._CONNECTION_DESTROYED_, ()=>{
      this.disconnect();
    });

    _SOCKET_.connect();
  }

  /**
   * Remove all the socket listeners
   */
  private removeListeners() {
    _SOCKET_.removeAllListeners();
  }
}
