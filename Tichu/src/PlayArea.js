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
                    <div className={play.pass ? "pass clearfix" : "play clearfix"} key={ix}>Player {play.player} {play.pass ? "Passed" : <Hand hand={play.cards} />}</div>
                    ))
            }
        </div>
    );
}