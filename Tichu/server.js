'use strict';
var path = require('path');
var serve = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Tichu = require('./src/Game').Tichu;
const { AzureStorage } = require('bgio-azure-storage');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const { addUserApi, generateCredentials, authenticateCredentials } = require('./src/UserAPI');


const database = new AzureStorage({
    client: BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING),
    container: 'games',
});


const server = Server({ games: [Tichu], db: database, generateCredentials, authenticateCredentials });

var staticPath = path.join(__dirname, '/');
server.app.use(serve(staticPath));
server.app.use(serve(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
addUserApi(server);

console.debug(`Server is running on port: ${process.env.PORT}`);
server.run({ port: process.env.PORT || 3000 });