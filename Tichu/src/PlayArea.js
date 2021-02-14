import React from 'react';
import { Hand } from './Hand';
import { Card } from './Card';
import { Button } from 'reactstrap';
const { constants } = require('./Constants');

export const PlayArea = ({ currentTrick, previousTricks, playerIDs, playClearAnimation }) => {
    var displayingPreviousTrickOutcome = false;
    if ((!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) && previousTricks && previousTricks.length > 0) {
        // If the current trick hasn't started yet, keep displaying the previous trick with a note.
        currentTrick = previousTricks[0];
        displayingPreviousTrickOutcome = true;
    }

    var plays = [];
    if (currentTrick) {
        for (var i = currentTrick.plays.length - 1; i >= 0 && plays.length <= 4; i--) {
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

                plays.push((<div className={`play clearfix ${positionClass}`} style={{ zIndex: 999-i }} key={i}>Player {play.player} <Hand hand={play.cards} /></div>));
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