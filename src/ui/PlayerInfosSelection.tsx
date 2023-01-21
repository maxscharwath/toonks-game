import React, {Suspense, useEffect, useState} from 'react';
import TankModel from '@/ui/TankModel';
import {Canvas} from '@react-three/fiber';
import {type TankType, TankTypeList} from '@game/models/TankType';
import {AnimatePresence, motion} from 'framer-motion';
import {usePlayerSettings} from '@/store/store';
import Button from './Button';

export default function PlayerInfosSelection() {
	const {name, tank, setName, setTank, setMenu} = usePlayerSettings();
	const [index, setIndex] = useState(TankTypeList.findIndex(t => t.key === tank));
	const [direction, setDirection] = useState(1);

	useEffect(() => {
		setTank(TankTypeList[index].key);
	}, [index]);

	const nextTank = () => {
		setIndex((index + 1) % TankTypeList.length);
		setDirection(-1);
	};

	const prevTank = () => {
		setIndex((index - 1 + TankTypeList.length) % TankTypeList.length);
		setDirection(1);
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.trim().slice(0, 16);
		setName(value);
		e.target.value = value;
	};

	return (
		<>
			<nav className='border-toonks-orange m-2 flex flex-row border-b-4 uppercase'>
				<h1 className='relative flex flex-1 flex-col items-center justify-center rounded-t py-4 text-xl font-bold text-gray-900  dark:text-white md:text-2xl'>
          Customize your toonk
				</h1>
			</nav>
			<main className='space-y-6 px-6 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6'>
				<div>
					<label htmlFor='nameInput' className='block space-y-2 text-center'>
						<span className='block text-center text-lg font-bold text-gray-900 dark:text-white'>
            What's your name, soldier ?
						</span>
						<input
							type='text'
							id='nameInput'
							className='focus-visible:border-toonks-orange focus-visible:ring-toonks-orange dark:focus-visible:border-toonks-orange dark:focus-visible:ring-toonks-orange block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus-visible:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400'
							defaultValue={name}
							onChange={changeName}
						/>
					</label>
				</div>
				<div>
					<div className='relative overflow-hidden rounded border border-gray-100/90 dark:border-gray-700/90'>
						<AnimatePresence mode={'popLayout'}>
							<motion.img
								key={TankTypeList[index].key}
								initial={{opacity: 0}}
								animate={{opacity: 0.5}}
								exit={{opacity: 0}}
								transition={{duration: 0.25}}
								className='absolute inset-0 -z-10 h-full w-full object-cover object-[center_20%] opacity-50 blur-sm' src={TankTypeList[index].value.backdrop}
							/>
						</AnimatePresence>
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
						<div className='flex flex-row items-center justify-between border border-gray-300 bg-white/70 leading-tight text-gray-500 shadow dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400'>
							<span
								className='block cursor-pointer px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100/90 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/90 dark:hover:text-white'
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
								className='block cursor-pointer px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100/90 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/90 dark:hover:text-white'
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

				</div>
				<Button
					onClick={() => {
						setMenu(false);
					}}
					fullWidth
					size='large'
				>
            Save to play
				</Button>

			</main>
		</>
	);
}
