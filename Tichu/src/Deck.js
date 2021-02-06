
const suits = [
    {
        suit: "pagodas",
        imagePrefix: "b"
    },
    {
        suit: "jade",
        imagePrefix: "g",
    },
    {
        suit: "swords",
        imagePrefix: "k"
    },
    {
        suit: "stars",
        imagePrefix: "r"
    }
];

const generateDeck = () => {
    let cards = [];

    // Loop over the 4 suits
    for (let iSuit = 0; iSuit < 4; iSuit++) {
        let suit = suits[iSuit];

        // Loop over 2 to 14 (Ace) in each suit
        for (let iRank = 2; iRank <= 14; iRank++) {
            let imgNo = iRank.toString();
            if (iRank < 10) { imgNo = '0' + imgNo; } // This shouldn't be so complicated in js!
            cards.push({
                isSpecial: false,
                rank: iRank,
                suit: suit.suit,
                image: `${suit.imagePrefix}${imgNo}.png`
            });
        }
    }

    // Specials
    cards.push({
        isSpecial: true,
        rank: 15,
        suit: "dragon",
        image: "s_dragon.png"
    });
    cards.push({
        isSpecial: true,
        rank: 14.5,
        suit: "phoenix",
        image: "s_phoenix.png"
    });
    cards.push({
        isSpecial: true,
        rank: -1,
        suit: "dog",
        image: "s_dog.png"
    });
    cards.push({
        isSpecial: true,
        rank: 1,
        suit: "mahjong",
        image: "s_mahjong.png"
    });

    return cards;
}

export const cardDefinitions = generateDeck();