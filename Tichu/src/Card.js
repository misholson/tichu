import React from 'react';
var { cardDefinitions } = require('./Deck');

export const Card = ({ cardID, selected, onCardClicked }) => {
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

    var classes = "card-front card-shape";

    if (!selected) {
        classes += " card-selected";
        //style.marginTop = "20px";
    }

    const handleClick = () => {
        if (onCardClicked && cardID !== "back") {
            onCardClicked(cardID);
        }
    }

    return (
        <div className={classes} style={style} onClick={handleClick}>
        </div>
        );
}