import React, { useState, useEffect } from 'react';
import { Hand, OpponentHand, PartnerHand } from './Hand';
import { Player } from './Player';
import { PassArea } from './PassArea';
import { FormGroup, Button } from 'reactstrap';
import 'bootstrap';
const { sortCards, removeFromHand, getPlayerIDs, addToHand } = require('./Helpers');
const { constants } = require('./Constants');
const { validPlays, detectPlayType, canPass, isValidPlay } = require('./ValidPlays');

export const TichuBoard = (props) => {

    const {
        G,
        ctx,
        moves,
        playerID
    } = props;

    const player = G.players[playerID];
    var stage = null;
    if (ctx.activePlayers) {
        stage = ctx.activePlayers[playerID];
    }
    var phase = ctx.phase;
    var playerIDs = getPlayerIDs(ctx, playerID);
    var isPlayerActive = (phase === constants.phases.primaryPlay.name && playerID === ctx.currentPlayer)

    const [passedCards, setPassedCards] = useState([]);
    const [hand, setHand] = useState(player.hand);
    const [selectedCards, setSelectedCards] = useState([]);


    const onGrandClicked = () => {
        moves.callGrand(playerID);
    }

    const onTakeClicked = () => {
        moves.takeCards(playerID);
    }

    var readyToPlay = G.public.players[playerID].readyToPlay;

    // If the game stage or phase changes, refresh the hand from the game state.
    useEffect(() => {
        setHand(() => {
            return [...player.hand];
        });
    }, [stage, readyToPlay, isPlayerActive]);

    const selectCardToPass = (cardID) => {
        if (passedCards.length < 3) {
            setPassedCards([...passedCards, cardID]);

            // Remove the card from the local hand.
            setHand(removeFromHand(hand, cardID));
        }
    }

    const selectCardForPlay = (cardID) => {
        console.debug(`card clicked: ${cardID}`);
        var newSelection = [...selectedCards];
        if (selectedCards.some((c) => c === cardID)) {
            removeFromHand(newSelection, cardID);
        } else {
            addToHand(newSelection, cardID);
        }
        setSelectedCards(newSelection);
    }

    const handleCardClicked = (cardID) => {
        if (phase === constants.phases.preHand.name && stage === constants.phases.preHand.stages.passCards) {
            selectCardToPass(cardID);
        } else if (phase === constants.phases.primaryPlay.name && playerID === ctx.currentPlayer) {
            selectCardForPlay(cardID);
        }
    }

    // See what kind of play is selected.
    var selectedPlayType = validPlays[detectPlayType(selectedCards)];

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

    const handleAcceptConfirmed = () => {
        moves.acceptPass(playerID);
    }

    const receivedCards = []

    if (stage === constants.phases.preHand.stages.acceptPass) {
        receivedCards.push(player.receivedPass[playerIDs.left]);
        receivedCards.push(player.receivedPass[playerIDs.partner]);
        receivedCards.push(player.receivedPass[playerIDs.right]);
    }

    const onPlayClicked = () => {
        if (isPlayerActive) {
            moves.playCards(selectedCards);
            setSelectedCards([]);
        }
    }

    const onPassClicked = () => {
        if (isPlayerActive) {
            moves.pass();
            setSelectedCards([]);
        }
    }

    return (
        <div className="board">
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    <Player playerID={playerIDs.partner} phase={phase} currentPlayer={ctx.currentPlayer} />
                    <PartnerHand backs={G.public.players[playerIDs.partner].cards} />
                </div>
                <div className="board-side">
                    Empty
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    <Player playerID={playerIDs.left} phase={phase} currentPlayer={ctx.currentPlayer} />
                    Player: {playerIDs.left}
                    <OpponentHand backs={G.public.players[playerIDs.left].cards} />
                </div>
                <div className="board-middle">
                    {phase === constants.phases.preHand.name && <PassArea selectedCards={stage === constants.phases.preHand.stages.passCards ? passedCards : receivedCards} stage={stage} readyToPlay={G.public.players[playerID].readyToPlay} onReturnPass={handleReturnPass} onPassConfirmed={handlePassConfirmed} onAcceptConfirmed={handleAcceptConfirmed} />}
                    {phase === constants.phases.primaryPlay.name && <>Selected Play Type: {selectedPlayType?.name}<br />{isValidPlay(selectedCards, G.currentTrick) ? "VALID" : "INVALID"}</>}
                </div>
                <div className="board-side">
                    <Player playerID={playerIDs.right} phase={phase} currentPlayer={ctx.currentPlayer} />
                    <OpponentHand backs={G.public.players[playerIDs.right].cards} />
                </div>
            </div>
            <div className="board-row">
                <div className="board-side">
                    Empty
                </div>
                <div className="board-middle">
                    <Player playerID={playerID} phase={phase} currentPlayer={ctx.currentPlayer} />
                    <Hand hand={hand} selectedCards={selectedCards} onCardClicked={handleCardClicked} />
                    {stage === constants.phases.preHand.stages.takeOrGrand &&
                        <FormGroup>
                            <Button color="primary" className="mx-1" onClick={onGrandClicked}>Grand Tichu</Button>
                            <Button color="primary" className="mx-1" onClick={onTakeClicked}>Take</Button>
                        </FormGroup>
                    }
                    {isPlayerActive &&
                        <FormGroup>
                            <Button color="primary" className="mx-1" onClick={onPlayClicked} disabled={!selectedPlayType?.isValid(selectedCards, G.currentTrick)}>Play</Button>
                            <Button color="primary" className="mx-1" onClick={onPassClicked} disabled={!canPass(G.currentTrick)}>Pass</Button>
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