import React, {useEffect} from 'react';
import {createGame} from '@game/game';
import {useLocation, useParams} from 'react-router-dom';

type LocationState = {
	host: boolean;
};

export default function Game() {
	const {gameId} = useParams();
	const {state} = useLocation() as {state: LocationState};
	useEffect(() => {
		console.log(`Game ${gameId!} is ${state?.host ? 'hosting' : 'joining'}`);
		createGame(gameId!, state?.host ?? false);
	}, []);
	return <></>;
}
