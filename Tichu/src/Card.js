import React from 'react';

export const Card = ({ card }) => {
    let style = {
        backgroundImage: `url("/images/${card.image}")`,
        backgroundPosition: "center",
        backgroundSize: "cover"
    };

    return (
        <div className="card" style={style}>
        </div>
        );
}