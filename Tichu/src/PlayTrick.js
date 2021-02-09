const { INVALID_MOVE, TurnOrder } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { Stage } = require('boardgame.io/core');
const { detectPlayType, validPlays, canPass, getPreviousPlay } = require('./ValidPlays');
const { cardDefinitions } = require('./Deck');

function onPhaseBegin(G, ctx) {
    console.debug("");
    console.debug("------Begin Trick------");
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
        newIndex = findNextPlayerNotOut(G, ctx, newIndex);
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
            nextPlayerPos = (nextPlayerPos + 1) % ctx.numPlayers;
            console.debug(`Player ${ctx.playOrder[ctx.playOrderPos]} played the dog, so play moves to player ${ctx.playOrder[nextPlayerPos]}`)
        }
    }

    // Find the next player who's not out.
    nextPlayerPos = findNextPlayerNotOut(G, ctx, nextPlayerPos);

    console.debug(`Next player will be ${ctx.playOrder[nextPlayerPos]}`);
    return nextPlayerPos;
}
function findNextPlayerNotOut(G, ctx, nextPlayerPos) {

    // If the next player has no cards, go one player further. Do this in a for loop so if there's a bug and
    // all four players are out we don't see an infinite loop.
    for (var i = 0; i < ctx.numPlayers && G.players[ctx.playOrder[nextPlayerPos]].hand.length === 0; i++) {
        console.debug(`Player ${ctx.playOrder[nextPlayerPos]} has no cards, so play moves to player ${ctx.playOrder[(nextPlayerPos + 1) % ctx.numPlayers]}`);
        nextPlayerPos = (nextPlayerPos + 1) % ctx.numPlayers;
    }

    return nextPlayerPos;
}

function onTurnBegin(G, ctx) {
    console.debug(`Turn of ${ctx.currentPlayer} is beginning.`);

    //if (G.players[ctx.currentPlayer].hand.length === 0) {
    //    // If player is out, skip their turn.
    //    console.debug(`Ending turn of ${ctx.currentPlayer} since they do not have any cards`);
    //    ctx.events.endTurn();
    //}

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
        console.debug(`Creating trick of type: ${type}`);
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
    if (winner) {
        var playerOutCount = countOutPlayers(G, ctx);
        if (playerOutCount >= 3) {
            console.debug(`3 players are out. Hand will end.`);
            return {
                next: constants.phases.preHand.name
            };
        } else {
            console.debug(`Trick will end with ${playerOutCount} players out. Winner is ${winner}`);
            return {
                next: constants.phases.playTrick.name
            };
        }
    }

    return false;
}

