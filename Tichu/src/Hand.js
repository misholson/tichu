import React from 'react';
import { Card } from './Card';

export const Hand = ({ hand, backs, onCardClicked }) => {

    // If we passed a number of card backs to show, show them
    if (backs) {
        hand = Array(backs).fill("back");
    }

    return (
        <ul className="hand">
            {hand && hand.map((cardID) => <li key={cardID}><Card cardID={cardID} onCardClicked={onCardClicked} /></li>)}
        </ul>
        )
}