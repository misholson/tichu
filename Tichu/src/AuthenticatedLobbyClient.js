import { LobbyClient } from 'boardgame.io/client';
import authService from './AuthService';
import { gameServer } from './ClientHelpers';

export class AuthenticatedLobbyClient {
    constructor(clientSettings) {
        this.lobbyClient = new LobbyClient({ ...clientSettings });
    }

    listMatches(game) {
        return this.lobbyClient.listMatches(game);
    }

    joinMatch(game, matchID, playerID) {
        if (this.canJoinGame(matchID)) {
            return Promise.resolve();
        }
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
        return this.lobbyClient.createMatch(game, data, this._getAuthInit());
    }

    leaveMatch(game, matchID) {
        return this.lobbyClient.leaveMatch(game, matchID, this.getMatchCredentials(matchID));
    }

    canJoinGame(matchID) {
        return !!this.getMatchCredentials(matchID);
    }

    _getAuthInit(init) {
        if (!authService.token) {
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


    setMatchCrendentials(matchID, playerID) {
        window.localStorage.setItem(`match-${matchID}`, playerID);
    }

    getMatchCredentials(matchID) {
        var playerID = window.localStorage.getItem(`match-${matchID}`);
        if (playerID) {
            return {
                credentials: authService.getJwt(),
                playerID
            };
        }

        return null;
    }

    isInGame(matchID) {
        return !!this.getMatchCredentials(matchID);
    }
}

var lobbyClient = new AuthenticatedLobbyClient({ server: gameServer });

export default lobbyClient;