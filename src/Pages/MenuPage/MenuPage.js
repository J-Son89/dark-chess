import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/DCpic.png';
import styles from './MenuPage.module.scss';
import crypto from 'crypto';

const generateKey = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

function MenuPage() {
    return (
        <div className={styles.menuPage}>
            <div className={styles.logo}>
                <img src={logo} className={styles.logoImg} />
            </div>
            <div className={styles.menuOptions}>
                <Link
                    to={`/play/ab`}
                    className={styles.menuOption}
                >
                    <div className={styles.menuOptionBackground} />
                    <span className={styles.menuOptionText}>Private Game</span>
                </Link>
                <Link to="/play" className={styles.menuOption}>
                    <div className={styles.menuOptionBackground} />
                    <span className={styles.menuOptionText}>Public Game</span>
                </Link>
                <Link to="/how_to_play" className={styles.menuOption}>
                    <div className={styles.menuOptionBackground} />
                    <span className={styles.menuOptionText}>How To Play</span>
                </Link>
            </div>
        </div>
    );
}

export default MenuPage;
