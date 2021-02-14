
const { dealCards, sortCards } = require('../src/Helpers');

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

function handAlmostFinished(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.playTrick.start = true;
    game.phases.playTrick.onBegin = (G, ctx) => {
        console.debug("TESTING ONLY: Simulate a hand almost finished for testing scoring");
        if (!G.previousTricks) {
            console.debug("Setting up hand that is almost empty");
            console.log(G);
            G.secret.deck = [];
            G.players["0"].hand = [55];
            G.players["0"].cardsWon = [50, 37, 11, 22, 45, 19, 6, 17, 16, 15, 40, 39, 0];
            G.players["1"].hand = [38];
            G.players["1"].cardsWon = [25, 24, 36, 23, 48, 46, 32, 44, 43, 29, 3, 27, 54];
            G.players["2"].hand = [13];
            G.players["2"].cardsWon = [52, 53, 12, 10, 9, 47, 8, 7, 31, 18, 4, 2, 1];
            G.players["3"].hand = [26];
            G.players["3"].cardsWon = [51, 49, 35, 34, 21, 33, 20, 5, 30, 42, 41, 28, 14];
            G.public.players["0"].cards = 1;
            G.public.players["1"].cards = 1;
            G.public.players["2"].cards = 1;
            G.public.players["3"].cards = 1;
            G.previousTricks = [
                {
                    player: "0",
                    cards: [50, 37, 11, 22],
                    winner: "0",
                    pass: false
                }
            ];
        } else {
            G.currentTrick = null;
        }
    };
    console.log(game);
    return game;
}

function giveAllPlayersBombs(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.playTrick.start = true;
    game.phases.playTrick.onBegin = (G, ctx) => {
        console.log("TESTING ONLY: shuffle and deal from primary play phase");
        if (!G.previousTricks) {
            G.secret.deck = [];
            G.players[0].hand = [2, 3, 4, 5, 6, 18, 19, 32, 33, 34, 35, 11, 14, 27]; // 4-8 pagodas
            G.players[1].hand = [0, 13, 26, 39, 1, 15, 16, 17, 28, 29, 30, 31, 52, 53]; // 4 bomb
            G.players[2].hand = [41, 42, 43, 44, 45, 14, 7, 21, 36, 24, 12, 9, 8, 54];
            G.players[3].hand = [46, 47, 48, 49, 50, 51, 10, 20, 22, 23, 25, 37, 38, 55];
            G.public.players[0].cards = 14;
            G.public.players[1].cards = 14;
            G.public.players[2].cards = 14;
            G.public.players[3].cards = 14;
            sortCards(G.players[0].hand);
            sortCards(G.players[1].hand);
            sortCards(G.players[2].hand);
            sortCards(G.players[3].hand);

            // Set score for testing score history.
            G.score = { // 550-150
                "0": 225,
                "1": 150,
                "2": 225,
                "3": 100
            };
            G.scoreHistory = [{ // 30-70
                "0": 115,
                "1": 40,
                "2": 15,
                "3": 30
            }, { // 280-20
                "0": 225,
                "1": 0,
                "2": 55,
                "3": 20
            }, { // 240-60
                "0": 210,
                "1": -10,
                "2": 30,
                "3": 70
            }
            ];
        } else {
            G.currentTrick = null;
        }
    };
    console.log(game);
    return game;
}

/*
 * Cards:
 *          2   3   4   5   6   7   8   9  10   J   Q   K   A
 *          --------------------------------------------------
 * pagodas  0   1   2   3   4   5   6   7   8   9  10  11  12
 * jade    13  14  15  16  17  18  19  20  21  22  23  24  25
 * swords  26  27  28  29  30  31  32  33  34  35  36  37  38
 * stars   39  40  41  42  43  44  45  46  47  48  49  50  51
 *
 * dragon:  52
 * phoenix: 53
 * dog:     54
 * mahjong: 55
 */

function generateDeck(size) {
    var deck = [];
    for (var i = 0; i < size; i++) {
        deck.push(i);
    }

    return deck;
}

module.exports = {
    skipPreHandPhase: skipPreHandPhase,
    firstPlayerStartsWithFullHouse: firstPlayerStartsWithFullHouse,
    handAlmostFinished: handAlmostFinished,
    giveAllPlayersBombs: giveAllPlayersBombs
}