import { Client } from 'boardgame.io/react';
import { TicTacToe } from './Game';
import { TicTacToeBoard } from './Board';

export const App = Client({
    game: TicTacToe,
    board: TicTacToeBoard
});