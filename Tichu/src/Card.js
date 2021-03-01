import React from 'react';
var { cardDefinitions } = require('./Deck');

export const Card = ({ cardID, selected, onCardClicked, size }) => {
    let image = null;
    if (!size) {
        size = 1.0;
    }
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

    style = {
        ...style,
        width: 80*size,
        height: 120*size,
        marginLeft: -40*size
    };

    var classes = "card-front";

    if (selected) {
        style.marginTop = -20;
        style.marginBottom = 20;
        //classes += " card-selected";
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