var { cardDefinitions } = require('./Deck');

module.exports = {
    sortCards: sortCards,
    removeFromHand: removeFromHand,
    getPlayerIDs: getPlayerIDs
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