import React, { useState, useRef, useMemo } from 'react';
import useInterval from './useInterval';
import { flowRight, toString } from 'lodash/fp';
import { useGameContextValue } from '../../GameComponents/Game';
import { playerWantsToForfeitGame } from '../../api';
import constants from '../../Constants';

const removeDaysAndHours = miliseconds => (miliseconds % (24 * 3600)) % 3600;

const milisecondsToSeconds = miliseconds => Math.floor(miliseconds / 1000);

const parseMinutes = seconds => Math.floor(removeDaysAndHours(seconds) / 60);
const parseSeconds = seconds => Math.floor(seconds % 60);
const zeroPad = string => (string.length === 1 ? `0${string}` : string);
const handleTime = func =>
    flowRight(
        zeroPad,
        toString,
        func
    );
const handleMinutes = handleTime(parseMinutes);
const handleSeconds = handleTime(parseSeconds);

const convertTimeToMinutesAndSeconds = time => [
    handleMinutes(time),
    handleSeconds(time),
];

const ClockWrapper = ({ isDarkTeamClock }) => {
    const [
        {
            gameStarted,
            remainingTime,
        },

    ] = useGameContextValue();
    if (gameStarted) {
        return <Clock isDarkTeamClock={isDarkTeamClock} />;
    }

    const teamPanel = isDarkTeamClock ? 'black' : 'white';
    const teamRemainingTime = remainingTime[teamPanel];

    const [minutes, seconds] = convertTimeToMinutesAndSeconds(
        milisecondsToSeconds(teamRemainingTime)
    );
    return `${minutes}:${seconds}`;
};

const Clock = ({ isDarkTeamClock }) => {
    const interval = useRef(null);

    const forfeitGame = () =>
        playerWantsToForfeitGame(sessionStorage.getItem(constants.PLAYER_ID));
    const [
        {
            blacksTurn,
            gameStarted,
            winningTeam,
            turnTimeStamp,
            remainingTime,
        }
    ] = useGameContextValue();

    if (
        ((isDarkTeamClock && blacksTurn) ||
            (!isDarkTeamClock && !blacksTurn)) &&
        (gameStarted && !winningTeam)
    ) {
        interval.current = 100;
    }
    if (
        (!isDarkTeamClock && blacksTurn) ||
        (isDarkTeamClock && !blacksTurn) ||
        !gameStarted
    ) {
        interval.current = null;
    }

    const teamRemainingTime = useMemo(() => {
        const teamPanel = isDarkTeamClock ? 'black' : 'white';
        return remainingTime[teamPanel];
    }, [isDarkTeamClock, remainingTime]);
    const [[minutes = '--', seconds = '--'], setTime] = useState(
        convertTimeToMinutesAndSeconds(milisecondsToSeconds(teamRemainingTime))
    );

    useInterval(() => {
        const newTime = milisecondsToSeconds(
            teamRemainingTime - (Date.now() - turnTimeStamp)
        );
        if (teamRemainingTime - (Date.now() - turnTimeStamp) < 0) {
            forfeitGame();
            interval.current = null;
        }
        setTime(convertTimeToMinutesAndSeconds(newTime));
    }, interval.current);
    return `${minutes}:${seconds}`;
};

export default ClockWrapper;
