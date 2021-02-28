import { LobbyClient } from 'boardgame.io/client';
import authService from './AuthService';

export class AuthenticatedLobbyClient {
    constructor(clientSettings) {
        this.lobbyClient = new LobbyClient({ ...clientSettings });
    }

    listMatches(game) {
        return this.lobbyClient.listMatches(game);
    }

    joinMatch(game, matchID, playerID) {
        return this.lobbyClient.joinMatch(game, matchID, {
            playerID: playerID,
            playerName: authService.getDisplayName(),
            data: {
                userID: authService.getUserID()
            }
        }, this._getAuthInit())
            .then(() => {
                this.setMatchCrendentials(matchID, playerID);
            });
    }

    createMatch(game, data) {
        return this.lobbyClient.createMatch(game, data, this._getAuthInit(init));
    }

    leaveMatch(game, matchID, playerCredentials) {
        return this.lobbyClient.leaveMatch(game, matchID, playerCredentials);
    }


    _getAuthInit(init) {
        if (!this.token) {
            return init;
        }

        if (!init) {
            init = {
                headers: {}
            };
        }

        return {
            ...init,
            headers: {
                ...init.headers,
                'Authorization': authService.getJwt()
            }
        };
    }


    static setMatchCrendentials(matchID, playerID) {
        window.localStorage.setItem(`match-${matchID}`, playerID);
    }

    static getMatchCredentials(matchID) {
        var playerID = window.localStorage.getItem(`match-${matchID}`);
        return {
            credentials: this.jwt,
            playerID
        };
    }
}