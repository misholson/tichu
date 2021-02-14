const { INVALID_MOVE, TurnOrder, Stage } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
const { detectPlayType, validPlays, canPass, getPreviousPlay, rank, canFulfillWish } = require('./ValidPlays');
const { cardDefinitions } = require('./Deck');
const { isNumeric } = require('jquery');

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

    var currentPlayerPos = ctx.playOrderPos;
    if (G.currentTrick && G.currentTrick.plays && G.currentTrick.plays.length > 0) {
        var previousPlayerID = G.currentTrick.plays[0].player;
        currentPlayerPos = ctx.playOrder.findIndex((pID) => pID === previousPlayerID);
    }

    var nextPlayerPos = (currentPlayerPos + 1) % ctx.numPlayers;

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

    var previousPlay = getPreviousPlay(G.currentTrick);

    // If the previous play was the dog, so clear out the trick before starting play.
    if (previousPlay) {
        if (previousPlay.cards.length === 1 && previousPlay.cards[0] === constants.specials.dog) {
            G.currentTrick = null;
        }
    }

    ctx.events.setActivePlayers({ all: constants.phases.playTrick.stages.bomb });
}

function playCards(G, ctx, cards) {
    if (ctx.currentPlayer !== ctx.playerID) {
        console.debug(`Only current player ${ctx.currentPlayer} can play cards`);
        return INVALID_MOVE;
    }

    return playCardsCore(G, ctx, cards, ctx.currentPlayer);
}

function playCardsCore(G, ctx, cards, playerID) {
    console.debug(`player ${playerID} playing cards ${JSON.stringify(cards)}`);

    if (!cards || cards.length === 0 || cards.length > 14) {
        console.debug("Invalid cards array");
        return INVALID_MOVE;
    }

    var type = detectPlayType(cards);

    console.debug(`Detected play type: ${type}`);

    var playType = validPlays[type];

    if (G.currentTrick) {
        if (type !== G.currentTrick.type && !playType.isBomb) {
            console.debug(`Play type ${type} does not match current trick type ${G.currentTrick.type}`);
            return INVALID_MOVE;
        }
    }

    if (!playType.isValid(cards, G.currentTrick)) {
        console.debug(`Invalid play`);
        return INVALID_MOVE;
    }

    // Check if the player can fulfill a wish.
    if (G.wish) {
        if (canFulfillWish(G, ctx, playType)) {
            // The current player CAN play a wish. If a wish card is not in their selection then the move fails.
            if (!cards.some((cardID) => rank(cardID) === G.wish)) {
                console.debug(`Tried to play when it was possible to fulfill wish ${G.wish}`);
                console.debug(`Cards attempted to play: ${JSON.stringify(cards)} (ranks: ${JSON.stringify(cards.map((c) => rank(c)))})`);
                console.debug(`Possible wish play: ${JSON.stringify(bestWishPlay)} (ranks: ${JSON.stringify(bestWishPlay.map((c) => rank(c)))})`);
                return INVALID_MOVE;
            }
        }
    }

    if (!G.currentTrick) {
        console.debug(`Creating trick of type: ${type}`);
        G.currentTrick = {
            type: type,
            plays: []
        };
    } else if (playType.isBomb) {
        // If it's a bomb we should update the trick type.
        G.currentTrick.type = type;
    }

    console.debug(`Adding play to current trick`);
    G.currentTrick.plays.unshift({
        cards: [...cards],
        player: ctx.currentPlayer,
        pass: false
    });

    console.debug(`Removing cards from player hand`);
    cards.forEach((c) => removeFromHand(G.players[playerID].hand, c));
    G.public.players[playerID].cards = G.players[playerID].hand.length;

    var publicPlayerInfo = G.public.players[playerID];
    if (publicPlayerInfo.cards === 0) {
        publicPlayerInfo.out = true;
        publicPlayerInfo.outOrder = countOutPlayers(G, ctx);
    }

    // Clear the wish if it is fulfilled.
    if (G.wish >= 2 && cards.some((cID) => rank(cID) === G.wish)) {
        G.wish = null;
    }

    // If the play contains the mahjong, send the current player into the Wish stage.
    if (cards.some((cardID) => cardID === constants.specials.mahjong)) {
        console.debug("Setting current player stage to makeWish");
        ctx.events.setActivePlayers({
            currentPlayer: constants.phases.playTrick.stages.makeWish,
            moveLimit: 1
        })
    } else {
        ctx.events.endTurn();
    }
}

