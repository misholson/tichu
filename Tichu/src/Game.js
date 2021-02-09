const { PlayerView } = require('boardgame.io/core');

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
        preHand: require('./PreHand').preHand,
        playTrick: require('./PlayTrick').playTrick
    },

    endIf: (G, ctx) => {
        // I don't know why G is sometimes passed in as a scalar or undefined,
        // but there's no reason for it to crash the game, at least not here.
        //if (G instanceof Object) {
        //    // Game ends when one team has a score greater than 0
        //    console.log(G);
        //    var team1score = G.score[ctx.playOrder[0]];
        //    var team2score = G.score[ctx.playOrder[1]];

        //    console.debug(`Current score: ${team1score}-${team2score}`);
        //    if (team1score !== team2score && (team1score >= 1000 || team2score >= 1000)) {
        //        return G.score;
        //    }

        //    return null;
        //}

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