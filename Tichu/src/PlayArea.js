import React from 'react';
import { Hand } from './Hand';
import { Card } from './Card';
import { Button } from 'reactstrap';
const { constants } = require('./Constants');

export const PlayArea = ({ currentTrick, previousTricks, playerIDs, playClearAnimation, trickAcknowledged }) => {
    if ((!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) && previousTricks && previousTricks.length > 0) {
        // If the current trick hasn't started yet, keep displaying the previous trick with a note.
        if (!trickAcknowledged) {
            currentTrick = previousTricks[0];
        }
    }

    var plays = [];
    if (currentTrick && currentTrick.plays) {
        for (var i = 0; i < currentTrick.plays.length && plays.length <= 4; i++) {
            var play = currentTrick.plays[i];
            if (!play.pass) {
                var positionClass;
                if (play.player === playerIDs.left) {
                    positionClass = "left";
                } else if (play.player === playerIDs.partner) {
                    positionClass = "top";
                } else if (play.player === playerIDs.right) {
                    positionClass = "right";
                } else {
                    positionClass = "bottom";
                }

                plays.push((<div className={`play clearfix ${positionClass}`} style={{ zIndex: 999-i }} key={i}><Hand hand={play.cards} /></div>));
            }
        }
    }
    return (
        <div className="play-area">
            &nbsp;
            {plays}
        </div>
    );
}