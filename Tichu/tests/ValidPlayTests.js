// I can't get any of the unit test frameworks to work, so I'm going to have to create
// my own janky unit test framework that prints test results to the browser console when I run.

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

const { validPlays, detectPlayType, canPass, isValidPlay, hasBomb } = require('../src/ValidPlays');
const { sortCards } = require('../src/Helpers');

const tests = {
    singlePlayValid: () => {
        assertTrue(validPlays.single.isValid([8]));
    },
    pairWishTest: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [17, 4] // 6-6
                }
            ]
        }
        var hand = [51, 24,      31, 44,      30, 43, 29, 42, 27, 1, 39, 13] // 7-7 among other things
        var wish = 7;

        var wishPlay = validPlays.pair.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([31, 44], wishPlay);

    },
    steppedPairValid: () => {
        var currentTrick = null;
        var selectedCards = [8, 34, 46, 7]; // 9-9-10-10

        assertTrue(validPlays.steppedPairs.isValid(selectedCards, currentTrick));
    },
    steppedPairValidPhoenix: () => {
        var currentTrick = null;
        var selectedCards = [53, 34, 46, 7]; // 9-9-10-p

        assertTrue(validPlays.steppedPairs.isValid(selectedCards, currentTrick));
    },
    steppedPairInvalid: () => {
        var currentTrick = null;
        var selectedCards = [53, 34, 46, 6]; // 8-9-10-p

        assertFalse(validPlays.steppedPairs.isValid(selectedCards, currentTrick));
    },
    steppedPairWishTest: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [ 17, 4, 16, 3, 15, 2] // 4-4-5-5-6-6
                }
            ]
        }
        var hand = [51, 24,    31, 44, 30, 43, 29, 42,      27, 1, 39, 13] // 5-5-6-6-7-7 among other things
        var wish = 7;

        var wishPlay = validPlays.steppedPairs.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([31, 44, 30, 43, 29, 42], wishPlay);
    },
    steppedPairWishWithPhoenixOnWishCard: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [17, 4, 16, 3, 15, 2] // 4-4-5-5-6-6
                }
            ]
        }
        var hand = [53, 51, 24, 44, 30, 43, 29, 42, 27, 1, 39, 13] // 5-5-6-6-7-p among other things
        var wish = 7;

        var wishPlay = validPlays.steppedPairs.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([53, 44, 30, 43, 29, 42], wishPlay);
    },
    steppedPairWishTestPhoenixOnOtherCard: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [17, 4, 16, 3, 15, 2] // 4-4-5-5-6-6
                }
            ]
        }
        var hand = [53, 51, 24, 31, 44, 30, 43, 42, 27, 1, 39, 13] // p-5-6-6-7-7 among other things
        var wish = 7;

        var wishPlay = validPlays.steppedPairs.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([53, 31, 44, 30, 43, 42], wishPlay);
    },
    steppedPairWishNoWish: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [17, 4, 16, 3, 15, 2] // 4-4-5-5-6-6
                }
            ]
        }
        var hand = [51, 24, 44, 43, 29, 42, 27, 1, 39, 13] // 5-5-6-6-7-p among other things
        var wish = 7;

        var wishPlay = validPlays.steppedPairs.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    straightWish: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [6, 44, 30, 16, 2] // 4-5-6-7-8
                }
            ]
        }
        var hand = [51, 25, 23, 8, 7, 19, 18, 4, 29, 41, 13, 26] // 6-7-8-9-10 among other things (also has a 4 and 5)
        var wish = 7;

        var wishPlay = validPlays.straight.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([8, 7, 19, 18, 4], wishPlay);
    },
    straightWishPhoenixAccountsForWish: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [6, 44, 30, 16, 2] // 4-5-6-7-8
                }
            ]
        }
        var hand = [53, 51, 25, 23, 8, 7, 19, 4, 29, 41, 13, 26] // 6-p-8-9-10, so is a valid straight but not a required wish
        var wish = 7;

        var wishPlay = validPlays.straight.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    straightWithPhoenixBeatsEqualStraight: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [53, 22, 21, 46, 19], // p-J-10-9-8,
                    player: "1",
                    pass: false
                }
            ]
        }
        var hand = [10, 9, 34, 33, 6] // Q-J-10-9-8

        var result = validPlays.straight.isValid(hand, currentTrick);

        assertFalse(result);
    },
    fullHouseWishInThree: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [10, 22, 32, 5, 18, 31, 4, 17, 16, 2] // 7-7-7-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([5, 18, 31, 4, 17], wishPlay);
    },
    fullHouseWishInTwo: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [10, 22, 32, 18, 31, 4, 17, 30, 16, 2] // 7-7-6-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([18, 31, 4, 17, 30], wishPlay);
    },
    fullHouseWishTwoTwoPhoenix: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [53, 10, 22, 32, 18, 31, 4, 17, 16, 2] // p-7-7-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([53, 18, 31, 4, 17], wishPlay);
    },
    fullHouseWishOneThreePhoenix: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [53, 10, 22, 32, 18, 30, 4, 17, 16, 2] // p-7-6-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([53, 18, 30, 4, 17], wishPlay);
    },
    fullHouseWishNonePhoenix: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [53, 10, 22, 32, 18, 30, 17, 16, 2] // p-7-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    fullHouseWishNone: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [1, 14, 0, 13, 26] // 3-3-2-2-2
                }
            ]
        }
        var hand = [10, 22, 32, 5, 18, 30, 17, 16, 2] // 7-7-6-6
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.fullHouse.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    straightBombWish: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [6, 5, 4, 3, 2, 1, 0] // 2-3-4-5-6-7-8 pagodas
                }
            ]
        }
        var hand = [51, 37, 22, 34, 33, 32, 31, 30, 29, 28, 26, 39] // 4-5-6-7-8-9-10 swords
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.straightFlush.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([34, 33, 32, 31, 30, 29, 28], wishPlay);
    },
    straightBombWishHasBombWithoutWish: () => {
        var currentTrick = {
            plays: [
                {
                    cards: [6, 5, 4, 3, 2, 1, 0] // 2-3-4-5-6-7-8 pagodas
                }
            ]
        }
        var hand = [51, 37, 22, 34, 33, 32, 31, 30, 29, 28, 26, 39] // 4-5-6-7-8-9-10 swords
        sortCards(hand);
        var wish = 3;

        var wishPlay = validPlays.straightFlush.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    straightBombWishHasBombNoPreviousTrick: () => {
        var currentTrick = null;
        var hand = [51, 37, 22, 34, 33, 32, 31, 30, 29, 28, 26, 39] // 4-5-6-7-8-9-10 swords
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.straightFlush.getHighestPlayWithWish(hand, currentTrick, wish);

        assertHandEqual([34, 33, 32, 31, 30, 29, 28], wishPlay);
    },
    straightBombWishNoBomb: () => {
        var currentTrick = null;
        var hand = [51, 37, 22, 34, 33, 32, 31, 29, 28, 26, 39] // 4-5- -7-8-9-10 swords
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.straightFlush.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    straightBombWishNonBombStraight: () => {
        var currentTrick = null;
        var hand = [51, 37, 22, 34, 33, 32, 31, 17, 29, 28, 26, 39] // 4-5-7-8-9-10 swords, 6 is jade
        sortCards(hand);
        var wish = 7;

        var wishPlay = validPlays.straightFlush.getHighestPlayWithWish(hand, currentTrick, wish);

        assertFalsy(wishPlay);
    },
    hasBomb1: () => {
        var hand = [2, 3, 4, 5, 6, 18, 19, 32, 33, 34, 35, 11, 14, 27]; // 4-8 pagodas
        sortCards(hand);

        assertTrue(hasBomb(hand));
    },
    hasBomb2: () => {
        var hand = [46, 47, 48, 49, 50, 51, 10, 20, 22, 23, 25, 37, 38, 55];
        sortCards(hand);

        assertTrue(hasBomb(hand));
    },
    hasBomb3: () => {
        var hand = [41, 42, 43, 44, 45, 14, 7, 21, 36, 24, 12, 9, 8, 54];
        sortCards(hand);

        assertTrue(hasBomb(hand));
    },
    hasBomb4: () => {
        var hand = [0, 13, 26, 39, 1, 15, 16, 17, 28, 29, 30, 31, 52, 53]; // 4 bomb
        sortCards(hand);

        assertTrue(hasBomb(hand));
    }
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

export const runTests = () => {
    console.debug("Tests running");

    var testNames = Object.keys(tests);

    var passed = 0;
    var failed = 0;

    for (var i = 0; i < testNames.length; i++) {
        try {
            tests[testNames[i]]();
            console.info(`PASSED ${testNames[i]}`);
            passed++;
        } catch (e) {
            console.error(`FAILED ${testNames[i]}: ${e}`);
            failed++;
        }
    }

    console.info(`${testNames.length} tests completed. ${passed} passed, ${failed} failed`);
}

function assertEqual(a, b, message) {
    if (!message) { message = `assertEqual failed: ${a} != ${b}`;}
    if (a !== b) {
        throw message;
    }
}

function assertTrue(a, message) {
    if (!message) { message = `assertTrue failed: ${a}`; }
    if (a !== true) {
        throw message;
    }
}

function assertTruthy(a, message) {
    if (!message) { message = `assertTruthy failed: ${a}`; }
    if (!a) {
        throw message;
    }
}

function assertFalse(a, message) {
    if (!message) { message = `assertFalse failed: ${a}`; }
    if (a !== false) {
        throw message;
    }
}

function assertFalsy(a, message) {
    if (!message) { message = `assertFalsy failed: ${a}`; }
    if (a) {
        throw message;
    }
}

function assertHandEqual(handa, handb, message) {
    if (!message) { message = `assertHandEqual failed: ${JSON.stringify(handa)} vs ${JSON.stringify(handb)}`; }

    if (!handa) {
        if (!message) {
            message = `assertHandEqual failed: handa is ${handa}`;
        }
        throw message;
    }

    if (!handb) {
        if (!message) {
            message = `assertHandEqual failed: handb is ${handb}`;
        }
        throw message;
    }

    if (handa.length !== handb.length) {
        if (!message) {
            message = `assertHandEqual failed: handa length: ${handa.length} vs handb length: ${handb.length}`;
        }
        throw message;
    }

    handa.sort();
    handb.sort();

    for (var i = 0; i < handa.length; i++) {
        if (handa[i] !== handb[i]) {
            if (!message) {
                message = `assertHandEqual failed: handa[${i}]: ${handa[i]} vs handb[${i}]: ${handb[i]}`;
            }
            throw message;
        }
    }
}