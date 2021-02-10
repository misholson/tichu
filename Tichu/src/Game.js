const { PlayerView } = require('boardgame.io/core');
const scenarios = require('../scenarios/scenarios');

const tichu = {
    setup: (ctx) => {
        var score = {};
        // Count score
        for (var i = 0; i < ctx.numPlayers; i++) {
            score[ctx.playOrder[i]] = 0;
        }

        return {
            secret: {
                deck: []
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
            scoreHistory: [],

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
        if (G && G instanceof Object) {
            // Game ends when one team has a score greater than 0
            //console.log(G);
            var team1score = G.score[ctx.playOrder[0]] + G.score[ctx.playOrder[2]];
            var team2score = G.score[ctx.playOrder[1]] + G.score[ctx.playOrder[3]];

            //console.debug(`Current score: ${team1score}-${team2score}`);
            if (team1score !== team2score && (team1score >= 1000 || team2score >= 1000)) {
                return G.score;
            }

            return null;
        }

        return null;
    },

    minPlayers: 4,
    maxPlayers: 4
};



module.exports = {
    Tichu: scenarios.handAlmostFinished(tichu)
}