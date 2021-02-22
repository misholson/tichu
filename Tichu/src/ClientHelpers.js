import React, { useContext, useMemo } from 'react';
const { getPlayerIDs } = require('./Helpers');
import { constants } from './Constants';

const getGameServer = () => {
    var gameServer = `${window.location.protocol}//${window.location.hostname}`;
    if (window.location.port && window.location.port !== ' ') {
        gameServer += `:${window.location.port}`;
    }

    return gameServer;
}

const getLobbyServer = () => {
    return getGameServer();
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

export const GameContext = React.createContext({
    matchData: null,
    playerID: null,
    G: null,
    ctx: null
});

export const usePlayerMetadata = (playerID) => {
    var gameContext = useContext(GameContext);

    if (!playerID) {
        playerID = gameContext.playerID;
    }

    // Generate the player data that doesn't change
    return useMemo(() => {
        var playerIDs = getPlayerIDs(gameContext.ctx, playerID);

        var playerMetadata = {};

        var thisPlayer = {
            id: playerID,
            position: "self",
            name: getPlayerName(playerID, gameContext.matchData),
            isActive: gameContext.ctx.phase === constants.phases.playTrick.name && playerID === gameContext.ctx.currentPlayer
        }

        playerMetadata["self"] = thisPlayer;
        playerMetadata[playerID] = thisPlayer;

        Object.keys(playerIDs).forEach((position) => {
            var player = {
                id: playerIDs[position],
                position: position,
                name: getPlayerName(playerIDs[position], gameContext.matchData),
                isActive: gameContext.ctx.phase === constants.phases.playTrick.name && playerIDs[position] === gameContext.ctx.currentPlayer
            };

            playerMetadata[position] = player;
            playerMetadata[playerIDs[position]] = player;

        });

        return playerMetadata;
    }, [playerID]);

}