function makeWish(G, ctx, wish) {
    if (wish !== null && !(wish >= 2 && wish <= 14)) {
        console.debug(`Tried to make an invalid wish of ${wish}`);
        return INVALID_MOVE;
    }

    console.debug(`Setting active wish to ${wish}`);
    G.wish = wish;
    ctx.events.endTurn();
}

function pass(G, ctx) {
    // Put this in here in case the logic to auto-pass when are out isn't working right.
    if (G.players[ctx.currentPlayer].hand.length === 0) { return true; }

    if (!canPass(G, ctx)) {
        console.debug(`Invalid move: Player ${ctx.currentPlayer} tried to pass on the first play of a trick or player must play due to a wish`);
        return INVALID_MOVE;
    }

    console.debug(`Player ${ctx.currentPlayer} passes`);
    G.currentTrick.plays.unshift({
        cards: [],
        player: ctx.currentPlayer,
        pass: true
    })
    ctx.events.endTurn();
}

function playBomb(G, ctx, cards) {
    return playCardsCore(G, ctx, cards, ctx.playerID);
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
    var winner = findTrickWinner(G, ctx);
    // If the last player to play is also the current player.
    var playerOutCount = countOutPlayers(G, ctx);
    var previousPlay = getPreviousPlay(G.currentTrick);

    // If the two players out are from the same team we can stop and clean up the hand now.
    if (playerOutCount === 2) {
        if (isOneTwo(G, ctx, ctx.playOrder[0]) || isOneTwo(G, ctx, ctx.playOrder[1])) {
            return {
                next: constants.phases.preHand.name
            }
        }
    }

    if (!winner && playerOutCount >= 3) {
        // If the third player to go out was the last to play, they are the winner
        // of that trick and we should proceed with cleaning up the trick (and ending the hand)
        winner = previousPlay.player;
    }

    if (winner) {
        console.debug(`trick will end with winner ${winner}`);
        if (playerOutCount >= 3) {
            console.debug(`3 players are out. Hand will end.`);
            if (previousPlay.cards[0] === constants.specials.dragon) {
                // If it's a dragon and the trick is over we can automatically give away the dragon to the opponent
                // who is not out.
                var playerIDs = getPlayerIDs(ctx, ctx.currentPlayer);
                G.currentTrick.receivingPlayerID = G.public.players[playerIDs.left].out ? playerIDs.right : playerIDs.left;
                return false;
            }
            return {
                next: constants.phases.preHand.name
            };
        } else {
            // If it's a dragon we won't end the trick quite yet.
            // The actual command to set the player to the passDragon phase is in turnEndIf
            console.debug(`First card in the history is ${previousPlay.cards[0]}`);
            if (!G.currentTrick.receivingPlayerID && previousPlay.cards[0] === constants.specials.dragon) {
                console.debug(`Setting active player to ${winner}`);
                var activePlayers = {};
                activePlayers[winner] = {
                    stage: constants.phases.playTrick.stages.passDragon,
                    moveLimit: 1,
                    revert: true
                };
                ctx.events.setActivePlayers({
                    value: activePlayers
                });

                // Don't end the phase. 
                return false;
            }
            return {
                next: constants.phases.playTrick.name
            };
        }
    }

    return false;
}

function passDragon(G, ctx, receivingPlayerID) {
    var playerIDs = getPlayerIDs(ctx, ctx.currentPlayer);
    if (playerIDs.left !== receivingPlayerID && playerIDs.right !== receivingPlayerID) {
        console.debug(`Cannot give dragon trick to player ${receivingPlayerID}. Only ${playerIDs.left} and ${playerIDs.right} are valid.`);
        return INVALID_MOVE;
    }

    console.debug(`Passing dragon trick to player ${receivingPlayerID}`)
    G.currentTrick.receivingPlayerID = receivingPlayerID;
}

