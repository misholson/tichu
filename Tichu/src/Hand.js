import React from 'react';
import { Card } from './Card';

export const Hand = ({ hand, active, compressed, selectedCards, onCardClicked }) => {

    const isSelected = (cardID) => {
        if (!selectedCards) { return false; }
        return selectedCards.some(c => c === cardID);
    }

    var className = "hand";

    if (compressed) {
        className = "hand-compressed";
    }
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
            {backs > 0 && Array(backs).fill(null).map((_, i) => <Card key={i} cardID={"back"} />)}
        </div>
    )
}

export const OpponentHand = ({ backs, active }) => {
    var activeClass = active ? "activehandvertical" : "";
    return (
        <div className="hand-vertical hand">
            {backs > 0 && Array(Math.floor((14 - backs) / 2)).fill(null).map((_, i) => <div key={i} className="card-spacer card-shape">&nbsp;</div>)}
            <div className={activeClass}>
                {backs > 0 && Array(backs).fill(null).map((_, i) => <div key={i} className="card-back-rotated card-shape"></div>)}
            </div>
            {backs > 0 && Array(Math.ceil((14 - backs) / 2)).fill(null).map((_, i) => <div key={i} className="card-spacer card-shape">&nbsp;</div>)}
        </div>
        )
}