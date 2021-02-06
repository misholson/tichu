import React from 'react';
import { Hand, OpponentHand, PartnerHand } from './Hand';
import { FormGroup, Button } from 'reactstrap';
import 'bootstrap';

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

    var playOrder = ctx.playOrder;
    var myPlayIndex = playOrder.findIndex((pId) => pId === playerID);
    var leftPlayerID = playOrder[(myPlayIndex + 1) % 4];
    var partnerID = playOrder[(myPlayIndex + 2) % 4];
    var rightPlayerID = playOrder[(myPlayIndex + 3) % 4];

    // <Hand hand={G.players[playerID].hand} />
    return (
        <div className="board">
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    Player: {partnerID}
                    <PartnerHand backs={G.public.players[partnerID].cards} />
                </div>
                <div className="board-side">
                    Empty
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Player: {leftPlayerID}
                    <OpponentHand backs={G.public.players[leftPlayerID].cards} />
                </div>
                <div className="board-middle">
                    Play Area
                </div>
                <div className="board-side">
                    Player: {rightPlayerID}
                    <OpponentHand backs={G.public.players[rightPlayerID].cards} />
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    Player: {playerID}
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