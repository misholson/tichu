import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Container, Row, Col, Card, CardHeader, CardBody, Table, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { LobbyClient } from 'boardgame.io/client';


export const TichuLobby = ({ game = "Tichu", gameServer }) => {

    const [matches, setMatches] = useState([]);
    const [intervalID, setIntervalID] = useState(null);
    const [playerName, setPlayerName] = useState(getPlayerName());

    const lobbyClient = useMemo(() => {
        return new LobbyClient({ server: gameServer });
    }, [gameServer])

    const getMatches = useCallback(() => {
        lobbyClient.listMatches(game)
            .then(({ matches: matchArray }) => {
                if (matchArray) {
                    setMatches([...matchArray]);
                }
            });

    }, [game]);

    const handleJoinMatch = (matchID, playerID) => {
        lobbyClient.joinMatch(game, matchID, {
            playerID: playerID,
            playerName: getPlayerName()
        })
            .then(({ playerCredentials }) => {
                window.localStorage.setItem(`match-${matchID}`, playerCredentials);
            });
    }

    useEffect(() => {
        setIntervalID(setInterval(getMatches, 1000));
        getMatches();

        return () => {
            if (intervalID) {
                clearInterval(intervalID);
            }
        }
    }, [getMatches]);

    const handleCreateMatch = () => {
        console.debug("Creating match");
        lobbyClient.createMatch(game, { numPlayers: 4 })
            .then(({ matchID }) => {
                handleJoinMatch(matchID, '0');
            })
    }

    return (
        <Container>
            <Row>
                <div className="float-right">
                    <FormGroup>
                        <Label id="nameLabel" for="nameInput">Name</Label>
                        <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                        <Button onClick={() => window.localStorage.setItem('playerName', playerName)}>Set</Button>
                    </FormGroup>
                </div>
            </Row>
            <Card>
                <CardHeader>Games
                    <div className="float-right">
                        <MatchModal className="pull-right" onCreate={handleCreateMatch}/>
                    </div>
                </CardHeader>
                <CardBody>
                    <Table>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Players</th>
                                <th>Created Time</th>
                                <th>Last Updated</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) =>
                                <Match match={match} key={match.matchID} onJoinMatch={handleJoinMatch} />
                                    )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Container>
        )
}

function getPlayerName() {
    return window.localStorage.getItem('playerName');
}

const MatchModal = ({ onCreate }) => {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleCreateClicked = () => {
        if (onCreate) {
            onCreate();
        }

        setCreateModalOpen(false);
    }
    return (
        <>
            <Button onClick={() => setCreateModalOpen(true)}>Create Match</Button>
            <Modal isOpen={createModalOpen}>
                <ModalHeader>New Match</ModalHeader>
                <ModalBody>
                    Match Settings
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleCreateClicked}>Create</Button>
                    <Button color="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
        )
};


const JoinModal = ({ onJoin, match, playerName }) => {
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    const handleJoinClicked = (playerID) => {
        if (onJoin) {
            onJoin(match.matchID, playerID);
        }

        setJoinModalOpen(false);
    }

    const handleLeaveClicked = () => {
        setJoinModalOpen(false);
    }

    return (
        <>
            <Button onClick={() => setJoinModalOpen(true)}>Join</Button>
            <Modal isOpen={joinModalOpen}>
                <ModalHeader>Join Match</ModalHeader>
                <ModalBody>
                    {match &&
                    <Row>
                        <Col xs={4}>
                            <JoinOrLeave position="0" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
                            <JoinOrLeave position="2" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
                        </Col>
                        <Col xs={4}>
                            Vs
                        </Col>
                        <Col xs={4}>
                            <JoinOrLeave position="1" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
                            <JoinOrLeave position="3" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
                        </Col>
                    </Row>
                    }
                </ModalBody>
            </Modal>
        </>
    )
}

const JoinOrLeave = ({ position, players, onJoin, onLeave }) => {
    var currentPlayer = players[position];

    const handleJoinClicked = () => {
        if (onJoin) {
            onJoin(position);
        }
    }

    const handleLeaveClicked = () => {
        if (onLeave) {
            onLeave(position);
        }
    }

    if (currentPlayer && currentPlayer.name) {
        const playerName = getPlayerName();
        if (currentPlayer.name === playerName) {
            return (
                <>
                    <Row>{playerName}</Row>
                    <Row><Button color="secondary" onClick={handleLeaveClicked}>Leave</Button></Row>
                </>
            )
        } else {
            return (
                <>
                    <Row>{currentPlayer.name}</Row>
                    <Row></Row>
                </>)
        }
    } else {
        return (
            <>
                <Row></Row>
                <Row><Button color="primary" onClick={handleJoinClicked}>Join</Button></Row>
                </>)
    }
}

                    /*<Row>
                        <Col xs={{ size: 4, offset: 4 }}>
                            <Button>Join N</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <Button>Join W</Button>
                        </Col>
                        <Col xs={4}>
                            Select Position
                        </Col>
                        <Col xs={4}>
                            <Button>Join E</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{ size: 4, offset: 4 }}>
                            <Button>Join S</Button>
                        </Col>
                    </Row>*/

const Match = ({ match, onJoinMatch }) => {
    return (
        <tr key={match.matchID}>
            <td>{JSON.stringify(match)}</td>
            <td>{match.createdAt}</td>
            <td>{match.updatedAt}</td>
            <td><JoinModal match={match} onJoin={onJoinMatch} /></td>
        </tr>
        )
}