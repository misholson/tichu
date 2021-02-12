const { INVALID_MOVE, TurnOrder } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { Stage } = require('boardgame.io/core');
const { detectPlayType, validPlays, canPass } = require('./ValidPlays');

function onHandStart(G, ctx) {
    console.debug("onHandStart");
}

function onTurnBegin(G, ctx) {
    console.debug(`Turn of ${ctx.currentPlayer} is beginning.`);

    if (G.currentTrick && G.currentTrick.plays && G.currentTrick.plays.length > 0) {
        console.log(G.currentTrick);
        // If the most recent play was done by the current player, then the player takes all the cards in the current
        // trick into their tricks, and current trick is cleared.
        if (G.currentTrick.plays[0].player === ctx.currentPlayer) {
            console.debug(`player ${ctx.currentPlayer} has won the trick`);
            // Give the current player the cards in the trick.

            // TODO: Deal with giving away the dragon by sending the player to a "give away dragon" stage.

            clearTable(G, ctx.currentPlayer);

            // Clear the current trick. It remains the current players hand.
            console.debug(`ending the turn of player ${ctx.currentPlayer}`);
            G.currentTrick = null;
            ctx.events.endTurn();

        }
    }

    if (G.players[ctx.currentPlayer].hand.length === 0) {
        // If player is out, skip their turn.
        ctx.events.endTurn();
    }
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

    // Handle dog logic.
    if (type === "dog") {
        var nextPlayer = getPartnerID(ctx, ctx.currentPlayer);
        console.debug(`dog played, passing turn to player ${nextPlayer}`);
        ctx.events.endTurn({ next: (ctx.playOrderPos + 2) % 4 });
    } else {
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
    }

    console.debug(`Removing cards from player hand`);
    cards.forEach((c) => removeFromHand(G.players[ctx.currentPlayer].hand, c));
    G.public.players[ctx.currentPlayer].cards = G.players[ctx.currentPlayer].hand.length;

    var publicPlayerInfo = G.public.players[ctx.currentPlayer];
    if (publicPlayerInfo.cards === 0) {
        publicPlayerInfo.out = true;
        publicPlayerInfo.outOrder = countOutPlayers(G, ctx);
    }
}

function getPartnerID(ctx, playerID) {
    var playerIndex = ctx.playOrder.findIndex((pId) => pId === playerID);
    var partnerIndex = (playerIndex + 2) % 4;
    return ctx.playOrder[partnerIndex];
}

function primaryPlayEndIf(G, ctx) {
    return countOutPlayers(G, ctx) === 3;
}

function pass(G, ctx) {
    // Put this in here in case the logic to auto-pass when are out isn't working right.
    var hand = G.players[ctx.currentPlayer].hand;
    if (hand.length === 0) { return true; }

    if (!canPass(hand, G.currentTrick)) {
        console.debug(`Invalid move: Player ${ctx.currentPlayer} tried to pass on the first play of a trick`);
        return INVALID_MOVE;
    }
    console.debug(`Player ${ctx.currentPlayer} passes`);
}

function clearTable(G, receivingPlayerID) {
    var player = G.players[receivingPlayerID];

    if (!G.currentTrick || !G.currentTrick.plays || G.currentTrick.plays.length === 0) {
        return;
    }

    player.cardsWon = player.cardsWon || [];
    G.currentTrick.plays.forEach((play) => {
        play.cards.forEach((card) => player.cardsWon.push(card));
    });
}

function countOutPlayers(G, ctx) {
    var outPlayerCount = 0;
    for (var i = 0; i < ctx.numPlayers; i++) {
        if (G.public.players[i].out) {
            outPlayerCount++;
        }
    }

    return outPlayerCount;
}

function primaryPlayOnEnd(G, ctx) {
    // Count score.
}

function primaryPlayTurnEndIfOut(G, ctx) {
    // If the current player is out, play proceeds in regular turn order.
    console.debug(`Player ${ctx.currentPlayer} hand length is ${G.players[ctx.currentPlayer].hand.length}`);
    return G.players[ctx.currentPlayer].hand.length === 0;
}

const primaryPlay = {
    onBegin: onHandStart,
    turn: {
        onEnd: (G, ctx) => { console.debug(`Turn of ${ctx.currentPlayer} is ending`) },
        onBegin: onTurnBegin,
        endIf: primaryPlayTurnEndIfOut,
        order: {
            ...TurnOrder.DEFAULT,
            first: findStartPlayer
        },
        moveLimit: 1
    },
    moves: {
        playCards: playCards,
        pass: pass
    },
    endIf: primaryPlayEndIf,
    onEnd: primaryPlayOnEnd,
    next: constants.phases.preHand.name,
};

module.exports = {
    primaryPlay: primaryPlay
}