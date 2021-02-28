import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { gameServer } from './ClientHelpers';
import lobbyClient from './AuthenticatedLobbyClient'

const TichuClient = Client({
    game: Tichu,
    board: TichuBoard,
    numPlayers: 4,
    multiplayer: SocketIO({ server: gameServer })
});

export const TichuMatch = (props) => {
    var matchID = props.match.params.id;

    var matchCredentials = lobbyClient.getMatchCredentials(matchID);

    if (!matchCredentials?.credentials) {
        return (
            <>
                You do not have access to this match.
            </>
        );
    }

    return (
        <TichuClient matchID={matchID} {...matchCredentials} debug={false} />
        )
}