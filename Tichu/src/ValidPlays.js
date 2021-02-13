const { INVALID_MOVE } = require('boardgame.io/core');
const { sortCards, removeFromHand, getPlayerIDs } = require('./Helpers');
const { constants } = require('./Constants');
var { cardDefinitions } = require('./Deck');

const validPlays = {
    single: {
        name: "Single",
        isValid: isValidSingle,
        getHighestPlayWithWish: getHighestPlayWithWishSingle
    },
    pair: {
        name: "Pair",
        isValid: isValidPair,
        getHighestPlayWithWish: getHighestPlayWithWishPair
    },
    threeOfAKind: {
        name: "Three of a Kind",
        isValid: isValidThreeOfAKind,
        getHighestPlayWithWish: getHighestPlayWithWishThreeOfAKind
    },
    steppedPairs: {
        name: "Stepped Pairs",
        isValid: isValidSteppedPairs,
        getHighestPlayWithWish: getHighestPlayWithWishSteppedPairs
    },
    fullHouse: {
        name: "Full House",
        isValid: isValidFullHouse,
        getHighestPlayWithWish: getHighestPlayWithWishFullHouse
    },
    straightFlush: {
        name: "Straight Flush Bomb",
        isValid: isValidStraightBomb,
        getHighestPlayWithWish: getHighestPlayWithWishStraightBomb,
        isBomb: true
    },
    straight: {
        name: "Straight",
        isValid: isValidStraight,
        getHighestPlayWithWish: getHighestPlayWithWishStraight
    },
    fourOfAKind: {
        name: "4 Bomb",
        isValid: isValid4Bomb,
        getHighestPlayWithWish: getHighestPlayWithWish4Bomb,
        isBomb: true
    },
    dog: {
        name: "Dog",
        isValid: isValidDog,
        getHighestPlayWithWish: () => null
    },
    invalid: {
        name: "Invalid",
        isValid: () => false,
        getHighestPlayWithWish: () => null
    }
}

function detectPlayType(selectedCards) {
    if (!selectedCards || selectedCards.length === 0) { return "invalid"; }

    return Object.keys(validPlays).find((playType) => validPlays[playType].isValid(selectedCards)) || "invalid";
}

function isValidPlay(selectedCards, currentTrick, wish) {
    var selectedPlayType = detectPlayType(selectedCards);
    if (currentTrick && currentTrick.type !== selectedPlayType) {
        return false;
    }

    // This is not a valid play of the selected type or it doesn't beat the current highest play.
    if (!validPlays[selectedPlayType].isValid(selectedCards, currentTrick)) {
        return false;
    }

    return true;
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
    if (!hasCurrent(currentTrick)) {
        return true;
    }

    // Otherwise, it has to be higher in rank than the most recent play.
    var currentHighest = getPreviousPlay(currentTrick).cards[0];

    // If the current highest is a phoenix then we need to beat the next highest card.
    if (currentHighest === constants.specials.phoenix) {
        var twoPlaysAgo = getPreviousPlay(currentTrick, 1);
        // The phoenix is the only card played, so a 2 beats it.
        if (twoPlaysAgo === null) {
            return (cardDefinitions[selectedCards[0]].rank >= 2);
        } else {
            // Find the next card under the phoenix and make sure we beat that.
            return (cardDefinitions[selectedCards[0]].rank > cardDefinitions[twoPlaysAgo.cards[0]].rank);
        }
    }

    // If the card being played is a phoenix then it beats anything but a dragon.
    if (selectedCards[0] === constants.specials.phoenix) {
        return getPreviousPlay(currentTrick).cards[0] !== constants.specials.dragon;
    }

    // It's not a phoenix, so we can just check the rank.
    return cardDefinitions[selectedCards[0]].rank > cardDefinitions[currentHighest].rank;
}

