import React, {useEffect} from 'react';
import {createGame} from '@game/game';
import {useLocation, useParams} from 'react-router-dom';

export default function Game() {
	const {gameId} = useParams();
	const {state} = useLocation();
	useEffect(() => {
		console.log(gameId, state);
		createGame(gameId!, state?.host ?? false);
	}, []);
	return <></>;
}
