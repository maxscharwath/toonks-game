import type Tank from '@game/models/Tank';
import TankPlayer from '@game/models/TankPlayer';
import React, {useEffect, useState} from 'react';

function PlayerStatus({tankRaw}: {tankRaw: Tank}) {
	const [tankData, setTankData] = useState({
		isPlayer: tankRaw instanceof TankPlayer,
		pseudo: tankRaw.pseudo,
		health: tankRaw.health,
	});
	useEffect(() => {
		const unregister = tankRaw.properties.getProperty('health').onChange(health => {
			console.log('tank health changed', health);
			setTankData({
				...tankData,
				health,
			});
		});

		return () => {
			unregister();
		};
	}, [tankRaw]);

	return (
		<div className='text-xl text-white'>
			<span>{tankData.pseudo} : </span> <span>{tankData.health}</span>
		</div>
	);
}

export default function PlayersStatus({tanks}: {tanks: Tank[]}) {
	return (
		<div className='absolute top-0 left-0 z-10 m-4'>
			{tanks.map(tank => (
				<PlayerStatus tankRaw={tank} key={tank.uuid} />
			))}
		</div>
	);
}
