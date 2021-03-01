import React from 'react';
import { Hand } from './Hand';
import { Card } from './Card';
import { Button } from 'reactstrap';
const { constants } = require('./Constants');
import { useMediaQuery } from 'react-responsive';

export const PlayArea = ({ currentTrick, previousTricks, previousCardsWon, playerIDs, trickAcknowledged }) => {
    if ((!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) && previousTricks && previousTricks.length > 0) {
        // If the current trick hasn't started yet, keep displaying the previous trick with a note.
        if (!trickAcknowledged) {
            currentTrick = previousTricks[0];
        }
    } else if ((!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) && (!previousTricks || previousTricks.length === 0)) {
        // We're at the start of a new hand, so we should generate a "currentTrick" based on the cards won.
        currentTrick = {
            plays: []
        };
        if (previousCardsWon?.length > 0) {
            var previousEndState = previousCardsWon[0];
            Object.keys(previousEndState).forEach((playerID) => {
                currentTrick.plays.push({
                    cards: previousEndState[playerID],
                    player: playerID,
                    pass: false
                })
            });
        }
    }

    var plays = [];
    var size = 1.0;
    var leftOffset = 0;
    var topOffset = 0;
    var rightOffset = 0;
    var bottomOffset = 0;
    var offsetInterval = 10;
    if (currentTrick && currentTrick.plays) {
        for (var i = 0; i < currentTrick.plays.length; i++) {
            var play = currentTrick.plays[i];
            if (!play.pass) {
                var positionStyle = {}
                if (play.player === playerIDs.left) {
                    positionStyle = {
                        top: 120 - leftOffset,
                        left: 20 - leftOffset,
                        zIndex: 999 - i
                    }
                    leftOffset += offsetInterval;
                } else if (play.player === playerIDs.partner) {
                    positionStyle = {
                        top: 20 - topOffset,
                        left: 200 - topOffset,
                        zIndex: 999 - i
                    }
                    topOffset += offsetInterval;
                } else if (play.player === playerIDs.right) {
                    positionStyle = {
                        top: 140 - rightOffset,
                        left: 450 - rightOffset,
                        zIndex: 999 - i
                    }
                    rightOffset += offsetInterval;
                } else {
                    positionStyle = {
                        top: 260 - bottomOffset,
                        left: 300 - bottomOffset,
                        zIndex: 999 - i
                    }
                    bottomOffset += offsetInterval;
                }

                plays.push((<div className={`play clearfix`} style={positionStyle} key={i}><Hand hand={play.cards} size={size} /></div>));

                if (size >= .6) {
                    size *= .9;
                }
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