import * as uuid from 'uuid';

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

const _IDS_ = [];
export class Client {
    private static _RECONNECT_TIMEOUT_ = 1000*60*1;
    private mobile;
    private web;
    private mobile_reconnect_timer;
    private web_reconnect_timer;
    public token;

    constructor( public id) {
        this.resetToken();
    }
    connect(web) {
        this.web = web;
        this.setWebListeners();
    }
    disconnect() {
        this.removeWebListeners();
        this.remove();
        this.web = null;
    }

    join(mobile) {
        if (!(this.web && this.web.connected)) return;

        if(this.mobile) {
            this.remove();
        }

        this.mobile = mobile;
        this.setMobileListeners();

        // Emit to the web that mobile is now connected
        this.safeEmit(this.web, Events._MOBILE_ONLINE_);
    }
    remove() {
        this.removeMobileListeners();
        if(this.mobile.connected) this.mobile.disconnect();
        this.mobile = null;
    }

    resetToken() {
        do {
            this.token = uuid.v4();
        } while (_IDS_.indexOf(this.token) !== -1);

        return this.token;
    }

    private setWebListeners() {
        this.web.on('disconnect', () => {
            if (!this.mobile) return;
            this.safeEmit(this.mobile, Events.WEBAPP_STATE_CHANGE, false);

            if(this.web_reconnect_timer) clearTimeout(this.mobile_reconnect_timer);
            this.web_reconnect_timer = setTimeout(() => {
                this.disconnect();
            }, Client._RECONNECT_TIMEOUT_);
        });
        this.web.on('connect', () => {
            if (!this.mobile) return;
            this.safeEmit(this.mobile, Events.WEBAPP_STATE_CHANGE, true);
        });
        this.web.on(Events._MOBILE_DISCONNECTED_, () => {
            this.remove();
        });
    }
    private removeWebListeners() {
        this.web.removeAllListeners();
    }

    private setMobileListeners() {
        if (!this.mobile) return;

        this.mobile.on('connect', () => {
            if(!this.mobile) return;
            this.safeEmit(this.web, Events._MOBILE_ONLINE_);
        });
        this.mobile.on('disconnect', () => {
            if(!this.mobile) return;
            if(this.mobile_reconnect_timer) clearTimeout(this.mobile_reconnect_timer);

            // Tall to the tat mobile is offline
            if (this.web) this.safeEmit(this.web, Events._MOBILE_OFFLINE_);

            this.mobile_reconnect_timer = setTimeout(() => {
                this.remove();
            }, Client._RECONNECT_TIMEOUT_);
        });

        //On Scan code
        this.mobile.on(Events._SCAN_CODE_, (data, cb) => {
            //cb();
            console.log('Scanned code received', data);
            this.safeEmit(this.web, Events._SCAN_CODE_, data, cb);
        });

        // On battery low
        this.mobile.on(Events._BATTERY_LOW_, (cb) => {
            this.safeEmit(this.web, Events._BATTERY_LOW_, cb);
        });

        // On Connection destroyed low
        this.mobile.on(Events._CONNECTION_DESTROYED_, () => {
            console.log('Disconnect request');
            this.remove();
        })
    }
    private removeMobileListeners() {
        if (!this.mobile) return;

        this.mobile.removeAllListeners();

        // tall mobile that connection is destroyed
        this.safeEmit(this.mobile, Events._CONNECTION_DESTROYED_);
        this.safeEmit(this.web, Events._MOBILE_DISCONNECTED_);
    }
    private safeEmit(...data) {
        let [ socket, ...arg ] = data;
        socket.emit.apply(socket, arg);
    }
}

export class Clients {
    public clients: any = [];

    client(id) {
        let client;

        if(id){
            client = this.clients.find(_c => _c.id === id);
        }
        if(!id || client) {
            client= new Client(uuid.v4());
        }

        this.clients.push(client);
        return client;
    }
    joinMobile(mobile_socket, token) {

        let client: Client = this.clients.find((_c) => _c.token === token);

        if(client) {
            client.join(mobile_socket);
            return true;
        } else {
            return false;
        }
    }
    joinWeb(web_socket, token) {

        let client: Client = this.clients.find((_c) => _c.token === token);

        if(client) {
            client.connect(web_socket);
            return true;
        } else {
            return false;
        }
    }
}

export const _CLIENTS_ = new Clients();