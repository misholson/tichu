import React, { useState } from 'react';
import { Client, Lobby } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { TichuLobby } from './TichuLobby';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';

const TichuClient = Client({
    game: Tichu,
    board: TichuBoard,
    numPlayers: 4,
    multiplayer: SocketIO({ server: `${window.location.hostname}:${window.location.port}` })
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

export const App = () => {
    var gameServer = `http://${window.location.hostname}`;
    if (window.location.port && window.location.port !== ' ') {
        gameServer += `:${window.location.port}`;
    }
    gameServer += '/';
    return (
        <TichuLobby game="Tichu" gameServer={gameServer} />
    
        /*<Lobby
            gameServer={gameServer}
            lobbyServer={gameServer}
            gameComponents={[
                { game: Tichu, board: TichuBoard }
            ]}
        />*/
/*<TichuClient playerID="0" />*/

    /*<table style={{ width: "100%" }}>
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
    </table>*/
)};