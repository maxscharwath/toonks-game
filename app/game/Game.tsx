'use client';
import React, {useEffect} from 'react';

export default function Game() {
	useEffect(() => {
		import('../../game/game');
	});
	return (<></>);
}
