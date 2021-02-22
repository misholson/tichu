import React from 'react';
import { Route } from 'react-router';
import { Lobby } from 'boardgame.io/react';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { TichuLobby } from './TichuLobby';
import { gameServer, lobbyServer } from './ClientHelpers';
import { DebugClient } from './DebugClient';


export const App = () => {
    return (
        <>
            <Route exact path='/'>
                <Lobby
                    gameServer={gameServer}
                    lobbyServer={lobbyServer}
                    gameComponents={[
                        { game: Tichu, board: TichuBoard }
                    ]}
                />
            </Route>

            <Route path='/newlobby'>
                <TichuLobby game="Tichu" gameServer={gameServer} />
            </Route>
            <Route path='/debug' component={DebugClient} />
        </>
    )
};