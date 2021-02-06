import React from 'react';
import { Hand } from './Hand';
import { FormGroup, Button } from 'reactstrap';
import 'bootstrap';
const { getPartner } = require('./Game');

export const TichuBoard = (props) => {

    const {
        G,
        ctx,
        moves,
        playerID
    } = props;

    const player = G.players[playerID];

    const onGrandClicked = () => {
        moves.callGrand(playerID);
    }

    const onTakeClicked = () => {
        moves.takeCards(playerID);
    }

    var stage = ctx.activePlayers[playerID];

    const handleCardClicked = (cardID) => {

    }

    // <Hand hand={G.players[playerID].hand} />
    return (
        <div className="board">
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    <Hand backs={G.public.players[getPartner(playerID)].cards} />
                </div>
                <div className="board-side">
                    Empty
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Left Opponent
                </div>
                <div className="board-middle">
                    Play Area
                </div>
                <div className="board-side">
                    Right Opponent
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    <Hand hand={player.hand} onCardClicked={handleCardClicked} />
                    {stage === "takeOrGrand" &&
                        <FormGroup>
                            <Button color="primary" className="mx-1" onClick={onGrandClicked}>Grand Tichu</Button>
                            <Button color="primary" className="mx-1" onClick={onTakeClicked}>Take</Button>
                        </FormGroup>
                    }
                </div>
                <div className="board-side">
                    Empty
                </div>
            </div>
        </div>
    );
}