import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Tichu } from './Game';
import { TichuBoard } from './Board';

const TichuClient = Client({
    game: Tichu,
    board: TichuBoard,
    numPlayers: 4,
    multiplayer: SocketIO({ server: 'localhost:1337' })
});

export const App = () => (
    <table style={{ width: "100%" }}>
        <tbody>
            <tr>
                <td><TichuClient playerID="0" /></td>
            </tr>
            <tr>
                <td><TichuClient playerID="1" /></td>
            </tr>
            <tr>
                <td><TichuClient playerID="2" /></td>
            </tr>
            <tr>
                <td><TichuClient playerID="3" /></td>
            </tr>
        </tbody>
    </table>
);