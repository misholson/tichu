import React from 'react';
import { Card } from './Card';

export const Hand = ({ hand, active, selectedCards, onCardClicked }) => {

    const isSelected = (cardID) => {
        if (!selectedCards) { return false; }
        return selectedCards.some(c => c === cardID);
    }

    var className = "hand";
    if (active) {
        className += " activehand";
    }

    return (
        <div className={className}>
            {hand && hand.map((cardID) => <Card key={cardID} cardID={cardID} selected={isSelected(cardID)} onCardClicked={onCardClicked} />)}
        </div>
        )
}

export const PartnerHand = ({ backs, active }) => {
    var className = "hand";
    if (active) {
        className += " activehand";
    }
    return (
        <div className={className}>
            {backs && Array(backs).fill(null).map((_, i) => <Card key={i} cardID={"back"} />)}
        </div>
    )
}

export const OpponentHand = ({ backs, active }) => {
    var className = "hand-vertical hand";
    if (active) {
        className += " activehandvertical";
    }
    return (
        <div className={className}>
            {backs && Array(Math.floor((14 - backs) / 2)).fill(null).map((_, i) => <div key={i} className="card-spacer card-shape">&nbsp;</div>)}
            {backs && Array(backs).fill(null).map((_, i) => <div key={i} className="card-back-rotated card-shape"></div>)}
            {backs && Array(Math.ceil((14 - backs) / 2)).fill(null).map((_, i) => <div key={i} className="card-spacer card-shape">&nbsp;</div>)}
        </div>
        )
}