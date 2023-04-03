// 6th character as all pieces prepended with black or white + remove digits at end
const pieceToChessSpeak = piece =>
    pieceLetterMap[piece.substring(5, piece.length - 2)];
// TO DO: correct x & y axis.
// current white king start is 74 which should translate to e1
const positionToChessSpeak = position =>
    `${boardLetterMap[position[1]]}${8 - Number(position[0])}`;

const pieceLetterMap = {
    Queen: 'Q',
    King: 'K',
    Knight: 'N',
    Bishop: 'B',
    Rook: 'R',
    Pawn: '',
};

const boardLetterMap = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
    4: 'e',
    5: 'f',
    6: 'g',
    7: 'h',
};
const addMarkIfTrue = (statement, mark) => (statement ? mark : '');

// add castling in
export const convertMoveToChessSpeak = ({
    oldPosition,
    newPosition,
    piece,
    enemyPieceAtPosition,
    inCheck,
    checkMate,
    castleTranscript,
}) => {
    const markKill = addMarkIfTrue(enemyPieceAtPosition, 'x');
    const markCheckMate = addMarkIfTrue(checkMate, '#');
    const markCheck = addMarkIfTrue(inCheck, '+');
    const markCheckState = markCheckMate || markCheck;
    return (
        castleTranscript ||
        `${pieceToChessSpeak(piece)}${markKill}${positionToChessSpeak(
            newPosition
        )}${markCheckState}`
    );
};
