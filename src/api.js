import openSocket from 'socket.io-client';
import axios from 'axios';
import constants from './Constants';
import './globalVars';

// should be replaced by env var
const backendPath = 'http://192.168.1.2:5000';

const initialStatePath = `${backendPath}/initialGameState`;

const currentStatePath = `${backendPath}/currentGameState`;

const joinGame = () => {
    axios.post(`${backendPath}/joinGame`, {}).then(res => {
        const { newPlayerId } = res.data;
        sessionStorage.setItem(constants.PLAYER_ID, newPlayerId);
    });
};

const socket = openSocket(backendPath);

const setTeam = team => {
    sessionStorage.setItem(constants.TEAM, team);
};

const setEnemy = enemy => {
    sessionStorage.setItem(constants.ENEMY, enemy);
};

const unsetTeam = team => {
    sessionStorage.removeItem(constants.TEAM);
};

const unsetEnemy = enemy => {
    sessionStorage.removeItem(constants.ENEMY);
};

function gameOver(dispatchMove) {
    socket.on('gameOver', state => {
        unsetTeam();
        unsetEnemy();

        dispatchMove(getMoveToDispatch('gameOver', state));
        socket.emit('leaveCurrentGame', state);
    });
}

function sendMovePieceRequest(newState) {
    socket.emit('movePiece', newState);
}

function updateStateAfterPieceMoved(dispatchMove) {
    socket.on('pieceMoved', stateAfterMovingPiece =>
        dispatchMove(getMoveToDispatch('movePiece', stateAfterMovingPiece))
    );
}

function rejoinGame(playerId) {
    socket.emit('rejoinGame', playerId);
}

// change call back to get initial state type thing
function noGameToRejoin() {
    socket.on('noGameToRejoin', playerId => playerReadyToStartGame(playerId));
}

function gameRejoined(dispatchMove) {
    socket.on('gameRejoined', state =>
        dispatchMove(getMoveToDispatch('gameRejoined', state))
    );
}

function playerReadyToStartGame(playerId, privateGameId) {
    socket.emit('playerReadyToStartGame', playerId, privateGameId);
}

function playerJoinedAndWaiting(dispatchMove) {
    socket.on('playerJoinedAndWaiting', state =>
        dispatchMove(getMoveToDispatch('playerJoinedAndWaiting', state))
    );
}

function startGame(dispatchMove) {
    socket.on('startGame', newState => {
        const blackTeam =
            sessionStorage.getItem(constants.PLAYER_ID) ===
            newState.blackTeamId;
        const whiteTeam =
            sessionStorage.getItem(constants.PLAYER_ID) ===
            newState.whiteTeamId;
        if (blackTeam) {
            setTeam(constants.BLACK);
            setEnemy(constants.WHITE);
        }
        if (whiteTeam) {
            setTeam(constants.WHITE);
            setEnemy(constants.BLACK);
        }
        return dispatchMove(getMoveToDispatch('startGame', newState));
    });
}

function playerWantsToForfeitGame(playerId) {
    socket.emit('forfeitGame', playerId);
}

const getMoveToDispatch = (type, state) => ({ type, state });

const gameActions = [
    gameOver,
    gameRejoined,
    startGame,
    updateStateAfterPieceMoved,
    noGameToRejoin,
    playerJoinedAndWaiting,
];

const subscribeToGameEvents = async gameActionDispatch => {
    return Promise.all(
        gameActions.map(async action => {
            await action(gameActionDispatch);
            return true;
        })
    );
};

export {
    sendMovePieceRequest,
    playerReadyToStartGame,
    playerJoinedAndWaiting,
    rejoinGame,
    playerWantsToForfeitGame,
    joinGame,
    initialStatePath,
    subscribeToGameEvents,
    currentStatePath,
};
