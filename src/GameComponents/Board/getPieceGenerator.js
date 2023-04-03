import React from 'react';
import { Pawn, Rook, Bishop, Knight, Queen, King } from '../Pieces';

const pieceGenerator = [
    {
        generatePiece: (props) => (
            <Pawn {...props}/>
        ),
        accept: type => type && type.includes('Pawn'),
    },
    {
        generatePiece: (props) => (
            <Rook {...props} />
        ),
        accept: type => type && type.includes('Rook'),
    },
    {
        generatePiece: (props) => (
            <Bishop {...props} />
        ),
        accept: type => type && type.includes('Bishop'),
    },
    {
        generatePiece: (props) => (
            <Knight {...props} />
        ),
        accept: type => type && type.includes('Knight'),
    },
    {
        generatePiece: (props) => (
            <Queen {...props} />
        ),
        accept: type => type && type.includes('Queen'),
    },
    {
        generatePiece: (props) => (
            <King {...props} />
        ),
        accept: type => type && type.includes('King'),
    },
];

const getPieceGenerator = type => {
    const activePieceGenerator = pieceGenerator.find(generator =>
        generator.accept(type)
    );

    const { generatePiece } = activePieceGenerator || { generatePiece: null };
    return { generatePiece };
};

export default getPieceGenerator;
