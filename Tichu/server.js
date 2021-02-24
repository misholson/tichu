'use strict';
var path = require('path');
var express = require('express');
var serve = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Tichu = require('./src/Game').Tichu;
const { AzureStorage } = require('bgio-azure-storage');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');



const database = new AzureStorage({
    client: BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING),
    container: 'games',
});


// Validate a google JWT id_token
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwtVerify = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token
     });
    return ticket.getPayload();
}

// Generate credentials based on the JWT token in the authorization header.
// Returns the user's e-mail address as the credential.
const generateCredentials = async ctx => {
    const authHeader = ctx.request.headers['authorization'];
    var token = await jwtVerify(authHeader);
    return token.email;
}

// Verify the login token passed in credentials, then make sure
// the user ID of that token matches the user ID stored as the player's credentials
const authenticateCredentials = async (credentials, playerMetadata) => {
    if (credentials) {
        const token = await jwtVerify(credentials);
        if (token.email === playerMetadata.credentials) return true;
    }
    return false;
}

const server = Server({ games: [Tichu], db: database, generateCredentials, authenticateCredentials });

var staticPath = path.join(__dirname, '/');
server.app.use(serve(staticPath));
server.app.use(serve(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')))

console.debug(`Server is running on port: ${process.env.PORT}`);
server.run({ port: process.env.PORT || 3000 });