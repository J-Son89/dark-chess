import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { useGameContextValue } from '../../GameComponents/Game';
import Clock from '../../GameComponents/Clock';

import constants from '../../Constants';
import styles from './GameInfo.module.scss';
import monkeyImg from '../../images/monkey.jpg';
import duckImg from '../../images/duck.jpg';
import getPieceGenerator from '../Board/getPieceGenerator';
import { flowRight } from 'lodash';
//TO DO: make a generic helper
const getIsEnemiesTurn = (team, blacksTurn) =>
    (team === constants.WHITE && blacksTurn) ||
    (team === constants.BLACK && !blacksTurn);

export default function GameInfo({ isTop = false }) {
    const team = sessionStorage.getItem(constants.TEAM);
    const [
        { blacksTurn, currentPlayerInCheck, piecesTaken },
    ] = useGameContextValue();

    const isEnemiesTurn = getIsEnemiesTurn(team, blacksTurn);
    const isInCheck =
        currentPlayerInCheck &&
        ((isEnemiesTurn && isTop) || (!isEnemiesTurn && !isTop));

    const isLightTeam = team === constants.WHITE;

    const isDarkTeamPanel = (isLightTeam && isTop) || (!isLightTeam && !isTop);

    const gameInfoStyles = cx(styles.gameInfo, {
        [styles.blackTeamView]: isDarkTeamPanel,
        [styles.gameInfoTop]: isTop,
        [styles.gameInfoBottom]: !isTop,
        [styles.playerInCheck]: isInCheck,
    });

    const enemyPieceFilter = makeFilter(isDarkTeamPanel ? 'white' : 'black');
    const arrayOfPiecesToDisplay = getPiecesToDisplay(enemyPieceFilter)(
        piecesTaken
    );
    return (
        <div className={gameInfoStyles}>
            <div className={styles.gameInfoBackground}></div>
            <div className={styles.userProfile}>
                <img
                    className={styles.playerIcon}
                    src={isDarkTeamPanel ? monkeyImg : duckImg}
                />
                <h3 className={styles.playerName}>
                    {isDarkTeamPanel ? 'player1' : 'player2'}
                </h3>
            </div>
            <div className={styles.clockContainer}>
                <div className={styles.clock}>
                    <Clock isDarkTeamClock={isDarkTeamPanel} />
                </div>
            </div>
            <PiecesTaken
                styles={styles}
                isDarkTeamPanel={isDarkTeamPanel}
                piecesToDisplay={arrayOfPiecesToDisplay}
            />
        </div>
    );
}

const makeFilter = team => piece => piece.includes(team);

const sortPiecesByType = piecesArray =>
    ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen'].flatMap(type =>
        piecesArray
            .filter(piece => piece.includes(type))
            .map(piece => {
                const { generatePiece } = getPieceGenerator(piece);
                return [
                    generatePiece({
                        externalClassName: styles.pieceTaken,
                        isDark: piece.includes('black'),
                        pieceId: piece,
                        canSeePiece: true,
                        canDrag: false,
                    }),
                    type,
                ];
            })
    );
const getPiecesToDisplay = enemyPieceFilter =>
    flowRight(
        sortPiecesByType,
        team => team.filter(enemyPieceFilter)
    );

const composeLog = x => {
    console.log(x);
    return x;
};

const getSpacing = (index, baseValue) => 8 * index + baseValue;

const PiecesTaken = ({ styles, piecesToDisplay = [] }) => {
    const firstPiece = piecesToDisplay[0];
    if (!firstPiece) {
        return null;
    }
    let lastType = firstPiece && firstPiece[1];
    console.log(lastType);
    let lastValue = 0;
    return (
        <div className={styles.piecesTakenContainer}>
            {piecesToDisplay.map(([Piece, type], index) => {
                lastValue = lastType === type ? lastValue : lastValue + 8;
                const pieceDisplay = (
                    <div className={styles.piecesTaken}>
                        <span
                            style={{
                                left: getSpacing(index, lastValue),
                                position: 'absolute',
                            }}
                        >
                            {Piece}
                        </span>
                    </div>
                );
                lastType = type;
                return pieceDisplay;
            })}
        </div>
    );
};
