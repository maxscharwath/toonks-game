import React, {type DetailedHTMLProps, type InputHTMLAttributes, type SetStateAction, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import appLogo from '@/assets/logo.svg';
import Network from '@game/network/Network';
import IdInput from '@/ui/IdInput';
import {AnimatePresence, motion} from 'framer-motion';
export default function Root() {
	const [gameId, setGameId] = useState('');
	const navigate = useNavigate();

	const createGame = () => {
		const id = Network.generateRoomId({length: 6, prefix: 'TOONKS'});
		console.log('createGame', id);
		Network.getInstance().createRoom(id)
			.then(console.log)
			.catch(console.error);
	};

	const connectToGame = () => {
		if (!gameId) {
			return;
		}

		const id = Network.generateRoomId({length: 6, prefix: 'TOONKS', value: gameId});
		Network.getInstance().joinRoom(id)
			.then(console.log)
			.catch(error => {
				console.log('Error joining room', error);
			});
	};

	const tabs = [
		{
			label: 'Create Game',
			content: (
				<div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
					<div>
						<button
							className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
							onClick={createGame}
						>
							Create
						</button>
					</div>
				</div>
			),
		},
		{
			label: 'Join Game',
			content: (
				<div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
					<div>
						<IdInput onChange={setGameId} className='mb-5' />
						<button
							className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
							onClick={connectToGame}
						>
							Join
						</button>
					</div>
				</div>
			),
		},
	];
	const [selectedTab, setSelectedTab] = useState(tabs[0]);

	return (
		<>
			<section className='bg-gray-50 dark:bg-gray-900'>
				<div className='flex flex-col items-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
					<div className='my-6'>
						<img
							src={appLogo}
							alt='test public folder image'
							width='300'
							height='300'
						/>
					</div>
					<div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
						<nav className='p-2'>
							<ul className='flex flex-row border-b-4 border-gray-200 dark:border-gray-700'>
								{tabs.map(item => (
									<li
										key={item.label}
										className='relative flex flex-col items-center justify-center flex-1 text-xl font-bold text-gray-900 md:text-2xl dark:text-white cursor-pointer py-4 rounded-t hover:bg-gray-100 dark:hover:bg-gray-700'
										onClick={() => {
											setSelectedTab(item);
										}}
									>
										{`${item.label}`}
										{selectedTab.label === item.label && (
											<motion.div className='absolute h-1 bg-toonks-orange -bottom-1 left-0 right-0 rounded-full' layoutId='underline' />
										)}
									</li>
								))}
							</ul>
						</nav>
						<main>
							<AnimatePresence mode='wait'>
								<motion.div
									key={selectedTab.label ?? 'default'}
									initial={{y: 10, opacity: 0}}
									animate={{y: 0, opacity: 1}}
									exit={{y: -10, opacity: 0}}
									transition={{duration: 0.2}}
								>
									{selectedTab ? selectedTab.content : '😋'}
								</motion.div>
							</AnimatePresence>
						</main>
					</div>
				</div>
			</section>
		</>
	);
}
