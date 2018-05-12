import { _CLIENTS_ } from "../controller/clients";
import { Errors } from "../Errors";

export function handler(platform) {
    return (socket, next) => {
        let token = socket.handshake.query.token;

        console.log('New user of platform: %s with token: %s and socket %s', platform, token, socket.id);

        if(!token) {
            next(new Error(Errors.BAD_REQUEST));
            return;
        }

        let connected;
        switch (platform) {
            case 'mobile':
                connected = _CLIENTS_.joinMobile(socket, token);
                break;
            case 'web':
                connected = _CLIENTS_.joinWeb(socket, token);
                break;
        }

        console.log('Connection created', connected);
        if (!connected) next(new Error(Errors.INVALID_CREDENTIAL));
        else next();
    }
}