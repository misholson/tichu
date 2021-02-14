'use strict';
var path = require('path');
var express = require('express');
var serve = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Tichu = require('./src/Game').Tichu;


const server = Server({ games: [Tichu] });

const lobbyConfig = {
    apiPort: 8000,
    apiCallback: (...args) => console.log(`Running Lobby API on port 8000: ${JSON.stringify(args)}`)
};

var staticPath = path.join(__dirname, '/');
server.app.use(serve(staticPath));
server.app.use(serve(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')))

server.run({ port: process.env.PORT || 3000, lobbyConfig });