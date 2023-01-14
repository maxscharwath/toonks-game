import type Tank from '@game/models/Tank';
import React, {useEffect, useState} from 'react';
import {Toaster} from 'react-hot-toast';
import PlayersStatus from '@/ui/PlayersStatus';
import type Game from '@game/scenes/Game';

export default function GameUi({game}: {game: Game}) {
	const [tanks, setTanks] = useState<Tank[]>([]);

	useEffect(() => {
		const unregister = game.tanks.events.on(['add', 'remove'], () => {
			setTanks(game.tanks.getTanks());
		});

		return () => {
			unregister();
		};
	}, [game]);

	return (
		<div>
			<PlayersStatus tanks={tanks}/>
			<Toaster
				position='top-right'
				gutter={4}
				containerStyle={{zIndex: 9999}}
				toastOptions={{
					duration: 2000,
				}}
			/>
		</div>
	);
}
