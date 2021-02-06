const { INVALID_MOVE, PlayerView } = require('boardgame.io/core');
var { cardDefinitions } = require('./Deck');

module.exports.Tichu = {
    setup: () => ({
        cells: Array(9).fill(null), // TODO: Delete
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
        first8: {
            onBegin: (G, ctx) => {
                console.log("first8 onBegin");
                G.secret.deck = ctx.random.Shuffle(G.secret.deck);
                console.debug("first8 done shuffling");
                dealCards(G, 8);
                ctx.events.setActivePlayers({ all: "takeOrGrand" });
                return G;
            },
            moves: {
                callGrand: callGrand,
                takeCards: takeCards
            },
            start: true
        }
    },

    turn: {
        stages: {
            takeOrGrand: {
                moves: {
                    callGrand: callGrand,
                    takeCards: takeCards
                },
                next: "passCards"
            },
            passCards: {

            }
        }
    },

    moves: {
        clickCell: (G, ctx, id) => {
            if (G.cells[id] !== null) {
                return INVALID_MOVE;
            }
            G.cells[id] = ctx.currentPlayer;
        },
    },

    endIf: (G, ctx) => {
        if (IsVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        }

        if (IsDraw(G.cells)) {
            return { draw: true };
        }
    },

    minPlayers: 4,
    maxPlayers: 4
};

module.exports.getPartner = getPartner;

// Return true if `cells` is in a winning configuration.
function IsVictory(cells) {
    const positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];

    const isRowComplete = row => {
        const symbols = row.map(i => cells[i]);
        return symbols.every(i => i !== null && i === symbols[0]);
    };

    return positions.map(isRowComplete).some(i => i === true);
}

// Return true if all `cells` are occupied.
function IsDraw(cells) {
    return cells.filter(c => c === null).length === 0;
}


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
        hand.sort(cardComparison);
        G.players[playerNumber].hand = hand;
        G.public.players[playerNumber].cards = hand.length;
    });
}

function cardComparison(a, b) {
    let cardA = cardDefinitions[a];
    let cardB = cardDefinitions[b];

    if (cardA.rank < cardB.rank) {
        return 1;
    } else if (cardA.rank > cardB.rank) {
        return -1;
    } else {
        if (cardA.suit < cardB.suit) {
            return 1;
        } else if (cardA.suit > cardB.suit) {
            return -1;
        }
    }
    return 0;
}

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
    G.players[playerID].hand.sort(cardComparison);
    G.public.players[playerID].cards = G.players[playerID].hand.length;
    ctx.events.endStage();
    return G;
}

function getPartner(playerID) {
    switch (playerID) {
        case "0":
            return "2";
        case "1":
            return "3";
        case "2":
            return "0";
        case "3":
            return "1";
        default:
            return null;
    }
}