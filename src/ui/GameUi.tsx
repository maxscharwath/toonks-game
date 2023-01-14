import type Tank from '@game/models/Tank';
import React, {useEffect, useState} from 'react';
import {Toaster} from 'react-hot-toast';
import PlayersStatus from '@/ui/PlayersStatus';
import type Game from '@game/scenes/Game';
import type TankPlayer from '@game/models/TankPlayer';
import type TankNetwork from '@game/models/TankNetwork';

export default function GameUi({game}: {game: Game}) {
	const [tanks, setTanks] = useState<TankNetwork[]>([]);
	const [player, setPlayer] = useState<TankPlayer>();

	useEffect(() => {
		const unregister = game.tanks.events.on(['add', 'remove'], () => {
			setPlayer(game.player);
			setTanks(game.tanks.getNetworks());
		});

		return () => {
			unregister();
		};
	}, [game]);

	return (
		<div>
			<PlayersStatus player={player} tanks={tanks}/>
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
