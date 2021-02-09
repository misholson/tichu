const { PlayerView, TurnOrder } = require('boardgame.io/core');
const { sortCards, dealCards } = require('./Helpers');
const { constants } = require('./Constants');
const { callGrand, takeCards, passCards, checkPlayersHavePassed, acceptPass } = require('./PreHand');
const { onHandStart, onTurnBegin, findStartPlayer, playCards, primaryPlayEndIf, primaryPlayOnEnd, primaryPlayTurnEndIfOut, primaryPlayPass } = require('./PrimaryPlay');

const tichu = {
    setup: (ctx) => {
        var score = {};
        score[ctx.playOrder[0]] = 0;
        score[ctx.playOrder[1]] = 0;

        return {
            secret: {
                deck: generateDeck(56)
            },

            public: {
                players: {
                    "0": {
                        cards: 0,
                        tichu: false,
                        grand: false
                    },
                    "1": {
                        cards: 0,
                        tichu: false,
                        grand: false
                    },
                    "2": {
                        cards: 0,
                        tichu: false,
                        grand: false
                    },
                    "3": {
                        cards: 0,
                        tichu: false,
                        grand: false
                    }
                },
            },

            score: { ...score },

            players: {
                "0": {
                    hand: []
                },
                "1": {
                    hand: []
                },
                "2": {
                    hand: []
                },
                "3": {
                    hand: []
                }
            },
            playerView: PlayerView.STRIP_SECRETS,
        }
    },

    turn: {
        moveLimit: 1
    },

    phases: {
        preHand: {
            onBegin: (G, ctx) => {
                console.log("first8 onBegin");
                G.secret.deck = ctx.random.Shuffle(G.secret.deck);
                console.debug("first8 done shuffling");
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
            next: constants.phases.primaryPlay.name,
            start: true
        },
        primaryPlay: {
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
                pass: primaryPlayPass
            },
            endIf: primaryPlayEndIf,
            onEnd: primaryPlayOnEnd,
            next: constants.phases.preHand.name,
        }
    },

    endIf: (G, ctx) => {
        // Game ends when one team has a score greater than 0
        console.log(G);
        var team1score = G.score[ctx.playOrder[0]];
        var team2score = G.score[ctx.playOrder[1]];

        console.debug(`Current score: ${team1score}-${team2score}`);
        if (team1score !== team2score && (team1score >= 1000 || team2score >= 1000)) {
            return G.score;
        }

        return null;
    },

    minPlayers: 4,
    maxPlayers: 4
};


function generateDeck(size) {
    var deck = [];
    for (var i = 0; i < size; i++) {
        deck.push(i);
    }

    return deck;
}

module.exports = {
    Tichu: tichu
}