import type Tank from '@game/models/Tank';
import type TankPlayer from '@game/models/TankPlayer';
import {TankTypes} from '@game/models/TankType';
import clsx from 'clsx';
import {motion} from 'framer-motion';
import React, {useEffect, useState} from 'react';

function PlayerStatus({
	tankRaw,
	isPlayer,
}: {
	tankRaw: Tank;
	isPlayer: boolean;
}) {
	const [tankData, setTankData] = useState({
		type: tankRaw.type,
		pseudo: tankRaw.pseudo,
		health: tankRaw.health,
	});
	useEffect(() => {
		const unregister = tankRaw.properties
			.getProperty('health')
			.onChange(health => {
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
		<div
			className={clsx('scale-100 transform-gpu', 'flex text-xl text-white')}
		>
			<img
				className={clsx({'h-24 2xl:h-32 rounded-xl': isPlayer, 'h-14 2xl:h-18 rounded-md': !isPlayer}, 'relative w-auto border-2 border-gray-900/50 shadow-inner drop-shadow-md ')}
				src={TankTypes[tankData.type].avatar}
				onClick={() => {
					tankRaw.hit(10);
				}}
			/>
			{tankData.health === 0 && (
				<motion.div
					className={clsx({'h-24 w-24 2xl:h-32 2xl:w-32 rounded-xl': isPlayer, 'h-14 w-14 2xl:h-18 2xl:h-18 rounded-md': !isPlayer}, 'absolute top-0 left-0 flex items-center justify-center bg-gray-900/75')}
					initial={{opacity: 0}}
					animate={{opacity: 1}}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 512 512'
						className={clsx({'h-12 w-12 2xl:h-20 2xl:w-20': isPlayer, 'h-6 w-6 2xl:h-8 2xl:w-8': !isPlayer})}
					>
						<path
							fill='currentColor'
							d='M262.81 16.098c-10.335-.044-20.657.6-30.867 1.894l-2.68.246c1.754 19.05-1.177 32.7-7.144 39.69c-5.967 6.99-15.964 10.454-36.102 6.328l-18.686-3.83l8.426 17.11c5.744 11.666 2.894 24.13-5.42 31.386s-22.805 10.594-44.797-1.443l-17.257-9.447l3.582 19.344c3.326 17.958-1.815 26.41-10.158 31.99c-8.343 5.582-21.628 7.223-33.15 4.725l-.14.644l-2.292-1.51c-8.416 30.07-10.557 65.306-4.252 106.08l15.184 94.135l70.295-13.24l3.46 18.366l-15.384 2.897L179.96 488.79h25.39l-7.81-61.89l18.534-2.337l8.104 64.226h29.613v-65.325h18.69v65.324h29.61l8.105-64.228l18.534 2.338l-7.81 61.89h25.486l44.352-126.808l-18.133-3.416l3.46-18.365l70.185 13.22l18.236-94.22c12.634-81.883-9.59-141.71-48.71-181.966c-39.135-40.268-95.95-60.884-152.966-61.136h-.02zm-14.51 20.14c45.57 29.486 39.706 97.78-19.587 70.834c34.772 67.943-24.572 97.148-69.838 55.2c3.894 37.6-40.093 48.023-69.316 11.056c7.962-1.166 15.703-3.855 22.538-8.428c10.563-7.066 17.958-19.23 19.1-34.785c20.852 6.868 39.385 3.4 51.43-7.113c10.958-9.566 16.144-24.103 14.368-38.635c16.913.726 30.568-4.03 39.34-14.306c7.624-8.933 11.127-20.532 11.965-33.822zm-61.9 167.98c32.884 0 59.54 26.656 59.54 59.54c0 32.885-26.656 59.543-59.54 59.543c-32.883 0-59.543-26.657-59.543-59.542c0-32.886 26.66-59.54 59.543-59.54zm157.543 0c32.884 0 59.54 26.656 59.54 59.54c0 32.885-26.656 59.543-59.54 59.543c-32.883 0-59.543-26.657-59.543-59.542c0-32.886 26.66-59.54 59.543-59.54zm-80.675 79.74l39.937 101.6l-17.03 7.05l-22.905-35.477l-22.905 35.477l-17.62-7.048l40.523-101.603z'
						/>
					</svg>
				</motion.div>
			)}
			<div className={clsx({'w-64 2xl:w-72 rounded-md mt-1 ml-2 space-y-2': isPlayer, 'w-32 2xl:w-36 rounded-md mt-0.5 ml-1 space-y-1': !isPlayer})}>
				<motion.div
					initial={{
						width: '100%',
						backgroundColor: 'hsla(163, 94%, 24%, 0.75)',
					}}
					animate={{
						width: `${tankData.health}%`,
						backgroundColor: tankData.health > 50 ? 'hsla(163, 94%, 24%, 0.75)' : tankData.health > 30 ? 'hsla(32, 95%, 44%, 0.75)' : 'hsla(0, 74%, 42%, 0.75)',
						opacity: tankData.health > 30 || tankData.health === 0 ? 1 : 0,
					}}
					transition={{
						opacity: {
							duration: 0.7,
							repeatType: 'reverse',
							repeat: 'Infinity',
							repeatDelay: 0.1,
						},
					}}
					className={clsx({'h-10 2xl:h-14 rounded-md': isPlayer, 'h-6 rounded': !isPlayer}, 'flex items-center')}
				>
					<span className={clsx({'pl-2 2xl:pl-4 font-medium': isPlayer, 'pl-1 font-medium text-xs': !isPlayer}, 'leading-none')}>
						{tankData.health > 0 ? tankData.health : 'Dead'}
					</span>
				</motion.div>
				<div
					className={clsx({'h-10 p-2 2xl:h-14 2xl:p-4 rounded-md leading-none': isPlayer, 'h-6 p-1 rounded text-xs leading-tight': !isPlayer}, ' bg-gray-900/50 font-medium')}
				>
					{tankData.pseudo}
				</div>
			</div>
		</div>

	);
}

export default function PlayersStatus({
	player,
	tanks,
}: {
	player?: TankPlayer;
	tanks: Tank[];
}) {
	return (
		<div className='absolute top-0 left-0 z-10 m-4 flex flex-col justify-start space-y-4'>
			{player && <PlayerStatus tankRaw={player} isPlayer={true} />}
			{tanks.map(tank => (
				<PlayerStatus tankRaw={tank} isPlayer={false} key={tank.uuid} />
			))}
		</div>
	);
}
