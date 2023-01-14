import type Tank from '@game/models/Tank';
import React, {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import PlayersStatus from '@/ui/PlayersStatus';
import type Game from '@game/scenes/Game';

export default function GameUi({game}: {game: Game}) {
	const [tanks, setTanks] = React.useState<Tank[]>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTanks(game.tanks.getTanks());
		}, 250);
		return () => {
			clearInterval(interval);
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
