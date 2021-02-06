import React from 'react';
var { cardDefinitions } = require('./Deck');

export const Card = ({ cardID, onCardClicked }) => {
    let image = null;
    if (cardID === "back") {
        image = "/images/back.png";
    } else {
        image = `/images/${cardDefinitions[cardID].image}`;
    }
    let style = {
        backgroundImage: `url("${image}")`,
        backgroundPosition: "center",
        backgroundSize: "cover"
    };

    const handleClick = () => {
        if (onCardClicked && cardID !== "back") {
            onCardClicked(cardID);
        }
    }

    return (
        <div className="card" style={style} onClick={handleClick}>
        </div>
        );
}