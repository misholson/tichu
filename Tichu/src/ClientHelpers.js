

const getGameServer = () => {
    var gameServer = `${window.location.hostname}`;
    if (window.location.port && window.location.port !== ' ') {
        gameServer += `:${window.location.port}`;
    }

    return gameServer;
}

const getLobbyServer = () => {
    return `${window.location.protocol}//${getGameServer()}`;
}

export const gameServer = getGameServer();
export const lobbyServer = getLobbyServer();

export const getPlayerName = (playerID, matchData) => {
    var playerName = `Player ${playerID}`;
    if (matchData) {
        var playerNum = parseInt(playerID);
        var playerInfo = Object.values(matchData).find(playerInfo => playerInfo.id === playerNum);
        if (playerInfo) {
            playerName = playerInfo.name;
        }
    }

    return playerName;
}