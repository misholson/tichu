import jwt from 'jsonwebtoken';

export class AuthService {
    constructor() {
        this.jwt = window.localStorage.getItem('id_token');
        if (this.jwt) {
            this.token = jwt.decode(this.jwt);
        }
        this.logoutMethods = {};
        this._callbacks = [];
        this._nextSubscriptionId = 0;
    }

    onSignIn(token) {
        window.localStorage.setItem('id_token', token.idToken);
        this.jwt = token.idToken;
        this.token = jwt.decode(this.jwt);
        this.notifySubscribers();
    }

    logout() {
        window.localStorage.removeItem('id_token');
        //switch (this.token.iss) {
        //    case "accounts.google.com":
        //        this.logoutMethods.google();
        //        break;
        //}
        this.jwt = null;
        this.token = null;
        this.notifySubscribers();
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

    subscribe(callback) {
        this._callbacks.push({ callback, subscription: this._nextSubscriptionId++ });
        return this._nextSubscriptionId - 1;
    }

    unsubscribe(subscriptionId) {
        const subscriptionIndex = this._callbacks
            .map((element, index) => element.subscription === subscriptionId ? { found: true, index } : { found: false })
            .filter(element => element.found === true);
        if (subscriptionIndex.length !== 1) {
            throw new Error(`Found an invalid number of subscriptions ${subscriptionIndex.length}`);
        }

        this._callbacks.splice(subscriptionIndex[0].index, 1);
    }

    notifySubscribers() {
        for (let i = 0; i < this._callbacks.length; i++) {
            const callback = this._callbacks[i].callback;
            callback();
        }
    }
}

const authService = new AuthService();

export default authService;