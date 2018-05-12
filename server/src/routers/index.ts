import * as express from 'express';
import { _CLIENTS_ } from "../controller/clients";

declare let _IPV4_;
declare let _PORT_;
export const routers = express.Router();
routers.get('/download/app', (req, res)=> {
    res.sendFile('G:\\MyProjects\\webmobi-scanner\\mobile\\scanner\\platforms\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk');
});

routers.get('/request/token/', (req, res)=> {
    console.log(req.cookies);
    let id = req.cookies.id;
    let client = _CLIENTS_.client(id);

    console.log(client.id);
    res.cookie('id', client.id);
    res.json({ token: client.token });
    // res.json({ token: { token: client.token, url: `http://${_IPV4_}:${_PORT_}`} });
});


routers.use((req, res) => {
    res.status(404);
    res.send('Invalid path');
});