import type Tank from '@game/models/Tank';
import type TankPlayer from '@game/models/TankPlayer';
import {TankTypes} from '@game/models/TankType';
import clsx from 'clsx';
import {motion} from 'framer-motion';
import React, {useEffect, useState} from 'react';

function PlayerAvatar(props: {src: string; isDead: boolean; className?: string}) {
	return (
		<div className={clsx('aspect-square overflow-hidden bg-gray-900/50', props.className)}>
			{ props.isDead && (<motion.div
				className='absolute inset-0 flex h-full w-full items-center justify-center bg-gray-900/75'
				initial={{opacity: 0}}
				animate={{opacity: 1}}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 512 512'
					className='h-9/12 w-9/12 text-white'
				>
					<path
						fill='currentColor'
						d='M262.81 16.098c-10.335-.044-20.657.6-30.867 1.894l-2.68.246c1.754 19.05-1.177 32.7-7.144 39.69c-5.967 6.99-15.964 10.454-36.102 6.328l-18.686-3.83l8.426 17.11c5.744 11.666 2.894 24.13-5.42 31.386s-22.805 10.594-44.797-1.443l-17.257-9.447l3.582 19.344c3.326 17.958-1.815 26.41-10.158 31.99c-8.343 5.582-21.628 7.223-33.15 4.725l-.14.644l-2.292-1.51c-8.416 30.07-10.557 65.306-4.252 106.08l15.184 94.135l70.295-13.24l3.46 18.366l-15.384 2.897L179.96 488.79h25.39l-7.81-61.89l18.534-2.337l8.104 64.226h29.613v-65.325h18.69v65.324h29.61l8.105-64.228l18.534 2.338l-7.81 61.89h25.486l44.352-126.808l-18.133-3.416l3.46-18.365l70.185 13.22l18.236-94.22c12.634-81.883-9.59-141.71-48.71-181.966c-39.135-40.268-95.95-60.884-152.966-61.136h-.02zm-14.51 20.14c45.57 29.486 39.706 97.78-19.587 70.834c34.772 67.943-24.572 97.148-69.838 55.2c3.894 37.6-40.093 48.023-69.316 11.056c7.962-1.166 15.703-3.855 22.538-8.428c10.563-7.066 17.958-19.23 19.1-34.785c20.852 6.868 39.385 3.4 51.43-7.113c10.958-9.566 16.144-24.103 14.368-38.635c16.913.726 30.568-4.03 39.34-14.306c7.624-8.933 11.127-20.532 11.965-33.822zm-61.9 167.98c32.884 0 59.54 26.656 59.54 59.54c0 32.885-26.656 59.543-59.54 59.543c-32.883 0-59.543-26.657-59.543-59.542c0-32.886 26.66-59.54 59.543-59.54zm157.543 0c32.884 0 59.54 26.656 59.54 59.54c0 32.885-26.656 59.543-59.54 59.543c-32.883 0-59.543-26.657-59.543-59.542c0-32.886 26.66-59.54 59.543-59.54zm-80.675 79.74l39.937 101.6l-17.03 7.05l-22.905-35.477l-22.905 35.477l-17.62-7.048l40.523-101.603z'
					/>
				</svg>
			</motion.div>) }
			<img src={props.src} alt='Player avatar' className='h-full w-full object-cover' />
		</div>
	);
}

function HealthBar(props: {health: number; maxHealth: number; className?: string; barClassName?: string}) {
	const health = Math.max(0, Math.min(props.health, props.maxHealth));
	const healthPercent = (health / props.maxHealth) * 100;
	const maxNbBars = 5;
	const bars = Array.from({length: maxNbBars}, (_, i) => {
		const start = (i / maxNbBars) * 100;
		const end = ((i + 1) / maxNbBars) * 100;
		const p = (healthPercent - start) / (end - start) * 100;
		return Math.min(100, Math.max(0, p));
	});

	return (
		<div className={clsx('flex items-start', props.className)}>
			{bars.map((p, i) => (
				<div
					style={{width: `${100 / maxNbBars}%`}} key={`health-bar-${i}`}
					className={clsx('relative h-full overflow-hidden bg-gray-900/50 backdrop-blur', props.barClassName)}
				>
					<motion.div
						className={clsx('absolute inset-0 h-full bg-gradient-to-b from-white/50 to-black/30 bg-blend-lighten shadow-md', {
							'animate-health': healthPercent <= 30,
						})}
						initial={{
							width: '100%',
							backgroundColor: 'rgba(0,151,107,0.5)',
						}}
						animate={{
							width: `${p}%`,
							backgroundColor: healthPercent > 50 ? 'rgba(0,151,107,0.5)' : healthPercent > 30 ? 'rgba(219,119,6,0.5)' : 'rgba(186,28,28,0.5)',
						}}
					/>
				</div>
			))}
		</div>
	);
}

