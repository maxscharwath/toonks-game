import type Tank from '@game/models/Tank';
import type TankPlayer from '@game/models/TankPlayer';
import {TankTypes} from '@game/models/TankType';
import clsx from 'clsx';
import {motion} from 'framer-motion';
import React, {useEffect, useState} from 'react';

function PlayerStatus({tankRaw, isPlayer}: {tankRaw: Tank; isPlayer: boolean}) {
	const [tankData, setTankData] = useState({
		type: tankRaw.type,
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
		<div className={clsx(!isPlayer && 'scale-75', 'flex space-x-3 text-xl text-white')} onClick={() => {
			tankRaw.hit(10);
		}}>
			<img className='h-24 w-auto rounded-xl border-2 border-gray-900/50 shadow-inner drop-shadow-md 2xl:w-32' src={TankTypes[tankData.type].avatar} />
			<div className='w-64 space-y-2 bg-gray-200/10'>
				<motion.div
					initial={{width: `${tankData.health}%`}}
					animate={{width: `${tankData.health}%`}}
					className='h-10 bg-green-300/20'>
					{tankData.health}
				</motion.div>
				<div className='h-10'>
					{tankData.pseudo}
				</div>
			</div>

		</div>
	);
}

export default function PlayersStatus({player, tanks}: {player?: TankPlayer; tanks: Tank[]}) {
	return (
		<div className='absolute top-0 left-0 z-10 m-4 space-y-4'>
			{player && <PlayerStatus tankRaw={player} isPlayer={true} />}
			{tanks.map(tank => (
				<PlayerStatus tankRaw={tank} isPlayer={false} key={tank.uuid} />
			))}
		</div>
	);
}
