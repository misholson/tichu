import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import { SocialButton } from './SocialButton'
import { Container, Card, CardHeader, CardBody } from 'reactstrap';
import authService from './AuthService';

export const Login = (props) => {
    let history = useHistory();

    const handleSocialLogin = (user) => {
        authService.onSignIn(user.token);
        history.push('/');
    }

    const handleSocialLoginFailure = (err) => {
        console.error(err)
    }

    return (
        <Container>
            <Card className="mx-auto" style={{ width: "18rem" }}>
                <CardHeader>Choose Login Provider</CardHeader>
                <CardBody>
                    <SocialButton
                        provider='google' buttonType='google'
                        appId='1079895804620-utfn54l9ikdsrp143h1usq6f4iemte82.apps.googleusercontent.com'
                        onLoginSuccess={handleSocialLogin}
                        onLoginFailure={handleSocialLoginFailure}
                        onLogoutSuccess={() => console.debug("logout")}
                        redirect='/'
                    />
                </CardBody>
            </Card>
        </Container>
    );
}