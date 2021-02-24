import React from 'react'

import SocialButton from './SocialButton'

const handleSocialLogin = (user) => {
    window.localStorage.setItem('id_token', user.token.idToken);
    console.log(user)
}

const handleSocialLoginFailure = (err) => {
    console.error(err)
}

export const Login = (props) => {
    return (
        <SocialButton
            provider='google'
            appId='1079895804620-utfn54l9ikdsrp143h1usq6f4iemte82.apps.googleusercontent.com'
            onLoginSuccess={handleSocialLogin}
            onLoginFailure={handleSocialLoginFailure}
            redirect='/'
        >
            Login with Google
        </SocialButton>
    );
}