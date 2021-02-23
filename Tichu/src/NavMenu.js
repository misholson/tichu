import React, { useState } from 'react';
import { Collapse, Container, Navbar, NavbarBrand } from 'reactstrap';
import { Link } from 'react-router-dom';

export const NavMenu = () => {

    return (
        <header>
            <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                <NavbarBrand tag={Link} to="/">Tichu</NavbarBrand>
            </Navbar>
        </header>
    );
}