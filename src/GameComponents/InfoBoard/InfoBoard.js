import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import styles from './InfoBoard.module.scss';

export default function InfoBoard({children, isDarkPiece}) {
    const infoBoardStyles = cx(
        styles.infoBoard,
        {[styles.blackTeamView]: isDarkPiece}
    )

    return (
        <div className={infoBoardStyles}>
             <div className={styles.infoBoardBackground}></div>
              {children}
        </div>
    );
}