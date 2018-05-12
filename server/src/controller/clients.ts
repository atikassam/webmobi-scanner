import * as uuid from 'uuid';

/**
 * These are the socket events
 */
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

/**
 * Here we store client ids which will be
 * used to avoid duplicate id while generating new client id
 * @type {any[]}
 * @private
 */
const _IDS_ = [];

/**
 * This class will handle all the major functionality
 * of this application, It will act as a bridge in between
 * web socket and mobile socket
 */
export class Client {

    /**
     * Its is the time after which the offline client
     * will be disconnected
     *
     * @type {number}
     * @private
     */
    private static _RECONNECT_TIMEOUT_ = 1000*60*1;

    /**
     * This is mobile clients socket instance
     */
    private mobile;

    /**
     * this is web clients socket instance
     */
    private web;

    private mobile_reconnect_timer;
    private web_reconnect_timer;

    /**
     * Both mobile and web will use this token to
     * establish the socket connection
     */
    public token;

    constructor( public id) {
        this.resetToken();
    }

    /**
     * this method is used to attach web socket
     *
     * @param web
     */
    connect(web) {
        this.web = web;
        this.setWebListeners();
    }

    /**
     * this method is used to detach a socket connection
     */
    disconnect() {
        this.removeWebListeners();
        this.remove();
        this.web = null;
    }

    /**
     * This method is used to attach mobile socket
     *
     * @param mobile
     */
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

    /**
     * this method is used to detach mobile socket
     */
    remove() {
        this.removeMobileListeners();
        if(this.mobile.connected) this.mobile.disconnect();
        this.mobile = null;
    }

    /**
     * create socket token
     * @returns {any}
     */
    resetToken() {
        do {
            this.token = uuid.v4();
        } while (_IDS_.indexOf(this.token) !== -1);

        return this.token;
    }

    /**
     * set all web socket listeners here
     */
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

    /**
     * Remove all web socket listeners
     */
    private removeWebListeners() {
        this.web.removeAllListeners();
    }

    /**
     * set all mobile socket listeners
     */
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

    /**
     * remove all mobile socket listeners
     */
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

/**
 * this class manages all the clients
 */
export class Clients {
    public clients: any = [];

    client(id) {
        let client;

        if(id){
            client = this.clients.find(_c => _c.id === id);
        }
        if(!id || client) {
            client = new Client(uuid.v4());
        }

        this.clients.push(client);
        return client;
    }

    /**
     * Join a mobile client
     *
     * @param mobile_socket
     * @param token
     * @returns {boolean}
     */
    joinMobile(mobile_socket, token) {

        let client: Client = this.clients.find((_c) => _c.token === token);

        if(client) {
            client.join(mobile_socket);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Join a web client
     *
     * @param web_socket
     * @param token
     * @returns {boolean}
     */
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