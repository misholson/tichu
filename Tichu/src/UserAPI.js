
const { OAuth2Client } = require('google-auth-library');
const koaBody = require('koa-body');

const usernameDb = {};
const usernameIndex = {};

const getUsername = async (userID) => {
    return usernameDb[userID];
}

const getIdByUsername = async (username) => {
    return usernameIndex[username];
}

const setUsername = async (userID, newUsername, userSelected = true) => {
    if (userSelected && newUsername.contains("@")) {
        throw new Error("User-selected usernames cannot contain '@' character");
    }
    var existingUsernameOwner = getIdByUsername(newUsername);
    if (existingUsernameOwner) {
        if (existingUsernameOwner === userID) {
            // Whatever, it's already this user's username.
            return;
        } else {
            throw new Error("Username is taken");
        }
    }

    var oldUsername = getUsername(userID);
    delete usernameIndex[oldUsername];
    usernameIndex[newUsername] = userID;
    usernameDb[userID] = newUsername;
}

// Validate a google JWT id_token
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwtVerify = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token
    });
    return ticket.getPayload();
}

const addUserApi = (server) => {
    try {
        server.app.use(async (ctx, next) => {
            try {
                const authHeader = ctx.request.headers['authorization'];
                var token = await jwtVerify(authHeader);
                ctx.state.authToken = token;
                ctx.state.isAuthenticated = true;
                if (!getUsername(token.email)) {
                    // On user's first login, set their display username.
                    setUsername(token.email, token.email, true);
                }
            } catch (e) {
                ctx.state.isAuthenticated = false;
            }

            await next();
        });
        server.router.post('/users/changeusername/:newusername', (ctx) => {
            console.log(ctx.request.body);
            if (ctx.state.isAuthenticated) {
                var userID = ctx.state.authToken.email;
                setUsername(userID, ctx.params.newusername);
            }
        });
        server.router.get('/users/getusername', (ctx, next) => {
            ctx.body = {
                userid: "mish.olson@gmail.com"
            }
        });
    } catch (e) {
        console.error("Error adding api: " + e);
    }
}



// Generate credentials based on the JWT token in the authorization header.
// Returns the user's e-mail address as the credential.
const generateCredentials = async ctx => {
    if (!ctx.state.isAuthenticated) {
        throw new Error("User is not authenticated.");
    }

    var token = ctx.state.authToken;
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

module.exports = {
    addUserApi,
    generateCredentials,
    authenticateCredentials
}