
const { dealCards } = require('../src/Helpers');

function skipPreHandPhase(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.playTrick.start = true;
    game.phases.playTrick.onBegin = (G, ctx) => {
        console.log("TESTING ONLY: shuffle and deal from primary play phase");
        if (!G.previousTricks) {
            G.secret.deck = ctx.random.Shuffle(G.secret.deck);
            dealCards(G, 14);
        } else {
            G.currentTrick = null;
        }
    };
    console.log(game);
    return game;
}

module.exports = {
    skipPreHandPhase: skipPreHandPhase
}