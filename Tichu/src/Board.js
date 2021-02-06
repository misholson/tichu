import React from 'react';
import { cardDefinitions } from './Deck';
import { Card } from './Card';

export const TicTacToeBoard = (props) => {

    const onClick = (id) => {
        props.moves.clickCell(id);
    }

    let winner = '';
    if (props.ctx.gameover) {
        winner =
            props.ctx.gameover.winner !== undefined ? (
                <div id="winner">Winner: {props.ctx.gameover.winner}</div>
            ) : (
                    <div id="winner">Draw!</div>
                );
    }

    let tbody = [];
    for (let i = 0; i < 3; i++) {
        let cells = [];
        for (let j = 0; j < 3; j++) {
            const id = 3 * i + j;
            cells.push(
                <td key={id} onClick={() => onClick(id)}>
                    <Card card={cardDefinitions[id]} />
                </td>
            );
        }
        tbody.push(<tr key={i}>{cells}</tr>);
    }

    return (
        <div>
            <table id="board">
                <tbody>{tbody}</tbody>
            </table>
            {winner}
        </div>
    );
}