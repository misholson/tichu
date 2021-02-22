import React from 'react';
const { constants } = require('./Constants');
import { usePlayerMetadata } from './ClientHelpers';

export const Player = ({ playerID, tichu, grand }) => {
    const playerMetadata = usePlayerMetadata()[playerID];
    return (
        <div style={{ float: "none" }}>
            {playerMetadata.name} {grand && <>GRAND</>} {tichu && <>TICHU</>} {playerMetadata.isActive && <>ACTIVE</>} 
        </div>
        )
}