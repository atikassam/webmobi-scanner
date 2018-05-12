import * as http from 'http';
import * as express from 'express';
import * as io from 'socket.io';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { routers } from "./routers";
import { handler } from "./socket";

const http_engine = express();
const server = (<any>http).Server(http_engine);
const socket_engine = io(server);

// Use cors to enable cross origin access
http_engine.use(cors({ origin: '*' }));

// Public directory for static file like example, welcome page
http_engine.use(express.static(__dirname+'/public'));

// Cookies parsing middleware
http_engine.use(cookieParser());

// Add routers
http_engine.use('/', routers);

// Using two different namespaces for mobile and web;
socket_engine.of('/mobile').use(handler('mobile'));
socket_engine.of('/web', ).use(handler('web'));


server.listen(8080, () => {
    console.log('Server listening on port: ', 8080)
});


