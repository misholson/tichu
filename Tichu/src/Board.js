import React, { useState, useEffect } from 'react';
import { Hand, OpponentHand, PartnerHand } from './Hand';
import { PassArea } from './PassArea';
import { FormGroup, Button } from 'reactstrap';
import 'bootstrap';
const { sortCards, removeFromHand, getPlayerIDs, constants } = require('./Game');

export const TichuBoard = (props) => {

    const {
        G,
        ctx,
        moves,
        playerID
    } = props;

    const player = G.players[playerID];
    var stage = ctx.activePlayers[playerID];
    var playerIDs = getPlayerIDs(ctx, playerID);

    const [passedCards, setPassedCards] = useState([]);
    const [hand, setHand] = useState(player.hand);


    const onGrandClicked = () => {
        moves.callGrand(playerID);
    }

    const onTakeClicked = () => {
        moves.takeCards(playerID);
    }

    // If the game stage or phase changes, refresh the hand from the game state.
    useEffect(() => {
        setHand(() => {
            return [...player.hand];
        })
    }, [stage]);


    const handleCardClicked = (cardID) => {
        switch (stage) {
            case constants.phases.preHand.stages.passCards:
                if (passedCards.length < 3) {
                    setPassedCards([...passedCards, cardID]);

                    // Remove the card from the local hand.
                    setHand(removeFromHand(hand, cardID));
                }
                break;
            default:
                break;
        }
    }

    const handleReturnPass = (cardID) => {
        setPassedCards(removeFromHand(passedCards, cardID));

        // Add the card back into your hand.
        hand.push(cardID);
        sortCards(hand);
        setHand([...hand]);
    }

    const handlePassConfirmed = () => {
        if (stage === constants.phases.preHand.stages.passCards && passedCards.length === 3) {
            moves.passCards(playerID, passedCards);
        }
    }

    const receivedCards = []

    if (stage === constants.phases.preHand.stages.acceptPass) {
        receivedCards.push(player.receivedPass[playerIDs.left]);
        receivedCards.push(player.receivedPass[playerIDs.partner]);
        receivedCards.push(player.receivedPass[playerIDs.right]);
    }

    // <Hand hand={G.players[playerID].hand} />
    return (
        <div className="board">
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    Player: {playerIDs.partner}
                    <PartnerHand backs={G.public.players[playerIDs.partner].cards} />
                </div>
                <div className="board-side">
                    Empty
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Player: {playerIDs.left}
                    <OpponentHand backs={G.public.players[playerIDs.left].cards} />
                </div>
                <div className="board-middle">
                    <PassArea selectedCards={stage === constants.phases.preHand.stages.passCards ? passedCards : receivedCards} stage={stage} onReturnPass={handleReturnPass} onPassConfirmed={handlePassConfirmed} />
                </div>
                <div className="board-side">
                    Player: {playerIDs.right}
                    <OpponentHand backs={G.public.players[playerIDs.right].cards} />
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    Player: {playerID}
                    <Hand hand={hand} onCardClicked={handleCardClicked} />
                    {stage === constants.phases.preHand.stages.takeOrGrand &&
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