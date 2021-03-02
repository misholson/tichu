var { cardDefinitions } = require('./Deck');

module.exports = {
    sortCards: sortCards,
    sortByScore: sortByScore,
    removeFromHand: removeFromHand,
    getPlayerIDs: getPlayerIDs,
    addToHand: addToHand,
    dealCards: dealCards
}

function removeFromHand(hand, cardID) {
    var indexToRemove = hand.findIndex((c) => c === cardID);
    hand.splice(indexToRemove, 1);
    return [...hand];
}

function addToHand(hand, cardID) {
    hand.push(cardID);
    sortCards(hand);
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

function sortByScore(array) {
    array.sort(scoreComparison);
}

function scoreComparison(a, b) {
    let cardAscore = Math.abs(cardDefinitions[a].score);
    let cardBscore = Math.abs(cardDefinitions[b].score);
    if (cardAscore < cardBscore) {
        return 1;
    } else if (cardAscore > cardBscore) {
        return -1;
    }
    return cardComparison(a, b);
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