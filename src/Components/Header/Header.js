import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link, Icon } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import cx from 'classnames';
import styles from './Header.module.scss';

function Header() {
    const { pathname } = useLocation();
    const hideBackButton = pathname === '/';
    return (
        <header className={styles.header}>
            <Link
                color="primary"
                to="/"
                className={cx({ [styles.invisible]: hideBackButton })}
                component={RouterLink}
            >
                <Icon className="fas fa-arrow-left" color="primary" />
            </Link>
            Dark Chess
        </header>
    );
}

export default Header;
