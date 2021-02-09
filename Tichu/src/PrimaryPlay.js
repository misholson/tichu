const { INVALID_MOVE } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { Stage } = require('boardgame.io/core');
const { detectPlayType, validPlays } = require('./ValidPlays');

function onHandStart(G, ctx) {
    console.debug("onHandStart");
}

function onTurnBegin(G, ctx) {
    console.debug(`Turn of ${ctx.currentPlayer} is beginning.`)
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

function playCards(G, ctx, cards) {
    console.debug(`player ${ctx.currentPlayer} playing cards ${JSON.stringify(cards)}`);

    if (!cards || cards.length === 0 || cards.length > 14) {
        console.debug("Invalid cards array");
        return INVALID_MOVE;
    }

    var type;
    if (G.currentTrick) {
        type = G.currentTrick.type;
    }

    if (!type) {
        type = detectPlayType(cards);
    }

    console.debug(`Detected play type: ${type}`);

    var playType = validPlays[type];

    if (!playType.isValid(cards, G.currentTrick)) {
        console.debug(`Invalid play`);
        return INVALID_MOVE;
    }

    if (!G.currentTrick) {
        console.debug(`Creating trick of type: ${type.name}`);
        G.currentTrick = {
            type: type,
            plays: []
        };
    }

    console.debug(`Adding play to current trick`);
    G.currentTrick.plays.unshift({
        cards: cards,
        player: ctx.currentPlayer
    });

    console.debug(`Removing cards from player hand`);
    cards.forEach((c) => removeFromHand(G.players[ctx.currentPlayer].hand, c));
    G.public.players[ctx.currentPlayer].cards = G.players[ctx.currentPlayer].hand.length;
    if (G.public.players[ctx.currentPlayer].cards === 0) {
        G.public.players.out = true;
        // TODO: Manage what happens when a player goes out.
    }
}

module.exports = {
    onHandStart: onHandStart,
    onTurnBegin: onTurnBegin,
    findStartPlayer: findStartPlayer,
    playCards: playCards
}