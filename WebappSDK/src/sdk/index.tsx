import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as QRCode from 'qrcode.react';
import * as io from 'socket.io-client';
import * as $ from 'jquery';


export enum ConnectionStates {
    _AUTHENTICATING_
    , _AUTHENTICATING_FAIL_
    , _CONNECTING_
    , _CONNECTED_
    , _READY_
    , _OFFLINE_
    , _ONLINE_
    , _BATTERY_LOW_
    , _SCAN_CODE_
    , _MOBILE_OFFLINE_
    , _MOBILE_ONLINE_
    , _NETWORK_ERROR_
    , _ERROR_
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

class Scanner extends React.Component {
    private static _URL_ = 'http://localhost:8080/web';
    private static _URL_AUTH_ = 'http://localhost:8080/request/token/';
    private token;
    private io;
    private isMobileConnected = false;

    constructor(public props) {
        super(props);
        this.connect();
    }

    private setListeners() {

        this.io.on('connect', () => {
            this.onStateChange(ConnectionStates._CONNECTED_);
            if (!this.isMobileConnected) {
                this.onStateChange(ConnectionStates._READY_);
            }
            this.onStateChange(ConnectionStates._ONLINE_);
            console.log('connected')
        });
        this.io.on('disconnect', () => {
            this.onStateChange(ConnectionStates._OFFLINE_);
        });

        this.io.on(Events._BATTERY_LOW_, ()=>{
            this.onStateChange(ConnectionStates._BATTERY_LOW_);
        });
        this.io.on(Events._SCAN_CODE_, (token, ack)=>{
            this.props.onScan(token);
            ack();
        });
        this.io.on(Events._MOBILE_DISCONNECTED_, () => {
            this.isMobileConnected = false;
            this.onStateChange(ConnectionStates._READY_);
        });
        this.io.on(Events._MOBILE_OFFLINE_, () => {
            this.onStateChange(ConnectionStates._MOBILE_OFFLINE_);
        });
        this.io.on(Events._MOBILE_ONLINE_, () => {
            this.isMobileConnected = true;
            this.onStateChange(ConnectionStates._MOBILE_ONLINE_);
        });

        setTimeout(() => {
            if (this.io.connected) {
                this.onStateChange(ConnectionStates._READY_);
            }
        }, 5000)

    }

    private resetConnection() {
        this.io.removeAllListeners('connect');
        this.io.removeAllListeners('disconnect');

        this.io.removeAllListeners(Events._BATTERY_LOW_);
        this.io.removeAllListeners(Events._MOBILE_DISCONNECTED_);
        this.io.removeAllListeners(Events._MOBILE_OFFLINE_);
        this.io.removeAllListeners(Events._MOBILE_ONLINE_);

        this.token = null;
        this.io.disconnect();
        this.io = null;
    }

    connect() {
        if (this.io) {
            this.io.connect();
            return;
        }

        this.onStateChange(ConnectionStates._AUTHENTICATING_);
        $.get(Scanner._URL_AUTH_, (data) => {
            if (data.token) {
                this.token = data.token;
                this.onStateChange(ConnectionStates._CONNECTING_);
                this.io = io(Scanner._URL_, { query: { token: data.token }});
                this.setListeners();

            } else {
                this.onStateChange(ConnectionStates._AUTHENTICATING_FAIL_)
            }
        })
    }
    setState(props) {
        super.setState({ props });
    }

    render() {
        let state: any = this.state || {}
            , { qr, type, title, subtitle, button } : any =  state.props || {}
            , colorSelector = (type) => {
                switch (type) {
                    case 'primary':
                        return '#077e27';
                    case 'secondary':
                        return '#d4559d';
                    case 'warning':
                        return '#ffef6b';
                    case 'error':
                        return '#d4233b';
                    default:
                        return 'rgba(0, 0, 0, .6)';
                }
            }
            , styles = {
                container: {
                    height: 280
                    , width: 280
                    , display: 'flex'
                    , 'align-items': 'center'
                    , 'justify-content': 'center'
                    , 'flex-direction': 'column'
                    , color: colorSelector(type)
                }
                , title: {
                    'font-size': 18
                    , 'padding': '20px 10px 0px 10px'
                    , 'color':  colorSelector(type)
                }
                , subtitle: {
                    'font-size': 14
                    , 'padding': '5px 10px 20px 10px'
                    , 'color':  colorSelector(type)
                }
                , button: {
                    outline: 0
                    , border: `1px solid ${ colorSelector(type) }`
                    , padding: '5px 10px'
                    , background: 'rgba(0, 0, 0, 0)'
                }
            }
            , childs = [];

        if (qr)
            childs.push(<QRCode value={ qr }/>);
        if (title)
            childs.push(<span style={ styles.title }> { title } </span>);
        if (subtitle)
            childs.push(<span style={ styles.subtitle }> { subtitle } </span>);
        if (button)
            childs.push(<button style={ styles.button } onClick = { button.onClick }> <strong>{ button.title }</strong> </button>);

        return (
            <div style={ styles.container }>
                { childs }
            </div>
        );
    }

    onStateChange( state ) {
        console.log(state);
        switch (state) {
            case ConnectionStates._READY_:
                this.setState({
                    type: 'primary'
                    , qr: this.token
                    , subtitle: 'Scan qr to connect'
                });
                break;
            case ConnectionStates._AUTHENTICATING_:
                this.setState({
                    type: 'secondary'
                    , title: 'Authenticating...'
                });
                break;
            case ConnectionStates._AUTHENTICATING_FAIL_:
                this.setState({
                    type: 'error'
                    , title: 'CONNECTION FAILED'
                    , button: {
                        title: 'CONNECT'
                        , onClick: this.connect.bind(this)
                    }
                });
                break;
            case ConnectionStates._CONNECTING_:
                this.setState({
                    type: 'secondary'
                    , title: 'Connecting...'
                });
                break;
            case ConnectionStates._ONLINE_:
            case ConnectionStates._CONNECTED_:
            case ConnectionStates._MOBILE_ONLINE_:
                this.setState({
                    type: 'primary'
                    , title: 'CONNECTED'
                    , button: {
                        title: 'Disconnect'
                        , onClick: () => {
                            this.io.emit(Events._MOBILE_DISCONNECTED_);
                        }
                    }
                });
                break;
            case ConnectionStates._BATTERY_LOW_:
                this.setState({
                    type: 'warning'
                    , title: 'CONNECTED'
                    , subtitle: 'Phone battery low'
                });
                break;
            case ConnectionStates._MOBILE_OFFLINE_:
                this.setState({
                    type: 'warning'
                    , title: 'OFFLINE'
                    , subtitle: 'Your mobile is offline'
                });
                break;
            case ConnectionStates._OFFLINE_:
            case ConnectionStates._NETWORK_ERROR_:
                this.setState({
                    type: 'error'
                    , title: 'Offline'
                    , subtitle: 'Please check your network connection'
                });
                break;
        }
    }
}



window['WebmobiScanner'] = function (id, onScan) {
    let scanner = <Scanner onScan = { onScan }/>;

    ReactDOM.render(
        scanner,
        document.getElementById(id)
    );

     return scanner;
};

/*
WebmobiScanner('root', (token)=>{
    console.log(token);
});
*/
