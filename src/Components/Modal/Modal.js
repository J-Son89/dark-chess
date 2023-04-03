import React from 'react';
import cx from 'classnames';
import { Queen, Rook, Bishop, Knight} from '../../GameComponents/Pieces';
import blackQueen from '../../images/blackQueen.png';
import whiteQueen from '../../images/whiteQueen.png';
import loadingIcon from '../../images/logo.svg';
import styles from './Modal.module.scss';

function Modal({resolvePromise, isDark, winningTeam, loading}) {
  const setPieceUpgrade = (upgradePiece) => resolvePromise(upgradePiece)
  
  const modalStyles = cx(
    styles.modal,
    {
    [styles.whiteTeamView]: isDark,
    [styles.gameOverModal]: winningTeam,
    [styles.loadingModal]: loading,
    [styles.whiteTeamViewForUpgradeModal]: isDark && !winningTeam
    })

    const {gameOverMessage, gameOverImage} = getGameOverModalContent(winningTeam)

    const gameOverModal = winningTeam && (
      (<div className={modalStyles}>
        <div className={styles.gameOverImgBackground}></div>
        <h2 className={styles.gameOverHeading}>
          {'Game Over'}
        </h2>
        <h3 className={styles.gameOverHeading}>
          {gameOverMessage}
        </h3>
        <div className={styles.gameOverImgContainer}>
          {gameOverImage}
        </div>
      </div>)
    );

    const upgradeModal =
    (<div className={modalStyles}>
        <div onClick={ () => setPieceUpgrade('Queen')}>
          <Queen isDark={isDark} pieceId ='selectQueen' canSeePiece  canDrag={false} />
        </div>
        <div onClick={ () => setPieceUpgrade('Rook')}>
          <Rook isDark={isDark} pieceId ='selectRook' canSeePiece  canDrag={false} />
        </div>
        <div onClick={ () => setPieceUpgrade('Bishop')}>
          <Bishop isDark={isDark} pieceId ='selectBishop' canSeePiece  canDrag={false} />
        </div>
        <div onClick={ () => setPieceUpgrade('Knight')}>
          <Knight isDark={isDark} pieceId ='selectKnight' canSeePiece  canDrag={false} />
        </div> 
      </div>)

    const loadingModal = (
    <div className={modalStyles}>
      <h2 className={styles.loadingModalHeader}>
      {'Waiting for another player to join'}
        </h2>
        <img className={styles.loadingSpinner} src={loadingIcon}/>
    </div>)
    const content = loading? loadingModal : gameOverModal || upgradeModal


    return ( content );
}

const getGameOverModalContent = (winningTeam) => {
  let gameOverMessage;
  let gameOverImage
  if(winningTeam === 'black'){
    gameOverMessage = 'Black Team wins';
    gameOverImage = (<img src={blackQueen} className={styles.gameOverImg} alt="Black Queen"></img>);
  }else if(winningTeam === 'white'){
    gameOverMessage = 'White Team wins';
    gameOverImage = (<img src={whiteQueen} className={styles.gameOverImg} alt="White Queen"></img>);
  }
  else{
    gameOverMessage = 'Draw Game';
    gameOverImage = (
    <>
      <img src={blackQueen} className={styles.gameOverImg} alt="Queen"></img>
      <img src={whiteQueen} className={styles.gameOverImg} alt="Queen"></img>
    </>
    );
  }

  return {gameOverMessage, gameOverImage}
}

export default Modal;
