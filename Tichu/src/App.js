import React, { useState } from 'react';
import { Route } from 'react-router';
import { Client, Lobby } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { TichuLobby } from './TichuLobby';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import { gameServer, lobbyServer } from './ClientHelpers';

const TichuClient = Client({
    game: Tichu,
    board: TichuBoard,
    numPlayers: 4,
    multiplayer: Local()
    //multiplayer: SocketIO({ server: gameServer })
});

const ExpandableClient = ({ playerID }) => {
    const [bodyVisible, setBodyVisible] = useState(true);

    return (
        <div>
            <Card>
                <CardHeader tag="h5">Player {playerID}<Button className="mx-3" onClick={() => setBodyVisible(prev => !prev)}>View</Button>
                </CardHeader>
                {bodyVisible &&
                <CardBody>
                    <TichuClient playerID={playerID} />
                </CardBody>
                }
            </Card>
        </div>
    );
}

export const LocalClient = () => {
    return (
        <table style={{ width: "100%" }}>
            <tbody>
                <tr>
                    <td><ExpandableClient playerID="0" /></td>
                </tr>
                <tr>
                    <td><ExpandableClient playerID="1" /></td>
                </tr>
                <tr>
                    <td><ExpandableClient playerID="2" /></td>
                </tr>
                <tr>
                    <td><ExpandableClient playerID="3" /></td>
                </tr>
            </tbody>
        </table>
        )
}

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

            <Route path='/newlobby' component={TichuLobby}>
                <TichuLobby game="Tichu" gameServer={gameServer} />
            </Route>
            <Route path='/local'>
                <LocalClient />
            </Route>
        </>
)};