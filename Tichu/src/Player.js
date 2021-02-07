import React from 'react';
const { constants } = require('./Constants');

export const Player = ({ playerID, phase, currentPlayer }) => {
    var displayIsActive = (phase === constants.phases.primaryPlay.name && playerID === currentPlayer);
    return (
        <div style={{ float: "none" }}>
            Player {playerID} {displayIsActive && <>ACTIVE</>}
        </div>
        )
}