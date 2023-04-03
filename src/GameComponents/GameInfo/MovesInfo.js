import React from 'react';
import styles from './MovesInfo.module.scss';
import memoize from 'memoize-one'
import cx from 'classnames';

const defaultMoves = [['--', '--'], ['--', '--'], ['--', '--'],['--', '--']]
const isPrefill = array => array.length <= defaultMoves.length
const getIndexFunction = array => index => isPrefill(array) ? index +1:array.length - index

export function MovesInfo({ gameMoves }) {
    const moves = isPrefill(gameMoves) ? prefillValueTo4th(gameMoves) : gameMoves.slice().reverse()
    const moveInfoStyle = cx({[styles.prefillValues]:isPrefill(gameMoves)},styles.movesInfo)
    const indexFunction = getIndexFunction(gameMoves)

    console.log(gameMoves)
    return (
        <div className={moveInfoStyle}>
        {moves.map(([whiteTurn, blackTurn=''], index) => (
            <div className={styles.moveInfo}>
            <span className={styles.moveInfoIndex}>{indexFunction(index)}</span>{`: ${whiteTurn} ${blackTurn} `}
            </div>
        ))}
    </div>
    );
}

const prefillValueTo4th = (array) => isPrefill(array) ?
    defaultMoves.map( ([defaultWhite,defaultBlack], index) => {
        if(!array[index]){
            return [defaultWhite, defaultBlack]
        }
         const [whiteMove,blackMove=defaultBlack] = array[index]
        return [whiteMove, blackMove]
    }): array
