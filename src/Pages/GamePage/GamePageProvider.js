import React, { useReducer, useEffect } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import TouchBackend from 'react-dnd-touch-backend';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import GamePage from './GamePage';
import { GameProvider, gameReducer } from '../../GameComponents/Game';
import {isMobile} from '../../util';
import { rejoinGame } from '../../api';
import { usePageVisibility } from 'react-page-visibility';
import constants from '../../Constants';

function GamePageProvider({initialGameState}) {
    const isDocumentVisible = usePageVisibility()
    const [initGameState, gameActionDispatch] = useReducer(
        gameReducer,
        initialGameState
    );

    useEffect(()=> {
        const playerId = sessionStorage.getItem(constants.PLAYER_ID)
           rejoinGame(playerId)
    },[isDocumentVisible])


    const BackendProvider = isMobile({tablet:true}) ? TouchBackend : HTML5Backend;
    return (
      <DndProvider backend={BackendProvider}>
        <GameProvider initialState={initGameState}>
          <GamePage />
        </GameProvider>
      </DndProvider>
    );
}

export default GamePageProvider;
