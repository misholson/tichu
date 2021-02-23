import React from 'react';
import { Route } from 'react-router';
import { Lobby } from 'boardgame.io/react';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { TichuLobby } from './TichuLobby';
import { gameServer, lobbyServer } from './ClientHelpers';
import { DebugClient } from './DebugClient';
import { TichuMatch } from './TichuClient';
import { Layout } from './Layout';

export const App = () => {
    return (
        <Layout>
            <Route path='/defaultlobby'>
                <Lobby
                    gameServer={gameServer}
                    lobbyServer={lobbyServer}
                    gameComponents={[
                        { game: Tichu, board: TichuBoard }
                    ]}
                />
            </Route>

            <Route path='/match/:id' component={TichuMatch} />

            <Route exact path='/'>
                <TichuLobby game="Tichu" gameServer={gameServer} />
            </Route>
            <Route path='/debug' component={DebugClient} />
        </Layout>
    )
};