'use strict';
var path = require('path');
var express = require('express');
var serve = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Tichu = require('./src/Game').Tichu;
const { AzureStorage } = require('bgio-azure-storage');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const { jwt } = require('jsonwebtoken');


const database = new AzureStorage({
    client: BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING),
    container: 'games',
});

const generateCredentials = async ctx => {
    const authHeader = ctx.request.headers['authorization'];
    console.debug(authHeader);
    return "creds";
}

const authenticateCredentials = async (credentials, playerMetadata) => {
    if (credentials) {
        const token = await jwtVerify(jwt, process.env.GOOGLE_CLIENT_SECRET, {
            issuer: 'accounts.google.com',
            audience: process.env.GOOGLE_CLIENT_ID
        })
        if (token.uid === playerMetadata.credentials) return true;
    }
    return false;
}

const server = Server({ games: [Tichu], db: database, generateCredentials, authenticateCredentials });

var staticPath = path.join(__dirname, '/');
server.app.use(serve(staticPath));
server.app.use(serve(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')))

console.debug(`Server is running on port: ${process.env.PORT}`);
server.run({ port: process.env.PORT || 3000 });