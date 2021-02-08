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
        isValid: isValidSteppedPairs
    },
    fullHouse: {
        name: "Full House",
        isValid: isValidFullHouse
    },
    straightFlush: {
        name: "Straight Flush Bomb",
        isValid: isValidStraightBomb,
        isBomb: true
    },
    straight: {
        name: "Straight",
        isValid: isValidStraight
    },
    fourOfAKind: {
        name: "4 Bomb",
        isValid: isValid4Bomb,
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
    var isValid = selectedCards.every((c) => {
        if (length !== 4 && c === constants.specials.phoenix) {
            return true;
        } else if (rank(c) === checkRank) {
            return true;
        }

        return false;
    });

    // If it's not valid then quit.
    if (!isValid) {
        return false;
    }

    // If we're just checking if it's a valid hand then return.
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    var previousPlay = currentTrick.plays[0];

    if (length !== 4) {
        if (previousPlay.length !== selectedCards.length) {
            return false;
        }
    } else {
        // Special handling for 4 of a kind since it's a bomb.
        if (isValidStraightBomb(previousPlay)) {
            // a 4-bomb can't beat a straight bomb. Otherwise we can just check the rank.
            return false;
        } else if (!isValid4Bomb(previousPlay)) {
            // If it's not a 4 bomb then this definitely wins.
            return true;
        }
    }

    // Check it's higher than the current trick.
    var currentTrickRank = rank(previousPlay[length - 1]);
    return (checkRank > currentTrickRank);
}

function isValidSteppedPairs(selectedCards, currentTrick) {
    // Must be greater than 0 cards and an even number of cards
    if (selectedCards.length === 0 || (selectedCards.length % 2) !== 0) {
        return false;
    }

    // If any card is a special other than the phoenix, it's not valid.
    if (selectedCards.some((c) => isNonPhoenixSpecial(c))) {
        return false;
    }

    sortCards(selectedCards);

    // Loop backwards over the cards.
    var phoenixUsed = false;
    var i = selectedCards.length - 1;
    var previousRank = rank(selectedCards[i]) - 1; // Get one rank lower than the lowest card for checking.
    while (i >= 0) {
        if (rank(selectedCards[i]) !== rank(selectedCards[i - 1])) {
            if (selectedCards[0] !== constants.specials.phoenix) {
                // If there's no phoenix then these two should be equal.
                return false;
            } else if (phoenixUsed) {
                // We need the phoenix, but we already used it in this hand.
                return false;
            } else {
                // Make sure the rank is stepped.
                if (rank(selectedCards[i]) !== previousRank + 1) {
                    return false;
                }

                // The hand can still work, but we can't use the phoenix again.
                phoenixUsed = true;

                // Reduce by one instead of two since we only had one match.
                i--;

                // Set the previousRank for the next loop.
                previousRank++;
            }
        } else {
            // The ranks of these are equal so they're a valid pair. Make sure the ranks are right.
            if (rank(selectedCards[i]) !== previousRank + 1) {
                return false;
            }

            // Go look at the next pair of cards.
            i -= 2;

            // Set the previousRank for the next loop.
            previousRank++;
        }
    }

    // If we made it this far it's a valid stepped pair. If we're just checking if it's a valid hand then return.
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    var previousPlay = currentTrick.plays[0];

    // They need to be the same number of cards.
    if (selectedCards.length !== previousPlay.length) {
        return false;
    }

    // Check that the current one is higher.
    var previousPlayRank = rank(previousPlay[previousPlay.length - 1]);

    return (rank(selectedCards[selectedCards.length - 1]) >= previousPlayRank);
}

function isValidFullHouse(selectedCards, currentTrick) {
    // If we've made it this far then we have a threes rank to check.
    var threesRank = getFullHouseThreesRank(selectedCards);

    // No threes rank means it's not valid.
    if (threesRank === null || threesRank < 2 || threesRank > 14) { return false; }

    // If we made it this far it's a valid full house. If we're just checking if it's a valid hand then return.
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    // Get the value of the 3 of a kind in the previous play.
    var previousThreesRank = getFullHouseThreesRank(currentTrick.plays[0]);

    // Check that the new play is higher than the previous.
    return (threesRank > previousThreesRank);
}

function getFullHouseThreesRank(selectedCards) {
    // Full house is only 5.
    if (selectedCards.length !== 5) { return null; }

    // If any card is a special other than the phoenix, it's not valid.
    if (selectedCards.some((c) => isNonPhoenixSpecial(c))) {
        return null;
    }

    sortCards(selectedCards);

    if (selectedCards[0] === constants.specials.phoenix) {
        // Could be phoenix-1-3, phoenix-2-2, or phoenix-3-1.

        if (isValidThreeOfAKind(selectedCards.slice(2, 5))) { // check for phonix-1-3
            // The last card is in the three of a kind in this case.
            return rank(selectedCards[4]);
        } else if (isValidPair(selectedCards.slice(1, 3)) && selectedCards.slice(3, 5)) { // check for phonix-2-2
            // The first card is a phoenix. Pick the higher of the two pairs to be the rank suit.
            return rank(selectedCards[1]);
        } else if (isValidThreeOfAKind(selectedCards.slice(1, 4))) { // check for phoenix-3-1
            return rank(selectedCards[1]);
        } else {
            return null;
        }
    } else {

        // Split it into an array of 3 and an array of 2.
        if (isValidThreeOfAKind(selectedCards.slice(0, 3)) && isValidPair(selectedCards.slice(3, 5))) {
            // This is a valid full house where the first three are the three of a kind.
            // The first card might be a phoenix, so for rank purposes use the second card.
            threesRank = rank(selectedCards[1]);
        } else if (isValidPair(selectedCards.slice(0, 2)) && isValidThreeOfAKind(selectedCards.slice(2, 5))) {
            // This is a valid full house where the first 2 
            threesRank = rank(selectedCards[4])
        } else {
            return null;
        }
    }

    return null;
}

