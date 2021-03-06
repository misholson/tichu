import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { constants } from './Constants';
import { usePlayerMetadata } from './ClientHelpers';

export const TrickOverNotification = ({ G, okClicked }) => {
    var playerMetadata = usePlayerMetadata();
    var text = "Trick has ended.";
    if (G.previousTricks) {
        var previousTrick = G.previousTricks[0];
        var winnerName = playerMetadata[previousTrick.winner].name;
        if (previousTrick.plays[0].cards[0] === constants.specials.dog) {
            var partnerName = playerMetadata[previousTrick.plays[0].player].name;
            text = `${partnerName} passed the Dog to ${winnerName}`;
        } else {
            text = `${winnerName} has won the trick`;
        }
    }

    const [intervalSettings, setIntervalSettings] = useState(() => {
        return {
            secondsLeft: 3,
            interval: null
        }
    });

    const countdownRefresh = () => {
        setIntervalSettings((prev) => {
            return {
                ...prev,
                secondsLeft: prev.secondsLeft - 1
            }
        });
    }

    const handleClose = () => {
        okClicked();
        clearInterval(intervalSettings.interval);
    }

    useEffect(() => {
        if (!intervalSettings.interval) {
            setIntervalSettings((prev) => {
                return {
                    ...prev,
                    interval: setInterval(countdownRefresh, 1000)
                }
            });
        } else if (intervalSettings.secondsLeft <= 0) {
            handleClose();
        }
    })

    return (
        <Modal isOpen={true}>
            <ModalHeader>
                Trick Ended
            </ModalHeader>
            <ModalBody>
                {text}
            </ModalBody>
            <ModalFooter>
                Closing in {intervalSettings.secondsLeft}... <Button color="primary" onClick={handleClose}>OK</Button>
            </ModalFooter>
        </Modal>
    )
}