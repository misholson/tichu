import React from 'react';
const { constants } = require('./Constants');

export const Player = ({ playerID, phase, currentPlayer, tichu, grand, matchData }) => {
    var displayIsActive = (phase === constants.phases.playTrick.name && playerID === currentPlayer);
    var playerName = `Player ${playerID}`;
    if (matchData) {
        var playerNum = parseInt(playerID);
        var playerInfo = Object.values(matchData).find(playerInfo => playerInfo.id === playerNum);
        if (playerInfo) {
            playerName = playerInfo.name;
        }
    }
    return (
        <div style={{ float: "none" }}>
            {playerName} {grand && <>GRAND</>} {tichu && <>TICHU</>} {displayIsActive && <>ACTIVE</>} 
        </div>
        )
}