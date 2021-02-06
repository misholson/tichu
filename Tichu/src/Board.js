import React from 'react';

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

    const cellStyle = {
        border: '1px solid #555',
        width: '50px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
    };

    let tbody = [];
    for (let i = 0; i < 3; i++) {
        let cells = [];
        for (let j = 0; j < 3; j++) {
            const id = 3 * i + j;
            cells.push(
                <td style={cellStyle} key={id} onClick={() => onClick(id)}>
                    {props.G.cells[id]}
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