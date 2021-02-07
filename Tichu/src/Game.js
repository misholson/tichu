const { PlayerView } = require('boardgame.io/core');
const { sortCards } = require('./Helpers');
const { constants } = require('./Constants');
const { callGrand, takeCards, passCards, checkPlayersHavePassed, acceptPass } = require('./PreHand');

const tichu = {
    setup: () => ({
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
    }),

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
            moves: {
                callGrand: callGrand,
                takeCards: takeCards
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
        }
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

function dealCards(G, number) {
    Object.keys(G.players).forEach((playerNumber) => {
        var hand = [];
        for (var i = 0; i < number; i++) {
            hand.push(G.secret.deck.pop());
        }
        sortCards(hand);
        G.players[playerNumber].hand = hand;
        G.public.players[playerNumber].cards = hand.length;
    });
}

module.exports = {
    Tichu: tichu
}