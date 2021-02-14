import React from 'react';
const { constants } = require('./Constants');

export const Player = ({ playerID, phase, currentPlayer, tichu, grand }) => {
    var displayIsActive = (phase === constants.phases.playTrick.name && playerID === currentPlayer);
    return (
        <div style={{ float: "none" }}>
            Player {playerID} {grand && <>GRAND</>} {tichu && <>TICHU</>} {displayIsActive && <>ACTIVE</>} 
        </div>
        )
}