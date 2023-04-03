import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';
import { useParams, Prompt } from 'react-router-dom';
import Board from '../../GameComponents/Board';
import GameInfo, { MovesInfo } from '../../GameComponents/GameInfo';
import { Loader } from '../../Components/Modal';
import { useGameContextValue } from '../../GameComponents/Game';
import {
    subscribeToGameEvents,
    playerReadyToStartGame,
    playerWantsToForfeitGame,
} from '../../api';
import constants from '../../Constants';

import styles from './GamePage.module.scss';

function GamePage() {
    const [
        {
            playerJoinedAndWaiting,
            blackTeamId,
            whiteTeamId,
            gameStarted,
            gameMoves,
            winningTeam,
        },
        gameActionDispatch,
    ] = useGameContextValue();
    const team = sessionStorage.getItem(constants.TEAM);
    const startGame = privateGameId =>
        playerReadyToStartGame(
            sessionStorage.getItem(constants.PLAYER_ID),
            privateGameId
        );
    const isFindingOpponent =
        playerJoinedAndWaiting && !gameStarted && !winningTeam;

    const { gameId: privateGameId } = useParams();
    useEffect(() => {
        const initGame = async () => {
            await subscribeToGameEvents(gameActionDispatch);
            if (!isFindingOpponent) {
                startGame(privateGameId);
            }
        };
        initGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            <Prompt
                when={!winningTeam}
                message="are you sure you want to forfeit the game?"
            />
            {isFindingOpponent && <Loader />}
            <div className={styles.gamePage}>
                <MovesInfo gameMoves={gameMoves} />
                <GameInfo isTop team={team} />
                <Board />
                <GameInfo />
            </div>
        </>
    );
}

export default GamePage;
