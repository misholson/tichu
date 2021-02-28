import React from 'react';
import { NavMenu } from './NavMenu';
import authService from './AuthService';

export const Layout = (props) => {
    return (
        <div>
            <NavMenu isAuth={authService.isAuthenticated()} />
            <div>
                {props.children}
            </div>
        </div>
    );
}
