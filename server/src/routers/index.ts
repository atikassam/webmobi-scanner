import * as express from 'express';
import { _CLIENTS_ } from "../controller/clients";

export const routers = express.Router();

// Download the application
routers.get('/download/app', (req, res)=> {
    res.sendFile('G:\\MyProjects\\webmobi-scanner\\mobile\\scanner\\platforms\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk');
});

/**
 * Here we verify a client request and create a client
 * instance for that client and response back
 * the client instance id
 */
routers.get('/request/token/', (req, res)=> {
    console.log(req.cookies);
    let id = req.cookies.id;
    let client = _CLIENTS_.client(id);

    console.log(client.id);
    res.cookie('id', client.id);
    res.json({ token: client.token });
    // res.json({ token: { token: client.token, url: `http://${_IPV4_}:${_PORT_}`} });
});

/**
 * For any other request send 404
 */
routers.use((req, res) => {
    res.status(404);
    res.send('Invalid path');
});