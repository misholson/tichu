import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Container, Row, Col, Card, CardHeader, CardBody, Table, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { LobbyClient } from 'boardgame.io/client';
import { gameServer as defaultGameServer, setMatchCrendentials, getMatchCredentials } from './ClientHelpers';


export const TichuLobby = ({ game = "Tichu", gameServer = defaultGameServer }) => {

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
                setMatchCrendentials(matchID, playerID, playerCredentials);
            });
    }

    const handleLeaveMatch = (matchID) => {
        var matchCredentials = getMatchCredentials(matchID);
        if (matchCredentials) {
            lobbyClient.leaveMatch(game, matchID, { ...matchCredentials });
        }
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
                                <th>N</th>
                                <th>S</th>
                                <th>Vs</th>
                                <th>E</th>
                                <th>W</th>
                                <th>Play</th>
                                <th>Created Time</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) =>
                                <Match match={match} key={match.matchID} onJoinMatch={handleJoinMatch} onLeaveMatch={handleLeaveMatch} />
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
                <Row>[Open]</Row>
                <Row><Button color="primary" onClick={handleJoinClicked}>Join</Button></Row>
                </>)
    }
}

const Match = ({ match, onJoinMatch, onLeaveMatch }) => {
    const handleJoinClicked = (position) => {
        if (onJoinMatch) {
            onJoinMatch(match.matchID, position)
        }
    }

    const handleLeaveClicked = (position) => {
        if (onLeaveMatch) {
            onLeaveMatch(match.matchID, position);
        }
    }

    const hasMatchCredentials = (matchID) => {
        return !!getMatchCredentials(matchID);
    }

    return (
        <tr key={match.matchID}>
            <td>
                <JoinOrLeave position="0" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>
                <JoinOrLeave position="2" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>Vs</td>
            <td>
                <JoinOrLeave position="3" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>
                <JoinOrLeave position="1" players={match.players} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>{hasMatchCredentials(match.matchID) && <Button color="primary" tag="a" href={`#/match/${match.matchID}`}>Play</Button>}</td>
            <td>{new Date(match.createdAt).toLocaleString()}</td>
            <td>{new Date(match.updatedAt).toLocaleString()}</td>
        </tr>
        )
}