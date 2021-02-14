
module.exports.constants = {
    phases: {
        preHand: {
            name: "preHand",
            stages: {
                takeOrGrand: "takeOrGrand",
                passCards: "passCards",
                waitForPass: "waitForPass",
                acceptPass: "acceptPass"
            }
        },
        playTrick: {
            name: "playTrick",
            stages: {
                makeWish: "makeWish",
                passDragon: "passDragon",
                bomb: "bomb",
                acknowledgeTrick: "acknowledgeTrick"
            }
        }
    },
    specials: {
        dragon: 52,
        phoenix: 53,
        dog: 54,
        mahjong: 55
    }
}