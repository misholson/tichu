import React from 'react';
import { Card } from './Card';
import { Button } from 'reactstrap';

export const PassArea = ({ stage, selectedCards = [], onReturnPass, onPassConfirmed }) => {

    var displayCards = Array(3).fill("back");
    for (var i = 0; i < 3; i++) {
        if (selectedCards.length > i) {
            displayCards[i] = selectedCards[i];
        }
    }
    if (stage !== "passCards" && stage !== "waitForPass" && stage !== "receivePass") {
        return (
            <>&nbsp;</>
        );
    }

    return (
        <table className="pass-area">
            <tbody>
                <tr>
                    <td></td>
                    <td><Card cardID={displayCards[1]} onCardClicked={onReturnPass} /></td>
                    <td></td>
                </tr>
                <tr>
                    <td><Card cardID={displayCards[0]} onCardClicked={onReturnPass} /></td>
                    <td></td>
                    <td><Card cardID={displayCards[2]} onCardClicked={onReturnPass} /></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        {stage === "passCards" && <Button color="primary" disabled={selectedCards.length !== 3} onClick={onPassConfirmed}>Pass</Button>}
                        {stage === "receivePass" && <Button color="primary">Accept</Button>}
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        )
}