const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { Stage } = require('boardgame.io/core');

function onHandStart(G, ctx) {
    console.debug("onHandStart");
}

function onTurnBegin(G, ctx) {
    console.debug(`Turn of ${ctx.currentPlayer} is beginning. Looking for start player: ${G.lookingForStartPlayer}`)
}

function findStartPlayer(G, ctx) {
    console.debug(`finding start player at the beginning of phase ${ctx.phase}`)
    for (var i = 0; i < ctx.playOrder.length; i++) {
        var playerID = ctx.playOrder[i];
        console.debug(`checking hand of player: ${playerID}`);
        console.log(G.players[playerID].hand)
        if (G.players[playerID].hand.some((cardID) => cardID === constants.specials.mahjong)) {
            console.debug(`mahjong is in the hand of player ${playerID}. Current player: ${ctx.currentPlayer}`);
            return i;
        }
    }
}

module.exports = {
    onHandStart: onHandStart,
    onTurnBegin: onTurnBegin,
    findStartPlayer: findStartPlayer
}