function isValidStraight(selectedCards, currentTrick) {

    var ranks = getStraightRankArray(selectedCards);
    if (ranks === null) {
        // getStraightRankArray will return null if it's not a valid straight.
        return false;
    }

    // Straight can't go higher than an Ace (not sure how this would happen)
    if (ranks[0] > 14) { return false; }

    // Straight can't go lower than a 1 (not sure how this would happen)
    if (ranks[ranks.length - 1] < 1) { return false; }

    // If we made it this far it's a valid straight. If we're just checking if it's a valid hand then return.
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    var previousPlay = currentTrick.plays[0];

    // Check that it's the same number of cards as the previous straight.
    if (selectedCards.length !== previousPlay.length) { return false; }

    // Check that this straight beats the previous straight.
    var previousRanks = getStraightRankArray(previousPlay);

    // We should never see this but just in case.
    if (previousRanks === null) {
        console.error(`In checking for straight validity, a previous play was not considered a valid straight: ${JSON.stringify(previousPlay)}`);
    }

    return (ranks[0] > previousRanks[0]);
}

function isValidStraightBomb(selectedCards, currentTrick) {
    // straights are minimum 5.
    if (selectedCards.length < 5) { return false; }

    // If any card is a special, it's not a valid bomb.
    if (selectedCards.some((c) => isSpecial(c))) {
        return false;
    }

    var ranks = getStraightRankArray(selectedCards);
    if (ranks === null) {
        // getStraightRankArray will return null if it's not a valid straight.
        return false;
    }

    // Check that all are the same suit.
    if (!selectedCards.every(card => suit(card) === suit(selectedCards[0]))) {
        return false;
    }

    // If we made it this far it's a valid straight bomb. If we're just checking if it's a valid hand then return.
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    var previousPlay = currentTrick.plays[0];
    if (!isBomb(previousPlay)) {
        // If the previous play was not a bomb then you're 
        return true;
    } else if (selectedCards.length > previousPlay.length) {
        // Bigger bombs always win
        return true;
    }

    // Check that this straight beats the previous straight.
    var previousRanks = getStraightRankArray(previousPlay);

    // We should never see this but just in case.
    if (previousRanks === null) {
        console.error(`In checking for straight bomb validity, a previous play was not considered a valid straight: ${JSON.stringify(previousPlay)}`);
    }

    return (ranks[0] > previousRanks[0]);
}

function getStraightRankArray(selectedCards) {
    // straights are minimum 5.
    if (selectedCards.length < 5) { return null; }

    // If any card is a dragon or dog, it's not valid.
    if (selectedCards.some((c) => c === constants.specials.dragon || c === constants.specials.dog)) {
        return null;
    }

    var cardsToCheck = [...selectedCards];

    // Remove the phoenix but let us have one card that misses.
    var phoenixUsed = true;
    var phoenixRank = 0;
    if (cardsToCheck[0] === constants.specials.phoenix) {
        cardsToCheck.shift();
        phoenixUsed = false;
    }

    // Turn this into a list of ranks.
    var ranks = cardsToCheck.map((c) => rank(c));

    var prevRank = ranks[ranks.length - 1] - 1;
    for (var i = ranks.length - 1; i >= 0; i--) {
        if (ranks[i] === prevRank + 1) {
            // This is good, keep going.
            prevRank++;
        } else if (ranks[i] === prevRank + 2 && !phoenixUsed) {
            // This if fine, but we've used the phoenix.
            phoenixUsed = true;
            phoenixRank = prevRank + 1; // The phoenix is being used as this card.
            prevRank += 2;
        } else {
            // This is not a valid straight.
            return null;
        }
    }

    // If we have a phoenix, but didn't use the phoenix as in the previous check, then it means it's an n-1 card straight
    // and the phoenix goes at the beginning or end to make it n cards. Generally put it at the high end, unless the highest
    // card is an Ace, in which case it should be the lowest.
    if (selectedCards[0] === constants.specials.phoenix && !phoenixUsed) {
        if (ranks[0] === 14) {
            // The highest card is an ace, so put the phoenix at the beginning.
            phoenixRank = ranks[ranks.length-1] - 1;
        } else {
            // The highest card is not an ace, so put the phoenix at the high end.
            phoenixRank = ranks[0] + 1;
        }

        // But phoenix cannot have a rank of 1 (this should only happen if you had 2-A + phoenix, wow!)
        if (phoenixRank === 1) {
            return null;
        }

        // Add the phoenix's rank to the list of ranks.
        ranks.push(phoenixRank);

        // This is an array of ranks, not of card definitions, so use the regular sort function.
        ranks.sort();

        // Reverse to stay consistent with the card-sorting method that goes high to low
        ranks.reverse();
    }

    return ranks;
}

function isBomb(selectedCards) {
    return (isValid4Bomb(selectedCards) || isValidStraightBomb(selectedCards));
}

function rank(card) {
    return cardDefinitions[card].rank;
}

function suit(card) {
    return cardDefinitions[card].suit;
}

function isSpecial(card) {
    return (isNonPhoenixSpecial(card) || card === constants.specials.phoenix);
}

function isNonPhoenixSpecial(card) {
    return (card === constants.specials.dog || card === constants.specials.dragon || card === constants.specials.mahjong);
}

function hasCurrent(currentTrick) {
    return (currentTrick && currentTrick.plays && currentTrick.plays.length > 0);
}

/*
const currentTrickExample = {
    type: "typeFunction",
    plays: [
        ["play n"],
        ["play n-1"],
        ["..."],
        ["play 0"]
    ]
}
*/