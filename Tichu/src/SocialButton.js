import React from 'react'
import SocialLogin from 'react-social-login'

const SocialButton = ({ triggerLogin, children, ...rest }) => {

    return (
        <button onClick={triggerLogin} {...rest}>
            { children}
        </button>
    );
}

export default SocialLogin(SocialButton);