function findTrickWinner(G, ctx) {
    // Basic logic here is that if the player who most recently played cards is the current player, then everyone else passed
    // and the current player is the winner.

    // The logic can't be that simple here, because the framework calls phase endIf at the
    // beginning and end of the turn, so right after you play this function gets called and it looks like you've won the trick

    // However, if the first card in the history is a pass it means we've had at least one other person play and got back to you.

    if (G.currentTrick && G.currentTrick.plays && G.currentTrick.plays.length > 0) {
        var previousPlayIndex = G.currentTrick.plays.findIndex((play) => !play.pass);
        var previousPlay = G.currentTrick.plays[previousPlayIndex];
        var previousPlayerID = previousPlay.player;

        // At least one player needs to have passed.
        if (previousPlayIndex > 0) {
            // Every other player should either be out or have passed.
            var isTrickOver = ctx.playOrder.every((pId) => {
                if (pId === previousPlayerID) {
                    return true; // This player doesn't count because they could be the winner.
                }

                if (G.players[pId].hand.length === 0) {
                    return true; // This player neither played nor passed because they don't have any cards.
                }

                // Check to see if this player passed after the previous play
                for (var i = 0; i < previousPlayIndex; i++) {
                    var play = G.currentTrick.plays[i];
                    if (play.player === pId && play.pass) {
                        return true; // This player passed.
                    }
                }

                // This player didn't pass and isn't out, so the trick isn't over yet.
                return false;
            });

            if (isTrickOver) {
                console.debug(`Trick is over. Winner is ${previousPlayerID}`);
                return previousPlayerID;
            }
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
    console.debug("------End Trick------\n");
    console.debug("------Begin Cleanup------\n");
    console.debug(`Cleaning up trick. Winner: ${winner}`);
    var oneTwo = false;
    if ((isOneTwo(G, ctx, ctx.playOrder[0]) || isOneTwo(G, ctx, ctx.playOrder[1])) && !winner) {
        console.debug(`Someone went 1-2! Setting winner of trick to ${ctx.currentPlayer}`);
        winner = ctx.currentPlayer; // If it's over due to a 1-2, just set the trick winner to whoever because it doesn't matter.
        oneTwo = true;
    }
    if (winner) {
        G.currentTrick.winner = winner;

        // Give the cards in the trick to the winner, or if a dragon trick to the opponent the winner chose.
        var receivingPlayerID = winner;
        if (G.currentTrick.receivingPlayerID) {
            receivingPlayerID = G.currentTrick.receivingPlayerID; // We can override the person to give cards to when the dragon won the trick.
        }
        clearTable(G, receivingPlayerID);

        // Save off the current trick to the log of previous tricks.
        G.previousTricks = G.previousTricks || [];
        G.previousTricks.unshift(G.currentTrick);

        var playerOutCount = countOutPlayers(G, ctx);
        if (playerOutCount === 3 || oneTwo) {
            console.debug("\n---------- End Playing Tricks ----------\n");

            // Set the out order of the last player.
            Object.values(G.public.players).find(player => !player.out).outOrder = 4;

            // Count score
            console.debug("Counting score");
            updateScore(G, ctx);

            console.debug("\n-------------- End Hand --------------\n");
        } else {
            console.debug(`There are ${playerOutCount} players out`);
            console.debug("------End Cleanup------\n");
        }

        // Clear the current trick. It remains the current players hand.
        G.currentTrick = null;
    } else {
        console.error("No winner was detected even though the trick is over");
    }
}

function turnEndIf(G, ctx) {

    // If there's a winner for the trick, end the turn.
    if (G.currentTrick.winner) {
        //if (G.currentTrick.plays && G.currentTrick.plays[0].cards[0] === constants.specials.dragon) {
        //    console.debug(`Setting active player to ${G.currentTrick.winner}`);
        //    var activePlayers = {};
        //    activePlayers[G.currentTrick.winner] = constants.phases.playTrick.stages.passDragon.name;
        //    ctx.events.setActivePlayers({
        //        value: activePlayers
        //    });
        //}
        return true;
    }
    // If the current player is out, play proceeds in regular turn order.
    console.debug(`Player ${ctx.currentPlayer} hand length is ${G.players[ctx.currentPlayer].hand.length}`);
    return G.players[ctx.currentPlayer].hand.length === 0;
}

function onTurnEnd(G, ctx) {
    // On turn end
}

function updateScore(G, ctx) {
    if (G && G.score) {
        console.debug("Counting score");
        // Give last player out tricks to first player out, cards to opponent.
        var lastPlayerIndex = ctx.playOrder.findIndex((pId) => !G.public.players[pId].out);
        var lastPlayerID = ctx.playOrder[lastPlayerIndex];
        var opponentPlayerID = ctx.playOrder[(lastPlayerIndex + 1) % ctx.numPlayers];
        var firstOutPlayerID = Object.keys(G.public.players).find(pId => G.public.players[pId].outOrder === 1);

        console.debug(`Last player: ${lastPlayerID}, Opponent player: ${opponentPlayerID}, First player out: ${firstOutPlayerID}`);

        // Give last player tricks to the first out.
        if (G.players[lastPlayerID].cardsWon) {
            console.debug(`Giving tricks won by player ${lastPlayerID} to player ${firstOutPlayerID}`);
            G.players[firstOutPlayerID].cardsWon = G.players[firstOutPlayerID].cardsWon || [];
            moveCardsBetweenArrays(G.players[lastPlayerID].cardsWon, G.players[firstOutPlayerID].cardsWon);
        }

        // Give last player hand to an opponent.
        if (G.players[lastPlayerID].hand) {
            console.debug(`Giving remaining hand of ${lastPlayerID} to player ${opponentPlayerID}`);
            G.players[opponentPlayerID].cardsWon = G.players[opponentPlayerID].cardsWon || [];
            moveCardsBetweenArrays(G.players[lastPlayerID].hand, G.players[opponentPlayerID].cardsWon);
        }

        // Setup the score for this round.
        var roundScore = {};
        for (var i = 0; i < ctx.numPlayers; i++) {
            roundScore[ctx.playOrder[i]] = 0;
        }

        // Count score for this round.
        if (isOneTwo(G, ctx, ctx.playOrder[0])) {
            console.debug(`Team ${ctx.playOrder[0]}-${ctx.playOrder[2]} went one-two (first if)`);
            roundScore[ctx.playOrder[0]] = 200;
        } else if (isOneTwo(G, ctx, ctx.playOrder[1])) {
            console.debug(`Team ${ctx.playOrder[1]}-${ctx.playOrder[3]} went one-two (second if)`);
            roundScore[ctx.playOrder[1]] = 200;
        } else {
            for (var j = 0; j < ctx.numPlayers; j++) {
                var playerID = ctx.playOrder[j];
                var cardsWon = G.players[playerID].cardsWon || [];

                console.debug(`calculating score for player ${playerID} with the following cards: ${JSON.stringify(cardsWon)}`);
                var totalScore = 0;
                cardsWon.forEach((cardID) => totalScore += score(cardID));
                roundScore[playerID] = totalScore;
                //roundScore[playerID] = cardsWon.reduce((totalScore, cardID) => { totalScore + score(cardID) }, 0);
                console.debug(`score for player ${playerID} is ${totalScore}`);
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
                    console.debug(`player ${playerIDt} went out first and won their ${player.grand ? 'grand ' : ''}tichu`);
                    roundScore[playerIDt] += bet;
                } else {
                    console.debug(`player ${playerIDt} went out ${player.outOrder} and lost their ${player.grand ? 'grand ' : ''}tichu`);
                    roundScore[playerIDt] -= bet;
                }
            }
        }

        console.debug(`Total scores for this round: ${JSON.stringify(roundScore)}`);

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

        var team1score = G.score[ctx.playOrder[0]] + G.score[ctx.playOrder[2]];
        var team2score = G.score[ctx.playOrder[1]] + G.score[ctx.playOrder[3]];
        console.debug(`Score: Team ${ctx.playOrder[0]}-${ctx.playOrder[2]}: ${team1score}; Team ${ctx.playOrder[1]}-${ctx.playOrder[3]}: ${team2score};`)
    }
}

function isOneTwo(G, ctx, playerID) {
    var partnerID = getPlayerIDs(ctx, playerID).partner;
    if (G.public.players[playerID].outOrder === 1 && G.public.players[partnerID].outOrder === 2) {
        return true;
    } else if (G.public.players[playerID].outOrder === 2 && G.public.players[partnerID].outOrder === 1) {
        return true;
    }
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
        onEnd: onTurnEnd,
        onBegin: onTurnBegin,
        //endIf: turnEndIf,
        order: {
            ...TurnOrder.DEFAULT,
            first: findStartPlayer,
            next: findNextPlayer
        },
        stages: {
            makeWish: {
                moves: {
                    makeWish: makeWish
                }
            },
            passDragon: {
                moves: {
                    passDragon: passDragon
                }
            },
            bomb: {
                moves: {
                    playBomb: playBomb,
                    playCards: playCards,
                    pass: pass
                }
            }
        }
    },
    endIf: trickEndIf,
    onEnd: onTrickEnd
};

module.exports = {
    playTrick: playTrick
}