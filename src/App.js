import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useParams,
} from 'react-router-dom';
import { joinGame, rejoinGame, playerWantsToForfeitGame } from './api';
import GamePage from './Pages/GamePage';
import MenuPage from './Pages/MenuPage';
import Header from './Components/Header';
import InstructionsPage from './Pages/InstructionsPage';
import constants from './Constants';

import styles from './App.module.scss';
import './globalVars';

function setConfirmation(message, routerCallback, callback) {
    const allowTransition = window.confirm(message);
    if (allowTransition) {
        callback();
        return setTimeout(() => routerCallback(allowTransition), 1500);
    }
    routerCallback(allowTransition);
}

function App({ initialGameState }) {
    const forfeitGame = () =>
        playerWantsToForfeitGame(sessionStorage.getItem(constants.PLAYER_ID));

        useEffect(()=>{
            const playerId = sessionStorage.getItem(constants.PLAYER_ID)
            if(!playerId){
                joinGame()
            } else {
                rejoinGame(playerId)
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[])
    return (
        <Router
            getUserConfirmation={(message, routerCallback) =>
                setConfirmation(message, routerCallback, forfeitGame)
            }
        >
            <div className={styles.app}>
                <Header />
                <Switch>
                    <Route path="/play/:gameId">
                        <GamePage initialGameState={initialGameState} />
                    </Route>
                    <Route path="/play">
                        <GamePage initialGameState={initialGameState} />
                    </Route>
                    <Route path="/how_to_play">
                        <InstructionsPage />
                    </Route>
                    <Route path="/">
                        <MenuPage />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
