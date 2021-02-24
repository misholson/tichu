import React, { useState } from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import scenarios from '../scenarios/scenarios';

// Run my janky unit tests.
import { runTests } from './tests/ValidPlayTests';
runTests();


const ExpandableClient = ({ playerID, scenario }) => {
    const [bodyVisible, setBodyVisible] = useState(true);

    const TichuClient = Client({
        game: scenario ? scenario(Tichu) : Tichu,
        board: TichuBoard,
        numPlayers: 4,
        multiplayer: Local()
        //multiplayer: SocketIO({ server: gameServer })
    });

    return (
        <div>
            <Card>
                <CardHeader tag="h5">Player {playerID}<Button className="mx-3" onClick={() => setBodyVisible(prev => !prev)}>View</Button>
                </CardHeader>
                {bodyVisible &&
                    <CardBody>
                        <TichuClient playerID={playerID} />
                    </CardBody>
                }
            </Card>
        </div>
    );
}

const DebugTable = ({ match }) => {
    var scenario = null;
    if (match?.params?.scenario && scenarios[match.params.scenario]) {
        scenario = scenarios[match.params.scenario];
    }
    return (
    <table style={{ width: "100%" }}>
        <tbody>
            <tr>
                <td><ExpandableClient playerID="0" scenario={scenario} /></td>
            </tr>
            <tr>
                <td><ExpandableClient playerID="1" scenario={scenario} /></td>
            </tr>
            <tr>
                <td><ExpandableClient playerID="2" scenario={scenario} /></td>
            </tr>
            <tr>
                <td><ExpandableClient playerID="3" scenario={scenario} /></td>
            </tr>
        </tbody>
    </table>
    )
}

export const DebugClient = ({ match }) => {
    return (
        <Switch>
            <Route path={match.path} exact component={DebugTable} />
            <Route path={`${match.path}/:scenario`} component={DebugTable} />
        </Switch>
    )
}