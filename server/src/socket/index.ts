import { _CLIENTS_ } from "../controller/clients";
import { Errors } from "../Errors";

/**
 * Here we verify an incoming socket connection
 * and attach with the specific client handler
 *
 * @param platform
 * @returns {(socket, next) => undefined}
 */
export function handler(platform) {
    return (socket, next) => {
        let token = socket.handshake.query.token;

        // Disconnect if token is not available
        // in query parameter
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

        // if `connected` is false means invalid credential is passed
        // so pass to next control with an Errors.INVALID_CREDENTIAL
        // error
        if (!connected) next(new Error(Errors.INVALID_CREDENTIAL));
        // Else pass to the next control
        else next();
    }
}