import React, { Component, useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Lobby } from 'boardgame.io/react';
import { Tichu } from './Game';
import { TichuBoard } from './Board';
import { TichuLobby } from './TichuLobby';
import { gameServer, lobbyServer } from './ClientHelpers';
import { DebugClient } from './DebugClient';
import { TichuMatch } from './TichuClient';
import { Layout } from './Layout';
import { Login } from './Login';
import authService from './AuthService';

export const App = () => {
    return (
        <Layout>
            <AuthorizeRoute path='/defaultlobby'>
                <Lobby
                    gameServer={gameServer}
                    lobbyServer={lobbyServer}
                    gameComponents={[
                        { game: Tichu, board: TichuBoard }
                    ]}
                />
            </AuthorizeRoute>

            <Route path='/login' component={Login} />

            <AuthorizeRoute path='/match/:id' component={TichuMatch} />

            <AuthorizeRoute exact path='/'>
                <TichuLobby game="Tichu" gameServer={gameServer} />
            </AuthorizeRoute>
            <Route path='/debug' component={DebugClient} />
        </Layout>
    )
};

const AuthorizeRoute = (props) => {

    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    const populateState = () => {
        var isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
    }

    useEffect(() => {
        var subscriptionID = authService.subscribe(() => populateState());

        return () => {
            if (subscriptionID >= 0) {
                authService.unsubscribe(subscriptionID);
            }
        }
    });

    const { children, ...rest } = props;
    return (
        <Route {...rest}>
            {isAuthenticated && children}
            {!isAuthenticated && <Redirect to="/login" />}
        </Route>
        )
}