
const { dealCards } = require('../src/Helpers');

function skipPreHandPhase(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.playTrick.start = true;
    game.phases.playTrick.onBegin = (G, ctx) => {
        console.log("TESTING ONLY: shuffle and deal from primary play phase");
        if (!G.previousTricks) {
            G.secret.deck = ctx.random.Shuffle(generateDeck(56));
            dealCards(G, 14);
        } else {
            G.currentTrick = null;
        }
    };
    console.log(game);
    return game;
}

function firstPlayerStartsWithFullHouse(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.playTrick.start = true;
    game.phases.playTrick.onBegin = (G, ctx) => {
        console.log("TESTING ONLY: shuffle and deal from primary play phase");
        if (!G.previousTricks) {
            G.secret.deck = [];
            G.players[0].hand = [50, 37, 11, 22, 45, 19, 6, 17, 16, 15, 40, 39, 0, 55];
            G.players[1].hand = [38, 25, 24, 36, 23, 48, 46, 32, 44, 43, 29, 3, 27, 54];
            G.players[2].hand = [52, 53, 12, 10, 9, 47, 8, 7, 31, 18, 4, 2, 1, 13];
            G.players[3].hand = [51, 49, 35, 34, 21, 33, 20, 5, 30, 42, 41, 28, 14, 26];
            G.public.players[0].cards = 14;
            G.public.players[1].cards = 14;
            G.public.players[2].cards = 14;
            G.public.players[3].cards = 14;
        } else {
            G.currentTrick = null;
        }
    };
    console.log(game);
    return game;
}

function generateDeck(size) {
    var deck = [];
    for (var i = 0; i < size; i++) {
        deck.push(i);
    }

    return deck;
}

module.exports = {
    skipPreHandPhase: skipPreHandPhase,
    firstPlayerStartsWithFullHouse: firstPlayerStartsWithFullHouse
}