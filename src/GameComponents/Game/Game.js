import React, { createContext, useContext, useReducer, useMemo } from 'react';
import constants from '../../Constants';
export const initialModalState ={
    isModalOpen:false,
    currentPawn:'',
    currentPawnPosition:'',
    resolve:undefined
}


export const isDark = pieceName => pieceName.includes(constants.BLACK);

const GameContext = createContext();

const useMemoizedArray = array => useMemo(() => array, [array]);

const useMemoizedReducer = (reducer, initialState) =>
    useMemoizedArray(useReducer(reducer, initialState));

export const GameProvider = ({ initialState, children }) => (
    <GameContext.Provider value={useMemoizedReducer(gameReducer, initialState)}>
        {children}
    </GameContext.Provider>
);

export function gameReducer(state, action) {
    switch (action.type) {
        case 'gameRejoined':
            return {...action.state}
        case 'updateState': 
        return {...action.state}
        case 'movePiece':
            return {...action.state}
        case 'setTime':
            return {
                ...state,
                turnTime:state.turnTime-1
            };
        case 'startGame':
        case 'stopGame':
            return {...action.state};
        case 'upgradePawnPiece':
            const {resolve} = action
        return {
            ...action.state,
            modal: {
                isModalOpen:true,
                resolve
            }
        }
        case 'gameForfeitted':
        case 'gameOver':
        return {
            ...action.state,
            modal: {
                isModalOpen:true,
            }
        }
        case 'closeGameOverModal':
            return {
                ...action.state,
                modal: initialModalState,
                gameStarted: false
            }
        case 'playerJoinedAndWaiting':
            return {
                ...action.state,
                playerJoinedAndWaiting:true,
            }
        default:
            return {
                ...action.state,
            };
    }
}

export const useGameContextValue = () => useContext(GameContext);

export default GameContext;
