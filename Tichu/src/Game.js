const { INVALID_MOVE, PlayerView } = require('boardgame.io/core');
var { cardDefinitions } = require('./Deck');

const tichu = {
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
                        moves: {
                            passCards: passCards
                        },
                        next: "waitForPass"
                    },
                    waitForPass: {

                    }
                }
            },
            start: true
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

function sortCards(array) {
    array.sort(cardComparison);
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
}

function passCards(G, ctx, playerID, selectedCards) {
    // Check the player is on the passCards stage
    if (ctx.activePlayers[playerID] !== "passCards") {
        return INVALID_MOVE;
    }

    // Make sure they have selected three cards to pass.
    if (!selectedCards || selectedCards.length !== 3) {
        return INVALID_MOVE;
    }

    // Make sure all the cards they've selected are in their hand.
    var player = G.players[playerID];
    for (var i; i < 3; i++) {
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

function removeFromHand(hand, cardID) {
    var indexToRemove = hand.findIndex((c) => c === cardID);
    hand.splice(indexToRemove, 1);
    return [...hand];
}

function getPlayerIDs(ctx, playerID) {
    var playOrder = ctx.playOrder;
    var myPlayIndex = playOrder.findIndex((pId) => pId === playerID);
    return {
        left: playOrder[(myPlayIndex + 1) % 4],
        partner: playOrder[(myPlayIndex + 2) % 4],
        right: playOrder[(myPlayIndex + 3) % 4]
    };
}

module.exports = {
    Tichu: tichu,
    sortCards: sortCards,
    removeFromHand: removeFromHand,
    getPlayerIDs: getPlayerIDs
}