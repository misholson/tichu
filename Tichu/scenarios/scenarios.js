
const { dealCards } = require('../src/Helpers');

function skipPreHandPhase(game) {
    console.log(game);
    game.phases.preHand.start = false;
    game.phases.primaryPlay.start = true;
    game.phases.primaryPlay.onBegin = (G, ctx) => {
        console.log("TESTING ONLY: shuffle and deal from primary play phase");
        G.secret.deck = ctx.random.Shuffle(G.secret.deck);
        dealCards(G, 14);
        return G;
    };
    console.log(game);
    return game;
}

module.exports = {
    skipPreHandPhase: skipPreHandPhase
}