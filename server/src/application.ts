import * as http from 'http';
import * as express from 'express';
import * as io from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { routers } from "./routers";
import { handler } from "./socket";

const http_engine = express();
const server = (<any>http).Server(http_engine);
const socket_engine = io(server);

http_engine.use(cors({ origin: '*' }));
// http_engine.use(bodyParser.json());
http_engine.use(cookieParser());
http_engine.use('/', routers);

socket_engine.of('/mobile').use(handler('mobile'));
socket_engine.of('/web', ).use(handler('web'));


server.listen(8080, () => {
    console.log('Server listening on port: ', 8080)
});


