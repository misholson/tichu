const { INVALID_MOVE } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
var { cardDefinitions } = require('./Deck');

const validPlays = {
    single: {
        name: "Single",
        isValid: isValidSingle
    },
    pair: {
        name: "Pair",
        isValid: isValidPair
    },
    threeOfAKind: {
        name: "Three of a Kind",
        isValid: isValidThreeOfAKind
    },
    steppedPairs: {
        name: "Stepped Pairs",
        isValid: () => false
    },
    fullHouse: {
        name: "Full House",
        isValid: () => false
    },
    straight: {
        name: "Straight",
        isValid: () => false
    },
    fourOfAKind: {
        name: "4 Bomb",
        isValid: isValid4Bomb,
        isBomb: true
    },
    straightFlush: {
        name: "Straight Flush Bomb",
        isValid: () => false,
        isBomb: true
    },
    dog: {
        name: "Dog",
        isValid: isValidDog
    },
    invalid: {
        name: "Invalid",
        isValid: () => false
    }
}

module.exports = {
    validPlays: validPlays,
    isValidPlay: isValidPlay,
    detectPlayType: detectPlayType
}

function detectPlayType(selectedCards) {
    if (!selectedCards || selectedCards.length === 0) { return validPlays.invalid; }

    return Object.values(validPlays).find((playType) => playType.isValid(selectedCards)) || validPlays.invalid;
}

function isValidPlay(selectedCards, currentTrick) {
    var type = currentTrick?.type;
    if (!type) {
        type = detectPlayType(selectedCards);
    }

    return type(selectedCards, currentTrick);
}

function isValidSingle(selectedCards, currentTrick) {

    // Only one card can be selected
    if (!selectedCards || selectedCards.length !== 1) {
        return false;
    }

    // Cannot select the dog
    if (selectedCards[0] === constants.specials.dog) {
        return false;
    }

    // If nothing currently played, everything else is valid.
    if (!currentTrick?.plays || currentTrick.plays.length === 0) {
        return true;
    }

    // Otherwise, it has to be higher in rank than the most recent play.
    var currentHighest = currentTrick.plays[0][0];

    // If the current highest is a phoenix then we need to beat the next highest card.
    if (currentHighest === constants.specials.phoenix) {
        // The phoenix is the only card played, so a 2 beats it.
        if (currentTrick.plays.length === 1) {
            return (cardDefinitions[selectedCards[0]].rank >= 2);
        } else {
            // Find the next card under the phoenix and make sure we beat that.
            return (cardDefinitions[selectedCards[0]].rank > cardDefinitions[currentTrick.plays[1][0]].rank);
        }
    }

    // If the card being played is a phoenix then it beats anything but a dragon.
    if (selectedCards[0] === constants.specials.phoenix) {
        return currentTrick.plays[0][0] !== constants.specials.dragon;
    }

    // It's not a phoenix, so we can just check the rank.
    return cardDefinitions[selectedCards[0]].rank > cardDefinitions[currentHighest].rank;
}

function isValidDog(selectedCards, currentTrick) {
    if (!selectedCards || selectedCards.length !== 1) { return false; }

    // Only the first play of a trick can be the dog.
    if (currentTrick && currentTrick.plays && currentTrick.plays.length > 0) {
        return false;
    }

    // Works
    return selectedCards[0] === constants.specials.dog;
}

function isValidPair(selectedCards, currentTrick) {
    return isValidMultiCardSet(selectedCards, currentTrick, 2);
}

function isValidThreeOfAKind(selectedCards, currentTrick) {
    return isValidMultiCardSet(selectedCards, currentTrick, 3);
}

function isValid4Bomb(selectedCards, currentTrick) {
    return isValidMultiCardSet(selectedCards, currentTrick, 4);
}

function isValidMultiCardSet(selectedCards, currentTrick, length) {
    // Only do pairs, three of a kind, and four of a kind
    if (selectedCards.length < 2 || selectedCards.length > 4) { return false; }

    if (!selectedCards || selectedCards.length !== length) { return false; }

    // If any card is a special other than the phoenix, it's not valid.
    if (selectedCards.some((c) => isNonPhoenixSpecial(c))) {
        return false;
    }

    // Sort the selection.
    sortCards(selectedCards);

    // Because phoenix has a rank of 14.5 it will always be first in a sorted list if it's present, so grab the last card as the reference.
    var checkRank = rank(selectedCards[selectedCards.length - 1]);
    return selectedCards.every((c) => {
        if (length !== 4 && c === constants.specials.phoenix) {
            return true;
        } else if (rank(c) === checkRank) {
            return true;
        }

        return false;
    });
}

function rank(card) {
    return cardDefinitions[card].rank;
}

function isNonPhoenixSpecial(card) {
    return (card === constants.specials.dog || card === constants.specials.dragon || card === constants.specials.mahjong);
}

const currentTrickExample = {
    type: "typeFunction",
    plays: [
        ["play n"],
        ["play n-1"],
        ["..."],
        ["play 0"]
    ]
}