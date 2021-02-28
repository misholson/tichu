import React, { useEffect, useState, useCallback } from 'react';
import { Button, Container, Row, Card, CardHeader, CardBody, Table } from 'reactstrap';
import lobbyClient from './AuthenticatedLobbyClient'
import { gameServer as defaultGameServer } from './ClientHelpers';
import authService from './AuthService';


export const TichuLobby = ({ game = "Tichu" }) => {

    const [matches, setMatches] = useState([]);

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
        lobbyClient.leaveMatch(game, matchID);
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
                        <Button color="primary" onClick={handleCreateMatch}>Create Match</Button>
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


const JoinOrLeave = ({ position, match, onJoin, onLeave }) => {
    var players = match.players;
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
        // A player has joined in this position.
        if (lobbyClient.getMatchCredentials(match.matchID).playerID === position) {
            // The logged in player has already joined at this position
            return (
                <>
                    <Row>{authService.getDisplayName()}</Row>
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
        var isInGame = !!lobbyClient.isInGame(match.matchID);
        return (
            <>
                <Row>[Open]</Row>
                <Row><Button color="primary" onClick={handleJoinClicked} disabled={isInGame}>Join</Button></Row>
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

    var playersInGame = 0;
    Object.values(match.players).forEach((p) => {
        if (p.name) { playersInGame++; }
    });
    var readyToPlay = playersInGame === 4 && lobbyClient.isInGame(match.matchID);

    return (
        <tr key={match.matchID}>
            <td>
                <JoinOrLeave position="0" match={match} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>
                <JoinOrLeave position="2" match={match} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>Vs</td>
            <td>
                <JoinOrLeave position="3" match={match} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>
                <JoinOrLeave position="1" match={match} onJoin={handleJoinClicked} onLeave={handleLeaveClicked} />
            </td>
            <td>{readyToPlay && <Button color="primary" tag="a" href={`#/match/${match.matchID}`}>Play</Button>}</td>
            <td>{new Date(match.createdAt).toLocaleString()}</td>
            <td>{new Date(match.updatedAt).toLocaleString()}</td>
        </tr>
        )
}