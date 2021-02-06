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

export const PartnerHand = ({ backs }) => {
    return (
        <ul className="hand-vertical hand">
            {backs && Array(backs).fill(null).map((_, i) => <li key={i}><Card cardID={"back"} /></li>)}
        </ul>
    )
}

export const OpponentHand = ({ backs }) => {
    return (
        <ul className="hand-vertical hand">
            {backs && Array(backs).fill(null).map((_, i) => <li key={i}><div className="card-back-rotated"></div></li>)}
        </ul>
        )
}