import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Container, Row, Col, Card, CardHeader, CardBody, Table, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { LobbyClient } from 'boardgame.io/client';
import { AuthenticatedLobbyClient } from './AuthenticatedLobbyClient'
import { gameServer as defaultGameServer, setMatchCrendentials, getMatchCredentials } from './ClientHelpers';
import jwt from 'jsonwebtoken';
import authService from './AuthService';


export const TichuLobby = ({ game = "Tichu", gameServer = defaultGameServer }) => {

    const [matches, setMatches] = useState([]);

    const lobbyClient = useMemo(() => {
        return new AuthenticatedLobbyClient({ server: gameServer });
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
        lobbyClient.joinMatch(game, matchID, playerID);
    }

    const handleLeaveMatch = (matchID) => {
        var matchCredentials = getMatchCredentials(matchID);
        if (matchCredentials) {
            lobbyClient.leaveMatch(game, matchID, { ...matchCredentials });
        }
    }

    useEffect(() => {
        var intervalID = setInterval(getMatches, 1000);
        getMatches();

        return () => {
            if (intervalID) {
                clearInterval(intervalID);
            }
        };
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
            <Card>
                <CardHeader><h5 className="float-left">Games</h5>
                    <div className="float-right">
                        <Button onClick={handleCreateMatch}>Create Match</Button>
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
        const playerName = authService.getDisplayName();
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