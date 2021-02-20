import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { constants } from './Constants';
import { getPlayerName } from './ClientHelpers';

export const TrickOverNotification = ({ G, matchData, okClicked }) => {
    // if (!G.currentTrick && G.previousTricks && G.previousTricks.length > 0) 
    // then we're between tricks.
    var text = "Trick has ended.";
    if (G.previousTricks) {
        var previousTrick = G.previousTricks[0];
        var winnerName = getPlayerName(previousTrick.winner, matchData);
        if (previousTrick.plays[0].cards[0] === constants.specials.dog) {
            var partnerName = getPlayerName(previousTrick.plays[0].player, matchData);
            text = `${partnerName} passed the Dog to ${winnerName}`;
        } else {
            text = `${winnerName} has won the trick`;
        }
    }
    return (
        <Modal isOpen={true}>
            <ModalHeader>
                Trick Ended
            </ModalHeader>
            <ModalBody>
                {text}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => okClicked()}>OK</Button>
            </ModalFooter>
        </Modal>
    )
}