import jwt from 'jsonwebtoken';

export class AuthService {
    constructor() {
        this.jwt = window.localStorage.getItem('id_token');
        if (this.jwt) {
            this.token = jwt.decode(this.jwt);
        }
        this.logoutMethods = {};
    }

    onSignIn(token) {
        window.localStorage.setItem('id_token', token.idToken);
    }

    logout() {
        window.localStorage.removeItem('id_token');
        switch (this.token.iss) {
            case "accounts.google.com":
                this.logoutMethods.google();
                break;
        }
        this.jwt = null;
        this.token = null;
    }

    addLogoutProvider(provider, triggerLogout) {
        this.logoutMethods[provider] = triggerLogout;
    }

    isAuthenticated() {
        return !!this.jwt;
    }

    getJwt() {
        return this.jwt;
    }

    getDisplayName() {
        return this.token?.given_name;
    }

    getUserID() {
        return this.token?.email;
    }
}

const authService = new AuthService();

export default authService;