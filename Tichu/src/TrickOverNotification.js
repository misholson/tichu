import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export const TrickOverNotification = ({ winnerName, okClicked }) => {
    // if (!G.currentTrick && G.previousTricks && G.previousTricks.length > 0) 
    // then we're between tricks.
    return (
        <Modal isOpen={true}>
            <ModalHeader>
                Trick Ended
            </ModalHeader>
            <ModalBody>
                {winnerName} has won the trick
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => okClicked()}>OK</Button>
            </ModalFooter>
        </Modal>
    )
}