function PlayerStatus({tank, isPlayer, children}: {tank: Tank; isPlayer: boolean; children?: React.ReactNode}) {
	const [tankData, setTankData] = useState({
		type: tank.type,
		pseudo: tank.pseudo,
		health: tank.health,
	});
	useEffect(() => {
		const unregister = tank.properties
			.getProperty('health')
			.onChange(health => {
				setTankData({
					...tankData,
					health,
				});
			}, true);

		return () => {
			unregister();
		};
	}, [tank]);

	return (
		<div
			className={clsx('scale-100 transform-gpu', 'flex text-xl text-white')}
			onClick={() => {
				tank.hit(5);
			}}
		>
			<PlayerAvatar
				src={TankTypes[tankData.type].avatar}
				isDead={tankData.health <= 0}
				className={clsx({
					'h-24 2xl:h-32 rounded-xl': isPlayer,
					'h-14 2xl:h-18 rounded-md outline-2': !isPlayer},
				'relative outline outline-gray-900/80 drop-shadow-md')}
			/>
			<div className={clsx({
				'w-64 2xl:w-72 rounded-md mt-1 ml-2 space-y-2': isPlayer,
				'w-32 2xl:w-36 rounded-md mt-0.5 ml-1 space-y-1': !isPlayer,
			})}>
				<HealthBar
					health={tankData.health} maxHealth={100}
					className={clsx({'h-10 2xl:h-14 space-x-2': isPlayer, 'h-6 space-x-1': !isPlayer})}
					barClassName={clsx({'rounded-md': isPlayer, 'rounded outline-2': !isPlayer}, 'outline outline-gray-900/80 drop-shadow-md')}
				/>
				<div
					className={clsx({
						'h-10 p-2 2xl:h-14 2xl:p-4 rounded-md leading-none': isPlayer,
						'h-6 p-1 rounded text-xs leading-tight outline-2': !isPlayer,
					},
					'truncate bg-gray-900/50 font-medium outline outline-gray-900/80 drop-shadow-md backdrop-blur',
					)}
				>
					{tankData.pseudo}
				</div>
				{children}
			</div>
		</div>

	);
}

function PlayerInfo({tank}: {tank: Tank}) {
	const [x, setX] = useState('');
	const [y, setY] = useState('');
	const [z, setZ] = useState('');

	useEffect(() => {
		const unregister = tank.on('update', () => {
			setX(tank.position.x.toFixed(0));
			setY(tank.position.y.toFixed(0));
			setZ(tank.position.z.toFixed(0));
		});

		return () => {
			unregister();
		};
	}, [tank]);

	return (
		<p className='space-x-2 text-sm text-white'>
			<span>x: {x}</span>
			<span>y: {y}</span>
			<span>z: {z}</span>
		</p>
	);
}

function PlayerCompas({tankA, tankB}: {tankA: Tank; tankB: Tank}) {
	const [info, setInfo] = useState({
		direction: 0,
		distance: 0,
	});

	useEffect(() => {
		const unregister = tankA.on('update', () => {
			setInfo(tankA.getDistanceTo(tankB));
		});

		return () => {
			unregister();
		};
	}, [tankA, tankB]);

	return (
		<p className='space-x-2 text-sm text-white'>
			<span>{Math.round(info.direction * 180 / Math.PI)}°</span>
			<span>{info.distance.toFixed(0)}m</span>
		</p>
	);
}

export default function PlayersStatus({player, tanks}: {player?: TankPlayer; tanks: Tank[]}) {
	return (
		<div className='absolute top-0 left-0 z-10 m-4 flex flex-col justify-start space-y-4'>
			{player && <PlayerStatus tank={player} isPlayer={true}/>}
			{player && <PlayerInfo tank={player}/>}
			{player && tanks.map(tank => (
				<PlayerStatus tank={tank} isPlayer={false} key={tank.uuid}>
					<PlayerCompas tankA={player} tankB={tank}/>
				</PlayerStatus>
			))}
		</div>
	);
}
