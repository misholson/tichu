import React from 'react'
import { NavLink } from 'reactstrap';
import SocialLogin from 'react-social-login';
import {
    FacebookLoginButton,
    GoogleLoginButton,
    GithubLoginButton,
    TwitterLoginButton,
    AmazonLoginButton,
    InstagramLoginButton,
    LinkedInLoginButton,
    MicrosoftLoginButton,
    BufferLoginButton
} from "react-social-login-buttons";
import authService from './AuthService';

const SocialButtonInner = ({ triggerLogin, triggerLogout, buttonType, children, ...rest }) => {

    authService.addLogoutProvider(buttonType, triggerLogout);
    if (buttonType === "google") {
        return (
            <GoogleLoginButton onClick={triggerLogin} {...rest} />
            )
    }
    if (buttonType === "twitter") {
        return (
            <TwitterLoginButton onClick={triggerLogin} {...rest} />
        )
    }
    return (
        <button onClick={triggerLogin} {...rest}>
            {children}
        </button>
    );
}

export const SocialButton = SocialLogin(SocialButtonInner);