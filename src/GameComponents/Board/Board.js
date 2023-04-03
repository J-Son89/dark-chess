import React, { useEffect, useState } from 'react';
import '../../globalVars';
import cx from 'classnames';
import { useGameContextValue, isDark } from '../Game';
import getPieceGenerator from './getPieceGenerator';
import {
    checkPossibleMovesWithEnemies,
    checkIfPiecesAttackingKing,
} from '../Pieces';
import BoardSquare from '../BoardSquare';
import Modal from '../../Components/Modal';
import constants from '../../Constants';
import styles from './Board.module.scss';

function Board() {
    const [currentState, gameActionDispatch] = useGameContextValue();
    const {
        boardState,
        piecePositions,
        blacksTurn,
        ghostBoardState,
        ghostPiecePositions,
        currentPlayerInCheck,
        gameStarted,
        modal,
        winningTeam,
    } = currentState;

    const [enemyPiecesToShow, setEnemyPiecesToShow] = useState(new Set());
    const [showPiecesCheckingKing, setShowPiecesCheckingKing] = useState(
        new Set()
    );

    useEffect(() => {
        const newInitialEnemyPiecesToShow = checkPossibleMovesWithEnemies({
            team,
            enemy,
            blacksTurn: isDarkPiece,
            piecePositions,
            boardState,
            afterTurnCheck: true,
        });
        setEnemyPiecesToShow(newInitialEnemyPiecesToShow);
        const newShowPiecesCheckingKing = checkIfPiecesAttackingKing({
            currentPlayerInCheck,
            team: enemy,
            enemy: team,
            blacksTurn: !isDarkPiece,
            piecePositions,
            boardState,
            afterTurnCheck: true,
        });
        setShowPiecesCheckingKing(newShowPiecesCheckingKing);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blacksTurn]);

    const closeModalOnClickOutside = () => {
        gameActionDispatch({
            type: 'closeGameOverModal',
            state: currentState,
        });
        return window.removeEventListener('click', closeModalOnClickOutside);
    };

    if (winningTeam && modal.isModalOpen) {
        window.addEventListener('click', closeModalOnClickOutside);
    }

    const team = sessionStorage.getItem(constants.TEAM);
    const enemy = sessionStorage.getItem(constants.ENEMY);
    const isDarkPiece = team === constants.BLACK;

    const boardStyles = cx(styles.gridContainer, {
        [styles.whiteTeamView]: isDarkPiece,
    });
    return (
        <div className={boardStyles}>
            {modal.isModalOpen && (
                <Modal
                    winningTeam={winningTeam}
                    isDark={isDarkPiece}
                    resolvePromise={modal.resolve}
                />
            )}
            {global.indexes.map((square, key) => {
                const piece = boardState[square];
                const { generatePiece } = getPieceGenerator(piece);
                const [x, y] = [square[0], square[1]];
                const isPlayersPiece = piece && piece.includes(team);
                const canSeeEnemyPiece =
                    enemyPiecesToShow.has(square) ||
                    showPiecesCheckingKing.has(square);
                const canSeePiece =
                    !gameStarted || isPlayersPiece || canSeeEnemyPiece;
                const ghostPiece = ghostBoardState[square];
                const canSeeGhostPiece =
                    gameStarted && ghostPiece && ghostPiece.includes(enemy);
                const { generatePiece: generateGhostPiece } = getPieceGenerator(
                    ghostPiece
                );

                const generatedBoardPiece =
                    generatePiece &&
                    generatePiece({
                        isDark: isDark(piece),
                        pieceId: piece,
                        canSeePiece,
                        canDrag: isPlayersPiece,
                    });
                const generatedGhostPiece =
                    generateGhostPiece &&
                    generateGhostPiece({
                        isDark: isDark(ghostPiece),
                        pieceId: ghostPiece,
                        isGhost: true,
                        canSeePiece: canSeeGhostPiece,
                    });

                return (
                    <BoardSquare
                        x={x}
                        y={y}
                        key={key}
                        dispatchMove={gameActionDispatch}
                        boardState={boardState}
                        piecePositions={piecePositions}
                        blacksTurn={blacksTurn}
                        canSeeEnemyPiece={canSeeEnemyPiece}
                        currentState={currentState}
                    >
                        {canSeePiece
                            ? generatedBoardPiece
                            : generatedGhostPiece}
                    </BoardSquare>
                );
            })}
        </div>
    );
}

export default Board;
