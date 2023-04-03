import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd-cjs';
import { useGameContextValue } from '../../Game';
import cx from 'classnames';
import styles from './PieceTemplate.module.scss';

function PieceTemplate({
    pieceId,
    isDark,
    canSeePiece,
    isGhost,
    canDrag = true,
    PieceSvg,
    externalClassName,
    inlineStyle,
}) {
    const [{ blacksTurn, gameStarted }] = useGameContextValue();
    const activePiece = isDark === blacksTurn;
    const [{ isDragging }, drag, preview] = useDrag({
        item: { type: pieceId },
        canDrag: canDrag && gameStarted && !isGhost && activePiece,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    });
    const pieceStyles = cx(
        styles.piece,
        {
            [styles.isDraggable]: canDrag && gameStarted && !isGhost && activePiece,
            [styles.pieceDark]: isDark,
            [styles.invisible]: !canSeePiece,
        },
        externalClassName
    );

    const opacity = gameStarted && isGhost ? 0.4 : 1;
    return (
        <React.Fragment>
            <DragPreviewImage
                connect={preview}
            />
            <div
                ref={drag}
                className={pieceStyles}
                style={{ opacity: isDragging ? 0.5 : `${opacity}` }}
            >
                <PieceSvg isDark={isDark} style={inlineStyle} />
            </div>
        </React.Fragment>
    );
}

export default PieceTemplate;