function getHighestPlayWithWishSingle(hand, currentTrick, wish) {
    var card = hand.find((cardID) => rank(cardID) === wish);

    if (card !== undefined) {
        return [card];
    }

    return null;
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

function getHighestPlayWithWishPair(hand, currentTrick, wish) {
    return getHighestPlayWithWishMultiCard(hand, currentTrick, wish, 2);
}

function isValidThreeOfAKind(selectedCards, currentTrick) {
    return isValidMultiCardSet(selectedCards, currentTrick, 3);
}

function getHighestPlayWithWishThreeOfAKind(hand, currentTrick, wish) {
    return getHighestPlayWithWishMultiCard(hand, currentTrick, wish, 3);
}

function isValid4Bomb(selectedCards, currentTrick) {
    return isValidMultiCardSet(selectedCards, currentTrick, 4);
}

function getHighestPlayWithWish4Bomb(hand, currentTrick, wish) {
    return getHighestPlayWithWishMultiCard(hand, currentTrick, wish, 4);
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

    var previousPlay = getPreviousPlay(currentTrick).cards;

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

function getHighestPlayWithWishMultiCard(hand, currentTrick, wish, length) {
    var cards = [];

    const isValidPhoenix = (cID) => {
        if (length === 4) { return false; } // Phoenix not valid for 4-bombs
        return (cID === constants.specials.phoenix);
    }

    // Count the number of cards matching that rank.
    for (var i = 0; i < hand.length; i++) {
        if (isValidPhoenix(hand[i]) || rank(hand[i]) === wish) {
            cards.push(hand[i]);
            if (cards.length >= length) {
                return cards;
            }
        }
    }

    return null;
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

    var previousPlay = getPreviousPlay(currentTrick).cards;

    // They need to be the same number of cards.
    if (selectedCards.length !== previousPlay.length) {
        return false;
    }

    // Check that the current one is higher.
    var previousPlayRank = rank(previousPlay[previousPlay.length - 1]);

    return (rank(selectedCards[selectedCards.length - 1]) >= previousPlayRank);
}

function getHighestPlayWithWishSteppedPairs(hand, currentTrick, wish) {
    var lengthNeeded = currentTrick.plays[0].cards.length;
    var numPairsNeeded = lengthNeeded / 2;

    // First thing to do is see if we even have the pair we need.
    var wishPair = getHighestPlayWithWishPair(hand, currentTrick, wish);
    if (!wishPair) { return null; }

    // Get the count values for each possible rank.
    var ranks = hand.rankCount(2);

    var hasPhoenix = hand.some((cardID) => cardID === constants.specials.phoenix);

    // Now we have an array like [1, 2, 0, 0, 2, 1, 2, 2, ...]
    // If we have n 2's in a row then we can do it.
    // Or, if we have n-1 2's, one 1, and the phoenix we can also do it.
    // Basically if there is a window of n elements in the rank array whose sum is at least 2*n (or 2*n-1 if we have the phoenix)
    // then that window will work.

    // Note that the start rank can't go past the highest and lowest ranks.
    var startRankBegin = Math.min(wish + (numPairsNeeded - 1), 14); // The highest rank can't be lower than 14.
    var startRankEnd = Math.max(wish, 2 + (numPairsNeeded - 1)); // The lowest rank can't be lower than 2, so 2 + (numPairs - 1) is the lowest possible start.

    // Now loop over the window we've defined of possible ranks a stepped pairs hand could be.
    for (var startRank = startRankBegin; startRank >= startRankEnd; startRank--) {
        // Start window at the highest card needed for wish to work. Work its way down until the wish card is the highest rank.
        var total = 0;
        for (var windowPosition = 0; windowPosition < numPairsNeeded; windowPosition++) {
            total += ranks[startRank - windowPosition];
        }

        if (total === lengthNeeded || (hasPhoenix && total === lengthNeeded - 1)) {
            // We can make the play 

            // Get the actual hand.
            var cards = [];
            var index = hand.findIndex((cID) => rank(cID) === startRank);
            var currentRank = startRank;
            while (cards.length < total || index === hand.length || currentRank === 0) {
                if (ranks[currentRank] === 0) {
                    // there are no more cards with this rank
                    currentRank--;
                } else if (rank(hand[index]) === currentRank) {
                    cards.push(hand[index]);
                    index++;
                    ranks[currentRank]--; // Reduce the count on the current rank.
                } else {
                    // The current spot in the hand no longer matches the current rank, so move along in the hand.
                    index++;
                }
            }

            if (cards.length === lengthNeeded - 1) {
                // Add the phoenix back in
                cards.unshift(constants.specials.phoenix);
            }

            return cards;
        } 
    }

    return null;
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
    var previousThreesRank = getFullHouseThreesRank(getPreviousPlay(currentTrick).cards);

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
            return rank(selectedCards[1]);
        } else if (isValidPair(selectedCards.slice(0, 2)) && isValidThreeOfAKind(selectedCards.slice(2, 5))) {
            // This is a valid full house where the first 2 
            return rank(selectedCards[4])
        } else {
            return null;
        }
    }
}

