import produce from 'immer';
import { sendMovePieceRequest } from '../../api';
import { initialModalState } from '../Game';
import { convertMoveToChessSpeak } from './chessTranslator';
import memoize from 'memoize-one';
import constants from '../../Constants';
import '../../globalVars';

const getTeam = blacksTurn => (blacksTurn ? constants.BLACK : constants.WHITE);
const getEnemy = blacksTurn => (blacksTurn ? constants.WHITE : constants.BLACK);

const getNextPlayersKing = blacksTurn =>
    blacksTurn ? 'whiteKing74' : 'blackKing04';

const getPawnDirection = blacksTurn => (blacksTurn ? 1 : -1);

const getPieceType = piece => piece.substring(5, piece.length - 2);

export function movePiece({
    currentState,
    toX,
    toY,
    currentPiece,
    currentPiecePosition,
    dispatchMove,
    boardState,
    blacksTurn,
}) {
    const newPosition = `${toX}${toY}`;
    const action = {
        oldPosition: currentPiecePosition.currentPosition,
        newPosition: newPosition,
        piece: currentPiece,
        enemyPieceAtPosition: enemyPieceAtPosition({
            blacksTurn,
            boardState,
            newPosition,
        }),
    };
    const farSideXPosition =
        sessionStorage.getItem(constants.TEAM) === constants.BLACK ? '7' : '0';

    if (
        currentPiece.includes(constants.PAWN) &&
        newPosition[0] === farSideXPosition
    ) {
        new Promise((resolve, reject) => {
            return dispatchMove({
                type: 'upgradePawnPiece',
                state: currentState,
                resolve,
            });
        }).then(selectedUpgrade => {
            const updatedState = movePieceReducer({ ...currentState }, action);
            const newState = setPawnPieceUgradeReducer(updatedState, {
                selectedUpgrade,
                currentPawn: currentPiece,
                currentPawnPosition: newPosition,
            });
            sendMovePieceRequest(newState);
        });
    } else {
        const newState = movePieceReducer(currentState, action);
        sendMovePieceRequest(newState);
    }
}

const checkPositionsInFrontOfPawns = memoize(props => lowerPosition => {
    const { boardState, blacksTurn, higherPosition, direction } = props;
    if (lowerPosition === higherPosition) {
        return true;
    }
    if (
        !enemyPieceAtPosition({
            boardState,
            newPosition: lowerPosition,
            blacksTurn,
        })
    ) {
        return checkPositionsInFrontOfPawns(props)(
            increaseXAxisBySum(direction, lowerPosition)
        );
    }
});

const canEnPassant = ({
    piecePositions,
    blacksTurn,
    boardState,
    newPosition,
    direction,
}) => {
    const pawnPositionToEnPassant = increaseXAxisBySum(
        direction * -1,
        newPosition
    );
    const pieceAtPositionToEnPassant =
        boardState && boardState[pawnPositionToEnPassant];
    return (
        pieceAtPositionToEnPassant &&
        piecePositions &&
        piecePositions[pieceAtPositionToEnPassant] &&
        piecePositions[pieceAtPositionToEnPassant].enPassant &&
        !enemyPieceAtPosition({ boardState, newPosition, blacksTurn })
    );
};

const enPassantMap = {
    white: '3',
    black: '4',
};

