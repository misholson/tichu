const { INVALID_MOVE, TurnOrder } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { Stage } = require('boardgame.io/core');
const { detectPlayType, validPlays, canPass, getPreviousPlay } = require('./ValidPlays');

function onPhaseBegin(G, ctx) {
    console.debug("Begin Trick by clearing out G.currentTrick");
    G.currentTrick = null;
}

function findStartPlayer(G, ctx) {
    console.debug(`Finding trick start player. G.currentTrick: ${JSON.stringify(G.currentTrick)}`);
    if (!G.previousTricks || G.previousTricks.length === 0) {
        // If there are no previous tricks in this hand, find the player with the mahjong.
        console.debug(`finding the start player for this hand`)
        for (var i = 0; i < ctx.playOrder.length; i++) {
            var playerID = ctx.playOrder[i];
            console.debug(`checking hand of player: ${playerID}`);
            console.log(G.players[playerID].hand)
            if (G.players[playerID].hand.some((cardID) => cardID === constants.specials.mahjong)) {
                console.debug(`mahjong is in the hand of player ${playerID}. Current player: ${ctx.currentPlayer}`);
                return i;
            }
        }
    } else {
        // Find the player who won the previous trick.
        var newStartPlayer = G.previousTricks[0].winner;
        var newIndex = ctx.playOrder.findIndex(pId => pId === newStartPlayer);
        console.debug(`Previous trick winner was ${newStartPlayer} at position ${newIndex}`);
        return newIndex;
    }
}

function findNextPlayer(G, ctx) {
    var previousPlay = getPreviousPlay(G.currentTrick);

    var nextPlayerPos = (ctx.playOrderPos + 1) % ctx.numPlayers;

    // If the previous play was the dog, go one player further.
    if (previousPlay) {
        if (previousPlay.cards.length === 1 && previousPlay.cards[0] === constants.specials.dog) {
            nextPlayerPos++;
        }
    }

    return nextPlayerPos;
}

function onTurnBegin(G, ctx) {
    console.debug(`Turn of ${ctx.currentPlayer} is beginning.`);

    if (G.players[ctx.currentPlayer].hand.length === 0) {
        // If player is out, skip their turn.
        ctx.events.endTurn();
    }

    var previousPlay = getPreviousPlay(G.currentTrick);

    // If the previous play was the dog, so clear out the trick before starting play.
    if (previousPlay) {
        if (previousPlay.cards.length === 1 && previousPlay.cards[0] === constants.specials.dog) {
            G.currentTrick = null;
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
    //if (type === "dog") {
    //    var nextPlayer = getPartnerID(ctx, ctx.currentPlayer);
    //    console.debug(`dog played, passing turn to player ${nextPlayer}`);
    //    ctx.events.endTurn({ next: (ctx.playOrderPos + 2) % 4 });
    //} else {
    //}

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
        player: ctx.currentPlayer,
        pass: false
    });

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

function pass(G, ctx) {
    // Put this in here in case the logic to auto-pass when are out isn't working right.
    if (G.players[ctx.currentPlayer].hand.length === 0) { return true; }

    if (!canPass(G.currentTrick)) {
        console.debug(`Invalid move: Player ${ctx.currentPlayer} tried to pass on the first play of a trick`);
        return INVALID_MOVE;
    }
    console.debug(`Player ${ctx.currentPlayer} passes`);
    G.currentTrick.plays.unshift({
        cards: [],
        player: ctx.currentPlayer,
        pass: true
    })
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

function trickEndIf(G, ctx) {
    // If the last player to play is also the current player.
    var winner = findTrickWinner(G, ctx);

    return !!winner;
}

function findTrickWinner(G, ctx) {
    if (G.currentTrick && G.currentTrick.plays && G.currentTrick.plays.length > 0) {
        // If all but one player has passed, that player wins.
        var trickOver = true;
        var i;
        for (i = 0; i < ctx.numPlayers - 1; i++) {
            // If we find a player who hasn't passed, the trick isn't over.
            if (!G.currentTrick.plays[i].pass) {
                trickOver = false;
                break;
            }
        }

        if (trickOver) {
            var winner = G.currentTrick.plays[i].player;
            console.debug(`Checking for trick end. ${i} players have passed. ${winner} is the winner`);
            return winner;
        }
    }

    return null;
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

function onTrickEnd(G, ctx) {
    var winner = findTrickWinner(G, ctx);
    console.debug(`Cleaning up trick. Winner: ${winner}`);
    if (winner) {
        // TODO: Deal with giving away the dragon by sending the player to a "give away dragon" stage.
        G.currentTrick.winner = winner;
        clearTable(G, winner);

        // Save off the current trick to the log of previous tricks.
        G.previousTricks = G.previousTricks || [];
        G.previousTricks.unshift(G.currentTrick);

        // Clear the current trick. It remains the current players hand.
        G.currentTrick = null;

        console.debug(`ending the trick.`);
        var nextPhase = constants.phases.playTrick.name;

        if (countOutPlayers(G, ctx) === 3) {
            // Count score

            nextPhase = constants.phases.preHand.name;
        }
        ctx.events.setPhase(nextPhase);
    }
}

function turnEndIf(G, ctx) {
    // If the current player is out, play proceeds in regular turn order.
    console.debug(`Player ${ctx.currentPlayer} hand length is ${G.players[ctx.currentPlayer].hand.length}`);
    return G.players[ctx.currentPlayer].hand.length === 0;
}

const playTrick = {
    onBegin: onPhaseBegin,
    turn: {
        onEnd: (G, ctx) => { console.debug(`Turn of ${ctx.currentPlayer} is ending`) },
        onBegin: onTurnBegin,
        endIf: turnEndIf,
        order: {
            ...TurnOrder.DEFAULT,
            first: findStartPlayer,
            next: findNextPlayer
        },
        moveLimit: 1
    },
    moves: {
        playCards: playCards,
        pass: pass
    },
    endIf: trickEndIf,
    onEnd: onTrickEnd,
    next: constants.phases.playTrick.name,
};

module.exports = {
    playTrick: playTrick
}