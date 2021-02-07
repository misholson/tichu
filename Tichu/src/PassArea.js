import React from 'react';
import { Card } from './Card';
import { Button } from 'reactstrap';
const { constants } = require('./Game');

export const PassArea = ({ stage, selectedCards = [], readyToPlay, onReturnPass, onPassConfirmed, onAcceptConfirmed }) => {

    var displayCards = Array(3).fill("back");
    for (var i = 0; i < 3; i++) {
        if (selectedCards.length > i) {
            displayCards[i] = selectedCards[i];
        }
    }
    if (stage !== constants.phases.preHand.stages.passCards && stage !== constants.phases.preHand.stages.acceptPass) {
        return (
            <>&nbsp;</>
        );
    }

    // We've already accepted our cards and we're just waiting on everyone else.
    if (stage === constants.phases.preHand.stages.acceptPass && readyToPlay) {
        return (
            <>&nbsp;</>
        );
    }

    const handleCardClicked = (cardID) => {
        if (stage === constants.phases.preHand.stages.passCards && onReturnPass) {
            onReturnPass(cardID);
        }
    }

    const handlePassConfirmed = () => {
        if (stage === constants.phases.preHand.stages.passCards && onPassConfirmed) {
            onPassConfirmed();
        }
    }

    const handleAcceptConfirmed = () => {
        if (stage === constants.phases.preHand.stages.acceptPass && onAcceptConfirmed) {
            onAcceptConfirmed();
        }
    }

    return (
        <table className="pass-area">
            <tbody>
                <tr>
                    <td></td>
                    <td><Card cardID={displayCards[1]} onCardClicked={handleCardClicked} /></td>
                    <td></td>
                </tr>
                <tr>
                    <td><Card cardID={displayCards[0]} onCardClicked={handleCardClicked} /></td>
                    <td></td>
                    <td><Card cardID={displayCards[2]} onCardClicked={handleCardClicked} /></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        {stage === constants.phases.preHand.stages.passCards && <Button color="primary" disabled={selectedCards.length !== 3} onClick={handlePassConfirmed}>Pass</Button>}
                        {stage === constants.phases.preHand.stages.acceptPass && <Button color="primary" onClick={handleAcceptConfirmed}>Accept</Button>}
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        )
}