import React from 'react';
import { Hand } from './Hand';
import { Card } from './Card';
import { Button } from 'reactstrap';
const { constants } = require('./Constants');

export const PlayArea = ({ currentTrick }) => {
    return (
        <div className="play-area">
            &nbsp;
            {currentTrick && currentTrick.plays &&
                currentTrick.plays.map((play, ix) => (
                    <div className="play" key={ix}>Player { play.player } <Hand hand={ play.cards } /></div>
                    ))
            }
        </div>
    );
}