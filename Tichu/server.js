'use strict';
var path = require('path');
var express = require('express');
var serve = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Tichu = require('./src/Game').Tichu;


//var app = express();

//var staticPath = path.join(__dirname, '/');
//app.use(express.static(staticPath));

//// Allows you to set port in the project properties.
//app.set('port', process.env.PORT || 3000);

//var server = app.listen(app.get('port'), function () {
//    console.log('listening');
//});


const server = Server({ games: [Tichu] });

var staticPath = path.join(__dirname, '/');
server.app.use(serve(staticPath));
server.app.use(serve(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')))

server.run(process.env.PORT || 3000);