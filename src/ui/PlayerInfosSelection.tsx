import React, {Suspense, useEffect, useState} from 'react';
import TankModel from '@/ui/TankModel';
import {Canvas} from '@react-three/fiber';
import {type TankType, TankTypeList} from '@game/models/TankType';
import {AnimatePresence, motion} from 'framer-motion';

type Props = {
	setName: (name: string) => void;
	setTank: (type: TankType) => void;
};

export default function PlayerInfosSelection({setTank, setName}: Props) {
	const [index, setIndex] = useState(0);
	const [direction, setDirection] = useState(1);

	useEffect(() => {
		setTank(TankTypeList[index].key);
	}, [index]);

	const nextTank = () => {
		setIndex((index + 1) % TankTypeList.length);
		setDirection(1);
	};

	const prevTank = () => {
		setIndex((index - 1 + TankTypeList.length) % TankTypeList.length);
		setDirection(-1);
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

	return (
		<div>
			<label htmlFor='nameInput' className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'>
            Your name
			</label>
			<input
				type='text'
				id='nameInput'
				className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
				defaultValue={'Player'}
				onChange={changeName}
			/>
			<label className='mb-2 mt-4 block text-sm font-medium text-gray-900 dark:text-white'>Your tank</label>
			<div className='relative overflow-hidden'>
				<AnimatePresence mode={'wait'}>
					<motion.div
						key={TankTypeList[index].key}
						initial={{opacity: 0, x: -200 * direction}}
						animate={{opacity: 1, x: 0}}
						exit={{opacity: 0, x: 200 * direction}}
						transition={{duration: 0.25}}
					>
						<Canvas camera={{fov: 35, zoom: 1.5}}>
							<TankModel type={TankTypeList[index].key} />
						</Canvas>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className='flex flex-row items-center justify-between'>
				<span
					className='ml-0 block rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
					onClick={prevTank}
				>
					<svg
						aria-hidden='true'
						className='h-5 w-5'
						fill='currentColor'
						viewBox='0 0 20 20'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							fillRule='evenodd'
							d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
							clipRule='evenodd'
						></path>
					</svg>
				</span>

				<h4 className='text-center  font-bold leading-tight tracking-tight text-gray-900 dark:text-white'>
					{TankTypeList[index].value.name}
				</h4>

				<span
					className='block rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
					onClick={nextTank}
				>
					<svg
						aria-hidden='true'
						className='h-5 w-5'
						fill='currentColor'
						viewBox='0 0 20 20'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							fillRule='evenodd'
							d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
							clipRule='evenodd'
						></path>
					</svg>
				</span>
			</div>
		</div>
	);
}
