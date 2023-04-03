import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { initialStatePath, currentStatePath } from './api';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import constants from './Constants';

function getCurrentGameState(playerId) {
    return new Promise((resolve, reject) => {
        axios
            .get(currentStatePath, {
                params: {
                    playerId,
                },
            })
            .then(res => resolve(res.data.currentGameState))
            .catch(() => reject());
    });
}

axios.get(initialStatePath).then(async res => {
    const { initialGameState } = res.data;
    const playerId = sessionStorage.getItem(constants.PLAYER_ID);
    console.log(playerId);
    const gameState = playerId
        ? await getCurrentGameState(playerId)
        : initialGameState;
    console.log(gameState);
    ReactDOM.render(
        <App initialGameState={ initialGameState} playerId />,
        document.getElementById('root')
    );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
