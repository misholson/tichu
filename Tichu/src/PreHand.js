const { INVALID_MOVE } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs, dealCards } = require('./Helpers');
const { constants } = require('./Constants');

function callGrand(G, ctx, playerID) {
    G.public.players[playerID].tichu = true;
    G.public.players[playerID].grand = true;
    return takeCards(G, ctx, playerID);
}

function takeCards(G, ctx, playerID) {
    // Take 6 more cards.
    for (var i = 0; i < 6; i++) {
        G.players[playerID].hand.push(G.secret.deck.pop());
    }
    sortCards(G.players[playerID].hand);
    G.public.players[playerID].cards = G.players[playerID].hand.length;
    ctx.events.endStage();
}

function passCards(G, ctx, playerID, selectedCards) {
    // Check the player is on the passCards stage
    if (ctx.activePlayers[playerID] !== constants.phases.preHand.stages.passCards) {
        return INVALID_MOVE;
    }

    // Make sure they have selected three cards to pass.
    if (!selectedCards || selectedCards.length !== 3) {
        return INVALID_MOVE;
    }

    // Make sure all the cards they've selected are in their hand.
    var player = G.players[playerID];
    for (var i = 0; i < 3; i++) {
        if (!player.hand.some((c) => c === selectedCards[i])) {
            return INVALID_MOVE;
        }
    }

    var playerIDs = getPlayerIDs(ctx, playerID);

    // Remove the cards from your hand.
    selectedCards.forEach((c) => {
        player.hand = removeFromHand(player.hand, c);
    })

    // Pass cards to the other players
    executePass(G, playerIDs.left, playerID, selectedCards[0]);
    executePass(G, playerIDs.partner, playerID, selectedCards[1]);
    executePass(G, playerIDs.right, playerID, selectedCards[2]);

    ctx.events.endStage();
}

function executePass(G, receivingPlayerID, sendingPlayerID, cardID) {
    var receivingPlayer = G.players[receivingPlayerID];
    receivingPlayer.receivedPass = receivingPlayer.receivedPass || {};
    receivingPlayer.receivedPass[sendingPlayerID] = cardID;
}

function checkPlayersHavePassed(G, ctx) {
    console.debug(`Checking players have passed.`);

    // onMove runs on all stages, so make sure that all players are in the passCards or waitForPass stage before really checking this.
    if (!Object.values(ctx.activePlayers).every((stage) => stage === constants.phases.preHand.stages.passCards || stage === constants.phases.preHand.stages.waitForPass)) {
        console.debug("All players must be in the passCards or waitForPass stage before checking if pass is complete.");
        return;
    }

    var allPassed = ctx.playOrder.every((playerID) => {
        // Make sure we have received some passes.
        console.log(G.players[playerID])
        var player = G.players[playerID];
        //console.log(player);
        var receivedPass = player.receivedPass;
        console.log(receivedPass);
        if (!receivedPass) {
            console.debug(`checkPlayersHavePassed: Player ${playerID} id has received no cards`);
            return false;
        }

        // Make sure we have received a pass from every player.
        var playerIDs = getPlayerIDs(ctx, playerID);
        if (!(receivedPass[playerIDs.left] >= 0)) {
            console.debug(`checkPlayersHavePassed: Player ${playerIDs.left} (left) has not passed to player ${playerID}`)
            return false;
        }
        if (!(receivedPass[playerIDs.partner] >= 0)) {
            console.debug(`checkPlayersHavePassed: Player ${playerIDs.partner} (partner) has not passed to player ${playerID}`)
            return false;
        }
        if (!(receivedPass[playerIDs.right] >= 0)) {
            console.debug(`checkPlayersHavePassed: Player ${playerIDs.right} (right) has not passed to player ${playerID}`)
            return false;
        }

        return true;
    });
    console.debug(`allPassed: ${allPassed}`)
    if (allPassed) {
        console.debug("Setting stage to accept pass.");
        ctx.events.setActivePlayers({ all: constants.phases.preHand.stages.acceptPass });
    }
}

function acceptPass(G, ctx, playerID) {
    console.debug("acceptPass");
    var player = G.players[playerID];

    // Integrate the received cards into your hand.
    Object.values(player.receivedPass).forEach((card) => { player.hand.push(card); });
    sortCards(player.hand);

    // Update the number of cards the player has in their hand.
    G.public.players[playerID].cards = 14;

    // Note that the player is ready to play.
    G.public.players[playerID].readyToPlay = true;

    if (Object.values(G.public.players).every((publicPlayerData) => publicPlayerData.readyToPlay)) {
        console.debug("All players have accepted their pass. Ending phase.");
        console.debug("\n------- End Pre-Hand -------\n");
        console.debug("\n---------- Begin Playing Tricks ----------\n");
        ctx.events.endPhase();
    }
}

const preHand = {
    onBegin: (G, ctx) => {
        console.debug("\n-------------- Begin Hand --------------\n");
        console.debug("\n------- Begin Pre-Hand -------\n");
        G.secret.deck = ctx.random.Shuffle(generateDeck(56));
        dealCards(G, 8);
        ctx.events.setActivePlayers({ all: constants.phases.preHand.stages.takeOrGrand });
        return G;
    },
    turn: {
        stages: {
            takeOrGrand: {
                moves: {
                    callGrand: callGrand,
                    takeCards: takeCards
                },
                next: constants.phases.preHand.stages.passCards
            },
            passCards: {
                moves: {
                    passCards: passCards
                },
                next: constants.phases.preHand.stages.waitForPass
            },
            waitForPass: {
                next: constants.phases.preHand.stages.acceptPass
            },
            acceptPass: {
                moves: {
                    acceptPass: acceptPass
                }
            }
        },
        onMove: checkPlayersHavePassed
    },
    next: constants.phases.playTrick.name,
    start: true
};

function generateDeck(size) {
    var deck = [];
    for (var i = 0; i < size; i++) {
        deck.push(i);
    }

    return deck;
}

module.exports = {
    preHand: preHand
}