function getHighestPlayWithWishFullHouse(hand, currentTrick, wish) {
    var ranks = hand.rankCount(3);
    var usedPhoenix = !hand.some((cID) => cID === constants.specials.phoenix);

    // Find the highest three of a kind.
    var threesRank = 999;
    for (var i = 14; i >= 2; i--) {
        if (ranks[i] >= 3) {
            threesRank = i;
            break;
        }
    }

    // If threesRank is still 999, then we didn't find any three of a kind.
    // If we have the phoenix we can still make it work.
    if (threesRank > 14 && !usedPhoenix) {
        for (var j = 14; j >= 2; j--) {
            if (ranks[j] >= 2) {
                threesRank = j;
                break;
            }
        }

        if (threesRank <= 14 && threesRank >= 2) {
            usedPhoenix = true;
        }
    }

    if (threesRank > 14) {
        // If we made it this far without a three of a kind, then we can't make a full house.
        return null;
    }

    var twosRank = 999;

    if (threesRank === wish) {
        // If the three rank is the wish rank, then find ay other pair (or single if we can still use the phoenix)
        for (var m = 14; m >= 2; m--) {
            if (ranks !== wish && ranks[m] >= (usedPhoenix ? 2 : 1)) {
                twosRank = m;
            }
        }

        if (twosRank > 14) {
            // We couldn't make a pair here.
            return null;
        }
    } else {
        // If the three rank was any other card then the twos have to be the wish pair.
        if (ranks[wish] >= (usedPhoenix ? 2 : 1)) {
            twosRank = wish;
        } else {
            // We can't even make a pair with the wish card so there's no wish here.
            return null;
        }
    }

    var threeCards = [];
    for (var k = 0; k < hand.length && threeCards.length < 3; k++) {
        if (rank(hand[k]) === threesRank) {
            threeCards.push(hand[k]);
        }
    }

    var twoCards = [];
    for (var l = 0; l < hand.length && twoCards.length < 2; l++) {
        if (rank(hand[l]) === twosRank) {
            twoCards.push(hand[l]);
        }
    }

    var cards = threeCards.concat(twoCards);

    if (cards.length === 4) {
        // Add the phoenix back in
        cards.unshift(constants.specials.phoenix);
    }

    return cards;
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

    var previousPlay = getPreviousPlay(currentTrick).cards;

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

function getHighestPlayWithWishStraight(hand, currentTrick, wish) {
    var lengthNeeded = currentTrick.plays[0].cards.length;

    var hasPhoenix = hand.some((cardID) => { cardID === constants.specials.phoenix });

    // Get a sorted array of all the unique ranks without specials
    var ranks = hand.rankCount(1);

    var windowStart = Math.min(wish + (lengthNeeded - 1), 14);
    var windowEnd = Math.max(wish, 2 + (lengthNeeded - 1));;

    for (var startRank = windowStart; startRank >= windowEnd; startRank--) {
        var total = 0;
        for (var windowPosition = 0; windowPosition < lengthNeeded; windowPosition++) {
            total += ranks[startRank - windowPosition];
        }

        if (total === lengthNeeded || (total === (lengthNeeded - 1) && hasPhoenix)) {
            // We got one, no we have to actually get the cards.

            // Get the actual hand.
            var cards = [];
            var index = hand.findIndex((cID) => rank(cID) === startRank);
            var currentRank = startRank;
            while (cards.length < total || index === hand.length || currentRank === 0) {
                if (ranks[currentRank] === 0) {
                    // there are no more cards with this rank
                    currentRank--;
                } else if (rank(hand[index]) === currentRank) {
                    cards.push(hand[index]);
                    index++;
                    ranks[currentRank]--; // Reduce the count on the current rank.
                } else {
                    // The current spot in the hand no longer matches the current rank, so move along in the hand.
                    index++;
                }
            }

            if (cards.length === lengthNeeded - 1) {
                // Add the phoenix back in
                cards.unshift(constants.specials.phoenix);
            }

            return cards;
        }
    }

    return null;
}

Array.prototype.getUnique = function () {
    var u = {}, a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

Array.prototype.rankCount = function (max) {
    // Get the count values for each possible rank.
    var ranks = Array(15).fill(0);
    for (var i = 0; i < this.length; i++) {
        var countRank = rank(this[i]);
        if (countRank >= 2 && countRank <= 14) {
            if (!max || ranks[countRank] < max) {
                ranks[countRank]++;
            }
        }
    }

    return ranks;
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

    var previousPlay = getPreviousPlay(currentTrick).cards;
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

function getHighestPlayWithWishStraightBomb(hand, currentTrick, wish) {
    var minLengthNeeded = 5;
    if (hasCurrent(currentTrick) && currentTrick.type === validPlays.straightFlush.name) {
        // If this bomb needs to respond to another straight bomb, it needs to match its length.
        minLengthNeeded = currentTrick.plays[0].cards.length;
    }

    var longestStraightCount = 0;
    var longestStraightSuit = -1;

    for (var suitType = 0; suitType < 4; suitType++) {
        // Get all the cards in this suit.
        var cardsInSuit = hand.filter((cID) => suit(cID) === suitType);
        // Get a sorted array of all the unique ranks without specials
        var ranks = cardsInSuit.rankCount(1);

        // How far up can we go from the wish.
        var currentRankUp = wish;
        while (currentRankUp <= 14 && ranks[currentRankUp] === 1) {
            currentRankUp++;
        }

        // How far down can we go from the wish
        var currentRankDown = wish;
        while (currentRankDown >= 2 && ranks[currentRankDown] === 1) {
            currentRankDown--;
        }

        // Current rank up and current rank down are the first ranks that AREN'T part of the straight flush.
        // So we have something like 2-3-4-5-6-7-8-9. currentRankDown = 2, currentRankUp = 9, that means 3-8 is a
        // valid 6 card bomb, so it's 9 - 2 - 1 = 6, hence:
        // currentRankUp - currentRankDown - 1 is the length.
        var currentLength = currentRankUp - currentRankDown - 1;
        if (currentLength > longestStraightCount) {
            longestStraightCount = currentLength;
            longestStraightSuit = suitType;
        }
    }

    if (longestStraightCount >= 5) {
        // Get the straight out of the suit we found it in.
        var suitWithStraight = hand.filter((cID) => suit(cID) === longestStraightSuit);
        var placeholderTrick = {
            plays: [
                {
                    cards: Array(longestStraightCount).fill(0) // Only the length matters, the actual cards are irrelevant.
                }]
        };
        return getHighestPlayWithWishStraight(suitWithStraight, placeholderTrick, wish);
    }

    return null;
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

function getPreviousPlay(currentTrick, playsBack = 0) {
    if (!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) {
        return null;
    }

    var previousPlay = null;
    // Loop over the previous plays to find ones that aren't passes.
    for (var i = 0; i < currentTrick.plays.length && playsBack >= 0; i++) {
        // If this play was not a pass set it as the previous play.
        if (!currentTrick.plays[i].pass) {
            previousPlay = currentTrick.plays[i];

            // If we are asking for one farther back than the most recent then this will keep decrementing.
            playsBack--;
        }
    }
    return previousPlay;
}

function canPass(G, ctx) {
    var currentTrick = G.currentTrick;
    var hand = G.players[ctx.currentPlayer].hand;
    var wish = G.wish;

    // Can't pass on the first card of the hand.
    if (!hasCurrent(currentTrick)) { return false; }

    // Check if a wish is active.
    if (wish >= 2 && wish <= 14) {
        // Check if a player has a card that fulfills the wish.
        if (hand.some((cardID) => rank(cardID) === wish)) {
            console.debug(`Player has a card that matches fulfills wish ${wish}`);

            // Now check if the player has any valid play that contains the wished card.
            var wishPlay = validPlays[currentTrick.type].getHighestPlayWithWish(hand, currentTrick, wish);
            if (isValidPlay(wishPlay, currentTrick)) {
                return false; // If you can make a valid move with the wish you must.
            }
        }
    }

    return true;
}


module.exports = {
    validPlays: validPlays,
    isValidPlay: isValidPlay,
    detectPlayType: detectPlayType,
    canPass: canPass,
    getPreviousPlay: getPreviousPlay,
    rank: rank
}

/*
const currentTrickExample = {
    type: "typeFunction",
    plays: [
        { 
            cards: ["play n"],
            player: "0"
        },
        {
            cards: ["play n-1"],
            player: "2"
        }
    ]
}
*/