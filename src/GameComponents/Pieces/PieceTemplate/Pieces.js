import React from 'react';
import PieceTemplate from './PieceTemplate';
import KnightSvg from './piece-vectors/KnightSvg';
import KingSvg from './piece-vectors/KingSvg';
import PawnSvg from './piece-vectors/PawnSvg';
import BishopSvg from './piece-vectors/BishopSvg';
import RookSvg from './piece-vectors/RookSvg';
import QueenSvg from './piece-vectors/QueenSvg';

export const Pawn = (props) => <PieceTemplate PieceSvg={PawnSvg} {...props} />
export const Knight = (props) => <PieceTemplate PieceSvg={KnightSvg} {...props} />
export const Bishop = (props) => <PieceTemplate PieceSvg={BishopSvg} {...props} />
export const Rook = (props) => <PieceTemplate PieceSvg={RookSvg} {...props} />
export const Queen = (props) => <PieceTemplate PieceSvg={QueenSvg} {...props} />
export const King = (props) => <PieceTemplate PieceSvg={KingSvg} {...props} />


