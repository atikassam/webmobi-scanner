/*
import * as io from 'socket.io-client';
import * as $ from 'jquery';

enum States {
    _CONNECTED_ = '_CONNECTED_'
    , _CONNECTING_ = '_CONNECTING_'
    , _OFFLINE_ = '_OFFLINE_'
    , _ONLINE_ = '_OFFLINE_'
    , _ERROR_ = '_ERROR_'
}

export class Webmobi {
    private static _URL_ = 'http://localhost:8080/web';
    private mContainerId;
    private io;
    private state;

    constructor(container) {
        this.mContainer = container;
    }

    private init() {

    }
    public onScan(cb) {}
    private connect() {
        $.get(Webmobi._URL_, (res) => {
            this.io = io.connect(Webmobi._URL_);
        });
    }
    private onStateChange() {
        switch (this.state) {
            case States._CONNECTING_:

                break;
        }
    }

    private view() {
        let container = document.createElement('div')
            , qrCode = document.createElement('div')
            , connect_button = document.createElement('span')
            , disconnec_button = document.createElement('span');

        $(container)
            .css('height', 420)
            .css('width', 420)
            .css('display', 'flex')
            .css('align-items', 'center')
            .css('justify-content', 'center')

        $(connect_button)
            .css('border', 0)
            .css('outline', 0)
            .css('border', 0)
            .css('border', 0)
    }
}

*/