const pawnMoves = props => {
    const {
        blacksTurn,
        currentPiecePosition,
        dx,
        dy,
        boardState,
        newPosition,
        afterTurnCheck,
    } = props;

    const { hasMoved, currentPosition } = currentPiecePosition;
    const direction = getPawnDirection(blacksTurn);
    const pawnsFirstTurn = hasMoved ? 1 : 2;
    const team = getTeam(blacksTurn);
    const isCorrectRowForEnPassant = currentPosition[0] === enPassantMap[team];
    return (
        ((dx === pawnsFirstTurn * direction || dx === direction) &&
            dy === 0 &&
            checkPositionsInFrontOfPawns({
                boardState,
                blacksTurn,
                higherPosition: increaseXAxisBySum(direction, newPosition),
                direction,
            })(currentPosition)) ||
        (dx === direction &&
            Math.abs(dy) === 1 &&
            enemyPieceAtPosition({ boardState, newPosition, blacksTurn })) ||
        (isCorrectRowForEnPassant &&
            dx === direction &&
            Math.abs(dy) === 1 &&
            canEnPassant({ direction, ...props }))
    );
};
const knightMoves = ({ dx, dy }) =>
    (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
    (Math.abs(dx) === 1 && Math.abs(dy) === 2);

const bishopMoves = params => canMoveDiagonal(params);
const rookMoves = params =>
    canMoveHorizontal(params) || canMoveVertical(params);
const queenMoves = params =>
    canMoveHorizontal(params) ||
    canMoveVertical(params) ||
    canMoveDiagonal(params);

const kingMoves = ({ dx, dy, afterTurnCheck, ...rest }) =>
    Math.abs(dx) + Math.abs(dy) === 1 ||
    (Math.abs(dx) === 1 && Math.abs(dy) === 1) ||
    (!afterTurnCheck && preCastleCheck(rest) && canKingCastle(rest));

const movesMap = {
    Bishop: bishopMoves,
    Queen: queenMoves,
    King: kingMoves,
    Pawn: pawnMoves,
    Knight: knightMoves,
    Rook: rookMoves,
};

export const getPieceMovesCheck = memoize(currentPiece =>
    currentPiece ? movesMap[getPieceType(currentPiece)] : null
);

export const canMove = checkPieceMove => params => {
    const {
        toX,
        toY,
        newPosition = `${toX}${toY}`,
        currentPiece,
        currentPiecePosition: positionObj,
        boardState,
        blacksTurn,
        afterTurnCheck = false,
    } = params;
    const currentPiecePosition = positionObj.currentPosition;
    if (!currentPiece || !currentPiecePosition) return;
    const [x, y] = [currentPiecePosition[0], currentPiecePosition[1]];

    const dx = toX - x;
    const dy = toY - y;

    if (teamPieceAtPosition({ boardState, newPosition, blacksTurn })) return;
    if (
        (boardState[newPosition] &&
            boardState[newPosition].includes(constants.KING) &&
            !afterTurnCheck) ||
        (dx === 0 && dy === 0)
    )
        return false;
    return checkPieceMove({ dx, dy, x, y, ...params });
};

const canMoveHorizontal = ({ dx, dy, x, y, newPosition, boardState }) => {
    const xDir = 0;
    const yDir = newPosition[1] > y ? 1 : -1;
    const max = checkPath({ x, y, xDir, yDir, boardState });
    return dx === 0 && Math.abs(dy) <= Math.abs(max[1]);
};

const canMoveVertical = ({ dx, dy, x, y, newPosition, boardState }) => {
    const xDir = newPosition[0] > x ? 1 : -1;
    const yDir = 0;
    const max = checkPath({ x, y, xDir, yDir, boardState });
    return dy === 0 && Math.abs(dx) <= Math.abs(max[0]);
};

const canMoveDiagonal = ({ dx, dy, x, y, newPosition, boardState }) => {
    const xDir = newPosition[0] > x ? 1 : -1;
    const yDir = newPosition[1] > y ? 1 : -1;
    const max = checkPath({ x, y, xDir, yDir, boardState });
    return (
        Math.abs(dx) <= Math.abs(max[0]) &&
        Math.abs(dy) <= Math.abs(max[1]) &&
        Math.abs(dx) === Math.abs(dy)
    );
};

const castleKingToRookPositionMap = {
    black02: '00',
    black06: '07',
    white72: '70',
    white76: '77',
};

const isPositionToCastleTo = (blacksTurn, newPosition) =>
    Object.keys(castleKingToRookPositionMap).some(
        key => key === `${getTeam(blacksTurn)}${newPosition}`
    );

const preCastleCheck = ({
    blacksTurn,
    currentPiecePosition: { hasMoved },
    newPosition,
}) => isPositionToCastleTo(blacksTurn, newPosition) && !hasMoved;

const isKingsPosition = position => position === '74' || position === '04';

const checkPositionsInBetweenPieces = memoize(props => lowerPosition => {
    const { higherPosition, boardState, ...rest } = props;
    if (lowerPosition === higherPosition) {
        return true;
    }
    if (
        //ignore piece check for kings position
        (isKingsPosition(lowerPosition) || !boardState[lowerPosition]) &&
        // make sure king is not/ would be in check & ignore rooks path
        (lowerPosition[1] === '1' ||
            !teamsKingWillBeInCheck({
                ...rest,
                boardState,
                newPosition: lowerPosition,
            }))
    ) {
        return checkPositionsInBetweenPieces(props)(
            increaseYAxisBy1(lowerPosition)
        );
    }
});

const increaseXAxisBySum = (sum, pos) => `${Number(pos[0]) + sum}${pos[1]}`;
const increaseYAxisBySum = (sum, pos) => `${pos[0]}${Number(pos[1]) + sum}`;

const increaseYAxisBy1 = pos => `${pos[0]}${Number(pos[1]) + 1}`;

const getPositionBounds = (currentPosition, rookToSwapWith) =>
    currentPosition < rookToSwapWith
        ? [currentPosition, rookToSwapWith]
        : [increaseYAxisBy1(rookToSwapWith), currentPosition];

const canKingCastle = props => {
    const {
        currentPiecePosition,
        newPosition,
        piecePositions,
        blacksTurn,
    } = props;
    const { currentPosition } = currentPiecePosition;
    const team = getTeam(blacksTurn);
    const rookToSwapWith = castleKingToRookPositionMap[`${team}${newPosition}`];
    if (!piecePositions[`${team}Rook${rookToSwapWith}`].hasMoved) {
        const [lowerPosition, higherPosition] = getPositionBounds(
            currentPosition,
            rookToSwapWith
        );
        return checkPositionsInBetweenPieces({
            higherPosition,
            ...props,
        })(lowerPosition);
    }
};

const makeIsPieceAtPosition = getPieceGroup => ({
    boardState,
    newPosition,
    blacksTurn,
}) => {
    const pieceGroup = getPieceGroup(blacksTurn);
    return (
        boardState[newPosition] && boardState[newPosition].includes(pieceGroup)
    );
};
const isPawnAtPosition = makeIsPieceAtPosition(() => 'Pawn');
const teamPieceAtPosition = makeIsPieceAtPosition(getTeam);
const enemyPieceAtPosition = makeIsPieceAtPosition(getEnemy);

const checkPath = ({ x, y, xDir, yDir, boardState }) => {
    const newX = Number(x) + xDir;
    const newY = Number(y) + yDir;

    if (
        boardState[`${newX}${newY}`] ||
        newX === -1 ||
        newX === 8 ||
        newY === -1 ||
        newY === 8
    ) {
        return [xDir, yDir];
    }
    const [addStepX, addStepY] = checkPath({
        x: newX,
        y: newY,
        xDir,
        yDir,
        boardState,
    });
    return [xDir + addStepX, yDir + addStepY];
};

export const checkPossibleMovesWithEnemies = ({
    team,
    enemy,
    blacksTurn,
    piecePositions,
    boardState,
    afterTurnCheck,
}) => {
    const currentTeam = team || getTeam(blacksTurn);
    const currentEnemy = enemy || getEnemy(blacksTurn);
    const possibleMovesWithEnemy = new Set([]);
    Object.entries(piecePositions).forEach(([teamPiece, teamPiecePosition]) => {
        if (teamPiece.includes(currentEnemy)) return;
        const checkpieceMove = memoize(getPieceMovesCheck(teamPiece));
        const canMovePiece = canMove(checkpieceMove);
        Object.entries(boardState)
            .filter(
                ([enemyPiecePosition, enemyPiece]) =>
                    !(
                        enemyPiece.includes(currentTeam) ||
                        enemyPiece === constants.NULL_STRING
                    )
            )
            .forEach(([enemyPiecePosition, enemyPiece]) => {
                const [toX, toY] = [
                    enemyPiecePosition[0],
                    enemyPiecePosition[1],
                ];
                if (
                    teamPiece.includes('Pawn') &&
                    enemyPiece.includes('Pawn') &&
                    piecePositions[enemyPiece].enPassant
                ) {
                    const direction = getPawnDirection(currentTeam === 'black');
                    const enPassantPawnPositon = increaseXAxisBySum(
                        direction,
                        enemyPiecePosition
                    );
                    if (
                        canMovePiece({
                            toX: enPassantPawnPositon[0],
                            toY,
                            team,
                            enemy,
                            currentPiece: teamPiece,
                            currentPiecePosition: teamPiecePosition,
                            boardState,
                            blacksTurn,
                            newPosition: enPassantPawnPositon,
                            piecePositions,
                            afterTurnCheck,
                        })
                    ) {
                        possibleMovesWithEnemy.add(enemyPiecePosition);
                        possibleMovesWithEnemy.add(enPassantPawnPositon);
                        return;
                    }
                }
                if (
                    canMovePiece({
                        toX,
                        toY,
                        team,
                        enemy,
                        currentPiece: teamPiece,
                        currentPiecePosition: teamPiecePosition,
                        boardState,
                        blacksTurn,
                        newPosition: enemyPiecePosition,
                        piecePositions,
                        afterTurnCheck,
                    })
                ) {
                    possibleMovesWithEnemy.add(enemyPiecePosition);
                }
            });
    });
    return possibleMovesWithEnemy;
};

export const checkPossibleMoves = ({
    blacksTurn,
    piecePositions,
    boardState,
    afterTurnCheck,
}) => {
    const enemy = getEnemy(blacksTurn);
    const possibleMoves = new Set([]);
    Object.entries(piecePositions).forEach(([teamPiece, teamPiecePosition]) => {
        if (teamPiece.includes(enemy)) return;
        const checkPieceMove = memoize(getPieceMovesCheck(teamPiece));
        const canMovePiece = canMove(checkPieceMove);

        global.indexes.forEach((square, key) => {
            const [toX, toY] = [square[0], square[1]];

            if (
                canMovePiece({
                    toX,
                    toY,
                    currentPiece: teamPiece,
                    currentPiecePosition: teamPiecePosition,
                    boardState,
                    blacksTurn,
                    afterTurnCheck,
                    newPosition: square,
                }) &&
                !teamsKingWillBeInCheck({
                    blacksTurn,
                    piecePositions,
                    boardState,
                    newPosition: square,
                    currentPiecePosition: teamPiecePosition,
                    currentPiece: teamPiece,
                })
            ) {
                possibleMoves.add(square);
            }
        });
    });
    return possibleMoves;
};

export const teamsKingWillBeInCheck = ({
    blacksTurn,
    piecePositions,
    boardState,
    newPosition,
    currentPiecePosition,
    currentPiece,
}) => {
    const enemyAtPosition = enemyPieceAtPosition({
        blacksTurn,
        boardState,
        newPosition,
    });
    const enemyToTake = enemyAtPosition && boardState[newPosition];
    const nextPiecePositions = produce(piecePositions, draftPiecePositions => {
        const removeEnemy = enemyAtPosition
            ? { [enemyToTake]: { hasMoved: true, currentPosition: null } }
            : {};
        return {
            ...draftPiecePositions,
            [currentPiece]: {
                hasMoved: true,
                currentPosition: newPosition,
            },
            ...removeEnemy,
        };
    });
    const nextBoardState = produce(boardState, draftBoardState => ({
        ...draftBoardState,
        [currentPiecePosition.currentPosition]: constants.NULL_STRING,
        [newPosition]: currentPiece,
    }));

    const currentPlayersKing = blacksTurn ? 'blackKing04' : 'whiteKing74';
    const possibleMovesForCurrentTeam = checkPossibleMovesWithEnemies({
        blacksTurn: !blacksTurn,
        piecePositions: nextPiecePositions,
        boardState: nextBoardState,
        afterTurnCheck: true,
    });
    const inCheck = possibleMovesForCurrentTeam.has(
        nextPiecePositions[currentPlayersKing].currentPosition
    );
    return inCheck;
};

export const checkIfPiecesAttackingKing = ({
    currentPlayerInCheck,
    team,
    enemy,
    blacksTurn,
    piecePositions,
    boardState,
    afterTurnCheck,
}) => {
    const piecesAttackingKing = new Set();
    if (!currentPlayerInCheck) {
        return piecesAttackingKing;
    }
    const enemyKing = blacksTurn ? 'whiteKing74' : 'blackKing04';
    const enemyKingPosition = piecePositions[enemyKing].currentPosition;
    Object.entries(piecePositions).forEach(([teamPiece, teamPiecePosition]) => {
        if (teamPiece.includes(enemy)) return;
        const checkpieceMove = getPieceMovesCheck(teamPiece);
        const canMovePiece = canMove(checkpieceMove);
        if (
            canMovePiece({
                toX: enemyKingPosition[0],
                toY: enemyKingPosition[1],
                currentPiece: teamPiece,
                currentPiecePosition: teamPiecePosition,
                boardState,
                blacksTurn,
                afterTurnCheck,
                newPosition: enemyKingPosition,
            })
        ) {
            piecesAttackingKing.add(teamPiecePosition.currentPosition);
        }
    });
    return piecesAttackingKing;
};

const kingSideCastle = '0-0';
const queenSideCastle = '0-0-0';

const newRookPositionMap = {
    '02': ['03', 'blackRook00', queenSideCastle],
    '06': ['05', 'blackRook07', kingSideCastle],
    '72': ['73', 'whiteRook70', queenSideCastle],
    '76': ['75', 'whiteRook77', kingSideCastle],
};

const getUpdateRookState = ([newPosition, rookPiece, transcript]) => {
    const piecePosition = {
        [rookPiece]: {
            hasMoved: true,
            currentPosition: newPosition,
        },
    };
    const boardState = {
        [rookPiece.substring(rookPiece.length - 2)]: constants.NULL_STRING,
        [newPosition]: rookPiece,
    };

    return [piecePosition, boardState, transcript];
};

const handleCastling = memoize(hasMoved =>
    hasMoved
        ? () => [{}, {}, '']
        : (newPosition, blacksTurn) =>
              isPositionToCastleTo(blacksTurn, newPosition)
                  ? getUpdateRookState(newRookPositionMap[newPosition])
                  : [{}, {}, '']
);

const handleEnPassantProperty = (hasMoved, oldPosition, newPosition) =>
    !hasMoved && Math.abs(Number(oldPosition[0]) - Number(newPosition[0])) === 2
        ? { enPassant: true }
        : { enPassant: false };

const handleEnPassantAttack = ({
    piece,
    oldPosition,
    newPosition,
    blacksTurn,
    boardState,
    piecePositions,
}) => {
    const direction = getPawnDirection(blacksTurn);
    const enPassantPawnPositon = increaseXAxisBySum(
        direction * -1,
        newPosition
    );
    if (piece.includes('Pawn') && oldPosition[1] !== newPosition[1]) {
        const enPassantPiece = boardState[enPassantPawnPositon];
        if (
            piecePositions[enPassantPiece] &&
            piecePositions[enPassantPiece].enPassant
        ) {
            return enPassantPiece;
        }
    }
    return '';
};

export const movePieceReducer = (state, action) => {
    const { blacksTurn } = state;
    const { oldPosition, newPosition, piece, enemyPieceAtPosition } = action;
    const enemyToTake =
        (enemyPieceAtPosition && state.boardState[newPosition]) ||
        handleEnPassantAttack({
            piece,
            oldPosition,
            newPosition,
            blacksTurn,
            boardState: state.boardState,
            piecePositions: state.piecePositions,
        });
    const pieceToTakesOldPosition =
        enemyToTake && state.piecePositions[enemyToTake].currentPosition;

    // use Maybe technique to cleanup
    const [
        rookPiecePosition,
        rookBoardState,
        castleTranscript,
    ] = piece.includes('King')
        ? handleCastling(state.piecePositions[piece].hasMoved)(
              newPosition,
              blacksTurn
          )
        : [{}, {}, ''];

    const removeEnemy = enemyToTake
        ? { [enemyToTake]: { hasMoved: true, currentPosition: null } }
        : {};

    const enPassant = piece.includes('Pawn')
        ? handleEnPassantProperty(
              state.piecePositions[piece].hasMoved,
              oldPosition,
              newPosition
          )
        : {};
    const piecePositions = {
        ...state.piecePositions,
        [piece]: {
            hasMoved: true,
            currentPosition: newPosition,
            ...enPassant,
        },
        ...rookPiecePosition,
        ...removeEnemy,
    };
    const newBoardState = {
        ...state.boardState,
        [pieceToTakesOldPosition]: constants.NULL_STRING,
        [oldPosition]: constants.NULL_STRING,
        [newPosition]: piece,
        ...rookBoardState,
    };
    const nextPlayersKing = getNextPlayersKing(blacksTurn);
    const possibleMovesWithEnemiesForCurrentTeam = checkPossibleMovesWithEnemies(
        {
            blacksTurn: blacksTurn,
            piecePositions,
            boardState: newBoardState,
            afterTurnCheck: true,
        }
    );

    const possibleMovesForNextTeam = checkPossibleMoves({
        blacksTurn: !blacksTurn,
        piecePositions,
        boardState: newBoardState,
        afterTurnCheck: true,
    });

    const inCheck = possibleMovesWithEnemiesForCurrentTeam.has(
        piecePositions[nextPlayersKing].currentPosition
    );

    const noMovesLeft = possibleMovesForNextTeam.size === 0;
    const checkMate = inCheck && noMovesLeft;

    const nextMove = convertMoveToChessSpeak({
        castleTranscript,
        oldPosition,
        newPosition,
        enemyPieceAtPosition,
        inCheck,
        checkMate,
        piece,
    });
    const gameMoves = handleGameMoves({
        gameMoves: state.gameMoves,
        nextMove,
        blacksTurn: state.blacksTurn,
    });
    let winningTeam = undefined;
    if (checkMate) {
        winningTeam = blacksTurn ? constants.BLACK : constants.WHITE;
    } else if (noMovesLeft) {
        winningTeam = constants.DRAW;
    }

    const { ghostBoardState, ghostPiecePositions } = updateGhostPiecePositions({
        state,
        piece,
        enemyToTake,
        newPosition,
        piecePositions,
        newBoardState,
    });

    const team = getTeam(blacksTurn);
    const remainingTime = {
        ...state.remainingTime,
        [team]: state.remainingTime[team] - (Date.now() - state.turnTimeStamp),
    };

    return {
        ...state,
        gameMoves,
        currentPlayerInCheck: inCheck,
        blacksTurn: !blacksTurn,
        boardState: newBoardState,
        piecePositions,
        ghostBoardState,
        ghostPiecePositions,
        piecesTaken: [...state.piecesTaken, enemyToTake],
        gameStarted: state.gameStarted,
        winningTeam,
        modal: state.modal,
        remainingTime,
    };
};

const handleGameMoves = ({ gameMoves, nextMove, blacksTurn }) =>
    produce(gameMoves, draftGameMoves => {
        blacksTurn
            ? draftGameMoves[draftGameMoves.length - 1].push(nextMove)
            : draftGameMoves.push([nextMove]);
    });

const updateGhostPiecePositions = ({
    state,
    piece,
    enemyToTake,
    newPosition,
    piecePositions,
    newBoardState,
}) =>
    produce(state, draftState => {
        let { ghostBoardState, ghostPiecePositions, blacksTurn } = draftState;
        // TODO: check if this block can be removed
        if (enemyToTake) {
            const ghostPiece = `${constants.GHOST}${piece}`;
            const ghostEnemyPiece = `${constants.GHOST}${enemyToTake}`;
            const originalGhostPosition = ghostPiecePositions[ghostPiece];
            const originalGhostEnemyPosition =
                ghostPiecePositions[ghostEnemyPiece];
            ghostBoardState[originalGhostEnemyPosition] = constants.NULL_STRING;
            ghostBoardState[originalGhostPosition] = constants.NULL_STRING;
            ghostBoardState[ghostEnemyPiece] = ghostPiece;
            ghostBoardState[newPosition] = ghostPiece;
            ghostPiecePositions[ghostPiece] = newPosition;
            ghostPiecePositions[ghostEnemyPiece] = null;
        }

        const possibleMovesWithEnemiesForCurrentTeam = checkPossibleMovesWithEnemies(
            {
                blacksTurn: !blacksTurn,
                piecePositions,
                boardState: newBoardState,
                afterTurnCheck: true,
            }
        );

        possibleMovesWithEnemiesForCurrentTeam.forEach(possibleMovePosition =>
            updateGhostPiece({
                newBoardState,
                ghostPiecePositions,
                ghostBoardState,
                possibleMovePosition,
            })
        );

        const possibleMovesWithEnemiesForNextTeam = checkPossibleMovesWithEnemies(
            {
                blacksTurn: blacksTurn,
                piecePositions,
                boardState: newBoardState,
                afterTurnCheck: true,
            }
        );

        possibleMovesWithEnemiesForNextTeam.forEach(possibleMovePosition =>
            updateGhostPiece({
                newBoardState,
                ghostPiecePositions,
                ghostBoardState,
                possibleMovePosition,
            })
        );

        const team = blacksTurn ? constants.BLACK : constants.WHITE;
        const enemy = blacksTurn ? constants.WHITE : constants.BLACK;
        const currentTeamsPiecesAttackingEnemyKing = checkIfPiecesAttackingKing(
            {
                currentPlayerInCheck: true,
                team,
                enemy,
                blacksTurn,
                piecePositions,
                boardState: newBoardState,
                afterTurnCheck: true,
            }
        );
        currentTeamsPiecesAttackingEnemyKing.forEach(possibleMovePosition =>
            updateGhostPiece({
                newBoardState,
                ghostPiecePositions,
                ghostBoardState,
                possibleMovePosition,
            })
        );
    });

const updateGhostPiece = ({
    newBoardState,
    ghostPiecePositions,
    ghostBoardState,
    possibleMovePosition,
}) => {
    const ghostPieceInView = `${constants.GHOST}${newBoardState[possibleMovePosition]}`;
    const originalGhostPosition = ghostPiecePositions[ghostPieceInView];
    ghostPiecePositions[ghostPieceInView] = possibleMovePosition;
    ghostBoardState[originalGhostPosition] = constants.NULL_STRING;
    ghostBoardState[possibleMovePosition] = ghostPieceInView;
};

const updatePiecePosition = ({
    piecePositions,
    currentPawn,
    newPieceName,
    currentPawnPosition,
}) => ({
    ...piecePositions,
    [currentPawn]: {
        ...piecePositions[currentPawn],
        currentPosition: constants.NULL_STRING,
    },
    [newPieceName]: {
        ...piecePositions[newPieceName],
        currentPosition: currentPawnPosition,
    },
});

const setPawnPieceUgradeReducer = (state, action) => {
    const { selectedUpgrade, currentPawn, currentPawnPosition } = action;
    const newPieceName = currentPawn.replace(constants.PAWN, selectedUpgrade);
    const newPieceGhostName = `${constants.GHOST}${newPieceName}`;

    const updatedBoardState = {
        ...state.boardState,
        [currentPawnPosition]: newPieceName,
    };

    const updatedPiecePositions = updatePiecePosition({
        piecePositions: state.piecePositions,
        currentPawn,
        newPieceName,
        currentPawnPosition,
    });

    const previousPawnGhostPosition =
        state.ghostPiecePositions[`${constants.GHOST}${currentPawn}`];

    const updatedGhostBoardState = {
        ...state.ghostBoardState,
        [previousPawnGhostPosition]: constants.NULL_STRING,
        [currentPawnPosition]: newPieceGhostName,
    };

    const updatedGhostPiecePositions = updatePiecePosition({
        piecePositions: state.ghostPiecePositions,
        currentPawn: `${constants.GHOST}${currentPawn}`,
        newPieceName: newPieceGhostName,
        currentPawnPosition,
    });

    return {
        ...state,
        ghostPiecePositions: updatedGhostPiecePositions,
        ghostBoardState: updatedGhostBoardState,
        piecePositions: updatedPiecePositions,
        boardState: updatedBoardState,
        modal: initialModalState,
    };
};
