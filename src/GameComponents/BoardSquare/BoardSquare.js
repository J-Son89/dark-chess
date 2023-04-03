import React, { memo } from 'react';
import { useDrop } from 'react-dnd-cjs';
import cx from 'classnames';
import Overlay from './Overlay';
import {
    movePiece,
    piecesList,
    teamsKingWillBeInCheck,
    getPieceMovesCheck,
    canMove,
} from '../Pieces';
import constants from '../../Constants';
import '../../globalVars';
import styles from './BoardSquare.module.scss';

const isDark = (x, y) => {
    const isOddRow = x % 2 !== 0;
    return isOddRow ? y % 2 === 0 : y % 2 !== 0;
};

const BoardSquare = ({
    currentState,
    x,
    y,
    boardState,
    piecePositions,
    position,
    children,
    dispatchMove,
    blacksTurn,
    canSeeEnemyPiece,
}) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: piecesList,
        canDrop: ({ type }) => {
            const checkPieceMove = getPieceMovesCheck(type);
            const canMovePiece = canMove(checkPieceMove);
            const currentPiecePosition = piecePositions[type];
            if (!type || !currentPiecePosition.currentPosition) return;
            const newPosition = `${x}${y}`;
            const pieceCanMove = canMovePiece({
                toX: x,
                toY: y,
                newPosition,
                currentPiece: type,
                currentPiecePosition,
                boardState,
                blacksTurn,
                piecePositions,
            });
            return (
                pieceCanMove &&
                !teamsKingWillBeInCheck({
                    blacksTurn,
                    piecePositions,
                    boardState,
                    newPosition,
                    currentPiecePosition,
                    currentPiece: type,
                })
            );
        },
        drop: ({ type }) =>
            movePiece({
                currentState,
                toX: x,
                toY: y,
                currentPiece: type,
                currentPiecePosition: piecePositions[type],
                dispatchMove,
                boardState,
                blacksTurn,
            }),
        collect: monitor => {
            return {
                isOver: !!monitor.isOver(),
                canDrop: !!monitor.canDrop(),
            };
        },
    });
    const boardSquareStyles = cx(styles.boardSquare, {
        [styles.boardSquareDark]: isDark(x, y),
        [styles.whiteTeamView]:
            sessionStorage.getItem(constants.TEAM) === constants.BLACK,
    });
    return (
        <div ref={drop} className={boardSquareStyles}>
            {boardState[`${x}${y}`] && canSeeEnemyPiece && (
                <div className={styles.boardSquareBackground} />
            )}
            {children}
            {isOver && !canDrop && <Overlay color="red" />}
            {!isOver && canDrop && <Overlay color="yellow" />}
            {isOver && canDrop && <Overlay color="green" />}
        </div>
    );
};

export default memo(BoardSquare);
