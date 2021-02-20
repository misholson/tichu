import React from 'react';
const { constants } = require('./Constants');
import { getPlayerName } from './ClientHelpers';

export const Player = ({ playerID, phase, currentPlayer, tichu, grand, matchData }) => {
    var displayIsActive = (phase === constants.phases.playTrick.name && playerID === currentPlayer);
    var playerName = getPlayerName(playerID, matchData);
    return (
        <div style={{ float: "none" }}>
            {playerName} {grand && <>GRAND</>} {tichu && <>TICHU</>} {displayIsActive && <>ACTIVE</>} 
        </div>
        )
}