function findTrickWinner(G, ctx) {
    // Basic logic here is that if the player who most recently played cards is the current player, then everyone else passed
    // and the current player is the winner.

    // The logic can't be that simple here, because the framework calls phase endIf at the
    // beginning and end of the turn, so right after you play this function gets called and it looks like you've won the trick

    // However, if the first card in the history is a pass it means we've had at least one other person play and got back to you.

    if (G.currentTrick && G.currentTrick.plays && G.currentTrick.plays.length > 0) {
        // There needs to be at least one pass in the history, and the previous play must have been played by the current player.
        if (G.currentTrick.plays[0].pass) {
            // We need to check for pass because the framework checks trickEndIf at the beginning and end of your turn.
            var previousPlay = getPreviousPlay(G.currentTrick);
            if (previousPlay.player === ctx.currentPlayer) {
                var winner = previousPlay.player;
                console.debug(`Checking for trick end. ${winner} is the winner`);
                return winner;
            }
        }
        //// If all but one player has passed, that player wins.
        ////var outCount = countOutPlayers(G, ctx);
        //var trickOver = true;
        //var i;
        //for (i = 0; i < ctx.numPlayers - 1; i++) {
        //    // If we find a player who hasn't passed, the trick isn't over.
        //    if (!G.currentTrick.plays[i].pass) {
        //        trickOver = false;
        //        break;
        //    }
        //}

        //if (trickOver) {
        //    var winner = G.currentTrick.plays[i].player;
        //    console.debug(`Checking for trick end. ${i} players have passed. ${winner} is the winner`);
        //    return winner;
        //}
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
    console.debug("------End Trick------\n");
    console.debug("------Begin Cleanup------\n");
    console.debug(`Cleaning up trick. Winner: ${winner}`);
    if (winner) {
        // TODO: Deal with giving away the dragon by sending the player to a "give away dragon" stage.
        G.currentTrick.winner = winner;
        clearTable(G, winner);

        // Save off the current trick to the log of previous tricks.
        G.previousTricks = G.previousTricks || [];
        G.previousTricks.unshift(G.currentTrick);

        var nextPhase = constants.phases.playTrick.name;

        var playerOutCount = countOutPlayers(G, ctx);
        if (playerOutCount === 3) {
            console.debug("\n---------- End Playing Tricks ----------\n");

            // Set the out order of the last player.
            Object.values(G.public.players).find(player => !player.out).outOrder = 4;

            // Count score
            console.debug("Counting score");
            updateScore(G, ctx);

            nextPhase = constants.phases.preHand.name;
            console.debug("\n-------------- End Hand --------------\n");
        } else {
            console.debug(`There are ${playerOutCount} players out`);
            console.debug("------End Cleanup------\n");
        }

        // Clear the current trick. It remains the current players hand.
        G.currentTrick = null;

        //console.debug(`Setting next phase to ${nextPhase}`);
        //ctx.events.setPhase(nextPhase);
    } else {
        console.error("No winner was detected even though the trick is over");
    }
}

function turnEndIf(G, ctx) {
    // If the current player is out, play proceeds in regular turn order.
    console.debug(`Player ${ctx.currentPlayer} hand length is ${G.players[ctx.currentPlayer].hand.length}`);
    return G.players[ctx.currentPlayer].hand.length === 0;
}

function updateScore(G, ctx) {
    if (G && G.score) {
        // Give last player out tricks to first player out, cards to opponent.
        var lastPlayerIndex = ctx.playOrder.findIndex((pId) => !G.public.players[pId].out);
        var lastPlayerID = ctx.playOrder[lastPlayerIndex];
        var opponentPlayerID = ctx.playOrder[(lastPlayerIndex + 1) % ctx.numPlayers];
        var firstOutPlayerID = Object.keys(G.public.players).find(pId => G.public.players[pId].outOrder === 1);

        // Give last player tricks to the first out.
        if (G.players[lastPlayerID].cardsWon) {
            G.players[firstOutPlayerID].cardsWon = G.players[firstOutPlayerID].cardsWon || [];
            moveCardsBetweenArrays(G.players[lastPlayerID].cardsWon, G.players[firstOutPlayerID].cardsWon);
        }

        // Give last player hand to an opponent.
        if (G.players[lastPlayerID].hand) {
            G.players[opponentPlayerID].cardsWon = G.players[opponentPlayerID].cardsWon || [];
            moveCardsBetweenArrays(G.players[lastPlayerID].hand, G.players[opponentPlayerID].cardsWon);
        }

        // Setup the score for this round.
        var roundScore = {};
        for (var i = 0; i < ctx.numPlayers; i++) {
            roundScore[ctx.playOrder[i]] = 0;
        }

        // Count score for this round.
        if (isOneTwo(ctx.playOrder[0])) {
            G.roundScore[ctx.playOrder[0]] = 200;
        } else if (isOneTwo(ctx.playOrder[1])) {
            G.roundScore[ctx.playOrder[1]] = 200;
        } else {
            for (var j = 0; j < ctx.numPlayers; j++) {
                var playerID = ctx.playOrder[j];
                var cardsWon = G.players[playerID].cardsWon;

                roundScore[playerID] = cardsWon.reduce((totalScore, cardID) => { totalScore + score(cardID) });
            }
        }

        // Process tichus
        for (var k = 0; k < ctx.numPlayers; k++) {
            var playerIDt = ctx.playOrder[k];

            var player = G.public.players[playerIDt];

            if (player.tichu) {
                var bet = 100;
                if (player.grand) { bet = 200; }

                if (player.outOrder === 1) {
                    roundScore[playerIDt] += bet;
                } else {
                    roundScore[playerIDt] -= bet;
                }
            }
        }

        // Clear out cards won
        Object.values(G.players).forEach((player) => {
            player.cardsWon = [];
        });

        // Clear out public data as well.
        Object.values(G.public.players).forEach((publicData) => {
            publicData.cards = 0;
            publicData.tichu = false;
            publicData.grand = false;
        });

        // Store the new score.
        G.scoreHistory.unshift(roundScore);

        // Calculate it into the global score.
        Object.keys(G.score).forEach((pId) => {
            G.score[pId] += roundScore[pId];
        });
    }
}

function isOneTwo(G, playerID) {
    return false;
}

function score(cardID) {
    return cardDefinitions[cardID].score;
}

function moveCardsBetweenArrays(fromArray, toArray) {
    while (fromArray.length > 0) {
        var element = fromArray.pop();
        toArray.push(element);
    }
}

const playTrick = {
    onBegin: onPhaseBegin,
    turn: {
        //onEnd: (G, ctx) => { console.debug(`Turn of ${ctx.currentPlayer} is ending`) },
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
    onEnd: onTrickEnd
};

module.exports = {
    playTrick: playTrick
}