import React, { useState } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Nav, NavbarText } from 'reactstrap';
import { Link } from 'react-router-dom';
import { SocialLogoutNavLink } from './SocialButton';
import authService from './AuthService';

export const NavMenu = ({ isAuth }) => {
    /*            <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                <NavbarBrand tag={Link} to="/">Tichu</NavbarBrand>
                <div className="flex-sm-row-reverse">
                </div>
            </Navbar>*/
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    return (
        <header>

            <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                <NavbarBrand tag={Link} to="/">Tichu</NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="mr-auto" navbar>
                        <NavItem>
                            <NavLink tag={Link} to="/">Lobby</NavLink>
                        </NavItem>
                    </Nav>
                    <Nav className="ml-auto" navbar>
                        {!isAuth && <NavItem>
                            <NavLink tag={Link} to="/login">Login</NavLink>
                        </NavItem>}
                        {isAuth && <>
                            <NavbarText>Hello, {authService.getDisplayName()}</NavbarText>
                            <NavItem>
                                <NavLink href="#" onClick={() => authService.logout()}>Logout</NavLink>
                            </NavItem>
                        </>}
                    </Nav>
                </Collapse>
            </Navbar>
        </header>
    );
}