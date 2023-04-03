import React from 'react';
import InfoBoard from '../../GameComponents/InfoBoard';
import instructionsImg1 from '../../images/instructions1.png';
import styles from './InstructionsPage.module.scss';

function InstructionsPage() {
    return (
        <div className={styles.instructionsPage}>
            <div className={styles.instructionImageContainer}>
            <img src={instructionsImg1} className={styles.instructionImage}/>
            </div>
            <InfoBoard >
                <div>
                    There are no rules
                </div>
            </InfoBoard>
        </div> 
    );
}

export default InstructionsPage;